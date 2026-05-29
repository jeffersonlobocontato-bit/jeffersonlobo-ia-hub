# Dashboard de Campanhas de Imprensa

## O que vai aparecer

### 1. Visão geral (cards no topo)
- Total de campanhas, e-mails enviados, taxa média de abertura, total de aberturas únicas, taxa de erro.
- Filtro por período (7/30/90 dias / tudo).

### 2. Lista de campanhas
Tabela: nome, canal, data, alvo, enviados, erros, **aberturas únicas**, **total de aberturas**, **taxa de abertura %**. Clicar abre o detalhe.

### 3. Detalhe da campanha
- Métricas: enviados, erros, pulados, aberturas únicas, reaberturas, taxa de abertura.
- Tabela de destinatários: veículo, contato, email, **município, região, meio (segmento)**, status, nº de aberturas, primeira/última abertura.
- Filtros: status, **região**, **segmento (meio)**, só quem abriu / só quem não abriu.
- Exportar CSV.

### 4. Análise por segmento e região (novo bloco)
Dois gráficos/tabelas lado a lado, filtráveis por campanha ou geral:
- **Por segmento (`meio`)** — ex.: jornal, portal, rádio, TV, blog: enviados, aberturas únicas, taxa de abertura, ranking.
- **Por região** — Norte/Nordeste/Centro-Oeste/Sudeste/Sul: enviados, aberturas únicas, taxa de abertura.
- Drill-down: clicar em uma região mostra breakdown por **município** (top 20).
- Cruzamento segmento × região (heatmap simples / tabela pivot) mostrando taxa de abertura em cada célula — identifica onde a mensagem ressoa mais.

### 5. Ranking de leitores (cross-campanhas)
Top contatos por total de aberturas, nº de campanhas em que abriu, última abertura. Cada linha mostra veículo, segmento e região para contexto.

### 6. Histórico por contato
Modal ao clicar em um contato: todas as campanhas recebidas, status, quantas vezes abriu, quando.

---

## Tracking de abertura

Hoje só registramos envio/erro. Para saber quem abriu e quantas vezes, padrão de mercado é pixel de rastreio.

**Fluxo:**
1. Nova tabela `press_email_opens` (send_id, opened_at, user_agent, ip_hash).
2. Edge function pública `track-press-open?s=<send_id>` insere uma linha e retorna GIF 1x1.
3. `wrapHtml` injeta `<img src="…/track-press-open?s=<send_id>" width="1" height="1">` no final do e-mail.
4. Aberturas únicas = distinct send_id; reaberturas = count > 1.

**Limitações que deixo claras na UI:**
- Clientes que bloqueiam imagens não contam.
- Apple Mail Privacy Protection pré-carrega imagens — vai inflar aberturas. Tooltip "aberturas estimadas".

---

## Detalhes técnicos

**Migração:**
- `CREATE TABLE public.press_email_opens (id uuid pk, send_id uuid not null references press_sends(id) on delete cascade, opened_at timestamptz default now(), user_agent text, ip_hash text)` + index em `send_id` + GRANTs + RLS (admin SELECT, service_role ALL INSERT).
- View `press_campaign_stats` por campaign_id: enviados, erros, aberturas_unicas, aberturas_totais.
- View `press_segment_stats` agregando `press_sends` × `press_contacts` × opens por **(campaign_id, meio)**: enviados, aberturas_unicas, taxa.
- View `press_region_stats` idem por **(campaign_id, regiao)** e secundária por **(campaign_id, regiao, municipio)**.
- View `press_contact_engagement` por contact_id: total_recebidos, total_aberturas, campanhas_abertas, ultima_abertura.

**Edge function nova `track-press-open`:**
- `verify_jwt = false`, sem CORS, retorna GIF 1x1 com cache-control no-store, insere via service role.

**Edge function `send-press-email`:**
- Pre-insert em `press_sends` com status `pendente` para ter `send_id`, depois envia e atualiza com `enviado/erro`.
- `wrapHtml(body, contact, send_id)` injeta o pixel.

**Frontend novo:** `src/components/admin/press/PressCampaignDashboard.tsx`
- Nova aba "Dashboard" em `AdminPressTab.tsx`.
- Cards + tabela de campanhas + modal detalhe + bloco segmento/região (com seletor "todas campanhas" ou específica) + ranking + modal histórico do contato.
- Visual brutalista preto/amarelo, sem pastéis. Tabelas pivot simples (sem libs pesadas) — heatmap via classes de opacidade do amarelo.

**Não mexo em:** wizard, histórico de disparos atual, anti-duplicação, throttle.

---

## Entrega
1. Migration (tabela opens + 4 views + grants + RLS).
2. Edge function `track-press-open`.
3. Update em `send-press-email/index.ts` (pre-insert + pixel).
4. `PressCampaignDashboard.tsx` + nova aba no `AdminPressTab.tsx`.

Posso seguir?
