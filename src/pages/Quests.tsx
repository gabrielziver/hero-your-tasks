import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
import QuestList from "@/components/QuestList";
import CreateQuestDialog from "@/components/CreateQuestDialog";
import { Button } from "@/components/ui/button";
import { Plus, Target } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Quests = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      await loadStats(session.user.id);
    };
    checkAuth();
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

  const handleQuestCompleted = () => {
    if (user) {
      loadStats(user.id);
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
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-display font-bold text-primary flex items-center gap-2">
              <Target className="w-7 h-7" />
              Missões
            </h1>
            <CreateQuestDialog onQuestCreated={handleQuestCreated}>
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4" />
                Nova
              </Button>
            </CreateQuestDialog>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6 max-w-3xl">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors">
            <div className="text-2xl font-display font-bold text-primary mb-1">
              {stats?.quests_completed || 0}
            </div>
            <div className="text-xs text-muted-foreground">Completas</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center hover:border-accent/50 transition-colors">
            <div className="text-2xl font-display font-bold text-accent mb-1">
              {stats?.current_xp || 0}
            </div>
            <div className="text-xs text-muted-foreground">XP Total</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center hover:border-gold/50 transition-colors">
            <div className="text-2xl font-display font-bold text-gold mb-1">
              {stats?.gold || 0}
            </div>
            <div className="text-xs text-muted-foreground">Ouro</div>
          </div>
        </div>

        {/* Quests List */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="active">Ativas</TabsTrigger>
            <TabsTrigger value="completed">Completas</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <QuestList onQuestCompleted={handleQuestCompleted} />
            </div>
          </TabsContent>
          <TabsContent value="active" className="mt-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <QuestList onQuestCompleted={handleQuestCompleted} filterCompleted={false} />
            </div>
          </TabsContent>
          <TabsContent value="completed" className="mt-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <QuestList onQuestCompleted={handleQuestCompleted} filterCompleted={true} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <NavBar />
    </div>
  );
};

export default Quests;
