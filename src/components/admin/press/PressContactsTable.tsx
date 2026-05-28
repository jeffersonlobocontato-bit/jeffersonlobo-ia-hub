import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, Mail, MessageCircle, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import type { PressContact } from '@/lib/press-utils';
import { toCSV } from '@/lib/press-utils';
import { PressImportDialog } from './PressImportDialog';
import { PressContactEditor } from './PressContactEditor';

type Props = {
  selectedIds: Set<string>;
  setSelectedIds: (s: Set<string>) => void;
  contacts: PressContact[];
  reload: () => void;
};

export const PressContactsTable = ({ selectedIds, setSelectedIds, contacts, reload }: Props) => {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [regioesSel, setRegioesSel] = useState<Set<string>>(new Set());
  const [meio, setMeio] = useState<string>('');
  const [municipio, setMunicipio] = useState<string>('');
  const [hasEmail, setHasEmail] = useState(false);
  const [hasWa, setHasWa] = useState(false);
  const [hideOptOut, setHideOptOut] = useState(true);

  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<PressContact | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const regioes = useMemo(() => [...new Set(contacts.map(c => c.regiao).filter(Boolean))].sort() as string[], [contacts]);
  const meios = useMemo(() => [...new Set(contacts.map(c => c.meio).filter(Boolean))].sort() as string[], [contacts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contacts.filter(c => {
      if (regiao && c.regiao !== regiao) return false;
      if (meio && c.meio !== meio) return false;
      if (municipio && !c.municipio?.toLowerCase().includes(municipio.toLowerCase())) return false;
      if (hasEmail && !c.email) return false;
      if (hasWa && !c.whatsapp) return false;
      if (hideOptOut && c.opt_out) return false;
      if (q) {
        const hay = `${c.veiculo} ${c.contato ?? ''} ${c.email ?? ''} ${c.whatsapp ?? ''} ${c.municipio ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [contacts, search, regiao, meio, municipio, hasEmail, hasWa, hideOptOut]);

  const allSelected = filtered.length > 0 && filtered.every(c => selectedIds.has(c.id));
  const toggleAll = () => {
    const next = new Set(selectedIds);
    if (allSelected) filtered.forEach(c => next.delete(c.id));
    else filtered.forEach(c => next.add(c.id));
    setSelectedIds(next);
  };
  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const exportCSV = () => {
    const csv = toCSV(filtered);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `imprensa_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const del = async (id: string) => {
    if (!confirm('Excluir este contato?')) return;
    const { error } = await supabase.from('press_contacts').delete().eq('id', id);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Contato excluído' }); reload(); }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs uppercase font-bold">Buscar</label>
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="veículo, contato, email..." />
          </div>
          <div>
            <label className="text-xs uppercase font-bold">Região</label>
            <select className="h-10 border border-input rounded-md px-2 bg-background" value={regiao} onChange={e => setRegiao(e.target.value)}>
              <option value="">Todas</option>
              {regioes.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase font-bold">Meio</label>
            <select className="h-10 border border-input rounded-md px-2 bg-background" value={meio} onChange={e => setMeio(e.target.value)}>
              <option value="">Todos</option>
              {meios.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase font-bold">Município</label>
            <Input className="w-40" value={municipio} onChange={e => setMunicipio(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-wrap gap-4 items-center text-sm">
          <label className="flex items-center gap-2"><Checkbox checked={hasEmail} onCheckedChange={v => setHasEmail(!!v)} /> Com email</label>
          <label className="flex items-center gap-2"><Checkbox checked={hasWa} onCheckedChange={v => setHasWa(!!v)} /> Com WhatsApp</label>
          <label className="flex items-center gap-2"><Checkbox checked={hideOptOut} onCheckedChange={v => setHideOptOut(!!v)} /> Esconder opt-out</label>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={() => { setEditing(null); setEditorOpen(true); }}><Plus className="w-4 h-4 mr-1" />Novo</Button>
            <Button size="sm" variant="outline" onClick={() => setImportOpen(true)}><Upload className="w-4 h-4 mr-1" />Importar</Button>
            <Button size="sm" variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-1" />CSV</Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground flex gap-4">
          <span><strong>{filtered.length}</strong> de {contacts.length} contatos</span>
          <span><strong>{selectedIds.size}</strong> selecionados</span>
          <span><Mail className="w-3 h-3 inline" /> {filtered.filter(c => c.email).length} c/ email</span>
          <span><MessageCircle className="w-3 h-3 inline" /> {filtered.filter(c => c.whatsapp).length} c/ WhatsApp</span>
        </div>
      </Card>

      {/* Tabela */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-sm">
            <thead className="bg-muted sticky top-0 z-10">
              <tr>
                <th className="p-2 text-left"><Checkbox checked={allSelected} onCheckedChange={toggleAll} /></th>
                <th className="p-2 text-left uppercase text-xs">Veículo</th>
                <th className="p-2 text-left uppercase text-xs">Contato</th>
                <th className="p-2 text-left uppercase text-xs">Meio</th>
                <th className="p-2 text-left uppercase text-xs">Município</th>
                <th className="p-2 text-left uppercase text-xs">Região</th>
                <th className="p-2 text-left uppercase text-xs">Email</th>
                <th className="p-2 text-left uppercase text-xs">WhatsApp</th>
                <th className="p-2 text-left uppercase text-xs">Status</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-t hover:bg-muted/40">
                  <td className="p-2"><Checkbox checked={selectedIds.has(c.id)} onCheckedChange={() => toggleOne(c.id)} /></td>
                  <td className="p-2 font-medium">{c.veiculo}</td>
                  <td className="p-2">{c.contato ?? <span className="text-muted-foreground italic">redação</span>}</td>
                  <td className="p-2">{c.meio && <Badge variant="outline">{c.meio}</Badge>}</td>
                  <td className="p-2">{c.municipio}</td>
                  <td className="p-2 text-xs">{c.regiao}</td>
                  <td className="p-2 text-xs">{c.email}</td>
                  <td className="p-2 text-xs">{c.whatsapp}</td>
                  <td className="p-2">{c.opt_out && <Badge variant="destructive">opt-out</Badge>}</td>
                  <td className="p-2 flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => { setEditing(c); setEditorOpen(true); }}><Pencil className="w-3 h-3" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => del(c.id)}><Trash2 className="w-3 h-3" /></Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="p-8 text-center text-muted-foreground">Nenhum contato encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <PressImportDialog open={importOpen} onOpenChange={setImportOpen} onDone={reload} />
      <PressContactEditor open={editorOpen} onOpenChange={setEditorOpen} contact={editing} onSaved={reload} />
    </div>
  );
};
