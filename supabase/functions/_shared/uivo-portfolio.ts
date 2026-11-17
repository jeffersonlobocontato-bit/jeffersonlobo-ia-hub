// Portfólio e mapa de encaminhamento do Uivo do Lobo (chat do site).
//
// Fica no prompt do chat-uivo-lobo de forma fixa (não depende do RAG, que
// pode não achar nada), e também vira documentos da base de conhecimento.
// Ao lançar ou tirar um produto do ar: atualize PORTFOLIO_DOCS e ROTAS_PERMITIDAS
// (o ChatBot.tsx só transforma em botão os links que estão nessa lista).

import { CATALOGO, precoAtual } from './cursos/catalogo.ts';
import type { KnowledgeDoc } from './knowledge-content.ts';

const brl = (n: number) => `R$ ${n.toFixed(2).replace('.', ',')}`;

/** Preço vigente da Ilha (muda de lote por data) e dos pockets, calculado na hora. */
export function precosAcademia(): string {
  const ilha = precoAtual('ilha');
  const pocket = precoAtual('pocket-voz');
  const linhas = [];
  if (ilha) linhas.push(`- Ilha de Edição completa: ${brl(ilha.preco)}${ilha.lote ? ` (lote ${ilha.lote})` : ''}, pagamento único, acesso por 12 meses, garantia de 7 dias`);
  if (pocket) linhas.push(`- Cada pocket: ${brl(pocket.preco)} (os 3 pockets vêm de bônus na Ilha)`);
  return linhas.join('\n');
}

/** Rotas internas que o chat pode transformar em botão. Espelhada em src/components/ChatBot.tsx. */
export const ROTAS_PERMITIDAS = [
  '/cursos',
  '/cursos/ilha',
  '/cursos/pocket/configurei-o-claude-errado',
  '/cursos/pocket/claude-com-a-sua-voz',
  '/cursos/pocket/do-roteiro-a-postagem',
  '/cursos/entrar',
  '/livro-del',
  '/palestras-ia',
  '/consultoria-ia',
  '/provadeganho',
  '/workshop-ia',
  '/teste-ia',
  '/materiais',
  '/blog',
  '/imprensa',
  '/jefferson-lobo',
];

