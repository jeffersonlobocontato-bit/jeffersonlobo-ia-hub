// Gera conteúdo para o Instagram (Card, Carrossel, Story): pesquisa o tema de
// IA/marketing mais comentado do dia (RSS ativos em instagram_trend_sources +
// Hacker News, como sinal de "mais comentado"), escreve os 3 formatos com IA
// e gera as imagens de fundo — tudo entra como instagram_creatives com
// status='pending_review', esperando aprovação manual no admin. Não publica
// nada sozinho — nem tem endpoint de publicação ainda (fase 2, quando o app
// no Meta for Developers existir).
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrendItem {
  source: string;
  title: string;
  link: string;
  description: string;
  pubDate: string;
  signal: number; // proxy de "quão comentado" (pontos/comentários do HN; 0 p/ RSS comum)
}

interface Slide {
  order: number;
  headline: string;
  body: string;
  image_prompt: string;
  image_url: string | null;
}

interface FormatDraft {
  caption: string;
  hashtags: string[];
  slides: { headline: string; body: string; image_prompt: string }[];
}

interface ContentDraft {
  topic_title: string;
  topic_summary: string;
  card: FormatDraft;
  carousel: FormatDraft;
  story: FormatDraft;
}

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = xml.match(regex);
  let value = match ? match[1].trim() : '';
  value = value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').trim();
  return value;
}

function extractLink(itemXml: string): string {
  const rss = extractTag(itemXml, 'link');
  if (rss && !rss.includes('<')) return rss;
  const atom = itemXml.match(/<link[^>]*href=["']([^"']+)["']/i);
  return atom ? atom[1] : '';
}

function parseFeed(xml: string, sourceName: string): TrendItem[] {
  const items: TrendItem[] = [];
  const blocks = xml.match(/<item>([\s\S]*?)<\/item>/gi) || xml.match(/<entry>([\s\S]*?)<\/entry>/gi) || [];
  for (const block of blocks) {
    const title = extractTag(block, 'title');
    const link = extractLink(block);
    const rawDescription = extractTag(block, 'description') || extractTag(block, 'summary') || extractTag(block, 'content');
    const pubDate = extractTag(block, 'pubDate') || extractTag(block, 'published') || extractTag(block, 'updated');
    if (title && link) {
      items.push({
        source: sourceName,
        title,
        link,
        description: rawDescription.replace(/<[^>]*>/g, '').slice(0, 500),
        pubDate,
        signal: 0,
      });
    }
  }
  return items;
}

/** Hacker News (Algolia) das últimas 24h com "AI"/"marketing" no título — sinal de "mais comentado". */
async function fetchHackerNewsTrends(): Promise<TrendItem[]> {
  const since = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);
  const url = `https://hn.algolia.com/api/v1/search_by_date?tags=story&numericFilters=created_at_i>${since}&query=AI%20OR%20marketing&hitsPerPage=30`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const hits: any[] = Array.isArray(data.hits) ? data.hits : [];
    return hits
      .map((h) => ({
        source: 'Hacker News',
        title: String(h.title || ''),
        link: String(h.url || `https://news.ycombinator.com/item?id=${h.objectID}`),
        description: '',
        pubDate: h.created_at || '',
        signal: (h.points || 0) + (h.num_comments || 0) * 2,
      }))
      .filter((h) => h.title);
  } catch (e) {
    console.warn('Hacker News falhou (segue sem esse sinal)', e);
    return [];
  }
}

