// Edge function que devolve HTML com meta tags Open Graph corretas para crawlers
// de redes sociais (WhatsApp, LinkedIn, Facebook, X, Slack) e redireciona humanos
// para a página real do post em /blog/:slug.
//
// URL pública: https://<project>.supabase.co/functions/v1/blog-share/<slug>
// Também aceita ?slug=<slug>

import { createClient } from 'npm:@supabase/supabase-js@2'

const SITE_URL = 'https://jeffersonlobo.tech'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

function escapeHtml(s: string): string {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderHtml(post: any): string {
  const url = `${SITE_URL}/blog/${post.slug}`
  const title = escapeHtml(post.seo_title || post.title)
  const description = escapeHtml(
    post.seo_description || post.subtitle || post.excerpt || '',
  ).slice(0, 300)
  const image = escapeHtml(
    post.cover_image ||
      'https://storage.googleapis.com/gpt-engineer-file-uploads/DHKdvSKyvqV4o5xAVHB85Nkclo92/social-images/social-1762353011645-aprenda-inteligencia-artificial-na-pratica.webp',
  )
  const imageAlt = escapeHtml(post.cover_alt || post.title)

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
<meta property="og:url" content="${url}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${image}" />
<meta property="og:image:alt" content="${imageAlt}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:url" content="${url}" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${image}" />

<meta http-equiv="refresh" content="0; url=${url}" />
<script>window.location.replace(${JSON.stringify(url)});</script>
</head>
<body>
<p>Redirecionando para <a href="${url}">${title}</a>...</p>
</body>
</html>`
}

function notFoundHtml(): string {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Post não encontrado</title>
<meta http-equiv="refresh" content="0; url=${SITE_URL}/blog" />
<script>window.location.replace(${JSON.stringify(`${SITE_URL}/blog`)});</script>
</head><body><a href="${SITE_URL}/blog">Ir para o blog</a></body></html>`
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url)
    // pega o slug do path (último segmento) ou da query
    const parts = url.pathname.split('/').filter(Boolean)
    let slug = url.searchParams.get('slug') || parts[parts.length - 1] || ''
    if (slug === 'blog-share') slug = ''
    slug = slug.trim().toLowerCase()

    if (!slug || !/^[a-z0-9-]{1,200}$/.test(slug)) {
      return new Response(notFoundHtml(), {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    const { data: post, error } = await supabase
      .from('blog_posts')
      .select(
        'slug, title, subtitle, excerpt, cover_image, cover_alt, seo_title, seo_description, active',
      )
      .eq('slug', slug)
      .eq('active', true)
      .maybeSingle()

    if (error || !post) {
      return new Response(notFoundHtml(), {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    return new Response(renderHtml(post), {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=600',
      },
    })
  } catch (e) {
    console.error('blog-share error', e)
    return new Response(notFoundHtml(), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }
})
