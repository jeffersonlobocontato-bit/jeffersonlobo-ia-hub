import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SEO } from '@/components/SEO';
import { clip, DEFAULT_OG_IMAGE, PERSON_LD } from '@/lib/seo';
import { Calendar, Clock, Tag, ArrowLeft, Share2 } from 'lucide-react';
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useBlogPost, useRelatedPosts } from '@/hooks/useBlogPost';
import { BlogContent } from '@/components/blog/BlogContent';
import { BlogInlineCTA } from '@/components/blog/BlogInlineCTA';
import { BlogTOC } from '@/components/blog/BlogTOC';
import { BlogFAQ, type FAQItem } from '@/components/blog/BlogFAQ';
import { ReadingProgress } from '@/components/blog/ReadingProgress';
import { calcReadingMinutes, isInternalPost } from '@/lib/blog-utils';
import { useTrackCTA } from '@/hooks/useTrackCTA';
import { ShareBar } from '@/components/share/ShareBar';
import { versaoDeCompartilhamento } from '@/lib/podcast';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const SITE_URL = 'https://jeffersonlobo.tech';



const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useBlogPost(slug);
  const { data: related = [] } = useRelatedPosts(slug, post?.category);
  const { trackCTA } = useTrackCTA();

  useEffect(() => {
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
  const seoTitle = post.seo_title || post.title;
  const seoDescription = post.seo_description || post.excerpt;
  const readingMin = post.reading_minutes || calcReadingMinutes(post.content_md);
  const published = new Date(post.published_at || post.date).toISOString();
  const updated = new Date(post.updated_at || post.published_at || post.date).toISOString();
  const formattedDate = new Date(post.date).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const wordCount = (post.content_md || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`~\-\[\]()!]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;

  const faqItems: FAQItem[] = Array.isArray((post as any).faq)
    ? ((post as any).faq as FAQItem[]).filter((f) => f?.q?.trim() && f?.a?.trim())
    : [];

  const tldr = (post.excerpt || post.subtitle || '').trim();

  // "curadoria" = conteúdo do pipeline "Vozes que Importam", não escrito pelo Jefferson —
  // autor (schema, meta tag e assinatura visível) precisa refletir isso corretamente.
  const isCuradoria = post.author_kind === 'curadoria';
  const authorName = isCuradoria ? 'Vozes que Importam' : 'Jefferson Lobo';

  const articleJsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: seoDescription,
    image: [post.cover_image || DEFAULT_OG_IMAGE],
    datePublished: published,
    dateModified: updated,
    author: isCuradoria
      ? { '@type': 'Organization', name: authorName }
      : PERSON_LD,
    publisher: {
      '@type': 'Organization',
      name: 'Jefferson Lobo',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.ico` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: (post.tags || []).join(', '),
    articleSection: post.category,
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    wordCount: wordCount || undefined,
    about: (post.tags || []).slice(0, 8).map((t: string) => ({ '@type': 'Thing', name: t })),
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-tldr]'],
    },
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

  const faqJsonLd = faqItems.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }
    : null;

  // URL de compartilhamento: arquivo estático public/noticia/{slug}.html, com title/
  // og:image (a capa) e og:description prontos pra WhatsApp/LinkedIn, que não executam
  // JS e não veem as tags que o react-helmet-async injeta na rota /blog/:slug.
  // O arquivo é gerado a cada build (scripts/generate-sitemap.ts) para todo post ativo,
  // e também na publicação pelo pipeline (_shared/publish-noticia-html.ts).
  // O ?v= muda quando o post é atualizado (capa nova, título novo): o WhatsApp guarda
  // a prévia por URL, então sem isso continuaria mostrando a capa antiga.
  const versao = versaoDeCompartilhamento(post.updated_at || post.date);
  const shareUrl = `${SITE_URL}/noticia/${post.slug}.html${versao ? `?v=${versao}` : ''}`;
  const sharePayload = encodeURIComponent(`${post.title}\n\n${shareUrl}`);


  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={clip(seoTitle, 60)}
        description={clip(seoDescription, 160)}
        path={`/blog/${post.slug}`}
        ogType="article"
        ogImage={post.cover_image || DEFAULT_OG_IMAGE}
        jsonLd={[articleJsonLd, breadcrumbJsonLd, faqJsonLd].filter(Boolean) as object[]}
      />
      <Helmet>
        {post.tags && post.tags.length > 0 && (
          <meta name="keywords" content={post.tags.join(', ')} />
        )}
        <meta property="article:published_time" content={published} />
        <meta property="article:modified_time" content={updated} />
        <meta property="article:author" content={authorName} />
        <meta property="article:section" content={post.category} />
        {(post.tags || []).map((t) => (
          <meta key={t} property="article:tag" content={t} />
        ))}
      </Helmet>

      <ReadingProgress />
      <Header />

      <main className="pt-24 pb-16">
        <article className="container mx-auto px-5 max-w-[680px]">
          <nav aria-label="Breadcrumb" className="mb-6 text-xs">
            <Link to="/" className="text-muted-foreground hover:text-primary uppercase tracking-wider" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Home</Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <Link to="/blog" className="text-muted-foreground hover:text-primary uppercase tracking-wider" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Blog</Link>
          </nav>

          <header className="mb-8">
            <div className="mb-5">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary border-b border-primary pb-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                {post.category}
              </span>
            </div>
            <h1 className="display-title text-3xl md:text-5xl lg:text-6xl mb-6 leading-[1.05] tracking-tight">
              {post.title}
            </h1>
            {post.subtitle && (
              <p className="font-sans text-xl md:text-2xl text-foreground/85 leading-snug font-light mb-6">
                {post.subtitle}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs uppercase tracking-wider text-muted-foreground border-t border-b border-border py-3">
              <span className="font-bold text-foreground">{authorName}</span>
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
          <ShareBar
            className="mb-8"
            shareUrl={shareUrl}
            title={post.title}
            text={post.excerpt}
            copiedMessage="Link copiado — este link puxa título e capa da matéria"
          />


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

          {/* TL;DR — bloco para LLMs absorverem resumo objetivo no topo */}
          {tldr && (
            <aside
              data-tldr
              aria-label="Resumo do artigo"
              className="mb-8 border-l-4 border-primary bg-muted/50 p-5"
            >
              <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary mb-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                TL;DR — Em resumo
              </div>
              <p className="text-base md:text-lg leading-relaxed text-foreground/90 m-0">
                {tldr}
              </p>
            </aside>
          )}

          {post.content_md && <BlogTOC content={post.content_md} />}

          {post.content_md && <BlogContent content={post.content_md} slug={post.slug} />}

          {faqItems.length > 0 && <BlogFAQ faq={faqItems} />}

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-10 pt-6 border-t border-border">
              <Tag className="w-4 h-4 text-muted-foreground" />
              {post.tags.map((t) => (
                <span key={t} className="rounded-full px-2 py-1 bg-muted text-xs font-medium uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{t}</span>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Share2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Compartilhar:</span>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium border-b border-foreground/40 hover:text-primary hover:border-primary"
            >
              LinkedIn
            </a>
            <a
              href={`https://wa.me/?text=${sharePayload}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium border-b border-foreground/40 hover:text-primary hover:border-primary"
            >
              WhatsApp
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${sharePayload}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium border-b border-foreground/40 hover:text-primary hover:border-primary"
            >
              X
            </a>
          </div>

          <div className="mt-10">
            <BlogInlineCTA type="maturidade" slug={post.slug} />
          </div>

          <Link
            to="/blog"
            className="inline-flex items-center gap-2 mt-6 text-sm font-medium hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao blog
          </Link>
        </article>

        {related.length > 0 && (
          <section className="container mx-auto px-4 max-w-5xl mt-20">
            <h2 className="text-2xl md:text-3xl mb-6">Leia também</h2>
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
                      <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{r.category}</div>
                      <h3 className="text-lg leading-tight group-hover:text-primary">
                        {r.title}
                      </h3>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="relative overflow-hidden py-20 sm:py-24 mt-20 border-y border-border">
          <div className="container mx-auto px-5 relative z-10">
            <div className="mx-auto max-w-3xl text-center space-y-6">
              <span className="section-kicker">Palestras e consultoria</span>
              <h2 className="display-title text-3xl sm:text-4xl md:text-5xl">
                Palestrante de Inteligência Artificial para empresas, líderes e eventos corporativos em todo o Brasil.
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Referência em IA aplicada a negócios, liderança, produtividade, governança e transformação organizacional.
              </p>
              <Button
                size="lg"
                asChild
                className="text-base px-8 py-6"
                onClick={() => trackCTA('blog_palestrante_whatsapp', `blog_${post.slug}`)}
              >
                <a
                  href="https://wa.me/5545999864213?text=Ol%C3%A1%2C%20Jefferson!%20Li%20um%20artigo%20no%20seu%20blog%20e%20quero%20saber%20mais%20sobre%20palestras%20de%20IA."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Falar com Jefferson no WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
