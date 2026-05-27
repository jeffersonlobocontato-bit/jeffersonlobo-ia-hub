
ALTER TABLE public.ia_maturity_recommendations
  ADD COLUMN IF NOT EXISTS acao_pf_30d text,
  ADD COLUMN IF NOT EXISTS acao_pf_60d text,
  ADD COLUMN IF NOT EXISTS acao_pf_90d text,
  ADD COLUMN IF NOT EXISTS acao_pj_30d text,
  ADD COLUMN IF NOT EXISTS acao_pj_60d text,
  ADD COLUMN IF NOT EXISTS acao_pj_90d text,
  ADD COLUMN IF NOT EXISTS aprendizado_pf jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS aprendizado_pj jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS por_que_importa text;
