import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ExternalLink, Calendar, ArrowRight } from 'lucide-react';
import { useBlogPosts } from '@/hooks/useBlogPosts';

const BlogSection = () => {
  const { data: blogPosts = [] } = useBlogPosts();

  return (
    <section id="blog" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="px-8 py-4 rounded-full bg-gradient-to-r from-primary to-secondary">
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Blog
              </h2>
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Insights sobre tecnologia, inteligência artificial, inovação e o
            futuro digital
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {blogPosts.map((post, index) => {
            const formattedDate = new Date(post.date).toLocaleDateString('pt-BR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            });
            
            return (
              <Card
                key={post.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-primary/20 bg-card/80 backdrop-blur-sm animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6 space-y-4">
                  {/* Category Badge */}
                  <div className="flex items-center justify-between">
                    <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary/20 text-primary">
                      {post.category}
                    </span>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formattedDate}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  {/* CTA to LinkedIn */}
                  {post.linkedin_url && (
                    <div className="pt-4 border-t border-border">
                      <Button
                        variant="ghost"
                        className="w-full justify-between group hover:bg-primary/10"
                        onClick={() => window.open(post.linkedin_url, '_blank')}
                      >
                        <span className="flex items-center">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Veja no LinkedIn
                        </span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* RSS Feed Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <h3 className="text-2xl font-bold mb-4">
              Receba conteúdos sobre IA e Tecnologia
            </h3>
            <p className="text-muted-foreground mb-6">
              Inscreva-se para receber artigos, novidades e insights direto no
              seu feed
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              Inscrever-se no Feed RSS
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
