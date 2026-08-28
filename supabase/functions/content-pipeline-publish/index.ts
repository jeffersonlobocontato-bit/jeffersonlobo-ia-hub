// Roda 1x/dia (10h BRT, via pg_cron) — publica os posts do pipeline de hoje
// que já foram aprovados no admin (status='approved') e avisa por Telegram
// se algum ainda estiver esperando aprovação, sem forçar a publicação.
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const today = new Date().toISOString().slice(0, 10);

  try {
    const { data: run } = await supabase
      .from('content_pipeline_runs')
      .select('*')
      .eq('run_date', today)
      .maybeSingle();

    if (!run) {
      return new Response(JSON.stringify({ skipped: true, reason: `nenhum run para ${today}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const postIds = [run.curation_post_id, run.authored_post_id].filter(Boolean) as string[];
    if (postIds.length === 0) {
      return new Response(JSON.stringify({ skipped: true, reason: 'run sem posts associados' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: posts, error: postsErr } = await supabase.from('blog_posts').select('*').in('id', postIds);
    if (postsErr) throw postsErr;

    const approved = (posts || []).filter((p) => p.status === 'approved');
    const stillPending = (posts || []).filter((p) => p.status === 'pending_review');

    for (const post of approved) {
      await supabase
        .from('blog_posts')
        .update({ active: true, status: 'published', published_at: new Date().toISOString() })
        .eq('id', post.id);
      // LinkedIn é fire-and-forget e opcional: só publica se as credenciais já
      // tiverem sido configuradas pelo Jefferson (ver supabase/functions/publish-linkedin).
      supabase.functions.invoke('publish-linkedin', { body: { postId: post.id } }).catch((e) => {
        console.warn('publish-linkedin falhou (não bloqueia o blog)', e);
      });
    }

    if (approved.length > 0) {
      await supabase
        .from('content_pipeline_runs')
        .update({ status: stillPending.length > 0 ? 'pending_review' : 'published', updated_at: new Date().toISOString() })
        .eq('id', run.id);
    }

    if (stillPending.length > 0) {
      const titles = stillPending.map((p) => `• ${p.title}`).join('\n');
      const text =
        `⏰ <b>São 10h e a pauta de hoje ainda não foi toda aprovada</b>\n\n${titles}\n\n` +
        `Nada foi publicado sem sua aprovação — assim que aprovar em jeffersonlobo.tech/admin, publica na hora.`;
      await supabase.functions.invoke('notify-telegram', { body: { text } }).catch(() => {});
    }

    return new Response(
      JSON.stringify({ ok: true, published: approved.map((p) => p.id), stillPending: stillPending.map((p) => p.id) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('content-pipeline-publish falhou', message);
    await supabase.functions
      .invoke('notify-telegram', { body: { text: `⚠️ Falha ao publicar a pauta de hoje: ${message}` } })
      .catch(() => {});
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
