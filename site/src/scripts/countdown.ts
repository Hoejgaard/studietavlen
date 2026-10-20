// Nedtælling i headeren: til caseudlevering, derefter til aflevering, derefter mundtlig eksamen.
let timer = 0;

function fmt(ms: number) {
  const d = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000), m = Math.floor((ms % 3600000) / 60000);
  if (d > 0) return `${d} d ${h} t`;
  if (h > 0) return `${h} t ${m} min`;
  return `${m} min`;
}

function tick() {
  const el = document.getElementById('count') as HTMLAnchorElement | null;
  if (!el) return;
  const now = Date.now();
  const caseT = Date.parse(el.dataset.case!), aflev = Date.parse(el.dataset.aflev!);
  let label: string, cls = '';
  if (now < caseT) label = `Case om ${fmt(caseT - now)}`;
  else if (now < aflev) { label = `Aflevering om ${fmt(aflev - now)}`; cls = 'hot'; }
  else label = 'Mundtlig eksamen uge 49';
  el.textContent = label;
  el.className = 'count ' + cls;
}

function init() { clearInterval(timer); tick(); timer = window.setInterval(tick, 30000); }
document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', () => clearInterval(timer));
