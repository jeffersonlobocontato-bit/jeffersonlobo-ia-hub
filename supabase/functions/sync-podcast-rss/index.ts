import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.79.0';
import { DOMParser, Element } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Episode {
  title: string;
  description: string;
  published_date: string;
  duration?: string;
  audio_url: string;
  guid: string;
  image_url?: string;
  episode_number?: number;
  season_number?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar configuração do podcast
    const { data: config, error: configError } = await supabase
      .from('podcast_config')
      .select('rss_url')
      .single();

    if (configError || !config) {
      throw new Error('Configuração do podcast não encontrada');
    }

    console.log('Buscando RSS do podcast:', config.rss_url);

    // Buscar RSS
    const rssResponse = await fetch(config.rss_url);
    const rssText = await rssResponse.text();

    // Parse XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(rssText, 'text/xml');

    if (!xmlDoc) {
      throw new Error('Erro ao fazer parse do XML');
    }

    const items = xmlDoc.querySelectorAll('item');
    const episodes: Episode[] = [];

    items.forEach((itemNode) => {
      const item = itemNode as unknown as Element;
      const title = item.querySelector('title')?.textContent || '';
      const description = item.querySelector('description')?.textContent || '';
      const pubDate = item.querySelector('pubDate')?.textContent || '';
      const duration = item.querySelector('duration')?.textContent || '';
      const enclosure = item.querySelector('enclosure');
      const audio_url = enclosure?.getAttribute('url') || '';
      const guid = item.querySelector('guid')?.textContent || '';
      const image = item.querySelector('image')?.getAttribute('href') || '';
      
      // Tentar extrair número do episódio do título
      const episodeMatch = title.match(/#(\d+)/);
      const episode_number = episodeMatch ? parseInt(episodeMatch[1]) : undefined;

      if (title && audio_url && guid) {
        episodes.push({
          title,
          description,
          published_date: new Date(pubDate).toISOString(),
          duration,
          audio_url,
          guid,
          image_url: image,
          episode_number,
        });
      }
    });

    console.log(`Encontrados ${episodes.length} episódios`);

    // Inserir/atualizar episódios
    for (const episode of episodes) {
      const { error: upsertError } = await supabase
        .from('podcast_episodes')
        .upsert(
          {
            ...episode,
            active: true,
          },
          {
            onConflict: 'guid',
            ignoreDuplicates: false,
          }
        );

      if (upsertError) {
        console.error('Erro ao inserir episódio:', upsertError);
      }
    }

    // Atualizar timestamp da última sincronização
    await supabase
      .from('podcast_config')
      .update({ last_sync: new Date().toISOString() })
      .eq('rss_url', config.rss_url);

    return new Response(
      JSON.stringify({
        success: true,
        episodesSynced: episodes.length,
        message: 'Sincronização concluída com sucesso',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Erro ao sincronizar podcast:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});