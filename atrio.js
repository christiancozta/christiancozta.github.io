(() => {
  "use strict";
  const root = document.documentElement;
  const hero = document.getElementById("hero");
  const runway = document.querySelector(".runway");
  const light = runway?.querySelector(".runway__light");
  const dark = runway?.querySelector(".runway__dark");
  const origin = runway?.querySelector(".runway__origin");
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
  const brandField = document.getElementById("brand-field");
  const brandPieces = [...document.querySelectorAll("[data-brand-piece]")];
  const brandOverview = document.getElementById("brand-card-overview");
  const brandDetail = document.getElementById("brand-card-detail");
  const brandBack = document.getElementById("brand-card-back");

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
  let brandMove = null;
  let brandMoveToken = 0;

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
    drawStaticRunway();
    draw(0);
  }

  function drawStaticRunway(){
    const base = h - horizon;
    const cx = w / 2;
    const unit = w / 8;
    const max = 1.82;
    const x = (i,r) => (cx + (i - 4) * unit * r).toFixed(3);
    const y = r => (horizon + base * r).toFixed(3);
    light.setAttribute(
      "d",
      `M${cx.toFixed(3)},${horizon.toFixed(3)}` +
      `L${x(8,max)},${y(max)}` +
      `L${x(0,max)},${y(max)}Z`
    );

    /* origem da esteira: um único triângulo preto, pequeno e estável. */
    const originDepth = Math.min(10, base * .04);
    const originHalf = (w / 2) * (originDepth / base);
    origin?.setAttribute(
      "d",
      `M${cx.toFixed(3)},${horizon.toFixed(3)}` +
      `L${(cx + originHalf).toFixed(3)},${(horizon + originDepth).toFixed(3)}` +
      `L${(cx - originHalf).toFixed(3)},${(horizon + originDepth).toFixed(3)}Z`
    );
    rim?.setAttribute("d", "");
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
    const cells = [];
    const xNear = new Array(9);
    const xFar = new Array(9);
    for(let row=0;row<count;row+=1){
      const rFar = rho(row+1);
      if(rFar > max) continue;
      const rNear = Math.min(rho(row),max);
      const yNear = y(rNear);
      const yFar = y(rFar);
      for(let i=0;i<9;i+=1){
        xNear[i] = x(i,rNear);
        xFar[i] = x(i,rFar);
      }
      for(let col=row%2;col<8;col+=2){
        cells.push(`M${xNear[col]},${yNear}L${xNear[col+1]},${yNear}L${xFar[col+1]},${yFar}L${xFar[col]},${yFar}Z`);
      }
    }
    dark.setAttribute("d",cells.join(""));
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

  function resetBrandExperience(){
    brandMoveToken += 1;
    brandMove?.cancel();
    brandMove = null;
    brandNote.dataset.phase = "overview";
    delete brandNote.dataset.active;
    brandPieces.forEach(piece => piece.setAttribute("aria-pressed","false"));
    brandOverview.hidden = false;
    brandDetail.hidden = true;
    brandBack.hidden = true;
    brandPiece.hidden = true;
    brandTitle.textContent = "Unidade por gramática. Distinção por movimento.";
  }

  function revealBrand(key){
    const copy = brandCopy[key];
    if(!copy) return;
    brandPiece.hidden = false;
    brandPiece.textContent = copy.piece;
    brandTitle.textContent = copy.title;
    brandMeaning.textContent = copy.meaning;
    brandRationale.textContent = copy.rationale;
    brandRelation.textContent = copy.relation;
    brandOverview.hidden = true;
    brandDetail.hidden = false;
    brandBack.hidden = false;
    brandNote.dataset.phase = "detail";
  }

  function brandRoute(key,dx,dy){
    const routes = {
      atrio:[[0,0],[0,-dy]],                 // Rei: uma casa em direção ao campo comum.
      corpus:[[0,0],[0,dy*2]],              // Duas casas à frente.
      ratio:[[0,0],[0,dy*2],[dx,dy*2]],     // Cavalo: inflexão em L.
      cerne:[[0,0],[-dx*2,0]],              // Rainha: horizontal, o eixo ainda não usado.
      lux:[[0,0],[-dx*2,dy*2]]              // Bispo: diagonal.
    };
    return routes[key] || [[0,0]];
  }

  async function moveBrandPiece(piece){
    if(!brandField || !piece) return;
    const key = piece.dataset.brandPiece;
    if(!brandCopy[key]) return;

    const previous = brandPieces.find(item => item.getAttribute("aria-pressed") === "true");
    const previousTransform = previous ? getComputedStyle(previous).transform : "none";
    const token = ++brandMoveToken;
    brandMove?.cancel();
    if(previous && previous !== piece && previousTransform !== "none" && !reduceMotion.matches){
      previous.animate(
        [{transform:previousTransform},{transform:"translate3d(0,0,0)"}],
        {duration:380,easing:"cubic-bezier(.22,.68,0,1)"}
      );
    }
    brandPieces.forEach(item => item.setAttribute("aria-pressed",String(item === piece)));
    brandNote.dataset.active = key;
    brandNote.dataset.phase = "moving";

    const fieldBox = brandField.getBoundingClientRect();
    const dx = Math.min(fieldBox.width / 5,132);
    const dy = Math.min(fieldBox.height / 4,118);
    const route = brandRoute(key,dx,dy);
    const ratioOffsets = [0,.64,1];
    const frames = route.map(([x,y],index) => ({
      offset:key === "ratio" ? ratioOffsets[index] : (route.length === 1 ? 1 : index / (route.length - 1)),
      transform:`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`
    }));

    if(reduceMotion.matches || typeof piece.animate !== "function"){
      revealBrand(key);
      return;
    }

    brandMove = piece.animate(frames,{
      duration:key === "ratio" ? 1080 : 900,
      easing:key === "ratio" ? "cubic-bezier(.44,.02,.56,.98)" : "cubic-bezier(.22,.78,.08,1)",
      fill:"forwards"
    });

    try{await brandMove.finished}catch(_error){return}
    if(token !== brandMoveToken || brandNote.hidden) return;
    revealBrand(key);
  }

  function setBrandOpen(open,{trigger=lastBrandTrigger,restoreFocus=true}={}){
    if(!brandNote) return;
    brandTriggers.forEach(item => item.setAttribute("aria-expanded","false"));
    if(open && trigger){
      lastBrandTrigger = trigger;
      trigger.setAttribute("aria-expanded","true");
      brandNote.hidden = false;
      document.body.classList.add("brand-dialog-open");
      resetBrandExperience();
      brandNote.scrollTop = 0;
      requestAnimationFrame(() => brandNote.focus({preventScroll:true}));
      return;
    }

    brandNote.hidden = true;
    document.body.classList.remove("brand-dialog-open");
    resetBrandExperience();
    if(restoreFocus && lastBrandTrigger) lastBrandTrigger.focus({preventScroll:true});
  }

  brandTriggers.forEach(trigger => trigger.addEventListener("click",() => {
    const open = trigger.getAttribute("aria-expanded") !== "true";
    if(open) setLegalTechOpen(false,{restoreFocus:false});
    setBrandOpen(open,{trigger,restoreFocus:false});
  }));
  brandPieces.forEach(piece => piece.addEventListener("click",() => moveBrandPiece(piece)));
  brandBack?.addEventListener("click",() => {
    resetBrandExperience();
    requestAnimationFrame(() => brandPieces[0]?.focus({preventScroll:true}));
  });
  brandClose?.addEventListener("click",() => setBrandOpen(false));

  document.addEventListener("keydown",event => {
    if(event.key === "Tab" && brandNote && !brandNote.hidden){
      const controls = [...brandNote.querySelectorAll("button:not([disabled])")]
        .filter(control => !control.hidden);
      const first = controls[0];
      const last = controls.at(-1);
      if(!first || !last) return;
      if(!brandNote.contains(document.activeElement) || document.activeElement === brandNote){
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }else if(event.shiftKey && document.activeElement === first){
        event.preventDefault();
        last.focus();
      }else if(!event.shiftKey && document.activeElement === last){
        event.preventDefault();
        first.focus();
      }
      return;
    }
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
