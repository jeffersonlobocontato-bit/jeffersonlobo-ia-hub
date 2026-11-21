// Microcursos gratuitos (lote 1) exibidos como cards em /cursos. Gerado do conteúdo aprovado.
export type Dica = { id: string; slug: string; titulo: string; curto: string; tipo: string; fase: string; resumo: string; duracao: string; ep: number };
export const DICAS: Dica[] = [
  {
    "id": "P00",
    "slug": "antes-de-usar-ia-meca",
    "titulo": "Antes de usar IA, meça",
    "curto": "Medir antes",
    "tipo": "Método",
    "fase": "Ensaio",
    "resumo": "Uma conversa direta sobre linha de base: por que medir antes, os 5 passos do piloto e o que nunca colar no chat.",
    "duracao": "3:57",
    "ep": 1
  },
  {
    "id": "L1",
    "slug": "5-perguntas-do-board-sobre-ia",
    "titulo": "As 5 perguntas que o board faz antes de aprovar um projeto de IA",
    "curto": "5 perguntas do board",
    "tipo": "Liderança",
    "fase": "Rota",
    "resumo": "As cinco perguntas que separam uma ideia boa de um gasto sem retorno, incluindo a que quase ninguém faz: quanto custaria resolver sem IA?",
    "duracao": "2:14",
    "ep": 2
  },
  {
    "id": "L2",
    "slug": "politica-de-uso-de-ia-em-uma-pagina",
    "titulo": "Política de uso de IA em uma página",
    "curto": "Política de uso de IA",
    "tipo": "Liderança",
    "fase": "Escala",
    "resumo": "Como escrever a política de uso de IA da sua empresa em uma página, a partir de um inventário simples de licenças, créditos e horas.",
    "duracao": "2:09",
    "ep": 3
  },
  {
    "id": "L4",
    "slug": "go-no-go-do-piloto-de-ia",
    "titulo": "Piloto de 2 semanas: como o board lê o resultado",
    "curto": "Go/no-go do piloto",
    "tipo": "Liderança",
    "fase": "Ensaio",
    "resumo": "Como a diretoria lê o resultado de um piloto de IA no Portão C, com os quatro ganhos e a regra da hora liberada.",
    "duracao": "2:02",
    "ep": 4
  },
  {
    "id": "P01",
    "slug": "resposta-ao-cliente-com-ia",
    "titulo": "Rascunho de resposta ao cliente com revisão humana",
    "curto": "Resposta ao cliente",
    "tipo": "Atendimento",
    "fase": "Ensaio",
    "resumo": "Como usar IA para rascunhar respostas a clientes sem perder o controle, medindo tempo, correções e satisfação antes de escalar.",
    "duracao": "2:14",
    "ep": 5
  },
  {
    "id": "P05",
    "slug": "proposta-comercial-com-ia",
    "titulo": "Proposta comercial padronizada em minutos",
    "curto": "Proposta comercial",
    "tipo": "Vendas",
    "fase": "Ensaio",
    "resumo": "Como padronizar a proposta comercial com IA, com preço e condições sempre definidos por humano, e medir o tempo até enviar.",
    "duracao": "2:17",
    "ep": 6
  },
  {
    "id": "N4",
    "slug": "seguranca-de-dados-em-10-minutos",
    "titulo": "Segurança de dados em 10 minutos: o que nunca colar",
    "curto": "Segurança em 10 minutos",
    "tipo": "Nivelamento",
    "fase": "Ensaio",
    "resumo": "O que nunca entra em uma ferramenta de IA, como anonimizar e por que a LGPD também vale para quem usa IA.",
    "duracao": "2:20",
    "ep": 7
  },
  {
    "id": "L5",
    "slug": "riscos-de-dados-e-lgpd-para-diretoria",
    "titulo": "Riscos de dados e LGPD em linguagem de diretoria",
    "curto": "LGPD para a diretoria",
    "tipo": "Liderança",
    "fase": "Escala",
    "resumo": "Cinco perguntas de LGPD e segurança que a diretoria faz ao time e aos fornecedores antes de uma solução de IA entrar em produção.",
    "duracao": "2:08",
    "ep": 8
  },
  {
    "id": "L7",
    "slug": "decisoes-que-nunca-ficam-so-com-a-ia",
    "titulo": "Decisões que nunca ficam só com a IA",
    "curto": "Decisões humanas",
    "tipo": "Liderança",
    "fase": "Escala",
    "resumo": "Como classificar as decisões de um processo pelo efeito sobre pessoas e definir o que a IA pode fazer, o que não pode e até onde age.",
    "duracao": "2:07",
    "ep": 9
  }
];
export const dicaPagina = (d: Dica) => `/academia/dicas/${d.slug}.html`;

/** slugs de cursos que não aparecem na vitrine /cursos */
export const VITRINE_OCULTOS: string[] = [];
