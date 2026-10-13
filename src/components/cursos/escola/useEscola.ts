import { useEffect, type RefObject } from 'react';

// Movimento das páginas de cursos:
//  - .e-revela ganha .is-in quando aparece na tela (surge com desfoque);
//  - o topo vira uma pílula de vidro depois de rolar um pouco;
//  - o palco do hero cresce e sobe conforme a rolagem (--p de 0 a 1).
// Sem JS, nada fica escondido: a classe .e-js só entra aqui.
export function useEscola(raiz: RefObject<HTMLElement>) {
  useEffect(() => {
    const el = raiz.current;
    if (!el) return;
    el.classList.add('e-js');
    const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let io: IntersectionObserver | null = null;
    const alvos = Array.from(el.querySelectorAll<HTMLElement>('.e-revela'));
    if ('IntersectionObserver' in window && !reduzir) {
      io = new IntersectionObserver(
        (entradas) =>
          entradas.forEach((x) => {
            if (x.isIntersecting) {
              x.target.classList.add('is-in');
              io?.unobserve(x.target);
            }
          }),
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
      );
      alvos.forEach((a) => io!.observe(a));
    } else {
      alvos.forEach((a) => a.classList.add('is-in'));
    }

    const topo = el.querySelector<HTMLElement>('.e-topo');
    const palco = el.querySelector<HTMLElement>('.e-hero__palco');
    let quadro = 0;
    const aoRolar = () => {
      cancelAnimationFrame(quadro);
      quadro = requestAnimationFrame(() => {
        const y = window.scrollY;
        topo?.classList.toggle('is-rolou', y > 24);
        if (palco && !reduzir) palco.style.setProperty('--p', String(Math.min(1, Math.max(0, y / 520))));
      });
    };
    aoRolar();
    window.addEventListener('scroll', aoRolar, { passive: true });

    return () => {
      io?.disconnect();
      cancelAnimationFrame(quadro);
      window.removeEventListener('scroll', aoRolar);
      el.classList.remove('e-js');
    };
  }, [raiz]);
}
