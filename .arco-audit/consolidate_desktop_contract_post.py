from pathlib import Path

PATH = Path('assets/arco/js/arco.js')
text = PATH.read_text(encoding='utf-8')
original = text

stats_anchor = '    const stats = [...zone.querySelectorAll(".narr__stat")];\n    const REQUEST_EVENTS = ["scroll","wheel","pointerdown","pointermove","keydown","touchstart"];\n'
helpers = '''    const stats = [...zone.querySelectorAll(".narr__stat")];\n\n    /* Temporary compatibility contract: hero-cross runtime is gone, but these\n       classes still select baseline-active CSS until the style cleanup pass. */\n    home.classList.add("hero-cross-ready");\n\n    const exposeMobileDetails = () => {\n      stats.forEach(stat => {\n        const button = stat.querySelector("button.narr__n");\n        const detail = stat.querySelector(".narr__detail");\n        delete stat.dataset.fixo;\n        stat.classList.remove("is-open");\n        if (detail){\n          detail.hidden = false;\n          detail.setAttribute("aria-hidden", "false");\n        }\n        button?.setAttribute("aria-expanded", "true");\n      });\n    };\n\n    const closeDesktopDetails = () => {\n      stats.forEach(stat => {\n        const button = stat.querySelector("button.narr__n");\n        const detail = stat.querySelector(".narr__detail");\n        stat.classList.remove("is-open");\n        if (detail){\n          detail.hidden = true;\n          detail.setAttribute("aria-hidden", "true");\n        }\n        button?.setAttribute("aria-expanded", "false");\n      });\n    };\n\n    const REQUEST_EVENTS = ["scroll","wheel","pointerdown","pointermove","keydown","touchstart"];\n'''
if text.count(stats_anchor) != 1:
    raise SystemExit('consolidated stats anchor not found exactly once')
text = text.replace(stats_anchor, helpers, 1)

request_old = '''      setPhase("arc-requested");\n      home.classList.add("narr-on");\n      geometry.layout();\n'''
request_new = '''      setPhase("arc-requested");\n      home.classList.add("narr-on", "cross-sequence");\n      geometry.layout();\n'''
if text.count(request_old) != 1:
    raise SystemExit('requestNarrative anchor not found')
text = text.replace(request_old, request_new, 1)

init_old = '''    lockLegends();\n    lockDetails();\n\n    if (reduce){\n      home.classList.add("narr-on", "hero-v2-play", "hero-v2-legends-released", "hero-v2-details-ready");\n'''
init_new = '''    lockLegends();\n    lockDetails();\n    if (mq.matches) exposeMobileDetails();\n\n    if (reduce){\n      home.classList.add("narr-on", "cross-sequence", "hero-v2-play", "hero-v2-legends-released", "hero-v2-details-ready");\n'''
if text.count(init_old) != 1:
    raise SystemExit('initial consolidated state anchor not found')
text = text.replace(init_old, init_new, 1)

mq_old = '''      if (event.matches){\n        disarmRequest();\n        if (legendTimer) clearTimeout(legendTimer);\n        if (detailTimer) clearTimeout(detailTimer);\n        clearLegendLock();\n        clearPrematureDetailLockForMobile();\n        return;\n      }\n      geometry.layout();\n      if (!detailsReady) lockDetails();\n'''
mq_new = '''      if (event.matches){\n        disarmRequest();\n        if (legendTimer) clearTimeout(legendTimer);\n        if (detailTimer) clearTimeout(detailTimer);\n        clearLegendLock();\n        exposeMobileDetails();\n        return;\n      }\n      closeDesktopDetails();\n      geometry.layout();\n      if (!detailsReady) lockDetails();\n'''
if text.count(mq_old) != 1:
    raise SystemExit('consolidated breakpoint anchor not found')
text = text.replace(mq_old, mq_new, 1)

reduce_mq_old = '''      if (reduce){\n        home.classList.add("narr-on", "hero-v2-play", "hero-v2-legends-released", "hero-v2-details-ready");\n'''
reduce_mq_new = '''      if (reduce){\n        home.classList.add("narr-on", "cross-sequence", "hero-v2-play", "hero-v2-legends-released", "hero-v2-details-ready");\n'''
if text.count(reduce_mq_old) != 1:
    raise SystemExit('reduced-motion breakpoint anchor not found')
text = text.replace(reduce_mq_old, reduce_mq_new, 1)

if text == original:
    raise SystemExit('no post-pass change made')
PATH.write_text(text, encoding='utf-8')
print('desktop consolidation post-pass preserves baseline presentation/mobile semantics')
