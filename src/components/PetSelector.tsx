import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { Loader2, Sparkles, Star } from "lucide-react";

interface PetSelectorProps {
  userId: string;
  onPetSelected?: () => void;
}

interface PetOption {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  stages: string[];
}

const pets: PetOption[] = [
  {
    id: "flameling",
    name: "Flameling",
    description: "Criatura de fogo roxa com brasas brilhantes",
    emoji: "🔥",
    color: "from-purple-500 to-orange-500",
    stages: ["Bebê", "Adolescente", "Fênix"],
  },
  {
    id: "aqualight",
    name: "Aqualight",
    description: "Gota d'água azul com olhos grandes",
    emoji: "💧",
    color: "from-blue-500 to-cyan-400",
    stages: ["Bebê", "Espírito", "Dragão"],
  },
  {
    id: "shadetail",
    name: "Shadetail",
    description: "Mini dragão das sombras roxo escuro",
    emoji: "🐉",
    color: "from-purple-900 to-black",
    stages: ["Bebê", "Adolescente", "Senhor das Sombras"],
  },
  {
    id: "puffie",
    name: "Puffie",
    description: "Nuvem de fumaça branca com rosto",
    emoji: "☁️",
    color: "from-gray-400 to-blue-400",
    stages: ["Bebê", "Tempestade", "Trovão"],
  },
  {
    id: "sparkfox",
    name: "Sparkfox",
    description: "Raposa elétrica amarela com faíscas",
    emoji: "⚡",
    color: "from-yellow-500 to-orange-400",
    stages: ["Filhote", "Adolescente", "Lendário"],
  },
];

interface UserPet {
  id: string;
  pet_type: string;
  pet_name: string;
  evolution_stage: number;
  pet_xp: number;
  is_active: boolean;
  pet_images: Record<number, string>;
}

