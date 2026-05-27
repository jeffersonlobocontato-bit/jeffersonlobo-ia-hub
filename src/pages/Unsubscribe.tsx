import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { SEO } from '@/components/SEO';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

type State =
  | { kind: 'loading' }
  | { kind: 'valid'; email: string }
  | { kind: 'already' }
  | { kind: 'invalid'; message: string }
  | { kind: 'success'; email: string }
  | { kind: 'submitting' };

const Unsubscribe = () => {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    document.title = 'Descadastrar — Jefferson Lobo';
    if (!token) {
      setState({ kind: 'invalid', message: 'Link inválido. Token não encontrado.' });
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: SUPABASE_ANON_KEY } }
        );
        const data = await res.json();
        if (!res.ok) {
          setState({ kind: 'invalid', message: data?.error ?? 'Link inválido ou expirado.' });
          return;
        }
        if (data?.alreadyUnsubscribed || data?.already_unsubscribed) {
          setState({ kind: 'already' });
          return;
        }
        setState({ kind: 'valid', email: data?.email ?? '' });
      } catch {
        setState({ kind: 'invalid', message: 'Não foi possível validar o link.' });
      }
    })();
  }, [token]);

  const confirm = async () => {
    setState({ kind: 'submitting' });
    try {
      const { data, error } = await supabase.functions.invoke('handle-email-unsubscribe', {
        body: { token },
      });
      if (error) throw error;
      setState({ kind: 'success', email: (data as any)?.email ?? '' });
    } catch (e: any) {
      setState({ kind: 'invalid', message: e?.message ?? 'Falha ao descadastrar.' });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <SEO
        title="Descadastrar — Jefferson Lobo"
        description="Descadastre seu email da lista de comunicação de Jefferson Lobo."
        path="/unsubscribe"
        noindex
      />
      <div className="panel-dark max-w-lg w-full p-8 md:p-10 text-center space-y-5">
        {state.kind === 'loading' && (
          <>
            <Loader2 className="w-10 h-10 mx-auto animate-spin text-primary" />
            <p className="text-muted-foreground">Validando link...</p>
          </>
        )}
        {state.kind === 'valid' && (
          <>
            <h1 className="display-title text-3xl md:text-4xl">Confirmar descadastro?</h1>
            <p className="text-muted-foreground">
              {state.email
                ? `Você não receberá mais emails em ${state.email}.`
                : 'Você não receberá mais emails desta conta.'}
            </p>
            <Button size="lg" onClick={confirm}>Confirmar descadastro</Button>
          </>
        )}
        {state.kind === 'submitting' && (
          <>
            <Loader2 className="w-10 h-10 mx-auto animate-spin text-primary" />
            <p className="text-muted-foreground">Processando...</p>
          </>
        )}
        {state.kind === 'already' && (
          <>
            <CheckCircle2 className="w-12 h-12 mx-auto text-primary" />
            <h1 className="display-title text-2xl md:text-3xl">Você já está descadastrado</h1>
            <p className="text-muted-foreground">Não enviarei mais emails para este endereço.</p>
            <Button asChild variant="outline"><Link to="/">Voltar ao site</Link></Button>
          </>
        )}
        {state.kind === 'success' && (
          <>
            <CheckCircle2 className="w-12 h-12 mx-auto text-primary" />
            <h1 className="display-title text-2xl md:text-3xl">Descadastro confirmado</h1>
            <p className="text-muted-foreground">
              {state.email ? `${state.email} ` : ''}não receberá mais emails.
            </p>
            <Button asChild variant="outline"><Link to="/">Voltar ao site</Link></Button>
          </>
        )}
        {state.kind === 'invalid' && (
          <>
            <AlertTriangle className="w-12 h-12 mx-auto text-destructive" />
            <h1 className="display-title text-2xl md:text-3xl">Link inválido</h1>
            <p className="text-muted-foreground">{state.message}</p>
            <Button asChild variant="outline"><Link to="/">Voltar ao site</Link></Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
