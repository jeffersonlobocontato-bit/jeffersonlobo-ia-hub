import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Brain, Sparkles } from "lucide-react";

interface TesteIAGateProps {
  onComplete: (leadId: string, finalidade: "PF" | "PJ") => void;
}

export function TesteIAGate({ onComplete }: TesteIAGateProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [finalidade, setFinalidade] = useState<"PF" | "PJ">("PF");
  const [consentimento, setConsentimento] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return numbers.slice(0, 11).replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  const isFormValid = () => {
    const nomeValido = nome.trim().split(" ").length >= 2;
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const whatsappValido = whatsapp.replace(/\D/g, "").length === 11;
    return nomeValido && emailValido && whatsappValido && consentimento;
  };

  const handleSubmit = async () => {
    console.log("🔵 handleSubmit iniciado");
    console.log("🔵 Validação:", {
      isFormValid: isFormValid(),
      nome: nome.trim(),
      email,
      whatsapp: whatsapp.replace(/\D/g, ""),
      finalidade,
      consentimento
    });

    if (!isFormValid()) {
      console.log("❌ Formulário inválido");
      toast.error("Por favor, preencha todos os campos corretamente.");
      return;
    }

    setLoading(true);
    console.log("🔵 Loading ativado");

    try {
      // Gerar UUID no frontend
      const leadId = crypto.randomUUID();

      const dadosInsert = {
        id: leadId,
        nome: nome.trim(),
        email: email.trim(),
        whatsapp: whatsapp.replace(/\D/g, ""),
        finalidade,
      };

      console.log("🔵 Dados para insert:", dadosInsert);

      // Remover o .select() - apenas fazer o insert
      const { error } = await supabase
        .from("ia_maturity_leads")
        .insert(dadosInsert);

      console.log("🔵 Resposta Supabase:", { error });

      if (error) {
        console.error("❌ Erro do Supabase:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log("✅ Lead criado com sucesso, ID:", leadId);
      toast.success("Cadastro realizado! Vamos começar o teste.");
      onComplete(leadId, finalidade);
    } catch (error: any) {
      console.error("❌ Erro completo:", error);
      console.error("❌ Error stack:", error?.stack);
      
      let errorMessage = "Erro ao iniciar o teste. ";
      
      if (error?.message?.includes("duplicate")) {
        errorMessage += "Este e-mail ou WhatsApp já está cadastrado.";
      } else if (error?.code === "23505") {
        errorMessage += "Você já iniciou este teste anteriormente.";
      } else if (error?.message?.includes("row-level security")) {
        errorMessage += "Erro de permissão. Contate o suporte.";
      } else if (error?.message) {
        errorMessage += error.message;
      } else {
        errorMessage += "Erro desconhecido. Tente novamente.";
      }
      
      console.error("❌ Mensagem de erro final:", errorMessage);
      toast.error(errorMessage, { duration: 6000 });
    } finally {
      setLoading(false);
      console.log("🔵 Loading desativado");
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
          Descubra seu nível de maturidade em Inteligência Artificial e receba um diagnóstico personalizado com recomendações de aprendizado
        </p>
      </div>

      <Card className="border-2 border-primary/20 bg-card shadow-[18px_18px_0_hsl(var(--primary)/0.12)]">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="font-black uppercase">Vamos começar!</CardTitle>
          </div>
          <CardDescription>
            Preencha seus dados para iniciar o teste. Leva apenas 8-10 minutos e você receberá um relatório completo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome completo *</Label>
            <Input
              id="nome"
              placeholder="João Silva Santos"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
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
              Autorizo o tratamento dos meus dados pessoais para fins de avaliação e contato, conforme a{" "}
              <a href="/politica-privacidade" className="text-primary underline">
                Política de Privacidade
              </a>
              . Estou ciente de que posso solicitar a exclusão dos meus dados a qualquer momento.
            </Label>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!isFormValid() || loading}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {loading ? "Iniciando..." : "Começar o teste"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
