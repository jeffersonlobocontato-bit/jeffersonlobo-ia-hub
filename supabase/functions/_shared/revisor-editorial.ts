// Revisor editorial automático do blog (nov/2026).
//
// Decide se um rascunho do pipeline pode ir ao ar sem revisão humana. Só
// aprova quando passa nas DUAS etapas:
//   1. Checagens objetivas (código, sem IA): tamanho, estrutura, termos
//      proibidos, regras de StartSe/caso próprio/link do método e, o mais
//      importante, se todo número citado existe no material permitido.
//   2. Avaliação editorial por um segundo modelo, comparando o rascunho com a
//      linha editorial e com a matéria-modelo aprovada por Jefferson.
// Na dúvida (erro, resposta inválida, nota baixa), o rascunho fica esperando
// aprovação humana como antes. O revisor nunca publica nada sozinho: ele só
// muda o status para 'approved', e o content-pipeline-publish publica às 10h.

import { LINHA_EDITORIAL, FATOS_DE_REFERENCIA } from './linha-editorial.ts';
import { MATERIA_MODELO, POR_QUE_O_MODELO_FOI_APROVADO } from './materia-modelo.ts';

export type Tipo = 'autoral' | 'curadoria';

export interface RascunhoParaRevisao {
  title: string;
  subtitle: string;
  excerpt: string;
  content_md: string;
  faq: { q: string; a: string }[];
  sources?: { name: string; url: string }[];
}

export interface ResultadoRevisao {
  aprovado: boolean;
  nota: number | null;
  falhasObjetivas: string[];
  problemasEditoriais: string[];
  criterios: Record<string, boolean>;
  resumo: string;
  revisadoEm: string;
}

const NOTA_MINIMA = 8;

const TERMOS_PROIBIDOS = [
  'revolução', 'revolucionar', 'revolucionári', 'disruptiv', 'game changer', 'o futuro é agora',
  'nunca foi tão importante', 'não fique para trás', 'descubra', 'sem sombra de dúvida',
  'contrate', 'fale comigo', 'referência nacional', 'especialista renomado', 'sou referência',
  'garantimos', 'garantia de resultado', 'roi garantido',
];

