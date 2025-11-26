import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";

interface CharacterAttributesProps {
  userId: string;
}

interface Attributes {
  strength: number;
  creativity: number;
  vitality: number;
  focus: number;
}

const CharacterAttributes = ({ userId }: CharacterAttributesProps) => {
  const [attributes, setAttributes] = useState<Attributes>({
    strength: 0,
    creativity: 0,
    vitality: 0,
    focus: 0,
  });

  useEffect(() => {
    loadAttributes();

    const handleQuestComplete = () => {
      loadAttributes();
    };

    window.addEventListener('questCompleted', handleQuestComplete);
    return () => window.removeEventListener('questCompleted', handleQuestComplete);
  }, [userId]);

  const loadAttributes = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("strength, creativity, vitality, focus")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error loading attributes:", error);
      return;
    }

    if (data) {
      setAttributes({
        strength: data.strength || 0,
        creativity: data.creativity || 0,
        vitality: data.vitality || 0,
        focus: data.focus || 0,
      });
    }
  };

  const attributeConfig = [
    { 
      key: "strength" as keyof Attributes, 
      label: "Força", 
      emoji: "💪", 
      color: "#FFD34E",
      description: "Treinos"
    },
    { 
      key: "creativity" as keyof Attributes, 
      label: "Criatividade", 
      emoji: "🎨", 
      color: "#6CE0FF",
      description: "Pessoal"
    },
    { 
      key: "vitality" as keyof Attributes, 
      label: "Vitalidade", 
      emoji: "🧘", 
      color: "#FF6EC7",
      description: "Bem-estar"
    },
    { 
      key: "focus" as keyof Attributes, 
      label: "Foco", 
      emoji: "💼", 
      color: "#A88CFF",
      description: "Trabalho"
    },
  ];

  const maxValue = Math.max(...Object.values(attributes), 100);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-base">Atributos do Personagem</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {attributeConfig.map((attr) => {
          const value = attributes[attr.key];
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

          return (
            <div key={attr.key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>{attr.emoji}</span>
                  <span className="text-foreground font-medium">{attr.label}</span>
                  <span className="text-xs text-muted-foreground">({attr.description})</span>
                </div>
                <span className="font-bold" style={{ color: attr.color }}>
                  {value}
                </span>
              </div>
              <Progress 
                value={percentage} 
                className="h-2"
                style={{ 
                  backgroundColor: 'hsl(var(--muted))',
                }}
              />
              <style>{`
                .progress-indicator {
                  background-color: ${attr.color};
                }
              `}</style>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default CharacterAttributes;
