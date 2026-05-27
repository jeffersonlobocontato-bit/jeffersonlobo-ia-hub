import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Clock, RotateCcw } from "lucide-react";

interface Question {
  id: string;
  ordem: number;
  pergunta: string;
  nivel: string;
  competencia: string;
}

interface TesteIAQuestionarioProps {
  leadId: string;
  accessToken: string;
  finalidade: "PF" | "PJ";
  onComplete: () => void;
  onRestart?: () => void;
}


const nivelLabel: Record<string, string> = {
  BASICO: "Básico",
  INTERMEDIARIO: "Intermediário",
  AVANCADO: "Avançado",
};

export function TesteIAQuestionario({ leadId, finalidade, onComplete, onRestart }: TesteIAQuestionarioProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
    // Restore saved answers
    supabase
      .from("ia_maturity_leads")
      .select("respostas")
      .eq("id", leadId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.respostas && Array.isArray(data.respostas)) {
          const restored: Record<string, number> = {};
          (data.respostas as any[]).forEach((r: any) => {
            if (r.id_pergunta) restored[r.id_pergunta] = r.resposta;
          });
          setRespostas(restored);
        }
      });
  }, [finalidade, leadId]);

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from("ia_maturity_questions")
        .select("*")
        .eq("finalidade", finalidade)
        .order("ordem");
      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar perguntas");
    } finally {
      setLoading(false);
    }
  };

  const persistRespostas = async (novas: Record<string, number>) => {
    const arr = Object.entries(novas).map(([id, resposta]) => {
      const q = questions.find((q) => q.id === id);
      return { id_pergunta: id, resposta, competencia: q?.competencia, nivel: q?.nivel };
    });
    try {
      await supabase.from("ia_maturity_leads").update({ respostas: arr }).eq("id", leadId);
    } catch (e) {
      console.error("Autosave falhou:", e);
    }
  };

  const handleResposta = (valor: number) => {
    const currentQuestion = questions[currentIndex];
    const novas = { ...respostas, [currentQuestion.id]: valor };
    setRespostas(novas);
    persistRespostas(novas);
  };

  const handleProximo = () => currentIndex < questions.length - 1 && setCurrentIndex(currentIndex + 1);
  const handleVoltar = () => currentIndex > 0 && setCurrentIndex(currentIndex - 1);

  const handleFinalizar = async () => {
    setLoading(true);
    try {
      const arr = Object.entries(respostas).map(([id, resposta]) => {
        const q = questions.find((q) => q.id === id);
        return { id_pergunta: id, resposta, competencia: q?.competencia, nivel: q?.nivel };
      });

      const avg = (vals: number[]) => (vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0);
      const scoreBasico = avg(arr.filter((r) => r.nivel === "BASICO").map((r) => r.resposta));
      const scoreIntermediario = avg(arr.filter((r) => r.nivel === "INTERMEDIARIO").map((r) => r.resposta));
      const scoreAvancado = avg(arr.filter((r) => r.nivel === "AVANCADO").map((r) => r.resposta));
      const scoreGeral = (scoreBasico + scoreIntermediario + scoreAvancado) / 3;

      const compTemp: Record<string, number[]> = {};
      arr.forEach((r) => {
        if (!compTemp[r.competencia!]) compTemp[r.competencia!] = [];
        compTemp[r.competencia!].push(r.resposta);
      });
      const competencias: Record<string, number> = {};
      Object.keys(compTemp).forEach((c) => (competencias[c] = avg(compTemp[c])));

      let nivelMaturidade: "Iniciante" | "Em evolução" | "Avançado";
      if (scoreGeral < 2.5) nivelMaturidade = "Iniciante";
      else if (scoreGeral < 4.0) nivelMaturidade = "Em evolução";
      else nivelMaturidade = "Avançado";

      await supabase
        .from("ia_maturity_leads")
        .update({
          respostas: arr,
          score_basico: scoreBasico,
          score_intermediario: scoreIntermediario,
          score_avancado: scoreAvancado,
          score_geral: scoreGeral,
          competencias,
          nivel_maturidade: nivelMaturidade,
          concluido: true,
        })
        .eq("id", leadId);

      toast.success("Teste finalizado! Veja seu resultado.");
      onComplete();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao finalizar teste");
    } finally {
      setLoading(false);
    }
  };

  // Dynamic level label per actual question
  const nivelAtual = useMemo(() => {
    if (!questions.length) return "";
    const niv = questions[currentIndex]?.nivel;
    return niv ? nivelLabel[niv] || niv : "";
  }, [questions, currentIndex]);

  const tempoRestanteMin = useMemo(() => {
    const restantes = Math.max(0, questions.length - currentIndex - 1);
    return Math.max(1, Math.round((restantes * 18) / 60));
  }, [questions.length, currentIndex]);

  if (loading || questions.length === 0) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-16">
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">Carregando perguntas...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progresso = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="container max-w-4xl mx-auto px-4 py-16">
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground flex-wrap gap-2">
          <span>
            Questão {currentIndex + 1} de {questions.length}
          </span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> ~{tempoRestanteMin} min restantes
            </span>
            <span>Nível: <span className="font-bold text-foreground">{nivelAtual}</span></span>
          </span>
        </div>
        <Progress value={progresso} className="h-2" />
        {onRestart && (
          <button
            onClick={() => {
              if (confirm("Tem certeza que quer recomeçar? Suas respostas serão apagadas.")) onRestart();
            }}
            className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Recomeçar
          </button>
        )}
      </div>

      <Card className="border-2 border-primary/20 bg-card shadow-[18px_18px_0_hsl(var(--secondary)/0.12)]">
        <CardHeader>
          <CardDescription className="text-xs uppercase tracking-wider font-bold">
            {currentQuestion.competencia} • {nivelAtual}
          </CardDescription>
          <CardTitle className="text-2xl font-black uppercase">{currentQuestion.pergunta}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={respostas[currentQuestion.id]?.toString() || ""}
            onValueChange={(v) => handleResposta(parseInt(v))}
          >
            {[
              { value: 1, label: "Não sei / Não faço nada relacionado" },
              { value: 2, label: "Conheço pouco e faço raramente" },
              { value: 3, label: "Entendo razoavelmente e aplico às vezes" },
              { value: 4, label: "Domino bem e aplico com frequência" },
              { value: 5, label: "Domínio avançado e aplico consistentemente" },
            ].map((option) => (
              <div
                key={option.value}
                className="flex items-center space-x-3 p-4 rounded-lg border-2 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleResposta(option.value)}
              >
                <RadioGroupItem value={option.value.toString()} id={`opt-${option.value}`} />
                <Label htmlFor={`opt-${option.value}`} className="flex-1 cursor-pointer font-normal leading-relaxed">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex items-center justify-between gap-4 pt-4">
            <Button variant="outline" onClick={handleVoltar} disabled={currentIndex === 0} className="w-32">
              <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
            </Button>
            {currentIndex === questions.length - 1 ? (
              <Button onClick={handleFinalizar} disabled={!respostas[currentQuestion.id] || loading} className="w-32">
                {loading ? "Finalizando..." : "Finalizar"}
              </Button>
            ) : (
              <Button onClick={handleProximo} disabled={!respostas[currentQuestion.id]} className="w-32">
                Avançar <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
