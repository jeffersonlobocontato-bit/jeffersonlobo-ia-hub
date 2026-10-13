import { db } from '@/lib/cursos';

// Compra direta pelo Mercado Pago (edge function mercadopago-checkout).
// O preço é calculado no servidor; aqui só mandamos curso, e-mail e nome.

export type RespostaCompra = { url: string } | { jaTemAcesso: true } | { erro: string };

const CHAVE_EMAIL = 'cursos-compra-email';

export function lembrarEmail(email: string) {
  try {
    sessionStorage.setItem(CHAVE_EMAIL, email);
  } catch {
    /* navegação privada: tudo bem */
  }
}
export function emailLembrado(): string {
  try {
    return sessionStorage.getItem(CHAVE_EMAIL) ?? '';
  } catch {
    return '';
  }
}

async function mensagemDoErro(error: unknown): Promise<string | null> {
  // FunctionsHttpError traz a resposta em context
  const ctx = (error as { context?: Response })?.context;
  if (ctx && typeof ctx.json === 'function') {
    try {
      const corpo = await ctx.json();
      if (corpo?.erro) return String(corpo.erro);
    } catch {
      /* sem corpo */
    }
  }
  return null;
}

export async function criarCompra(curso: string, email: string, nome: string): Promise<RespostaCompra> {
  const { data, error } = await db.functions.invoke('mercadopago-checkout', {
    body: { acao: 'criar', curso, email: email.trim().toLowerCase(), nome: nome.trim() || undefined },
  });
  if (error) {
    const msg = await mensagemDoErro(error);
    if (msg === 'pagamento ainda não configurado') return { erro: 'As vendas abrem em instantes. Se preferir, fale comigo no WhatsApp.' };
    return { erro: msg ?? 'Não consegui abrir o pagamento agora. Tente de novo em instantes.' };
  }
  if (data?.jaTemAcesso) return { jaTemAcesso: true };
  if (data?.url) return { url: String(data.url) };
  return { erro: 'Não consegui abrir o pagamento agora. Tente de novo em instantes.' };
}

export async function confirmarCompra(pedido: string, pagamento?: string | null): Promise<string | null> {
  const { data, error } = await db.functions.invoke('mercadopago-checkout', {
    body: { acao: 'confirmar', pedido, pagamento: pagamento || undefined },
  });
  if (error) return null;
  return data?.status ?? null;
}

export async function statusDoPedido(pedido: string): Promise<string | null> {
  const { data, error } = await db.rpc('status_pedido_curso', { _id: pedido });
  if (error) return null;
  return (data as string | null) ?? null;
}
