// Matéria-modelo APROVADA por Jefferson Lobo em 24/11/2026.
//
// É a régua de qualidade do blog: o redator (content-pipeline-fetch) recebe
// este texto como exemplo de estrutura, tom e nível de evidência, e o revisor
// automático (_shared/revisor-editorial.ts) compara cada rascunho com ele
// antes de aprovar a publicação sem intervenção humana.
//
// Para trocar o modelo, substitua o texto inteiro por outra matéria aprovada.

export const MATERIA_MODELO = {
  title: 'Ganho de tempo não é ganho no caixa: a pergunta que falta aos conselhos',
  subtitle:
    'O mundo já tem casos medidos do que a IA entrega e do que ela custa quando só o custo é medido. No Brasil, a discussão ainda para na eficiência.',
  excerpt:
    'IA só vira resultado quando o conselho exige linha de base, mede qualidade além do custo e compara com a alternativa sem IA.',
  content_md: `Em fevereiro de 2024, a fintech sueca Klarna anunciou que seu assistente de inteligência artificial tinha atendido 2,3 milhões de conversas no primeiro mês. Isso equivalia a dois terços do volume do chat e ao trabalho de 700 atendentes de tempo integral, com o tempo de resolução caindo de 11 para 2 minutos. Virou o caso mais citado do mundo sobre IA no atendimento.

Quinze meses depois, o próprio CEO, Sebastian Siemiatkowski, disse à Bloomberg que a empresa voltaria a contratar atendentes humanos. O motivo, nas palavras dele: o custo tinha pesado demais na avaliação, e a qualidade caiu.

## O erro de medir só o que é fácil de medir

Os números de 2024 não eram falsos, eram incompletos. Mediam volume e velocidade, que são fáceis de medir, e deixavam de fora o acerto e a experiência do cliente, que custam mais para apurar. É a diferença entre ganho previsto e ganho realizado. O primeiro está no slide de aprovação do projeto. O segundo só aparece meses depois, já descontado o que se perdeu no caminho.

A lição não é que a IA falhou na Klarna. A empresa segue usando a tecnologia em escala e redesenhou o modelo para combinar automação e atendimento humano. A lição é que uma decisão tomada com metade da régua precisa ser desfeita depois, e desfazer custa caro.

## Quando o mundo mede, o resultado é desconfortável

O caso não é isolado. O relatório "The GenAI Divide", do MIT NANDA, examinou 300 implantações públicas e entrevistou 150 líderes empresariais. A conclusão: só cerca de 5% dos pilotos de IA generativa geraram aceleração rápida de receita. A maioria parou sem efeito mensurável no resultado.

O número costuma ser mal lido. São 95% dos pilotos, não 95% das empresas. E a causa apontada não é a qualidade dos modelos, é a integração ao processo real. O mesmo estudo mostra outra distorção reveladora: mais da metade dos orçamentos de IA generativa vai para vendas e marketing, mas o maior retorno apareceu na automação de back-office, longe da vitrine.

A pesquisa anual da McKinsey aponta na mesma direção. Em 2026, só 37% das organizações dizem que a IA já contribui para o EBIT, praticamente o mesmo índice de um ano antes. O pequeno grupo que tira resultado relevante da tecnologia tem quase três vezes mais chance de redesenhar o fluxo de trabalho, em vez de apenas acrescentar uma ferramenta ao processo antigo.

**Ganho de tempo só vira ganho no caixa quando alguém decide o que fazer com o tempo liberado.**

## O Brasil discute IA, mas discute pela metade

Seria um equívoco dizer que o conselho brasileiro resiste à tecnologia. Na pesquisa da EY com conselheiros para 2025, 75% dos brasileiros disseram preferir acelerar o uso de IA a priorizar a mitigação de riscos, acima dos 67% registrados nas Américas.

O problema está no enquadramento. Na edição 2026 da mesma pesquisa, 82% das empresas usam IA para eficiência, mas 45% nem começaram a analisar o impacto no modelo de negócio. E 60% dos conselhos não têm nenhum membro com conhecimento em IA. Em quase quatro de cada dez, a única fonte de informação sobre o tema é a própria gestão que o conselho deveria fiscalizar.

Nas pautas de IA que chegam aos conselhos, o que mais falta não é tecnologia, é linha de base. Isso tem raiz cultural. Ainda medimos a força de uma operação pelo tamanho da equipe e pelo esforço visível, e não pelo que pessoas conseguem entregar orquestrando sistemas de automação. Enquanto o indicador for o número de pessoas, a IA vai entrar como corte de custo, e não como capacidade nova.

## Letramento é saber onde a IA atrapalha

O país atravessa a fase do letramento em IA, e ela é rasa. Segundo pesquisa da Pluxee, 81% dos trabalhadores brasileiros usam ou querem usar IA no trabalho, mas só 15% receberam treinamento formal da empresa. A resposta corporativa mais comum (palestra, curso de prompt, licença para todos) gera consumo de ferramenta, não critério de uso.

O critério que falta está bem documentado. Em um experimento controlado de Harvard e do MIT com 758 consultores da BCG, quem usou GPT-4 em tarefas adequadas à ferramenta foi mais de 25% mais rápido e concluiu cerca de 12% mais tarefas. Em tarefas fora dessa "fronteira", quem usou IA errou mais do que quem trabalhou sem ela. A mesma tecnologia, no mesmo dia e com os mesmos profissionais, ajudou em uma tarefa e atrapalhou em outra. Letramento de verdade é saber distinguir uma da outra antes de escalar.

## O que a medição revela sobre as pessoas

Os estudos mais rigorosos também desmontam a ideia de que IA é sinônimo de substituição. Pesquisadores de Stanford e do MIT acompanharam mais de 5 mil atendentes de suporte. Com um assistente de IA, os casos resolvidos por hora subiram em média cerca de 14%, e o ganho chegou a 34% entre os menos experientes, na versão de 2023 do estudo. Também melhoraram o humor dos clientes e a retenção de funcionários.

A IA, ali, espalhou a boa prática dos melhores profissionais para quem estava começando. O papel humano não diminuiu, ele mudou: alguém precisa escolher a tarefa certa, validar o que a máquina produz e responder pelo resultado. A requalificação de quem tem a função alterada é responsabilidade da liderança, não do RH sozinho.

## A pergunta para a próxima reunião

Os casos que o mundo já mediu ensinam que ninguém ganha com IA por adotar primeiro, mas por medir melhor. Antes de aprovar o próximo projeto, o conselho pode exigir quatro números: a linha de base, o custo da alternativa sem IA, o ganho realizado no último mês já descontado o custo da solução e o indicador de qualidade que mostraria se o projeto está piorando o serviço.

É essa a lógica do [Método Prova de Ganho](https://jeffersonlobo.tech/provadeganho): cada iniciativa só avança quando prova ganho com número, e o portão que diz não também é resultado.

Se a gestão não consegue apresentar esses quatro números, a empresa ainda não tem uma estratégia de IA. Tem uma aposta.`,
  faq: [
    {
      q: 'Por que a Klarna voltou a contratar atendentes humanos?',
      a: 'Segundo o CEO da empresa, o custo pesou demais na avaliação e a qualidade do atendimento caiu. A Klarna passou a combinar IA e atendimento humano.',
    },
    {
      q: 'É verdade que 95% dos projetos de IA fracassam?',
      a: 'Não exatamente. O relatório do MIT NANDA indica que cerca de 95% dos pilotos de IA generativa não geraram efeito mensurável no resultado. São pilotos, não empresas, e a causa principal é a falta de integração ao processo.',
    },
    {
      q: 'O conselho brasileiro é contra a IA?',
      a: 'Não. Pesquisa da EY mostra que 75% dos conselheiros brasileiros preferem acelerar o uso de IA. A lacuna está na falta de medição e de conhecimento sobre o tema dentro dos conselhos.',
    },
    {
      q: 'A IA substitui profissionais?',
      a: 'Os estudos mais rigorosos mostram outro efeito. Em pesquisa de Stanford e do MIT com atendentes de suporte, a IA elevou a produtividade e beneficiou sobretudo os menos experientes, com melhora na retenção de funcionários.',
    },
  ],
};

/** O que torna o modelo bom — usado pelo redator e pelo revisor. */
export const POR_QUE_O_MODELO_FOI_APROVADO = `
- Abre com um caso global concreto e medido (Klarna), conta o desfecho incômodo e tira dele uma lição de gestão, não de tecnologia.
- Cada seção tem um argumento e pelo menos um dado com fonte primária nomeada no texto (MIT NANDA, McKinsey, EY, Pluxee, Harvard/MIT, Stanford/MIT).
- A autoridade vem da leitura dos dados: corrige a leitura comum ("são 95% dos pilotos, não das empresas"), faz distinções de quem pratica (ganho previsto x realizado, tempo x caixa, tarefa dentro x fora da fronteira).
- Calibrado sobre o Brasil: o conselho não é contra a IA; o problema é o enquadramento, a falta de conhecimento no conselho e de linha de base.
- Crítica ao letramento raso sem atacar pessoas; valoriza o papel humano com evidência (Stanford/MIT), sem prometer nem negar mudança de funções.
- Nenhuma consultoria como protagonista, nenhum caso próprio, nenhuma autopromoção. Uma única menção ao método, perto do fim, com link.
- Fecha com uma exigência prática para a próxima reunião do conselho e uma frase final curta e citável.
`.trim();
