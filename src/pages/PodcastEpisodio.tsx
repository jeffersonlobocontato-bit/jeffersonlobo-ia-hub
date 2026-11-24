import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, Headphones, Play } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { ShareBar } from '@/components/share/ShareBar';
import { usePodcastEpisodes, type PodcastEpisode } from '@/hooks/usePodcastEpisodes';
import { useTrackCTA } from '@/hooks/useTrackCTA';
import {
  PODCAST_NOME,
  SITE_URL,
  linkDeCompartilhamento,
  slugsDosEpisodios,
  versaoDeCompartilhamento,
} from '@/lib/podcast';

const mono = { fontFamily: "'IBM Plex Mono', monospace" };
const semHtml = (t?: string | null) => (t || '').replace(/<[^>]*>/g, '').trim();
const dataCurta = (d: string) => format(new Date(d), 'dd MMM yyyy', { locale: ptBR });

/**
 * /podcast/:slug — página de um episódio: player, compartilhamento (com card do
 * episódio na prévia) e, logo abaixo, a lista dos outros episódios para a pessoa
 * escolher o próximo. Clicar em outro episódio já começa a tocar.
 */
const PodcastEpisodio = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const { data: episodios = [], isLoading } = usePodcastEpisodes();
  const { trackCTA } = useTrackCTA();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [terminou, setTerminou] = useState(false);

  const porSlug = useMemo(() => slugsDosEpisodios(episodios), [episodios]);
  const slugDe = useMemo(() => {
    const m = new Map<string, string>();
    porSlug.forEach((ep, s) => m.set(ep.id, s));
    return m;
  }, [porSlug]);
  const episodio = slug ? porSlug.get(slug) : undefined;
  const outros = episodios.filter((e) => e.id !== episodio?.id);
  const indice = episodio ? episodios.findIndex((e) => e.id === episodio.id) : -1;
  // "Próximo" segue a ordem da lista (do mais novo para o mais antigo) e volta ao começo no fim.
  const proximo: PodcastEpisode | undefined =
    episodios.length > 1 ? episodios[(indice + 1) % episodios.length] : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
    setTerminou(false);
  }, [slug]);

  // Veio de um clique na lista: já começa a tocar (o navegador permite, porque houve clique).
  useEffect(() => {
    if (episodio && (location.state as { tocar?: boolean } | null)?.tocar) {
      audioRef.current?.play().catch(() => {});
    }
  }, [episodio, location.state]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground uppercase font-bold">Carregando...</div>
      </div>
    );
  }

  if (!episodio) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-16 container mx-auto px-5 max-w-[760px] text-center">
          <h1 className="display-title text-3xl mb-4">Episódio não encontrado</h1>
          <Link to="/#podcast" className="text-primary hover:underline">
            Ver todos os episódios de {PODCAST_NOME}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const descricao = semHtml(episodio.description);
  const versao = versaoDeCompartilhamento(episodio.updated_at || episodio.published_date);
  const shareUrl = `${linkDeCompartilhamento(slug!)}${versao ? `?v=${versao}` : ''}`;
  // Mesmo nome que o build grava (scripts/generate-sitemap.ts → writePodcastSharePages).
  const card = `${SITE_URL}/og/podcast-${slug}${versao ? `-${versao}` : ''}.jpg`;

  const episodioLd = {
    '@context': 'https://schema.org',
    '@type': 'PodcastEpisode',
    name: episodio.title,
    description: descricao,
    url: `${SITE_URL}/podcast/${slug}`,
    datePublished: episodio.published_date,
    ...(episodio.episode_number ? { episodeNumber: episodio.episode_number } : {}),
    associatedMedia: { '@type': 'MediaObject', contentUrl: episodio.audio_url },
    partOfSeries: { '@type': 'PodcastSeries', name: PODCAST_NOME, url: `${SITE_URL}/#podcast` },
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${episodio.title} | ${PODCAST_NOME}`.slice(0, 60)}
        description={(descricao || `Episódio do podcast ${PODCAST_NOME}, de Jefferson Lobo.`).slice(0, 160)}
        path={`/podcast/${slug}`}
        ogImage={card}
        jsonLd={[episodioLd]}
      />
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-5 max-w-[760px]">
          <nav aria-label="Breadcrumb" className="mb-6 text-xs">
            <Link to="/" className="text-muted-foreground hover:text-primary uppercase tracking-wider" style={mono}>Home</Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <Link to="/#podcast" className="text-muted-foreground hover:text-primary uppercase tracking-wider" style={mono}>Podcast</Link>
          </nav>

          <header className="mb-6">
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary" style={mono}>
              {PODCAST_NOME}
              {episodio.episode_number ? ` · Episódio ${episodio.episode_number}` : ''}
            </div>
            <h1 className="display-title text-3xl md:text-5xl mb-5 leading-[1.08] tracking-tight">{episodio.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs uppercase tracking-wider text-muted-foreground">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {dataCurta(episodio.published_date)}</span>
              {episodio.duration && (
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {episodio.duration}</span>
              )}
            </div>
          </header>

          <div className="rounded-2xl border border-primary/25 bg-card p-5 mb-6">
            <audio
              ref={audioRef}
              key={episodio.id}
              controls
              preload="metadata"
              className="w-full"
              src={episodio.audio_url}
              onPlay={() => trackCTA('podcast_play', 'podcast_episodio')}
              onEnded={() => setTerminou(true)}
            >
              Seu navegador não suporta o elemento de áudio.
            </audio>
            {terminou && proximo && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                <span className="text-sm text-muted-foreground">Episódio terminado. Quer seguir?</span>
                <Link
                  to={`/podcast/${slugDe.get(proximo.id)}`}
                  state={{ tocar: true }}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <Play className="h-4 w-4" fill="currentColor" /> Ouvir: {proximo.title}
                </Link>
              </div>
            )}
          </div>

          <ShareBar
            className="mb-8"
            shareUrl={shareUrl}
            title={`${episodio.title} · ${PODCAST_NOME}`}
            text={descricao}
            copiedMessage="Link copiado — a prévia mostra o card do episódio"
          />

          {descricao && (
            <p className="text-lg text-foreground/85 leading-relaxed mb-12 whitespace-pre-line">{descricao}</p>
          )}

          {outros.length > 0 && (
            <section aria-labelledby="outros-episodios">
              <h2
                id="outros-episodios"
                className="mb-4 flex items-center gap-2 font-semibold uppercase text-muted-foreground"
                // inline: o h2 global do site (index.css) usa fonte de título grande
                style={{ ...mono, fontSize: 12, lineHeight: 1.5, letterSpacing: '0.2em' }}
              >
                <Headphones className="h-4 w-4 text-primary" /> Escolha o próximo episódio
              </h2>
              <ol className="divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden">
                {outros.map((ep) => (
                  <li key={ep.id}>
                    <Link
                      to={`/podcast/${slugDe.get(ep.id)}`}
                      state={{ tocar: true }}
                      onClick={() => trackCTA('podcast_proximo', 'podcast_episodio')}
                      className={`group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-primary/5 ${proximo?.id === ep.id ? 'bg-primary/[0.04]' : ''}`}
                    >
                      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-primary/40 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Play className="h-4 w-4" fill="currentColor" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">{ep.title}</span>
                        <span className="mt-1 block text-xs text-muted-foreground" style={mono}>
                          {ep.episode_number ? `EP ${ep.episode_number} · ` : ''}
                          {dataCurta(ep.published_date)}
                          {ep.duration ? ` · ${ep.duration}` : ''}
                        </span>
                      </span>
                      {proximo?.id === ep.id && (
                        <span className="hidden sm:inline text-[10px] uppercase tracking-[0.15em] text-primary" style={mono}>Próximo</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PodcastEpisodio;
