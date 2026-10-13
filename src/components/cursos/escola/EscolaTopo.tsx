import { Link } from 'react-router-dom';

type Props = { onCta?: () => void };

// Topo das páginas de cursos: transparente no início, pílula de vidro ao rolar
// (a classe is-rolou entra pelo useEscola).
const EscolaTopo = ({ onCta }: Props) => (
  <header className="e-topo">
    <nav className="e-topo__nav" aria-label="Cursos">
      <Link to="/cursos" className="e-marca" aria-label="Jefferson Lobo · Cursos">
        <span className="e-marca__ponto" aria-hidden />
        Jefferson Lobo
        <small>Cursos</small>
      </Link>
      <div className="e-topo__links">
        <a href="#catalogo">Catálogo</a>
        <Link to="/cursos/ilha">Ilha de Edição</Link>
        <Link to="/livro-del">Livro</Link>
        <Link to="/">Site</Link>
      </div>
      <div className="e-topo__acoes">
        <Link to="/cursos/entrar" className="e-btn e-btn--fantasma e-topo__entrar">
          Entrar
        </Link>
        <Link to="/cursos/ilha" className="e-btn e-btn--cheio" onClick={onCta}>
          Ver o curso
        </Link>
      </div>
    </nav>
  </header>
);

export default EscolaTopo;
