import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight } from 'lucide-react';

type Release = {
  id: string;
  nome: string;
  titulo: string | null;
  corpo: string;
  media_url: string | null;
  media_tipo: 'imagem' | 'video' | 'nenhum';
  link_destino: string | null;
  created_at: string;
};

const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://jeffersonlobo.tech';

const PressReleaseOG = () => {
  const { slug } = useParams<{ slug: string }>();
  const [release, setRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data, error } = await supabase.rpc('get_press_release_og', { p_slug: slug });
      if (error || !data || data.length === 0) {
        setNotFound(true);
      } else {
        setRelease(data[0] as Release);
        // tracker leve
        try {
          await supabase.from('cta_events').insert({
            cta_name: 'press_release_view',
            cta_location: 'press_release_og_page',
            page_path: `/imprensa/r/${slug}`,
            session_id: crypto.randomUUID(),
          });
        } catch { /* ignore */ }
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !release) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <h1 className="text-4xl mb-4">Release não encontrado</h1>
        <p className="text-muted-foreground mb-6">O link pode ter expirado ou ser inválido.</p>
        <Link to="/imprensa"><Button>Ir para Sala de Imprensa</Button></Link>
      </div>
    );
  }

  const titulo = release.titulo || release.nome;
  const description = stripHtml(release.corpo).slice(0, 200);
  const ogImage = release.media_tipo === 'imagem' ? release.media_url : null;
  const pageUrl = `${SITE_URL}/imprensa/r/${slug}`;

  return (
    <>
      <Helmet>
        <title>{titulo} — Jefferson Lobo</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={pageUrl} />
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={titulo} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={pageUrl} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        {ogImage && <meta property="og:image:width" content="1200" />}
        {ogImage && <meta property="og:image:height" content="630" />}
        {/* Twitter */}
        <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
        <meta name="twitter:title" content={titulo} />
        <meta name="twitter:description" content={description} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
      </Helmet>

      <article className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border bg-card py-3 px-6">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <Link to="/" className="font-serif text-lg text-foreground">Jefferson Lobo</Link>
            <Link to="/imprensa" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground underline underline-offset-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Sala de Imprensa</Link>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-6 py-10">
          <h1 className="text-4xl md:text-5xl leading-tight mb-6">{titulo}</h1>

          {release.media_tipo === 'imagem' && release.media_url && (
            <img
              src={release.media_url}
              alt={titulo}
              className="w-full mb-8 rounded-lg border border-border shadow-md"
            />
          )}
          {release.media_tipo === 'video' && release.media_url && (
            <video
              src={release.media_url}
              controls
              className="w-full mb-8 rounded-lg border border-border shadow-md"
            />
          )}

          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: release.corpo }}
          />

          <div className="mt-12 border-t border-border pt-8 flex flex-col md:flex-row gap-4">
            {release.link_destino && (
              <a href={release.link_destino} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button size="lg" className="w-full">
                  Acessar conteúdo completo <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            )}
            <Link to="/imprensa" className="flex-1">
              <Button size="lg" variant="outline" className="w-full">
                Falar com Jefferson
              </Button>
            </Link>
          </div>
        </div>
      </article>
    </>
  );
};

function stripHtml(html: string): string {
  if (typeof document === 'undefined') return html.replace(/<[^>]+>/g, '');
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
}

export default PressReleaseOG;
