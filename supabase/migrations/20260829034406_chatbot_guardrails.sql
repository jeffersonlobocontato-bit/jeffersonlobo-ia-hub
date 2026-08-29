-- Fecha brechas na tabela chat_leads: as policies de INSERT/UPDATE com
-- USING/WITH CHECK (true) permitiam que qualquer pessoa com a anon key
-- gravasse ou alterasse leads direto via REST, sem passar pela edge
-- function (que já valida os dados com zod). A function grava com a
-- service role, que ignora RLS — então essas policies "anyone" nunca
-- foram necessárias para o app funcionar.
DROP POLICY IF EXISTS "Anyone can insert chat leads" ON public.chat_leads;
DROP POLICY IF EXISTS "Anyone can update chat leads" ON public.chat_leads;

-- Também não existia policy de DELETE — o botão de excluir lead no
-- AdminChatLeadsTab estava sem permissão pra funcionar.
CREATE POLICY "Admins can delete chat leads"
ON public.chat_leads FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Rate limiting básico para o chat-uivo-lobo: sem isso, um script podia
-- mandar mensagens sem limite e consumir os créditos do Lovable AI
-- Gateway. Guarda só um hash do IP (nunca o IP em texto puro) e uma
-- janela de 1 minuto.
CREATE TABLE public.chat_rate_limits (
  ip_hash TEXT PRIMARY KEY,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  count INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE public.chat_rate_limits ENABLE ROW LEVEL SECURITY;
-- Sem nenhuma policy pública: só a service role (que ignora RLS) toca
-- essa tabela, a partir da função abaixo e da edge function do chat.

CREATE OR REPLACE FUNCTION public.check_chat_rate_limit(_ip_hash TEXT, _max_per_minute INTEGER DEFAULT 15)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _count INTEGER;
BEGIN
  INSERT INTO public.chat_rate_limits (ip_hash, window_start, count)
  VALUES (_ip_hash, now(), 1)
  ON CONFLICT (ip_hash) DO UPDATE SET
    count = CASE
      WHEN chat_rate_limits.window_start < now() - interval '1 minute' THEN 1
      ELSE chat_rate_limits.count + 1
    END,
    window_start = CASE
      WHEN chat_rate_limits.window_start < now() - interval '1 minute' THEN now()
      ELSE chat_rate_limits.window_start
    END
  RETURNING count INTO _count;

  RETURN _count <= _max_per_minute;
END;
$$;
