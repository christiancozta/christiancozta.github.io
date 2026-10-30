/* ==========================================================================
   ARCO — casca da página (PT)
   --------------------------------------------------------------------------
   Reúne o que a página usa fora do arco arquitetônico:
   1) cordão → palco: vistas, histórico, âncoras, filhos em iframe;
   2) revelação em scroll, altura do cordão e largura da barra de rolagem;
   3) leituras conceituais (diálogos) e tooltip de lastro dos dados;
   4) indicador de progresso de rolagem;
   5) rodapé comum e barra estrutural dos filhos.
   O arco (repouso, formação, seleção) vive em arco-arquitetura.js.
   ========================================================================== */
(() => {
  "use strict";
  const VIEWS = ["home","echo","play","atrio","cerne","data"];
  const views = [...document.querySelectorAll(".view")];
  const railLinks = [...document.querySelectorAll(".rail__link[data-view]")];
  const childLinks = [...document.querySelectorAll(".rail__seclink[data-child]")];
  const railModules = [...document.querySelectorAll(".rail__modlink[data-module]")];
  const stage = document.getElementById("stage");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const childKey = view => `arco:child:${view}`;
  function rememberedChild(view){
    let target = "";
    try { target = sessionStorage.getItem(childKey(view)) || ""; } catch {}
    return childLinks.some(link => link.dataset.child === view && link.dataset.target === target)
      ? target : "";
  }
  function setChildActive(view, target, {persist = true} = {}){
    childLinks.forEach(link => {
      if (link.dataset.child !== view) return;
      if (link.dataset.target === target) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    if (persist){
    try {
      if (target) sessionStorage.setItem(childKey(view), target);
      else sessionStorage.removeItem(childKey(view));
    } catch {}
  }
  }

  /* ---- Revelação em scroll (IntersectionObserver, nunca listener de scroll) ----
     Fica ANTES da rota: show() chama revealNow() e não pode achar io na zona morta. */
  let io = null;
  if (!reduce && "IntersectionObserver" in window){
    document.documentElement.classList.add("js-reveal");
    io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        obs.unobserve(e.target);
      });
    }, {threshold:.15, rootMargin:"0px 0px -6% 0px"});
  }
  function revealNow(){
    const items = document.querySelectorAll('.view[data-active="true"] [data-reveal]:not(.is-in)');
    if (!io){ items.forEach(i => i.classList.add("is-in")); return; }
    items.forEach(i => io.observe(i));
  }
  revealNow();
  /* rede de segurança: aba oculta ou observer que não dispara não pode deixar a
     página em branco — passados 2s sem nenhuma revelação, tudo aparece */
  setTimeout(() => {
    if (document.querySelector("[data-reveal].is-in")) return;   // observer vivo: não interferir
    document.querySelectorAll("[data-reveal]").forEach(i => i.classList.add("is-in"));
  }, 2000);

  /* ---- Casca: cordão → palco ---- */
  function show(view, {push = true} = {}){
    if (!VIEWS.includes(view)) view = "home";
    views.forEach(v => v.dataset.active = String(v.dataset.view === view));
    railLinks.forEach(l => l.setAttribute("aria-current", String(l.dataset.view === view)));

    const frame = document.querySelector('.view[data-active="true"] iframe');
    if (frame && frame.dataset.src && frame.getAttribute("src") === "about:blank"){
      const remembered = rememberedChild(view);
      if (remembered){
        const base = frame.dataset.src.split("#")[0];
        frame.dataset.src = base + "#" + remembered;
        setChildActive(view, remembered, {persist:false});
      }
      const child = frame.closest(".child");
      child.dataset.loading = "true";
      frame.addEventListener("load", () => child.dataset.loading = "false", {once:true});
      frame.src = frame.dataset.src;
    }

    document.querySelectorAll('.rail__sec[data-sec]')
      .forEach(s => s.dataset.on = String(s.dataset.sec === view));

    const wanted = view === "home" ? "" : view;
    if (push && location.hash.replace("#","") !== wanted){
      history.pushState({view}, "", wanted ? "#" + wanted : location.pathname);
    }
    window.scrollTo(0,0);
    stage.focus({preventScroll:true});
    revealNow();
  }

  document.querySelectorAll("[data-child]").forEach(btn =>
    btn.addEventListener("click", () => {
      const view = btn.dataset.child, alvo = btn.dataset.target;
      setChildActive(view, alvo);
      const frame = document.querySelector(`.view[data-view="${view}"] iframe`);
      const base = frame ? (frame.dataset.src || "").split("#")[0] : "";
      const virgem = frame && frame.getAttribute("src") === "about:blank";
      if (virgem) frame.dataset.src = base + "#" + alvo;
      show(view);
      if (!frame || virgem) return;
      try {
        if (frame.contentDocument.readyState === "complete" &&
            frame.contentWindow.location.hash !== "#" + alvo) frame.contentWindow.location.hash = alvo;
      } catch {}
      let tentativas = 0;
      const pousar = () => {
        let sec = null;
        try { sec = frame.contentDocument && frame.contentDocument.getElementById(alvo); }
        catch { return; }
        if (sec){
          sec.scrollIntoView({block:"start"});
          if (Math.abs(sec.getBoundingClientRect().top) < 4) return;
        }
        if (++tentativas < 15) setTimeout(pousar, 200);
      };
      pousar();
      /* O modulo so e acionado depois que a secao ja esta em quadro: a jogada
         precisa acontecer sob o olho, nunca durante o trajeto. */
      const modulo = btn.dataset.module;
      if (modulo){
        railModules.forEach(item =>
          item.setAttribute("aria-current", item === btn ? "true" : "false"));
        let espera = 0;
        const acionar = () => {
          let fn = null;
          try { fn = frame.contentWindow && frame.contentWindow.atrioActivateModule; }
          catch { return; }
          if (typeof fn === "function"){ fn(modulo); return; }
          if (++espera < 20) setTimeout(acionar, 200);
        };
        acionar();
      }
    }));

  /* ---- Subseção corrente dos filhos: clique, hash e rolagem usam o mesmo estado ---- */
  const childTracking = new WeakMap();
  function bindChildTracking(frame){
    const view = frame.closest(".view")?.dataset.view;
    if (!childLinks.some(link => link.dataset.child === view)) return;

    let win, doc;
    try { win = frame.contentWindow; doc = frame.contentDocument; }
    catch { return; }
    if (!win || !doc) return;

    const sections = childLinks
      .filter(link => link.dataset.child === view)
      .map(link => ({id:link.dataset.target, node:doc.getElementById(link.dataset.target)}))
      .filter(item => item.node);
    if (!sections.length) return;

    const previous = childTracking.get(frame);
    if (previous){
      previous.win.removeEventListener("scroll", previous.schedule);
      previous.win.removeEventListener("hashchange", previous.schedule);
    }

    let raf = 0;
    const sync = () => {
      raf = 0;
      const marker = Math.min(160, Math.max(72, win.innerHeight * .18));
      let active = null;
    for (const section of sections){
      if (section.node.getBoundingClientRect().top <= marker) active = section;
      else break;
    }
    setChildActive(view, active ? active.id : "");
    };
    const schedule = () => {
      if (!raf) raf = win.requestAnimationFrame(sync);
    };

    win.addEventListener("scroll", schedule, {passive:true});
    win.addEventListener("hashchange", schedule);
    childTracking.set(frame, {win, schedule});
    schedule();
  }

  document.querySelectorAll('.view iframe.child__frame')
    .forEach(frame => frame.addEventListener("load", () => bindChildTracking(frame)));

  /* O ATRIO já publica a seção realmente visível. A mãe passa a consumir esse
     sinal para que um estado lembrado (por exemplo, Autoria) nunca permaneça
     colorido depois que o iframe voltou a outra seção. */
  addEventListener("message", event => {
    if (event.origin !== location.origin) return;
    const frame = document.querySelector('.view[data-view="atrio"] iframe');
    if (!frame || event.source !== frame.contentWindow) return;
    const data = event.data;
    if (!data || data.type !== "ATRIO_SECTION") return;
    if (data.section === "hero"){
      setChildActive("atrio", "");
      return;
    }
    const valid = childLinks.some(link =>
      link.dataset.child === "atrio" && link.dataset.target === data.section);
    if (valid) setChildActive("atrio", data.section);
  });

  /* só os controles: as próprias .view também carregam data-view e não podem
     capturar o clique que borbulha de dentro delas */
  document.querySelectorAll("button[data-view], a[data-view]").forEach(el =>
    el.addEventListener("click", () => show(el.dataset.view)));

  /* o hash serve a dois donos: nomeia uma view (#echo, #atrio) ou uma seção da
     home (#repertorio, vindo do cordão das páginas-filhas). Sem esta separação
     o roteador tratava a âncora como view inválida, caía na home e o
     scrollTo(0,0) engolia o salto que o navegador ia dar. */
  function route(){
    const h = location.hash.slice(1);
    if (!h || VIEWS.includes(h)) return show(h || "home", {push:false});
    show("home", {push:false});
    const target = document.getElementById(h);
    if (!target) return;
    requestAnimationFrame(() => target.scrollIntoView({block:"start"}));
  }
  addEventListener("popstate", route);
  if (location.hash) requestAnimationFrame(route);

  /* ---- Altura do cordão no mobile: o palco desce inteiro, sem rolagem dupla ---- */
  const rail = document.querySelector(".rail");
  /* mede sempre; quem decide se usa é o CSS (só a media query do mobile lê) */
  const setRailH = () => document.documentElement.style.setProperty(
    "--rail-h", rail.offsetHeight + "px");
  if ("ResizeObserver" in window) new ResizeObserver(setRailH).observe(rail);
  addEventListener("resize", setRailH);
  setRailH();

  /* ---- Largura da barra de rolagem: 100vw a conta, a arcada não ----
     Sem isto o arco mede a viewport inteira e o pé direito pousa além da
     margem, exatamente a largura da barra (15px no Windows, 0 no macOS com
     barra sobreposta). O CSS tem fallback 0px, então sem JS nada quebra. */
  const setScrollbarW = () => document.documentElement.style.setProperty(
    "--sbw", (window.innerWidth - document.documentElement.clientWidth) + "px");
  addEventListener("resize", setScrollbarW);
  setScrollbarW();

  /* ---- Âncoras internas da home (Correspondências no cordão) ----
     Não é view: volta para a home e desce até a seção. */
  document.querySelectorAll("[data-anchor]").forEach(el =>
    el.addEventListener("click", () => {
      show("home");
      const target = document.getElementById(el.dataset.anchor);
      target?.scrollIntoView({block:"start", behavior: reduce ? "auto" : "smooth"});
    }));

  document.querySelectorAll(".arco-lang a").forEach(link =>
    link.addEventListener("click", () => {
      const repertoire = document.getElementById("repertorio");
      if (!repertoire) return;
      const rect = repertoire.getBoundingClientRect();
      if (rect.top >= innerHeight || rect.bottom <= 0) return;
      const target = new URL(link.href, location.href);
      target.hash = "repertorio";
      link.href = target.href;
    }));

  /* ---- Leituras conceituais: diálogo de página inteira ---- */
  let opener = null;
  document.querySelectorAll("[data-tale]").forEach(btn =>
    btn.addEventListener("click", () => {
      const t = document.getElementById(btn.dataset.tale);
      if (!t) return;
      opener = btn;
      t.showModal();
      t.scrollTop = 0;
    }));
  document.querySelectorAll("dialog.tale").forEach(t => {
    t.querySelector("[data-tale-close]").addEventListener("click", () => t.close());
    t.addEventListener("click", e => { if (e.target === t) t.close(); });
    t.addEventListener("close", () => opener?.focus());
  });


})();

