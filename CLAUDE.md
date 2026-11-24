# jeffersonlobo-ia-hub

Site pessoal, blog e hub de conteúdo de Jefferson Lobo (palestrante e consultor em IA). Gerenciado via [Lovable](https://lovable.dev) — mudanças no editor Lovable sincronizam direto com este repositório e vice-versa.

## Stack
- Vite + React + TypeScript + Tailwind + shadcn/ui
- Supabase (Postgres + Edge Functions + Auth) — ver `src/integrations/supabase/`
- Roteamento: `react-router-dom`, todas as rotas registradas em `src/App.tsx`

## O que existe aqui
- **Site institucional**: `Index.tsx`, `AboutSection`, `HeroSection` etc. — landing page pessoal
- **Blog**: `BlogIndex.tsx` / `BlogPost.tsx`, conteúdo puxado do Supabase (não é markdown estático)
- **Materiais**: `Materiais.tsx` / `MaterialDetalhe.tsx` — materiais complementares/downloads
- **Livro**: `LivroDel.tsx`
- **Páginas comerciais**: `ConsultoriaIA`, `PalestrasIA`, `PalestranteIA`, `PalestranteIAParana`, `WorkshopIA`
- **Teste de maturidade em IA**: `TesteIA.tsx` + `src/components/teste-ia/` — questionário com resultado, guardado em progresso via `localStorage` (ver `STORAGE_KEY` em `TesteIA.tsx`)
- **Claudia** (`/claudia`): painel de comando por voz (Web Speech API) — ver "Claudia" abaixo
- **Imprensa**: `Imprensa.tsx`, `PressReleaseOG.tsx`, `admin/PressCampaignKiosk.tsx` — sistema de disparo de press release com acompanhamento de campanha, e as edge functions `send-press-email`, `track-press-click`, `track-press-open`
- **Compartilhamento (prévias de WhatsApp/LinkedIn)**: redes não executam JS, então o link compartilhado é sempre um `.html` estático gerado no build por `scripts/generate-sitemap.ts`: blog em `/noticia/{slug}.html` (og:image = capa do post, lida de `public/` quando a capa é do próprio site) e podcast em `/episodio/{slug}.html` (og:image = card do episódio, desenhado pela edge function `podcast-card` e salvo em `public/og/`). Os botões usam `?v=` (versão pela data de atualização) para o WhatsApp não reaproveitar prévia antiga. Barra de botões única: `src/components/share/ShareBar.tsx`.
- **Podcast**: cada episódio tem página em `/podcast/:slug` (`PodcastEpisodio.tsx`) com player, compartilhar e a lista dos outros episódios para escolher o próximo. Slug, nome do canal ("O Código Lobo") e links ficam em `src/lib/podcast.ts`, usado pelo site e pelo build.
- **Admin** (`/admin`, protegido por `AdminRoute`): gestão de blog, materiais, briefings, analytics — ver `src/components/admin/`

## Claudia — painel de comando por voz (`/claudia`)
- `src/pages/Claudia.tsx` + `src/hooks/use-claudia-voice.ts` + `src/components/claudia/ClaudiaVisual.tsx`
- Ativação por voz via Web Speech API (só funciona em Chrome/Edge, precisa de HTTPS + permissão de microfone)
- **Cuidado ao mexer no hook de voz**: já tivemos um bug real de instâncias duplicadas de `SpeechRecognition` (o Chrome só permite uma sessão ativa por vez) — o `onend` e o callback de fala não podem os dois tentar reiniciar a escuta. Ver o comentário no topo de `startCommandRecognition` em `use-claudia-voice.ts` antes de alterar esse fluxo.
- Navegação disparada por comando de voz usa `window.location.assign` (mesma aba), nunca `window.open` — pop-up bloqueado pelo navegador porque o evento não vem de um clique real do usuário.
- Hoje os "comandos" só navegam para páginas que já existem no site — não aciona skills ou automações reais.

## Supabase
- 80+ migrations em `supabase/migrations/` — schema já é grande, sempre olhar migrations recentes antes de assumir estrutura de tabela
- **Linha editorial do blog**: o redator automático (`content-pipeline-fetch`, que gera o artigo autoral e a coluna Vozes que Importam) é "treinado" por `supabase/functions/_shared/linha-editorial.ts` — tese do Método Prova de Ganho (o DEL é peça dele, não tema central), público board/decisores, estilo de coluna de negócios, calibragem sobre o board brasileiro e a lista fechada de dados que podem ser citados. Mudanças de tese/dados vão lá, não nos prompts. A matéria aprovada por Jefferson que serve de régua fica em `_shared/materia-modelo.ts`, e `_shared/revisor-editorial.ts` aprova sozinho (status `approved`, vai ao ar às 10h) o rascunho que passar nas checagens objetivas (inclusive: todo número citado tem que existir nos fatos de referência ou nas notícias do dia) e na avaliação por IA com nota ≥ 8. O resto espera aprovação humana. Desligar a autopublicação: secret `BLOG_AUTOPUBLICACAO=off`.
- Edge functions relevantes: `content-pipeline-fetch`/`content-pipeline-publish` (pipeline de conteúdo), `chat-uivo-lobo` (chatbot do site), `sync-podcast-rss`, `publish-linkedin`, `video-ai-instrucoes`, sistema de e-mail transacional (`send-transactional-email`, `process-email-queue`, `handle-email-unsubscribe`/`handle-email-suppression`)

## Convenções
- Nunca commitar segredos — `.env` está no `.gitignore`, chaves do Supabase vêm de variáveis de ambiente
- `predev`/`prebuild` rodam `scripts/generate-sitemap.ts` — não editar `public/sitemap.xml`/`llms.txt` manualmente, eles são gerados
- Ao adicionar rota nova em `App.tsx`, sempre acima do catch-all `*` (comentário já existe no arquivo marcando o lugar)
- **Sem grade de fundo** (linhas/pontos em grade, inclusive em perspectiva) em nenhuma página nem capa — decisão do Jefferson (nov/2026): a grade entrega o padrão visual genérico de site feito por IA.
- **Capas do blog**: padrão do site — fundo petróleo liso, kicker IBM Plex Mono verde-água, título em Inter branco com o trecho-chave em verde-água (`--primary`), régua verde-água e assinatura cinza. Gerador único: `supabase/functions/_shared/branded-cover.ts` (o âmbar/Instrument Serif antigo saiu).
- Tema visual: paleta "editorial autoral" (papel/creme, tinta petróleo, âmbar como assinatura) definida em `src/index.css` — não é o preto/azul/roxo neon do briefing original do README, o design evoluiu

## Segundo cérebro — registro dos projetos pessoais

Este é o "hub": além de documentar este repositório, aqui fica o registro dos seus 5 projetos pessoais. Ao trabalhar em qualquer sessão do Claude Code, se o comando mencionar um desses apelidos, entre no repositório correspondente e leia o `CLAUDE.md` dele antes de agir.

| Apelido | Repositório | O que é |
|---|---|---|
| hub, site, portfólio | `jeffersonlobo-ia-hub` | Este projeto — site pessoal, blog, imprensa, Claudia |
| vozes, agência | `voz-agencia-premium` | Site institucional (landing page) da Agência de Inteligência Vozes — sem backend, conteúdo hardcoded |
| notícias, vozes paranaenses | `vozesparanaenses` | Portal de notícias do Paraná com pipeline de conteúdo por IA (raspagem → cluster → redação), mais Publieditorial e Vitrine Pessoal no mesmo app |
| insta, insights, conteúdo IA | `insta-insights-pro` | **Não é análise de Instagram** — é pipeline de geração de posts/carrosséis por IA a partir de notícias, com aprovação humana e publicação no LinkedIn |
| zapvozes, chat, disparo | `connect-chat` | **Não é chat 1:1** — é CRM/disparo de imprensa via WhatsApp+e-mail ("ZapVozes"), com base real de ~140 jornalistas já importada |

> Projetos que **não** são pessoais (produtos/clientes, ficam de fora deste registro): `politiza-ia` (produto, duplicado por cliente em `juntos-mato-grosso-142`/`juntosparana399`) e `vitrine-mkt-sistema-fiep` (já entregue ao cliente FIEP).

Para essa tabela valer em qualquer sessão local do Claude Code (não só quando você está literalmente dentro deste repositório), copie essa seção para o seu `~/.claude/CLAUDE.md` local.
