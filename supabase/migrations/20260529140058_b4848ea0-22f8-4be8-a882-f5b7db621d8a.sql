ALTER TABLE public.press_campaigns ADD COLUMN IF NOT EXISTS release_group text;

CREATE INDEX IF NOT EXISTS idx_press_campaigns_release_group
  ON public.press_campaigns(release_group) WHERE release_group IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_press_sends_contact_canal_status
  ON public.press_sends(contact_id, canal, status)
  WHERE status = 'enviado';