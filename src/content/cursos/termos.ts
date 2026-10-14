import { BOT_ATENDIMENTO, ESCOLA } from './escola';

// Termos de uso da Academia jeffersonlobo.tech (cursos vendidos no site).
// A página /cursos/termos renderiza este texto. Ao mudar algo relevante,
// atualize VERSAO e ATUALIZADO_EM.

export const VERSAO = '1.3';
export const ATUALIZADO_EM = '14 de outubro de 2026';

export type Secao = { id: string; titulo: string; paragrafos: string[] };

const g = ESCOLA.garantiaDias;
const prazo = ESCOLA.prazoAcesso;
const f = ESCOLA.fornecedor;
const empresa = `${f.nome}, CNPJ ${f.documento}`;

export const TERMOS: Secao[] = [
  {
    id: 'quem-somos',
    titulo: '1. Quem somos e o que estes termos cobrem',
    paragrafos: [
      `A Academia jeffersonlobo.tech é a escola de cursos online de Jefferson Lobo, oferecida em jeffersonlobo.tech/cursos (a "Academia"). Os cursos são vendidos e operados pela ${empresa}, empresa de Jefferson Lobo, que é quem contrata com você. Estes termos valem para a compra e o uso de todos os cursos vendidos neste site e dos pockets (tutoriais avulsos em PDF), com as aulas, os materiais para baixar, os instaladores, os bônus e o Tutor IA de cada um (o "Conteúdo"). Onde estes termos falam em curso, valem também para os pockets.`,
      'Ao comprar um curso ou usar a área do aluno, você declara que leu e concorda com estes termos. Se não concordar, não conclua a compra.',
    ],
  },
  {
    id: 'compra',
    titulo: '2. Compra e pagamento',
    paragrafos: [
      'O preço, o lote vigente, o que está incluído e as condições de cada curso aparecem na página de vendas dele no momento da compra. O preço cobrado é sempre o calculado pelo site na hora em que você abre o pagamento.',
      'O pagamento é feito na página segura do Mercado Pago, por Pix, boleto ou cartão de crédito. No parcelamento, os juros do cartão são cobrados do comprador, conforme mostrado pelo Mercado Pago antes da confirmação. Os dados do seu cartão não passam por este site.',
      'O acesso é liberado depois que o pagamento é aprovado: no Pix e no cartão, em geral, em instantes; no boleto, em até 3 dias úteis após o pagamento.',
      `Cada compra tem nota fiscal de serviço (NFS-e), emitida pela ${f.nome} em nome de quem comprou e enviada para o e-mail da compra. Se precisar da nota em nome de uma empresa, avise pelo suporte antes de pagar.`,
    ],
  },
  {
    id: 'acesso',
    titulo: '3. Acesso à área do aluno',
    paragrafos: [
      'O acesso fica ligado ao e-mail informado na compra. Você entra na área do aluno com esse e-mail, por um link enviado na hora ou por senha, se tiver criado uma. Confira o e-mail antes de pagar: é por ele que o acesso é liberado.',
      `O acesso a cada curso vale por ${prazo} contados da data da compra, salvo se a página de vendas do curso informar outro prazo. Os arquivos que você baixar durante esse período, dentro das regras destes termos, continuam com você.`,
      'Quando um curso traz pockets ou outros produtos de bônus, o acesso a eles acompanha o do curso: vale pelo mesmo prazo e termina junto se o curso for reembolsado ou cancelado.',
      'O acesso é pessoal. Não compartilhe o seu login, os links de acesso nem a sua conta. Acessos simultâneos ou em volume fora do padrão de uso individual podem ser bloqueados.',
    ],
  },
  {
    id: 'licenca',
    titulo: '4. Licença de uso',
    paragrafos: [
      'A compra dá a você uma licença de uso pessoal, intransferível e não exclusiva do Conteúdo, para aprender e aplicar o que é ensinado. A licença não transfere a propriedade de nenhum material: aulas, textos, roteiros, manuais, instaladores, códigos, modelos, trilhas, imagens e marcas continuam sendo de Jefferson Lobo, da Agência de Inteligência Vozes ou de quem os licenciou para a Academia, protegidos pela Lei de Direitos Autorais (Lei 9.610/1998) e pela Lei de Software (Lei 9.609/1998).',
      'Você pode usar o que aprendeu e as ferramentas instaladas para criar conteúdo próprio e para clientes seus. O que é seu, o conteúdo que você cria com as ferramentas, é seu.',
    ],
  },
  {
    id: 'proibido',
    titulo: '5. O que não é permitido',
    paragrafos: [
      'Sem autorização por escrito, não é permitido: compartilhar, revender, sublicenciar, emprestar ou distribuir o Conteúdo, inteiro ou em partes, de graça ou pago; publicar ou enviar os arquivos (PDFs, instaladores, e-books, vídeos) em grupos, sites, drives, redes sociais ou cursos de terceiros; gravar, baixar ou copiar as aulas em vídeo por meios não oferecidos pela plataforma; montar produto, curso ou serviço que reproduza o instalador ou os materiais da Academia; e usar o Conteúdo para treinar modelos de IA de terceiros.',
      'Também não é permitido usar as ferramentas ensinadas para enviar mensagens a quem não pediu (spam), violar regras das plataformas em que você publica ou praticar qualquer ato ilegal.',
    ],
  },
  {
    id: 'marca-dagua',
    titulo: "6. Marca d'água e identificação das cópias",
    paragrafos: [
      "Os PDFs são entregues com marca d'água: o e-mail de quem baixou e a data aparecem em todas as páginas. Cada download fica registrado. Isso protege o seu investimento e o trabalho de quem produz os cursos.",
      "Remover, esconder ou alterar a marca d'água é violação destes termos. Uma cópia encontrada fora da área do aluno pode ser rastreada até o e-mail que a baixou.",
    ],
  },
  {
    id: 'arrependimento',
    titulo: '7. Direito de arrependimento e reembolso',
    paragrafos: [
      `Você pode desistir da compra em até ${g} dias contados da data em que o acesso foi liberado, sem precisar justificar, como garante o artigo 49 do Código de Defesa do Consumidor. Para pedir o reembolso, fale pelo atendimento no Telegram (@${BOT_ATENDIMENTO}) ou escreva para ${f.email}, informando o e-mail da compra.`,
      'O reembolso é integral e feito pelo mesmo meio de pagamento, pelo Mercado Pago. No cartão, o estorno aparece na fatura conforme o prazo da operadora; no Pix e no boleto, o valor volta para a conta de origem. A nota fiscal da compra é cancelada.',
      'Com o reembolso, a licença de uso é encerrada: o acesso à área do aluno, ao Tutor IA e às atualizações é retirado, e você se compromete a apagar os arquivos baixados e a não usar mais o instalador nem os materiais. O mesmo vale quando o pagamento é contestado junto ao banco ou ao cartão (chargeback).',
      'Depois desse prazo, a compra não é reembolsável, salvo nos casos previstos em lei.',
    ],
  },
  {
    id: 'terceiros',
    titulo: '8. Ferramentas de terceiros',
    paragrafos: [
      'Os cursos ensinam a usar serviços de outras empresas, como o Claude (da Anthropic), a Zernio, a HeyGen, a Windsor e o Instagram. A Academia não tem vínculo com essas empresas e não responde por elas.',
      'Planos, preços, regras, limites e disponibilidade desses serviços são definidos por elas, podem mudar sem aviso e são contratados por você, direto com cada empresa. Quando uma mudança de terceiro afetar uma aula, faremos o possível para atualizar o Conteúdo em prazo razoável.',
    ],
  },
  {
    id: 'tutor',
    titulo: '9. Tutor IA e atendimento',
    paragrafos: [
      'O Tutor IA responde dúvidas com base no conteúdo do curso, usando inteligência artificial. As respostas podem conter erros e não substituem as aulas nem o suporte humano. O Tutor não dá orientação jurídica, médica, financeira ou contábil.',
      'Há um limite diário de perguntas por aluno, para manter o serviço disponível para todos. As perguntas e respostas ficam registradas e podem ser lidas pela Academia para melhorar o curso e o suporte. Não escreva senhas, chaves de acesso ou dados sensíveis no Tutor.',
      `O atendimento é feito no Telegram, pelo @${BOT_ATENDIMENTO}. Primeiro responde um assistente de inteligência artificial, com base nas informações do site; quando o caso pede uma pessoa (reembolso, pagamento, acesso ou um pedido seu), ele passa a conversa para o Jefferson, que responde no mesmo chat. Quem não usa o Telegram pode escrever para ${f.email}.`,
    ],
  },
  {
    id: 'resultados',
    titulo: '10. Resultados',
    paragrafos: [
      'Os cursos ensinam métodos e ferramentas. Resultados como alcance, seguidores, vendas ou faturamento dependem de fatores que não controlamos, como o seu nicho, a sua dedicação e o funcionamento das plataformas. Por isso, não há promessa ou garantia de resultado específico.',
    ],
  },
  {
    id: 'conteudo',
    titulo: '11. Conteúdo e atualizações',
    paragrafos: [
      'Podemos atualizar, reorganizar ou substituir aulas e materiais para manter o curso útil, sem reduzir o que foi prometido na página de vendas no momento da sua compra.',
      'Podemos interromper o serviço por pouco tempo para manutenção ou por falha de fornecedores. Se a Academia encerrar um curso antes do fim do seu prazo de acesso, você será avisado com antecedência razoável para baixar os materiais permitidos.',
    ],
  },
  {
    id: 'suspensao',
    titulo: '12. Suspensão e encerramento do acesso',
    paragrafos: [
      `Se você descumprir estes termos, em especial os itens 5 e 6, o acesso pode ser suspenso ou encerrado, sem reembolso depois do prazo de ${g} dias, sem prejuízo das medidas legais cabíveis. Sempre que possível, avisaremos antes pelo e-mail da compra, para que você possa se explicar.`,
    ],
  },
  {
    id: 'privacidade',
    titulo: '13. Privacidade e dados pessoais',
    paragrafos: [
      `A controladora dos seus dados pessoais é ${empresa}. Tratamos esses dados conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018), só para vender e entregar os cursos, emitir a nota fiscal, dar suporte e cumprir obrigações legais.`,
      'Coletamos: nome e e-mail informados na compra; dados do pedido e do pagamento repassados pelo Mercado Pago (status, forma de pagamento, valor, parcelas e o CPF informado no pagamento, usado na nota fiscal; nunca o número do cartão); aulas concluídas; downloads; perguntas feitas ao Tutor IA; as mensagens trocadas no atendimento pelo Telegram, com o nome e o usuário do Telegram; e a origem da visita que levou à compra (o site anterior e os parâmetros de campanha do link, como utm_source), para sabermos quais canais funcionam.',
      'Compartilhamos dados só com quem é necessário para o serviço funcionar: o Mercado Pago (pagamento), o emissor de notas fiscais e a prefeitura (nota fiscal), a infraestrutura do site e do banco de dados, o envio de e-mails, o Telegram (atendimento) e o provedor de IA do Tutor e do assistente de atendimento. Não vendemos seus dados.',
      'Você pode pedir acesso, correção ou exclusão dos seus dados pelo canal de contato. Alguns dados, como os de compra, precisam ser guardados pelo prazo exigido em lei.',
    ],
  },
  {
    id: 'livro',
    titulo: '14. Livro avulso',
    paragrafos: [
      'O livro O código invisível, vendido avulso em versão impressa ou e-book, é comercializado pela Hotmart, e a compra dele segue também os termos da Hotmart. Quando o e-book vem como bônus de um curso, ele segue estes termos.',
    ],
  },
  {
    id: 'alteracoes',
    titulo: '15. Alterações destes termos',
    paragrafos: [
      'Podemos atualizar estes termos. A versão e a data ficam no topo desta página. Mudanças não reduzem direitos de compras já feitas; para elas, vale a versão em vigor na data da compra, salvo se a nova for mais favorável a você.',
    ],
  },
  {
    id: 'foro',
    titulo: '16. Lei aplicável e foro',
    paragrafos: [
      'Estes termos seguem a lei brasileira, em especial o Código de Defesa do Consumidor e o Decreto 7.962/2013, sobre comércio eletrônico. Antes de qualquer medida, fale com a gente: a maioria das questões se resolve rápido pelo suporte. Fica eleito o foro do domicílio do consumidor.',
    ],
  },
];
