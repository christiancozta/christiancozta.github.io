/* ========================================================================== 
   ARCO — entrada desktop/mobile + proveniência sob demanda + contatos orbitais
   O runtime estabilizado permanece em arco-runtime.js. Esta camada acrescenta
   leitura territorial no desktop e mantém marca/contatos disponíveis no scroll.
   ========================================================================== */
(() => {
  "use strict";

  const current = document.currentScript;
  const src = current?.src || new URL("assets/arco/js/arco.js", document.baseURI).href;
  const runtimeUrl = new URL("arco-runtime.js?v=20260912-provenance-v1", src);

  const runtime = document.createElement("script");
  runtime.src = runtimeUrl.href;
  runtime.async = false;
  runtime.onload = () => {
    installDataOrigin();
    installProvenanceHover();
    installContactOrbit();
  };
  runtime.onerror = () => console.error("ARCO: falha ao carregar o runtime estabilizado.");
  document.head.appendChild(runtime);

  function installDataOrigin(){
    const paragraph = document.querySelector('.view[data-view="home"] .arcade .mov:first-child .mov__t');
    if (!paragraph || paragraph.querySelector('.b-data')) return;

    const pattern = /Ali se\s+formou a percepção inicial: antes de acelerar a produção jurídica, era preciso tornar o\s+acervo legível\./;
    const tail = [...paragraph.childNodes].find(node =>
      node.nodeType === Node.TEXT_NODE && pattern.test(node.nodeValue || ""));
    if (!tail) return;

    const text = tail.nodeValue || "";
    const match = text.match(pattern);
    if (!match || match.index == null) return;

    const before = text.slice(0, match.index);
    const after = text.slice(match.index + match[0].length);
    const fragment = document.createDocumentFragment();
    fragment.append(document.createTextNode(
      `${before}Ali se formou a percepção inicial: antes de acelerar a produção jurídica, era preciso tornar o acervo legível e a atuação mensurável. Daí viria `
    ));

    const data = document.createElement('button');
    data.className = 'b-data';
    data.type = 'button';
    data.dataset.view = 'data';
    data.textContent = 'DATA';
    data.setAttribute('aria-label','Abrir DATA');
    data.addEventListener('click',() =>
      document.querySelector('.rail__link--data[data-view="data"]')?.click());

    fragment.append(data, document.createTextNode(`.${after}`));
    tail.replaceWith(fragment);

    if (!document.getElementById('arco-data-origin-style')){
      const style = document.createElement('style');
      style.id = 'arco-data-origin-style';
      style.textContent = String.raw`
.b-data{
  display:inline;padding:.1em .36em .14em;margin:0 .02em;border:0;
  font:inherit;font-weight:600;letter-spacing:.008em;text-decoration:none;
  -webkit-box-decoration-break:clone;box-decoration-break:clone;
  background:#0057FF;color:#FCFCFC;cursor:pointer;
  transition:box-shadow var(--fast) var(--ease)
}
.b-data:hover,.b-data:focus-visible{box-shadow:0 0 0 1px var(--ink)}
`;
      document.head.appendChild(style);
    }
  }

  function installProvenanceHover(){
    const homeView = document.querySelector('.view[data-view="home"]');
    const home = homeView?.querySelector(".home");
    const zone = home?.querySelector(".narr-zone");
    const stats = zone ? [...zone.querySelectorAll(".narr__stat")] : [];
    const mq = matchMedia("(max-width:820px)");
    if (!homeView || !home || !zone || stats.length !== 5) return;

    const projects = {
      "5": {tag:"ARCO", cls:"arco"},
      "4": {tag:"ATRIO", cls:"atrio"},
      "3": {tag:"ECHO", cls:"echo"},
      "2": {tag:"DATA", cls:"data"}
    };

    stats.forEach(stat => {
      const button = stat.querySelector(".narr__n");
      if (!button || button.querySelector(".narr__glyph")) return;
      const glyph = document.createElement("span");
      glyph.className = "narr__glyph";
      glyph.textContent = button.textContent.trim();
      button.textContent = "";
      button.appendChild(glyph);
    });

    if (!document.getElementById("arco-provenance-hover-style")){
      const style = document.createElement("style");
      style.id = "arco-provenance-hover-style";
      style.textContent = String.raw`
@media (min-width:821px){
  .view[data-view="home"] .home .narr__tag{display:none!important}
  .view[data-view="home"] .bio__list li:first-child a{
    background:none!important;color:inherit!important;border:2px solid #8A8A8A!important;
    padding:calc(.44em - 1px) calc(.78em - 1px)!important;font-weight:600!important;
    transition:color var(--fast) var(--ease),border-color var(--fast) var(--ease)!important
  }
  .view[data-view="home"] .bio__list li:first-child a:hover,
  .view[data-view="home"] .bio__list li:first-child a:focus-visible{
    background:none!important;color:var(--ink)!important;border-color:#8A8A8A!important
  }
  .view[data-view="home"] .home.hero-commit01-final .narr__n{
    position:relative!important;isolation:isolate!important;overflow:visible!important;
    transition:color 120ms cubic-bezier(.22,.68,0,1)!important
  }
  .view[data-view="home"] .home.hero-commit01-final .narr__n::before{
    content:"";position:absolute;left:50%;top:50%;width:42px;height:42px;
    transform:translate(-50%,-50%);background:transparent;opacity:0;z-index:0;pointer-events:none;
    transition:opacity 120ms cubic-bezier(.22,.68,0,1),background-color 120ms cubic-bezier(.22,.68,0,1)
  }
  .view[data-view="home"] .home.hero-commit01-final .narr__glyph{position:relative;z-index:1}
  .view[data-view="home"] .home.hero-commit01-final .narr__stat.is-provenance-hover .narr__n{background:transparent!important;box-shadow:none!important}
  .view[data-view="home"] .home.hero-commit01-final .narr__stat.is-provenance-hover .narr__n::before{opacity:1}
  .view[data-view="home"] .home.hero-commit01-final .narr__stat[data-step="5"].is-provenance-hover .narr__n::before{background:#181818}
  .view[data-view="home"] .home.hero-commit01-final .narr__stat[data-step="5"].is-provenance-hover .narr__n{color:#FCFCFC!important}
  .view[data-view="home"] .home.hero-commit01-final .narr__stat[data-step="4"].is-provenance-hover .narr__n::before{background:#A63A23}
  .view[data-view="home"] .home.hero-commit01-final .narr__stat[data-step="4"].is-provenance-hover .narr__n{color:#FCFCFC!important}
  .view[data-view="home"] .home.hero-commit01-final .narr__stat[data-step="3"].is-provenance-hover .narr__n::before{background:#FFB627}
  .view[data-view="home"] .home.hero-commit01-final .narr__stat[data-step="3"].is-provenance-hover .narr__n{color:#181818!important}
  .view[data-view="home"] .home.hero-commit01-final .narr__stat[data-step="2"].is-provenance-hover .narr__n::before{background:#0057FF}
  .view[data-view="home"] .home.hero-commit01-final .narr__stat[data-step="2"].is-provenance-hover .narr__n{color:#FCFCFC!important}
  .arco-provenance-tag{
    position:fixed;left:0;top:0;z-index:1000;display:inline-flex;align-items:center;min-height:1.42em;
    padding:.08em .38em .12em;border-radius:0;font-family:var(--f-micro);font-size:.54rem;font-weight:700;
    line-height:1.2;letter-spacing:.085em;text-transform:uppercase;white-space:nowrap;opacity:0;visibility:hidden;
    pointer-events:none;transition:opacity 120ms cubic-bezier(.22,.68,0,1),visibility 0s linear 120ms
  }
  .arco-provenance-tag.is-visible{opacity:1;visibility:visible;transition:opacity 120ms cubic-bezier(.22,.68,0,1)}
  .arco-provenance-tag--arco{background:#181818;color:#FCFCFC}
  .arco-provenance-tag--atrio{background:#A63A23;color:#FCFCFC}
  .arco-provenance-tag--echo{background:#FFB627;color:#181818}
  .arco-provenance-tag--data{background:#0057FF;color:#FCFCFC}
}
@media (max-width:820px){.arco-provenance-tag{display:none!important}}
@media (prefers-reduced-motion:reduce){
  .arco-provenance-tag,.view[data-view="home"] .home.hero-commit01-final .narr__n,
  .view[data-view="home"] .home.hero-commit01-final .narr__n::before{transition:none!important}
}`;
      document.head.appendChild(style);
    }

    const cursorTag = document.createElement("span");
    cursorTag.className = "arco-provenance-tag";
    cursorTag.setAttribute("aria-hidden", "true");
    document.body.appendChild(cursorTag);

    let activeStat = null;
    const clearHover = () => {
      if (activeStat) activeStat.classList.remove("is-provenance-hover");
      activeStat = null;
      cursorTag.className = "arco-provenance-tag";
      cursorTag.textContent = "";
    };

    const bandAt = (clientX, clientY) => {
      const rows = stats.map(stat => {
        const number = stat.querySelector(".narr__n");
        if (!number) return null;
        const statRect = stat.getBoundingClientRect();
        const numberRect = number.getBoundingClientRect();
        return {
          stat,step:stat.dataset.step,center:numberRect.top + numberRect.height / 2,
          left:Math.min(statRect.left, numberRect.left) - 8,right:Math.max(statRect.right, numberRect.right) + 8
        };
      }).filter(Boolean).sort((a,b) => a.center - b.center);

      for (let i = 0; i < rows.length; i++){
        const row = rows[i];
        const previous = rows[i - 1];
        const next = rows[i + 1];
        const top = previous ? (previous.center + row.center) / 2 : row.center - (next ? (next.center - row.center) / 2 : 24);
        const bottom = next ? (row.center + next.center) / 2 : row.center + (previous ? (row.center - previous.center) / 2 : 24);
        if (clientY >= top && clientY < bottom && clientX >= row.left && clientX <= row.right) return row;
      }
      return null;
    };

    const moveTag = event => {
      const gapX = 14,gapY = 12,margin = 8;
      const rect = cursorTag.getBoundingClientRect();
      let x = event.clientX + gapX;
      let y = event.clientY + gapY;
      if (x + rect.width + margin > innerWidth) x = event.clientX - rect.width - gapX;
      if (y + rect.height + margin > innerHeight) y = event.clientY - rect.height - gapY;
      cursorTag.style.left = `${Math.max(margin, x)}px`;
      cursorTag.style.top = `${Math.max(margin, y)}px`;
    };

    const handlePointerMove = event => {
      if (mq.matches || (event.pointerType && event.pointerType !== "mouse") || homeView.dataset.active === "false" || !home.classList.contains("hero-commit01-final")){
        clearHover();
        return;
      }
      const row = bandAt(event.clientX, event.clientY);
      const project = row ? projects[row.step] : null;
      if (!row || !project){clearHover();return;}
      if (activeStat !== row.stat){
        if (activeStat) activeStat.classList.remove("is-provenance-hover");
        activeStat = row.stat;
        activeStat.classList.add("is-provenance-hover");
        cursorTag.textContent = project.tag;
        cursorTag.className = `arco-provenance-tag arco-provenance-tag--${project.cls} is-visible`;
      }
      moveTag(event);
    };

    window.addEventListener("pointermove", handlePointerMove, {passive:true});
    window.addEventListener("scroll", clearHover, {passive:true,capture:true});
    window.addEventListener("resize", clearHover, {passive:true});
    window.addEventListener("blur", clearHover);
    document.addEventListener("pointerout", event => {if (!event.relatedTarget) clearHover();});
    document.addEventListener("visibilitychange", () => {if (document.hidden) clearHover();});
    mq.addEventListener?.("change", clearHover);
    new MutationObserver(() => {if (homeView.dataset.active === "false") clearHover();})
      .observe(homeView,{attributes:true,attributeFilter:["data-active"]});
  }

  function installContactOrbit(){
    const homeView = document.querySelector('.view[data-view="home"]');
    const mark = homeView?.querySelector('.bio__mark');
    const contactList = homeView?.querySelector('.bio__list');
    const rail = document.querySelector('.rail');
    const contentEdge = homeView?.querySelector('.bio__head > div');
    const railCreed = document.querySelector('.rail__creed');
    const legacyMobileCred = document.querySelector('.mobile-cred');
    if (!homeView || !mark || !contactList) return;

    const links = [...contactList.querySelectorAll('a')].slice(0,4);
    if (links.length !== 4) return;

    const mqMobile = matchMedia('(max-width:820px)');
    const mqReduce = matchMedia('(prefers-reduced-motion:reduce)');
    const labels = ['Currículo','LinkedIn','E-mail','WhatsApp'];
    const icons = [
      '<path d="M7 3.5h7l4 4v13H7z"/><path d="M14 3.5v4h4"/><path d="M10 12h5M10 15h5"/>',
      '<rect x="5.5" y="9.5" width="3" height="9"/><path d="M7 6.5v.01"/><path d="M11.5 18.5v-5.1c0-2.8 4-3 4 0v5.1M11.5 10v8.5"/>',
      '<rect x="3.5" y="6" width="17" height="12"/><path d="m4.5 7 7.5 6 7.5-6"/>',
      '<path d="M12 4.2a7.8 7.8 0 0 0-6.7 11.8L4 20l4-1.2A7.8 7.8 0 1 0 12 4.2Z"/><path d="M9.2 8.6c.5 2.6 2 4.1 4.5 4.9"/><path d="m9.1 8.4-.8 1.1M13.8 13.5l1.1-.8"/>'
    ];

    const orbit = document.createElement('aside');
    orbit.className = 'arco-contact-orbit';
    orbit.setAttribute('aria-label','Acesso rápido');

    const brand = document.createElement('button');
    brand.className = 'arco-contact-orbit__brand';
    brand.type = 'button';
    brand.setAttribute('aria-label','ARCO — voltar ao início');
    brand.innerHTML = mark.outerHTML.replace('class="bio__mark"','class="arco-contact-orbit__brandmark"').replace(/ role="img" aria-label="[^"]*"/,' aria-hidden="true" focusable="false"');

    const stack = document.createElement('nav');
    stack.className = 'arco-contact-orbit__links';
    stack.setAttribute('aria-label','Contato');

    links.forEach((source,index) => {
      const a = source.cloneNode(false);
      a.className = 'arco-contact-orbit__link';
      a.textContent = '';
      a.setAttribute('aria-label',labels[index]);
      a.setAttribute('title',labels[index]);
      if (index === 3 && /^tel:/i.test(a.getAttribute('href') || '')){
        a.setAttribute('href','https://wa.me/5541991521304');
        a.setAttribute('target','_blank');
        a.setAttribute('rel','noopener');
      }
      a.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${icons[index]}</svg>`;
      stack.appendChild(a);
    });

    orbit.append(brand,stack);
    document.body.appendChild(orbit);

    if (!document.getElementById('arco-contact-orbit-style')){
      const style = document.createElement('style');
      style.id = 'arco-contact-orbit-style';
      style.textContent = String.raw`
.rail__creed{display:none!important}
.arco-contact-orbit{--orbit-size:42px;--orbit-left:24px;--orbit-top:22px;color:var(--ink,#181818)}
.arco-contact-orbit__brand,.arco-contact-orbit__link{
  box-sizing:border-box;border:0;border-radius:0;color:inherit;background:var(--paper,#FCFCFC);
  display:grid;place-items:center;text-decoration:none;cursor:pointer;-webkit-tap-highlight-color:transparent
}
.arco-contact-orbit__brandmark{display:block;width:100%;height:100%;color:currentColor}
.arco-contact-orbit__link svg{width:47%;height:47%;fill:none;stroke:currentColor;stroke-width:1.55;stroke-linecap:square;stroke-linejoin:miter}
.arco-contact-orbit__link:hover,.arco-contact-orbit__link:focus-visible,.arco-contact-orbit__brand:hover,.arco-contact-orbit__brand:focus-visible{background:var(--ink,#181818);color:var(--paper,#FCFCFC)}
.arco-contact-orbit__link:focus-visible,.arco-contact-orbit__brand:focus-visible{outline:2px solid currentColor;outline-offset:2px}

@media (min-width:821px){
  .arco-contact-orbit{
    position:fixed;z-index:72;left:var(--orbit-left);top:var(--orbit-top);width:var(--orbit-size);
    opacity:0;visibility:hidden;pointer-events:none
  }
  .arco-contact-orbit.is-collected,.arco-contact-orbit.is-external-view{
    opacity:1;visibility:visible;pointer-events:auto
  }
  .arco-contact-orbit__brand{display:none;width:var(--orbit-size);height:var(--orbit-size);padding:0}
  .arco-contact-orbit.is-external-view .arco-contact-orbit__brand{display:grid}
  .arco-contact-orbit__links{
    display:grid;grid-template-columns:1fr;gap:6px;width:var(--orbit-size);
    margin-top:calc(var(--orbit-size) + 8px);
    opacity:0;visibility:hidden;pointer-events:none
  }
  .arco-contact-orbit.is-collected .arco-contact-orbit__links,
  .arco-contact-orbit.is-external-view .arco-contact-orbit__links{
    opacity:1;visibility:visible;pointer-events:auto
  }
  .arco-contact-orbit__link{
    width:var(--orbit-size);height:var(--orbit-size);border:1px solid color-mix(in srgb,var(--ink,#181818) 52%,transparent)
  }
  .view[data-view="home"].arco-contacts-collected .bio__list{opacity:0!important;visibility:hidden!important;pointer-events:none!important}
}

@media (max-width:820px){
  .mobile-cred{display:none!important}
  .arco-contact-orbit{
    position:fixed;z-index:72;left:50%;right:auto;bottom:max(12px,env(safe-area-inset-bottom));top:auto;
    width:auto;display:grid;grid-template-columns:repeat(5,46px);gap:4px;padding:4px;
    background:color-mix(in srgb,var(--paper,#FCFCFC) 94%,transparent);backdrop-filter:blur(12px);
    border:1px solid color-mix(in srgb,var(--ink,#181818) 24%,transparent);
    box-shadow:0 10px 28px rgba(0,0,0,.10);opacity:0;visibility:hidden;pointer-events:none;
    transform:translate(-50%,calc(100% + 18px));
    transition:opacity 150ms cubic-bezier(.22,.68,0,1),transform 170ms cubic-bezier(.22,.68,0,1),visibility 0s linear 170ms
  }
  .arco-contact-orbit.is-mobile-visible,.arco-contact-orbit.is-external-view{
    opacity:1;visibility:visible;pointer-events:auto;transform:translate(-50%,0);transition-delay:0s
  }
  .arco-contact-orbit__brand{width:46px;height:46px;padding:9px}
  .arco-contact-orbit__links{display:contents}
  .arco-contact-orbit__link{width:46px;height:46px;border-left:1px solid color-mix(in srgb,var(--ink,#181818) 20%,transparent)}
  .arco-contact-orbit__link svg{width:45%;height:45%}
}

@media (max-width:360px){
  .arco-contact-orbit{grid-template-columns:repeat(5,43px);gap:2px;padding:3px}
  .arco-contact-orbit__brand,.arco-contact-orbit__link{width:43px;height:43px}
}

@media (prefers-reduced-motion:reduce){
  .arco-contact-orbit{transition:none!important}
}`;
      document.head.appendChild(style);
    }

    railCreed?.setAttribute('aria-hidden','true');
    legacyMobileCred?.setAttribute('aria-hidden','true');

    const initialMarkStyle = mark.getAttribute('style');
    const initialRole = mark.getAttribute('role');
    const initialTabIndex = mark.getAttribute('tabindex');

    const restoreMark = () => {
      if (initialMarkStyle == null) mark.removeAttribute('style');
      else mark.setAttribute('style',initialMarkStyle);
      if (initialRole == null) mark.removeAttribute('role');
      else mark.setAttribute('role',initialRole);
      if (initialTabIndex == null) mark.removeAttribute('tabindex');
      else mark.setAttribute('tabindex',initialTabIndex);
      mark.removeAttribute('aria-label');
    };

    const returnHome = () => {
      const homeTrigger = document.querySelector('.rail__title[data-view="home"]') || document.querySelector('[data-view="home"]');
      if (homeView.dataset.active === 'false') homeTrigger?.click();
      requestAnimationFrame(() => window.scrollTo({top:0,behavior:mqReduce.matches ? 'auto' : 'smooth'}));
    };
    brand.addEventListener('click',returnHome);
    mark.addEventListener('click',() => {
      if (mark.dataset.floating === 'true') returnHome();
    });
    mark.addEventListener('keydown',event => {
      if (mark.dataset.floating !== 'true') return;
      if (event.key === 'Enter' || event.key === ' '){
        event.preventDefault();
        returnHome();
      }
    });

    let raf = 0;
    let floating = false;
    let originTopDoc = null;
    let originLeft = null;
    let originWidth = null;
    let originHeight = null;
    let gutterLeft = null;
    const stickyTop = () => innerWidth <= 1000 ? 18 : Math.max(20,Math.min(28,innerWidth * .02));

    const centeredGutterLeft = () => {
      if (originWidth == null) return originLeft;
      const railRect = rail?.getBoundingClientRect();
      const contentRect = contentEdge?.getBoundingClientRect();
      if (!railRect || !contentRect) return originLeft;
      const start = railRect.right;
      const end = contentRect.left;
      const free = end - start;
      if (free <= originWidth) return originLeft;
      return start + (free - originWidth) / 2;
    };

    const captureOrigin = () => {
      const rect = mark.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      originTopDoc = rect.top + scrollY;
      originLeft = rect.left;
      originWidth = rect.width;
      originHeight = rect.height;
      gutterLeft = centeredGutterLeft();
    };

    const floatMark = top => {
      if (originLeft == null || originWidth == null || originHeight == null) return;
      gutterLeft = centeredGutterLeft();
      const left = gutterLeft ?? originLeft;
      floating = true;
      mark.dataset.floating = 'true';
      mark.setAttribute('role','button');
      mark.setAttribute('tabindex','0');
      mark.setAttribute('aria-label','ARCO — voltar ao início');
      mark.style.setProperty('position','fixed','important');
      mark.style.setProperty('left',`${left}px`,'important');
      mark.style.setProperty('right','auto','important');
      mark.style.setProperty('top',`${top}px`,'important');
      mark.style.setProperty('margin','0','important');
      mark.style.setProperty('width',`${originWidth}px`,'important');
      mark.style.setProperty('height',`${originHeight}px`,'important');
      mark.style.setProperty('z-index','73','important');
      mark.style.setProperty('cursor','pointer','important');
    };

    const unfloatMark = () => {
      floating = false;
      delete mark.dataset.floating;
      restoreMark();
    };

    const sync = () => {
      raf = 0;
      const mobile = mqMobile.matches;
      const homeActive = homeView.dataset.active !== 'false';
      const top = stickyTop();

      if (mobile || !homeActive){
        if (floating) unfloatMark();
        orbit.classList.remove('is-collected','is-mobile-visible');
        orbit.classList.toggle('is-external-view',!homeActive);
        homeView.classList.remove('arco-contacts-collected');

        if (mobile && homeActive){
          const listRect = contactList.getBoundingClientRect();
          orbit.classList.remove('is-external-view');
          orbit.classList.toggle('is-mobile-visible',listRect.bottom <= 8);
        }
        return;
      }

      orbit.classList.remove('is-mobile-visible','is-external-view');

      if (!floating) captureOrigin();
      if (originTopDoc == null || originLeft == null || originWidth == null || originHeight == null) return;

      gutterLeft = centeredGutterLeft();
      const dockLeft = gutterLeft ?? originLeft;
      const shouldFloat = scrollY + top >= originTopDoc;
      if (shouldFloat){
        floatMark(top);
      }else if (floating){
        unfloatMark();
        captureOrigin();
      }

      const size = originWidth;
      orbit.style.setProperty('--orbit-left',`${dockLeft}px`);
      orbit.style.setProperty('--orbit-size',`${size}px`);
      orbit.style.setProperty('--orbit-top',`${top}px`);

      const listRect = contactList.getBoundingClientRect();
      const collected = shouldFloat && listRect.top <= top + originHeight + 12;
      orbit.classList.toggle('is-collected',collected);
      homeView.classList.toggle('arco-contacts-collected',collected);
    };

    const requestSync = () => {
      if (raf) return;
      raf = requestAnimationFrame(sync);
    };

    window.addEventListener('scroll',requestSync,{passive:true});
    window.addEventListener('resize',() => {
      if (floating) unfloatMark();
      originTopDoc = originLeft = originWidth = originHeight = gutterLeft = null;
      requestSync();
    },{passive:true});
    window.addEventListener('orientationchange',requestSync,{passive:true});
    mqMobile.addEventListener?.('change',() => {
      if (floating) unfloatMark();
      originTopDoc = originLeft = originWidth = originHeight = gutterLeft = null;
      requestSync();
    });
    new MutationObserver(requestSync).observe(homeView,{attributes:true,attributeFilter:['data-active']});
    sync();
  }
})();