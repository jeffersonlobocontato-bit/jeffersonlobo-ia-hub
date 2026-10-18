import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Check, Download, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { db } from '@/lib/cursos';
import { useTrackCTA } from '@/hooks/useTrackCTA';
import { EVENTO_ISCA, ISCAS, ISCA_SKILLS, type Isca } from '@/content/cursos/iscas';
import { VERSAO_PRIVACIDADE } from '@/content/cursos/privacidade';
import { origemParaConversao } from '@/lib/traffic-source';
import { trackLead } from '@/lib/metaPixel';

// Materiais gratuitos na vitrine (/cursos#ebook-gratis): um seletor com o
// e-book e os guias; o formulário é o mesmo para todos. Captura nome, e-mail e
// WhatsApp (obrigatório) com consentimento para comunicações e remarketing,
// grava pelo RPC registrar_lead_academia (um registro por material) e manda o
// link por e-mail. O material fica disponível na hora, na própria página.
//
// Link direto para um material: /cursos?isca=guia-foto-que-vende#ebook-gratis
// (aceita o material inteiro ou sem o prefixo "guia-").

const ERROS: Record<string, string> = {
  nome_invalido: 'Escreva o seu nome.',
  email_invalido: 'Confira o e-mail.',
  whatsapp_invalido: 'Confira o WhatsApp, com DDD.',
};

const CHAVE_LEAD = 'academia_lead';

type Contato = { nome: string; email: string; whatsapp: string };

function lerContato(): Contato | null {
  try {
    const c = JSON.parse(localStorage.getItem(CHAVE_LEAD) ?? 'null');
    return c && typeof c.email === 'string' ? c : null;
  } catch {
    return null;
  }
}

function guardarContato(c: Contato) {
  try {
    localStorage.setItem(CHAVE_LEAD, JSON.stringify(c));
  } catch {
    /* navegador sem armazenamento: só não pré-preenche da próxima vez */
  }
}

function iscaDaUrl(): Isca | null {
  if (typeof window === 'undefined') return null;
  const pedida = new URLSearchParams(window.location.search).get('isca')?.toLowerCase();
  if (!pedida) return null;
  return ISCAS.find((i) => i.material === pedida || i.material === `guia-${pedida}`) ?? null;
}

/** WhatsApp brasileiro com DDD: devolve só os dígitos (sem o 55) ou null se
 *  não parecer um número de verdade (DDD inválido, celular sem o 9, número
 *  repetido como 99999-9999 ou sequência como 12345-6789). */
function whatsappValido(bruto: string): string | null {
  let d = bruto.replace(/\D/g, '');
  if ((d.length === 12 || d.length === 13) && d.startsWith('55')) d = d.slice(2);
  if (d.length !== 10 && d.length !== 11) return null;
  const ddd = Number(d.slice(0, 2));
  if (ddd < 11 || ddd > 99 || d[0] === '0' || d[1] === '0') return null;
  const numero = d.slice(2);
  if (d.length === 11 && numero[0] !== '9') return null;
  if (/^(\d)\1+$/.test(numero) || /^(\d)\1+$/.test(numero.slice(1))) return null;
  if ('01234567890123456789'.includes(numero) || '98765432109876543210'.includes(numero)) return null;
  return d;
}

