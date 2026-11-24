// Card de compartilhamento de um episódio do podcast (1200x630 PNG), no mesmo
// padrão das capas do blog (_shared/branded-cover.ts): nome do canal no topo,
// título do episódio no centro, "EPISÓDIO N · JEFFERSON LOBO" embaixo.
//
// GET /functions/v1/podcast-card?id=<uuid do episódio>
//
// Quem chama é o build do site (scripts/generate-sitemap.ts), que baixa o card,
// grava em public/og/podcast-{slug}.jpg e aponta o og:image da página
// /episodio/{slug}.html para ele — o WhatsApp/LinkedIn lê a imagem do próprio
// domínio, nunca desta função.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { renderBrandedCover } from '../_shared/branded-cover.ts';

// Igual a PODCAST_NOME em src/lib/podcast.ts (o título da seção de podcast do site).
const PODCAST_NOME = 'O Código Lobo';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

Deno.serve(async (req) => {
  const id = new URL(req.url).searchParams.get('id');
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return new Response('parâmetro id (uuid do episódio) obrigatório', { status: 400 });
  }

  const { data: ep, error } = await supabase
    .from('podcast_episodes')
    .select('title, episode_number')
    .eq('id', id)
    .maybeSingle();
  if (error) return new Response(error.message, { status: 500 });
  if (!ep) return new Response('episódio não encontrado', { status: 404 });

  try {
    const png = await renderBrandedCover({
      kicker: PODCAST_NOME,
      title: ep.title,
      author: ep.episode_number ? `EPISÓDIO ${ep.episode_number} · JEFFERSON LOBO` : 'JEFFERSON LOBO',
    });
    return new Response(png, {
      headers: { 'content-type': 'image/png', 'cache-control': 'public, max-age=3600' },
    });
  } catch (e) {
    return new Response(`falha ao gerar o card: ${e instanceof Error ? e.message : String(e)}`, { status: 500 });
  }
});
