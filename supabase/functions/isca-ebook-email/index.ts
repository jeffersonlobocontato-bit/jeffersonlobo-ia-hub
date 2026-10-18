// Entrega dos materiais gratuitos (e-book e guias): lê o lead gravado e envia o modelo da isca.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { sendTemplateEmailLogged } from '../_shared/transactional-email-templates/send-and-log.ts'

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const SITE_URL = 'https://jeffersonlobo.tech'
// material -> modelo e arquivo (fixos no servidor)
const ISCAS: Record<string, { modelo: string; arquivo: string; pagina?: string; titulo?: string }> = {
  '50-skills-claude': { modelo: 'ebook-skills-entrega', arquivo: '/academia/50-skills-do-claude.pdf' },
  'guia-foto-que-vende': {
    modelo: 'guia-entrega',
    arquivo: '/academia/guias/foto-que-vende.pdf',
    pagina: '/academia/guias/foto-que-vende.html',
    titulo: 'A foto que vende em 3 minutos',
  },
  'guia-30-dias-conteudo': {
    modelo: 'guia-entrega',
    arquivo: '/academia/guias/30-dias-de-conteudo.pdf',
    pagina: '/academia/guias/30-dias-de-conteudo.html',
    titulo: '30 dias de conteúdo em 1 hora',
  },
  'guia-atendimento-whatsapp': {
    modelo: 'guia-entrega',
    arquivo: '/academia/guias/atendimento-whatsapp.pdf',
    pagina: '/academia/guias/atendimento-whatsapp.html',
    titulo: 'Atendimento que fecha no WhatsApp',
  },
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  let leadId = ''
  try {
    leadId = String((await req.json())?.leadId ?? '')
  } catch { /* corpo inválido */ }
  // chamada vazia = checagem de saúde do painel
  if (!leadId) return json({ ok: true })
  if (!UUID.test(leadId)) return json({ error: 'leadId inválido' }, 400)

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { data: lead, error } = await db.from('academia_leads').select('id, nome, email, material, created_at, updated_at').eq('id', leadId).maybeSingle()
  if (error) return json({ error: 'falha ao ler lead' }, 500)
  if (!lead) return json({ error: 'lead não encontrado' }, 404)
  const isca = ISCAS[lead.material]
  if (!isca) return json({ error: 'material sem e-mail' }, 400)
  const quando = new Date(lead.updated_at ?? lead.created_at).getTime()
  if (Date.now() - quando > 15 * 60 * 1000) return json({ ok: true, skipped: 'antigo' })

  const dia = new Date().toISOString().slice(0, 10)
  try {
    const r = await sendTemplateEmailLogged(isca.modelo, lead.email, {
      idempotencyKey: `isca-${lead.material}-${lead.id}-${dia}`,
      templateData: isca.pagina
        ? { nome: lead.nome, titulo: isca.titulo, link: `${SITE_URL}${isca.pagina}`, pdf: `${SITE_URL}${isca.arquivo}` }
        : { nome: lead.nome, link: `${SITE_URL}${isca.arquivo}` },
    })
    return json({ ok: true, sent: r.sent })
  } catch (e) {
    console.error('isca email failed', e instanceof Error ? e.message : e)
    return json({ error: 'falha no envio' }, 500)
  }
})
