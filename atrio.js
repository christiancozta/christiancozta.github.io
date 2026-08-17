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
  const brandImage = document.getElementById("brand-note-image");
  const sampleTriggers = [...document.querySelectorAll("[data-sample]")];
  const sampleNote = document.getElementById("sample-note");
  const sampleClose = document.getElementById("sample-note-close");
  const sampleTitle = document.getElementById("sample-note-title");
  const sampleContent = document.getElementById("sample-note-content");
  const moduleSystem = document.getElementById("architecture-system");
  const moduleField = document.getElementById("module-piece-column");
  const moduleCardStage = document.querySelector(".module-card-stage");
  const moduleVision = document.getElementById("module-stream-vision");
  const modulePieces = [...document.querySelectorAll("[data-module-piece]")];
  const moduleCards = [...document.querySelectorAll("[data-module-card]")];
  const moduleCardByKey = new Map(moduleCards.map(card => [card.dataset.moduleCard,card]));
  const moduleOverviewCard = moduleCardByKey.get("overview");
  const moduleAtrioCard = moduleCardByKey.get("atrio");
  const moduleStreamCards = moduleCards.filter(card => !["overview","atrio"].includes(card.dataset.moduleCard));
  const moduleBacks = [...document.querySelectorAll(".module-card__back")];

  const brandCopy = {
    atrio: {
      asset:"assets/atrio/brand/atrio-rei.svg",
      title:"ATRIO",
      piece:"Rei · estrutura-mãe",
      meaning:"Pórtico, entrada governada, unidade e regência.",
      rationale:"A forma reúne acessos sob uma estrutura comum e torna visível o princípio de regência.",
      relation:"O Rei representa especialização sob regência comum, nunca hierarquia de importância: unidade por gramática; distinção por movimento."
    },
    corpus: {
      asset:"assets/atrio/brand/corpus-torre.svg",
      title:"CORPUS",
      piece:"Torre · memória documental",
      meaning:"Estratos, classificação, preservação e lastro.",
      rationale:"A forma organiza camadas e sustenta uma base estável, legível e preservável.",
      relation:"A Torre traduz a função de classificar, conservar e recuperar a memória documental que dá lastro ao sistema."
    },
    ratio: {
      asset:"assets/atrio/brand/ratio-cavalo.svg",
      title:"RATIO",
      piece:"Cavalo · formulação faseada",
      meaning:"Percurso, direção, inflexão e desvio controlado.",
      rationale:"O movimento não avança em linha automática: muda de direção segundo escolhas verificáveis.",
      relation:"O Cavalo traduz a formulação em fases, com inflexões controladas e validação humana ao longo do percurso."
    },
    cerne: {
      asset:"assets/atrio/brand/cerne-rainha.svg",
      title:"CERNE",
      piece:"Rainha · núcleo crítico",
      meaning:"Escrutínio, confronto, tensão produtiva e retorno ao fundamento.",
      rationale:"A forma concentra força no núcleo e amplia o campo de confronto sem perder o ponto de origem.",
      relation:"A Rainha traduz a amplitude do escrutínio e o retorno ao fundamento quando a formulação precisa ser tensionada."
    },
    lux: {
      asset:"assets/atrio/brand/lux-bispo.svg",
      title:"LUX",
      piece:"Bispo · refinamento formal",
      meaning:"Diagonalidade, projeção, depuração, legibilidade e acabamento.",
      rationale:"A diagonal projeta e depura, conduzindo o olhar sem romper o lastro da forma anterior.",
      relation:"O Bispo traduz o refinamento que melhora legibilidade e acabamento sem atravessar a fronteira do mérito."
    }
  };

  const sampleCopy = {
    corpus:{title:"CORPUS",template:"sample-template-corpus"},
    cerne:{title:"CERNE",template:"sample-template-cerne"}
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
  let lastSampleTrigger = null;
  let moduleMove = null;
  let moduleMoveToken = 0;

  function installScrollAppearance(){
    // No Arco, o hospedeiro já desenha o único indicador de progresso.
    if(window.parent !== window) return;
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
    moduleField?.setAttribute("aria-orientation",width <= 760 ? "horizontal" : "vertical");
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

  function setModuleView(view){
    if(!moduleSystem || !moduleCardStage) return;
    moduleSystem.dataset.streamView = view;
    moduleCardStage.dataset.streamView = view;
    moduleOverviewCard.hidden = view !== "overview";
    moduleAtrioCard.hidden = view !== "atrio";
    moduleStreamCards.forEach(card => {
      card.hidden = view !== "stream" || card.dataset.revealed !== "true";
    });
    moduleVision.hidden = view !== "stream";
    moduleSystem.dataset.modulePhase = view === "stream" ? "stream" : "vision";
  }

  function revealStreamModule(key){
    const card = moduleCardByKey.get(key);
    if(!card || !moduleStreamCards.includes(card)) return null;
    card.dataset.revealed = "true";
    setModuleView("stream");
    card.hidden = false;
    card.classList.remove("is-revealed");
    requestAnimationFrame(() => card.classList.add("is-revealed"));
    return card;
  }

  function resetAtrioPiece(){
    const atrioPiece = modulePieces.find(piece => piece.dataset.modulePiece === "atrio");
    if(!atrioPiece) return;
    atrioPiece.getAnimations?.().forEach(animation => animation.cancel());
    atrioPiece.style.removeProperty("transform");
    atrioPiece.removeAttribute("data-docked");
    atrioPiece.removeAttribute("data-moving");
    atrioPiece.setAttribute("aria-expanded","false");
  }

  function showVision({focus=false}={}){
    moduleMoveToken += 1;
    moduleMove?.cancel();
    moduleMove = null;
    resetAtrioPiece();
    setModuleView("overview");
    if(focus) requestAnimationFrame(() => modulePieces[0]?.focus({preventScroll:true}));
  }

  function resetModuleSystem(){
    moduleMoveToken += 1;
    moduleMove?.cancel();
    moduleMove = null;
    modulePieces.forEach(piece => {
      piece.getAnimations?.().forEach(animation => animation.cancel());
      piece.style.removeProperty("transform");
      piece.removeAttribute("data-docked");
      piece.removeAttribute("data-moving");
      piece.setAttribute("aria-expanded","false");
    });
    moduleStreamCards.forEach(card => {
      card.hidden = true;
      card.removeAttribute("data-revealed");
      card.classList.remove("is-revealed");
    });
    setModuleView("overview");
  }

  function moduleRoute(key,dx,dy){
    const routes = {
      atrio:[[0,0],[dx,0]],                  // Rei: uma casa em direção ao campo comum.
      corpus:[[0,0],[dx*2,0]],               // Torre: duas casas à frente.
      ratio:[[0,0],[0,dy*2],[dx,dy*2]],      // Cavalo: inflexão em L.
      cerne:[[0,0],[dx*2.35,0]],             // Rainha: avanço horizontal amplo.
      lux:[[0,0],[dx*1.8,-dy*1.8]]           // Bispo: diagonal ascendente.
    };
    return routes[key] || [[0,0]];
  }

  function moduleLanding(piece,key){
    const target = moduleCardByKey.get(key);
    if(!moduleField || !moduleCardStage || !piece || !target || target.hidden) return null;
    const fieldBox = moduleField.getBoundingClientRect();
    const stageBox = moduleCardStage.getBoundingClientRect();
    const targetBox = target.getBoundingClientRect();
    const headerBox = target.querySelector(".module-card__header")?.getBoundingClientRect() || targetBox;
    const flowBox = target.querySelector(".module-card__flow")?.getBoundingClientRect();
    const pieceWidth = piece.offsetWidth;
    const pieceHeight = piece.offsetHeight;
    const restingRight = fieldBox.left + piece.offsetLeft + pieceWidth;
    const restingTop = fieldBox.top + piece.offsetTop;
    const restingBottom = restingTop + pieceHeight;
    const horizontalRail = matchMedia("(max-width:760px)").matches;
    const x = horizontalRail ? 0 : stageBox.left - restingRight + pieceWidth * .025;
    const y = horizontalRail
      ? targetBox.top - restingBottom + pieceHeight * .025
      : flowBox ? flowBox.top - restingTop : headerBox.top + headerBox.height / 2 - restingTop - pieceHeight / 2;
    return {x,y,transform:`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`};
  }

  function syncDockedPieces(){
    if(!moduleSystem || !moduleCardStage) return;
    const view = moduleCardStage.dataset.streamView;
    modulePieces.forEach(piece => {
      if(piece.dataset.docked !== "true" || piece.dataset.moving === "true") return;
      const key = piece.dataset.modulePiece;
      if((view === "stream" && key === "atrio") || (view === "atrio" && key !== "atrio") || view === "overview") return;
      const landing = moduleLanding(piece,key);
      if(landing) piece.style.transform = landing.transform;
    });
  }

  function settleModuleLayout(){
    return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }

  function restoreModulePhase(){
    if(!moduleSystem || !moduleCardStage) return;
    moduleSystem.dataset.modulePhase = moduleCardStage.dataset.streamView === "stream" ? "stream" : "vision";
  }

  async function moveModulePiece(piece){
    if(!moduleField || !moduleSystem || !piece) return;
    const key = piece.dataset.modulePiece;
    if(!brandCopy[key]) return;

    if(piece.dataset.docked === "true"){
      if(key === "atrio"){
        setModuleView("atrio");
      }else{
        resetAtrioPiece();
        setModuleView("stream");
      }
      await settleModuleLayout();
      syncDockedPieces();
      moduleCardByKey.get(key)?.scrollIntoView({behavior:reduceMotion.matches ? "auto" : "smooth",block:"start"});
      return;
    }

    const token = ++moduleMoveToken;
    moduleMove?.cancel();
    modulePieces.forEach(item => item.removeAttribute("data-moving"));
    piece.getAnimations?.().forEach(animation => animation.cancel());
    piece.style.removeProperty("transform");
    piece.dataset.moving = "true";
    piece.setAttribute("aria-expanded","true");
    moduleSystem.dataset.modulePhase = "moving";

    const fieldBox = moduleField.getBoundingClientRect();
    const dx = Math.min(fieldBox.width / 5,82);
    const dy = Math.min(fieldBox.height / 12,76);
    const route = moduleRoute(key,dx,dy);
    const ratioOffsets = [0,.64,1];
    const frames = route.map(([x,y],index) => ({
      offset:key === "ratio" ? ratioOffsets[index] : (route.length === 1 ? 1 : index / (route.length - 1)),
      transform:`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`
    }));

    let outward = null;
    if(!reduceMotion.matches && typeof piece.animate === "function"){
      outward = piece.animate(frames,{
        duration:key === "ratio" ? 980 : 820,
        easing:key === "ratio" ? "cubic-bezier(.44,.02,.56,.98)" : "cubic-bezier(.22,.78,.08,1)",
        fill:"forwards"
      });
      moduleMove = outward;
      try{await outward.finished}catch(_error){piece.removeAttribute("data-moving");restoreModulePhase();return}
      if(token !== moduleMoveToken) return;
    }

    if(key === "atrio"){
      setModuleView("atrio");
    }else{
      resetAtrioPiece();
      revealStreamModule(key);
    }
    await settleModuleLayout();
    if(token !== moduleMoveToken) return;
    const landing = moduleLanding(piece,key);
    if(!landing){piece.removeAttribute("data-moving");restoreModulePhase();return}

    const [endX,endY] = route.at(-1);
    if(reduceMotion.matches || typeof piece.animate !== "function"){
      piece.style.transform = landing.transform;
    }else{
      const docking = piece.animate(
        [{transform:`translate3d(${endX.toFixed(2)}px,${endY.toFixed(2)}px,0)`},{transform:landing.transform}],
        {duration:360,easing:"cubic-bezier(.16,1,.3,1)",fill:"forwards"}
      );
      moduleMove = docking;
      try{await docking.finished}catch(_error){outward?.cancel();piece.removeAttribute("data-moving");restoreModulePhase();return}
      if(token !== moduleMoveToken) return;
      piece.style.transform = landing.transform;
      docking.cancel();
      outward?.cancel();
    }

    piece.dataset.docked = "true";
    piece.removeAttribute("data-moving");
    moduleMove = null;
    restoreModulePhase();
    syncDockedPieces();
  }

  function setBrandOpen(open,{trigger=lastBrandTrigger,restoreFocus=true}={}){
    if(!brandNote) return;
    brandTriggers.forEach(item => item.setAttribute("aria-expanded","false"));
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
      brandImage.src = copy.asset;
      brandImage.alt = `Símbolo ${copy.title}`;
      brandNote.hidden = false;
      document.body.classList.add("brand-dialog-open");
      brandNote.scrollTop = 0;
      requestAnimationFrame(() => brandNote.focus({preventScroll:true}));
      return;
    }

    brandNote.hidden = true;
    document.body.classList.remove("brand-dialog-open");
    if(restoreFocus && lastBrandTrigger) lastBrandTrigger.focus({preventScroll:true});
  }

  function setSampleOpen(open,{trigger=lastSampleTrigger,restoreFocus=true}={}){
    if(!sampleNote || !sampleContent) return;
    sampleTriggers.forEach(item => item.setAttribute("aria-expanded","false"));
    if(open && trigger){
      const copy = sampleCopy[trigger.dataset.sample];
      const template = copy ? document.getElementById(copy.template) : null;
      if(!copy || !template) return;
      lastSampleTrigger = trigger;
      trigger.setAttribute("aria-expanded","true");
      sampleTitle.textContent = copy.title;
      sampleContent.replaceChildren(template.content.cloneNode(true));
      sampleNote.hidden = false;
      document.body.classList.add("sample-dialog-open");
      sampleContent.scrollTop = 0;
      requestAnimationFrame(() => sampleNote.focus({preventScroll:true}));
      return;
    }

    sampleNote.hidden = true;
    sampleContent.replaceChildren();
    document.body.classList.remove("sample-dialog-open");
    if(restoreFocus && lastSampleTrigger) lastSampleTrigger.focus({preventScroll:true});
  }

  function trapDialogTab(event,dialog){
    const controls = [...dialog.querySelectorAll("a[href],button:not([disabled])")]
      .filter(control => !control.hidden && control.getClientRects().length);
    const first = controls[0];
    const last = controls.at(-1);
    if(!first || !last) return;
    if(!dialog.contains(document.activeElement) || document.activeElement === dialog){
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    }else if(event.shiftKey && document.activeElement === first){
      event.preventDefault();
      last.focus();
    }else if(!event.shiftKey && document.activeElement === last){
      event.preventDefault();
      first.focus();
    }
  }

  brandTriggers.forEach(trigger => trigger.addEventListener("click",() => {
    const open = trigger.getAttribute("aria-expanded") !== "true";
    if(open){
      setLegalTechOpen(false,{restoreFocus:false});
      setSampleOpen(false,{restoreFocus:false});
    }
    setBrandOpen(open,{trigger,restoreFocus:false});
  }));
  sampleTriggers.forEach(trigger => trigger.addEventListener("click",() => {
    setBrandOpen(false,{restoreFocus:false});
    setLegalTechOpen(false,{restoreFocus:false});
    setSampleOpen(true,{trigger,restoreFocus:false});
  }));
  modulePieces.forEach(piece => {
    piece.addEventListener("click",() => moveModulePiece(piece));
    piece.addEventListener("keydown",event => {
      if(!["ArrowDown","ArrowUp","ArrowRight","ArrowLeft","Home","End"].includes(event.key)) return;
      event.preventDefault();
      const current = modulePieces.indexOf(piece);
      const next = event.key === "Home" ? 0 : event.key === "End" ? modulePieces.length - 1 :
        (current + (["ArrowDown","ArrowRight"].includes(event.key) ? 1 : -1) + modulePieces.length) % modulePieces.length;
      modulePieces[next]?.focus();
    });
  });
  moduleBacks.forEach(back => back.addEventListener("click",() => showVision({focus:true})));
  moduleVision?.addEventListener("click",() => showVision({focus:true}));
  brandClose?.addEventListener("click",() => setBrandOpen(false));
  sampleClose?.addEventListener("click",() => setSampleOpen(false));
  sampleNote?.addEventListener("click",event => {
    if(event.target === sampleNote) setSampleOpen(false);
  });

  document.addEventListener("keydown",event => {
    if(event.key === "Tab" && sampleNote && !sampleNote.hidden){
      trapDialogTab(event,sampleNote);
      return;
    }
    if(event.key === "Tab" && brandNote && !brandNote.hidden){
      trapDialogTab(event,brandNote);
      return;
    }
    if(event.key !== "Escape") return;
    if(!sampleNote?.hidden){
      event.preventDefault();
      setSampleOpen(false);
      return;
    }
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

  const revealItems = [...document.querySelectorAll(".architecture-system,.metric-row,.authorship-row,.responsibility-row,.relations-row,.final-row")];
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
  const moduleStageObserver = new ResizeObserver(() => requestAnimationFrame(syncDockedPieces));
  if(moduleCardStage) moduleStageObserver.observe(moduleCardStage);
  reduceMotion.addEventListener?.("change",syncAnimation);
  document.fonts?.ready.then(measure);
  window.addEventListener("load",measure);
  installScrollAppearance();
  resetModuleSystem();
  measure();
  syncAnimation();
})();
