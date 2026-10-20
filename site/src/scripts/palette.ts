// Spring-feltet: Ctrl K, søgning på titel, blik, teoretikere, resumé og nøgleord. Piletaster + Enter.
import { url } from '../lib/url';

type Item = { slug: string; title: string; blik: string; kort: string; teoretikere: string[]; interesse: string; noegleord: string[] };

const q = document.getElementById('q') as HTMLInputElement | null;
const pal = document.getElementById('palette');
const raw = document.getElementById('emner-data')?.textContent;

if (q && pal && raw) {
  const items: Item[] = JSON.parse(raw);
  let sel = 0;
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
  const hay = (e: Item) => [e.title, e.blik, e.kort, e.teoretikere.join(' '), e.interesse, e.noegleord.join(' ')].join(' ').toLowerCase();

  function render(s: string) {
    const t = s.toLowerCase().trim();
    const words = t.split(/\s+/).filter(Boolean);
    const hits = items
      .map((e) => ({ e, h: hay(e) }))
      .filter(({ h }) => words.every((w) => h.includes(w)))
      .sort((a, b) => Number(b.e.title.toLowerCase().includes(t)) - Number(a.e.title.toLowerCase().includes(t)))
      .slice(0, 14);
    pal!.innerHTML = hits.length
      ? hits.map(({ e }, i) => `<a class="row${i === 0 ? ' sel' : ''}" role="option" href="${url(`/emner/${e.slug}/`)}"><span class="b">${esc(e.blik)}</span><span>${esc(e.title)}</span><span class="k">${esc(e.teoretikere[0] ?? '')}</span></a>`).join('')
      : '<div class="empty">Ingen emner matcher. Prøv et teoretikernavn eller et begreb.</div>';
    sel = 0;
  }
  const rows = () => [...pal!.querySelectorAll<HTMLAnchorElement>('a.row')];
  const open = () => { render(q!.value); pal!.classList.add('open'); };
  const close = () => pal!.classList.remove('open');

  q.addEventListener('focus', open);
  q.addEventListener('input', () => { render(q.value); pal.classList.add('open'); });
  q.addEventListener('keydown', (ev) => {
    const r = rows();
    if (ev.key === 'ArrowDown') sel = Math.min(sel + 1, r.length - 1);
    else if (ev.key === 'ArrowUp') sel = Math.max(sel - 1, 0);
    else if (ev.key === 'Enter') { r[sel]?.click(); return; }
    else if (ev.key === 'Escape') { close(); q.blur(); return; }
    else return;
    r.forEach((x, i) => x.classList.toggle('sel', i === sel));
    r[sel]?.scrollIntoView({ block: 'nearest' });
    ev.preventDefault();
  });
  document.addEventListener('keydown', (ev) => {
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'k') { ev.preventDefault(); q.focus(); q.select(); }
    if (ev.key === '/' && document.activeElement === document.body) { ev.preventDefault(); q.focus(); }
  });
  document.addEventListener('click', (ev) => { if (!pal.contains(ev.target as Node) && ev.target !== q) close(); });
}
