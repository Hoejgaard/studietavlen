// Liv i ringvisningen: entré-animation, radar-sweep der tænder noder, koblingslinjer ved hover og 3D-tilt.
// Kører igen ved hver sidevisning (View Transitions) og rydder op før næste swap.
type Item = { slug: string; relaterede: string[] };

let raf = 0;
let cleanup: (() => void)[] = [];

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const fxOff = () => document.documentElement.dataset.fx === 'off';

function init() {
  const wrap = document.querySelector<HTMLElement>('.ringe-wrap');
  if (!wrap) return;
  const svg = wrap.querySelector('svg')!;
  const cx = Number(wrap.dataset.cx), cy = Number(wrap.dataset.cy);
  const nodes = [...svg.querySelectorAll<SVGAElement>('a.node')];
  const sweep = svg.querySelector<SVGGElement>('.sweep');
  const relLayer = svg.querySelector<SVGGElement>('.rel-lines')!;
  const data: Item[] = JSON.parse(document.getElementById('emner-data')?.textContent ?? '[]');
  const rel = new Map(data.map((d) => [d.slug, d.relaterede ?? []]));
  const bySlug = new Map(nodes.map((n) => [n.dataset.slug!, n]));

  /* ---- entré: noderne flyver ind og finder deres plads ---- */
  if (!reduced() && !fxOff() && !sessionStorage.getItem('ringe-set')) {
    nodes.forEach((n, i) => {
      const a = Math.random() * Math.PI * 2, d = 260 + Math.random() * 420;
      n.style.transition = 'none';
      n.style.transform = `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d}px) scale(.2)`;
      n.style.opacity = '0';
      n.getBoundingClientRect();
      n.style.transition = `transform .95s cubic-bezier(.2,.8,.2,1) ${i * 18}ms, opacity .6s ease ${i * 18}ms`;
      n.style.transform = '';
      n.style.opacity = '';
    });
    try { sessionStorage.setItem('ringe-set', '1'); } catch {}
  }

  /* ---- radar-sweep: nålen roterer, og noder lyser op når den passerer ---- */
  let ang = 0, last = performance.now();
  const degs = nodes.map((n) => Number(n.dataset.deg));
  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!fxOff() && sweep) {
      ang = (ang + dt * 22) % 360; // én omgang på ca. 16 s
      sweep.setAttribute('transform', `rotate(${ang.toFixed(2)} ${cx} ${cy})`);
      for (let i = 0; i < nodes.length; i++) {
        let diff = Math.abs(((degs[i] - ang + 540) % 360) - 180);
        if (diff < 4) nodes[i].classList.add('lit');
        else if (diff > 30) nodes[i].classList.remove('lit');
      }
    }
    raf = requestAnimationFrame(frame);
  }
  if (!reduced()) raf = requestAnimationFrame(frame);

  /* ---- koblinger: hover tegner linjer til relaterede emner og dæmper resten ---- */
  const on = (ev: Event) => {
    const n = ev.currentTarget as SVGAElement;
    const x = n.dataset.x!, y = n.dataset.y!;
    relLayer.innerHTML = '';
    svg.classList.add('dim'); n.classList.add('focus');
    for (const s of rel.get(n.dataset.slug!) ?? []) {
      const m = bySlug.get(s); if (!m) continue;
      m.classList.add('focus');
      const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('x1', x); l.setAttribute('y1', y); l.setAttribute('x2', m.dataset.x!); l.setAttribute('y2', m.dataset.y!);
      relLayer.appendChild(l);
      requestAnimationFrame(() => l.classList.add('on'));
    }
  };
  const off = () => { relLayer.innerHTML = ''; svg.classList.remove('dim'); nodes.forEach((m) => m.classList.remove('focus')); };
  nodes.forEach((n) => { n.addEventListener('mouseenter', on); n.addEventListener('focus', on); n.addEventListener('mouseleave', off); n.addEventListener('blur', off); });
  cleanup.push(() => nodes.forEach((n) => { n.removeEventListener('mouseenter', on); n.removeEventListener('focus', on); n.removeEventListener('mouseleave', off); n.removeEventListener('blur', off); }));

  /* ---- 3D-tilt efter musen ---- */
  if (!reduced() && matchMedia('(pointer: fine)').matches) {
    const move = (ev: MouseEvent) => {
      if (fxOff()) return;
      const r = wrap.getBoundingClientRect();
      const px = (ev.clientX - r.left) / r.width - 0.5, py = (ev.clientY - r.top) / r.height - 0.5;
      wrap.style.setProperty('--ry', `${(px * 7).toFixed(2)}deg`);
      wrap.style.setProperty('--rx', `${(-py * 7).toFixed(2)}deg`);
    };
    const leave = () => { wrap.style.setProperty('--rx', '0deg'); wrap.style.setProperty('--ry', '0deg'); };
    wrap.addEventListener('mousemove', move); wrap.addEventListener('mouseleave', leave);
    cleanup.push(() => { wrap.removeEventListener('mousemove', move); wrap.removeEventListener('mouseleave', leave); });
  }
}

function teardown() {
  cancelAnimationFrame(raf); raf = 0;
  cleanup.forEach((f) => f()); cleanup = [];
}

document.addEventListener('astro:page-load', () => { teardown(); init(); });
document.addEventListener('astro:before-swap', teardown);
