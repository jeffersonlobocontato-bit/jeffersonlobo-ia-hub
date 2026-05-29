CREATE TABLE public.press_email_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  send_id uuid NOT NULL REFERENCES public.press_sends(id) ON DELETE CASCADE,
  url text NOT NULL,
  clicked_at timestamptz NOT NULL DEFAULT now(),
  user_agent text,
  ip_hash text
);

CREATE INDEX idx_press_email_clicks_send ON public.press_email_clicks(send_id);
CREATE INDEX idx_press_email_clicks_clicked_at ON public.press_email_clicks(clicked_at DESC);

GRANT SELECT ON public.press_email_clicks TO authenticated;
GRANT ALL ON public.press_email_clicks TO service_role;

ALTER TABLE public.press_email_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view clicks"
  ON public.press_email_clicks FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));