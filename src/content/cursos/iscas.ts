// Materiais gratuitos da Academia (iscas para captar leads na vitrine).
// O PDF fica em public/academia; o cadastro grava em academia_leads pela
// função registrar_lead_academia, com a versão da política de privacidade.

export type Isca = {
  /** identificador gravado no lead (minúsculas, números e hífens) */
  material: string;
  titulo: string;
  /** caminho do PDF em public/ */
  arquivo: string;
  capa: string;
  paginas: number;
  /** modelo do e-mail de entrega (send-transactional-email) */
  emailModelo: string;
};

export const ISCA_SKILLS: Isca = {
  material: '50-skills-claude',
  titulo: '50 skills do Claude para quem cria, vende e comunica',
  arquivo: '/academia/50-skills-do-claude.pdf',
  capa: '/academia/ebook-50-skills-capa.jpg',
  paginas: 15,
  emailModelo: 'ebook-skills-entrega',
};
