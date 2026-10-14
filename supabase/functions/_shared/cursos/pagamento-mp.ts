// Processa um pagamento do Mercado Pago: busca o pagamento na API do MP com o
// nosso token (a fonte da verdade), atualiza o pedido e libera ou tira o acesso.
// Usado pelo webhook e pela confirmação que a página de obrigado pede.
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { API_MP, acaoDoStatus, statusDoPagamento, type StatusPedido } from '../mercadopago.ts';
import { CATALOGO, linkDeEntrada } from './catalogo.ts';
import { documentoDoPagador, nomeDoPagador } from './comprador.ts';

export type Resultado = { pedidoId: string | null; status: StatusPedido | null; acao: string; erro: string | null };

async function avisarTelegram(supabase: SupabaseClient, text: string) {
  try {
    await supabase.functions.invoke('notify-telegram', { body: { text } });
  } catch (e) {
    console.warn('telegram falhou', e);
  }
}

// deno-lint-ignore no-explicit-any
export async function buscarPagamento(token: string, id: string): Promise<any | null> {
  const r = await fetch(`${API_MP}/v1/payments/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${token}` } });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`Mercado Pago respondeu ${r.status} ao buscar o pagamento ${id}`);
  return r.json();
}

type Pedido = { id: string; curso_slug: string; email: string; nome: string | null; valor: number; status: string };

async function liberar(supabase: SupabaseClient, p: Pedido, pagamentoId: string) {
  const { data: atual, error: erroBusca } = await supabase
    .from('curso_acessos')
    .select('id, status')
    .eq('email', p.email)
    .eq('curso_slug', p.curso_slug)
    .maybeSingle();
  if (erroBusca) throw new Error(`busca do acesso: ${erroBusca.message}`);
  // Já tinha acesso ativo (outra compra ou acesso manual): não mexe em nada.
  if (atual?.status === 'ativo') return 'já estava ativo';

  const { error } = await supabase.from('curso_acessos').upsert(
    { email: p.email, nome: p.nome, curso_slug: p.curso_slug, status: 'ativo', origem: 'mercadopago', pedido_id: p.id, observacao: `MP ${pagamentoId}` },
    { onConflict: 'email,curso_slug' },
  );
  if (error) throw new Error(`gravar acesso: ${error.message}`);

  const nomeCurso = CATALOGO[p.curso_slug]?.nome ?? p.curso_slug;
  const ehPocket = CATALOGO[p.curso_slug]?.tipo === 'pocket';
  const { error: erroEmail } = await supabase.functions.invoke('send-transactional-email', {
    body: {
      templateName: ehPocket ? 'pocket-acesso-liberado' : 'curso-acesso-liberado',
      recipientEmail: p.email,
      idempotencyKey: `curso-acesso-${p.curso_slug}-mp-${p.id}`,
      templateData: { nome: p.nome ?? undefined, curso: nomeCurso, link: linkDeEntrada(p.email, p.curso_slug) },
    },
  });
  if (erroEmail) console.error('e-mail de acesso falhou', erroEmail);

  await avisarTelegram(
    supabase,
    `${ehPocket ? '📘 <b>Pocket vendido</b>' : '🎓 <b>Nova matrícula</b>'} (Mercado Pago)\n${nomeCurso} · R$ ${Number(p.valor).toFixed(2).replace('.', ',')}\n${p.nome ?? ''} · ${p.email}\nPagamento ${pagamentoId}` +
      (erroEmail ? '\n⚠️ O e-mail de acesso não saiu: confira em /admin › Cursos.' : ''),
  );
  return erroEmail ? 'acesso liberado, e-mail falhou' : 'acesso liberado';
}

async function revogar(supabase: SupabaseClient, p: Pedido, status: StatusPedido) {
  const { data, error } = await supabase
    .from('curso_acessos')
    .update({ status: 'revogado', observacao: `MP ${status} ${new Date().toISOString().slice(0, 10)}` })
    .eq('email', p.email)
    .eq('curso_slug', p.curso_slug)
    .eq('origem', 'mercadopago')
    .eq('pedido_id', p.id)
    .select('id');
  if (error) throw new Error(`revogar acesso: ${error.message}`);
  await avisarTelegram(
    supabase,
    `↩️ <b>Pagamento ${status}</b> (Mercado Pago)\n${CATALOGO[p.curso_slug]?.nome ?? p.curso_slug}\n${p.email}\nAcesso revogado: ${data?.length ? 'sim' : 'nenhum encontrado'}`,
  );
  return data?.length ? 'acesso revogado' : 'nenhum acesso deste pedido';
}