const contarPalavras = (t: string) => t.replace(/[#*_>\[\]()]/g, ' ').split(/\s+/).filter(Boolean).length;
const ocorrencias = (t: string, termo: string | RegExp) =>
  (t.match(typeof termo === 'string' ? new RegExp(termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi') : termo) || []).length;

function paragrafos(md: string): string[] {
  return md.split(/\n\s*\n/).map((p) => p.trim()).filter((p) => p && !p.startsWith('#'));
}

/** Números "citáveis" de um texto: percentuais, valores e números com 2+ dígitos (anos ficam de fora). */
export function extrairNumeros(texto: string): string[] {
  const achados = texto.match(/\d+(?:[.,]\d+)*/g) || [];
  return [...new Set(achados)]
    .map((n) => n.replace(/\.(?=\d{3}\b)/g, '')) // 1.862 -> 1862
    .filter((n) => n.replace(/\D/g, '').length >= 2)
    .filter((n) => !/^(19|20)\d{2}$/.test(n));
}

function corpusDeNumeros(material: string): Set<string> {
  return new Set(extrairNumeros(material));
}

function pareceTitleCase(titulo: string): boolean {
  const palavras = titulo.split(/\s+/).slice(1).filter((w) => w.length > 3);
  if (palavras.length < 3) return false;
  const maiusculas = palavras.filter((w) => /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(w)).length;
  return maiusculas / palavras.length > 0.5;
}

/** Etapa 1: checagens objetivas. Retorna a lista de falhas (vazia = passou). */
export function checagensObjetivas(
  r: RascunhoParaRevisao,
  tipo: Tipo,
  contexto: { materialPermitido: string; casoProprioLiberado: boolean },
): string[] {
  const falhas: string[] = [];
  const corpo = r.content_md || '';
  const tudo = [r.title, r.subtitle, r.excerpt, corpo, ...r.faq.map((f) => `${f.q} ${f.a}`)].join('\n');
  const palavras = contarPalavras(corpo);
  const h2 = ocorrencias(corpo, /^##\s+/gm);

  const [minP, maxP] = tipo === 'autoral' ? [650, 1150] : [350, 1300];
  if (palavras < minP || palavras > maxP) falhas.push(`Tamanho fora da faixa: ${palavras} palavras (esperado ${minP}-${maxP}).`);
  const [minH, maxH] = tipo === 'autoral' ? [3, 6] : [2, 6];
  if (h2 < minH || h2 > maxH) falhas.push(`${h2} subtítulos (##), esperado ${minH}-${maxH}.`);
  if (/^#\s+/m.test(corpo)) falhas.push('O corpo repete o título como H1.');
  if (!r.title || r.title.length > 110) falhas.push('Título ausente ou longo demais.');
  if (pareceTitleCase(r.title)) falhas.push('Título com Capitalização Em Cada Palavra.');
  if (!r.excerpt || r.excerpt.length > 170) falhas.push(`Resumo ausente ou com mais de 170 caracteres (${r.excerpt?.length || 0}).`);
  if (r.faq.length < 3 || r.faq.length > 4) falhas.push(`FAQ com ${r.faq.length} perguntas (esperado 3-4).`);
  if (tipo === 'curadoria' && (!r.sources || r.sources.length === 0)) falhas.push('Coluna de curadoria sem fontes.');
  if (tudo.includes('!')) falhas.push('Usa ponto de exclamação.');
  if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(tudo)) falhas.push('Usa emoji.');

  const lower = tudo.toLowerCase();
  for (const t of TERMOS_PROIBIDOS) if (lower.includes(t)) falhas.push(`Termo proibido: "${t}".`);

  // Método: no máximo uma menção com link e duas menções no total.
  if (ocorrencias(tudo, 'jeffersonlobo.tech/provadeganho') > 1) falhas.push('Link do método aparece mais de uma vez.');
  if (ocorrencias(tudo, 'Prova de Ganho') > 2) falhas.push('Método Prova de Ganho citado mais de duas vezes.');
  if (ocorrencias(tudo, /\bDEL\b/g) > 1) falhas.push('Método DEL citado mais de uma vez.');

  // Consultorias como fonte, nunca como protagonistas.
  const paras = paragrafos(corpo);
  const vitrine = [r.title, r.subtitle, r.excerpt, paras[0] || '', paras[paras.length - 1] || ''].join('\n');
  if (ocorrencias(tudo, 'StartSe') > 1) falhas.push('StartSe citada mais de uma vez.');
  for (const c of ['StartSe', 'McKinsey', 'BCG', 'Deloitte', 'PwC', 'Accenture', 'Bain', 'KPMG', 'EY']) {
    if (new RegExp(`\\b${c}\\b`).test(vitrine)) falhas.push(`${c} aparece no título, resumo, abertura ou fechamento.`);
  }

  // Caso próprio só quando liberado.
  if (!contexto.casoProprioLiberado && /Vozes Paranaenses/i.test(tudo)) {
    falhas.push('Usa o caso Vozes Paranaenses sem estar liberado (já apareceu nas últimas duas semanas).');
  }

  // Fidelidade numérica: todo número tem que existir no material permitido.
  const permitidos = corpusDeNumeros(contexto.materialPermitido);
  const estranhos = extrairNumeros(tudo).filter((n) => !permitidos.has(n));
  if (estranhos.length > 0) falhas.push(`Números sem origem no material permitido: ${estranhos.slice(0, 8).join(', ')}.`);

  return falhas;
}

const PROMPT_REVISOR = `Você é o editor-chefe do blog de Jefferson Lobo. Sua função é decidir se um rascunho pode ser publicado SEM revisão humana. Seja rigoroso: na dúvida, reprove. Um texto ruim publicado custa mais do que um texto bom que espera revisão.

Avalie o rascunho contra a LINHA EDITORIAL e contra a MATÉRIA-MODELO aprovada por Jefferson. O rascunho não precisa ter o mesmo tema nem os mesmos casos do modelo (e não deve copiá-lo), mas precisa ter o mesmo nível de qualidade, tom, evidência e cuidado.

# LINHA EDITORIAL
${LINHA_EDITORIAL}

# MATÉRIA-MODELO APROVADA
Título: ${MATERIA_MODELO.title}
Subtítulo: ${MATERIA_MODELO.subtitle}
Resumo: ${MATERIA_MODELO.excerpt}

${MATERIA_MODELO.content_md}

# POR QUE O MODELO FOI APROVADO
${POR_QUE_O_MODELO_FOI_APROVADO}

# CRITÉRIOS (true = atende)
- "tese_prova_de_ganho": o raciocínio central é medir e provar ganho antes de escalar; DEL não é o tema.
- "calibrado_brasil": não caricatura o board brasileiro (não diz que é contra IA ou que ignora o tema); critica a forma, com dados.
- "papel_humano": valoriza o papel humano com argumento, sem prometer corte de pessoal e sem catastrofismo.
- "estilo_jornalistico": abre com fato concreto, linguagem sóbria e clara, argumento com evidência, sem hype, sem viés político.
- "autoridade_sem_autopromocao": a autoridade vem da interpretação e das distinções; sem autoelogio, sem cliente ou história inventada, sem chamada comercial além do link único do método.
- "consultorias_como_fonte": consultorias aparecem só como fonte de dado, nunca como protagonistas ou recomendadas; StartSe não é a referência do texto.
- "sem_promessa": não promete ROI, percentual de ganho ou prazo ao leitor.
- "fidelidade_aos_fatos": toda afirmação factual (empresa, estudo, data, número, citação) está nos FATOS DE REFERÊNCIA ou nas notícias fornecidas, e é usada com o sentido correto.
- "fechamento_pratico": termina com consequência prática para o conselho.
- "valor_para_o_leitor": um conselheiro que nunca vai contratar nada sai do texto sabendo algo útil.

Retorne APENAS um JSON válido:
{"nota": 0-10, "criterios": {"tese_prova_de_ganho": true, "...": true}, "problemas": ["problema concreto e onde está"], "resumo": "uma frase com o veredito"}`;

const CRITERIOS_OBRIGATORIOS = [
  'calibrado_brasil', 'papel_humano', 'estilo_jornalistico', 'autoridade_sem_autopromocao',
  'consultorias_como_fonte', 'sem_promessa', 'fidelidade_aos_fatos',
];

async function avaliarComIA(
  apiKey: string,
  r: RascunhoParaRevisao,
  tipo: Tipo,
  noticias: string,
): Promise<{ nota: number; criterios: Record<string, boolean>; problemas: string[]; resumo: string }> {
  const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // Modelo diferente (e mais forte) que o redator, para não "concordar consigo mesmo".
      model: 'google/gemini-2.5-pro',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: PROMPT_REVISOR },
        {
          role: 'user',
          content:
            `Tipo: ${tipo === 'autoral' ? 'artigo autoral' : 'coluna de curadoria Vozes que Importam'}\n\n` +
            `NOTÍCIAS FORNECIDAS AO REDATOR:\n${noticias}\n\n` +
            `RASCUNHO:\nTítulo: ${r.title}\nSubtítulo: ${r.subtitle}\nResumo: ${r.excerpt}\n\n${r.content_md}\n\n` +
            `FAQ:\n${r.faq.map((f) => `P: ${f.q}\nR: ${f.a}`).join('\n')}`,
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`revisor: gateway ${res.status} ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');
  const nota = Number(parsed.nota);
  if (!Number.isFinite(nota)) throw new Error('revisor: resposta sem nota');
  return {
    nota,
    criterios: typeof parsed.criterios === 'object' && parsed.criterios ? parsed.criterios : {},
    problemas: Array.isArray(parsed.problemas) ? parsed.problemas.map(String) : [],
    resumo: String(parsed.resumo || ''),
  };
}

export async function revisarRascunho(
  apiKey: string,
  r: RascunhoParaRevisao,
  tipo: Tipo,
  contexto: { noticias: string; casoProprioLiberado: boolean },
): Promise<ResultadoRevisao> {
  const revisadoEm = new Date().toISOString();
  const materialPermitido = `${FATOS_DE_REFERENCIA}\n${contexto.noticias}`;
  const falhasObjetivas = checagensObjetivas(r, tipo, { materialPermitido, casoProprioLiberado: contexto.casoProprioLiberado });

  // Reprovado na etapa objetiva: nem gasta a chamada de IA.
  if (falhasObjetivas.length > 0) {
    return { aprovado: false, nota: null, falhasObjetivas, problemasEditoriais: [], criterios: {}, resumo: 'Reprovado nas checagens objetivas.', revisadoEm };
  }

  try {
    const ia = await avaliarComIA(apiKey, r, tipo, contexto.noticias);
    const faltando = CRITERIOS_OBRIGATORIOS.filter((c) => ia.criterios[c] !== true);
    const aprovado = ia.nota >= NOTA_MINIMA && faltando.length === 0;
    return {
      aprovado,
      nota: ia.nota,
      falhasObjetivas: [],
      problemasEditoriais: [...faltando.map((c) => `Critério não atendido: ${c}`), ...ia.problemas],
      criterios: ia.criterios,
      resumo: ia.resumo,
      revisadoEm,
    };
  } catch (e) {
    return {
      aprovado: false,
      nota: null,
      falhasObjetivas: [],
      problemasEditoriais: [`Revisor indisponível: ${e instanceof Error ? e.message : String(e)}`],
      criterios: {},
      resumo: 'Revisor falhou; fica para aprovação humana.',
      revisadoEm,
    };
  }
}
