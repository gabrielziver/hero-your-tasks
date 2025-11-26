import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface HabitStatsCardProps {
  title: string;
  score: number;
  streak: number;
  trend: "improving" | "stable" | "declining";
  monthlyCompletions: number;
  monthlyTarget: number;
  category: string;
}

const HabitStatsCard = ({
  title,
  score,
  streak,
  trend,
  monthlyCompletions,
  monthlyTarget,
  category,
}: HabitStatsCardProps) => {
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "produtividade":
        return "bg-[#A88CFF]";
      case "bem-estar":
        return "bg-[#FF6EC7]";
      case "criatividade":
        return "bg-[#6CE0FF]";
      case "forca":
        return "bg-[#FFD34E]";
      default:
        return "bg-primary";
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "declining":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "improving":
        return "text-green-500";
      case "declining":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  const scoreColor =
    score >= 80
      ? "text-green-500"
      : score >= 50
      ? "text-yellow-500"
      : "text-red-500";

  return (
    <Card className="bg-card border-border hover:border-primary transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-2 h-12 rounded-full ${getCategoryColor(category)}`} />
            <CardTitle className="text-base font-semibold text-foreground">
              {title}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {trend === "improving" ? "Melhorando" : trend === "declining" ? "Em queda" : "Estável"}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Habit Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Score do Hábito</span>
            <span className={`text-2xl font-bold ${scoreColor}`}>{score}/100</span>
          </div>
          <Progress value={score} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">🔥</div>
            <div className="text-xl font-bold text-foreground">{streak}</div>
            <div className="text-xs text-muted-foreground">Streak</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">✔️</div>
            <div className="text-xl font-bold text-foreground">
              {monthlyCompletions}/{monthlyTarget}
            </div>
            <div className="text-xs text-muted-foreground">Este mês</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">📊</div>
            <div className="text-xl font-bold text-foreground">
              {Math.round((monthlyCompletions / monthlyTarget) * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">Taxa</div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {score >= 80 && (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              ⭐ Excelente
            </Badge>
          )}
          {streak >= 30 && (
            <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
              🔥 Em Chamas
            </Badge>
          )}
          {monthlyCompletions >= monthlyTarget && (
            <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
              🎯 Meta Atingida
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HabitStatsCard;
