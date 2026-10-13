// Pockets: tutoriais de bolso em PDF, vendidos avulsos por R$ 9,90 e incluídos
// de bônus no curso Ilha de Edição completa. Cada pocket é um produto com
// acesso próprio (curso_slug = slug); quem compra a Ilha recebe os três pela
// tabela curso_inclusoes, sem precisar de outra linha em curso_acessos.
//
// Aqui fica só o que aparece nas páginas (títulos, chamadas, a lista dos
// passos). O conteúdo inteiro está no PDF, entregue com marca d'água pela
// função curso-material. O preço precisa bater com
// supabase/functions/_shared/cursos/catalogo.ts.
import type { Aula, Material, Modulo } from './ilha';

export type Pocket = {
  slug: string;
  numero: 1 | 2 | 3;
  nome: string;
  /** endereço da página de vendas */
  pagina: string;
  preco: number;
  categoria: string;
  /** uma linha, para o card da vitrine */
  chamada: string;
  /** resposta para "preciso de plano pago do Claude?" */
  plano: string;
  /** frase de efeito do topo da página de vendas */
  promessa: string;
  /** a dor, em duas ou três frases */
  dor: string;
  paraQuem: string[];
  antes: string[];
  passos: { titulo: string; texto: string }[];
  /** números do PDF, para "o que vem" */
  pdf: { paginas: number; telas: number; modelos: number };
  capa: string;
  quadrada: string;
  og: string;
  previa: string;
  material: Material;
  /** o que o aluno faz depois de ler (aparece na área do aluno) */
  tarefa: string;
  perguntasTutor: string[];
};

const suporte = 'https://wa.me/5545999864213?text=' + encodeURIComponent('Oi, Jefferson! Comprei um pocket e preciso de ajuda.');

