-- Remove textos de posicionamento desatualizados/contraditórios ligados a
-- "prompts" e "implementação de IA personalizada", em favor da categoria
-- atual: estratégia, agentes, produtividade, transformação e governança de IA.
-- Todos os UPDATEs são guardados por conteúdo antigo conhecido — se o texto
-- já foi alterado (ex.: via painel Lovable), a condição não casa e nada é
-- sobrescrito.

UPDATE public.hero_content
SET subtitle = 'Estratégia, agentes de IA e governança para lideranças e empresas que querem produtividade real — sem depender de prompts genéricos.'
WHERE subtitle ILIKE '%Diagnóstico, estratégia e implementação de Inteligência Artificial%';

UPDATE public.about_content
SET description = 'Head Executivo de Marketing do Sistema Fiep e defensor de uma tese proprietária: o marketing entrou na fase da orquestração de fluxos com IA — em vez de depender de prompts genéricos, marcas precisam construir agentes de IA com identidade própria. É nisso que ajudo lideranças, times de marketing e diretorias em todo o Brasil.'
WHERE description ILIKE '%Não implanto projetos%'
   OR description ILIKE '%implementação de soluções de IA personalizadas%'
   OR description ILIKE '%Diagnóstico, estratégia e implementação de Inteligência Artificial%';

UPDATE public.services
SET title = 'Consultoria em IA',
    description = 'Estratégia e governança de IA para lideranças: diagnóstico do momento da empresa e construção de agentes de IA com identidade própria — sem depender de prompts genéricos.'
WHERE description ILIKE '%implementação de soluções de IA personalizadas%'
   OR description ILIKE '%Não implanto projetos%';

UPDATE public.services
SET title = 'Workshops e Imersões em IA',
    description = 'Imersões práticas para times de marketing, comunicação e liderança sobre orquestração de fluxos com IA e produtividade real — não é curso de prompts.'
WHERE title ILIKE '%Capacitação%prompts%'
   OR description ILIKE '%Capacitação de equipes em prompts estratégicos%';

UPDATE public.services
SET description = 'Treinamentos práticos em estratégia, agentes de IA e transformação digital para times e lideranças.'
WHERE description ILIKE '%IA, machine learning%';
