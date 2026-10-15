// Tudo o que se compra na Academia e abre a área do aluno: os cursos e os
// pockets. A sala de aula, o login e o admin falam com este formato comum.
import { CURSOS, type Aula, type Modulo } from './ilha';
import { POCKETS, salaDoPocket } from './pockets';

export type ProdutoSala = {
  slug: string;
  nome: string;
  tipo: 'curso' | 'pocket';
  /** página de vendas */
  pagina: string;
  /** link do atendimento (Telegram) */
  suporte: string;
  garantiaDias: number;
  modulos: Modulo[];
  aulas: Aula[];
};

export const PRODUTOS: ProdutoSala[] = [
  ...CURSOS.map((c) => ({
    slug: c.slug,
    nome: c.nome,
    tipo: c.tipo,
    pagina: c.vitrine.pagina,
    suporte: c.suporte,
    garantiaDias: c.garantiaDias,
    modulos: c.modulos,
    aulas: c.aulas as Aula[],
  })),
  ...POCKETS.map(salaDoPocket),
];

export const produtoPorSlug = (slug?: string | null) => PRODUTOS.find((p) => p.slug === slug);
