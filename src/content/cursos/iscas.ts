// Materiais gratuitos da Academia (iscas para captar leads na vitrine).
// Os arquivos ficam em public/academia; o cadastro grava em academia_leads pela
// função registrar_lead_academia, com a versão da política de privacidade.
// A ordem de ISCAS é a ordem em que aparecem no seletor da vitrine.

export type Isca = {
  /** identificador gravado no lead (minúsculas, números e hífens) */
  material: string;
  /** nome curto no seletor */
  rotulo: string;
  /** tema em uma ou duas palavras, acima do rótulo */
  tema: string;
  titulo: string;
  /** título da seção dividido para o destaque em gradiente */
  chamada: { antes: string; destaque: string };
  /** linha pequena acima do título (formato e tamanho) */
  olho: string;
  descricao: string;
  /** uma frase para o card do catálogo */
  resumo: string;
  lista: string[];
  /** PDF em public/ (download) */
  arquivo: string;
  /** versão para ler no navegador, quando houver */
  pagina?: string;
  capa: string;
  /** texto do botão de envio do formulário */
  botao: string;
  /** para que serve o WhatsApp, abaixo do campo */
  motivoWhatsapp: string;
  /** modelo do e-mail de entrega (isca-ebook-email) */
  emailModelo: string;
  /** nome enviado ao pixel do Meta */
  nomeConversao: string;
};

export const ISCA_SKILLS: Isca = {
  material: '50-skills-claude',
  rotulo: '50 skills do Claude',
  tema: 'E-book',
  titulo: '50 skills do Claude para quem cria, vende e comunica',
  chamada: { antes: '50 skills que fazem o Claude', destaque: 'trabalhar por você' },
  olho: 'E-book grátis · PDF com 15 páginas',
  descricao:
    'A lista que eu queria ter quando comecei: só o que serve para quem cria conteúdo, vende e organiza o trabalho, sem programar. Cada skill vem com onde funciona, como instalar e um pedido pronto para copiar.',
  resumo: 'Só as skills que servem para quem cria conteúdo, vende e organiza o trabalho, sem programar.',
  lista: [
    'As 5 skills para ligar hoje',
    'Instalação passo a passo, no app e no Claude Code',
    'Como criar a skill que escreve com a sua voz',
  ],
  arquivo: '/academia/50-skills-do-claude.pdf',
  capa: '/academia/ebook-50-skills-capa.jpg',
  botao: 'Quero o e-book grátis',
  motivoWhatsapp: 'Para receber as atualizações da lista de skills.',
  emailModelo: 'ebook-skills-entrega',
  nomeConversao: '50 skills do Claude',
};

export const ISCA_FOTO: Isca = {
  material: 'guia-foto-que-vende',
  rotulo: 'Foto que vende',
  tema: 'Foto de produto',
  titulo: 'A foto que vende em 3 minutos',
  chamada: { antes: 'A foto que vende em', destaque: '3 minutos' },
  olho: 'Guia grátis · leitura online + PDF',
  descricao:
    'Transforme a foto do seu produto tirada no celular em foto de anúncio, no Gemini gratuito, sem a IA mudar o que o cliente vai receber. Testado com produto real: o guia mostra o antes e depois de cada prompt.',
  resumo: 'Foto de celular vira foto de anúncio no Gemini grátis, sem a IA mudar o seu produto.',
  lista: [
    '3 prompts: vitrine, produto em uso e story de Black Friday',
    'A trava que impede a IA de alterar o seu produto',
    'Checklist para conferir antes de postar',
  ],
  arquivo: '/academia/guias/foto-que-vende.pdf',
  pagina: '/academia/guias/foto-que-vende.html',
  capa: '/academia/guias/capa-foto-que-vende.jpg',
  botao: 'Quero o guia grátis',
  motivoWhatsapp: 'Para receber novidades e materiais da Academia.',
  emailModelo: 'guia-entrega',
  nomeConversao: 'Guia Foto que vende',
};

export const ISCA_CONTEUDO: Isca = {
  material: 'guia-30-dias-conteudo',
  rotulo: '30 dias de conteúdo',
  tema: 'Conteúdo',
  titulo: '30 dias de conteúdo em 1 hora',
  chamada: { antes: '30 dias de conteúdo em', destaque: '1 hora' },
  olho: 'Guia grátis · leitura online + PDF',
  descricao:
    'Quatro prompts em sequência que transformam o que você já sabe sobre o seu negócio em um mês de pautas para reels, carrosséis e stories, com os roteiros da primeira semana prontos para gravar.',
  resumo: 'Quatro prompts que viram um mês de pautas para reels, carrosséis e stories.',
  lista: [
    '30 pautas com o gancho de abertura de cada uma',
    'Roteiros da primeira semana: reel, carrossel e stories',
    'Calendário de 30 dias, uma pauta por dia',
  ],
  arquivo: '/academia/guias/30-dias-de-conteudo.pdf',
  pagina: '/academia/guias/30-dias-de-conteudo.html',
  capa: '/academia/guias/capa-30-dias-de-conteudo.jpg',
  botao: 'Quero o guia grátis',
  motivoWhatsapp: 'Para receber novidades e materiais da Academia.',
  emailModelo: 'guia-entrega',
  nomeConversao: 'Guia 30 dias de conteudo',
};

export const ISCA_ATENDIMENTO: Isca = {
  material: 'guia-atendimento-whatsapp',
  rotulo: 'Atendimento no WhatsApp',
  tema: 'Atendimento',
  titulo: 'Atendimento que fecha no WhatsApp',
  chamada: { antes: 'Atendimento que', destaque: 'fecha no WhatsApp' },
  olho: 'Guia grátis · leitura online + PDF',
  descricao:
    'Monte com IA respostas no seu tom para preço, prazo, "tá caro" e "vou pensar", e deixe tudo salvo como atalho no WhatsApp Business para responder em segundos.',
  resumo: 'Respostas no seu tom para preço, "tá caro" e "vou pensar", salvas como atalho.',
  lista: [
    'Base de respostas que sempre termina em próximo passo',
    'Retorno educado para quem parou de responder',
    'Passo a passo das respostas rápidas do WhatsApp Business',
  ],
  arquivo: '/academia/guias/atendimento-whatsapp.pdf',
  pagina: '/academia/guias/atendimento-whatsapp.html',
  capa: '/academia/guias/capa-atendimento-whatsapp.jpg',
  botao: 'Quero o guia grátis',
  motivoWhatsapp: 'Para receber novidades e materiais da Academia.',
  emailModelo: 'guia-entrega',
  nomeConversao: 'Guia Atendimento WhatsApp',
};

/** evento para abrir um material no formulário da vitrine (detail = material) */
export const EVENTO_ISCA = 'academia:isca';

export const ISCAS: Isca[] = [ISCA_SKILLS, ISCA_FOTO, ISCA_CONTEUDO, ISCA_ATENDIMENTO];
