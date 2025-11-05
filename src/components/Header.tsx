import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, MessageCircle } from 'lucide-react';

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
            className={`text-2xl font-bold hover:opacity-80 transition-opacity ${
              isScrolled 
                ? 'gradient-primary bg-clip-text text-transparent' 
                : 'text-white drop-shadow-lg'
            }`}
          >
            Jefferson Lobo
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {['home', 'sobre', 'livro', 'blog', 'contato'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className={`hover:text-primary transition-colors capitalize font-medium ${
                  isScrolled ? 'text-foreground' : 'text-white drop-shadow-md'
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          {/* CTA Button */}
          <Button
            asChild
            className="hidden md:flex bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
          >
            <a
              href="https://wa.me/5545999864213"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Contrate para Palestras & Consultoria
            </a>
          </Button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden ${isScrolled ? 'text-foreground' : 'text-white drop-shadow-lg'}`}
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
              asChild
              className="w-full bg-gradient-to-r from-primary to-secondary"
            >
              <a
                href="https://wa.me/5545999864213"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Contrate para Palestras
              </a>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
