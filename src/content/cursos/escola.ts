// Dados da escola (vitrine /cursos), que valem para todos os cursos.

/** Bot de atendimento no Telegram. */
export const BOT_ATENDIMENTO = 'JeffersonLoboBot';

/** Link para o bot. A `origem` chega ao bot no /start e diz de onde a pessoa
 *  veio (só letras, números, _ e -, até 64 caracteres). */
export const atendimento = (origem: string) => `https://t.me/${BOT_ATENDIMENTO}?start=${origem}`;
export const ESCOLA = {
  garantiaDias: 7,
  /** prazo de acesso aos cursos (termos de uso e perguntas frequentes) */
  prazoAcesso: '12 (doze) meses',
  /** Identificação do vendedor, exigida pelo Decreto 7.962/2013 (comércio
   *  eletrônico): razão social, CNPJ, endereço do cadastro na Receita e
   *  e-mail. O que ficar vazio não aparece na página de termos. Os cursos são
   *  vendidos pela empresa, que emite a nota fiscal (NFS-e) de cada compra. */
  fornecedor: {
    nome: 'Agência de Inteligência Vozes Ltda',
    documento: '68.276.102/0001-78',
    endereco: 'Rua Alberto Folloni, 963, ap. 105, Ahú, Curitiba/PR, CEP 80540-000',
    email: 'lobo@aivozes.com.br',
  },
  /** Atendimento: o assistente do @JeffersonLoboBot no Telegram, que chama o
   *  Jefferson quando precisa (função telegram-atendimento). */
  atendimento: atendimento('duvida_cursos'),
  avisoNovos: atendimento('avisar_novos'),
  /** mostra o card "Novos cursos em breve" no fim do catálogo */
  mostrarEmBreve: true,
  /** Cena de bastidor no topo do card "Novos cursos a caminho" (5 s, sem
   *  som, em loop). Vazio, o card fica só com o ícone. */
  bastidores: {
    src: '/academia/bastidores.mp4',
    poster: '/academia/bastidores.jpg',
  },
  /** Vídeo principal do topo da vitrine (o podcast da Academia). Com `src`
   *  preenchido, ele ocupa o lugar da capa larga do curso no leque do topo,
   *  atrás do livro, rodando sem som; no play, vem para a frente do livro e
   *  toca com som. Vazio, fica a capa. Sem `poster`, usa a capa do curso.
   *  O vídeo já traz as legendas gravadas, porque começa sem som. */
  podcast: {
    src: '/academia/podcast-academia.mp4',
    poster: '/academia/podcast-academia.jpg',
    titulo: 'Podcast da Academia: Jefferson Lobo conta como nasceu a Academia jeffersonlobo.tech',
  },
};
