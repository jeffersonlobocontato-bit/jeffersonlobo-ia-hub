import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Props = {
  value: string;
  onChange: (releaseGroup: string) => void;
  disabled?: boolean;
};

const NEW = '__new__';

export const ReleaseGroupPicker = ({ value, onChange, disabled }: Props) => {
  const [groups, setGroups] = useState<string[]>([]);
  const [mode, setMode] = useState<'new' | 'existing'>('new');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('press_campaigns')
        .select('release_group')
        .eq('tipo', 'whatsapp')
        .not('release_group', 'is', null)
        .order('created_at', { ascending: false })
        .limit(100);
      const uniq = Array.from(new Set((data ?? []).map(r => r.release_group).filter(Boolean) as string[]));
      setGroups(uniq);
    })();
  }, []);

  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase font-bold">Grupo do release (anti-duplicidade)</Label>
      <div className="flex gap-2">
        <Select
          value={mode === 'existing' && value ? value : NEW}
          onValueChange={(v) => {
            if (v === NEW) { setMode('new'); onChange(''); }
            else { setMode('existing'); onChange(v); }
          }}
          disabled={disabled || groups.length === 0}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={groups.length ? 'Selecionar release existente' : 'Sem releases anteriores'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NEW}>+ Novo release</SelectItem>
            {groups.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {mode === 'new' && (
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          placeholder='Ex: "Adjori PR — Mai/26" (deixe vazio para não agrupar)'
        />
      )}
      <p className="text-[11px] text-muted-foreground">
        Campanhas com o mesmo grupo bloqueiam reenvio para o mesmo contato.
      </p>
    </div>
  );
};
