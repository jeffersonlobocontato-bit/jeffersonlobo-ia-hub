import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, Mail, MessageCircle } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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

  const handleDownloadPDF = async () => {
    try {
      toast.info("Gerando PDF...");
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Título
      pdf.setFontSize(24);
      pdf.setTextColor(102, 126, 234);
      pdf.text("Teste de Maturidade em IA", pageWidth / 2, 20, { align: "center" });
      
      // Nome e data
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Nome: ${lead.nome}`, 20, 35);
      pdf.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 20, 42);
      pdf.text(`Finalidade: ${lead.finalidade === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}`, 20, 49);
      
      // Nível de Maturidade
      pdf.setFontSize(16);
      pdf.setTextColor(102, 126, 234);
      pdf.text("Nível de Maturidade:", 20, 62);
      pdf.setFontSize(20);
      pdf.setTextColor(0, 0, 0);
      pdf.text(lead.nivel_maturidade, 20, 72);
      
      // Score Geral
      pdf.setFontSize(16);
      pdf.setTextColor(102, 126, 234);
      pdf.text("Score Geral:", 20, 87);
      pdf.setFontSize(32);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${lead.score_geral.toFixed(1)}/5.0`, 20, 100);
      
      // Scores por Nível
      pdf.setFontSize(14);
      pdf.setTextColor(102, 126, 234);
      pdf.text("Scores por Nível:", 20, 120);
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Básico: ${lead.score_basico.toFixed(1)}/5.0`, 25, 130);
      pdf.text(`Intermediário: ${lead.score_intermediario.toFixed(1)}/5.0`, 25, 138);
      pdf.text(`Avançado: ${lead.score_avancado.toFixed(1)}/5.0`, 25, 146);
      
      // Competências
      pdf.setFontSize(14);
      pdf.setTextColor(102, 126, 234);
      pdf.text("Competências:", 20, 162);
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      let yPos = 172;
      Object.entries(lead.competencias || {}).forEach(([key, value]) => {
        pdf.text(`${competenciaLabels[key]}: ${value.toFixed(1)}/5.0`, 25, yPos);
        yPos += 8;
      });
      
      // Gaps
      if (gaps.length > 0) {
        pdf.addPage();
        pdf.setFontSize(14);
        pdf.setTextColor(102, 126, 234);
        pdf.text("Áreas de Melhoria:", 20, 20);
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        yPos = 30;
        gaps.forEach((gap) => {
          pdf.text(`• ${gap.competencia}: ${gap.score.toFixed(1)}/5.0`, 25, yPos);
          yPos += 8;
        });
      }
      
      // Footer
      const finalPage = pdf.internal.pages.length;
      for (let i = 1; i <= finalPage; i++) {
        pdf.setPage(i);
        pdf.setFontSize(9);
        pdf.setTextColor(128, 128, 128);
        pdf.text("Jefferson Lobo - Especialista em IA", pageWidth / 2, pageHeight - 10, { align: "center" });
        pdf.text("WhatsApp: +55 45 99986-4213", pageWidth / 2, pageHeight - 5, { align: "center" });
      }
      
      pdf.save(`teste-ia-${lead.nome.replace(/\s+/g, "-").toLowerCase()}.pdf`);
      toast.success("PDF baixado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF");
    }
  };

  const handleSendEmail = async () => {
    try {
      toast.info("Enviando email...");
      
      const { error } = await supabase.functions.invoke("send-test-email", {
        body: {
          nome: lead.nome,
          email: lead.email,
          nivelMaturidade: lead.nivel_maturidade,
          scoreGeral: lead.score_geral,
        },
      });

      if (error) throw error;
      
      toast.success("Email enviado com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      toast.error("Erro ao enviar email. Verifique se o RESEND_API_KEY está configurado.");
    }
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
    <div className="container max-w-6xl mx-auto px-4 py-8 md:py-16 space-y-6 md:space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 md:space-y-4">
        <h1 className="text-2xl md:text-4xl font-bold">Seu Resultado</h1>
        <p className="text-base md:text-xl text-muted-foreground">
          Olá, {lead.nome}! Seu nível de maturidade em IA é:{" "}
          <span className="font-bold text-primary">{lead.nivel_maturidade}</span>
        </p>
      </div>

      {/* Score Geral */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Score Geral</CardTitle>
          <CardDescription className="text-sm">Sua pontuação média em todas as questões</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl md:text-6xl font-bold text-center text-primary">
            {lead.score_geral.toFixed(1)}
            <span className="text-xl md:text-2xl text-muted-foreground">/5.0</span>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Barras por Nível */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Scores por Nível</CardTitle>
          <CardDescription className="text-sm">Sua performance em cada nível de maturidade</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
            <BarChart data={barData}>
              <XAxis dataKey="nivel" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="score" fill="hsl(var(--primary))" name="Pontuação" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Radar de Competências */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Radar de Competências</CardTitle>
          <CardDescription className="text-sm">Sua performance em cada competência avaliada</CardDescription>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <ResponsiveContainer width="100%" height={300} className="md:h-[400px]">
            <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid />
              <PolarAngleAxis 
                dataKey="competencia" 
                tick={{ fontSize: 9 }} 
                style={{ fontSize: '9px' }}
              />
              <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 9 }} />
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
            <CardTitle className="text-lg md:text-xl">Aprendizados Necessários</CardTitle>
            <CardDescription className="text-sm">Áreas com oportunidade de melhoria (score abaixo de 3.0)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 md:space-y-4">
              {gaps.map((gap) => (
                <div key={gap.competencia} className="p-3 md:p-4 bg-muted/50 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 mb-2">
                    <h4 className="font-semibold text-sm md:text-base">{gap.competencia}</h4>
                    <span className="text-xs md:text-sm text-muted-foreground">
                      Score: {gap.score.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground">
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
        <CardContent className="py-6 md:py-8 px-4">
          <div className="text-center space-y-3 md:space-y-4">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold leading-tight">Quer acelerar sua evolução em IA?</h3>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Fale com o especialista Jefferson Lobo e descubra como transformar seus resultados com consultoria personalizada, treinamentos e o Método DEL.
            </p>
            <Button 
              size="lg" 
              className="h-11 sm:h-12 md:h-14 px-3 sm:px-6 md:px-8 text-xs sm:text-base md:text-lg w-full sm:w-auto max-w-full" 
              onClick={handleWhatsApp}
            >
              <MessageCircle className="w-4 h-4 md:w-5 md:h-5 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="truncate">Falar no WhatsApp</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 md:gap-4">
        <Button variant="outline" size="lg" className="h-12 md:h-14 text-sm md:text-base" onClick={handleDownloadPDF}>
          <Download className="w-4 h-4 mr-2" />
          Baixar PDF
        </Button>
        <Button variant="outline" size="lg" className="h-12 md:h-14 text-sm md:text-base" onClick={handleSendEmail}>
          <Mail className="w-4 h-4 mr-2" />
          Enviar por e-mail
        </Button>
      </div>
    </div>
  );
}
