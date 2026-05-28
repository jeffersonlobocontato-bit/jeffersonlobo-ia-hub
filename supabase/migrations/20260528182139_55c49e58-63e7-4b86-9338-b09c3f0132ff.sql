
-- press_contacts: base de imprensa importada da planilha
CREATE TABLE public.press_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  regiao text,
  focal text,
  municipio text,
  censo_ibge_2022 integer,
  veiculo text NOT NULL,
  meio text,
  contato text,
  cargo text,
  telefone text,
  whatsapp text,
  email text,
  endereco text,
  site text,
  tags text[] DEFAULT ARRAY[]::text[],
  opt_out boolean NOT NULL DEFAULT false,
  notas text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT press_contacts_has_channel CHECK (
    (email IS NOT NULL AND length(trim(email)) > 0)
    OR (whatsapp IS NOT NULL AND length(trim(whatsapp)) > 0)
  )
);

CREATE UNIQUE INDEX press_contacts_email_unique ON public.press_contacts (lower(email)) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX press_contacts_whatsapp_unique ON public.press_contacts (whatsapp) WHERE whatsapp IS NOT NULL;
CREATE INDEX press_contacts_regiao_idx ON public.press_contacts (regiao);
CREATE INDEX press_contacts_meio_idx ON public.press_contacts (meio);
CREATE INDEX press_contacts_municipio_idx ON public.press_contacts (municipio);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.press_contacts TO authenticated;
GRANT ALL ON public.press_contacts TO service_role;

ALTER TABLE public.press_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage press contacts"
  ON public.press_contacts FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_press_contacts_updated_at
  BEFORE UPDATE ON public.press_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- press_campaigns
CREATE TABLE public.press_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL CHECK (tipo IN ('email','whatsapp')),
  nome text NOT NULL,
  assunto text,
  corpo text NOT NULL,
  filtros jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho','em_envio','concluida','cancelada')),
  total_alvo integer NOT NULL DEFAULT 0,
  total_enviado integer NOT NULL DEFAULT 0,
  total_erro integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.press_campaigns TO authenticated;
GRANT ALL ON public.press_campaigns TO service_role;
ALTER TABLE public.press_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage press campaigns"
  ON public.press_campaigns FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER trg_press_campaigns_updated_at
  BEFORE UPDATE ON public.press_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- press_sends: log por destinatário por campanha
CREATE TABLE public.press_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.press_campaigns(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES public.press_contacts(id) ON DELETE CASCADE,
  canal text NOT NULL CHECK (canal IN ('email','whatsapp')),
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','enviado','erro','pulado')),
  message_id text,
  sent_at timestamptz,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, contact_id)
);

CREATE INDEX press_sends_campaign_idx ON public.press_sends (campaign_id);
CREATE INDEX press_sends_status_idx ON public.press_sends (status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.press_sends TO authenticated;
GRANT ALL ON public.press_sends TO service_role;
ALTER TABLE public.press_sends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage press sends"
  ON public.press_sends FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
