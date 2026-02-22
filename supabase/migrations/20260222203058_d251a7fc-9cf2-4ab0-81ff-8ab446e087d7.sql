
-- Drop old RLS policies that depend on user_id FIRST
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can upload documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can manage documents" ON public.documents;

-- Add new columns
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS owner_type text,
  ADD COLUMN IF NOT EXISTS owner_id uuid,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS visible_to_tenant boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS visible_to_investor boolean DEFAULT false;

-- Migrate existing data
UPDATE public.documents SET owner_type = 'tenant', owner_id = user_id WHERE owner_type IS NULL;

-- Drop old columns
ALTER TABLE public.documents
  DROP COLUMN IF EXISTS user_id,
  DROP COLUMN IF EXISTS lease_id,
  DROP COLUMN IF EXISTS document_type;

-- Make owner columns required
ALTER TABLE public.documents
  ALTER COLUMN owner_type SET NOT NULL,
  ALTER COLUMN owner_id SET NOT NULL;

-- New RLS for documents
CREATE POLICY "Admins can manage documents"
  ON public.documents FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Tenants can view own visible documents"
  ON public.documents FOR SELECT
  USING (owner_type = 'tenant' AND owner_id = auth.uid() AND visible_to_tenant = true);

CREATE POLICY "Investors can view own visible documents"
  ON public.documents FOR SELECT
  USING (owner_type = 'investor' AND owner_id = auth.uid() AND visible_to_investor = true);

CREATE POLICY "Users can upload own documents"
  ON public.documents FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

-- Add receipt_url to payments
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS receipt_url text;

-- Create receipts storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admins can manage receipts"
  ON storage.objects FOR ALL
  USING (bucket_id = 'receipts' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Tenants can view own receipts"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
