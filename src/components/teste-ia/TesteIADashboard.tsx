import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, Mail, MessageCircle } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface Lead {
  nome: string;
  email: string;
  finalidade: string;
  score_basico: number;
  score_intermediario: number;
  score_avancado: number;
  score_geral: number;
  nivel_maturidade: string;
  competencias: Record<string, number>;
  respostas: any[];
}

interface TesteIADashboardProps {
  leadId: string;
}

const competenciaLabels: Record<string, string> = {
  estrategia: "Estratégia",
  processos: "Processos",
  dados: "Dados",
  ferramentas: "Ferramentas",
  pessoas: "Pessoas/Skills",
  etica: "Ética/Compliance",
  seguranca: "Segurança",
  governanca: "Governança",
};

export function TesteIADashboard({ leadId }: TesteIADashboardProps) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResultado();
  }, [leadId]);

  const loadResultado = async () => {
    try {
      const { data, error } = await supabase
        .from("ia_maturity_leads")
        .select("*")
        .eq("id", leadId)
        .single();

      if (error) throw error;
      setLead(data as Lead);
    } catch (error) {
      console.error("Erro ao carregar resultado:", error);
      toast.error("Erro ao carregar resultado");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    window.open("https://wa.me/5545999864213", "_blank");
  };

  if (loading || !lead) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-16">
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">Carregando resultado...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const radarData = Object.entries(lead.competencias || {}).map(([key, value]) => ({
    competencia: competenciaLabels[key] || key,
    valor: value,
  }));

  const barData = [
    { nivel: "Básico", score: lead.score_basico },
    { nivel: "Intermediário", score: lead.score_intermediario },
    { nivel: "Avançado", score: lead.score_avancado },
  ];

  const gaps = Object.entries(lead.competencias || {})
    .filter(([, value]) => value < 3.0)
    .map(([key, value]) => ({
      competencia: competenciaLabels[key] || key,
      score: value,
    }));

  return (
    <div className="container max-w-6xl mx-auto px-4 py-16 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Seu Resultado</h1>
        <p className="text-xl text-muted-foreground">
          Olá, {lead.nome}! Seu nível de maturidade em IA é:{" "}
          <span className="font-bold text-primary">{lead.nivel_maturidade}</span>
        </p>
      </div>

      {/* Score Geral */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Score Geral</CardTitle>
          <CardDescription>Sua pontuação média em todas as questões</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-6xl font-bold text-center text-primary">
            {lead.score_geral.toFixed(1)}
            <span className="text-2xl text-muted-foreground">/5.0</span>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Barras por Nível */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Scores por Nível</CardTitle>
          <CardDescription>Sua performance em cada nível de maturidade</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis dataKey="nivel" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" fill="hsl(var(--primary))" name="Pontuação" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Radar de Competências */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Radar de Competências</CardTitle>
          <CardDescription>Sua performance em cada competência avaliada</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="competencia" />
              <PolarRadiusAxis domain={[0, 5]} />
              <Radar
                name="Score"
                dataKey="valor"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Aprendizados Necessários */}
      {gaps.length > 0 && (
        <Card className="border-2 border-orange-500/20">
          <CardHeader>
            <CardTitle>Aprendizados Necessários</CardTitle>
            <CardDescription>Áreas com oportunidade de melhoria (score abaixo de 3.0)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gaps.map((gap) => (
                <div key={gap.competencia} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{gap.competencia}</h4>
                    <span className="text-sm text-muted-foreground">
                      Score: {gap.score.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Recomendamos focar no desenvolvimento desta competência através de cursos, leituras e prática.
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA WhatsApp */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold">Quer acelerar sua evolução em IA?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Fale com o especialista Jefferson Lobo e descubra como transformar seus resultados com consultoria personalizada, treinamentos e o Método DEL.
            </p>
            <Button size="lg" className="h-14 px-8 text-lg" onClick={handleWhatsApp}>
              <MessageCircle className="w-5 h-5 mr-2" />
              Falar com o especialista no WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="lg">
          <Download className="w-4 h-4 mr-2" />
          Baixar PDF
        </Button>
        <Button variant="outline" size="lg">
          <Mail className="w-4 h-4 mr-2" />
          Enviar por e-mail
        </Button>
      </div>
    </div>
  );
}
