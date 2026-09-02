from pathlib import Path

# Etapas 6–10 da integração DATA -> ARCO.
# Escopo deliberado: shell/rail e tracking da mãe. data.html/data.css/data.js não são tocados.

arco = Path("arco.html")
text = arco.read_text(encoding="utf-8")

old_fonts = '<link rel="stylesheet" href="assets/arco/css/fonts.css">'
new_fonts = '<link rel="stylesheet" href="assets/arco/css/fonts.css?v=20260901-data-sec">'
assert text.count(old_fonts) == 1, "fonts.css baseline changed"
text = text.replace(old_fonts, new_fonts, 1)

old_script = '<script src="assets/arco/js/arco.js?v=20260901-data" defer></script>'
new_script = '<script src="assets/arco/js/arco.js?v=20260901-data-sec" defer></script>'
assert text.count(old_script) == 1, "arco.js cache-buster baseline changed"
text = text.replace(old_script, new_script, 1)

old_data = '        <button class="rail__link rail__link--data" type="button" data-view="data">DATA</button>'
new_data = '''        <button class="rail__link rail__link--data" type="button" data-view="data">DATA</button>
        <div class="rail__sec" data-sec="data" data-on="false">
          <div>
            <button class="rail__seclink" type="button" data-child="data" data-target="rastro">RASTRO</button>
            <button class="rail__seclink" type="button" data-child="data" data-target="lastro">LASTRO</button>
          </div>
        </div>'''
assert text.count(old_data) == 1, "DATA rail baseline changed"
assert 'data-sec="data"' not in text, "DATA rail section already exists"
text = text.replace(old_data, new_data, 1)
arco.write_text(text, encoding="utf-8")

js = Path("assets/arco/js/arco.js")
text = js.read_text(encoding="utf-8")

old_sec_toggle = '''    document.querySelectorAll('.rail__sec[data-sec="echo"], .rail__sec[data-sec="atrio"]')
      .forEach(s => s.dataset.on = String(s.dataset.sec === view));'''
new_sec_toggle = '''    document.querySelectorAll('.rail__sec[data-sec]')
      .forEach(s => s.dataset.on = String(s.dataset.sec === view));'''
assert text.count(old_sec_toggle) == 1, "rail section toggle baseline changed"
text = text.replace(old_sec_toggle, new_sec_toggle, 1)

old_guard = '    if (view !== "echo" && view !== "atrio") return;'
new_guard = '    if (!childLinks.some(link => link.dataset.child === view)) return;'
assert text.count(old_guard) == 1, "child tracking guard baseline changed"
text = text.replace(old_guard, new_guard, 1)

old_load = '''  document.querySelectorAll('.view[data-view="echo"] iframe, .view[data-view="atrio"] iframe')
    .forEach(frame => frame.addEventListener("load", () => bindChildTracking(frame)));'''
new_load = '''  document.querySelectorAll('.view iframe.child__frame')
    .forEach(frame => frame.addEventListener("load", () => bindChildTracking(frame)));'''
assert text.count(old_load) == 1, "child load tracking baseline changed"
text = text.replace(old_load, new_load, 1)

assert 'DATA_SECTION' not in text, "DATA must not introduce postMessage protocol"
assert 'const childKey = view => `arco:child:${view}`;' in text, "generic child persistence missing"
js.write_text(text, encoding="utf-8")

fonts = Path("assets/arco/css/fonts.css")
text = fonts.read_text(encoding="utf-8")

old_small = '''.rail__sec[data-sec="echo"] .rail__seclink[data-target="acervo"],
.rail__modlink{
  font-size:.64rem!important;
  text-transform:uppercase!important;
}'''
new_small = '''.rail__sec[data-sec="echo"] .rail__seclink[data-target="acervo"],
.rail__sec[data-sec="data"] .rail__seclink,
.rail__modlink{
  font-size:.64rem!important;
  text-transform:uppercase!important;
}'''
assert text.count(old_small) == 1, "rail compact typography baseline changed"
text = text.replace(old_small, new_small, 1)

text += '''

/* DATA — território azul apenas no rail e na subseção corrente. */
.rail .rail__link.rail__link--data[aria-current="true"],
.rail .rail__link.rail__link--data[aria-current="true"] .n,
.rail .rail__link.rail__link--data:hover,
.rail .rail__link.rail__link--data.is-data-hover{
  color:#2E71FF!important;
}
.rail .rail__link.rail__link--data[aria-current="true"]::after,
.rail .rail__link.rail__link--data:hover::after,
.rail .rail__link.rail__link--data.is-data-hover::after{
  background:#2E71FF!important;
}
.rail__sec[data-sec="data"] .rail__seclink[aria-current="location"]{
  color:#2E71FF!important;
}
'''
fonts.write_text(text, encoding="utf-8")

# Contratos finais deste gate.
assert 'data-child="data" data-target="rastro"' in arco.read_text(encoding="utf-8")
assert 'data-child="data" data-target="lastro"' in arco.read_text(encoding="utf-8")
assert ".rail__sec[data-sec]" in js.read_text(encoding="utf-8")
assert "DATA_SECTION" not in js.read_text(encoding="utf-8")
