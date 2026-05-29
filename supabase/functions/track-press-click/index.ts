// Rastreio de clique em links de email de imprensa.
// GET ?s=<send_id>&u=<base64url(url)> -> insere em press_email_clicks e redireciona 302 para a URL.
// Pública (sem JWT), inserção via service role.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function decodeUrl(u: string): string | null {
  try {
    // base64url -> base64
    const b64 = u.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (u.length % 4)) % 4);
    const decoded = atob(b64);
    // valida que é URL http(s)
    const url = new URL(decoded);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

const baseHeaders = { "Access-Control-Allow-Origin": "*" };

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const sendId = url.searchParams.get("s");
    const encoded = url.searchParams.get("u");
    const target = encoded ? decodeUrl(encoded) : null;

    if (!target) {
      return new Response("invalid url", { status: 400, headers: baseHeaders });
    }

    if (sendId && /^[0-9a-f-]{36}$/i.test(sendId)) {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (SUPABASE_URL && SERVICE_KEY) {
        const admin = createClient(SUPABASE_URL, SERVICE_KEY);
        const ua = req.headers.get("user-agent")?.slice(0, 500) ?? null;
        const ip =
          req.headers.get("cf-connecting-ip") ||
          req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          "";
        const ipHash = ip ? (await sha256Hex(ip)).slice(0, 32) : null;

        // valida que o send_id existe antes de inserir (evita lixo)
        try {
          const { data: existing } = await admin
            .from("press_sends")
            .select("id")
            .eq("id", sendId)
            .maybeSingle();
          if (existing) {
            const { error } = await admin
              .from("press_email_clicks")
              .insert({ send_id: sendId, url: target.slice(0, 2000), user_agent: ua, ip_hash: ipHash });
            if (error) console.error("insert click error:", error.message);
          }
        } catch (e) {
          console.error("click track error:", e instanceof Error ? e.message : e);
        }
      }
    }

    return new Response(null, {
      status: 302,
      headers: { ...baseHeaders, Location: target, "Cache-Control": "no-store" },
    });
  } catch (e) {
    console.error("track-press-click error:", e instanceof Error ? e.message : e);
    return new Response("error", { status: 500, headers: baseHeaders });
  }
});
