// Regras de ritmo de envio WhatsApp manual (wa.me) para proteger
// reputação do número e maximizar conversão com imprensa.

export type RhythmConfig = {
  windowsWeekday: Array<[number, number]>; // hora início/fim ex: [[9,12],[14,18]]
  weekendsAllowed: boolean;
  cooldownMinSec: number;
  cooldownMaxSec: number;
  forcedPauseEvery: number;       // após N envios seguidos
  forcedPauseDurationSec: number; // duração da pausa
  dailyQuota: number;
  hourlyQuota: number;
  warmupDay1Pct: number;          // % da cota no dia 1
  warmupDay2Pct: number;
};

export const DEFAULT_RHYTHM: RhythmConfig = {
  windowsWeekday: [[9, 12], [14, 18]],
  weekendsAllowed: false,
  cooldownMinSec: 25,
  cooldownMaxSec: 45,
  forcedPauseEvery: 30,
  forcedPauseDurationSec: 300,
  dailyQuota: 150,
  hourlyQuota: 40,
  warmupDay1Pct: 0.6,
  warmupDay2Pct: 0.8,
};

export type RhythmState =
  | { kind: 'ok'; nextAllowedAt: null; sentToday: number; sentLastHour: number; dailyCap: number; hourlyCap: number; reason: 'liberado' }
  | { kind: 'cooldown'; nextAllowedAt: Date; remainingSec: number; sentToday: number; sentLastHour: number; dailyCap: number; hourlyCap: number; reason: 'cooldown' }
  | { kind: 'forced_pause'; nextAllowedAt: Date; remainingSec: number; sentToday: number; sentLastHour: number; dailyCap: number; hourlyCap: number; reason: 'pausa_obrigatoria' }
  | { kind: 'outside_window'; nextAllowedAt: Date; sentToday: number; sentLastHour: number; dailyCap: number; hourlyCap: number; reason: 'fora_janela' }
  | { kind: 'daily_quota'; nextAllowedAt: Date; sentToday: number; sentLastHour: number; dailyCap: number; hourlyCap: number; reason: 'cota_diaria' }
  | { kind: 'hourly_quota'; nextAllowedAt: Date; sentToday: number; sentLastHour: number; dailyCap: number; hourlyCap: number; reason: 'cota_hora' };

const TZ = 'America/Sao_Paulo';

/** Retorna {hour, weekday, dateKey} para `now` no fuso de São Paulo. */
function spParts(now: Date) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    weekday: 'short',
  }).formatToParts(now);
  const get = (t: string) => fmt.find(p => p.type === t)?.value ?? '';
  const hour = parseInt(get('hour'), 10);
  const minute = parseInt(get('minute'), 10);
  const second = parseInt(get('second'), 10);
  const dateKey = `${get('year')}-${get('month')}-${get('day')}`;
  // weekday short: Mon Tue Wed Thu Fri Sat Sun
  const wd = get('weekday');
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { hour, minute, second, dateKey, weekday: map[wd] ?? 0 };
}

function isInWindow(now: Date, cfg: RhythmConfig): boolean {
  const { weekday, hour } = spParts(now);
  if (!cfg.weekendsAllowed && (weekday === 0 || weekday === 6)) return false;
  return cfg.windowsWeekday.some(([a, b]) => hour >= a && hour < b);
}

/** Próximo início de janela após `now` em SP. Retorna Date no UTC equivalente. */
function nextWindowStart(now: Date, cfg: RhythmConfig): Date {
  // varre próximos 7 dias hora a hora
  const probe = new Date(now);
  for (let i = 0; i < 24 * 8; i++) {
    probe.setMinutes(0, 0, 0);
    probe.setTime(probe.getTime() + 60 * 60 * 1000);
    const { weekday, hour } = spParts(probe);
    if (!cfg.weekendsAllowed && (weekday === 0 || weekday === 6)) continue;
    if (cfg.windowsWeekday.some(([a]) => a === hour)) return probe;
  }
  return new Date(now.getTime() + 24 * 60 * 60 * 1000);
}

function startOfNextHour(now: Date): Date {
  const d = new Date(now);
  d.setMinutes(0, 0, 0);
  d.setTime(d.getTime() + 60 * 60 * 1000);
  return d;
}