export const PORTFOLIO_DOCS: KnowledgeDoc[] = [
  {
    titulo: 'Quem é Jefferson Lobo e o posicionamento "IA com prova de ganho"',
    fonte: 'Site jeffersonlobo.tech',
    categoria: 'sobre',
    conteudo: `Jefferson Lobo tem 34 anos de experiência em comunicação estratégica e tecnologia. É Head Executivo de Marketing e Inteligência Artificial do Sistema Fiep: lidera marketing e IA em uma empresa com mais de 4 mil colaboradores. É autor do Método DEL e do livro "O código invisível dos superagentes de inteligência artificial". Já palestrou para CNI, Unisenai (com MIT) e Laguna/Gazeta do Povo.

Manifesto: "IA sem prova de ganho é hora paga sem retorno e aumento de custo." Ele é crítico ao hype e aos "prompts milagrosos": começa pela prova de ganho e só depois escala. Defende governança, profissionalização da liderança e projetos que comprovem ROI.

Atende dois públicos: empresas e lideranças (palestras, workshops, consultoria) e profissionais e pequenos negócios sem equipe (Academia de cursos e materiais gratuitos).`,
  },
  {
    titulo: 'Academia jeffersonlobo.tech — visão geral',
    fonte: 'Academia /cursos',
    categoria: 'academia',
    conteudo: `A Academia jeffersonlobo.tech (jeffersonlobo.tech/cursos) é a escola de IA do Jefferson para profissionais liberais e donos de pequenos negócios sem equipe (loja, dentista, esteticista, advogado, barbearia, salão e outros) que querem produzir o próprio conteúdo com IA: reels, carrosséis, stories e atendimento.

Tem: o curso Ilha de Edição completa, 3 pockets (tutoriais em PDF), guias e e-book gratuitos e o livro do Método DEL. Aulas curtas gravadas na tela de verdade, Tutor IA em cada aula, materiais para baixar, progresso salvo, entrada só com o e-mail da compra, garantia de 7 dias e acesso por 12 meses. Quem já comprou entra em jeffersonlobo.tech/cursos/entrar com o e-mail da compra. Suporte humano pelo WhatsApp do Jefferson. A Academia é da Agência de Inteligência Vozes, que emite nota fiscal.`,
  },
  {
    titulo: 'Curso Ilha de Edição completa',
    fonte: 'Academia /cursos/ilha',
    categoria: 'academia',
    conteudo: `A Ilha de Edição é um estúdio de conteúdo instalado dentro da conta do Claude do aluno. Tem aba Reels (edição de vídeo com modelos, legendas, letterings e trilhas), Carrossel, Stories, Relacionamento (direct automático no Instagram) e Arsenal (formatos, referências, Radar do momento e Placar de resultados). Escreve com a voz da pessoa a partir de um perfil que ela preenche.

O curso: 5 aulas curtas em vídeo (Instalação e Reels; Carrossel; Stories; Direct automático; Arsenal), manual em PDF por aula, Tutor IA em cada aula. Bônus: o e-book do Método DEL e os 3 pockets.

Requisito importante: precisa de plano pago do Claude (Pro, Max, Team ou Enterprise) e de um computador para instalar. No plano gratuito do Claude a Ilha não funciona. Depois de instalada, abre também no celular. Conectores opcionais: HeyGen, Zernio e Windsor.

Para quem é: quem cria conteúdo sozinho e quer sair do zero toda semana. Página: /cursos/ilha.`,
  },
  {
    titulo: 'Pockets da Academia (tutoriais em PDF)',
    fonte: 'Academia /cursos',
    categoria: 'academia',
    conteudo: `Pockets são tutoriais curtos em PDF, com telas do Claude em português, modelos para copiar e checklist, e um Tutor IA próprio:
- Pocket 1 · Configurei o Claude errado: o que ligar e em que ordem para o Claude parar de responder genérico (instruções, projetos, contexto, memória, conectores). Funciona no plano gratuito do Claude. Página: /cursos/pocket/configurei-o-claude-errado
- Pocket 2 · Claude com a sua voz: um projeto que escreve do seu jeito, a versão prática do Método DEL. Página: /cursos/pocket/claude-com-a-sua-voz
- Pocket 3 · Do roteiro à postagem: roteiro, legenda e agendamento semanal pela Zernio. Página: /cursos/pocket/do-roteiro-a-postagem
Os três vêm de bônus no curso Ilha de Edição. Garantia de 7 dias.`,
  },
  {
    titulo: 'Materiais gratuitos da Academia',
    fonte: 'Academia /cursos',
    categoria: 'academia',
    conteudo: `Na vitrine /cursos há materiais grátis (pedem nome, e-mail e WhatsApp para enviar):
- E-book "50 skills do Claude para quem cria, vende e comunica" (15 páginas)
- Guia "A foto que vende em 3 minutos": foto de celular vira foto de anúncio no Gemini grátis
- Guia "30 dias de conteúdo em 1 hora": quatro prompts que viram um mês de pautas
- Guia "Atendimento que fecha no WhatsApp": respostas no seu tom para preço, "tá caro" e "vou pensar"
- Guia "O reel feito sem câmera": um print, uma foto e IA
- Checklist "Seu projeto de IA vale escalar?": 24 perguntas e uma régua para decidir se o projeto sai do piloto (bom para gestores)
São a porta de entrada mais leve para quem ainda está conhecendo.`,
  },
  {
    titulo: 'Livro do Método DEL — O código invisível',
    fonte: 'Página /livro-del',
    categoria: 'metodo-del',
    conteudo: `"O código invisível dos superagentes de inteligência artificial" é o livro do Jefferson sobre o Método DEL (Decomposição de Estrutura de Linguagem): como criar agentes de IA que escrevem com a voz de uma pessoa ou marca, a partir de três eixos (sintático, semântico e lexical), com auditoria periódica. Existe em e-book e impresso, vendidos pela Hotmart; os detalhes e os botões de compra estão em /livro-del. O e-book também vem de bônus no curso Ilha de Edição.`,
  },
  {
    titulo: 'Palestras, workshops e consultoria para empresas',
    fonte: 'Páginas comerciais',
    categoria: 'empresas',
    conteudo: `Para empresas e lideranças:
- Palestras (/palestras-ia): keynotes presenciais e online sobre IA generativa, agentes, marketing e estratégia, para convenções, kickoffs, C-level e eventos corporativos em todo o Brasil. Tema central: "Prova de ganho: IA que se paga".
- Workshop in-company (/workshop-ia): imersões práticas para times de marketing e negócios, do prompt à orquestração de fluxos, com exercícios nos casos reais da operação.
- Método Prova de Ganho (/provadeganho): gestão de projetos de IA em 5 fases (Panorama, Rota, Ensaio, Escala, Rotina) e 4 portões; só escala o que provou ganho; mede previsto, realizado, capacidade liberada e custo evitado todo mês; conduzido pela Agência de Inteligência Vozes; começa por diagnóstico de 3 a 4 semanas.
- Consultoria estratégica (/consultoria-ia): para diretoria e C-level — diagnóstico de maturidade, roadmap de IA, governança, escolha de stack e fluxos com identidade de marca.
Valores, datas e propostas são tratados só diretamente com o Jefferson, pelo WhatsApp.`,
  },
  {
    titulo: 'Teste de Maturidade em IA',
    fonte: 'Página /teste-ia',
    categoria: 'teste',
    conteudo: `Teste gratuito com 24 perguntas, em versão para pessoa física e para empresa, que mede 8 competências em 3 níveis (básico, intermediário, avançado). Entrega um painel com o resultado e um relatório em PDF. É o primeiro passo recomendado de quem quer "começar pela prova". Página: /teste-ia.`,
  },
];

