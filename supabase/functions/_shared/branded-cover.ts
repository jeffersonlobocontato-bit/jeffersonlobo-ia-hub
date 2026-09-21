// Gera a capa de post do blog no padrão visual do site (petróleo + grid sutil +
// kicker em IBM Plex Mono âmbar + título em Instrument Serif com a "palavra-chave"
// em itálico âmbar + régua fina + assinatura), em vez da foto genérica gerada
// por IA que o pipeline usava antes.
//
// Usa satori (React-like tree -> SVG) + resvg-wasm (SVG -> PNG), ambos puro
// JS/WASM, compatíveis com o runtime de Edge Functions do Supabase (sem FFI,
// sem canvas nativo). As fontes são buscadas do Google Fonts em tempo de
// execução (Instrument Serif e IBM Plex Mono, as mesmas do design system do
// site) — ver fetchGoogleFontTTF().
import satori from 'npm:satori@0.10.13';
import { Resvg, initWasm } from 'npm:@resvg/resvg-wasm@2.6.2';

const PETROLEO = '#12201E';
const PAPEL = '#F2EEE4';
const AMBAR = '#E29F65';

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
  const match = css.match(/src: url\(([^)]+)\) format\('truetype'\)/) || css.match(/url\(([^)]+)\)/);
  if (!match) throw new Error(`Não achei a URL da fonte no CSS retornado pelo Google Fonts (${cssFamilyQuery})`);
  const fontRes = await fetch(match[1]);
  return fontRes.arrayBuffer();
}

let fontsCache: Promise<{
  serifRegular: ArrayBuffer;
  serifItalic: ArrayBuffer;
  monoBold: ArrayBuffer;
}> | null = null;

function loadFonts() {
  if (!fontsCache) {
    fontsCache = Promise.all([
      fetchGoogleFontTTF('Instrument+Serif'),
      fetchGoogleFontTTF('Instrument+Serif:ital@1'),
      fetchGoogleFontTTF('IBM+Plex+Mono:wght@700'),
    ]).then(([serifRegular, serifItalic, monoBold]) => ({ serifRegular, serifItalic, monoBold }));
  }
  return fontsCache;
}

// Heurística simples e determinística pra escolher qual trecho do título vira
// itálico âmbar (o "conceito-chave" visual), sem precisar de curadoria manual
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
  /** Sobrescreve a escolha automática de qual(is) palavra(s) destacar em itálico âmbar. */
  highlightWords?: string[];
}

export async function renderBrandedCover({
  kicker,
  title,
  author = 'JEFFERSON LOBO',
  highlightWords,
}: BrandedCoverOptions): Promise<Uint8Array> {
  const [{ serifRegular, serifItalic, monoBold }] = await Promise.all([loadFonts(), ensureResvgWasm()]);
  const highlight = new Set((highlightWords ?? pickHighlightWords(title)).map((w) => w.toLowerCase()));

  const words = title.split(' ').map((word, i) => {
    const bare = word.toLowerCase().replace(/[.,:;!?]+$/, '');
    return { word, isHighlight: highlight.has(bare), key: i };
  });

  const tree = {
    type: 'div',
    props: {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: PETROLEO,
        backgroundImage:
          'linear-gradient(90deg, rgba(226,159,101,0.08) 1px, transparent 1px), linear-gradient(180deg, rgba(226,159,101,0.08) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        padding: '0 90px',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontFamily: 'IBM Plex Mono',
              fontWeight: 700,
              fontSize: 17,
              letterSpacing: 3,
              textTransform: 'uppercase',
              color: AMBAR,
              marginBottom: 22,
            },
            children: kicker,
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexWrap: 'wrap',
              fontFamily: 'Instrument Serif',
              fontSize: 50,
              lineHeight: 1.25,
              color: PAPEL,
              maxWidth: 1020,
            },
            children: words.map(({ word, isHighlight, key }) => ({
              type: 'span',
              props: {
                style: {
                  marginRight: 14,
                  fontStyle: isHighlight ? 'italic' : 'normal',
                  color: isHighlight ? AMBAR : PAPEL,
                },
                children: word,
              },
              key,
            })),
          },
        },
        {
          type: 'div',
          props: { style: { width: 96, height: 2, backgroundColor: AMBAR, margin: '26px 0 22px 0' } },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontFamily: 'IBM Plex Mono',
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: 3,
              textTransform: 'uppercase',
              color: AMBAR,
            },
            children: author,
          },
        },
      ],
    },
  };

  const svg = await satori(tree as any, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Instrument Serif', data: serifRegular, weight: 400, style: 'normal' },
      { name: 'Instrument Serif', data: serifItalic, weight: 400, style: 'italic' },
      { name: 'IBM Plex Mono', data: monoBold, weight: 700, style: 'normal' },
    ],
  });

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  return resvg.render().asPng();
}
