import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

interface CharacterSelectorProps {
  userId: string;
  onCharacterSelected?: () => void;
}

interface CharacterOption {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
}

const characters: CharacterOption[] = [
  {
    id: "warrior",
    name: "Guerreiro",
    description: "Cabelo preto espetado, armadura roxa, espada azul brilhante",
    emoji: "⚔️",
    color: "from-purple-500 to-blue-500",
  },
  {
    id: "archer",
    name: "Arqueiro",
    description: "Cabelo roxo longo, roupa preta com detalhes lilás, arco futurista azul",
    emoji: "🏹",
    color: "from-purple-400 to-pink-400",
  },
  {
    id: "mage",
    name: "Mago",
    description: "Capa azul neon, cajado com cristal, efeitos mágicos",
    emoji: "🔮",
    color: "from-blue-500 to-cyan-400",
  },
  {
    id: "ninja",
    name: "Ninja",
    description: "Máscara roxa, lâminas azuis duplas, sombra suave",
    emoji: "🥷",
    color: "from-violet-500 to-purple-600",
  },
];

const CharacterSelector = ({ userId, onCharacterSelected }: CharacterSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<string>("warrior");
  const [characterImages, setCharacterImages] = useState<Record<string, string>>({});
  const [generatingCharacter, setGeneratingCharacter] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCurrentCharacter();
  }, [userId]);

  const loadCurrentCharacter = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("selected_character, character_images")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error loading character:", error);
      return;
    }

    if (data) {
      setSelectedCharacter(data.selected_character || "warrior");
      setCharacterImages((data.character_images as Record<string, string>) || {});
    }
  };

  const generateCharacterImage = async (characterId: string) => {
    setGeneratingCharacter(characterId);
    try {
      const { data, error } = await supabase.functions.invoke("generate-character", {
        body: { characterType: characterId },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        const newImages = { ...characterImages, [characterId]: data.imageUrl };
        setCharacterImages(newImages);

        // Save to database
        await supabase
          .from("profiles")
          .update({ character_images: newImages })
          .eq("id", userId);

        toast.success(`${characters.find(c => c.id === characterId)?.name} gerado com sucesso!`);
      }
    } catch (error: any) {
      console.error("Error generating character:", error);
      if (error.message?.includes("429")) {
        toast.error("Limite de requisições atingido. Tente novamente em alguns minutos.");
      } else if (error.message?.includes("402")) {
        toast.error("Créditos insuficientes. Adicione créditos no workspace.");
      } else {
        toast.error("Erro ao gerar personagem. Tente novamente.");
      }
    } finally {
      setGeneratingCharacter(null);
    }
  };

  const handleSelectCharacter = async (characterId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ selected_character: characterId })
        .eq("id", userId);

      if (error) throw error;

      setSelectedCharacter(characterId);
      toast.success(`Personagem ${characters.find(c => c.id === characterId)?.name} selecionado!`);
      setOpen(false);
      
      if (onCharacterSelected) {
        onCharacterSelected();
      }
    } catch (error) {
      console.error("Error selecting character:", error);
      toast.error("Erro ao selecionar personagem");
    } finally {
      setLoading(false);
    }
  };

  const selectedCharacterData = characters.find(c => c.id === selectedCharacter);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="w-full bg-card hover:bg-muted border-border"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Escolher Personagem
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display font-bold">
              Escolha seu Personagem
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Gere e selecione seu personagem pixel art estilo Pokémon FireRed
            </p>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {characters.map((character) => {
              const hasImage = !!characterImages[character.id];
              const isGenerating = generatingCharacter === character.id;
              const isSelected = selectedCharacter === character.id;

              return (
                <Card
                  key={character.id}
                  className={`border-2 transition-all ${
                    isSelected
                      ? "border-primary shadow-lg"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">{character.emoji}</span>
                      <span>{character.name}</span>
                      {isSelected && (
                        <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                          Selecionado
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Image Preview */}
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                      {hasImage ? (
                        <img
                          src={characterImages[character.id]}
                          alt={character.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${character.color} opacity-20 flex items-center justify-center`}>
                          <span className="text-6xl">{character.emoji}</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground">
                      {character.description}
                    </p>

                    {/* Actions */}
                    <div className="space-y-2">
                      {!hasImage ? (
                        <Button
                          onClick={() => generateCharacterImage(character.id)}
                          disabled={isGenerating}
                          className="w-full"
                          variant="secondary"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Gerando...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Gerar com IA
                            </>
                          )}
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <Button
                            onClick={() => handleSelectCharacter(character.id)}
                            disabled={loading || isSelected}
                            className="w-full"
                          >
                            {isSelected ? "Selecionado" : "Selecionar"}
                          </Button>
                          <Button
                            onClick={() => generateCharacterImage(character.id)}
                            disabled={isGenerating}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Regenerando...
                              </>
                            ) : (
                              "Regenerar"
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CharacterSelector;
