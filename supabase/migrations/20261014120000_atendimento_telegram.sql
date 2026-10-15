-- Atendimento no Telegram (@JeffersonLoboBot), pela função telegram-atendimento.
--
-- 1. atendimento_conversas: uma por chat do Telegram. `modo` diz quem
--    responde: 'bot' (o assistente) ou 'humano' (o Jefferson assumiu e o
--    assistente fica quieto até o /encerrar).
-- 2. atendimento_mensagens: o histórico. `admin_message_id` é o id da cópia
--    da mensagem no chat do Jefferson: quando ele responde a essa cópia, a
--    função sabe para qual cliente mandar.
-- 3. atendimento_updates: os update_id já tratados, porque o Telegram reenvia
--    o mesmo update se a função demorar ou falhar.
--
-- Só a função (service_role) grava; o admin do site pode ler. Idempotente.

CREATE TABLE IF NOT EXISTS public.atendimento_conversas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id BIGINT NOT NULL UNIQUE,
  nome TEXT,
  usuario TEXT,
  origem TEXT,
  modo TEXT NOT NULL DEFAULT 'bot' CHECK (modo IN ('bot', 'humano')),
  motivo_humano TEXT,
  humano_desde TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS atendimento_conversas_modo_idx ON public.atendimento_conversas (modo, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.atendimento_mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversa_id UUID NOT NULL REFERENCES public.atendimento_conversas (id) ON DELETE CASCADE,
  papel TEXT NOT NULL CHECK (papel IN ('cliente', 'bot', 'humano', 'sistema')),
  texto TEXT NOT NULL,
  admin_message_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS atendimento_mensagens_conversa_idx ON public.atendimento_mensagens (conversa_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS atendimento_mensagens_admin_msg_idx ON public.atendimento_mensagens (admin_message_id) WHERE admin_message_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.atendimento_updates (
  update_id BIGINT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.atendimento_conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atendimento_mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atendimento_updates ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.atendimento_conversas, public.atendimento_mensagens, public.atendimento_updates FROM anon;
REVOKE ALL ON public.atendimento_updates FROM authenticated;
GRANT SELECT ON public.atendimento_conversas, public.atendimento_mensagens TO authenticated;
GRANT ALL ON public.atendimento_conversas, public.atendimento_mensagens, public.atendimento_updates TO service_role;

DROP POLICY IF EXISTS "Admins leem as conversas do atendimento" ON public.atendimento_conversas;
CREATE POLICY "Admins leem as conversas do atendimento"
ON public.atendimento_conversas FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins leem as mensagens do atendimento" ON public.atendimento_mensagens;
CREATE POLICY "Admins leem as mensagens do atendimento"
ON public.atendimento_mensagens FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
