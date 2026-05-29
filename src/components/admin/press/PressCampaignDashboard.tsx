import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Eye, AlertTriangle, TrendingUp, MapPin, Newspaper, Trophy, History, Download, Info, Save } from 'lucide-react';
import { toast } from 'sonner';

export const CANON_MEIO_OPTIONS = [
  'Rádio', 'TV', 'Jornal Impresso', 'Portal de Notícias',
  'Revista', 'Redes Sociais', 'Podcast', 'Agência',
] as const;

type CampaignStat = {
  campaign_id: string;
  nome: string;
  tipo: string;
  assunto: string | null;
  status: string;
  sent_at: string | null;
  created_at: string;
  total_alvo: number;
  enviados: number;
  erros: number;
  pulados: number;
  aberturas_unicas: number;
  aberturas_totais: number;
};
type SegRow = { campaign_id: string; meio: string; enviados: number; erros: number; aberturas_unicas: number; aberturas_totais: number; };
type RegRow = { campaign_id: string; regiao: string; enviados: number; erros: number; aberturas_unicas: number; aberturas_totais: number; };
type MuniRow = { campaign_id: string; regiao: string; municipio: string; enviados: number; aberturas_unicas: number; aberturas_totais: number; };
type ContactEng = {
  contact_id: string;
  contato: string | null;
  veiculo: string;
  email: string | null;
  meio: string | null;
  regiao: string | null;
  municipio: string | null;
  total_recebidos: number;
  campanhas_abertas: number;
  total_aberturas: number;
  ultima_abertura: string | null;
};
type SendDetail = {
  id: string;
  campaign_id: string;
  contact_id: string;
  status: string;
  error: string | null;
  sent_at: string | null;
  message_id: string | null;
  contact: { contato: string | null; veiculo: string; email: string | null; meio: string | null; regiao: string | null; municipio: string | null; } | null;
  open_count: number;
  first_open: string | null;
  last_open: string | null;
};

const pct = (n: number, d: number) => d > 0 ? `${Math.round((n / d) * 100)}%` : '—';
const fmtDate = (s: string | null) => s ? new Date(s).toLocaleString('pt-BR') : '—';

// Normalização semântica de "meio" -> categorias canônicas.
// Olha primeiro em `meio`; se vazio/desconhecido, faz fallback no `veiculo`.
const _strip = (s: string) => s.toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9\s+&]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

type Canon = 'Rádio' | 'TV' | 'Jornal Impresso' | 'Portal de Notícias' | 'Revista' | 'Redes Sociais' | 'Podcast' | 'Agência';

function _detectCanons(raw: string): Canon[] {
  const t = ` ${_strip(raw)} `;
  const found = new Set<Canon>();
  // Rádio
  if (/\b(radio|fm|am|webradio)\b/.test(t)) found.add('Rádio');
  // TV
  if (/\b(tv|televisao|canal)\b/.test(t)) found.add('TV');
  // Jornal Impresso
  if (/\b(jornal|impresso|periodico)\b/.test(t)) found.add('Jornal Impresso');
  // Revista
  if (/\b(revista|magazine)\b/.test(t)) found.add('Revista');
  // Podcast
  if (/\bpodcast\b/.test(t)) found.add('Podcast');
  // Agência
  if (/\b(agencia|assessoria)\b/.test(t)) found.add('Agência');
  // Redes Sociais
  if (/\b(facebook|fb|instagram|insta|ig|youtube|yt|tiktok|twitter|x|linkedin|telegram|rede social|redes sociais|social)\b/.test(t)) {
    found.add('Redes Sociais');
  }
  // Portal de Notícias (inclui blog/site/web/internet/online/digital/portal)
  if (/\b(portal|site|web|internet|online|digital|blog)\b/.test(t)) found.add('Portal de Notícias');
  return Array.from(found);
}

