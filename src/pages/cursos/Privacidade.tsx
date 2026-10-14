import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import EscolaTopo from '@/components/cursos/escola/EscolaTopo';
import EscolaRodape from '@/components/cursos/escola/EscolaRodape';
import { useEscola } from '@/components/cursos/escola/useEscola';
import { BOT_ATENDIMENTO, ESCOLA } from '@/content/cursos/escola';
import { PRIVACIDADE, PRIVACIDADE_ATUALIZADA_EM, VERSAO_PRIVACIDADE } from '@/content/cursos/privacidade';
import '@/styles/escola.css';

// Política de privacidade da Academia (/cursos/privacidade): materiais
// gratuitos e cadastro de leads. Mesmo visual dos termos de uso.
const Privacidade = () => {
  const raiz = useRef<HTMLDivElement>(null);
  useEscola(raiz);
  const f = ESCOLA.fornecedor;
  const identificacao = [f.nome, f.documento && `CNPJ ${f.documento}`, f.endereco, f.email].filter(Boolean).join(' · ');

  return (
    <div className="escola" ref={raiz}>
      <SEO
        title="Política de privacidade | Academia jeffersonlobo.tech"
        description="Como a Academia jeffersonlobo.tech trata os dados de quem baixa e-books e guias gratuitos, conforme a LGPD."
        path="/cursos/privacidade"
      />
      <EscolaTopo />
      <main className="e-termos">
        <header className="e-termos__cab e-entra">
          <span className="e-olho">Academia jeffersonlobo.tech</span>
          <h1 className="e-h2">Política de privacidade</h1>
          <p>
            Versão {VERSAO_PRIVACIDADE} · atualizada em {PRIVACIDADE_ATUALIZADA_EM}
          </p>
        </header>

        <div className="e-termos__corpo">
          <nav className="e-termos__indice" aria-label="Índice da política">
            <ol>
              {PRIVACIDADE.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>{s.titulo.replace(/^\d+\.\s*/, '')}</a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="e-termos__texto">
            {PRIVACIDADE.map((s) => (
              <section key={s.id} id={s.id}>
                <h2>{s.titulo}</h2>
                {s.paragrafos.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </section>
            ))}
            <section id="contato">
              <p>
                Pedidos sobre dados pessoais:{' '}
                <a href={`mailto:${f.email}`}>{f.email}</a> ou{' '}
                <a href={ESCOLA.atendimento} target="_blank" rel="noopener">
                  atendimento no Telegram (@{BOT_ATENDIMENTO})
                </a>
                .
              </p>
              <p className="e-termos__id">{identificacao}</p>
              <p>
                <Link to="/cursos/termos">Termos de uso dos cursos</Link> · <Link to="/cursos">Voltar para os cursos</Link>
              </p>
            </section>
          </article>
        </div>
      </main>
      <EscolaRodape />
    </div>
  );
};

export default Privacidade;