/* ---- Indicador de progresso de rolagem ---- */
(() => {
  "use strict";
  /* Indicador único: um só componente físico, quatro gramáticas.
     percurso -> rail estrutural da home
     echo     -> rastro contínuo (fio + carga + ponto-cabeça), sem marcação
     atrio    -> indicador do próprio ATRIO, idêntico no direto e no iframe
     neutro   -> rail sem marcação (Repertório)
     O scroll permanece nativo: aqui só se lê scrollTop. */
  const rail = document.getElementById("progress-rail");
  const fill = document.getElementById("progress-rail-fill");
  const head = document.getElementById("progress-rail-head");
  if(!rail || !fill) return;
  if(matchMedia("(prefers-reduced-motion: reduce)").matches) rail.dataset.motion = "off";

  let raf = 0, bound = null;

  const activeView = () =>
    document.querySelector('.view[data-active="true"]')?.dataset.view || "home";

  /* O ECHO mantém a gramática existente: o hospedeiro desenha seu rastro e
     desliga apenas as barras concorrentes desse filho. O ATRIO se autogoverna. */
  function dressEchoChild(doc){
    if(!doc || doc.getElementById("arco-child-scroll")) return;
    const st = doc.createElement("style");
    st.id = "arco-child-scroll";
    st.textContent = "html{scrollbar-width:none;-ms-overflow-style:none}" +
      "html::-webkit-scrollbar,body::-webkit-scrollbar{width:0;height:0;display:none}" +
      ".echo-trace{display:none}";
    (doc.head || doc.documentElement).appendChild(st);
  }

  /* alvo de leitura: documento hospedeiro na home, documento do filho nas views
     de iframe (o palco do filho tem 100dvh e não rola no hospedeiro) */
  function target(){
    const view = activeView();
    if(view === "home") return {win:window, doc:document};
    const frame = document.querySelector('.view[data-active="true"] iframe');
    try{
      const doc = frame && frame.contentDocument;
      if(doc && doc.documentElement && doc.readyState !== "loading"){
        if(view === "echo") dressEchoChild(doc);
        return {win:frame.contentWindow, doc};
      }
    }catch(e){ /* sem acesso: cai no hospedeiro */ }
    return {win:window, doc:document};
  }

  function metrics(t){
    const el = t.doc.scrollingElement || t.doc.documentElement;
    return {el, max: Math.max(0, el.scrollHeight - t.win.innerHeight)};
  }

  function mode(){
    const view = activeView();
    if(view === "echo") return "echo";
    if(view === "atrio") return "atrio";
    return rail.dataset.pref === "neutro" ? "neutro" : "percurso";
  }

  function paint(){
    raf = 0;
    const t = target();
    const {el, max} = metrics(t);
    const progress = max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0;
    const pct = (progress * 100).toFixed(3) + "%";
    fill.style.transform = `scaleY(${progress.toFixed(5)})`;
    if(head) head.style.top = pct;
    rail.style.visibility = max > 0 ? "visible" : "hidden";
  }

  const schedule = () => { if(!raf) raf = requestAnimationFrame(paint); };
  const remeasure = () => schedule();

  /* liga os listeners ao escopo que realmente rola na view ativa */
  function bind(){
    const t = target();
    if(bound && bound.win === t.win) return;
    if(bound){
      bound.win.removeEventListener("scroll", schedule);
      bound.win.removeEventListener("resize", remeasure);
    }
    bound = t;
    t.win.addEventListener("scroll", schedule, {passive:true});
    t.win.addEventListener("resize", remeasure, {passive:true});
  }

  function sync(){
    rail.dataset.mode = mode();
    rail.dataset.field = activeView() === "home" ? "light" : "dark";
    rail.dataset.ready = "true";
    bind();
    remeasure();
  }

  /* mudança real de view: observada no atributo, sem tocar no roteador */
  const vo = new MutationObserver(() => sync());
  document.querySelectorAll(".view").forEach(v =>
    vo.observe(v, {attributes:true, attributeFilter:["data-active"]}));

  /* Repertório é seção da home, não view: o cordão só troca a gramática */
  document.querySelectorAll(".rail__link[data-view]").forEach(el =>
    el.addEventListener("click", () => { rail.dataset.pref = ""; sync(); }));
  document.querySelectorAll("[data-anchor]").forEach(el =>
    el.addEventListener("click", () => { rail.dataset.pref = "neutro"; sync(); }));

  document.querySelectorAll(".view iframe").forEach(f =>
    f.addEventListener("load", () => { bound = null; sync(); }));

  /* altura real do documento mudou (accordion, gaveta, fontes): remede uma vez.
     O observador olha o body, e as marcas vivem num overlay fixo, então nada
     que este código escreve realimenta a medição. */
  if(typeof ResizeObserver === "function" && document.body){
    let seen = 0;
    new ResizeObserver(() => {
      const h = document.body.scrollHeight;
      if(h === seen) return;
      seen = h;
      remeasure();
    }).observe(document.body);
  }

  addEventListener("resize", remeasure, {passive:true});
  addEventListener("load", remeasure);
  document.fonts?.ready.then(remeasure);
  sync();
})();