function startOfTomorrowSP(now: Date): Date {
  // primeiro horário válido amanhã (ou seg se sex/sab/dom)
  const probe = new Date(now);
  probe.setUTCHours(probe.getUTCHours() + 24);
  const { dateKey } = spParts(probe);
  // 9h SP = 12h UTC (BRT é UTC-3, sem horário de verão atualmente)
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

/** Cota efetiva do dia considerando aquecimento. dayOfCampaign começa em 1. */
export function effectiveDailyCap(cfg: RhythmConfig, dayOfCampaign: number): number {
  if (dayOfCampaign <= 1) return Math.round(cfg.dailyQuota * cfg.warmupDay1Pct);
  if (dayOfCampaign === 2) return Math.round(cfg.dailyQuota * cfg.warmupDay2Pct);
  return cfg.dailyQuota;
}

/**
 * sentTimestamps: timestamps ISO ou Date dos envios "enviado" do canal,
 * últimas 24h. dayOfCampaign: dias desde criação da campanha (1 = primeiro dia).
 */
export function computeRhythmState(
  sentTimestamps: Array<string | Date>,
  now: Date,
  cfg: RhythmConfig,
  dayOfCampaign: number,
): RhythmState {
  const sorted = sentTimestamps
    .map(t => (t instanceof Date ? t : new Date(t)))
    .filter(d => !isNaN(d.getTime()))
    .sort((a, b) => b.getTime() - a.getTime());

  const { dateKey } = spParts(now);
  const sentToday = sorted.filter(d => spParts(d).dateKey === dateKey).length;
  const oneHourAgo = now.getTime() - 60 * 60 * 1000;
  const sentLastHour = sorted.filter(d => d.getTime() >= oneHourAgo).length;
  const dailyCap = effectiveDailyCap(cfg, dayOfCampaign);
  const base = { sentToday, sentLastHour, dailyCap, hourlyCap: cfg.hourlyQuota };

  // 1. fora da janela?
  if (!isInWindow(now, cfg)) {
    return { kind: 'outside_window', nextAllowedAt: nextWindowStart(now, cfg), ...base, reason: 'fora_janela' };
  }

  // 2. cota diária atingida?
  if (sentToday >= dailyCap) {
    return { kind: 'daily_quota', nextAllowedAt: startOfTomorrowSP(now), ...base, reason: 'cota_diaria' };
  }

  // 3. cota por hora atingida?
  if (sentLastHour >= cfg.hourlyQuota) {
    return { kind: 'hourly_quota', nextAllowedAt: startOfNextHour(now), ...base, reason: 'cota_hora' };
  }

  // 4. pausa forçada? (últimos N envios em rajada contínua)
  if (sorted.length >= cfg.forcedPauseEvery) {
    const lastN = sorted.slice(0, cfg.forcedPauseEvery);
    const spanSec = (lastN[0].getTime() - lastN[cfg.forcedPauseEvery - 1].getTime()) / 1000;
    // se os últimos N envios ocorreram em janela menor que (N * cooldownMax * 1.5),
    // considera rajada e força pausa baseada no mais recente
    if (spanSec < cfg.forcedPauseEvery * cfg.cooldownMaxSec * 1.5) {
      const pauseUntil = new Date(lastN[0].getTime() + cfg.forcedPauseDurationSec * 1000);
      if (pauseUntil > now) {
        const remainingSec = Math.ceil((pauseUntil.getTime() - now.getTime()) / 1000);
        return { kind: 'forced_pause', nextAllowedAt: pauseUntil, remainingSec, ...base, reason: 'pausa_obrigatoria' };
      }
    }
  }

  // 5. cooldown entre envios
  if (sorted.length > 0) {
    const lastSent = sorted[0];
    const cooldownUntil = new Date(lastSent.getTime() + cfg.cooldownMinSec * 1000);
    if (cooldownUntil > now) {
      const remainingSec = Math.ceil((cooldownUntil.getTime() - now.getTime()) / 1000);
      return { kind: 'cooldown', nextAllowedAt: cooldownUntil, remainingSec, ...base, reason: 'cooldown' };
    }
  }

  return { kind: 'ok', nextAllowedAt: null, ...base, reason: 'liberado' };
}

export function recommendNowMessage(state: RhythmState, cfg: RhythmConfig): string {
  const remainingHour = Math.max(0, cfg.hourlyQuota - state.sentLastHour);
  const remainingDay = Math.max(0, state.dailyCap - state.sentToday);
  const next = Math.min(remainingHour, remainingDay);
  if (next === 0) return 'parar agora';
  if (remainingHour < remainingDay) return `até ${next} nesta hora`;
  return `até ${next} hoje`;
}

export function formatCountdown(seconds: number): string {
  if (seconds <= 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatNextAllowed(d: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: TZ, weekday: 'short', hour: '2-digit', minute: '2-digit',
  }).format(d);
}

export function currentWindowLabel(now: Date, cfg: RhythmConfig): string | null {
  const { hour } = spParts(now);
  const win = cfg.windowsWeekday.find(([a, b]) => hour >= a && hour < b);
  if (!win) return null;
  return `${String(win[0]).padStart(2, '0')}:00–${String(win[1]).padStart(2, '0')}:00`;
}
