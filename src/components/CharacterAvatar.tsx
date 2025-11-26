import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import RadarChart from "./RadarChart";

interface CharacterAvatarProps {
  stats: any;
  compact?: boolean;
}

const CharacterAvatar = ({ stats, compact = false }: CharacterAvatarProps) => {
  const [characterImage, setCharacterImage] = useState<string | null>(null);
  const [characterType, setCharacterType] = useState<string>("warrior");

  useEffect(() => {
    loadCharacterData();
  }, [stats]);

  const loadCharacterData = async () => {
    if (!stats) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("selected_character, character_images")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error loading character:", error);
      return;
    }

    if (data) {
      setCharacterType(data.selected_character || "warrior");
      const images = data.character_images as Record<string, string>;
      if (images && data.selected_character) {
        setCharacterImage(images[data.selected_character]);
      }
    }
  };

  const getCharacterEmoji = (type: string) => {
    const emojis: Record<string, string> = {
      warrior: "⚔️",
      archer: "🏹",
      mage: "🔮",
      ninja: "🥷",
    };
    return emojis[type] || "⚔️";
  };

  const getCharacterGradient = (type: string) => {
    const gradients: Record<string, string> = {
      warrior: "from-purple-500 to-blue-500",
      archer: "from-purple-400 to-pink-400",
      mage: "from-blue-500 to-cyan-400",
      ninja: "from-violet-500 to-purple-600",
    };
    return gradients[type] || "from-purple-500 to-blue-500";
  };

  if (!stats) return null;

  const size = compact ? "w-16 h-16" : "w-32 h-32";
  const borderWidth = compact ? "border-2" : "border-4";
  const emojiSize = compact ? "text-3xl" : "text-5xl";
  const levelSize = compact ? "text-xs px-2 py-0.5" : "text-sm px-4 py-1";

  return (
    <Link to="/profile" className={`relative ${size} block group`}>
      {!compact && <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${getCharacterGradient(characterType)} animate-pulse opacity-30`} />}
      <div className={`relative w-full h-full rounded-full bg-card ${borderWidth} border-primary flex items-center justify-center overflow-hidden transition-all group-hover:scale-105 group-hover:border-accent cursor-pointer`}>
        {characterImage ? (
          <img 
            src={characterImage} 
            alt="Character" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={emojiSize}>
            {getCharacterEmoji(characterType)}
          </div>
        )}
      </div>
      <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-hero ${levelSize} rounded-full font-display font-bold text-foreground group-hover:scale-105 transition-transform`}>
        Lv. {stats.level}
      </div>
    </Link>
  );
};

export default CharacterAvatar;
