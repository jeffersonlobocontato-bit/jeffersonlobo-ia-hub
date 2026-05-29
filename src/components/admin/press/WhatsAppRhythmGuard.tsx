import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle2, Pause, Moon } from 'lucide-react';
import {
  computeRhythmState, DEFAULT_RHYTHM, formatCountdown, formatNextAllowed,
  recommendNowMessage, currentWindowLabel, type RhythmState,
} from '@/lib/whatsapp-rhythm';

type Props = {
  campaignCreatedAt: string | null;
  onStateChange?: (canSendNow: boolean) => void;
};

export const WhatsAppRhythmGuard = ({ campaignCreatedAt, onStateChange }: Props) => {
  const [state, setState] = useState<RhythmState | null>(null);
  const [now, setNow] = useState<Date>(new Date());

  // tick a cada 1s para countdown
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // recarrega timestamps a cada 5s
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from('press_sends')
        .select('sent_at')
        .eq('canal', 'whatsapp')
        .eq('status', 'enviado')
        .gte('sent_at', since)
        .order('sent_at', { ascending: false });
      if (cancelled) return;
      const ts = (data ?? []).map(r => r.sent_at).filter(Boolean) as string[];
      const dayOfCampaign = campaignCreatedAt
        ? Math.max(1, Math.floor((Date.now() - new Date(campaignCreatedAt).getTime()) / (24 * 60 * 60 * 1000)) + 1)
        : 1;
      setState(computeRhythmState(ts, new Date(), DEFAULT_RHYTHM, dayOfCampaign));
    };
    load();
    const id = setInterval(load, 5000);
    return () => { cancelled = true; clearInterval(id); };
  }, [campaignCreatedAt]);

  // recomputa countdown localmente a cada tick (sem hit no banco)
  useEffect(() => {
    if (!state) return;
    onStateChange?.(state.kind === 'ok');
  }, [state, onStateChange]);

  if (!state) {
    return (
      <Card className="p-4 border-2">
        <div className="text-sm text-muted-foreground">Calculando ritmo de envio…</div>
      </Card>
    );
  }

  const remainingSec = (state.kind === 'cooldown' || state.kind === 'forced_pause')
    ? Math.max(0, Math.ceil((state.nextAllowedAt.getTime() - now.getTime()) / 1000))
    : 0;

  const banner = (() => {
    switch (state.kind) {
      case 'ok':
        return { color: 'bg-primary text-primary-foreground', icon: <CheckCircle2 className="w-5 h-5" />, label: 'LIBERADO PARA ENVIAR', sub: 'próximo: agora' };
      case 'cooldown':
        return { color: 'bg-yellow-500 text-black', icon: <Clock className="w-5 h-5" />, label: `AGUARDE ${formatCountdown(remainingSec)}`, sub: 'cooldown entre envios (padrão humano)' };
      case 'forced_pause':
        return { color: 'bg-orange-500 text-black', icon: <Pause className="w-5 h-5" />, label: `PAUSA OBRIGATÓRIA ${formatCountdown(remainingSec)}`, sub: `bateu ${DEFAULT_RHYTHM.forcedPauseEvery} envios — descanse 5min` };
      case 'outside_window':
        return { color: 'bg-destructive text-destructive-foreground', icon: <Moon className="w-5 h-5" />, label: 'FORA DA JANELA', sub: `volte em ${formatNextAllowed(state.nextAllowedAt)}` };
      case 'daily_quota':
        return { color: 'bg-destructive text-destructive-foreground', icon: <AlertTriangle className="w-5 h-5" />, label: 'COTA DIÁRIA ATINGIDA', sub: `retome em ${formatNextAllowed(state.nextAllowedAt)}` };
      case 'hourly_quota':
        return { color: 'bg-destructive text-destructive-foreground', icon: <AlertTriangle className="w-5 h-5" />, label: 'COTA POR HORA ATINGIDA', sub: `volte em ${formatNextAllowed(state.nextAllowedAt)}` };
    }
  })();

  const winLabel = currentWindowLabel(now, DEFAULT_RHYTHM);

  return (
    <Card className="overflow-hidden border-2">
      <div className={`px-4 py-3 flex items-center justify-between gap-4 ${banner.color}`}>
        <div className="flex items-center gap-3">
          {banner.icon}
          <div>
            <div className="font-black uppercase text-base leading-tight">{banner.label}</div>
            <div className="text-xs opacity-90">{banner.sub}</div>
          </div>
        </div>
        {winLabel && (
          <Badge variant="outline" className="bg-background/20 border-current text-current">
            Janela atual: {winLabel}
          </Badge>
        )}
      </div>
      <div className="grid grid-cols-3 divide-x">
        <Metric label="Hoje" current={state.sentToday} max={state.dailyCap} />
        <Metric label="Última hora" current={state.sentLastHour} max={state.hourlyCap} />
        <div className="p-3">
          <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Recomendado agora</div>
          <div className="font-bold text-sm mt-1">{recommendNowMessage(state, DEFAULT_RHYTHM)}</div>
        </div>
      </div>
    </Card>
  );
};

const Metric = ({ label, current, max }: { label: string; current: number; max: number }) => {
  const pct = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;
  const danger = pct >= 90;
  const warn = pct >= 70;
  return (
    <div className="p-3">
      <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">{label}</div>
      <div className="font-black text-lg mt-1">{current} / {max}</div>
      <div className="h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
        <div
          className={`h-full transition-all ${danger ? 'bg-destructive' : warn ? 'bg-yellow-500' : 'bg-primary'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-[10px] text-muted-foreground mt-1">{pct}%</div>
    </div>
  );
};
