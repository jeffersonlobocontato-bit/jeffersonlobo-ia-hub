-- Textos finais dos cases de "Ideias que viraram produtos" — só falta a foto,
-- que é enviada pelo painel admin (aba Cases).
UPDATE public.product_cases SET
  name = 'Politiza IA',
  category = 'Sala de guerra para campanhas',
  description = 'Plataforma de inteligência territorial para campanhas políticas: mapa geolocalizado de lideranças e ativos por município, gestão de equipe de campo em tempo real e alertas estratégicos gerados por IA — visão executiva única para quem decide.',
  tags = '["IA territorial","Mapas geolocalizados","Gestão de campo"]'::jsonb,
  image_alt = 'Print do painel Politiza IA — sala de guerra com mapa geolocalizado do Paraná'
WHERE name = 'politiza-ia';

UPDATE public.product_cases SET
  name = 'Juntos Paraná 399',
  category = 'Propostas e dados eleitorais com IA',
  description = 'Painel que cruza dados eleitorais públicos dos 399 municípios do Paraná com agentes de IA: biblioteca de propostas técnicas, políticas e institucionais, chat de análise para leitura de cenários e um gerador de plano de governo assistido por IA.',
  tags = '["Agentes de IA","Dados eleitorais","Gerador de plano"]'::jsonb,
  image_alt = 'Print do painel de gestão do Juntos Paraná 399'
WHERE name = 'juntosparana399';

UPDATE public.product_cases SET
  name = 'Zapvozes',
  category = 'CRM de imprensa e mensageria com IA',
  description = 'CRM de relacionamento com imprensa e disparo de mensagens: base de jornalistas, campanhas segmentadas por WhatsApp e e-mail, geração de releases assistida por IA e acompanhamento de saúde do número em tempo real.',
  tags = '["Conteúdo com IA","CRM de imprensa","Automação"]'::jsonb,
  image_alt = 'Print do dashboard do Zapvozes (connect-chat)'
WHERE name = 'connect-chat';

UPDATE public.product_cases SET
  name = 'Vozes Paranaenses',
  category = 'Portal de notícias com redação em IA',
  description = 'Portal de notícias regionais do Paraná com redação assistida por IA, indexação instantânea em buscadores (IndexNow) e segmentação automática por região — publicação e SEO/GEO no mesmo fluxo, do texto ao ar.',
  tags = '["Redação com IA","SEO/GEO","Editorial regional"]'::jsonb,
  image_alt = 'Print da homepage do portal Vozes Paranaenses'
WHERE name = 'vozesparanaenses';