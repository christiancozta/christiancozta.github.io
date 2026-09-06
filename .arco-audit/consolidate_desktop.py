from pathlib import Path

CORE = Path('assets/arco/js/arco-core.js')
COORD = Path('assets/arco/js/arco.js')

core = CORE.read_text(encoding='utf-8')
original_core = core

# hero-v2 becomes geometry-only. The visible layout math and all custom
# properties remain untouched; only autonomous state/event ownership leaves.
core = core.replace(
    "  const mq = matchMedia('(max-width:820px)');\n"
    "  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;\n"
    "  const clamp = (min, value, max) => Math.max(min, Math.min(max, value));\n",
    "  const mq = matchMedia('(max-width:820px)');\n"
    "  const clamp = (min, value, max) => Math.max(min, Math.min(max, value));\n",
    1,
)
core = core.replace("  let played = false;\n  let raf = 0;\n", "  let raf = 0;\n", 1)
core = core.replace("\n      if (played) home.classList.add('hero-v2-play');", "", 1)

legacy_start = core.find("  /* os cinco, agora: o passo 1 deixou de ser rotulo solto e ganhou conteudo */")
layout_start = core.find("  layout();\n  requestAnimationFrame(layout);", legacy_start)
assert legacy_start >= 0, 'hero-v2 legacy interaction block not found'
assert layout_start > legacy_start, 'hero-v2 layout lifecycle boundary not found'
core = (
    core[:legacy_start]
    + "  /* A geometria e publica para o coordenador, mas nao possui estado narrativo. */\n"
      "  window.__ARCO_HERO_V2_GEOMETRY__ = Object.freeze({ layout });\n\n"
    + core[layout_start:]
)

for forbidden in (
    "stat.addEventListener('pointerenter'",
    "stat.addEventListener('pointerleave'",
    "stat.addEventListener('focusout'",
    "const triggers = ['scroll','wheel','pointerdown','pointermove','keydown','touchstart'];",
    "if (played) home.classList.add('hero-v2-play')",
):
    assert forbidden not in core[core.find('Fonte original: hero-5to1-b2b-v2-js'):core.find('Fonte original: hero-rail-b2b-v3-js')], forbidden

assert "window.__ARCO_HERO_V2_GEOMETRY__ = Object.freeze({ layout });" in core
assert core != original_core
CORE.write_text(core, encoding='utf-8')

