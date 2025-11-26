import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";
import { Loader2, Sparkles, Star } from "lucide-react";

interface PetsAndMountsSelectorProps {
  userId: string;
  onSelectionChanged?: () => void;
}

// Pet Types
interface PetOption {
  id: string;
  name: string;
  emoji: string;
  color: string;
  stages: string[];
}

const pets: Record<string, PetOption> = {
  flameling: { id: "flameling", name: "Flameling", emoji: "🔥", color: "from-purple-500 to-orange-500", stages: ["Bebê", "Adolescente", "Fênix"] },
  aqualight: { id: "aqualight", name: "Aqualight", emoji: "💧", color: "from-blue-500 to-cyan-400", stages: ["Bebê", "Espírito", "Dragão"] },
  shadetail: { id: "shadetail", name: "Shadetail", emoji: "🐉", color: "from-purple-900 to-black", stages: ["Bebê", "Adolescente", "Senhor"] },
  puffie: { id: "puffie", name: "Puffie", emoji: "☁️", color: "from-gray-400 to-blue-400", stages: ["Bebê", "Tempestade", "Trovão"] },
  sparkfox: { id: "sparkfox", name: "Sparkfox", emoji: "⚡", color: "from-yellow-500 to-orange-400", stages: ["Filhote", "Adolescente", "Lendário"] },
};

// Mount Types
interface MountOption {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
}

const mounts: MountOption[] = [
  {
    id: "frost_wolf",
    name: "Lobo Gélido",
    description: "Majestoso lobo branco com cristais de gelo",
    emoji: "🐺",
    color: "from-blue-400 to-white",
  },
  {
    id: "neon_dragon",
    name: "Dragão Neon",
    description: "Dragão roxo elegante com padrões neon",
    emoji: "🐉",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "blue_phoenix",
    name: "Fênix Azul",
    description: "Fênix majestosa com chamas azuis etéreas",
    emoji: "🦅",
    color: "from-blue-500 to-cyan-400",
  },
  {
    id: "shadow_buffalo",
    name: "Búfalo das Sombras",
    description: "Búfalo poderoso com aura roxa misteriosa",
    emoji: "🦬",
    color: "from-black to-purple-900",
  },
  {
    id: "purple_bike",
    name: "Moto Roxa Futurística",
    description: "Moto futurística roxa com luzes neon",
    emoji: "🏍️",
    color: "from-purple-600 to-blue-500",
  },
];

interface UserPet {
  id: string;
  pet_type: string;
  pet_name: string;
  is_active: boolean;
  evolution_stage: number;
  pet_xp: number;
  pet_images: Record<number, string>;
}

interface UserMount {
  id: string;
  mount_type: string;
  mount_name: string;
  is_equipped: boolean;
  mount_image: string;
}

