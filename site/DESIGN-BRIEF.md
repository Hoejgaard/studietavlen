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

## Åbne spørgsmål til layoutfasen

- Skal partikelringene være selve tavlen (emner placeret på ringene efter blik), eller en baggrund bag en mere
  klassisk kort-tavle? Første giver mest JARVIS, andet giver mest overblik. Foreslå begge som skitse.
- Hvordan vises 36 emner uden at det bliver tæt? Forslag: ringe pr. blik, kerne = optik-tabellen.
- Flere fag senere: fagvælger på forsiden.
