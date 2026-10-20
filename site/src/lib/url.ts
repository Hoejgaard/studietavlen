// Præfikser interne stier med sitets base-sti, så sitet virker både lokalt (base '/')
// og på GitHub Pages under fx '/studietavlen/'. Bruges i .astro-filer og klientscripts.
// import.meta.env.BASE_URL sættes af Astro ud fra `base` i astro.config.mjs.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** url('/emner/x/') -> '/studietavlen/emner/x/' (eller '/emner/x/' uden base). */
export function url(path: string): string {
  return BASE + (path.startsWith('/') ? path : `/${path}`);
}
