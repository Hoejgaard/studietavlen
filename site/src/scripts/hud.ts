// Let holografisk HUD-baggrund i 2D canvas: ringe, radar-sweep og partikler.
// Slås fra med data-fx="off" på <html> eller prefers-reduced-motion.
const c = document.getElementById('hud') as HTMLCanvasElement | null;
if (c) {
  const ctx = c.getContext('2d')!;
  let W = 0, H = 0, t = 0, running = false;
  const P = Array.from({ length: 220 }, (_, i) => ({
    a: Math.random() * Math.PI * 2,
    r: 0.25 + Math.random() * 0.75,
    s: (0.2 + Math.random() * 0.8) * (i % 2 ? 1 : -1),
    z: Math.random(),
  }));
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const size = () => { W = c.width = innerWidth * dpr; H = c.height = innerHeight * dpr; };
  addEventListener('resize', size);
  size();

  const accent = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#19e3ff';
  const rgba = (hex: string, a: number) => {
    const m = hex.replace('#', '');
    const n = parseInt(m.length === 3 ? m.split('').map((x) => x + x).join('') : m, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  };

  function frame() {
    if (!running) return;
    t += 0.004;
    ctx.clearRect(0, 0, W, H);
    const col = accent();
    const cx = W * 0.5, cy = H * 0.55, R = Math.min(W, H) * 0.62;
    ctx.lineWidth = dpr;
    for (let k = 1; k <= 4; k++) {
      ctx.beginPath(); ctx.arc(cx, cy, (R * k) / 4, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(col, 0.05 + 0.02 * (k % 2)); ctx.stroke();
    }
    const g = ctx.createConicGradient(t * 1.5, cx, cy);
    g.addColorStop(0, rgba(col, 0.1)); g.addColorStop(0.12, rgba(col, 0)); g.addColorStop(1, rgba(col, 0));
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
    for (const p of P) {
      const a = p.a + t * p.s, r = R * p.r + Math.sin(t * 3 + p.z * 9) * 4;
      ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, (1 + p.z) * dpr, 0, 7);
      ctx.fillStyle = rgba(col, 0.15 + p.z * 0.35); ctx.fill();
    }
    requestAnimationFrame(frame);
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const sync = () => {
    const ds = document.documentElement.dataset;
    const want = ds.fx !== 'off' && ds.swarm !== 'on' && (!reduced.matches || ds.fx === 'on') && !document.hidden;
    if (want && !running) { running = true; requestAnimationFrame(frame); }
    if (!want) running = false;
  };
  new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ['data-fx', 'data-swarm'] });
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  sync();
}
