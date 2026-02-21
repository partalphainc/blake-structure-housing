
-- Roles
CREATE TYPE public.app_role AS ENUM ('resident', 'investor', 'admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name) VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Properties
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT, state TEXT, zip TEXT,
  total_units INTEGER DEFAULT 1,
  property_type TEXT DEFAULT 'residential',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Units
CREATE TABLE public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  unit_name TEXT NOT NULL,
  unit_type TEXT DEFAULT 'private_room',
  rate_weekly NUMERIC, rate_monthly NUMERIC, deposit NUMERIC,
  status TEXT DEFAULT 'available',
  amenities TEXT[],
  utilities_included BOOLEAN DEFAULT true,
  is_furnished BOOLEAN DEFAULT false,
  insurance_eligible BOOLEAN DEFAULT false,
  minimum_stay TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Leases
CREATE TABLE public.leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  rent_amount NUMERIC NOT NULL,
  payment_frequency TEXT DEFAULT 'monthly',
  status TEXT DEFAULT 'active',
  document_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id UUID REFERENCES public.leases(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  payment_method TEXT,
  status TEXT DEFAULT 'recorded',
  notes TEXT,
  recorded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Maintenance Requests
CREATE TABLE public.maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  unit_id UUID REFERENCES public.units(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'submitted',
  image_urls TEXT[],
  admin_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Documents
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lease_id UUID REFERENCES public.leases(id) ON DELETE SET NULL,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Investor Reports
CREATE TABLE public.investor_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  report_month DATE NOT NULL,
  total_revenue NUMERIC DEFAULT 0,
  total_expenses NUMERIC DEFAULT 0,
  occupancy_rate NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can view own properties" ON public.properties FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Owners can insert properties" ON public.properties FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own properties" ON public.properties FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Admins can view all properties" ON public.properties FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners can view units" ON public.units FOR SELECT USING (EXISTS (SELECT 1 FROM public.properties WHERE id = property_id AND owner_id = auth.uid()));
CREATE POLICY "Residents can view assigned unit" ON public.units FOR SELECT USING (EXISTS (SELECT 1 FROM public.leases WHERE unit_id = units.id AND tenant_id = auth.uid() AND status = 'active'));
CREATE POLICY "Admins can manage units" ON public.units FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Tenants can view own leases" ON public.leases FOR SELECT USING (auth.uid() = tenant_id);
CREATE POLICY "Owners can view leases" ON public.leases FOR SELECT USING (EXISTS (SELECT 1 FROM public.units u JOIN public.properties p ON u.property_id = p.id WHERE u.id = unit_id AND p.owner_id = auth.uid()));
CREATE POLICY "Admins can manage leases" ON public.leases FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Tenants can view own payments" ON public.payments FOR SELECT USING (auth.uid() = tenant_id);
CREATE POLICY "Owners can view payments" ON public.payments FOR SELECT USING (EXISTS (SELECT 1 FROM public.leases l JOIN public.units u ON l.unit_id = u.id JOIN public.properties p ON u.property_id = p.id WHERE l.id = lease_id AND p.owner_id = auth.uid()));
CREATE POLICY "Admins can manage payments" ON public.payments FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Tenants can view own requests" ON public.maintenance_requests FOR SELECT USING (auth.uid() = tenant_id);
CREATE POLICY "Tenants can create requests" ON public.maintenance_requests FOR INSERT WITH CHECK (auth.uid() = tenant_id);
CREATE POLICY "Tenants can update own requests" ON public.maintenance_requests FOR UPDATE USING (auth.uid() = tenant_id);
CREATE POLICY "Owners can view requests" ON public.maintenance_requests FOR SELECT USING (EXISTS (SELECT 1 FROM public.units u JOIN public.properties p ON u.property_id = p.id WHERE u.id = unit_id AND p.owner_id = auth.uid()));
CREATE POLICY "Admins can manage requests" ON public.maintenance_requests FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own documents" ON public.documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upload documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() = uploaded_by);
CREATE POLICY "Admins can manage documents" ON public.documents FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners can view own reports" ON public.investor_reports FOR SELECT USING (EXISTS (SELECT 1 FROM public.properties WHERE id = property_id AND owner_id = auth.uid()));
CREATE POLICY "Admins can manage reports" ON public.investor_reports FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('resident-documents', 'resident-documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('lease-documents', 'lease-documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('maintenance-images', 'maintenance-images', false);

CREATE POLICY "Upload own resident docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resident-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "View own resident docs" ON storage.objects FOR SELECT USING (bucket_id = 'resident-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "View own lease docs" ON storage.objects FOR SELECT USING (bucket_id = 'lease-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Upload maintenance images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'maintenance-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "View own maintenance images" ON storage.objects FOR SELECT USING (bucket_id = 'maintenance-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_profiles_ts BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_properties_ts BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_leases_ts BEFORE UPDATE ON public.leases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_maintenance_ts BEFORE UPDATE ON public.maintenance_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
