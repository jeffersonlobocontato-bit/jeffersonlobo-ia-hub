import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, AlertCircle, Loader2, Circle, MinusCircle } from 'lucide-react';
import { useOgValidation } from '@/hooks/use-og-validation';
import { useMediaDownloaded } from '@/hooks/use-media-downloaded';
import {
  computeRhythmState, DEFAULT_RHYTHM, currentWindowLabel, type RhythmState,
} from '@/lib/whatsapp-rhythm';
import { supabase } from '@/integrations/supabase/client';

type Props = {
  campaignId: string;
  campaignCreatedAt: string | null;
  mediaUrl: string | null;
  mediaTipo: 'imagem' | 'video' | 'nenhum' | string;
  linkDestino: string | null;
  /** Notifica se TODOS os requisitos bloqueantes estão verdes (sem contar os apenas-avisos). */
  onReady?: (ready: boolean) => void;
};

type Row = {
  label: string;
  status: 'ok' | 'warn' | 'loading' | 'pending' | 'skip';
  detail?: string;
};

const contactsConfirmKey = (id: string) => `press-contacts-saved:${id}`;

export const PreDispatchChecklist = ({
  campaignId, campaignCreatedAt, mediaUrl, mediaTipo, linkDestino, onReady,
}: Props) => {
  const og = useOgValidation(linkDestino);
  const { downloaded } = useMediaDownloaded(campaignId);
  const [contactsSaved, setContactsSaved] = useState<boolean>(() =>
    localStorage.getItem(contactsConfirmKey(campaignId)) === '1'
  );
  const [rhythm, setRhythm] = useState<RhythmState | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    setContactsSaved(localStorage.getItem(contactsConfirmKey(campaignId)) === '1');
  }, [campaignId]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  // recarrega ritmo a cada 10s
  useEffect(() => {
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
      const day = campaignCreatedAt
        ? Math.max(1, Math.floor((Date.now() - new Date(campaignCreatedAt).getTime()) / 86_400_000) + 1)
        : 1;
      setRhythm(computeRhythmState(ts, new Date(), DEFAULT_RHYTHM, day));
    };
    load();
    const id = setInterval(load, 10_000);
    return () => { cancelled = true; clearInterval(id); };
  }, [campaignCreatedAt, now]);

  const mediaRow: Row = mediaTipo === 'nenhum' || !mediaUrl
    ? { label: 'Mídia anexa', status: 'skip', detail: 'sem mídia (texto puro)' }
    : downloaded
      ? { label: 'Mídia baixada no aparelho', status: 'ok' }
      : { label: 'Mídia carregada', status: 'ok', detail: 'baixe no celular antes de disparar' };

  const ogRow: Row = !linkDestino
    ? { label: 'Link destino', status: 'skip', detail: 'sem link' }
    : og.state === 'loading' ? { label: 'Preview do link', status: 'loading' }
    : og.state === 'valid' ? { label: 'Preview do link', status: 'ok', detail: og.title ?? undefined }
    : og.state === 'invalid' ? { label: 'Preview do link', status: 'warn', detail: `faltam: ${og.missing.join(', ')}` }
    : og.state === 'error' ? { label: 'Preview do link', status: 'warn', detail: 'não foi possível validar' }
    : { label: 'Preview do link', status: 'pending' };

  const winLabel = currentWindowLabel(now, DEFAULT_RHYTHM);
  const windowRow: Row = winLabel
    ? { label: 'Janela de envio', status: 'ok', detail: winLabel }
    : { label: 'Janela de envio', status: 'warn', detail: 'fora da janela recomendada' };

  const rhythmRow: Row = rhythm
    ? rhythm.kind === 'ok'
      ? { label: 'Ritmo liberado', status: 'ok', detail: `${rhythm.sentToday}/${rhythm.dailyCap} hoje` }
      : { label: 'Ritmo', status: 'warn', detail: rhythm.reason.replace(/_/g, ' ') }
    : { label: 'Ritmo', status: 'loading' };

  const contactsRow: Row = contactsSaved
    ? { label: 'Contatos salvos na agenda', status: 'ok' }
    : { label: 'Contatos salvos na agenda', status: 'pending', detail: 'confirme manualmente abaixo' };

  const rows: Row[] = [mediaRow, ogRow, windowRow, rhythmRow, contactsRow];

  // Bloqueantes: confirmação de contatos + (se houver mídia) baixada no aparelho.
  // Janela e ritmo são avisos — o guard impede envio individual quando necessário.
  const blockingOk = contactsSaved && (mediaTipo === 'nenhum' || !mediaUrl || downloaded);

  useEffect(() => { onReady?.(blockingOk); }, [blockingOk, onReady]);

  return (
    <Card className="border-2 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-black uppercase text-sm">Checklist pré-disparo</h4>
        <span className={`text-[11px] font-bold uppercase ${blockingOk ? 'text-primary' : 'text-muted-foreground'}`}>
          {blockingOk ? 'pronto' : 'pendente'}
        </span>
      </div>
      <ul className="space-y-1.5 text-sm">
        {rows.map((r, i) => <ChecklistItem key={i} row={r} />)}
      </ul>
      {!contactsSaved && (
        <label className="flex items-start gap-2 cursor-pointer text-xs pt-2 border-t">
          <Checkbox
            checked={contactsSaved}
            onCheckedChange={(v) => {
              const on = v === true;
              setContactsSaved(on);
              if (on) localStorage.setItem(contactsConfirmKey(campaignId), '1');
              else localStorage.removeItem(contactsConfirmKey(campaignId));
            }}
          />
          <span>
            Confirmo que <strong>salvei na agenda do celular</strong> todos os contatos da lista —
            o WhatsApp só abre conversa nova de forma confiável com números salvos.
          </span>
        </label>
      )}
    </Card>
  );
};

const ChecklistItem = ({ row }: { row: Row }) => {
  const icon = {
    ok: <CheckCircle2 className="w-4 h-4 text-primary" />,
    warn: <AlertCircle className="w-4 h-4 text-yellow-600" />,
    loading: <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />,
    pending: <Circle className="w-4 h-4 text-muted-foreground" />,
    skip: <MinusCircle className="w-4 h-4 text-muted-foreground" />,
  }[row.status];
  return (
    <li className="flex items-center gap-2">
      {icon}
      <span className={row.status === 'skip' ? 'text-muted-foreground' : ''}>{row.label}</span>
      {row.detail && <span className="text-xs text-muted-foreground truncate">— {row.detail}</span>}
    </li>
  );
};
