-- Pagamento direto dos cursos pelo Mercado Pago (alternativa à Hotmart).
-- Cada clique em "comprar" vira um pedido; o Mercado Pago avisa o webhook e o
-- pedido muda de status. Pagamento aprovado libera o acesso em curso_acessos
-- (origem 'mercadopago'); reembolso, contestação ou cancelamento tiram só o
-- acesso que veio daquele pedido.

-- 1. curso_acessos aceita a nova origem e guarda o pedido que liberou o acesso.
ALTER TABLE public.curso_acessos DROP CONSTRAINT IF EXISTS curso_acessos_origem_check;
ALTER TABLE public.curso_acessos
  ADD CONSTRAINT curso_acessos_origem_check CHECK (origem IN ('hotmart', 'manual', 'mercadopago'));
ALTER TABLE public.curso_acessos ADD COLUMN IF NOT EXISTS pedido_id UUID;

-- 2. Pedidos. Quem grava é a edge function (service role); o admin lê.
CREATE TABLE public.curso_pedidos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_slug TEXT NOT NULL,
  email TEXT NOT NULL CHECK (email = lower(email)),
  nome TEXT,
  lote SMALLINT,
  valor NUMERIC(10, 2) NOT NULL CHECK (valor > 0),
  provedor TEXT NOT NULL DEFAULT 'mercadopago',
  status TEXT NOT NULL DEFAULT 'criado'
    CHECK (status IN ('criado', 'pendente', 'aprovado', 'recusado', 'cancelado', 'reembolsado', 'contestado', 'em_disputa')),
  preferencia_id TEXT,
  pagamento_id TEXT,
  forma_pagamento TEXT,
  parcelas SMALLINT,
  valor_pago NUMERIC(10, 2),
  aprovado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX curso_pedidos_email ON public.curso_pedidos (email, created_at DESC);
CREATE INDEX curso_pedidos_pagamento ON public.curso_pedidos (pagamento_id);

CREATE TRIGGER update_curso_pedidos_updated_at
  BEFORE UPDATE ON public.curso_pedidos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT ON public.curso_pedidos TO authenticated;
GRANT ALL ON public.curso_pedidos TO service_role;
ALTER TABLE public.curso_pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins veem os pedidos"
ON public.curso_pedidos FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Tudo o que chega do Mercado Pago, para auditoria.
CREATE TABLE public.pagamento_eventos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provedor TEXT NOT NULL DEFAULT 'mercadopago',
  tipo TEXT,
  recurso_id TEXT,
  pedido_id UUID,
  acao TEXT,
  erro TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX pagamento_eventos_recurso ON public.pagamento_eventos (recurso_id);

GRANT SELECT ON public.pagamento_eventos TO authenticated;
GRANT ALL ON public.pagamento_eventos TO service_role;
ALTER TABLE public.pagamento_eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins veem os eventos de pagamento"
ON public.pagamento_eventos FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. A página de obrigado consulta só o status, pelo id do pedido (um UUID que
--    só o comprador recebe), sem expor e-mail nem valores.
CREATE OR REPLACE FUNCTION public.status_pedido_curso(_id UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT status FROM public.curso_pedidos WHERE id = _id;
$$;

REVOKE ALL ON FUNCTION public.status_pedido_curso(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.status_pedido_curso(UUID) TO anon, authenticated;
