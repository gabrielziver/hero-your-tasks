import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import CharacterAvatar from "@/components/CharacterAvatar";
import QuestList from "@/components/QuestList";
import GroupQuestList from "@/components/GroupQuestList";
import GeneralProgressChart from "@/components/GeneralProgressChart";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import CreateQuestDialog from "@/components/CreateQuestDialog";
import CreateGroupQuestDialog from "@/components/CreateGroupQuestDialog";
import SkillProgressBars from "@/components/SkillProgressBars";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Plus, Users, Flame } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Weekly Calendar */}
        <WeeklyCalendar userId={user?.id || ""} />

        {/* Top Section: Avatar + General Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border hover:border-primary/30 transition-colors flex items-center justify-center">
              <CharacterAvatar stats={stats} />
            </div>
            
            {/* XP Bar */}
            <div className="bg-card rounded-2xl p-4 border border-border hover:border-primary/30 transition-colors">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground font-medium">XP</span>
                <span className="text-foreground font-bold">
                  {stats?.current_xp || 0} / {stats?.level ? stats.level * 100 : 100}
                </span>
              </div>
              <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="absolute inset-0 bg-gradient-hero transition-all duration-500"
                  style={{ 
                    width: `${stats ? (stats.current_xp / (stats.level * 100)) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>
          </div>
          
          <GeneralProgressChart userId={user?.id || ""} />
        </div>

        {/* Skill Progress */}
        <div className="bg-card rounded-2xl p-6 border border-border hover:border-accent/30 transition-colors">
          <h3 className="font-display font-bold text-lg text-primary mb-4">
            Progresso de Habilidades
          </h3>
          <SkillProgressBars userId={user?.id || ""} />
        </div>

        {/* Personal Quests */}
        <div className="bg-card rounded-2xl p-6 border border-border hover:border-primary/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold text-primary">
              Suas Missões
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/quests")}
                className="text-xs"
              >
                Ver Todas
              </Button>
              <CreateQuestDialog onQuestCreated={handleQuestCreated}>
                <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 transition-colors">
                  <Plus className="w-4 h-4" />
                  Nova
                </Button>
              </CreateQuestDialog>
            </div>
          </div>
          <QuestList onQuestCompleted={handleQuestCompleted} maxDisplay={4} />
        </div>

        {/* Group Quests */}
        <div className="bg-card rounded-2xl p-6 border border-border hover:border-secondary/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-secondary" />
              <h2 className="text-xl font-display font-bold text-secondary">
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
              <p className="mb-4">Você ainda não faz parte de nenhum grupo.</p>
              <Button variant="outline" onClick={() => navigate("/profile")}>
                Criar ou Participar de um Grupo
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <NavBar />
    </div>
  );
};

export default Dashboard;
