import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Send, CheckCircle2, XCircle } from 'lucide-react';

export function TelegramTestCard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | {
    ok: boolean;
    message_id?: number;
    chat_id_used?: string;
    error?: string;
    status?: number;
    telegram_response?: unknown;
  }>(null);

  const onTest = async () => {
    setLoading(true);
    setResult(null);
    const text = `✅ Teste do painel admin — ${new Date().toLocaleString('pt-BR')}`;
    const { data, error } = await supabase.functions.invoke('notify-telegram', {
      body: { text, test: true },
    });
    setLoading(false);

    if (error) {
      setResult({ ok: false, error: error.message });
      toast.error('Falha ao chamar a função', { description: error.message });
      return;
    }
    setResult(data);
    if (data?.ok) {
      toast.success('Mensagem enviada ao Telegram');
    } else {
      toast.error('Telegram recusou a mensagem', { description: data?.error });
    }
  };

  return (
    <div className="border-2 border-primary/30 bg-card p-4 md:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div>
          <h2 className="font-black uppercase text-lg">Diagnóstico Telegram</h2>
          <p className="text-xs text-muted-foreground">
            Envia uma mensagem de teste usando o <code>TELEGRAM_CHAT_ID</code> configurado.
          </p>
        </div>
        <Button onClick={onTest} disabled={loading}>
          <Send className="w-4 h-4 mr-2" />
          {loading ? 'Enviando...' : 'Enviar mensagem de teste'}
        </Button>
      </div>

      {result && (
        <div
          className={`text-sm border-2 p-3 ${
            result.ok ? 'border-green-500/40 bg-green-500/5' : 'border-destructive/40 bg-destructive/5'
          }`}
        >
          <div className="flex items-center gap-2 font-bold uppercase mb-2">
            {result.ok ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-600" /> Sucesso
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-destructive" /> Erro
              </>
            )}
          </div>
          <ul className="space-y-1 font-mono text-xs break-all">
            {result.chat_id_used && <li>chat_id_used: {result.chat_id_used}</li>}
            {result.message_id !== undefined && <li>message_id: {result.message_id}</li>}
            {result.status !== undefined && <li>status: {result.status}</li>}
            {result.error && <li>error: {result.error}</li>}
            {result.telegram_response != null && (
              <li>telegram_response: {JSON.stringify(result.telegram_response)}</li>
            )}
          </ul>
          {!result.ok && (
            <p className="text-xs text-muted-foreground mt-2">
              Dica: se aparecer <code>chat not found</code>, o <code>TELEGRAM_CHAT_ID</code> está incorreto.
              Para chat privado, mande <code>/start</code> para <a className="underline" href="https://t.me/userinfobot" target="_blank" rel="noreferrer">@userinfobot</a> e use o ID numérico retornado.
              Para grupo, adicione o bot, mande qualquer mensagem e use o ID negativo (ex.: <code>-1001234567890</code>).
            </p>
          )}
        </div>
      )}
    </div>
  );
}
