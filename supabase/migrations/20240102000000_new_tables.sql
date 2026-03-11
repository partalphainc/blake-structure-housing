-- Applications table
CREATE TABLE IF NOT EXISTS public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  unit_id uuid REFERENCES public.units(id),
  status text DEFAULT 'pending',
  notes text,
  income numeric,
  employment text,
  background_consent boolean DEFAULT false,
  id_document_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vendors table
CREATE TABLE IF NOT EXISTS public.vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  trade text,
  phone text,
  email text,
  address text,
  notes text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  amount numeric NOT NULL,
  category text DEFAULT 'maintenance',
  property_id uuid REFERENCES public.properties(id),
  date date NOT NULL DEFAULT CURRENT_DATE,
  recorded_by uuid,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Inspections table
CREATE TABLE IF NOT EXISTS public.inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid REFERENCES public.units(id),
  property_id uuid REFERENCES public.properties(id),
  type text NOT NULL DEFAULT 'routine',
  inspection_date date NOT NULL,
  inspector_name text,
  inspector_id uuid,
  findings text,
  notes text,
  image_urls text[],
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

-- Add occupancy_status and tags to properties
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS occupancy_status text DEFAULT 'vacant';
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS property_tags text[] DEFAULT '{}';

-- RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

-- Applications: anyone can insert (public form), admins can read/update
CREATE POLICY "applications_insert" ON public.applications FOR INSERT WITH CHECK (true);
CREATE POLICY "applications_select" ON public.applications FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "applications_update" ON public.applications FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Vendors: admin only
CREATE POLICY "vendors_select" ON public.vendors FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "vendors_insert" ON public.vendors FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "vendors_update" ON public.vendors FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "vendors_delete" ON public.vendors FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Expenses: admin only
CREATE POLICY "expenses_select" ON public.expenses FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "expenses_insert" ON public.expenses FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Inspections: admin can CRUD, investor can read their properties
CREATE POLICY "inspections_select" ON public.inspections FOR SELECT USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'investor')
);
CREATE POLICY "inspections_insert" ON public.inspections FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "inspections_update" ON public.inspections FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
