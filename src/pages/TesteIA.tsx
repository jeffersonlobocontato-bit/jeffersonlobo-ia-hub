import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { TesteIAGate } from "@/components/teste-ia/TesteIAGate";
import { TesteIAQuestionario } from "@/components/teste-ia/TesteIAQuestionario";
import { TesteIADashboard } from "@/components/teste-ia/TesteIADashboard";

type Etapa = "gate" | "questionario" | "resultado";
const STORAGE_KEY = "ia_maturity_progress_v1";

export default function TesteIA() {
  const [etapa, setEtapa] = useState<Etapa>("gate");
  const [leadId, setLeadId] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string>("");
  const [finalidade, setFinalidade] = useState<"PF" | "PJ">("PF");

  // Force dark mode for brutalist aesthetic
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Resume from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.leadId && saved.etapa && saved.accessToken) {
          setLeadId(saved.leadId);
          setAccessToken(saved.accessToken);
          setFinalidade(saved.finalidade || "PF");
          setEtapa(saved.etapa);
        }
      }
    } catch {}
  }, []);

  // Persist progress
  useEffect(() => {
    if (leadId && accessToken) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ leadId, accessToken, finalidade, etapa })
      );
    }
  }, [leadId, accessToken, finalidade, etapa]);

  const resetProgress = () => {
    localStorage.removeItem(STORAGE_KEY);
    setLeadId("");
    setAccessToken("");
    setEtapa("gate");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Teste de Maturidade em IA — Jefferson Lobo"
        description="Diagnóstico gratuito de 8 minutos: descubra seu nível de maturidade em Inteligência Artificial e receba um plano de ação 30/60/90 dias."
        path="/teste-ia"
      />
      <Header />
      <main className="flex-1 pt-20 bg-brand-grid">
        {etapa === "gate" && (
          <TesteIAGate
            onComplete={(id, tipo, token) => {
              setLeadId(id);
              setAccessToken(token);
              setFinalidade(tipo);
              setEtapa("questionario");
            }}
          />
        )}
        {etapa === "questionario" && (
          <TesteIAQuestionario
            leadId={leadId}
            accessToken={accessToken}
            finalidade={finalidade}
            onComplete={() => setEtapa("resultado")}
            onRestart={resetProgress}
          />
        )}
        {etapa === "resultado" && (
          <TesteIADashboard leadId={leadId} accessToken={accessToken} onRestart={resetProgress} />
        )}
      </main>
      <Footer />
    </div>
  );
}

