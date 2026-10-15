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
      className={`site-header ${isScrolled ? 'is-scrolled' : ''}`}
    >
      {/* Debug banner removed for production polish */}
      <div className="site-header__inner">
        <div className="flex items-center justify-between min-h-20 gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="site-header__brand group flex items-center hover:opacity-90 transition-opacity text-foreground"
          >
            <span className="flex flex-col leading-none">
              <span className="font-sans text-lg font-medium text-foreground">
                Jefferson <span className="highlight-yellow">Lobo</span>
              </span>
              <span className="site-header__subtitle">Palestrante de Inteligência Artificial · Consultor em IA · Head Executivo de Marketing</span>
            </span>
          </Link>

          {/* Desktop Navigation — ordem alinhada com a ordem real das seções na página */}
          <nav className="site-header__nav hidden xl:flex items-center">
            {['home', 'palestras', 'sobre', 'produtos', 'contato'].map((item) => (
              <Button
                variant="ghost"
                key={item}
                onClick={() => scrollToSection(item)}
                className="h-auto p-0 text-xs font-medium text-muted-foreground hover:bg-transparent hover:text-primary"
              >
                {item}
              </Button>
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
          <div className="hidden xl:flex items-center gap-2">
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            className="xl:hidden shrink-0 text-foreground"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div id="mobile-menu" className="site-mobile-menu xl:hidden p-6 space-y-2 animate-fade-in bg-popover border border-border">
            {['home', 'palestras', 'sobre', 'produtos', 'contato'].map((item) => (
              <Button
                variant="ghost"
                key={item}
                onClick={() => scrollToSection(item)}
                className="flex w-full justify-start py-3 text-sm font-medium text-foreground hover:text-primary"
              >
                {item}
              </Button>
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
