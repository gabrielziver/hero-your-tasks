import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import CharacterAvatar from "@/components/CharacterAvatar";
import QuestList from "@/components/QuestList";
import GroupQuestList from "@/components/GroupQuestList";
import GeneralProgressChart from "@/components/GeneralProgressChart";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import WeeklyProgressRing from "@/components/WeeklyProgressRing";
import CreateQuestDialog from "@/components/CreateQuestDialog";
import CreateGroupQuestDialog from "@/components/CreateGroupQuestDialog";
import SkillProgressBars from "@/components/SkillProgressBars";
import CharacterSelector from "@/components/CharacterSelector";
import PetDisplay from "@/components/PetDisplay";
import PetEvolutionToast from "@/components/PetEvolutionToast";
import PetsAndMountsSelector from "@/components/PetsAndMountsSelector";
import CharacterAttributes from "@/components/CharacterAttributes";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Plus, Users, Flame, TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      await Promise.all([
        loadStats(session.user.id),
        loadGroups(session.user.id)
      ]);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      } else if (session) {
        setUser(session.user);
        loadStats(session.user.id);
        loadGroups(session.user.id);
      }
    });

    checkAuth();
    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadStats = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error(error);
    } else {
      setStats(data);
    }
    setLoading(false);
  };

  const loadGroups = async (userId: string) => {
    const { data: memberData, error: memberError } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", userId);

    if (memberError) {
      console.error(memberError);
      return;
    }

    const groupIds = memberData?.map(m => m.group_id) || [];
    
    if (groupIds.length === 0) return;

    const { data: groupsData, error: groupsError } = await supabase
      .from("groups")
      .select("id, name")
      .in("id", groupIds);

    if (groupsError) {
      console.error(groupsError);
    } else {
      setGroups(groupsData || []);
      if (groupsData && groupsData.length > 0 && !selectedGroup) {
        setSelectedGroup(groupsData[0].id);
      }
    }
  };

  const handleQuestCompleted = () => {
    if (user) {
      loadStats(user.id);
      // Força recarregamento dos componentes de progresso
      window.dispatchEvent(new Event('questCompleted'));
    }
  };

  const handleQuestCreated = () => {
    if (user) {
      loadStats(user.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-xl text-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Pet Evolution Toast Handler */}
      {user && <PetEvolutionToast userId={user.id} />}
      
      {/* Compact Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-display font-bold text-primary">
              Task Level
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full">
                <span className="text-lg">💰</span>
                <span className="text-gold font-display font-bold">
                  {stats?.gold || 0}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full">
                <Flame className="w-4 h-4 text-accent" />
                <span className="text-accent font-display font-bold">
                  {stats?.current_streak || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 space-y-4">
        {/* Compact Profile Section */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              <CharacterAvatar stats={stats} compact />
            </div>

            {/* Profile Info */}
            <div className="flex-1 w-full min-w-0 space-y-3">
              {/* Level and XP Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-muted-foreground truncate">Nível {stats?.level || 1}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {stats?.current_xp || 0} / {stats?.level ? stats.level * 100 : 100} XP
                  </span>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute inset-0 bg-gradient-hero transition-all duration-500"
                    style={{ 
                      width: `${stats ? (stats.current_xp / (stats.level * 100)) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>

              {/* Skill Progress Bars - Horizontal Compact */}
              <div className="space-y-2">
                <SkillProgressBars userId={user?.id || ""} compact />
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row gap-2">
                <CharacterSelector 
                  userId={user?.id || ""} 
                  onCharacterSelected={() => window.location.reload()}
                />
                <PetsAndMountsSelector
                  userId={user?.id || ""}
                  onSelectionChanged={() => window.location.reload()}
                />
              </div>
            </div>
          </div>

          {/* Pet Display - Inline Compact */}
          {user && (
            <div className="mt-3 pt-3 border-t border-border">
              <PetDisplay userId={user.id} compact />
            </div>
          )}
        </div>

        {/* Personal Quests - Compact */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-display font-bold text-primary">
              Missões
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/quests")}
                className="text-xs h-8"
              >
                Ver Todas
              </Button>
              <CreateQuestDialog onQuestCreated={handleQuestCreated}>
                <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 transition-colors h-8">
                  <Plus className="w-3 h-3" />
                  Nova
                </Button>
              </CreateQuestDialog>
            </div>
          </div>
          <QuestList onQuestCompleted={handleQuestCompleted} maxDisplay={5} />
        </div>

        {/* Additional Content - Tabs for Stats & Groups */}
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="stats">📊 Stats</TabsTrigger>
            <TabsTrigger value="groups">👥 Grupos</TabsTrigger>
            <TabsTrigger value="progress">📈 Progresso</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stats" className="mt-4 space-y-4">
            <div 
              onClick={() => navigate("/habit-stats")}
              className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl p-4 border border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    <h3 className="font-display font-bold text-base text-foreground">
                      Estatísticas de Hábitos
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Analise seu progresso detalhado
                  </p>
                </div>
                <div className="text-2xl group-hover:scale-110 transition-transform">
                  📊
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-4">
              <CharacterAttributes userId={user?.id || ""} />
            </div>
          </TabsContent>

          <TabsContent value="groups" className="mt-4">
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-secondary" />
                  <h2 className="text-lg font-display font-bold text-secondary">
                    Missões em Grupo
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {groups.length > 0 && (
                    <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                      <SelectTrigger className="w-[140px] bg-muted border-border h-9">
                        <SelectValue placeholder="Grupo" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {selectedGroup && (
                    <CreateGroupQuestDialog 
                      groupId={selectedGroup} 
                      onQuestCreated={handleQuestCreated}
                    >
                      <Button size="sm" className="gap-2 bg-secondary hover:bg-secondary/90 transition-colors">
                        <Plus className="w-4 h-4" />
                        Nova
                      </Button>
                    </CreateGroupQuestDialog>
                  )}
                </div>
              </div>
              {selectedGroup && <GroupQuestList groupId={selectedGroup} />}
              {groups.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm mb-4">Você ainda não faz parte de nenhum grupo.</p>
                  <Button variant="outline" size="sm" onClick={() => navigate("/profile")}>
                    Criar ou Participar de um Grupo
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="mt-4 space-y-4">
            <div className="bg-card rounded-xl border border-border p-4">
              <WeeklyCalendar userId={user?.id || ""} hideWrapper />
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="h-64">
                <WeeklyProgressRing userId={user?.id || ""} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <NavBar />
    </div>
  );
};

export default Dashboard;
