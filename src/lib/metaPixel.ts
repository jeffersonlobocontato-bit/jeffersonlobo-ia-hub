// Eventos do Meta Pixel. O snippet do index.html só carrega o pixel fora do
// /admin e fora de navegadores internos (analytics_ignorar), então aqui basta
// checar se window.fbq existe. Nenhum evento leva e-mail, nome ou telefone.
type Fbq = ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[] };

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

const interno = () => {
  try {
    return localStorage.getItem('analytics_ignorar') === '1';
  } catch {
    return false;
  }
};

function enviar(...args: unknown[]) {
  if (interno()) return;
  try {
    window.fbq?.(...args);
  } catch {
    /* pixel bloqueado: ignora */
  }
}

const novoId = (prefixo: string) =>
  `${prefixo}-${typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;

export function trackPageView() {
  enviar('track', 'PageView');
}

export function trackLead(params: { content_name: string; content_category?: string; eventID?: string }) {
  enviar('track', 'Lead', { content_name: params.content_name, content_category: params.content_category ?? 'material_gratuito' }, { eventID: params.eventID ?? novoId('lead') });
}

export function trackViewContent(params: { value: number; content_id: string; content_name: string }) {
  enviar(
    'track',
    'ViewContent',
    { value: params.value, currency: 'BRL', content_ids: [params.content_id], content_type: 'product', content_name: params.content_name },
    { eventID: novoId('vc') },
  );
}

export function trackInitiateCheckout(params: { value: number; content_id: string; content_name: string }) {
  enviar(
    'track',
    'InitiateCheckout',
    { value: params.value, currency: 'BRL', content_ids: [params.content_id], content_type: 'product', content_name: params.content_name, num_items: 1 },
    { eventID: novoId('ic') },
  );
}

/** E-mail enviado na janela de compra (pedido criado, indo para o Mercado Pago). */
export function trackAddPaymentInfo(params: { value: number; content_id: string; content_name: string; pedido: string }) {
  enviar(
    'track',
    'AddPaymentInfo',
    { value: params.value, currency: 'BRL', content_ids: [params.content_id], content_type: 'product', content_name: params.content_name },
    { eventID: `api-${params.pedido}` },
  );
}

// Compra aprovada. eventID = id do pedido, o mesmo que o servidor (Conversions
// API) usa, para a Meta deduplicar. A marca no localStorage evita repetir no
// recarregamento da página.
export function trackPurchase(params: { value: number; content_id: string; content_name: string; pedido: string }) {
  const marca = `px-compra-${params.pedido}`;
  try {
    if (localStorage.getItem(marca)) return;
    localStorage.setItem(marca, '1');
  } catch {
    /* navegação privada: dispara mesmo assim */
  }
  enviar(
    'track',
    'Purchase',
    { value: params.value, currency: 'BRL', content_ids: [params.content_id], content_type: 'product', content_name: params.content_name, num_items: 1 },
    { eventID: params.pedido },
  );
}

/** Cookies do pixel e página atual (sem query), gravados no pedido para a Conversions API. */
export function rastreioParaPedido() {
  const cookie = (nome: string) => {
    try {
      return document.cookie.split('; ').find((c) => c.startsWith(`${nome}=`))?.slice(nome.length + 1);
    } catch {
      return undefined;
    }
  };
  let fbclid: string | undefined;
  try {
    fbclid = new URLSearchParams(window.location.search).get('fbclid') ?? undefined;
    if (fbclid) localStorage.setItem('px-fbclid', JSON.stringify({ v: fbclid, em: Date.now() }));
    else {
      const g = JSON.parse(localStorage.getItem('px-fbclid') || 'null');
      if (g && Date.now() - Number(g.em) < 90 * 864e5) fbclid = g.v;
    }
  } catch {
    /* sem armazenamento */
  }
  const fbp = cookie('_fbp');
  const fbc = cookie('_fbc') ?? (fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined);
  return {
    fbclid,
    fbp,
    fbc,
    event_source_url: `${window.location.origin}${window.location.pathname}`,
    ignorar: interno() || undefined,
  };
}
