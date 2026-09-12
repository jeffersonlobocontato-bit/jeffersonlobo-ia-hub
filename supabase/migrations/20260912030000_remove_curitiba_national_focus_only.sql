-- Remove a menção a Curitiba do subtítulo do Hero: o foco passa a ser
-- puramente "referência nacional", sem ancorar a marca numa cidade/estado.
-- Guardado pelo texto que você acabou de aplicar (migração anterior) — se
-- já foi editado de novo, este UPDATE não faz nada.

UPDATE public.hero_content
SET subtitle = 'Referência nacional em IA aplicada a negócios, liderança, produtividade, governança e transformação organizacional.'
WHERE subtitle ILIKE '%Baseado em Curitiba, Paraná%';
