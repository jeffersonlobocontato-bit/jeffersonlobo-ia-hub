import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Only admins can trigger
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace('Bearer ', '');
  const { data: userData } = await supabase.auth.getUser(token);
  if (!userData?.user) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: corsHeaders });
  }
  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userData.user.id)
    .eq('role', 'admin')
    .maybeSingle();
  if (!role) {
    return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: corsHeaders });
  }

  const { data: cases, error } = await supabase
    .from('product_cases')
    .select('id, image_url')
    .like('image_url', '%/object/public/product-cases/%');
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }

  const results: unknown[] = [];
  for (const c of cases ?? []) {
    const oldPath = c.image_url.split('/object/public/product-cases/')[1];
    if (!oldPath) continue;
    const { data: file, error: dlErr } = await supabase.storage.from('product-cases').download(oldPath);
    if (dlErr || !file) {
      results.push({ id: c.id, ok: false, error: dlErr?.message });
      continue;
    }
    const newPath = `product-cases/${oldPath}`;
    const bytes = await file.arrayBuffer();
    const { error: upErr } = await supabase.storage
      .from('blog-covers')
      .upload(newPath, bytes, { upsert: true, contentType: file.type || 'image/png' });
    if (upErr) {
      results.push({ id: c.id, ok: false, error: upErr.message });
      continue;
    }
    const { data: pub } = supabase.storage.from('blog-covers').getPublicUrl(newPath);
    await supabase.from('product_cases').update({ image_url: pub.publicUrl }).eq('id', c.id);
    await supabase.storage.from('product-cases').remove([oldPath]);
    results.push({ id: c.id, ok: true, url: pub.publicUrl });
  }

  return new Response(JSON.stringify({ migrated: results }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
