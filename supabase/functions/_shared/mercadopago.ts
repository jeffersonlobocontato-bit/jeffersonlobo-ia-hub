// Mercado Pago (Checkout Pro): pagamento direto dos cursos, sem a Hotmart.
// Sem dependências de Deno: dá para testar com Node (Web Crypto é global nos dois).
//
// Fluxo:
// 1. mercadopago-checkout cria um pedido (curso_pedidos) e uma "preferência" no
//    Mercado Pago com o preço do lote vigente; o comprador paga na página do MP.
// 2. O MP avisa o mercadopago-webhook (e o comprador volta para /cursos/obrigado,
//    que também pede a confirmação). Nos dois casos buscamos o pagamento na API
//    do MP com o nosso token: é essa consulta, e não o aviso, que vale.
// 3. Pagamento aprovado libera o acesso; reembolso, contestação ou cancelamento
//    tiram o acesso que veio daquele pedido.

export const API_MP = 'https://api.mercadopago.com';

export type StatusPedido = 'criado' | 'pendente' | 'aprovado' | 'recusado' | 'cancelado' | 'reembolsado' | 'contestado' | 'em_disputa';
export type AcaoPagamento = 'liberar' | 'revogar' | 'nada';

/** Status do pagamento no MP -> status do nosso pedido. */
export function statusDoPagamento(status: string | null | undefined): StatusPedido {
  switch ((status ?? '').toLowerCase()) {
    case 'approved':
      return 'aprovado';
    case 'pending':
    case 'in_process':
    case 'authorized':
      return 'pendente';
    case 'rejected':
      return 'recusado';
    case 'cancelled':
      return 'cancelado';
    case 'refunded':
      return 'reembolsado';
    case 'charged_back':
      return 'contestado';
    case 'in_mediation':
      return 'em_disputa';
    default:
      return 'pendente';
  }
}

export function acaoDoStatus(s: StatusPedido): AcaoPagamento {
  if (s === 'aprovado') return 'liberar';
  if (s === 'reembolsado' || s === 'contestado' || s === 'cancelado') return 'revogar';
  return 'nada';
}

const hex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');

function iguais(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

/** Lê "ts=...,v1=..." do cabeçalho x-signature. */
export function lerAssinatura(cabecalho: string | null | undefined): { ts: string | null; v1: string | null } {
  let ts: string | null = null;
  let v1: string | null = null;
  for (const parte of (cabecalho ?? '').split(',')) {
    const [k, ...resto] = parte.split('=');
    const v = resto.join('=').trim();
    if (k?.trim() === 'ts') ts = v || null;
    if (k?.trim() === 'v1') v1 = v || null;
  }
  return { ts, v1 };
}

/** Monta o texto assinado pelo MP: "id:<data.id>;request-id:<x-request-id>;ts:<ts>;"
 *  (o que não veio na notificação sai do texto, como manda a documentação). */
export function manifesto(dataId: string | null, requestId: string | null, ts: string | null) {
  return (dataId ? `id:${dataId};` : '') + (requestId ? `request-id:${requestId};` : '') + (ts ? `ts:${ts};` : '');
}

/**
 * Confere a assinatura do webhook (HMAC-SHA256 em hexadecimal com a chave secreta
 * da aplicação). toleranciaSeg limita a idade do aviso; 0 desliga essa checagem.
 */
export async function assinaturaValida(p: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
  segredo: string;
  agora?: number;
  toleranciaSeg?: number;
}): Promise<boolean> {
  const { ts, v1 } = lerAssinatura(p.xSignature);
  if (!p.segredo || !ts || !v1) return false;
  const tol = p.toleranciaSeg ?? 0;
  if (tol > 0) {
    // o MP manda ts em milissegundos em alguns avisos e em segundos em outros
    const n = Number(ts);
    const ms = n > 1e12 ? n : n * 1000;
    if (!Number.isFinite(n) || Math.abs((p.agora ?? Date.now()) - ms) > tol * 1000) return false;
  }
  const chave = await crypto.subtle.importKey('raw', new TextEncoder().encode(p.segredo), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const assinado = await crypto.subtle.sign('HMAC', chave, new TextEncoder().encode(manifesto(p.dataId, p.xRequestId, ts)));
  return iguais(hex(assinado), v1.toLowerCase());
}

export const emailValido = (e: unknown): e is string => typeof e === 'string' && e.length <= 160 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());

/** Corpo da preferência do Checkout Pro. */
export function montarPreferencia(p: {
  pedidoId: string;
  curso: string;
  nomeCurso: string;
  imagem: string;
  preco: number;
  lote: number;
  email: string;
  nome?: string | null;
  site: string;
  pagina: string;
  notificacao: string;
}) {
  const volta = (estado: string) => `${p.site}/cursos/obrigado?pedido=${p.pedidoId}&estado=${estado}`;
  return {
    items: [
      {
        id: `${p.curso}-lote${p.lote}`,
        title: p.nomeCurso,
        description: `Curso online ${p.nomeCurso} (lote ${p.lote}) com o e-book bônus`,
        picture_url: p.imagem,
        category_id: 'learnings',
        quantity: 1,
        currency_id: 'BRL',
        unit_price: p.preco,
      },
    ],
    payer: { email: p.email, ...(p.nome ? { name: p.nome } : {}) },
    external_reference: p.pedidoId,
    metadata: { pedido_id: p.pedidoId, curso: p.curso, email: p.email },
    back_urls: { success: volta('aprovado'), pending: volta('pendente'), failure: `${p.site}${p.pagina}?pagamento=recusado` },
    auto_return: 'approved',
    notification_url: p.notificacao,
    statement_descriptor: 'JEFFERSONLOBO',
    payment_methods: { installments: 12 },
    binary_mode: false,
  };
}
