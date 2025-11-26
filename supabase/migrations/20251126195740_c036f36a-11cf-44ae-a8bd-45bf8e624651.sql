-- Add habit statistics columns to quests table
ALTER TABLE public.quests 
ADD COLUMN IF NOT EXISTS habit_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS frequency_data jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS trend_indicator text DEFAULT 'stable';

-- Function to calculate habit score based on completion history
CREATE OR REPLACE FUNCTION public.calculate_habit_score(quest_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  quest_record RECORD;
  score integer := 0;
  consistency_bonus integer := 0;
BEGIN
  SELECT * INTO quest_record FROM public.quests WHERE id = quest_id;
  
  IF NOT quest_record.is_recurring THEN
    RETURN 0;
  END IF;
  
  -- Base score from streak (max 50 points)
  score := LEAST(quest_record.current_streak * 2, 50);
  
  -- Monthly completion bonus (max 30 points)
  IF quest_record.recurrence_type = 'monthly' THEN
    score := score + LEAST((quest_record.current_month_completions * 100 / NULLIF(quest_record.monthly_target, 0)), 30);
  ELSE
    -- For daily/weekly habits, use current month completions
    score := score + LEAST(quest_record.current_month_completions, 30);
  END IF;
  
  -- Consistency bonus (max 20 points)
  -- Based on how regularly the habit is completed
  consistency_bonus := CASE
    WHEN quest_record.current_streak >= 30 THEN 20
    WHEN quest_record.current_streak >= 14 THEN 15
    WHEN quest_record.current_streak >= 7 THEN 10
    WHEN quest_record.current_streak >= 3 THEN 5
    ELSE 0
  END;
  
  score := score + consistency_bonus;
  
  RETURN LEAST(score, 100);
END;
$$;

-- Function to update habit statistics after completion
CREATE OR REPLACE FUNCTION public.update_habit_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_score integer;
  current_freq jsonb;
  trend text;
BEGIN
  IF NEW.is_recurring AND NEW.last_completion_date IS NOT NULL THEN
    -- Calculate new habit score
    new_score := calculate_habit_score(NEW.id);
    
    -- Update frequency data (last 30 days)
    current_freq := COALESCE(NEW.frequency_data, '[]'::jsonb);
    
    -- Add today's completion to frequency data
    current_freq := jsonb_insert(
      current_freq,
      '{0}',
      jsonb_build_object(
        'date', NEW.last_completion_date::text,
        'completed', true,
        'streak', NEW.current_streak
      ),
      true
    );
    
    -- Keep only last 30 entries
    IF jsonb_array_length(current_freq) > 30 THEN
      current_freq := (
        SELECT jsonb_agg(elem)
        FROM (
          SELECT elem
          FROM jsonb_array_elements(current_freq) elem
          ORDER BY elem->>'date' DESC
          LIMIT 30
        ) subq
      );
    END IF;
    
    -- Determine trend indicator
    IF NEW.current_streak >= 7 AND new_score >= 70 THEN
      trend := 'improving';
    ELSIF NEW.current_streak >= 3 AND new_score >= 50 THEN
      trend := 'stable';
    ELSE
      trend := 'declining';
    END IF;
    
    NEW.habit_score := new_score;
    NEW.frequency_data := current_freq;
    NEW.trend_indicator := trend;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to update habit stats after completion
DROP TRIGGER IF EXISTS update_habit_statistics ON public.quests;
CREATE TRIGGER update_habit_statistics
  BEFORE UPDATE ON public.quests
  FOR EACH ROW
  WHEN (NEW.last_completion_date IS DISTINCT FROM OLD.last_completion_date)
  EXECUTE FUNCTION public.update_habit_stats();