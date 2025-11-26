-- Add recurrence fields to quests table
ALTER TABLE public.quests 
ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS recurrence_type text CHECK (recurrence_type IN ('daily', 'weekly', 'monthly')),
ADD COLUMN IF NOT EXISTS recurrence_days integer[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS monthly_target integer DEFAULT 30,
ADD COLUMN IF NOT EXISTS current_month_completions integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_completion_date date;

-- Create function to reset monthly habit completions
CREATE OR REPLACE FUNCTION public.reset_monthly_habit_completions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.quests
  SET current_month_completions = 0
  WHERE is_recurring = true
    AND recurrence_type = 'monthly'
    AND EXTRACT(MONTH FROM last_completion_date) != EXTRACT(MONTH FROM CURRENT_DATE);
END;
$$;

-- Update complete_quest function to handle recurring quests
CREATE OR REPLACE FUNCTION public.complete_quest(quest_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  quest_record RECORD;
  stats_record RECORD;
  new_level INTEGER;
  level_up BOOLEAN := FALSE;
  xp_for_next_level INTEGER;
  can_complete BOOLEAN := TRUE;
BEGIN
  -- Get quest details
  SELECT * INTO quest_record FROM public.quests WHERE id = quest_id AND user_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quest not found';
  END IF;
  
  -- For recurring quests, check if already completed today
  IF quest_record.is_recurring THEN
    IF quest_record.last_completion_date = CURRENT_DATE THEN
      RAISE EXCEPTION 'Habit already completed today';
    END IF;
    
    -- Update monthly completions count
    UPDATE public.quests 
    SET 
      current_month_completions = CASE 
        WHEN EXTRACT(MONTH FROM last_completion_date) = EXTRACT(MONTH FROM CURRENT_DATE) 
        THEN current_month_completions + 1
        ELSE 1
      END,
      last_completion_date = CURRENT_DATE,
      completed_at = NOW()
    WHERE id = quest_id;
  ELSE
    -- For non-recurring quests, check if already completed
    IF quest_record.is_completed THEN
      RAISE EXCEPTION 'Quest already completed';
    END IF;
    
    -- Mark quest as completed
    UPDATE public.quests 
    SET is_completed = TRUE, completed_at = NOW()
    WHERE id = quest_id;
  END IF;
  
  -- Get current stats
  SELECT * INTO stats_record FROM public.user_stats WHERE user_id = auth.uid();
  
  -- Calculate new XP and check for level up
  new_level := stats_record.level;
  xp_for_next_level := new_level * 100;
  
  IF (stats_record.current_xp + quest_record.xp_reward) >= xp_for_next_level THEN
    new_level := new_level + 1;
    level_up := TRUE;
  END IF;
  
  -- Update streak
  IF stats_record.last_quest_date = CURRENT_DATE THEN
    -- Same day, no streak change
    NULL;
  ELSIF stats_record.last_quest_date = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Consecutive day, increase streak
    UPDATE public.user_stats
    SET current_streak = current_streak + 1
    WHERE user_id = auth.uid();
  ELSE
    -- Streak broken, reset to 1
    UPDATE public.user_stats
    SET current_streak = 1
    WHERE user_id = auth.uid();
  END IF;
  
  -- Update stats
  UPDATE public.user_stats
  SET 
    level = new_level,
    current_xp = CASE 
      WHEN level_up THEN (stats_record.current_xp + quest_record.xp_reward) - xp_for_next_level
      ELSE current_xp + quest_record.xp_reward
    END,
    total_xp = total_xp + quest_record.xp_reward,
    gold = gold + quest_record.gold_reward,
    quests_completed = quests_completed + 1,
    last_quest_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE user_id = auth.uid();
  
  RETURN json_build_object(
    'level_up', level_up,
    'new_level', new_level,
    'xp_gained', quest_record.xp_reward,
    'gold_gained', quest_record.gold_reward
  );
END;
$$;