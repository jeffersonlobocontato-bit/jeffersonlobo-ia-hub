import { useCallback, useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// As tabelas dos cursos ainda não estão nos tipos gerados pelo Lovable
// (src/integrations/supabase/types.ts é regenerado depois da migration).
// Até lá, falamos com elas por um cliente sem tipos.
export const db = supabase as unknown as SupabaseClient<any>;

/** Modo de demonstração só no ambiente local: /cursos/ilha/aulas?demo=1 */
export const modoDemo = () =>
  import.meta.env.DEV && typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('demo');

export type EstadoAcesso = 'carregando' | 'sem-login' | 'sem-acesso' | 'ok';

export function useAcessoCurso(curso: string, userId: string | undefined, carregandoAuth: boolean) {
  const [estado, setEstado] = useState<EstadoAcesso>('carregando');

  useEffect(() => {
    if (modoDemo()) return setEstado('ok');
    if (carregandoAuth) return setEstado('carregando');
    if (!userId) return setEstado('sem-login');
    let vivo = true;
    setEstado('carregando');
    db.rpc('tem_acesso_curso', { _curso: curso }).then(({ data, error }) => {
      if (!vivo) return;
      if (error) console.error('tem_acesso_curso', error);
      setEstado(data ? 'ok' : 'sem-acesso');
    });
    return () => {
      vivo = false;
    };
  }, [curso, userId, carregandoAuth]);

  return estado;
}

export function useProgresso(curso: string, userId: string | undefined) {
  const [concluidas, setConcluidas] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (modoDemo()) return setConcluidas(new Set(['aula-1']));
    if (!userId) return;
    db.from('curso_progresso')
      .select('aula_slug')
      .eq('user_id', userId)
      .eq('curso_slug', curso)
      .then(({ data }) => setConcluidas(new Set((data ?? []).map((r: any) => r.aula_slug))));
  }, [curso, userId]);

  const alternar = useCallback(
    async (aula: string) => {
      const feita = concluidas.has(aula);
      const proximo = new Set(concluidas);
      if (feita) proximo.delete(aula);
      else proximo.add(aula);
      setConcluidas(proximo);
      if (modoDemo() || !userId) return;
      const { error } = feita
        ? await db.from('curso_progresso').delete().match({ user_id: userId, curso_slug: curso, aula_slug: aula })
        : await db.from('curso_progresso').insert({ user_id: userId, curso_slug: curso, aula_slug: aula });
      if (error) {
        console.error('progresso', error);
        setConcluidas(concluidas);
      }
    },
    [concluidas, curso, userId],
  );

  return { concluidas, alternar };
}

/** Configurações do curso que mudam sem deploy (IDs dos vídeos no Bunny). */
export function useCursoConfig(curso: string, habilitado: boolean) {
  const [config, setConfig] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!habilitado || modoDemo()) return;
    db.from('curso_config')
      .select('chave, valor')
      .eq('curso_slug', curso)
      .then(({ data }) => setConfig(Object.fromEntries((data ?? []).map((r: any) => [r.chave, r.valor]))));
  }, [curso, habilitado]);
  return config;
}

/** Link temporário (1 hora) para baixar um material do bucket privado. */
export async function linkDoMaterial(caminho: string, nomeArquivo: string) {
  const { data, error } = await db.storage.from('cursos').createSignedUrl(caminho, 3600, { download: nomeArquivo });
  if (error || !data?.signedUrl) throw error ?? new Error('sem link');
  return data.signedUrl;
}

export const urlDoVideoBunny = (biblioteca: string, video: string) =>
  `https://iframe.mediadelivery.net/embed/${encodeURIComponent(biblioteca)}/${encodeURIComponent(video)}?autoplay=false&preload=true&responsive=true`;
