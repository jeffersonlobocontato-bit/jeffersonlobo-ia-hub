ALTER TABLE public.palestra_formats ADD COLUMN IF NOT EXISTS image_position TEXT DEFAULT 'center';
ALTER TABLE public.stage_photos ADD COLUMN IF NOT EXISTS image_position TEXT DEFAULT 'center';