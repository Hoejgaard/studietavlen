// Tema (mørk/lys) og bevægelse/baggrundseffekt (til/fra), husket i localStorage.
// Genanvendes efter hver View Transition, fordi <html>-attributterne ellers nulstilles.
const root = document.documentElement;
const read = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const save = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch {} };

function apply() {
  const t = read('tema'); if (t) root.dataset.theme = t;
  const fx = read('fx'); if (fx) root.dataset.fx = fx;
}

function bind() {
  document.getElementById('tema')?.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next; save('tema', next);
  });
  document.getElementById('fx')?.addEventListener('click', () => {
    const next = root.dataset.fx === 'off' ? 'on' : 'off';
    root.dataset.fx = next; save('fx', next);
  });
}

document.addEventListener('astro:after-swap', apply);
document.addEventListener('astro:page-load', bind);
