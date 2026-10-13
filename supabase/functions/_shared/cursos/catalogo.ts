// Nomes, endereços e preços dos produtos (cursos e pockets), para as edge
// functions. O catálogo completo das aulas fica no front, em src/content/cursos/.
export const SITE = 'https://jeffersonlobo.tech';

export type Precos =
  /** curso com lotes: o preço muda na data de virada do Lote 1 */
  | { lote1: number; lote2: number; fimLote1: string }
  /** preço fixo (pockets) */
  | { unico: number };

export type CursoCatalogo = {
  nome: string;
  tipo: 'curso' | 'pocket';
  area: string;
  /** página de vendas, para onde o comprador volta se desistir */
  pagina: string;
  imagem: string;
  /** Preços cobrados no pagamento direto (Mercado Pago). Mantenha igual a
   *  src/content/cursos/ (ilha.ts e pockets.ts): o teste do catálogo confere. */
  precos: Precos;
  /** descrição do item na página do Mercado Pago */
  descricao: (lote: number | null) => string;
};

const pocket = (slug: string, n: number, nome: string, pagina: string): CursoCatalogo => ({
  nome: `Pocket ${n} · ${nome}`,
  tipo: 'pocket',
  area: `/cursos/${slug}/aulas`,
  pagina,
  imagem: `${SITE}/cursos-pockets/pocket-${n}.jpg`,
  precos: { unico: 9.9 },
  descricao: () => `Tutorial em PDF "${nome}", da Academia jeffersonlobo.tech`,
});

export const CATALOGO: Record<string, CursoCatalogo> = {
  ilha: {
    nome: 'Ilha de Edição completa',
    tipo: 'curso',
    area: '/cursos/ilha/aulas',
    pagina: '/cursos/ilha',
    imagem: `${SITE}/cursos-ilha/produto.jpg`,
    precos: { lote1: 68, lote2: 98, fimLote1: '2026-10-25T23:59:59-03:00' },
    descricao: (lote) => `Curso online Ilha de Edição completa (lote ${lote}) com o e-book e os 3 pockets de bônus`,
  },
  'pocket-configurar': pocket('pocket-configurar', 1, 'Configurei o Claude errado', '/cursos/pocket/configurei-o-claude-errado'),
  'pocket-voz': pocket('pocket-voz', 2, 'Claude com a sua voz', '/cursos/pocket/claude-com-a-sua-voz'),
  'pocket-postagem': pocket('pocket-postagem', 3, 'Do roteiro à postagem', '/cursos/pocket/do-roteiro-a-postagem'),
};

/** Lote e preço vigentes, calculados no servidor. Preço fixo devolve lote null. */
export function precoAtual(curso: string, agora = Date.now()): { lote: 1 | 2 | null; preco: number } | null {
  const c = CATALOGO[curso];
  if (!c) return null;
  const p = c.precos;
  if ('unico' in p) return { lote: null, preco: p.unico };
  return agora > new Date(p.fimLote1).getTime() ? { lote: 2, preco: p.lote2 } : { lote: 1, preco: p.lote1 };
}

/** Pasta do material no bucket `cursos` = slug do produto dono do arquivo. */
export function produtoDoCaminho(caminho: string): string | null {
  const pasta = caminho.split('/')[0] ?? '';
  return CATALOGO[pasta] ? pasta : null;
}

export const linkDeEntrada = (email: string, curso: string) =>
  `${SITE}/cursos/entrar?curso=${encodeURIComponent(curso)}&email=${encodeURIComponent(email)}`;
