import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RefreshCw, Trash2 } from 'lucide-react';
import { usePodcastEpisodes } from '@/hooks/usePodcastEpisodes';
import { usePodcastConfig } from '@/hooks/usePodcastConfig';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const AdminPodcastTab = () => {
  const { toast } = useToast();
  const { data: episodes, refetch: refetchEpisodes } = usePodcastEpisodes();
  const { data: config, refetch: refetchConfig } = usePodcastConfig();
  const [syncing, setSyncing] = useState(false);
  const [configData, setConfigData] = useState({
    podcast_title: config?.podcast_title || '',
    podcast_description: config?.podcast_description || '',
    rss_url: config?.rss_url || '',
  });

  const handleSyncRSS = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-podcast-rss');

      if (error) throw error;

      toast({
        title: 'Sincronização concluída',
        description: `${data.episodesSynced} episódios sincronizados`,
      });

      refetchEpisodes();
      refetchConfig();
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      toast({
        title: 'Erro na sincronização',
        description: 'Não foi possível sincronizar o RSS',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleUpdateConfig = async () => {
    try {
      const { error } = await supabase
        .from('podcast_config')
        .update(configData)
        .eq('id', config?.id);

      if (error) throw error;

      toast({
        title: 'Configuração atualizada',
        description: 'As configurações do podcast foram salvas',
      });

      refetchConfig();
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível atualizar as configurações',
        variant: 'destructive',
      });
    }
  };

  const handleToggleEpisode = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('podcast_episodes')
        .update({ active: !active })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Episódio atualizado',
        description: `Episódio ${!active ? 'ativado' : 'desativado'}`,
      });

      refetchEpisodes();
    } catch (error) {
      console.error('Erro ao atualizar episódio:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o episódio',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteEpisode = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este episódio?')) return;

    try {
      const { error } = await supabase
        .from('podcast_episodes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Episódio excluído',
        description: 'O episódio foi removido com sucesso',
      });

      refetchEpisodes();
    } catch (error) {
      console.error('Erro ao excluir episódio:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o episódio',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Podcast</CardTitle>
          <CardDescription>
            Configure o título, descrição e URL do RSS do podcast
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="podcast_title">Título do Podcast</Label>
            <Input
              id="podcast_title"
              value={configData.podcast_title}
              onChange={(e) =>
                setConfigData({ ...configData, podcast_title: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="podcast_description">Descrição</Label>
            <Textarea
              id="podcast_description"
              value={configData.podcast_description}
              onChange={(e) =>
                setConfigData({ ...configData, podcast_description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rss_url">URL do RSS Feed</Label>
            <Input
              id="rss_url"
              value={configData.rss_url}
              onChange={(e) =>
                setConfigData({ ...configData, rss_url: e.target.value })
              }
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleUpdateConfig}>
              Salvar Configurações
            </Button>
            <Button
              onClick={handleSyncRSS}
              disabled={syncing}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Sincronizando...' : 'Sincronizar RSS'}
            </Button>
          </div>

          {config?.last_sync && (
            <p className="text-sm text-muted-foreground">
              Última sincronização:{' '}
              {format(new Date(config.last_sync), "dd/MM/yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Episódios</CardTitle>
          <CardDescription>
            Gerencie os episódios do podcast
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {episodes?.map((episode) => (
                <TableRow key={episode.id}>
                  <TableCell className="font-medium max-w-md truncate">
                    {episode.title}
                  </TableCell>
                  <TableCell>
                    {format(new Date(episode.published_date), 'dd/MM/yyyy', {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>{episode.duration || '-'}</TableCell>
                  <TableCell>
                    <Switch
                      checked={episode.active}
                      onCheckedChange={() =>
                        handleToggleEpisode(episode.id, episode.active)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEpisode(episode.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPodcastTab;