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

    // Listen for quest completions to refresh
    const handleQuestComplete = () => {
      loadWeeklyProgress();
    };

    window.addEventListener('questCompleted', handleQuestComplete);
    return () => window.removeEventListener('questCompleted', handleQuestComplete);
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
          // Only reach 100% after 10+ tasks
          const percentage = (counts[cat].completed / Math.max(counts[cat].total, 10)) * 100;
          categories[cat] = Math.min(percentage, 100);
        }
      });

      setProgress(categories);
    }
  };

  const totalProgress = Math.round(
    (progress.work + progress.habits + progress.personal + progress.training) / 4
  );

  const rings = [
    { label: "💼 Trabalho", value: progress.work, color: "#A88CFF" },
    { label: "🧘 Hábitos", value: progress.habits, color: "#FF6EC7" },
    { label: "🎯 Pessoal", value: progress.personal, color: "#6CE0FF" },
    { label: "💪 Treinos", value: progress.training, color: "#FFD34E" },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 200 200" className="w-full h-full">
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
                stroke="hsl(220 20% 20%)"
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
                  transition: "stroke-dashoffset 1s ease",
                }}
              />
            </g>
          );
        })}
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-display font-bold text-accent">
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
              style={{ backgroundColor: ring.color }}
            />
            <span className="text-muted-foreground">{ring.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyProgressRing;
