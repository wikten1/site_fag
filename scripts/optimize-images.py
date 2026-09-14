"""Regenerate institutional WebP images. Optional development tool: Pillow 12.x."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCES = [
    ('background_hero.png', 'institutional/hero', [640, 1200, 1672]),
    ('sobre a FAG.png', 'institutional/about', [640, 1200]),
    ('programa_mulheres_mil.png', 'programs/mulheres-mil', [640, 1200]),
    ('pronatec.png', 'programs/pronatec', [640, 1200]),
    ('Logo.png', 'brand/logo', [480]),
]

if __name__ == '__main__':
    for source, name, widths in SOURCES:
        original = ROOT / 'references/images' / source
        with Image.open(original) as image:
            for width in widths:
                width = min(width, image.width)
                resized = image.copy()
                resized.thumbnail((width, round(image.height * width / image.width)), Image.Resampling.LANCZOS)
                filename = name + ('' if name == 'brand/logo' else f'-{width}') + '.webp'
                target = ROOT / 'assets/images' / filename
                target.parent.mkdir(parents=True, exist_ok=True)
                resized.save(target, 'WEBP', quality=88, method=6)
                print(f'{filename}: {target.stat().st_size:,} bytes (original {original.stat().st_size:,})')
