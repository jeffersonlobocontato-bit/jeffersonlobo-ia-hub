import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Shield, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    // Se não estiver na página inicial, navegar para ela primeiro
    if (window.location.pathname !== '/') {
      window.location.href = `/#${id}`;
      setIsMobileMenuOpen(false);
      return;
    }
    
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
        isScrolled
          ? 'border-primary/20 bg-background/95 backdrop-blur-md shadow-[0_16px_40px_hsl(var(--foreground)/0.15)]'
          : 'border-transparent bg-transparent'
      }`}
    >
      {/* Debug banner removed for production polish */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center hover:opacity-90 transition-opacity text-foreground"
          >
            <span className="flex flex-col leading-none">
              <span className="font-serif text-lg text-foreground">
                Jefferson <span className="highlight-yellow">Lobo</span>
              </span>
              <span className="text-[11px] font-medium uppercase tracking-wider text-foreground/60" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Head Executivo de Marketing · Consultor em IA · Palestrante</span>
            </span>
          </Link>

          {/* Desktop Navigation — ordem alinhada com a ordem real das seções na página */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {['home', 'palestras', 'sobre', 'produtos', 'contato'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className="text-xs font-medium uppercase tracking-wider text-foreground/85 transition-colors hover:text-primary"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {item}
              </button>
            ))}
            <Link
              to="/livro-del"
              className="text-xs font-medium uppercase tracking-wider text-foreground/85 transition-colors hover:text-primary"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Livro
            </Link>
            <Link
              to="/teste-ia"
              className="text-xs font-medium uppercase tracking-wider text-foreground/85 transition-colors hover:text-primary"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Teste IA
            </Link>
            <Link
              to="/blog"
              className="text-xs font-medium uppercase tracking-wider text-foreground/85 transition-colors hover:text-primary"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Blog
            </Link>

          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAdmin && (
              <Button
                asChild
                variant="outline"
                className="border-primary/50 bg-background/80 hover:bg-primary/10"
              >
                <Link to="/admin" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              </Button>
            )}
            {user && (
              <Button
                onClick={signOut}
                variant="outline"
                className="border-destructive/50 bg-background/80 hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            className={`md:hidden ${isScrolled ? 'text-foreground' : 'text-foreground'}`}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-6 space-y-4 animate-fade-in bg-background border-t border-primary/20">
            {['home', 'palestras', 'sobre', 'produtos', 'contato'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className="block w-full text-left py-3 text-sm font-medium uppercase tracking-wider text-foreground hover:text-primary transition-colors"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {item}
              </button>
            ))}
            <Link
              to="/livro-del"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full text-left py-3 text-sm font-medium uppercase tracking-wider text-foreground hover:text-primary transition-colors"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Livro
            </Link>
            <Link
              to="/teste-ia"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full text-left py-3 text-sm font-medium uppercase tracking-wider text-foreground hover:text-primary transition-colors"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Teste IA
            </Link>
            <Link
              to="/blog"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full text-left py-3 text-sm font-medium uppercase tracking-wider text-foreground hover:text-primary transition-colors"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Blog
            </Link>

            {isAdmin && (
              <Button
                asChild
                variant="outline"
                className="w-full border-primary/50 hover:bg-primary/10"
              >
                <Link to="/admin" className="flex items-center gap-2 justify-center">
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              </Button>
            )}
            {user && (
              <Button
                onClick={signOut}
                variant="outline"
                className="w-full border-destructive/50 hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
