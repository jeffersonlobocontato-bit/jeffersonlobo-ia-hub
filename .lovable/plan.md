## Objetivo

Permitir que cada campanha de WhatsApp tenha **título + mídia (foto/vídeo) + texto + link**, com o melhor equilíbrio entre profissionalismo, velocidade de envio e segurança anti-banimento.

## Estratégia escolhida (híbrida)

Combinar os dois caminhos mais eficientes:

1. **Mídia anexada manualmente** (foto ou vídeo) — você baixa 1 vez por campanha e arrasta no WhatsApp Web a cada envio (3-5s extras).
2. **Link com preview rico via Open Graph** — a página de destino renderiza meta tags dinâmicas, então o link sozinho já mostra imagem grande + título + descrição no WhatsApp, mesmo se você esquecer de anexar a mídia.

Resultado: você nunca depende só da mídia anexada (segurança), mas pode reforçar com vídeo/foto quando quiser (impacto).

## Escopo da implementação

### 1. Schema (migration)

Adicionar à tabela `press_campaigns`:
- `titulo` (text, vira primeira linha em negrito da mensagem)
- `media_url` (text, opcional — URL pública no bucket)
- `media_tipo` (text: `imagem` | `video` | `nenhum`, default `nenhum`)
- `link_destino` (text, opcional — URL principal para preview rico)
- `link_slug` (text, opcional — slug curto para a rota `/imprensa/r/:slug`)

Criar bucket público `press-media` com policies admin-only para INSERT/UPDATE/DELETE e SELECT público.

### 2. Wizard de campanha (`PressCampaignWizard.tsx`)

Nova etapa "Conteúdo da mensagem" com:
- Input **Título** (máx 80 chars, contador)
- Upload de **mídia** (drag-and-drop, valida tipo/tamanho: imagem ≤5MB JPG/PNG, vídeo ≤16MB MP4)
- Preview da mídia carregada com botão "Remover"
- Textarea **corpo** (já existe — adicionar contador 700 chars com aviso "vira 'Leia mais' acima")
- Input **link de destino** + botão "Validar preview" que chama edge function para conferir OG tags
- Painel lateral "**Preview no WhatsApp**" — bolha verde simulando como vai aparecer (mídia em cima, título negrito, corpo, card de link com OG)

### 3. UI do envio (`PressCampaignsTab.tsx`)

No card de cada contato:
- **Bloco de mídia fixo no topo da lista** (não por contato, é o mesmo para todos): thumbnail grande + nome do arquivo + botão **"Baixar mídia"** (1 clique baixa pro computador)
- Mensagem montada automaticamente: `*{titulo}*\n\n{corpo}\n\n{link_destino}`
- Botão **"Abrir WhatsApp"** abre `wa.me/{numero}?text={encoded}`
- Checkbox opcional **"Lembrar de anexar mídia"** (default ligado) — se marcado, mostra modal de confirmação rápida ao clicar Abrir
- Botão **"Marcar como enviado"** permanece igual

### 4. Página de destino com OG tags

Nova rota pública `/imprensa/r/:slug` (`src/pages/PressReleaseOG.tsx`):
- Busca a campanha pelo `link_slug` (RPC `get_press_release_og` SECURITY DEFINER, retorna só campos públicos)
- Renderiza meta tags `og:title`, `og:description`, `og:image`, `og:type=article` dinamicamente via `<Helmet>`
- Conteúdo visual mínimo: título, mídia, corpo formatado, botão "Falar com Jefferson" — útil para jornalista que clicar
- Tracker de clique (insert em `cta_events` com `cta_name=press_release_view`)

### 5. Edge function `validate-og-tags`

Recebe `{ url }`, faz fetch da URL, extrai OG tags com regex/cheerio, retorna `{ valid: boolean, og_title, og_image, og_description, missing: [] }`. Usada pelo botão "Validar preview" do wizard.

### 6. Documentação visual

Tooltip discreto "?" ao lado do bloco de mídia explicando:
- "Baixe a mídia 1x. A cada envio, arraste no WhatsApp Web depois que abrir. Se esquecer, o link já mostra preview rico com a mesma imagem."

## Arquivos a criar/editar

**Criar:**
- `supabase/migrations/{timestamp}_press_campaign_media.sql`
- `src/pages/PressReleaseOG.tsx`
- `supabase/functions/validate-og-tags/index.ts`
- `src/components/admin/press/CampaignMessagePreview.tsx` (preview WhatsApp)
- `src/components/admin/press/CampaignMediaUploader.tsx`

**Editar:**
- `src/components/admin/press/PressCampaignWizard.tsx` (nova etapa)
- `src/components/admin/press/PressCampaignsTab.tsx` (bloco mídia + mensagem montada)
- `src/App.tsx` (rota `/imprensa/r/:slug`)
- `src/lib/whatsapp-rhythm.ts` (sem mudanças — só consumir)

## Fora do escopo (deixar para depois)

- Variação A/B de título/corpo
- Múltiplas mídias por campanha (carrossel)
- Envio automatizado via API oficial WhatsApp Business
- Tracking de clique no link via redirecionador (`/r/:slug` → `link_destino` com log) — pode entrar na próxima onda

## Riscos e mitigações

- **Mídia idêntica em 100+ envios consecutivos** → ritmo já implementado (cooldown 25-45s + pausa 5min) protege.
- **Vídeo pesado eleva risco** → validador limita a 16MB e sugere imagem para listas >50 contatos.
- **Esquecer de anexar mídia** → OG tags no link garantem visual rico mesmo sem anexo.
- **Bucket público com mídia sensível** → mídia de release de imprensa é por natureza pública, então OK.