const PetsAndMountsSelector = ({ userId, onSelectionChanged }: PetsAndMountsSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [userPets, setUserPets] = useState<UserPet[]>([]);
  const [userMounts, setUserMounts] = useState<UserMount[]>([]);
  const [selectedPetType, setSelectedPetType] = useState<string | null>(null);
  const [selectedMountType, setSelectedMountType] = useState<string | null>(null);
  const [petName, setPetName] = useState("");
  const [mountName, setMountName] = useState("");
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadUserPets();
      loadUserMounts();
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

    setUserPets(data?.map(pet => ({
      ...pet,
      pet_images: (pet.pet_images as Record<number, string>) || {}
    })) || []);
  };

  const loadUserMounts = async () => {
    const { data, error } = await supabase
      .from("user_mounts")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("Error loading mounts:", error);
      return;
    }

    setUserMounts(data || []);
  };

  const generatePetImages = async (petType: string) => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-pet", {
        body: { petType },
      });

      if (error) throw error;

      if (data?.images) {
        return data.images;
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
      setGenerating(false);
    }
    return null;
  };

  const generateMountImage = async (mountType: string) => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-mount", {
        body: { mountType },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        return data.imageUrl;
      }
    } catch (error: any) {
      console.error("Error generating mount:", error);
      if (error.message?.includes("429")) {
        toast.error("Limite de requisições atingido. Tente novamente em alguns minutos.");
      } else if (error.message?.includes("402")) {
        toast.error("Créditos insuficientes. Adicione créditos no workspace.");
      } else {
        toast.error("Erro ao gerar montaria. Tente novamente.");
      }
    } finally {
      setGenerating(false);
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
      const images = await generatePetImages(petType);
      if (!images) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_pets")
        .insert({
          user_id: userId,
          pet_type: petType,
          pet_name: petName.trim(),
          is_active: userPets.length === 0,
          pet_images: images,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`${petName} foi adicionado à sua coleção!`);
      setPetName("");
      setSelectedPetType(null);
      await loadUserPets();
      
      if (onSelectionChanged) {
        onSelectionChanged();
      }
    } catch (error) {
      console.error("Error creating pet:", error);
      toast.error("Erro ao criar pet");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMount = async (mountType: string) => {
    if (!mountName.trim()) {
      toast.error("Digite um nome para sua montaria!");
      return;
    }

    setLoading(true);
    try {
      const imageUrl = await generateMountImage(mountType);
      if (!imageUrl) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_mounts")
        .insert({
          user_id: userId,
          mount_type: mountType,
          mount_name: mountName.trim(),
          is_equipped: userMounts.length === 0,
          mount_image: imageUrl,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`${mountName} foi adicionada à sua coleção!`);
      setMountName("");
      setSelectedMountType(null);
      await loadUserMounts();
      
      if (onSelectionChanged) {
        onSelectionChanged();
      }
    } catch (error) {
      console.error("Error creating mount:", error);
      toast.error("Erro ao criar montaria");
    } finally {
      setLoading(false);
    }
  };

  const handleActivatePet = async (petId: string) => {
    try {
      await supabase
        .from("user_pets")
        .update({ is_active: false })
        .eq("user_id", userId);

      const { error } = await supabase
        .from("user_pets")
        .update({ is_active: true })
        .eq("id", petId);

      if (error) throw error;

      toast.success("Pet ativado!");
      await loadUserPets();
      
      if (onSelectionChanged) {
        onSelectionChanged();
      }
    } catch (error) {
      console.error("Error activating pet:", error);
      toast.error("Erro ao ativar pet");
    }
  };

  const handleEquipMount = async (mountId: string) => {
    try {
      await supabase
        .from("user_mounts")
        .update({ is_equipped: false })
        .eq("user_id", userId);

      const { error } = await supabase
        .from("user_mounts")
        .update({ is_equipped: true })
        .eq("id", mountId);

      if (error) throw error;

      toast.success("Montaria equipada!");
      await loadUserMounts();
      
      if (onSelectionChanged) {
        onSelectionChanged();
      }
    } catch (error) {
      console.error("Error equipping mount:", error);
      toast.error("Erro ao equipar montaria");
    }
  };

  const getPetOption = (petType: string) => pets[petType];
  const getMountOption = (mountType: string) => mounts.find(m => m.id === mountType);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="w-full bg-card hover:bg-muted border-border"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Pets & Montarias
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display font-bold">
              Pets & Montarias
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Gerencie seus companheiros e montarias épicas pixel art!
            </p>
          </DialogHeader>

          <Tabs defaultValue="pets" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pets">🔥 Pets</TabsTrigger>
              <TabsTrigger value="mounts">🐺 Montarias</TabsTrigger>
            </TabsList>

            {/* PETS TAB */}
            <TabsContent value="pets" className="space-y-4">
              {userPets.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Seus Pets</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userPets.map((pet) => {
                      const petOption = getPetOption(pet.pet_type);
                      if (!petOption) return null;

                      const xpForNext = pet.evolution_stage * 100;
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
                            <div className="aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                              {pet.pet_images[pet.evolution_stage] ? (
                                <img
                                  src={pet.pet_images[pet.evolution_stage]}
                                  alt={pet.pet_name || "Pet"}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className={`w-full h-full bg-gradient-to-br ${petOption.color} opacity-20 flex items-center justify-center`}>
                                  <span className="text-6xl">{petOption.emoji}</span>
                                </div>
                              )}
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Estágio</span>
                                <Badge variant="secondary" className="text-xs">
                                  <Star className="w-3 h-3 mr-1" />
                                  {petOption.stages[pet.evolution_stage - 1]}
                                </Badge>
                              </div>

                              {pet.evolution_stage < 3 && (
                                <>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">XP</span>
                                    <span className="font-semibold">{pet.pet_xp}/{xpForNext}</span>
                                  </div>
                                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className={`absolute inset-0 bg-gradient-to-r ${petOption.color} transition-all`}
                                      style={{ width: `${xpProgress}%` }}
                                    />
                                  </div>
                                </>
                              )}
                            </div>

                            {!pet.is_active && (
                              <Button
                                onClick={() => handleActivatePet(pet.id)}
                                className="w-full"
                              >
                                Ativar
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">Adicionar Novo Pet</h3>
                
                {!selectedPetType ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.values(pets).map((pet) => {
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
                            <h4 className="font-semibold text-sm">{pet.name}</h4>
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
                              maxLength={30}
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleCreatePet(selectedPetType)}
                              disabled={loading || generating || !petName.trim()}
                              className="flex-1"
                            >
                              {loading || generating ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  {generating ? "Gerando..." : "Criando..."}
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
            </TabsContent>

            {/* MOUNTS TAB */}
            <TabsContent value="mounts" className="space-y-4">
              {userMounts.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Suas Montarias</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userMounts.map((mount) => {
                      const mountOption = getMountOption(mount.mount_type);
                      if (!mountOption) return null;

                      return (
                        <Card
                          key={mount.id}
                          className={`border-2 ${
                            mount.is_equipped ? "border-primary shadow-lg" : "border-border"
                          }`}
                        >
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <span className="text-2xl">{mountOption.emoji}</span>
                                {mount.mount_name}
                              </span>
                              {mount.is_equipped && (
                                <Badge className="bg-primary">Equipada</Badge>
                              )}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="aspect-video rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                              {mount.mount_image ? (
                                <img
                                  src={mount.mount_image}
                                  alt={mount.mount_name || "Mount"}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className={`w-full h-full bg-gradient-to-br ${mountOption.color} opacity-20 flex items-center justify-center`}>
                                  <span className="text-6xl">{mountOption.emoji}</span>
                                </div>
                              )}
                            </div>

                            <p className="text-sm text-muted-foreground">
                              {mountOption.description}
                            </p>

                            {!mount.is_equipped && (
                              <Button
                                onClick={() => handleEquipMount(mount.id)}
                                className="w-full"
                              >
                                Equipar
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">Adicionar Nova Montaria</h3>
                
                {!selectedMountType ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {mounts.map((mount) => {
                      const alreadyHas = userMounts.some(um => um.mount_type === mount.id);
                      
                      return (
                        <Card
                          key={mount.id}
                          className={`cursor-pointer hover:border-primary transition-all ${
                            alreadyHas ? "opacity-50" : ""
                          }`}
                          onClick={() => !alreadyHas && setSelectedMountType(mount.id)}
                        >
                          <CardContent className="p-4 text-center space-y-2">
                            <div className="text-4xl">{mount.emoji}</div>
                            <h4 className="font-semibold text-sm">{mount.name}</h4>
                            <p className="text-xs text-muted-foreground">{mount.description}</p>
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
                            <Label htmlFor="mountName">Nome da Montaria</Label>
                            <Input
                              id="mountName"
                              value={mountName}
                              onChange={(e) => setMountName(e.target.value)}
                              placeholder="Digite um nome..."
                              maxLength={30}
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleCreateMount(selectedMountType)}
                              disabled={loading || generating || !mountName.trim()}
                              className="flex-1"
                            >
                              {loading || generating ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  {generating ? "Gerando..." : "Criando..."}
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-4 h-4 mr-2" />
                                  Criar Montaria
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedMountType(null);
                                setMountName("");
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
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PetsAndMountsSelector;
