import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
import { Card } from "@/components/ui/card";
import { Flame } from "lucide-react";
import StreakDisplay from "@/components/StreakDisplay";

const Streak = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-xl text-foreground">Carregando...</div>
      </div>
    );
  }

  const currentStreak = stats?.current_streak || 0;
  const longestStreak = stats?.longest_streak || 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-display font-bold text-primary flex items-center gap-2">
            <Flame className="w-7 h-7 text-accent" />
            Seu Streak
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6 max-w-2xl">
        {/* Current Streak Card */}
        <Card className="bg-gradient-card border-border p-8">
          <div className="text-center">
            <StreakDisplay currentStreak={currentStreak} />
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-card border-border p-6 text-center hover:border-accent/50 transition-colors">
            <div className="text-4xl font-display font-bold text-accent mb-2">
              {currentStreak}
            </div>
            <div className="text-sm text-muted-foreground">Dias Seguidos</div>
          </Card>

          <Card className="bg-card border-border p-6 text-center hover:border-gold/50 transition-colors">
            <div className="text-4xl font-display font-bold text-gold mb-2">
              {longestStreak}
            </div>
            <div className="text-sm text-muted-foreground">Recorde</div>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="bg-card border-border p-6">
          <h3 className="font-display font-bold text-lg text-primary mb-4">
            Como manter seu streak
          </h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <span className="text-accent text-lg">✓</span>
              <p>Complete pelo menos uma missão por dia</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-accent text-lg">✓</span>
              <p>Mantenha a consistência para aumentar sua chama</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-accent text-lg">✓</span>
              <p>Quanto maior o streak, mais XP e ouro você ganha</p>
            </div>
          </div>
        </Card>

        {/* Weekly Progress */}
        <Card className="bg-card border-border p-6">
          <h3 className="font-display font-bold text-lg text-primary mb-4">
            Semana Atual
          </h3>
          <div className="flex justify-center gap-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => {
              const today = new Date().getDay();
              const isToday = index === today;
              const isPast = index < today;
              
              return (
                <div key={day} className="flex flex-col items-center gap-2">
                  <div className="text-xs text-muted-foreground">{day}</div>
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isToday 
                        ? 'bg-accent text-accent-foreground scale-110' 
                        : isPast 
                        ? 'bg-primary/30 text-primary' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isPast || isToday ? '✓' : '○'}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <NavBar />
    </div>
  );
};

export default Streak;
