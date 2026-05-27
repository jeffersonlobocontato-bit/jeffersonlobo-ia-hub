import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, ExternalLink, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { isInternalPost, extractFirstParagraph } from '@/lib/blog-utils';

const SITE_URL = 'https://jeffersonlobo.tech';

const BlogIndex = () => {
  const { data: posts = [] } = useBlogPosts();

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const blogListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Blog Jefferson Lobo',
    url: `${SITE_URL}/blog`,
    blogPost: posts.map((p: any) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: `${SITE_URL}/blog/${p.slug}`,
      datePublished: p.published_at || p.date,
      image: p.cover_image || undefined,
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Blog — Jefferson Lobo | IA, Tecnologia e Inovação</title>
        <meta
          name="description"
          content="Artigos, análises e insights sobre Inteligência Artificial, tecnologia e o futuro do trabalho por Jefferson Lobo."
        />
        <link rel="canonical" href={`${SITE_URL}/blog`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Blog — Jefferson Lobo" />
        <meta property="og:description" content="Insights sobre IA, tecnologia e inovação." />
        <meta property="og:url" content={`${SITE_URL}/blog`} />
        <script type="application/ld+json">{JSON.stringify(blogListJsonLd)}</script>
      </Helmet>

      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <header className="text-center mb-12">
            <div className="section-kicker mb-4">Conteúdo</div>
            <h1 className="display-title text-4xl md:text-6xl mb-4">Blog</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Insights sobre Inteligência Artificial, tecnologia e o futuro digital.
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {posts.map((post: any) => {
              const internal = isInternalPost(post);
              const date = new Date(post.date).toLocaleDateString('pt-BR', {
                day: 'numeric', month: 'long', year: 'numeric',
              });
              const lead = internal ? extractFirstParagraph(post.content_md) : post.excerpt;
              const Wrapper: any = internal ? Link : 'a';
              const wrapperProps = internal
                ? { to: `/blog/${post.slug}` }
                : { href: post.linkedin_url, target: '_blank', rel: 'noopener noreferrer' };

              return (
                <Card key={post.id} className="overflow-hidden hover:-translate-y-1 transition-transform">
                  <Wrapper {...wrapperProps} className="block no-underline">
                    {post.cover_image && (
                      <img
                        src={post.cover_image}
                        alt={post.cover_alt || post.title}
                        className="w-full aspect-video object-cover"
                        loading="lazy"
                      />
                    )}
                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-3 py-1 border border-primary/30 bg-primary/10 text-primary font-bold uppercase">
                          {post.category}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="w-3 h-3" /> {date}
                        </span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-black uppercase leading-tight">
                        {post.title}
                      </h2>
                      <p className="text-muted-foreground leading-relaxed line-clamp-3">{lead}</p>
                      <div className="pt-2 inline-flex items-center gap-2 font-bold uppercase text-sm text-primary">
                        {internal ? (
                          <>Ler artigo completo <ArrowRight className="w-4 h-4" /></>
                        ) : (
                          <><ExternalLink className="w-4 h-4" /> Veja no LinkedIn</>
                        )}
                      </div>
                    </div>
                  </Wrapper>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogIndex;
