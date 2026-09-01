from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ATRIO = ROOT / 'atrio.html'
WORKFLOW = ROOT / '.github/workflows/finalize-atrio-privacy.yml'
SELF = Path(__file__).resolve()

text = ATRIO.read_text(encoding='utf-8')

replacements = {
    '<p class="metric-card__source"><span>Leitura</span> Assessor que utilizou, operou e refinou o sistema desde a criação, comparado aos demais assessores no mesmo recorte.</p>':
    '<p class="metric-card__source"><span>Leitura</span> Indicador individual do autor no recorte, publicado sem benchmark de produtividade de terceiros.</p>',

    'data-source="assets/data/lastro/jurimetria_derivada.csv › aba Serie" data-numerator="60,39% em abr/2026" data-denominator="44,21% em dez/2025 | seis servidores nas duas pontas, nenhum em recuo" data-period="Meses de cobertura integral | robustez: 60,11% sem entrantes"':
    'data-source="assets/data/lastro/jurimetria_derivada.csv" data-numerator="60,39% em abr/2026" data-denominator="44,21% em dez/2025" data-period="Meses de cobertura integral | série agregada da unidade"',

    '<p class="metric-card__source"><span>Lastro</span> Seis servidores com série nas duas pontas: todos avançaram, nenhum recuou. O teste de robustez descarta a entrada de pessoal novo, que responde por 0,28 p.p., e o ganho concentrado em uma pessoa.</p>':
    '<p class="metric-card__source"><span>Lastro</span> Série agregada da unidade nos meses de cobertura integral. A evolução observada é associação temporal e não demonstra causalidade.</p>',
}

for old, new in replacements.items():
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'Expected exactly one ATRIO occurrence, found {count}: {old[:90]}')
    text = text.replace(old, new, 1)

banned = [
    'assets/data/jurimetria.xlsx',
    'comparado aos demais assessores',
    '49,6%', '49,63%', '746 votos', '1.503 despachos',
    'seis servidores nas duas pontas', 'Seis servidores com série nas duas pontas',
    'nenhum em recuo', 'nenhum recuou', '60,11% sem entrantes',
    '0,28 p.p.', 'ganho concentrado em uma pessoa',
    'jurimetria_derivada.csv › aba Serie',
]
for token in banned:
    if token in text:
        raise RuntimeError(f'ATRIO residual forbidden token: {token}')

required = [
    '59,3%', '153 votos em 258 despachos',
    'publicado sem benchmark de produtividade de terceiros',
    '+16,18 p.p.', '44,21% em dez/2025 a 60,39% em abr/2026',
    'Série agregada da unidade nos meses de cobertura integral.',
    'associação temporal e não demonstra causalidade',
    'assets/data/lastro/jurimetria_derivada.csv',
]
for token in required:
    if token not in text:
        raise RuntimeError(f'ATRIO expected token missing: {token}')

ATRIO.write_text(text, encoding='utf-8')

for path in (SELF, WORKFLOW):
    if path.exists():
        path.unlink()

print('ATRIO privacy cleanup passed')
