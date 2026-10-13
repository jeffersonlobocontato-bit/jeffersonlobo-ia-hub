import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SEO } from '@/components/SEO';
import { produtoPorSlug } from '@/content/cursos/produtos';
import '@/styles/cursos-area.css';

// Entrada da área do aluno. O padrão é o link mágico por e-mail (sem senha);
// "entrar com senha" existe para o login de teste que a Hotmart pede na
// aprovação do produto e para o admin.
const Entrar = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading, signIn } = useAuth();
  const curso = produtoPorSlug(params.get('curso') ?? 'ilha') ?? produtoPorSlug('ilha')!;
  const voltaParam = params.get('volta');
  const volta = voltaParam && voltaParam.startsWith('/cursos/') ? voltaParam : `/cursos/${curso.slug}/aulas`;

  const [email, setEmail] = useState(params.get('email') ?? '');
  const [senha, setSenha] = useState('');
  const [comSenha, setComSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) navigate(volta, { replace: true });
  }, [user, loading, navigate, volta]);

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const enviarLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValido) return setErro('Confira o e-mail.');
    setErro(null);
    setEnviando(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}${volta}`, shouldCreateUser: true },
    });
    setEnviando(false);
    if (error) {
      setErro(
        /rate|security|seconds/i.test(error.message)
          ? 'Você pediu um link há pouco. Espere um minuto e tente de novo.'
          : 'Não consegui enviar o link agora. Tente de novo em instantes.',
      );
      return;
    }
    setEnviado(true);
  };

  const entrarComSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValido || !senha) return setErro('Preencha e-mail e senha.');
    setErro(null);
    setEnviando(true);
    const { error } = await signIn(email.trim().toLowerCase(), senha);
    setEnviando(false);
    if (error) setErro('E-mail ou senha não conferem.');
  };

  return (
    <div className="ilha-area">
      <SEO title="Entrar na área do aluno | Jefferson Lobo" description="Entre na área do aluno com o e-mail da sua compra." path="/cursos/entrar" noindex />
      <div className="i-centro">
        <div className="i-caixa">
          <span className="i-kicker">Área do aluno · {curso.nome}</span>

          {enviado ? (
            <>
              <h1>Confira o seu e-mail.</h1>
              <p className="i-muted">
                Mandei um link de acesso para <b>{email.trim().toLowerCase()}</b>. Abra o e-mail neste aparelho e toque no link:
                você entra direto nas aulas.
              </p>
              <div className="i-aviso">Não chegou em 2 minutos? Olhe a caixa de spam e as promoções.</div>
              <button className="i-link" onClick={() => setEnviado(false)}>
                Usar outro e-mail ou mandar de novo
              </button>
            </>
          ) : (
            <>
              <h1>
                Entre com o <span style={{ whiteSpace: 'nowrap' }}>e-mail</span> da sua compra.
              </h1>
              <p className="i-muted">
                {comSenha ? 'Use a senha que você criou.' : 'Você recebe um link de acesso na hora. Sem senha para decorar.'}
              </p>
              <form onSubmit={comSenha ? entrarComSenha : enviarLink} style={{ display: 'grid', gap: '0.9rem' }} noValidate>
                <div className="i-campo">
                  <label htmlFor="email">E-mail</label>
                  <input id="email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" required />
                </div>
                {comSenha && (
                  <div className="i-campo">
                    <label htmlFor="senha">Senha</label>
                    <input id="senha" type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                  </div>
                )}
                {erro && <div className="i-aviso i-aviso--erro">{erro}</div>}
                <button className="i-btn i-btn--cheio" type="submit" disabled={enviando}>
                  {enviando ? 'Um instante…' : comSenha ? 'Entrar' : 'Receber o link de acesso'}
                </button>
              </form>
              <button
                className="i-link"
                onClick={() => {
                  setComSenha((v) => !v);
                  setErro(null);
                }}
              >
                {comSenha ? 'Prefiro receber um link por e-mail' : 'Prefiro entrar com senha'}
              </button>
            </>
          )}

          <hr style={{ border: 0, borderTop: '1px solid var(--i-line2)', margin: '0.2rem 0' }} />
          <p className="i-faint" style={{ fontSize: '0.88rem' }}>
            Ainda não é aluno? <Link to={curso.pagina}>{curso.tipo === 'pocket' ? 'Conheça o pocket' : 'Conheça o curso'}</Link>. Precisa de ajuda?{' '}
            <a href={curso.suporteWhatsApp} target="_blank" rel="noopener">
              Fale com o suporte
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Entrar;
