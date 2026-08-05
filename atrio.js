(() => {
  "use strict";
  const root = document.documentElement;
  const hero = document.getElementById("hero");
  const runway = document.querySelector(".runway");
  const light = runway?.querySelector(".runway__light");
  const dark = runway?.querySelector(".runway__dark");
  const rim = runway?.querySelector(".runway__rim");
  const sections = [...document.querySelectorAll("[data-section]")];
  const allowed = new Set(sections.map(section => section.id));
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

  // Espelha --grid-row do CSS: a unidade vertical do tabuleiro.
  const UNIT = 84;
  // Uma macrofileira do board: deslocamento perceptível sem tornar a página lenta.
  const SCROLL_STEP = UNIT * 2;
  const SCROLL_SETTLE_DELAY = 95;
  const SCROLL_DURATION = 180;

  let raf = 0;
  let scrollRaf = 0;
  let scrollTimer = 0;
  let visible = true;
  let cell = 0;
  let w = 0;
  let h = 0;
  let horizon = 0;

  function installScrollAppearance(){
    if(document.getElementById("atrio-scroll-appearance")) return;
    const style = document.createElement("style");
    style.id = "atrio-scroll-appearance";
    style.textContent = `
      html {
        scrollbar-width: thin !important;
        scrollbar-color: #181818 transparent !important;
      }

      html::-webkit-scrollbar,
      body::-webkit-scrollbar {
        display: block !important;
        width: 6px;
        height: 6px;
      }

      html::-webkit-scrollbar-track,
      body::-webkit-scrollbar-track {
        background: transparent;
      }

      html::-webkit-scrollbar-thumb,
      body::-webkit-scrollbar-thumb {
        background: #181818;
        border: 0;
        border-radius: 0;
        box-shadow: inset 0 0 0 1px rgba(255,255,255,.14);
      }

      html::-webkit-scrollbar-corner,
      body::-webkit-scrollbar-corner {
        background: transparent;
      }
    `;
    document.head.appendChild(style);
  }

  function measure(){
    const width = document.documentElement.clientWidth;
    const runwayCell = width / 8;
    cell = width <= 760 ? width / 4 : runwayCell;
    // No desktop, a mesma medida governa a base da esteira e as oito macrocolunas pós-Hero.
    root.style.setProperty("--runway-cell", `${runwayCell}px`);
    root.style.setProperty("--cell", `${cell}px`);
    const rect = runway.getBoundingClientRect();
    w = Math.max(1, Math.round(rect.width));
    h = Math.max(1, Math.round(rect.height));
    // O horizonte cai sobre uma linha estrutural: a profundidade aparente da
    // esteira é sempre um múltiplo inteiro da unidade de 84 px. Como a base da
    // esteira coincide com a borda inferior do Hero, as oito colunas da
    // perspectiva encontram as oito macrocolunas do documento sem folga.
    const depth = Math.max(UNIT * 3, Math.round((h * .39) / UNIT) * UNIT);
    horizon = Math.max(UNIT, h - depth);
    root.style.setProperty("--horizon", `${horizon}px`);
    runway.setAttribute("viewBox", `0 0 ${w} ${h}`);
    draw(0);
  }

  function draw(phase){
    if(!w || !h) return;
    const base = h - horizon;
    const cx = w / 2;
    const unit = w / 8;
    const d0 = 2.2;
    const max = 1.82;
    const count = 96;
    const rho = n => d0 / (d0 + n - phase);
    const x = (i,r) => (cx + (i - 4) * unit * r).toFixed(3);
    const y = r => (horizon + base * r).toFixed(3);
    light.setAttribute(
      "d",
      `M${cx.toFixed(3)},${horizon.toFixed(3)}` +
      `L${x(8,max)},${y(max)}` +
      `L${x(0,max)},${y(max)}Z`
    );
    const cells = [];
    for(let row=0;row<count;row+=1){
      const rFar = rho(row+1);
      if(rFar > max) continue;
      const rNear = Math.min(rho(row),max);
      for(let col=row%2;col<8;col+=2){
        cells.push(`M${x(col,rNear)},${y(rNear)}L${x(col+1,rNear)},${y(rNear)}L${x(col+1,rFar)},${y(rFar)}L${x(col,rFar)},${y(rFar)}Z`);
      }
    }
    dark.setAttribute("d",cells.join(""));
    rim?.setAttribute("d", "");
  }

  function tick(time){
    draw((time / 14000) % 1);
    raf = requestAnimationFrame(tick);
  }

  function syncAnimation(){
    const run = visible && !reduceMotion.matches;
    if(run && !raf) raf = requestAnimationFrame(tick);
    if(!run && raf){cancelAnimationFrame(raf);raf=0;draw(0)}
  }

  function easeOutCubic(t){
    return 1 - Math.pow(1 - t, 3);
  }

  function cancelScrollSettle(){
    if(scrollTimer){
      clearTimeout(scrollTimer);
      scrollTimer = 0;
    }
    if(scrollRaf){
      cancelAnimationFrame(scrollRaf);
      scrollRaf = 0;
    }
  }

  function animateScrollTo(targetY){
    const startY = window.scrollY;
    const distance = targetY - startY;
    if(Math.abs(distance) < 2) return;

    const startTime = performance.now();
    if(scrollRaf) cancelAnimationFrame(scrollRaf);

    function frame(time){
      const progress = Math.min((time - startTime) / SCROLL_DURATION, 1);
      window.scrollTo(0, startY + distance * easeOutCubic(progress));
      if(progress < 1){
        scrollRaf = requestAnimationFrame(frame);
      }else{
        scrollRaf = 0;
      }
    }

    scrollRaf = requestAnimationFrame(frame);
  }

  function nearestScrollBlock(){
    const current = window.scrollY;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const heroEnd = hero?.offsetHeight || window.innerHeight;

    if(current < heroEnd * .5) return 0;
    if(current < heroEnd) return Math.min(heroEnd, maxScroll);

    const gridPosition = current - heroEnd;
    const snapped = heroEnd + Math.round(gridPosition / SCROLL_STEP) * SCROLL_STEP;
    return Math.max(0, Math.min(snapped, maxScroll));
  }

  function scheduleScrollSettle(event){
    if(reduceMotion.matches || event.ctrlKey || Math.abs(event.deltaY) < 1) return;
    cancelScrollSettle();
    scrollTimer = window.setTimeout(() => {
      scrollTimer = 0;
      animateScrollTo(nearestScrollBlock());
    }, SCROLL_SETTLE_DELAY);
  }

  function post(section){
    if(window.parent === window || location.protocol === "file:") return;
    window.parent.postMessage({type:"ATRIO_SECTION",section},location.origin);
  }

  window.addEventListener("message", event => {
    if(event.source !== window.parent || event.origin !== location.origin) return;
    const data = event.data;
    if(!data || data.type !== "ATRIO_NAVIGATE" || !allowed.has(data.section)) return;
    cancelScrollSettle();
    document.getElementById(data.section)?.scrollIntoView({behavior:reduceMotion.matches?"auto":"smooth",block:"start"});
  });

  const heroObserver = new IntersectionObserver(([entry]) => {visible=Boolean(entry?.isIntersecting);syncAnimation()},{threshold:.01});
  heroObserver.observe(hero);

  const sectionObserver = new IntersectionObserver(entries => {
    const current = entries.filter(entry => entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(current) post(current.target.id);
  },{threshold:[.2,.4,.6],rootMargin:"-12% 0px -52% 0px"});
  sections.forEach(section => sectionObserver.observe(section));

  const ro = new ResizeObserver(measure);
  ro.observe(document.documentElement);
  reduceMotion.addEventListener?.("change",() => {
    cancelScrollSettle();
    syncAnimation();
  });
  window.addEventListener("wheel",scheduleScrollSettle,{passive:true});
  window.addEventListener("pointerdown",cancelScrollSettle,{passive:true});
  document.fonts?.ready.then(measure);
  window.addEventListener("load",measure);
  installScrollAppearance();
  measure();
  syncAnimation();
})();
