import { Children, cloneElement, isValidElement, useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { Button } from '@/components/ui/button';

// Presentation only. Preserve whitespace, emphasis and dynamic prices while
// reserving each word's final position before its entrance animation.
export function IlhaWords({ children, progressive = false }: { children: ReactNode; progressive?: boolean }) {
  let order = 0;
  const words = (nodes: ReactNode): ReactNode => {
    const result: ReactNode[] = [];
    Children.forEach(nodes, (node, nodeIndex) => {
      if (typeof node === 'string' || typeof node === 'number') {
        String(node).split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (!part.trim()) { result.push(part); return; }
          if (/^[.,!?;:]+$/.test(part) && result.length && isValidElement(result[result.length - 1])) {
            const previous = result.pop();
            result.push(<span className="ilha-word-group" key={`punctuation-${order}`}>{previous}{part}</span>);
            return;
          }
          const index = order++;
          result.push(<span key={`word-${index}`} className="ilha-word" style={{ '--ilha-word-order': index } as CSSProperties}>{part}</span>);
        });
      } else if (isValidElement<{ children?: ReactNode }>(node) && node.props.children !== undefined) {
        result.push(cloneElement(node, { key: node.key ?? `element-${nodeIndex}` }, words(node.props.children)));
      } else if (isValidElement(node)) {
        result.push(cloneElement(node, { key: node.key ?? `element-${nodeIndex}` }));
      } else result.push(node);
    });
    return result;
  };
  return <span className="ilha-words" data-ilha-progress={progressive ? '' : undefined} data-ilha-reveal={!progressive ? '' : undefined}>{words(children)}</span>;
}

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const desktopQuery = '(min-width: 901px) and (min-height: 720px)';

export function useIlhaMotion(root: RefObject<HTMLDivElement>) {
  const [lesson, setLesson] = useState(0);
  const activeLesson = useRef(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = window.matchMedia(desktopQuery);
    const revealTargets = [...el.querySelectorAll<HTMLElement>('[data-ilha-reveal]')];
    const progressive = [...el.querySelectorAll<HTMLElement>('[data-ilha-progress], [data-ilha-timeline], [data-ilha-lessons]')];
    const words = new Map(progressive.map((target) => [target, [...target.querySelectorAll<HTMLElement>('.ilha-word')]]));
    const steps = [...el.querySelectorAll<HTMLElement>('.ilha-step')];
    const visible = new Set<HTMLElement>();
    const reader = el.querySelector<HTMLElement>('.ilha-reading__fill');
    let frame = 0;
    let revealObserver: IntersectionObserver | undefined;
    let progressObserver: IntersectionObserver | undefined;

    const render = () => {
      frame = 0;
      const height = window.innerHeight;
      const distance = document.documentElement.scrollHeight - height;
      reader?.style.setProperty('--ilha-read', String(distance > 0 ? clamp(window.scrollY / distance) : 0));
      visible.forEach((target) => {
        const rect = target.getBoundingClientRect();
        if (target.hasAttribute('data-ilha-progress')) {
          const progress = reduced.matches ? 1 : clamp((height * .82 - rect.top) / (rect.height + height * .3));
          const tokens = words.get(target) ?? [];
          tokens.forEach((word, index) => word.classList.toggle('is-lit', index < Math.ceil(progress * tokens.length)));
        }
        if (target.hasAttribute('data-ilha-timeline')) {
          const progress = reduced.matches ? 1 : clamp((height * .68 - rect.top) / rect.height);
          target.style.setProperty('--ilha-progress', String(progress));
          steps.forEach((step, index) => step.classList.toggle('is-complete', progress >= (index + .35) / steps.length));
        }
        if (target.hasAttribute('data-ilha-lessons') && desktop.matches && !reduced.matches) {
          const pin = target.querySelector<HTMLElement>('.ilha-lessons__pin');
          const travel = rect.height - (pin?.offsetHeight ?? height) - 100;
          const next = Math.min(4, Math.floor(clamp((100 - rect.top) / Math.max(1, travel)) * 5));
          if (activeLesson.current !== next) {
            activeLesson.current = next;
            setLesson(next);
          }
        }
      });
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(render); };

    const configure = () => {
      revealObserver?.disconnect();
      progressObserver?.disconnect();
      visible.clear();
      el.classList.toggle('ilha-reduced', reduced.matches);
      el.classList.toggle('ilha-motion', !reduced.matches && 'IntersectionObserver' in window);
      if (!reduced.matches && 'IntersectionObserver' in window) {
        revealObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-in');
              revealObserver?.unobserve(entry.target);
            }
          });
        }, { threshold: .08, rootMargin: '0px 0px -24px 0px' });
        revealTargets.forEach((target) => revealObserver?.observe(target));
        progressObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            const target = entry.target as HTMLElement;
            if (entry.isIntersecting) visible.add(target);
            else visible.delete(target);
          });
          schedule();
        }, { rootMargin: '120px 0px' });
        progressive.forEach((target) => progressObserver?.observe(target));
      } else {
        revealTargets.forEach((target) => target.classList.add('is-in'));
        progressive.forEach((target) => visible.add(target));
      }
      schedule();
    };
    configure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    reduced.addEventListener('change', configure);
    desktop.addEventListener('change', schedule);
    const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(schedule) : undefined;
    resizeObserver?.observe(el);

    return () => {
      window.cancelAnimationFrame(frame);
      revealObserver?.disconnect();
      progressObserver?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reduced.removeEventListener('change', configure);
      desktop.removeEventListener('change', schedule);
      el.classList.remove('ilha-motion', 'ilha-reduced');
    };
  }, [root]);

  const selectLesson = (index: number) => {
    const scene = root.current?.querySelector<HTMLElement>('[data-ilha-lessons]');
    const pin = scene?.querySelector<HTMLElement>('.ilha-lessons__pin');
    if (!scene || !pin) return;
    activeLesson.current = index;
    setLesson(index);
    if (window.matchMedia(desktopQuery).matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const top = window.scrollY + scene.getBoundingClientRect().top - 100;
      const travel = Math.max(1, scene.offsetHeight - pin.offsetHeight - 100);
      // Land inside the selected fifth, not on a rounding boundary.
      window.scrollTo({ top: top + travel * ((index + .15) / 5), behavior: 'smooth' });
    }
  };
  return { lesson, selectLesson };
}

