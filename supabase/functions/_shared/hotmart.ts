// Leitura dos eventos do webhook da Hotmart (versão 2.0.0).
// Sem dependências de Deno: dá para testar com Node.
//
// Formato esperado (resumo):
// { id, event: "PURCHASE_APPROVED", version: "2.0.0",
//   data: { product: { id, ucode, name },
//           buyer: { email, name },
//           purchase: { transaction, status, offer: { code } } } }
// O hottok chega no cabeçalho X-HOTMART-HOTTOK (e, nas versões antigas, no corpo).

export type AcaoHotmart = 'liberar' | 'revogar' | 'ignorar';

export type EventoHotmart = {
  evento: string | null;
  transacao: string | null;
  email: string | null;
  nome: string | null;
  produtoIds: string[];
  acao: AcaoHotmart;
};

const LIBERA = new Set(['PURCHASE_APPROVED', 'PURCHASE_COMPLETE']);
const REVOGA = new Set(['PURCHASE_REFUNDED', 'PURCHASE_CHARGEBACK', 'PURCHASE_CANCELED']);

const texto = (v: unknown): string | null => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s ? s : null;
};

export function acaoDoEvento(evento: string | null): AcaoHotmart {
  if (!evento) return 'ignorar';
  const e = evento.toUpperCase();
  if (LIBERA.has(e)) return 'liberar';
  if (REVOGA.has(e)) return 'revogar';
  return 'ignorar';
}

// deno-lint-ignore no-explicit-any
export function interpretarEvento(payload: any): EventoHotmart {
  const data = payload?.data ?? {};
  const evento = texto(payload?.event)?.toUpperCase() ?? null;
  const email = texto(data?.buyer?.email)?.toLowerCase() ?? null;
  const produtoIds = [texto(data?.product?.id), texto(data?.product?.ucode)].filter((x): x is string => !!x);
  return {
    evento,
    transacao: texto(data?.purchase?.transaction),
    email,
    nome: texto(data?.buyer?.name),
    produtoIds,
    acao: acaoDoEvento(evento),
  };
}

/** Comparação em tempo constante, para não vazar o segredo por tempo de resposta. */
export function iguaisSeguro(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function hottokValido(cabecalho: string | null, doCorpo: unknown, segredo: string): boolean {
  if (!segredo) return false;
  const recebido = texto(cabecalho) ?? texto(doCorpo);
  return !!recebido && iguaisSeguro(recebido, segredo);
}

/** Tira o hottok antes de guardar o payload no log. */
// deno-lint-ignore no-explicit-any
export function semSegredo(payload: any) {
  if (!payload || typeof payload !== 'object') return payload;
  const { hottok: _h, ...resto } = payload;
  return resto;
}
