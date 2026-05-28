// Edge function que devolve HTML com meta tags Open Graph corretas para crawlers
// de redes sociais (WhatsApp, LinkedIn, Facebook, X, Slack) e redireciona humanos
// para a página real do post em /blog/:slug.
//
// URL pública: https://<project>.supabase.co/functions/v1/blog-share/<slug>
// Também aceita ?slug=<slug>

import { createClient } from 'npm:@supabase/supabase-js@2'

const SITE_URL = 'https://jeffersonlobo.tech'
const FALLBACK_IMAGE =
  'https://storage.googleapis.com/gpt-engineer-file-uploads/DHKdvSKyvqV4o5xAVHB85Nkclo92/social-images/social-1762353011645-aprenda-inteligencia-artificial-na-pratica.webp'

const htmlHeaders = new Headers({
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'public, max-age=60, s-maxage=300',
  'X-Robots-Tag': 'noindex',
})

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

function truncateText(s: string, max = 180): string {
  const text = (s || '').replace(/\s+/g, ' ').trim()
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  return `${cut.slice(0, cut.lastIndexOf(' ') || cut.length).trim()}…`
}

function socialImageUrl(image?: string | null): string {
  if (!image) return FALLBACK_IMAGE

  try {
    const url = new URL(image)
    if (url.pathname.includes('/storage/v1/object/public/')) {
      url.pathname = url.pathname.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')
      url.searchParams.set('width', '1200')
      url.searchParams.set('height', '630')
      url.searchParams.set('resize', 'contain')
      url.searchParams.set('quality', '80')
      return url.toString()
    }
  } catch (_) {
    return image
  }

  return image
}

function renderHtml(post: any, shareUrl: string): string {
  const url = `${SITE_URL}/blog/${post.slug}`
  const title = escapeHtml(post.title)
  const description = escapeHtml(truncateText(post.seo_description || post.subtitle || post.excerpt || ''))
  const image = escapeHtml(socialImageUrl(post.cover_image))
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
<meta property="og:url" content="${shareUrl}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${image}" />
<meta property="og:image:secure_url" content="${image}" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:alt" content="${imageAlt}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:url" content="${shareUrl}" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${image}" />

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
        headers: htmlHeaders,
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
        headers: htmlHeaders,
      })
    }

    // og:url usa a URL real desta função, que é o que o crawler está visitando
    const shareUrl = `${url.origin}${url.pathname}?slug=${post.slug}`
    return new Response(renderHtml(post, shareUrl), {
      status: 200,
      headers: htmlHeaders,
    })
  } catch (e) {
    console.error('blog-share error', e)
    return new Response(notFoundHtml(), {
      status: 500,
      headers: htmlHeaders,
    })
  }
})
