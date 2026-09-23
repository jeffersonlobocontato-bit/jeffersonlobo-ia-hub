// Tipos e presets do Editor de Vídeo (Admin > Editor de Vídeo).
//
// A configuração de cada projeto é guardada como dado (JSONB), nunca como
// pixel "queimado" — o mesmo princípio do Carrossel Jefferson: qualquer
// campo pode ser reaberto e editado depois sem refazer o vídeo do zero.

export type Paleta = 'ambar' | 'ciano' | 'sage';
export type TemplateTipo = 'card_dados' | 'fundo_dinamico';
export type TransicaoTipo = 'corte' | 'fusao' | 'arrasto';
export type StatusProjeto = 'rascunho' | 'pronto' | 'publicado';

export interface MolduraConfig {
  xPct: number; // centro X, % da largura do palco
  yPct: number; // centro Y, % da altura do palco
  larguraPct: number; // largura da moldura, % da largura do palco
  zoom: number; // 100–200, zoom da mídia dentro da moldura
  focalX: number; // 0–100, ponto focal da mídia dentro da moldura
  focalY: number;
  mediaUrl: string | null;
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

export interface LegendaConfig {
  ativa: boolean;
  estilo: 'karaoke' | 'frase';
  textoExemplo: string;
  palavraDestaque: string;
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

export interface VideoProjectConfig {
  paleta: Paleta;
  mostrarZonasSeguras: boolean;
  moldura: MolduraConfig;
  cardDados: CardDadosConfig;
  fundoDinamico: FundoDinamicoConfig;
  legenda: LegendaConfig;
  assinatura: AssinaturaConfig;
  capa: CapaConfig;
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

const molduraPadrao = (): MolduraConfig => ({
  xPct: 50,
  yPct: 62,
  larguraPct: 36,
  zoom: 110,
  focalX: 50,
  focalY: 40,
  mediaUrl: null,
});

export function criarConfigPadrao(template: TemplateTipo): VideoProjectConfig {
  return {
    paleta: 'ambar',
    mostrarZonasSeguras: true,
    moldura: molduraPadrao(),
    cardDados: {
      titulo: 'Título do card de dados',
      subtitulo: 'LINHA DE APOIO EM CAIXA ALTA',
      fonte: 'Fonte: ',
      imagemUrl: null,
    },
    fundoDinamico: {
      clipes: [
        { id: crypto.randomUUID(), mediaUrl: null, tipo: 'imagem', duracaoSegundos: 4, transicao: 'fusao' },
      ],
    },
    legenda: {
      ativa: true,
      estilo: 'karaoke',
      textoExemplo: 'aí que talvez você não queira ouvir,',
      palavraDestaque: 'você',
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
  };
}

export const TEMPLATE_LABELS: Record<TemplateTipo, { nome: string; desc: string }> = {
  card_dados: {
    nome: '📊 Card de dados',
    desc: 'Fundo é um card fixo (gráfico/dado) que anima uma vez no início. Moldura pequena, legenda frase a frase.',
  },
  fundo_dinamico: {
    nome: '🎞️ Fundo dinâmico',
    desc: 'Fundo troca entre vídeos/imagens ao longo da fala, com transições de fusão ou arrasto.',
  },
};
