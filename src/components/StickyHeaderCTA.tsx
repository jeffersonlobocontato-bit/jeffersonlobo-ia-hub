import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTrackCTA } from '@/hooks/useTrackCTA';

const StickyHeaderCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [variant, setVariant] = useState<'teste' | 'briefing'>('teste');
  const { trackCTA } = useTrackCTA();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent =
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      setIsVisible(scrollPercent > 35);
      // Após passar da seção "Sobre", muda para CTA de proposta
      const aboutEl = document.getElementById('sobre');
      if (aboutEl) {
        const passedAbout = window.scrollY > aboutEl.offsetTop + aboutEl.offsetHeight * 0.5;
        setVariant(passedAbout ? 'briefing' : 'teste');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  if (variant === 'briefing') {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-slide-up">
        <Button
          size="lg"
          className="animate-pulse-glow"
          onClick={() => {
            trackCTA('sticky_cta_briefing', 'sticky_header');
            document.getElementById('briefing')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <Send className="w-5 h-5 mr-2" />
          Solicitar proposta
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-slide-up">
      <Link to="/teste-ia">
        <Button
          size="lg"
          className="animate-pulse-glow"
          onClick={() => trackCTA('sticky_cta_teste_ia', 'sticky_header')}
        >
          <Brain className="w-5 h-5 mr-2" />
          Fazer Diagnóstico Grátis
        </Button>
      </Link>
    </div>
  );
};

export default StickyHeaderCTA;
