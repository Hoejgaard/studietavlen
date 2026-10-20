---
name: notestrukturering
description: Strukturerer råmateriale fra raw/<fag>/ til emnefiler i content/<fag>/emner/. Brug ved "strukturér noterne", "lav emnefiler", "opdatér indholdet for <fag>" eller når nye filer er lagt i raw/.
---

# Notestrukturering

Omsætter råmateriale til emnefiler efter formatet i CLAUDE.md. Kør altid i to trin.

## Trin 1: Overblik (ingen emnefiler endnu)

1. List alle filer i `raw/<fag>/` med Glob. Notér filer du ikke kan læse (fx scannede PDF'er uden tekst).
2. Identificér forelæsninger ud fra filnavne (`F01_`, `F02_` ...) og indhold.
3. Udled en emneliste. Gruppér i 4-7 kategorier. Foreslå relevans 1-5 pr. emne ud fra
   hvor meget plads emnet fylder i slides, pensum og noter tilsammen.
4. Skriv `content/<fag>/OVERBLIK.md` med: forelæsningsliste, emneliste pr. kategori,
   huller (forelæsninger uden noter, emner kun nævnt i slides, ulæselige filer).
5. Stop og vis overblikket. Vent på godkendelse før trin 2.

## Trin 2: Emnefiler

1. Følg den godkendte emneliste i `OVERBLIK.md`.
2. For hvert emne: saml alt relevant fra raw/, flet, og skriv `content/<fag>/emner/<slug>.md`
   efter frontmatter-formatet i CLAUDE.md. Angiv kilder.
3. Skriv `content/<fag>/fag.json`:
   ```json
   {
     "kort": "otp",
     "navn": "Organisation i teori og praksis",
     "beskrivelse": "...",
     "forelaesninger": [{ "nr": 1, "titel": "...", "dato": null, "emner": ["slug", "..."] }],
     "kategorier": ["Struktur", "Kultur", "..."],
     "emner": ["slug", "..."]
   }
   ```
4. Hvis brugeren bad om "de X vigtigste først": lav kun dem, rapportér, og vent.
5. Afslut med rapport: antal emner, ulæselige filer, tyndeste områder.

## Regler

- Skriv aldrig til `raw/`.
- Hver påstand har en kilde. Ingen opfundet teori.
- `kort` er maks 160 tegn og skal fungere som hover-tekst.
- `relaterede` må kun pege på slugs der findes i emnelisten.
- Kort, klart dansk. Fagtermer og navne bevares præcist.
