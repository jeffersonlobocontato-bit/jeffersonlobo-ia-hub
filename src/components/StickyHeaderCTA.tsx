import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTrackCTA } from '@/hooks/useTrackCTA';

const StickyHeaderCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { trackCTA } = useTrackCTA();

  useEffect(() => {
    const handleScroll = () => {
      // Show after user scrolls 50% of viewport
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      setIsVisible(scrollPercent > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-slide-up">
      <Link to="/teste-ia">
        <Button
          size="lg"
          className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-2xl shadow-primary/50 animate-pulse-glow"
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
