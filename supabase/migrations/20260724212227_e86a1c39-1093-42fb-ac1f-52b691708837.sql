
CREATE TABLE public.owner_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_address text NOT NULL,
  full_name text NOT NULL,
  contact text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.owner_leads TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.owner_leads TO authenticated;
GRANT ALL ON public.owner_leads TO service_role;

ALTER TABLE public.owner_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an owner lead"
  ON public.owner_leads FOR INSERT
  WITH CHECK (
    length(property_address) BETWEEN 3 AND 500
    AND length(full_name) BETWEEN 2 AND 200
    AND length(contact) BETWEEN 3 AND 200
  );

CREATE POLICY "Admins can view owner leads"
  ON public.owner_leads FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update owner leads"
  ON public.owner_leads FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete owner leads"
  ON public.owner_leads FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER owner_leads_updated_at
  BEFORE UPDATE ON public.owner_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
