import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SkillProgress {
  produtividade: number;
  "bem-estar": number;
  criatividade: number;
  forca: number;
}

const SkillProgressBars = ({ userId, compact = false }: { userId: string; compact?: boolean }) => {
  const [progress, setProgress] = useState<SkillProgress>({
    produtividade: 0,
    "bem-estar": 0,
    criatividade: 0,
    forca: 0,
  });

  useEffect(() => {
    loadSkillProgress();
    
    // Listener para recarregar quando uma missão é completada
    const handleQuestCompleted = () => {
      loadSkillProgress();
    };
    
    window.addEventListener('questCompleted', handleQuestCompleted);
    
    return () => {
      window.removeEventListener('questCompleted', handleQuestCompleted);
    };
  }, [userId]);

  const loadSkillProgress = async () => {
    const { data: quests } = await supabase
      .from("quests")
      .select("category, is_completed")
      .eq("user_id", userId)
      .eq("is_completed", true);

    if (quests) {
      const counts: any = {
        produtividade: 0,
        "bem-estar": 0,
        criatividade: 0,
        forca: 0,
      };

      quests.forEach((quest) => {
        const cat = quest.category as keyof SkillProgress;
        if (counts[cat] !== undefined) {
          counts[cat]++;
        }
      });

      // Cada missão adiciona 10%, limitado a 100%
      const newProgress: SkillProgress = {
        produtividade: Math.min(counts.produtividade * 10, 100),
        "bem-estar": Math.min(counts["bem-estar"] * 10, 100),
        criatividade: Math.min(counts.criatividade * 10, 100),
        forca: Math.min(counts.forca * 10, 100),
      };

      setProgress(newProgress);
    }
  };

  const skills = [
    { label: "💼 Produtividade", value: progress.produtividade, color: "bg-[#8B5CF6]" },
    { label: "🧘 Bem-estar", value: progress["bem-estar"], color: "bg-[#F472B6]" },
    { label: "🎨 Criatividade", value: progress.criatividade, color: "bg-[#38BDF8]" },
    { label: "💪 Força", value: progress.forca, color: "bg-[#FACC15]" },
  ];

  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {skills.map((skill) => (
          <div key={skill.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-foreground font-medium text-[10px]">{skill.label}</span>
              <span className="text-muted-foreground text-[10px]">{Math.round(skill.value)}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${skill.color} rounded-full transition-all duration-500`}
                style={{ width: `${skill.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {skills.map((skill) => (
        <div key={skill.label}>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-foreground font-medium">{skill.label}</span>
            <span className="text-muted-foreground">{Math.round(skill.value)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${skill.color} rounded-full transition-all duration-500`}
              style={{ width: `${skill.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkillProgressBars;
