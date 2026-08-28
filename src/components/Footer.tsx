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
              <span className="display-title text-6xl text-primary">JL</span>
              <span className="mb-2 h-2 w-24 bg-secondary" />
            </div>
            <h3 className="text-2xl font-black uppercase text-foreground mb-4">Jefferson Lobo</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Palestrante, autor e especialista em inteligência artificial.
              Explorando o futuro da tecnologia com criatividade e impacto.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold uppercase mb-4 text-foreground">Navegação</h4>
            <ul className="space-y-2">
              {['home', 'palestras', 'sobre', 'contato', 'livro', 'blog'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => scrollToSection(item)}
                    className="text-foreground hover:text-primary transition-colors capitalize font-bold"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold uppercase mb-4 text-foreground">Contato</h4>
            <ul className="space-y-2 text-foreground">
              <li>
                <a
                  href="mailto:jeffersonlobocontato@gmail.com"
                  className="hover:text-primary transition-colors"
                >
                  jeffersonlobocontato@gmail.com
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