/** Máscara leve enquanto digita: (41) 99999-0000 */
function mascara(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export default function IscaEbook() {
  const { trackCTA } = useTrackCTA();
  const secao = useRef<HTMLElement>(null);
  const [ativa, setAtiva] = useState<Isca>(() => iscaDaUrl() ?? ISCA_SKILLS);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [aceite, setAceite] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  // materiais liberados nesta visita: material -> primeiro nome e e-mail
  const [liberados, setLiberados] = useState<Record<string, { nome: string; email: string }>>({});

  // quem já se cadastrou antes chega com os campos preenchidos
  useEffect(() => {
    const c = lerContato();
    if (c) {
      setNome(c.nome);
      setEmail(c.email);
      setWhatsapp(mascara(c.whatsapp));
    }
  }, []);

  // link direto (?isca=): leva até a seção depois que a página monta
  useEffect(() => {
    if (!iscaDaUrl()) return;
    const t = window.setTimeout(() => secao.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    return () => window.clearTimeout(t);
  }, []);

  // cards do catálogo pedem um material: seleciona e leva até o formulário
  useEffect(() => {
    const abrir = (ev: Event) => {
      const material = (ev as CustomEvent<string>).detail;
      const i = ISCAS.find((x) => x.material === material);
      if (!i) return;
      setAtiva(i);
      setErro('');
      setAceite(false);
      secao.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    window.addEventListener(EVENTO_ISCA, abrir);
    return () => window.removeEventListener(EVENTO_ISCA, abrir);
  }, []);

  const escolher = (i: Isca) => {
    if (i.material === ativa.material) return;
    setAtiva(i);
    setErro('');
    setAceite(false);
    void trackCTA(`isca_${i.material}_selecionar`, 'vitrine');
  };

  const enviar = async (ev: FormEvent) => {
    ev.preventDefault();
    setErro('');
    const n = nome.trim();
    const em = email.trim().toLowerCase();
    const zap = whatsappValido(whatsapp);
    if (n.length < 2) return setErro(ERROS.nome_invalido);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return setErro(ERROS.email_invalido);
    if (!zap) return setErro(ERROS.whatsapp_invalido);
    if (!aceite) return setErro('Para receber o material, marque a caixa de consentimento.');

    const isca = ativa;
    setEnviando(true);
    const { data: id, error } = await db.rpc('registrar_lead_academia', {
      p_nome: n,
      p_email: em,
      p_whatsapp: zap,
      p_material: isca.material,
      p_politica_versao: VERSAO_PRIVACIDADE,
      p_origem: origemParaConversao(),
    });
    if (error) {
      setEnviando(false);
      const chave = Object.keys(ERROS).find((k) => error.message?.includes(k));
      return setErro(chave ? ERROS[chave] : 'Não deu certo agora. Tente de novo em instantes.');
    }

    // o e-mail é um extra: se falhar, o material na página continua valendo
    void supabase.functions
      .invoke('isca-ebook-email', { body: { leadId: id } })
      .catch(() => null);
    trackLead({ content_name: isca.nomeConversao });
    void trackCTA(`isca_${isca.material}_cadastro`, 'vitrine');
    guardarContato({ nome: n, email: em, whatsapp: zap });
    setEnviando(false);
    setLiberados((l) => ({ ...l, [isca.material]: { nome: n.split(' ')[0], email: em } }));
  };

  const pronto = liberados[ativa.material];
  const ebook = ativa.material === ISCA_SKILLS.material;

  return (
    <section className="e-secao" id="ebook-gratis" ref={secao}>
      <div className="e-iscas__topo e-revela">
        <span className="e-olho">Materiais grátis</span>
        <h2 className="e-h2">Escolha por onde começar</h2>
      </div>

      <div className="e-iscas__seletor e-revela" role="tablist" aria-label="Materiais grátis">
        {ISCAS.map((i) => (
          <button
            key={i.material}
            type="button"
            role="tab"
            id={`isca-tab-${i.material}`}
            aria-selected={i.material === ativa.material}
            aria-controls="isca-painel"
            className="e-iscas__opcao"
            onClick={() => escolher(i)}
          >
            <span className="e-iscas__tema">{i.tema}</span>
            <span className="e-iscas__rotulo">{i.rotulo}</span>
            {liberados[i.material] && <Check size={14} aria-label="liberado" className="e-iscas__liberado" />}
          </button>
        ))}
      </div>

      <div className="e-isca e-revela" id="isca-painel" role="tabpanel" aria-labelledby={`isca-tab-${ativa.material}`}>
        <div className="e-isca__visual" aria-hidden>
          <span className="e-isca__selo">Grátis</span>
          <img key={ativa.capa} src={ativa.capa} alt="" width={640} height={906} loading="lazy" />
        </div>

        <div className="e-isca__texto">
          <span className="e-olho">{ativa.olho}</span>
          <h2 className="e-h2">
            {ativa.chamada.antes} <span className="e-grad">{ativa.chamada.destaque}</span>
          </h2>
          <p>{ativa.descricao}</p>
          <ul className="e-isca__lista">
            {ativa.lista.map((item) => (
              <li key={item}><Check size={16} aria-hidden /> {item}</li>
            ))}
          </ul>
        </div>

        <div className="e-isca__form">
          {pronto ? (
            <div className="e-isca__pronto" role="status">
              <span className="e-isca__ok"><Check size={22} aria-hidden /></span>
              <h3>Pronto, {pronto.nome}!</h3>
              <p>
                {ebook ? 'O e-book já pode ser baixado aqui.' : 'O guia já está liberado aqui.'} Também mandamos o link
                para <strong>{pronto.email}</strong>.
              </p>
              {ativa.pagina && (
                <a
                  className="e-btn e-btn--principal"
                  href={ativa.pagina}
                  target="_blank"
                  rel="noopener"
                  onClick={() => void trackCTA(`isca_${ativa.material}_ler`, 'vitrine')}
                >
                  <BookOpen size={18} aria-hidden /> Ler o guia
                </a>
              )}
              <a
                className={ativa.pagina ? 'e-btn e-btn--secundario' : 'e-btn e-btn--principal'}
                href={ativa.arquivo}
                download
                onClick={() => void trackCTA(`isca_${ativa.material}_download`, 'vitrine')}
              >
                <Download size={18} aria-hidden /> {ebook ? 'Baixar o e-book' : 'Baixar o PDF'}
              </a>
              <p className="e-isca__depois">
                Quer ir além? Veja a <Link to="/cursos/ilha" className="e-link">Ilha de Edição completa</Link>.
              </p>
            </div>
          ) : (
            <form onSubmit={enviar} noValidate>
              <label className="e-campo">
                <span>Nome</span>
                <input name="nome" autoComplete="given-name" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={120} required />
              </label>
              <label className="e-campo">
                <span>E-mail</span>
                <input name="email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} required />
              </label>
              <label className="e-campo">
                <span>WhatsApp, com DDD</span>
                <input name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" placeholder="(41) 99999-0000" value={whatsapp} onChange={(e) => setWhatsapp(mascara(e.target.value))} maxLength={16} required />
                <small>{ativa.motivoWhatsapp}</small>
              </label>
              <label className="e-isca__aceite">
                <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} />
                <span>
                  Quero receber {ebook ? 'o e-book' : 'o guia'} e aceito que a Academia jeffersonlobo.tech (Agência de
                  Inteligência Vozes) me envie conteúdos e ofertas por e-mail e WhatsApp e me mostre anúncios
                  personalizados, conforme a{' '}
                  <Link to="/cursos/privacidade" target="_blank" className="e-link">política de privacidade</Link>. Posso
                  cancelar quando quiser.
                </span>
              </label>
              {erro && <p className="e-isca__erro" role="alert">{erro}</p>}
              <button type="submit" className="e-btn e-btn--principal e-isca__botao" disabled={enviando}>
                {enviando ? <Loader2 size={18} className="e-gira" aria-hidden /> : null}
                {enviando ? 'Enviando…' : ativa.botao}
                {!enviando && <ArrowRight size={18} aria-hidden />}
              </button>
              <p className="e-isca__nota">Liberado na hora e enviado ao seu e-mail. Sem spam.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
