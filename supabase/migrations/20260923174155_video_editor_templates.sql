-- Biblioteca de templates do Editor de Vídeo: o campo `template` deixa de
-- aceitar só 2 valores fixos e passa a aceitar qualquer id cadastrado na
-- biblioteca (src/types/videoEditor.ts -> TEMPLATE_LIBRARY). O catálogo de
-- templates vive no código (é apresentação, não dado do usuário); aqui só
-- relaxamos a trava pra caber o 3º template sem quebrar os 2 já existentes.
ALTER TABLE public.video_projects DROP CONSTRAINT video_projects_template_check;
ALTER TABLE public.video_projects ADD CONSTRAINT video_projects_template_check
  CHECK (template IN ('card_dados', 'fundo_dinamico', 'depoimento_estudio'));
