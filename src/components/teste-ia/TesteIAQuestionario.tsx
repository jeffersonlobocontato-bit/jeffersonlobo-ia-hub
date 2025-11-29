import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Question {
  id: string;
  ordem: number;
  pergunta: string;
  nivel: string;
  competencia: string;
}

interface TesteIAQuestionarioProps {
  leadId: string;
  finalidade: "PF" | "PJ";
  onComplete: () => void;
}

export function TesteIAQuestionario({ leadId, finalidade, onComplete }: TesteIAQuestionarioProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, [finalidade]);

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
      console.error("Erro ao carregar perguntas:", error);
      toast.error("Erro ao carregar perguntas");
    } finally {
      setLoading(false);
    }
  };

  const handleResposta = async (valor: number) => {
    const currentQuestion = questions[currentIndex];
    const novasRespostas = { ...respostas, [currentQuestion.id]: valor };
    setRespostas(novasRespostas);

    // Autosave
    try {
      const respostasArray = Object.entries(novasRespostas).map(([id, resposta]) => {
        const q = questions.find((q) => q.id === id);
        return {
          id_pergunta: id,
          resposta,
          competencia: q?.competencia,
          nivel: q?.nivel,
        };
      });

      await supabase
        .from("ia_maturity_leads")
        .update({ respostas: respostasArray })
        .eq("id", leadId);
    } catch (error) {
      console.error("Erro ao salvar resposta:", error);
    }
  };

  const handleProximo = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleVoltar = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinalizar = async () => {
    setLoading(true);
    try {
      const respostasArray = Object.entries(respostas).map(([id, resposta]) => {
        const q = questions.find((q) => q.id === id);
        return {
          id_pergunta: id,
          resposta,
          competencia: q?.competencia,
          nivel: q?.nivel,
        };
      });

      // Calcular scores por nível (média dinâmica baseada no número real de perguntas)
      const respostasBasico = respostasArray.filter((r) => r.nivel === "BASICO");
      const scoreBasico = respostasBasico.length > 0 
        ? respostasBasico.reduce((acc, r) => acc + r.resposta, 0) / respostasBasico.length
        : 0;
      
      const respostasIntermediario = respostasArray.filter((r) => r.nivel === "INTERMEDIARIO");
      const scoreIntermediario = respostasIntermediario.length > 0
        ? respostasIntermediario.reduce((acc, r) => acc + r.resposta, 0) / respostasIntermediario.length
        : 0;
      
      const respostasAvancado = respostasArray.filter((r) => r.nivel === "AVANCADO");
      const scoreAvancado = respostasAvancado.length > 0
        ? respostasAvancado.reduce((acc, r) => acc + r.resposta, 0) / respostasAvancado.length
        : 0;
      
      const scoreGeral = (scoreBasico + scoreIntermediario + scoreAvancado) / 3;

      // Calcular competências (média dinâmica baseada no número real de perguntas por competência)
      const competenciasTemp: Record<string, number[]> = {};
      respostasArray.forEach((r) => {
        if (!competenciasTemp[r.competencia!]) competenciasTemp[r.competencia!] = [];
        competenciasTemp[r.competencia!].push(r.resposta);
      });

      const competencias: Record<string, number> = {};
      Object.keys(competenciasTemp).forEach((comp) => {
        const valores = competenciasTemp[comp];
        competencias[comp] = valores.length > 0 
          ? valores.reduce((a, b) => a + b, 0) / valores.length 
          : 0;
      });

      // Determinar nível de maturidade
      let nivelMaturidade: "Iniciante" | "Em evolução" | "Avançado";
      if (scoreGeral < 2.5) nivelMaturidade = "Iniciante";
      else if (scoreGeral < 4.0) nivelMaturidade = "Em evolução";
      else nivelMaturidade = "Avançado";

      await supabase
        .from("ia_maturity_leads")
        .update({
          respostas: respostasArray,
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
      console.error("Erro ao finalizar teste:", error);
      toast.error("Erro ao finalizar teste");
    } finally {
      setLoading(false);
    }
  };

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
  const nivelAtual =
    currentIndex < 8 ? "Básico" : currentIndex < 16 ? "Intermediário" : "Avançado";

  return (
    <div className="container max-w-4xl mx-auto px-4 py-16">
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Questão {currentIndex + 1} de {questions.length}</span>
          <span>Nível: {nivelAtual}</span>
        </div>
        <Progress value={progresso} className="h-2" />
      </div>

      <Card className="border-2 shadow-xl">
        <CardHeader>
          <CardDescription className="text-xs uppercase tracking-wider">
            {currentQuestion.competencia} • {currentQuestion.nivel}
          </CardDescription>
          <CardTitle className="text-2xl">{currentQuestion.pergunta}</CardTitle>
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
                <Label
                  htmlFor={`opt-${option.value}`}
                  className="flex-1 cursor-pointer font-normal"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex items-center justify-between gap-4 pt-4">
            <Button
              variant="outline"
              onClick={handleVoltar}
              disabled={currentIndex === 0}
              className="w-32"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            {currentIndex === questions.length - 1 ? (
              <Button
                onClick={handleFinalizar}
                disabled={!respostas[currentQuestion.id] || loading}
                className="w-32"
              >
                {loading ? "Finalizando..." : "Finalizar"}
              </Button>
            ) : (
              <Button
                onClick={handleProximo}
                disabled={!respostas[currentQuestion.id]}
                className="w-32"
              >
                Avançar
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
