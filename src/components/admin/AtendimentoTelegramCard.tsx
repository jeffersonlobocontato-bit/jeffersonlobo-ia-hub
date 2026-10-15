import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Bot, CheckCircle2, Power, RefreshCw, XCircle } from 'lucide-react';

type Estado = {
  ok: boolean;
  ativo?: boolean;
  url?: string | null;
  pendentes?: number;
  ultimo_erro?: string | null;
  esperando_voce?: number;
  error?: string;
};

// Liga e confere o atendimento do @JeffersonLoboBot (função telegram-atendimento):
// "Ativar" aponta o webhook do bot para a função; depois disso, quem escreve
// para o bot conversa com o assistente, que chama o Jefferson quando precisa.
export function AtendimentoTelegramCard() {
  const [carregando, setCarregando] = useState<string | null>(null);
  const [estado, setEstado] = useState<Estado | null>(null);

  const chamar = async (acao: 'status' | 'ativar' | 'desativar') => {
    setCarregando(acao);
    const { data, error } = await supabase.functions.invoke('telegram-atendimento', { body: { acao } });
    setCarregando(null);
    if (error) {
      setEstado({ ok: false, error: error.message });
      if (acao !== 'status') toast.error('Falha ao chamar a função', { description: error.message });
      return;
    }
    setEstado(data);
    if (acao === 'ativar') {
      if (data?.ok && data?.ativo) toast.success('Atendimento ligado no @JeffersonLoboBot');
      else toast.error('Não consegui ligar', { description: data?.error });
    }
    if (acao === 'desativar') {
      if (data?.ok) toast.success('Atendimento desligado');
      else toast.error('Não consegui desligar', { description: data?.error });
    }
  };

  useEffect(() => {
    void chamar('status');
  }, []);

  return (
    <div className="border-2 border-primary/30 bg-card p-4 md:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div>
          <h2 className="font-black uppercase text-lg flex items-center gap-2">
            <Bot className="w-5 h-5" /> Atendimento no Telegram
          </h2>
          <p className="text-xs text-muted-foreground">
            O assistente do <a className="underline" href="https://t.me/JeffersonLoboBot" target="_blank" rel="noreferrer">@JeffersonLoboBot</a> responde
            com base no site e passa a conversa para você no chat dos avisos. Responda (reply) à mensagem encaminhada para falar com a pessoa;
            responda com <code>/encerrar</code> para devolver ao assistente.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => chamar('status')} disabled={!!carregando}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {carregando === 'status' ? 'Conferindo...' : 'Conferir'}
          </Button>
          {estado?.ativo ? (
            <Button variant="outline" onClick={() => chamar('desativar')} disabled={!!carregando}>
              <Power className="w-4 h-4 mr-2" />
              {carregando === 'desativar' ? 'Desligando...' : 'Desligar'}
            </Button>
          ) : (
            <Button onClick={() => chamar('ativar')} disabled={!!carregando}>
              <Power className="w-4 h-4 mr-2" />
              {carregando === 'ativar' ? 'Ligando...' : 'Ativar atendimento'}
            </Button>
          )}
        </div>
      </div>

      {estado && (
        <div className={`text-sm border-2 p-3 ${estado.ok && estado.ativo ? 'border-green-500/40 bg-green-500/5' : 'border-destructive/40 bg-destructive/5'}`}>
          <div className="flex items-center gap-2 font-bold uppercase mb-2">
            {estado.ok && estado.ativo ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-600" /> Ligado
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-destructive" /> {estado.ok ? 'Desligado' : 'Erro'}
              </>
            )}
          </div>
          <ul className="space-y-1 text-xs break-all">
            {estado.ok && <li>Esperando por você: {estado.esperando_voce ?? 0}</li>}
            {estado.ok && !!estado.pendentes && <li>Mensagens na fila do Telegram: {estado.pendentes}</li>}
            {estado.url && !estado.ativo && <li className="font-mono">O bot está apontado para outro endereço: {estado.url}</li>}
            {estado.ultimo_erro && <li>Último erro do Telegram: {estado.ultimo_erro}</li>}
            {estado.error && <li className="font-mono">{estado.error}</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
