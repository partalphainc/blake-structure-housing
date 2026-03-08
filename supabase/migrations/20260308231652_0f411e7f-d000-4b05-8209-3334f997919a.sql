
-- Create activity_log table
CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type text NOT NULL DEFAULT 'admin',
  actor_id uuid NOT NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read activity logs
CREATE POLICY "Admins can view activity logs"
  ON public.activity_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Authenticated users can insert activity logs
CREATE POLICY "Authenticated users can insert activity logs"
  ON public.activity_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = actor_id);

-- Admins can manage all activity logs
CREATE POLICY "Admins can manage activity logs"
  ON public.activity_log FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Storage RLS policies for all buckets
-- resident-documents bucket
CREATE POLICY "Users can upload own documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'resident-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'resident-documents' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin')
  ));

-- receipts bucket
CREATE POLICY "Users can upload receipts"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own receipts"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'receipts' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin')
  ));

-- maintenance-images bucket
CREATE POLICY "Users can upload maintenance images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'maintenance-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view maintenance images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'maintenance-images' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin')
  ));

-- lease-documents bucket
CREATE POLICY "Admins can upload lease documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'lease-documents' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view lease documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'lease-documents');

-- Admin full access to all storage
CREATE POLICY "Admins can manage all storage"
  ON storage.objects FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
