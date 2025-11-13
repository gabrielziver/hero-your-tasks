import { User } from "lucide-react";
import RadarChart from "./RadarChart";

interface CharacterAvatarProps {
  stats: any;
}

const CharacterAvatar = ({ stats }: CharacterAvatarProps) => {
  if (!stats) return null;

  const xpForNextLevel = stats.level * 100;
  const xpProgress = (stats.current_xp / xpForNextLevel) * 100;

  // Calculate radar stats based on user progress
  const radarStats = {
    strength: Math.min((stats.quests_completed / 50) * 100, 100),
    intelligence: Math.min((stats.level / 20) * 100, 100),
    willpower: Math.min((stats.current_streak / 30) * 100, 100),
    charisma: Math.min((stats.level / 15) * 100, 100),
    creativity: Math.min((stats.quests_completed / 40) * 100, 100),
    wealth: Math.min((stats.gold / 500) * 100, 100),
  };

  return (
    <div className="relative w-32 h-32">
      <div className="w-full h-full rounded-full bg-gradient-hero flex items-center justify-center border-2 border-primary transition-transform hover:scale-105">
        <User className="w-16 h-16 text-foreground" />
      </div>
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-gold px-4 py-1 rounded-full font-display font-bold text-sm text-background">
        Lv. {stats.level}
      </div>
    </div>
  );
};

export default CharacterAvatar;
