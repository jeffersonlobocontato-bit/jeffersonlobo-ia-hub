import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AdminRoute from "@/components/AdminRoute";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import MetaPixelRouteTracker from "@/components/MetaPixelRouteTracker";
import { lazy, Suspense, useEffect, type ComponentType, type ReactNode } from "react";

// Páginas pré-renderizadas no build (scripts/prerender.mjs): o módulo pode ser
// carregado antes da primeira renderização, para o React trocar o HTML pronto
// pela página real sem passar pelo fallback vazio do Suspense (sem "piscar").
type Precarregavel = ComponentType & { preload: () => Promise<unknown> };
function lazyComPreload(factory: () => Promise<{ default: ComponentType }>): Precarregavel {
  let Pronto: ComponentType | null = null;
  const preload = () => factory().then((m) => { Pronto = m.default; return m; });
  const Lazy = lazy(preload);
  const Comp = (() => (Pronto ? <Pronto /> : <Lazy />)) as unknown as Precarregavel;
  Comp.preload = preload;
  return Comp;
}

// /teleprompter é um atalho para a página estática public/tp.html.
const IrParaTeleprompter = () => {
  window.location.replace("/tp.html");
  return null;
};

// Todas as páginas carregam sob demanda: nenhuma rota pesa no bundle inicial das outras.
const Index = lazyComPreload(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const TesteIA = lazyComPreload(() => import("./pages/TesteIA"));
const PoliticaPrivacidade = lazyComPreload(() => import("./pages/PoliticaPrivacidade"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const Imprensa = lazyComPreload(() => import("./pages/Imprensa"));
const JeffersonLobo = lazyComPreload(() => import("./pages/JeffersonLobo"));
const PalestrasIA = lazyComPreload(() => import("./pages/PalestrasIA"));
const PalestranteIA = lazyComPreload(() => import("./pages/PalestranteIA"));
const PalestranteIAParana = lazyComPreload(() => import("./pages/PalestranteIAParana"));
const WorkshopIA = lazyComPreload(() => import("./pages/WorkshopIA"));
const ConsultoriaIA = lazyComPreload(() => import("./pages/ConsultoriaIA"));
const BlogIndex = lazy(() => import("./pages/BlogIndex"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const PressReleaseOG = lazy(() => import("./pages/PressReleaseOG"));
const Materiais = lazyComPreload(() => import("./pages/Materiais"));
const LivroDel = lazyComPreload(() => import("./pages/LivroDel"));
const MaterialDetalhe = lazy(() => import("./pages/MaterialDetalhe"));
const PressCampaignKiosk = lazy(() => import("./pages/admin/PressCampaignKiosk"));
const Claudia = lazy(() => import("./pages/Claudia"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Plataforma de cursos: carregada sob demanda para não pesar no resto do site.
const CursosVitrine = lazy(() => import("./pages/cursos/Vitrine"));
const CursoIlhaVendas = lazy(() => import("./pages/cursos/IlhaVendas"));
const CursosEntrar = lazy(() => import("./pages/cursos/Entrar"));
const CursoSalaDeAula = lazy(() => import("./pages/cursos/SalaDeAula"));
const CursosObrigado = lazy(() => import("./pages/cursos/Obrigado"));
const CursosTermos = lazy(() => import("./pages/cursos/Termos"));
const CursosPrivacidade = lazy(() => import("./pages/cursos/Privacidade"));
const CursoPocketVendas = lazy(() => import("./pages/cursos/PocketVendas"));
const CursosPainel = lazy(() => import("./pages/cursos/Painel"));
const carregando = <div className="min-h-screen bg-background" />;
const comSuspense = (el: JSX.Element) => <Suspense fallback={carregando}>{el}</Suspense>;

// Links com âncora (ex.: /cursos#ebook-gratis) precisam rolar até a seção depois
// do carregamento preguiçoso da página — o navegador não faz isso sozinho.
const RolagemParaAncora = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    const buscar = () => {
      const alvo = document.getElementById(id);
      if (alvo) {
        alvo.scrollIntoView({ block: "start" });
        return true;
      }
      return false;
    };
    if (buscar()) return;
    let tentativas = 0;
    const timer = window.setInterval(() => {
      tentativas += 1;
      if (buscar() || tentativas > 40) window.clearInterval(timer);
    }, 150);
    return () => window.clearInterval(timer);
  }, [pathname, hash]);
  return null;
};

export const queryClient = new QueryClient();

/** Rotas estáticas pré-renderizadas no build (scripts/prerender.mjs). */
export const ROTAS_PRERENDER: Record<string, Precarregavel> = {
  "/": Index,
  "/palestrante-inteligencia-artificial": PalestranteIA,
  "/palestrante-inteligencia-artificial-parana-brasil": PalestranteIAParana,
  "/palestras-ia": PalestrasIA,
  "/workshop-ia": WorkshopIA,
  "/consultoria-ia": ConsultoriaIA,
  "/livro-del": LivroDel,
  "/jefferson-lobo": JeffersonLobo,
  "/imprensa": Imprensa,
  "/teste-ia": TesteIA,
  "/materiais": Materiais,
  "/politica-privacidade": PoliticaPrivacidade,
};

const RoteadorPadrao = ({ children }: { children: ReactNode }) => (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>{children}</BrowserRouter>
);

const App = ({ Roteador = RoteadorPadrao }: { Roteador?: ComponentType<{ children: ReactNode }> }) => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Roteador>
          <RolagemParaAncora />
          <MetaPixelRouteTracker />
          <AnalyticsTracker>
            <Routes>
              <Route path="/" element={comSuspense(<Index />)} />
              <Route path="/auth" element={comSuspense(<Auth />)} />
              <Route path="/reset-password" element={comSuspense(<ResetPassword />)} />
              <Route path="/teste-ia" element={comSuspense(<TesteIA />)} />
              <Route path="/politica-privacidade" element={comSuspense(<PoliticaPrivacidade />)} />
              <Route path="/unsubscribe" element={comSuspense(<Unsubscribe />)} />
              <Route path="/imprensa" element={comSuspense(<Imprensa />)} />
              <Route path="/jefferson-lobo" element={comSuspense(<JeffersonLobo />)} />
              <Route path="/imprensa/r/:slug" element={comSuspense(<PressReleaseOG />)} />
              <Route path="/palestras-ia" element={comSuspense(<PalestrasIA />)} />
              <Route path="/palestrante-inteligencia-artificial" element={comSuspense(<PalestranteIA />)} />
              <Route path="/palestrante-inteligencia-artificial-parana-brasil" element={comSuspense(<PalestranteIAParana />)} />
              <Route path="/palestrante-inteligencia-artificial-parana" element={<Navigate to="/palestrante-inteligencia-artificial-parana-brasil" replace />} />
              <Route path="/workshop-ia" element={comSuspense(<WorkshopIA />)} />
              <Route path="/consultoria-ia" element={comSuspense(<ConsultoriaIA />)} />
              <Route path="/blog" element={comSuspense(<BlogIndex />)} />
              <Route path="/blog/:slug" element={comSuspense(<BlogPost />)} />
              <Route path="/materiais" element={comSuspense(<Materiais />)} />
              <Route path="/materiais/:slug" element={comSuspense(<MaterialDetalhe />)} />
              <Route path="/livro-del" element={comSuspense(<LivroDel />)} />
              <Route path="/claudia" element={comSuspense(<Claudia />)} />
              <Route path="/cursos" element={comSuspense(<CursosVitrine />)} />
              <Route path="/cursos/entrar" element={comSuspense(<CursosEntrar />)} />
              <Route path="/cursos/obrigado" element={comSuspense(<CursosObrigado />)} />
              <Route path="/cursos/termos" element={comSuspense(<CursosTermos />)} />
              <Route path="/cursos/privacidade" element={comSuspense(<CursosPrivacidade />)} />
              <Route path="/cursos/ilha" element={comSuspense(<CursoIlhaVendas />)} />
              <Route path="/cursos/pocket/:pocket" element={comSuspense(<CursoPocketVendas />)} />
              <Route path="/cursos/painel" element={<AdminRoute>{comSuspense(<CursosPainel />)}</AdminRoute>} />
              <Route path="/cursos/:curso/aulas" element={comSuspense(<CursoSalaDeAula />)} />
              <Route path="/cursos/:curso/aulas/:aula" element={comSuspense(<CursoSalaDeAula />)} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    {comSuspense(<Admin />)}
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/press/disparar/:campaignId"
                element={
                  <AdminRoute>
                    {comSuspense(<PressCampaignKiosk />)}
                  </AdminRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="/teleprompter" element={<IrParaTeleprompter />} />
              <Route path="*" element={comSuspense(<NotFound />)} />
            </Routes>
          </AnalyticsTracker>
        </Roteador>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
