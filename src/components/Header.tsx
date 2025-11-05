import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

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

          {/* Navigation */}
          <nav className="flex items-center gap-8">
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
            className="flex bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
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
        </div>
      </div>
    </header>
  );
};

export default Header;
