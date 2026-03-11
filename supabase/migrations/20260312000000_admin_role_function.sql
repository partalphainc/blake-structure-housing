-- SECURITY DEFINER function: assigns admin role to @cblakeent.com users
-- Runs as postgres (bypasses RLS), safe to call from frontend
CREATE OR REPLACE FUNCTION public.assign_admin_role_if_eligible()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_uid uuid;
BEGIN
  v_uid := auth.uid();
  SELECT email INTO v_email FROM auth.users WHERE id = v_uid;

  IF lower(v_email) LIKE '%@cblakeent.com'
     OR lower(v_email) = 'partalphaincorporation@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_uid, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$;
