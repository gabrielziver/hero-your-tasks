import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Star } from "lucide-react";

interface PetDisplayProps {
  userId: string;
  compact?: boolean;
}

interface ActivePet {
  id: string;
  pet_type: string;
  pet_name: string;
  evolution_stage: number;
  pet_xp: number;
  pet_images: Record<number, string>;
}

const pets = {
  flameling: { name: "Flameling", emoji: "🔥", color: "from-purple-500 to-orange-500", stages: ["Bebê", "Adolescente", "Fênix"] },
  aqualight: { name: "Aqualight", emoji: "💧", color: "from-blue-500 to-cyan-400", stages: ["Bebê", "Espírito", "Dragão"] },
  shadetail: { name: "Shadetail", emoji: "🐉", color: "from-purple-900 to-black", stages: ["Bebê", "Adolescente", "Senhor"] },
  puffie: { name: "Puffie", emoji: "☁️", color: "from-gray-400 to-blue-400", stages: ["Bebê", "Tempestade", "Trovão"] },
  sparkfox: { name: "Sparkfox", emoji: "⚡", color: "from-yellow-500 to-orange-400", stages: ["Filhote", "Adolescente", "Lendário"] },
};

const PetDisplay = ({ userId, compact = false }: PetDisplayProps) => {
  const [activePet, setActivePet] = useState<ActivePet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivePet();

    // Listen for quest completions to refresh pet data
    const handleQuestComplete = () => {
      loadActivePet();
    };

    window.addEventListener('questCompleted', handleQuestComplete);
    return () => window.removeEventListener('questCompleted', handleQuestComplete);
  }, [userId]);

  const loadActivePet = async () => {
    const { data, error } = await supabase
      .from("user_pets")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error loading active pet:", error);
    }

    setActivePet(data ? {
      ...data,
      pet_images: (data.pet_images as Record<number, string>) || {}
    } : null);
    setLoading(false);
  };

  if (loading) {
    return null;
  }

  if (!activePet) {
    return (
      <div className={`${compact ? 'text-xs' : 'p-4'} text-center text-muted-foreground`}>
        <p className={compact ? 'text-xs' : 'text-sm'}>Nenhum pet ativo</p>
      </div>
    );
  }

  const petInfo = pets[activePet.pet_type as keyof typeof pets];
  const xpForNext = activePet.evolution_stage * 100;
  const xpProgress = (activePet.pet_xp / xpForNext) * 100;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {/* Pet Image - Compact */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
            {activePet.pet_images[activePet.evolution_stage] ? (
              <img
                src={activePet.pet_images[activePet.evolution_stage]}
                alt={activePet.pet_name || "Pet"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${petInfo.color} opacity-30 flex items-center justify-center`}>
                <span className="text-lg">{petInfo.emoji}</span>
              </div>
            )}
          </div>
          <Badge className="absolute -bottom-1 -right-1 text-[10px] px-1 py-0 h-4">
            <Star className="w-2 h-2 mr-0.5" />
            {activePet.evolution_stage}
          </Badge>
        </div>

        {/* Pet Info - Compact */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-xs text-foreground truncate">
            {activePet.pet_name}
          </p>
          <p className="text-[10px] text-muted-foreground truncate">
            {petInfo.stages[activePet.evolution_stage - 1]}
          </p>
          
          {activePet.evolution_stage < 3 ? (
            <>
              <div className="flex items-center justify-between text-[10px] mt-1">
                <span className="text-muted-foreground">XP</span>
                <span className="font-semibold">{activePet.pet_xp}/{xpForNext}</span>
              </div>
              <div className="relative h-1 bg-muted rounded-full overflow-hidden mt-0.5">
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${petInfo.color} transition-all`}
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </>
          ) : (
            <Badge className="mt-1 text-[10px] px-1 py-0 h-4 bg-gold text-gold-foreground">
              🏆 Max
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Pet Image */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center">
              {activePet.pet_images[activePet.evolution_stage] ? (
                <img
                  src={activePet.pet_images[activePet.evolution_stage]}
                  alt={activePet.pet_name || "Pet"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${petInfo.color} opacity-30 flex items-center justify-center`}>
                  <span className="text-3xl">{petInfo.emoji}</span>
                </div>
              )}
            </div>
            <Badge className="absolute -bottom-1 -right-1 text-xs px-1.5 py-0.5">
              <Star className="w-3 h-3 mr-0.5" />
              {activePet.evolution_stage}
            </Badge>
          </div>

          {/* Pet Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground truncate">
              {activePet.pet_name}
            </h4>
            <p className="text-xs text-muted-foreground">
              {petInfo.stages[activePet.evolution_stage - 1]}
            </p>
            
            {activePet.evolution_stage < 3 ? (
              <>
                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="text-muted-foreground">XP</span>
                  <span className="font-semibold">{activePet.pet_xp}/{xpForNext}</span>
                </div>
                <div className="relative h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${petInfo.color} transition-all`}
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </>
            ) : (
              <Badge className="mt-2 text-xs bg-gold text-gold-foreground">
                🏆 Max
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PetDisplay;