const PetSelector = ({ userId, onPetSelected }: PetSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [userPets, setUserPets] = useState<UserPet[]>([]);
  const [selectedPetType, setSelectedPetType] = useState<string | null>(null);
  const [petName, setPetName] = useState("");
  const [generatingStage, setGeneratingStage] = useState<{ type: string; stage: number } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadUserPets();
    }
  }, [open, userId]);

  const loadUserPets = async () => {
    const { data, error } = await supabase
      .from("user_pets")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("Error loading pets:", error);
      return;
    }

    setUserPets((data || []).map(pet => ({
      ...pet,
      pet_images: (pet.pet_images as Record<number, string>) || {}
    })));
  };

  const generatePetImage = async (petType: string, evolutionStage: number) => {
    setGeneratingStage({ type: petType, stage: evolutionStage });
    try {
      const { data, error } = await supabase.functions.invoke("generate-pet", {
        body: { petType, evolutionStage },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        return data.imageUrl;
      }
    } catch (error: any) {
      console.error("Error generating pet:", error);
      if (error.message?.includes("429")) {
        toast.error("Limite de requisições atingido. Tente novamente em alguns minutos.");
      } else if (error.message?.includes("402")) {
        toast.error("Créditos insuficientes. Adicione créditos no workspace.");
      } else {
        toast.error("Erro ao gerar pet. Tente novamente.");
      }
    } finally {
      setGeneratingStage(null);
    }
    return null;
  };

  const handleCreatePet = async (petType: string) => {
    if (!petName.trim()) {
      toast.error("Digite um nome para seu pet!");
      return;
    }

    setLoading(true);
    try {
      // Generate stage 1 image
      const imageUrl = await generatePetImage(petType, 1);
      if (!imageUrl) {
        setLoading(false);
        return;
      }

      const petImages = { 1: imageUrl };

      // Create pet in database
      const { data, error } = await supabase
        .from("user_pets")
        .insert({
          user_id: userId,
          pet_type: petType,
          pet_name: petName.trim(),
          evolution_stage: 1,
          pet_xp: 0,
          is_active: userPets.length === 0, // First pet is auto-active
          pet_images: petImages,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`${petName} foi adicionado à sua coleção!`);
      setPetName("");
      setSelectedPetType(null);
      await loadUserPets();
      
      if (onPetSelected) {
        onPetSelected();
      }
    } catch (error) {
      console.error("Error creating pet:", error);
      toast.error("Erro ao criar pet");
    } finally {
      setLoading(false);
    }
  };

  const handleSetActivePet = async (petId: string) => {
    try {
      // Deactivate all pets
      await supabase
        .from("user_pets")
        .update({ is_active: false })
        .eq("user_id", userId);

      // Activate selected pet
      const { error } = await supabase
        .from("user_pets")
        .update({ is_active: true })
        .eq("id", petId);

      if (error) throw error;

      toast.success("Pet ativo alterado!");
      await loadUserPets();
      
      if (onPetSelected) {
        onPetSelected();
      }
    } catch (error) {
      console.error("Error setting active pet:", error);
      toast.error("Erro ao ativar pet");
    }
  };

  const getPetOption = (petType: string) => pets.find(p => p.id === petType);
  const getXPForNextStage = (stage: number) => stage * 100;

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="w-full bg-card hover:bg-muted border-border"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Meus Pets
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display font-bold">
              Pets Evolutivos
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Complete hábitos para dar XP aos seus pets e evoluí-los!
            </p>
          </DialogHeader>

          {/* User's Pets */}
          {userPets.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Seus Pets</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userPets.map((pet) => {
                  const petOption = getPetOption(pet.pet_type);
                  if (!petOption) return null;

                  const xpForNext = getXPForNextStage(pet.evolution_stage);
                  const xpProgress = (pet.pet_xp / xpForNext) * 100;

                  return (
                    <Card
                      key={pet.id}
                      className={`border-2 ${
                        pet.is_active ? "border-primary shadow-lg" : "border-border"
                      }`}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <span className="text-2xl">{petOption.emoji}</span>
                            {pet.pet_name}
                          </span>
                          {pet.is_active && (
                            <Badge className="bg-primary">Ativo</Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Pet Image */}
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                          {pet.pet_images[pet.evolution_stage] ? (
                            <img
                              src={pet.pet_images[pet.evolution_stage]}
                              alt={pet.pet_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${petOption.color} opacity-20 flex items-center justify-center`}>
                              <span className="text-6xl">{petOption.emoji}</span>
                            </div>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Estágio</span>
                            <Badge variant="outline">
                              <Star className="w-3 h-3 mr-1" />
                              {petOption.stages[pet.evolution_stage - 1]}
                            </Badge>
                          </div>
                          
                          {pet.evolution_stage < 3 && (
                            <>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">XP</span>
                                <span className="font-semibold">{pet.pet_xp} / {xpForNext}</span>
                              </div>
                              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`absolute inset-0 bg-gradient-to-r ${petOption.color} transition-all`}
                                  style={{ width: `${xpProgress}%` }}
                                />
                              </div>
                            </>
                          )}
                          
                          {pet.evolution_stage === 3 && (
                            <Badge className="w-full justify-center bg-gold text-gold-foreground">
                              🏆 Evolução Máxima
                            </Badge>
                          )}
                        </div>

                        {!pet.is_active && (
                          <Button
                            onClick={() => handleSetActivePet(pet.id)}
                            variant="secondary"
                            size="sm"
                            className="w-full"
                          >
                            Definir como Ativo
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add New Pet */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold">Adicionar Novo Pet</h3>
            
            {!selectedPetType ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {pets.map((pet) => {
                  const alreadyHas = userPets.some(up => up.pet_type === pet.id);
                  
                  return (
                    <Card
                      key={pet.id}
                      className={`cursor-pointer hover:border-primary transition-all ${
                        alreadyHas ? "opacity-50" : ""
                      }`}
                      onClick={() => !alreadyHas && setSelectedPetType(pet.id)}
                    >
                      <CardContent className="p-4 text-center space-y-2">
                        <div className="text-4xl">{pet.emoji}</div>
                        <h4 className="font-semibold">{pet.name}</h4>
                        <p className="text-xs text-muted-foreground">{pet.description}</p>
                        {alreadyHas && (
                          <Badge variant="secondary" className="text-xs">
                            Já possui
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="petName">Nome do Pet</Label>
                        <Input
                          id="petName"
                          value={petName}
                          onChange={(e) => setPetName(e.target.value)}
                          placeholder="Digite um nome..."
                          maxLength={20}
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleCreatePet(selectedPetType)}
                          disabled={loading || !petName.trim()}
                          className="flex-1"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Criando...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Criar Pet
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedPetType(null);
                            setPetName("");
                          }}
                          variant="outline"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PetSelector;
