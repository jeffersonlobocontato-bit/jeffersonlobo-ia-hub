// Nomes e endereços dos cursos, para as edge functions (o catálogo completo das
// aulas fica no front, em src/content/cursos/).
export const SITE = 'https://jeffersonlobo.tech';

export type CursoCatalogo = {
  nome: string;
  area: string;
  /** página de vendas, para onde o comprador volta se desistir */
  pagina: string;
  imagem: string;
  /** Preços cobrados no pagamento direto (Mercado Pago). Mantenha igual a
   *  src/content/cursos/ilha.ts: o teste do catálogo confere os dois. */
  precos: { lote1: number; lote2: number; fimLote1: string };
};

export const CATALOGO: Record<string, CursoCatalogo> = {
  ilha: {
    nome: 'Ilha de Edição completa',
    area: '/cursos/ilha/aulas',
    pagina: '/cursos/ilha',
    imagem: `${SITE}/cursos-ilha/produto.jpg`,
    precos: { lote1: 68, lote2: 98, fimLote1: '2026-10-25T23:59:59-03:00' },
  },
};

/** Lote e preço vigentes, calculados no servidor pela data de virada. */
export function precoAtual(curso: string, agora = Date.now()): { lote: 1 | 2; preco: number } | null {
  const c = CATALOGO[curso];
  if (!c) return null;
  return agora > new Date(c.precos.fimLote1).getTime() ? { lote: 2, preco: c.precos.lote2 } : { lote: 1, preco: c.precos.lote1 };
}

export const linkDeEntrada = (email: string, curso: string) =>
  `${SITE}/cursos/entrar?curso=${encodeURIComponent(curso)}&email=${encodeURIComponent(email)}`;
