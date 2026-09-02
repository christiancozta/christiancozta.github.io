from pathlib import Path

p = Path('data.html')
text = p.read_text(encoding='utf-8')

replacements = {
    '<a href="echo.html" style="color:#5B8DFF" style-hover="color:#FCFCFC">ECHO</a>':
    '<a href="arco.html#echo" target="_top" style="color:#5B8DFF" style-hover="color:#FCFCFC">ECHO</a>',
    '<a href="atrio.html" style="color:#5B8DFF" style-hover="color:#FCFCFC">ATRIO</a>':
    '<a href="arco.html#atrio" target="_top" style="color:#5B8DFF" style-hover="color:#FCFCFC">ATRIO</a>',
    '<a href="arco.html" style="color:#5B8DFF" style-hover="color:#FCFCFC">VOLTAR AO ARCO</a>':
    '<a href="arco.html" target="_top" style="color:#5B8DFF" style-hover="color:#FCFCFC">VOLTAR AO ARCO</a>',
}

for old, new in replacements.items():
    assert text.count(old) == 1, f'Footer baseline changed: {old}'
    text = text.replace(old, new, 1)

# Segurança: nenhum link de navegação entre filhas pode permanecer capturado no iframe.
assert '<a href="echo.html" style=' not in text
assert '<a href="atrio.html" style=' not in text
assert 'href="arco.html#echo" target="_top"' in text
assert 'href="arco.html#atrio" target="_top"' in text
assert '>VOLTAR AO ARCO</a>' in text and 'href="arco.html" target="_top"' in text

p.write_text(text, encoding='utf-8')
