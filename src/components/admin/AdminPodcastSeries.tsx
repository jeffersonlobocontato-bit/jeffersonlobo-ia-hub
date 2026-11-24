import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableCell } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { PodcastSeries } from '@/hooks/usePodcastSeries';
import type { PodcastEpisode } from '@/hooks/usePodcastEpisodes';
import { slugify } from '@/lib/podcast';

const SEM_SERIE = 'sem-serie';

/** Card "Séries": criar série e ver/excluir as existentes. */
export function AdminPodcastSeriesCard({
  series,
  episodes,
  onChange,
}: {
  series: PodcastSeries[];
  episodes: PodcastEpisode[];
  onChange: () => void;
}) {
  const { toast } = useToast();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [salvando, setSalvando] = useState(false);

  const criarSerie = async () => {
    const title = titulo.trim();
    if (!title) return;
    setSalvando(true);
    const { error } = await supabase.from('podcast_series').insert({
      title,
      slug: slugify(title),
      description: descricao.trim() || null,
      position: series.reduce((max, s) => Math.max(max, s.position), 0) + 1,
    });
    setSalvando(false);
    if (error) {
      toast({
        title: 'Não foi possível criar a série',
        description: error.code === '23505' ? 'Já existe uma série com esse nome.' : error.message,
        variant: 'destructive',
      });
      return;
    }
    toast({ title: 'Série criada', description: `Agora vincule os episódios a "${title}" na tabela abaixo.` });
    setTitulo('');
    setDescricao('');
    onChange();
  };

  const excluirSerie = async (serie: PodcastSeries) => {
    if (!confirm(`Excluir a série "${serie.title}"? Os episódios continuam publicados, só ficam sem série.`)) return;
    const { error } = await supabase.from('podcast_series').delete().eq('id', serie.id);
    if (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Série excluída' });
    onChange();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Séries</CardTitle>
        <CardDescription>
          Organize os episódios em séries (temporadas temáticas). Dentro da série, a ordem de escuta é o número do episódio.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-[1fr_1.4fr_auto] md:items-end">
          <div className="space-y-2">
            <Label htmlFor="serie_titulo">Nome da série</Label>
            <Input
              id="serie_titulo"
              value={titulo}
              placeholder="Ex.: Prova de Ganho"
              onChange={(e) => setTitulo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && criarSerie()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="serie_descricao">Descrição (opcional)</Label>
            <Textarea
              id="serie_descricao"
              value={descricao}
              rows={1}
              placeholder="Do que a série trata, em uma frase"
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>
          <Button onClick={criarSerie} disabled={!titulo.trim() || salvando}>
            <Plus className="h-4 w-4 mr-2" /> Criar série
          </Button>
        </div>

        {series.length > 0 ? (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {series.map((s) => {
              const total = episodes.filter((e) => e.series_id === s.id).length;
              return (
                <li key={s.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="min-w-0">
                    <div className="font-medium">{s.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {total} {total === 1 ? 'episódio' : 'episódios'}
                      {s.description ? ` · ${s.description}` : ''}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" aria-label={`Excluir a série ${s.title}`} onClick={() => excluirSerie(s)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma série criada ainda.</p>
        )}
      </CardContent>
    </Card>
  );
}

/** Colunas "Série" e "Nº" de uma linha da tabela de episódios: vincular e numerar. */
export function EpisodeSeriesCells({
  episode,
  series,
  onChange,
}: {
  episode: PodcastEpisode;
  series: PodcastSeries[];
  onChange: () => void;
}) {
  const { toast } = useToast();

  const salvar = async (campos: { series_id?: string | null; episode_number?: number | null }, aviso: string) => {
    const { error } = await supabase.from('podcast_episodes').update(campos).eq('id', episode.id);
    if (error) {
      toast({ title: 'Não foi possível salvar', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: aviso });
    onChange();
  };

  const vincular = (valor: string) => {
    const series_id = valor === SEM_SERIE ? null : valor;
    if (series_id === (episode.series_id ?? null)) return;
    const serie = series.find((s) => s.id === series_id);
    salvar({ series_id }, serie ? `Episódio vinculado à série ${serie.title}` : 'Episódio sem série');
  };

  const numerar = (texto: string) => {
    const n = texto.trim() === '' ? null : Number.parseInt(texto, 10);
    if (n !== null && (!Number.isFinite(n) || n < 1)) {
      toast({ title: 'Número inválido', description: 'Use um número inteiro a partir de 1.', variant: 'destructive' });
      return;
    }
    if (n === (episode.episode_number ?? null)) return;
    salvar({ episode_number: n }, n ? `Episódio numerado como ${n}` : 'Número removido');
  };

  return (
    <>
      <TableCell className="min-w-[170px]">
        <Select value={episode.series_id ?? SEM_SERIE} onValueChange={vincular}>
          <SelectTrigger aria-label={`Série do episódio ${episode.title}`} className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SEM_SERIE}>Sem série</SelectItem>
            {series.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="w-[84px]">
        <Input
          // key: recria o campo quando o número salvo muda (refetch)
          key={`${episode.id}-${episode.episode_number ?? ''}`}
          type="number"
          min={1}
          inputMode="numeric"
          aria-label={`Número do episódio ${episode.title}`}
          className="h-9 w-[72px]"
          defaultValue={episode.episode_number ?? ''}
          onBlur={(e) => numerar(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        />
      </TableCell>
    </>
  );
}
