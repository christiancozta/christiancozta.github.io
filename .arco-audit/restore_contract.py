from pathlib import Path

PATH = Path('assets/arco/js/arco.js')
text = PATH.read_text(encoding='utf-8')
original = text

stats_anchor = '    const stats = [...zone.querySelectorAll(".narr__stat")];\n\n'
helpers = '''    const stats = [...zone.querySelectorAll(".narr__stat")];\n\n    /* Compatibility contract only: the superseded hero-cross runtime is gone,\n       but its state classes still feed active CSS until the style cleanup phase. */\n    home.classList.add("hero-cross-ready");\n\n    const exposeMobileDetails = () => {\n      stats.forEach(stat => {\n        const button = stat.querySelector("button.narr__n");\n        const detail = stat.querySelector(".narr__detail");\n        delete stat.dataset.fixo;\n        stat.classList.remove("is-open");\n        if (detail){\n          detail.hidden = false;\n          detail.setAttribute("aria-hidden", "false");\n        }\n        button?.setAttribute("aria-expanded", "true");\n      });\n    };\n\n    const closeDesktopDetails = () => {\n      stats.forEach(stat => {\n        const button = stat.querySelector("button.narr__n");\n        const detail = stat.querySelector(".narr__detail");\n        stat.classList.remove("is-open");\n        if (detail){\n          detail.hidden = true;\n          detail.setAttribute("aria-hidden", "true");\n        }\n        button?.setAttribute("aria-expanded", "false");\n      });\n    };\n\n'''
if text.count(stats_anchor) != 1:
    raise SystemExit('stats anchor not found exactly once')
text = text.replace(stats_anchor, helpers, 1)

init_anchor = '''    lockLegends();\n    lockDetails();\n\n    mq.addEventListener?.("change", event => {\n'''
init_repl = '''    lockLegends();\n    lockDetails();\n    if (mq.matches) exposeMobileDetails();\n\n    mq.addEventListener?.("change", event => {\n'''
if text.count(init_anchor) != 1:
    raise SystemExit('initial mobile semantics anchor not found')
text = text.replace(init_anchor, init_repl, 1)

mobile_old = '''      if (event.matches){\n        if (legendTimer) clearTimeout(legendTimer);\n        if (detailTimer) clearTimeout(detailTimer);\n        clearLegendLock();\n        clearPrematureDetailLockForMobile();\n        return;\n      }\n      if (!detailsReady) lockDetails();\n'''
mobile_new = '''      if (event.matches){\n        if (legendTimer) clearTimeout(legendTimer);\n        if (detailTimer) clearTimeout(detailTimer);\n        clearLegendLock();\n        exposeMobileDetails();\n        return;\n      }\n      closeDesktopDetails();\n      if (!detailsReady) lockDetails();\n'''
if text.count(mobile_old) != 1:
    raise SystemExit('breakpoint semantics anchor not found')
text = text.replace(mobile_old, mobile_new, 1)

observer_old = '''      if (home.classList.contains("narr-on")) requested = true;\n      if (home.classList.contains("hero-v2-play")) requested = true;\n'''
observer_new = '''      if (home.classList.contains("narr-on")){\n        requested = true;\n        if (!home.classList.contains("cross-sequence")) home.classList.add("cross-sequence");\n      }\n      if (home.classList.contains("hero-v2-play")) requested = true;\n'''
if text.count(observer_old) != 1:
    raise SystemExit('narr-on observer anchor not found')
text = text.replace(observer_old, observer_new, 1)

# If narr-on was already set before the coordinator installed, preserve the old
# cross-sequence class immediately, just as hero-cross.play() did.
end_anchor = '''    if (!gateOpen && home.classList.contains("hero-v2-play")){\n      requested = true;\n      home.classList.remove("hero-v2-play");\n      lockLegends();\n      lockDetails();\n    }\n'''
end_repl = '''    if (home.classList.contains("narr-on")) home.classList.add("cross-sequence");\n\n    if (!gateOpen && home.classList.contains("hero-v2-play")){\n      requested = true;\n      home.classList.remove("hero-v2-play");\n      lockLegends();\n      lockDetails();\n    }\n'''
if text.count(end_anchor) != 1:
    raise SystemExit('end state anchor not found')
text = text.replace(end_anchor, end_repl, 1)

if text == original:
    raise SystemExit('no change made')
PATH.write_text(text, encoding='utf-8')
print('restored legacy presentation/semantic contract without legacy runtime')
