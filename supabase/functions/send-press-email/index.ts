// Disparo de email da base de imprensa via Brevo (Connector Gateway).
// Admin-only. Faz throttle, renderiza variáveis e registra em press_sends.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/brevo";
const SENDER_EMAIL = "contato@jeffersonlobo.tech";
const SENDER_NAME = "Jefferson Lobo";

type Contact = {
  id: string;
  contato: string | null;
  veiculo: string;
  municipio: string | null;
  regiao: string | null;
  cargo: string | null;
  meio: string | null;
  email: string | null;
  opt_out: boolean;
};

function firstName(full: string | null | undefined): string {
  if (!full) return "colega";
  const f = full.trim().split(/\s+/)[0] || "colega";
  return f.charAt(0).toUpperCase() + f.slice(1).toLowerCase();
}

function render(tpl: string, c: Contact): string {
  const vars: Record<string, string> = {
    contato: c.contato || `redação do ${c.veiculo}`,
    primeiro_nome: firstName(c.contato),
    veiculo: c.veiculo || "",
    municipio: c.municipio || "",
    regiao: c.regiao || "",
    cargo: c.cargo || "",
    meio: c.meio || "",
  };
  return tpl.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (_, k) => vars[k.toLowerCase()] ?? "");
}

function wrapHtml(body: string, contact: Contact, trackingPixelUrl: string | null): string {
  const optOutLink = `mailto:${SENDER_EMAIL}?subject=Remover%20do%20mailing&body=Por%20favor%20remover%20${encodeURIComponent(contact.email || "")}%20da%20lista.`;
  const pixel = trackingPixelUrl
    ? `<img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;opacity:0;" />`
    : "";
  return `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#111;line-height:1.5;max-width:640px;margin:0 auto;padding:24px;">
${body}
<hr style="border:none;border-top:1px solid #ddd;margin:32px 0 16px;">
<p style="font-size:13px;color:#444;line-height:1.6;margin:0 0 16px;">
Este conteúdo é compartilhado de forma colaborativa para apoiar redações e profissionais da comunicação na cobertura de temas relacionados à Inteligência Artificial, com base em pesquisas, tendências, pautas de oportunidade e artigos de opinião sobre IA, inovação, comunicação e transformação digital.
</p>
<p style="font-size:13px;color:#111;margin:0 0 16px;">
<strong>Jefferson Lobo</strong><br>
Consultor em Marketing e IA
</p>
<p style="font-size:12px;color:#666;margin:16px 0 0;">
Você está recebendo este email como contato de imprensa de <strong>${contact.veiculo}</strong>${contact.municipio ? " — " + contact.municipio : ""}.<br>
Para não receber mais comunicações, <a href="${optOutLink}" style="color:#666;">clique aqui para solicitar remoção</a>.
</p>
${pixel}
</body></html>`;
}


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurado");
    if (!BREVO_API_KEY) throw new Error("BREVO_API_KEY não configurado");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Validar admin via JWT do caller
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: isAdmin } = await userClient.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json();
    const campaign_id: string = body.campaign_id;
    const contact_ids: string[] = body.contact_ids || [];
    const subject: string = String(body.subject || "").trim();
    const html: string = String(body.html || "").trim();
    if (!campaign_id || !subject || !html || contact_ids.length === 0) {
      return new Response(JSON.stringify({ error: "invalid_input" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (contact_ids.length > 100) {
      return new Response(JSON.stringify({ error: "max_100_per_batch" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: contacts, error: cErr } = await admin
      .from("press_contacts")
      .select("id,contato,veiculo,municipio,regiao,cargo,meio,email,opt_out")
      .in("id", contact_ids);
    if (cErr) throw cErr;

    let sent = 0, skipped = 0, failed = 0;
    const errors: { id: string; error: string }[] = [];
    const TRACK_BASE = `${SUPABASE_URL}/functions/v1/track-press-open`;

    for (const c of (contacts as Contact[]) ?? []) {
      if (!c.email || c.opt_out) {
        skipped++;
        await admin.from("press_sends").upsert({
          campaign_id, contact_id: c.id, canal: "email",
          status: "pulado", error: c.opt_out ? "opt_out" : "sem_email",
        }, { onConflict: "campaign_id,contact_id" });
        continue;
      }
      try {
        // Pre-insert para obter send_id (usado no pixel de rastreio)
        const { data: pendingRow, error: pErr } = await admin
          .from("press_sends")
          .upsert(
            { campaign_id, contact_id: c.id, canal: "email", status: "pendente", error: null },
            { onConflict: "campaign_id,contact_id" }
          )
          .select("id")
          .single();
        if (pErr || !pendingRow) throw pErr || new Error("falha ao registrar envio");
        const sendId = pendingRow.id as string;
        const pixelUrl = `${TRACK_BASE}?s=${sendId}`;

        const renderedSubject = render(subject, c);
        const renderedBody = render(html, c);
        const finalHtml = wrapHtml(renderedBody, c, pixelUrl);

        const r = await fetch(`${GATEWAY_URL}/smtp/email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
            "X-Connection-Api-Key": BREVO_API_KEY,
          },
          body: JSON.stringify({
            sender: { name: SENDER_NAME, email: SENDER_EMAIL },
            to: [{ email: c.email, name: c.contato || c.veiculo }],
            subject: renderedSubject,
            htmlContent: finalHtml,
          }),
        });
        const data = await r.json();
        if (!r.ok) {
          failed++;
          const errMsg = `${r.status}: ${data?.message || data?.code || "erro"}`;
          errors.push({ id: c.id, error: errMsg });
          await admin.from("press_sends").update({
            status: "erro", error: errMsg,
          }).eq("id", sendId);
        } else {
          sent++;
          await admin.from("press_sends").update({
            status: "enviado", message_id: data?.messageId || null, sent_at: new Date().toISOString(), error: null,
          }).eq("id", sendId);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "erro";
        failed++;
        errors.push({ id: c.id, error: msg });
        await admin.from("press_sends").upsert({
          campaign_id, contact_id: c.id, canal: "email", status: "erro", error: msg,
        }, { onConflict: "campaign_id,contact_id" });
      }
      // throttle ~6/s (Brevo aceita; mantém margem)
      await new Promise((res) => setTimeout(res, 160));
    }

    // Atualiza contadores da campanha
    await admin.from("press_campaigns").update({
      total_enviado: sent, total_erro: failed, status: "concluida", sent_at: new Date().toISOString(),
    }).eq("id", campaign_id);

    return new Response(JSON.stringify({ sent, skipped, failed, errors }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "erro";
    console.error("send-press-email error:", msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
