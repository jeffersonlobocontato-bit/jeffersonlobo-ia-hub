import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, UserMinus } from 'lucide-react';
import { db } from '@/lib/cursos';

// Leads da Academia (quem baixou um material gratuito na vitrine). A
// exportação em CSV serve para remarketing: e-mail de boas-vindas, lista de
// WhatsApp e públicos personalizados (Meta/Google). Quem pediu para sair
// (revogado) fica fora do CSV.

type Lead = {
  id: string;
  created_at: string;
  nome: string;
  email: string;
  whatsapp: string | null;
  material: string;
  consentimento_em: string;
  politica_versao: string;
  origem: Record<string, string> | null;
  revogado_em: string | null;
};

const data = (iso: string) =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(new Date(iso));

const celula = (v: unknown) => {
  const t = v == null ? '' : String(v);
  return /[",;\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
};

export default function AdminLeadsAcademia() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = async () => {
    setCarregando(true);
    const { data: linhas, error } = await db.from('academia_leads').select('*').order('created_at', { ascending: false }).limit(5000);
    if (error) toast({ title: 'Não carregou os leads', description: error.message, variant: 'destructive' });
    setLeads((linhas as Lead[]) ?? []);
    setCarregando(false);
  };

  useEffect(() => {
    void carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ativos = leads.filter((l) => !l.revogado_em);

  const exportar = () => {
    const cab = ['nome', 'email', 'whatsapp', 'material', 'cadastro', 'consentimento', 'politica', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'referrer'];
    const linhas = ativos.map((l) =>
      [
        l.nome, l.email, l.whatsapp ? `+55${l.whatsapp.replace(/^55(?=\d{10,11}$)/, '')}` : '', l.material, l.created_at, l.consentimento_em, l.politica_versao,
        l.origem?.utm_source, l.origem?.utm_medium, l.origem?.utm_campaign, l.origem?.utm_content, l.origem?.referrer,
      ].map(celula).join(','),
    );
    const blob = new Blob(['﻿' + [cab.join(','), ...linhas].join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `leads-academia-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const revogar = async (l: Lead) => {
    const { error } = await db.from('academia_leads').update({ revogado_em: new Date().toISOString() }).eq('id', l.id);
    if (error) return toast({ title: 'Não salvou', description: error.message, variant: 'destructive' });
    toast({ title: 'Descadastrado', description: `${l.email} sai das próximas exportações.` });
    void carregar();
  };

  return (
    <Card className="p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Leads da Academia</h3>
          <p className="text-sm text-muted-foreground">
            {carregando ? 'Carregando…' : `${ativos.length} ativos de ${leads.length} cadastros (e-book e materiais gratuitos).`}
          </p>
        </div>
        <Button variant="outline" onClick={exportar} disabled={!ativos.length}>
          <Download className="mr-2 h-4 w-4" /> Exportar CSV
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            {leads.slice(0, 50).map((l) => (
              <tr key={l.id} className={`border-t border-border ${l.revogado_em ? 'opacity-50' : ''}`}>
                <td className="py-2 pr-3 whitespace-nowrap tabular-nums">{data(l.created_at)}</td>
                <td className="py-2 pr-3">{l.nome}</td>
                <td className="py-2 pr-3 break-all">{l.email}</td>
                <td className="py-2 pr-3 whitespace-nowrap tabular-nums">{l.whatsapp ?? '—'}</td>
                <td className="py-2 pr-3 text-muted-foreground">{l.origem?.utm_source ?? (l.origem?.referrer ? 'link' : 'direto')}</td>
                <td className="py-2 text-right">
                  {l.revogado_em ? (
                    <span className="text-xs text-muted-foreground">saiu</span>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => revogar(l)} title="Marcar que pediu para sair">
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {!carregando && !leads.length && (
              <tr>
                <td className="py-4 text-muted-foreground">Nenhum lead ainda.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Quem pedir para sair, por e-mail ou WhatsApp, marque aqui: o contato sai das próximas exportações e dos públicos de anúncio na atualização seguinte.
      </p>
    </Card>
  );
}
