// Curso "Ilha de Edição completa": catálogo das aulas, preços e materiais.
// O conteúdo é apresentação (vive no código); o que muda sem deploy — IDs dos
// vídeos no Bunny e o ID do produto na Hotmart — fica na tabela curso_config,
// editável na aba Cursos do /admin.
import manuais from './ilha-manuais.json';
import { POCKETS, VALOR_POCKETS, aulaDoPocket } from './pockets';

export type Material = {
  id: string;
  nome: string;
  /** caminho dentro do bucket privado `cursos` */
  caminho: string;
  tipo: 'pdf' | 'zip';
  descricao?: string;
};

export type Passo = { titulo: string; itens: string[]; dica: string | null };

export type Aula = {
  slug: string;
  numero: number | null;
  titulo: string;
  modulo: string;
  duracao: string | null;
  capa: string | null;
  resumo: string;
  pontos: string[];
  tarefa: string | null;
  materiais: Material[];
  /** só para o bônus e os pockets, que não têm vídeo */
  semVideo?: boolean;
  /** cartão do topo de um item sem vídeo (capa, rótulo, título e texto) */
  destaque?: { imagem: string; kicker: string; titulo: string; texto: string };
  /** produto dono do material e do Tutor, quando não é o próprio curso
   *  (os pockets dentro da Ilha: o acesso vem do curso, pela inclusão) */
  produto?: string;
  manual?: {
    resultado: string;
    antes: string[];
    passos: Passo[];
    erros: string[];
    checklist: string[];
  };
};

export type Modulo = { slug: string; nome: string; titulo: string; capa: string };

const M = manuais as Record<string, NonNullable<Aula['manual']> & { tarefa: string }>;

const manual = (slug: string) => {
  const { tarefa: _t, ...resto } = M[slug];
  return resto;
};

