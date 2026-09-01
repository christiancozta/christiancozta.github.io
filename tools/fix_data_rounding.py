from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGETS = [
    ROOT / 'data.html',
    ROOT / 'assets/data/lastro/README.md',
    ROOT / 'assets/data/lastro/jurimetria_derivada.csv',
]
SELF = Path(__file__).resolve()
WORKFLOW = ROOT / '.github/workflows/fix-data-rounding.yml'

for path in TARGETS:
    text = path.read_text(encoding='utf-8')
    before = text
    text = text.replace('47,41%', '47,42%').replace('47.41', '47.42')
    if text == before:
        raise RuntimeError(f'Expected rounding value not found in {path.relative_to(ROOT)}')
    path.write_text(text, encoding='utf-8')

# Exact arithmetic: 899 / 1896 * 100 = 47.4156118..., rounded to 2 decimals = 47.42.
data = (ROOT / 'data.html').read_text(encoding='utf-8')
readme = (ROOT / 'assets/data/lastro/README.md').read_text(encoding='utf-8')
csv = (ROOT / 'assets/data/lastro/jurimetria_derivada.csv').read_text(encoding='utf-8')
for name, text in [('data.html', data), ('README.md', readme), ('jurimetria_derivada.csv', csv)]:
    if '47,41%' in text or '47.41' in text:
        raise RuntimeError(f'Stale 47.41 remains in {name}')
if '47,42%' not in data or '47,42%' not in readme or ',47.42,%' not in csv:
    raise RuntimeError('Correct 47.42 representation missing')

for path in (SELF, WORKFLOW):
    if path.exists():
        path.unlink()

print('DATA adversarial denominator rounding corrected to 47.42%')
