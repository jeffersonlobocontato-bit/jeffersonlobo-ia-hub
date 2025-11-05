const ContactSection = () => {

  return (
    <section id="contato" className="py-24 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="px-8 py-4 rounded-full bg-gradient-to-r from-primary to-secondary">
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Vamos conversar
              </h2>
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Entre em contato para palestras, cursos ou consultorias
            personalizadas
          </p>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
