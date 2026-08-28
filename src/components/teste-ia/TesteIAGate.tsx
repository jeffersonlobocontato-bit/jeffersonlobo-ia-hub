import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Brain, Sparkles, Users, Clock, Award, CheckCircle2 } from "lucide-react";

interface TesteIAGateProps {
  onComplete: (leadId: string, finalidade: "PF" | "PJ", accessToken: string) => void;
}


export function TesteIAGate({ onComplete }: TesteIAGateProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [finalidade, setFinalidade] = useState<"PF" | "PJ">("PF");
  const [consentimento, setConsentimento] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalConcluidos, setTotalConcluidos] = useState<number | null>(null);

  // Fetch social proof count (via secure RPC, no PII)
  useEffect(() => {
    supabase.rpc("get_maturity_stats").then(({ data }) => {
      const row = Array.isArray(data) ? data[0] : data;
      if (row?.total_concluidos != null) setTotalConcluidos(Number(row.total_concluidos));
    });
  }, []);


  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  const isFormValid = () => {
    const nomeValido = nome.trim().split(" ").filter(Boolean).length >= 2;
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const digitos = whatsapp.replace(/\D/g, "").length;
    const whatsappValido = digitos === 10 || digitos === 11;
    return nomeValido && emailValido && whatsappValido && consentimento;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast.error("Preencha todos os campos corretamente. Telefone com 10 ou 11 dígitos.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("create_maturity_lead", {
        p_nome: nome.trim(),
        p_email: email.trim().toLowerCase(),
        p_whatsapp: whatsapp.replace(/\D/g, ""),
        p_finalidade: finalidade,
      });

      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      const leadId = (row as any)?.id as string;
      const accessToken = (row as any)?.access_token as string;
      if (!leadId || !accessToken) throw new Error("invalid_response");

      // Fire-and-forget: notificação Telegram
      const telegramText = `🧠 <b>Novo Lead - Teste IA</b>\n\n` +
        `👤 <b>Nome:</b> ${nome.trim()}\n` +
        `📧 <b>Email:</b> ${email.trim().toLowerCase()}\n` +
        `📱 <b>WhatsApp:</b> ${whatsapp.replace(/\D/g, "")}\n` +
        `🎯 <b>Finalidade:</b> ${finalidade}`;
      void supabase.functions.invoke('notify-telegram', { body: { text: telegramText } });

      toast.success("Vamos começar seu diagnóstico!");
      onComplete(leadId, finalidade, accessToken);

    } catch (error: any) {
      console.error("Erro:", error);
      if (error?.code === "23505") {
        toast.error("Você já iniciou este teste. Use outro e-mail para refazer.");
      } else {
        toast.error("Não foi possível iniciar. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12 space-y-4">
        <div className="inline-flex items-center justify-center h-20 w-20 border border-primary/30 bg-primary/10 mb-4">
          <Brain className="w-10 h-10 text-primary" />
        </div>
        <div className="section-kicker">Teste de maturidade</div>
        <h1 className="display-title text-4xl md:text-5xl text-primary">
          Teste de Maturidade em IA
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Diagnóstico gratuito de 8 minutos. Receba seu nível de maturidade, gaps por
          competência e um plano de ação 30/60/90 dias.
        </p>

        {/* Social proof bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 pt-6 text-xs sm:text-sm font-medium uppercase tracking-widest text-muted-foreground" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          {totalConcluidos !== null && totalConcluidos > 0 && (
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-foreground">{totalConcluidos}+ profissionais</span> já fizeram
            </span>
          )}
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-foreground">8 minutos</span> em média
          </span>
          <span className="flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-foreground">Relatório</span> personalizado
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {[
          { titulo: "Diagnóstico em 8 minutos", desc: "24 perguntas focadas no que importa." },
          { titulo: "Radar por competência", desc: "8 dimensões: estratégia, dados, ferramentas, pessoas..." },
          { titulo: "Plano de ação 30/60/90", desc: "Recomendações práticas para evoluir." },
        ].map((f) => (
          <div key={f.titulo} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">{f.titulo}</p>
                <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Card className="border-border bg-card shadow-md">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="font-normal">Vamos começar!</CardTitle>
          </div>
          <CardDescription>
            Seus dados são tratados conforme a LGPD e usados somente para enviar seu relatório.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome completo *</Label>
            <Input id="nome" placeholder="João Silva Santos" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp *</Label>
            <Input
              id="whatsapp"
              placeholder="(45) 99999-9999"
              value={whatsapp}
              onChange={(e) => setWhatsapp(formatWhatsApp(e.target.value))}
            />
          </div>

          <div className="space-y-3">
            <Label>Finalidade do teste *</Label>
            <RadioGroup value={finalidade} onValueChange={(v) => setFinalidade(v as "PF" | "PJ")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PF" id="pf" />
                <Label htmlFor="pf" className="font-normal cursor-pointer">
                  PF - Avaliação pessoal (individual)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PJ" id="pj" />
                <Label htmlFor="pj" className="font-normal cursor-pointer">
                  PJ - Avaliando a empresa (organizacional)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-start space-x-2 p-4 bg-muted/50 rounded-lg">
            <Checkbox
              id="consentimento"
              checked={consentimento}
              onCheckedChange={(checked) => setConsentimento(checked as boolean)}
            />
            <Label htmlFor="consentimento" className="text-sm font-normal leading-relaxed cursor-pointer">
              Autorizo o tratamento dos meus dados conforme a{" "}
              <a href="/politica-privacidade" className="text-primary underline">
                Política de Privacidade
              </a>
              . Posso solicitar exclusão a qualquer momento.
            </Label>
          </div>

          <Button onClick={handleSubmit} disabled={!isFormValid() || loading} className="w-full h-12 text-lg" size="lg">
            {loading ? "Iniciando..." : "Começar o teste"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
