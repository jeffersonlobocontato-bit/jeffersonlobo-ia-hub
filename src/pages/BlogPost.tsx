import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, Clock, Tag, ArrowLeft, Share2, Link2 } from 'lucide-react';
import { toast } from 'sonner';
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

const shareVersionFromDate = (value?: string | null) => {
  const digits = (value || new Date().toISOString()).replace(/\D/g, '').slice(0, 12);
  return digits || new Date().toISOString().replace(/\D/g, '').slice(0, 8);
};

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

  // URL de compartilhamento: arquivo .html plano e versionado no caminho.
  // Não usamos ?v=2 porque alguns scrapers/caches tratam query string como
  // fallback genérico da SPA e acabam puxando a imagem institucional do site.
  const shareVersion = shareVersionFromDate(post.updated_at || post.published_at || post.date);
  const shareUrl = `${SITE_URL}/noticia/${post.slug}-${shareVersion}.html`;
  const sharePayload = encodeURIComponent(shareUrl);

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

          {/* Barra de compartilhamento — padrão de site de notícia: logo após créditos, antes do conteúdo */}
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mr-1">
              Compartilhar
            </span>
            <a
              aria-label="Compartilhar no WhatsApp"
              href={`https://wa.me/?text=${sharePayload}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center border-2 border-foreground bg-background hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.554-5.338 11.89-11.893 11.89a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </a>
            <a
              aria-label="Compartilhar no LinkedIn"
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center border-2 border-foreground bg-background hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a
              aria-label="Compartilhar no Facebook"
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center border-2 border-foreground bg-background hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a
              aria-label="Compartilhar no X (Twitter)"
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center border-2 border-foreground bg-background hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a
              aria-label="Compartilhar no Telegram"
              href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center border-2 border-foreground bg-background hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.464.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </a>
            <button
              type="button"
              aria-label="Copiar link"
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                toast.success('Link copiado');
              }}
              className="inline-flex h-9 w-9 items-center justify-center border-2 border-foreground bg-background hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Link2 className="h-4 w-4" />
            </button>
          </div>


          {post.cover_image && (
            <figure className="mb-10 -mx-5 md:mx-0">
              <img
                src={post.cover_image}
                alt={post.cover_alt || post.title}
                className="w-full h-auto"
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
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
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