/**
 * pedidoEsperado: quando a confirmação vem da página de obrigado, o pagamento
 * precisa ser daquele pedido (evita usar o id de outro pagamento).
 */
export async function processarPagamento(
  supabase: SupabaseClient,
  token: string,
  pagamentoId: string,
  pedidoEsperado?: string,
): Promise<Resultado> {
  const pg = await buscarPagamento(token, pagamentoId);
  if (!pg) return { pedidoId: null, status: null, acao: 'pagamento não encontrado no Mercado Pago', erro: null };

  const pedidoId = typeof pg.external_reference === 'string' ? pg.external_reference : null;
  if (!pedidoId || !/^[0-9a-f-]{36}$/i.test(pedidoId)) return { pedidoId: null, status: null, acao: 'pagamento sem pedido do site (ignorado)', erro: null };
  if (pedidoEsperado && pedidoEsperado !== pedidoId) return { pedidoId, status: null, acao: 'ignorado', erro: 'o pagamento não é deste pedido' };

  const { data: pedido, error: erroPedido } = await supabase
    .from('curso_pedidos')
    .select('id, curso_slug, email, nome, valor, status')
    .eq('id', pedidoId)
    .maybeSingle();
  if (erroPedido) throw new Error(`busca do pedido: ${erroPedido.message}`);
  if (!pedido) return { pedidoId, status: null, acao: 'ignorado', erro: `pedido ${pedidoId} não existe` };

  const status = statusDoPagamento(pg.status);
  let acao = acaoDoStatus(status);
  let erro: string | null = null;

  // Confere moeda e valor antes de liberar: o preço vem do pedido, não do aviso.
  if (acao === 'liberar' && (pg.currency_id !== 'BRL' || Number(pg.transaction_amount) + 0.009 < Number(pedido.valor))) {
    erro = `valor pago (${pg.currency_id} ${pg.transaction_amount}) menor que o do pedido (BRL ${pedido.valor})`;
    acao = 'nada';
  }

  const dados = {
    status,
    pagamento_id: String(pg.id),
    forma_pagamento: pg.payment_type_id ?? pg.payment_method_id ?? null,
    parcelas: pg.installments ?? null,
    valor_pago: pg.transaction_amount ?? null,
    aprovado_em: pg.date_approved ?? null,
  };
  // CPF/CNPJ e nome do pagador vão para a nota fiscal. Só grava o que veio
  // (não apaga o que o admin completou no painel). Se as colunas ainda não
  // existirem (migração das notas não aplicada), atualiza sem elas: o
  // pagamento nunca depende da nota.
  const doc = documentoDoPagador(pg);
  const nomePagador = nomeDoPagador(pg);
  const comprador = { ...(doc ? { comprador_doc: doc } : {}), ...(nomePagador ? { comprador_nome: nomePagador } : {}) };
  let { error: erroUpd } = await supabase.from('curso_pedidos').update({ ...dados, ...comprador }).eq('id', pedidoId);
  if (erroUpd && Object.keys(comprador).length && /comprador_/.test(erroUpd.message ?? '')) {
    ({ error: erroUpd } = await supabase.from('curso_pedidos').update(dados).eq('id', pedidoId));
  }
  if (erroUpd) throw new Error(`atualizar pedido: ${erroUpd.message}`);

  let resultado = `status ${status}`;
  if (acao === 'liberar') resultado = await liberar(supabase, pedido as Pedido, String(pg.id));
  if (acao === 'revogar') resultado = await revogar(supabase, pedido as Pedido, status);
  if (erro) await avisarTelegram(supabase, `⚠️ <b>Mercado Pago</b>\nPedido ${pedidoId}\n${erro}`);

  return { pedidoId, status, acao: resultado, erro };
}