/** Bloco fixo do prompt: o que existe e para onde mandar cada perfil. */
export function blocoPortfolio(): string {
  return `# PORTFÓLIO ATUAL E PARA ONDE ENCAMINHAR

## Quem é o Jefferson (use para se apresentar quando perguntarem)
34 anos de comunicação estratégica e tecnologia. Head Executivo de Marketing e IA do Sistema Fiep — lidera marketing e IA em uma empresa com mais de 4 mil colaboradores. (Nunca diga que ele "lidera IA de 4 mil pessoas".) Autor do Método DEL e do livro "O código invisível". Palestrou para CNI, Unisenai (com MIT) e Laguna/Gazeta do Povo.
Manifesto: "IA sem prova de ganho é hora paga sem retorno e aumento de custo." Ele começa pela prova e só depois escala.

## Dois caminhos — descubra cedo qual é o do visitante
Se não estiver claro, pergunte de forma leve: "Você está pensando em IA para a sua empresa/equipe ou para o seu próprio trabalho e negócio?"

**A) Empresa, liderança, RH, evento** →
- Quer evento/palestra → [LINK:/palestras-ia]Ver as palestras[/LINK]
- Quer capacitar um time → [LINK:/workshop-ia]Ver o workshop in-company[/LINK]
- Quer medir o ROI dos projetos de IA ou saber se a IA está pagando a conta → [LINK:/provadeganho]Conhecer o Método Prova de Ganho[/LINK]
- Quer estratégia, governança, roadmap → [LINK:/consultoria-ia]Ver a consultoria[/LINK]
- Ainda explorando / "por onde começo" → [LINK_TESTE]Fazer o Teste de Maturidade em IA[/LINK_TESTE]
- Pediu orçamento, data, proposta ou quer conversar → [LINK_WHATSAPP]Falar com Jefferson Lobo[/LINK_WHATSAPP]

**B) Profissional liberal, pequeno negócio, criador de conteúdo sem equipe** →
- Quer produzir reels/carrossel/stories com IA e já tem (ou topa ter) Claude pago → [LINK:/cursos/ilha]Conhecer a Ilha de Edição[/LINK]
- Usa Claude grátis, está começando ou acha a IA "genérica" → Pocket 1 [LINK:/cursos/pocket/configurei-o-claude-errado]Ver o pocket "Configurei o Claude errado"[/LINK]
- Quer que a IA escreva do jeito dele → Pocket 2 [LINK:/cursos/pocket/claude-com-a-sua-voz]Ver o pocket "Claude com a sua voz"[/LINK]
- Já produz e quer um fluxo semanal até o agendamento → Pocket 3 [LINK:/cursos/pocket/do-roteiro-a-postagem]Ver o pocket "Do roteiro à postagem"[/LINK]
- Só quer algo grátis para começar → [LINK:/cursos]Ver os materiais grátis da Academia[/LINK] (e-book 50 skills, guias de foto, 30 dias de conteúdo, atendimento no WhatsApp, reel sem câmera)
- Já comprou e não consegue entrar → [LINK:/cursos/entrar]Entrar na área do aluno[/LINK] (com o e-mail da compra); problema que persiste → WhatsApp

**Para os dois públicos**
- Interesse em escrever com a própria voz / Método DEL a fundo → [LINK:/livro-del]Conhecer o livro do Método DEL[/LINK]
- Quer ler mais antes → [LINK:/blog]Ler o blog[/LINK]
- Jornalista / imprensa → [LINK:/imprensa]Ver a página de imprensa[/LINK]

## Preços que você PODE citar (só estes, calculados agora pelo sistema)
${precosAcademia()}
Livro: os valores e a compra estão na página /livro-del. Palestras, workshops e consultoria: nunca cite valor — é com o Jefferson.

## Regras do encaminhamento
- Entenda antes de indicar: no máximo UMA pergunta de qualificação por vez.
- Indique UM caminho por resposta (no máximo um botão), o mais próximo do que a pessoa disse querer. Não empurre o curso para quem veio pela empresa, nem consultoria para quem quer fazer reels.
- Seja honesto sobre requisitos: a Ilha exige Claude pago e computador para instalar. Se a pessoa usa só o plano grátis, indique primeiro o Pocket 1 ou os materiais grátis.
- Só use links da lista acima, exatamente no formato [LINK:/rota]texto[/LINK]. Nunca invente URL.`;
}
