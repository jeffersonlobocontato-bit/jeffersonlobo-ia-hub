// Gera e commita (via GitHub Contents API) o arquivo estático
// public/noticia/{slug}.html pra cada post publicado — a mesma prévia rica
// que já existia pra alguns posts antigos, feitos à mão, agora automática.
//
// Por quê isso existe: WhatsApp/LinkedIn/Facebook não executam JS, então não
// veem as tags que o react-helmet-async injeta na rota /blog/:slug (SPA). A
// função supabase/functions/blog-share cobre isso pra qualquer post sem
// precisar de rebuild, mas devolve uma URL de domínio supabase.co, não do
// site — pouco profissional pra compartilhar. Este helper resolve isso
// commitando um .html real dentro do próprio domínio, disparando o rebuild
// automático do site (Lovable rebuilda a cada push no GitHub).
//
// Precisa do secret GITHUB_TOKEN no projeto: um Personal Access Token
// (classic ou fine-grained) com permissão de escrita (contents:write)
// só no repositório jeffersonlobocontato-bit/jeffersonlobo-ia-hub.
import { commitFile } from './github-commit.ts';

const SITE_URL = 'https://jeffersonlobo.tech';

interface NoticiaPost {
  slug: string;
  title: string;
  excerpt?: string | null;
  seo_description?: string | null;
  subtitle?: string | null;
  cover_image?: string | null;
  cover_alt?: string | null;
  author_kind?: string | null;
}

function escapeHtml(s: string): string {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildNoticiaHtml(post: NoticiaPost): string {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const shareUrl = `${SITE_URL}/noticia/${post.slug}.html`;
  const title = escapeHtml(post.title);
  const description = escapeHtml(post.seo_description || post.subtitle || post.excerpt || '');
  const image = post.cover_image || `${SITE_URL}/og-default.png`;
  const imageAlt = escapeHtml(post.cover_alt || post.title);
  const authorLine = post.author_kind === 'jefferson' ? ' Por Jefferson Lobo.' : '';

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<meta name="description" content="${description}" />
<link rel="canonical" href="${url}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="Jefferson Lobo" />
<meta property="og:url" content="${shareUrl}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${escapeHtml(image)}" />
<meta property="og:image:url" content="${escapeHtml(image)}" />
<meta property="og:image:secure_url" content="${escapeHtml(image)}" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:alt" content="${imageAlt}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${escapeHtml(image)}" />
<script>window.location.replace(${JSON.stringify(url)});</script>
</head>
<body><a href="${url}">${title}</a>${authorLine}</body>
</html>`;
}

/**
 * Cria ou atualiza public/noticia/{slug}.html no repositório via GitHub
 * Contents API. Não lança erro pra não travar o publish do post — quem
 * chama decide se loga/notifica em caso de falha (ex.: token ausente).
 */
export async function publishNoticiaHtml(post: NoticiaPost): Promise<{ ok: boolean; reason?: string }> {
  const html = buildNoticiaHtml(post);
  return commitFile(
    `public/noticia/${post.slug}.html`,
    html,
    `chore: gera prévia de compartilhamento para "${post.title}"`,
  );
}
