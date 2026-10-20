// Styrer partikelsværmen: indlæses dovent (three.js hentes først, når den skal bruges), kun når FX er til,
// WebGL er tilgængelig og brugeren ikke har bedt om reduceret bevægelse. Ellers vises 2D-HUD'en (hud.ts).
type Mod = typeof import('./swarm');
let mod: Mod | null = null;
let loading: Promise<Mod> | null = null;

const root = document.documentElement;
// Et udtrykkeligt FX-til (data-fx="on", sat med knappen) vinder over systemets "reducer bevægelse".
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches && root.dataset.fx !== 'on';
const webgl = () => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } };
const wanted = () => root.dataset.fx !== 'off' && !reduced() && webgl();

// Første start udskydes, til siden er faldet til ro (ringens entré-animation, fonte, layout), så opstarten ikke hakker.
const idle = () => new Promise<void>((r) => {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void };
  const go = () => setTimeout(r, 900);
  w.requestIdleCallback ? w.requestIdleCallback(go, { timeout: 1500 }) : setTimeout(go, 600);
});

async function sync() {
  const canvas = document.getElementById('swarm') as HTMLCanvasElement | null;
  if (!canvas) return;
  if (wanted()) {
    if (!mod) { await idle(); mod = await (loading ??= import('./swarm')); }
    if (!wanted()) return; // slået fra, mens vi hentede
    const s = mod.start(canvas);
    root.dataset.swarm = s ? 'on' : 'off';
    if (!s) root.dataset.swarm = 'off';
  } else if (mod) {
    mod.stop();
    root.dataset.swarm = 'off';
  }
}

// Debounce: under en View Transition nulstilles <html>-attributterne et øjeblik, før prefs.ts sætter dem igen.
let t = 0;
const syncSoon = () => { clearTimeout(t); t = window.setTimeout(sync, 120); };
new MutationObserver(syncSoon).observe(root, { attributes: true, attributeFilter: ['data-fx'] });
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', syncSoon);
document.addEventListener('astro:page-load', () => { syncSoon(); mod?.relayout(); });
document.addEventListener('astro:after-swap', () => mod?.relayout());
