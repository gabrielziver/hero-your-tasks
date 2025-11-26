-- Add mounts system
CREATE TABLE IF NOT EXISTS public.user_mounts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mount_type text NOT NULL,
  mount_name text,
  is_equipped boolean NOT NULL DEFAULT false,
  mount_image text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT valid_mount_type CHECK (mount_type IN ('frost_wolf', 'neon_dragon', 'blue_phoenix', 'shadow_buffalo', 'purple_bike'))
);

-- Enable RLS
ALTER TABLE public.user_mounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mounts
CREATE POLICY "Users can view own mounts"
  ON public.user_mounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own mounts"
  ON public.user_mounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mounts"
  ON public.user_mounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mounts"
  ON public.user_mounts FOR DELETE
  USING (auth.uid() = user_id);

-- Add character attributes to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS strength integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS creativity integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS vitality integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS focus integer DEFAULT 0;

-- Update complete_quest function to apply XP multipliers based on streak
CREATE OR REPLACE FUNCTION public.complete_quest(quest_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  quest_record RECORD;
  stats_record RECORD;
  new_level INTEGER;
  level_up BOOLEAN := FALSE;
  xp_for_next_level INTEGER;
  can_complete BOOLEAN := TRUE;
  new_streak INTEGER := 0;
  xp_multiplier NUMERIC := 1.0;
  final_xp INTEGER;
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
    
    -- Calculate streak
    IF quest_record.last_completion_date = CURRENT_DATE - INTERVAL '1 day' THEN
      new_streak := COALESCE(quest_record.current_streak, 0) + 1;
    ELSIF quest_record.last_completion_date IS NULL OR quest_record.last_completion_date < CURRENT_DATE - INTERVAL '1 day' THEN
      new_streak := 1;
    ELSE
      new_streak := quest_record.current_streak;
    END IF;
    
    -- Apply XP multiplier based on streak
    IF new_streak >= 30 THEN
      xp_multiplier := 2.0;
    ELSIF new_streak >= 7 THEN
      xp_multiplier := 1.5;
    ELSIF new_streak >= 3 THEN
      xp_multiplier := 1.2;
    END IF;
    
    -- Update monthly completions count and streak
    UPDATE public.quests 
    SET 
      current_month_completions = CASE 
        WHEN EXTRACT(MONTH FROM last_completion_date) = EXTRACT(MONTH FROM CURRENT_DATE) 
        THEN current_month_completions + 1
        ELSE 1
      END,
      current_streak = new_streak,
      last_completion_date = CURRENT_DATE,
      completed_at = NOW()
    WHERE id = quest_id;
  ELSE
    IF quest_record.is_completed THEN
      RAISE EXCEPTION 'Quest already completed';
    END IF;
    
    UPDATE public.quests 
    SET is_completed = TRUE, completed_at = NOW()
    WHERE id = quest_id;
  END IF;
  
  -- Calculate final XP with multiplier
  final_xp := ROUND(quest_record.xp_reward * xp_multiplier);
  
  -- Get current stats
  SELECT * INTO stats_record FROM public.user_stats WHERE user_id = auth.uid();
  
  -- Calculate new XP and check for level up
  new_level := stats_record.level;
  xp_for_next_level := new_level * 100;
  
  IF (stats_record.current_xp + final_xp) >= xp_for_next_level THEN
    new_level := new_level + 1;
    level_up := TRUE;
  END IF;
  
  -- Update user stats streak
  IF stats_record.last_quest_date = CURRENT_DATE THEN
    NULL;
  ELSIF stats_record.last_quest_date = CURRENT_DATE - INTERVAL '1 day' THEN
    UPDATE public.user_stats
    SET current_streak = current_streak + 1
    WHERE user_id = auth.uid();
  ELSE
    UPDATE public.user_stats
    SET current_streak = 1
    WHERE user_id = auth.uid();
  END IF;
  
  -- Update stats with final XP
  UPDATE public.user_stats
  SET 
    level = new_level,
    current_xp = CASE 
      WHEN level_up THEN (stats_record.current_xp + final_xp) - xp_for_next_level
      ELSE current_xp + final_xp
    END,
    total_xp = total_xp + final_xp,
    gold = gold + quest_record.gold_reward,
    quests_completed = quests_completed + 1,
    last_quest_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE user_id = auth.uid();
  
  -- Update character attributes based on category
  UPDATE public.profiles
  SET
    strength = strength + CASE WHEN quest_record.category = 'forca' THEN 1 ELSE 0 END,
    creativity = creativity + CASE WHEN quest_record.category = 'criatividade' THEN 1 ELSE 0 END,
    vitality = vitality + CASE WHEN quest_record.category = 'bem-estar' THEN 1 ELSE 0 END,
    focus = focus + CASE WHEN quest_record.category = 'produtividade' THEN 1 ELSE 0 END
  WHERE id = auth.uid();
  
  RETURN json_build_object(
    'level_up', level_up,
    'new_level', new_level,
    'xp_gained', final_xp,
    'xp_multiplier', xp_multiplier,
    'gold_gained', quest_record.gold_reward,
    'streak', new_streak
  );
END;
$$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_mounts_user_id ON public.user_mounts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mounts_equipped ON public.user_mounts(user_id, is_equipped) WHERE is_equipped = true;