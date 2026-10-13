import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowRight, Check, ChevronDown, Download, LifeBuoy, LogOut } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/hooks/useAuth';
import { aulasComVideo, cursoPorSlug, type Aula, type Material } from '@/content/cursos/ilha';
import { baixarMaterial, modoDemo, urlDoVideoBunny, useAcessoCurso, useCursoConfig, useProgresso } from '@/lib/cursos';
import TutorChat from '@/components/cursos/TutorChat';
import '@/styles/cursos-area.css';

const SUGESTOES: Record<string, string[]> = {
  'aula-1': ['O que faço se a instalação não começar?', 'Onde ligo o "Aprovar automaticamente"?', 'Meu vídeo tem mais de 20 MB. E agora?'],
  'aula-2': ['Como uso uma notícia para criar o carrossel?', 'Qual técnica escolho para começar?', 'Como baixo o PDF para o LinkedIn?'],
  'aula-3': ['Qual objetivo escolho para o dia a dia?', 'Onde vejo qual figurinha colar?', 'Quanto tempo leva para a sequência ficar pronta?'],
  'aula-4': ['Como ligo a Zernio no Claude?', 'Meu Instagram precisa ser profissional?', 'Que palavra uso no post?'],
  'aula-5': ['Como salvo uma referência de outro perfil?', 'O que é o Radar do momento?', 'O que o Placar precisa para funcionar?'],
  ebook: ['O que é o Método DEL?', 'Como o DEL aparece na Ilha?'],
};

const Tela = ({ children }: { children: React.ReactNode }) => (
  <div className="ilha-area">
    <SEO title="Área do aluno | Jefferson Lobo" description="Área do aluno dos cursos de Jefferson Lobo." path="/cursos" noindex />
    {children}
  </div>
);

const nomeDaAula = (a: Aula) => (a.numero ? `Aula ${a.numero} · ${a.titulo}` : a.titulo);

function MaterialItem({ m, curso }: { m: Material; curso: string }) {
  const [baixando, setBaixando] = useState(false);
  const baixar = async () => {
    if (modoDemo()) return toast('No modo demonstração o download fica desligado.');
    setBaixando(true);
    try {
      const nome = m.caminho.split('/').pop() ?? m.nome;
      await baixarMaterial(curso, m.caminho, nome);
    } catch {
      toast.error('Este material ainda não está disponível. Avise o suporte.');
    } finally {
      setBaixando(false);
    }
  };
  return (
    <div className="i-material">
      <span className="i-material__tipo">{m.tipo.toUpperCase()}</span>
      <div style={{ minWidth: 0 }}>
        <b>{m.nome}</b>
        {m.descricao && <small>{m.descricao}</small>}
      </div>
      <button className="i-btn i-btn--pequeno" onClick={baixar} disabled={baixando}>
        <Download size={15} aria-hidden /> {baixando ? 'Abrindo…' : 'Baixar'}
      </button>
    </div>
  );
}

