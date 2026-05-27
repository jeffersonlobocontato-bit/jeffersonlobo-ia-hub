import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, Mail, MessageCircle, RotateCcw, Target, TrendingUp, Calendar } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import jsPDF from "jspdf";

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

interface AprendizadoItem {
  tipo?: string;
  titulo?: string;
  fonte?: string;
  link?: string;
}

interface Recommendation {
  competencia: string;
  nivel: string;
  titulo: string;
  descricao: string;
  por_que_importa?: string | null;
  acao_30d: string | null;
  acao_60d: string | null;
  acao_90d: string | null;
  acao_pf_30d?: string | null;
  acao_pf_60d?: string | null;
  acao_pf_90d?: string | null;
  acao_pj_30d?: string | null;
  acao_pj_60d?: string | null;
  acao_pj_90d?: string | null;
  aprendizado_pf?: AprendizadoItem[] | null;
  aprendizado_pj?: AprendizadoItem[] | null;
}

interface TesteIADashboardProps {
  leadId: string;
  accessToken: string;
  onRestart?: () => void;
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

export function TesteIADashboard({ leadId, accessToken, onRestart }: TesteIADashboardProps) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [avgGeral, setAvgGeral] = useState<number | null>(null);

  useEffect(() => {
    loadAll();
  }, [leadId, accessToken]);

  const loadAll = async () => {
    try {
      const [{ data: leadRows }, { data: recs }, { data: statsData }] = await Promise.all([
        supabase.rpc("get_maturity_lead", { p_id: leadId, p_token: accessToken }),
        supabase.from("ia_maturity_recommendations").select("*").eq("ativo", true).order("ordem"),
        supabase.rpc("get_maturity_stats"),
      ]);

      const leadData = Array.isArray(leadRows) ? leadRows[0] : leadRows;
      if (!leadData) {
        toast.error("Resultado não encontrado.");
        return;
      }
      setLead(leadData as Lead);
      setRecommendations((recs || []) as Recommendation[]);

      const stats = Array.isArray(statsData) ? statsData[0] : statsData;
      if (stats?.avg_score_geral != null) {
        setAvgGeral(Number(stats.avg_score_geral));
      }

    } catch (e) {
      console.error(e);
      toast.error("Erro ao carregar resultado");
    } finally {
      setLoading(false);
    }
  };

  const gaps = useMemo(() => {
    if (!lead?.competencias) return [];
    return Object.entries(lead.competencias)
      .filter(([, v]) => v < 3.0)
      .sort((a, b) => a[1] - b[1])
      .map(([k, v]) => ({ key: k, competencia: competenciaLabels[k] || k, score: v }));
  }, [lead]);

  // Match top gaps with recommendations
  const planoAcao = useMemo(() => {
    if (!gaps.length || !recommendations.length) return [];
    return gaps.slice(0, 3).map((gap) => {
      const rec = recommendations.find((r) => r.competencia === gap.key) || recommendations[0];
      return { ...gap, rec };
    });
  }, [gaps, recommendations]);

  const handleWhatsApp = () => window.open("https://wa.me/5545999864213", "_blank");
  const handleAgendar = () =>
    window.open(
      `https://wa.me/5545999864213?text=${encodeURIComponent(
        `Olá Jefferson, fiz o Teste de Maturidade em IA. Meu nível: ${lead?.nivel_maturidade}. Quero agendar uma conversa.`
      )}`,
      "_blank"
    );

  const handleDownloadPDF = async () => {
    if (!lead || lead.score_geral == null) {
      toast.error("Relatório indisponível.");
      return;
    }
    toast.info("Gerando PDF...");
    try {
      const { generateTesteIAPdf } = await import("@/lib/teste-ia-pdf");
      generateTesteIAPdf(lead as any, recommendations as any);
      toast.success("PDF baixado!");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao gerar PDF");
    }
  };

