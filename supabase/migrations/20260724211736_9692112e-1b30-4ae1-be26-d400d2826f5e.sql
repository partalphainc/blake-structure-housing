
-- 1) Fix lease-documents storage: remove public authenticated view policy
DROP POLICY IF EXISTS "Authenticated users can view lease documents" ON storage.objects;

-- Ensure admins can view/manage lease documents (Admins can manage all storage already covers it, but be explicit)
CREATE POLICY "Admins can view lease documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'lease-documents' AND public.has_role(auth.uid(), 'admin'));

-- 2) UPDATE / DELETE restrictions so users only modify their own files
-- resident-documents
CREATE POLICY "Users can update own resident docs"
ON storage.objects FOR UPDATE
USING (bucket_id = 'resident-documents' AND (storage.foldername(name))[1] = (auth.uid())::text)
WITH CHECK (bucket_id = 'resident-documents' AND (storage.foldername(name))[1] = (auth.uid())::text);

CREATE POLICY "Users can delete own resident docs"
ON storage.objects FOR DELETE
USING (bucket_id = 'resident-documents' AND ((storage.foldername(name))[1] = (auth.uid())::text OR public.has_role(auth.uid(), 'admin')));

-- maintenance-images
CREATE POLICY "Users can update own maintenance images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'maintenance-images' AND (storage.foldername(name))[1] = (auth.uid())::text)
WITH CHECK (bucket_id = 'maintenance-images' AND (storage.foldername(name))[1] = (auth.uid())::text);

CREATE POLICY "Users can delete own maintenance images"
ON storage.objects FOR DELETE
USING (bucket_id = 'maintenance-images' AND ((storage.foldername(name))[1] = (auth.uid())::text OR public.has_role(auth.uid(), 'admin')));

-- receipts
CREATE POLICY "Users can update own receipts"
ON storage.objects FOR UPDATE
USING (bucket_id = 'receipts' AND (storage.foldername(name))[1] = (auth.uid())::text)
WITH CHECK (bucket_id = 'receipts' AND (storage.foldername(name))[1] = (auth.uid())::text);

CREATE POLICY "Users can delete own receipts"
ON storage.objects FOR DELETE
USING (bucket_id = 'receipts' AND ((storage.foldername(name))[1] = (auth.uid())::text OR public.has_role(auth.uid(), 'admin')));

-- lease-documents: owner (by folder) + admin only
CREATE POLICY "Users can delete own lease docs"
ON storage.objects FOR DELETE
USING (bucket_id = 'lease-documents' AND ((storage.foldername(name))[1] = (auth.uid())::text OR public.has_role(auth.uid(), 'admin')));

-- 3) Restrict SECURITY DEFINER function execution
-- Trigger-only functions: revoke from everyone but owner/postgres
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user_role() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at() FROM PUBLIC, anon, authenticated;

-- RLS helpers: revoke from anon and public (RLS invokes as caller role; authenticated needs EXECUTE)
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

REVOKE ALL ON FUNCTION public.is_owner_of_property(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_owner_of_property(uuid, uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.is_tenant_of_unit(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_tenant_of_unit(uuid, uuid) TO authenticated;
