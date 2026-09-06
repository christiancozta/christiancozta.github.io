from __future__ import annotations

import hashlib
import subprocess
from pathlib import Path

CORE = Path('assets/arco/js/arco-core.js')
LOADER = Path('assets/arco/js/arco.js')
EXPECTED_CORE_BLOB = '969d3a1ce2e92816e651e8d73124a37ea18151ec'
EXPECTED_LOADER_BLOB = 'ce335d829feadbde17c2955db116a5dd1dd0eb54'


def git_blob(path: Path) -> str:
    return subprocess.check_output(['git', 'hash-object', str(path)], text=True).strip()


def require(condition: bool, message: str):
    if not condition:
        raise SystemExit(message)


require(git_blob(CORE) == EXPECTED_CORE_BLOB, 'arco-core.js no longer matches frozen baseline blob')
require(git_blob(LOADER) == EXPECTED_LOADER_BLOB, 'arco.js no longer matches frozen baseline blob')

text = CORE.read_text(encoding='utf-8')
start_marker = '/* Fonte original: hero-5to1-b2b-v2-js */'
next_marker = '/* Fonte original: hero-rail-b2b-v3-js */'
start = text.index(start_marker)
end = text.index(next_marker, start)
section = text[start:end]

state_needle = "  let played = false;\n  let raf = 0;\n"
state_replacement = """  let played = false;
  let raf = 0;

  /* Estado único do desktop. A geometria continua pertencendo a layout();
     daqui para baixo só existe uma autoridade temporal e interativa. */
  const LEGEND_STEP = 95;
  let phase = reduce ? 'interactive' : 'idle';
  let requested = reduce;
  let gateOpen = reduce;
  let legendsReleased = reduce;
  let detailsReady = reduce;
  let legendTimer = 0;
  let detailTimer = 0;
  let gateTimer = 0;
  let springArmed = false;
"""
require(section.count(state_needle) == 1, 'desktop state insertion point changed')
section = section.replace(state_needle, state_replacement, 1)

play_in_layout = "      if (played) home.classList.add('hero-v2-play');"
require(section.count(play_in_layout) == 1, 'hero-v2 layout play hook changed')
section = section.replace(
    play_in_layout,
    "      if (played && gateOpen && !mq.matches) home.classList.add('hero-v2-play');",
    1,
)

tail_start_marker = '  /* os cinco, agora: o passo 1 deixou de ser rotulo solto e ganhou conteudo */'
tail_start = section.index(tail_start_marker)
iife_end = section.rfind('\n})();')
require(iife_end > tail_start, 'hero-v2 IIFE end not found')

