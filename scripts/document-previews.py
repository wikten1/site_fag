"""Rasterize official PDF cover pages for the transparency hero."""
from pathlib import Path
import pymupdf

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'assets/images/documents'
OUTPUT.mkdir(parents=True, exist_ok=True)
for source, target in [
    ('edital-05-2026-mulheres-inspirando-mulheres.pdf', 'edital.png'),
    ('portaria-01-2024.pdf', 'portaria.png'),
    ('prorrogacao-edital-05-2026.pdf', 'publicacao.png'),
]:
    with pymupdf.open(ROOT / 'assets/documents' / source) as document:
        page = document[0]
        page.get_pixmap(matrix=pymupdf.Matrix(560 / page.rect.width, 560 / page.rect.width), alpha=False).save(OUTPUT / target)
