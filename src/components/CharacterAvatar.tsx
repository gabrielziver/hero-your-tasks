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
    <div className="relative">
      {/* Holographic Panel */}
      <div className="bg-gradient-hologram backdrop-blur-xl rounded-2xl p-8 hologram-border">
        {/* Character Circle */}
        <div className="flex justify-center mb-8">
          <div className="relative float-animation">
            <div className="w-40 h-40 rounded-full bg-gradient-hero flex items-center justify-center border-4 border-primary shadow-glow-primary pulse-glow">
              <User className="w-20 h-20 text-foreground" />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-gold px-6 py-2 rounded-full font-display font-bold text-lg shadow-glow-gold text-background">
              Lv. {stats.level}
            </div>
            {/* Floating particles effect */}
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-primary rounded-full opacity-60"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-3 font-display">
            <span className="text-secondary glow-text">EXPERIENCE</span>
            <span className="text-foreground font-bold">
              {stats.current_xp} / {xpForNextLevel}
            </span>
          </div>
          <div className="relative h-4 bg-muted rounded-full overflow-hidden hologram-border">
            <div
              className="absolute inset-0 bg-gradient-hero shadow-glow-primary transition-all duration-500 ease-out"
              style={{ width: `${xpProgress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            </div>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="mb-6">
          <h3 className="text-center font-display text-sm text-secondary mb-4 glow-text">
            ATRIBUTOS DO JOGADOR
          </h3>
          <RadarChart stats={radarStats} />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <StatBox label="HP" value="100%" color="primary" />
          <StatBox label="MP" value="100%" color="secondary" />
          <StatBox label="Gold" value={stats.gold} color="gold" />
          <StatBox label="Missões" value={stats.quests_completed} color="magic-pink" />
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, color }: { label: string; value: any; color: string }) => {
  return (
    <div className={`bg-${color}/10 border border-${color}/30 rounded-lg p-3 backdrop-blur-sm`}>
      <div className="text-xs text-muted-foreground font-display mb-1">{label}</div>
      <div className={`text-lg font-display font-bold text-${color}`}>{value}</div>
    </div>
  );
};

export default CharacterAvatar;