/* Camada de comprovação: um tooltip compartilhado por todas as métricas. */
(() => {
  "use strict";

  const tooltip = document.getElementById("data-tooltip");
  if (!tooltip) return;

  const REGIMES = {
    lastro: { nome: "Rastro documental", campos: ["FONTE", "CONTAGEM", "UNIVERSO", "RECORTE", "VER EM"] },
    derivacao: { nome: "Rastro derivado", campos: ["DERIVA DE", "CONTAGEM", "UNIVERSO", "RECORTE", "VER EM"] }
  };
  const TIP_KEYS = ["source", "numerator", "denominator", "period", "detail"];
  const LASTRO_KEYS = ["numerator", "denominator", "period"];
  const SLOT_ORDER = ["source", "detail", "numerator", "denominator", "period"];
  const DATUM_SELECTOR = "[data-datum][data-regime]";
  const tipFields = {};
  const tipLabels = {};
  const tipSlots = {};
  TIP_KEYS.forEach((key) => {
    tipFields[key] = tooltip.querySelector(`[data-tip-${key}]`);
    tipLabels[key] = tooltip.querySelector(`[data-tip-label="${key}"]`);
    tipSlots[key] = tooltip.querySelector(`[data-tip-slot="${key}"]`);
  });
  const lastroHead = tooltip.querySelector("[data-tip-lastro]");
  let activeDatum = null;

  const datumFrom = node => node instanceof Element ? node.closest(DATUM_SELECTOR) : null;

  const positionTooltip = target => {
    if (tooltip.hidden) return;
    const rect = target.getBoundingClientRect();
    const gap = 12;
    const tipRect = tooltip.getBoundingClientRect();
    let left = rect.left + (rect.width - tipRect.width) / 2;
    let top = rect.top - tipRect.height - gap;

    left = Math.max(gap, Math.min(left, window.innerWidth - tipRect.width - gap));
    if (top < gap) top = Math.min(window.innerHeight - tipRect.height - gap, rect.bottom + gap);

    tooltip.style.left = left + "px";
    tooltip.style.top = top + "px";
  };

  const showTooltip = target => {
    const regime = REGIMES[target.dataset.regime];
    if (!regime) return;
    if (activeDatum && activeDatum !== target) activeDatum.removeAttribute("aria-describedby");
    activeDatum = target;
    tooltip.className = "data-tooltip is-" + target.dataset.regime;
    tooltip.querySelector("[data-tip-regime]").textContent = regime.nome;
    TIP_KEYS.forEach((key, index) => {
      const value = target.dataset[key] || "";
      if (tipLabels[key]) tipLabels[key].textContent = regime.campos[index];
      if (tipFields[key]) tipFields[key].textContent = value;
      if (tipSlots[key]) tipSlots[key].hidden = !value;
    });
    lastroHead.hidden = !LASTRO_KEYS.some((key) => target.dataset[key]);
    let lastVisible = null;
    SLOT_ORDER.forEach((key) => {
      const slot = tipSlots[key];
      if (!slot) return;
      slot.classList.remove("is-last");
      if (!slot.hidden) lastVisible = slot;
    });
    if (lastVisible) lastVisible.classList.add("is-last");
    target.setAttribute("aria-describedby", tooltip.id);
    tooltip.hidden = false;
    requestAnimationFrame(() => positionTooltip(target));
  };

  const hideTooltip = () => {
    if (activeDatum) activeDatum.removeAttribute("aria-describedby");
    activeDatum = null;
    tooltip.hidden = true;
  };

  document.addEventListener("mouseover", event => {
    const target = datumFrom(event.target);
    if (!target || target === datumFrom(event.relatedTarget)) return;
    showTooltip(target);
  });
  document.addEventListener("mouseout", event => {
    const target = datumFrom(event.target);
    if (!target || target !== activeDatum) return;
    const next = datumFrom(event.relatedTarget);
    if (next && next !== target) showTooltip(next);
    else if (!next) hideTooltip();
  });
  document.addEventListener("focusin", event => {
    const target = datumFrom(event.target);
    if (target) showTooltip(target);
  });
  document.addEventListener("focusout", event => {
    const target = datumFrom(event.target);
    if (!target || target !== activeDatum) return;
    const next = datumFrom(event.relatedTarget);
    if (next) showTooltip(next);
    else hideTooltip();
  });
// M3: no toque nao ha hover. O ponteiro abre sobre o dado e fecha fora dele.
  document.addEventListener("pointerdown", event => {
    const target = datumFrom(event.target);
    if (target) showTooltip(target);
    else if (activeDatum) hideTooltip();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") hideTooltip();
  });
  window.addEventListener("scroll", hideTooltip, { passive: true });
  window.addEventListener("resize", hideTooltip, { passive: true });
})();

