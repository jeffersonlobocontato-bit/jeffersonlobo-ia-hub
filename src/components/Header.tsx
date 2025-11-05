import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button
            onClick={() => scrollToSection('home')}
            className="text-2xl font-bold gradient-primary bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            Jefferson Lobo
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {['home', 'sobre', 'livro', 'blog', 'contato'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className="text-foreground hover:text-primary transition-colors capitalize font-medium"
              >
                {item}
              </button>
            ))}
          </nav>

          {/* CTA Button */}
          <Button
            onClick={() => scrollToSection('contato')}
            className="hidden md:flex bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
          >
            Contrate para Palestras & Consultoria
          </Button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-foreground"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-6 space-y-4 animate-fade-in bg-background border-t border-border">
            {['home', 'sobre', 'livro', 'blog', 'contato'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className="block w-full text-left py-3 text-foreground hover:text-primary transition-colors capitalize font-medium"
              >
                {item}
              </button>
            ))}
            <Button
              onClick={() => scrollToSection('contato')}
              className="w-full bg-gradient-to-r from-primary to-secondary"
            >
              Contrate para Palestras
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
