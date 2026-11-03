// Purchase pela Conversions API da Meta, quando o pedido é aprovado.
// - event_id = id do pedido (o mesmo eventID do Purchase do navegador): a Meta deduplica.
// - Valor = curso_pedidos.valor (o lote em que a pessoa comprou), BRL.
// - Envia uma vez por pedido: reserva a linha (capi_enviado_em) antes de mandar;
//   se a Meta recusar, libera a reserva para o próximo aviso tentar de novo.
// - Sem META_CAPI_ACCESS_TOKEN: não faz nada (falha silenciosa, só log).
// - E-mail/telefone hasheados só vão se o pedido tiver aceite explícito de
//   anúncios gravado (rastreio.consentimento_anuncios === true). Hoje não há
//   banner, então não vão.
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

const PIXEL_ID = '1629134600491040';
const VERSAO = 'v26.0';

async function sha256(v: string) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(v));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

type Rastreio = {
  fbp?: string;
  fbc?: string;
  fbclid?: string;
  event_source_url?: string;
  client_ip?: string;
  user_agent?: string;
  ignorar?: boolean;
  consentimento_anuncios?: boolean;
  telefone?: string;
};

export async function enviarPurchaseCapi(supabase: SupabaseClient, pedidoId: string) {
  const token = Deno.env.get('META_CAPI_ACCESS_TOKEN') ?? '';
  if (!token) {
    console.warn('CAPI: META_CAPI_ACCESS_TOKEN não configurado; Purchase não enviado', pedidoId);
    return;
  }
  try {
    const { data: p } = await supabase
      .from('curso_pedidos')
      .select('id, curso_slug, email, valor, status, aprovado_em, created_at, rastreio, is_test, capi_enviado_em')
      .eq('id', pedidoId)
      .maybeSingle();
    if (!p || p.status !== 'aprovado' || p.capi_enviado_em) return;
    const r = (p.rastreio ?? {}) as Rastreio;
    if (p.is_test || r.ignorar) {
      await supabase.from('curso_pedidos').update({ capi_resultado: 'ignorado (teste/interno)' }).eq('id', p.id);
      return;
    }

    // reserva atômica: só um processo envia
    const { data: reservado } = await supabase
      .from('curso_pedidos')
      .update({ capi_enviado_em: new Date().toISOString(), capi_resultado: 'enviando' })
      .eq('id', p.id)
      .is('capi_enviado_em', null)
      .select('id');
    if (!reservado?.length) return;

    const quando = new Date(p.aprovado_em ?? p.created_at).getTime();
    const agora = Date.now();
    const eventTime = Math.floor((agora - quando > 6.5 * 864e5 || quando > agora ? agora : quando) / 1000);

    const user_data: Record<string, unknown> = {};
    if (r.client_ip) user_data.client_ip_address = r.client_ip;
    user_data.client_user_agent = r.user_agent ?? 'unknown';
    if (r.fbp) user_data.fbp = r.fbp;
    if (r.fbc) user_data.fbc = r.fbc;
    if (r.consentimento_anuncios === true) {
      user_data.em = [await sha256(String(p.email).trim().toLowerCase())];
      const tel = (r.telefone ?? '').replace(/\D/g, '');
      if (tel) user_data.ph = [await sha256(tel)];
    }

    const corpo = {
      data: [
        {
          event_name: 'Purchase',
          event_time: eventTime,
          event_id: p.id,
          action_source: 'website',
          event_source_url: r.event_source_url ?? 'https://jeffersonlobo.tech/cursos/obrigado',
          user_data,
          custom_data: {
            value: Number(p.valor),
            currency: 'BRL',
            content_ids: [p.curso_slug],
            content_type: 'product',
            num_items: 1,
            order_id: p.id,
          },
        },
      ],
      partner_agent: 'lovable',
      ...(Deno.env.get('META_CAPI_TEST_EVENT_CODE') ? { test_event_code: Deno.env.get('META_CAPI_TEST_EVENT_CODE') } : {}),
    };

    const resp = await fetch(`https://graph.facebook.com/${VERSAO}/${PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
    });
    const txt = (await resp.text()).slice(0, 300);
    if (resp.ok) {
      await supabase.from('curso_pedidos').update({ capi_resultado: `ok ${txt}` }).eq('id', p.id);
    } else {
      console.error('CAPI recusou', resp.status, txt);
      await supabase.from('curso_pedidos').update({ capi_enviado_em: null, capi_resultado: `erro ${resp.status} ${txt}` }).eq('id', p.id);
    }
  } catch (e) {
    console.error('CAPI falhou', e instanceof Error ? e.message : e);
    await supabase.from('curso_pedidos').update({ capi_enviado_em: null, capi_resultado: 'erro de rede' }).eq('id', pedidoId).then(() => null, () => null);
  }
}
