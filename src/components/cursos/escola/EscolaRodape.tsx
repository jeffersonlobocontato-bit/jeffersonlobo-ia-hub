import { Link } from 'react-router-dom';

// Rodapé das páginas de cursos. A assinatura grande se desenha (traço) e
// depois se preenche quando aparece na tela.
const EscolaRodape = () => (
  <footer className="e-rodape">
    <div className="e-rodape__dentro">
      <svg className="e-rodape__marca e-revela" viewBox="0 0 960 150" role="img" aria-label="Jefferson Lobo">
        <defs>
          <linearGradient id="e-grad-marca" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <text x="0" y="112" textLength="956" lengthAdjust="spacingAndGlyphs">
          Jefferson Lobo
        </text>
      </svg>
      <div className="e-rodape__linha">
        <nav className="e-rodape__links" aria-label="Links do rodapé">
          <Link to="/cursos">Academia</Link>
          <a href="/cursos#catalogo">Cursos</a>
          <Link to="/livro-del">Livro</Link>
          <Link to="/cursos/entrar">Área do aluno</Link>
          <Link to="/">jeffersonlobo.tech</Link>
        </nav>
      </div>
      <p className="e-rodape__legal">
        Pagamento do curso processado pelo Mercado Pago; o livro avulso, pela Hotmart. Claude é um produto da Anthropic; os cursos não têm vínculo com a Anthropic. ©{' '}
        {new Date().getFullYear()} Jefferson Lobo.
      </p>
    </div>
  </footer>
);

export default EscolaRodape;
