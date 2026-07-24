-- Lock down owner_leads: no direct public writes, all inserts go through the submit-owner-lead edge function using the service role.
REVOKE INSERT ON public.owner_leads FROM anon, authenticated;
DROP POLICY IF EXISTS "Anyone can submit an owner lead" ON public.owner_leads;