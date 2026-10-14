import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/lib/metaPixel';

// PageView do Meta Pixel a cada troca de rota da SPA. Pula a primeira execução
// (o snippet do index.html já dispara o PageView inicial) e ignora /admin.
export default function MetaPixelRouteTracker() {
  const { pathname } = useLocation();
  const primeira = useRef(true);
  useEffect(() => {
    if (primeira.current) { primeira.current = false; return; }
    if (/^\/admin(\/|$)/.test(pathname)) return;
    trackPageView();
  }, [pathname]);
  return null;
}
