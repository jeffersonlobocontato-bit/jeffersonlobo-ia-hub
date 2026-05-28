import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { PressContact } from '@/lib/press-utils';
import { normalizeEmail, normalizePhone } from '@/lib/press-utils';

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  contact: PressContact | null;
  onSaved: () => void;
};

export const PressContactEditor = ({ open, onOpenChange, contact, onSaved }: Props) => {
  const { toast } = useToast();
  const [form, setForm] = useState<Partial<PressContact>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(contact ?? { tags: [], opt_out: false });
  }, [contact, open]);

  const update = (k: keyof PressContact, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const save = async () => {
    if (!form.veiculo?.trim()) {
      toast({ title: 'Veículo obrigatório', variant: 'destructive' }); return;
    }
    const email = normalizeEmail(form.email);
    const whatsapp = normalizePhone(form.whatsapp);
    const telefone = normalizePhone(form.telefone);
    if (!email && !whatsapp) {
      toast({ title: 'Informe email ou WhatsApp', variant: 'destructive' }); return;
    }
    setSaving(true);
    const payload: any = {
      regiao: form.regiao || null,
      focal: form.focal || null,
      municipio: form.municipio || null,
      censo_ibge_2022: form.censo_ibge_2022 || null,
      veiculo: form.veiculo.trim(),
      meio: form.meio || null,
      contato: form.contato || null,
      cargo: form.cargo || null,
      telefone, whatsapp, email,
      endereco: form.endereco || null,
      site: form.site || null,
      tags: form.tags || [],
      opt_out: !!form.opt_out,
      notas: form.notas || null,
    };
    const { error } = contact?.id
      ? await supabase.from('press_contacts').update(payload).eq('id', contact.id)
      : await supabase.from('press_contacts').insert(payload);
    setSaving(false);
    if (error) { toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Contato salvo' });
    onSaved(); onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{contact?.id ? 'EDITAR CONTATO' : 'NOVO CONTATO'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Veículo *"><Input value={form.veiculo ?? ''} onChange={e => update('veiculo', e.target.value)} /></Field>
          <Field label="Meio"><Input value={form.meio ?? ''} onChange={e => update('meio', e.target.value)} placeholder="Rádio / TV / Internet" /></Field>
          <Field label="Contato (nome)"><Input value={form.contato ?? ''} onChange={e => update('contato', e.target.value)} /></Field>
          <Field label="Cargo"><Input value={form.cargo ?? ''} onChange={e => update('cargo', e.target.value)} /></Field>
          <Field label="Email"><Input type="email" value={form.email ?? ''} onChange={e => update('email', e.target.value)} /></Field>
          <Field label="WhatsApp"><Input value={form.whatsapp ?? ''} onChange={e => update('whatsapp', e.target.value)} placeholder="5542999999999" /></Field>
          <Field label="Telefone"><Input value={form.telefone ?? ''} onChange={e => update('telefone', e.target.value)} /></Field>
          <Field label="Região"><Input value={form.regiao ?? ''} onChange={e => update('regiao', e.target.value)} /></Field>
          <Field label="Município"><Input value={form.municipio ?? ''} onChange={e => update('municipio', e.target.value)} /></Field>
          <Field label="Focal"><Input value={form.focal ?? ''} onChange={e => update('focal', e.target.value)} /></Field>
          <Field label="Site"><Input value={form.site ?? ''} onChange={e => update('site', e.target.value)} /></Field>
          <Field label="População (IBGE)"><Input type="number" value={form.censo_ibge_2022 ?? ''} onChange={e => update('censo_ibge_2022', e.target.value ? Number(e.target.value) : null)} /></Field>
          <div className="col-span-2">
            <Field label="Endereço"><Input value={form.endereco ?? ''} onChange={e => update('endereco', e.target.value)} /></Field>
          </div>
          <div className="col-span-2">
            <Field label="Tags (separadas por vírgula)">
              <Input value={(form.tags ?? []).join(', ')} onChange={e => update('tags', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Notas">
              <Textarea value={form.notas ?? ''} onChange={e => update('notas', e.target.value)} rows={2} />
            </Field>
          </div>
          <div className="col-span-2 flex items-center justify-between border-t pt-3">
            <Label htmlFor="opt-out">Opt-out (não receber disparos)</Label>
            <Switch id="opt-out" checked={!!form.opt_out} onCheckedChange={(v) => update('opt_out', v)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <Label className="text-xs uppercase font-bold">{label}</Label>
    <div className="mt-1">{children}</div>
  </div>
);
