// E-mails do formulário de briefing: aviso interno + confirmação para quem pediu.
// Os dados vêm da linha gravada em briefing_requests (nunca do navegador).
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { sendTemplateEmailLogged } from '../_shared/transactional-email-templates/send-and-log.ts'

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  let briefingId = ''
  try {
    briefingId = String((await req.json())?.briefingId ?? '')
  } catch { /* corpo inválido */ }
  if (!UUID.test(briefingId)) return json({ error: 'briefingId inválido' }, 400)

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { data: b, error } = await db.from('briefing_requests').select('*').eq('id', briefingId).maybeSingle()
  if (error) return json({ error: 'falha ao ler briefing' }, 500)
  if (!b) return json({ error: 'briefing não encontrado' }, 404)
  // só pedidos recentes (evita reenvio por terceiros)
  if (b.created_at && Date.now() - new Date(b.created_at).getTime() > 15 * 60 * 1000) {
    return json({ ok: true, skipped: 'antigo' })
  }

  const data = {
    nome: b.nome, empresa: b.empresa ?? undefined, cargo: b.cargo ?? undefined, email: b.email,
    whatsapp: b.whatsapp ?? undefined, tipo: b.tipo ?? undefined, data_evento: b.data_evento ?? undefined,
    formato: b.formato ?? undefined, publico: b.publico ?? undefined, cidade: b.cidade ?? undefined,
    mensagem: b.mensagem ?? undefined,
  }
  const results = await Promise.allSettled([
    sendTemplateEmailLogged('briefing-internal-notification', 'lobo@aivozes.com.br', {
      idempotencyKey: `briefing-internal-${briefingId}`,
      templateData: { ...data, briefingId },
    }),
    sendTemplateEmailLogged('briefing-lead-confirmation', b.email, {
      idempotencyKey: `briefing-lead-${briefingId}`,
      templateData: {
        nome: data.nome, tipo: data.tipo, data_evento: data.data_evento,
        formato: data.formato, publico: data.publico, cidade: data.cidade,
      },
    }),
  ])
  results.forEach((r, i) => { if (r.status === 'rejected') console.error(`briefing email ${i} failed`, r.reason) })
  return json({ ok: true })
})