export type IlhaLesson = { olho: string; titulo: string; img: string; alt: string; texto: string };

export function IlhaLessons({ lessons, active, onSelect }: { lessons: IlhaLesson[]; active: number; onSelect: (index: number) => void }) {
  return (
    <div className="ilha-lessons" data-ilha-lessons>
      <div className="ilha-lessons__pin">
        <ol className="ilha-lessons__list">
          {lessons.map((lesson, index) => (
            <li key={lesson.titulo} className={`ilha-lesson${active === index ? ' is-active' : ''}`}>
              <Button type="button" variant="ghost" className="ilha-lesson__selector" onClick={() => onSelect(index)} aria-current={active === index ? 'step' : undefined} aria-controls={`ilha-screen-${index}`}>
                <span className="ilha-lesson__number" aria-hidden>{String(index + 1).padStart(2, '0')}</span>
                <span><span className="e-olho">{lesson.olho}</span><span className="ilha-lesson__title"><IlhaWords>{lesson.titulo}</IlhaWords></span></span>
              </Button>
              <p>{lesson.texto}</p>
              <img className="ilha-lesson__mobile-image" src={lesson.img} alt={lesson.alt} width={820} height={968} loading="lazy" decoding="async" />
            </li>
          ))}
        </ol>
        <div className="ilha-lessons__visual">
          <div className="ilha-screen__top" aria-hidden><span /><span /><span /><span className="ilha-screen__name">{lessons[active]?.olho}</span></div>
          <div className="ilha-screens">
            {lessons.map((lesson, index) => (
              <figure id={`ilha-screen-${index}`} key={lesson.img} className={`ilha-screen${active === index ? ' is-active' : ''}`} aria-hidden={active !== index}>
                <img src={lesson.img} alt={lesson.alt} width={820} height={968} loading="lazy" decoding="async" />
              </figure>
            ))}
          </div>
          <nav className="ilha-lesson-ruler" aria-label="Aulas da Ilha">
            {lessons.map((lesson, index) => (
              <Button key={lesson.titulo} variant="ghost" size="icon" type="button" onClick={() => onSelect(index)} aria-label={lesson.olho} aria-current={active === index ? 'step' : undefined} className={`ilha-lesson-ruler__point${index <= active ? ' is-lit' : ''}`}><span /></Button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}