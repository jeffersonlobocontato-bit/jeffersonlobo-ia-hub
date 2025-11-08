import { Brain, CheckCircle, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useTrackCTA } from "@/hooks/useTrackCTA";

const TesteIASection = () => {
  const { trackCTA } = useTrackCTA();
  const benefits = [
    {
      icon: Brain,
      title: "Avalie sua Maturidade",
      description: "Descubra o nível de adoção de IA na sua empresa ou vida pessoal",
    },
    {
      icon: TrendingUp,
      title: "Identifique Oportunidades",
      description: "Receba insights sobre áreas de melhoria e crescimento",
    },
    {
      icon: CheckCircle,
      title: "Relatório Personalizado",
      description: "Obtenha um diagnóstico completo com recomendações específicas",
    },
  ];

  return (
    <section id="teste-ia" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Brain className="w-4 h-4" />
            <span className="text-sm font-medium">🔥 Diagnóstico Gratuito</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Sua IA está <span className="text-primary font-bold">genérica demais</span>?
          </h2>
          <p className="text-xl text-muted-foreground mb-4">
            80% das empresas erram aqui. Você está entre elas?
          </p>
          <p className="text-lg text-muted-foreground">
            Descubra em apenas 5 minutos o nível de preparação da sua empresa ou da sua carreira para a era da Inteligência Artificial. Receba um relatório completo em PDF com insights e recomendações personalizadas.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">1.247 profissionais</span> já descobriram seu nível de maturidade
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border-primary/20 bg-card/50 backdrop-blur hover:border-primary/40 transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link to="/teste-ia">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
              onClick={() => trackCTA('teste_ia_start', 'teste_ia_section')}
            >
              <Brain className="w-5 h-5 mr-2" />
              Fazer o Teste Agora
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            ✨ 100% gratuito • 📊 Relatório instantâneo • 🔒 Seus dados são privados
          </p>
        </div>
      </div>
    </section>
  );
};

export default TesteIASection;
