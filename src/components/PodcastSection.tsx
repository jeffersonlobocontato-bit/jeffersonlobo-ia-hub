import { Play, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePodcastEpisodes } from '@/hooks/usePodcastEpisodes';
import { usePodcastConfig } from '@/hooks/usePodcastConfig';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { useTrackCTA } from '@/hooks/useTrackCTA';

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

  return (
    <section id="podcast" className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/20">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
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
            <Card key={episode.id} className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                  {episode.title}
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
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                  asChild
                >
                  <a 
                    href={episode.audio_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={() => trackCTA('podcast_listen', 'podcast_section')}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Ouvir Episódio
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PodcastSection;