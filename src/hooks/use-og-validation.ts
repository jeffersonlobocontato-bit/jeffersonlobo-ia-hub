import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type OgResult =
  | { state: 'idle' }
  | { state: 'loading' }
  | { state: 'valid'; title: string | null; description: string | null; image: string | null }
  | { state: 'invalid'; missing: string[] }
  | { state: 'error'; message: string };

const cache = new Map<string, OgResult>();

/** Valida OG tags do link, com cache em memória. */
export function useOgValidation(url: string | null | undefined) {
  const [result, setResult] = useState<OgResult>({ state: 'idle' });

  useEffect(() => {
    if (!url || !/^https?:\/\//i.test(url)) {
      setResult({ state: 'idle' });
      return;
    }
    if (cache.has(url)) {
      setResult(cache.get(url)!);
      return;
    }
    let cancelled = false;
    setResult({ state: 'loading' });
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('validate-og-tags', {
          body: { url },
        });
        if (cancelled) return;
        if (error) {
          const r: OgResult = { state: 'error', message: error.message };
          cache.set(url, r); setResult(r); return;
        }
        const r: OgResult = data?.valid
          ? { state: 'valid', title: data.og_title, description: data.og_description, image: data.og_image }
          : { state: 'invalid', missing: data?.missing ?? [] };
        cache.set(url, r); setResult(r);
      } catch (e) {
        if (cancelled) return;
        const r: OgResult = { state: 'error', message: e instanceof Error ? e.message : 'erro' };
        cache.set(url, r); setResult(r);
      }
    })();
    return () => { cancelled = true; };
  }, [url]);

  return result;
}
