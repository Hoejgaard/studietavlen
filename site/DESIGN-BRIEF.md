# Designbrief for Studietavlen (fra Alexander, 19. oktober 2026)

## Stemning og inspiration

Futuristisk, JARVIS-agtigt (Iron Man). Inspirationen er partikel-visualiseringen på https://particles.casberry.in/,
hvor 20.000 partikler danner en holografisk HUD med en kerne, roterende segmenterede ringe, en radar-sweep og en
bølgering. Referencekoden ligger i `site/reference/particles-swarm.html` (three.js, InstancedMesh, UnrealBloom).

Det er stemningen, ikke en spec. Tavlen skal føles som et interaktivt holografisk interface, men indholdet skal være
læsbart og hurtigt at bruge sent om aftenen før eksamen.

## Hvad sitet skal kunne

1. **Hurtigt spring mellem emner.** JARVIS-lignende interaktive egenskaber: søg/kommando-felt, tastaturnavigation,
   genveje. Man skal kunne hoppe fra Weber til isomorfi til magt på få tastetryk.
2. **Overblik over alle emner på én gang.** Tavlen viser alle 36 emner, grupperet efter undervisers optik
   (blik). Tabellen fra lektion 5 (blik, teoretikere, interesse, fænomener) er rygraden og skal kunne ses samlet.
3. **Hover = kort introduktion.** Holder man musen over et emne, ser man `kort` + `interesse` + `faenomener`.
4. **Klik = dybde.** Hele emnet åbnes: Kernen (på almindeligt dansk), Blikket, Uddybning, Eksempler, Kritik,
   Begreber til eksamen, Eksamensspørgsmål.
5. **Begreber til eksamen fremhæves.** Hvert emne lister de begreber, man skal kunne bruge for at løfte karakteren.
   De skal være synlige og søgbare på tværs.
6. **Relaterede emner** som links, så man kan følge koblingerne (fx Taylor → Hawthorne → Herzberg).

## Tekniske rammer (fra CLAUDE.md)

- Statisk site, læser `content/otp/emner/*.md` og `fag.json`. Astro foreslået.
- Dansk UI. Mobilvenlig. Dark mode som udgangspunkt (passer til JARVIS-æstetikken), men lys tilstand skal findes.
- Partikel-/WebGL-effekten må aldrig gøre indholdet langsommere at nå. Den skal kunne slås fra, og sitet skal virke
  uden WebGL.
- Node.js skal installeres på Alexanders maskine, før sitet kan bygges.

## Status 20. oktober 2026: trin 1 "levende site" er bygget

Valgt: Ringe som forside, Tavle som alternativ visning (og mobil-fallback). Implementeret i `site/`:

- **Ringen lever.** Dekorative ringe roterer langsomt (240 s/omgang), noderne "ånder" faseforskudt,
  relevans 5 pulserer i guld, og en radar-sweep i selve ringen tænder noderne, når den passerer
  (`site/src/scripts/ringe.ts` + `.sweep`/`.lit` i `global.css`).
- **Ringen reagerer.** Hover/fokus på en node tegner stiplede, lysende linjer til dens `relaterede` og dæmper
  resten. Musen vipper skiven svagt i 3D (CSS perspective + `--rx/--ry`).
- **Entré.** Noderne flyver ind fra tilfældige positioner første gang i en fane (sessionStorage `ringe-set`).
- **View Transitions.** `<ClientRouter />` i `Base.astro`; HUD-canvas persisteres, main fader. Alle klientscripts
  binder på `astro:page-load` og rydder op på `astro:before-swap`; tema/FX genanvendes på `astro:after-swap`.
- **Nedtælling** i headeren til caseudlevering (6/11 kl. 9), derefter aflevering (9/11 kl. 9), derefter "mundtlig uge 49".
- Fravalgt efter Alexanders ønske: markering af læste emner (sitet er et værktøj, man hopper ind og ud af).
- FX-knappen slår al bevægelse fra (sweep, rotation, ånding, tilt, baggrund). `prefers-reduced-motion` gør det samme.

## Status 20. oktober 2026: trin 2 "partikelsværm" er bygget

- `site/src/scripts/swarm.ts` (three.js `Points` med egen shader, additiv blanding i mørk tilstand, normal i lys).
  900-7000 partikler efter skærmstørrelse og maskine; 50 % kredser om ringens noder (læst fra SVG'ens
  `getScreenCTM`, så de følger 3D-tilt), 32 % ligger på ringene, 18 % er støv. Guld om relevans 5-noder.
- På sider uden ring danner partiklerne en HUD (kerne + 12 ankre + ringe) bag indholdet. Ved sideskift
  glider partiklerne til de nye mål, så Ringe → emne → Tavle "morpher".
- Musen frastøder partikler inden for 120 px. fps-vagt tegner færre partikler, hvis maskinen er langsom.
  Pause når fanen er skjult. Canvas persisteres på tværs af View Transitions.
- `site/src/scripts/fx.ts` indlæser three.js dovent (ca. 120 kB gzip) og kun når FX er til, WebGL findes og
  "reducer bevægelse" ikke er slået til. Uden WebGL vises 2D-HUD'en (hud.ts) som før.
- Et udtrykkeligt FX-til med knappen vinder over systemets "reducer bevægelse" (brugerens valg vejer tungest).

## Åbne spørgsmål til layoutfasen (besvaret, bevaret som historik)

- Skal partikelringene være selve tavlen (emner placeret på ringene efter blik), eller en baggrund bag en mere
  klassisk kort-tavle? Første giver mest JARVIS, andet giver mest overblik. Foreslå begge som skitse.
- Hvordan vises 36 emner uden at det bliver tæt? Forslag: ringe pr. blik, kerne = optik-tabellen.
- Flere fag senere: fagvælger på forsiden.