coordinator = r'''/* ========================================================================== 
   ARCO — autoridade narrativa do HERO
   O núcleo mede e posiciona. Este arquivo governa estado e interação:
   idle → arc-requested → arc-settled → line-running → numbers-settled →
   titles-running → titles-settled → interactive.
   O mobile permanece em arco-mobile-viewport.js.
   ========================================================================== */
(() => {
  "use strict";

  const current = document.currentScript;
  const src = current?.src || new URL("assets/arco/js/arco.js", document.baseURI).href;
  const coreUrl = new URL("arco-core.js?v=20260906-desktop-consolidated", src);

  const core = document.createElement("script");
  core.src = coreUrl.href;
  core.async = false;
  core.onload = () => {
    installDesktopHeroController();
    const mobile = document.createElement("script");
    mobile.src = new URL("arco-mobile-viewport.js?v=20260906-viewport-v1", src).href;
    mobile.async = false;
    mobile.onerror = () => console.error("ARCO: falha ao carregar a coordenação mobile.");
    document.head.appendChild(mobile);
  };
  core.onerror = () => console.error("ARCO: falha ao carregar o núcleo local.");
  document.head.appendChild(core);

  function installDesktopHeroController(){
    const home = document.querySelector('.view[data-view="home"] .home');
    const zone = home?.querySelector(".narr-zone");
    const arc = zone?.querySelector(".arc");
    const spring = arc?.querySelector(".spring");
    const geometry = window.__ARCO_HERO_V2_GEOMETRY__;
    if (!home || !zone || !arc || !spring || !geometry?.layout) return;

    const mq = matchMedia("(max-width:820px)");
    const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
    const stats = [...zone.querySelectorAll(".narr__stat")];
    const REQUEST_EVENTS = ["scroll","wheel","pointerdown","pointermove","keydown","touchstart"];
    const LEGEND_STEP = 95;

    let phase = reduce ? "interactive" : "idle";
    let requested = reduce;
    let gateOpen = reduce;
    let springArmed = false;
    let requestArmed = false;
    let legendsReleased = reduce;
    let detailsReady = reduce;
    let legendTimer = 0;
    let detailTimer = 0;
    let fallbackTimer = 0;

    const setPhase = next => { phase = next; };

    const timeList = value => value.split(",").map(item => {
      const token = item.trim();
      if (token.endsWith("ms")) return parseFloat(token) || 0;
      if (token.endsWith("s")) return (parseFloat(token) || 0) * 1000;
      return 0;
    });

    const transitionBudget = el => {
      const cs = getComputedStyle(el);
      const durations = timeList(cs.transitionDuration);
      const delays = timeList(cs.transitionDelay);
      const n = Math.max(durations.length, delays.length, 1);
      let max = 0;
      for (let i = 0; i < n; i++){
        max = Math.max(max,
          (durations[i % durations.length] || 0) +
          (delays[i % delays.length] || 0));
      }
      return max;
    };

    const textNodes = stat => [
      stat.querySelector(".narr__short"),
      stat.querySelector(".narr__detail")
    ].filter(Boolean);

    const clearLegendLock = () => {
      stats.forEach(stat => textNodes(stat).forEach(node => node.style.removeProperty("opacity")));
    };

    const lockLegends = () => {
      if (mq.matches || reduce || legendsReleased) return;
      stats.forEach(stat => textNodes(stat).forEach(node =>
        node.style.setProperty("opacity", "0", "important")));
    };

    const lockDetails = () => {
      if (mq.matches || reduce || detailsReady) return;
      stats.forEach(stat => {
        const button = stat.querySelector("button.narr__n");
        const detail = stat.querySelector(".narr__detail");
        stat.dataset.fixo = "1";
        stat.classList.remove("is-open");
        if (detail){
          detail.hidden = true;
          detail.setAttribute("aria-hidden", "true");
        }
        button?.setAttribute("aria-expanded", "false");
      });
    };

    const clearPrematureDetailLockForMobile = () => {
      if (detailsReady) return;
      stats.forEach(stat => {
        delete stat.dataset.fixo;
        stat.classList.remove("is-open");
        const button = stat.querySelector("button.narr__n");
        const detail = stat.querySelector(".narr__detail");
        if (detail){
          detail.hidden = true;
          detail.setAttribute("aria-hidden", "true");
        }
        button?.setAttribute("aria-expanded", "false");
      });
    };

    const releaseDetails = () => {
      if (detailsReady || mq.matches) return;
      setPhase("titles-settled");
      detailsReady = true;
      if (detailTimer) clearTimeout(detailTimer);
      home.classList.add("hero-v2-details-ready");
      setPhase("interactive");
    };

    const armDetailRelease = () => {
      if (detailsReady || mq.matches || reduce || !legendsReleased) return;
      lockDetails();
      requestAnimationFrame(() => {
        if (detailsReady || mq.matches || !legendsReleased) return;
        const titles = stats.map(stat => stat.querySelector(".narr__short")).filter(Boolean);
        const lastTitleAt = Math.max(0, ...titles.map(transitionBudget));
        if (detailTimer) clearTimeout(detailTimer);
        detailTimer = window.setTimeout(releaseDetails, Math.ceil(lastTitleAt) + 24);
      });
    };

    const releaseLegends = () => {
      if (legendsReleased || mq.matches) return;
      setPhase("numbers-settled");
      legendsReleased = true;
      if (legendTimer) clearTimeout(legendTimer);
      [...stats]
        .sort((a, b) => Number(a.dataset.step) - Number(b.dataset.step))
        .forEach((stat, index) =>
          stat.style.setProperty("--hero-v2-leg-delay", `${index * LEGEND_STEP}ms`));
      clearLegendLock();
      home.classList.add("hero-v2-legends-released");
      setPhase("titles-running");
      armDetailRelease();
    };

    const armLegendRelease = () => {
      if (legendsReleased || mq.matches || reduce || !home.classList.contains("hero-v2-play")) return;
      lockLegends();
      requestAnimationFrame(() => {
        if (legendsReleased || mq.matches || !home.classList.contains("hero-v2-play")) return;
        const numbers = stats.map(stat => stat.querySelector(".narr__n")).filter(Boolean);
        const lastNumberAt = Math.max(0, ...numbers.map(transitionBudget));
        if (legendTimer) clearTimeout(legendTimer);
        legendTimer = window.setTimeout(releaseLegends, Math.ceil(lastNumberAt) + 24);
      });
    };

    const openStat = stat => {
      if (!stat || mq.matches || !detailsReady) return;
      const button = stat.querySelector("button.narr__n");
      const title = stat.querySelector(".narr__short");
      const detail = stat.querySelector(".narr__detail");
      if (!button || !detail) return;
      stat.dataset.fixo = "1";
      stat.classList.add("is-open");
      detail.hidden = false;
      detail.setAttribute("aria-hidden", "false");
      button.setAttribute("aria-expanded", "true");
      if (title){
        title.style.pointerEvents = "auto";
        title.style.cursor = "default";
      }
    };

    stats.forEach(stat => {
      stat.addEventListener("pointerenter", () => openStat(stat));
      stat.addEventListener("focusin", () => openStat(stat));
      stat.querySelector("button.narr__n")?.addEventListener("click", event => {
        if (mq.matches) return;
        event.preventDefault();
        if (detailsReady) openStat(stat);
      });
    });

    const springSettled = () => {
      if (!arc.classList.contains("is-in")) return false;
      const value = parseFloat(getComputedStyle(spring).strokeDashoffset);
      return Number.isFinite(value) ? Math.abs(value) < 0.5 : false;
    };

    const revealLine = () => {
      if (!gateOpen || !requested || mq.matches) return;
      if (!home.classList.contains("hero-v2-play")){
        setPhase("arc-settled");
        home.classList.add("hero-v2-play");
        setPhase("line-running");
      }
      armLegendRelease();
    };

    const openGate = () => {
      if (gateOpen) return;
      gateOpen = true;
      springArmed = false;
      if (fallbackTimer) clearTimeout(fallbackTimer);
      revealLine();
    };

    const armSpring = () => {
      if (gateOpen || springArmed || !arc.classList.contains("is-in")) return;
      springArmed = true;
      if (springSettled()){
        openGate();
        return;
      }
      const finish = event => {
        if (event.target !== spring) return;
        if (event.propertyName && event.propertyName !== "stroke-dashoffset") return;
        spring.removeEventListener("transitionend", finish);
        spring.removeEventListener("transitioncancel", finish);
        openGate();
      };
      spring.addEventListener("transitionend", finish);
      spring.addEventListener("transitioncancel", finish);
      const budget = transitionBudget(spring);
      fallbackTimer = window.setTimeout(openGate, Math.max(60, budget + 80));
    };

    const disarmRequest = () => {
      if (!requestArmed) return;
      requestArmed = false;
      REQUEST_EVENTS.forEach(type => window.removeEventListener(type, requestNarrative));
    };

    function requestNarrative(){
      if (mq.matches || requested) return;
      requested = true;
      disarmRequest();
      setPhase("arc-requested");
      home.classList.add("narr-on");
      geometry.layout();
      if (gateOpen) revealLine();
      else armSpring();
    }

    const armRequest = () => {
      if (reduce || mq.matches || requested || requestArmed) return;
      requestArmed = true;
      REQUEST_EVENTS.forEach(type => window.addEventListener(type, requestNarrative, {passive:true}));
    };

    const arcObserver = new MutationObserver(() => {
      if (arc.classList.contains("is-in")) armSpring();
    });
    arcObserver.observe(arc, {attributes:true, attributeFilter:["class"]});

    lockLegends();
    lockDetails();

    if (reduce){
      home.classList.add("narr-on", "hero-v2-play", "hero-v2-legends-released", "hero-v2-details-ready");
      clearLegendLock();
    } else {
      armRequest();
      armSpring();
    }

    mq.addEventListener?.("change", event => {
      if (event.matches){
        disarmRequest();
        if (legendTimer) clearTimeout(legendTimer);
        if (detailTimer) clearTimeout(detailTimer);
        clearLegendLock();
        clearPrematureDetailLockForMobile();
        return;
      }
      geometry.layout();
      if (!detailsReady) lockDetails();
      if (!legendsReleased) lockLegends();
      if (reduce){
        home.classList.add("narr-on", "hero-v2-play", "hero-v2-legends-released", "hero-v2-details-ready");
        clearLegendLock();
        return;
      }
      if (!requested) armRequest();
      if (!gateOpen) armSpring();
      revealLine();
      if (legendsReleased && !detailsReady) armDetailRelease();
    });

    /* Estado disponível apenas para diagnóstico/teste; não participa do layout. */
    window.__ARCO_DESKTOP_HERO_STATE__ = () => ({phase, requested, gateOpen, legendsReleased, detailsReady});
  }
})();
'''
COORD.write_text(coordinator, encoding='utf-8')

print(f'arco-core.js: {len(original_core)} -> {len(core)} bytes')
print(f'arco.js: {len(coordinator)} bytes; desktop authority consolidated')
