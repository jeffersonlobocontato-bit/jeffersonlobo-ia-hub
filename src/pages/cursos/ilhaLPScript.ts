// Comportamento da página de vendas da Ilha (antes era o <script> da página
// estática): troca de lote pela data, contador, botões de checkout, VSL,
// revelar ao rolar, barra fixa e reels que só tocam quando aparecem.
// Devolve uma função de limpeza para o React desmontar sem deixar timers.

type Config = {
  checkout: { lote1: string; lote2: string };
  fimLote1: string;
  precos: { lote1: number; lote2: number };
  bonusValor: number;
};

export function iniciarLP(raiz: HTMLElement, cfg: Config) {
  const fim = new Date(cfg.fimLote1).getTime();
  // "25/10", no fuso de Brasília, a partir da data de virada do lote
  const diaMes = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' }).format(new Date(fim));
  const depois = () => Date.now() > fim;
  const $$ = <T extends Element = HTMLElement>(sel: string) => Array.from(raiz.querySelectorAll<T>(sel as any)) as T[];
  const $ = (sel: string) => raiz.querySelector<HTMLElement>(sel);
  const limpar: Array<() => void> = [];

  function aplicaLote() {
    const l2 = depois();
    const preco = l2 ? cfg.precos.lote2 : cfg.precos.lote1;
    $$('[data-preco-curto]').forEach((e) => (e.textContent = `R$ ${preco}`));
    $$('[data-preco-valor]').forEach((e) => (e.textContent = String(preco)));
    $$('[data-total]').forEach((e) => (e.textContent = `R$ ${preco + cfg.bonusValor}`));
    const n = $('[data-lote-nome]');
    if (n) n.textContent = l2 ? 'Lote 2' : `Lote 1 · até ${diaMes}, 23h59`;
    const d = $('[data-depois]');
    if (d) d.hidden = l2;
    const p = $('[data-preco-linha]');
    if (p) p.innerHTML = l2 ? `<b>R$ ${preco}</b> · pagamento único · lote 2` : `<b>R$ ${preco}</b> · pagamento único · lote 1 até ${diaMes}, 23h59`;
    const s = $('[data-barra-sub]');
    if (s) s.textContent = l2 ? 'lote 2' : `lote 1 até ${diaMes}`;
    const r = raiz.querySelector('.marca .rotulo');
    if (r && l2) r.innerHTML = '<i></i>Lote 2 aberto';
    const link = l2 ? cfg.checkout.lote2 : cfg.checkout.lote1;
    $$<HTMLAnchorElement>('[data-checkout]').forEach((a) => {
      if (link) {
        a.href = link;
        a.target = '_blank';
        a.rel = 'noopener';
      }
    });
    return l2;
  }

  const contadores = $$('[data-contador]');
  contadores.forEach((c) => {
    c.innerHTML = ['dias', 'horas', 'min', 'seg']
      .map((u) => `<div class="vidro"><b>00</b><small>${u.toUpperCase()}</small></div>`)
      .join('');
  });
  const tick = () => {
    const l2 = aplicaLote();
    const r = Math.max(0, fim - Date.now());
    const v = [Math.floor(r / 864e5), Math.floor(r / 36e5) % 24, Math.floor(r / 6e4) % 60, Math.floor(r / 1e3) % 60];
    contadores.forEach((c) => {
      c.hidden = l2;
      c.querySelectorAll('b').forEach((b, i) => (b.textContent = String(v[i]).padStart(2, '0')));
    });
  };
  tick();
  const relogio = window.setInterval(tick, 1000);
  limpar.push(() => window.clearInterval(relogio));

  // Sem link de checkout ainda: o botão leva até a oferta e avisa.
  const aoClicar = (e: MouseEvent) => {
    const a = (e.target as HTMLElement).closest('[data-checkout]');
    if (!a) return;
    const link = depois() ? cfg.checkout.lote2 : cfg.checkout.lote1;
    if (link) return;
    e.preventDefault();
    const oferta = raiz.querySelector('#oferta');
    if (oferta && !oferta.contains(a)) oferta.scrollIntoView({ behavior: 'smooth' });
    let t = raiz.querySelector<HTMLElement>('.toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast';
      raiz.appendChild(t);
    }
    t.textContent = 'As inscrições abrem em instantes. Volte daqui a pouco ou fale comigo no WhatsApp.';
    t.hidden = false;
    window.clearTimeout((t as any)._h);
    (t as any)._h = window.setTimeout(() => t && (t.hidden = true), 3600);
  };
  raiz.addEventListener('click', aoClicar);
  limpar.push(() => raiz.removeEventListener('click', aoClicar));

  // VSL: toca com som no primeiro toque.
  const vsl = $('[data-vsl]') as HTMLVideoElement | null;
  const bt = $('[data-vsl-play]');
  if (vsl && bt) {
    const tocar = () => {
      bt.hidden = true;
      vsl.controls = true;
      vsl.play()?.catch(() => (bt.hidden = false));
    };
    bt.addEventListener('click', tocar);
    limpar.push(() => bt.removeEventListener('click', tocar));
  }

  // Revela ao rolar.
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((x) => {
          if (x.isIntersecting) {
            x.target.classList.add('on');
            io.unobserve(x.target);
          }
        }),
      { threshold: 0.12 },
    );
    $$('.revela').forEach((el) => io.observe(el));
    limpar.push(() => io.disconnect());

    // Os reels só tocam quando aparecem.
    const vo = new IntersectionObserver(
      (es) =>
        es.forEach((x) => {
          const v = x.target as HTMLVideoElement;
          if (x.isIntersecting) v.play()?.catch(() => {});
          else v.pause();
        }),
      { threshold: 0.25 },
    );
    $$('.reel video').forEach((v) => vo.observe(v));
    limpar.push(() => vo.disconnect());
  } else {
    $$('.revela').forEach((el) => el.classList.add('on'));
  }

  // Barra fixa depois do topo.
  const barra = $('[data-barra]');
  const topo = $('.topo');
  const barraOn = () => {
    if (barra && topo) barra.classList.toggle('on', topo.getBoundingClientRect().bottom < 0);
  };
  window.addEventListener('scroll', barraOn, { passive: true });
  barraOn();
  limpar.push(() => window.removeEventListener('scroll', barraOn));

  return () => limpar.forEach((f) => f());
}
