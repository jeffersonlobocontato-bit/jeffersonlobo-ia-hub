// Prévias de link (WhatsApp, LinkedIn, Facebook, Slack) das páginas da Academia.
//
// Esses robôs não executam JavaScript: leem só o HTML que o servidor entrega,
// e numa SPA ele é sempre o mesmo index.html, com a imagem padrão do site. Por
// isso, depois do build, este plugin grava uma cópia do index.html em
// dist/<caminho>/index.html para cada página abaixo, trocando título e imagem.
// A hospedagem entrega esse arquivo em /<caminho> (com ou sem barra no fim),
// então o link compartilhado é o endereço normal da página. Quem abre no
// navegador recebe a mesma SPA de sempre; só as metatags mudam.
//
// A descrição não entra aqui de propósito: ver o comentário no index.html
// (a do Helmet basta e duas descrições no DOM geram alerta no Bing).
//
// Mantenha títulos e imagens alinhados com src/content/cursos (escola.ts,
// ilha.ts e pockets.ts). As imagens ficam fora de public/og, que o script do
// sitemap apaga e recria a cada build.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { Plugin } from 'vite';

const SITE = 'https://jeffersonlobo.tech';
const ACADEMIA = 'Academia jeffersonlobo.tech';

export type PaginaCompartilhavel = {
  caminho: string;
  titulo: string;
  /** caminho da imagem em public/, 1200x630 em JPG */
  imagem: string;
};

export const PAGINAS_COMPARTILHAVEIS: PaginaCompartilhavel[] = [
  { caminho: '/cursos', titulo: `${ACADEMIA} · Cursos de IA feitos com IA`, imagem: '/academia/og-cursos.jpg' },
  { caminho: '/cursos/ilha', titulo: `Ilha de Edição completa · ${ACADEMIA}`, imagem: '/cursos-ilha/og.jpg' },
  { caminho: '/cursos/pocket/configurei-o-claude-errado', titulo: `Pocket 1 · Configurei o Claude errado · ${ACADEMIA}`, imagem: '/cursos-pockets/pocket-1-og.jpg' },
  { caminho: '/cursos/pocket/claude-com-a-sua-voz', titulo: `Pocket 2 · Claude com a sua voz · ${ACADEMIA}`, imagem: '/cursos-pockets/pocket-2-og.jpg' },
  { caminho: '/cursos/pocket/do-roteiro-a-postagem', titulo: `Pocket 3 · Do roteiro à postagem · ${ACADEMIA}`, imagem: '/cursos-pockets/pocket-3-og.jpg' },
];

const escapar = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Troca título, URL e imagem das metatags do index.html. Devolve null se
 *  alguma tag esperada não estiver lá (aí a página fica sem cópia própria). */
export function trocarMetas(html: string, p: PaginaCompartilhavel): string | null {
  const url = `${SITE}${p.caminho}`;
  const imagem = `${SITE}${p.imagem}`;
  const titulo = escapar(p.titulo);
  const trocas: [RegExp, string][] = [
    [/<title>[^<]*<\/title>/, `<title>${titulo}</title>`],
    [/(<meta\s+property="og:site_name"\s+content=")[^"]*(")/, `$1${escapar(ACADEMIA)}$2`],
    [/(<meta\s+property="og:url"\s+content=")[^"]*(")/, `$1${url}$2`],
    [/(<meta\s+property="og:title"\s+content=")[^"]*(")/, `$1${titulo}$2`],
    [
      /(<meta\s+property="og:image"\s+content=")[^"]*("\s*\/?>)/,
      `$1${imagem}$2\n    <meta property="og:image:type" content="image/jpeg" />\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />\n    <meta property="og:image:alt" content="${titulo}" />`,
    ],
    [/(<meta\s+name="twitter:url"\s+content=")[^"]*(")/, `$1${url}$2`],
    [/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/, `$1${titulo}$2`],
    [/(<meta\s+name="twitter:image"\s+content=")[^"]*(")/, `$1${imagem}$2`],
  ];
  let saida = html;
  for (const [busca, troca] of trocas) {
    if (!busca.test(saida)) return null;
    saida = saida.replace(busca, troca);
  }
  return saida;
}

export function paginasDeCompartilhamento(): Plugin {
  let pasta = 'dist';
  return {
    name: 'paginas-de-compartilhamento',
    apply: 'build',
    configResolved(config) {
      pasta = resolve(config.root, config.build.outDir);
    },
    writeBundle() {
      const base = readFileSync(resolve(pasta, 'index.html'), 'utf8');
      for (const p of PAGINAS_COMPARTILHAVEIS) {
        const html = trocarMetas(base, p);
        if (!html) {
          this.warn(`prévia de link: metatags não encontradas no index.html, ${p.caminho} fica com a prévia padrão`);
          continue;
        }
        const destino = resolve(pasta, `.${p.caminho}`, 'index.html');
        mkdirSync(dirname(destino), { recursive: true });
        writeFileSync(destino, html);
      }
    },
  };
}
