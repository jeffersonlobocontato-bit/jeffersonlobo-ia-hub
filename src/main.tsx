import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App, { ROTAS_PRERENDER } from "./App.tsx";
import "./index.css";

// Aviso benigno do Chrome disparado por bibliotecas de UI (Radix/gráficos)
// quando um ResizeObserver notifica dentro do próprio ciclo. Sem esse filtro,
// o erro sobe para o manipulador global e pode branquear a tela.
const isResizeObserverNoise = (msg: unknown) =>
  typeof msg === "string" && msg.includes("ResizeObserver loop");
window.addEventListener("error", (e) => {
  if (isResizeObserverNoise(e.message)) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});
window.addEventListener("unhandledrejection", (e) => {
  if (isResizeObserverNoise(e.reason?.message ?? e.reason)) e.preventDefault();
});

const raiz = document.getElementById("root")!;
const montar = () =>
  createRoot(raiz).render(
    <HelmetProvider>
      <App />
    </HelmetProvider>
  );

// HTML pré-renderizado: carrega a página antes de montar, para o React trocar o
// conteúdo pronto pela mesma página sem passar por uma tela vazia.
const rotaPronta = raiz.dataset.prerender;
const pagina = rotaPronta && rotaPronta === (window.location.pathname.replace(/\/+$/, "") || "/") ? ROTAS_PRERENDER[rotaPronta] : undefined;
if (pagina) pagina.preload().then(montar, montar);
else montar();
