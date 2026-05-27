import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, Clock, Tag, ArrowLeft, Share2 } from 'lucide-react';
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useBlogPost, useRelatedPosts } from '@/hooks/useBlogPost';
import { BlogContent } from '@/components/blog/BlogContent';
import { BlogInlineCTA } from '@/components/blog/BlogInlineCTA';
import { ReadingProgress } from '@/components/blog/ReadingProgress';
import { calcReadingMinutes, isInternalPost } from '@/lib/blog-utils';
import { Card } from '@/components/ui/card';

const SITE_URL = 'https://jeffersonlobo.tech';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useBlogPost(slug);
  const { data: related = [] } = useRelatedPosts(slug, post?.category);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground uppercase font-bold">Carregando...</div>
      </div>
    );
  }

  if (error || !post) {
    return <Navigate to="/404" replace />;
  }

  // Post externo sem conteúdo interno → redireciona para LinkedIn
  if (!isInternalPost(post) && post.linkedin_url) {
    window.location.href = post.linkedin_url;
    return null;
  }

  const url = `${SITE_URL}/blog/${post.slug}`;
  const seoTitle = post.seo_title || `${post.title} — Jefferson Lobo`;
  const seoDescription = post.seo_description || post.excerpt;
  const readingMin = post.reading_minutes || calcReadingMinutes(post.content_md);
  const published = new Date(post.published_at || post.date).toISOString();
  const updated = new Date(post.updated_at || post.published_at || post.date).toISOString();
  const formattedDate = new Date(post.date).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.cover_image ? [post.cover_image] : undefined,
    datePublished: published,
    dateModified: updated,
    author: { '@type': 'Person', name: 'Jefferson Lobo', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'Jefferson Lobo',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.ico` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: (post.tags || []).join(', '),
    articleSection: post.category,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  };

  const sharePayload = encodeURIComponent(`${post.title} — ${url}`);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{seoTitle.slice(0, 60)}</title>
        <meta name="description" content={seoDescription.slice(0, 160)} />
        <link rel="canonical" href={url} />
        {post.tags && post.tags.length > 0 && (
          <meta name="keywords" content={post.tags.join(', ')} />
        )}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:url" content={url} />
        {post.cover_image && <meta property="og:image" content={post.cover_image} />}
        <meta property="article:published_time" content={published} />
        <meta property="article:modified_time" content={updated} />
        <meta property="article:author" content="Jefferson Lobo" />
        <meta property="article:section" content={post.category} />
        {(post.tags || []).map((t) => (
          <meta key={t} property="article:tag" content={t} />
        ))}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        {post.cover_image && <meta name="twitter:image" content={post.cover_image} />}
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <ReadingProgress />
      <Header />

      <main className="pt-24 pb-16">
        <article className="container mx-auto px-5 max-w-[680px]">
          <nav aria-label="Breadcrumb" className="mb-6 text-xs">
            <Link to="/" className="text-muted-foreground hover:text-primary uppercase font-bold tracking-wider">Home</Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <Link to="/blog" className="text-muted-foreground hover:text-primary uppercase font-bold tracking-wider">Blog</Link>
          </nav>

          <header className="mb-8">
            <div className="mb-5">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-primary border-b-2 border-primary pb-1">
                {post.category}
              </span>
            </div>
            <h1 className="display-title text-3xl md:text-5xl lg:text-6xl mb-6 leading-[1.05] tracking-tight">
              {post.title}
            </h1>
            {post.subtitle && (
              <p className="font-serif text-xl md:text-2xl text-foreground/85 leading-snug font-light mb-6">
                {post.subtitle}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs uppercase tracking-wider text-muted-foreground border-t border-b border-border py-3">
              <span className="font-bold text-foreground">Jefferson Lobo</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> {formattedDate}
              </span>
              {readingMin > 0 && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {readingMin} min de leitura
                </span>
              )}
            </div>
          </header>

          {post.cover_image && (
            <figure className="mb-10 -mx-5 md:mx-0">
              <img
                src={post.cover_image}
                alt={post.cover_alt || post.title}
                className="w-full aspect-[16/9] object-cover"
                loading="eager"
              />
              {post.cover_alt && (
                <figcaption className="text-xs text-muted-foreground mt-2 px-5 md:px-0 italic">
                  {post.cover_alt}
                </figcaption>
              )}
            </figure>
          )}

          {post.content_md && <BlogContent content={post.content_md} slug={post.slug} />}

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-10 pt-6 border-t-2 border-border">
              <Tag className="w-4 h-4 text-muted-foreground" />
              {post.tags.map((t) => (
                <span key={t} className="px-2 py-1 bg-muted text-xs font-bold uppercase">{t}</span>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Share2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-bold uppercase text-muted-foreground">Compartilhar:</span>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold uppercase border-b-2 border-foreground hover:text-primary"
            >
              LinkedIn
            </a>
            <a
              href={`https://wa.me/?text=${sharePayload}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold uppercase border-b-2 border-foreground hover:text-primary"
            >
              WhatsApp
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${sharePayload}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold uppercase border-b-2 border-foreground hover:text-primary"
            >
              X
            </a>
          </div>

          <div className="mt-10">
            <BlogInlineCTA type="maturidade" slug={post.slug} />
          </div>

          <Link
            to="/blog"
            className="inline-flex items-center gap-2 mt-6 font-bold uppercase text-sm hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao blog
          </Link>
        </article>

        {related.length > 0 && (
          <section className="container mx-auto px-4 max-w-5xl mt-20">
            <h2 className="text-2xl md:text-3xl font-black uppercase mb-6">Leia também</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link key={r.id} to={`/blog/${r.slug}`} className="block group">
                  <Card className="overflow-hidden h-full hover:-translate-y-1 transition-transform">
                    {r.cover_image && (
                      <img
                        src={r.cover_image}
                        alt={r.cover_alt || r.title}
                        className="w-full aspect-video object-cover"
                        loading="lazy"
                      />
                    )}
                    <div className="p-4">
                      <div className="text-xs font-bold uppercase text-primary mb-2">{r.category}</div>
                      <h3 className="text-lg font-black uppercase leading-tight group-hover:text-primary">
                        {r.title}
                      </h3>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
