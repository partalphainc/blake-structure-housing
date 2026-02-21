-- Fix infinite recursion: create security definer function for resident unit access
CREATE OR REPLACE FUNCTION public.is_tenant_of_unit(_user_id uuid, _unit_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.leases
    WHERE unit_id = _unit_id AND tenant_id = _user_id AND status = 'active'
  )
$$;

-- Drop the recursive policy
DROP POLICY IF EXISTS "Residents can view assigned unit" ON public.units;

-- Recreate with security definer function
CREATE POLICY "Residents can view assigned unit"
ON public.units
FOR SELECT
TO authenticated
USING (public.is_tenant_of_unit(auth.uid(), id));

-- Also fix the owners can view units policy which references properties
CREATE OR REPLACE FUNCTION public.is_owner_of_property(_user_id uuid, _property_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.properties
    WHERE id = _property_id AND owner_id = _user_id
  )
$$;

DROP POLICY IF EXISTS "Owners can view units" ON public.units;
CREATE POLICY "Owners can view units"
ON public.units
FOR SELECT
TO authenticated
USING (public.is_owner_of_property(auth.uid(), property_id));