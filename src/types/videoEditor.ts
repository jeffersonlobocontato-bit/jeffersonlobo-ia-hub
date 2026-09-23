// Tipos e presets do Editor de Vídeo (Admin > Criativos > Vídeos & Reels).
//
// A configuração de cada projeto é guardada como dado (JSONB), nunca como
// pixel "queimado" — o mesmo princípio do Carrossel Jefferson: qualquer
// campo pode ser reaberto e editado depois sem refazer o vídeo do zero.
//
// TEMPLATE_LIBRARY é o catálogo: cada referência de vídeo que analisamos
// (reel do Instagram, etc.) vira uma entrada aqui, com seu próprio conjunto
// de padrões. Adicionar uma referência nova é adicionar um item na lista —
// não reescrever telas.

export type Paleta = 'ambar' | 'ciano' | 'sage';
export type TemplateTipo = 'card_dados' | 'fundo_dinamico' | 'depoimento_estudio';
// 'iris' (wipe circular) é a transição que aparece na referência do
// "depoimento de estúdio", mas ainda não tem seletor na UI nem renderização
// no preview — por isso nenhum template usa como padrão ainda. Fica no tipo
// pra já existir o nome quando essa transição for implementada de verdade.
export type TransicaoTipo = 'corte' | 'fusao' | 'arrasto' | 'iris';
export type StatusProjeto = 'rascunho' | 'pronto' | 'publicado';
export type EstiloLegenda = 'karaoke' | 'frase' | 'manchete';
export type ModoMoldura = 'flutuante' | 'tela_cheia';

export interface MolduraConfig {
  modo: ModoMoldura; // 'flutuante' = moldura pequena sobre o fundo; 'tela_cheia' = a gravação ocupa o palco inteiro
  xPct: number; // centro X, % da largura do palco (só importa em modo flutuante)
  yPct: number; // centro Y, % da altura do palco (só importa em modo flutuante)
  larguraPct: number; // largura da moldura, % da largura do palco (só importa em modo flutuante)
  zoom: number; // 100–200, zoom da mídia dentro da moldura
  focalX: number; // 0–100, ponto focal da mídia dentro da moldura
  focalY: number;
  mediaUrl: string | null;
  mediaTipo: 'imagem' | 'video'; // vídeo é o que tem áudio pra transcrever — imagem é só referência visual
}

export interface CardDadosConfig {
  titulo: string;
  subtitulo: string;
  fonte: string;
  imagemUrl: string | null; // gráfico/print já pronto, se houver
}

export interface ClipeFundo {
  id: string;
  mediaUrl: string | null;
  tipo: 'imagem' | 'video';
  duracaoSegundos: number;
  transicao: TransicaoTipo;
}

export interface FundoDinamicoConfig {
  clipes: ClipeFundo[];
}

export interface LinhaManchete {
  texto: string;
  destaque: boolean; // linha em negrito grande (a "palavra-chave" do bloco)
}

export interface PalavraTranscrita {
  texto: string;
  inicio: number; // segundos, desde o início da gravação
  fim: number;
}

export interface LegendaConfig {
  ativa: boolean;
  estilo: EstiloLegenda;
  textoExemplo: string; // usado nos estilos karaoke/frase
  palavraDestaque: string; // usado no estilo karaoke
  manchete: LinhaManchete[]; // usado no estilo manchete (bloco de várias linhas, uma em destaque)
  palavras: PalavraTranscrita[]; // transcrição real, com tempo por palavra (Whisper) — [] até transcrever
  transcritoEm: string | null; // ISO — null enquanto não roda a transcrição automática
}

export interface AssinaturaConfig {
  ativa: boolean;
  modo: 'template' | 'arquivo';
  arquivoUrl: string | null;
}

export interface CapaConfig {
  badge: string;
  titulo: string;
  handle: string;
  imagemUrl: string | null;
}