export const CURSO_ILHA = {
  slug: 'ilha',
  tipo: 'curso' as const,
  nome: 'Ilha de Edição completa',
  chamada: 'Agora você faz seu conteúdo sozinho no Claude',
  descricao:
    'Cinco aulas para instalar no seu Claude um estúdio de conteúdo para o Instagram: reels, carrosséis, stories, direct automático e formatos que já deram certo, com a sua voz.',
  precos: {
    lote1: 68,
    lote2: 98,
    fimLote1: '2026-10-25T23:59:59-03:00',
  },
  // Como o curso é vendido: 'mercadopago' (compra direta no site, preço
  // calculado no servidor) ou 'hotmart' (usa os links de checkout abaixo).
  pagamento: 'mercadopago' as 'mercadopago' | 'hotmart',
  // Links de pagamento da Hotmart: preencha quando as ofertas existirem.
  checkout: {
    lote1: '',
    lote2: '',
  },
  bonus: { nome: 'E-book O código invisível', valor: 47 },
  /** os 3 pockets também vêm de bônus (acesso pela tabela curso_inclusoes) */
  bonusPockets: { nome: '3 pockets', valor: VALOR_POCKETS },
  garantiaDias: 7,
  suporteWhatsApp: 'https://wa.me/5545999864213?text=' + encodeURIComponent('Oi, Jefferson! Sou aluno da Ilha de Edição e preciso de ajuda.'),
  // Como o curso aparece na vitrine (/cursos), num card igual ao dos outros cursos.
  vitrine: {
    capa: '/cursos-ilha/produto-vitrine.jpg',
    pagina: '/cursos/ilha',
    categoria: 'Conteúdo para Instagram',
    destaques: ['5 aulas com as telas reais', 'Instalador da Ilha e 5 manuais em PDF', 'Tutor IA dentro de cada aula', 'De bônus: o e-book O código invisível e os 3 pockets'],
    acento: 'turquesa' as 'turquesa' | 'laranja' | 'azul' | 'verde',
    bonusLivro: true,
  },
  modulos: [
    { slug: 'comece-aqui', nome: 'Módulo 1', titulo: 'Comece aqui', capa: '/cursos-ilha/modulos/modulo-1.jpg' },
    { slug: 'quatro-frentes', nome: 'Módulo 2', titulo: 'As quatro frentes', capa: '/cursos-ilha/modulos/modulo-2.jpg' },
    { slug: 'bonus', nome: 'Bônus', titulo: 'O código invisível', capa: '/cursos-ilha/modulos/modulo-3.jpg' },
    { slug: 'pockets', nome: 'Bônus', titulo: '3 pockets', capa: '/cursos-pockets/pocket-1-capa.jpg' },
  ] satisfies Modulo[],
  aulas: [
    {
      slug: 'aula-1',
      numero: 1,
      titulo: 'Instalação e Reels',
      modulo: 'comece-aqui',
      duracao: '6:14',
      capa: '/cursos-ilha/capas/aula-1.jpg',
      resumo:
        'Você instala a Ilha no seu Claude com um arquivo e uma frase, responde o seu perfil para a Ilha escrever com a sua voz e edita o seu primeiro reel: modelo, paleta, trilha e ajustes finos no editor.',
      pontos: [
        'Precisa de um plano pago do Claude (Pro, Max, Team ou Enterprise) e de um computador para instalar. Depois, a Ilha abre até no celular.',
        'Anexe o ilha-de-edicao.zip numa conversa nova e envie: "Descompacte esse pacote e instale a Ilha de Edição seguindo o CLAUDE.md que está dentro dele."',
        'As respostas do perfil (quem você é, como fala, para quem fala) são o que faz a Ilha escrever com a sua voz.',
        'Ligue "Aprovar automaticamente" na tarefa agendada. É o passo que mais gente esquece.',
        'Grave na vertical, em 1080p, com até 20 MB. Pausas e repetições a Ilha corta.',
        'Dado em destaque para números, Ritmo para opinião, Direção para explicar, Narrativa para contar história.',
        'Ninguém, nem o Claude, pede senha ou chave pelo chat.',
      ],
      tarefa: 'Edite pelo menos um reel antes da próxima aula.',
      materiais: [
        { id: 'pack', nome: 'ilha-de-edicao.zip', caminho: 'ilha/aula-1/ilha-de-edicao.zip', tipo: 'zip', descricao: 'O instalador. Anexe no Claude, não precisa descompactar.' },
        { id: 'manual-1', nome: 'Manual da Aula 1', caminho: 'ilha/aula-1/manual-aula-1.pdf', tipo: 'pdf' },
      ],
      manual: manual('aula-1'),
    },
    {
      slug: 'aula-2',
      numero: 2,
      titulo: 'Carrossel',
      modulo: 'quatro-frentes',
      duracao: '3:27',
      capa: '/cursos-ilha/capas/aula-2.jpg',
      resumo:
        'Você transforma uma notícia ou um tema seu num carrossel pronto para postar, na sua paleta e com a sua foto na capa. De brinde saem o roteiro de um reel sobre o mesmo assunto e as legendas para Instagram e LinkedIn.',
      pontos: [
        'Comece por Notícia (cole o link da matéria) ou por Tema manual (escreva ou cole o seu texto).',
        'A Ilha só usa números e nomes que estão no texto. Ela não inventa dado.',
        'Para começar: técnica Tutorial ou Conflito universal, com 7 slides.',
        'Use uma foto sua de verdade na capa. Gente para no carrossel que tem gente.',
        'Confira números e nomes com a fonte antes de baixar.',
        'Instagram: baixe cada slide em PNG. LinkedIn: use "Baixar PDF completo".',
        'Depois de postar, clique em "Marcar como postado" para a Ilha aprender o que funciona.',
      ],
      tarefa: 'Crie e poste um carrossel.',
      materiais: [{ id: 'manual-2', nome: 'Manual da Aula 2', caminho: 'ilha/aula-2/manual-aula-2.pdf', tipo: 'pdf' }],
      manual: manual('aula-2'),
    },
    {
      slug: 'aula-3',
      numero: 3,
      titulo: 'Stories',
      modulo: 'quatro-frentes',
      duracao: '3:18',
      capa: '/cursos-ilha/capas/aula-3.jpg',
      resumo:
        'Você pede para a Ilha planejar a sequência de stories do dia: ela anima cada story na sua paleta e indica qual figurinha colar em cada um para o seu público responder.',
      pontos: [
        'Escreva o tema e cole o material inteiro, se tiver. Mais fatos, sequência mais rica.',
        'Objetivo: Engajar, Aquecer para uma venda, Vender ou Ensinar. Na dúvida, Engajar.',
        'Sete stories é um bom começo: gancho, história, pergunta e chamada.',
        'Em Provas reais, só o que é verdade e você tem autorização para mostrar.',
        'Marque "Renderizar assim que a sequência ficar pronta" para receber tudo animado.',
        'Leia o quadro "Conferir antes de postar" e cole a figurinha que o guia indica em cada story.',
      ],
      tarefa: 'Poste uma sequência inteira.',
      materiais: [{ id: 'manual-3', nome: 'Manual da Aula 3', caminho: 'ilha/aula-3/manual-aula-3.pdf', tipo: 'pdf' }],
      manual: manual('aula-3'),
    },
    {
      slug: 'aula-4',
      numero: 4,
      titulo: 'Direct automático',
      modulo: 'quatro-frentes',
      duracao: '3:57',
      capa: '/cursos-ilha/capas/aula-4.jpg',
      resumo:
        'Você monta a automação que responde no direct quem comenta a palavra-chave do seu post, pela Zernio, e acompanha na Ilha quantas pessoas comentaram, receberam, leram e clicaram.',
      pontos: [
        'A Zernio conversa com o Instagram de forma oficial. O plano gratuito atende até duas contas e dez mil mensagens por mês.',
        'O Instagram precisa ser conta profissional: comercial ou de criador.',
        'Ligue a Zernio no Claude em Configurações › Conectores, com o endereço mcp.zernio.com/mcp. Nunca cole senha ou chave no chat.',
        'Para criar, é só pedir ao Claude: "quem comentar GUIA no meu post mais recente recebe esta mensagem, com este link".',
        'Palavra simples, sem acento: GUIA, PACK, QUERO. Uma palavra por post.',
        'Teste com um amigo antes de divulgar e acompanhe o funil na aba Relacionamento.',
      ],
      tarefa: 'Crie uma automação e teste com um amigo.',
      materiais: [{ id: 'manual-4', nome: 'Manual da Aula 4', caminho: 'ilha/aula-4/manual-aula-4.pdf', tipo: 'pdf' }],
      manual: manual('aula-4'),
    },
    {
      slug: 'aula-5',
      numero: 5,
      titulo: 'Arsenal',
      modulo: 'quatro-frentes',
      duracao: '3:48',
      capa: '/cursos-ilha/capas/aula-5.jpg',
      resumo:
        'Você deixa de começar do zero: usa formatos que já deram certo, de outras pessoas e do seu perfil, e a Ilha reescreve com a sua voz. Copia a forma, nunca o conteúdo.',
      pontos: [
        'Todo vídeo que funciona tem um esqueleto: gancho, promessa, virada, prova e chamada. O Método DEL desmonta esse esqueleto.',
        'São 26 formatos prontos em Arsenal › Formatos, cada um com o molde segundo a segundo e um exemplo.',
        'Em Referências, cole o reel que estourou, as visualizações dele e a média do perfil, e clique em "Salvar e decompor".',
        'O Garimpo procura vídeos acima da média nos perfis que você acompanha. Precisa da Zernio conectada pelo Facebook.',
        'O Radar do momento entrega pautas das últimas 72 horas nos seus temas, com a fonte conferida.',
        'O Placar mostra quais formatos rendem mais no seu perfil. Precisa da análise do Instagram pela Windsor.',
      ],
      tarefa: 'Por semana: um reel, um carrossel e uma sequência de stories, com uma automação rodando no post da semana.',
      materiais: [{ id: 'manual-5', nome: 'Manual da Aula 5', caminho: 'ilha/aula-5/manual-aula-5.pdf', tipo: 'pdf' }],
      manual: manual('aula-5'),
    },
    {
      slug: 'ebook',
      numero: null,
      titulo: 'E-book O código invisível',
      modulo: 'bonus',
      duracao: null,
      capa: '/cursos-ilha/modulos/modulo-3.jpg',
      semVideo: true,
      destaque: {
        imagem: '/cursos-ilha/livro-del.webp',
        kicker: 'Bônus do curso',
        titulo: 'O código invisível',
        texto: 'O livro do Método DEL, em PDF, para ler quando quiser.',
      },
      resumo:
        'O livro do Método DEL: como transformar o jeito como você escreve, argumenta e escolhe palavras em orientações para agentes de IA, como o Claude. Na Aula 5 você usa o DEL para adaptar formatos; aqui está o método inteiro.',
      pontos: [
        'O DEL (Decomposição de Estrutura de Linguagem) desmonta a estrutura de um texto que funciona para reproduzir a forma, não o conteúdo.',
        'É a base de como a Ilha escreve com a sua voz.',
        'Leia quando quiser: ele aprofunda o que você usou na Aula 5.',
      ],
      tarefa: null,
      materiais: [{ id: 'ebook', nome: 'O código invisível (e-book)', caminho: 'ilha/bonus/o-codigo-invisivel.pdf', tipo: 'pdf' }],
    },
    ...POCKETS.map((p) => aulaDoPocket(p, true)),
  ] satisfies Aula[],
};

