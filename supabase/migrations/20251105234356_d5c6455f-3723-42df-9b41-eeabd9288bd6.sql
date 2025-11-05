-- Add storage policies for profile-images bucket to restrict uploads to admins only

-- Only authenticated admins can upload profile images
CREATE POLICY "Only admins can upload profile images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-images' 
    AND has_role(auth.uid(), 'admin'::app_role)
  );

-- Only admins can update/replace images
CREATE POLICY "Only admins can update profile images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-images' 
    AND has_role(auth.uid(), 'admin'::app_role)
  );

-- Only admins can delete images
CREATE POLICY "Only admins can delete profile images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-images' 
    AND has_role(auth.uid(), 'admin'::app_role)
  );