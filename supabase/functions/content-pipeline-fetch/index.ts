// Roda 1x/dia (07h BRT, via pg_cron) — coleta os itens mais recentes das
// fontes oficiais ativas em content_sources (RSS de blog/imprensa e feeds
// públicos de vídeo do YouTube, nunca scraping de LinkedIn/X), gera dois
// rascunhos com a OpenAI (coluna de curadoria + artigo autoral) e deixa os
// dois como blog_posts com status='pending_review' esperando aprovação no
// admin. Notifica por Telegram quando a pauta do dia está pronta.
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RawItem {
  source: string;
  personName: string | null;
  personTitle: string | null;
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

interface Draft {
  title: string;
  subtitle: string;
  excerpt: string;
  content_md: string;
  sources: { name: string; title?: string; url: string; quote?: string }[];
  faq: { q: string; a: string }[];
}

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = xml.match(regex);
  let value = match ? match[1].trim() : '';
  value = value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').trim();
  return value;
}

function extractLink(itemXml: string): string {
  // RSS 2.0: <link>https://...</link>. Atom (comum em feeds do YouTube): <link href="..." />
  const rss = extractTag(itemXml, 'link');
  if (rss && !rss.includes('<')) return rss;
  const atom = itemXml.match(/<link[^>]*href=["']([^"']+)["']/i);
  return atom ? atom[1] : '';
}

function parseFeed(xml: string, source: { name: string; person_name: string | null; person_title: string | null }): RawItem[] {
  const items: RawItem[] = [];
  const blocks = xml.match(/<item>([\s\S]*?)<\/item>/gi) || xml.match(/<entry>([\s\S]*?)<\/entry>/gi) || [];
  for (const block of blocks) {
    const title = extractTag(block, 'title');
    const link = extractLink(block);
    const description = extractTag(block, 'description') || extractTag(block, 'summary') || extractTag(block, 'content');
    const pubDate = extractTag(block, 'pubDate') || extractTag(block, 'published') || extractTag(block, 'updated');
    if (title && link) {
      items.push({
        source: source.name,
        personName: source.person_name,
        personTitle: source.person_title,
        title,
        link,
        description: description.replace(/<[^>]*>/g, '').slice(0, 600),
        pubDate,
      });
    }
  }
  return items;
}

