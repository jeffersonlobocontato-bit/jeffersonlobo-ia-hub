import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShoppingCart, Star, BookOpen } from 'lucide-react';
import bookCover from '@/assets/book-cover.jpg';
import { useBookContent } from '@/hooks/useBookContent';
import { useBookFeatures, useBookReviews } from '@/hooks/useBookFeatures';
import { useTrackCTA } from '@/hooks/useTrackCTA';

const BookSection = () => {
  const { data: bookData, isLoading } = useBookContent();
  const { data: features = [] } = useBookFeatures();
  const { data: reviews = [] } = useBookReviews();
  const { trackCTA } = useTrackCTA();

  // Fallback data
  const defaultData = {
    title: "Meu Livro sobre IA",
    subtitle: "Uma jornada pelos caminhos da inteligência artificial",
    description: "Neste livro, exploro os conceitos fundamentais da inteligência artificial e seu impacto transformador na sociedade moderna. Uma leitura essencial para entender o futuro da tecnologia.",
    purchase_link: "#",
    sample_link: "#",
    cover_image: bookCover
  };

  const displayData = bookData || defaultData;
  const coverImage = bookData?.cover_image || bookCover;

  return (
    <section id="livro" className="relative overflow-hidden bg-background py-24">
      <div className="absolute inset-0 z-0 bg-brand-grid opacity-20" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="section-kicker mb-4">Publicação</div>
          <h2 className="display-title text-3xl sm:text-4xl md:text-5xl mb-4">Meu livro</h2>
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
                className="w-full rounded-lg border border-border shadow-lg hover:scale-[1.01] transition-transform duration-500"
              />
              <div className="absolute -bottom-4 -right-4 h-1 w-28 bg-primary" />
            </div>
          </div>

          {/* Book Details */}
          <div className="space-y-8 animate-slide-up">
            <div>
              <h3 className="text-3xl mb-4">
                {displayData.title}
              </h3>
              {displayData.subtitle && (
                <h4 className="border-l-2 border-primary pl-4 text-xl italic text-primary mb-4">{displayData.subtitle}</h4>
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
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground">{feature.title}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && reviews.map((review) => (
              <Card key={review.id} className="p-6 bg-card border-primary/20">
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
                  onClick={() => {
                    trackCTA('book_purchase', 'book_section');
                    window.open(displayData.purchase_link, '_blank');
                  }}
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
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary/30 hover:bg-primary/10"
                onClick={() => trackCTA('book_materials', 'book_section')}
              >
                <Link to="/materiais">
                  <FileText className="mr-2 w-5 h-5" />
                  Materiais complementares
                </Link>
              </Button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default BookSection;
