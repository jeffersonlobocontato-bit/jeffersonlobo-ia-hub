DROP POLICY IF EXISTS "Public can view product case photos" ON storage.objects;

CREATE POLICY "Admins veem arquivos de product cases"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'product-cases' AND has_role(auth.uid(), 'admin'::app_role));