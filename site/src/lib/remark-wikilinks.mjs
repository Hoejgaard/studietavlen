// Omsætter [[slug]] i emnefilernes brødtekst til links med emnets titel.
// Ingen afhængigheder: går selv mdast-træet igennem.
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const EMNER_DIR = join(here, '..', '..', '..', 'content', 'otp', 'emner');

function titleMap() {
  const map = new Map();
  for (const f of readdirSync(EMNER_DIR)) {
    if (!f.endsWith('.md')) continue;
    const text = readFileSync(join(EMNER_DIR, f), 'utf8');
    const m = text.match(/^title:\s*"(.*)"\s*$/m);
    map.set(f.replace(/\.md$/, ''), m ? m[1] : f);
  }
  return map;
}

const RE = /\[\[([a-z0-9-]+)\]\]/g;

/**
 * @param {{ base?: string }} [options] base = sitets base-sti (samme som `base` i astro.config.mjs),
 *   så links virker under fx /studietavlen/. Pluginet kører i Node og har ikke import.meta.env.BASE_URL.
 */
export function remarkWikilinks(options = {}) {
  const base = (options.base ?? '/').replace(/\/$/, '');
  const titles = titleMap();
  return (tree) => walk(tree, titles, base);
}

function walk(node, titles, base) {
  if (!node.children) return;
  const next = [];
  for (const child of node.children) {
    if (child.type === 'text' && RE.test(child.value)) {
      RE.lastIndex = 0;
      let last = 0;
      let m;
      while ((m = RE.exec(child.value))) {
        if (m.index > last) next.push({ type: 'text', value: child.value.slice(last, m.index) });
        const slug = m[1];
        next.push({
          type: 'link',
          url: `${base}/emner/${slug}/`,
          data: { hProperties: { className: ['wikilink'] } },
          children: [{ type: 'text', value: titles.get(slug) ?? slug }],
        });
        last = m.index + m[0].length;
      }
      if (last < child.value.length) next.push({ type: 'text', value: child.value.slice(last) });
    } else {
      walk(child, titles, base);
      next.push(child);
    }
  }
  node.children = next;
}
