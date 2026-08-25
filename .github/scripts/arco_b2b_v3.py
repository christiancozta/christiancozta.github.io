from pathlib import Path
import re

p = Path('arco.html')
s = p.read_text(encoding='utf-8')

s = re.sub(r'\n?<!-- b2b-v3:start -->.*?<!-- b2b-v3:end -->\n?', '\n', s, flags=re.S)

data_link = '<a class="rail__link rail__link--data" href="data.html">DATA<span class="n">05</span></a>'
s = re.sub(r'\s*<a class="rail__link rail__link--data" href="data\.html">DATA<span class="n">05</span></a>', '', s, count=1)
translation = '<button class="rail__link" type="button" data-anchor="repertorio">Tradução<span class="n">04</span></button>'
if translation not in s:
    raise SystemExit('Tradução rail anchor not found')
s = s.replace(translation, translation + '\n        ' + data_link, 1)

block = r'''
<!-- b2b-v3:start -->
<style id="hero-rail-b2b-v3">
@media (min-width:821px){
  .home.hero-v3-ready .bio{
    width:var(--hero-v3-bio-w,auto) !important;
    max-width:var(--hero-v3-bio-w,50%) !important;
  }
  .home.hero-v3-ready .narr-zone .arc{
    position:relative;
    top:-8px;
  }
}

@media (min-width:1001px){
  .rail.hero-v3-rail-ready .rail__id{
    transform:translateY(var(--hero-v3-rail-shift,0px));
  }
}

.rail__link--data{ text-decoration:none; }
.rail__link--data:hover,
.rail__link--data.is-data-hover{ color:#00455D !important; }
.rail__link--data:hover .n,
.rail__link--data.is-data-hover .n{ color:#00455D !important; }
.rail__link--data::after{ background:#00455D !important; }
</style>

<script id="hero-rail-b2b-v3-js">
(() => {
  'use strict';

  const home = document.querySelector('.view[data-view="home"] .home');
  const zone = home && home.querySelector('.narr-zone');
  const bio = zone && zone.querySelector('.bio');
  const arc = zone && zone.querySelector('.arc');
  const rail = document.querySelector('.rail');
  const railTitle = rail && rail.querySelector('.rail__title');
  const dataLink = rail && rail.querySelector('.rail__link--data');
  const name = zone && zone.querySelector('.bio__name');
  if (!home || !zone || !bio || !arc || !rail || !railTitle || !name) return;

  if (dataLink){
    dataLink.addEventListener('pointerenter', () => dataLink.classList.add('is-data-hover'));
    dataLink.addEventListener('pointerleave', () => dataLink.classList.remove('is-data-hover'));
    dataLink.addEventListener('focus', () => dataLink.classList.add('is-data-hover'));
    dataLink.addEventListener('blur', () => dataLink.classList.remove('is-data-hover'));
  }

  const mqDesktopArrow = matchMedia('(min-width:821px)');
  const mqSideRail = matchMedia('(min-width:1001px)');
  let raf = 0;
  let lastBioWidth = null;

  function tune(){
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      let widthChanged = false;

      if (!mqDesktopArrow.matches){
        home.classList.remove('hero-v3-ready');
        bio.style.removeProperty('--hero-v3-bio-w');
        lastBioWidth = null;
      } else {
        home.classList.add('hero-v3-ready');
        const ar = arc.getBoundingClientRect();
        const br = bio.getBoundingClientRect();
        const axisX = ar.left + ar.width / 2;
        const linkWidth = Math.max(48, Math.min(72, innerWidth * .042));
        const freeEndX = axisX - linkWidth;
        const width = Math.max(220, freeEndX - br.left);
        widthChanged = lastBioWidth === null || Math.abs(width - lastBioWidth) > .5;
        lastBioWidth = width;
        bio.style.setProperty('--hero-v3-bio-w', width.toFixed(2) + 'px');
      }

      if (mqSideRail.matches){
        rail.classList.add('hero-v3-rail-ready');
        rail.style.setProperty('--hero-v3-rail-shift','0px');
        const titleTop = railTitle.getBoundingClientRect().top;
        const nameTop = name.getBoundingClientRect().top;
        rail.style.setProperty('--hero-v3-rail-shift', (nameTop - titleTop).toFixed(2) + 'px');
      } else {
        rail.classList.remove('hero-v3-rail-ready');
        rail.style.removeProperty('--hero-v3-rail-shift');
      }

      if (widthChanged){
        requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
      }
    });
  }

  tune();
  requestAnimationFrame(tune);
  window.addEventListener('resize', tune, {passive:true});
  mqDesktopArrow.addEventListener?.('change', tune);
  mqSideRail.addEventListener?.('change', tune);
  document.fonts?.ready?.then(() => requestAnimationFrame(tune));
})();
</script>
<!-- b2b-v3:end -->
'''

if '</body>' not in s:
    raise SystemExit('closing body not found')
s = s.replace('</body>', block + '\n</body>', 1)
p.write_text(s, encoding='utf-8')
print('b2b v3 final refinement applied')
