-- =============================================
-- C. Blake Enterprise - Full Base Schema
-- Run this FIRST in Supabase SQL Editor
-- =============================================

-- Roles enum
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('resident', 'investor', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Properties
CREATE TABLE IF NOT EXISTS public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  city text,
  state text,
  zip text,
  property_type text,
  total_units integer,
  status text DEFAULT 'active',
  owner_id uuid NOT NULL,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Units
CREATE TABLE IF NOT EXISTS public.units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id),
  unit_name text NOT NULL,
  unit_type text,
  rate_monthly numeric,
  rate_weekly numeric,
  deposit numeric,
  amenities text[],
  status text DEFAULT 'available',
  is_furnished boolean DEFAULT false,
  utilities_included boolean DEFAULT false,
  insurance_eligible boolean DEFAULT false,
  minimum_stay text,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Leases
CREATE TABLE IF NOT EXISTS public.leases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  unit_id uuid NOT NULL REFERENCES public.units(id),
  rent_amount numeric NOT NULL,
  payment_frequency text DEFAULT 'monthly',
  start_date date NOT NULL,
  end_date date,
  status text DEFAULT 'active',
  document_url text,
  due_day integer DEFAULT 1,
  late_fee_amount numeric DEFAULT 0,
  late_fee_days integer DEFAULT 5,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id uuid NOT NULL REFERENCES public.leases(id),
  tenant_id uuid NOT NULL,
  amount numeric NOT NULL,
  late_fee numeric DEFAULT 0,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  payment_method text,
  status text DEFAULT 'recorded',
  receipt_url text,
  recorded_by uuid,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Maintenance Requests
CREATE TABLE IF NOT EXISTS public.maintenance_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  unit_id uuid REFERENCES public.units(id),
  title text NOT NULL,
  description text NOT NULL,
  priority text DEFAULT 'normal',
  status text DEFAULT 'submitted',
  admin_notes text,
  image_urls text[],
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Documents
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  owner_type text NOT NULL,
  uploaded_by uuid NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  category text,
  notes text,
  visible_to_tenant boolean DEFAULT false,
  visible_to_investor boolean DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Investor Reports
CREATE TABLE IF NOT EXISTS public.investor_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id),
  report_month text NOT NULL,
  total_revenue numeric,
  total_expenses numeric,
  occupancy_rate numeric,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Activity Log
CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  actor_type text DEFAULT 'admin',
  action text NOT NULL,
  entity_type text,
  entity_id text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'general',
  read_at timestamptz,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- Helper Functions
-- =============================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_owner_of_property(_property_id uuid, _user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.properties
    WHERE id = _property_id AND owner_id = _user_id
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_tenant_of_unit(_unit_id uuid, _user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.leases
    WHERE unit_id = _unit_id AND tenant_id = _user_id AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- =============================================
-- Row Level Security
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: users see their own
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (user_id = auth.uid());

-- User roles: admins manage all
CREATE POLICY "user_roles_select" ON public.user_roles FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "user_roles_insert" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "user_roles_delete" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Properties: admins full access, investors see their own
CREATE POLICY "properties_select" ON public.properties FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR owner_id = auth.uid());
CREATE POLICY "properties_insert" ON public.properties FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "properties_update" ON public.properties FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "properties_delete" ON public.properties FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Units: admins full access
CREATE POLICY "units_select" ON public.units FOR SELECT USING (true);
CREATE POLICY "units_insert" ON public.units FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "units_update" ON public.units FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Leases: tenants see their own, admins/investors see all
CREATE POLICY "leases_select" ON public.leases FOR SELECT USING (tenant_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'investor'));
CREATE POLICY "leases_insert" ON public.leases FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "leases_update" ON public.leases FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Payments: tenants see their own, admins see all
CREATE POLICY "payments_select" ON public.payments FOR SELECT USING (tenant_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'investor'));
CREATE POLICY "payments_insert" ON public.payments FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "payments_update" ON public.payments FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Maintenance: tenants see/create their own
CREATE POLICY "maintenance_select" ON public.maintenance_requests FOR SELECT USING (tenant_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "maintenance_insert" ON public.maintenance_requests FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "maintenance_update" ON public.maintenance_requests FOR UPDATE USING (tenant_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Documents
CREATE POLICY "documents_select" ON public.documents FOR SELECT USING (owner_id = auth.uid() OR uploaded_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "documents_insert" ON public.documents FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Investor reports
CREATE POLICY "reports_select" ON public.investor_reports FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'investor'));
CREATE POLICY "reports_insert" ON public.investor_reports FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Activity log
CREATE POLICY "activity_select" ON public.activity_log FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "activity_insert" ON public.activity_log FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Notifications
CREATE POLICY "notif_select_own" ON public.notifications FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "notif_insert" ON public.notifications FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "notif_update_own" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
