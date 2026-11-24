// Card de compartilhamento de um episódio do podcast (1200x630 PNG), no mesmo
// padrão das capas do blog (_shared/branded-cover.ts): nome do canal no topo,
// título do episódio no centro, "SÉRIE X · EPISÓDIO N" embaixo.
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

  // Com a série (podcast_series). Se a tabela de séries ainda não existir no banco,
  // cai para a consulta simples e o card sai sem a série.
  let ep: { title: string; episode_number: number | null; podcast_series?: { title: string } | null } | null = null;
  const comSerie = await supabase
    .from('podcast_episodes')
    .select('title, episode_number, podcast_series(title)')
    .eq('id', id)
    .maybeSingle();
  if (comSerie.error) {
    const simples = await supabase.from('podcast_episodes').select('title, episode_number').eq('id', id).maybeSingle();
    if (simples.error) return new Response(simples.error.message, { status: 500 });
    ep = simples.data;
  } else {
    // deno-lint-ignore no-explicit-any
    ep = comSerie.data as any;
  }
  if (!ep) return new Response('episódio não encontrado', { status: 404 });

  const serie = ep.podcast_series?.title;
  const partes = [
    serie ? `SÉRIE ${serie}` : null,
    ep.episode_number ? `EPISÓDIO ${ep.episode_number}` : null,
  ].filter(Boolean);
  const rodape = partes.length ? partes.join(' · ') : 'JEFFERSON LOBO';

  try {
    const png = await renderBrandedCover({
      kicker: PODCAST_NOME,
      title: ep.title,
      author: rodape,
    });
    return new Response(png, {
      headers: { 'content-type': 'image/png', 'cache-control': 'public, max-age=3600' },
    });
  } catch (e) {
    return new Response(`falha ao gerar o card: ${e instanceof Error ? e.message : String(e)}`, { status: 500 });
  }
});
