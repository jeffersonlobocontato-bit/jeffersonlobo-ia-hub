import BriefingForm from '@/components/BriefingForm';

const ContactSection = () => {
  return (
    <section id="contato" className="relative overflow-hidden bg-background py-24">
      <div className="absolute inset-0 z-0 bg-brand-grid opacity-35" />
      <div className="container mx-auto px-4 relative z-10" id="briefing">
        <div className="max-w-3xl mx-auto text-center mb-10 space-y-4">
          <div className="section-kicker">Briefing · Resposta em 24h</div>
          <h2 className="display-title text-4xl sm:text-5xl md:text-6xl text-foreground">
            Vamos conversar sobre o seu evento
          </h2>
          <p className="text-lg text-muted-foreground">
            Conte o contexto e eu volto com formatos, datas e investimento. Sem formulário genérico —
            cada proposta é desenhada para o seu público.
          </p>
          <div className="inline-flex items-center gap-2 border border-secondary/30 bg-secondary/10 px-4 py-2 text-foreground font-bold uppercase">
            <span className="text-sm">⏰ Apenas 3 vagas disponíveis este mês</span>
          </div>
        </div>
        <BriefingForm />
      </div>
    </section>
  );
};

export default ContactSection;
