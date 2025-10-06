import { useState } from "react";
import { Card } from "./ui/card";
import { User, Smile, Zap, Heart, Star, Crown, Shield, Sword } from "lucide-react";

const AVATAR_OPTIONS = [
  { icon: User, color: "#6C3AE3" },
  { icon: Smile, color: "#F9B32F" },
  { icon: Zap, color: "#FF6B6B" },
  { icon: Heart, color: "#FF1493" },
  { icon: Star, color: "#FFD700" },
  { icon: Crown, color: "#DAA520" },
  { icon: Shield, color: "#4169E1" },
  { icon: Sword, color: "#DC143C" },
];

interface AvatarSelectorProps {
  currentColor: string;
  onSelect: (color: string) => void;
}

const AvatarSelector = ({ currentColor, onSelect }: AvatarSelectorProps) => {
  const [selected, setSelected] = useState(currentColor);

  const handleSelect = (color: string) => {
    setSelected(color);
    onSelect(color);
  };

  return (
    <div className="grid grid-cols-4 gap-3">
      {AVATAR_OPTIONS.map(({ icon: Icon, color }, index) => (
        <Card
          key={index}
          className={`cursor-pointer transition-all hover:scale-110 ${
            selected === color 
              ? "border-primary border-2 shadow-glow-primary" 
              : "border-border hover:border-primary/50"
          }`}
          onClick={() => handleSelect(color)}
        >
          <div 
            className="w-full aspect-square rounded flex items-center justify-center"
            style={{ backgroundColor: color }}
          >
            <Icon className="w-8 h-8 text-white" />
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AvatarSelector;
