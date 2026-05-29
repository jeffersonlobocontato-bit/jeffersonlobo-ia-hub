import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft, Check, SkipForward, Download, ExternalLink, ImageIcon, Video,
  Loader2, Clock, ChevronRight,
} from 'lucide-react';
import {
  composeWhatsAppMessage, htmlToWhatsAppMarkdown, type PressContact,
} from '@/lib/press-utils';
import {
  computeRhythmState, DEFAULT_RHYTHM, formatCountdown, type RhythmState,
} from '@/lib/whatsapp-rhythm';
import { useMediaDownloaded } from '@/hooks/use-media-downloaded';
import { PreDispatchChecklist } from '@/components/admin/press/PreDispatchChecklist';

type Campaign = {
  id: string;
  nome: string;
  corpo: string;
  titulo: string | null;
  media_url: string | null;
  media_tipo: 'imagem' | 'video' | 'nenhum' | string;
  link_destino: string | null;
  link_slug: string | null;
  created_at: string;
  total_alvo: number;
};

type SendRow = {
  contact_id: string;
  status: 'pendente' | 'enviado' | 'pulado' | string;
};

const PressCampaignKiosk = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<Record<string, PressContact>>({});
  const [sends, setSends] = useState<SendRow[]>([]);
  const [cursor, setCursor] = useState(0);
  const [rhythm, setRhythm] = useState<RhythmState | null>(null);
  const [now, setNow] = useState(new Date());
  const [ready, setReady] = useState(false);
  const { downloaded, markDownloaded } = useMediaDownloaded(campaignId ?? null);

  // tick
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // load campaign + sends + contacts
  useEffect(() => {
    if (!campaignId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: camp } = await supabase
        .from('press_campaigns')
        .select('id, nome, corpo, titulo, media_url, media_tipo, link_destino, link_slug, created_at, total_alvo')
        .eq('id', campaignId).maybeSingle();
      if (cancelled) return;
      if (!camp) { setLoading(false); return; }
      setCampaign(camp as Campaign);

      const { data: rows } = await supabase
        .from('press_sends')
        .select('contact_id, status')
        .eq('campaign_id', campaignId).eq('canal', 'whatsapp')
        .order('created_at', { ascending: true });
      if (cancelled) return;
      const rs = (rows ?? []) as SendRow[];
      setSends(rs);

      const ids = rs.map(r => r.contact_id);
      if (ids.length) {
        const { data: cts } = await supabase
          .from('press_contacts').select('*').in('id', ids);
        if (cancelled) return;
        const map: Record<string, PressContact> = {};
        (cts ?? []).forEach((c: any) => { map[c.id] = c; });
        setContacts(map);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [campaignId]);

  // rhythm poll
  useEffect(() => {
    if (!campaign) return;
    let cancelled = false;
    const load = async () => {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from('press_sends')
        .select('sent_at')
        .eq('canal', 'whatsapp').eq('status', 'enviado').gte('sent_at', since)
        .order('sent_at', { ascending: false });
      if (cancelled) return;
      const ts = (data ?? []).map(r => r.sent_at).filter(Boolean) as string[];
      const day = Math.max(1, Math.floor((Date.now() - new Date(campaign.created_at).getTime()) / 86_400_000) + 1);
      setRhythm(computeRhythmState(ts, new Date(), DEFAULT_RHYTHM, day));
    };
    load();
    const id = setInterval(load, 5000);
    return () => { cancelled = true; clearInterval(id); };
  }, [campaign]);

  const pendingIds = useMemo(
    () => sends.filter(s => s.status === 'pendente').map(s => s.contact_id).filter(id => contacts[id]),
    [sends, contacts],
  );
  const totalEnviado = sends.filter(s => s.status === 'enviado').length;
  const totalPulado = sends.filter(s => s.status === 'pulado').length;
  const totalTodos = sends.length;
  const currentContactId = pendingIds[cursor] ?? null;
  const currentContact = currentContactId ? contacts[currentContactId] : null;

  const canSendNow = rhythm?.kind === 'ok';
  const cooldownSec = rhythm && (rhythm.kind === 'cooldown' || rhythm.kind === 'forced_pause')
    ? Math.max(0, Math.ceil((rhythm.nextAllowedAt.getTime() - now.getTime()) / 1000))
    : 0;

  const buildText = (c: PressContact) => campaign ? composeWhatsAppMessage({
    titulo: campaign.titulo,
    bodyMarkdown: htmlToWhatsAppMarkdown(campaign.corpo),
    link: campaign.link_destino,
    contact: c,
  }) : '';

  const sanitizePhone = (n: string) => (n ?? '').replace(/\D/g, '');
  const buildWaLink = (c: PressContact) =>
    `https://wa.me/${sanitizePhone(c.whatsapp)}?text=${encodeURIComponent(buildText(c))}`;

  const markSent = async (c: PressContact) => {
    if (!campaignId) return;
    await supabase.from('press_sends')
      .update({ status: 'enviado', sent_at: new Date().toISOString() })
      .eq('campaign_id', campaignId).eq('contact_id', c.id);
    setSends(prev => prev.map(s => s.contact_id === c.id ? { ...s, status: 'enviado' } : s));
    await supabase.from('press_campaigns')
      .update({ total_enviado: totalEnviado + 1 })
      .eq('id', campaignId);
    // cursor permanece — pendingIds encolhe e o próximo da fila vira o atual
    setCursor(0);
  };

  const skip = async (c: PressContact) => {
    if (!campaignId) return;
    await supabase.from('press_sends')
      .update({ status: 'pulado' })
      .eq('campaign_id', campaignId).eq('contact_id', c.id);
    setSends(prev => prev.map(s => s.contact_id === c.id ? { ...s, status: 'pulado' } : s));
    setCursor(0);
  };

  const next = () => {
    setCursor(c => Math.min(c + 1, Math.max(0, pendingIds.length - 1)));
  };

  const downloadMedia = async () => {
    if (!campaign?.media_url) return;
    try {
      const res = await fetch(campaign.media_url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = campaign.media_url.split('/').pop() ?? 'midia';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      markDownloaded();
      toast({ title: 'Mídia baixada', description: 'Anexe no WhatsApp antes de colar o texto.' });
    } catch {
      window.open(campaign.media_url, '_blank');
      markDownloaded();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }
  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-sm">Campanha não encontrada.</p>
        <Button asChild variant="outline"><Link to="/admin">Voltar ao painel</Link></Button>
      </div>
    );
  }

  const progressPct = totalTodos > 0 ? Math.round(((totalEnviado + totalPulado) / totalTodos) * 100) : 0;

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header sticky */}
      <header className="sticky top-0 z-10 border-b-2 bg-background">
        <div className="max-w-md mx-auto px-3 py-2 flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="px-2">
            <Link to="/admin" aria-label="Voltar"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <div className="flex-1 min-w-0">
            <div className="font-black uppercase text-xs truncate">{campaign.nome}</div>
            <div className="text-[10px] text-muted-foreground">
              {totalEnviado}/{totalTodos} enviados · {totalPulado} pulados · {pendingIds.length} restantes
            </div>
          </div>
          <Badge variant={canSendNow ? 'default' : 'outline'} className="text-[10px]">
            {canSendNow ? 'LIBERADO' : cooldownSec > 0 ? formatCountdown(cooldownSec) : 'aguarde'}
          </Badge>
        </div>
        <div className="h-1 bg-muted">
          <div className="h-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </header>

      <div className="max-w-md mx-auto px-3 pt-3 space-y-3">
        {/* Checklist */}
        <PreDispatchChecklist
          campaignId={campaign.id}
          campaignCreatedAt={campaign.created_at}
          mediaUrl={campaign.media_url}
          mediaTipo={campaign.media_tipo}
          linkDestino={campaign.link_destino}
          onReady={setReady}
        />

        {/* Mídia fixa */}
        {campaign.media_url && campaign.media_tipo !== 'nenhum' && (
          <Card className="border-2 p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase">
              {campaign.media_tipo === 'imagem' ? <ImageIcon className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              Mídia da campanha
            </div>
            {campaign.media_tipo === 'imagem'
              ? <img src={campaign.media_url} alt="mídia" className="w-full max-h-48 object-contain border" />
              : <video src={campaign.media_url} controls className="w-full max-h-48 border" />}
            <Button onClick={downloadMedia} variant={downloaded ? 'outline' : 'default'} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              {downloaded ? 'Mídia baixada ✓ Baixar de novo' : 'Baixar mídia para anexar'}
            </Button>
            {!downloaded && (
              <p className="text-[11px] text-muted-foreground">
                Baixe 1 vez no celular. Depois de abrir o WhatsApp, anexe a mídia <strong>antes</strong> de colar o texto.
              </p>
            )}
          </Card>
        )}

        {/* Contato atual ou tela final */}
        {!currentContact ? (
          <Card className="border-2 border-primary p-6 text-center space-y-3">
            <div className="text-4xl">🎉</div>
            <h2 className="font-black uppercase text-lg">Disparo concluído</h2>
            <p className="text-sm text-muted-foreground">
              {totalEnviado} enviados · {totalPulado} pulados · {totalTodos} no total.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/admin">Voltar ao painel</Link>
            </Button>
          </Card>
        ) : (
          <Card className="border-2 p-4 space-y-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Contato {totalEnviado + totalPulado + 1} de {totalTodos}
            </div>
            <div>
              <div className="font-black text-lg leading-tight">{currentContact.veiculo}</div>
              <div className="text-sm">{currentContact.contato ?? 'redação'}</div>
              {currentContact.cargo && <div className="text-xs text-muted-foreground">{currentContact.cargo}</div>}
              <div className="text-xs text-muted-foreground mt-1">
                {currentContact.municipio ?? '—'} · +{currentContact.whatsapp}
              </div>
            </div>

            {/* Preview */}
            <details className="border-t pt-2">
              <summary className="cursor-pointer text-[11px] font-bold uppercase text-muted-foreground">
                Ver mensagem
              </summary>
              <pre className="mt-2 p-3 bg-muted text-xs whitespace-pre-wrap rounded">
                {buildText(currentContact)}
              </pre>
            </details>

            {!ready && (
              <div className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 p-2 rounded">
                Conclua o checklist acima antes de começar.
              </div>
            )}

            {!canSendNow && rhythm && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {rhythm.kind === 'cooldown' && <>Cooldown: {formatCountdown(cooldownSec)}</>}
                {rhythm.kind === 'forced_pause' && <>Pausa obrigatória: {formatCountdown(cooldownSec)}</>}
                {rhythm.kind === 'outside_window' && <>Fora da janela recomendada</>}
                {rhythm.kind === 'daily_quota' && <>Cota diária atingida</>}
                {rhythm.kind === 'hourly_quota' && <>Cota por hora atingida</>}
              </div>
            )}

            <Button
              onClick={() => openWhatsApp(currentContact)}
              disabled={!ready || !canSendNow}
              className="w-full h-14 text-base font-black uppercase"
              size="lg"
            >
              <ExternalLink className="w-5 h-5 mr-2" /> Abrir WhatsApp
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => skip(currentContact)} variant="outline" disabled={!ready}>
                <SkipForward className="w-4 h-4 mr-1" /> Pular
              </Button>
              <Button onClick={() => markSent(currentContact)} disabled={!ready} variant="secondary">
                <Check className="w-4 h-4 mr-1" /> Enviado
              </Button>
            </div>

            {pendingIds.length > 1 && (
              <Button onClick={next} variant="ghost" size="sm" className="w-full text-xs">
                Pular para o próximo sem marcar <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default PressCampaignKiosk;
