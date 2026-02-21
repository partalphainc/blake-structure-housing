-- Allow admins full management of properties
CREATE POLICY "Admins can manage properties"
ON public.properties
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Drop the limited admin SELECT policy
DROP POLICY IF EXISTS "Admins can view all properties" ON public.properties;