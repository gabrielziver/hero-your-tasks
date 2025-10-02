import { Card, CardContent } from "./ui/card";
import { User, Star, Coins, Flame } from "lucide-react";
import { Progress } from "./ui/progress";

interface CharacterAvatarProps {
  stats: any;
}

const CharacterAvatar = ({ stats }: CharacterAvatarProps) => {
  if (!stats) return null;

  const xpForNextLevel = stats.level * 100;
  const xpProgress = (stats.current_xp / xpForNextLevel) * 100;

  return (
    <Card className="bg-gradient-card border-border sticky top-8">
      <CardContent className="p-6">
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary shadow-glow-primary">
              <User className="w-16 h-16 text-primary" />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-gold text-card px-4 py-1 rounded-full font-bold text-sm shadow-glow-gold">
              Level {stats.level}
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">XP</span>
            <span className="text-foreground font-semibold">
              {stats.current_xp} / {xpForNextLevel}
            </span>
          </div>
          <Progress value={xpProgress} className="h-3 bg-muted">
            <div className="h-full bg-gradient-hero rounded-full transition-all" style={{ width: `${xpProgress}%` }} />
          </Progress>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <StatRow icon={<Star className="w-5 h-5 text-primary" />} label="Total XP" value={stats.total_xp} />
          <StatRow icon={<Coins className="w-5 h-5 text-secondary" />} label="Gold" value={stats.gold} />
          <StatRow icon={<Flame className="w-5 h-5 text-destructive" />} label="Streak" value={`${stats.current_streak} days`} />
          <StatRow icon={<Star className="w-5 h-5 text-primary" />} label="Quests" value={stats.quests_completed} />
        </div>
      </CardContent>
    </Card>
  );
};

const StatRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: any }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-muted-foreground">{label}</span>
      </div>
      <span className="font-bold text-foreground">{value}</span>
    </div>
  );
};

export default CharacterAvatar;