const SalaDeAula = () => {
  const { curso: slugCurso = 'ilha', aula: slugAula } = useParams();
  const location = useLocation();
  const curso = cursoPorSlug(slugCurso);
  const { user, loading, signOut } = useAuth();
  const estado = useAcessoCurso(slugCurso, user?.id, loading);
  const { concluidas, alternar } = useProgresso(slugCurso, user?.id);
  const config = useCursoConfig(slugCurso, estado === 'ok');
  const [listaAberta, setListaAberta] = useState(false);

  const aula = useMemo(() => curso?.aulas.find((a) => a.slug === slugAula), [curso, slugAula]);

  useEffect(() => {
    setListaAberta(false);
    window.scrollTo({ top: 0 });
  }, [slugAula]);

  if (!curso) return <Navigate to="/cursos" replace />;

  if (estado === 'carregando') {
    return (
      <Tela>
        <div className="i-centro">
          <div className="i-giro" aria-label="Carregando" />
        </div>
      </Tela>
    );
  }

  if (estado === 'sem-login') {
    const volta = encodeURIComponent(location.pathname);
    return <Navigate to={`/cursos/entrar?curso=${curso.slug}&volta=${volta}`} replace />;
  }

  if (estado === 'sem-acesso') {
    return (
      <Tela>
        <div className="i-centro">
          <div className="i-caixa">
            <span className="i-kicker">{curso.nome}</span>
            <h1>Este e-mail ainda não tem acesso.</h1>
            <p className="i-muted">
              Você entrou como <b>{user?.email}</b>. O acesso é liberado para o mesmo e-mail usado na compra, alguns minutos
              depois da aprovação.
            </p>
            <div className="i-acoes">
              <Link className="i-btn i-btn--cheio" to={`/cursos/${curso.slug}`}>
                Conhecer o curso
              </Link>
              <a className="i-btn" href={curso.suporteWhatsApp} target="_blank" rel="noopener">
                Falar com o suporte
              </a>
            </div>
            <button className="i-link" onClick={() => signOut()}>
              Entrar com outro e-mail
            </button>
          </div>
        </div>
      </Tela>
    );
  }

  // Sem aula na URL (ou aula inexistente): continua de onde parou.
  if (!aula) {
    const proxima = aulasComVideo(curso).find((a) => !concluidas.has(a.slug)) ?? curso.aulas[0];
    return <Navigate to={`/cursos/${curso.slug}/aulas/${proxima.slug}${location.search}`} replace />;
  }

  const comVideo = aulasComVideo(curso);
  const feitas = comVideo.filter((a) => concluidas.has(a.slug)).length;
  const pct = Math.round((feitas / comVideo.length) * 100);
  const indice = curso.aulas.findIndex((a) => a.slug === aula.slug);
  const proximaAula = curso.aulas[indice + 1];
  const feita = concluidas.has(aula.slug);
  const biblioteca = config.bunny_library_id;
  const video = config[`video:${aula.slug}`];
  const sufixo = location.search;

  return (
    <Tela>
      <header className="i-topo">
        <Link to={`/cursos/${curso.slug}/aulas${sufixo}`} className="i-topo__marca" style={{ textDecoration: 'none' }}>
          <span className="i-kicker">Área do aluno</span>
          <b>
            Ilha de Edição <em>completa</em>
          </b>
        </Link>
        <div className="i-topo__prog" title={`${feitas} de ${comVideo.length} aulas concluídas`}>
          <span className="i-barra" aria-hidden>
            <i style={{ width: `${pct}%` }} />
          </span>
          <small>
            {feitas}/{comVideo.length} · {pct}%
          </small>
        </div>
        <div className="i-topo__acoes">
          <a className="i-btn i-btn--pequeno" href={curso.suporteWhatsApp} target="_blank" rel="noopener" title="Suporte no WhatsApp">
            <LifeBuoy size={15} aria-hidden /> <span className="hidden sm:inline">Suporte</span>
          </a>
          <span className="i-topo__email hidden md:inline">{user?.email ?? 'demo@exemplo.com'}</span>
          <button className="i-btn i-btn--pequeno" onClick={() => signOut()} aria-label="Sair">
            <LogOut size={15} aria-hidden />
          </button>
        </div>
      </header>

      <div className="i-sala">
        <nav className="i-lista" aria-label="Aulas do curso">
          <button className="i-btn i-lista__abrir" onClick={() => setListaAberta((v) => !v)} aria-expanded={listaAberta}>
            <span>Aulas do curso</span>
            <ChevronDown size={18} aria-hidden style={{ transform: listaAberta ? 'rotate(180deg)' : undefined }} />
          </button>
          <div className="i-lista__conteudo" data-aberta={listaAberta}>
            {curso.modulos.map((m) => (
              <div className="i-modulo" key={m.slug}>
                <div className="i-modulo__cab">
                  <span className="i-kicker">{m.nome}</span>
                  <b>{m.titulo}</b>
                </div>
                {curso.aulas
                  .filter((a) => a.modulo === m.slug)
                  .map((a) => {
                    const ok = concluidas.has(a.slug);
                    return (
                      <Link
                        key={a.slug}
                        to={`/cursos/${curso.slug}/aulas/${a.slug}${sufixo}`}
                        className="i-aula"
                        aria-current={a.slug === aula.slug ? 'page' : undefined}
                      >
                        <span className={`i-aula__num ${ok ? 'i-aula__num--feita' : ''}`}>
                          {ok ? <Check size={16} aria-label="concluída" /> : (a.numero ?? '★')}
                        </span>
                        <span className="i-aula__titulo">{a.titulo}</span>
                        <span className="i-aula__dur">{a.duracao ?? 'PDF'}</span>
                      </Link>
                    );
                  })}
              </div>
            ))}
          </div>
        </nav>

        <main className="i-palco">
          {'semVideo' in aula && aula.semVideo ? (
            <div className="i-cartao" style={{ display: 'grid', gap: '1.2rem', gridTemplateColumns: 'minmax(0,180px) minmax(0,1fr)', alignItems: 'center' }}>
              <img src="/cursos-ilha/livro-del.webp" alt="Capa do e-book O código invisível" style={{ width: '100%', maxWidth: 180, filter: 'drop-shadow(0 20px 30px rgba(0,0,0,.5))' }} />
              <div style={{ display: 'grid', gap: '.6rem' }}>
                <span className="i-kicker">Bônus do curso</span>
                <h2 style={{ fontWeight: 900, fontSize: '1.5rem' }}>O código invisível</h2>
                <p className="i-muted">O livro do Método DEL, em PDF, para ler quando quiser.</p>
              </div>
            </div>
          ) : (
            <div className="i-video">
              {biblioteca && video ? (
                <iframe
                  src={urlDoVideoBunny(biblioteca, video)}
                  title={nomeDaAula(aula)}
                  loading="lazy"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="i-video__espera">
                  {aula.capa && <img src={aula.capa} alt="" />}
                  <span>O vídeo desta aula entra aqui em instantes.</span>
                </div>
              )}
            </div>
          )}

          <div className="i-cabeca">
            <span className="i-kicker">
              {aula.numero ? `Aula ${aula.numero}` : 'Bônus'}
              {aula.duracao ? ` · ${aula.duracao}` : ''}
            </span>
            <h1>{aula.titulo}</h1>
            <div className="i-acoes">
              <button className={`i-btn ${feita ? 'i-btn--ok' : ''}`} onClick={() => alternar(aula.slug)} aria-pressed={feita}>
                <Check size={16} aria-hidden /> {feita ? 'Concluída' : 'Marcar como concluída'}
              </button>
              {proximaAula && (
                <Link className="i-btn i-btn--cheio" to={`/cursos/${curso.slug}/aulas/${proximaAula.slug}${sufixo}`}>
                  {proximaAula.numero ? `Aula ${proximaAula.numero}` : 'Bônus'} <ArrowRight size={16} aria-hidden />
                </Link>
              )}
            </div>
          </div>

          <section className="i-cartao">
            <span className="i-kicker">Resumo da aula</span>
            <p className="i-resumo">{aula.resumo}</p>
          </section>

          <div className="i-grade2">
            <section className="i-cartao">
              <h2>Pontos-chave</h2>
              <ul className="i-pontos">
                {aula.pontos.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </section>
            <section className="i-cartao">
              <h2>Materiais</h2>
              <div className="i-materiais">
                {aula.materiais.map((m) => (
                  <MaterialItem key={m.id} m={m} curso={curso.slug} />
                ))}
              </div>
            </section>
          </div>

          {'manual' in aula && aula.manual && (
            <>
              <section className="i-cartao">
                <span className="i-kicker">Passo a passo</span>
                <h2>{aula.manual.resultado}</h2>
                <div className="i-passos">
                  {aula.manual.passos.map((p) => (
                    <div className="i-passo" key={p.titulo}>
                      <div>
                        <h3>{p.titulo}</h3>
                        <ul>
                          {p.itens.map((i) => (
                            <li key={i}>{i}</li>
                          ))}
                        </ul>
                        {p.dica && <div className="i-dica">{p.dica}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="i-grade2">
                <section className="i-cartao">
                  <h2>Erros comuns</h2>
                  <ul className="i-lista-simples">
                    {aula.manual.erros.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                </section>
                <section className="i-cartao">
                  <h2>Antes de seguir, confira</h2>
                  <ul className="i-lista-simples">
                    {aula.manual.checklist.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </section>
              </div>
            </>
          )}

          {aula.tarefa && (
            <section className="i-tarefa">
              <span className="i-kicker">Tarefa da aula</span>
              <p>{aula.tarefa}</p>
            </section>
          )}

          <p className="i-faint" style={{ fontSize: '.85rem', paddingBottom: '4rem' }}>
            Garantia de {curso.garantiaDias} dias. Claude é um produto da Anthropic; este curso não tem vínculo com a Anthropic.
          </p>
        </main>
      </div>

      <TutorChat curso={curso.slug} aula={nomeDaAula(aula)} sugestoes={SUGESTOES[aula.slug] ?? []} suporte={curso.suporteWhatsApp} />
    </Tela>
  );
};

export default SalaDeAula;
