import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Flame } from "lucide-react";

interface DayData {
  date: Date;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  completedCount: number;
  totalCount: number;
}

const WeeklyCalendar = ({ userId }: { userId: string }) => {
  const [weekDays, setWeekDays] = useState<DayData[]>([]);

  useEffect(() => {
    loadWeekData();
  }, [userId]);

  const loadWeekData = async () => {
    // Get current week (Sunday to Saturday)
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 6 = Saturday
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Fetch quests for the week
    const { data: quests } = await supabase
      .from("quests")
      .select("created_at, completed_at, is_completed")
      .eq("user_id", userId)
      .gte("created_at", startOfWeek.toISOString())
      .lte("created_at", endOfWeek.toISOString());

    // Build week days array
    const days: DayData[] = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      // Count quests for this day
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayQuests = quests?.filter((q) => {
        const questDate = new Date(q.created_at);
        return questDate >= dayStart && questDate <= dayEnd;
      }) || [];
      
      const completedCount = dayQuests.filter((q) => q.is_completed).length;
      const totalCount = completedCount; // Only count completed tasks for streak
      
      days.push({
        date,
        dayName: dayNames[i],
        dayNumber: date.getDate(),
        isToday: date.toDateString() === today.toDateString(),
        completedCount,
        totalCount,
      });
    }

    setWeekDays(days);
  };

  const hasCompletedTasks = (day: DayData) => {
    return day.completedCount > 0;
  };

  return (
    <div className="bg-card rounded-2xl p-4 sm:p-6 border border-border">
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {weekDays.map((day, index) => (
          <div
            key={index}
            className={`flex flex-col items-center gap-1 sm:gap-2 ${
              day.isToday ? "scale-105 sm:scale-110" : ""
            }`}
          >
            <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
              {day.dayName}
            </span>
            <div
              className={`
                text-base sm:text-xl font-display font-bold transition-all
                ${hasCompletedTasks(day) ? "text-foreground" : "text-muted-foreground/40"}
                ${day.isToday ? "text-primary" : ""}
              `}
            >
              {day.dayNumber}
            </div>
            {hasCompletedTasks(day) ? (
              <Flame 
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-all ${
                  day.isToday ? "text-primary" : "text-primary/80"
                }`}
                fill="currentColor"
              />
            ) : (
              <div className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyCalendar;
