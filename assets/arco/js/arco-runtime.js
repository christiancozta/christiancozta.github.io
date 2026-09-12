/* ========================================================================== 
   ARCO — HERO desktop
   Geometria + mecânica narrativa + persistência + tipografia 5→1.
   Mobile permanece sob arco-mobile-viewport.js.
   ========================================================================== */
(() => {
  "use strict";

  const current = document.currentScript;
  const src = current?.src || new URL("assets/arco/js/arco.js", document.baseURI).href;
  const coreUrl = new URL("arco-core.js?v=20260909-commit01", src);
  const mobileUrl = new URL("arco-mobile-viewport.js?v=20260906-viewport-v1", src);

  installHeroStyles();
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
    const href = new URL("../../fonts/RestartGinger-SemiBold.woff2", src).href;
    if (document.querySelector(`link[rel="preload"][href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "font";
    link.type = "font/woff2";
    link.crossOrigin = "anonymous";
    link.href = href;
    document.head.appendChild(link);
  }

  function installHeroStyles(){
    if (document.getElementById("arco-commit01-style")) return;
    const style = document.createElement("style");
    style.id = "arco-commit01-style";
    style.textContent = String.raw`
@font-face{font-family:"ARCO Restart Ginger";src:url("assets/fonts/RestartGinger-Regular.woff2") format("woff2");font-weight:400;font-style:normal;font-display:swap}
@font-face{font-family:"ARCO Restart Ginger";src:url("assets/fonts/RestartGinger-SemiBold.woff2") format("woff2");font-weight:600;font-style:normal;font-display:swap}
@font-face{font-family:"ARCO Restart Ginger";src:url("assets/fonts/RestartGinger-Bold.woff2") format("woff2");font-weight:700;font-style:normal;font-display:swap}
:root{--f-display:"ARCO Restart Ginger","Schibsted Grotesk",system-ui,sans-serif}

@media (min-width:821px){
  /* nascimento quase colado ao limite inferior da primeira viewport */
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
    pointer-events:auto;
  }
  .narr__tag--arco{background:#181818;color:#FCFCFC}
  .narr__tag--atrio{background:var(--atrio-band);color:var(--atrio-ink)}
  .narr__tag--echo{background:var(--echo-band);color:var(--echo-ink)}
  .narr__tag--data{background:#2E71FF;color:#FCFCFC}

  /* construção: linha sobe; número + título surgem juntos, lentamente e sem deslocamento */
  .view[data-view="home"] .home.hero-commit01-ready .narr__n,
  .view[data-view="home"] .home.hero-commit01-ready .narr__short{
    opacity:0!important;
    transition:opacity 900ms cubic-bezier(.22,.68,0,1)!important;
    transition-delay:var(--hero-v2-num-delay,0ms)!important;
  }
  .view[data-view="home"] .home.hero-commit01-ready.hero-v2-play .narr__n,
  .view[data-view="home"] .home.hero-commit01-ready.hero-v2-play .narr__short{
    opacity:1!important;
  }

  /* tag + detalhe aguardam o repouso e entram por fade puro */
  .view[data-view="home"] .home.hero-commit01-ready .narr__detail,
  .view[data-view="home"] .home.hero-commit01-ready .narr__detail[hidden],
  .view[data-view="home"] .home.hero-commit01-ready .narr__tag{
    opacity:0!important;
  }
  .view[data-view="home"] .home.hero-commit01-ready .narr__detail[hidden]{
    display:none!important;
  }

  .view[data-view="home"] .home.hero-commit01-ready .narr__stat.is-revealed .narr__detail,
  .view[data-view="home"] .home.hero-commit01-ready .narr__stat.is-revealed .narr__tag{
    opacity:1!important;
    transition:opacity 900ms cubic-bezier(.22,.68,0,1)!important;
  }

  /* enquanto houver algo a descobrir, a estação inteira obedece à regra-mãe */
  .view[data-view="home"] .home.hero-commit01-ready:not(.hero-commit01-final) .narr__stat{
    pointer-events:auto!important;
    cursor:pointer!important;
  }
  .view[data-view="home"] .home.hero-commit01-ready:not(.hero-commit01-final) .narr__stat .narr__n,
  .view[data-view="home"] .home.hero-commit01-ready:not(.hero-commit01-final) .narr__stat .narr__short,
  .view[data-view="home"] .home.hero-commit01-ready:not(.hero-commit01-final) .narr__stat .narr__detail,
  .view[data-view="home"] .home.hero-commit01-ready:not(.hero-commit01-final) .narr__stat .narr__tag{
    pointer-events:auto!important;
    cursor:pointer!important;
  }

  /* estado final = prancha estática: sem hover semântico, clique ou bump */
  .view[data-view="home"] .home.hero-commit01-final .narr,
  .view[data-view="home"] .home.hero-commit01-final .narr__stat,
  .view[data-view="home"] .home.hero-commit01-final .narr__n,
  .view[data-view="home"] .home.hero-commit01-final .narr__short,
  .view[data-view="home"] .home.hero-commit01-final .narr__detail,
  .view[data-view="home"] .home.hero-commit01-final .narr__tag{
    opacity:1!important;
    transition:none!important;
  }
  .view[data-view="home"] .home.hero-commit01-final .narr__stat,
  .view[data-view="home"] .home.hero-commit01-final .narr__stat *,
  .view[data-view="home"] .home.hero-commit01-final .narr__n,
  .view[data-view="home"] .home.hero-commit01-final .narr__short,
  .view[data-view="home"] .home.hero-commit01-final .narr__detail,
  .view[data-view="home"] .home.hero-commit01-final .narr__tag{
    pointer-events:none!important;
    cursor:default!important;
  }
  /* Não forçar [hidden] a display:block no estado final: a geometria mede
     deliberadamente a altura em repouso e precisa conseguir ocultar o detalhe
     durante essa medição sem comprimir a coluna ao encerrar a sequência. */
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

    /* ritmo editorial: cadência uniforme, deliberada e respirada */
    const REST_AFTER_BUILD = 1100;
    const REVEAL_MS = 900;
    const BETWEEN_STATIONS = 600;

    let disposed = false;
    let requested = false;
    let gateOpen = false;
    let requestArmed = false;
    let fallbackTimer = 0;
    let runToken = 0;

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    const readDiscovered = () => {
      try { return sessionStorage.getItem(SESSION_KEY) === "1"; } catch { return false; }
    };
    const markDiscovered = () => {
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch {}
    };

    const stationMeta = {
      "5": {
        title:"ÁREAS DE ATUAÇÃO", tag:"ARCO", cls:"arco",
        detail:"que organizam mecanismos e suas correspondências construídos para problemas reconhecíveis no mercado privado."
      },
      "4": {
        title:"MÓDULOS DE IA JURÍDICA", tag:"ATRIO", cls:"atrio",
        detail:"reunidos em uma arquitetura de raciocínio jurídico para apoio decisório, aplicada à rotina de gabinete judicial."
      },
      "3": {
        title:"EIXOS OPERACIONAIS", tag:"ECHO", cls:"echo",
        detail:"estruturados por uma metodologia de operações jurídicas, construída para ambientes de alto volume."
      },
      "2": {
        title:"CRITÉRIOS METODOLÓGICOS", tag:"DATA", cls:"data",
        detail:"para validar dados e indicadores jurimétricos: evidência (Lastro) e rastreabilidade (Rastro)."
      },
      "1": {
        title:"PROFISSIONAL", tag:"", cls:"",
        detail:"capaz de medir, organizar e arquitetar sistemas jurídicos na encruzilhada atravessada por Direito, tecnologia e dados."
      }
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
      detail.textContent = meta.detail;

      detail.hidden = true;
      detail.setAttribute("aria-hidden", "true");
      button.setAttribute("aria-expanded", "false");
      button.removeAttribute("aria-disabled");
    });

    const cancelSequence = () => {
      runToken += 1;
      if (fallbackTimer) clearTimeout(fallbackTimer);
      fallbackTimer = 0;
    };

    const setStaticFinal = () => {
      stats.forEach(stat => {
        const button = stat.querySelector("button.narr__n");
        if (!button) return;
        button.tabIndex = -1;
        button.setAttribute("aria-disabled", "true");
      });
    };

    const revealStation = (stat, {animate = true} = {}) => {
      const detail = stat.querySelector(".narr__detail");
      const button = stat.querySelector("button.narr__n");

      if (detail){
        detail.hidden = false;
        detail.setAttribute("aria-hidden", "false");
      }
      button?.setAttribute("aria-expanded", "true");

      /* garante que o fade parta realmente de opacity:0, sem salto de display:none */
      if (animate) void stat.offsetWidth;
      stat.classList.add("is-revealed");
    };

    const revealAll = ({persist = true} = {}) => {
      cancelSequence();
      if (persist) markDiscovered();

      home.classList.add(
        "narr-on",
        "hero-v2-play",
        "hero-commit01-ready",
        "hero-commit01-final"
      );

      stats.forEach(stat => revealStation(stat, {animate:false}));
      setStaticFinal();
      geometry.layout();
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
        const duration = cs
          ? Math.max(...cs.transitionDuration.split(",").map(parseMs))
          : 900;
        max = Math.max(max, delay + duration);
      });

      [...zone.querySelectorAll(".hero-v2-seg")].forEach(seg => {
        max = Math.max(
          max,
          parseMs(seg.style.getPropertyValue("--hero-v2-seg-delay")) +
          parseMs(seg.style.getPropertyValue("--hero-v2-dur"))
        );
      });

      return Math.max(1200, max + 80);
    };

    const runAutomaticRead = async () => {
      const token = ++runToken;

      try {
        await sleep(constructionBudget() + REST_AFTER_BUILD);
        if (token !== runToken || disposed || readDiscovered()) return;

        const order = [...stats].sort(
          (a,b) => Number(b.dataset.step) - Number(a.dataset.step)
        );

        for (let i = 0; i < order.length; i++){
          revealStation(order[i], {animate:true});
          await sleep(REVEAL_MS);

          if (token !== runToken || disposed || readDiscovered()) return;
          if (i < order.length - 1) await sleep(BETWEEN_STATIONS);
          if (token !== runToken || disposed || readDiscovered()) return;
        }

        markDiscovered();
        home.classList.add("hero-commit01-final");
        setStaticFinal();
        geometry.layout();
      } catch (error) {
        console.error("ARCO hero:", error);
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
      REQUEST_EVENTS.forEach(
        type => window.addEventListener(type, requestNarrative, {passive:true})
      );
    };

    /* REGRA-MÃE: enquanto a prancha não estiver final, um gesto revela tudo. */
    stats.forEach(stat => {
      stat.addEventListener("click", event => {
        if (mq.matches || home.classList.contains("hero-commit01-final")) return;
        event.preventDefault();
        revealAll({persist:true});
      });

      stat.addEventListener("keydown", event => {
        if (
          mq.matches ||
          home.classList.contains("hero-commit01-final") ||
          (event.key !== "Enter" && event.key !== " ")
        ) return;

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
        cancelSequence();
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
        cancelSequence();
        return;
      }

      geometry.layout();

      if (reduce || readDiscovered()){
        revealAll({persist:false});
      } else {
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
