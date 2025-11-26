import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useMemo } from "react";

interface FrequencyData {
  date: string;
  completed: boolean;
  streak: number;
}

interface HabitFrequencyChartProps {
  frequencyData: FrequencyData[];
  category: string;
}

const HabitFrequencyChart = ({ frequencyData, category }: HabitFrequencyChartProps) => {
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "produtividade":
        return "#A88CFF";
      case "bem-estar":
        return "#FF6EC7";
      case "criatividade":
        return "#6CE0FF";
      case "forca":
        return "#FFD34E";
      default:
        return "hsl(var(--primary))";
    }
  };

  // Get last 30 days
  const last30Days = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  }, []);

  const getCompletionForDate = (date: string) => {
    return frequencyData.find(d => d.date === date);
  };

  const maxStreak = Math.max(...frequencyData.map(d => d.streak), 1);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-base">Frequência (Últimos 30 dias)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Bar Chart */}
          <div className="flex items-end justify-between gap-1 h-32">
            {last30Days.map((date, index) => {
              const completion = getCompletionForDate(date);
              const height = completion ? (completion.streak / maxStreak) * 100 : 0;
              const isCompleted = completion?.completed || false;
              
              return (
                <div
                  key={date}
                  className="flex-1 flex flex-col items-center gap-1"
                  title={`${date}: ${isCompleted ? 'Completo' : 'Não completo'}`}
                >
                  <div
                    className="w-full rounded-t transition-all"
                    style={{
                      height: `${Math.max(height, isCompleted ? 20 : 0)}%`,
                      backgroundColor: isCompleted ? getCategoryColor(category) : "hsl(var(--muted))",
                      opacity: isCompleted ? 1 : 0.3,
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-10 gap-1.5 mt-4">
            {last30Days.map((date) => {
              const completion = getCompletionForDate(date);
              const isCompleted = completion?.completed || false;
              const day = new Date(date).getDate();

              return (
                <div
                  key={date}
                  className="aspect-square rounded flex items-center justify-center text-xs transition-all"
                  style={{
                    backgroundColor: isCompleted
                      ? getCategoryColor(category)
                      : "hsl(var(--muted))",
                    opacity: isCompleted ? 1 : 0.2,
                    color: isCompleted ? "white" : "hsl(var(--muted-foreground))",
                  }}
                  title={`${date}: ${isCompleted ? '✓' : '−'}`}
                >
                  {day}
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between pt-2 text-sm">
            <span className="text-muted-foreground">
              {frequencyData.filter(d => d.completed).length} dias completados
            </span>
            <span className="text-muted-foreground">
              {Math.round((frequencyData.filter(d => d.completed).length / 30) * 100)}% de consistência
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HabitFrequencyChart;
