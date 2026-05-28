import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { parseSheetRows, type ImportRow } from '@/lib/press-utils';
import { Loader2, Upload } from 'lucide-react';

type Props = { open: boolean; onOpenChange: (o: boolean) => void; onDone: () => void };

export const PressImportDialog = ({ open, onOpenChange, onDone }: Props) => {
  const { toast } = useToast();
  const [listName, setListName] = useState('');
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ inserted: number; updated: number; skipped: number; listName: string } | null>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    setWorkbook(wb);
    setSheetNames(wb.SheetNames);
    const preferred = wb.SheetNames.find(n => /base/i.test(n)) || wb.SheetNames[0];
    pickSheet(wb, preferred);
  };

  const pickSheet = (wb: XLSX.WorkBook, name: string) => {
    setSelectedSheet(name);
    const ws = wb.Sheets[name];
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: null });
    setRows(parseSheetRows(json));
    setResult(null);
  };

  const valid = rows.filter(r => r._errors.length === 0);
  const invalid = rows.length - valid.length;
  const withEmail = valid.filter(r => !!r.email).length;
  const withWhats = valid.filter(r => !!r.whatsapp).length;
  const withBoth = valid.filter(r => !!r.email && !!r.whatsapp).length;
  const onlyEmail = withEmail - withBoth;
  const onlyWhats = withWhats - withBoth;

  const doImport = async () => {
    setImporting(true);
    try {
      // upsert por email (chave única). Para os sem email, insere usando whatsapp como chave única.
      const withEmail = valid.filter(r => r.email);
      const withoutEmail = valid.filter(r => !r.email && r.whatsapp);

      const stripMeta = (r: ImportRow) => {
        const { _row, _errors, ...rest } = r;
        return { ...rest, tags: rest.tags ?? [] };
      };

      let inserted = 0, updated = 0;

      if (withEmail.length) {
        const payload = withEmail.map(stripMeta);
        const { error, data } = await supabase
          .from('press_contacts')
          .upsert(payload as any, { onConflict: 'email', ignoreDuplicates: false })
          .select('id');
        if (error) throw error;
        inserted += data?.length ?? 0;
      }
      if (withoutEmail.length) {
        const payload = withoutEmail.map(stripMeta);
        const { error, data } = await supabase
          .from('press_contacts')
          .upsert(payload as any, { onConflict: 'whatsapp', ignoreDuplicates: false })
          .select('id');
        if (error) throw error;
        updated += data?.length ?? 0;
      }

      setResult({ inserted, updated, skipped: invalid });
      toast({ title: 'Importação concluída', description: `${inserted + updated} contatos processados, ${invalid} ignorados.` });
      onDone();
    } catch (e: any) {
      toast({ title: 'Erro no import', description: e.message, variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>IMPORTAR MAILING DE IMPRENSA</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold uppercase">1. Selecione o arquivo (.xlsx ou .csv)</label>
            <Input type="file" accept=".xlsx,.xls,.csv" onChange={onFile} className="mt-2" />
          </div>

          {sheetNames.length > 1 && (
            <div>
              <label className="text-sm font-bold uppercase">2. Aba da planilha</label>
              <select
                className="mt-2 w-full border border-input rounded-md px-3 py-2 bg-background"
                value={selectedSheet}
                onChange={(e) => workbook && pickSheet(workbook, e.target.value)}
              >
                {sheetNames.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          )}

          {rows.length > 0 && (
            <div className="border-2 border-primary p-4 bg-muted/30 space-y-3">
              <div className="grid grid-cols-3 gap-4 text-center">
                <Stat label="Linhas lidas" value={rows.length} />
                <Stat label="Válidos" value={valid.length} good />
                <Stat label="Inválidos" value={invalid} bad={invalid > 0} />
              </div>
              <div className="border-t border-border pt-3">
                <div className="text-xs font-bold uppercase mb-2 text-muted-foreground">Canais de disparo (entre os válidos)</div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <Channel label="📧 Email" value={withEmail} />
                  <Channel label="📱 WhatsApp" value={withWhats} />
                  <Channel label="📧+📱 Ambos" value={withBoth} />
                  <Channel label="Só email" value={onlyEmail} alt /> 
                </div>
                <div className="grid grid-cols-2 gap-2 text-center text-xs mt-2">
                  <Channel label="Só WhatsApp" value={onlyWhats} alt />
                  <Channel label="Sem nenhum (inválidos)" value={invalid} bad />
                </div>
              </div>
              {invalid > 0 && (
                <details className="text-xs">
                  <summary className="cursor-pointer font-bold uppercase">Ver {invalid} linhas com erro</summary>
                  <ul className="mt-2 space-y-1 max-h-40 overflow-auto">
                    {rows.filter(r => r._errors.length).slice(0, 100).map((r, i) => (
                      <li key={i} className="text-destructive">
                        Linha {r._row}: {r._errors.join('; ')} — {r.veiculo || '(sem veículo)'}
                        {r.telefone && <span className="text-muted-foreground"> · tem telefone fixo: {r.telefone}</span>}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
              <p className="text-xs text-muted-foreground">
                Inválidos = linhas <strong>sem email E sem WhatsApp</strong> (telefone fixo sozinho não permite disparo). Duplicados serão atualizados por email ou WhatsApp.
              </p>
            </div>
          )}

          {result && (
            <div className="border-2 border-primary bg-primary/10 p-3 text-sm">
              ✓ {result.inserted + result.updated} contatos importados/atualizados, {result.skipped} ignorados.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          <Button onClick={doImport} disabled={!valid.length || importing}>
            {importing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            Importar {valid.length} contatos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Stat = ({ label, value, good, bad }: { label: string; value: number; good?: boolean; bad?: boolean }) => (
  <div>
    <div className={`text-2xl font-black ${good ? 'text-primary' : bad ? 'text-destructive' : ''}`}>{value}</div>
    <div className="text-xs uppercase text-muted-foreground">{label}</div>
  </div>
);

const Channel = ({ label, value, alt, bad }: { label: string; value: number; alt?: boolean; bad?: boolean }) => (
  <div className={`border p-2 ${bad ? 'border-destructive bg-destructive/10' : alt ? 'border-border' : 'border-primary bg-primary/10'}`}>
    <div className={`text-lg font-black ${bad ? 'text-destructive' : ''}`}>{value}</div>
    <div className="text-[10px] uppercase text-muted-foreground leading-tight">{label}</div>
  </div>
);