async function draftContent(apiKey: string, poolText: string): Promise<ContentDraft> {
  const systemPrompt = `Você escreve, em nome de Jefferson Lobo (palestrante, autor e consultor brasileiro de Inteligência Artificial aplicada a marketing, negócios e lideranças), os criativos diários do Instagram dele.

Tarefa: entre os itens de hoje fornecidos, escolha o ÚNICO tema de IA ou marketing mais relevante/comentado, e produza os 3 formatos de post a partir dele — mesmo tema, adaptado a cada formato.

Regras:
- Português do Brasil, tom direto e analítico (nunca hype vazio tipo "isso vai mudar tudo!!").
- "card": 1 slide só — um insight forte e autocontido, headline curta (até 60 caracteres) + body de 1-2 frases.
- "carousel": 5 a 7 slides — quebra o raciocínio em passos/argumentos, cada slide com headline curta + body de 1-2 frases, progressão lógica (gancho no slide 1, fechamento/CTA no último).
- "story": 1 slide só — versão ainda mais curta e direta que o card (é consumido em 3-5 segundos), headline curtíssima (até 40 caracteres) + body opcional de 1 frase.
- Cada slide leva "image_prompt": descrição em INGLÊS de uma imagem/ilustração de fundo (estilo editorial, moderno, cores sóbrias condizentes com uma marca de tecnologia/IA) que ilustre o slide. NUNCA peça texto, letras, palavras ou logotipos na imagem — o texto é sobreposto depois por código.
- "caption" e "hashtags" (8 a 12, sem #, minúsculas) são compartilhados pelos 3 formatos (mesma pauta).
- Nunca invente dados/fatos que não estejam nos itens fornecidos.
- Retorne APENAS um JSON válido no formato exato:
{"topic_title":"...","topic_summary":"resumo de 1-2 frases do tema escolhido e por que é relevante hoje","card":{"caption":"...","hashtags":["..."],"slides":[{"headline":"...","body":"...","image_prompt":"..."}]},"carousel":{"caption":"...","hashtags":["..."],"slides":[{"headline":"...","body":"...","image_prompt":"..."}, ...]},"story":{"caption":"...","hashtags":["..."],"slides":[{"headline":"...","body":"...","image_prompt":"..."}]}}`;

  const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Itens coletados hoje (título, fonte, sinal de engajamento quando disponível):\n\n${poolText}` },
      ],
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gateway de IA falhou (${res.status}): ${errText.slice(0, 500)}`);
  }
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error('O modelo não retornou conteúdo');
  const parsed = JSON.parse(raw);
  if (!parsed.topic_title || !parsed.card || !parsed.carousel || !parsed.story) {
    throw new Error('Resposta da IA veio incompleta (faltou topic_title ou algum formato)');
  }
  return parsed as ContentDraft;
}

