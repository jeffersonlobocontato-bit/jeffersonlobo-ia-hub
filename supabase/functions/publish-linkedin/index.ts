// Publica um post do blog no LinkedIn pessoal do Jefferson via UGC Posts API.
// Fica inativo (no-op) até LINKEDIN_ACCESS_TOKEN e LINKEDIN_PERSON_URN
// existirem nos secrets do projeto — isso exige que o Jefferson crie um app
// de desenvolvedor no LinkedIn e autorize o acesso (produto "Share on
// LinkedIn", escopo w_member_social); não é algo que dá pra fazer por ele.
// Até lá, o pipeline continua publicando normalmente no blog — esta função
// só é chamada de forma fire-and-forget e nunca bloqueia o blog.
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SITE_URL = 'https://jeffersonlobo.tech';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const accessToken = Deno.env.get('LINKEDIN_ACCESS_TOKEN');
  const personUrn = Deno.env.get('LINKEDIN_PERSON_URN'); // formato: urn:li:person:XXXXXXX

  if (!accessToken || !personUrn) {
    console.log('LinkedIn ainda não configurado (LINKEDIN_ACCESS_TOKEN / LINKEDIN_PERSON_URN ausentes) — pulando.');
    return new Response(JSON.stringify({ skipped: true, reason: 'LinkedIn não configurado' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { postId } = await req.json();
    if (!postId) throw new Error('postId ausente');

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: post, error } = await supabase.from('blog_posts').select('title, excerpt, slug').eq('id', postId).single();
    if (error || !post) throw new Error(`post ${postId} não encontrado`);

    const url = `${SITE_URL}/blog/${post.slug}`;
    const commentary = `${post.title}\n\n${post.excerpt}\n\n${url}`;

    const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: personUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: commentary },
            shareMediaCategory: 'ARTICLE',
            media: [{ status: 'READY', originalUrl: url }],
          },
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`LinkedIn API falhou (${res.status}): ${errText.slice(0, 500)}`);
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('publish-linkedin falhou', message);
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
