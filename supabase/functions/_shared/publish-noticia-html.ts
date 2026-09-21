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
const GITHUB_OWNER = 'jeffersonlobocontato-bit';
const GITHUB_REPO = 'jeffersonlobo-ia-hub';
const GITHUB_BRANCH = 'main';
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

function toBase64Utf8(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

/**
 * Cria ou atualiza public/noticia/{slug}.html no repositório via GitHub
 * Contents API. Não lança erro pra não travar o publish do post — quem
 * chama decide se loga/notifica em caso de falha (ex.: token ausente).
 */
export async function publishNoticiaHtml(post: NoticiaPost): Promise<{ ok: boolean; reason?: string }> {
  const token = Deno.env.get('GITHUB_TOKEN');
  if (!token) return { ok: false, reason: 'GITHUB_TOKEN ausente nos secrets do projeto' };

  const path = `public/noticia/${post.slug}.html`;
  const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'User-Agent': 'jeffersonlobo-content-pipeline',
  };

  try {
    // Precisa do sha do arquivo se ele já existir (update), senão a API rejeita.
    let sha: string | undefined;
    const existing = await fetch(`${apiUrl}?ref=${GITHUB_BRANCH}`, { headers });
    if (existing.status === 200) {
      const data = await existing.json();
      sha = data.sha;
    } else if (existing.status !== 404) {
      const errText = await existing.text();
      return { ok: false, reason: `GET falhou (${existing.status}): ${errText.slice(0, 300)}` };
    }

    const html = buildNoticiaHtml(post);
    const res = await fetch(apiUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: `chore: gera prévia de compartilhamento para "${post.title}"`,
        content: toBase64Utf8(html),
        branch: GITHUB_BRANCH,
        ...(sha ? { sha } : {}),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { ok: false, reason: `PUT falhou (${res.status}): ${errText.slice(0, 300)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : String(e) };
  }
}
