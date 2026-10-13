// Origem da compra (de onde a pessoa veio), mandada pelo navegador junto com
// o pedido. Só entram chaves conhecidas, como texto curto: serve para o painel
// da Academia cruzar vendas com canais e campanhas, nunca para decidir preço
// ou acesso.
const CHAVES = ['canal', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'referrer_domain', 'landing_page', 'sessao'] as const;

export function limparOrigem(bruta: unknown): Record<string, string> {
  if (!bruta || typeof bruta !== 'object' || Array.isArray(bruta)) return {};
  const o = bruta as Record<string, unknown>;
  const limpa: Record<string, string> = {};
  for (const k of CHAVES) {
    const v = o[k];
    if (typeof v === 'string' && v.trim()) limpa[k] = v.trim().slice(0, 200);
  }
  return limpa;
}
