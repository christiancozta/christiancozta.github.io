/* ========================================================================== 
   ARCO — coordenador do núcleo + refinamentos da narrativa
   O núcleo permanece local em arco-core.js. As camadas laterais coordenam:
   1) desktop: linha 1→5 após a nascença do arco estar assentada;
   2) desktop: números completos antes de qualquer legenda;
   3) desktop: detalhes cumulativos por hover/foco em número ou título;
   4) mobile: progressão por entrada real no viewport e remedição responsiva.
   ========================================================================== */
(() => {
  "use strict";

  const current = document.currentScript;
  const src = current?.src || new URL("assets/arco/js/arco.js", document.baseURI).href;
  const coreUrl = new URL("arco-core.js?v=20260906-desktop-narrative", src);

  const core = document.createElement("script");
  core.src = coreUrl.href;
  core.async = false;
  core.onload = () => {
    installDesktopNarrativeCoordination();
    const mobile = document.createElement("script");
    mobile.src = new URL("arco-mobile-viewport.js?v=20260906-viewport-v1", src).href;
    mobile.async = false;
    mobile.onerror = () => console.error("ARCO: falha ao carregar a coordenação mobile.");
    document.head.appendChild(mobile);
  };
  core.onerror = () => console.error("ARCO: falha ao carregar o núcleo local.");
  document.head.appendChild(core);

  function installDesktopNarrativeCoordination(){
    const home = document.querySelector('.view[data-view="home"] .home');
    const zone = home?.querySelector(".narr-zone");
    const arc = zone?.querySelector(".arc");
    const spring = arc?.querySelector(".spring");
    if (!home || !zone || !arc || !spring) return;

    const mq = matchMedia("(max-width:820px)");
    const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
    const stats = [...zone.querySelectorAll(".narr__stat")];

    const timeList = value => value.split(",").map(item => {
      const token = item.trim();
      if (token.endsWith("ms")) return parseFloat(token) || 0;
      if (token.endsWith("s")) return (parseFloat(token) || 0) * 1000;
      return 0;
    });

    const transitionBudget = el => {
      const cs = getComputedStyle(el);
      const durations = timeList(cs.transitionDuration);
      const delays = timeList(cs.transitionDelay);
      const n = Math.max(durations.length, delays.length, 1);
      let max = 0;
      for (let i = 0; i < n; i++){
        max = Math.max(
          max,
          (durations[i % durations.length] || 0) +
          (delays[i % delays.length] || 0)
        );
      }
      return max;
    };

    /* ----------------------------------------------------------------------
       LEGENDAS — nenhuma entra antes de os cinco algarismos assentarem.
       A trava é óptica e independente dos delays calculados pelo núcleo:
       mesmo que resize/layout recalcule os tempos, texto algum vaza antes.
       Depois do último número, as legendas entram 1→5 em passos de 95ms.
       ---------------------------------------------------------------------- */
    const LEGEND_STEP = 95;
    let legendsReleased = reduce;
    let legendTimer = 0;

    const textNodes = stat => [
      stat.querySelector(".narr__short"),
      stat.querySelector(".narr__detail")
    ].filter(Boolean);

    const lockLegends = () => {
      if (mq.matches || reduce || legendsReleased) return;
      stats.forEach(stat => {
        textNodes(stat).forEach(node => node.style.setProperty("opacity", "0", "important"));
      });
    };

    const releaseLegends = () => {
      if (legendsReleased || mq.matches) return;
      legendsReleased = true;
      if (legendTimer) clearTimeout(legendTimer);

      [...stats]
        .sort((a, b) => Number(a.dataset.step) - Number(b.dataset.step))
        .forEach((stat, index) => {
          stat.style.setProperty("--hero-v2-leg-delay", `${index * LEGEND_STEP}ms`);
          textNodes(stat).forEach(node => node.style.removeProperty("opacity"));
        });

      home.classList.add("hero-v2-legends-released");
    };

    const armLegendRelease = () => {
      if (legendsReleased || mq.matches || reduce || !home.classList.contains("hero-v2-play")) return;
      lockLegends();

      requestAnimationFrame(() => {
        if (legendsReleased || mq.matches || !home.classList.contains("hero-v2-play")) return;
        const numbers = stats
          .map(stat => stat.querySelector(".narr__n"))
          .filter(Boolean);
        const lastNumberAt = Math.max(0, ...numbers.map(transitionBudget));
        if (legendTimer) clearTimeout(legendTimer);
        legendTimer = window.setTimeout(releaseLegends, Math.ceil(lastNumberAt) + 24);
      });
    };

    lockLegends();

    /* ----------------------------------------------------------------------
       DETALHES — hover/foco acumulativo e permanente no desktop.
       O núcleo já conhece a abertura. Aqui a estação é marcada como fixa
       no primeiro contato e nunca mais recebe comando de fechamento.
       ---------------------------------------------------------------------- */
    const openStat = stat => {
      if (!stat || mq.matches) return;
      const button = stat.querySelector("button.narr__n");
      const title = stat.querySelector(".narr__short");
      const detail = stat.querySelector(".narr__detail");
      if (!button || !detail) return;

      stat.dataset.fixo = "1";
      stat.classList.add("is-open");
      detail.hidden = false;
      detail.setAttribute("aria-hidden", "false");
      button.setAttribute("aria-expanded", "true");

      if (title){
        title.style.pointerEvents = "auto";
        title.style.cursor = "default";
      }
    };

    stats.forEach(stat => {
      const button = stat.querySelector("button.narr__n");
      const title = stat.querySelector(".narr__short");
      if (!button) return;

      [button, title].filter(Boolean).forEach(target => {
        target.style.pointerEvents = "auto";
        target.addEventListener("pointerenter", () => openStat(stat));
        target.addEventListener("focusin", () => openStat(stat));
      });
    });

    /* O handler antigo de clique alternava abrir/fechar. Capturamos antes do
       botão: clique deixa de ser toggle e só reafirma o estado aberto. */
    document.addEventListener("click", event => {
      if (mq.matches) return;
      const button = event.target instanceof Element
        ? event.target.closest("button.narr__n")
        : null;
      if (!button || !home.contains(button)) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openStat(button.closest(".narr__stat"));
    }, true);

    /* ----------------------------------------------------------------------
       GATE DO TRAÇO — primeiro gesto do usuário continua sendo o pedido;
       a execução visual só é liberada quando a nascença do arco termina.
       ---------------------------------------------------------------------- */
    let gateOpen = reduce;
    let requested = home.classList.contains("narr-on") ||
                    home.classList.contains("hero-v2-play");
    let springArmed = false;
    let fallbackTimer = 0;
    let mutatingGate = false;

    const revealLine = () => {
      if (!gateOpen) return;
      if ((requested || home.classList.contains("narr-on")) &&
          !home.classList.contains("hero-v2-play")){
        home.classList.add("hero-v2-play");
      }
      if (home.classList.contains("hero-v2-play")) armLegendRelease();
    };

    const openGate = () => {
      if (gateOpen) return;
      gateOpen = true;
      if (fallbackTimer) clearTimeout(fallbackTimer);
      revealLine();
    };

    const springSettled = () => {
      if (!arc.classList.contains("is-in")) return false;
      const value = parseFloat(getComputedStyle(spring).strokeDashoffset);
      return Number.isFinite(value) ? Math.abs(value) < 0.5 : false;
    };

    const armSpring = () => {
      if (gateOpen || springArmed || !arc.classList.contains("is-in")) return;
      springArmed = true;

      if (springSettled()){
        openGate();
        return;
      }

      const finish = event => {
        if (event.target !== spring) return;
        if (event.propertyName && event.propertyName !== "stroke-dashoffset") return;
        spring.removeEventListener("transitionend", finish);
        spring.removeEventListener("transitioncancel", finish);
        openGate();
      };

      spring.addEventListener("transitionend", finish);
      spring.addEventListener("transitioncancel", finish);

      const budget = transitionBudget(spring);
      fallbackTimer = window.setTimeout(openGate, Math.max(60, budget + 80));
    };

    if (gateOpen){
      revealLine();
    } else {
      const arcObserver = new MutationObserver(() => {
        if (arc.classList.contains("is-in")) armSpring();
      });
      arcObserver.observe(arc, {attributes:true, attributeFilter:["class"]});
      armSpring();
    }

    /* O núcleo pode tentar ligar hero-v2-play assim que recebe o gesto.
       Enquanto o arco não assentou, retiramos a classe antes do próximo paint.
       Depois do gate, qualquer layout/resize pode reaplicá-la normalmente. */
    const homeObserver = new MutationObserver(() => {
      if (mutatingGate) return;

      if (home.classList.contains("narr-on")) requested = true;
      if (home.classList.contains("hero-v2-play")) requested = true;

      if (!gateOpen && home.classList.contains("hero-v2-play")){
        mutatingGate = true;
        home.classList.remove("hero-v2-play");
        lockLegends();
        queueMicrotask(() => { mutatingGate = false; });
        return;
      }

      if (gateOpen){
        revealLine();
        armLegendRelease();
      }
    });
    homeObserver.observe(home, {attributes:true, attributeFilter:["class"]});

    /* Se o usuário já interagiu enquanto o núcleo carregava, narr-on registra
       o pedido. Se ainda não, o próprio núcleo continuará escutando o gesto. */
    if (!gateOpen && home.classList.contains("hero-v2-play")){
      requested = true;
      home.classList.remove("hero-v2-play");
      lockLegends();
    }
  }
})();