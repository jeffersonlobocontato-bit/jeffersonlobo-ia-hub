import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, X } from 'lucide-react';
import { criarCompra, lembrarEmail } from '@/lib/pagamento';
import { reais } from '@/content/cursos/pockets';
import '@/styles/compra.css';

type Props = {
  aberta: boolean;
  onFechar: () => void;
  curso: string;
  nomeCurso: string;
  preco: number;
  linhaLote: string;
  /** linha das formas de pagamento, abaixo do preço */
  formas?: string;
  suporte: string;
  /** 'escola' (turquesa, vitrine) ou 'ilha' (sálvia, página de vendas) */
  tema?: 'escola' | 'ilha';
  onAbrirPagamento?: () => void;
  /** recado no topo, por exemplo quando o comprador volta de um pagamento recusado */
  aviso?: string | null;
};

// Antes de ir para o Mercado Pago, pede o e-mail que vai receber o acesso:
// é por ele que o aluno entra nas aulas, então não depende do e-mail que a
// pessoa usa no Mercado Pago.
const CompraJanela = ({
  aberta,
  onFechar,
  curso,
  nomeCurso,
  preco,
  linhaLote,
  formas = 'pagamento único · Pix, boleto ou até 12x no cartão',
  suporte,
  tema = 'escola',
  onAbrirPagamento,
  aviso,
}: Props) => {
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [jaTem, setJaTem] = useState(false);
  const campo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!aberta) return;
    setErro(null);
    setJaTem(false);
    const t = window.setTimeout(() => campo.current?.focus(), 60);
    const aoTeclar = (e: KeyboardEvent) => e.key === 'Escape' && onFechar();
    window.addEventListener('keydown', aoTeclar);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = overflow;
    };
  }, [aberta, onFechar]);

  if (!aberta) return null;

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOk) return setErro('Confira o e-mail.');
    setErro(null);
    setEnviando(true);
    const r = await criarCompra(curso, email, nome);
    if ('url' in r) {
      lembrarEmail(email.trim().toLowerCase());
      onAbrirPagamento?.();
      window.location.assign(r.url);
      return;
    }
    setEnviando(false);
    if ('jaTemAcesso' in r) return setJaTem(true);
    setErro(r.erro);
  };

  return (
    <div className={`compra compra--${tema}`} role="dialog" aria-modal="true" aria-labelledby="compra-titulo">
      <div className="compra__fundo" onClick={onFechar} aria-hidden />
      <div className="compra__caixa">
        <button type="button" className="compra__fechar" onClick={onFechar} aria-label="Fechar">
          <X size={18} />
        </button>
        <span className="compra__olho">
          {nomeCurso} · {linhaLote}
        </span>
        {aviso && !jaTem && <div className="compra__aviso">{aviso}</div>}

        {jaTem ? (
          <>
            <h2 id="compra-titulo">Este e-mail já tem acesso.</h2>
            <p className="compra__texto">
              <b>{email.trim().toLowerCase()}</b> já está matriculado. É só entrar na área do aluno com ele.
            </p>
            <Link className="compra__botao" to={`/cursos/entrar?curso=${curso}&email=${encodeURIComponent(email.trim().toLowerCase())}`}>
              Entrar na área do aluno
            </Link>
            <button type="button" className="compra__link" onClick={() => setJaTem(false)}>
              Usar outro e-mail
            </button>
          </>
        ) : (
          <form onSubmit={enviar} noValidate>
            <h2 id="compra-titulo">Para onde vai o seu acesso?</h2>
            <p className="compra__texto">Use o e-mail em que você quer receber o acesso. É com ele que você entra na área do aluno.</p>
            <div className="compra__campo">
              <label htmlFor="compra-email">E-mail</label>
              <input
                ref={campo}
                id="compra-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="voce@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="compra__campo">
              <label htmlFor="compra-nome">
                Nome <small>(opcional)</small>
              </label>
              <input id="compra-nome" type="text" autoComplete="name" placeholder="Como você quer ser chamado" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            {erro && (
              <div className="compra__erro" role="alert">
                {erro}{' '}
                <a href={suporte} target="_blank" rel="noopener">
                  WhatsApp
                </a>
              </div>
            )}
            <div className="compra__total">
              <b>{reais(preco)}</b>
              <span>{formas}</span>
            </div>
            <button className="compra__botao" type="submit" disabled={enviando}>
              {enviando ? 'Abrindo o Mercado Pago…' : 'Ir para o pagamento'}
            </button>
            <p className="compra__seguro">
              <Lock size={13} aria-hidden /> Pagamento seguro na página do Mercado Pago. Seus dados de cartão não passam por este site.
            </p>
            <p className="compra__termos">
              Ao continuar, você concorda com os{' '}
              <a href="/cursos/termos" target="_blank" rel="noopener">
                termos de uso
              </a>
              , incluindo a licença pessoal e a marca d'água com o seu e-mail nos materiais.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default CompraJanela;
