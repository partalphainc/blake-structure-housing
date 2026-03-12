-- Messages table (in-app messaging between admin, tenants, investors)
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid,
  sender_type text NOT NULL DEFAULT 'admin',
  recipient_id uuid,
  recipient_type text NOT NULL DEFAULT 'tenant',
  subject text,
  body text NOT NULL,
  is_read boolean DEFAULT false,
  parent_id uuid REFERENCES public.messages(id),
  template_key text,
  created_at timestamptz DEFAULT now()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id uuid,
  reviewer_type text NOT NULL DEFAULT 'tenant',
  reviewer_name text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  title text,
  body text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- CRM leads table
CREATE TABLE IF NOT EXISTS public.crm_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text,
  phone text,
  source text DEFAULT 'website',
  status text DEFAULT 'new',
  interested_in text,
  notes text,
  last_contacted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY "messages_admin_all" ON public.messages FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "messages_tenant_own" ON public.messages FOR SELECT USING (
  recipient_id = auth.uid() OR sender_id = auth.uid()
);
CREATE POLICY "messages_tenant_insert" ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Reviews policies
CREATE POLICY "reviews_admin_all" ON public.reviews FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "reviews_insert_any" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "reviews_approved_select" ON public.reviews FOR SELECT USING (
  status = 'approved' OR status = 'featured' OR reviewer_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
);

-- CRM policies (admin only)
CREATE POLICY "crm_leads_admin" ON public.crm_leads FOR ALL USING (public.has_role(auth.uid(), 'admin'));
