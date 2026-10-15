import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

// Sincroniza métricas diárias dos anúncios do Meta (via Windsor.ai) para
// ads_metrics_daily. Chamado pelo agendamento horário (header x-cron-token
// igual a ads_sync_status.cron_token) ou por admin logado ("Atualizar agora").

const CONTA = '261384327316929';
const CAMPOS = [
  'date', 'ad_id', 'ad_name', 'campaign_id', 'adset_id', 'spend', 'impressions', 'reach',
  'actions_link_click', 'actions_landing_page_view', 'actions_video_view', 'video_thruplay_watched_actions_video_view',
];

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
const int = (v: unknown) => Math.round(Number(v) || 0);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  // autorização
  const cron = req.headers.get('x-cron-token');
  let ok = false;
  if (cron) {
    const { data } = await admin.from('ads_sync_status').select('cron_token').eq('id', 1).single();
    ok = !!data && data.cron_token === cron;
  } else {
    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '');
    const { data: u } = await admin.auth.getUser(token);
    if (u?.user) {
      const { data: r } = await admin.rpc('has_role', { _user_id: u.user.id, _role: 'admin' });
      ok = r === true;
    }
  }
  if (!ok) return json({ error: 'nao_autorizado' }, 401);

  const agora = new Date().toISOString();
  const falhar = async (msg: string) => {
    await admin.from('ads_sync_status').update({ last_run_at: agora, last_error: msg.slice(0, 1000) }).eq('id', 1);
    return json({ ok: false, error: msg }, 502);
  };

  const key = Deno.env.get('WINDSOR_API_KEY');
  if (!key) return falhar('WINDSOR_API_KEY não cadastrada');

  const url = new URL('https://connectors.windsor.ai/facebook');
  url.searchParams.set('api_key', key);
  url.searchParams.set('date_preset', 'last_7d');
  url.searchParams.set('fields', CAMPOS.join(','));
  url.searchParams.set('select_accounts', CONTA);

  let linhas: Record<string, unknown>[] = [];
  try {
    const res = await fetch(url);
    const txt = await res.text();
    if (!res.ok) return falhar(`Windsor ${res.status}: ${txt.slice(0, 300)}`);
    const body = JSON.parse(txt);
    linhas = Array.isArray(body) ? body : body.data ?? [];
  } catch (e) {
    return falhar(`Falha ao chamar Windsor: ${(e as Error).message}`);
  }

  const reg = linhas
    .filter((l) => l.date && l.ad_id)
    .map((l) => ({
      date: String(l.date).slice(0, 10),
      ad_id: String(l.ad_id),
      ad_name: (l.ad_name as string) ?? null,
      campaign_id: l.campaign_id ? String(l.campaign_id) : null,
      adset_id: l.adset_id ? String(l.adset_id) : null,
      spend: Math.round((Number(l.spend) || 0) * 100) / 100,
      impressions: int(l.impressions),
      reach: int(l.reach),
      video_views: int(l.actions_video_view),
      thruplays: int(l.video_thruplay_watched_actions_video_view),
      link_clicks: int(l.actions_link_click),
      landing_page_views: int(l.actions_landing_page_view),
      synced_at: agora,
    }));

  if (reg.length) {
    const { error } = await admin.from('ads_metrics_daily').upsert(reg, { onConflict: 'date,ad_id' });
    if (error) return falhar(`Gravação: ${error.message}`);
    // anúncios novos entram como "sem campanha"
    const ids = [...new Set(reg.map((r) => r.ad_id))];
    const novos = ids.map((id) => ({ ad_id: id, utm_campaign: null, label: reg.find((r) => r.ad_id === id)?.ad_name ?? null }));
    await admin.from('ads_utm_map').upsert(novos, { onConflict: 'ad_id', ignoreDuplicates: true });
  }

  await admin.from('ads_sync_status').update({ last_run_at: agora, last_ok_at: agora, last_error: null, rows_upserted: reg.length }).eq('id', 1);
  return json({ ok: true, linhas: reg.length });
});
