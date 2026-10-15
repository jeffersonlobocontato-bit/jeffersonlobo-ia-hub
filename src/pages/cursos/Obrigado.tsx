import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { produtoPorSlug } from '@/content/cursos/produtos';
import { CURSO_ILHA, loteAtual } from '@/content/cursos/ilha';
import { pocketPorSlug } from '@/content/cursos/pockets';
import EscolaTopo from '@/components/cursos/escola/EscolaTopo';
import { useEscola } from '@/components/cursos/escola/useEscola';
import { confirmarCompra, emailLembrado, statusDoPedido } from '@/lib/pagamento';
import { trackPurchase } from '@/lib/metaPixel';
import '@/styles/escola.css';

const FINAIS = new Set(['aprovado', 'recusado', 'cancelado', 'reembolsado', 'contestado']);
const INTERVALO = 5000;
const MAX_TENTATIVAS = 36; // 3 minutos

// Volta do Mercado Pago. Pede a confirmação do pagamento (libera o acesso na
// hora, mesmo que o aviso do webhook ainda não tenha chegado) e acompanha o
// status do pedido enquanto ele estiver pendente.
const Obrigado = () => {
  const raiz = useRef<HTMLDivElement>(null);
  useEscola(raiz);
  const [params] = useSearchParams();
  const pedido = params.get('pedido');
  const pagamento = params.get('payment_id') ?? params.get('collection_id');
  const [status, setStatus] = useState<string | null>(null);
  const [acompanhando, setAcompanhando] = useState(true);
  const email = emailLembrado();
  // o Mercado Pago devolve com ?curso=<slug> (pedidos antigos não têm: Ilha)
  const curso = produtoPorSlug(params.get('curso')) ?? produtoPorSlug('ilha')!;
  const ehPocket = curso.tipo === 'pocket';

  useEffect(() => {
    if (!pedido || !/^[0-9a-f-]{36}$/i.test(pedido)) {
      setAcompanhando(false);
      return;
    }
    let vivo = true;
    let tentativas = 0;
    let relogio = 0;
    const seguir = (s: string | null) => {
      if (!vivo) return;
      if (s) setStatus(s);
      if ((s && FINAIS.has(s)) || ++tentativas > MAX_TENTATIVAS) {
        setAcompanhando(false);
        return;
      }
      relogio = window.setTimeout(async () => seguir(await statusDoPedido(pedido)), INTERVALO);
    };
    confirmarCompra(pedido, pagamento).then(seguir);
    return () => {
      vivo = false;
      window.clearTimeout(relogio);
    };
  }, [pedido, pagamento]);

  // Compra aprovada: um único evento Purchase por pedido (a marca fica no
  // localStorage, dentro da própria função).
  useEffect(() => {
    if (status !== 'aprovado' || !pedido) return;
    const preco = ehPocket ? pocketPorSlug(curso.slug)?.preco : loteAtual(CURSO_ILHA).preco;
    if (preco == null) return;
    trackPurchase({ value: preco, content_name: curso.nome, pedido });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, pedido]);

  const entrar = `/cursos/entrar?curso=${curso.slug}${email ? `&email=${encodeURIComponent(email)}` : ''}`;
  const aprovado = status === 'aprovado';
  const falhou = status === 'recusado' || status === 'cancelado';
  const devolvido = status === 'reembolsado' || status === 'contestado';

  return (
    <div className="escola" ref={raiz}>
      <SEO title="Obrigado | Jefferson Lobo" description="Confirmação da sua compra." path="/cursos/obrigado" noindex />
      <EscolaTopo />
      <main className="e-obrigado">
        <div className="e-aura" aria-hidden>
          <div className="e-aura__grade" />
          <div className="e-aura__arco" style={{ top: '70%' }} />
        </div>
        <section className="e-obrigado__caixa e-entra" aria-live="polite">
          {aprovado ? (
            <>
              <span className="e-obrigado__icone e-obrigado__icone--ok">
                <CheckCircle2 size={30} aria-hidden />
              </span>
              <span className="e-olho">Pagamento aprovado</span>
              <h1>{ehPocket ? 'O seu pocket chegou!' : 'Bem-vindo à Ilha!'}</h1>
              <p>
                {email ? (
                  <>
                    Mandei o link de acesso para <b>{email}</b>.
                  </>
                ) : (
                  <>Mandei o link de acesso para o e-mail que você informou.</>
                )}{' '}
                Você também pode entrar agora mesmo:
              </p>
              <Link to={entrar} className="e-btn e-btn--principal">
                {ehPocket ? 'Baixar o meu pocket' : 'Entrar na área do aluno'}
              </Link>
              <small>Não achou o e-mail? Olhe a caixa de spam e as promoções.</small>
            </>
          ) : falhou ? (
            <>
              <span className="e-obrigado__icone e-obrigado__icone--erro">
                <XCircle size={30} aria-hidden />
              </span>
              <span className="e-olho">Pagamento não aprovado</span>
              <h1>Não deu certo desta vez.</h1>
              <p>Nenhum valor foi cobrado. Tente de novo, com outro cartão ou com Pix.</p>
              <Link to={curso.pagina} className="e-btn e-btn--principal">
                Tentar de novo
              </Link>
            </>
          ) : devolvido ? (
            <>
              <span className="e-obrigado__icone e-obrigado__icone--erro">
                <XCircle size={30} aria-hidden />
              </span>
              <span className="e-olho">Pedido encerrado</span>
              <h1>Este pagamento foi devolvido.</h1>
              <p>Se isso foi um engano, fale com o atendimento no Telegram.</p>
            </>
          ) : pedido ? (
            <>
              <span className="e-obrigado__icone">
                {acompanhando ? <span className="e-obrigado__giro" aria-hidden /> : <Clock size={30} aria-hidden />}
              </span>
              <span className="e-olho">Pedido recebido</span>
              <h1>Estamos confirmando o seu pagamento.</h1>
              <p>
                No Pix, costuma cair em segundos. No boleto, leva até 3 dias úteis. Assim que for aprovado, o acesso chega no seu e-mail
                {email ? (
                  <>
                    {' '}
                    (<b>{email}</b>)
                  </>
                ) : null}
                . Pode fechar esta página.
              </p>
            </>
          ) : (
            <>
              <span className="e-obrigado__icone">
                <Clock size={30} aria-hidden />
              </span>
              <span className="e-olho">Compra</span>
              <h1>Não encontrei o seu pedido.</h1>
              <p>Se você acabou de pagar, o acesso chega no seu e-mail assim que o pagamento for aprovado.</p>
              <Link to={entrar} className="e-btn e-btn--secundario">
                Entrar na área do aluno
              </Link>
            </>
          )}
          <p className="e-obrigado__ajuda">
            Precisa de ajuda?{' '}
            <a href={curso.suporte} target="_blank" rel="noopener">
              Fale com o atendimento no Telegram
            </a>
            .
          </p>
        </section>
      </main>
    </div>
  );
};

export default Obrigado;
