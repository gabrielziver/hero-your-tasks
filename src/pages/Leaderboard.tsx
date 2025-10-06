import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import NavBar from "@/components/NavBar";
import CreateGroupDialog from "@/components/CreateGroupDialog";
import CreateGroupQuestDialog from "@/components/CreateGroupQuestDialog";
import GroupQuestList from "@/components/GroupQuestList";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award, Copy, Check, User } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_color: string;
  level: number;
  current_xp: number;
  total_xp: number;
  current_streak: number;
  quests_completed: number;
}

interface Group {
  id: string;
  name: string;
  invite_code: string;
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setCurrentUserId(session.user.id);
      
      // Check for invite code in URL
      const inviteCode = searchParams.get("invite");
      if (inviteCode) {
        await joinGroupByInvite(inviteCode, session.user.id);
      }
      
      await loadGroups(session.user.id);
    };
    checkAuth();
  }, [navigate, searchParams]);

  useEffect(() => {
    if (selectedGroup) {
      loadGroupLeaderboard(selectedGroup);
    }
  }, [selectedGroup]);

  const joinGroupByInvite = async (inviteCode: string, userId: string) => {
    const { data: groupData, error: groupError } = await supabase
      .from("groups")
      .select("id, name")
      .eq("invite_code", inviteCode)
      .single();

    if (groupError || !groupData) {
      toast.error("Código de convite inválido");
      return;
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", groupData.id)
      .eq("user_id", userId)
      .single();

    if (existingMember) {
      toast.info(`Você já é membro de ${groupData.name}`);
      setSelectedGroup(groupData.id);
      return;
    }

    // Join group
    const { error: joinError } = await supabase
      .from("group_members")
      .insert({
        group_id: groupData.id,
        user_id: userId,
      });

    if (joinError) {
      toast.error("Falha ao entrar no grupo");
    } else {
      toast.success(`Você entrou no grupo ${groupData.name}!`);
      await loadGroups(userId);
      setSelectedGroup(groupData.id);
    }
  };

  const loadGroups = async (userId: string) => {
    const { data: memberData, error: memberError } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", userId);

    if (memberError) {
      console.error(memberError);
      setLoading(false);
      return;
    }

    const groupIds = memberData?.map(m => m.group_id) || [];
    
    if (groupIds.length === 0) {
      setLoading(false);
      return;
    }

    const { data: groupsData, error: groupsError } = await supabase
      .from("groups")
      .select("id, name, invite_code")
      .in("id", groupIds);

    if (groupsError) {
      console.error(groupsError);
    } else {
      setGroups(groupsData || []);
      if (groupsData && groupsData.length > 0 && !selectedGroup) {
        setSelectedGroup(groupsData[0].id);
      }
    }
    setLoading(false);
  };

  const loadGroupLeaderboard = async (groupId: string) => {
    // Get all members of the group
    const { data: membersData, error: membersError } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", groupId);

    if (membersError) {
      console.error(membersError);
      return;
    }

    const userIds = membersData?.map(m => m.user_id) || [];
    
    if (userIds.length === 0) {
      setLeaderboard([]);
      return;
    }

    // Get stats for all members
    const { data: statsData, error: statsError } = await supabase
      .from("user_stats")
      .select("user_id, level, current_xp, total_xp, current_streak, quests_completed")
      .in("user_id", userIds)
      .order("total_xp", { ascending: false });

    if (statsError) {
      console.error(statsError);
      return;
    }

    // Get profiles for all members
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username, avatar_color")
      .in("id", userIds);

    if (profilesError) {
      console.error(profilesError);
    }

    const profilesMap = new Map(
      profilesData?.map(profile => [profile.id, profile]) || []
    );

    const formatted = statsData?.map((entry) => {
      const profile = profilesMap.get(entry.user_id);
      return {
        user_id: entry.user_id,
        username: profile?.username || "Herói Desconhecido",
        avatar_color: profile?.avatar_color || "#6C3AE3",
        level: entry.level,
        current_xp: entry.current_xp,
        total_xp: entry.total_xp,
        current_streak: entry.current_streak,
        quests_completed: entry.quests_completed,
      };
    }) || [];

    setLeaderboard(formatted);
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-secondary" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 text-center font-bold text-muted-foreground">{index + 1}</span>;
  };

  const getRankStyle = (index: number) => {
    if (index === 0) return "border-secondary shadow-glow-gold bg-secondary/5";
    if (index === 1) return "border-gray-400 bg-gray-400/5";
    if (index === 2) return "border-amber-600 bg-amber-600/5";
    return "";
  };

  const copyInviteLink = () => {
    const group = groups.find(g => g.id === selectedGroup);
    if (!group) return;

    const inviteLink = `${window.location.origin}/leaderboard?invite=${group.invite_code}`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedCode(true);
    toast.success("Link de convite copiado!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">Carregando ranking...</div>
        </div>
      </div>
    );
  }

  const selectedGroupData = groups.find(g => g.id === selectedGroup);
  const xpForNextLevel = (level: number) => level * 100;

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
            Ranking
          </h1>
          <p className="text-muted-foreground">Melhores Heróis do Reino</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            {groups.length > 0 ? (
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um grupo" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-muted-foreground text-center">Você não está em nenhum grupo ainda</p>
            )}
          </div>
          
          <CreateGroupDialog onGroupCreated={() => loadGroups(currentUserId)} />
          
          {selectedGroupData && (
            <Button onClick={copyInviteLink} variant="outline">
              {copiedCode ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copiedCode ? "Copiado!" : "Copiar Convite"}
            </Button>
          )}
        </div>

        {selectedGroup ? (
          <Tabs defaultValue="ranking" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ranking">Ranking do Grupo</TabsTrigger>
              <TabsTrigger value="quests">Missões Especiais</TabsTrigger>
            </TabsList>

            <TabsContent value="ranking" className="space-y-4">
              {leaderboard.map((entry, index) => {
              const xpProgress = (entry.current_xp / xpForNextLevel(entry.level)) * 100;
              
              return (
                <Card 
                  key={entry.user_id} 
                  className={`bg-gradient-card border-border transition-all hover:border-primary ${getRankStyle(index)} ${
                    entry.user_id === currentUserId ? "border-primary shadow-glow-primary" : ""
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {getRankIcon(index)}
                      </div>
                      
                      {/* Avatar */}
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-primary"
                        style={{ backgroundColor: entry.avatar_color }}
                      >
                        <User className="w-8 h-8 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg text-foreground truncate">
                            {entry.username}
                          </h3>
                          {entry.user_id === currentUserId && (
                            <span className="text-sm text-primary">(Você)</span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
                          <span>Nível {entry.level}</span>
                          <span>•</span>
                          <span>{entry.quests_completed} missões</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            🔥 {entry.current_streak} dias
                          </span>
                        </div>

                        {/* XP Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>XP</span>
                            <span>{entry.current_xp} / {xpForNextLevel(entry.level)}</span>
                          </div>
                          <Progress value={xpProgress} className="h-2 bg-muted">
                            <div 
                              className="h-full bg-gradient-hero rounded-full transition-all" 
                              style={{ width: `${xpProgress}%` }} 
                            />
                          </Progress>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-bold bg-gradient-gold bg-clip-text text-transparent">
                          {entry.total_xp.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">XP Total</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

              {leaderboard.length === 0 && (
                <Card className="bg-card border-border">
                  <CardContent className="p-12 text-center">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Nenhum herói neste grupo ainda. Convide amigos!</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="quests" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground">Missões Especiais</h3>
                  <p className="text-sm text-muted-foreground">Todos os membros ganham XP ao completar</p>
                </div>
                <CreateGroupQuestDialog 
                  groupId={selectedGroup} 
                  onQuestCreated={() => {}}
                />
              </div>
              <GroupQuestList groupId={selectedGroup} />
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">Crie ou entre em um grupo para ver o ranking</p>
              <CreateGroupDialog onGroupCreated={() => loadGroups(currentUserId)} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;