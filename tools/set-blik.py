"""Sætter det kanoniske 'blik' på hver emnefil ud fra BLIK-tabellen og gemmer den gamle, mere præcise
værdi i 'blik_detalje'. Kør igen, hvis nye emner kommer til: tilføj slug til tabellen.

Brug:  python -I tools/set-blik.py otp
"""
import re
import sys
from pathlib import Path

BLIK = {
    "Grundlag og metode": ["teori-som-blik", "toulmin-argumentation", "formel-uformel-organisation",
                           "kronologi-lukkede-aabne-systemer", "problemformulering-synopsis"],
    "Scientific Management": ["scientific-management-taylor"],
    "Det legitimt rationelle (bureaukrati)": ["bureaukrati-weber"],
    "Human Relations": ["hawthorne-studierne", "herzberg-tofaktorteori", "maslow-behovshierarki", "hrm"],
    "Contingency-teori": ["contingency-teori", "woodward-teknologi", "burns-stalker", "lawrence-lorsch",
                          "contingency-vs-institutionel"],
    "Konfigurationsteori": ["mintzberg-dele-koordinering", "mintzberg-konfigurationer"],
    "Institutionel teori": ["institutionel-teori", "isomorfi"],
    "Kulturblik": ["kulturbegrebet", "schein-kulturniveauer", "martin-tre-perspektiver",
                   "kunda-normativ-kontrol", "hatch-schultz-symbolisme"],
    "Forandringsblik": ["planlagte-emergerende-forandringer", "kotter-otte-trin", "leavitt-model",
                        "feldman-rutiner", "digital-transformation-tre-praksisser"],
    "Meningsblik": ["weick-meningsskabelse", "mann-gulch"],
    "Magtblik": ["magtens-fire-ansigter", "selvledelse-magtteknologier", "ledelse-vs-lederskab"],
    "Cases": ["case-danske-bank", "case-eksempler"],
}

fag = sys.argv[1] if len(sys.argv) > 1 else "otp"
emner_dir = Path(__file__).resolve().parent.parent / "content" / fag / "emner"
slug_to_blik = {s: b for b, slugs in BLIK.items() for s in slugs}

missing = []
for path in sorted(emner_dir.glob("*.md")):
    slug = path.stem
    if slug not in slug_to_blik:
        missing.append(slug)
        continue
    text = path.read_text(encoding="utf-8")
    m = re.search(r'^blik: "(.*)"\n(blik_detalje: ".*"\n)?', text, re.M)
    if not m:
        print(f"ADVARSEL {slug}: ingen blik-linje")
        continue
    old = m.group(1)
    detalje = old if not m.group(2) else re.search(r'blik_detalje: "(.*)"', m.group(2)).group(1)
    new = f'blik: "{slug_to_blik[slug]}"\nblik_detalje: "{detalje}"\n'
    text = text[: m.start()] + new + text[m.end():]
    path.write_text(text, encoding="utf-8", newline="\n")
    print(f"{slug:<40} -> {slug_to_blik[slug]}")

if missing:
    print("\nIKKE i tabellen (tilføj dem):", ", ".join(missing))
    sys.exit(1)
