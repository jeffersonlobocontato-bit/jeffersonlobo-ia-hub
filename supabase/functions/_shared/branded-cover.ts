// Gera a capa de post do blog no padrão visual do site (nov/2026): fundo
// petróleo liso (sem grade) + kicker em IBM Plex Mono verde-água + título em Inter branco com
// as palavras-chave em verde-água (cor --primary do site, hsl 171 77% 64%) +
// régua fina verde-água + assinatura cinza. Âmbar e Instrument Serif saíram:
// eram do design anterior e destoavam dos cards do blog.
//
// Usa satori (React-like tree -> SVG) + resvg-wasm (SVG -> PNG), ambos puro
// JS/WASM, compatíveis com o runtime de Edge Functions do Supabase (sem FFI,
// sem canvas nativo). As fontes são buscadas do Google Fonts em tempo de
// execução (Inter e IBM Plex Mono, as mesmas do design system do site) — ver fetchGoogleFontTTF().
import satori from 'npm:satori@0.10.13';
import { Resvg, initWasm } from 'npm:@resvg/resvg-wasm@2.6.2';

const PETROLEO = '#12201E';
const BRANCO = '#F5F7F6';
const VERDE = '#5DEAD5'; // --primary do site: hsl(171 77% 64%)
const CINZA = '#9AA5A2';

let wasmReady: Promise<void> | null = null;
function ensureResvgWasm(): Promise<void> {
  if (!wasmReady) {
    wasmReady = fetch('https://unpkg.com/@resvg/resvg-wasm@2.6.2/index_bg.wasm')
      .then((r) => r.arrayBuffer())
      .then((buf) => initWasm(buf));
  }
  return wasmReady;
}

// Google Fonts serve woff2 por padrão, que o satori não decodifica. Pedindo
// com um User-Agent de navegador bem antigo, a API do Google volta pro
// formato .ttf — truque padrão usado nos exemplos oficiais do satori/@vercel/og.
const OLD_UA =
  'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36';

async function fetchGoogleFontTTF(cssFamilyQuery: string): Promise<ArrayBuffer> {
  const cssRes = await fetch(`https://fonts.googleapis.com/css2?family=${cssFamilyQuery}&display=swap`, {
    headers: { 'User-Agent': OLD_UA },
  });
  const css = await cssRes.text();
  // O Google devolve vários subconjuntos (latin-ext, latin…). Pegar o primeiro
  // (latin-ext) deixava as letras comuns sem desenho → capas com quadradinhos.
  // Usamos sempre o bloco "/* latin */", que cobre A–Z e os acentos do português.
  const latinBlock = css.split('/* latin */')[1] ?? css;
  const match = latinBlock.match(/src: url\(([^)]+)\) format\('(?:truetype|woff)'\)/) || latinBlock.match(/url\(([^)]+)\)/);
  if (!match) throw new Error(`Não achei a URL da fonte no CSS retornado pelo Google Fonts (${cssFamilyQuery})`);
  const fontRes = await fetch(match[1]);
  return fontRes.arrayBuffer();
}

export interface CoverFonts {
  sansRegular: ArrayBuffer;
  monoRegular: ArrayBuffer;
}

let fontsCache: Promise<CoverFonts> | null = null;

function loadFonts(): Promise<CoverFonts> {
  if (!fontsCache) {
    fontsCache = Promise.all([
      fetchGoogleFontTTF('Inter:wght@400'),
      fetchGoogleFontTTF('IBM+Plex+Mono:wght@400'),
    ]).then(([sansRegular, monoRegular]) => ({ sansRegular, monoRegular }));
  }
  return fontsCache;
}

// Heurística simples e determinística pra escolher qual trecho do título vira
// destaque verde-água (o "conceito-chave" visual), sem precisar de curadoria manual
// a cada post: as duas últimas palavras "de conteúdo" do título (ignorando
// pontuação e preposições curtas soltas no fim).
const STOPWORDS = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'a', 'o', 'as', 'os', 'em', 'no', 'na']);
function pickHighlightWords(title: string): string[] {
  const words = title
    .replace(/[.:;!?]+$/, '')
    .split(/\s+/)
    .filter(Boolean);
  const picked: string[] = [];
  for (let i = words.length - 1; i >= 0 && picked.length < 2; i--) {
    picked.unshift(words[i]);
    if (!STOPWORDS.has(words[i].toLowerCase()) && picked.length >= 2) break;
  }
  return picked.map((w) => w.toLowerCase().replace(/[.,:;!?]+$/, ''));
}

interface BrandedCoverOptions {
  kicker: string;
  title: string;
  author?: string;
  /** Sobrescreve a escolha automática de qual(is) palavra(s) destacar em verde-água. */
  highlightWords?: string[];
}

/** Monta a árvore satori da capa. Separado do render para poder ser usado fora do Deno (ex.: gerar capa manual). */
export function buildCoverTree({ kicker, title, author = 'JEFFERSON LOBO', highlightWords }: BrandedCoverOptions) {
  // Destaca o TRECHO (sequência de palavras), na última vez que aparece — e não
  // toda palavra igual do título (ex.: "Ganho ... ganho no caixa" pintava as duas).
  const norm = (w: string) => w.toLowerCase().replace(/[.,:;!?]+$/, '');
  const raw = title.split(' ');
  const alvo = (highlightWords ?? pickHighlightWords(title)).map(norm);
  const marcados = new Set<number>();
  for (let i = raw.length - alvo.length; i >= 0; i--) {
    if (alvo.every((w, j) => norm(raw[i + j]) === w)) {
      alvo.forEach((_, j) => marcados.add(i + j));
      break;
    }
  }
  const words = raw.map((word, i) => ({ word, isHighlight: marcados.has(i), key: i }));
  return {
    type: 'div',
    props: {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: PETROLEO,
        padding: '0 96px',
      },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', fontFamily: 'IBM Plex Mono', fontSize: 18, letterSpacing: 2, textTransform: 'uppercase', color: VERDE, marginBottom: 28 },
            children: kicker,
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexWrap: 'wrap', fontFamily: 'Inter', fontSize: 60, lineHeight: 1.22, letterSpacing: -0.5, color: BRANCO, maxWidth: 1000 },
            children: words.map(({ word, isHighlight, key }) => ({
              type: 'span',
              props: { style: { marginRight: 15, color: isHighlight ? VERDE : BRANCO }, children: word },
              key,
            })),
          },
        },
        { type: 'div', props: { style: { width: 96, height: 3, backgroundColor: VERDE, margin: '38px 0 24px 0' } } },
        {
          type: 'div',
          props: {
            style: { display: 'flex', fontFamily: 'IBM Plex Mono', fontSize: 16, letterSpacing: 2, textTransform: 'uppercase', color: CINZA },
            children: author,
          },
        },
      ],
    },
  };
}

export function coverFontsForSatori(f: CoverFonts) {
  return [
    { name: 'Inter', data: f.sansRegular, weight: 400 as const, style: 'normal' as const },
    { name: 'IBM Plex Mono', data: f.monoRegular, weight: 400 as const, style: 'normal' as const },
  ];
}

export async function renderBrandedCover(opts: BrandedCoverOptions): Promise<Uint8Array> {
  const [fonts] = await Promise.all([loadFonts(), ensureResvgWasm()]);
  // deno-lint-ignore no-explicit-any
  const svg = await satori(buildCoverTree(opts) as any, { width: 1200, height: 630, fonts: coverFontsForSatori(fonts) });
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  return resvg.render().asPng();
}
