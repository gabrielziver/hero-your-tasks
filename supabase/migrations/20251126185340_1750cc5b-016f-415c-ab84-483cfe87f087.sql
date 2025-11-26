-- Fix search_path for handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, SPLIT_PART(NEW.email, '@', 1));
  
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  
  -- Create starter quests with new categories
  INSERT INTO public.quests (user_id, title, category, priority, xp_reward, gold_reward) VALUES
    (NEW.id, 'Complete your first quest', 'produtividade', 'high', 50, 25),
    (NEW.id, 'Create a new quest', 'produtividade', 'medium', 25, 10),
    (NEW.id, 'Reach level 2', 'produtividade', 'medium', 25, 10);
  
  RETURN NEW;
END;
$$;