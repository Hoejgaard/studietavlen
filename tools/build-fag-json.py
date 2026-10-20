"""Validerer emnefilerne for et fag og bygger content/<fag>/fag.json ud fra frontmatter + fag.base.json.

Brug:  python -I tools/build-fag-json.py otp

Tjekker:
- påkrævede felter i frontmatter
- slug == filnavn
- 'kort' maks 160 tegn
- 'relaterede' peger kun på eksisterende slugs
- forelæsningsnumre findes i fag.base.json
- de obligatoriske afsnit findes i brødteksten
Afslutter med fejlkode 1, hvis noget er galt (fag.json skrives alligevel, så man kan se resultatet).
"""
import json
import re
import sys
from pathlib import Path

import yaml

REQUIRED = ["title", "slug", "fag", "forelaesning", "kategori", "relevans", "kort",
            "blik", "teoretikere", "interesse", "faenomener", "nøgleord", "kilder", "relaterede"]
SECTIONS = ["## Kernen", "## Begreber til eksamen", "## Typiske eksamensspørgsmål"]
MAX_KORT = 160

fag = sys.argv[1] if len(sys.argv) > 1 else "otp"
root = Path(__file__).resolve().parent.parent / "content" / fag
emner_dir = root / "emner"
base = json.loads((root / "fag.base.json").read_text(encoding="utf-8"))
valid_nr = {f["nr"] for f in base["forelaesninger"]}

errors: list[str] = []
emner: dict[str, dict] = {}

for path in sorted(emner_dir.glob("*.md")):
    text = path.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.S)
    if not m:
        errors.append(f"{path.name}: ingen frontmatter")
        continue
    try:
        fm = yaml.safe_load(m.group(1))
    except yaml.YAMLError as e:  # noqa: PERF203
        errors.append(f"{path.name}: YAML-fejl: {e}")
        continue
    body = m.group(2)
    for key in REQUIRED:
        if key not in fm:
            errors.append(f"{path.name}: mangler felt '{key}'")
    slug = fm.get("slug")
    if slug != path.stem:
        errors.append(f"{path.name}: slug '{slug}' matcher ikke filnavn")
    kort = fm.get("kort", "")
    if len(kort) > MAX_KORT:
        errors.append(f"{path.name}: 'kort' er {len(kort)} tegn (maks {MAX_KORT})")
    for nr in fm.get("forelaesning", []):
        if nr not in valid_nr:
            errors.append(f"{path.name}: forelæsning {nr} findes ikke i fag.base.json")
    for sec in SECTIONS:
        if sec not in body:
            errors.append(f"{path.name}: mangler afsnit '{sec}'")
    emner[slug] = fm

for slug, fm in emner.items():
    for rel in fm.get("relaterede", []):
        if rel not in emner:
            errors.append(f"{slug}.md: relateret '{rel}' findes ikke")

# Byg fag.json. Rækkefølgen af blikke og kategorier følger fagets kronologi (= tavlens rækkefølge).
BLIK_ORDER = ["Grundlag og metode", "Scientific Management", "Det legitimt rationelle (bureaukrati)",
              "Human Relations", "Contingency-teori", "Konfigurationsteori", "Institutionel teori",
              "Kulturblik", "Forandringsblik", "Meningsblik", "Magtblik", "Cases"]
KAT_ORDER = ["Grundlag og metode", "Klassisk organisationsteori", "Human Relations og motivation",
             "Struktur og omverden", "Organisationskultur", "Organisatoriske forandringer", "Mening og magt", "Cases"]
seen_b = {fm["blik"] for fm in emner.values()}
seen_k = {fm["kategori"] for fm in emner.values()}
blikke = [b for b in BLIK_ORDER if b in seen_b] + sorted(seen_b - set(BLIK_ORDER))
kategorier = [k for k in KAT_ORDER if k in seen_k] + sorted(seen_k - set(KAT_ORDER))
for b in seen_b - set(BLIK_ORDER):
    errors.append(f"blik '{b}' er ikke i BLIK_ORDER (tilføj den, eller kør tools/set-blik.py)")

forelaesninger = []
for f in base["forelaesninger"]:
    f = dict(f)
    f["emner"] = [s for s, fm in emner.items() if f["nr"] in fm.get("forelaesning", [])]
    forelaesninger.append(f)

out = {
    "kort": base["kort"],
    "navn": base["navn"],
    "beskrivelse": base["beskrivelse"],
    "underviser": base.get("underviser"),
    "eksamen": base.get("eksamen"),
    "kategorier": kategorier,
    "blikke": blikke,
    "forelaesninger": forelaesninger,
    "emner": [
        {
            "slug": s,
            "blik_detalje": fm.get("blik_detalje"),
            "title": fm["title"],
            "kategori": fm["kategori"],
            "blik": fm["blik"],
            "relevans": fm["relevans"],
            "forelaesning": fm["forelaesning"],
            "kort": fm["kort"],
            "teoretikere": fm["teoretikere"],
            "interesse": fm["interesse"],
            "faenomener": fm["faenomener"],
            "relaterede": fm["relaterede"],
        }
        for s, fm in emner.items()
    ],
    "antal_emner": len(emner),
    "noter": base.get("noter"),
}
(root / "fag.json").write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")

print(f"{len(emner)} emner, {len(kategorier)} kategorier, {len(blikke)} blikke -> {root / 'fag.json'}")
if errors:
    print(f"\n{len(errors)} fejl:")
    for e in errors:
        print("  -", e)
    sys.exit(1)
print("Ingen fejl.")
