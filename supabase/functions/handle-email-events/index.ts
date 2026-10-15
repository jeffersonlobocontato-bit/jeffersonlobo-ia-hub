import { createEmailWebhookHandler } from 'npm:@lovable.dev/email-js@0.3.1'
import { createClient } from 'npm:@supabase/supabase-js@2'

const db = () => createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

const STATUS = { bounce: 'bounced', complaint: 'complained', unsubscribe: 'suppressed' } as const
const MESSAGE = {
  bounce: 'Permanent bounce — email address is invalid or rejected',
  complaint: 'Spam complaint — recipient marked email as spam',
  unsubscribe: 'Recipient unsubscribed',
} as const

// Mantém o histórico em suppressed_emails e email_send_log (só registro, não bloqueia envios).
async function registrar(eventId: string, recipient: string, reason: 'bounce' | 'complaint' | 'unsubscribe') {
  const email = recipient.toLowerCase()
  const supabase = db()
  const { error: e1 } = await supabase
    .from('suppressed_emails')
    .upsert({ email, reason, metadata: null }, { onConflict: 'email' })
  if (e1) {
    console.error('suppressed_emails upsert failed', { code: e1.code, message: e1.message, event_id: eventId })
    throw new Error('suppressed_emails upsert failed')
  }
  const { error: e2 } = await supabase.from('email_send_log').insert({
    message_id: null,
    template_name: 'system',
    recipient_email: email,
    status: STATUS[reason],
    error_message: MESSAGE[reason],
    metadata: null,
  })
  if (e2) {
    console.error('email_send_log insert failed', { code: e2.code, message: e2.message, event_id: eventId })
    throw new Error('email_send_log insert failed')
  }
}

const handler = createEmailWebhookHandler({
  apiKey: Deno.env.get('LOVABLE_API_KEY')!,
  on: {
    'email.bounced': (event) => registrar(event.event_id, event.data.recipient, 'bounce'),
    'email.complaint': (event) => registrar(event.event_id, event.data.recipient, 'complaint'),
    'email.unsubscribed': (event) => registrar(event.event_id, event.data.recipient, 'unsubscribe'),
  },
})

Deno.serve((req) => handler(req))
