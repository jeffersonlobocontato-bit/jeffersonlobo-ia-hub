
## Contexto

O blog já está completo:
- Tabela `blog_posts`, página `/blog`, página `/blog/:slug`, seção na home com últimos posts
- Admin com editor markdown, capa, SEO title/description, tags
- `Article` + `BreadcrumbList` JSON-LD em cada post; `Person` rico sitewide
- Sitemap dinâmico via `scripts/generate-sitemap.ts`, robots, OG/Twitter cards

Vamos focar apenas no que falta para **GEO** (indexação por ChatGPT, Perplexity, Gemini, Claude).

## O que vai mudar

### 1. Permitir explicitamente crawlers de IA (`public/robots.txt`)
Hoje o robots tem `Allow: /` genérico. LLMs usam User-Agents próprios que muitos sites bloqueiam por padrão — vamos liberar de forma explícita pra deixar claro que o conteúdo é indexável:

```
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: CCBot
Allow: /
```

### 2. Criar `public/llms.txt`
Padrão emergente (llmstxt.org) que LLMs leem para mapear o site. Arquivo estático no formato:

```
# Jefferson Lobo
> Palestrante, autor e consultor em IA aplicada a negócios, marketing e lideranças.

## Blog
- [Título do post](https://jeffersonlobo.tech/blog/slug): excerpt curto
- ...

## Páginas principais
- [Palestras](https://jeffersonlobo.tech/palestras): ...
- [Teste de Maturidade em IA](https://jeffersonlobo.tech/teste-ia): ...
```

Gerado dinamicamente pelo mesmo `scripts/generate-sitemap.ts` (já roda em `predev`/`prebuild`), puxando os posts ativos do Supabase.

### 3. TL;DR / Resumo executivo no topo de cada post (`BlogPost.tsx`)
LLMs priorizam o início do conteúdo. Vamos renderizar um bloco "TL;DR" visualmente destacado logo após o cabeçalho, alimentado pelo campo `excerpt` (já existe) ou pelo `subtitle`. Sem nova coluna no banco. HTML semântico (`<aside aria-label="Resumo">`) pra IA pegar fácil.

### 4. Sumário automático com âncoras (`BlogContent.tsx`)
Gerar índice (`<nav>` no início do post) com âncoras pros `<h2>`/`<h3>` do markdown. Ajuda LLMs a entender estrutura e aumenta dwell time. Pequeno componente `BlogTOC` calculado a partir do markdown.

### 5. JSON-LD: enriquecer `Article` (`BlogPost.tsx`)
Adicionar campos que LLMs valorizam:
- `wordCount` (calculado do markdown)
- `inLanguage: "pt-BR"`
- `isAccessibleForFree: true`
- `about` (array de Things com nome = tags principais)
- `speakable` (`SpeakableSpecification` apontando pro título e TL;DR) — sinal para assistentes de voz e LLMs

### 6. FAQ opcional por post (somente quando o admin preencher)
Adicionar coluna `faq jsonb` em `blog_posts` (array `[{q, a}]`). No admin, campo opcional. Quando preenchido:
- Renderiza seção `<section aria-label="Perguntas frequentes">` no final do post
- Injeta `FAQPage` JSON-LD adicional

Migration:
```sql
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS faq jsonb DEFAULT '[]'::jsonb;
```

### 7. Indexação do `/blog` (índice) — `BlogIndex.tsx`
Adicionar `CollectionPage` + `ItemList` JSON-LD listando todos os posts. Sinal claro pra LLMs de que `/blog` é o hub.

## O que NÃO vai mudar
- Visual da seção `BlogSection` na home (já está OK)
- Estrutura da página `/blog` e `/blog/:slug` (só adições pontuais)
- Admin (apenas + um campo opcional de FAQ)
- Sitemap, robots já existem — apenas estendidos
- Schema Person sitewide (já está rico)

## Arquivos afetados

```
public/robots.txt                         (editar — adicionar UAs de IA)
scripts/generate-sitemap.ts               (estender — gerar também llms.txt)
src/pages/BlogPost.tsx                    (TL;DR, Article enriquecido)
src/components/blog/BlogContent.tsx       (sumário com âncoras)
src/components/blog/BlogTOC.tsx           (novo)
src/components/blog/BlogFAQ.tsx           (novo, condicional)
src/pages/BlogIndex.tsx                   (CollectionPage JSON-LD)
src/components/admin/AdminBlogTab.tsx     (campo FAQ opcional)
supabase/migrations/<timestamp>_blog_faq.sql  (coluna faq jsonb)
```

## Resultado esperado
- LLMs (ChatGPT, Perplexity, Gemini, Claude) com permissão explícita e mapa do site (`llms.txt`)
- Cada post otimizado para "snippet de IA": TL;DR no topo, sumário, FAQ schema quando aplicável
- Article JSON-LD mais rico (wordCount, language, speakable, about)
- `/blog` reconhecido como hub editorial via CollectionPage

Sem mudanças visuais radicais — é otimização técnica.
