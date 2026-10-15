import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import EscolaTopo from '@/components/cursos/escola/EscolaTopo';
import EscolaRodape from '@/components/cursos/escola/EscolaRodape';
import { useEscola } from '@/components/cursos/escola/useEscola';
import { BOT_ATENDIMENTO, ESCOLA } from '@/content/cursos/escola';
import { ATUALIZADO_EM, TERMOS, VERSAO } from '@/content/cursos/termos';
import '@/styles/escola.css';

// Termos de uso dos cursos (/cursos/termos).
const Termos = () => {
  const raiz = useRef<HTMLDivElement>(null);
  useEscola(raiz);
  const f = ESCOLA.fornecedor;
  const identificacao = [f.nome, f.documento && `CNPJ ${f.documento}`, f.endereco, f.email].filter(Boolean).join(' · ');

  return (
    <div className="escola" ref={raiz}>
      <SEO title="Termos de uso dos cursos | Academia jeffersonlobo.tech" description="Termos de uso, licença, reembolso e privacidade dos cursos da Academia jeffersonlobo.tech." path="/cursos/termos" />
      <EscolaTopo />
      <main className="e-termos">
        <header className="e-termos__cab e-entra">
          <span className="e-olho">Academia jeffersonlobo.tech</span>
          <h1 className="e-h2">Termos de uso dos cursos</h1>
          <p>
            Versão {VERSAO} · atualizada em {ATUALIZADO_EM}
          </p>
        </header>

        <div className="e-termos__corpo">
          <nav className="e-termos__indice" aria-label="Índice dos termos">
            <ol>
              {TERMOS.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>{s.titulo.replace(/^\d+\.\s*/, '')}</a>
                </li>
              ))}
              <li>
                <a href="#contato">Contato</a>
              </li>
            </ol>
          </nav>

          <article className="e-termos__texto">
            {TERMOS.map((s) => (
              <section key={s.id} id={s.id}>
                <h2>{s.titulo}</h2>
                {s.paragrafos.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </section>
            ))}
            <section id="contato">
              <h2>17. Contato</h2>
              <p>
                Suporte, reembolso e pedidos sobre dados pessoais:{' '}
                <a href={ESCOLA.atendimento} target="_blank" rel="noopener">
                  atendimento no Telegram (@{BOT_ATENDIMENTO})
                </a>
                {f.email ? (
                  <>
                    {' '}
                    ou <a href={`mailto:${f.email}`}>{f.email}</a>
                  </>
                ) : null}
                .
              </p>
              <p className="e-termos__id">{identificacao}</p>
              <p>
                <Link to="/cursos">Voltar para os cursos</Link>
              </p>
            </section>
          </article>
        </div>
      </main>
      <EscolaRodape />
    </div>
  );
};

export default Termos;
