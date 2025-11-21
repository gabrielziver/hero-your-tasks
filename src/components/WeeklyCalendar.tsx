import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
      const totalCount = dayQuests.length;
      
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

  const getIndicatorColor = (day: DayData) => {
    if (day.totalCount === 0) return "bg-muted";
    
    const completionRate = day.completedCount / day.totalCount;
    
    if (completionRate === 1) return "bg-green-500";
    if (completionRate >= 0.5) return "bg-yellow-500";
    return "bg-red-400";
  };

  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <div className="flex items-center justify-between gap-2 overflow-x-auto">
        {weekDays.map((day, index) => (
          <div
            key={index}
            className={`flex flex-col items-center min-w-[60px] ${
              day.isToday ? "scale-110" : ""
            }`}
          >
            <span className="text-xs text-muted-foreground font-medium mb-1">
              {day.dayName}
            </span>
            <div
              className={`
                text-xl font-display font-bold mb-2 transition-all
                ${day.isToday ? "text-primary scale-110" : "text-foreground"}
              `}
            >
              {day.dayNumber}
            </div>
            <div
              className={`
                w-2 h-2 rounded-full transition-all
                ${getIndicatorColor(day)}
                ${day.isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}
              `}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyCalendar;
