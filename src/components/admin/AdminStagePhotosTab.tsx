import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, RefreshCw, Upload, ArrowUp, ArrowDown } from 'lucide-react';

type StagePhoto = {
  id: string;
  image_url: string;
  event_name: string | null;
  caption: string | null;
  display_order: number;
  active: boolean | null;
};

const AdminStagePhotosTab = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<StagePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('stage_photos')
      .select('*')
      .order('display_order');
    if (error) toast({ title: 'Erro ao carregar', description: error.message, variant: 'destructive' });
    setItems((data ?? []) as StagePhoto[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const update = (id: string, patch: Partial<StagePhoto>) =>
    setItems((p) => p.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const save = async (item: StagePhoto) => {
    const { error } = await supabase
      .from('stage_photos')
      .update({
        image_url: item.image_url,
        event_name: item.event_name,
        caption: item.caption,
        display_order: item.display_order,
        active: item.active,
      })
      .eq('id', item.id);
    if (error) toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    else toast({ title: 'Foto atualizada' });
  };

  const remove = async (id: string) => {
    if (!confirm('Excluir esta foto da galeria?')) return;
    const { error } = await supabase.from('stage_photos').delete().eq('id', id);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Removida' }); load(); }
  };

  const add = async () => {
    const maxOrder = items.length > 0 ? Math.max(...items.map((i) => i.display_order)) : 0;
    const { error } = await supabase.from('stage_photos').insert({
      image_url: '',
      event_name: 'Novo evento',
      caption: '',
      display_order: maxOrder + 1,
      active: true,
    });
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Foto criada — faça upload da imagem' }); load(); }
  };

  const move = async (id: string, dir: -1 | 1) => {
    const idx = items.findIndex((i) => i.id === id);
    const swap = items[idx + dir];
    if (!swap) return;
    const a = items[idx];
    await Promise.all([
      supabase.from('stage_photos').update({ display_order: swap.display_order }).eq('id', a.id),
      supabase.from('stage_photos').update({ display_order: a.display_order }).eq('id', swap.id),
    ]);
    load();
  };

  const uploadFile = async (item: StagePhoto, file: File) => {
    setUploadingId(item.id);
    const ext = file.name.split('.').pop();
    const path = `${item.id}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('stage-photos')
      .upload(path, file, { upsert: true, cacheControl: '3600' });
    if (upErr) {
      toast({ title: 'Erro no upload', description: upErr.message, variant: 'destructive' });
      setUploadingId(null);
      return;
    }
    const { data: pub } = supabase.storage.from('stage-photos').getPublicUrl(path);
    await supabase.from('stage_photos').update({ image_url: pub.publicUrl }).eq('id', item.id);
    toast({ title: 'Imagem enviada' });
    setUploadingId(null);
    load();
  };

  if (loading) return <div className="text-muted-foreground">Carregando galeria...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Galeria de palco</h2>
          <p className="text-sm text-muted-foreground">
            {items.length} foto(s). Use a ordem para definir o layout assimétrico (1 = destaque).
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4 mr-2" />Recarregar</Button>
          <Button size="sm" onClick={add}><Plus className="w-4 h-4 mr-2" />Adicionar foto</Button>
        </div>
      </div>

      {items.length === 0 && (
        <Card className="p-8 text-center text-muted-foreground">Nenhuma foto cadastrada.</Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {items.map((item, idx) => (
          <Card key={item.id} className="p-4 space-y-3">
            <div className="flex gap-3">
              <div className="w-32 h-32 shrink-0 border border-border bg-muted/40 overflow-hidden flex items-center justify-center">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.event_name ?? ''} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-muted-foreground text-center px-2">Sem imagem</span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs text-muted-foreground">Ordem #{item.display_order}</div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="outline" disabled={idx === 0} onClick={() => move(item.id, -1)}>
                      <ArrowUp className="w-3 h-3" />
                    </Button>
                    <Button size="icon" variant="outline" disabled={idx === items.length - 1} onClick={() => move(item.id, 1)}>
                      <ArrowDown className="w-3 h-3" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => remove(item.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <label className="flex items-center justify-center w-full h-9 border border-dashed border-primary/40 cursor-pointer text-xs hover:bg-primary/5">
                  <Upload className="w-3 h-3 mr-2" />
                  {uploadingId === item.id ? 'Enviando...' : 'Enviar nova imagem'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingId === item.id}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadFile(item, f);
                    }}
                  />
                </label>
                <div className="flex items-center gap-2 text-xs">
                  <Switch checked={!!item.active} onCheckedChange={(v) => update(item.id, { active: v })} />
                  <span>Ativa na galeria</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <Label className="text-xs">URL da imagem</Label>
                <Input
                  value={item.image_url}
                  onChange={(e) => update(item.id, { image_url: e.target.value })}
                  placeholder="/palco/arquivo.png ou https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Nome do evento</Label>
                  <Input
                    value={item.event_name ?? ''}
                    onChange={(e) => update(item.id, { event_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Ordem</Label>
                  <Input
                    type="number"
                    value={item.display_order}
                    onChange={(e) => update(item.id, { display_order: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Legenda</Label>
                <Input
                  value={item.caption ?? ''}
                  onChange={(e) => update(item.id, { caption: e.target.value })}
                  placeholder="Ex.: Keynote para conselho e diretoria"
                />
              </div>
              <Button size="sm" className="w-full" onClick={() => save(item)}>
                Salvar alterações
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminStagePhotosTab;
