import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, Upload, ArrowUp, ArrowDown } from 'lucide-react';

type Format = {
  id: string;
  slug: string;
  title: string;
  kicker: string | null;
  description: string;
  audience: string | null;
  duration: string | null;
  deliverables: string[] | null;
  icon: string | null;
  cta_label: string | null;
  display_order: number;
  active: boolean | null;
  image_url: string | null;
  image_position: string | null;
};

const POSITION_PRESETS = [
  { label: 'Centro', value: 'center' },
  { label: 'Topo (mostrar cabeças)', value: 'center top' },
  { label: 'Topo esquerda', value: 'left top' },
  { label: 'Topo direita', value: 'right top' },
  { label: 'Base', value: 'center bottom' },
  { label: 'Esquerda', value: 'left center' },
  { label: 'Direita', value: 'right center' },
];

const AdminPalestrasTab = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Format[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('palestra_formats')
      .select('*')
      .order('display_order');
    if (error) toast({ title: 'Erro ao carregar', description: error.message, variant: 'destructive' });
    setItems((data ?? []) as unknown as Format[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const update = (id: string, patch: Partial<Format>) =>
    setItems((p) => p.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const save = async (item: Format) => {
    const { error } = await supabase.from('palestra_formats').update({
      slug: item.slug,
      title: item.title,
      kicker: item.kicker,
      description: item.description,
      audience: item.audience,
      duration: item.duration,
      deliverables: item.deliverables,
      icon: item.icon,
      cta_label: item.cta_label,
      display_order: item.display_order,
      active: item.active,
      image_url: item.image_url,
      image_position: item.image_position,
    }).eq('id', item.id);
    if (error) toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    else toast({ title: 'Formato salvo!' });
  };

  const remove = async (id: string) => {
    if (!confirm('Remover este formato?')) return;
    const { error } = await supabase.from('palestra_formats').delete().eq('id', id);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Removido' }); load(); }
  };

  const add = async () => {
    const maxOrder = items.length ? Math.max(...items.map((i) => i.display_order)) : 0;
    const { error } = await supabase.from('palestra_formats').insert({
      slug: `novo-formato-${Date.now()}`,
      title: 'Novo formato',
      description: 'Descrição do formato',
      display_order: maxOrder + 1,
      active: true,
      icon: 'Mic',
      cta_label: 'Quero conversar',
      deliverables: [],
    });
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Formato criado' }); load(); }
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    const a = items[idx];
    const b = items[target];
    await Promise.all([
      supabase.from('palestra_formats').update({ display_order: b.display_order }).eq('id', a.id),
      supabase.from('palestra_formats').update({ display_order: a.display_order }).eq('id', b.id),
    ]);
    load();
  };

  const uploadFile = async (item: Format, file: File) => {
    setUploadingId(item.id);
    const ext = file.name.split('.').pop();
    const path = `palestra-${item.id}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('stage-photos')
      .upload(path, file, { upsert: true, cacheControl: '3600' });
    if (upErr) {
      toast({ title: 'Erro no upload', description: upErr.message, variant: 'destructive' });
      setUploadingId(null);
      return;
    }
    const { data: pub } = supabase.storage.from('stage-photos').getPublicUrl(path);
    await supabase.from('palestra_formats').update({ image_url: pub.publicUrl }).eq('id', item.id);
    toast({ title: 'Imagem enviada' });
    setUploadingId(null);
    load();
  };

  if (loading) return <div className="text-muted-foreground">Carregando formatos...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Formatos de Palestra</h2>
          <p className="text-sm text-muted-foreground">
            Cards da seção "Leve a conversa de IA para dentro da sua empresa".
          </p>
        </div>
        <Button size="sm" onClick={add}><Plus className="w-4 h-4 mr-2" />Adicionar formato</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {items.map((item, idx) => (
          <Card key={item.id} className="p-4 space-y-3">
            <div className="flex gap-3">
              <div className="w-32 h-32 shrink-0 border border-border bg-muted/40 overflow-hidden flex items-center justify-center">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-muted-foreground text-center px-2">Sem imagem</span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs text-muted-foreground">Ordem #{item.display_order}</div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="outline" disabled={idx === 0} onClick={() => move(idx, -1)}>
                      <ArrowUp className="w-3 h-3" />
                    </Button>
                    <Button size="icon" variant="outline" disabled={idx === items.length - 1} onClick={() => move(idx, 1)}>
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
                  <span>Ativo</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Kicker (etiqueta)</Label>
                <Input value={item.kicker ?? ''} onChange={(e) => update(item.id, { kicker: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Ícone (Lucide)</Label>
                <Input value={item.icon ?? ''} onChange={(e) => update(item.id, { icon: e.target.value })} placeholder="Mic, Users, Briefcase..." />
              </div>
            </div>

            <div>
              <Label className="text-xs">Título</Label>
              <Input value={item.title} onChange={(e) => update(item.id, { title: e.target.value })} />
            </div>

            <div>
              <Label className="text-xs">Descrição</Label>
              <Textarea rows={3} value={item.description} onChange={(e) => update(item.id, { description: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Público</Label>
                <Input value={item.audience ?? ''} onChange={(e) => update(item.id, { audience: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Duração</Label>
                <Input value={item.duration ?? ''} onChange={(e) => update(item.id, { duration: e.target.value })} />
              </div>
            </div>

            <div>
              <Label className="text-xs">Entregáveis (um por linha)</Label>
              <Textarea
                rows={3}
                value={(item.deliverables ?? []).join('\n')}
                onChange={(e) => update(item.id, { deliverables: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">CTA</Label>
                <Input value={item.cta_label ?? ''} onChange={(e) => update(item.id, { cta_label: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Slug</Label>
                <Input value={item.slug} onChange={(e) => update(item.id, { slug: e.target.value })} />
              </div>
            </div>

            <div>
              <Label className="text-xs">URL da imagem</Label>
              <Input value={item.image_url ?? ''} onChange={(e) => update(item.id, { image_url: e.target.value })} placeholder="/palco/... ou https://..." />
            </div>

            <Button size="sm" className="w-full" onClick={() => save(item)}>
              Salvar alterações
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminPalestrasTab;
