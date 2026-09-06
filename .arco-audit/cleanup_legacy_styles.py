from pathlib import Path

CSS = Path('assets/arco/css/arco.css')
JS = Path('assets/arco/js/arco.js')

css = CSS.read_text(encoding='utf-8')
js = JS.read_text(encoding='utf-8')

start_marker = '/* Fonte original: hero-5to1-b2b */'
v2_marker = '/* Fonte original: hero-5to1-b2b-v2 */'
start = css.find(start_marker)
end = css.find(v2_marker, start)
if start < 0 or end < 0:
    raise SystemExit('legacy style boundaries not found')

legacy_contract = '''/* HERO desktop — contrato de apresentação que permanece ativo no v2. */
/* O runtime hero-cross foi removido; só as propriedades que ainda participavam
   da cascata visual/interativa são mantidas diretamente sob hero-v2-ready. */
@media (min-width:821px){
  .narr-zone{ min-height:max(calc(100dvh - 1.2rem), 36rem); }
  .narr__svg{ display:none !important; }
  .narr{ pointer-events:none; }
  .narr__stats{
    position:absolute; inset:0; display:block; z-index:1;
  }
  .home.hero-v2-ready .narr__stat{
    pointer-events:none;
  }
  .home.hero-v2-ready .narr__n{
    grid-column:1; grid-row:1; align-self:baseline;
  }
  .home.hero-v2-ready button.narr__n{
    appearance:none; -webkit-appearance:none;
    border:0; background:none; color:inherit;
    margin:0; padding:0;
    font:inherit; font-family:var(--f-display); font-weight:600;
    font-size:clamp(.85rem,1.35vw,1.18rem); line-height:1;
    letter-spacing:-.03em; font-variant-numeric:tabular-nums;
    cursor:pointer; text-align:left; pointer-events:auto;
  }
  .home.hero-v2-ready button.narr__n:focus-visible{
    outline:1px solid currentColor; outline-offset:3px;
  }
  .home.hero-v2-ready .narr__short{
    grid-column:2; grid-row:1;
    min-width:0; align-self:baseline;
    text-transform:uppercase; letter-spacing:.045em;
  }
  .home.hero-v2-ready .narr__detail{
    grid-column:2; grid-row:2;
    min-width:0; max-width:none;
    padding-right:0;
    white-space:normal; overflow-wrap:normal;
  }
  .home.hero-v2-ready .narr__detail[hidden]{ display:none; }
  .home.hero-v2-ready .narr__stat.is-open .narr__detail{
    animation:narr-detail-in 300ms var(--ease) both;
  }
  @keyframes narr-detail-in{
    from{ opacity:0; transform:translateY(3px); }
    to{ opacity:1; transform:none; }
  }
}

@media (max-width:820px){
  /* Mobile mantém a topologia validada; a copy específica continua sendo
     selecionada mais adiante por mobile-copy-v4. */
  .narr__short{ display:none !important; }
  .narr__detail,
  .narr__detail[hidden]{
    display:block !important;
    grid-column:2 !important; grid-row:1 !important;
    min-width:0;
    white-space:normal; overflow-wrap:anywhere;
  }
  button.narr__n{
    appearance:none; -webkit-appearance:none;
    border:0; background:none; color:inherit;
    margin:0;
    font:inherit; font-family:var(--f-display); font-weight:600;
    font-size:clamp(.85rem,1.35vw,1.18rem); line-height:1;
    letter-spacing:-.03em; font-variant-numeric:tabular-nums;
    text-align:left;
  }
}

@media (prefers-reduced-motion:reduce){
  .home.hero-v2-ready .narr__detail{ animation:none !important; }
}

'''
css = css[:start] + legacy_contract + css[end:]

# hero-cross auxiliary nodes no longer exist after the validated runtime cut.
css = css.replace('''  .home.hero-v2-ready .hero-cross-axis,\n  .home.hero-v2-ready .hero-cross-link{ display:none !important; }\n\n''', '', 1)

compat = '''    /* Temporary compatibility contract: hero-cross runtime is gone, but these\n       classes still select baseline-active CSS until the style cleanup pass. */\n    home.classList.add("hero-cross-ready");\n\n'''
if compat not in js:
    raise SystemExit('temporary compatibility class block not found')
js = js.replace(compat, '', 1)

# cross-sequence no longer has a consumer after selector migration.
js = js.replace('home.classList.add("narr-on", "cross-sequence");', 'home.classList.add("narr-on");')
js = js.replace('home.classList.add("narr-on", "cross-sequence", "hero-v2-play", "hero-v2-legends-released", "hero-v2-details-ready");',
                'home.classList.add("narr-on", "hero-v2-play", "hero-v2-legends-released", "hero-v2-details-ready");')

# This helper belonged to the pre-consolidation compatibility layer and has no
# call sites in the single-authority controller.
helper_start = js.find('    const clearPrematureDetailLockForMobile = () => {')
if helper_start >= 0:
    helper_end = js.find('\n\n    const releaseDetails = () => {', helper_start)
    if helper_end < 0:
        raise SystemExit('dead helper end boundary not found')
    js = js[:helper_start] + js[helper_end + 2:]

if 'hero-cross-ready' in js or 'cross-sequence' in js:
    raise SystemExit('legacy state class remains in production JS')
if 'hero-cross-axis' in css or 'hero-cross-link' in css or 'hero-cross-ready' in css or 'cross-sequence' in css:
    raise SystemExit('legacy hero-cross selector remains in production CSS')

CSS.write_text(css, encoding='utf-8')
JS.write_text(js, encoding='utf-8')
print('migrated active legacy presentation contract to hero-v2 selectors')
