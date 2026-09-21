// Gera/commita public/noticia/{slug}.html pra UM post específico, e também
// regenera public/sitemap.xml + public/llms.txt com todos os posts ativos —
// sob demanda, sem depender de `npm run build` (só roda quando clica Publish
// no Lovable).
//
// Existe pra cobrir o caso que a pipeline automática (content-pipeline-publish)
// não cobre: um post publicado fora dela — direto via SQL no Supabase, por
// exemplo — nunca passa pelo publishNoticiaHtml() que a pipeline já chama pra
// si mesma. É chamada pelo trigger trg_notify_blog_post_published (ver
// supabase/migrations/20260921150000_reuse_publish_noticia_for_trigger.sql),
// que substitui a tentativa anterior de disparar isso via GitHub Actions
// repository_dispatch — nunca teve uma execução confirmada em mais de uma
// semana. Reaproveita o mesmo publishNoticiaHtml() já testado e funcionando
// (usado pela pipeline hoje, 21/09).
import { createClient } from 'npm:@supabase/supabase-js@2';
import { publishNoticiaHtml } from '../_shared/publish-noticia-html.ts';
import { publishSitemapAndLlms } from '../_shared/publish-sitemap-llms.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { postId, slug } = await req.json().catch(() => ({}));
    if (!postId && !slug) {
      return new Response(JSON.stringify({ ok: false, error: 'informe postId ou slug' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const query = supabase.from('blog_posts').select('*');
    const { data: post, error } = postId
      ? await query.eq('id', postId).maybeSingle()
      : await query.eq('slug', slug).maybeSingle();

    if (error) throw error;
    if (!post) {
      return new Response(JSON.stringify({ ok: false, error: 'post não encontrado' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Sequencial de propósito: ver comentário em publish-sitemap-llms.ts sobre
    // por que commits concorrentes na mesma branch causam 409 na Contents API.
    const noticiaResult = await publishNoticiaHtml(post);
    const sitemapResult = await publishSitemapAndLlms(supabase);

    const ok = noticiaResult.ok && sitemapResult.ok;
    return new Response(JSON.stringify({ ok, noticia: noticiaResult, sitemapAndLlms: sitemapResult }), {
      status: ok ? 200 : 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('publish-share-page falhou', message);
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
