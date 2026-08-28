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
    <section id="teste-ia" className="relative overflow-hidden bg-background py-20 md:py-32">
      <div className="absolute inset-0 -z-10 bg-brand-grid opacity-40" />
      <div className="absolute left-0 top-0 h-full w-1.5 md:w-4 bg-primary" />

      <div className="container mx-auto px-5 pl-8 md:pl-14">
        <div className="mx-auto mb-16 grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <div className="space-y-6">
            <div className="section-kicker mb-0">
              <Brain className="w-4 h-4" />
              <span>Diagnóstico gratuito</span>
            </div>
            <h2 className="display-title text-4xl md:text-5xl lg:text-6xl">
              Sua IA está <span className="text-primary">genérica demais</span>?
            </h2>
            <p className="text-lg text-muted-foreground">
              Descubra em poucos minutos o nível de preparação da sua empresa ou da sua carreira para operar com inteligência artificial de verdade.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm font-medium text-foreground">
              <Users className="w-4 h-4 text-secondary" />
              <span><span className="text-primary">1.247 profissionais</span> já fizeram o diagnóstico</span>
            </div>
          </div>

          <div className="panel-dark p-6 md:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-primary mb-6">
            <Brain className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>O que você recebe</span>
            </div>
            <div className="space-y-4 text-sm sm:text-base text-muted-foreground">
              <p>• score geral por nível de maturidade</p>
              <p>• leitura por competência crítica</p>
              <p>• relatório em PDF para compartilhar e guardar</p>
              <p>• próximos passos para aprofundar sua adoção de IA</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border-primary/20 bg-card hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link to="/teste-ia">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
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
