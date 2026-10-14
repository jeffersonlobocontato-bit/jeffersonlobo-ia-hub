-- Notas a emitir (NFS-e) das vendas da Academia.
--
-- Enquanto a emissão é manual no Emissor Nacional (gov.br/nfse), o painel
-- mostra cada venda aprovada com os dados prontos para copiar (CPF, nome,
-- valor, descrição) e o admin marca a nota como emitida, com o número.
--
-- 1. curso_pedidos ganha:
--    - comprador_doc / comprador_nome: CPF (ou CNPJ) e nome do pagador, como o
--      Mercado Pago informa no pagamento (gravados pelo webhook);
--    - nf_status: pendente | emitida | cancelar | cancelada | dispensada;
--    - nf_numero, nf_observacao, nf_atualizada_em.
-- 2. Gatilho: venda aprovada vira "pendente"; reembolso ou contestação de uma
--    venda com nota emitida vira "cancelar"; reembolso antes da emissão vira
--    "dispensada" (o admin pode mudar).
-- 3. atualizar_nota_pedido(): só admin; marca o status, o número e corrige o
--    CPF/nome quando o Mercado Pago não informou.
-- Idempotente.

ALTER TABLE public.curso_pedidos
  ADD COLUMN IF NOT EXISTS comprador_doc TEXT,
  ADD COLUMN IF NOT EXISTS comprador_nome TEXT,
  ADD COLUMN IF NOT EXISTS nf_status TEXT,
  ADD COLUMN IF NOT EXISTS nf_numero TEXT,
  ADD COLUMN IF NOT EXISTS nf_observacao TEXT,
  ADD COLUMN IF NOT EXISTS nf_atualizada_em TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'curso_pedidos_comprador_doc_check') THEN
    ALTER TABLE public.curso_pedidos ADD CONSTRAINT curso_pedidos_comprador_doc_check
      CHECK (comprador_doc IS NULL OR comprador_doc ~ '^([0-9]{11}|[0-9]{14})$');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'curso_pedidos_nf_status_check') THEN
    ALTER TABLE public.curso_pedidos ADD CONSTRAINT curso_pedidos_nf_status_check
      CHECK (nf_status IS NULL OR nf_status IN ('pendente', 'emitida', 'cancelar', 'cancelada', 'dispensada'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS curso_pedidos_nf_status ON public.curso_pedidos (nf_status, created_at)
  WHERE nf_status IN ('pendente', 'cancelar');

-- 2. gatilho
CREATE OR REPLACE FUNCTION public.curso_pedidos_nota()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'aprovado' AND NEW.nf_status IS NULL THEN
    NEW.nf_status := 'pendente';
    NEW.nf_atualizada_em := now();
  ELSIF TG_OP = 'UPDATE'
    AND NEW.status IN ('reembolsado', 'contestado', 'cancelado')
    AND OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.nf_status = 'emitida' THEN
      NEW.nf_status := 'cancelar';
      NEW.nf_atualizada_em := now();
    ELSIF NEW.nf_status = 'pendente' THEN
      NEW.nf_status := 'dispensada';
      NEW.nf_observacao := coalesce(NEW.nf_observacao, 'Reembolsado antes da emissão da nota.');
      NEW.nf_atualizada_em := now();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS curso_pedidos_nota ON public.curso_pedidos;
CREATE TRIGGER curso_pedidos_nota
  BEFORE INSERT OR UPDATE OF status ON public.curso_pedidos
  FOR EACH ROW EXECUTE FUNCTION public.curso_pedidos_nota();

-- vendas aprovadas antes desta migração também entram na lista
UPDATE public.curso_pedidos
SET nf_status = 'pendente', nf_atualizada_em = now()
WHERE status = 'aprovado' AND nf_status IS NULL;

-- 3. ação do admin
CREATE OR REPLACE FUNCTION public.atualizar_nota_pedido(
  p_pedido UUID,
  p_status TEXT,
  p_numero TEXT DEFAULT NULL,
  p_observacao TEXT DEFAULT NULL,
  p_doc TEXT DEFAULT NULL,
  p_nome TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_doc TEXT := nullif(regexp_replace(coalesce(p_doc, ''), '[^0-9]', '', 'g'), '');
  v_numero TEXT := nullif(left(btrim(coalesce(p_numero, '')), 60), '');
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'sem_permissao';
  END IF;
  IF p_status NOT IN ('pendente', 'emitida', 'cancelar', 'cancelada', 'dispensada') THEN
    RAISE EXCEPTION 'status_invalido';
  END IF;
  IF v_doc IS NOT NULL AND length(v_doc) NOT IN (11, 14) THEN
    RAISE EXCEPTION 'documento_invalido';
  END IF;
  IF p_status = 'emitida' AND v_numero IS NULL
     AND NOT EXISTS (SELECT 1 FROM curso_pedidos WHERE id = p_pedido AND nf_numero IS NOT NULL) THEN
    RAISE EXCEPTION 'numero_obrigatorio';
  END IF;

  UPDATE curso_pedidos
  SET nf_status = p_status,
      nf_numero = coalesce(v_numero, nf_numero),
      nf_observacao = coalesce(nullif(left(btrim(coalesce(p_observacao, '')), 300), ''), nf_observacao),
      comprador_doc = coalesce(v_doc, comprador_doc),
      comprador_nome = coalesce(nullif(left(btrim(coalesce(p_nome, '')), 120), ''), comprador_nome),
      nf_atualizada_em = now()
  WHERE id = p_pedido;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'pedido_nao_encontrado';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.atualizar_nota_pedido(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.atualizar_nota_pedido(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.atualizar_nota_pedido(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
