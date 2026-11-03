// Pós-build: gera dist/<rota>/index.html com o HTML pronto das rotas estáticas,
// para robôs que não executam JavaScript. Não usa navegador. Qualquer falha
// mantém o site como SPA (não quebra o build).
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { execSync } from "node:child_process";

const dist = path.resolve("dist");
const ssr = path.resolve("dist-ssr/entry-server.js");

// Ambiente mínimo para módulos que tocam em APIs do navegador ao serem importados.
const mem = new Map();
const storage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k), clear: () => mem.clear(), key: () => null, length: 0 };
globalThis.localStorage ??= storage;
globalThis.sessionStorage ??= storage;

const HEAD_ESTATICO = [
  /<title>[\s\S]*?<\/title>\s*/i,
  /<meta\s+name="description"[^>]*>\s*/gi,
  /<link\s+rel="canonical"[^>]*>\s*/gi,
  /<meta\s+property="og:(title|description|url|image|type)"[^>]*>\s*/gi,
  /<meta\s+name="twitter:(title|description|url|image)"[^>]*>\s*/gi,
];

try {
  execSync("npx vite build --ssr src/entry-server.tsx --outDir dist-ssr --emptyOutDir --logLevel warn", { stdio: "inherit" });
  const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");
  const { render, rotas } = await import(pathToFileURL(ssr).href);
  // dist/index.html é também a reserva (fallback) de toda rota sem arquivo.
  // Antes de colocar a home nele, cada rota SPA conhecida (rotas fixas do app +
  // todas as URLs do sitemap, incluindo posts, pockets e materiais) ganha uma
  // cópia do esqueleto original, para nunca receber o conteúdo da home.
  const SPA_FIXAS = ["/auth", "/reset-password", "/unsubscribe", "/claudia", "/blog", "/admin",
    "/cursos", "/cursos/entrar", "/cursos/obrigado", "/cursos/termos", "/cursos/privacidade",
    "/cursos/ilha", "/cursos/painel"];
  let doSitemap = [];
  try {
    const xml = fs.readFileSync(path.join(dist, "sitemap.xml"), "utf8");
    doSitemap = [...xml.matchAll(/<loc>https?:\/\/[^/<]+(\/[^<]*)<\/loc>/g)].map((m) => m[1].replace(/\/+$/, ""));
  } catch { /* sem sitemap: só as fixas */ }
  let cascas = 0;
  for (const r of new Set([...SPA_FIXAS, ...doSitemap])) {
    if (!r || r === "/" || rotas.includes(r) || /\.[a-z0-9]+$/i.test(r)) continue;
    const destino = path.join(dist, r, "index.html");
    if (fs.existsSync(destino)) continue;
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.writeFileSync(destino, template);
    cascas++;
  }
  console.log(`[prerender] ${cascas} rotas SPA com esqueleto próprio`);

  // Guarda da reserva: se este HTML (com a home) for servido para outra rota,
  // o conteúdo da home fica oculto antes da primeira pintura e o React monta a
  // página certa. Robôs sem JS só recebem a home em URLs desconhecidas.
  const GUARDA = `<style>html.rota-nao-home [data-prerender-home]{display:none!important}</style><script>if((location.pathname.replace(/\\/+$/,"")||"/")!=="/")document.documentElement.classList.add("rota-nao-home")</script>`;

  // Dados públicos que a home mostra no topo (mesma consulta do app).
  const env = { ...Object.fromEntries((fs.existsSync(".env") ? fs.readFileSync(".env", "utf8") : "").split("\n").map((l) => l.match(/^\s*([A-Z_]+)\s*=\s*"?([^"]*)"?\s*$/)).filter(Boolean).map((m) => [m[1], m[2]])), ...process.env };
  const dadosPorRota = { "/": {} };
  try {
    const r = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/hero_content?select=*&limit=1`, { headers: { apikey: env.VITE_SUPABASE_PUBLISHABLE_KEY } });
    const linhas = await r.json();
    if (Array.isArray(linhas) && linhas[0]) dadosPorRota["/"].hero_content = linhas[0];
  } catch (e) { console.warn(`[prerender] topo da home sem dados do banco: ${e?.message || e}`); }

  let ok = 0;
  for (const rota of rotas) {
    try {
      const dados = dadosPorRota[rota] || {};
      const { html, helmet } = await render(rota, dados);
      if (!/<h1[\s>]/i.test(html)) throw new Error("sem H1");
      let head = template;
      for (const re of HEAD_ESTATICO) head = head.replace(re, "");
      const tags = [helmet.title, helmet.meta, helmet.link, helmet.script].map((t) => t.toString()).join("\n");
      const out = head
        .replace("</head>", `${tags}\n</head>`)
        .replace('<div id="root"></div>', rota === "/"
          ? `${GUARDA}<div id="root" data-prerender="/"><div data-prerender-home>${html}</div></div>${Object.keys(dados).length ? `<script type="application/json" id="dados-prerender">${JSON.stringify(dados).replace(/</g, "\\u003c")}</script>` : ""}`
          : `<div id="root" data-prerender="${rota}">${html}</div>`);
      if (out === head) throw new Error("template sem #root");
      const destino = rota === "/" ? path.join(dist, "index.html") : path.join(dist, rota, "index.html");
      fs.mkdirSync(path.dirname(destino), { recursive: true });
      fs.writeFileSync(destino, out);
      ok++;
      console.log(`[prerender] ${rota} ${(out.length / 1024).toFixed(1)} KB`);
    } catch (e) {
      console.warn(`[prerender] ${rota} ignorada (segue como SPA): ${e?.message || e}`);
    }
  }
  console.log(`[prerender] ${ok}/${rotas.length} rotas geradas`);
} catch (e) {
  console.warn(`[prerender] desativado nesta build (site segue como SPA): ${e?.message || e}`);
}
fs.rmSync(path.resolve("dist-ssr"), { recursive: true, force: true });
process.exit(0);
