import { useEffect } from 'react';

/*
 * Motor de parallax + reveal da home (sem dependências).
 *
 * - [data-speed="0.3"]  → o elemento se desloca em Y proporcional à distância
 *   do centro da viewport (valores positivos andam mais devagar que o scroll,
 *   negativos andam mais rápido). Use em camadas decorativas.
 * - [data-reveal]       → recebe .is-in quando entra na tela (CSS em index.css).
 * - --hero-p            → progresso 0→1 do scroll dentro do #home, para o
 *   conteúdo do hero recuar/esmaecer enquanto a página sobe.
 *
 * Respeita prefers-reduced-motion: nesse caso só revela, sem mover nada.
 */
const ScrollFX = () => {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Reveal
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    );
    const observeAll = () =>
      document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => io.observe(el));
    observeAll();
    // Seções que carregam dados depois (Supabase) entram no DOM mais tarde
    const mo = new MutationObserver(observeAll);
    mo.observe(document.body, { childList: true, subtree: true });

    if (reduce) {
      return () => {
        io.disconnect();
        mo.disconnect();
      };
    }

    // Parallax
    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      document.documentElement.style.setProperty('--sy', String(Math.round(window.scrollY)));

      document.querySelectorAll<HTMLElement>('[data-speed]').forEach((el) => {
        const speed = parseFloat(el.dataset.speed || '0');
        const host = (el.offsetParent as HTMLElement) || el.parentElement || el;
        const r = host.getBoundingClientRect();
        if (r.bottom < -vh * 0.5 || r.top > vh * 1.5) return;
        const delta = r.top + r.height / 2 - vh / 2;
        el.style.transform = `translate3d(0, ${(delta * -speed).toFixed(1)}px, 0)`;
      });

      const hero = document.getElementById('home');
      if (hero) {
        const p = Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / hero.offsetHeight));
        hero.style.setProperty('--hero-p', p.toFixed(3));
      }
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return null;
};

export default ScrollFX;
