from pathlib import Path

PATH = Path('assets/arco/js/arco-core.js')
text = PATH.read_text(encoding='utf-8')
original = text


def remove_source_section(source: str, name: str, next_name: str) -> str:
    start_marker = (
        '/* ========================================================================== */\n'
        f'/* Fonte original: {name} */\n'
        '/* ========================================================================== */\n'
    )
    next_marker = (
        '/* ========================================================================== */\n'
        f'/* Fonte original: {next_name} */\n'
        '/* ========================================================================== */\n'
    )
    start = source.find(start_marker)
    end = source.find(next_marker, start + len(start_marker))
    assert start >= 0, f'missing start section: {name}'
    assert end > start, f'missing next section after: {name}'
    return source[:start] + source[end:]


# Legacy diagonal narrative lives inside inline-script-1 rather than its own
# extracted source section. Remove only its inner IIFE; preserve the outer
# inline-script-1 closure byte-for-byte.
diag_start_marker = '  /* ---- Narrativa: régua diagonal + cascata, ancoradas ao pilar do bloco 02 ---- */\n'
diag_tail = (
    "    evs.forEach(ev => addEventListener(ev, fire, {passive:true}));\n"
    "  })();\n"
)
diag_start = text.find(diag_start_marker)
diag_end = text.find(diag_tail, diag_start)
assert diag_start >= 0, 'missing legacy diagonal narrative'
assert diag_end > diag_start, 'missing end of legacy diagonal narrative'
diag_end += len(diag_tail)
text = text[:diag_start] + text[diag_end:]

# Superseded mobile animator. The viewport controller loaded by arco.js owns
# .mobile-arrow-axis today and creates the same node when it does not exist.
text = remove_source_section(text, 'mobile-arrow-integrated-js', 'hero-5to1-b2b-js')

# Superseded 5→1 cross prototype. hero-v2 is the visible geometry generation.
text = remove_source_section(text, 'hero-5to1-b2b-js', 'hero-5to1-b2b-v2-js')

for forbidden in (
    'Narrativa: régua diagonal + cascata',
    'Fonte original: mobile-arrow-integrated-js',
    'Fonte original: hero-5to1-b2b-js',
    "className = 'hero-cross-axis'",
    "className = 'hero-cross-link'",
):
    assert forbidden not in text, f'legacy residue remains: {forbidden}'

for required in (
    'Fonte original: hero-5to1-b2b-v2-js',
    "className = 'hero-v2-seg'",
    "className = 'hero-v2-link'",
    'Fonte original: hero-rail-b2b-v3-js',
):
    assert required in text, f'current runtime damaged: {required}'

assert text != original, 'transform produced no change'
PATH.write_text(text, encoding='utf-8')
print(f'arco-core.js: {len(original)} -> {len(text)} bytes ({len(original)-len(text)} removed)')
