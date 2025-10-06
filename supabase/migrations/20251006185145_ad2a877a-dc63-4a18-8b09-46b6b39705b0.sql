-- Add avatar_url to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create group_quests table
CREATE TABLE IF NOT EXISTS public.group_quests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS on group_quests
ALTER TABLE public.group_quests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for group_quests
CREATE POLICY "Users can view quests in their groups"
ON public.group_quests FOR SELECT
USING (
  group_id IN (
    SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Group members can create quests"
ON public.group_quests FOR INSERT
WITH CHECK (
  auth.uid() = created_by AND
  group_id IN (
    SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Quest creators can update their quests"
ON public.group_quests FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Quest creators can delete their quests"
ON public.group_quests FOR DELETE
USING (auth.uid() = created_by);

-- Create group_quest_completions table
CREATE TABLE IF NOT EXISTS public.group_quest_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_quest_id UUID NOT NULL REFERENCES public.group_quests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_quest_id, user_id)
);

-- Enable RLS on group_quest_completions
ALTER TABLE public.group_quest_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for group_quest_completions
CREATE POLICY "Users can view completions in their groups"
ON public.group_quest_completions FOR SELECT
USING (
  group_quest_id IN (
    SELECT id FROM public.group_quests
    WHERE group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can insert their own completions"
ON public.group_quest_completions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Function to complete group quest and award XP to all members
CREATE OR REPLACE FUNCTION public.complete_group_quest(quest_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  quest_record RECORD;
  member_record RECORD;
  result_data JSON;
BEGIN
  -- Get quest details
  SELECT * INTO quest_record 
  FROM public.group_quests 
  WHERE id = quest_id AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quest not found or not active';
  END IF;
  
  -- Check if user is in the group
  IF NOT EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = quest_record.group_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'User not in group';
  END IF;
  
  -- Check if user already completed this quest
  IF EXISTS (
    SELECT 1 FROM public.group_quest_completions 
    WHERE group_quest_id = quest_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Quest already completed';
  END IF;
  
  -- Mark quest as completed for this user
  INSERT INTO public.group_quest_completions (group_quest_id, user_id)
  VALUES (quest_id, auth.uid());
  
  -- Award XP to all group members
  FOR member_record IN 
    SELECT user_id FROM public.group_members 
    WHERE group_id = quest_record.group_id
  LOOP
    UPDATE public.user_stats
    SET 
      current_xp = current_xp + quest_record.xp_reward,
      total_xp = total_xp + quest_record.xp_reward,
      level = CASE 
        WHEN (current_xp + quest_record.xp_reward) >= (level * 100) 
        THEN level + 1 
        ELSE level 
      END,
      current_xp = CASE 
        WHEN (current_xp + quest_record.xp_reward) >= (level * 100) 
        THEN (current_xp + quest_record.xp_reward) - (level * 100)
        ELSE current_xp + quest_record.xp_reward
      END,
      updated_at = now()
    WHERE user_id = member_record.user_id;
  END LOOP;
  
  result_data := json_build_object(
    'success', true,
    'xp_awarded', quest_record.xp_reward,
    'quest_title', quest_record.title
  );
  
  RETURN result_data;
END;
$$;