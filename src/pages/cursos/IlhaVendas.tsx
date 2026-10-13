import { useCallback, useEffect, useRef, useState } from 'react';
import { SEO } from '@/components/SEO';
import { CURSO_ILHA, loteAtual } from '@/content/cursos/ilha';
import CompraJanela from '@/components/cursos/CompraJanela';
import { useTrackCTA } from '@/hooks/useTrackCTA';
import { LP_CSS, LP_HTML } from './ilha-lp.generated';
import { iniciarLP } from './ilhaLPScript';

const fimLote1Curto = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' }).format(
  new Date(CURSO_ILHA.precos.fimLote1),
);

// Página de vendas do curso (jeffersonlobo.tech/cursos/ilha). É a página de
// vendas aprovada, com o visual próprio da Ilha; o CSS entra só enquanto ela
// está aberta e sai quando o visitante navega para outra página do site.
// Com pagamento 'mercadopago', os botões de compra abrem a janela de compra.
const IlhaVendas = () => {
  const raiz = useRef<HTMLDivElement>(null);
  const { trackCTA } = useTrackCTA();
  const [compraAberta, setCompraAberta] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const lote = loteAtual(CURSO_ILHA);
  const direto = CURSO_ILHA.pagamento === 'mercadopago';

  const abrirCompra = useCallback(() => {
    trackCTA('ilha_comprar', 'ilha_vendas');
    setCompraAberta(true);
  }, [trackCTA]);
  const abrirRef = useRef(abrirCompra);
  abrirRef.current = abrirCompra;

  useEffect(() => {
    const estilo = document.createElement('style');
    estilo.setAttribute('data-ilha-lp', '');
    estilo.textContent = LP_CSS;
    document.head.appendChild(estilo);
    const fundoAnterior = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#111A17';

    const parar = raiz.current
      ? iniciarLP(raiz.current, {
          checkout: CURSO_ILHA.checkout,
          fimLote1: CURSO_ILHA.precos.fimLote1,
          precos: { lote1: CURSO_ILHA.precos.lote1, lote2: CURSO_ILHA.precos.lote2 },
          bonusValor: CURSO_ILHA.bonus.valor,
          aoComprar: direto ? () => abrirRef.current() : undefined,
        })
      : () => {};

    // Voltou de um pagamento recusado: reabre a janela com o recado.
    if (direto && new URLSearchParams(window.location.search).get('pagamento') === 'recusado') {
      setAviso('O pagamento não foi aprovado. Tente de novo, com outro cartão ou com Pix.');
      setCompraAberta(true);
    }

    return () => {
      parar();
      estilo.remove();
      document.body.style.backgroundColor = fundoAnterior;
    };
  }, [direto]);

  return (
    <>
      <SEO
        title="Ilha de Edição completa: agora você faz seu conteúdo sozinho no Claude | Jefferson Lobo"
        description={CURSO_ILHA.descricao}
        path="/cursos/ilha"
        ogImage="https://jeffersonlobo.tech/cursos-ilha/produto.jpg"
      />
      <div ref={raiz} className="ilha-lp" dangerouslySetInnerHTML={{ __html: LP_HTML }} />
      {direto && (
        <CompraJanela
          aberta={compraAberta}
          onFechar={() => {
            setCompraAberta(false);
            setAviso(null);
          }}
          curso={CURSO_ILHA.slug}
          nomeCurso={CURSO_ILHA.nome}
          preco={lote.preco}
          linhaLote={lote.lote === 1 ? `Lote 1 até ${fimLote1Curto}` : 'Lote 2'}
          suporte={CURSO_ILHA.suporteWhatsApp}
          tema="ilha"
          aviso={aviso}
          onAbrirPagamento={() => trackCTA('ilha_pagamento_aberto', 'ilha_vendas')}
        />
      )}
    </>
  );
};

export default IlhaVendas;
