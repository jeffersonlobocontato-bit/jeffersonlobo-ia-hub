
INSERT INTO storage.buckets (id, name, public) VALUES ('speaking-logos', 'speaking-logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Speaking logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'speaking-logos');

CREATE POLICY "Admins can upload speaking logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'speaking-logos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update speaking logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'speaking-logos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete speaking logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'speaking-logos' AND has_role(auth.uid(), 'admin'::app_role));
