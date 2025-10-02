-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  avatar_color TEXT DEFAULT '#6C3AE3',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create quests table  
CREATE TABLE public.quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'medium',
  xp_reward INTEGER NOT NULL DEFAULT 10,
  gold_reward INTEGER NOT NULL DEFAULT 5,
  is_completed BOOLEAN DEFAULT FALSE,
  is_boss_quest BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user stats table
CREATE TABLE public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1,
  current_xp INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  gold INTEGER DEFAULT 0,
  quests_completed INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  last_quest_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Quests policies
CREATE POLICY "Users can view own quests" ON public.quests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own quests" ON public.quests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quests" ON public.quests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own quests" ON public.quests FOR DELETE USING (auth.uid() = user_id);

-- User stats policies
CREATE POLICY "Users can view all stats" ON public.user_stats FOR SELECT USING (true);
CREATE POLICY "Users can update own stats" ON public.user_stats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stats" ON public.user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, SPLIT_PART(NEW.email, '@', 1));
  
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  
  -- Create starter quests
  INSERT INTO public.quests (user_id, title, category, priority, xp_reward, gold_reward) VALUES
    (NEW.id, 'Complete your first quest', 'tutorial', 'high', 50, 25),
    (NEW.id, 'Create a new quest', 'tutorial', 'medium', 25, 10),
    (NEW.id, 'Reach level 2', 'tutorial', 'medium', 25, 10);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update streak and level
CREATE OR REPLACE FUNCTION public.complete_quest(quest_id UUID)
RETURNS JSON AS $$
DECLARE
  quest_record RECORD;
  stats_record RECORD;
  new_level INTEGER;
  level_up BOOLEAN := FALSE;
  xp_for_next_level INTEGER;
BEGIN
  -- Get quest details
  SELECT * INTO quest_record FROM public.quests WHERE id = quest_id AND user_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quest not found';
  END IF;
  
  IF quest_record.is_completed THEN
    RAISE EXCEPTION 'Quest already completed';
  END IF;
  
  -- Mark quest as completed
  UPDATE public.quests 
  SET is_completed = TRUE, completed_at = NOW()
  WHERE id = quest_id;
  
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX idx_quests_user_id ON public.quests(user_id);
CREATE INDEX idx_quests_completed ON public.quests(is_completed);
CREATE INDEX idx_user_stats_level ON public.user_stats(level DESC);
CREATE INDEX idx_user_stats_total_xp ON public.user_stats(total_xp DESC);