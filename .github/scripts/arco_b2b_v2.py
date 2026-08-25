from pathlib import Path
import re

p = Path('arco.html')
s = p.read_text(encoding='utf-8')

copies = {
    '5 domínios de atuação organizam 17 mecanismos, traduzidos em ao menos 86 nomenclaturas equivalentes no mercado privado.':
        'domínios organizam 17 mecanismos, com ao menos 86 nomenclaturas equivalentes no mercado privado.',
    '4 módulos de IA jurídica compõem ATRIO: arquitetura decisória end-to-end, local, com 175 testes e base de 115.114 julgados.':
        'módulos de IA jurídica compõem ATRIO: arquitetura local end-to-end, com 175 testes e 115.114 julgados.',
    '3 núcleos de trabalho estruturam 10 temáticas derivadas de 102 assuntos; taxonomia aplicada à triagem de 1.792 processos.':
        'núcleos estruturam 10 temáticas de 102 assuntos; taxonomia aplicada à triagem de 1.792 processos.',
    '2 projetos implementados e documentados — ECHO e ATRIO — derivados de uma operação jurídica de alto volume.':
        'projetos implementados e documentados — ECHO e ATRIO — derivados de uma operação jurídica de alto volume.'
}
for old, new in copies.items():
    if old in s:
        s = s.replace(old, new, 1)

s = re.sub(
    r'\n?<!-- b2b-v2:start -->.*?<!-- b2b-v2:end -->\n?',
    '\n', s, flags=re.S
)

