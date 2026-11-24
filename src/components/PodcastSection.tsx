import { Play, Calendar, Clock, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePodcastEpisodes } from '@/hooks/usePodcastEpisodes';
import { usePodcastConfig } from '@/hooks/usePodcastConfig';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { useTrackCTA } from '@/hooks/useTrackCTA';
import { PODCAST_NOME, linkDeCompartilhamento, slugsDosEpisodios, versaoDeCompartilhamento } from '@/lib/podcast';

// Compartilha o link estático do episódio (a prévia mostra o card com o título e o nome do canal).
function compartilharEpisodio(titulo: string, url: string) {
  if (typeof navigator.share === 'function') {
    navigator.share({ title: `${titulo} · ${PODCAST_NOME}`, url }).catch(() => {});
    return;
  }
  navigator.clipboard.writeText(url);
  toast.success('Link copiado — a prévia mostra o card do episódio');
}

const PodcastSection = () => {
  const { data: episodes, isLoading: episodesLoading } = usePodcastEpisodes();
  const { data: config, isLoading: configLoading } = usePodcastConfig();
  const { trackCTA } = useTrackCTA();

  if (episodesLoading || configLoading) {
    return (
      <section id="podcast" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!episodes || episodes.length === 0) {
    return null;
  }

  const slugDe = new Map<string, string>();
  slugsDosEpisodios(episodes).forEach((ep, slug) => slugDe.set(ep.id, slug));

  return (
    <section id="podcast" className="bg-muted/20 py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <div className="section-kicker mb-4">Podcast</div>
          <h2 className="display-title text-3xl md:text-4xl mb-4 text-primary">
            O Código Lobo
          </h2>
          {config?.podcast_description && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {config.podcast_description}
            </p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {episodes.map((episode) => (
            <Card key={episode.id} className="group transition-all duration-300 hover:-translate-y-1 border-primary/20 bg-card">
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                  <Link to={`/podcast/${slugDe.get(episode.id)}`}>{episode.title}</Link>
                </CardTitle>
                <CardDescription className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(episode.published_date), 'dd MMM yyyy', { locale: ptBR })}
                  </span>
                  {episode.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {episode.duration}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {episode.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {episode.description.replace(/<[^>]*>/g, '')}
                  </p>
                )}
                <audio
                  controls
                  className="w-full"
                  preload="metadata"
                  src={episode.audio_url}
                  onPlay={() => trackCTA('podcast_play', 'podcast_section')}
                >
                  Seu navegador não suporta o elemento de áudio.
                </audio>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                    asChild
                  >
                    <Link
                      to={`/podcast/${slugDe.get(episode.id)}`}
                      onClick={() => trackCTA('podcast_listen', 'podcast_section')}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Abrir episódio
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={`Compartilhar o episódio ${episode.title}`}
                    onClick={() => {
                      const slug = slugDe.get(episode.id)!;
                      const v = versaoDeCompartilhamento(episode.updated_at || episode.published_date);
                      trackCTA('podcast_share', 'podcast_section');
                      compartilharEpisodio(episode.title, `${linkDeCompartilhamento(slug)}${v ? `?v=${v}` : ''}`);
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PodcastSection;