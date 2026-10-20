"""Udtrækker tekst fra alle PDF'er under ROOT og gemmer én .txt pr. fil i OUTDIR.
PDF'er uden tekstlag (scannede/håndskrevne) renderes i stedet til PNG pr. side i OUTDIR/render/<navn>/,
så de kan læses visuelt.

Brug:  python -I tools/extract-pdf.py raw .cache/extract
"""
import sys
from pathlib import Path

import pymupdf

root = Path(sys.argv[1]).resolve()
outdir = Path(sys.argv[2]).resolve()
outdir.mkdir(parents=True, exist_ok=True)
MIN_CHARS_PER_PAGE = 80
RENDER_DPI = 110

for pdf in sorted(root.rglob("*.pdf")):
    rel = pdf.relative_to(root)
    stem = str(rel).replace("\\", "__").replace("/", "__")
    try:
        doc = pymupdf.open(pdf)
        pages = []
        for i, page in enumerate(doc, start=1):
            pages.append((i, page.get_text("text").strip()))
        total = sum(len(t) for _, t in pages)
        per_page = total / max(len(pages), 1)
        has_text = per_page >= MIN_CHARS_PER_PAGE
        lines = [f"### KILDE: raw\\{rel}", f"### SIDER: {len(doc)}  TEGN: {total}  TEKSTLAG: {'ja' if has_text else 'NEJ'}", ""]
        if has_text:
            for i, t in pages:
                lines.append(f"--- Side {i} ---")
                lines.append(t)
                lines.append("")
        else:
            rdir = outdir / "render" / stem
            rdir.mkdir(parents=True, exist_ok=True)
            for i, page in enumerate(doc, start=1):
                pix = page.get_pixmap(dpi=RENDER_DPI)
                pix.save(rdir / f"p{i:03d}.png")
            lines.append(f"Intet tekstlag. Sider renderet til {rdir}")
        (outdir / f"{stem}.txt").write_text("\n".join(lines), encoding="utf-8")
        print(f"{'OK  ' if has_text else 'BILD'} {str(rel):<70} sider={len(doc):>3} tegn={total:>7}")
        doc.close()
    except Exception as e:  # noqa: BLE001
        print(f"FEJL {rel}: {e}")
