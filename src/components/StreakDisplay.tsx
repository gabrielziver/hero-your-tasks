import { Flame } from "lucide-react";

interface StreakDisplayProps {
  currentStreak: number;
}

const StreakDisplay = ({ currentStreak }: StreakDisplayProps) => {
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const today = new Date().getDay();

  return (
    <div className="relative">
      {/* Floating flame */}
      <div className="flex items-center justify-center mb-4 float-animation">
        <div className="relative">
          <Flame
            className="w-12 h-12 text-destructive"
            style={{
              filter: "drop-shadow(0 0 20px rgba(239, 68, 68, 0.8))",
            }}
            fill="currentColor"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-display font-bold text-foreground">
              {currentStreak}
            </span>
          </div>
        </div>
      </div>

      {/* Week dots */}
      <div className="flex justify-center gap-2">
        {days.map((day, index) => {
          const isActive = index <= today;
          const isToday = index === today;
          
          return (
            <div key={day} className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  isActive
                    ? "border-destructive bg-destructive/20 shadow-glow-primary"
                    : "border-muted bg-muted/20"
                } ${isToday ? "scale-110 pulse-glow" : ""}`}
              >
                {isActive && (
                  <Flame
                    className="w-4 h-4 text-destructive"
                    fill="currentColor"
                  />
                )}
              </div>
              <span className="text-[10px] text-muted-foreground">{day}</span>
            </div>
          );
        })}
      </div>

      {/* Streak intensity indicator */}
      <div className="mt-4 text-center">
        <div className="text-xs text-muted-foreground mb-1">Intensidade</div>
        <div className="flex justify-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-8 h-2 rounded-full transition-all ${
                i < Math.min(Math.floor(currentStreak / 7), 5)
                  ? "bg-destructive shadow-glow-primary"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StreakDisplay;
