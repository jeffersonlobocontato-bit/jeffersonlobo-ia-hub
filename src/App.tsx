import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AdminRoute from "@/components/AdminRoute";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import MetaPixelRouteTracker from "@/components/MetaPixelRouteTracker";
import { lazy, Suspense } from "react";

// Todas as páginas carregam sob demanda: nenhuma rota pesa no bundle inicial das outras.
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const TesteIA = lazy(() => import("./pages/TesteIA"));
const PoliticaPrivacidade = lazy(() => import("./pages/PoliticaPrivacidade"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const Imprensa = lazy(() => import("./pages/Imprensa"));
const JeffersonLobo = lazy(() => import("./pages/JeffersonLobo"));
const PalestrasIA = lazy(() => import("./pages/PalestrasIA"));
const PalestranteIA = lazy(() => import("./pages/PalestranteIA"));
const PalestranteIAParana = lazy(() => import("./pages/PalestranteIAParana"));
const WorkshopIA = lazy(() => import("./pages/WorkshopIA"));
const ConsultoriaIA = lazy(() => import("./pages/ConsultoriaIA"));
const BlogIndex = lazy(() => import("./pages/BlogIndex"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const PressReleaseOG = lazy(() => import("./pages/PressReleaseOG"));
const Materiais = lazy(() => import("./pages/Materiais"));
const LivroDel = lazy(() => import("./pages/LivroDel"));
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
              <Route path="*" element={comSuspense(<NotFound />)} />
            </Routes>
          </AnalyticsTracker>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
