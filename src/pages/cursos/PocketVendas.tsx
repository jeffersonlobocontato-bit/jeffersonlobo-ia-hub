import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  ClipboardCopy,
  FileText,
  ListChecks,
  MonitorSmartphone,
  ShieldCheck,
  Stamp,
} from 'lucide-react';
import { SEO, SITE_URL } from '@/components/SEO';
import { useTrackCTA } from '@/hooks/useTrackCTA';
import { CURSO_ILHA, loteAtual } from '@/content/cursos/ilha';
import { POCKETS, VALOR_POCKETS, pocketPorPagina, reais, type Pocket } from '@/content/cursos/pockets';
import { ESCOLA } from '@/content/cursos/escola';
import EscolaTopo from '@/components/cursos/escola/EscolaTopo';
import EscolaRodape from '@/components/cursos/escola/EscolaRodape';
import CompraJanela from '@/components/cursos/CompraJanela';
import { useEscola } from '@/components/cursos/escola/useEscola';
import '@/styles/escola.css';

// Página de vendas de um pocket (/cursos/pocket/<nome>). Mesmo tema da
// vitrine; a compra abre a janela do Mercado Pago com o preço fixo do pocket
// (calculado no servidor). O conteúdo do PDF não aparece aqui: só os títulos
// dos passos e uma página de amostra em baixa resolução.

const atraso = (d: string) => ({ ['--d' as string]: d }) as React.CSSProperties;

