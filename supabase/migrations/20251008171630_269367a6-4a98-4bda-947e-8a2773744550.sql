-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view group members of their groups" ON public.group_members;
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.groups;
DROP POLICY IF EXISTS "Users can view quests in their groups" ON public.group_quests;
DROP POLICY IF EXISTS "Users can view completions in their groups" ON public.group_quest_completions;

-- Create security definer function to check group membership
CREATE OR REPLACE FUNCTION public.is_group_member(_group_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE group_id = _group_id
      AND user_id = _user_id
  )
$$;

-- Create security definer function to get user's groups
CREATE OR REPLACE FUNCTION public.get_user_groups(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT group_id
  FROM public.group_members
  WHERE user_id = _user_id
$$;

-- Recreate policies using security definer functions
CREATE POLICY "Users can view group members of their groups" 
ON public.group_members 
FOR SELECT 
USING (public.is_group_member(group_id, auth.uid()));

CREATE POLICY "Users can view groups they are members of" 
ON public.groups 
FOR SELECT 
USING (id IN (SELECT public.get_user_groups(auth.uid())));

CREATE POLICY "Users can view quests in their groups" 
ON public.group_quests 
FOR SELECT 
USING (group_id IN (SELECT public.get_user_groups(auth.uid())));

CREATE POLICY "Users can view completions in their groups" 
ON public.group_quest_completions 
FOR SELECT 
USING (group_quest_id IN (
  SELECT id FROM public.group_quests 
  WHERE group_id IN (SELECT public.get_user_groups(auth.uid()))
));