import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AdminRoute from "@/components/AdminRoute";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import ResetPassword from "./pages/ResetPassword";
import TesteIA from "./pages/TesteIA";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import Unsubscribe from "./pages/Unsubscribe";
import Imprensa from "./pages/Imprensa";
import BlogIndex from "./pages/BlogIndex";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AnalyticsTracker>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/teste-ia" element={<TesteIA />} />
              <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
              <Route path="/unsubscribe" element={<Unsubscribe />} />
              <Route path="/imprensa" element={<Imprensa />} />
              <Route path="/blog" element={<BlogIndex />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnalyticsTracker>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
