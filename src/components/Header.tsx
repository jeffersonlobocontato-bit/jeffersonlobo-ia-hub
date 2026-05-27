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
            className={`group flex items-center gap-3 hover:opacity-90 transition-opacity ${
              isScrolled 
                ? 'text-foreground' 
                : 'text-foreground'
            }`}
          >
            <span className="flex h-11 w-11 items-center justify-center border border-primary bg-primary text-xl font-black uppercase text-primary-foreground shadow-[4px_4px_0_hsl(var(--secondary))] transition-transform group-hover:-translate-y-0.5">
              JL
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-lg font-black uppercase">Jefferson Lobo</span>
              <span className="text-[10px] font-bold uppercase text-muted-foreground">AI strategist · speaker · author</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {['home', 'palestras', 'sobre', 'livro', 'contato'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className={`text-sm uppercase hover:text-primary transition-colors font-bold ${
                  isScrolled ? 'text-foreground' : 'text-foreground'
                }`}
              >
                {item}
              </button>
            ))}
            <Link
              to="/teste-ia"
              className={`text-sm uppercase hover:text-primary transition-colors font-bold ${
                isScrolled ? 'text-foreground' : 'text-foreground'
              }`}
            >
              Teste IA
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
            className={`md:hidden ${isScrolled ? 'text-foreground' : 'text-foreground'}`}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-6 space-y-4 animate-fade-in bg-background border-t border-primary/20">
            {['home', 'palestras', 'sobre', 'livro', 'contato'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className="block w-full text-left py-3 text-foreground hover:text-primary transition-colors uppercase font-bold"
              >
                {item}
              </button>
            ))}
            <Link
              to="/teste-ia"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full text-left py-3 text-foreground hover:text-primary transition-colors uppercase font-bold"
            >
              Teste IA
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