function Pagina({ pocket }: { pocket: Pocket }) {
  const raiz = useRef<HTMLDivElement>(null);
  useEscola(raiz);
  const { trackCTA } = useTrackCTA();
  const [aberta, setAberta] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const ilha = loteAtual(CURSO_ILHA);
  const outros = POCKETS.filter((p) => p.slug !== pocket.slug);
  const preco = reais(pocket.preco);

  const comprar = useCallback(
    (onde: string) => {
      trackCTA(`pocket_${pocket.numero}_comprar_${onde}`, 'pocket_vendas');
      setAberta(true);
    },
    [pocket.numero, trackCTA],
  );

  // Voltou de um pagamento recusado: reabre a janela com o recado.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('pagamento') === 'recusado') {
      setAviso('O pagamento não foi aprovado. Tente de novo, com outro cartão ou com Pix.');
      setAberta(true);
    }
  }, []);

  const vem = [
    { icone: FileText, titulo: `${pocket.pdf.paginas} páginas em PDF`, texto: 'Direto ao ponto: um problema, um caminho, na ordem certa.' },
    {
      icone: MonitorSmartphone,
      titulo: `${pocket.pdf.telas} telas do Claude em português`,
      texto: 'Os nomes reais dos botões, para você achar cada coisa sem adivinhar.',
    },
    {
      icone: ClipboardCopy,
      titulo: `${pocket.pdf.modelos} ${pocket.pdf.modelos === 1 ? 'modelo' : 'modelos'} para copiar`,
      texto: 'Troque o que está entre colchetes e cole no Claude.',
    },
    { icone: ListChecks, titulo: 'Checklist e erros comuns', texto: 'Para conferir no fim e não cair nas armadilhas de sempre.' },
    { icone: Bot, titulo: 'Tutor IA na área do aluno', texto: 'Travou num passo? Pergunte a qualquer hora.' },
    { icone: Stamp, titulo: 'Licença pessoal', texto: "O PDF sai com o seu e-mail em cada página, com marca d'água." },
  ];

  const faq = [
    {
      p: 'Como recebo o pocket?',
      r: 'Assim que o pagamento é aprovado (no Pix, em segundos), chega no seu e-mail o link da área do aluno. O PDF fica lá para baixar quando quiser.',
    },
    {
      p: 'É um curso em vídeo?',
      r: `Não. É um tutorial em PDF de ${pocket.pdf.paginas} páginas, com as telas do Claude em português e modelos para copiar. Quer aulas em vídeo? O curso Ilha de Edição completa tem cinco.`,
    },
    { p: 'Preciso de plano pago do Claude?', r: pocket.plano },
    {
      p: 'Já comprei a Ilha de Edição. Preciso comprar?',
      r: 'Não. Os 3 pockets vêm de bônus no curso e já estão na sua área do aluno, no módulo Bônus.',
    },
    {
      p: 'E se não servir para mim?',
      r: `Você tem ${ESCOLA.garantiaDias} dias para pedir o reembolso, com devolução integral. É só pedir no atendimento, pelo Telegram.`,
    },
    {
      p: 'Posso compartilhar o PDF?',
      r: 'Não: ele é de uso pessoal e sai com o seu e-mail em cada página. As regras estão nos termos de uso.',
    },
  ];

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `Pocket ${pocket.numero}: ${pocket.nome}`,
    description: pocket.promessa,
    image: `${SITE_URL}${pocket.quadrada}`,
    brand: { '@type': 'Person', name: 'Jefferson Lobo' },
    offers: {
      '@type': 'Offer',
      price: pocket.preco.toFixed(2),
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}${pocket.pagina}`,
    },
  };

  return (
    <div className="escola e-pocket-pagina" ref={raiz}>
      <SEO
        title={`${pocket.nome}: pocket de ${preco} | Academia jeffersonlobo.tech`}
        description={`${pocket.chamada} Tutorial em PDF com as telas do Claude em português, modelos para copiar e checklist. ${preco}, acesso na hora.`}
        path={pocket.pagina}
        ogImage={`${SITE_URL}${pocket.og}`}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(ld)}</script>
      </Helmet>

      <EscolaTopo onCta={() => trackCTA('pocket_topo', 'pocket_vendas')} />

      <main>
        {/* topo */}
        <section className="e-pocket-hero">
          <div className="e-aura" aria-hidden>
            <div className="e-aura__grade" />
          </div>
          <div className="e-pocket-hero__miolo">
            <div className="e-pocket-hero__texto">
              <span className="e-selo e-entra" style={atraso('0s')}>
                <span className="e-selo__ponto" aria-hidden />
                Pocket {pocket.numero} de 3 · tutorial em PDF
              </span>
              <h1 className="e-pocket-hero__titulo e-entra" style={atraso('0.15s')}>
                {pocket.nome}
              </h1>
              <p className="e-pocket-hero__sub e-entra" style={atraso('0.3s')}>
                {pocket.promessa}
              </p>
              <div className="e-pocket-compra e-entra" style={atraso('0.45s')}>
                <div className="e-preco">
                  <b>{preco}</b>
                  <span>pagamento único · Pix, boleto ou cartão</span>
                </div>
                <button type="button" className="e-btn e-btn--principal e-pocket-compra__botao" onClick={() => comprar('topo')}>
                  Quero o pocket por {preco}
                </button>
              </div>
              <div className="e-fichas e-pocket-hero__fichas e-entra" style={atraso('0.6s')}>
                <span>Acesso na hora</span>
                <span>Telas em português</span>
                <span>Garantia de {ESCOLA.garantiaDias} dias</span>
              </div>
            </div>
            <div className="e-pocket-hero__capa e-entra" style={atraso('0.35s')}>
              <img src={pocket.capa} alt={`Capa do pocket ${pocket.nome}`} width={840} height={1189} />
            </div>
          </div>
        </section>

        {/* a dor e para quem é */}
        <section className="e-secao">
          <div className="e-pocket-dor">
            <div className="e-cab e-revela">
              <span className="e-olho">{pocket.categoria}</span>
              <h2 className="e-h2">O problema</h2>
              <p>{pocket.dor}</p>
            </div>
            <div className="e-pocket-quem e-revela" style={atraso('0.1s')}>
              <h3>É para você se</h3>
              <ul className="e-lista">
                {pocket.paraQuem.map((t) => (
                  <li key={t}>
                    <span className="e-check" aria-hidden>
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <h3 className="e-pocket-quem__antes">Antes de começar</h3>
              <ul className="e-lista">
                {pocket.antes.map((t) => (
                  <li key={t}>
                    <span className="e-ponto" aria-hidden />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* passo a passo */}
        <section className="e-secao" id="passos">
          <div className="e-cab e-revela">
            <span className="e-olho">Passo a passo</span>
            <h2 className="e-h2">O que você vai fazer</h2>
            <p>{pocket.passos.length} passos, na ordem, com a tela de cada um. Você faz junto, com o Claude aberto ao lado.</p>
          </div>
          <ol className="e-pocket-passos">
            {pocket.passos.map((s, i) => (
              <li key={s.titulo} className="e-revela" style={atraso(`${(i % 4) * 0.06}s`)}>
                <span className="e-pocket-passos__n">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{s.titulo}</h3>
                  <p>{s.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* o que vem */}
        <section className="e-secao">
          <div className="e-pocket-vem">
            <div>
              <div className="e-cab e-revela">
                <span className="e-olho">O que vem</span>
                <h2 className="e-h2">Um PDF para fazer junto, não para ler e esquecer</h2>
              </div>
              <ul className="e-recursos e-recursos--duplo">
                {vem.map((r, i) => (
                  <li key={r.titulo} className="e-recurso e-revela" style={atraso(`${(i % 2) * 0.08}s`)}>
                    <span className="e-recurso__icone" aria-hidden>
                      <r.icone size={20} />
                    </span>
                    <h3>{r.titulo}</h3>
                    <p>{r.texto}</p>
                  </li>
                ))}
              </ul>
            </div>
            <figure className="e-pocket-previa e-revela" style={atraso('0.1s')}>
              <img src={pocket.previa} alt={`Uma página do pocket ${pocket.nome}`} width={400} height={567} loading="lazy" />
              <figcaption>Uma página do pocket</figcaption>
            </figure>
          </div>
          <div className="e-pocket-meio e-revela">
            <div className="e-preco">
              <b>{preco}</b>
              <span>pagamento único · acesso na hora</span>
            </div>
            <button type="button" className="e-btn e-btn--principal e-pocket-compra__botao" onClick={() => comprar('meio')}>
              Quero o pocket por {preco}
            </button>
          </div>
        </section>

        {/* pacote: os 3 de bônus na Ilha */}
        <section className="e-secao">
          <div className="e-pacote e-revela">
            <div className="e-pacote__capas" aria-hidden>
              {POCKETS.map((p) => (
                <img key={p.slug} src={p.capa} alt="" loading="lazy" />
              ))}
            </div>
            <div className="e-pacote__texto">
              <span className="e-olho">Leve os três de bônus</span>
              <h2 className="e-h2">Os 3 pockets vêm de presente no curso Ilha de Edição completa</h2>
              <p>
                Cinco aulas para montar no seu Claude um estúdio de conteúdo para o Instagram, com Tutor IA, o e-book O código invisível e
                os três pockets ({reais(VALOR_POCKETS)} avulsos) de bônus.
              </p>
              <div className="e-botoes">
                <Link
                  to={CURSO_ILHA.vitrine.pagina}
                  className="e-btn e-btn--cheio"
                  onClick={() => trackCTA(`pocket_${pocket.numero}_ver_ilha`, 'pocket_vendas')}
                >
                  Ver o curso por {reais(ilha.preco)} <ArrowRight size={16} aria-hidden />
                </Link>
                <span className="e-pacote__nota">{ilha.lote === 1 ? 'Preço do lote 1' : 'Inscrições abertas'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* outros pockets */}
        <section className="e-secao">
          <div className="e-cab e-revela">
            <span className="e-olho">Outros pockets</span>
            <h2 className="e-h2">Também por {preco}</h2>
          </div>
          <div className="e-pocket-outros">
            {outros.map((p, i) => (
              <Link
                key={p.slug}
                to={p.pagina}
                className="e-pocket-mini e-revela"
                style={atraso(`${i * 0.08}s`)}
                onClick={() => trackCTA(`pocket_${pocket.numero}_outro_${p.numero}`, 'pocket_vendas')}
              >
                <img src={p.capa} alt="" loading="lazy" width={840} height={1189} />
                <div>
                  <span className="e-olho">
                    Pocket {p.numero} · {p.categoria}
                  </span>
                  <h3>{p.nome}</h3>
                  <p>{p.chamada}</p>
                  <span className="e-pocket-mini__ver">
                    Ver o pocket <ArrowRight size={14} aria-hidden />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* perguntas */}
        <section className="e-secao">
          <div className="e-faq">
            <div className="e-cab e-revela">
              <span className="e-olho">Dúvidas</span>
              <h2 className="e-h2">Perguntas frequentes</h2>
              <p>
                Ficou alguma dúvida?{' '}
                <a href={ESCOLA.atendimento} target="_blank" rel="noopener" className="e-link">
                  Fale com o atendimento no Telegram
                </a>
                .
              </p>
              <p className="e-pocket-garantia">
                <ShieldCheck size={18} aria-hidden /> {ESCOLA.garantiaDias} dias de garantia, com devolução integral.
              </p>
            </div>
            <div className="e-faq__lista">
              {faq.map((f, i) => (
                <details key={f.p} className="e-revela" style={atraso(`${i * 0.05}s`)}>
                  <summary>
                    {f.p}
                    <ChevronDown size={18} aria-hidden />
                  </summary>
                  <p>
                    {f.r}
                    {f.p.startsWith('Posso compartilhar') && (
                      <>
                        {' '}
                        <Link to="/cursos/termos" className="e-link">
                          Ler os termos
                        </Link>
                        .
                      </>
                    )}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <EscolaRodape />

      {/* barra de compra no celular */}
      <div className="e-barra-compra" aria-hidden={aberta}>
        <div>
          <b>{preco}</b>
          <span>Pocket {pocket.numero} · PDF</span>
        </div>
        <button type="button" className="e-btn e-btn--principal" onClick={() => comprar('barra')}>
          Comprar
        </button>
      </div>

      <CompraJanela
        aberta={aberta}
        onFechar={() => {
          setAberta(false);
          setAviso(null);
        }}
        curso={pocket.slug}
        nomeCurso={`Pocket ${pocket.numero} · ${pocket.nome}`}
        preco={pocket.preco}
        linhaLote="PDF · acesso na hora"
        formas="pagamento único · Pix, boleto ou cartão"
        suporte={ESCOLA.atendimento}
        tema="escola"
        aviso={aviso}
        onAbrirPagamento={() => trackCTA(`pocket_${pocket.numero}_pagamento_aberto`, 'pocket_vendas')}
      />
    </div>
  );
}

// A página monta de novo ao trocar de pocket (o movimento de surgir é preso
// aos elementos de cada página).
const PocketVendas = () => {
  const { pocket: nome } = useParams();
  const pocket = pocketPorPagina(nome);
  if (!pocket) return <Navigate to="/cursos#pockets" replace />;
  return <Pagina key={pocket.slug} pocket={pocket} />;
};

export default PocketVendas;
