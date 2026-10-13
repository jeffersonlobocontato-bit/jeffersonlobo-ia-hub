import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Download, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { db } from '@/lib/cursos';
import { useTrackCTA } from '@/hooks/useTrackCTA';
import { SITE_URL } from '@/components/SEO';
import { ISCA_SKILLS as ISCA } from '@/content/cursos/iscas';
import { VERSAO_PRIVACIDADE } from '@/content/cursos/privacidade';

// E-book gratuito na vitrine (/cursos#ebook-gratis): captura nome, e-mail e
// WhatsApp (opcional) com consentimento para comunicações e remarketing,
// grava pelo RPC registrar_lead_academia e manda o link por e-mail. O PDF
// também fica disponível na hora, na própria página.

const ERROS: Record<string, string> = {
  nome_invalido: 'Escreva o seu nome.',
  email_invalido: 'Confira o e-mail.',
  whatsapp_invalido: 'Confira o WhatsApp, com DDD. Ou deixe em branco.',
};

const UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

function origemDaVisita() {
  const q = new URLSearchParams(window.location.search);
  const origem: Record<string, string> = {};
  for (const k of UTM) {
    const v = q.get(k);
    if (v) origem[k] = v.slice(0, 200);
  }
  if (document.referrer && !document.referrer.startsWith(window.location.origin)) {
    origem.referrer = document.referrer.slice(0, 200);
  }
  return origem;
}

const hoje = () => new Date().toISOString().slice(0, 10);

export default function IscaEbook() {
  const { trackCTA } = useTrackCTA();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [aceite, setAceite] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [pronto, setPronto] = useState<{ nome: string; email: string } | null>(null);

  const enviar = async (ev: FormEvent) => {
    ev.preventDefault();
    setErro('');
    const n = nome.trim();
    const em = email.trim().toLowerCase();
    const zap = whatsapp.replace(/\D/g, '');
    if (n.length < 2) return setErro(ERROS.nome_invalido);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return setErro(ERROS.email_invalido);
    if (zap && (zap.length < 10 || zap.length > 15)) return setErro(ERROS.whatsapp_invalido);
    if (!aceite) return setErro('Para receber o e-book, marque a caixa de consentimento.');

    setEnviando(true);
    const { data: id, error } = await db.rpc('registrar_lead_academia', {
      p_nome: n,
      p_email: em,
      p_whatsapp: zap || null,
      p_material: ISCA.material,
      p_politica_versao: VERSAO_PRIVACIDADE,
      p_origem: origemDaVisita(),
    });
    if (error) {
      setEnviando(false);
      const chave = Object.keys(ERROS).find((k) => error.message?.includes(k));
      return setErro(chave ? ERROS[chave] : 'Não deu certo agora. Tente de novo em instantes.');
    }

    // o e-mail é um extra: se falhar, o download na página continua valendo
    void supabase.functions
      .invoke('send-transactional-email', {
        body: {
          templateName: ISCA.emailModelo,
          recipientEmail: em,
          idempotencyKey: `isca-${ISCA.material}-${id}-${hoje()}`,
          templateData: { nome: n, link: `${SITE_URL}${ISCA.arquivo}` },
        },
      })
      .catch(() => null);
    void trackCTA(`isca_${ISCA.material}_cadastro`, 'vitrine');
    setEnviando(false);
    setPronto({ nome: n.split(' ')[0], email: em });
  };

  return (
    <section className="e-secao" id="ebook-gratis">
      <div className="e-isca e-revela">
        <div className="e-isca__visual" aria-hidden>
          <span className="e-isca__selo">Grátis</span>
          <img src={ISCA.capa} alt="" width={640} height={906} loading="lazy" />
        </div>

        <div className="e-isca__texto">
          <span className="e-olho">E-book grátis · PDF com {ISCA.paginas} páginas</span>
          <h2 className="e-h2">
            50 skills que fazem o Claude <span className="e-grad">trabalhar por você</span>
          </h2>
          <p>
            A lista que eu queria ter quando comecei: só o que serve para quem cria conteúdo, vende e organiza o
            trabalho, sem programar. Cada skill vem com onde funciona, como instalar e um pedido pronto para copiar.
          </p>
          <ul className="e-isca__lista">
            <li><Check size={16} aria-hidden /> As 5 skills para ligar hoje</li>
            <li><Check size={16} aria-hidden /> Instalação passo a passo, no app e no Claude Code</li>
            <li><Check size={16} aria-hidden /> Como criar a skill que escreve com a sua voz</li>
          </ul>
        </div>

        <div className="e-isca__form">
          {pronto ? (
            <div className="e-isca__pronto" role="status">
              <span className="e-isca__ok"><Check size={22} aria-hidden /></span>
              <h3>Pronto, {pronto.nome}!</h3>
              <p>
                O e-book já pode ser baixado aqui. Também mandamos o link para <strong>{pronto.email}</strong>.
              </p>
              <a
                className="e-btn e-btn--principal"
                href={ISCA.arquivo}
                download
                onClick={() => void trackCTA(`isca_${ISCA.material}_download`, 'vitrine')}
              >
                <Download size={18} aria-hidden /> Baixar o e-book
              </a>
              <p className="e-isca__depois">
                Quer ir além das skills prontas? Veja a <Link to="/cursos/ilha" className="e-link">Ilha de Edição completa</Link>.
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
                <span>WhatsApp <em>(opcional)</em></span>
                <input name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" placeholder="(41) 99999-0000" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} maxLength={20} />
              </label>
              <label className="e-isca__aceite">
                <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} />
                <span>
                  Quero receber o e-book e aceito que a Academia jeffersonlobo.tech (Agência de Inteligência Vozes) me
                  envie conteúdos e ofertas por e-mail e WhatsApp e me mostre anúncios personalizados, conforme a{' '}
                  <Link to="/cursos/privacidade" target="_blank" className="e-link">política de privacidade</Link>. Posso
                  cancelar quando quiser.
                </span>
              </label>
              {erro && <p className="e-isca__erro" role="alert">{erro}</p>}
              <button type="submit" className="e-btn e-btn--principal e-isca__botao" disabled={enviando}>
                {enviando ? <Loader2 size={18} className="e-gira" aria-hidden /> : null}
                {enviando ? 'Enviando…' : 'Quero o e-book grátis'}
                {!enviando && <ArrowRight size={18} aria-hidden />}
              </button>
              <p className="e-isca__nota">Chega no seu e-mail em instantes. Sem spam.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
