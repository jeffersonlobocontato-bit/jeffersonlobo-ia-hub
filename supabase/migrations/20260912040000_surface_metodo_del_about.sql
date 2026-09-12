-- Nomeia o Método DEL na descrição da seção "Sobre" da home, em vez de
-- deixar a tese proprietária sem nome/metodologia associada. Guardado pelo
-- texto anterior conhecido — se já foi editado desde então, não faz nada.

UPDATE public.about_content
SET description = 'Head Executivo de Marketing do Sistema Fiep e defensor de uma tese proprietária: o marketing entrou na fase da orquestração de fluxos com IA — em vez de depender de prompts genéricos, marcas precisam construir agentes de IA com identidade própria. É nisso que ajudo lideranças, times de marketing e diretorias em todo o Brasil.

Essa tese tem nome e metodologia: o Método DEL (Decomposição de Estrutura de Linguagem) — framework proprietário para treinar agentes de IA com fidelidade sintática, semântica e lexical à voz da marca, detalhado no livro "O código invisível dos superagentes de inteligência artificial".'
WHERE description = 'Head Executivo de Marketing do Sistema Fiep e defensor de uma tese proprietária: o marketing entrou na fase da orquestração de fluxos com IA — em vez de depender de prompts genéricos, marcas precisam construir agentes de IA com identidade própria. É nisso que ajudo lideranças, times de marketing e diretorias em todo o Brasil.';
