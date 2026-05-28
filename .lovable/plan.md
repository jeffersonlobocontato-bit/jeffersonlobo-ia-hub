## Objetivo
Saber de onde vêm os visitantes: tráfego direto, orgânico (Google), redes sociais (LinkedIn, Instagram), referência (outros sites) e campanhas pagas/marcadas com UTM.

## O que muda

### 1. Banco (`site_analytics`)
Adicionar colunas (migration):
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` (text, nullable)
- `referrer_domain` (text) — domínio limpo do referrer (ex.: `linkedin.com`)
- `traffic_source` (text) — canal classificado: `direct`, `organic`, `social`, `referral`, `paid`, `email`
- `landing_page` (text) — primeira página da sessão
- Índices em `traffic_source`, `utm_source`, `referrer_domain` e `created_at` para acelerar agregações.

### 2. Captura (`src/hooks/useAnalytics.ts`)
- Ler UTMs da URL no primeiro pageview da sessão e persistir em `sessionStorage` (atribuição "first touch" da sessão).
- Extrair domínio do `document.referrer`.
- Classificar `traffic_source`:
  - UTM presente → `paid` se `utm_medium` em (cpc, paid, ads) senão `utm_medium` (email/social/...)
  - Referrer de buscadores (google, bing, duckduckgo, yahoo) → `organic`
  - Referrer de social (linkedin, instagram, facebook, x/twitter, youtube, tiktok, whatsapp, t.co, lnkd.in) → `social`
  - Referrer interno (mesmo host) → ignorar (mantém origem da sessão)
  - Sem referrer → `direct`
  - Outros → `referral`
- Enviar esses campos no `insert` do `site_analytics`.

### 3. Admin (`src/components/admin/AdminAnalyticsTab.tsx`)
Nova seção "Origem do Tráfego":
- Cards com contagem por canal (direct/organic/social/referral/paid/email) no período selecionado.
- Tabela "Top referenciadores" (referrer_domain → sessões).
- Tabela "Campanhas UTM" (utm_source / utm_campaign → sessões).
- Filtro por intervalo de datas reaproveitando o que já existe na aba.

## Detalhes técnicos
- Migration aplica `ALTER TABLE` e `CREATE INDEX`; sem mexer em RLS/grants existentes.
- Classificação roda 100% no cliente — sem custo de edge function.
- Linhas antigas ficam com `traffic_source = null`; o dashboard ignora nulls ou mostra "desconhecido".
- Nenhum dado pessoal novo é coletado (só URL/referrer, igual ao que já é capturado).

## Fora de escopo
- Atribuição multi-touch entre sessões.
- Geolocalização por IP (requer edge function — posso fazer depois se quiser).
- Integração com GA4/GSC dentro do admin (o GSC já está conectado externamente).