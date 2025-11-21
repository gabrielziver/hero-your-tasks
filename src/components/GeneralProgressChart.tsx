import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CategoryProgress {
  work: number;
  habits: number;
  personal: number;
  training: number;
}

interface DailyStats {
  date: string;
  completed: number;
}

const GeneralProgressChart = ({ userId }: { userId: string }) => {
  const [progress, setProgress] = useState<CategoryProgress>({
    work: 0,
    habits: 0,
    personal: 0,
    training: 0,
  });
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);

  useEffect(() => {
    loadWeeklyProgress();
    loadDailyStats();
  }, [userId]);

  const loadWeeklyProgress = async () => {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const { data: quests } = await supabase
      .from("quests")
      .select("category, is_completed")
      .eq("user_id", userId)
      .gte("created_at", startOfWeek.toISOString());

    if (quests) {
      const categories: CategoryProgress = {
        work: 0,
        habits: 0,
        personal: 0,
        training: 0,
      };

      const counts: any = {
        work: { total: 0, completed: 0 },
        habits: { total: 0, completed: 0 },
        personal: { total: 0, completed: 0 },
        training: { total: 0, completed: 0 },
      };

      quests.forEach((quest) => {
        const cat = quest.category as keyof CategoryProgress;
        if (counts[cat]) {
          counts[cat].total++;
          if (quest.is_completed) counts[cat].completed++;
        }
      });

      Object.keys(counts).forEach((key) => {
        const cat = key as keyof CategoryProgress;
        if (counts[cat].total > 0) {
          categories[cat] = (counts[cat].completed / counts[cat].total) * 100;
        }
      });

      setProgress(categories);
    }
  };

  const loadDailyStats = async () => {
    const daysToLoad = 7; // Fixed to week view
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToLoad);
    startDate.setHours(0, 0, 0, 0);

    const { data: quests } = await supabase
      .from("quests")
      .select("completed_at, is_completed")
      .eq("user_id", userId)
      .eq("is_completed", true)
      .gte("completed_at", startDate.toISOString());

    if (quests) {
      const stats: Record<string, number> = {};
      
      for (let i = 0; i < daysToLoad; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split("T")[0];
        stats[dateKey] = 0;
      }

      quests.forEach((quest) => {
        if (quest.completed_at) {
          const dateKey = quest.completed_at.split("T")[0];
          if (stats[dateKey] !== undefined) {
            stats[dateKey]++;
          }
        }
      });

      const statsArray = Object.entries(stats)
        .map(([date, completed]) => ({ date, completed }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setDailyStats(statsArray);
    }
  };

  const totalProgress = Math.round(
    (progress.work + progress.habits + progress.personal + progress.training) / 4
  );

  const rings = [
    { label: "Trabalho", value: progress.work, color: "#8B5CF6" },
    { label: "Hábitos", value: progress.habits, color: "#F472B6" },
    { label: "Pessoal", value: progress.personal, color: "#38BDF8" },
    { label: "Treinos", value: progress.training, color: "#FACC15" },
  ];

  const maxCompleted = Math.max(...dailyStats.map(s => s.completed), 1);

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Progress Rings */}
      <div className="bg-card rounded-2xl p-4 sm:p-6 border border-border">
        <h3 className="font-display font-bold text-xs sm:text-sm text-muted-foreground mb-4">
          Progresso Semanal
        </h3>
        
        <div className="flex flex-col items-center gap-4 sm:gap-6">
          {/* Multi-ring Radial Chart */}
          <div className="relative w-44 h-44 sm:w-52 sm:h-52">
            <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
              {rings.map((ring, index) => {
                const radius = 85 - index * 18;
                const circumference = 2 * Math.PI * radius;
                
                return (
                  <g key={`ring-${index}`}>
                    {/* Background ring */}
                    <circle
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="none"
                      stroke="#1F1F28"
                      strokeWidth="14"
                    />
                    {/* Progress ring */}
                    <circle
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="none"
                      stroke={ring.color}
                      strokeWidth="14"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference - (ring.value / 100) * circumference}
                      style={{
                        transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    />
                  </g>
                );
              })}
            </svg>
            
            {/* Center percentage */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl sm:text-4xl font-display font-bold text-foreground">
                {totalProgress}%
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">Total</div>
            </div>
          </div>

          {/* Legend Below */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full max-w-xs">
            {rings.map((ring) => (
              <div key={ring.label} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: ring.color }}
                />
                <span className="text-xs sm:text-sm text-foreground font-medium">{ring.label}</span>
                <span className="text-xs sm:text-sm text-muted-foreground ml-auto">
                  {Math.round(ring.value)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-card rounded-2xl p-4 sm:p-6 border border-border">
        <h3 className="font-display font-bold text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
          Semana
        </h3>

        <div className="h-32 sm:h-40 flex items-end justify-between gap-1">
          {dailyStats.map((stat, index) => {
            const height = (stat.completed / maxCompleted) * 100;
            const isToday = stat.date === new Date().toISOString().split("T")[0];
            
            return (
              <div
                key={stat.date}
                className="flex-1 flex flex-col items-center gap-1.5 sm:gap-2"
              >
                <div
                  className="w-full rounded-t-md transition-all duration-500"
                  style={{
                    height: `${height}%`,
                    background: isToday
                      ? "var(--gradient-accent)"
                      : "hsl(220 20% 25%)",
                    minHeight: stat.completed > 0 ? "8px" : "0px",
                  }}
                />
                <span className="text-[9px] sm:text-[10px] text-muted-foreground">
                  {new Date(stat.date).getDate()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GeneralProgressChart;
