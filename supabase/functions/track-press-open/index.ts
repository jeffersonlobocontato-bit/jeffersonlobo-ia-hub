// Pixel de rastreio de abertura de e-mail (1x1 GIF transparente).
// Pública (sem JWT), inserção via service role.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// 1x1 GIF transparente
const PIXEL = Uint8Array.from([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00,
  0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00,
  0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
  0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3b,
]);

const pixelHeaders = {
  "Content-Type": "image/gif",
  "Content-Length": String(PIXEL.length),
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  "Pragma": "no-cache",
  "Access-Control-Allow-Origin": "*",
};

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const sendId = url.searchParams.get("s");

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

        // Não bloqueia a resposta do pixel se a inserção falhar
        admin
          .from("press_email_opens")
          .insert({ send_id: sendId, user_agent: ua, ip_hash: ipHash })
          .then(({ error }) => {
            if (error) console.error("insert open error:", error.message);
          });
      }
    }
  } catch (e) {
    console.error("track-press-open error:", e instanceof Error ? e.message : e);
  }

  return new Response(PIXEL, { status: 200, headers: pixelHeaders });
});
