import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "lucide-react";

interface AvatarCreatorProps {
  onSave: (config: AvatarConfig) => void;
  initialConfig?: AvatarConfig;
}

export interface AvatarConfig {
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  outfit: string;
  accessory: string;
}

const AvatarCreator = ({ onSave, initialConfig }: AvatarCreatorProps) => {
  const [config, setConfig] = useState<AvatarConfig>(
    initialConfig || {
      skinTone: "light",
      hairStyle: "short",
      hairColor: "black",
      outfit: "casual",
      accessory: "none",
    }
  );

  const skinTones = [
    { value: "light", label: "Claro" },
    { value: "medium", label: "Médio" },
    { value: "tan", label: "Moreno" },
    { value: "dark", label: "Escuro" },
  ];

  const hairStyles = [
    { value: "short", label: "Curto" },
    { value: "long", label: "Longo" },
    { value: "bald", label: "Careca" },
    { value: "wavy", label: "Ondulado" },
  ];

  const hairColors = [
    { value: "black", label: "Preto" },
    { value: "brown", label: "Castanho" },
    { value: "blonde", label: "Loiro" },
    { value: "red", label: "Ruivo" },
    { value: "blue", label: "Azul" },
  ];

  const outfits = [
    { value: "casual", label: "Casual" },
    { value: "formal", label: "Formal" },
    { value: "sporty", label: "Esportivo" },
    { value: "fantasy", label: "Fantasia" },
  ];

  const accessories = [
    { value: "none", label: "Nenhum" },
    { value: "glasses", label: "Óculos" },
    { value: "hat", label: "Chapéu" },
    { value: "headphones", label: "Fone de ouvido" },
  ];

  return (
    <Card className="bg-card border-border p-6 space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-32 h-32 rounded-full bg-gradient-hero flex items-center justify-center border-2 border-primary">
          <User className="w-16 h-16 text-foreground" />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Pré-visualização do avatar (será implementado)
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Tom de Pele</Label>
          <Select value={config.skinTone} onValueChange={(value) => setConfig({ ...config, skinTone: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {skinTones.map((tone) => (
                <SelectItem key={tone.value} value={tone.value}>
                  {tone.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Estilo de Cabelo</Label>
          <Select value={config.hairStyle} onValueChange={(value) => setConfig({ ...config, hairStyle: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {hairStyles.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Cor do Cabelo</Label>
          <Select value={config.hairColor} onValueChange={(value) => setConfig({ ...config, hairColor: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {hairColors.map((color) => (
                <SelectItem key={color.value} value={color.value}>
                  {color.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Roupa</Label>
          <Select value={config.outfit} onValueChange={(value) => setConfig({ ...config, outfit: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {outfits.map((outfit) => (
                <SelectItem key={outfit.value} value={outfit.value}>
                  {outfit.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Acessórios</Label>
          <Select value={config.accessory} onValueChange={(value) => setConfig({ ...config, accessory: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {accessories.map((accessory) => (
                <SelectItem key={accessory.value} value={accessory.value}>
                  {accessory.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={() => onSave(config)} className="w-full bg-gradient-hero">
        Salvar Avatar
      </Button>
    </Card>
  );
};

export default AvatarCreator;
