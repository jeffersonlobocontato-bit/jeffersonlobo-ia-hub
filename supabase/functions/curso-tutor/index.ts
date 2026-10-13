// Tutor da Ilha: responde dúvidas do aluno usando só o conteúdo do curso
// (transcrições das aulas, manuais e regras do curso). Mesmo gateway de IA do
// chatbot do site (LOVABLE_API_KEY), sem chave nova.
//
// verify_jwt = true: só aluno logado chama. Aqui dentro conferimos se ele tem
// acesso ao curso, limitamos as perguntas por dia e gravamos cada pergunta e
// resposta em curso_tutor_mensagens (o admin vê na aba Cursos).
import { createClient } from 'npm:@supabase/supabase-js@2';
import { CONHECIMENTO_ILHA } from '../_shared/cursos/ilha-conhecimento.ts';
import { CONHECIMENTO_POCKETS } from '../_shared/cursos/pockets-conhecimento.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

// Uma base por produto. Os pockets têm o texto dos PDFs; quem tem a Ilha usa
// o Tutor do pocket pelo bônus (o acesso vem pela inclusão no banco).
const CONHECIMENTO: Record<string, { nome: string; texto: string; tipo?: 'curso' | 'pocket' }> = {
  ilha: { nome: 'Ilha de Edição completa', texto: CONHECIMENTO_ILHA },
  ...Object.fromEntries(Object.entries(CONHECIMENTO_POCKETS).map(([k, v]) => [k, { ...v, tipo: 'pocket' as const }])),
};

const LIMITE_DIA = 40;
const MAX_HISTORICO = 12;
const MAX_CARACTERES = 1500;

const sistema = (nomeCurso: string, aula: string | null, conhecimento: string, pocket = false) => `Você é o ${pocket ? 'Tutor da Academia' : 'Tutor da Ilha'}, o assistente de dúvidas ${pocket ? 'do pocket' : 'do curso'} "${nomeCurso}", do Jefferson Lobo.
Você é uma IA e, se perguntarem, diz isso com naturalidade. Não se apresente como o Jefferson.

Como responder:
- Use SOMENTE o conteúdo do curso abaixo. Não invente botões, telas, preços, prazos ou recursos que não estejam nele.
- Se a resposta não estiver no conteúdo, diga que não está nas aulas e sugira o botão "Falar com o suporte" (WhatsApp do Jefferson).
- Português do Brasil, tom direto e acolhedor, frases curtas, como o Jefferson fala nas aulas. Trate o aluno por "você".
- Respostas curtas: até 6 frases ou uma lista de até 6 passos. Diga em que aula e passo aquilo aparece, quando ajudar.
- Nunca peça e nunca aceite senha, chave, token ou código de acesso. Se o aluno colar algo assim, avise para apagar e trocar a chave.
- Não dê conselho jurídico, médico ou financeiro.
${aula ? `\nO aluno está na aula "${aula}". Priorize o conteúdo dela, sem ignorar as outras.\n` : ''}
CONTEÚDO DO CURSO
-----------------
${conhecimento}`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return json(405, { error: 'use POST' });

  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) return json(500, { error: 'Tutor sem configuração de IA.' });

  const auth = req.headers.get('Authorization') ?? '';
  const url = Deno.env.get('SUPABASE_URL')!;
  const doAluno = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  const { data: { user } } = await doAluno.auth.getUser();
  if (!user) return json(401, { error: 'Entre na área do aluno para usar o Tutor.' });

  // deno-lint-ignore no-explicit-any
  let body: any;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'Pedido inválido.' });
  }

  const curso = String(body?.curso ?? '');
  const aula = body?.aula ? String(body.aula).slice(0, 80) : null;
  const base = CONHECIMENTO[curso];
  if (!base) return json(400, { error: 'Curso desconhecido.' });

  const mensagens = Array.isArray(body?.mensagens) ? body.mensagens : [];
  const historico = mensagens
    .filter((m: any) => (m?.role === 'user' || m?.role === 'assistant') && typeof m?.content === 'string')
    .slice(-MAX_HISTORICO)
    .map((m: any) => ({ role: m.role, content: String(m.content).slice(0, MAX_CARACTERES) }));
  const pergunta = historico.at(-1);
  if (!pergunta || pergunta.role !== 'user' || !pergunta.content.trim()) return json(400, { error: 'Escreva a sua dúvida.' });

  const { data: temAcesso, error: erroAcesso } = await doAluno.rpc('tem_acesso_curso', { _curso: curso });
  if (erroAcesso) return json(500, { error: 'Não consegui conferir o seu acesso.' });
  if (!temAcesso) return json(403, { error: 'Este e-mail não tem acesso a este curso.' });

  const desde = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count } = await admin
    .from('curso_tutor_mensagens')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', desde);
  if ((count ?? 0) >= LIMITE_DIA) {
    return json(429, { error: `Você chegou ao limite de ${LIMITE_DIA} perguntas em 24 horas. Volte amanhã ou fale com o suporte.` });
  }

  const resposta = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'system', content: sistema(base.nome, aula, base.texto, base.tipo === 'pocket') }, ...historico],
    }),
  });

  if (!resposta.ok) {
    const detalhe = await resposta.text().catch(() => '');
    console.error('curso-tutor gateway', resposta.status, detalhe.slice(0, 300));
    if (resposta.status === 429) return json(429, { error: 'Muita gente perguntando agora. Tente de novo em instantes.' });
    if (resposta.status === 402) return json(402, { error: 'O Tutor está sem créditos de IA. Avise o suporte.' });
    return json(502, { error: 'O Tutor não respondeu. Tente de novo.' });
  }

  const dados = await resposta.json();
  const texto: string = dados?.choices?.[0]?.message?.content?.trim() || 'Não consegui responder agora. Tente reformular a pergunta.';

  await admin.from('curso_tutor_mensagens').insert({
    user_id: user.id,
    email: user.email,
    curso_slug: curso,
    aula_slug: aula,
    pergunta: pergunta.content,
    resposta: texto,
  });

  return json(200, { resposta: texto });
});
