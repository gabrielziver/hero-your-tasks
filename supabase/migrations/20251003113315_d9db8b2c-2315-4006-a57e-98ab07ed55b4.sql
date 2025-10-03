-- Create groups table
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invite_code TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group_members table
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Enable RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for groups
CREATE POLICY "Users can view groups they are members of"
ON public.groups FOR SELECT
USING (
  id IN (
    SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create groups"
ON public.groups FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups"
ON public.groups FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Group creators can delete their groups"
ON public.groups FOR DELETE
USING (auth.uid() = created_by);

-- RLS Policies for group_members
CREATE POLICY "Users can view group members of their groups"
ON public.group_members FOR SELECT
USING (
  group_id IN (
    SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can join groups"
ON public.group_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
ON public.group_members FOR DELETE
USING (auth.uid() = user_id);