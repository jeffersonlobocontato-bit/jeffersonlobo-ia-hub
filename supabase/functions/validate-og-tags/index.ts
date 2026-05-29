// Edge function: validate-og-tags
// Recebe { url } e devolve as Open Graph tags da página.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string' || !/^https?:\/\//i.test(url) || url.length > 2000) {
      return json({ error: 'invalid_url' }, 400);
    }

    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    let html = '';
    try {
      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OGValidator/1.0)' },
        redirect: 'follow',
      });
      if (!res.ok) return json({ error: 'fetch_failed', status: res.status }, 200);
      html = (await res.text()).slice(0, 200_000);
    } finally {
      clearTimeout(t);
    }

    const og = (prop: string) => {
      const re = new RegExp(
        `<meta[^>]+(?:property|name)\\s*=\\s*["']${prop}["'][^>]*content\\s*=\\s*["']([^"']+)["']`,
        'i',
      );
      const m = html.match(re) ||
        html.match(new RegExp(
          `<meta[^>]+content\\s*=\\s*["']([^"']+)["'][^>]+(?:property|name)\\s*=\\s*["']${prop}["']`,
          'i',
        ));
      return m?.[1] ?? null;
    };

    const og_title = og('og:title');
    const og_description = og('og:description');
    const og_image = og('og:image');
    const missing: string[] = [];
    if (!og_title) missing.push('og:title');
    if (!og_description) missing.push('og:description');
    if (!og_image) missing.push('og:image');

    return json({
      valid: missing.length === 0,
      og_title,
      og_description,
      og_image,
      missing,
    }, 200);
  } catch (e) {
    return json({ error: 'unexpected', detail: e instanceof Error ? e.message : String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