/** Gera uma imagem com a OpenAI (DALL·E 3) e retorna os bytes PNG. */
async function generateImage(openAiApiKey: string, prompt: string): Promise<Uint8Array> {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${openAiApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1792', // retrato — mais próximo do 4:5/9:16 usado no Instagram
      quality: 'standard',
      style: 'natural',
      response_format: 'b64_json',
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI images falhou (${res.status}): ${errText.slice(0, 500)}`);
  }
  const data = await res.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error('OpenAI images não retornou imagem');
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// deno-lint-ignore no-explicit-any
async function uploadCreativeImage(supabase: any, bytes: Uint8Array, path: string): Promise<string> {
  const { error } = await supabase.storage.from('instagram-creatives').upload(path, bytes, {
    contentType: 'image/png',
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from('instagram-creatives').getPublicUrl(path);
  return data.publicUrl;
}

async function buildSlides(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  openAiApiKey: string | null,
  runId: string,
  format: string,
  draft: FormatDraft,
): Promise<Slide[]> {
  const slides: Slide[] = [];
  for (let i = 0; i < draft.slides.length; i++) {
    const s = draft.slides[i];
    let imageUrl: string | null = null;
    if (openAiApiKey) {
      try {
        const bytes = await generateImage(openAiApiKey, s.image_prompt);
        imageUrl = await uploadCreativeImage(supabase, bytes, `${runId}/${format}-${i + 1}.png`);
      } catch (e) {
        console.warn(`imagem falhou (${format} slide ${i + 1}), segue sem imagem de fundo`, e);
      }
    }
    slides.push({ order: i + 1, headline: s.headline, body: s.body, image_prompt: s.image_prompt, image_url: imageUrl });
  }
  return slides;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const aiApiKey = Deno.env.get('LOVABLE_API_KEY');
  const openAiApiKey = Deno.env.get('OPENAI_API_KEY') || null;
  const supabase = createClient(supabaseUrl, serviceKey);

  const today = new Date().toISOString().slice(0, 10);
  let run: { id: string } | null = null;

  try {
    if (!aiApiKey) throw new Error('LOVABLE_API_KEY não configurada nos secrets do projeto');
    if (!openAiApiKey) {
      console.warn('OPENAI_API_KEY não configurada — os criativos vão sair sem imagem de fundo (só texto), configure o secret para gerar imagens.');
    }

    const { data: sources, error: sourcesErr } = await supabase
      .from('instagram_trend_sources')
      .select('id, name, url')
      .eq('active', true);
    if (sourcesErr) throw sourcesErr;
    if (!sources || sources.length === 0) throw new Error('Nenhuma fonte ativa em instagram_trend_sources');

    const collected: TrendItem[] = [];
    for (const source of sources) {
      try {
        const res = await fetch(source.url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JeffersonLoboInstagramPipeline/1.0)' },
        });
        await supabase
          .from('instagram_trend_sources')
          .update({ last_fetch_status: res.ok ? 'ok' : `http_${res.status}`, last_fetch_at: new Date().toISOString() })
          .eq('id', source.id);
        if (!res.ok) continue;
        const xml = await res.text();
        collected.push(...parseFeed(xml, source.name).slice(0, 6));
      } catch (e) {
        console.warn(`fonte falhou: ${source.name}`, e);
        await supabase
          .from('instagram_trend_sources')
          .update({ last_fetch_status: 'erro', last_fetch_at: new Date().toISOString() })
          .eq('id', source.id);
      }
    }

    collected.push(...(await fetchHackerNewsTrends()));

    if (collected.length === 0) throw new Error('Nenhum item coletado — todas as fontes falharam ou estão vazias');

    // Prioriza sinal de "mais comentado" (HN) e mantém tudo que sobrar das fontes RSS.
    const pool = [...collected].sort((a, b) => b.signal - a.signal).slice(0, 40);

    const { data: runRow, error: runErr } = await supabase
      .from('instagram_runs')
      .insert({ run_date: today, status: 'drafting', topic_sources: pool.slice(0, 15) })
      .select()
      .single();
    if (runErr) throw runErr;
    run = runRow;

    const poolText = pool
      .map((i, idx) => `${idx + 1}. [${i.source}${i.signal ? ` · sinal:${i.signal}` : ''}] ${i.title}\n${i.description}`)
      .join('\n\n');

    const draft = await draftContent(aiApiKey, poolText);

    const [cardSlides, carouselSlides, storySlides] = await Promise.all([
      buildSlides(supabase, openAiApiKey, run!.id, 'card', draft.card),
      buildSlides(supabase, openAiApiKey, run!.id, 'carousel', draft.carousel),
      buildSlides(supabase, openAiApiKey, run!.id, 'story', draft.story),
    ]);

    const creativesToInsert = [
      { run_id: run!.id, format: 'card', caption: draft.card.caption, hashtags: draft.card.hashtags, slides: cardSlides },
      { run_id: run!.id, format: 'carousel', caption: draft.carousel.caption, hashtags: draft.carousel.hashtags, slides: carouselSlides },
      { run_id: run!.id, format: 'story', caption: draft.story.caption, hashtags: draft.story.hashtags, slides: storySlides },
    ];
    const { error: creativesErr } = await supabase.from('instagram_creatives').insert(creativesToInsert);
    if (creativesErr) throw creativesErr;

    await supabase
      .from('instagram_runs')
      .update({
        status: 'pending_review',
        topic_title: draft.topic_title,
        topic_summary: draft.topic_summary,
        updated_at: new Date().toISOString(),
      })
      .eq('id', run!.id);

    const telegramText =
      `📸 <b>Criativos de Instagram prontos para revisão</b>\n\n` +
      `<b>${draft.topic_title}</b>\n${draft.topic_summary}\n\n` +
      `Card, Carrossel e Story esperando aprovação no painel: https://jeffersonlobo.tech/admin`;
    await supabase.functions.invoke('notify-telegram', { body: { text: telegramText } }).catch((e) => console.warn('telegram falhou', e));

    return new Response(
      JSON.stringify({ ok: true, runId: run!.id, topicTitle: draft.topic_title, itemsCollected: pool.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null
          ? [(error as any).message, (error as any).details, (error as any).hint, (error as any).code].filter(Boolean).join(' | ') ||
            JSON.stringify(error)
          : String(error);
    console.error('instagram-content-fetch falhou', message);

    if (run?.id) {
      await supabase.from('instagram_runs').update({ status: 'failed', error_message: message }).eq('id', run.id);
    } else {
      await supabase.from('instagram_runs').insert({ run_date: today, status: 'failed', error_message: message });
    }
    await supabase.functions
      .invoke('notify-telegram', { body: { text: `⚠️ Geração de conteúdo do Instagram falhou hoje: ${message}` } })
      .catch(() => {});

    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