export type Curso = typeof CURSO_ILHA;

export const aulasDoModulo = (curso: Curso, modulo: string) => curso.aulas.filter((a) => a.modulo === modulo);
export const aulasComVideo = (curso: Curso) => curso.aulas.filter((a) => !('semVideo' in a && a.semVideo));

/** Lote vigente pela data de virada do Lote 1. */
export const loteAtual = (curso: Curso, agora = Date.now()) =>
  agora > new Date(curso.precos.fimLote1).getTime()
    ? { lote: 2 as const, preco: curso.precos.lote2, checkout: curso.checkout.lote2 }
    : { lote: 1 as const, preco: curso.precos.lote1, checkout: curso.checkout.lote1 };

// O livro, vendido avulso na Hotmart e como bônus do curso.
export const LIVRO_DEL = {
  nome: 'O código invisível dos superagentes de inteligência artificial',
  curto: 'O código invisível',
  pagina: '/livro-del',
  capa: '/cursos-ilha/livro-del.webp',
  ebook: { preco: 47, url: 'https://pay.hotmart.com/O101044688E?hotfeature=51' },
  impresso: { preco: 59, url: 'https://pay.hotmart.com/U101121849J?bid=1788185288843&hotfeature=51' },
};

export const CURSOS = [CURSO_ILHA];
export const cursoPorSlug = (slug?: string) => CURSOS.find((c) => c.slug === slug);
