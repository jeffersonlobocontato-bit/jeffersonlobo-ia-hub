import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.79.0';

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

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, 'i');
  const match = xml.match(regex);
  let value = match ? match[1].trim() : '';
  
  // Remove CDATA wrapper if present
  value = value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1');
  
  return value;
}

function extractAttribute(xml: string, tag: string, attr: string): string {
  const regex = new RegExp(`<${tag}[^>]*${attr}=["']([^"']*)["'][^>]*>`, 'i');
  const match = xml.match(regex);
  return match ? match[1] : '';
}

function parseRSSFeed(rssXml: string): Episode[] {
  const episodes: Episode[] = [];
  
  // Split by item tags
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  const items = rssXml.matchAll(itemRegex);
  
  for (const match of items) {
    const itemXml = match[1];
    
    const title = extractTag(itemXml, 'title');
    const description = extractTag(itemXml, 'description').replace(/<[^>]*>/g, '');
    const pubDate = extractTag(itemXml, 'pubDate');
    const duration = extractTag(itemXml, 'duration') || extractTag(itemXml, 'itunes:duration');
    const guid = extractTag(itemXml, 'guid');
    const audio_url = extractAttribute(itemXml, 'enclosure', 'url');
    const image_url = extractAttribute(itemXml, 'itunes:image', 'href');
    
    // Tentar extrair número do episódio
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
        image_url,
        episode_number,
      });
    }
  }
  
  return episodes;
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
    
    console.log('RSS recebido, fazendo parsing...');

    // Parse episodes
    const episodes = parseRSSFeed(rssText);
    
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
        console.error('Erro ao inserir episódio:', episode.title, upsertError);
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