import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

const Footer = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-tech-dark text-foreground">
      {/* CTA Section */}
      <div className="border-b border-primary/20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Vamos trabalhar juntos</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold">
              Convide Jefferson Lobo para sua
              <br />
              <span className="gradient-primary bg-clip-text text-transparent">
                próxima palestra, curso ou consultoria
              </span>
            </h2>

            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Transforme sua organização com insights sobre inteligência
              artificial, inovação e o futuro da tecnologia
            </p>

            <div className="pt-4">
              <Button
                size="lg"
                onClick={() => scrollToSection('contato')}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity text-lg px-8 py-6"
              >
                Entrar em contato
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2">
            <h3 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent mb-4">
              Jefferson Lobo
            </h3>
            <p className="text-muted-foreground mb-4">
              Palestrante, autor e especialista em inteligência artificial.
              Explorando o futuro da tecnologia com criatividade e impacto.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Navegação</h4>
            <ul className="space-y-2">
              {['home', 'sobre', 'livro', 'blog', 'contato'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => scrollToSection(item)}
                    className="text-muted-foreground hover:text-primary transition-colors capitalize"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a
                  href="mailto:contato@jeffersonlobo.com"
                  className="hover:text-primary transition-colors"
                >
                  contato@jeffersonlobo.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/5511999999999"
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
