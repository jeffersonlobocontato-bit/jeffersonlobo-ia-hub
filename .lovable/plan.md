
# Plano: Blog SEO + Posts internos com foto, conteúdo em markdown e CTAs intercalados

## Objetivo
Transformar a seção de blog num motor de indexação (Google + crawlers de IA) e geração de leads, sem quebrar o fluxo atual de posts externos do LinkedIn.

---

## 1. Modelo de dados (migração)

Adicionar à tabela `blog_posts`:

- `slug` (text, unique) — URL amigável, gerada do título no admin (editável)
- `cover_image` (text) — URL da foto de capa (opcional)
- `cover_alt` (text) — texto alternativo da foto (SEO + acessibilidade)
- `content_md` (text) — corpo completo do post em **markdown** (opcional; quando preenchido, o post é "interno")
- `seo_title` (text, opcional) — sobrescreve `<title>` se quiser otimizar separado
- `seo_description` (text, opcional) — sobrescreve `<meta description>`
- `reading_minutes` (int, calculado) — tempo de leitura estimado
- `published_at` (timestamptz) — para `article:published_time`
- `tags` (text[]) — palavras-chave

Regra de tipo do post (computada no front):
- `content_md` preenchido → **post interno** (foto + título + 1º parágrafo + "Ler mais")
- `content_md` vazio + `linkedin_url` → **post externo** (formato atual; CTA LinkedIn)

Storage: criar bucket público `blog-covers` com policies de leitura pública e write apenas admin.

---

## 2. Admin (AdminBlogTab)

Campos novos no formulário:
- Upload de foto de capa (Supabase Storage) + campo `cover_alt`
- Campo `slug` (auto-sugerido do título, editável, com validação de unicidade e formato `[a-z0-9-]`)
- Editor de **markdown** (textarea grande com preview lado-a-lado, usando `react-markdown`)
- Tags (input separado por vírgula)
- SEO avançado (collapsible): `seo_title`, `seo_description`
- Switch: "Conteúdo completo no site" (se off, força usar `linkedin_url`)

Validação Zod no submit (título 10-120, slug único, excerpt ≤ 200, content_md ≤ 50k).

---

## 3. Listagem (`BlogSection` na home)

Manter card atual, mas:
- Mostrar foto de capa quando houver (topo do card, `aspect-video`, `loading="lazy"`, alt correto)
- Mostrar título + 1º parágrafo do `content_md` (extraído) OU `excerpt` se externo
- CTA do card:
  - Interno → "Ler artigo completo" → `/blog/:slug`
  - Externo → mantém "Veja no LinkedIn" atual

---

## 4. Página de artigo `/blog/:slug` (nova rota)

Estrutura:
1. **Header SEO**: `<Helmet>` com title/description, canonical, og:* (image = cover), `article:published_time`, `article:author`
2. **JSON-LD Article + BreadcrumbList** (Schema.org) inline
3. **Hero**: foto de capa + título H1 + meta (data, tempo de leitura, categoria, tags)
4. **Corpo markdown** renderizado com `react-markdown` + `remark-gfm`, headings semânticos (H2/H3), prose tipográfico
5. **CTAs intercalados** em pontos estratégicos do corpo (ver §5)
6. **Footer do artigo**: bio curta do autor, compartilhar (LinkedIn/WhatsApp/X), "Posts relacionados" (mesma categoria/tags)
7. **CTA final forte**: Teste de Maturidade IA

Adicionar rota em `src/App.tsx`: `<Route path="/blog/:slug" element={<BlogPost />} />`.

Adicionar `/blog` (index) opcional listando todos os posts para SEO/crawlers.

---

## 5. CTAs intercalados (componente `BlogInlineCTA`)

Regra de inserção automática: dividir o markdown por parágrafos e injetar CTAs em ~25%, 55% e 85% do total (mínimo 4 parágrafos entre cada). Sequência rotativa:
1. **Teste de Maturidade IA** (`/teste-ia`) — cor primary
2. **Solicitar palestra / proposta** (#contato) — cor secondary
3. **Livro / Podcast** (alternar) — cor accent
4. **Newsletter LinkedIn** (no rodapé do artigo, sempre)

Cada CTA é um card brutalista contextualizado ao tema do post (texto fixo por tipo, não depende do conteúdo).

Tracking: cada CTA chama `trackCTA('blog_inline_<tipo>', 'blog_post:<slug>')`.

---

## 6. SEO técnico

- **Dependência**: instalar `react-helmet-async`, `react-markdown`, `remark-gfm`
- Adicionar `<HelmetProvider>` em `main.tsx`
- Remover `<link rel="canonical">` estático do `index.html` (cada rota terá o seu via Helmet)
- Atualizar `scripts/generate-sitemap.ts` para **ler `blog_posts` do Supabase** e gerar uma URL por post (`/blog/:slug` com `lastmod = updated_at`). Roda no prebuild.
- Atualizar `public/robots.txt` e `public/llms.txt` para listar `/blog` como conteúdo indexável
- Atualizar `SEO.tsx` para aceitar `ogImage` por rota (já aceita), `ogType="article"` e `article:*` meta
- JSON-LD por post: `@type: "Article"` com `headline`, `image`, `datePublished`, `dateModified`, `author`, `publisher`, `mainEntityOfPage`
- JSON-LD `BreadcrumbList`: Home → Blog → Post
- Headings: garantir único `<h1>` (título do post); CTAs intercalados usam `<h3>`

---

## 7. Otimizações para crawlers de IA

- `content_md` é renderizado server-friendly (texto puro no HTML, sem dependência exclusiva de JS para conteúdo crítico)
- `public/llms.txt` atualizado listando posts com resumo
- Meta `description` rica, primeiro parágrafo informativo, tags como `<meta name="keywords">` (peso baixo, mas usado por alguns crawlers de IA)
- Tempo de leitura, autor, data visíveis no HTML

---

## 8. Hooks/queries

- `useBlogPosts()` (existente): adicionar novos campos no select
- `useBlogPost(slug)`: novo hook para buscar 1 post por slug com cache
- `useRelatedPosts(slug, category)`: 3 posts relacionados

---

## Detalhes técnicos

**Arquivos novos**
- `supabase/migrations/<ts>_blog_seo_fields.sql` — colunas, bucket, policies
- `src/pages/BlogPost.tsx`
- `src/pages/BlogIndex.tsx` (lista pública /blog)
- `src/components/blog/BlogInlineCTA.tsx`
- `src/components/blog/BlogContent.tsx` (markdown render + inserção de CTAs)
- `src/components/blog/CoverImageUploader.tsx` (admin)
- `src/components/blog/MarkdownEditor.tsx` (textarea + preview)
- `src/hooks/useBlogPost.ts`, `src/hooks/useRelatedPosts.ts`
- `src/lib/blog-utils.ts` (slugify, extractFirstParagraph, calcReadingTime, injectCTAs)

**Arquivos editados**
- `src/App.tsx` (rotas /blog e /blog/:slug)
- `src/main.tsx` (HelmetProvider)
- `src/components/BlogSection.tsx` (foto + CTA condicional)
- `src/components/admin/AdminBlogTab.tsx` (novos campos)
- `src/integrations/supabase/types.ts` (auto, após migração)
- `scripts/generate-sitemap.ts` (incluir posts)
- `index.html` (remover canonical estático)
- `public/llms.txt`, `public/robots.txt`

**Dependências novas**: `react-helmet-async`, `react-markdown`, `remark-gfm`

**Compatibilidade**: posts existentes (sem `content_md`) seguem funcionando como externos — comportamento atual preservado.