  const handleSendEmail = async () => {
    if (!lead) return;
    toast.info("Enviando email...");
    try {
      const { error } = await supabase.functions.invoke("send-test-email", {
        body: {
          nome: lead.nome,
          email: lead.email,
          nivelMaturidade: lead.nivel_maturidade,
          scoreGeral: lead.score_geral,
        },
      });
      if (error) throw error;
      toast.success("Email enviado!");
    } catch (e: any) {
      console.error(e);
      toast.error("Envio de email indisponível no momento. Use o botão 'Baixar PDF'.");
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

  const radarData = Object.entries(lead.competencias || {}).map(([k, v]) => ({
    competencia: competenciaLabels[k] || k,
    valor: v,
  }));

  const barData = [
    { nivel: "Básico", score: lead.score_basico },
    { nivel: "Intermediário", score: lead.score_intermediario },
    { nivel: "Avançado", score: lead.score_avancado },
  ];

  const diffMedia = avgGeral !== null ? lead.score_geral - avgGeral : null;

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 md:py-16 space-y-6 md:space-y-8">
      <div className="text-center space-y-3 md:space-y-4">
        <div className="section-kicker mx-auto w-fit">Relatório final</div>
        <h1 className="display-title text-3xl md:text-5xl">Seu Resultado</h1>
        <p className="text-base md:text-xl text-muted-foreground">
          Olá, {lead.nome}! Seu nível de maturidade em IA é:{" "}
          <span className="font-bold text-primary">{lead.nivel_maturidade}</span>
        </p>
      </div>

      {/* Score Geral + Comparativo */}
      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        <Card className="border-2 border-primary/20 bg-card">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Score Geral</CardTitle>
            <CardDescription>Pontuação média em todas as questões</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl md:text-6xl font-bold text-center text-primary">
              {lead.score_geral.toFixed(1)}
              <span className="text-xl md:text-2xl text-muted-foreground">/5.0</span>
            </div>
          </CardContent>
        </Card>

        {avgGeral !== null && (
          <Card className="border-2 border-secondary/20 bg-card">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-secondary" />
                Você vs. Média
              </CardTitle>
              <CardDescription>Comparado com todos que fizeram o teste</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <div className="text-3xl md:text-4xl font-bold">
                  {diffMedia! >= 0 ? "+" : ""}
                  {diffMedia!.toFixed(1)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {diffMedia! >= 0
                    ? "acima da média geral"
                    : "abaixo da média — espaço claro para evoluir"}
                </p>
                <p className="text-xs text-muted-foreground">Média atual: {avgGeral.toFixed(1)}/5.0</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bar chart */}
      <Card className="border-2 border-primary/20 bg-card">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Scores por Nível</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
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

      {/* Radar */}
      <Card className="border-2 border-primary/20 bg-card">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Radar de Competências</CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid />
              <PolarAngleAxis dataKey="competencia" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 9 }} />
              <Radar name="Score" dataKey="valor" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Plano de ação 30/60/90 */}
      {planoAcao.length > 0 && (
        <Card className="border-2 border-secondary/20 bg-card">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl flex items-center gap-2">
              <Target className="w-5 h-5 text-secondary" />
              Seu Plano de Ação 30 / 60 / 90 dias
            </CardTitle>
            <CardDescription>Recomendações priorizadas pelas suas 3 maiores oportunidades</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {planoAcao.map((p, i) => (
              <div key={p.key} className="border-2 border-border bg-muted/30 p-4 md:p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground font-black w-8 h-8 flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      {p.competencia} · Score {p.score.toFixed(1)}/5
                    </p>
                    <h3 className="font-black uppercase text-base md:text-lg mt-1">{p.rec.titulo}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{p.rec.descricao}</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-2 pl-0 sm:pl-11">
                  {[
                    { l: "30 dias", t: p.rec.acao_30d, c: "border-primary" },
                    { l: "60 dias", t: p.rec.acao_60d, c: "border-secondary" },
                    { l: "90 dias", t: p.rec.acao_90d, c: "border-accent" },
                  ]
                    .filter((s) => s.t)
                    .map((s) => (
                      <div key={s.l} className={`border-l-4 ${s.c} pl-3 py-1`}>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{s.l}</p>
                        <p className="text-sm">{s.t}</p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* CTAs */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="py-6 md:py-8 px-4">
          <div className="text-center space-y-3 md:space-y-4">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold leading-tight">
              Quer transformar este diagnóstico em resultado?
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Agende uma conversa de 30 minutos com Jefferson Lobo para discutir como aplicar IA no seu contexto.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
              <Button size="lg" className="h-12 px-6" onClick={handleAgendar}>
                <Calendar className="w-4 h-4 mr-2" />
                Agendar diagnóstico 1:1
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-6" onClick={handleWhatsApp}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Falar no WhatsApp
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 md:gap-4">
        <Button variant="outline" size="lg" className="h-12" onClick={handleDownloadPDF}>
          <Download className="w-4 h-4 mr-2" />
          Baixar PDF
        </Button>
        <Button variant="outline" size="lg" className="h-12" onClick={handleSendEmail}>
          <Mail className="w-4 h-4 mr-2" />
          Enviar por e-mail
        </Button>
        {onRestart && (
          <Button variant="ghost" size="lg" className="h-12" onClick={onRestart}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Refazer teste
          </Button>
        )}
      </div>
    </div>
  );
}
