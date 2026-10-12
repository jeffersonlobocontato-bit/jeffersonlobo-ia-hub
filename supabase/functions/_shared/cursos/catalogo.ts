// Nomes e endereços dos cursos, para as edge functions (o catálogo completo das
// aulas fica no front, em src/content/cursos/).
export const SITE = 'https://jeffersonlobo.tech';

export const CATALOGO: Record<string, { nome: string; area: string }> = {
  ilha: { nome: 'Ilha de Edição completa', area: '/cursos/ilha/aulas' },
};

export const linkDeEntrada = (email: string, curso: string) =>
  `${SITE}/cursos/entrar?curso=${encodeURIComponent(curso)}&email=${encodeURIComponent(email)}`;
