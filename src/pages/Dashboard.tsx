import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CharacterAvatar from "@/components/CharacterAvatar";
import QuestList from "@/components/QuestList";
import CreateQuestDialog from "@/components/CreateQuestDialog";
import NavBar from "@/components/NavBar";

const Dashboard = () => {
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
      loadStats(session.user.id);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      } else if (session) {
        setUser(session.user);
        loadStats(session.user.id);
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
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Character Section */}
          <div className="lg:col-span-1">
            <CharacterAvatar stats={stats} />
          </div>

          {/* Quests Section */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-foreground">Missões Diárias</h2>
              <CreateQuestDialog onQuestCreated={refreshStats} />
            </div>
            <QuestList onQuestCompleted={refreshStats} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
