// Usado só no build (scripts/prerender.mjs) para gerar o HTML das rotas estáticas.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- módulo do Node, usado só no build de pré-renderização
import { PassThrough } from "node:stream";
import { renderToPipeableStream } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { HelmetProvider, type HelmetServerState } from "react-helmet-async";
import type { ReactNode } from "react";
import App, { ROTAS_PRERENDER } from "./App";

export const rotas = Object.keys(ROTAS_PRERENDER);

export function render(url: string): Promise<{ html: string; helmet: HelmetServerState }> {
  const ctx: { helmet?: HelmetServerState } = {};
  const Roteador = ({ children }: { children: ReactNode }) => (
    <StaticRouter location={url}>{children}</StaticRouter>
  );
  return new Promise((resolve, reject) => {
    let html = "";
    const stream = renderToPipeableStream(
      <HelmetProvider context={ctx}>
        <App Roteador={Roteador} />
      </HelmetProvider>,
      {
        onAllReady() {
          const out = new PassThrough();
          out.on("data", (c) => (html += c));
          out.on("end", () => resolve({ html, helmet: ctx.helmet! }));
          stream.pipe(out);
        },
        onShellError: reject,
        onError: (e) => reject(e),
      },
    );
    setTimeout(() => reject(new Error(`timeout ${url}`)), 20000);
  });
}
