-- Add character selection to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS selected_character text DEFAULT 'warrior',
ADD COLUMN IF NOT EXISTS character_images jsonb DEFAULT '{}'::jsonb;

-- Add constraint to ensure only valid characters are selected
ALTER TABLE public.profiles
ADD CONSTRAINT valid_character_type 
CHECK (selected_character IN ('warrior', 'archer', 'mage', 'ninja'));