export const POCKETS: Pocket[] = [
  {
    slug: 'pocket-configurar',
    numero: 1,
    nome: 'Configurei o Claude errado',
    pagina: '/cursos/pocket/configurei-o-claude-errado',
    preco: 9.9,
    categoria: 'Configuração do zero',
    chamada: 'O que ligar, em que ordem, para o Claude parar de responder genérico.',
    plano: 'Não. A conta gratuita do Claude já tem projetos, memória e conectores, que é o que o pocket configura.',
    promessa:
      'Se ele responde genérico, o problema não é o Claude: é o que ninguém te mostrou para ligar. Em 20 minutos você configura na ordem certa e ele passa a responder sabendo quem você é.',
    dor: 'Você abre o Claude, explica tudo de novo, recebe uma resposta que serviria para qualquer pessoa e reescreve. Todo dia. Quem vende curso de IA mostra o resultado, mas pula a configuração.',
    paraQuem: [
      'Usa o Claude no automático: digita, manda e reescreve a resposta.',
      'Nunca mexeu em projetos, instruções, memória ou conectores.',
      'Quer o passo a passo com as telas, sem jargão.',
    ],
    antes: ['Uma conta no Claude. A gratuita serve.', 'O Claude aberto no computador.', '20 minutos sem pressa.'],
    passos: [
      { titulo: 'Entenda as peças antes de clicar', texto: 'Projeto, instruções, contexto, memória, conectores e artefatos, sem jargão.' },
      { titulo: 'Escreva as instruções gerais', texto: 'As regras que valem em todas as conversas, com o modelo pronto.' },
      { titulo: 'Crie o seu primeiro projeto', texto: 'Um projeto por assunto, com um nome que você acha depois.' },
      { titulo: 'Escreva as instruções do projeto', texto: 'Quem você é, para quem fala, o que nunca quer e como gosta da resposta.' },
      { titulo: 'Coloque o material de consulta no Contexto', texto: 'O que vale subir e o que nunca deve ir para lá.' },
      { titulo: 'Decida o que vale virar memória', texto: 'O que deixar guardado e o que pedir para o Claude esquecer.' },
      { titulo: 'Ligue só os conectores que você usa', texto: 'Google Drive, Gmail e o critério para não abrir porta à toa.' },
      { titulo: 'Teste com 5 perguntas', texto: 'Como saber, em 5 minutos, se a configuração pegou.' },
    ],
    pdf: { paginas: 9, telas: 8, modelos: 3 },
    capa: '/cursos-pockets/pocket-1-capa.jpg',
    quadrada: '/cursos-pockets/pocket-1.jpg',
    og: '/cursos-pockets/pocket-1-og.jpg',
    previa: '/cursos-pockets/pocket-1-pagina.jpg',
    material: { id: 'pdf', nome: 'Pocket 1 · Configurei o Claude errado', caminho: 'pocket-configurar/pocket-1-configurei-o-claude-errado.pdf', tipo: 'pdf' },
    tarefa: 'Configure um projeto para o seu assunto principal e passe no teste das 5 perguntas.',
    perguntasTutor: ['Onde fica o campo de instruções gerais?', 'Qual a diferença entre instruções gerais e do projeto?', 'Que conectores eu ligo primeiro?'],
  },
  {
    slug: 'pocket-voz',
    numero: 2,
    nome: 'Claude com a sua voz',
    pagina: '/cursos/pocket/claude-com-a-sua-voz',
    preco: 9.9,
    categoria: 'Método DEL na prática',
    chamada: 'Um projeto que escreve do seu jeito, e não com cara de IA.',
    plano: 'Não. O projeto “Minha voz” funciona na conta gratuita do Claude.',
    promessa:
      'Pare de reescrever o que a IA escreve. Monte um projeto que escreve do seu jeito, com o Método DEL na versão prática, e teste se ele passou.',
    dor: 'O texto sai correto, organizado e sem nenhuma cara de você. “É importante ressaltar”, “no mundo de hoje”, “espero ter ajudado”. Você apaga metade e reescreve o resto.',
    paraQuem: [
      'Pede texto ao Claude e sempre precisa reescrever.',
      'Já ouviu falar do Método DEL, ou nunca ouviu, e quer aplicar hoje.',
      'Escreve post, legenda, e-mail ou roteiro e quer manter a própria voz.',
    ],
    antes: ['De 3 a 5 textos que você escreveu sem IA.', 'Uma conta no Claude. A gratuita serve.', '30 minutos.'],
    passos: [
      { titulo: 'Separe os seus textos', texto: 'Quais servem de referência e quais estragam o resultado.' },
      { titulo: 'Encontre o seu padrão', texto: 'Os três eixos do Método DEL, em 10 minutos e sem teoria.' },
      { titulo: 'Crie o projeto “Minha voz”', texto: 'Com os seus textos no Contexto, separado de todo o resto.' },
      { titulo: 'Escreva a instrução de identidade', texto: 'O modelo completo, para preencher com as suas anotações.' },
      { titulo: 'Faça o teste de fidelidade', texto: '5 perguntas para saber se soou como você.' },
      { titulo: 'Ajuste quando não soou', texto: 'Formal, genérico, longo ou com palavra proibida: a correção de cada um.' },
    ],
    pdf: { paginas: 7, telas: 4, modelos: 2 },
    capa: '/cursos-pockets/pocket-2-capa.jpg',
    quadrada: '/cursos-pockets/pocket-2.jpg',
    og: '/cursos-pockets/pocket-2-og.jpg',
    previa: '/cursos-pockets/pocket-2-pagina.jpg',
    material: { id: 'pdf', nome: 'Pocket 2 · Claude com a sua voz', caminho: 'pocket-voz/pocket-2-claude-com-a-sua-voz.pdf', tipo: 'pdf' },
    tarefa: 'Monte o projeto “Minha voz” e passe no teste de fidelidade com 4 ou 5 respostas “sim”.',
    perguntasTutor: ['Quantos textos meus eu preciso?', 'O que escrevo na instrução de identidade?', 'O texto saiu formal demais. E agora?'],
  },
  {
    slug: 'pocket-postagem',
    numero: 3,
    nome: 'Do roteiro à postagem',
    pagina: '/cursos/pocket/do-roteiro-a-postagem',
    preco: 9.9,
    categoria: 'Roteiro, legenda e agendamento',
    chamada: 'Roteiro, legenda e post agendado, numa conversa por semana.',
    plano: 'Para escrever roteiro, legenda e a tabela da semana, a conta gratuita do Claude serve. O agendamento é feito na Zernio, que tem plano gratuito.',
    promessa:
      'Um fluxo que se repete toda semana: você entra com os temas e sai com roteiro, legenda e post agendado, sem abrir o Instagram todo dia.',
    dor: 'Editar já ficou fácil. O que trava é sentar toda semana na frente da tela em branco para escrever roteiro, legenda e hashtags do zero, post por post.',
    paraQuem: [
      'Já edita vídeo com IA, ou fez o curso Ilha de Edição.',
      'Ainda escreve roteiro e legenda do zero, toda vez.',
      'Quer agendar a semana de uma vez e conferir se algo falhou.',
    ],
    antes: ['Um projeto no Claude para o seu conteúdo.', 'Uma conta na Zernio, que tem plano gratuito.', 'De 3 a 5 temas para a semana.'],
    passos: [
      { titulo: 'Decida o formato antes de escrever', texto: 'Reels, carrossel ou stories, e por que isso vem primeiro.' },
      { titulo: 'Use o modelo certo para cada formato', texto: 'Três modelos de pedido, prontos para copiar.' },
      { titulo: 'Ajuste o tom', texto: 'Como pedir a segunda versão sem começar de novo.' },
      { titulo: 'Peça legenda, hashtags e chamada de uma vez', texto: 'Tudo junto, pronto para colar.' },
      { titulo: 'Monte a semana numa conversa só', texto: 'A tabela da semana, com dia, horário e formato.' },
      { titulo: 'Ligue a Zernio no Claude', texto: 'O conector, sem colar senha nem chave no chat.' },
      { titulo: 'Agende e confira pelo Claude', texto: 'Agende na Zernio e peça ao Claude para checar o que falhou.' },
    ],
    pdf: { paginas: 6, telas: 2, modelos: 5 },
    capa: '/cursos-pockets/pocket-3-capa.jpg',
    quadrada: '/cursos-pockets/pocket-3.jpg',
    og: '/cursos-pockets/pocket-3-og.jpg',
    previa: '/cursos-pockets/pocket-3-pagina.jpg',
    material: { id: 'pdf', nome: 'Pocket 3 · Do roteiro à postagem', caminho: 'pocket-postagem/pocket-3-do-roteiro-a-postagem.pdf', tipo: 'pdf' },
    tarefa: 'Monte a tabela da semana numa conversa só e agende pelo menos 3 posts.',
    perguntasTutor: ['Qual modelo uso para carrossel?', 'Como ligo a Zernio no Claude?', 'Como confiro se um post falhou?'],
  },
];

