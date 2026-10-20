# Prompt-guide til Claude Code

Kopiér prompten til det skridt du står ved. Tilpas i firkantede klammer.

## Skridt 1 – Når materialet er uploadet: få overblik først

```
Læs alt i raw/otp/ (noter, slides, pensum, opgaver). Lav IKKE emnefiler endnu.
Giv mig i stedet:
1. En liste over de forelæsninger du kan identificere (nummer, emne, hvilke filer hører til).
2. En foreløbig emneliste grupperet i 4-7 kategorier, med forslag til relevans 1-5.
3. Huller: forelæsninger uden noter, emner der kun nævnes i slides, filer du ikke kunne læse.
Skriv overblikket til content/otp/OVERBLIK.md så vi kan rette i det sammen.
```

## Skridt 2 – Godkend emnelisten, så lav indholdet

```
Emnelisten i content/otp/OVERBLIK.md er godkendt [med disse rettelser: ...].
Lav nu ét emnedokument pr. emne i content/otp/emner/ efter formatet i CLAUDE.md,
og lav content/otp/fag.json med fagbeskrivelse, forelæsningsliste og emneliste.
Tag de [5] vigtigste emner først, så jeg kan tjekke kvaliteten før du laver resten.
```

## Skridt 3 – Kvalitetstjek

```
Gennemgå alle emner i content/otp/emner/. For hvert emne: tjek at alle påstande kan
spores til en fil i raw/otp/, at 'kort' er under 160 tegn og fungerer som hover-tekst,
og at 'relaterede' peger på emner der faktisk findes. Ret det du finder, og lav en
liste over de steder hvor noterne er tynde, så vi kan skrive mere.
```

## Skridt 4 – Byg hjemmesiden (layout tager vi her)

```
Byg hjemmesiden i site/ med Astro. Den skal læse content/ direkte via content collections.
Forside: en tavle med ét kort pr. emne grupperet efter kategori. Hover viser 'kort',
klik åbner emnesiden. Filtre for forelæsning, kategori og relevans. Søgefelt.
Mobilvenlig, dark mode, dansk. Ingen backend, skal kunne deployes til GitHub Pages.
Start med at vise mig et skitseforslag til layout før du koder.
```

## Skridt 5 – Nyt fag

```
Vi tilføjer faget [NAVN] med kortnavn [xxx]. Opret raw/[xxx]/ med samme undermapper som
otp, og gør hjemmesiden klar til flere fag (fagvælger på forsiden). Indholdet kommer senere.
```

## Gode vaner

- Bed altid om overblik før produktion (skridt 1 før 2). Det sparer omskrivninger.
- Bed om et lille udsnit først ("de 5 vigtigste"), tjek, og bed så om resten.
- Når noget er forkert i indholdet: ret kildenoten i raw/ og bed Claude generere emnet igen.
  Så bliver rettelsen ikke overskrevet næste gang.
- Brug `/lecture-notes-synthesizer` på rå forelæsningsnoter FØR du lægger dem i raw/,
  hvis de er meget rodede. Det giver bedre emnefiler.
