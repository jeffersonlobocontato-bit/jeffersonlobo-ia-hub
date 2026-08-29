const Footer = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-primary/20 bg-background text-foreground">
      {/* Footer Links */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2">
            <div className="mb-4 flex items-end gap-4">
              <span className="font-serif text-5xl text-primary">JL</span>
              <span className="mb-2 h-px w-24 bg-border" />
            </div>
            <h3 className="font-serif text-2xl text-foreground mb-4">Jefferson Lobo</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Estrategista de IA para marketing e marca — palestras, imersões e consultoria
              para lideranças que querem construir agentes de IA com identidade própria.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-4 text-foreground/70" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Navegação</h4>
            <ul className="space-y-2">
              {['home', 'palestras', 'sobre', 'produtos', 'contato', 'livro', 'blog'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => scrollToSection(item)}
                    className="text-foreground/85 hover:text-primary transition-colors capitalize"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
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
        <div className="pt-8 border-t border-primary/20 text-center text-muted-foreground text-sm">
          <p>
            © {currentYear} Jefferson Lobo. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
