// @ts-check
import { defineConfig } from 'astro/config';
import { remarkWikilinks } from './src/lib/remark-wikilinks.mjs';

// GitHub Pages: sitet ligger under https://<bruger>.github.io/<repo>/.
// `site` og `base` skal matche GitHub-brugeren og repo-navnet. Alle interne links går
// gennem src/lib/url.ts (import.meta.env.BASE_URL), så kun disse to linjer skal ændres.
// Lokalt (npm run dev / preview) serveres sitet også under base-stien, fx http://127.0.0.1:4321/studietavlen/.
const site = 'https://hoejgaard.github.io';
const base = '/studietavlen';

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'always',
  markdown: {
    remarkPlugins: [[remarkWikilinks, { base }]],
    shikiConfig: { theme: 'github-dark' },
  },
  vite: {
    server: {
      // Indholdet ligger uden for site/, så dev-serveren skal have lov at læse det.
      fs: { allow: ['..'] },
    },
  },
});
