import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShoppingCart, Star, BookOpen } from 'lucide-react';
import bookCover from '@/assets/book-cover.jpg';

const BookSection = () => {
  return (
    <section id="livro" className="py-24 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-primary bg-clip-text text-transparent">
              Meu livro
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Uma jornada pelos caminhos da inteligência artificial e seu impacto
            no futuro da humanidade
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Book Cover */}
          <div className="relative animate-fade-in">
            <div className="relative max-w-sm mx-auto">
              <img
                src={bookCover}
                alt="Capa do Livro"
                className="w-full rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-2xl blur-2xl -z-10 animate-pulse-glow" />
            </div>
          </div>

          {/* Book Details */}
          <div className="space-y-8 animate-slide-up">
            <div>
              <h3 className="text-3xl font-bold mb-4">
                IA: O Futuro é Agora
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Descubra como a inteligência artificial está redefinindo o modo
                como vivemos, trabalhamos e criamos. Este livro oferece uma
                visão acessível e inspiradora sobre as tecnologias que estão
                moldando o amanhã.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              {[
                'Conceitos práticos e aplicáveis',
                'Casos reais de transformação digital',
                'Reflexões éticas sobre IA',
                'Guia para iniciantes e profissionais',
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            {/* Reviews */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-primary text-primary"
                  />
                ))}
                <span className="ml-2 font-semibold">4.9/5</span>
              </div>
              <p className="text-muted-foreground italic">
                "Uma leitura essencial para quem deseja entender o futuro da
                tecnologia. Jefferson consegue tornar temas complexos em algo
                inspirador e acessível."
              </p>
              <p className="text-sm font-semibold mt-2">
                — Maria Silva, CTO
              </p>
            </Card>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
              >
                <ShoppingCart className="mr-2 w-5 h-5" />
                Comprar agora
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary/30 hover:bg-primary/10"
              >
                Ler amostra grátis
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookSection;