// ── TIMELINE ──────────────────────────────────────────────────────────────
// Etapa 1 da linha do tempo: só o suficiente pra tocar a gravação principal
// (moldura.mediaUrl) e mostrar o corte dela na régua. Cresce nas próximas
// etapas — B-roll com múltiplos clipes e trilha sonora entram como campos
// novos aqui dentro, sem trocar o nome nem duplicar estrutura.
export interface TimelineConfig {
  duracaoOriginalSegundos: number | null; // duração real do arquivo, detectada pelo player — null até o vídeo carregar
  cortarInicioSegundos: number; // segundos a partir do início do arquivo original (trim in)
  cortarFimSegundos: number | null; // segundos a partir do início do arquivo original (trim out); null = até o fim
}

/** Duração do trecho que de fato entra no vídeo final, já considerando o corte. */
export function duracaoEfetivaTimeline(timeline: TimelineConfig): number {
  const fim = timeline.cortarFimSegundos ?? timeline.duracaoOriginalSegundos ?? 0;
  return Math.max(0, fim - timeline.cortarInicioSegundos);
}

/** Formato m:ss usado no player e na régua — um só lugar pra mudar (ex.: horas em vídeos longos). */
export function formatarTempoTimeline(segundos: number): string {
  const s = Math.max(0, Math.floor(segundos));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

// ── B-ROLL (fundo dinâmico) NA LINHA DO TEMPO ───────────────────────────
// Os clipes tocam um atrás do outro, sem espaço entre eles — a posição de
// cada um é sempre calculada a partir da ordem do array e da duração dos
// anteriores, nunca guardada solta (senão dá pra um clipe "flutuar" e abrir
// buraco ou sobrepor o vizinho sem querer).
export interface ClipePosicionado {
  clipe: ClipeFundo;
  inicioSegundos: number;
}

export function posicionarClipes(clipes: ClipeFundo[]): ClipePosicionado[] {
  let acumulado = 0;
  return clipes.map((clipe) => {
    const posicionado = { clipe, inicioSegundos: acumulado };
    acumulado += clipe.duracaoSegundos;
    return posicionado;
  });
}

export function duracaoTotalClipes(clipes: ClipeFundo[]): number {
  return clipes.reduce((soma, c) => soma + c.duracaoSegundos, 0);
}

/** Índice do clipe que está "tocando" num instante — o último cujo início é <= tempo. */
export function indiceClipeNoTempo(clipes: ClipeFundo[], tempoSegundos: number): number {
  const posicoes = posicionarClipes(clipes);
  let indice = 0;
  posicoes.forEach((p, i) => { if (tempoSegundos >= p.inicioSegundos) indice = i; });
  return indice;
}

export interface FiltroVintageConfig {
  ativo: boolean;
  intensidade: number; // 0–100 — grão + tom quente + vinheta
}

export interface OverlayFundoConfig {
  ativo: boolean;
  imagemUrl: string | null; // ex.: capa de livro, foto de referência
  opacidade: number; // 0–100
}

export interface VideoProjectConfig {
  paleta: Paleta;
  mostrarZonasSeguras: boolean;
  moldura: MolduraConfig;
  cardDados: CardDadosConfig;
  fundoDinamico: FundoDinamicoConfig;
  legenda: LegendaConfig;
  assinatura: AssinaturaConfig;
  capa: CapaConfig;
  filtroVintage: FiltroVintageConfig;
  overlayFundo: OverlayFundoConfig;
  timeline: TimelineConfig;
}

export interface VideoProject {
  id: string;
  title: string;
  template: TemplateTipo;
  status: StatusProjeto;
  config: VideoProjectConfig;
  cover_url: string | null;
  duration_seconds: number | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// ── PALETAS (mesmas do Carrossel Jefferson, pra manter a marca consistente) ─
export const PALETAS: Record<Paleta, {
  nome: string;
  bgDark: string;
  text: string;
  accent: string;
  accentOnDark: string;
  bgLight: string;
  inkLight: string;
}> = {
  ambar: { nome: 'Petróleo / Âmbar', bgDark: '#0D0D0F', text: '#F0EEE8', accent: '#C9973A', accentOnDark: '#0D0D0F', bgLight: '#F2F0E8', inkLight: '#0D0D0F' },
  ciano: { nome: 'Azul / Ciano', bgDark: '#060F18', text: '#EDF4F5', accent: '#2196A6', accentOnDark: '#EDF4F5', bgLight: '#EDF4F5', inkLight: '#0A1A22' },
  sage:  { nome: 'Bosque / Sage', bgDark: '#080F07', text: '#F0EDE3', accent: '#7EA55A', accentOnDark: '#0A1208', bgLight: '#F0EDE3', inkLight: '#0E1A0C' },
};

// ── ZONAS SEGURAS ────────────────────────────────────────────────────────
// Aproximação do espaço que a interface do Reels/TikTok cobre por cima do
// vídeo (legenda nativa, @usuário, música, ícones de interação). Texto e
// moldura não deveriam invadir essas faixas.
export const ZONA_SEGURA = {
  topoPct: 6,     // barra de status / stories
  baixoPct: 14,   // @usuário + legenda nativa + música
  direitaPct: 9,  // curtir / comentar / compartilhar / salvar
};

// ── BIBLIOTECA DE TEMPLATES ──────────────────────────────────────────────
// Cada entrada nasce de uma referência de vídeo analisada. Pra adicionar uma
// referência nova: extrair o padrão dela, criar a entrada aqui com os
// padrões (moldura, legenda, filtro, transição) e, se precisar de um campo
// que ainda não existe, estender VideoProjectConfig.
export interface TemplateDefinition {
  id: TemplateTipo;
  nome: string;
  origem: string; // de onde veio o padrão (referência analisada)
  descricao: string;
  moldura: { modo: ModoMoldura };
  estiloLegendaPadrao: EstiloLegenda;
  filtroVintagePadrao: boolean;
  transicaoPadrao: TransicaoTipo;
}

export const TEMPLATE_LIBRARY: TemplateDefinition[] = [
  {
    id: 'card_dados',
    nome: '📊 Card de dados',
    origem: 'Reel de análise de dados (gráfico + fala)',
    descricao: 'Fundo é um card fixo (gráfico/dado) que anima uma vez no início. Moldura pequena, legenda frase a frase.',
    moldura: { modo: 'flutuante' },
    estiloLegendaPadrao: 'karaoke',
    filtroVintagePadrao: false,
    transicaoPadrao: 'corte',
  },
  {
    id: 'fundo_dinamico',
    nome: '🎞️ Fundo dinâmico',
    origem: 'Uso geral — múltiplas mídias trocando',
    descricao: 'Fundo troca entre vídeos/imagens ao longo da fala, com transições de fusão ou arrasto. Moldura pequena.',
    moldura: { modo: 'flutuante' },
    estiloLegendaPadrao: 'karaoke',
    filtroVintagePadrao: false,
    transicaoPadrao: 'fusao',
  },
  {
    id: 'depoimento_estudio',
    nome: '🎙️ Depoimento de estúdio',
    origem: 'Reel tipo podcast (plano aberto, estante de fundo)',
    descricao: 'Gravação em tela cheia (plano americano), com cortes para B-roll em filtro vintage/grão, transição em íris circular e imagem de referência com brilho atrás de quem fala. Legenda alterna entre linha simples e um bloco "manchete" com a palavra-chave em destaque.',
    moldura: { modo: 'tela_cheia' },
    estiloLegendaPadrao: 'frase',
    filtroVintagePadrao: true,
    transicaoPadrao: 'fusao', // 'iris' seria o ideal (é o que a referência usa) — ver comentário em TransicaoTipo
  },
];

export function definicaoTemplate(id: TemplateTipo): TemplateDefinition {
  return TEMPLATE_LIBRARY.find((t) => t.id === id) ?? TEMPLATE_LIBRARY[0];
}

// Mantido por compatibilidade com o que já lia só nome/descrição.
export const TEMPLATE_LABELS: Record<TemplateTipo, { nome: string; desc: string }> =
  Object.fromEntries(TEMPLATE_LIBRARY.map((t) => [t.id, { nome: t.nome, desc: t.descricao }])) as Record<TemplateTipo, { nome: string; desc: string }>;

const molduraPadrao = (modo: ModoMoldura): MolduraConfig => ({
  modo,
  xPct: 50,
  yPct: modo === 'tela_cheia' ? 50 : 62,
  larguraPct: modo === 'tela_cheia' ? 100 : 36,
  zoom: 110,
  focalX: 50,
  focalY: 40,
  mediaUrl: null,
  mediaTipo: 'imagem',
});

export function criarConfigPadrao(template: TemplateTipo): VideoProjectConfig {
  const def = definicaoTemplate(template);
  return {
    paleta: 'ambar',
    mostrarZonasSeguras: true,
    moldura: molduraPadrao(def.moldura.modo),
    cardDados: {
      titulo: 'Título do card de dados',
      subtitulo: 'LINHA DE APOIO EM CAIXA ALTA',
      fonte: 'Fonte: ',
      imagemUrl: null,
    },
    fundoDinamico: {
      clipes: [
        { id: crypto.randomUUID(), mediaUrl: null, tipo: 'imagem', duracaoSegundos: 4, transicao: def.transicaoPadrao },
      ],
    },
    legenda: {
      ativa: true,
      estilo: def.estiloLegendaPadrao,
      textoExemplo: 'aí que talvez você não queira ouvir,',
      palavraDestaque: 'você',
      palavras: [],
      transcritoEm: null,
      manchete: [
        { texto: 'todo mundo', destaque: false },
        { texto: 'ama contar', destaque: false },
        { texto: 'histórias', destaque: true },
        { texto: 'de superação', destaque: false },
      ],
    },
    assinatura: {
      ativa: true,
      modo: 'template',
      arquivoUrl: null,
    },
    capa: {
      badge: '#IA',
      titulo: 'Título da capa',
      handle: '@jeffersonlobo',
      imagemUrl: null,
    },
    filtroVintage: {
      ativo: def.filtroVintagePadrao,
      intensidade: 55,
    },
    overlayFundo: {
      ativo: false,
      imagemUrl: null,
      opacidade: 35,
    },
    timeline: {
      duracaoOriginalSegundos: null,
      cortarInicioSegundos: 0,
      cortarFimSegundos: null,
    },
  };
}

/**
 * Preenche, num config vindo do banco, qualquer campo que a biblioteca de
 * templates ganhou depois que aquele projeto foi salvo (ex.: projetos
 * criados antes de filtroVintage/overlayFundo/legenda.manchete existirem).
 * Sem isso, abrir um projeto antigo quebra a tela inteira porque o preview
 * lê `config.filtroVintage.ativo` etc. direto, sem checar undefined.
 * Campos que o projeto já tem são mantidos; só o que falta vem do padrão.
 */
export function normalizarConfig(config: Partial<VideoProjectConfig> | null | undefined, template: TemplateTipo): VideoProjectConfig {
  const padrao = criarConfigPadrao(template);
  if (!config) return padrao;
  return {
    ...padrao,
    ...config,
    moldura: { ...padrao.moldura, ...config.moldura },
    cardDados: { ...padrao.cardDados, ...config.cardDados },
    fundoDinamico: { ...padrao.fundoDinamico, ...config.fundoDinamico },
    legenda: { ...padrao.legenda, ...config.legenda },
    assinatura: { ...padrao.assinatura, ...config.assinatura },
    capa: { ...padrao.capa, ...config.capa },
    filtroVintage: { ...padrao.filtroVintage, ...config.filtroVintage },
    overlayFundo: { ...padrao.overlayFundo, ...config.overlayFundo },
    timeline: { ...padrao.timeline, ...config.timeline },
  };
}
