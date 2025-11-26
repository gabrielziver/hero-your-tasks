-- Fix search_path for complete_group_quest function
CREATE OR REPLACE FUNCTION public.complete_group_quest(quest_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
    RAISE EXCEPTION 'Missão não encontrada ou inativa';
  END IF;
  
  -- Check if user is in the group
  IF NOT EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = quest_record.group_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Usuário não está no grupo';
  END IF;
  
  -- Check if user already completed this quest
  IF EXISTS (
    SELECT 1 FROM public.group_quest_completions 
    WHERE group_quest_id = quest_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Missão já completada';
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
$function$;