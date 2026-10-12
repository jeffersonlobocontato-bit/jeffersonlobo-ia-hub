import { useEffect, useRef } from 'react';
import { SEO } from '@/components/SEO';
import { CURSO_ILHA } from '@/content/cursos/ilha';
import { LP_CSS, LP_HTML } from './ilha-lp.generated';
import { iniciarLP } from './ilhaLPScript';

// Página de vendas do curso (jeffersonlobo.tech/cursos/ilha). É a página de
// vendas aprovada, com o visual próprio da Ilha; o CSS entra só enquanto ela
// está aberta e sai quando o visitante navega para outra página do site.
const IlhaVendas = () => {
  const raiz = useRef<HTMLDivElement>(null);

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
        })
      : () => {};

    return () => {
      parar();
      estilo.remove();
      document.body.style.backgroundColor = fundoAnterior;
    };
  }, []);

  return (
    <>
      <SEO
        title="Ilha de Edição completa: agora você faz seu conteúdo sozinho no Claude | Jefferson Lobo"
        description={CURSO_ILHA.descricao}
        path="/cursos/ilha"
        ogImage="https://jeffersonlobo.tech/cursos-ilha/produto.jpg"
      />
      <div ref={raiz} className="ilha-lp" dangerouslySetInnerHTML={{ __html: LP_HTML }} />
    </>
  );
};

export default IlhaVendas;
