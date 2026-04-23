import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { TesteIAGate } from "@/components/teste-ia/TesteIAGate";
import { TesteIAQuestionario } from "@/components/teste-ia/TesteIAQuestionario";
import { TesteIADashboard } from "@/components/teste-ia/TesteIADashboard";

type Etapa = "gate" | "questionario" | "resultado";

export default function TesteIA() {
  const [etapa, setEtapa] = useState<Etapa>("gate");
  const [leadId, setLeadId] = useState<string>("");
  const [finalidade, setFinalidade] = useState<"PF" | "PJ">("PF");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pt-20 bg-brand-grid">
        {etapa === "gate" && (
          <TesteIAGate
            onComplete={(id, tipo) => {
              setLeadId(id);
              setFinalidade(tipo);
              setEtapa("questionario");
            }}
          />
        )}
        {etapa === "questionario" && (
          <TesteIAQuestionario
            leadId={leadId}
            finalidade={finalidade}
            onComplete={() => setEtapa("resultado")}
          />
        )}
        {etapa === "resultado" && (
          <TesteIADashboard leadId={leadId} />
        )}
      </main>
      <Footer />
    </div>
  );
}
