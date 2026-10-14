import { ESCOLA } from './escola';
import type { Secao } from './termos';

// Política de privacidade da Academia jeffersonlobo.tech (/cursos/privacidade).
// Vale para os materiais gratuitos (e-books e guias) baixados na vitrine e
// complementa o item 13 dos termos de uso, que trata dos dados de compra.
// Ao mudar algo relevante, atualize VERSAO_PRIVACIDADE e PRIVACIDADE_ATUALIZADA_EM:
// a versão aceita fica gravada em cada cadastro.

export const VERSAO_PRIVACIDADE = '1.3';
export const PRIVACIDADE_ATUALIZADA_EM = '14 de outubro de 2026';

const f = ESCOLA.fornecedor;

export const PRIVACIDADE: Secao[] = [
  {
    id: 'quem',
    titulo: '1. Quem cuida dos seus dados',
    paragrafos: [
      `A controladora dos dados é a ${f.nome}, CNPJ ${f.documento}, ${f.endereco}, empresa de Jefferson Lobo que opera a Academia jeffersonlobo.tech (a "Academia"). Esta política explica o que acontece com os dados de quem baixa um material gratuito na Academia, como um e-book ou um guia.`,
      'Para quem compra um curso ou um pocket, valem também os termos de uso (item 13), que tratam dos dados da compra, do pagamento e da nota fiscal.',
    ],
  },
  {
    id: 'dados',
    titulo: '2. Que dados coletamos',
    paragrafos: [
      'Pedimos só o necessário: nome, e-mail e WhatsApp. Junto, registramos qual material você pediu, a data e a hora do cadastro, a versão desta política que você aceitou e de onde veio a visita (os parâmetros de campanha do link, como utm_source, e a página anterior).',
      'Não pedimos CPF, endereço, dados de pagamento nem dados sensíveis. O material é destinado a maiores de 18 anos.',
    ],
  },
  {
    id: 'uso',
    titulo: '3. Para que usamos',
    paragrafos: [
      'Para enviar o material que você pediu, no seu e-mail.',
      'Para mandar, por e-mail e por WhatsApp, conteúdos, atualizações dos materiais (como a lista de skills), avisos de cursos e ofertas da Academia.',
      'Para remarketing: mostrar anúncios da Academia para você em plataformas como Meta (Instagram e Facebook) e Google. Para isso, o e-mail e o telefone são enviados a essas plataformas em formato criptografado (hash), só para formar públicos de anúncio. A plataforma não recebe o seu nome nem o material que você baixou.',
      'Para saber quais canais e campanhas trazem pessoas à Academia, a partir da origem da visita.',
    ],
  },
  {
    id: 'base-legal',
    titulo: '4. Base legal e consentimento',
    paragrafos: [
      'Tratamos esses dados com base no seu consentimento (Lei 13.709/2018, a LGPD, art. 7º, I), dado quando você marca a caixa do formulário. Guardamos a data, a hora e a versão desta política aceita, como prova.',
      'O material é gratuito e é entregue em troca deste cadastro: receber as comunicações e os anúncios descritos no item 3 é a condição para baixá-lo (LGPD, art. 9º, § 3º). Depois, você pode revogar o consentimento quando quiser, sem custo e sem perder o material.',
    ],
  },
  {
    id: 'compartilhamento',
    titulo: '5. Com quem compartilhamos',
    paragrafos: [
      'Só com os serviços necessários para isso funcionar, que agem em nosso nome: a hospedagem do site e do banco de dados, o serviço de envio de e-mails, as plataformas de anúncios (Meta e Google, apenas com e-mail e telefone criptografados, para os públicos de anúncio) e o WhatsApp, quando usamos esse canal.',
      'Alguns desses serviços guardam dados fora do Brasil. Nesses casos, a transferência segue as regras da LGPD (art. 33). Não vendemos nem alugamos dados pessoais.',
    ],
  },
  {
    id: 'prazo',
    titulo: '6. Por quanto tempo guardamos',
    paragrafos: [
      'Enquanto o seu consentimento estiver ativo. Se você pedir para sair, paramos de enviar comunicações e de usar os seus dados em anúncios, e tiramos o seu contato dos públicos de anúncio na atualização seguinte, em até 30 dias.',
      'Depois disso, guardamos apenas o registro do consentimento e do pedido de saída, pelo tempo necessário para comprovar que cumprimos a lei.',
    ],
  },
  {
    id: 'direitos',
    titulo: '7. Seus direitos',
    paragrafos: [
      'Pela LGPD (art. 18), você pode, a qualquer momento: confirmar se tratamos os seus dados; acessar os dados; corrigir dados incompletos ou errados; pedir a anonimização, o bloqueio ou a eliminação de dados desnecessários; pedir a portabilidade; saber com quem compartilhamos; e revogar o consentimento.',
      `Para qualquer um desses pedidos, escreva para ${f.email} ou chame no WhatsApp de suporte. Também há um link para sair da lista em todos os e-mails. Respondemos em até 15 dias.`,
    ],
  },
  {
    id: 'seguranca',
    titulo: '8. Segurança',
    paragrafos: [
      'Os dados ficam num banco de dados com regras de acesso: só o administrador da Academia consulta a lista. A conexão com o site é criptografada (HTTPS).',
    ],
  },
  {
    id: 'cookies',
    titulo: '9. Cookies e medição',
    paragrafos: [
      'Para saber quais canais trazem pessoas à Academia, o site registra as páginas visitadas, a origem da visita (o site anterior e os parâmetros de campanha do link, como utm_source) e os cliques em botões, ligados a um identificador anônimo da sessão do navegador. Esses registros não incluem nome, e-mail ou WhatsApp.',
      'O navegador guarda localmente, por até 30 dias, a última origem que não foi um acesso direto, para atribuir corretamente um cadastro ou uma compra feita depois. Quando você se cadastra ou compra, essa origem fica junto do cadastro ou do pedido.',
      'O site usa o Pixel da Meta (Instagram e Facebook) para medir os anúncios da Academia: ele registra, pelo navegador, as páginas visitadas, o início de uma compra e a compra aprovada, com o valor e o nome do produto. A Meta pode associar esses eventos à sua conta nas plataformas dela, conforme a política de dados da Meta. O pixel não recebe o seu nome, e-mail, WhatsApp, CPF nem dados de pagamento.',
      'Você pode bloquear o pixel com as configurações de privacidade do navegador ou com um bloqueador de anúncios, sem prejuízo para a compra ou para o acesso às aulas. Também pode ajustar os anúncios que vê nas configurações de anúncios da sua conta na Meta.',
    ],
  },
  {
    id: 'encarregado',
    titulo: '10. Canal do titular e alterações',
    paragrafos: [
      `O canal para assuntos de dados pessoais é Jefferson Lobo, pelo e-mail ${f.email}.`,
      'Esta política pode mudar. A versão e a data ficam no topo da página, e a versão que você aceitou fica registrada no seu cadastro.',
    ],
  },
];
