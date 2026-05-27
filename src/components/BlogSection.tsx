import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ExternalLink, Calendar, ArrowRight } from 'lucide-react';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useTrackCTA } from '@/hooks/useTrackCTA';
import { isInternalPost, extractFirstParagraph } from '@/lib/blog-utils';

const BlogSection = () => {
  const { data: blogPosts = [] } = useBlogPosts();
  const { trackCTA } = useTrackCTA();

  return (
    <section id="blog" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="section-kicker mb-4">Conteúdo</div>
          <h2 className="display-title text-3xl sm:text-4xl md:text-5xl mb-4">Blog</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Insights sobre tecnologia, inteligência artificial, inovação e o
            futuro digital
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
          {blogPosts.map((post: any, index: number) => {
            const internal = isInternalPost(post);
            const formattedDate = new Date(post.date).toLocaleDateString('pt-BR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });
            const lead = internal
              ? extractFirstParagraph(post.content_md, 220)
              : post.excerpt;

            return (
              <Card
                key={post.id}
                className="overflow-hidden transition-all duration-300 hover:-translate-y-2 border-primary/20 bg-card animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {post.cover_image && (
                  <Link
                    to={internal ? `/blog/${post.slug}` : '#'}
                    onClick={(e) => {
                      if (!internal) {
                        e.preventDefault();
                        if (post.linkedin_url) {
                          trackCTA('blog_read_linkedin', 'blog_section');
                          window.open(post.linkedin_url, '_blank');
                        }
                      } else {
                        trackCTA('blog_read_internal', 'blog_section');
                      }
                    }}
                    className="block"
                  >
                    <img
                      src={post.cover_image}
                      alt={post.cover_alt || post.title}
                      className="w-full aspect-video object-cover border-b-2 border-foreground"
                      loading="lazy"
                    />
                  </Link>
                )}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-block px-3 py-1 text-xs font-bold uppercase border border-primary/30 bg-primary/10 text-primary">
                      {post.category}
                    </span>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formattedDate}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black uppercase hover:text-primary transition-colors">
                      {internal ? (
                        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                      ) : (
                        post.title
                      )}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed line-clamp-3">
                      {lead}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border">
                    {internal ? (
                      <Button
                        asChild
                        variant="ghost"
                        className="w-full justify-between group hover:bg-primary/10"
                      >
                        <Link
                          to={`/blog/${post.slug}`}
                          onClick={() => trackCTA('blog_read_internal', 'blog_section')}
                        >
                          <span>Ler artigo completo</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    ) : (
                      post.linkedin_url && (
                        <Button
                          variant="ghost"
                          className="w-full justify-between group hover:bg-primary/10"
                          onClick={() => {
                            trackCTA('blog_read_linkedin', 'blog_section');
                            window.open(post.linkedin_url, '_blank');
                          }}
                        >
                          <span className="flex items-center">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Veja no LinkedIn
                          </span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Button asChild variant="outline" size="lg">
            <Link to="/blog">Ver todos os artigos</Link>
          </Button>
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          <Card className="p-8 text-center bg-card border-primary/20">
            <h3 className="text-2xl font-bold mb-4">
              Receba conteúdos sobre IA e Tecnologia
            </h3>
            <p className="text-muted-foreground mb-6">
              Inscreva-se para receber artigos, novidades e insights direto no
              seu feed
            </p>
            <a
              href="https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7216140554995175424"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center border border-border bg-secondary px-8 py-3 text-base font-bold uppercase text-secondary-foreground transition-colors duration-200 hover:opacity-90"
              onClick={() => trackCTA('newsletter_subscribe', 'blog_section')}
            >
              Assinar no LinkedIn
            </a>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
