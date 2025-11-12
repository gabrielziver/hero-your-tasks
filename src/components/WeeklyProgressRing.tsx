import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CategoryProgress {
  work: number;
  habits: number;
  personal: number;
  training: number;
}

const WeeklyProgressRing = ({ userId }: { userId: string }) => {
  const [progress, setProgress] = useState<CategoryProgress>({
    work: 0,
    habits: 0,
    personal: 0,
    training: 0,
  });

  useEffect(() => {
    loadWeeklyProgress();
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

  const totalProgress = Math.round(
    (progress.work + progress.habits + progress.personal + progress.training) / 4
  );

  const rings = [
    { label: "💼 Trabalho", value: progress.work, color: "#8B5CF6", offset: 0 },
    { label: "🧘 Hábitos", value: progress.habits, color: "#67E8F9", offset: 25 },
    { label: "🎯 Pessoal", value: progress.personal, color: "#F472B6", offset: 50 },
    { label: "💪 Treinos", value: progress.training, color: "#FACC15", offset: 75 },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Background circles */}
        {rings.map((ring, index) => {
          const radius = 80 - index * 15;
          const circumference = 2 * Math.PI * radius;
          
          return (
            <g key={`ring-${index}`}>
              {/* Background */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="10"
              />
              {/* Progress */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={ring.color}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (ring.value / 100) * circumference}
                transform="rotate(-90 100 100)"
                style={{
                  filter: `drop-shadow(0 0 8px ${ring.color})`,
                  transition: "stroke-dashoffset 1s ease",
                }}
              />
            </g>
          );
        })}
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-display font-bold text-primary glow-text">
          {totalProgress}%
        </div>
        <div className="text-xs text-muted-foreground mt-1">Concluído</div>
      </div>
      
      {/* Legend */}
      <div className="absolute -bottom-16 left-0 right-0 grid grid-cols-2 gap-2 text-xs">
        {rings.map((ring) => (
          <div key={ring.label} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: ring.color,
                boxShadow: `0 0 8px ${ring.color}`,
              }}
            />
            <span className="text-muted-foreground">{ring.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyProgressRing;