export const pocketPorPagina = (pagina?: string) => POCKETS.find((p) => p.pagina.endsWith(`/${pagina}`));
export const pocketPorSlug = (slug?: string) => POCKETS.find((p) => p.slug === slug);

/** Valor somado dos pockets, para mostrar quanto vale o bônus no curso. */
export const VALOR_POCKETS = Math.round(POCKETS.reduce((s, p) => s + p.preco, 0) * 100) / 100;

/** "R$ 9,90" para valores com centavos e "R$ 68" para valores inteiros. */
export const reais = (n: number) =>
  `R$\u00a0${n.toLocaleString('pt-BR', Number.isInteger(n) ? { maximumFractionDigits: 0 } : { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** O pocket como "aula" sem vídeo: usado na área do aluno do pocket e no bônus da Ilha. */
export const aulaDoPocket = (p: Pocket, dentroDaIlha = false): Aula => ({
  slug: p.slug,
  numero: null,
  titulo: dentroDaIlha ? `Pocket ${p.numero} · ${p.nome}` : p.nome,
  modulo: dentroDaIlha ? 'pockets' : 'pocket',
  duracao: null,
  capa: p.capa,
  semVideo: true,
  produto: p.slug,
  destaque: {
    imagem: p.capa,
    kicker: dentroDaIlha ? `Pocket ${p.numero} · bônus do curso` : `Pocket ${p.numero} de 3`,
    titulo: p.nome,
    texto: `Tutorial em PDF, com ${p.pdf.paginas} páginas, as telas do Claude em português e modelos para copiar. Baixe em Materiais.`,
  },
  resumo: `${p.promessa}`,
  pontos: p.passos.map((s, i) => `Passo ${i + 1} · ${s.titulo}: ${s.texto}`),
  tarefa: p.tarefa,
  materiais: [p.material],
});

/** O pocket como produto da área do aluno (mesma sala de aula dos cursos). */
export const salaDoPocket = (p: Pocket) => ({
  slug: p.slug,
  nome: `Pocket ${p.numero} · ${p.nome}`,
  tipo: 'pocket' as const,
  pagina: p.pagina,
  suporteWhatsApp: suporte,
  garantiaDias: 7,
  modulos: [{ slug: 'pocket', nome: `Pocket ${p.numero}`, titulo: p.nome, capa: p.capa }] satisfies Modulo[],
  aulas: [aulaDoPocket(p)],
});
