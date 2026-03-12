-- Media items table for cloud streaming / video management
CREATE TABLE IF NOT EXISTS public.media_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  category text DEFAULT 'other',
  visibility text DEFAULT 'admin',
  property_id uuid REFERENCES public.properties(id),
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "media_admin_all" ON public.media_items FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Tenants can see tenant/public media
CREATE POLICY "media_tenant_select" ON public.media_items FOR SELECT USING (
  visibility IN ('tenant', 'public') AND public.has_role(auth.uid(), 'resident')
);

-- Investors can see investor/public media
CREATE POLICY "media_investor_select" ON public.media_items FOR SELECT USING (
  visibility IN ('investor', 'public') AND public.has_role(auth.uid(), 'investor')
);

-- Public media visible to all
CREATE POLICY "media_public_select" ON public.media_items FOR SELECT USING (
  visibility = 'public'
);
