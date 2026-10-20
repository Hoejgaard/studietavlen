# Studietavlen – fælles opslagsværk for HD-studiet

Hjemmeside der samler noter og pensum fra HD-studiet på CBS i ét overskueligt opslagsværk.
Første fag: **OTP (Organisation i teori og praksis)**. Flere fag kommer senere, så alt er
organiseret pr. fag (`otp/`, senere fx `erh/`, `sta/` osv.).

Sprog: Dansk i al tekst, indhold og kommunikation. Kode og filnavne på engelsk/ASCII.

## Mappestruktur

```
raw/<fag>/          INPUT  – råmateriale uploadet af de studerende. Rør ALDRIG filerne her.
  noter/            egne noter (md, docx, pdf, txt)
  slides/           forelæsningsslides (pdf, pptx)
  pensum/           pensumliste, bogkapitler, artikler
  opgaver/          cases, afleveringer, øvelser
  andet/            alt der ikke passer andre steder
content/<fag>/      OUTPUT – struktureret indhold Claude udleder af raw/
  fag.json          metadata: fagbeskrivelse, forelæsninger, emneliste, pensumreferencer
  emner/<slug>.md   ét dokument pr. emne/teori (se format nedenfor)
site/               selve hjemmesiden (bygges når indholdet er på plads)
.claude/            agenter, skills og prompts til Claude Code
```

## Arbejdsgang

1. Studerende lægger filer i `raw/<fag>/...`. Filnavne må gerne starte med `F01_`, `F02_`
   osv. for at markere forelæsningsnummer. Det er ikke et krav.
2. Claude læser råmaterialet og producerer `content/<fag>/emner/*.md` + `fag.json`.
   Råmaterialet er kilden; indholdet i `content/` er altid afledt og må gerne genereres igen.
3. Hjemmesiden i `site/` læser kun fra `content/`. Den læser aldrig fra `raw/`.

## Format for et emne (`content/<fag>/emner/<slug>.md`)

Frontmatter øverst, derefter brødtekst. Frontmatter driver "tavlen" på hjemmesiden,
brødteksten vises når man klikker ind på emnet.

```markdown
---
title: "Mintzbergs fem strukturformer"
slug: mintzberg-strukturformer
fag: otp
forelaesning: [3]
kategori: "Struktur og omverden"   # overordnet gruppering på tavlen
relevans: 5                     # 1-5, hvor vigtigt emnet vurderes til eksamen
kort: "Fem idealtyper for hvordan organisationer koordinerer arbejde."  # vises ved hover, maks ~160 tegn
# De fire felter herunder følger undervisers optik-oversigt (slides lektion 5, s. 5-6).
# De SKAL udfyldes for alle teori-emner. Se content/otp/OVERBLIK.md afsnit 3 for ordlyden.
# 'blik' er én af de 12 faste værdier i tools/set-blik.py (tavlen grupperes efter den).
# 'blik_detalje' er den præcise ordlyd fra undervisers oversigt.
blik: "Konfigurationsteori"
blik_detalje: "Konfigurationsteori (idealtyper for organisering)"
teoretikere: ["Mintzberg"]
interesse: "Structures in 5 – omverden determinerer ikke organiseringsbehov"
faenomener: "Opgaveløsning og arbejdsfordeling. Hvordan er de interne designparametre struktureret?"
nøgleord: [struktur, koordinering, konfiguration]
kilder:
  - "raw/otp/noter/F03_struktur.md"
  - "Mintzberg (1983), kap. 1-2"
relaterede: [burns-stalker, kontingensteori]
---

## Kernen
2-5 sætninger der forklarer teorien så en medstuderende forstår den uden kontekst. "På god gammeldags
dansk": ingen fagjargon uden forklaring. Det er den tekst, man læser først, når man klikker ind.

## Blikket
Hvad er en organisation, hvad er et menneske, hvad er ledelse ifølge denne teori? (Slides opsummerer
hver teori sådan. Tag ordlyden derfra.) Afslut med teoriens blinde pletter: hvad kan den ikke se?

## Uddybning
Det vigtigste fra noterne, omskrevet og struktureret. Brug underoverskrifter, lister, tabeller.

## Eksempler og anvendelse
Cases fra undervisningen, egne eksempler, hvordan det bruges i opgaver.

## Kritik og begrænsninger
Hvad teorien ikke forklarer, og hvad andre teorier siger i stedet.

## Begreber til eksamen
Punktliste med de 5-12 begreber, man skal kunne bruge aktivt for at løfte karakteren. Hvert begreb på
formen **Begreb**: én sætning på almindeligt dansk. Sitet fremhæver og søger på tværs af disse.

## Typiske eksamensspørgsmål
Hvad kan man blive spurgt om, og hvordan griber man det an.
```

Regler for indholdet:
- Skriv i et klart, kort dansk. Ingen fyld. En medstuderende skal kunne læse det på 3-5 minutter.
- Bevar fagtermer og teoretikernavne præcist. Angiv altid kilde (hvilken note eller tekst).
- Når flere noter dækker samme emne, flet dem sammen og vælg den bedste formulering.
  Markér uenigheder eller usikkerhed eksplicit ("Noterne er uenige om...").
