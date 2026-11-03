// Pós-build: gera dist/<rota>/index.html com o HTML pronto das rotas estáticas,
// para robôs que não executam JavaScript. Não usa navegador. Qualquer falha
// mantém o site como SPA (não quebra o build).
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

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
  const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");
  const { render, rotas } = await import(pathToFileURL(ssr).href);
  let ok = 0;
  for (const rota of rotas) {
    try {
      const { html, helmet } = await render(rota);
      if (!/<h1[\s>]/i.test(html)) throw new Error("sem H1");
      let head = template;
      for (const re of HEAD_ESTATICO) head = head.replace(re, "");
      const tags = [helmet.title, helmet.meta, helmet.link, helmet.script].map((t) => t.toString()).join("\n");
      const out = head
        .replace("</head>", `${tags}\n</head>`)
        .replace('<div id="root"></div>', `<div id="root" data-prerender="${rota}">${html}</div>`);
      if (out === head) throw new Error("template sem #root");
      const destino = path.join(dist, rota, "index.html");
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
