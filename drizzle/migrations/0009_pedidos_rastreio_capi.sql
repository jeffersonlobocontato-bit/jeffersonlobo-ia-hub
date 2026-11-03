ALTER TABLE public.curso_pedidos
  ADD COLUMN IF NOT EXISTS rastreio jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS capi_enviado_em timestamptz,
  ADD COLUMN IF NOT EXISTS capi_resultado text;

CREATE OR REPLACE FUNCTION public.valor_pedido_curso(_id UUID)
RETURNS NUMERIC
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT valor FROM public.curso_pedidos WHERE id = _id AND status = 'aprovado';
$$;
REVOKE ALL ON FUNCTION public.valor_pedido_curso(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.valor_pedido_curso(UUID) TO anon, authenticated;