new_tail = r'''  /* ----------------------------------------------------------------------
     Gate e interação — uma única máquina para o desktop.
     Preserva os mesmos budgets ópticos do baseline: 420 ms por entrada,
     95 ms entre títulos e 24 ms de margem após o último transition budget.
     ---------------------------------------------------------------------- */
  const spring = arc.querySelector('.spring');
  if (!spring) return;

  const timeList = value => value.split(',').map(item => {
    const token = item.trim();
    if (token.endsWith('ms')) return parseFloat(token) || 0;
    if (token.endsWith('s')) return (parseFloat(token) || 0) * 1000;
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
    stat.querySelector('.narr__short'),
    stat.querySelector('.narr__detail')
  ].filter(Boolean);

  const clearLegendLock = () => {
    stats.forEach(stat => textNodes(stat).forEach(node => node.style.removeProperty('opacity')));
  };

  const lockLegends = () => {
    if (mq.matches || reduce || legendsReleased) return;
    stats.forEach(stat => textNodes(stat).forEach(node =>
      node.style.setProperty('opacity', '0', 'important')));
  };

  const lockDetails = () => {
    if (mq.matches || reduce || detailsReady) return;
    stats.forEach(stat => {
      const button = stat.querySelector('button.narr__n');
      const detail = stat.querySelector('.narr__detail');
      stat.dataset.fixo = '1';
      stat.classList.remove('is-open');
      if (detail){
        detail.hidden = true;
        detail.setAttribute('aria-hidden', 'true');
      }
      button?.setAttribute('aria-expanded', 'false');
    });
  };

  const clearPrematureDetailLockForMobile = () => {
    if (detailsReady) return;
    stats.forEach(stat => {
      delete stat.dataset.fixo;
      stat.classList.remove('is-open');
      const button = stat.querySelector('button.narr__n');
      const detail = stat.querySelector('.narr__detail');
      if (detail){
        detail.hidden = true;
        detail.setAttribute('aria-hidden', 'true');
      }
      button?.setAttribute('aria-expanded', 'false');
    });
  };

  const openStat = stat => {
    if (!stat || mq.matches || !detailsReady) return;
    const button = stat.querySelector('button.narr__n');
    const title = stat.querySelector('.narr__short');
    const detail = stat.querySelector('.narr__detail');
    if (!button || !detail) return;

    stat.dataset.fixo = '1';
    stat.classList.add('is-open');
    detail.hidden = false;
    detail.setAttribute('aria-hidden', 'false');
    button.setAttribute('aria-expanded', 'true');
    if (title){
      title.style.pointerEvents = 'auto';
      title.style.cursor = 'default';
    }
  };

  const releaseDetails = () => {
    if (detailsReady || mq.matches) return;
    detailsReady = true;
    phase = 'interactive';
    if (detailTimer) clearTimeout(detailTimer);
    home.classList.add('hero-v2-details-ready');
  };

  const armDetailRelease = () => {
    if (detailsReady || mq.matches || reduce || !legendsReleased) return;
    lockDetails();
    requestAnimationFrame(() => {
      if (detailsReady || mq.matches || !legendsReleased) return;
      const titles = stats.map(stat => stat.querySelector('.narr__short')).filter(Boolean);
      const lastTitleAt = Math.max(0, ...titles.map(transitionBudget));
      if (detailTimer) clearTimeout(detailTimer);
      detailTimer = window.setTimeout(releaseDetails, Math.ceil(lastTitleAt) + 24);
    });
  };

  const releaseLegends = () => {
    if (legendsReleased || mq.matches) return;
    legendsReleased = true;
    phase = 'titles-running';
    if (legendTimer) clearTimeout(legendTimer);

    [...stats]
      .sort((a, b) => Number(a.dataset.step) - Number(b.dataset.step))
      .forEach((stat, index) =>
        stat.style.setProperty('--hero-v2-leg-delay', `${index * LEGEND_STEP}ms`));

    clearLegendLock();
    home.classList.add('hero-v2-legends-released');
    armDetailRelease();
  };

  const armLegendRelease = () => {
    if (legendsReleased || mq.matches || reduce || !home.classList.contains('hero-v2-play')) return;
    lockLegends();
    requestAnimationFrame(() => {
      if (legendsReleased || mq.matches || !home.classList.contains('hero-v2-play')) return;
      const nums = stats.map(stat => stat.querySelector('.narr__n')).filter(Boolean);
      const lastNumberAt = Math.max(0, ...nums.map(transitionBudget));
      if (legendTimer) clearTimeout(legendTimer);
      legendTimer = window.setTimeout(() => {
        phase = 'numbers-settled';
        releaseLegends();
      }, Math.ceil(lastNumberAt) + 24);
    });
  };

  const startLine = () => {
    if (!gateOpen || !requested || mq.matches) return;
    if (!played){
      played = true;
      home.classList.add('narr-on');
      layout();
    }
    phase = 'line-running';
    if (!home.classList.contains('hero-v2-play')) home.classList.add('hero-v2-play');
    armLegendRelease();
  };

  const springSettled = () => {
    if (!arc.classList.contains('is-in')) return false;
    const value = parseFloat(getComputedStyle(spring).strokeDashoffset);
    return Number.isFinite(value) ? Math.abs(value) < .5 : false;
  };

  const openGate = () => {
    if (gateOpen) return;
    gateOpen = true;
    phase = 'arc-settled';
    if (gateTimer) clearTimeout(gateTimer);
    startLine();
  };

  const armSpring = () => {
    if (gateOpen || springArmed || !arc.classList.contains('is-in')) return;
    springArmed = true;
    if (springSettled()){
      openGate();
      return;
    }

    const finish = event => {
      if (event.target !== spring) return;
      if (event.propertyName && event.propertyName !== 'stroke-dashoffset') return;
      spring.removeEventListener('transitionend', finish);
      spring.removeEventListener('transitioncancel', finish);
      openGate();
    };
    spring.addEventListener('transitionend', finish);
    spring.addEventListener('transitioncancel', finish);
    gateTimer = window.setTimeout(openGate, Math.max(60, transitionBudget(spring) + 80));
  };

  const beginDesktopRequest = () => {
    if (mq.matches) return;
    if (!played){
      played = true;
      home.classList.add('narr-on');
      layout();
    }
    startLine();
  };

  const triggers = ['scroll','wheel','pointerdown','pointermove','keydown','touchstart'];
  const request = () => {
    requested = true;
    if (phase === 'idle') phase = 'arc-requested';
    beginDesktopRequest();
    triggers.forEach(type => window.removeEventListener(type, request));
  };

  stats.forEach(stat => {
    stat.addEventListener('pointerenter', () => openStat(stat));
    stat.addEventListener('focusin', () => openStat(stat));
  });

  /* O único clique desktop é monotônico: antes do gate, nada; depois, abre.
     A captura permanece neste primeiro commit apenas para neutralizar o
     listener hero-cross ainda presente. Ele some junto com o legado no commit 2. */
  document.addEventListener('click', event => {
    if (mq.matches) return;
    const button = event.target instanceof Element
      ? event.target.closest('button.narr__n')
      : null;
    if (!button || !home.contains(button)) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (!detailsReady) return;
    openStat(button.closest('.narr__stat'));
  }, true);

  lockLegends();
  lockDetails();

  if (gateOpen){
    if (reduce){
      played = true;
      requested = true;
      home.classList.add('narr-on', 'hero-v2-play');
    } else {
      startLine();
    }
  } else {
    const arcObserver = new MutationObserver(() => armSpring());
    arcObserver.observe(arc, {attributes:true, attributeFilter:['class']});
    armSpring();
  }

  if (!reduce) triggers.forEach(type => window.addEventListener(type, request, {passive:true}));

  const syncMode = event => {
    layout();
    if (event?.matches){
      if (legendTimer) clearTimeout(legendTimer);
      if (detailTimer) clearTimeout(detailTimer);
      clearLegendLock();
      clearPrematureDetailLockForMobile();
      return;
    }
    if (!detailsReady) lockDetails();
    if (!legendsReleased){
      lockLegends();
      if (requested) beginDesktopRequest();
      armLegendRelease();
    } else if (!detailsReady){
      armDetailRelease();
    }
    if (requested) beginDesktopRequest();
  };

  layout();
  requestAnimationFrame(layout);
  window.addEventListener('resize', layout, {passive:true});
  mq.addEventListener?.('change', syncMode);
  document.fonts?.ready?.then(layout);

  if (typeof ResizeObserver === 'function'){
    const ro = new ResizeObserver(layout);
    ro.observe(zone);
    ro.observe(arc);
    ro.observe(head);
    if (heroTxt) ro.observe(heroTxt);
    const ficha = zone.querySelector('.bio');
    if (ficha) ro.observe(ficha);
  }
'''

section = section[:tail_start] + new_tail + section[iife_end:]
text = text[:start] + section + text[end:]
CORE.write_text(text, encoding='utf-8')

LOADER.write_text(r'''/* ========================================================================== 
   ARCO — carregador do núcleo e da estratégia mobile da HERO.
   O desktop passou a ter uma única autoridade dentro do hero-v2 em arco-core.js.
   ========================================================================== */
(() => {
  "use strict";

  const current = document.currentScript;
  const src = current?.src || new URL("assets/arco/js/arco.js", document.baseURI).href;
  const coreUrl = new URL("arco-core.js?v=20260906-desktop-narrative", src);

  const core = document.createElement("script");
  core.src = coreUrl.href;
  core.async = false;
  core.onload = () => {
    const mobile = document.createElement("script");
    mobile.src = new URL("arco-mobile-viewport.js?v=20260906-viewport-v1", src).href;
    mobile.async = false;
    mobile.onerror = () => console.error("ARCO: falha ao carregar a coordenação mobile.");
    document.head.appendChild(mobile);
  };
  core.onerror = () => console.error("ARCO: falha ao carregar o núcleo local.");
  document.head.appendChild(core);
})();
''', encoding='utf-8')

print('phase 1 staged')
