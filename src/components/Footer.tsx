const Footer = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-tech-dark text-white">
      {/* Footer Links */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2">
            <h3 className="text-2xl font-bold text-primary drop-shadow-lg mb-4">
              Jefferson Lobo
            </h3>
            <p className="text-white/70 mb-4">
              Palestrante, autor e especialista em inteligência artificial.
              Explorando o futuro da tecnologia com criatividade e impacto.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Navegação</h4>
            <ul className="space-y-2">
              {['home', 'sobre', 'livro', 'blog', 'contato'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => scrollToSection(item)}
                    className="text-white hover:text-primary transition-colors capitalize"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Contato</h4>
            <ul className="space-y-2 text-white">
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
        <div className="pt-8 border-t border-primary/20 text-center text-white/60 text-sm">
          <p>
            © {currentYear} Jefferson Lobo. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
