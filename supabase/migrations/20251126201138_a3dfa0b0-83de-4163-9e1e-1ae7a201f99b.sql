-- Create pets table
CREATE TABLE IF NOT EXISTS public.user_pets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_type text NOT NULL,
  pet_name text,
  evolution_stage integer NOT NULL DEFAULT 1,
  pet_xp integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT false,
  pet_images jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT valid_pet_type CHECK (pet_type IN ('flameling', 'aqualight', 'shadetail', 'puffie', 'sparkfox')),
  CONSTRAINT valid_evolution_stage CHECK (evolution_stage >= 1 AND evolution_stage <= 3)
);

-- Enable RLS
ALTER TABLE public.user_pets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own pets"
  ON public.user_pets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own pets"
  ON public.user_pets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pets"
  ON public.user_pets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pets"
  ON public.user_pets FOR DELETE
  USING (auth.uid() = user_id);

-- Function to give XP to active pet when quest is completed
CREATE OR REPLACE FUNCTION public.give_pet_xp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pet_record RECORD;
  xp_to_give integer;
  new_evolution_stage integer;
  xp_for_evolution integer;
BEGIN
  -- Only give XP for recurring quests (habits)
  IF NOT NEW.is_recurring THEN
    RETURN NEW;
  END IF;
  
  -- Get active pet
  SELECT * INTO pet_record 
  FROM public.user_pets 
  WHERE user_id = NEW.user_id AND is_active = true
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;
  
  -- Give XP based on quest category
  xp_to_give := CASE 
    WHEN NEW.category = 'produtividade' THEN 10
    WHEN NEW.category = 'bem-estar' THEN 15
    WHEN NEW.category = 'criatividade' THEN 12
    WHEN NEW.category = 'forca' THEN 20
    ELSE 10
  END;
  
  -- Bonus XP for streaks
  IF NEW.current_streak >= 7 THEN
    xp_to_give := xp_to_give * 2;
  ELSIF NEW.current_streak >= 3 THEN
    xp_to_give := ROUND(xp_to_give * 1.5);
  END IF;
  
  -- Calculate evolution
  new_evolution_stage := pet_record.evolution_stage;
  xp_for_evolution := pet_record.evolution_stage * 100;
  
  IF (pet_record.pet_xp + xp_to_give) >= xp_for_evolution AND pet_record.evolution_stage < 3 THEN
    new_evolution_stage := pet_record.evolution_stage + 1;
    
    -- Update pet with evolution
    UPDATE public.user_pets
    SET 
      pet_xp = (pet_record.pet_xp + xp_to_give) - xp_for_evolution,
      evolution_stage = new_evolution_stage,
      updated_at = now()
    WHERE id = pet_record.id;
  ELSE
    -- Just add XP
    UPDATE public.user_pets
    SET 
      pet_xp = pet_xp + xp_to_give,
      updated_at = now()
    WHERE id = pet_record.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to give pet XP when habit is completed
DROP TRIGGER IF EXISTS give_pet_xp_on_quest_complete ON public.quests;
CREATE TRIGGER give_pet_xp_on_quest_complete
  AFTER UPDATE ON public.quests
  FOR EACH ROW
  WHEN (NEW.last_completion_date IS DISTINCT FROM OLD.last_completion_date)
  EXECUTE FUNCTION public.give_pet_xp();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_pets_user_id ON public.user_pets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_pets_active ON public.user_pets(user_id, is_active) WHERE is_active = true;