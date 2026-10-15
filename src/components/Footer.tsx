import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer text-foreground">
      {/* Footer Links */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-4 border-b border-border pb-8">
            <h3 className="site-footer__signature text-foreground mb-6">
              Jefferson <span className="highlight-yellow">Lobo</span>
            </h3>
            <p className="text-muted-foreground mb-4 max-w-2xl">
              Palestrante de Inteligência Artificial no Brasil — palestras, imersões e consultoria
              para lideranças que querem construir agentes de IA com identidade própria.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-4 text-foreground/70" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Navegação</h4>
            <ul className="space-y-2">
              {['home', 'palestras', 'sobre', 'produtos', 'contato', 'livro', 'blog'].map((item) => (
                <li key={item}>
                  <Button
                    variant="ghost"
                    onClick={() => scrollToSection(item)}
                    className="h-auto p-0 text-muted-foreground hover:bg-transparent hover:text-primary transition-colors capitalize"
                  >
                    {item}
                  </Button>
                </li>
              ))}
            </ul>
            <Link
              to="/palestrante-inteligencia-artificial"
              className="mt-4 block text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Palestrante de Inteligência Artificial
            </Link>
          </div>


          {/* Contact Info */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-4 text-foreground/70" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Contato</h4>
            <ul className="space-y-2 text-foreground">
              <li>
                <a
                  href="mailto:lobo@aivozes.com.br"
                  className="hover:text-primary transition-colors"
                >
                  lobo@aivozes.com.br
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/5545999864213"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-border text-left font-mono text-xs text-muted-foreground">
          <p>
            © {currentYear} Jefferson Lobo. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