- Opfind ikke teori der ikke står i materialet. Mangler noget, skriv det i et afsnit
  "Huller i noterne" så de studerende ved hvad de skal fylde ud.
- `relevans` sættes ud fra hvor meget plads emnet fylder i slides, pensum og noter tilsammen.

## Hjemmesiden (bygget i Astro, `site/`)

Alexanders designbrief ligger i `site/DESIGN-BRIEF.md` (JARVIS-æstetik, hurtige spring, hover/klik, begreber
fremhævet). Læs den før alt designarbejde. Stemningsreference i `site/reference/particles-swarm.html`,
den første klikbare skitse i `site/skitser/index.html`.

Struktur:
- `site/src/content.config.ts` læser `content/otp/emner/*.md` som content collection (glob loader, base uden for site/).
- `site/src/lib/data.ts`: BLIK_ORDER (skal matche `tools/set-blik.py` og `tools/build-fag-json.py`), sortering,
  gruppering, `begreberFra()` der trækker "Begreber til eksamen" ud af brødteksten.
- `site/src/lib/remark-wikilinks.mjs`: `[[slug]]` i brødtekst bliver til links med emnets titel.
- Sider: `/` (Ringe, mobil falder tilbage til Tavle), `/tavle/`, `/optik/`, `/begreber/`, `/emner/<slug>/`.
- Layout `Base.astro` har header, Ctrl K-palette, hover-HUD, tema- og FX-knap. Klientscripts i `site/src/scripts/`.
- Emnedata til palette og hover inlines som JSON i hver side (`#emner-data`), ingen fetch.

Kør (Node 24, Git og GitHub CLI er installeret, men ingen af dem er på PATH i Claude Codes shell; gh kræver
at git også er på PATH):

```powershell
$env:Path = "C:\Program Files\nodejs;C:\Program Files\Git\cmd;C:\Program Files\GitHub CLI;" + $env:Path
Set-Location site
npm run dev      # http://127.0.0.1:4321/studietavlen/  (base-stien gælder også lokalt)
npm run build    # dist/
npm run preview  # serverer dist/ på samme adresse
```

`.claude/launch.json` har `dev` og `preview` som konfigurationer til Claudes browser-pane (preview_start).

Regler:
- Nye emner kræver kun en ny .md i `content/otp/emner/` + kørsel af `tools/set-blik.py` og `tools/build-fag-json.py`.
  Sitet samler selv op. Nyt blik skal tilføjes i BLIK_ORDER tre steder (set-blik.py, build-fag-json.py, data.ts).
- Bevægelse: `scripts/ringe.ts` (sweep, koblingslinjer, entré, tilt), `scripts/swarm.ts` (three.js-partikelsværm,
  indlæses dovent af `scripts/fx.ts`) og `scripts/hud.ts` (2D-fallback uden WebGL). FX-knappen slår alt fra;
  `prefers-reduced-motion` slår alt fra, medmindre brugeren udtrykkeligt har slået FX til. Alle klientscripts
  binder på `astro:page-load` og rydder op på `astro:before-swap` (View Transitions). Se `site/DESIGN-BRIEF.md`.
- Dark mode er standard, lys tilstand via TEMA-knappen. Begge skal se ordentlige ud ved enhver ændring.
- Live på https://hoejgaard.github.io/studietavlen/ fra repoet github.com/Hoejgaard/studietavlen.
  `.github/workflows/deploy.yml` bygger `site/` med `withastro/action` og deployer ved push til `main`. `site` og `base` står i `astro.config.mjs`. Alle interne links SKAL gå gennem `url()` fra
  `site/src/lib/url.ts` (præfikser `import.meta.env.BASE_URL`); `remark-wikilinks.mjs` får `base` som option fra
  configen, fordi den kører i Node. Skriv aldrig `href="/emner/..."` direkte. Skifter repoet navn, ret kun `base`.
- `raw/` er gitignoreret (ophavsret + 184 MB) og deles via OneDrive, ikke via GitHub.

## Værktøjer til at læse råmaterialet

Kør begge før du læser `raw/`, så teksten ligger klar i `.cache/extract/` (gitignoreret, må slettes):

```powershell
.\tools\extract-office.ps1 -Root .\raw -OutDir .\.cache\extract
& "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe" -I tools\extract-pdf.py raw .cache\extract
```

Efter ændringer i `content/<fag>/emner/`: kør validering og byg `fag.json` (fejler ved for lang `kort`,
manglende felter/afsnit, døde `relaterede`-links). Nye emner skal også ind i `tools/set-blik.py`.

```powershell
& "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe" -I tools\set-blik.py otp
& "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe" -I tools\build-fag-json.py otp
```

PDF'er uden tekstlag renderes som PNG pr. side i `.cache/extract/render/<fil>/` og læses visuelt med Read.
Python 3.12 (brugerinstallation) + PyMuPDF er installeret på Alexanders maskine. Node.js er ikke installeret
endnu; det skal det være, før `site/` kan bygges med Astro.

## Hvad Claude IKKE gør

- Ændrer, flytter eller sletter filer i `raw/`.
- Skriver indhold der ikke kan spores til en kilde i `raw/`.
- Bygger `site/` før der er bedt om det. Først indhold, så layout.
