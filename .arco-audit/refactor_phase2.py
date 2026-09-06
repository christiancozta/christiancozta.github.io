from pathlib import Path

path = Path('assets/arco/js/arco-core.js')
text = path.read_text(encoding='utf-8')

if 'Estado único do desktop' not in text:
    raise SystemExit('phase 1 desktop controller is not present')

# 1) Régua diagonal histórica: bloco interno ao primeiro runtime.
diag_prefix = '  /* ---- Narrativa: régua diagonal'
diag_start = text.find(diag_prefix)
if diag_start < 0:
    raise SystemExit('legacy diagonal narrative block not found')
outer_close = '\n})();\n\n/* ========================================================================== */\n/* Fonte original: inline-script-2 */'
diag_end = text.find(outer_close, diag_start)
if diag_end < 0:
    raise SystemExit('legacy diagonal narrative end boundary not found')
text = text[:diag_start] + text[diag_end:]

# 2) Mobile integrado antigo: substituído por arco-mobile-viewport.js.
mobile_marker = '/* Fonte original: mobile-arrow-integrated-js */'
cross_marker = '/* Fonte original: hero-5to1-b2b-js */'
mobile_start = text.find(mobile_marker)
cross_start = text.find(cross_marker, mobile_start)
if mobile_start < 0 or cross_start < 0:
    raise SystemExit('legacy integrated mobile section boundary not found')
text = text[:mobile_start] + text[cross_start:]

# 3) hero-cross: geometria/listeners substituídos pelo hero-v2 consolidado.
v2_marker = '/* Fonte original: hero-5to1-b2b-v2-js */'
cross_start = text.find(cross_marker)
v2_start = text.find(v2_marker, cross_start)
if cross_start < 0 or v2_start < 0:
    raise SystemExit('hero-cross section boundary not found')
text = text[:cross_start] + text[v2_start:]

# 4) Sem o listener hero-cross, o clique pode pertencer diretamente à estação.
old_stat_handlers = """  stats.forEach(stat => {
    stat.addEventListener('pointerenter', () => openStat(stat));
    stat.addEventListener('focusin', () => openStat(stat));
  });

"""
new_stat_handlers = """  stats.forEach(stat => {
    stat.addEventListener('pointerenter', () => openStat(stat));
    stat.addEventListener('focusin', () => openStat(stat));
    const button = stat.querySelector('button.narr__n');
    button?.addEventListener('click', event => {
      if (mq.matches) return;
      event.preventDefault();
      if (!detailsReady) return;
      openStat(stat);
    });
  });

"""
if text.count(old_stat_handlers) != 1:
    raise SystemExit('consolidated stat handler block not found exactly once')
text = text.replace(old_stat_handlers, new_stat_handlers, 1)

capture_start = text.find('  /* O único clique desktop é monotônico:')
capture_end_marker = "\n\n  lockLegends();"
if capture_start < 0:
    raise SystemExit('temporary capture-click block not found')
capture_end = text.find(capture_end_marker, capture_start)
if capture_end < 0:
    raise SystemExit('temporary capture-click end boundary not found')
text = text[:capture_start] + '  /* Clique desktop agora pertence diretamente a cada estação. */' + text[capture_end:]

path.write_text(text, encoding='utf-8')
print('phase 2 staged')
