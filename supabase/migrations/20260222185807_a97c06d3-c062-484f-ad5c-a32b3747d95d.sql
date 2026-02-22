
-- Drop all recursive user_roles policies
DROP POLICY IF EXISTS "Admins can delete user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

-- Recreate using has_role() security definer function to avoid recursion
CREATE POLICY "Admins can view all user_roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert user_roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update user_roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete user_roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix profiles admin policy too (it also queries user_roles directly)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
