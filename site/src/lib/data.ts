import { getCollection, type CollectionEntry } from 'astro:content';
import base from '../../../content/otp/fag.base.json';

export type Emne = CollectionEntry<'emner'>;

// Tavlens rækkefølge = fagets kronologi. Skal matche tools/build-fag-json.py.
export const BLIK_ORDER = [
  'Grundlag og metode',
  'Scientific Management',
  'Det legitimt rationelle (bureaukrati)',
  'Human Relations',
  'Contingency-teori',
  'Konfigurationsteori',
  'Institutionel teori',
  'Kulturblik',
  'Forandringsblik',
  'Meningsblik',
  'Magtblik',
  'Cases',
];

export const FAG = base;

export function blikLabel(b: string) {
  return b.replace(/\s*\(.*\)/, '');
}

export function blikSlug(b: string) {
  return b
    .toLowerCase()
    .replace(/\s*\(.*\)/, '')
    .replace(/[æ]/g, 'ae').replace(/[ø]/g, 'oe').replace(/[å]/g, 'aa')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function alleEmner(): Promise<Emne[]> {
  const all = await getCollection('emner');
  return all.sort((a, b) => {
    const ba = BLIK_ORDER.indexOf(a.data.blik), bb = BLIK_ORDER.indexOf(b.data.blik);
    if (ba !== bb) return ba - bb;
    if (a.data.relevans !== b.data.relevans) return b.data.relevans - a.data.relevans;
    return a.data.title.localeCompare(b.data.title, 'da');
  });
}

export function grupperEfterBlik(emner: Emne[]) {
  return BLIK_ORDER
    .map((blik) => ({ blik, label: blikLabel(blik), emner: emner.filter((e) => e.data.blik === blik) }))
    .filter((g) => g.emner.length > 0);
}

export function dots(n: number) {
  return '●'.repeat(n) + '○'.repeat(5 - n);
}

export function kortTitel(t: string, max = 26) {
  const s = t.replace(/\s*\(.*?\)\s*/g, ' ').replace(/:.*$/, '').trim();
  return s.length > max ? s.slice(0, max - 2) + '…' : s;
}

/** Det, palette og hover har brug for på klientsiden. Holdes lille. */
export function tilKlient(emner: Emne[]) {
  return emner.map((e) => ({
    slug: e.id,
    title: e.data.title,
    blik: e.data.blik,
    kort: e.data.kort,
    teoretikere: e.data.teoretikere,
    interesse: e.data.interesse,
    faenomener: e.data.faenomener,
    relevans: e.data.relevans,
    noegleord: e.data.nøgleord,
  }));
}

/** Trækker "## Begreber til eksamen"-afsnittet ud af brødteksten som liste af {begreb, forklaring}. */
export function begreberFra(body: string | undefined) {
  if (!body) return [];
  const m = body.match(/## Begreber til eksamen\s*\n([\s\S]*?)(?=\n## |\s*$)/);
  if (!m) return [];
  return m[1]
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('- '))
    .map((l) => {
      const mm = l.match(/^- \*\*(.+?)\*\*:?\s*(.*)$/);
      return mm ? { begreb: mm[1], forklaring: mm[2] } : { begreb: l.slice(2), forklaring: '' };
    });
}