export function normalizeMeio(meio: string | null | undefined, veiculo?: string | null): string {
  const sources: string[] = [];
  if (meio && meio.trim() && meio.trim() !== '—') sources.push(meio);
  // Fallback: se não detectou nada no meio, tenta no veiculo
  let canons = sources.length ? _detectCanons(sources.join(' ')) : [];
  if (canons.length === 0 && veiculo) canons = _detectCanons(veiculo);

  if (canons.length === 0) {
    const fallback = (meio || veiculo || '').trim();
    return fallback ? `Outros (${fallback})` : 'Outros';
  }

  // Regras de combinação
  if (canons.includes('Rádio')) return 'Rádio';
  if (canons.includes('TV')) return 'TV';
  // Redes Sociais combinado com Portal/Blog vira Redes Sociais
  if (canons.includes('Redes Sociais') && !canons.includes('Jornal Impresso')) return 'Redes Sociais';
  // Jornal Impresso + Portal: conflito real, manter separado
  if (canons.includes('Jornal Impresso') && canons.includes('Portal de Notícias')) {
    return 'Jornal Impresso + Portal';
  }
  if (canons.length === 1) return canons[0];
  // Demais combinações: separar com " + " ordenado
  return canons.slice().sort().join(' + ');
}

export const PressCampaignDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<CampaignStat[]>([]);
  const [segments, setSegments] = useState<SegRow[]>([]);
  const [regions, setRegions] = useState<RegRow[]>([]);
  const [munis, setMunis] = useState<MuniRow[]>([]);
  const [contacts, setContacts] = useState<ContactEng[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all'); // 'all' | campaign_id
  const [openDetail, setOpenDetail] = useState<CampaignStat | null>(null);
  const [openHistory, setOpenHistory] = useState<ContactEng | null>(null);
  const [drillRegion, setDrillRegion] = useState<string | null>(null);
  const [editSegment, setEditSegment] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [c, s, r, m, e] = await Promise.all([
      supabase.from('press_campaign_stats').select('*').order('created_at', { ascending: false }),
      supabase.from('press_segment_stats').select('*'),
      supabase.from('press_region_stats').select('*'),
      supabase.from('press_municipio_stats').select('*'),
      supabase.from('press_contact_engagement').select('*'),
    ]);
    setCampaigns((c.data as CampaignStat[]) ?? []);
    setSegments((s.data as SegRow[]) ?? []);
    setRegions((r.data as RegRow[]) ?? []);
    setMunis((m.data as MuniRow[]) ?? []);
    setContacts((e.data as ContactEng[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const totals = useMemo(() => {
    const enviados = campaigns.reduce((a, c) => a + c.enviados, 0);
    const erros = campaigns.reduce((a, c) => a + c.erros, 0);
    const aberturasUnicas = campaigns.reduce((a, c) => a + c.aberturas_unicas, 0);
    const aberturasTotais = campaigns.reduce((a, c) => a + c.aberturas_totais, 0);
    return {
      campaigns: campaigns.length,
      enviados, erros, aberturasUnicas, aberturasTotais,
      taxaAbertura: pct(aberturasUnicas, enviados),
      taxaErro: pct(erros, enviados + erros),
    };
  }, [campaigns]);

  // Filtros por campanha selecionada
  const segFiltered = useMemo(() => {
    const rows = selectedCampaign === 'all' ? segments : segments.filter(s => s.campaign_id === selectedCampaign);
    const agg = new Map<string, { meio: string; enviados: number; aberturas_unicas: number; aberturas_totais: number }>();
    for (const r of rows) {
      const key = normalizeMeio(r.meio);
      const cur = agg.get(key) ?? { meio: key, enviados: 0, aberturas_unicas: 0, aberturas_totais: 0 };
      cur.enviados += r.enviados;
      cur.aberturas_unicas += r.aberturas_unicas;
      cur.aberturas_totais += r.aberturas_totais;
      agg.set(key, cur);
    }
    return Array.from(agg.values()).sort((a, b) => b.enviados - a.enviados);
  }, [segments, selectedCampaign]);

  const regFiltered = useMemo(() => {
    const rows = selectedCampaign === 'all' ? regions : regions.filter(s => s.campaign_id === selectedCampaign);
    const agg = new Map<string, { regiao: string; enviados: number; aberturas_unicas: number; aberturas_totais: number }>();
    for (const r of rows) {
      const cur = agg.get(r.regiao) ?? { regiao: r.regiao, enviados: 0, aberturas_unicas: 0, aberturas_totais: 0 };
      cur.enviados += r.enviados;
      cur.aberturas_unicas += r.aberturas_unicas;
      cur.aberturas_totais += r.aberturas_totais;
      agg.set(r.regiao, cur);
    }
    return Array.from(agg.values()).sort((a, b) => b.enviados - a.enviados);
  }, [regions, selectedCampaign]);

  const muniDrill = useMemo(() => {
    if (!drillRegion) return [];
    const rows = selectedCampaign === 'all' ? munis : munis.filter(s => s.campaign_id === selectedCampaign);
    const filtered = rows.filter(r => r.regiao === drillRegion);
    const agg = new Map<string, { municipio: string; enviados: number; aberturas_unicas: number; aberturas_totais: number }>();
    for (const r of filtered) {
      const cur = agg.get(r.municipio) ?? { municipio: r.municipio, enviados: 0, aberturas_unicas: 0, aberturas_totais: 0 };
      cur.enviados += r.enviados;
      cur.aberturas_unicas += r.aberturas_unicas;
      cur.aberturas_totais += r.aberturas_totais;
      agg.set(r.municipio, cur);
    }
    return Array.from(agg.values()).sort((a, b) => b.enviados - a.enviados).slice(0, 20);
  }, [munis, drillRegion, selectedCampaign]);

  // Pivot segmento × região
  const pivot = useMemo(() => {
    const segs = Array.from(new Set(segments.map(s => s.meio))).sort();
    const regs = Array.from(new Set(regions.map(r => r.regiao))).sort();
    const muniRows = selectedCampaign === 'all' ? munis : munis.filter(s => s.campaign_id === selectedCampaign);
    // pivot precisa cruzar; reagregar a partir de munis (que tem regiao) e juntar com segmento via contatos.
    // Simplificação: usar segments (meio,campaign) e regions (regiao,campaign) cruzando por campanha.
    // Não temos meio+regiao pré-agregados — recomputar via raw é caro. Usar fallback: matriz vazia.
    return { segs, regs, muniRows };
  }, [segments, regions, munis, selectedCampaign]);

  const topReaders = useMemo(() => {
    return [...contacts]
      .filter(c => c.total_aberturas > 0)
      .sort((a, b) => b.total_aberturas - a.total_aberturas || b.campanhas_abertas - a.campanhas_abertas)
      .slice(0, 30);
  }, [contacts]);

  if (loading) return <div className="text-center py-12 text-muted-foreground">Carregando dashboard…</div>;

  return (
    <div className="space-y-6">
      {/* Cards de visão geral */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={<Mail className="w-4 h-4" />} label="Campanhas" value={totals.campaigns} />
        <StatCard icon={<Mail className="w-4 h-4" />} label="Enviados" value={totals.enviados} />
        <StatCard icon={<Eye className="w-4 h-4" />} label="Aberturas únicas" value={totals.aberturasUnicas} />
        <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Taxa abertura" value={totals.taxaAbertura} highlight />
        <StatCard icon={<Eye className="w-4 h-4" />} label="Aberturas totais" value={totals.aberturasTotais} />
        <StatCard icon={<AlertTriangle className="w-4 h-4" />} label="Erros" value={totals.erros} />
      </div>

      <Card className="p-3 border-l-4 border-yellow-500 bg-yellow-500/10 text-xs flex gap-2">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <div>
          Aberturas são detectadas por pixel de rastreio. Clientes que bloqueiam imagens não contam,
          e serviços como <strong>Apple Mail Privacy Protection</strong> podem inflar o número (pré-carregam imagens).
          Use como tendência, não número absoluto.
        </div>
      </Card>

      {/* Tabela de campanhas */}
      <div>
        <h3 className="font-black uppercase text-sm mb-2 text-muted-foreground">Campanhas</h3>
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="p-2">Nome</th>
                <th className="p-2">Canal</th>
                <th className="p-2">Data</th>
                <th className="p-2 text-right">Alvo</th>
                <th className="p-2 text-right">Enviados</th>
                <th className="p-2 text-right">Erros</th>
                <th className="p-2 text-right">Abert. únicas</th>
                <th className="p-2 text-right">Total abert.</th>
                <th className="p-2 text-right">Taxa</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr><td colSpan={10} className="p-8 text-center text-muted-foreground">Nenhuma campanha ainda.</td></tr>
              ) : campaigns.map(c => (
                <tr key={c.campaign_id} className="border-t hover:bg-muted/30">
                  <td className="p-2 font-medium">{c.nome}</td>
                  <td className="p-2"><Badge variant="outline">{c.tipo}</Badge></td>
                  <td className="p-2 text-xs">{fmtDate(c.sent_at || c.created_at)}</td>
                  <td className="p-2 text-right font-mono">{c.total_alvo}</td>
                  <td className="p-2 text-right font-mono">{c.enviados}</td>
                  <td className="p-2 text-right font-mono text-red-600">{c.erros || ''}</td>
                  <td className="p-2 text-right font-mono">{c.aberturas_unicas}</td>
                  <td className="p-2 text-right font-mono text-muted-foreground">{c.aberturas_totais}</td>
                  <td className="p-2 text-right font-bold">{pct(c.aberturas_unicas, c.enviados)}</td>
                  <td className="p-2 text-right">
                    <Button size="sm" variant="outline" onClick={() => setOpenDetail(c)}>Ver</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Análise por segmento e região */}
      <div>
        <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
          <h3 className="font-black uppercase text-sm text-muted-foreground">Análise por segmento e região</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Campanha:</span>
            <Select value={selectedCampaign} onValueChange={(v) => { setSelectedCampaign(v); setDrillRegion(null); }}>
              <SelectTrigger className="w-[280px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as campanhas</SelectItem>
                {campaigns.map(c => <SelectItem key={c.campaign_id} value={c.campaign_id}>{c.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h4 className="font-bold mb-3 flex items-center gap-2 text-sm"><Newspaper className="w-4 h-4" /> Por segmento</h4>
            <RankTable
              rows={segFiltered.map(s => ({ key: s.meio, label: s.meio, enviados: s.enviados, abertas: s.aberturas_unicas }))}
              onClickRow={(key) => setEditSegment(key)}
            />
            <div className="text-[10px] text-muted-foreground mt-2">Clique numa categoria para revisar e reclassificar manualmente os veículos.</div>
          </Card>
          <Card className="p-4">
            <h4 className="font-bold mb-3 flex items-center gap-2 text-sm"><MapPin className="w-4 h-4" /> Por região</h4>
            <RankTable
              rows={regFiltered.map(s => ({ key: s.regiao, label: s.regiao, enviados: s.enviados, abertas: s.aberturas_unicas }))}
              onClickRow={(key) => setDrillRegion(drillRegion === key ? null : key)}
              activeKey={drillRegion}
            />
            {drillRegion && (
              <div className="mt-3 pt-3 border-t">
                <div className="text-xs font-bold uppercase text-muted-foreground mb-2">
                  Top municípios — {drillRegion}
                </div>
                <RankTable rows={muniDrill.map(m => ({ key: m.municipio, label: m.municipio, enviados: m.enviados, abertas: m.aberturas_unicas }))} compact />
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Ranking de leitores */}
      <div>
        <h3 className="font-black uppercase text-sm mb-2 text-muted-foreground flex items-center gap-2">
          <Trophy className="w-4 h-4" /> Ranking de leitores
        </h3>
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="p-2 w-8">#</th>
                <th className="p-2">Contato</th>
                <th className="p-2">Veículo</th>
                <th className="p-2">Segmento</th>
                <th className="p-2">Região</th>
                <th className="p-2 text-right">Recebidos</th>
                <th className="p-2 text-right">Camp. abertas</th>
                <th className="p-2 text-right">Total abert.</th>
                <th className="p-2">Última</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {topReaders.length === 0 ? (
                <tr><td colSpan={10} className="p-8 text-center text-muted-foreground">Sem aberturas registradas ainda.</td></tr>
              ) : topReaders.map((c, i) => (
                <tr key={c.contact_id} className="border-t hover:bg-muted/30">
                  <td className="p-2 font-mono text-xs">{i + 1}</td>
                  <td className="p-2">{c.contato || '—'}</td>
                  <td className="p-2 text-xs">{c.veiculo}</td>
                  <td className="p-2 text-xs">{normalizeMeio(c.meio, c.veiculo)}</td>
                  <td className="p-2 text-xs">{c.regiao || '—'}</td>
                  <td className="p-2 text-right font-mono">{c.total_recebidos}</td>
                  <td className="p-2 text-right font-mono">{c.campanhas_abertas}</td>
                  <td className="p-2 text-right font-mono font-bold">{c.total_aberturas}</td>
                  <td className="p-2 text-xs">{fmtDate(c.ultima_abertura)}</td>
                  <td className="p-2">
                    <Button size="sm" variant="ghost" onClick={() => setOpenHistory(c)}>
                      <History className="w-3 h-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Modais */}
      {openDetail && (
        <CampaignDetailDialog
          campaign={openDetail}
          onClose={() => setOpenDetail(null)}
        />
      )}
      {openHistory && (
        <ContactHistoryDialog
          contact={openHistory}
          onClose={() => setOpenHistory(null)}
        />
      )}
      {editSegment && (
        <SegmentEditDialog
          segment={editSegment}
          onClose={() => setEditSegment(null)}
          onSaved={() => { setEditSegment(null); load(); }}
        />
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string | number; highlight?: boolean }) => (
  <Card className={`p-3 ${highlight ? 'border-2 border-primary' : ''}`}>
    <div className="flex items-center gap-1 text-xs text-muted-foreground uppercase">{icon} {label}</div>
    <div className={`text-2xl font-black mt-1 ${highlight ? 'text-primary' : ''}`}>{value}</div>
  </Card>
);

const RankTable = ({
  rows, onClickRow, activeKey, compact,
}: {
  rows: { key: string; label: string; enviados: number; abertas: number }[];
  onClickRow?: (key: string) => void;
  activeKey?: string | null;
  compact?: boolean;
}) => {
  const max = Math.max(...rows.map(r => r.enviados), 1);
  if (rows.length === 0) return <div className="text-xs text-muted-foreground py-4 text-center">Sem dados.</div>;
  return (
    <table className={`w-full ${compact ? 'text-xs' : 'text-sm'}`}>
      <thead className="text-xs text-muted-foreground">
        <tr className="text-left">
          <th className="pb-1">Categoria</th>
          <th className="pb-1 text-right">Env.</th>
          <th className="pb-1 text-right">Abert.</th>
          <th className="pb-1 text-right">Taxa</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => {
          const bar = (r.enviados / max) * 100;
          const isActive = activeKey === r.key;
          return (
            <tr
              key={r.key}
              className={`border-t ${onClickRow ? 'cursor-pointer hover:bg-muted/40' : ''} ${isActive ? 'bg-primary/10' : ''}`}
              onClick={() => onClickRow?.(r.key)}
            >
              <td className="py-1.5">
                <div className="font-medium truncate max-w-[180px]">{r.label}</div>
                <div className="h-1 bg-muted rounded mt-1 overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${bar}%` }} />
                </div>
              </td>
              <td className="py-1.5 text-right font-mono">{r.enviados}</td>
              <td className="py-1.5 text-right font-mono">{r.abertas}</td>
              <td className="py-1.5 text-right font-mono font-bold">{pct(r.abertas, r.enviados)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

// ───── Detalhe da campanha ──────────────────────────────────────────────

const CampaignDetailDialog = ({ campaign, onClose }: { campaign: CampaignStat; onClose: () => void }) => {
  const [rows, setRows] = useState<SendDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'aberto' | 'nao_aberto' | 'erro'>('all');
  const [regFilter, setRegFilter] = useState<string>('all');
  const [segFilter, setSegFilter] = useState<string>('all');
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: sends } = await supabase
        .from('press_sends')
        .select('id,campaign_id,contact_id,status,error,sent_at,message_id,contact:press_contacts(contato,veiculo,email,meio,regiao,municipio)')
        .eq('campaign_id', campaign.campaign_id);
      const ids = (sends ?? []).map((s: any) => s.id);
      let opens: any[] = [];
      if (ids.length > 0) {
        const { data } = await supabase
          .from('press_email_opens')
          .select('send_id,opened_at')
          .in('send_id', ids);
        opens = data ?? [];
      }
      const byId = new Map<string, { count: number; first: string | null; last: string | null }>();
      for (const o of opens) {
        const cur = byId.get(o.send_id) ?? { count: 0, first: null, last: null };
        cur.count++;
        if (!cur.first || o.opened_at < cur.first) cur.first = o.opened_at;
        if (!cur.last || o.opened_at > cur.last) cur.last = o.opened_at;
        byId.set(o.send_id, cur);
      }
      const enriched: SendDetail[] = (sends ?? []).map((s: any) => ({
        ...s,
        open_count: byId.get(s.id)?.count ?? 0,
        first_open: byId.get(s.id)?.first ?? null,
        last_open: byId.get(s.id)?.last ?? null,
      }));
      setRows(enriched);
      setLoading(false);
    })();
  }, [campaign.campaign_id]);

  const regions = useMemo(() => Array.from(new Set(rows.map(r => r.contact?.regiao || '—'))).sort(), [rows]);
  const segs = useMemo(() => Array.from(new Set(rows.map(r => r.contact?.meio || '—'))).sort(), [rows]);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      if (filter === 'aberto' && r.open_count === 0) return false;
      if (filter === 'nao_aberto' && r.open_count > 0) return false;
      if (filter === 'erro' && r.status !== 'erro') return false;
      if (regFilter !== 'all' && (r.contact?.regiao || '—') !== regFilter) return false;
      if (segFilter !== 'all' && (r.contact?.meio || '—') !== segFilter) return false;
      if (q) {
        const s = q.toLowerCase();
        const hay = `${r.contact?.veiculo} ${r.contact?.contato} ${r.contact?.email} ${r.contact?.municipio}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [rows, filter, regFilter, segFilter, q]);

  const exportCsv = () => {
    const headers = ['veiculo','contato','email','segmento','regiao','municipio','status','aberturas','primeira_abertura','ultima_abertura','erro'];
    const lines = [headers.join(',')];
    for (const r of filtered) {
      const c = r.contact;
      lines.push([
        c?.veiculo, c?.contato, c?.email, c?.meio, c?.regiao, c?.municipio,
        r.status, r.open_count, r.first_open || '', r.last_open || '', (r.error || '').replace(/,/g,';')
      ].map(v => `"${String(v ?? '').replace(/"/g,'""')}"`).join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `campanha-${campaign.nome.replace(/[^a-z0-9]/gi,'_')}.csv`;
    a.click();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{campaign.nome}</DialogTitle>
          <div className="text-xs text-muted-foreground">{campaign.assunto}</div>
        </DialogHeader>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <StatCard icon={<Mail className="w-3 h-3" />} label="Enviados" value={campaign.enviados} />
          <StatCard icon={<AlertTriangle className="w-3 h-3" />} label="Erros" value={campaign.erros} />
          <StatCard icon={<Eye className="w-3 h-3" />} label="Abert. únicas" value={campaign.aberturas_unicas} highlight />
          <StatCard icon={<Eye className="w-3 h-3" />} label="Reaberturas" value={Math.max(0, campaign.aberturas_totais - campaign.aberturas_unicas)} />
          <StatCard icon={<TrendingUp className="w-3 h-3" />} label="Taxa" value={pct(campaign.aberturas_unicas, campaign.enviados)} highlight />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Input placeholder="Buscar veículo, contato, email…" value={q} onChange={(e) => setQ(e.target.value)} className="h-8 w-[240px]" />
          <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
            <SelectTrigger className="h-8 w-[160px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="aberto">Só abertos</SelectItem>
              <SelectItem value="nao_aberto">Só não abertos</SelectItem>
              <SelectItem value="erro">Só erros</SelectItem>
            </SelectContent>
          </Select>
          <Select value={regFilter} onValueChange={setRegFilter}>
            <SelectTrigger className="h-8 w-[160px] text-xs"><SelectValue placeholder="Região" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toda região</SelectItem>
              {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={segFilter} onValueChange={setSegFilter}>
            <SelectTrigger className="h-8 w-[160px] text-xs"><SelectValue placeholder="Segmento" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo segmento</SelectItem>
              {segs.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={exportCsv} className="ml-auto">
            <Download className="w-3 h-3 mr-1" /> CSV
          </Button>
        </div>

        <div className="overflow-x-auto border rounded">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="p-2">Veículo</th>
                <th className="p-2">Contato</th>
                <th className="p-2">E-mail</th>
                <th className="p-2">Segmento</th>
                <th className="p-2">Região</th>
                <th className="p-2">Município</th>
                <th className="p-2">Status</th>
                <th className="p-2 text-right">Abert.</th>
                <th className="p-2">1ª abertura</th>
                <th className="p-2">Última</th>
                <th className="p-2">Erro</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} className="p-8 text-center text-muted-foreground">Carregando…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={11} className="p-8 text-center text-muted-foreground">Nenhum resultado.</td></tr>
              ) : filtered.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="p-2">{r.contact?.veiculo}</td>
                  <td className="p-2">{r.contact?.contato || '—'}</td>
                  <td className="p-2 font-mono">{r.contact?.email || '—'}</td>
                  <td className="p-2">{r.contact?.meio || '—'}</td>
                  <td className="p-2">{r.contact?.regiao || '—'}</td>
                  <td className="p-2">{r.contact?.municipio || '—'}</td>
                  <td className="p-2"><StatusBadge s={r.status} /></td>
                  <td className="p-2 text-right font-mono font-bold">{r.open_count || ''}</td>
                  <td className="p-2 text-[10px]">{fmtDate(r.first_open)}</td>
                  <td className="p-2 text-[10px]">{fmtDate(r.last_open)}</td>
                  <td className="p-2 text-red-600 text-[10px] max-w-[200px] truncate" title={r.error || ''}>{r.error || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const StatusBadge = ({ s }: { s: string }) => {
  const map: Record<string, string> = {
    enviado: 'bg-green-500/20 text-green-700 border-green-500',
    erro: 'bg-red-500/20 text-red-700 border-red-500',
    pulado: 'bg-yellow-500/20 text-yellow-700 border-yellow-500',
    pendente: 'bg-muted text-muted-foreground border-muted-foreground',
  };
  return <span className={`inline-block px-1.5 py-0.5 text-[10px] border rounded ${map[s] || ''}`}>{s}</span>;
};

// ───── Histórico do contato ─────────────────────────────────────────────

type ContactHistoryRow = {
  send_id: string;
  campaign_id: string;
  campanha: string;
  status: string;
  sent_at: string | null;
  open_count: number;
  first_open: string | null;
  last_open: string | null;
};

const ContactHistoryDialog = ({ contact, onClose }: { contact: ContactEng; onClose: () => void }) => {
  const [rows, setRows] = useState<ContactHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: sends } = await supabase
        .from('press_sends')
        .select('id,campaign_id,status,sent_at,campaign:press_campaigns(nome)')
        .eq('contact_id', contact.contact_id)
        .order('sent_at', { ascending: false });
      const ids = (sends ?? []).map((s: any) => s.id);
      let opens: any[] = [];
      if (ids.length > 0) {
        const { data } = await supabase
          .from('press_email_opens')
          .select('send_id,opened_at')
          .in('send_id', ids);
        opens = data ?? [];
      }
      const byId = new Map<string, { count: number; first: string | null; last: string | null }>();
      for (const o of opens) {
        const cur = byId.get(o.send_id) ?? { count: 0, first: null, last: null };
        cur.count++;
        if (!cur.first || o.opened_at < cur.first) cur.first = o.opened_at;
        if (!cur.last || o.opened_at > cur.last) cur.last = o.opened_at;
        byId.set(o.send_id, cur);
      }
      setRows((sends ?? []).map((s: any) => ({
        send_id: s.id,
        campaign_id: s.campaign_id,
        campanha: s.campaign?.nome ?? '—',
        status: s.status,
        sent_at: s.sent_at,
        open_count: byId.get(s.id)?.count ?? 0,
        first_open: byId.get(s.id)?.first ?? null,
        last_open: byId.get(s.id)?.last ?? null,
      })));
      setLoading(false);
    })();
  }, [contact.contact_id]);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{contact.contato || contact.veiculo}</DialogTitle>
          <div className="text-xs text-muted-foreground">
            {contact.veiculo} • {contact.meio || '—'} • {contact.regiao || '—'} • {contact.email}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-2">
          <StatCard icon={<Mail className="w-3 h-3" />} label="Recebidos" value={contact.total_recebidos} />
          <StatCard icon={<Eye className="w-3 h-3" />} label="Camp. abertas" value={contact.campanhas_abertas} />
          <StatCard icon={<Eye className="w-3 h-3" />} label="Total abert." value={contact.total_aberturas} highlight />
          <StatCard icon={<TrendingUp className="w-3 h-3" />} label="Taxa" value={pct(contact.campanhas_abertas, contact.total_recebidos)} />
        </div>

        <div className="overflow-x-auto border rounded">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="p-2">Campanha</th>
                <th className="p-2">Status</th>
                <th className="p-2">Enviado em</th>
                <th className="p-2 text-right">Aberturas</th>
                <th className="p-2">1ª abertura</th>
                <th className="p-2">Última</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Carregando…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Nenhum envio.</td></tr>
              ) : rows.map(r => (
                <tr key={r.send_id} className="border-t">
                  <td className="p-2">{r.campanha}</td>
                  <td className="p-2"><StatusBadge s={r.status} /></td>
                  <td className="p-2 text-[10px]">{fmtDate(r.sent_at)}</td>
                  <td className="p-2 text-right font-mono font-bold">{r.open_count || ''}</td>
                  <td className="p-2 text-[10px]">{fmtDate(r.first_open)}</td>
                  <td className="p-2 text-[10px]">{fmtDate(r.last_open)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ───── Edição de segmento (reclassificação manual) ──────────────────────

type EditableContact = {
  id: string;
  veiculo: string;
  contato: string | null;
  email: string | null;
  municipio: string | null;
  regiao: string | null;
  meio: string | null;
  newMeio: string; // valor escolhido pelo usuário (canônico) ou '' para limpar
};

const SegmentEditDialog = ({
  segment, onClose, onSaved,
}: { segment: string; onClose: () => void; onSaved: () => void }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<EditableContact[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('press_contacts')
        .select('id,veiculo,contato,email,municipio,regiao,meio')
        .order('veiculo', { ascending: true });
      const all = (data ?? []) as any[];
      const filtered = all.filter(c => normalizeMeio(c.meio, c.veiculo) === segment);
      // Default newMeio: se o segmento clicado é canônico, sugere ele mesmo.
      const suggested = (CANON_MEIO_OPTIONS as readonly string[]).includes(segment) ? segment : '';
      setRows(filtered.map(c => ({ ...c, newMeio: suggested })));
      setLoading(false);
    })();
  }, [segment]);

  const filtered = useMemo(() => {
    if (!q) return rows;
    const s = q.toLowerCase();
    return rows.filter(r => `${r.veiculo} ${r.contato ?? ''} ${r.email ?? ''} ${r.municipio ?? ''} ${r.meio ?? ''}`.toLowerCase().includes(s));
  }, [rows, q]);

  const applyAll = (value: string) => {
    setRows(prev => prev.map(r => ({ ...r, newMeio: value })));
  };

  const save = async () => {
    const updates = rows.filter(r => r.newMeio && r.newMeio !== r.meio);
    if (updates.length === 0) {
      toast.info('Nenhuma alteração para salvar.');
      return;
    }
    setSaving(true);
    let ok = 0, fail = 0;
    for (const u of updates) {
      const { error } = await supabase
        .from('press_contacts')
        .update({ meio: u.newMeio })
        .eq('id', u.id);
      if (error) fail++; else ok++;
    }
    setSaving(false);
    if (fail > 0) toast.error(`${ok} salvos, ${fail} com erro.`);
    else toast.success(`${ok} veículos reclassificados.`);
    onSaved();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reclassificar segmento: {segment}</DialogTitle>
          <div className="text-xs text-muted-foreground">
            {rows.length} veículo(s) atualmente classificados nesta categoria. Ajuste individualmente ou aplique em lote.
          </div>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <Input placeholder="Buscar veículo, contato, email…" value={q} onChange={(e) => setQ(e.target.value)} className="h-8 w-[260px]" />
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-muted-foreground">Aplicar a todos:</span>
            <Select onValueChange={applyAll}>
              <SelectTrigger className="h-8 w-[200px] text-xs"><SelectValue placeholder="Escolher categoria…" /></SelectTrigger>
              <SelectContent>
                {CANON_MEIO_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto border rounded">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="p-2">Veículo</th>
                <th className="p-2">Contato</th>
                <th className="p-2">Município / Região</th>
                <th className="p-2">Meio atual</th>
                <th className="p-2 w-[200px]">Nova categoria</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Carregando veículos…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Nenhum veículo nesta categoria.</td></tr>
              ) : filtered.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="p-2 font-medium">{r.veiculo}</td>
                  <td className="p-2">
                    <div>{r.contato || '—'}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{r.email || '—'}</div>
                  </td>
                  <td className="p-2 text-[11px]">{r.municipio || '—'}{r.regiao ? ` / ${r.regiao}` : ''}</td>
                  <td className="p-2 text-[11px] text-muted-foreground">{r.meio || <em>(vazio)</em>}</td>
                  <td className="p-2">
                    <Select
                      value={r.newMeio}
                      onValueChange={(v) => setRows(prev => prev.map(x => x.id === r.id ? { ...x, newMeio: v } : x))}
                    >
                      <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Manter" /></SelectTrigger>
                      <SelectContent>
                        {CANON_MEIO_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={save} disabled={saving || loading}>
            <Save className="w-3 h-3 mr-1" />
            {saving ? 'Salvando…' : 'Salvar alterações'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
