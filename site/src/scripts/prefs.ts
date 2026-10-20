// Tema (mørk/lys) og baggrundseffekt (til/fra), husket i localStorage.
const root = document.documentElement;
const save = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch {} };

document.getElementById('tema')?.addEventListener('click', () => {
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  root.dataset.theme = next; save('tema', next);
});
document.getElementById('fx')?.addEventListener('click', () => {
  const next = root.dataset.fx === 'off' ? 'on' : 'off';
  root.dataset.fx = next; save('fx', next);
});