block = r'''
<!-- b2b-v2:start -->
<style id="hero-5to1-b2b-v2">
@media (min-width:821px){
  .home.hero-v2-ready .hero-cross-axis,
  .home.hero-v2-ready .hero-cross-link{ display:none !important; }

  .home.hero-v2-ready .narr__stats{ z-index:2 !important; }
  .home.hero-v2-ready .narr__stat{
    position:absolute !important;
    left:var(--hero-v2-left,50%) !important;
    right:0 !important;
    top:var(--hero-v2-top,0px) !important;
    width:auto !important;
    max-width:none !important;
    display:grid !important;
    grid-template-columns:max-content minmax(0,1fr) !important;
    grid-template-rows:auto auto !important;
    column-gap:clamp(.72rem,1vw,.96rem) !important;
    row-gap:.12rem !important;
    align-items:start !important;
    opacity:0 !important;
    transform:translateY(4px) !important;
    transition:opacity 420ms var(--ease), transform 420ms var(--ease) !important;
    transition-delay:var(--hero-v2-delay,0ms) !important;
  }
  .home.hero-v2-ready.hero-v2-play .narr__stat{
    opacity:1 !important;
    transform:none !important;
  }

  .home.hero-v2-ready .narr__n{
    grid-column:1 !important;
    grid-row:1 / span 2 !important;
    align-self:start !important;
    font-family:var(--f-display) !important;
    font-weight:700 !important;
    font-size:clamp(1.95rem,2.35vw,2.55rem) !important;
    line-height:.86 !important;
    letter-spacing:-.05em !important;
    color:var(--ink) !important;
    background:var(--paper) !important;
    padding:0 .12em .04em !important;
    margin:0 !important;
    position:relative !important;
    z-index:3 !important;
  }
  .home.hero-v2-ready button.narr__n{
    appearance:none !important;
    -webkit-appearance:none !important;
    border:0 !important;
    cursor:pointer !important;
    pointer-events:auto !important;
  }
  .home.hero-v2-ready .narr__short{
    grid-column:2 !important;
    grid-row:1 !important;
    align-self:center !important;
    padding-top:.08rem !important;
  }
  .home.hero-v2-ready .narr__detail{
    grid-column:2 !important;
    grid-row:2 !important;
    width:100% !important;
    max-width:none !important;
    padding-top:.12rem !important;
  }

  .hero-v2-seg,
  .hero-v2-link{
    position:absolute;
    display:block;
    background:var(--ink);
    opacity:.5;
    pointer-events:none;
    z-index:0;
  }
  .hero-v2-seg{
    width:1px;
    transform:scaleY(0);
    transform-origin:50% 100%;
    transition:transform var(--hero-v2-dur,260ms) linear var(--hero-v2-seg-delay,0ms);
  }
  .hero-v2-link{
    height:1px;
    transform:scaleX(0);
    transform-origin:100% 50%;
    transition:transform 460ms var(--ease) var(--hero-v2-link-delay,0ms);
  }
  .home.hero-v2-play .hero-v2-seg{ transform:scaleY(1); }
  .home.hero-v2-play .hero-v2-link{ transform:scaleX(1); }
}

@media (max-width:820px){
  .hero-v2-seg,.hero-v2-link{ display:none !important; }
  .narr__n{
    font-size:clamp(1.15rem,5vw,1.35rem) !important;
    font-weight:700 !important;
  }
  .narr__stat[data-step="1"] .narr__short{
    display:block !important;
    grid-column:2 !important;
    grid-row:1 !important;
  }
}

@media (prefers-reduced-motion:reduce){
  .home.hero-v2-ready .narr__stat{
    opacity:1 !important;
    transform:none !important;
    transition:none !important;
  }
  .home.hero-v2-ready .hero-v2-seg,
  .home.hero-v2-ready .hero-v2-link{
    transform:none !important;
    transition:none !important;
  }
}
</style>

<script id="hero-5to1-b2b-v2-js">
(() => {
  'use strict';

  const home = document.querySelector('.view[data-view="home"] .home');
  const zone = home && home.querySelector('.narr-zone');
  if (!home || !zone) return;

  const narr = zone.querySelector('.narr');
  const arc = zone.querySelector('.arc');
  const head = zone.querySelector('.bio__head');
  const stats = ['5','4','3','2','1'].map(step => zone.querySelector(`.narr__stat[data-step="${step}"]`));
  if (!narr || !arc || !head || stats.some(stat => !stat)) return;

  const numbers = stats.map(stat => stat.querySelector('.narr__n'));
  if (numbers.some(number => !number)) return;

  const mq = matchMedia('(max-width:820px)');
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const clamp = (min, value, max) => Math.max(min, Math.min(max, value));

  const segments = Array.from({length:5}, (_, i) => {
    let el = narr.querySelector(`.hero-v2-seg[data-seg="${i}"]`);
    if (!el){
      el = document.createElement('span');
      el.className = 'hero-v2-seg';
      el.dataset.seg = String(i);
      el.setAttribute('aria-hidden','true');
      narr.appendChild(el);
    }
    return el;
  });

  let link = narr.querySelector('.hero-v2-link');
  if (!link){
    link = document.createElement('span');
    link.className = 'hero-v2-link';
    link.setAttribute('aria-hidden','true');
    narr.appendChild(link);
  }

  function layoutBox(el){
    let x = 0, y = 0, node = el;
    while (node && node !== zone){
      x += node.offsetLeft || 0;
      y += node.offsetTop || 0;
      node = node.offsetParent;
    }
    if (node === zone){
      const width = el.offsetWidth || 0;
      const height = el.offsetHeight || 0;
      return {x, y, width, height, right:x + width, bottom:y + height};
    }
    const zr = zone.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return {x:r.left-zr.left, y:r.top-zr.top, width:r.width, height:r.height,
            right:r.right-zr.left, bottom:r.bottom-zr.top};
  }

  function expandedHeight(stat){
    const detail = stat.querySelector('.narr__detail');
    if (!detail) return stat.offsetHeight || 1;
    const wasHidden = detail.hidden;
    const wasOpen = stat.classList.contains('is-open');
    const oldVisibility = detail.style.visibility;
    detail.hidden = false;
    stat.classList.add('is-open');
    detail.style.visibility = 'hidden';
    const h = stat.offsetHeight || 1;
    detail.style.visibility = oldVisibility;
    detail.hidden = wasHidden;
    stat.classList.toggle('is-open', wasOpen);
    return h;
  }

  let played = false;
  let raf = 0;

  function layout(){
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      if (mq.matches){
        home.classList.remove('hero-v2-ready');
        return;
      }

      home.classList.add('hero-v2-ready');

      const ar = layoutBox(arc);
      const hr = layoutBox(head);
      if (!ar || !hr) return;

      const axisX = ar.x + ar.width / 2;
      const springY = ar.bottom;
      const safeArc = clamp(8, innerWidth * .007, 14);
      const bottomEdge = ar.y - safeArc;
      const heights = stats.map(expandedHeight);
      const totalHeight = heights.reduce((sum, h) => sum + h, 0);
      const targetTop = hr.y + Math.max(0, (hr.height - heights[4]) * .18);
      const rawGap = (bottomEdge - targetTop - totalHeight) / 4;
      const gap = clamp(18, rawGap, 92);

      const tops = new Array(5);
      tops[0] = bottomEdge - heights[0];
      for (let i = 1; i < 5; i++){
        tops[i] = tops[i - 1] - gap - heights[i];
      }

      stats.forEach((stat, i) => {
        const numberWidth = numbers[i].offsetWidth || 1;
        stat.style.setProperty('--hero-v2-left', (axisX - numberWidth / 2).toFixed(2) + 'px');
        stat.style.setProperty('--hero-v2-top', tops[i].toFixed(2) + 'px');
      });

      void zone.offsetHeight;
      const numberBoxes = numbers.map(layoutBox);
      let lower = springY;
      const interruption = 5;
      const segmentHeights = [];

      segments.forEach((seg, i) => {
        const nb = numberBoxes[i];
        const top = nb.bottom + interruption;
        const height = Math.max(0, lower - top);
        seg.style.left = (axisX - .5).toFixed(2) + 'px';
        seg.style.top = top.toFixed(2) + 'px';
        seg.style.height = height.toFixed(2) + 'px';
        segmentHeights.push(height);
        lower = nb.y - interruption;
      });

      const n1 = numberBoxes[4];
      const n1CenterY = n1.y + n1.height / 2;
      const linkWidth = clamp(48, innerWidth * .042, 72);
      link.style.left = (axisX - linkWidth).toFixed(2) + 'px';
      link.style.top = (n1CenterY - .5).toFixed(2) + 'px';
      link.style.width = linkWidth.toFixed(2) + 'px';

      const DRAW = 2200;
      const HOLD = 120;
      const totalLine = Math.max(1, segmentHeights.reduce((sum, h) => sum + h, 0));
      let cursor = 0;
      segmentHeights.forEach((height, i) => {
        const duration = Math.max(160, DRAW * (height / totalLine));
        segments[i].style.setProperty('--hero-v2-seg-delay', cursor.toFixed(0) + 'ms');
        segments[i].style.setProperty('--hero-v2-dur', duration.toFixed(0) + 'ms');
        const arrival = cursor + duration;
        stats[i].style.setProperty('--hero-v2-delay', Math.max(0, arrival - 80).toFixed(0) + 'ms');
        cursor = arrival + HOLD;
      });
      link.style.setProperty('--hero-v2-link-delay', cursor.toFixed(0) + 'ms');

      if (played) home.classList.add('hero-v2-play');
    });
  }

  stats.slice(0,4).forEach((stat, i) => {
    const button = numbers[i];
    const detail = stat.querySelector('.narr__detail');
    if (!detail || button.tagName !== 'BUTTON') return;

    button.addEventListener('click', event => {
      if (mq.matches) return;
      event.stopImmediatePropagation();
      const shouldOpen = detail.hidden;
      detail.hidden = !shouldOpen;
      stat.classList.toggle('is-open', shouldOpen);
      detail.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');
      button.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    }, true);
  });

  function play(){
    if (played || mq.matches) return;
    played = true;
    home.classList.add('narr-on');
    layout();
    requestAnimationFrame(() => home.classList.add('hero-v2-play'));
  }

  const triggers = ['scroll','wheel','pointerdown','pointermove','keydown','touchstart'];
  const activate = () => {
    play();
    triggers.forEach(type => window.removeEventListener(type, activate));
  };

  if (reduce){
    played = true;
    home.classList.add('narr-on','hero-v2-play');
  } else {
    triggers.forEach(type => window.addEventListener(type, activate, {passive:true}));
  }

  layout();
  requestAnimationFrame(layout);
  window.addEventListener('resize', layout, {passive:true});
  mq.addEventListener?.('change', layout);
  document.fonts?.ready?.then(layout);

  if (typeof ResizeObserver === 'function'){
    const ro = new ResizeObserver(layout);
    ro.observe(zone);
    ro.observe(arc);
    ro.observe(head);
  }
})();
</script>
<!-- b2b-v2:end -->
'''

if '</body>' not in s:
    raise SystemExit('closing body not found')
s = s.replace('</body>', block + '\n</body>', 1)
p.write_text(s, encoding='utf-8')
print('b2b v2 override applied')
