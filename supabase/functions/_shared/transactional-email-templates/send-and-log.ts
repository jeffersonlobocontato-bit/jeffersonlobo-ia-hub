// Envia um modelo pelo helper gerenciado e mantém o histórico em email_send_log
// (mesmos status de antes: 'sent', 'suppressed', 'failed').
import { createClient } from 'npm:@supabase/supabase-js@2'
import { sendTemplateEmail, type SendTemplateEmailOptions, type SendTemplateEmailResult } from './send-email.ts'

function adminClient() {
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  return url && key ? createClient(url, key) : null
}

async function registrar(row: Record<string, unknown>) {
  const db = adminClient()
  if (!db) return
  const { error } = await db.from('email_send_log').insert(row)
  if (error) console.error('email_send_log insert failed', { code: error.code, message: error.message })
}

export async function sendTemplateEmailLogged(
  templateName: string,
  to: string,
  options: SendTemplateEmailOptions = {},
): Promise<SendTemplateEmailResult> {
  try {
    const result = await sendTemplateEmail(templateName, to, options)
    await registrar({
      message_id: null,
      template_name: templateName,
      recipient_email: to,
      status: result.sent ? 'sent' : 'suppressed',
    })
    return result
  } catch (error) {
    await registrar({
      message_id: null,
      template_name: templateName,
      recipient_email: to,
      status: 'failed',
      error_message: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}
