// Hover-HUD: elementer med data-slug får et kort på hover med kort intro, interesse og fænomener.
// Bindes igen ved hver sidevisning (View Transitions).
type Item = { slug: string; title: string; kort: string; interesse: string; faenomener: string };
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

function init() {
  const hov = document.getElementById('hover');
  const raw = document.getElementById('emner-data')?.textContent;
  if (!hov || !raw || !matchMedia('(hover: hover)').matches) return;
  const by = new Map<string, Item>((JSON.parse(raw) as Item[]).map((e) => [e.slug, e]));
  const move = (ev: MouseEvent) => {
    const w = hov.offsetWidth || 360, h = hov.offsetHeight || 200;
    const x = Math.min(ev.clientX + 18, innerWidth - w - 10), y = Math.min(ev.clientY + 18, innerHeight - h - 10);
    hov.style.left = Math.max(8, x) + 'px'; hov.style.top = Math.max(8, y) + 'px';
  };
  document.querySelectorAll<HTMLElement>('[data-slug]').forEach((el) => {
    if (el.dataset.hoverBound) return;
    const e = by.get(el.dataset.slug!);
    if (!e) return;
    el.dataset.hoverBound = '1';
    el.addEventListener('mouseenter', (ev) => {
      hov.innerHTML = `<div class="h">${esc(e.title)}</div>${esc(e.kort)}<div class="k">Interesse</div>${esc(e.interesse)}<div class="k">Fænomener</div>${esc(e.faenomener)}`;
      hov.style.display = 'block'; move(ev as MouseEvent);
    });
    el.addEventListener('mousemove', move);
    el.addEventListener('mouseleave', () => (hov.style.display = 'none'));
  });
}
document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', () => { const h = document.getElementById('hover'); if (h) h.style.display = 'none'; });
