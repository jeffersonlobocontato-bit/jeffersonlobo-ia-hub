// Compra direta dos cursos pelo Mercado Pago (Checkout Pro).
//
// POST { acao: 'criar', curso, email, nome? }
//   -> cria o pedido e a preferência no MP com o preço vigente (lote do curso
//      ou preço fixo do pocket, calculado aqui, nunca vindo do navegador) e
//      devolve { url } para o
//      comprador pagar na página do Mercado Pago. Se o e-mail já tem acesso,
//      devolve { jaTemAcesso: true }.
// POST { acao: 'confirmar', pedido, pagamento? }
//   -> chamado pela página de obrigado. Com o id do pagamento, busca o
//      pagamento no MP e processa (libera o acesso se aprovado, mesmo que o
//      webhook ainda não tenha chegado). Devolve só { status }.
//
// Segredo necessário: MERCADOPAGO_ACCESS_TOKEN (Access Token de produção da
// aplicação, em Suas integrações › Credenciais). verify_jwt = false: quem
// compra ainda não tem conta.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { API_MP, emailValido, montarPreferencia } from '../_shared/mercadopago.ts';
import { CATALOGO, SITE, precoAtual } from '../_shared/cursos/catalogo.ts';
import { processarPagamento } from '../_shared/cursos/pagamento-mp.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LIMITE_POR_HORA = 8;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json(405, { erro: 'use POST' });

  const token = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN') ?? '';
  if (!token) return json(503, { erro: 'pagamento ainda não configurado' });

  // deno-lint-ignore no-explicit-any
  let corpo: any;
  try {
    corpo = await req.json();
  } catch {
    return json(400, { erro: 'JSON inválido' });
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  try {
    if (corpo?.acao === 'confirmar') {
      const pedido = String(corpo.pedido ?? '');
      if (!UUID.test(pedido)) return json(400, { erro: 'pedido inválido' });
      const pagamento = corpo.pagamento ? String(corpo.pagamento) : '';
      if (pagamento && /^\d{1,20}$/.test(pagamento)) {
        const r = await processarPagamento(supabase, token, pagamento, pedido);
        if (r.status) return json(200, { status: r.status });
      }
      const { data } = await supabase.from('curso_pedidos').select('status').eq('id', pedido).maybeSingle();
      return json(200, { status: data?.status ?? null });
    }

    if (corpo?.acao !== 'criar') return json(400, { erro: 'ação desconhecida' });

    const curso = String(corpo.curso ?? '');
    const info = CATALOGO[curso];
    const preco = precoAtual(curso);
    if (!info || !preco) return json(400, { erro: 'curso não encontrado' });
    if (!emailValido(corpo.email)) return json(400, { erro: 'Confira o e-mail.' });
    const email = String(corpo.email).trim().toLowerCase();
    const nome = typeof corpo.nome === 'string' ? corpo.nome.trim().slice(0, 120) || null : null;

    // Já tem acesso: pelo próprio produto ou por um curso que o inclui (a Ilha
    // traz os pockets). A função do banco responde as duas coisas.
    const { data: jaTem, error: erroAcesso } = await supabase.rpc('acesso_ativo_por_email', { _email: email, _curso: curso });
    if (erroAcesso) console.error('acesso_ativo_por_email', erroAcesso.message);
    if (jaTem === true) return json(200, { jaTemAcesso: true });

    const umaHora = new Date(Date.now() - 3600_000).toISOString();
    const { count } = await supabase
      .from('curso_pedidos')
      .select('id', { count: 'exact', head: true })
      .eq('email', email)
      .gte('created_at', umaHora);
    if ((count ?? 0) >= LIMITE_POR_HORA) return json(429, { erro: 'Muitas tentativas com este e-mail. Espere alguns minutos.' });

    const { data: pedido, error: erroPedido } = await supabase
      .from('curso_pedidos')
      .insert({ curso_slug: curso, email, nome, lote: preco.lote, valor: preco.preco })
      .select('id')
      .single();
    if (erroPedido || !pedido) throw new Error(`criar pedido: ${erroPedido?.message}`);

    const preferencia = montarPreferencia({
      pedidoId: pedido.id,
      curso,
      nomeCurso: info.nome,
      imagem: info.imagem,
      preco: preco.preco,
      lote: preco.lote,
      descricao: info.descricao(preco.lote),
      email,
      nome,
      site: SITE,
      pagina: info.pagina,
      notificacao: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercadopago-webhook`,
    });

    const r = await fetch(`${API_MP}/checkout/preferences`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'X-Idempotency-Key': pedido.id },
      body: JSON.stringify(preferencia),
    });
    const pref = await r.json().catch(() => null);
    if (!r.ok || !pref?.init_point) {
      console.error('preferência MP falhou', r.status, pref);
      throw new Error(`Mercado Pago respondeu ${r.status} ao criar o pagamento`);
    }

    await supabase.from('curso_pedidos').update({ preferencia_id: pref.id }).eq('id', pedido.id);
    return json(200, { url: pref.init_point, pedido: pedido.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('mercadopago-checkout', msg);
    return json(500, { erro: 'Não consegui abrir o pagamento agora. Tente de novo em instantes.' });
  }
});
