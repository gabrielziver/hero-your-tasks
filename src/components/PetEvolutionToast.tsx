import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PetEvolutionToastProps {
  userId: string;
}

const PetEvolutionToast = ({ userId }: PetEvolutionToastProps) => {
  useEffect(() => {
    // Subscribe to pet updates
    const channel = supabase
      .channel('pet-evolution-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_pets',
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          const newPet = payload.new;
          const oldPet = payload.old;
          
          // Check if evolution happened
          if (newPet.evolution_stage > oldPet.evolution_stage && newPet.is_active) {
            const petNames: Record<string, string> = {
              flameling: "Flameling",
              aqualight: "Aqualight",
              shadetail: "Shadetail",
              puffie: "Puffie",
              sparkfox: "Sparkfox",
            };
            
            const stages: Record<number, string> = {
              2: "Adolescente",
              3: "Forma Final",
            };
            
            toast.success(
              `🎉 ${newPet.pet_name} evoluiu para ${stages[newPet.evolution_stage]}!`,
              {
                description: `Seu ${petNames[newPet.pet_type]} está mais forte agora!`,
                duration: 5000,
              }
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return null;
};

export default PetEvolutionToast;
