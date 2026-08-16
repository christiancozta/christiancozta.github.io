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
  const legalTechTrigger = document.getElementById("legal-tech-trigger");
  const legalTechNote = document.getElementById("legal-tech-note");
  const legalTechClose = document.getElementById("legal-tech-close");
  const brandTriggers = [...document.querySelectorAll(".brand-trigger")];
  const brandNote = document.getElementById("brand-note");
  const brandClose = document.getElementById("brand-note-close");
  const brandPiece = document.getElementById("brand-note-piece");
  const brandTitle = document.getElementById("brand-note-title");
  const brandMeaning = document.getElementById("brand-note-meaning");
  const brandRationale = document.getElementById("brand-note-rationale");
  const brandRelation = document.getElementById("brand-note-relation");

  const brandCopy = {
    atrio: {
      title:"ATRIO",
      piece:"Rei · estrutura-mãe",
      meaning:"Pórtico, entrada governada, unidade e regência.",
      rationale:"A forma reúne acessos sob uma estrutura comum e torna visível o princípio de regência.",
      relation:"O Rei representa especialização sob regência comum, nunca hierarquia de importância: unidade por gramática; distinção por movimento."
    },
    corpus: {
      title:"CORPUS",
      piece:"Torre · memória documental",
      meaning:"Estratos, classificação, preservação e lastro.",
      rationale:"A forma organiza camadas e sustenta uma base estável, legível e preservável.",
      relation:"A Torre traduz a função de classificar, conservar e recuperar a memória documental que dá lastro ao sistema."
    },
    ratio: {
      title:"RATIO",
      piece:"Cavalo · formulação faseada",
      meaning:"Percurso, direção, inflexão e desvio controlado.",
      rationale:"O movimento não avança em linha automática: muda de direção segundo escolhas verificáveis.",
      relation:"O Cavalo traduz a formulação em fases, com inflexões controladas e validação humana ao longo do percurso."
    },
    cerne: {
      title:"CERNE",
      piece:"Rainha · núcleo crítico",
      meaning:"Escrutínio, confronto, tensão produtiva e retorno ao fundamento.",
      rationale:"A forma concentra força no núcleo e amplia o campo de confronto sem perder o ponto de origem.",
      relation:"A Rainha traduz a amplitude do escrutínio e o retorno ao fundamento quando a formulação precisa ser tensionada."
    },
    lux: {
      title:"LUX",
      piece:"Bispo · refinamento formal",
      meaning:"Diagonalidade, projeção, depuração, legibilidade e acabamento.",
      rationale:"A diagonal projeta e depura, conduzindo o olhar sem romper o lastro da forma anterior.",
      relation:"O Bispo traduz o refinamento que melhora legibilidade e acabamento sem atravessar a fronteira do mérito."
    }
  };

  // Espelha --grid-row do CSS: a unidade vertical do tabuleiro.
  const UNIT = 84;

  let raf = 0;
  let visible = true;
  let cell = 0;
  let w = 0;
  let h = 0;
  let horizon = 0;
  let lastBrandTrigger = null;

  function installScrollAppearance(){
    if(document.getElementById("atrio-scroll-appearance")) return;
    const style = document.createElement("style");
    style.id = "atrio-scroll-appearance";
    style.textContent = `
      html {
        scroll-behavior: auto !important;
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
        box-shadow: 0 0 0 1px rgba(255,255,255,.24);
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

  function setLegalTechOpen(open,{restoreFocus=true}={}){
    if(!legalTechTrigger || !legalTechNote) return;
    legalTechNote.hidden = !open;
    legalTechTrigger.setAttribute("aria-expanded",String(open));
    if(open){
      legalTechNote.scrollTop = 0;
      requestAnimationFrame(() => legalTechClose?.focus({preventScroll:true}));
    }else if(restoreFocus){
      legalTechTrigger.focus({preventScroll:true});
    }
  }

  legalTechTrigger?.addEventListener("click",() => {
    const open = legalTechTrigger.getAttribute("aria-expanded") !== "true";
    if(open) setBrandOpen(false,{restoreFocus:false});
    setLegalTechOpen(open,{restoreFocus:false});
  });
  legalTechClose?.addEventListener("click",() => setLegalTechOpen(false));

  function setBrandOpen(open,{trigger=lastBrandTrigger,restoreFocus=true}={}){
    if(!brandNote) return;
    brandTriggers.forEach(item => item.setAttribute("aria-expanded","false"));
    brandNote.hidden = !open;
    if(open && trigger){
      const copy = brandCopy[trigger.dataset.brand];
      if(!copy) return;
      lastBrandTrigger = trigger;
      trigger.setAttribute("aria-expanded","true");
      brandPiece.textContent = copy.piece;
      brandTitle.textContent = copy.title;
      brandMeaning.textContent = copy.meaning;
      brandRationale.textContent = copy.rationale;
      brandRelation.textContent = copy.relation;
      brandNote.scrollTop = 0;
      requestAnimationFrame(() => brandClose?.focus({preventScroll:true}));
    }else if(restoreFocus && lastBrandTrigger){
      lastBrandTrigger.focus({preventScroll:true});
    }
  }

  brandTriggers.forEach(trigger => trigger.addEventListener("click",() => {
    const open = trigger.getAttribute("aria-expanded") !== "true";
    if(open) setLegalTechOpen(false,{restoreFocus:false});
    setBrandOpen(open,{trigger,restoreFocus:false});
  }));
  brandClose?.addEventListener("click",() => setBrandOpen(false));

  document.addEventListener("keydown",event => {
    if(event.key !== "Escape") return;
    if(!brandNote?.hidden){
      event.preventDefault();
      setBrandOpen(false);
      return;
    }
    if(legalTechNote?.hidden) return;
    event.preventDefault();
    setLegalTechOpen(false);
  });

  function post(section){
    if(window.parent === window || location.protocol === "file:") return;
    window.parent.postMessage({type:"ATRIO_SECTION",section},location.origin);
  }

  window.addEventListener("message", event => {
    if(event.source !== window.parent || event.origin !== location.origin) return;
    const data = event.data;
    if(!data || data.type !== "ATRIO_NAVIGATE" || !allowed.has(data.section)) return;
    document.getElementById(data.section)?.scrollIntoView({behavior:"auto",block:"start"});
  });

  const heroObserver = new IntersectionObserver(([entry]) => {visible=Boolean(entry?.isIntersecting);syncAnimation()},{threshold:.01});
  heroObserver.observe(hero);

  const sectionObserver = new IntersectionObserver(entries => {
    const current = entries.filter(entry => entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(current) post(current.target.id);
  },{threshold:[.2,.4,.6],rootMargin:"-12% 0px -52% 0px"});
  sections.forEach(section => sectionObserver.observe(section));

  const revealItems = [...document.querySelectorAll(".architecture-frontispiece,.system-band,.metric-row,.authorship-row,.responsibility-row,.relations-row,.final-row")];
  if(!reduceMotion.matches && "IntersectionObserver" in window){
    root.classList.add("motion-ready");
    revealItems.forEach(item => item.classList.add("reveal-item"));
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },{threshold:.08,rootMargin:"0px 0px -8% 0px"});
    revealItems.forEach(item => revealObserver.observe(item));
  }

  const ro = new ResizeObserver(measure);
  ro.observe(document.documentElement);
  reduceMotion.addEventListener?.("change",syncAnimation);
  document.fonts?.ready.then(measure);
  window.addEventListener("load",measure);
  installScrollAppearance();
  measure();
  syncAnimation();
})();
