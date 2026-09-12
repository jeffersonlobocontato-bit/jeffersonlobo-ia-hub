-- Reposiciona o Hero da home para a entidade nacional (palestrante de IA no
-- Brasil, sede em Curitiba/PR), em vez do headline de missão genérico.
-- Guardado pelo texto anterior conhecido: se o headline já foi editado
-- manualmente desde então (ex.: pelo próprio Jefferson via painel), esta
-- migração não sobrescreve nada.

UPDATE public.hero_content
SET headline = 'Palestrante de Inteligência Artificial para empresas, líderes e eventos corporativos em todo o Brasil.',
    subtitle = 'Baseado em Curitiba, Paraná — atuação nacional em IA aplicada a negócios, liderança, produtividade, governança e transformação organizacional.'
WHERE headline ILIKE '%IA está redesenhando empresas, carreiras e profissões%';

UPDATE public.about_content
SET title = 'Palestrante de Inteligência Artificial e Head Executivo de Marketing'
WHERE title = 'Head Executivo de Marketing e consultor em IA';
