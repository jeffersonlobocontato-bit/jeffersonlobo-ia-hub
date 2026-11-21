import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App, { ROTAS_PRERENDER, queryClient } from "./App.tsx";
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

// Depois de uma nova versão, arquivos antigos da página deixam de existir e o
// carregamento falha ("Failed to fetch dynamically imported module"). Recarrega
// uma vez para buscar a versão nova, sem entrar em ciclo.
const CHAVE_RECARGA = "recarga_versao_nova";
const ehFalhaDeVersao = (msg: unknown) =>
  typeof msg === "string" && /dynamically imported module|Importing a module script failed|error loading dynamically/i.test(msg);
const recarregarUmaVez = () => {
  const ultima = Number(sessionStorage.getItem(CHAVE_RECARGA) || 0);
  if (Date.now() - ultima < 10000) return false;
  sessionStorage.setItem(CHAVE_RECARGA, String(Date.now()));
  window.location.reload();
  return true;
};
window.addEventListener("vite:preloadError", (e) => {
  if (recarregarUmaVez()) e.preventDefault();
});
window.addEventListener("unhandledrejection", (e) => {
  if (ehFalhaDeVersao(e.reason?.message ?? e.reason) && recarregarUmaVez()) e.preventDefault();
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
// Dados do banco usados no HTML pronto (ex.: texto do topo da home): entram no
// cache antes de montar, para a primeira tela ser igual à pré-renderizada; em
// seguida são buscados de novo, como sempre.
const dadosProntos = document.getElementById("dados-prerender");
if (pagina && dadosProntos) {
  try {
    const dados = JSON.parse(dadosProntos.textContent || "{}") as Record<string, unknown>;
    for (const [chave, valor] of Object.entries(dados)) queryClient.setQueryData([chave], valor);
    setTimeout(() => Object.keys(dados).forEach((chave) => queryClient.invalidateQueries({ queryKey: [chave] })), 0);
  } catch { /* sem dados prontos: carrega normalmente */ }
}
if (pagina) pagina.preload().then(montar, montar);
else montar();
