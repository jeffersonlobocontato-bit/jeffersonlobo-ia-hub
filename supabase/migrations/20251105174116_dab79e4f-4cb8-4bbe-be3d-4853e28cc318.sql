-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view profile images
CREATE POLICY "Profile images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'profile-images');

-- Allow admins to upload profile images
CREATE POLICY "Admins can upload profile images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'profile-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to update profile images
CREATE POLICY "Admins can update profile images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'profile-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to delete profile images
CREATE POLICY "Admins can delete profile images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'profile-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);