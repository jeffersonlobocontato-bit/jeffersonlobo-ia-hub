// Webhook do Mercado Pago: cada aviso de pagamento faz a gente buscar o
// pagamento na API do MP (com o nosso token) e atualizar o pedido; aprovado
// libera o acesso, reembolso/contestação/cancelamento tira.
//
// Configuração (uma vez), em Suas integrações › sua aplicação › Webhooks:
// - URL de produção: https://<projeto>.supabase.co/functions/v1/mercadopago-webhook
// - Evento: Pagamentos
// - Copie a "assinatura secreta" para o segredo MERCADOPAGO_WEBHOOK_SECRET.
// Também precisa do MERCADOPAGO_ACCESS_TOKEN (o mesmo do checkout).
//
// verify_jwt = false. Quando o aviso traz x-signature e o segredo está
// configurado, a assinatura precisa bater (senão 401). Mesmo sem assinatura,
// nada é liberado só pelo aviso: vale o que a API do MP responde.
// Responde 200 depois de processar (o MP reenvia a cada 15 minutos se não
// receber 200/201), inclusive quando há erro, que fica em pagamento_eventos.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { assinaturaValida } from '../_shared/mercadopago.ts';
import { processarPagamento } from '../_shared/cursos/pagamento-mp.ts';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json(405, { erro: 'use POST' });

  const token = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN') ?? '';
  if (!token) {
    console.error('MERCADOPAGO_ACCESS_TOKEN não configurado');
    return json(500, { erro: 'webhook sem configuração' });
  }

  const url = new URL(req.url);
  // deno-lint-ignore no-explicit-any
  let corpo: any = {};
  try {
    corpo = await req.json();
  } catch {
    corpo = {};
  }

  const tipo = url.searchParams.get('type') ?? url.searchParams.get('topic') ?? corpo?.type ?? corpo?.topic ?? null;
  const dataIdUrl = url.searchParams.get('data.id') ?? url.searchParams.get('id');
  const recursoId = String(dataIdUrl ?? corpo?.data?.id ?? '').trim();

  const segredo = Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET') ?? '';
  const xSignature = req.headers.get('x-signature');
  if (segredo && xSignature) {
    const ok = await assinaturaValida({
      xSignature,
      xRequestId: req.headers.get('x-request-id'),
      dataId: dataIdUrl,
      segredo,
    });
    if (!ok) return json(401, { erro: 'assinatura inválida' });
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  let acao = 'ignorado';
  let erro: string | null = null;
  let pedidoId: string | null = null;
  if (tipo === 'payment' && /^\d{1,20}$/.test(recursoId)) {
    try {
      const r = await processarPagamento(supabase, token, recursoId);
      acao = r.status ? `${r.status}: ${r.acao}` : r.acao;
      erro = r.erro;
      pedidoId = r.pedidoId;
    } catch (e) {
      erro = e instanceof Error ? e.message : String(e);
      console.error('mercadopago-webhook', erro);
    }
  }

  await supabase.from('pagamento_eventos').insert({
    provedor: 'mercadopago',
    tipo,
    recurso_id: recursoId || null,
    pedido_id: pedidoId,
    acao,
    erro,
    payload: { query: Object.fromEntries(url.searchParams), corpo, assinado: Boolean(xSignature) },
  });

  return json(200, { ok: !erro, acao });
});
