import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CharacterAvatar from "@/components/CharacterAvatar";
import QuestList from "@/components/QuestList";
import CreateQuestDialog from "@/components/CreateQuestDialog";
import CreateGroupQuestDialog from "@/components/CreateGroupQuestDialog";
import GroupQuestList from "@/components/GroupQuestList";
import WeeklyProgressRing from "@/components/WeeklyProgressRing";
import StreakDisplay from "@/components/StreakDisplay";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Plus, BarChart3, Trophy, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [groupQuestKey, setGroupQuestKey] = useState(0);

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
      toast.error("Falha ao carregar estatísticas");
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

  const refreshStats = () => {
    if (user) {
      loadStats(user.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-xl text-foreground">Carregando sua missão...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative border-b border-border/50 backdrop-blur-xl bg-background/80">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center shadow-glow-primary">
                <Sparkles className="w-6 h-6 text-foreground" />
              </div>
              <h1 className="text-3xl font-display font-black text-foreground glow-text">
                TASK LEVEL
              </h1>
            </div>

            {/* User info & gold */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gradient-gold px-4 py-2 rounded-full shadow-glow-gold">
                <span className="text-lg font-display font-bold text-background">
                  {stats?.gold || 0}
                </span>
                <span className="text-sm text-background/80">GOLD</span>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate('/profile')}>
                <UserIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Sidebar - Character Avatar */}
          <div className="xl:col-span-4">
            <CharacterAvatar stats={stats} />
          </div>

          {/* Center Panel - Main Content */}
          <div className="xl:col-span-5 space-y-6">
            {/* Weekly Progress Ring */}
            <div className="bg-gradient-hologram backdrop-blur-xl rounded-2xl p-8 hologram-border">
              <h3 className="text-center font-display text-lg text-secondary mb-6 glow-text">
                PROGRESSO SEMANAL
              </h3>
              <div className="h-80">
                {user && <WeeklyProgressRing userId={user.id} />}
              </div>
            </div>

            {/* Personal Quests Section */}
            <div className="bg-gradient-hologram backdrop-blur-xl rounded-2xl p-6 hologram-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-bold text-foreground">MINHAS MISSÕES</h2>
                <CreateQuestDialog onQuestCreated={refreshStats} />
              </div>
              <QuestList onQuestCompleted={refreshStats} />
            </div>

            {/* Group Quests Section */}
            {groups.length > 0 && (
              <div className="bg-gradient-hologram backdrop-blur-xl rounded-2xl p-6 hologram-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-display font-bold text-foreground">MISSÕES EM GRUPO</h2>
                  <div className="flex items-center gap-2">
                    <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                      <SelectTrigger className="w-[200px]">
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
                    {selectedGroup && (
                      <CreateGroupQuestDialog
                        groupId={selectedGroup}
                        onQuestCreated={() => setGroupQuestKey((prev) => prev + 1)}
                      />
                    )}
                  </div>
                </div>
                {selectedGroup && (
                  <GroupQuestList key={groupQuestKey} groupId={selectedGroup} />
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar - Streak & Actions */}
          <div className="xl:col-span-3 space-y-6">
            {/* Streak Display */}
            <div className="bg-gradient-hologram backdrop-blur-xl rounded-2xl p-6 hologram-border">
              <h3 className="text-center font-display text-lg text-secondary mb-6 glow-text">
                SEQUÊNCIA ÉPICA
              </h3>
              <StreakDisplay currentStreak={stats?.current_streak || 0} />
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-hologram backdrop-blur-xl rounded-2xl p-6 hologram-border space-y-3">
              <h3 className="font-display text-sm text-secondary mb-4 glow-text">
                AÇÕES RÁPIDAS
              </h3>
              <Button
                className="w-full bg-gradient-hero hover:opacity-90 shadow-glow-primary font-display"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Missão
              </Button>
              <Button
                variant="outline"
                className="w-full font-display border-primary/30 hover:bg-primary/10"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Relatórios
              </Button>
              <Button
                variant="outline"
                className="w-full font-display border-secondary/30 hover:bg-secondary/10"
                onClick={() => navigate('/leaderboard')}
              >
                <Trophy className="w-4 h-4 mr-2" />
                Ranking
              </Button>
            </div>

            {/* Skill Points Panel */}
            <div className="bg-gradient-hologram backdrop-blur-xl rounded-2xl p-6 hologram-border">
              <h3 className="font-display text-sm text-secondary mb-4 glow-text">
                SKILL POINTS
              </h3>
              <div className="text-center">
                <div className="text-4xl font-display font-black text-primary glow-text mb-2">
                  {stats?.total_xp || 0}
                </div>
                <div className="text-xs text-muted-foreground">Pontos disponíveis</div>
              </div>
              
              {/* Progress by category */}
              <div className="mt-6 space-y-3">
                <ProgressBar label="Produtividade" value={72} color="primary" />
                <ProgressBar label="Saúde" value={64} color="secondary" />
                <ProgressBar label="Criatividade" value={58} color="magic-pink" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProgressBar = ({ label, value, color }: { label: string; value: number; color: string }) => {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground font-display font-bold">{value}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500`}
          style={{ 
            width: `${value}%`,
            background: color === 'primary' ? 'hsl(var(--primary))' : 
                       color === 'secondary' ? 'hsl(var(--secondary))' : 
                       'hsl(var(--magic-pink))'
          }}
        />
      </div>
    </div>
  );
};

export default Dashboard;
