import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Trash2, ArrowUp, ArrowDown, Upload, Plus } from 'lucide-react';

type Logo = {
  id: string;
  name: string;
  logo_url: string | null;
  link: string | null;
  display_order: number;
  active: boolean;
};

const AdminSpeakingLogosTab = () => {
  const { toast } = useToast();
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('speaking_logos')
      .select('*')
      .order('display_order');
    if (error) toast({ title: 'Erro ao carregar', description: error.message, variant: 'destructive' });
    else setLogos((data ?? []) as Logo[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const update = (id: string, patch: Partial<Logo>) =>
    setLogos((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const save = async (logo: Logo) => {
    const { error } = await supabase.from('speaking_logos').update({
      name: logo.name,
      logo_url: logo.logo_url,
      link: logo.link,
      display_order: logo.display_order,
      active: logo.active,
    }).eq('id', logo.id);
    if (error) toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    else toast({ title: 'Marca salva!' });
  };

  const remove = async (id: string) => {
    if (!confirm('Remover esta marca?')) return;
    const { error } = await supabase.from('speaking_logos').delete().eq('id', id);
    if (error) toast({ title: 'Erro ao remover', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Marca removida' }); load(); }
  };

  const add = async () => {
    const maxOrder = logos.length ? Math.max(...logos.map((l) => l.display_order)) : 0;
    const { error } = await supabase.from('speaking_logos').insert({
      name: 'Nova marca',
      display_order: maxOrder + 1,
      active: true,
    });
    if (error) toast({ title: 'Erro ao adicionar', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Marca adicionada' }); load(); }
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= logos.length) return;
    const a = logos[idx];
    const b = logos[target];
    await Promise.all([
      supabase.from('speaking_logos').update({ display_order: b.display_order }).eq('id', a.id),
      supabase.from('speaking_logos').update({ display_order: a.display_order }).eq('id', b.id),
    ]);
    load();
  };

  const upload = async (logo: Logo, file: File) => {
    const ext = file.name.split('.').pop();
    const path = `${logo.id}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('speaking-logos')
      .upload(path, file, { upsert: true, cacheControl: '3600' });
    if (upErr) { toast({ title: 'Erro upload', description: upErr.message, variant: 'destructive' }); return; }
    const { data } = supabase.storage.from('speaking-logos').getPublicUrl(path);
    update(logo.id, { logo_url: data.publicUrl });
    await supabase.from('speaking_logos').update({ logo_url: data.publicUrl }).eq('id', logo.id);
    toast({ title: 'Logo enviado!' });
  };

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Marcas / Logos</h2>
          <p className="text-sm text-muted-foreground">Empresas onde já palestrou ou consultou. Se não houver logo, exibe o nome em texto.</p>
        </div>
        <Button onClick={add}><Plus className="w-4 h-4 mr-2" />Adicionar marca</Button>
      </div>

      <div className="grid gap-4">
        {logos.map((logo, idx) => (
          <Card key={logo.id} className="p-4">
            <div className="grid md:grid-cols-[120px_1fr_auto] gap-4 items-start">
              <div className="flex flex-col items-center gap-2">
                <div className="w-28 h-20 border border-border rounded bg-muted flex items-center justify-center overflow-hidden">
                  {logo.logo_url ? (
                    <img src={logo.logo_url} alt={logo.name} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-xs text-muted-foreground px-2 text-center">{logo.name}</span>
                  )}
                </div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && upload(logo, e.target.files[0])}
                  />
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 border border-border rounded hover:bg-muted">
                    <Upload className="w-3 h-3" />Logo
                  </span>
                </label>
              </div>

              <div className="grid gap-2">
                <div>
                  <Label>Nome</Label>
                  <Input value={logo.name} onChange={(e) => update(logo.id, { name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Link (opcional)</Label>
                    <Input value={logo.link ?? ''} onChange={(e) => update(logo.id, { link: e.target.value })} placeholder="https://..." />
                  </div>
                  <div>
                    <Label>Ordem</Label>
                    <Input type="number" value={logo.display_order} onChange={(e) => update(logo.id, { display_order: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
                <div>
                  <Label>URL do logo (ou faça upload ao lado)</Label>
                  <Input value={logo.logo_url ?? ''} onChange={(e) => update(logo.id, { logo_url: e.target.value })} placeholder="https://..." />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={logo.active} onChange={(e) => update(logo.id, { active: e.target.checked })} />
                  Ativo
                </label>
              </div>

              <div className="flex flex-col gap-2">
                <Button size="sm" onClick={() => save(logo)}>Salvar</Button>
                <Button size="sm" variant="outline" onClick={() => move(idx, -1)} disabled={idx === 0}><ArrowUp className="w-4 h-4" /></Button>
                <Button size="sm" variant="outline" onClick={() => move(idx, 1)} disabled={idx === logos.length - 1}><ArrowDown className="w-4 h-4" /></Button>
                <Button size="sm" variant="destructive" onClick={() => remove(logo.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          </Card>
        ))}
        {logos.length === 0 && <p className="text-muted-foreground text-center py-8">Nenhuma marca cadastrada.</p>}
      </div>
    </div>
  );
};

export default AdminSpeakingLogosTab;
