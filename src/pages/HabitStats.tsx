import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import NavBar from "@/components/NavBar";
import HabitStatsCard from "@/components/HabitStatsCard";
import HabitFrequencyChart from "@/components/HabitFrequencyChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

interface Habit {
  id: string;
  title: string;
  category: string;
  habit_score: number;
  current_streak: number;
  trend_indicator: "improving" | "stable" | "declining";
  current_month_completions: number;
  monthly_target: number;
  frequency_data: any[];
}

const HabitStats = () => {
  const navigate = useNavigate();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      loadHabits();
    };
    checkAuth();
  }, [navigate]);

  const loadHabits = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("quests")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_recurring", true)
      .order("habit_score", { ascending: false });

    if (error) {
      console.error("Error loading habits:", error);
    } else {
      setHabits((data || []).map(habit => ({
        ...habit,
        trend_indicator: (habit.trend_indicator as "improving" | "stable" | "declining") || "stable",
        frequency_data: Array.isArray(habit.frequency_data) ? habit.frequency_data : []
      })));
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-muted-foreground">Carregando estatísticas...</div>
      </div>
    );
  }

  const categorizedHabits = {
    produtividade: habits.filter((h) => h.category === "produtividade"),
    "bem-estar": habits.filter((h) => h.category === "bem-estar"),
    criatividade: habits.filter((h) => h.category === "criatividade"),
    forca: habits.filter((h) => h.category === "forca"),
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">
            Estatísticas de Hábitos
          </h1>
          <p className="text-muted-foreground">
            Analise seu progresso e consistência em cada hábito
          </p>
        </div>

        {habits.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                Você ainda não tem hábitos recorrentes. Crie um na aba Missões!
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full grid grid-cols-5 mb-6">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="produtividade">💼 Trabalho</TabsTrigger>
              <TabsTrigger value="bem-estar">🧘 Hábitos</TabsTrigger>
              <TabsTrigger value="criatividade">🎨 Pessoal</TabsTrigger>
              <TabsTrigger value="forca">💪 Treinos</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {habits.map((habit) => (
                <div key={habit.id} className="space-y-4">
                  <HabitStatsCard
                    title={habit.title}
                    score={habit.habit_score}
                    streak={habit.current_streak}
                    trend={habit.trend_indicator}
                    monthlyCompletions={habit.current_month_completions}
                    monthlyTarget={habit.monthly_target}
                    category={habit.category}
                  />
                  {habit.frequency_data && habit.frequency_data.length > 0 && (
                    <HabitFrequencyChart
                      frequencyData={habit.frequency_data}
                      category={habit.category}
                    />
                  )}
                </div>
              ))}
            </TabsContent>

            {Object.entries(categorizedHabits).map(([category, categoryHabits]) => (
              <TabsContent key={category} value={category} className="space-y-6">
                {categoryHabits.length === 0 ? (
                  <Card className="bg-card border-border">
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">
                        Nenhum hábito nesta categoria ainda.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  categoryHabits.map((habit) => (
                    <div key={habit.id} className="space-y-4">
                      <HabitStatsCard
                        title={habit.title}
                        score={habit.habit_score}
                        streak={habit.current_streak}
                        trend={habit.trend_indicator}
                        monthlyCompletions={habit.current_month_completions}
                        monthlyTarget={habit.monthly_target}
                        category={habit.category}
                      />
                      {habit.frequency_data && habit.frequency_data.length > 0 && (
                        <HabitFrequencyChart
                          frequencyData={habit.frequency_data}
                          category={habit.category}
                        />
                      )}
                    </div>
                  ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
      <NavBar />
    </div>
  );
};

export default HabitStats;