/* ---- Rodapé comum e filhos ---- */
(() => {
  "use strict";

  const FOOTER_H = 84;
  const homeView = document.querySelector('.view[data-view="home"]');
  const dataTrigger = document.querySelector('.rail__link--data[data-view="data"]');
  const stage = document.querySelector('.stage');
  const childStates = new WeakMap();
  const childProgressInk = {
    echo:'#181818',
    play:'#FFB627',
    atrio:'#A63A23',
    cerne:'#A63A23',
    data:'#0057FF'
  };

  cleanupPreviousEndcap();
  installHostProgressOverride();
  installHomeFooter();
  installChildFooters();

  function cleanupPreviousEndcap(){
    document.querySelector('.arco-global-footer')?.remove();
    document.querySelectorAll('.arco-global-footer-spacer').forEach(node => node.remove());
    document.getElementById('arco-global-footer-style')?.remove();
    document.documentElement.classList.remove('arco-endcap-visible');
  }

  function footerMarkup(){
    const footer = document.createElement('footer');
    footer.className = 'arco-unified-footer';
    footer.setAttribute('aria-label','Encerramento do ARCO');
    footer.innerHTML = `
      <p class="arco-unified-footer__seal">ARCO © <time datetime="2026">2026</time></p>
      <button class="arco-unified-footer__method" type="button" aria-label="Abrir DATA — Base e Método">
        <span>BASE E MÉTODO:</span><strong>DATA</strong>
      </button>`;
    footer.querySelector('.arco-unified-footer__method')?.addEventListener('click',() => {
      dataTrigger?.click();
    });
    return footer;
  }

  function footerCss({embedded = false} = {}){
    return `
.arco-unified-footer{
  position:relative;
  width:100%;height:${FOOTER_H}px;min-height:${FOOTER_H}px;
  margin:0;padding:0;
  overflow:hidden;
  background:#181818!important;color:#FCFCFC!important;
  border:0!important;
}
.arco-unified-footer__seal{
  position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
  margin:0;padding:0;
  font-family:"Azeret Mono",ui-monospace,monospace;
  font-size:.58rem;font-weight:500;line-height:1.3;
  letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;
  color:#FCFCFC!important;text-align:center;
}
.arco-unified-footer__method{
  position:absolute;right:clamp(18px,2.1vw,34px);top:50%;transform:translateY(-50%);
  display:flex;align-items:baseline;justify-content:flex-end;gap:.5rem;
  margin:0;padding:.4rem 0;
  appearance:none;-webkit-appearance:none;border:0;background:none;
  text-align:right;cursor:pointer;color:#FCFCFC;
}
.arco-unified-footer__method span{
  font-family:"Azeret Mono",ui-monospace,monospace;
  font-size:.56rem;font-weight:500;line-height:1.3;
  letter-spacing:.08em;text-transform:uppercase;color:rgba(252,252,252,.58);white-space:nowrap;
}
.arco-unified-footer__method strong{
  font-family:"Commissioner",system-ui,sans-serif;
  font-size:.74rem;font-weight:600;line-height:1;
  letter-spacing:-.008em;color:#0057FF;white-space:nowrap;
}
.arco-unified-footer__method:hover strong,
.arco-unified-footer__method:focus-visible strong{color:#2e71ff}
.arco-unified-footer__method:focus-visible{outline:2px solid #0057FF;outline-offset:3px}
@media(max-width:1000px){
  .arco-unified-footer__seal{left:50%}
  .arco-unified-footer__method{right:max(1rem,env(safe-area-inset-right,0px));gap:.32rem}
  .arco-unified-footer__method span{font-size:clamp(.46rem,1.9vw,.54rem)}
  .arco-unified-footer__method strong{font-size:clamp(.64rem,2.5vw,.72rem)}
}
@media(max-width:560px){
  .arco-unified-footer__seal{font-size:.52rem}
  .arco-unified-footer__method span{display:none}
  .arco-unified-footer__method strong::before{content:"BASE E MÉTODO: ";font-family:"Azeret Mono",ui-monospace,monospace;font-size:.46rem;font-weight:500;letter-spacing:.06em;color:rgba(252,252,252,.58)}
}
${embedded ? 'html[data-arco-embedded="true"] footer.page-footer{display:none!important}' : ''}
`;
  }

  function installStyle(doc, embedded){
    if (doc.getElementById('arco-unified-footer-style')) return;
    const style = doc.createElement('style');
    style.id = 'arco-unified-footer-style';
    style.textContent = footerCss({embedded});
    doc.head.appendChild(style);
  }

  function installHomeFooter(){
    if (!homeView || homeView.querySelector(':scope > .arco-unified-footer')) return;
    installStyle(document,false);
    homeView.appendChild(footerMarkup());
  }

  function installHostProgressOverride(){
    if (!document.getElementById('arco-child-progress-host-style')){
      const style = document.createElement('style');
      style.id = 'arco-child-progress-host-style';
      style.textContent = 'html[data-arco-child-active="true"] #progress-rail{display:none!important}';
      document.head.appendChild(style);
    }

    const sync = () => {
      const active = document.querySelector('.view[data-active="true"]')?.dataset.view || 'home';
      document.documentElement.dataset.arcoChildActive = String(active !== 'home');
    };
    sync();
    if (stage){
      new MutationObserver(sync).observe(stage,{
        subtree:true,
        attributes:true,
        attributeFilter:['data-active']
      });
    }
  }

  function installChildFooters(){
    document.querySelectorAll('iframe.child__frame').forEach(frame => {
      const prepare = () => {
        let win,doc;
        try {
          win = frame.contentWindow;
          doc = frame.contentDocument;
        } catch {
          return;
        }
        if (!win || !doc?.documentElement || !doc.body) return;

        const view = frame.closest('.view')?.dataset.view;
        if (!view || !['echo','play','atrio','cerne','data'].includes(view)) return;

        doc.documentElement.dataset.arcoEmbedded = 'true';
        installStyle(doc,true);

        /* O shell é o dono da navegação entre projetos. Nunca deixar ARCO
           carregar dentro do próprio iframe. */
        doc.querySelectorAll('a[href="arco.html"],a[href^="arco.html#"]').forEach(link => {
          link.setAttribute('target','_top');
        });

        cleanupChild(view,doc);

        if (!doc.body.querySelector(':scope > .arco-unified-footer')){
          doc.body.appendChild(footerMarkup());
        }

        prepareChildScrollbar(frame,win,doc,view);
      };

      frame.addEventListener('load',prepare);
      try {
        if (frame.contentDocument?.readyState === 'complete' && frame.getAttribute('src') !== 'about:blank') prepare();
      } catch {}
    });
  }

  function cleanupChild(view,doc){
    if (view === 'echo'){
      const ecosystemLabel = [...doc.querySelectorAll('p')]
        .find(node => node.textContent.trim() === 'Ecossistema');
      const ecosystemBlock = ecosystemLabel?.closest('div[data-reveal]') || ecosystemLabel?.parentElement;
      ecosystemBlock?.remove();

      const legacyFooter = [...doc.querySelectorAll('div')].find(node => {
        const children = [...node.children];
        if (children.length !== 3 || children.some(child => child.tagName !== 'SPAN')) return false;
        return children[0].textContent.trim() === 'ECHO' &&
          children[1].textContent.trim() === 'Christian da Costa, Curitiba, Brasil' &&
          children[2].textContent.trim() === '2026';
      });
      legacyFooter?.remove();
    }

    if (view === 'atrio'){
      doc.querySelector('.project-sequence')?.remove();
    }
  }

  function prepareChildScrollbar(frame,win,doc,view){
    const previous = childStates.get(frame);
    if (previous){
      previous.win.removeEventListener('scroll',previous.schedule);
      previous.win.removeEventListener('resize',previous.schedule);
      previous.resizeObserver?.disconnect();
      previous.cleanupObserver?.disconnect();
    }

    installChildScrollbarStyle(view,doc);
    const progress = ensureChildScrollbar(view,doc);

    let raf = 0;
    const update = () => {
      raf = 0;
      const root = doc.scrollingElement || doc.documentElement;
      if (!root || !progress?.rail || !progress?.fill) return;
      const max = Math.max(0,root.scrollHeight - win.innerHeight);
      const ratio = max > 0 ? Math.min(1,Math.max(0,root.scrollTop / max)) : 0;
      progress.fill.style.transform = `scaleY(${ratio})`;
      progress.rail.hidden = max <= 1;
    };
    const schedule = () => {
      if (raf) return;
      raf = win.requestAnimationFrame(update);
    };

    win.addEventListener('scroll',schedule,{passive:true});
    win.addEventListener('resize',schedule,{passive:true});

    let resizeObserver = null;
    if ('ResizeObserver' in win){
      resizeObserver = new win.ResizeObserver(schedule);
      resizeObserver.observe(doc.documentElement);
      resizeObserver.observe(doc.body);
    }

    /* ECHO é montado por runtime. Durante a estabilização inicial, qualquer
       recomposição que tente devolver os blocos legados é limpa novamente. */
    let cleanupRaf = 0;
    const scheduleCleanup = () => {
      if (cleanupRaf) return;
      cleanupRaf = win.requestAnimationFrame(() => {
        cleanupRaf = 0;
        cleanupChild(view,doc);
        schedule();
      });
    };
    let cleanupObserver = null;
    if ('MutationObserver' in win){
      cleanupObserver = new win.MutationObserver(scheduleCleanup);
      cleanupObserver.observe(doc.body,{childList:true,subtree:true});
      win.setTimeout(() => cleanupObserver?.disconnect(),4000);
    }

    childStates.set(frame,{win,doc,schedule,resizeObserver,cleanupObserver});
    schedule();
    [60,260,900,2200].forEach(delay => win.setTimeout(scheduleCleanup,delay));
  }

  function installChildScrollbarStyle(view,doc){
    let style = doc.getElementById('arco-child-scrollbar-style');
    if (!style){
      style = doc.createElement('style');
      style.id = 'arco-child-scrollbar-style';
      style.textContent = `
html[data-arco-embedded="true"]{
  scrollbar-width:none!important;
  -ms-overflow-style:none!important;
}
html[data-arco-embedded="true"]::-webkit-scrollbar,
html[data-arco-embedded="true"] body::-webkit-scrollbar{
  width:0!important;height:0!important;display:none!important;
}
html[data-arco-embedded="true"] .atrio-progress,
html[data-arco-embedded="true"] .echo-trace{
  display:none!important;
}
.arco-child-scrollbar{
  position:fixed;top:0;right:2px;bottom:0;z-index:2147483000;
  width:2px;overflow:hidden;pointer-events:none;
  background:rgba(128,128,128,.24);
}
.arco-child-scrollbar__fill{
  position:absolute;inset:0 0 auto 0;width:100%;height:100%;
  transform:scaleY(0);transform-origin:50% 0;
  background:var(--arco-child-progress-ink,#181818);
  box-shadow:0 0 0 .5px rgba(252,252,252,.52);
  will-change:transform;
}
@media(max-width:760px){
  .arco-child-scrollbar{right:1px;width:2px}
}
@media(prefers-reduced-motion:reduce){
  .arco-child-scrollbar__fill{transition:none!important}
}`;
      doc.head.appendChild(style);
    }
    doc.documentElement.style.setProperty('--arco-child-progress-ink',childProgressInk[view] || '#181818');
  }

  function ensureChildScrollbar(view,doc){
    let rail = doc.getElementById('arco-child-scrollbar');
    if (!rail){
      rail = doc.createElement('div');
      rail.id = 'arco-child-scrollbar';
      rail.className = 'arco-child-scrollbar';
      rail.setAttribute('aria-hidden','true');
      rail.innerHTML = '<span class="arco-child-scrollbar__fill"></span>';
      doc.body.appendChild(rail);
    }
    rail.style.setProperty('--arco-child-progress-ink',childProgressInk[view] || '#181818');
    return {rail,fill:rail.querySelector('.arco-child-scrollbar__fill')};
  }

})();
