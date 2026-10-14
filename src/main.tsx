import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
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

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
