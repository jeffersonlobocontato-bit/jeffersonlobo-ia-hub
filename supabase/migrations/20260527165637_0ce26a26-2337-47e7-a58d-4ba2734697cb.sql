
INSERT INTO storage.buckets (id, name, public)
VALUES ('stage-photos', 'stage-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view stage photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'stage-photos');

CREATE POLICY "Admins can upload stage photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'stage-photos' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update stage photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'stage-photos' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete stage photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'stage-photos' AND has_role(auth.uid(), 'admin'));
