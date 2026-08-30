import auditoriaPdf from '@/assets/auditoria-del.pdf.asset.json';
import templatesPdf from '@/assets/templates-del.pdf.asset.json';

export type MaterialBlock =
  | { type: 'h2'; text: string }
  | { type: 'p'; text: string }
  | { type: 'label'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'row'; cells: string[] };

export interface Material {
  slug: string;
  title: string;
  summary: string;
  seoDescription: string;
  ctaName: string;
  pdfUrl: string;
  pdfFilename: string;
  blocks: MaterialBlock[];
}

export const MATERIAIS_KICKER =
  'O código invisível dos superagentes de IA · Material complementar';

export const MATERIAIS: Material[] = [
  {
    slug: 'auditoria-del',
    title: 'Protocolo de auditoria de fidelidade autoral',
    summary:
      'Os três checklists de auditoria do Método DEL — lançamento, periódica e por gatilho — para garantir que o agente continue soando como o autor ao longo do tempo.',
    seoDescription:
      'Checklists de auditoria de fidelidade autoral do Método DEL: testes de lançamento, auditoria periódica, auditoria por gatilho e log de versões. Consulta online e download em PDF.',
    ctaName: 'material_download_auditoria',
    pdfUrl: auditoriaPdf.url,
    pdfFilename: 'auditoria-del.pdf',
    blocks: [
      {
        type: 'p',
        text: 'A auditoria garante que o agente continua soando como o autor ao longo do tempo. Três momentos: lançamento, periódico, por gatilho.',
      },
      { type: 'h2', text: 'Checklist 1 — Auditoria de lançamento' },
      { type: 'p', text: '(antes de colocar o agente em produção)' },
      { type: 'label', text: 'Preparação' },
      {
        type: 'list',
        items: [
          'Os três arquivos DEL foram gerados e revisados?',
          'Os arquivos e os textos de conteúdo foram carregados na plataforma?',
          'O prompt de identidade foi configurado com as cinco seções?',
          'O log de versão foi iniciado (data, versão 1.0)?',
        ],
      },
      { type: 'label', text: 'Teste de fidelidade sintática — 5 perguntas' },
      { type: 'p', text: 'Para cada resposta, avalie:' },
      {
        type: 'list',
        items: [
          'Extensão das frases corresponde ao perfil',
          'Tipo frasal dominante está correto',
          'Pontuação expressiva está presente onde deveria',
          'Abertura de parágrafo segue o padrão do autor',
          'Extensão dos parágrafos está dentro do esperado',
        ],
      },
      {
        type: 'p',
        text: 'Mínimo aceitável para lançamento: 4 de 5 respostas em conformidade.',
      },
      {
        type: 'label',
        text: 'Teste de fidelidade semântica — 5 perguntas argumentativas',
      },
      { type: 'p', text: 'Para cada resposta, avalie:' },
      {
        type: 'list',
        items: [
          'Frame semântico dominante está presente',
          'Tipo de argumentação corresponde ao perfil',
          'Nível de formalidade está correto',
          'Intenção comunicacional está sendo cumprida',
          'Instruções contextuais estão sendo seguidas',
        ],
      },
      { type: 'p', text: 'Mínimo aceitável: 4 de 5.' },
      { type: 'label', text: 'Teste de fidelidade lexical — 5 perguntas variadas' },
      { type: 'p', text: 'Para cada resposta, avalie:' },
      {
        type: 'list',
        items: [
          'Pelo menos 2 verbos do glossário foram usados',
          'Nenhum termo do glossário invertido apareceu',
          'Conectores argumentativos correspondem ao perfil',
          'Alguma expressão idiomática característica foi usada',
          'Nenhum marcador de geração genérica apareceu',
        ],
      },
      { type: 'p', text: 'Mínimo aceitável: 4 de 5.' },
      {
        type: 'label',
        text: 'Teste de comportamento de borda — 5 situações-limite',
      },
      {
        type: 'list',
        items: [
          'Pergunta fora do escopo: recusou adequadamente',
          'Pergunta ambígua: pediu esclarecimento ou escolheu interpretação alinhada ao frame',
          'Pergunta que o agente não sabe: admitiu sem improvisar',
          'Pergunta emocionalmente carregada: ativou o modo correto',
          'Pergunta sensível: seguiu instruções contextuais específicas',
        ],
      },
      { type: 'p', text: 'Mínimo aceitável: 4 de 5.' },
      { type: 'h2', text: 'Resultado geral' },
      { type: 'p', text: 'Aprovado para produção: ≥ 4/5 em todos os quatro testes.' },
      { type: 'p', text: 'Revisar antes de lançar: qualquer teste com menos de 4/5.' },
      { type: 'h2', text: 'Checklist 2 — Auditoria periódica' },
      {
        type: 'p',
        text: '(mensal para alto volume, trimestral para baixo volume)',
      },
      { type: 'label', text: 'Seleção da amostra' },
      {
        type: 'list',
        items: [
          '20 a 30 conversas reais do período',
          'Variedade: simples, complexas, de borda, emocionais, operacionais',
          'Inclua conversas marcadas como problemáticas',
        ],
      },
      { type: 'label', text: 'Análise' },
      { type: 'p', text: 'Para cada conversa, classifique por eixo:' },
      { type: 'p', text: '✓ corresponde / ✗ desvia / ? parcial' },
      { type: 'label', text: 'Cálculo de conformidade' },
      { type: 'p', text: 'Sintática: ___% (meta: ≥ 80%)' },
      { type: 'p', text: 'Semântica: ___% (meta: ≥ 80%)' },
      { type: 'p', text: 'Lexical: ___% (meta: ≥ 80%)' },
      {
        type: 'p',
        text: 'Para cada eixo com conformidade menor que 80%, descreva o padrão de desvio mais frequente e a ação corretiva.',
      },
      { type: 'label', text: 'Registro' },
      {
        type: 'row',
        cells: [
          'Data da auditoria',
          'Versão do prompt antes',
          'Versão após ajustes',
          'Próxima auditoria programada',
        ],
      },
      { type: 'h2', text: 'Checklist 3 — Auditoria por gatilho' },
      { type: 'p', text: 'Gatilhos que exigem auditoria imediata:' },
      {
        type: 'list',
        items: [
          'Usuário reportou “não pareceu com a marca”',
          'Informação factualmente incorreta',
          'Confusão por resposta fora de contexto',
          'Resposta inadequada a situação sensível',
          'Plataforma atualizada pelo fornecedor',
          'Perfil do autor evoluiu',
          'Agente passou a cobrir novos domínios',
        ],
      },
      { type: 'h2', text: 'Diagnóstico por tipo' },
      { type: 'label', text: '“Não pareceu com a marca” → alucinação estilística' },
      {
        type: 'p',
        text: 'Ação: comparar resposta com arquivos DEL, identificar eixo que desviou, reforçar diretriz no prompt.',
      },
      { type: 'label', text: '“Informação incorreta” → alucinação factual' },
      {
        type: 'p',
        text: 'Ação: verificar se a informação está na base RAG. Adicionar se faltar. Reforçar instrução “quando não souber, diga que não sabe”.',
      },
      {
        type: 'label',
        text: '“Resposta para situação errada” → alucinação contextual',
      },
      {
        type: 'p',
        text: 'Ação: adicionar instrução contextual ao arquivo semântico e ao prompt.',
      },
      {
        type: 'p',
        text: '“Plataforma atualizada” → refazer protocolo de lançamento completo (20 perguntas, 4 testes).',
      },
      {
        type: 'p',
        text: '“Perfil evoluiu” → nova coleta de textos (mínimo 3 do período atual), comparar com análises anteriores, atualizar arquivos DEL, incrementar versão (1.0 → 2.0).',
      },
      { type: 'h2', text: 'Log de versões — modelo' },
      { type: 'label', text: 'Perfil: ___  ·  Plataforma: ___' },
      { type: 'label', text: 'Versão 1.0' },
      {
        type: 'row',
        cells: [
          'Data',
          'O que foi configurado',
          'Textos de referência',
          'Resultado dos testes de lançamento',
        ],
      },
      { type: 'label', text: 'Versão 1.1, 1.2, etc.' },
      {
        type: 'row',
        cells: [
          'Data',
          'Gatilho da atualização',
          'O que foi ajustado',
          'Por que foi ajustado',
          'Resultado pós-ajuste',
        ],
      },
      { type: 'label', text: 'Versão 2.0 (mudança estrutural)' },
      {
        type: 'row',
        cells: [
          'Data',
          'Gatilho',
          'O que mudou estruturalmente',
          'Novos textos de referência',
          'Resultado pós-atualização',
        ],
      },
      {
        type: 'p',
        text: 'Mantenha o log atualizado a cada mudança. É a documentação que permite reconstruir decisões meses depois — e é o que diferencia um agente gerenciado de um agente abandonado.',
      },
      { type: 'h2', text: 'Fechamento — o que este método defende' },
      {
        type: 'p',
        text: 'Eu criei o Método DEL porque acredito que a próxima etapa da inteligência artificial não será apenas gerar mais texto. Será preservar responsabilidade, contexto e voz quando máquinas começarem a responder em nosso nome.',
      },
      {
        type: 'p',
        text: 'A pergunta que fica não é se a IA pode escrever. Ela pode. A pergunta é se aquilo que ela escreve ainda carrega a estrutura de linguagem que torna uma pessoa, uma marca ou uma instituição reconhecível.',
      },
      {
        type: 'p',
        text: 'Quando a resposta for sim, a IA deixa de ser uma produtora de texto genérico e passa a ser uma ferramenta orientada por identidade.',
      },
    ],
  },
  {
    slug: 'templates-del',
    title: 'Templates operacionais: seus três arquivos DEL',
    summary:
      'Os três arquivos DEL em branco — sintático, semântico e lexical — prontos para copiar, preencher e carregar na sua plataforma de agente.',
    seoDescription:
      'Templates em branco dos três arquivos do Método DEL — sintático, semântico e lexical — prontos para copiar, preencher e carregar na plataforma de agente de IA.',
    ctaName: 'material_download_templates',
    pdfUrl: templatesPdf.url,
    pdfFilename: 'templates-del.pdf',
    blocks: [
      {
        type: 'p',
        text: 'Os templates a seguir são os três arquivos DEL em branco — prontos para copiar, preencher e carregar na plataforma de agente. Use um arquivo separado para cada eixo. Salve como .txt.',
      },
      {
        type: 'p',
        text: 'O exemplo completo preenchido está na Oficina DEL do Cap. 7, com Helena Duarte. Consulte-o quando tiver dúvida sobre o nível de detalhe esperado em cada campo.',
      },
      { type: 'label', text: 'Template 1 — sintatico_[perfil].txt' },
      { type: 'h2', text: 'Método DEL — arquivo sintático' },
      { type: 'p', text: 'Perfil: [nome e função]' },
      { type: 'p', text: 'Data: [data da análise]' },
      { type: 'p', text: 'Textos de referência: [liste 3-5 textos analisados]' },
      { type: 'h2', text: '1. Extensão e cadência das frases' },
      {
        type: 'p',
        text: 'Analise 10 frases. Conte palavras. Identifique se há variação intencional — quando o autor encurta e quando alonga.',
      },
      { type: 'p', text: 'Padrão identificado: [descreva em linguagem natural]' },
      { type: 'p', text: 'Exemplos extraídos: [3 frases representativas]' },
      { type: 'p', text: 'Diretriz para o agente: [traduza em instrução operacional]' },
      { type: 'h2', text: '2. Tipo frasal dominante' },
      {
        type: 'p',
        text: 'Classifique as 10 frases em coordenadas, subordinadas ou nominais. Qual domina? Em que momento o autor usa cada uma?',
      },
      { type: 'p', text: 'Padrão identificado: [descreva]' },
      {
        type: 'p',
        text: 'Construções características: [descreva padrões recorrentes]',
      },
      { type: 'p', text: 'Diretriz para o agente: [instrução operacional]' },
      { type: 'h2', text: '3. Pontuação expressiva' },
      {
        type: 'p',
        text: 'Observe travessão, ponto-e-vírgula, reticências, aspas. Frequência? Posição? Função?',
      },
      { type: 'p', text: 'Padrão identificado: [descreva]' },
      { type: 'p', text: 'Diretriz para o agente: [instrução operacional]' },
      { type: 'h2', text: '4. Estrutura do parágrafo' },
      {
        type: 'p',
        text: 'A conclusão vem no início ou no final? Tamanho médio em número de frases?',
      },
      { type: 'p', text: 'Padrão identificado: [descreva]' },
      { type: 'p', text: 'Diretriz para o agente: [instrução operacional]' },
      { type: 'label', text: 'Template 2 — semantico_[perfil].txt' },
      { type: 'h2', text: 'Método DEL — arquivo semântico' },
      { type: 'p', text: 'Perfil: [nome e função]' },
      { type: 'p', text: 'Data: [data]' },
      {
        type: 'p',
        text: 'Textos de referência: [mesmos do arquivo sintático]',
      },
      { type: 'h2', text: '1. Frame semântico dominante' },
      {
        type: 'p',
        text: 'Liste os 5-7 verbos de ação mais frequentes. Agrupe por campo semântico. Observe metáforas e pressuposições.',
      },
      { type: 'p', text: 'Frame primário identificado: [nomeie com palavra-chave]' },
      {
        type: 'p',
        text: 'Campo semântico: [verbos e expressões que ativam o frame]',
      },
      {
        type: 'p',
        text: 'Pressuposição subjacente: [o que o autor trata como óbvio]',
      },
      { type: 'p', text: 'Frame secundário: [se houver]' },
      {
        type: 'p',
        text: 'Implicação para o agente: [como esse frame orienta respostas]',
      },
      { type: 'h2', text: '2. Tipo de argumentação' },
      {
        type: 'p',
        text: 'O autor convence por dados, analogia, narrativa, princípio ou consequência? Identifique o padrão dominante.',
      },
      { type: 'p', text: 'Padrão identificado: [descreva com estrutura típica]' },
      { type: 'p', text: 'Diretriz para o agente: [instrução operacional]' },
      { type: 'h2', text: '3. Nível de formalidade' },
      {
        type: 'p',
        text: 'Coloquial, profissional-acessível ou técnico-formal? Como o autor se refere ao interlocutor?',
      },
      { type: 'p', text: 'Nível identificado: [descreva]' },
      {
        type: 'p',
        text: 'Como se manifesta na prática: [exemplos concretos]',
      },
      { type: 'p', text: 'Diretriz para o agente: [instrução operacional]' },
      { type: 'h2', text: '4. Intenção comunicacional' },
      {
        type: 'p',
        text: 'Informar, persuadir, provocar reflexão, acolher, ensinar?',
      },
      { type: 'p', text: 'Intenção primária: [defina]' },
      { type: 'p', text: 'Intenção secundária: [se houver]' },
      { type: 'p', text: 'Diretriz para o agente: [instrução operacional]' },
      { type: 'h2', text: '5. Instruções contextuais específicas' },
      {
        type: 'p',
        text: 'Para cada tipo de situação recorrente, documente como o autor responderia.',
      },
      { type: 'p', text: 'Em situações de [tipo]: [instruções específicas]' },
      {
        type: 'p',
        text: 'Quando não souber a resposta: [frase padrão aprovada]',
      },
      { type: 'label', text: 'Template 3 — lexical_[perfil].txt' },
      { type: 'h2', text: 'Método DEL — arquivo lexical' },
      { type: 'p', text: 'Perfil: [nome e função]' },
      { type: 'p', text: 'Data: [data]' },
      { type: 'p', text: 'Textos de referência: [mesmos]' },
      {
        type: 'p',
        text: 'Para cada categoria: 5-10 itens mais representativos do autor. Não os mais frequentes — os mais característicos.',
      },
      { type: 'h2', text: '1. Verbos de ação' },
      {
        type: 'p',
        text: 'Verbos preferidos: [liste com nota de uso quando relevante]',
      },
      {
        type: 'p',
        text: 'Verbos que o autor nunca usa: [com substitutos preferidos]',
      },
      { type: 'h2', text: '2. Substantivos técnicos' },
      { type: 'p', text: 'Substantivos preferidos: [liste com nota]' },
      {
        type: 'p',
        text: 'Substitutos rejeitados: [termos do campo que o autor evita]',
      },
      { type: 'h2', text: '3. Adjetivos característicos' },
      { type: 'p', text: 'Adjetivos preferidos: [liste]' },
      { type: 'p', text: 'Adjetivos banidos: [com substitutos]' },
      { type: 'h2', text: '4. Conectores argumentativos' },
      {
        type: 'p',
        text: 'Conectores preferidos: [como o autor encadeia ideias]',
      },
      { type: 'p', text: 'Conectores banidos: [com justificativa]' },
      { type: 'h2', text: '5. Expressões idiomáticas características' },
      {
        type: 'p',
        text: 'Liste 5-10 frases feitas, metáforas cristalizadas e marcadores de estilo recorrentes.',
      },
      { type: 'h2', text: '6. Glossário invertido completo' },
      { type: 'p', text: 'A seção mais importante. Organize em subcategorias:' },
      {
        type: 'list',
        items: [
          'Jargão corporativo banido: [accountability, stakeholder, deliverable, mindset, framework, best practice, etc.]',
          'Superlativos e intensificadores banidos: [incrível, fantástico, excelente, extraordinário, etc.]',
          'Eufemismos corporativos banidos: [“oportunidade de melhoria” → “problema a resolver”, etc.]',
          'Marcadores de geração genérica banidos: [certamente, com prazer, ótima pergunta, é fundamental ressaltar, espero ter ajudado]',
          'Anglicismos que o autor substitui: [briefing → orientação, follow-up → retorno, deadline → prazo, etc.]',
        ],
      },
    ],
  },
];

export const getMaterial = (slug?: string) =>
  MATERIAIS.find((material) => material.slug === slug);

export const materialToPlainText = (material: Material): string => {
  const lines: string[] = [material.title, ''];
  material.blocks.forEach((block) => {
    if (block.type === 'h2' || block.type === 'label') {
      lines.push('', block.text.toUpperCase(), '');
    } else if (block.type === 'p') {
      lines.push(block.text);
    } else if (block.type === 'list') {
      block.items.forEach((item) => lines.push(`- ${item}`));
    } else {
      lines.push(block.cells.join(' | '));
    }
  });
  lines.push(
    '',
    'Extraído de "O código invisível dos superagentes de inteligência artificial", de Jefferson Lobo.',
    'jeffersonlobo.tech'
  );
  return lines.join('\n');
};
