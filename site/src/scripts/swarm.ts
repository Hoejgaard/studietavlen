// Partikelsværm (three.js). Indlæses kun, når FX er til, WebGL findes og "reducer bevægelse" er slået fra.
// På forsiden samler partiklerne sig om ringens noder og ringe; på andre sider danner de en HUD bag indholdet.
// De trækker sig væk fra musen og glider til nye mål ved sideskift, så skiftet mellem visninger "morpher".
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, Color, NormalBlending, OrthographicCamera,
  Points, Scene, ShaderMaterial, WebGLRenderer,
} from 'three';

type Mode = 'ring' | 'page';

const VERT = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    vColor = aColor;
    vTwinkle = 0.65 + 0.35 * sin(uTime * (1.2 + aSeed * 1.8) + aSeed * 40.0);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio * (0.8 + 0.4 * (position.z + 1.0));
    gl_Position = projectionMatrix * mv;
  }
`;
const FRAG = /* glsl */ `
  precision mediump float;
  uniform float uAlpha;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = pow(smoothstep(0.5, 0.0, d), 1.6) * vTwinkle * uAlpha;
    gl_FragColor = vec4(vColor, a);
  }
`;

function cssColor(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new Color(v || fallback);
}

function particleCount() {
  const area = innerWidth * innerHeight;
  let n = Math.round(area / 170);
  const nav = navigator as Navigator & { deviceMemory?: number };
  const weak = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4 || innerWidth < 900;
  if (weak) n = Math.round(n / 2.4);
  return Math.max(900, Math.min(7000, n));
}

class Swarm {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera: OrthographicCamera;
  private geo = new BufferGeometry();
  private mat: ShaderMaterial;
  private n: number;
  private pos: Float32Array; private vel: Float32Array; private tgt: Float32Array;
  private seed: Float32Array; private size: Float32Array; private col: Float32Array;
  // anker: hvilken "attraktor" partiklen hører til (nodeindeks, ring eller støv) og dens bane
  private kind: Uint8Array; private anchor: Int16Array; private orbitR: Float32Array; private phase: Float32Array; private spin: Float32Array;
  private mode: Mode = 'page';
  private nodes: { x: number; y: number; r: number; gold: boolean }[] = [];
  private ringR: number[] = []; private ringC = { x: 0, y: 0 }; private ringScale = 1;
  private mouse = { x: -9999, y: -9999 };
  private raf = 0; private last = 0; private slowFrames = 0; private drawN: number;
  private layoutTimer = 0; private alive = true;
  private accent = new Color('#19e3ff'); private gold = new Color('#ffc864');

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0x000000, 0);
    this.camera = new OrthographicCamera(0, 1, 0, 1, -10, 10);
    this.n = particleCount(); this.drawN = this.n;
    const n = this.n;
    this.pos = new Float32Array(n * 3); this.vel = new Float32Array(n * 3); this.tgt = new Float32Array(n * 3);
    this.seed = new Float32Array(n); this.size = new Float32Array(n); this.col = new Float32Array(n * 3);
    this.kind = new Uint8Array(n); this.anchor = new Int16Array(n); this.orbitR = new Float32Array(n); this.phase = new Float32Array(n); this.spin = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      this.seed[i] = Math.random();
      this.pos[i * 3] = Math.random() * innerWidth; this.pos[i * 3 + 1] = Math.random() * innerHeight; this.pos[i * 3 + 2] = Math.random() * 2 - 1;
      this.phase[i] = Math.random() * Math.PI * 2;
      this.spin[i] = (0.15 + Math.random() * 0.5) * (Math.random() < 0.5 ? 1 : -1);
    }
    this.geo.setAttribute('position', new BufferAttribute(this.pos, 3));
    this.geo.setAttribute('aSize', new BufferAttribute(this.size, 1));
    this.geo.setAttribute('aSeed', new BufferAttribute(this.seed, 1));
    this.geo.setAttribute('aColor', new BufferAttribute(this.col, 3));
    this.mat = new ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, depthTest: false,
      blending: AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 }, uAlpha: { value: 0.9 } },
    });
    this.scene.add(new Points(this.geo, this.mat));
    this.resize(); this.theme(); this.layout();
    addEventListener('resize', this.onResize);
    addEventListener('mousemove', this.onMouse, { passive: true });
    addEventListener('mouseleave', this.onLeave);
    this.themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  private themeObs = new MutationObserver(() => this.theme());
  private onResize = () => { this.resize(); this.layout(); };
  private onMouse = (e: MouseEvent) => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; };
  private onLeave = () => { this.mouse.x = -9999; this.mouse.y = -9999; };

  private resize() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(innerWidth, innerHeight, false);
    this.camera.left = 0; this.camera.right = innerWidth; this.camera.top = 0; this.camera.bottom = innerHeight;
    this.camera.updateProjectionMatrix();
    this.mat.uniforms.uPixelRatio.value = dpr;
  }

  private theme() {
    const light = document.documentElement.dataset.theme === 'light';
    this.accent = cssColor('--accent', light ? '#006d8f' : '#19e3ff');
    this.gold = cssColor('--gold', light ? '#a66b00' : '#ffc864');
    this.mat.blending = light ? NormalBlending : AdditiveBlending;
    this.mat.uniforms.uAlpha.value = light ? 0.55 : 0.9;
    this.mat.needsUpdate = true;
    this.recolor();
  }

  private recolor() {
    for (let i = 0; i < this.n; i++) {
      const k = this.kind[i];
      const gold = k === 0 && this.nodes[this.anchor[i]]?.gold;
      const c = gold ? this.gold : this.accent;
      const dim = k === 2 ? 0.55 : k === 1 ? 0.8 : 1;
      this.col[i * 3] = c.r * dim; this.col[i * 3 + 1] = c.g * dim; this.col[i * 3 + 2] = c.b * dim;
    }
    (this.geo.getAttribute('aColor') as BufferAttribute).needsUpdate = true;
  }

  /** Læser ringens geometri fra DOM (viewBox -> skærm) og fordeler partiklerne på noder, ringe og støv. */
  layout() {
    const wrap = document.querySelector<HTMLElement>('.ringe-wrap');
    const svg = wrap?.querySelector('svg');
    const visible = !!svg && wrap!.offsetParent !== null && wrap!.getBoundingClientRect().width > 0;
    this.mode = visible ? 'ring' : 'page';
    if (this.mode === 'ring') {
      const m = svg!.getScreenCTM()!;
      const map = (vx: number, vy: number) => ({ x: m.a * vx + m.c * vy + m.e, y: m.b * vx + m.d * vy + m.f });
      this.ringScale = Math.hypot(m.a, m.b);
      const cx = Number(wrap!.dataset.cx), cy = Number(wrap!.dataset.cy);
      this.ringC = map(cx, cy);
      this.ringR = [120, 190, 260, 330, 352].map((r) => r * this.ringScale);
      this.nodes = [...svg!.querySelectorAll<SVGAElement>('a.node')].map((a) => {
        const p = map(Number(a.dataset.x), Number(a.dataset.y));
        const dot = a.querySelector<SVGCircleElement>('.dot');
        return { x: p.x, y: p.y, r: (dot ? Number(dot.getAttribute('r')) : 10) * this.ringScale, gold: a.classList.contains('r5') };
      });
    } else {
      this.ringC = { x: innerWidth * 0.5, y: innerHeight * 0.55 };
      const R = Math.min(innerWidth, innerHeight) * 0.62;
      this.ringR = [R * 0.25, R * 0.5, R * 0.75, R, R * 1.06];
      this.ringScale = R / 352;
      // Uden noder: en "kerne" i midten og 12 ankre på den inderste ring (som en HUD)
      this.nodes = Array.from({ length: 13 }, (_, i) => {
        if (i === 0) return { x: this.ringC.x, y: this.ringC.y, r: R * 0.11, gold: false };
        const a = (i / 12) * Math.PI * 2;
        return { x: this.ringC.x + Math.cos(a) * R * 0.5, y: this.ringC.y + Math.sin(a) * R * 0.5, r: R * 0.03, gold: i % 4 === 0 };
      });
    }
    // Fordeling: 50 % om noder (vægtet efter størrelse), 32 % på ringe, 18 % støv
    const nNode = Math.round(this.n * 0.5), nRing = Math.round(this.n * 0.32);
    const weights = this.nodes.map((nd) => nd.r * nd.r + 30);
    const wsum = weights.reduce((a, b) => a + b, 0);
    let i = 0, acc = 0;
    for (let k = 0; k < this.nodes.length; k++) {
      acc += weights[k];
      const until = Math.round((acc / wsum) * nNode);
      for (; i < until && i < nNode; i++) {
        this.kind[i] = 0; this.anchor[i] = k;
        this.orbitR[i] = this.nodes[k].r * (1.3 + Math.random() * 1.6) + (this.mode === 'page' && k === 0 ? Math.random() * 10 : 0);
        this.size[i] = 1.6 + Math.random() * 2.2;
      }
    }
    for (; i < nNode; i++) { this.kind[i] = 0; this.anchor[i] = 0; this.orbitR[i] = this.nodes[0].r * 2; this.size[i] = 2; }
    for (let j = 0; j < nRing; j++, i++) {
      this.kind[i] = 1; this.anchor[i] = j % this.ringR.length;
      this.orbitR[i] = this.ringR[this.anchor[i]] + (Math.random() - 0.5) * 6;
      this.size[i] = 1.2 + Math.random() * 1.4;
    }
    for (; i < this.n; i++) {
      this.kind[i] = 2; this.anchor[i] = -1;
      this.orbitR[i] = 0; this.size[i] = 1 + Math.random() * 1.6;
      this.tgt[i * 3] = Math.random() * innerWidth; this.tgt[i * 3 + 1] = Math.random() * innerHeight;
    }
    (this.geo.getAttribute('aSize') as BufferAttribute).needsUpdate = true;
    this.recolor();
  }

  /** Kaldes ved sideskift: nyt layout, og partiklerne glider derhen. */
  relayout() { clearTimeout(this.layoutTimer); this.layoutTimer = window.setTimeout(() => this.layout(), 60); }

  private frame = (now: number) => {
    if (!this.alive) return;
    this.raf = requestAnimationFrame(this.frame);
    const dt = Math.min(0.05, (now - this.last) / 1000); this.last = now;
    if (document.hidden) return;
    // fps-vagt: er maskinen for langsom, tegnes færre partikler
    if (dt > 0.034) { if (++this.slowFrames > 45 && this.drawN > 900) { this.drawN = Math.round(this.drawN * 0.65); this.geo.setDrawRange(0, this.drawN); this.slowFrames = 0; } }
    else if (this.slowFrames > 0) this.slowFrames--;

    const t = now / 1000;
    this.mat.uniforms.uTime.value = t;
    if (this.mode === 'ring' && (now % 400) < 17) this.layout(); // følg 3D-tilt og scroll let forsinket

    const { x: mx, y: my } = this.mouse;
    const pos = this.pos, vel = this.vel, tgt = this.tgt;
    const k = 1 - Math.pow(0.001, dt); // ca. 6 %/frame ved 60 fps
    for (let i = 0; i < this.drawN; i++) {
      const i3 = i * 3, kind = this.kind[i];
      if (kind === 0) {
        const nd = this.nodes[this.anchor[i]];
        const a = this.phase[i] + t * this.spin[i] * 1.6;
        tgt[i3] = nd.x + Math.cos(a) * this.orbitR[i];
        tgt[i3 + 1] = nd.y + Math.sin(a) * this.orbitR[i] * 0.85;
      } else if (kind === 1) {
        const a = this.phase[i] + t * this.spin[i] * 0.12;
        tgt[i3] = this.ringC.x + Math.cos(a) * this.orbitR[i];
        tgt[i3 + 1] = this.ringC.y + Math.sin(a) * this.orbitR[i];
      } else {
        tgt[i3] += Math.sin(t * 0.3 + this.seed[i] * 9) * 0.15;
        tgt[i3 + 1] += Math.cos(t * 0.25 + this.seed[i] * 7) * 0.12;
        if (tgt[i3] < -20) tgt[i3] = innerWidth + 20; else if (tgt[i3] > innerWidth + 20) tgt[i3] = -20;
        if (tgt[i3 + 1] < -20) tgt[i3 + 1] = innerHeight + 20; else if (tgt[i3 + 1] > innerHeight + 20) tgt[i3 + 1] = -20;
      }
      // frastødning fra musen
      const dx = pos[i3] - mx, dy = pos[i3 + 1] - my, d2 = dx * dx + dy * dy;
      if (d2 < 14400 && d2 > 0.01) { const d = Math.sqrt(d2), f = (1 - d / 120) * 160 * dt; vel[i3] += (dx / d) * f; vel[i3 + 1] += (dy / d) * f; }
      vel[i3] *= 0.86; vel[i3 + 1] *= 0.86;
      pos[i3] += (tgt[i3] - pos[i3]) * k + vel[i3];
      pos[i3 + 1] += (tgt[i3 + 1] - pos[i3 + 1]) * k + vel[i3 + 1];
    }
    (this.geo.getAttribute('position') as BufferAttribute).needsUpdate = true;
    this.renderer.render(this.scene, this.camera);
  };

  /** Sætter sværmen på pause (FX fra). Instansen og WebGL-konteksten beholdes, så den kan genoptages uden flimmer. */
  pause() { this.alive = false; cancelAnimationFrame(this.raf); this.raf = 0; this.renderer.clear(); }
  resume() { if (this.alive) return; this.alive = true; this.last = performance.now(); this.resize(); this.theme(); this.layout(); this.raf = requestAnimationFrame(this.frame); }
}

let current: Swarm | null = null;

export function start(canvas: HTMLCanvasElement) {
  if (current) { current.resume(); current.relayout(); return current; }
  try { current = new Swarm(canvas); } catch (e) { console.warn('Partikelsværm kunne ikke starte', e); current = null; }
  return current;
}
export function relayout() { current?.relayout(); }
export function stop() { current?.pause(); }
