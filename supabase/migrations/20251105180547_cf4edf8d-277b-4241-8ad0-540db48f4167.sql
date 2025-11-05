-- Add name field to about_content for highlighted profile name
ALTER TABLE public.about_content 
ADD COLUMN IF NOT EXISTS name text;