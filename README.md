# Studietavlen

Fælles opslagsværk for noter og pensum på HD-studiet. Vi starter med **OTP
(Organisation i teori og praksis)** og udvider til flere fag senere.

## Sådan uploader du materiale

Læg dine filer i den rigtige undermappe under `raw/otp/`:

| Mappe              | Hvad skal ligge her                                   | Formater                 |
|--------------------|-------------------------------------------------------|--------------------------|
| `raw/otp/noter/`   | Egne noter fra forelæsninger og læsning               | .md, .docx, .pdf, .txt   |
| `raw/otp/slides/`  | Underviserens slides                                  | .pdf, .pptx              |
| `raw/otp/pensum/`  | Pensumliste, bogkapitler, artikler                    | .pdf, .docx, .md         |
| `raw/otp/opgaver/` | Cases, afleveringer, øvelsesopgaver                   | alt                      |
| `raw/otp/andet/`   | Alt andet (fx eksamensbeskrivelse, mails fra underviser) | alt                   |

Tips der gør det nemmere for Claude at strukturere:

- **Navngiv efter forelæsning**: `F01_introduktion.pdf`, `F03_struktur_mintzberg.md`.
  Så kan emnerne kobles til den rigtige forelæsning uden gætteri.
- **Flere personers noter til samme forelæsning er fint.** Læg dem alle ind, gerne med
  initialer: `F03_struktur_AB.docx`, `F03_struktur_MK.md`. Claude fletter dem.
- **Pensumlisten er guld.** Ligger den i `raw/otp/pensum/`, kan Claude vægte emner efter
  hvad der faktisk er pensum.
- **Rør ikke `content/`.** Det er Claudes output og bliver overskrevet.

## Se hjemmesiden

Sitet ligger på GitHub Pages: **https://hoejgaard.github.io/studietavlen/**

Det bygges automatisk af GitHub Actions, hver gang der pushes til `main` (se `.github/workflows/deploy.yml`).
Kun `content/`, `site/`, `tools/` og dokumentation ligger i repoet; `raw/` deles via OneDrive og kommer aldrig på GitHub.

## Se hjemmesiden lokalt

Kræver Node.js (installeret 20. oktober 2026). Åbn PowerShell i projektmappen:

```powershell
cd site
npm install
npm run dev
```

Åbn derefter http://127.0.0.1:4321/studietavlen/ i browseren (samme sti som på nettet). Ringe er forsiden, Tavle er listevisningen, Optik er
undervisers oversigtstabel, Begreber er alle eksamensbegreber samlet. Ctrl K springer til et emne.

## Hvad sker der bagefter

1. Claude læser alt i `raw/otp/` og laver ét markdown-dokument pr. emne i
   `content/otp/emner/` plus en `fag.json` med overblik.
2. Du og dine studiekammerater læser igennem og retter. Rettelser skal ske i `raw/` (ret
   kildenoten), ikke i `content/`.
3. Når indholdet sidder, bygger vi hjemmesiden i `site/`.

Se [PROMPTS.md](PROMPTS.md) for de prompts du skal bruge til hvert skridt.
Se [CLAUDE.md](CLAUDE.md) for de regler Claude Code arbejder efter.
