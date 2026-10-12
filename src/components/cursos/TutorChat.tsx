import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { modoDemo } from '@/lib/cursos';

type Msg = { role: 'user' | 'assistant'; content: string };

type Props = {
  curso: string;
  /** título da aula aberta, para o Tutor priorizar o conteúdo dela */
  aula: string;
  sugestoes: string[];
  suporte: string;
};

const BOAS_VINDAS =
  'Oi! Eu sou o Tutor da Ilha, uma IA que conhece todas as aulas e manuais deste curso. Pergunte o que travou: eu respondo com base no que o Jefferson ensina e digo em que aula está.';

const RESPOSTA_DEMO =
  'Isso está na Aula 1, passo 4: quando o Claude criar a tarefa agendada, aprove o cartão e ligue a opção "Aprovar automaticamente". Sem isso, a cada vídeo a edição para e fica esperando por você.';

const TutorChat = ({ curso, aula, sugestoes, suporte }: Props) => {
  const [aberto, setAberto] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const fim = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fim.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [msgs, enviando]);

  useEffect(() => {
    if (aberto) campo.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAberto(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [aberto]);

  const perguntar = async (pergunta: string) => {
    const p = pergunta.trim();
    if (!p || enviando) return;
    const proximas: Msg[] = [...msgs, { role: 'user', content: p }];
    setMsgs(proximas);
    setTexto('');
    setErro(null);
    setEnviando(true);
    try {
      if (modoDemo()) {
        await new Promise((r) => setTimeout(r, 700));
        setMsgs([...proximas, { role: 'assistant', content: RESPOSTA_DEMO }]);
        return;
      }
      const { data, error } = await supabase.functions.invoke('curso-tutor', {
        body: { curso, aula, mensagens: proximas },
      });
      if (error) {
        let msg = 'O Tutor não respondeu. Tente de novo.';
        try {
          const corpo = await (error as any).context?.json?.();
          if (corpo?.error) msg = corpo.error;
        } catch {
          /* mantém a mensagem padrão */
        }
        throw new Error(msg);
      }
      setMsgs([...proximas, { role: 'assistant', content: data?.resposta ?? '...' }]);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'O Tutor não respondeu. Tente de novo.');
      setMsgs(msgs);
      setTexto(p);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      {!aberto && (
        <button className="i-btn i-btn--cheio i-tutor-botao" onClick={() => setAberto(true)}>
          <MessageCircle size={18} aria-hidden /> Tirar dúvidas
        </button>
      )}
      {aberto && (
        <>
          <div className="i-fundo" onClick={() => setAberto(false)} aria-hidden />
          <aside className="i-tutor" role="dialog" aria-label="Tutor da Ilha">
            <div className="i-tutor__topo">
              <div>
                <span className="i-kicker">Tutor da Ilha · IA</span>
                <div>
                  <b>Dúvidas sobre {aula}</b>
                </div>
              </div>
              <button className="i-btn i-btn--pequeno" onClick={() => setAberto(false)} aria-label="Fechar o Tutor">
                <X size={16} aria-hidden />
              </button>
            </div>

            <div className="i-tutor__msgs" aria-live="polite">
              <div className="i-msg i-msg--tutor">{BOAS_VINDAS}</div>
              {msgs.length === 0 && (
                <div className="i-sugestoes">
                  {sugestoes.map((s) => (
                    <button key={s} onClick={() => perguntar(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {msgs.map((m, i) => (
                <div key={i} className={`i-msg ${m.role === 'user' ? 'i-msg--aluno' : 'i-msg--tutor'}`}>
                  {m.content}
                </div>
              ))}
              {enviando && <div className="i-msg i-msg--tutor i-faint">Pensando…</div>}
              {erro && (
                <div className="i-aviso i-aviso--erro">
                  {erro}{' '}
                  <a href={suporte} target="_blank" rel="noopener">
                    Falar com o suporte
                  </a>
                </div>
              )}
              <div ref={fim} />
            </div>

            <form
              className="i-tutor__form"
              onSubmit={(e) => {
                e.preventDefault();
                perguntar(texto);
              }}
            >
              <textarea
                ref={campo}
                rows={2}
                value={texto}
                maxLength={1500}
                placeholder="Escreva a sua dúvida"
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    perguntar(texto);
                  }
                }}
              />
              <button className="i-btn i-btn--cheio" type="submit" disabled={enviando || !texto.trim()} aria-label="Enviar pergunta">
                <Send size={16} aria-hidden />
              </button>
            </form>
          </aside>
        </>
      )}
    </>
  );
};

export default TutorChat;
