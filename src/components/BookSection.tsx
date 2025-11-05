import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShoppingCart, Star, BookOpen } from 'lucide-react';
import bookCover from '@/assets/book-cover.jpg';
import { useBookContent } from '@/hooks/useBookContent';
import { useBookFeatures, useBookReviews } from '@/hooks/useBookFeatures';

const BookSection = () => {
  const { data: bookData, isLoading } = useBookContent();
  const { data: features = [] } = useBookFeatures();
  const { data: reviews = [] } = useBookReviews();

  const displayData = bookData || {
    title: "Livro em breve",
    subtitle: "",
    description: "Conteúdo em atualização",
    purchase_link: "",
    sample_link: "",
    cover_image: bookCover
  };
  const coverImage = bookData?.cover_image || bookCover;

  return (
    <section id="livro" className="py-24 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-gradient-to-r from-primary to-secondary">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                Meu livro
              </h2>
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Uma jornada pelos caminhos da inteligência artificial e seu impacto
            no futuro da humanidade
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
          {/* Book Cover */}
          <div className="relative animate-fade-in">
            <div className="relative max-w-sm mx-auto">
              <img
                src={coverImage}
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
                {displayData.title}
              </h3>
              {displayData.subtitle && (
                <h4 className="text-xl text-primary mb-4">{displayData.subtitle}</h4>
              )}
              <p className="text-lg text-muted-foreground leading-relaxed">
                {displayData.description}
              </p>
            </div>

            {/* Features */}
            {features.length > 0 && (
              <div className="space-y-4">
                {features.map((feature) => (
                  <div key={feature.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground">{feature.title}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && reviews.map((review) => (
              <Card key={review.id} className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(review.rating)
                          ? 'fill-primary text-primary'
                          : 'text-primary/30'
                      }`}
                    />
                  ))}
                  <span className="ml-2 font-semibold">{review.rating}/5</span>
                </div>
                <p className="text-muted-foreground italic">
                  "{review.review_text}"
                </p>
                <p className="text-sm font-semibold mt-2">
                  — {review.reviewer_name}, {review.reviewer_title}
                </p>
              </Card>
            ))}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {displayData.purchase_link && displayData.purchase_link !== '#' && (
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                  onClick={() => window.open(displayData.purchase_link, '_blank')}
                >
                  <ShoppingCart className="mr-2 w-5 h-5" />
                  Comprar agora
                </Button>
              )}
              {displayData.sample_link && displayData.sample_link !== '#' && (
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary/30 hover:bg-primary/10"
                  onClick={() => window.open(displayData.sample_link, '_blank')}
                >
                  Ler amostra grátis
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookSection;