function slugify(text: string): string {
  return text
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

async function draftWithOpenAI(apiKey: string, systemPrompt: string, userPrompt: string): Promise<Draft> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI falhou (${res.status}): ${errText.slice(0, 500)}`);
  }
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error('OpenAI não retornou conteúdo');
  const parsed = JSON.parse(raw);
  return {
    title: String(parsed.title || '').trim(),
    subtitle: String(parsed.subtitle || '').trim(),
    excerpt: String(parsed.excerpt || '').trim(),
    content_md: String(parsed.content_md || '').trim(),
    sources: Array.isArray(parsed.sources) ? parsed.sources : [],
    faq: Array.isArray(parsed.faq) ? parsed.faq.filter((f: { q?: string; a?: string }) => f?.q && f?.a) : [],
  };
}

const CURATION_SYSTEM_PROMPT = `Você escreve, em nome de Jefferson Lobo (palestrante, autor e consultor brasileiro de Inteligência Artificial aplicada a marketing, negócios e lideranças), a coluna diária "Vozes que Importam" do blog dele.

Linha editorial: "quando eles falam, o mundo presta atenção". A coluna comenta, com a voz e o ponto de vista autoral de Jefferson (tese de "orquestração de fluxos de IA" e "agentes com DNA autoral"), o que as maiores vozes e empresas de tecnologia do mundo disseram ou lançaram nas últimas 24-48h — nunca copia o texto original, só cita trechos curtos entre aspas com atribuição clara e link para a fonte.

Regras obrigatórias (SEO/AEO/GEO — o mesmo padrão já usado no blog):
- Português do Brasil, tom analítico e direto, sem hype vazio.
- "excerpt" tem que funcionar sozinho como resposta direta e completa (é o TL;DR que aparece no topo do artigo e alimenta buscadores de IA) — responda a pergunta antes de justificar, sem gancho vazio tipo "descubra...".
- Estrutura do content_md: um parágrafo de abertura conectando os temas do dia, depois 3 a 5 seções (## Nome da pessoa/empresa) cada uma comentando um item, citação curta (no máximo 1-2 frases entre aspas) com link markdown para a fonte original, fechando com um parágrafo de síntese ligando tudo à visão de Jefferson sobre IA aplicada a marketing e negócios. Use subtítulos claros (##) — favorece leitura escaneável e citação por mecanismos de busca por IA.
- "faq": 3 a 4 perguntas objetivas que um leitor (ou uma IA respondendo por ele) faria sobre o tema do dia, com respostas curtas e diretas — vira dado estruturado FAQPage na página.
- Nunca invente citações, dados ou fatos que não estejam nos itens fornecidos. Se não houver itens suficientes e relevantes, produza uma coluna mais curta em vez de inventar.
- Retorne APENAS um JSON válido no formato exato:
{"title": "...", "subtitle": "...", "excerpt": "resposta direta e completa em 1-2 frases, até 160 caracteres", "content_md": "corpo em markdown, sem repetir o título", "sources": [{"name": "...", "title": "cargo/empresa", "url": "...", "quote": "trecho citado"}], "faq": [{"q": "...", "a": "..."}]}`;

const AUTHORED_SYSTEM_PROMPT = `Você escreve, em nome de Jefferson Lobo (palestrante, autor e consultor brasileiro de Inteligência Artificial aplicada a marketing, negócios e lideranças, Gerente Executivo de Marketing do Sistema Fiep), o artigo autoral diário do blog dele.

Este NÃO é um resumo de notícias — é uma opinião/análise original de Jefferson, com sua tese proprietária: o marketing entrou na fase da "orquestração de fluxos de IA" (sistemas de agentes conectados ao processo real da marca, não prompt avulso) e marcas precisam de "agentes de IA com DNA autoral" em vez de dependerem de ferramentas genéricas ou da "indústria de prompts".

Pode usar 1-2 itens do noticiário do dia (fornecidos) como gancho/contexto para a reflexão, mas o centro do texto é o raciocínio próprio de Jefferson, aplicável a lideranças de marketing e negócios no Brasil.

Regras obrigatórias (SEO/AEO/GEO — o mesmo padrão já usado no blog):
- Português do Brasil, 600 a 900 palavras, tom de estrategista prático, não genérico.
- "excerpt" tem que funcionar sozinho como resposta direta e completa (é o TL;DR que aparece no topo do artigo e alimenta buscadores de IA) — resuma a tese do artigo, não um gancho vazio.
- Estrutura em markdown com 2-4 subtítulos (##), sem repetir o título como H1. Inclua pelo menos uma frase-tese curta e citável (o tipo de frase que um buscador de IA reproduziria como resposta).
- "faq": 3 a 4 perguntas objetivas que um leitor (ou uma IA respondendo por ele) faria sobre o tema do artigo, com respostas curtas e diretas — vira dado estruturado FAQPage na página.
- Nunca invente fatos ou estatísticas específicas — se citar um dado externo, baseie-se só no que foi fornecido.
- Retorne APENAS um JSON válido no formato exato:
{"title": "...", "subtitle": "...", "excerpt": "resposta direta e completa em 1-2 frases, até 160 caracteres", "content_md": "corpo em markdown, sem repetir o título", "sources": [], "faq": [{"q": "...", "a": "..."}]}`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  const supabase = createClient(supabaseUrl, serviceKey);

  const today = new Date().toISOString().slice(0, 10);

  try {
    if (!openAIApiKey) throw new Error('OPENAI_API_KEY não configurada nos secrets do projeto');

    const { data: existingRun } = await supabase
      .from('content_pipeline_runs')
      .select('id, status')
      .eq('run_date', today)
      .maybeSingle();
    if (existingRun) {
      return new Response(JSON.stringify({ skipped: true, reason: `run de ${today} já existe (status: ${existingRun.status})` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: sources, error: sourcesErr } = await supabase
      .from('content_sources')
      .select('name, kind, url, person_name, person_title')
      .eq('active', true);
    if (sourcesErr) throw sourcesErr;
    if (!sources || sources.length === 0) throw new Error('Nenhuma fonte ativa em content_sources');

    const collected: RawItem[] = [];
    for (const source of sources) {
      try {
        const res = await fetch(source.url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JeffersonLoboContentPipeline/1.0)' },
        });
        await supabase
          .from('content_sources')
          .update({ last_fetch_status: res.ok ? 'ok' : `http_${res.status}`, last_fetch_at: new Date().toISOString() })
          .eq('name', source.name);
        if (!res.ok) {
          console.warn(`fonte falhou: ${source.name} (${res.status})`);
          continue;
        }
        const xml = await res.text();
        const items = parseFeed(xml, source).slice(0, 5);
        collected.push(...items);
      } catch (e) {
        console.warn(`erro ao buscar fonte ${source.name}`, e);
        await supabase
          .from('content_sources')
          .update({ last_fetch_status: 'erro', last_fetch_at: new Date().toISOString() })
          .eq('name', source.name);
      }
    }

    if (collected.length === 0) throw new Error('Nenhum item coletado — todas as fontes ativas falharam ou estão vazias');

    const cutoff = Date.now() - 2.5 * 24 * 60 * 60 * 1000; // 2.5 dias de folga p/ fuso e cadência dos feeds
    const recent = collected.filter((i) => {
      const t = Date.parse(i.pubDate);
      return isNaN(t) || t >= cutoff;
    });
    const pool = (recent.length > 0 ? recent : collected).slice(0, 40);

    const { data: run, error: runErr } = await supabase
      .from('content_pipeline_runs')
      .insert({ run_date: today, status: 'drafting', raw_items: pool })
      .select()
      .single();
    if (runErr) throw runErr;

    const poolText = pool
      .map((i, idx) => `${idx + 1}. [${i.source}${i.personName ? ` — ${i.personName}` : ''}] ${i.title}\n${i.description}\nLink: ${i.link}\nData: ${i.pubDate}`)
      .join('\n\n');

    const [curationDraft, authoredDraft] = await Promise.all([
      draftWithOpenAI(openAIApiKey, CURATION_SYSTEM_PROMPT, `Itens coletados hoje:\n\n${poolText}`),
      draftWithOpenAI(openAIApiKey, AUTHORED_SYSTEM_PROMPT, `Contexto do noticiário de hoje (use no máximo 1-2 itens como gancho):\n\n${poolText}`),
    ]);

    if (!curationDraft.title || !curationDraft.content_md) throw new Error('Rascunho de curadoria veio vazio da OpenAI');
    if (!authoredDraft.title || !authoredDraft.content_md) throw new Error('Rascunho autoral veio vazio da OpenAI');

    const { data: curationPost, error: e1 } = await supabase
      .from('blog_posts')
      .insert({
        title: curationDraft.title,
        subtitle: curationDraft.subtitle || null,
        excerpt: curationDraft.excerpt || curationDraft.title,
        content_md: curationDraft.content_md,
        category: 'Vozes que Importam',
        slug: `${slugify(curationDraft.title)}-${today}`,
        date: today,
        active: false,
        status: 'pending_review',
        author_kind: 'curadoria',
        sources: curationDraft.sources,
        faq: curationDraft.faq,
        tags: ['curadoria', 'inteligencia-artificial', 'tecnologia'],
        seo_title: curationDraft.title,
        seo_description: curationDraft.excerpt || curationDraft.title,
      })
      .select()
      .single();
    if (e1) throw e1;

    const { data: authoredPost, error: e2 } = await supabase
      .from('blog_posts')
      .insert({
        title: authoredDraft.title,
        subtitle: authoredDraft.subtitle || null,
        excerpt: authoredDraft.excerpt || authoredDraft.title,
        content_md: authoredDraft.content_md,
        category: 'Inteligência Artificial',
        slug: `${slugify(authoredDraft.title)}-${today}`,
        date: today,
        active: false,
        status: 'pending_review',
        author_kind: 'jefferson',
        faq: authoredDraft.faq,
        tags: ['inteligencia-artificial', 'marketing', 'estrategia'],
        seo_title: authoredDraft.title,
        seo_description: authoredDraft.excerpt || authoredDraft.title,
      })
      .select()
      .single();
    if (e2) throw e2;

    await supabase
      .from('content_pipeline_runs')
      .update({
        status: 'pending_review',
        curation_post_id: curationPost.id,
        authored_post_id: authoredPost.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', run.id);

    const telegramText =
      `📰 <b>Pauta de hoje pronta para revisão</b>\n\n` +
      `1️⃣ <b>${curationDraft.title}</b>\n<i>Vozes que Importam</i>\n\n` +
      `2️⃣ <b>${authoredDraft.title}</b>\n<i>Artigo autoral</i>\n\n` +
      `Revise e aprove em jeffersonlobo.tech/admin → aba "Pipeline de Conteúdo".\n` +
      `Se aprovar até 10h, os dois vão ao ar automaticamente nesse horário.`;
    await supabase.functions.invoke('notify-telegram', { body: { text: telegramText } }).catch((e) => console.warn('telegram falhou', e));

    return new Response(
      JSON.stringify({ ok: true, curationPostId: curationPost.id, authoredPostId: authoredPost.id, itemsCollected: pool.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    // Erros do Postgrest são objetos ({message, details, hint, code}) — sem isso
    // o log/response virava "[object Object]" e escondia a causa real.
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null
          ? [(error as any).message, (error as any).details, (error as any).hint, (error as any).code]
              .filter(Boolean)
              .join(' | ') || JSON.stringify(error)
          : String(error);
    console.error('content-pipeline-fetch falhou', message);

    await supabase
      .from('content_pipeline_runs')
      .upsert({ run_date: today, status: 'failed', error_message: message }, { onConflict: 'run_date' });
    await supabase.functions
      .invoke('notify-telegram', { body: { text: `⚠️ Pipeline de conteúdo falhou hoje: ${message}` } })
      .catch(() => {});
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
