// Webhook da Hotmart: a compra aprovada libera o acesso e manda o e-mail de
// boas-vindas; reembolso, chargeback ou cancelamento tiram o acesso.
//
// Configuração (uma vez):
// - Segredo HOTMART_HOTTOK: o "hottok" que a Hotmart mostra em Ferramentas › Webhook.
// - Na aba Cursos do /admin: o ID do produto na Hotmart (chave hotmart_produto_id).
// - Na Hotmart, em Ferramentas › Webhook, cadastrar esta URL:
//   https://<projeto>.supabase.co/functions/v1/hotmart-webhook
//   com os eventos Compra aprovada, Compra completa, Reembolso, Chargeback e Cancelada.
//
// verify_jwt = false (a Hotmart não manda JWT): a autenticação é o hottok.
// Responde 200 mesmo quando não consegue processar, para a Hotmart não ficar
// reenviando; o erro fica registrado em hotmart_eventos e avisa no Telegram.
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { hottokValido, interpretarEvento, semSegredo, type EventoHotmart } from '../_shared/hotmart.ts';
import { CATALOGO, linkDeEntrada } from '../_shared/cursos/catalogo.ts';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

async function avisarTelegram(supabase: SupabaseClient, text: string) {
  try {
    await supabase.functions.invoke('notify-telegram', { body: { text } });
  } catch (e) {
    console.warn('telegram falhou', e);
  }
}

async function liberar(supabase: SupabaseClient, ev: EventoHotmart, curso: string) {
  const { data: atual, error: erroBusca } = await supabase
    .from('curso_acessos')
    .select('id, status')
    .eq('email', ev.email)
    .eq('curso_slug', curso)
    .maybeSingle();
  if (erroBusca) throw new Error(`busca do acesso: ${erroBusca.message}`);

  const { error } = await supabase.from('curso_acessos').upsert(
    {
      email: ev.email,
      nome: ev.nome,
      curso_slug: curso,
      status: 'ativo',
      origem: 'hotmart',
      hotmart_transacao: ev.transacao,
    },
    { onConflict: 'email,curso_slug' },
  );
  if (error) throw new Error(`gravar acesso: ${error.message}`);

  // A Hotmart manda "aprovada" e depois "completa" para a mesma compra:
  // o e-mail e o aviso saem só quando o acesso passa a ativo.
  if (atual?.status === 'ativo') return 'já estava ativo';

  const nomeCurso = CATALOGO[curso]?.nome ?? curso;
  const { error: erroEmail } = await supabase.functions.invoke('send-transactional-email', {
    body: {
      templateName: 'curso-acesso-liberado',
      recipientEmail: ev.email,
      idempotencyKey: `curso-acesso-${curso}-${ev.transacao ?? ev.email}`,
      templateData: {
        nome: ev.nome ?? undefined,
        curso: nomeCurso,
        link: linkDeEntrada(ev.email!, curso),
      },
    },
  });
  if (erroEmail) console.error('e-mail de acesso falhou', erroEmail);

  await avisarTelegram(
    supabase,
    `🎓 <b>Nova matrícula</b>\n${nomeCurso}\n${ev.nome ?? ''} · ${ev.email}\nTransação ${ev.transacao ?? '-'}` +
      (erroEmail ? '\n⚠️ O e-mail de acesso não saiu: confira em /admin › Cursos.' : ''),
  );
  return erroEmail ? 'acesso liberado, e-mail falhou' : 'acesso liberado';
}

async function revogar(supabase: SupabaseClient, ev: EventoHotmart, curso: string) {
  // Só tira o acesso que veio desta compra: acesso dado à mão continua.
  let q = supabase
    .from('curso_acessos')
    .update({ status: 'revogado', observacao: `${ev.evento} ${new Date().toISOString().slice(0, 10)}` })
    .eq('email', ev.email)
    .eq('curso_slug', curso)
    .eq('origem', 'hotmart');
  if (ev.transacao) q = q.eq('hotmart_transacao', ev.transacao);
  const { data, error } = await q.select('id');
  if (error) throw new Error(`revogar acesso: ${error.message}`);
  await avisarTelegram(
    supabase,
    `↩️ <b>${ev.evento}</b>\n${CATALOGO[curso]?.nome ?? curso}\n${ev.email}\nAcesso revogado: ${data?.length ? 'sim' : 'nenhum encontrado'}`,
  );
  return data?.length ? 'acesso revogado' : 'nenhum acesso desta compra';
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'use POST' });

  const segredo = Deno.env.get('HOTMART_HOTTOK') ?? '';
  if (!segredo) {
    console.error('HOTMART_HOTTOK não configurado');
    return json(500, { error: 'webhook sem configuração' });
  }

  // deno-lint-ignore no-explicit-any
  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: 'JSON inválido' });
  }

  if (!hottokValido(req.headers.get('x-hotmart-hottok'), payload?.hottok, segredo)) {
    return json(401, { error: 'hottok inválido' });
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const ev = interpretarEvento(payload);

  let curso: string | null = null;
  if (ev.produtoIds.length) {
    const { data } = await supabase
      .from('curso_config')
      .select('curso_slug')
      .eq('chave', 'hotmart_produto_id')
      .in('valor', ev.produtoIds)
      .limit(1);
    curso = data?.[0]?.curso_slug ?? null;
  }

  let resultado = 'ignorado';
  let erro: string | null = null;
  try {
    if (ev.acao !== 'ignorar') {
      if (!curso) throw new Error(`produto ${ev.produtoIds.join('/') || '?'} não está ligado a nenhum curso (aba Cursos do /admin)`);
      if (!ev.email) throw new Error('evento sem e-mail do comprador');
      resultado = ev.acao === 'liberar' ? await liberar(supabase, ev, curso) : await revogar(supabase, ev, curso);
    }
  } catch (e) {
    erro = e instanceof Error ? e.message : String(e);
    console.error('hotmart-webhook', erro);
    await avisarTelegram(supabase, `⚠️ <b>Webhook Hotmart</b>\n${ev.evento} · ${ev.email ?? '?'}\n${erro}`);
  }

  await supabase.from('hotmart_eventos').insert({
    evento: ev.evento,
    transacao: ev.transacao,
    email: ev.email,
    produto_id: ev.produtoIds[0] ?? null,
    curso_slug: curso,
    acao: erro ? `${ev.acao}: erro` : `${ev.acao}: ${resultado}`,
    erro,
    payload: semSegredo(payload),
  });

  return json(200, { ok: !erro, acao: ev.acao, resultado, erro });
});
