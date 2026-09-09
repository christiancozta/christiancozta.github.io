/* ========================================================================== 
   ARCO — COMMIT 01 · HERO desktop
   Geometria + mecânica narrativa + persistência + tipografia 5→1.
   Mobile permanece sob arco-mobile-viewport.js.
   ========================================================================== */
(() => {
  "use strict";

  const current = document.currentScript;
  const src = current?.src || new URL("assets/arco/js/arco.js", document.baseURI).href;
  const coreUrl = new URL("arco-core.js?v=20260909-commit01", src);
  const mobileUrl = new URL("arco-mobile-viewport.js?v=20260906-viewport-v1", src);

  installCommit01Styles();
  preloadGinger();

  const core = document.createElement("script");
  core.src = coreUrl.href;
  core.async = false;
  core.onload = () => {
    installDesktopHeroController();
    const mobile = document.createElement("script");
    mobile.src = mobileUrl.href;
    mobile.async = false;
    mobile.onerror = () => console.error("ARCO: falha ao carregar a coordenação mobile.");
    document.head.appendChild(mobile);
  };
  core.onerror = () => console.error("ARCO: falha ao carregar o núcleo local.");
  document.head.appendChild(core);

  function preloadGinger(){
    const href = new URL("../fonts/RestartGinger-SemiBold.woff2", src).href;
    if (document.querySelector(`link[rel="preload"][href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "font";
    link.type = "font/woff2";
    link.crossOrigin = "anonymous";
    link.href = href;
    document.head.appendChild(link);
  }

  function installCommit01Styles(){
    if (document.getElementById("arco-commit01-style")) return;
    const style = document.createElement("style");
    style.id = "arco-commit01-style";
    style.textContent = String.raw`
@font-face{font-family:"ARCO Restart Ginger";src:url("assets/arco/fonts/RestartGinger-Regular.woff2") format("woff2");font-weight:400;font-style:normal;font-display:swap}
@font-face{font-family:"ARCO Restart Ginger";src:url("assets/arco/fonts/RestartGinger-SemiBold.woff2") format("woff2");font-weight:600;font-style:normal;font-display:swap}
@font-face{font-family:"ARCO Restart Ginger";src:url("assets/arco/fonts/RestartGinger-Bold.woff2") format("woff2");font-weight:700;font-style:normal;font-display:swap}
:root{--f-display:"ARCO Restart Ginger","Schibsted Grotesk",system-ui,sans-serif}

@media (min-width:821px){
  /* nascenca quase colada ao limite inferior da primeira viewport */
  .view[data-view="home"] .narr-zone{
    min-height:max(calc(100dvh - 6px),36rem)!important;
  }
  .view[data-view="home"] .home.hero-v3-ready .narr-zone .arc{
    top:0!important;
  }

  /* os pilares só entram quando a arcada alcança a viewport */
  .view[data-view="home"] .arc .pilar{
    opacity:0!important;
    transition:opacity 180ms var(--ease)!important;
  }
  .view[data-view="home"] .home.hero-pillars-visible .arc .pilar{
    opacity:.18!important;
  }

  /* número = aparato; título = linguagem editorial */
  .view[data-view="home"] .home.hero-v2-ready .narr__n,
  .view[data-view="home"] .home.hero-v2-ready button.narr__n{
    font-family:var(--f-micro)!important;
    font-weight:700!important;
    letter-spacing:-.045em!important;
  }
  .view[data-view="home"] .home.hero-v2-ready .narr__short{
    display:flex!important;
    align-items:baseline!important;
    flex-wrap:wrap!important;
    gap:.34rem!important;
    font-family:var(--f-body)!important;
    font-weight:600!important;
    font-size:clamp(.62rem,.76vw,.72rem)!important;
    line-height:1.06!important;
    letter-spacing:.032em!important;
    text-transform:uppercase!important;
    color:var(--ink-78)!important;
  }
  .view[data-view="home"] .home.hero-v2-ready .narr__detail{
    font-family:var(--f-body)!important;
    font-size:.64rem!important;
    line-height:1.45!important;
  }

  .narr__tag{
    display:inline-flex;
    align-items:center;
    min-height:1.42em;
    padding:.08em .38em .12em;
    border-radius:0;
    font-family:var(--f-micro);
    font-size:.54rem;
    font-weight:700;
    line-height:1.2;
    letter-spacing:.085em;
    text-transform:uppercase;
    white-space:nowrap;
    opacity:0;
    transform:translateY(2px);
    pointer-events:auto;
  }
  .narr__tag--arco{background:#181818;color:#FCFCFC}
  .narr__tag--atrio{background:var(--atrio-band);color:var(--atrio-ink)}
  .narr__tag--echo{background:var(--echo-band);color:var(--echo-ink)}
  .narr__tag--data{background:#2E71FF;color:#FCFCFC}

  /* construção: número + título são um único acontecimento; detalhe/tag ficam fora */
  .view[data-view="home"] .home.hero-commit01-ready .narr__n,
  .view[data-view="home"] .home.hero-commit01-ready .narr__short{
    opacity:0!important;
    transform:translateY(4px)!important;
    transition:opacity 420ms var(--ease),transform 420ms var(--ease)!important;
    transition-delay:var(--hero-v2-num-delay,0ms)!important;
  }
  .view[data-view="home"] .home.hero-commit01-ready.hero-v2-play .narr__n,
  .view[data-view="home"] .home.hero-commit01-ready.hero-v2-play .narr__short{
    opacity:1!important;
    transform:none!important;
  }
  .view[data-view="home"] .home.hero-commit01-ready .narr__detail,
  .view[data-view="home"] .home.hero-commit01-ready .narr__detail[hidden],
  .view[data-view="home"] .home.hero-commit01-ready .narr__tag{
    opacity:0!important;
    transform:translateY(2px)!important;
  }
  .view[data-view="home"] .home.hero-commit01-ready .narr__detail[hidden]{display:none!important}

  .view[data-view="home"] .home.hero-commit01-ready .narr__stat.is-revealed .narr__detail,
  .view[data-view="home"] .home.hero-commit01-ready .narr__stat.is-revealed .narr__tag{
    opacity:1!important;
    transform:none!important;
    transition:opacity 300ms var(--ease),transform 300ms var(--ease)!important;
  }
  .view[data-view="home"] .home.hero-commit01-ready .narr__stat{
    pointer-events:auto!important;
    cursor:pointer;
  }
  .view[data-view="home"] .home.hero-commit01-ready .narr__stat .narr__short,
  .view[data-view="home"] .home.hero-commit01-ready .narr__stat .narr__detail{
    pointer-events:auto!important;
  }

  /* estado final: nenhum flash, nenhuma espera */
  .view[data-view="home"] .home.hero-commit01-final .narr,
  .view[data-view="home"] .home.hero-commit01-final .narr__stat,
  .view[data-view="home"] .home.hero-commit01-final .narr__n,
  .view[data-view="home"] .home.hero-commit01-final .narr__short,
  .view[data-view="home"] .home.hero-commit01-final .narr__detail,
  .view[data-view="home"] .home.hero-commit01-final .narr__tag{
    opacity:1!important;
    transform:none!important;
    transition:none!important;
  }
  .view[data-view="home"] .home.hero-commit01-final .narr__detail[hidden]{display:block!important}
  .view[data-view="home"] .home.hero-commit01-final .hero-v2-seg{
    transform:scaleY(1)!important;
    transition:none!important;
  }
}

@media (max-width:820px){
  .narr__tag{display:none!important}
}

@media (prefers-reduced-motion:reduce){
  .view[data-view="home"] .home.hero-commit01-ready .narr__n,
  .view[data-view="home"] .home.hero-commit01-ready .narr__short,
  .view[data-view="home"] .home.hero-commit01-ready .narr__detail,
  .view[data-view="home"] .home.hero-commit01-ready .narr__tag{
    opacity:1!important;
    transform:none!important;
    transition:none!important;
  }
}
`;
    document.head.appendChild(style);
  }

  function installDesktopHeroController(){
    const homeView = document.querySelector('.view[data-view="home"]');
    const home = homeView?.querySelector(".home");
    const zone = home?.querySelector(".narr-zone");
    const arc = zone?.querySelector(".arc");
    const spring = arc?.querySelector(".spring");
    const arcade = home?.querySelector(".arcade");
    const geometry = window.__ARCO_HERO_V2_GEOMETRY__;
    if (!homeView || !home || !zone || !arc || !spring || !geometry?.layout) return;

    const mq = matchMedia("(max-width:820px)");
    const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
    const stats = [...zone.querySelectorAll(".narr__stat")];
    if (stats.length !== 5) return;

    const SESSION_KEY = "arco:hero:commit01:discovered";
    const REQUEST_EVENTS = ["scroll","wheel","pointerdown","pointermove","keydown","touchstart"];
    const REST_AFTER_BUILD = 680;
    const REVEAL_MS = 300;
    const BETWEEN_STATIONS = 90;

    let disposed = false;
    let requested = false;
    let gateOpen = false;
    let requestArmed = false;
    let fallbackTimer = 0;
    let runToken = 0;
    let activeAnimations = new Set();

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    const readDiscovered = () => {
      try { return sessionStorage.getItem(SESSION_KEY) === "1"; } catch { return false; }
    };
    const markDiscovered = () => {
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch {}
    };

    const stationMeta = {
      "5": {title:"ÁREAS DE ATUAÇÃO", tag:"ARCO", cls:"arco"},
      "4": {title:"MÓDULOS DE IA JURÍDICA", tag:"ATRIO", cls:"atrio"},
      "3": {title:"EIXOS OPERACIONAIS", tag:"ECHO", cls:"echo"},
      "2": {title:"CRITÉRIOS METODOLÓGICOS", tag:"DATA", cls:"data"},
      "1": {title:"PROFISSIONAL", tag:"", cls:""}
    };

    stats.forEach(stat => {
      const step = stat.dataset.step;
      const meta = stationMeta[step];
      const short = stat.querySelector(".narr__short");
      const detail = stat.querySelector(".narr__detail");
      const button = stat.querySelector("button.narr__n");
      if (!meta || !short || !detail || !button) return;

      short.textContent = meta.title;
      if (meta.tag){
        const tag = document.createElement("span");
        tag.className = `narr__tag narr__tag--${meta.cls}`;
        tag.textContent = meta.tag;
        tag.setAttribute("aria-label", `Proveniência: ${meta.tag}`);
        short.appendChild(tag);
      }
      if (step === "1"){
        detail.textContent = "integra a capacidade de medir, organizar e arquitetar sistemas jurídicos na encruzilhada entre dados, operações e tecnologia.";
      }
      detail.hidden = true;
      detail.setAttribute("aria-hidden", "true");
      button.setAttribute("aria-expanded", "false");
    });

    const cancelAnimations = () => {
      runToken += 1;
      activeAnimations.forEach(animation => {
        try { animation.cancel(); } catch {}
      });
      activeAnimations.clear();
      if (fallbackTimer) clearTimeout(fallbackTimer);
      fallbackTimer = 0;
    };

    const revealStation = stat => {
      const detail = stat.querySelector(".narr__detail");
      const button = stat.querySelector("button.narr__n");
      stat.classList.add("is-revealed");
      if (detail){
        detail.hidden = false;
        detail.setAttribute("aria-hidden", "false");
      }
      button?.setAttribute("aria-expanded", "true");
    };

    const revealAll = ({persist = true} = {}) => {
      cancelAnimations();
      if (persist) markDiscovered();
      home.classList.add("narr-on","hero-v2-play","hero-commit01-ready","hero-commit01-final");
      stats.forEach(revealStation);
      geometry.layout();
    };

    const blinkRound = async (number, duration, token) => {
      const animation = number.animate(
        [{filter:"opacity(1)"},{filter:"opacity(.38)",offset:.5},{filter:"opacity(1)"}],
        {duration,iterations:3,easing:"cubic-bezier(.4,0,.2,1)"}
      );
      activeAnimations.add(animation);
      try { await animation.finished; } catch {}
      activeAnimations.delete(animation);
      if (token !== runToken || disposed) throw new Error("cancelled");
    };

    const cycleStation = async (stat, index, token) => {
      const number = stat.querySelector(".narr__n");
      if (!number) return;
      const duration = 150 + index * 5;
      for (let round = 0; round < 3; round++){
        await blinkRound(number, duration, token);
        if (round < 2) await sleep(150 + index * 8);
        if (token !== runToken || disposed) throw new Error("cancelled");
      }
      revealStation(stat);
      await sleep(REVEAL_MS + index * 10);
    };

    const constructionBudget = () => {
      const parseMs = value => {
        const token = String(value || "").trim();
        if (token.endsWith("ms")) return parseFloat(token) || 0;
        if (token.endsWith("s")) return (parseFloat(token) || 0) * 1000;
        return parseFloat(token) || 0;
      };
      let max = 0;
      stats.forEach(stat => {
        const n = stat.querySelector(".narr__n");
        const cs = n ? getComputedStyle(n) : null;
        const delay = parseMs(stat.style.getPropertyValue("--hero-v2-num-delay"));
        const duration = cs ? Math.max(...cs.transitionDuration.split(",").map(parseMs)) : 420;
        max = Math.max(max, delay + duration);
      });
      const segs = [...zone.querySelectorAll(".hero-v2-seg")];
      segs.forEach(seg => {
        max = Math.max(max,
          parseMs(seg.style.getPropertyValue("--hero-v2-seg-delay")) +
          parseMs(seg.style.getPropertyValue("--hero-v2-dur")));
      });
      return Math.max(1200, max + 80);
    };

    const runAutomaticRead = async () => {
      const token = ++runToken;
      try {
        await sleep(constructionBudget() + REST_AFTER_BUILD);
        if (token !== runToken || disposed || readDiscovered()) return;
        const order = [...stats].sort((a,b) => Number(b.dataset.step) - Number(a.dataset.step));
        for (let i = 0; i < order.length; i++){
          await cycleStation(order[i], i, token);
          if (i < order.length - 1) await sleep(BETWEEN_STATIONS);
          if (token !== runToken || disposed || readDiscovered()) return;
        }
        home.classList.add("hero-commit01-final");
      } catch (error) {
        if (error?.message !== "cancelled") console.error("ARCO hero:", error);
      }
    };

    const springSettled = () => {
      if (!arc.classList.contains("is-in")) return false;
      const value = parseFloat(getComputedStyle(spring).strokeDashoffset);
      return Number.isFinite(value) ? Math.abs(value) < 0.5 : false;
    };

    const openGate = () => {
      if (gateOpen || mq.matches || disposed) return;
      gateOpen = true;
      if (fallbackTimer) clearTimeout(fallbackTimer);
      fallbackTimer = 0;
      if (requested && !readDiscovered()) startConstruction();
    };

    const armSpring = () => {
      if (gateOpen || mq.matches || disposed || !arc.classList.contains("is-in")) return;
      if (springSettled()) return openGate();
      const finish = event => {
        if (event.target !== spring) return;
        if (event.propertyName && event.propertyName !== "stroke-dashoffset") return;
        spring.removeEventListener("transitionend", finish);
        spring.removeEventListener("transitioncancel", finish);
        openGate();
      };
      spring.addEventListener("transitionend", finish);
      spring.addEventListener("transitioncancel", finish);
      fallbackTimer = window.setTimeout(openGate, 2200);
    };

    const disarmRequest = () => {
      if (!requestArmed) return;
      requestArmed = false;
      REQUEST_EVENTS.forEach(type => window.removeEventListener(type, requestNarrative));
    };

    const startConstruction = () => {
      if (home.classList.contains("hero-v2-play") || mq.matches || readDiscovered()) return;
      home.classList.add("narr-on","hero-commit01-ready");
      geometry.layout();
      requestAnimationFrame(() => {
        geometry.layout();
        requestAnimationFrame(() => {
          home.classList.add("hero-v2-play");
          runAutomaticRead();
        });
      });
    };

    function requestNarrative(){
      if (mq.matches || requested || disposed || readDiscovered()) return;
      requested = true;
      disarmRequest();
      home.classList.add("narr-on","hero-commit01-ready");
      geometry.layout();
      if (gateOpen) startConstruction();
      else armSpring();
    }

    const armRequest = () => {
      if (reduce || mq.matches || requested || requestArmed || readDiscovered()) return;
      requestArmed = true;
      REQUEST_EVENTS.forEach(type => window.addEventListener(type, requestNarrative, {passive:true}));
    };

    stats.forEach(stat => {
      stat.addEventListener("click", event => {
        if (mq.matches) return;
        event.preventDefault();
        revealAll({persist:true});
      });
      stat.addEventListener("keydown", event => {
        if (mq.matches || (event.key !== "Enter" && event.key !== " ")) return;
        event.preventDefault();
        revealAll({persist:true});
      });
    });

    const arcObserver = new MutationObserver(() => {
      if (arc.classList.contains("is-in")) armSpring();
    });
    arcObserver.observe(arc,{attributes:true,attributeFilter:["class"]});

    if (arcade && "IntersectionObserver" in window){
      const pillarsObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          home.classList.toggle("hero-pillars-visible", entry.isIntersecting);
        });
      },{threshold:0,rootMargin:"0px 0px -1px 0px"});
      pillarsObserver.observe(arcade);
    }

    const viewObserver = new MutationObserver(() => {
      if (homeView.dataset.active === "true"){
        if (readDiscovered() && !mq.matches) revealAll({persist:false});
        return;
      }
      if (!mq.matches){
        markDiscovered();
        cancelAnimations();
      }
    });
    viewObserver.observe(homeView,{attributes:true,attributeFilter:["data-active"]});

    if (mq.matches){
      stats.forEach(stat => {
        const detail = stat.querySelector(".narr__detail");
        const button = stat.querySelector("button.narr__n");
        if (detail){
          detail.hidden = false;
          detail.setAttribute("aria-hidden", "false");
        }
        button?.setAttribute("aria-expanded", "true");
      });
      return;
    }

    home.classList.add("hero-commit01-ready");
    geometry.layout();

    if (reduce || readDiscovered()){
      revealAll({persist:false});
    } else {
      armRequest();
      armSpring();
    }

    mq.addEventListener?.("change", event => {
      if (event.matches){
        disarmRequest();
        cancelAnimations();
        return;
      }
      geometry.layout();
      if (reduce || readDiscovered()) revealAll({persist:false});
      else {
        requested = false;
        gateOpen = springSettled();
        armRequest();
        armSpring();
      }
    });

    window.__ARCO_DESKTOP_HERO_STATE__ = () => ({
      discovered: readDiscovered(),
      requested,
      gateOpen,
      final: home.classList.contains("hero-commit01-final")
    });
  }
})();
