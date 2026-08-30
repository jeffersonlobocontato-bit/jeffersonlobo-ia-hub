-- O texto "Estrategista de IA para marketing e marca" na seção Sobre ficou
-- defasado em relação ao cargo atual, já alinhado em outros lugares do site
-- (header, footer, cartão de visita): "Head Executivo de Marketing".
-- Guardado por WHERE no valor antigo conhecido, pra não sobrescrever se o
-- título já tiver sido editado manualmente pra outra coisa nesse meio tempo.
UPDATE public.about_content
SET
  title = 'Head Executivo de Marketing e consultor em IA',
  description = REPLACE(description, 'Gerente Executivo de Marketing do Sistema Fiep', 'Head Executivo de Marketing do Sistema Fiep')
WHERE title = 'Estrategista de IA para marketing e marca';
