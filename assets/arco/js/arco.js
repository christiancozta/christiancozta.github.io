/* ========================================================================== */
/* Fonte original: inline-script-1 */
/* ========================================================================== */
(() => {
  "use strict";
  const VIEWS = ["home","echo","atrio","data"];
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

    document.querySelectorAll('.rail__sec[data-sec="echo"], .rail__sec[data-sec="atrio"]')
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
    if (view !== "echo" && view !== "atrio") return;

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

  document.querySelectorAll('.view[data-view="echo"] iframe, .view[data-view="atrio"] iframe')
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
    document.getElementById(h)?.scrollIntoView({block:"start"});
  }
  addEventListener("popstate", route);
  if (location.hash) route();

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

  (() => {
    const arc = document.querySelector('.view[data-view="home"] .arc');
    if (!arc) return;
    const extra  = arc.querySelector(".extra");
    const intra  = arc.querySelector(".intra");
    const spring = arc.querySelector(".spring");
    if (!extra || !intra || !spring) return;

    const K = 1000, A = 238;

    const redraw = () => {
      const r = arc.getBoundingClientRect();
      const W = r.width, H = r.height;
      if (!W || !H) return;
      const x = v => +(v * W / K).toFixed(2);
      const y = v => +(v * H / A).toFixed(2);

      arc.setAttribute("viewBox", `0 0 ${+W.toFixed(2)} ${+H.toFixed(2)}`);
      extra.setAttribute("d", `M0,${y(238)} C${x(180)},${y(10)} ${x(820)},${y(10)} ${x(1000)},${y(238)}`);
      intra.setAttribute("d", `M0,${y(238)} C${x(205)},${y(66)} ${x(795)},${y(66)} ${x(1000)},${y(238)}`);
      spring.setAttribute("x1", 0);      spring.setAttribute("y1", y(238));
      spring.setAttribute("x2", x(1000)); spring.setAttribute("y2", y(238));

      /* Os pilares do percurso passam a ser desenhados aqui dentro, no mesmo
         sistema de coordenadas da nascenca. Enquanto eram ::before de cada
         bloco, viviam noutra caixa e a junta dependia de um ajuste em pixel
         que nunca fechava nas duas pontas. Agora partem de y(238) — a propria
         nascenca — por construcao. O comprimento e a distancia medida ate o
         filete do bloco, nao o valor declarado de --pier. */
      const movs = [...document.querySelectorAll('.view[data-view="home"] .arcade .mov')];
      const semPilares = matchMedia("(max-width:820px)").matches || movs.length < 2;
      const antigos = [...arc.querySelectorAll(".pilar")];
      if (semPilares){
        antigos.forEach(el => el.remove());
      } else {
        const base = y(238);
        const vao = Math.max(0, movs[0].getBoundingClientRect().top - r.bottom);
        movs.forEach((mov, i) => {
          let linha = antigos[i];
          if (!linha){
            linha = document.createElementNS("http://www.w3.org/2000/svg", "line");
            linha.setAttribute("class", "pilar");
            arc.appendChild(linha);
          }
          const px = +(mov.getBoundingClientRect().left - r.left).toFixed(2);
          linha.setAttribute("x1", px); linha.setAttribute("x2", px);
          linha.setAttribute("y1", base); linha.setAttribute("y2", +(base + vao).toFixed(2));
          if (!reduce){
            linha.setAttribute("stroke-dasharray", vao.toFixed(2));
            linha.setAttribute("stroke-dashoffset", vao.toFixed(2));
          }
        });
        antigos.slice(movs.length).forEach(el => el.remove());
      }

      [extra, intra, spring].forEach(el => {
        el.removeAttribute("vector-effect");
        if (reduce) return;
        const len = (el === spring ? W : el.getTotalLength()) + 1;
        el.setAttribute("stroke-dasharray", len.toFixed(2));
        el.setAttribute("stroke-dashoffset", len.toFixed(2));
      });
    };

    redraw();
    if ("ResizeObserver" in window) new ResizeObserver(redraw).observe(arc);
    addEventListener("resize", redraw, {passive:true});
  })();

  /* ---- Concept readers (registro poético — só a mãe) ---- */
  const readers = {
    r1: "O portfólio expõe peças. O arco expõe a tensão que as gera: a mesma pergunta, feita em três tempos. Da execução à regência, da regência à arquitetura — não três coisas, um percurso que aprende a se ler."
    /* PENDENTE: mais concept readers conforme você escrever. */
  };
  const dialog = document.getElementById("reader");
  const dialogText = document.getElementById("reader-text");
  let opener = null;
  document.querySelectorAll("[data-reader]").forEach(btn =>
    btn.addEventListener("click", () => {
      dialogText.textContent = readers[btn.dataset.reader] || "";
      opener = btn;
      dialog.showModal();
    }));
  dialog.querySelector("[data-reader-close]").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", e => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => opener?.focus());

  /* ---- As seções do Repertório no índice: só enquanto ele está em campo ---- */
  (() => {
    const sec = document.querySelector('.rail__sec[data-sec="repertorio"]');
    const rep = document.getElementById("repertorio");
    if (!sec || !rep) return;
    new IntersectionObserver(
      ([en]) => sec.dataset.on = String(en.isIntersecting),
      { threshold: 0 }).observe(rep);
  })();

  /* ---- A linha de contatos do cordão: revezamento com a ficha da hero ----
     Enquanto a ficha está em campo, o cordão cala; quando ela sai, ele fala.
     A troca é só de estado — a subida e a transparência são da folha. */
  (() => {
    const creed = document.querySelector(".rail__creed");
    const hero  = document.getElementById("bio-creed");
    if (!creed || !hero) return;
    new IntersectionObserver(
      ([e]) => creed.dataset.on = String(!e.isIntersecting),
      { threshold: 0 }).observe(hero);
  })();

  /* ---- AS TRÊS PORTAS DO REPERTÓRIO ----------------------------------------
     Trocar de porta não troca de conteúdo: troca o modo de entrar nele. Por
     isso o seletor é tablist — o leitor de tela também ouve "uma coisa, três
     acessos" — e por isso qualquer lembrete que aponte para dentro de outra
     porta abre a porta antes de saltar. */
  const doorBox = document.querySelector(".doors");
  const openDoor = (() => {
    if (!doorBox) return () => {};
    const tabs  = [...doorBox.querySelectorAll(".door")];
    const slab  = doorBox.querySelector(".doors__slab");
    const caps  = [...doorBox.querySelectorAll(".doors__cap")];
    const panes = new Map(tabs.map(t =>
      [t.dataset.door, document.getElementById(t.getAttribute("aria-controls"))]));

    function apply(key, {focus = false, quiet = false} = {}){
      const tab = tabs.find(t => t.dataset.door === key);
      if (!tab || !panes.get(key)) return;
      if (doorBox.dataset.door === key){ if (focus) tab.focus(); return; }

      doorBox.dataset.door = key;
      if (slab) slab.style.transform = `translateX(${tabs.indexOf(tab) * 100}%)`;
      tabs.forEach(t => {
        const on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
      });
      if (focus) tab.focus();
      caps.forEach(c => c.hidden = c.dataset.cap !== key);
      panes.forEach((p, k) => {
        if (!p) return;
        p.hidden = k !== key;
        p.removeAttribute("data-enter");
      });
      /* a cascata de entrada só existe quando a porta foi escolhida; num salto
         vindo de outra porta o alvo precisa estar parado para ser alcançado */
      const pane = panes.get(key);
      if (pane && !reduce && !quiet){ void pane.offsetWidth; pane.dataset.enter = ""; }
      revealNow();
    }

    tabs.forEach(t => t.addEventListener("click", () => apply(t.dataset.door)));
    doorBox.querySelector(".doors__set")?.addEventListener("keydown", e => {
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      const step = {ArrowRight:1, ArrowLeft:-1, ArrowDown:1, ArrowUp:-1}[e.key];
      const to = step ? (i + step + tabs.length) % tabs.length
               : e.key === "Home" ? 0
               : e.key === "End"  ? tabs.length - 1 : -1;
      if (to < 0) return;
      e.preventDefault();
      apply(tabs[to].dataset.door, {focus:true});
    });
    return apply;
  })();

  /* a porta em que um alvo mora — null se ele não estiver dentro de nenhuma */
  const doorOf = node => {
    const pane = node?.closest?.(".pane");
    return pane ? pane.id.replace(/^pane-/, "") : null;
  };

  /* ---- Âncoras internas da home (Repertório no cordão) ----
     Não é view: volta para a home e desce até a seção. O índice do cordão
     nomeia as portas: escolher "Dor" no cordão é abrir a porta e descer. */
  document.querySelectorAll("[data-anchor]").forEach(el =>
    el.addEventListener("click", () => {
      show("home");
      if (el.dataset.doorGoto) openDoor(el.dataset.doorGoto);
      const target = document.getElementById(el.dataset.anchor);
      target?.scrollIntoView({block:"start", behavior: reduce ? "auto" : "smooth"});
    }));

  /* ---- Repertório: o alvo referido abre toda a cadeia de gavetas acima de si,
     abre a si mesmo e sobe. Vale nas duas direções — a ponte chama o mecanismo,
     o mecanismo chama a equivalência, a equivalência devolve ao mecanismo — e
     por isso a cadeia é percorrida inteira, não só o domínio do dicionário.
     Sem tocar em location.hash: o hash é do roteador de views, não de âncora. ---- */
  document.querySelectorAll("[data-goto]").forEach(btn =>
    btn.addEventListener("click", event => {
      if (btn.closest(".mec > summary")) event.stopPropagation();
      const target = document.getElementById(btn.dataset.goto);
      if (!target) return;
      const door = doorOf(target);
      if (door) openDoor(door, {quiet:true});
      for (let d = target.parentElement?.closest("details"); d;
               d = d.parentElement?.closest("details")) d.open = true;
      if (target.tagName === "DETAILS") target.open = true;
      /* O foco vem antes do salto: em Chrome um focus() cancela o scroll suave
         que já esteja em curso, e o alvo ficava para trás. Alvo sem summary (a
         cabeça da coleção) recebe o foco ele mesmo — o teclado não pode perder o
         lugar num salto que a vista fez. */
      (target.querySelector("summary") || target).focus({preventScroll:true});
      /* A conta espera o reflow: as gavetas acima do alvo acabaram de abrir, e
         medir antes disso deixa a vista curta — num alvo acima, ela nem sobe. O
         painel congelado desconta a própria altura, senão pousa por cima. */
      requestAnimationFrame(() => {
        const barra = doorBox && doorBox.closest(".collection")?.contains(target)
          ? doorBox.getBoundingClientRect().height : 0;
        /* offsetTop, e não o retângulo: a revelação em scroll desloca o elemento
           por transform, que mente no rect e não mexe no layout. */
        let y = -barra - 24;
        for (let n = target; n; n = n.offsetParent) y += n.offsetTop;
        scrollTo({top: Math.max(0, y), behavior: reduce ? "auto" : "smooth"});
      });
    }));

  /* ---- Identidade conceitual: leitura de página inteira ---- */
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

  /* ---- Narrativa: régua diagonal + cascata, ancoradas ao pilar do bloco 02 ---- */
  (function(){
    const home = document.querySelector('.view[data-view="home"] .home');
    const zone = home && home.querySelector('.narr-zone');
    if (!home || !zone) return;
    const svg  = zone.querySelector('.narr__svg');
    const arc  = zone.querySelector('.arc');
    const head = zone.querySelector('.bio__head');
    const name = zone.querySelector('.bio__name');
    const narr = zone.querySelector('.narr');
    /* o índice 0 é o dado mais alto (115.114, o acervo bruto) e o último é o
       mais baixo (60,4%, o resultado). No desktop a linha percorre esse eixo de
       baixo para cima: começa no resultado e sobe até a matéria-prima. */
    const stats = [...zone.querySelectorAll('.narr__stat')].reverse();
    if (!svg || !arc || !head || !name || !narr || !stats.length) return;

    /* a régua é uma só, interrompida onde cada dado pousa: N dados, N+1
       segmentos. Criados uma vez — layout() só recoloca, nunca recria (recriar
       reiniciaria o desenho a cada resize). */
    const NS = 'http://www.w3.org/2000/svg';
    const segs = Array.from({length: stats.length + 1}, () => {
      const l = document.createElementNS(NS, 'line');
      l.setAttribute('class', 'narr__line');
      return svg.appendChild(l);
    });
    const GUT  = 10;    // folga entre a régua e o dado
    const PAD  = 9;     // folga vertical de cada interrupção
    const LIFT = 3;     // correção óptica uniforme: toda a cascata sobe 3px
    const LIFT_899 = 3; // respiro adicional entre a segunda linha de 899 e o arco
    const DRAW = 2200;  // ms de traço puro, repartidos pela extensão de cada segmento
    const HOLD = 120;   // ms de pausa em cada dado
    const OVER = .22;   // extensão mínima do traço além do último dado, em fração do eixo
    const EXIT = 64;    // px acima da borda superior da viewport onde o traço se perde

    function layout(){
      const mov2 = home.querySelectorAll('.arcade .mov')[1];   // bloco 02; Regência
      const cs = getComputedStyle(narr);
      /* a régua só existe enquanto a camada é sobreposição: no celular ela sai
         do absoluto e vira lista em prumo — não há diagonal a posicionar */
      if (!mov2 || cs.display === 'none' || cs.position === 'static') return false;
      const zr = zone.getBoundingClientRect();
      if (!zr.width || !zr.height) return false;               // oculto: não posiciona
      const ar = arc.getBoundingClientRect();
      const hr = head.getBoundingClientRect();
      const nr = name.getBoundingClientRect();
      const m2 = mov2.getBoundingClientRect();

      /* a régua nasce no pilar do bloco 02, na nascença do arco, e sobe até a
         altura de "Christian da Costa": o percurso inteiro num traço só */
      const ay = nr.top - zr.top;
      const bx = m2.left - zr.left, by = ar.bottom - zr.top;
      const dy = by - ay;
      if (!(dy > 0)) return false;

      /* faixa útil: o primeiro dado começa abaixo da ficha — não disputa altura
         com o nome; o último pousa dentro do arco, a 30% da nascença */
      const hs    = stats.map(s => s.offsetHeight);
      const first = (hr.bottom - zr.top) + PAD * 2 + hs[0] / 2;
      const last  = by - (by - (ar.top - zr.top)) * .30;
      if (last <= first) return false;
      const step = stats.length > 1 ? (last - first) / (stats.length - 1) : 0;
      const ys   = stats.map((s, k) =>
        first + step * k - LIFT - (s.querySelector('.narr__n')?.textContent.trim() === '899' ? LIFT_899 : 0)
      );

      /* o topo da régua: 68% do palco, salvo quando a ficha alcança essa calha —
         então recua o necessário para o primeiro dado não encostar nela, sem
         nunca empurrar o dado para fora do palco */
      const br = zone.querySelector('.bio').getBoundingClientRect();
      const f  = (ys[0] + hs[0] / 2 - ay) / dy;
      const need = f < 1
        ? ((br.right - zr.left) + GUT * 2 - GUT - bx * f) / (1 - f)
        : 0;
      const ax = Math.min(
        Math.max(zr.width * .68, need),
        zr.width - stats[0].offsetWidth - GUT
      );
      const len = Math.hypot(bx - ax, dy);
      const xAt = y => ax + (bx - ax) * (y - ay) / dy;

      /* O TRAÇO NÃO TEM PONTA — porque não tem destino. Ele nasce no pé (o
         pilar do bloco 02, na nascença do arco), sobe pela composição e, depois
         do último dado, segue por uma extensão perceptível até se perder acima
         da borda da viewport. Duas medidas garantem essa sobra: uma fração do
         eixo, para que a continuação seja legível em qualquer tela, e a própria
         borda superior, para que ela realmente saia de campo. */
      const yTop = Math.min(-zr.top - EXIT, ys[0] - hs[0] / 2 - PAD - dy * OVER);

      /* os vãos: cada um cobre exatamente a altura medida do seu dado.
         spans[0] é a extensão acima do dado mais alto; spans[n] é o pé. */
      const spans = [];
      let cur = yTop;
      ys.forEach((y, k) => {
        spans.push([cur, Math.max(cur, y - hs[k] / 2 - PAD)]);
        cur = Math.max(cur, y + hs[k] / 2 + PAD);
      });
      spans.push([cur, Math.max(cur, by)]);

      const lens  = spans.map(([y1, y2]) => Math.abs(y2 - y1) / dy * len);
      const total = lens.reduce((a, b) => a + b, 0) || 1;

      /* a calha de cada dado é medida no eixo, não na ordem do desenho */
      stats.forEach((s, k) => {
        s.style.setProperty('--y', (ys[k] - hs[k] / 2).toFixed(2) + 'px');
        s.style.setProperty('--x', (xAt(ys[k] + hs[k] / 2) + GUT).toFixed(2) + 'px');
      });

      /* DE BAIXO PARA CIMA: o último vão é o primeiro a ser traçado, e cada
         segmento é escrito do seu ponto baixo para o alto. O dado não espera o
         contato: começa a emergir em algum ponto entre 38% e 72% do vão que o
         antecede, com variação por índice — a linha acompanha o número, não o
         aciona. */
      let t = 0;
      for (let k = spans.length - 1; k >= 0; k--){
        const [yA, yB] = spans[k];
        const l = segs[k];
        const xA = xAt(yA), xB = xAt(yB);
        l.setAttribute('x1', xB.toFixed(2)); l.setAttribute('y1', yB.toFixed(2));
        l.setAttribute('x2', xA.toFixed(2)); l.setAttribute('y2', yA.toFixed(2));
        const seg = Math.hypot(xB - xA, yB - yA) + 1;
        l.setAttribute('stroke-dasharray', seg.toFixed(2));
        l.setAttribute('stroke-dashoffset', seg.toFixed(2));
        const dur = lens[k] / total * DRAW;
        l.style.setProperty('--dur', Math.round(dur));
        l.style.setProperty('--dly', Math.round(t));

        const s = stats[k - 1];
        if (s) s.style.setProperty('--dly',
          Math.round(t + dur * (.38 + ((k * 7) % 5) * .085)));
        t += dur + (s ? HOLD : 0);
      }
      return true;
    }

    let asked = reduce;
    const enter = () => { if (layout() && asked) home.classList.add('narr-on'); };

    enter();
    requestAnimationFrame(enter);
    addEventListener('resize', enter, {passive:true});
    if ("ResizeObserver" in window) new ResizeObserver(enter).observe(zone);
    document.fonts?.ready.then(enter);

    if (reduce) return;
    const evs = ['scroll','wheel','pointerdown','pointermove','keydown','touchstart'];
    const fire = () => {
      asked = true;
      enter();
      evs.forEach(ev => removeEventListener(ev, fire));
    };
    evs.forEach(ev => addEventListener(ev, fire, {passive:true}));
  })();

})();

/* ========================================================================== */
/* Fonte original: inline-script-2 */
/* ========================================================================== */
(() => {
  "use strict";
  /* Indicador único: um só componente físico, quatro gramáticas.
     percurso -> rail estrutural segmentado pelas seções reais da view ativa
     echo     -> rastro contínuo (fio + carga + ponto-cabeça), sem marcação
     atrio    -> indicador do próprio ATRIO, idêntico no direto e no iframe
     neutro   -> rail sem marcação (Repertório)
     O scroll permanece nativo: aqui só se lê scrollTop. */
  const rail = document.getElementById("progress-rail");
  const fill = document.getElementById("progress-rail-fill");
  const head = document.getElementById("progress-rail-head");
  if(!rail || !fill) return;
  if(matchMedia("(prefers-reduced-motion: reduce)").matches) rail.dataset.motion = "off";

  /* Pontos de parada: o Percurso (a arcada dos tres blocos, que dividem a
     mesma profundidade de rolagem) e a propria Traducao. */
  const homeCheckpoints = () => [
    document.querySelector('.view[data-view="home"] .arcade'),
    document.querySelector('#repertorio')
  ].filter(Boolean);
  let raf = 0, marks = [], bound = null, lastH = -1;

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

  function buildMarks(t){
    marks.forEach(n => n.remove());
    marks = [];
    if(rail.dataset.mode !== "percurso") return;
    const {el, max} = metrics(t);
    if(max <= 0 || t.doc !== document) return;
    homeCheckpoints().forEach(checkpoint => {
      const top = checkpoint.getBoundingClientRect().top + el.scrollTop;
      const ratio = Math.min(1, Math.max(0, top / max));
      const node = document.createElement("span");
      node.className = "progress-rail__mark";
      node.style.top = (ratio * 100).toFixed(3) + "%";
      rail.appendChild(node);
      marks.push(node);
    });
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
    if(el.scrollHeight !== lastH){ lastH = el.scrollHeight; buildMarks(t); }
  }

  const schedule = () => { if(!raf) raf = requestAnimationFrame(paint); };
  const remeasure = () => { lastH = -1; schedule(); };

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

/* ========================================================================== */
/* Fonte original: mobile-arrow-integrated-js */
/* ========================================================================== */
(() => {
  'use strict';

  const mq = matchMedia('(max-width:820px)');
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (!mq.matches) return;
  const home = document.querySelector('.view[data-view="home"] .home');
  if (!home) return;

  const arc = home.querySelector('.narr-zone .arc');
  const metricStats = [...home.querySelectorAll('.narr__stat')];
  const metricNumbers = metricStats.map(stat => stat.querySelector('.narr__n'));
  const titles = [...home.querySelectorAll('.arcade > .mov > .mov__h')];
  const lastTitle = titles[titles.length - 1];
  if (!arc || metricNumbers.length !== 5 || metricNumbers.some(n => !n) || titles.length !== 3 || !lastTitle) return;

  const DRAW = 1900;
  const HOLD = 120;
  const CONTINUE = 1900;

  const axis = document.createElement('span');
  axis.className = 'mobile-arrow-axis';
  axis.setAttribute('aria-hidden','true');
  home.appendChild(axis);

  let started = false;
  let axisAnimation = null;
  let axisDone = false;
  let timeline = null;

  function layoutBox(el){
    let x = 0, y = 0, node = el;
    while (node && node !== home){
      x += node.offsetLeft || 0;
      y += node.offsetTop || 0;
      node = node.offsetParent;
    }
    if (node === home){
      return {x, y, width:el.offsetWidth, height:el.offsetHeight};
    }
    const hr = home.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return {x:r.left - hr.left, y:r.top - hr.top, width:r.width, height:r.height};
  }

  function measureArrow(){
    if (!mq.matches) return null;

    const ab = layoutBox(arc);
    const lb = layoutBox(lastTitle);
    if (!ab.width || !lb.width) return null;

    const x = ab.x;
    const top = ab.y + ab.height;
    const end = lb.y + lb.height / 2;
    const height = Math.max(1, end - top);

    home.style.setProperty('--mobile-arrow-x', x.toFixed(2) + 'px');
    home.style.setProperty('--mobile-arrow-top', top.toFixed(2) + 'px');
    home.style.setProperty('--mobile-arrow-h', height.toFixed(2) + 'px');

    const metricPoints = metricNumbers.map((node, i) => {
      const b = layoutBox(node);
      const y = b.y + b.height / 2;
      return {node, stat:metricStats[i], y};
    });

    const metricEnd = Math.max(top + 1, metricPoints[metricPoints.length - 1].y);
    const metricSpan = Math.max(1, metricEnd - top);
    const metricClock = DRAW + HOLD * metricPoints.length;
    const total = metricClock + CONTINUE;
    const frames = [{height:'0px', offset:0}];

    metricPoints.forEach((point, i) => {
      const q = Math.min(1, Math.max(0, (point.y - top) / metricSpan));
      const arrival = q * DRAW + i * HOLD;
      const h = Math.max(0, point.y - top).toFixed(2) + 'px';
      frames.push({height:h, offset:Math.min(1, arrival / total)});
      frames.push({height:h, offset:Math.min(1, (arrival + HOLD) / total)});
      const delay = Math.round(arrival) + 'ms';
      point.node.style.setProperty('--arrow-delay', delay);
      point.stat.style.setProperty('--arrow-delay', delay);
    });

    titles.forEach(node => {
      const b = layoutBox(node);
      const y = b.y + b.height / 2;
      const q = Math.min(1, Math.max(0, (y - metricEnd) / Math.max(1, end - metricEnd)));
      const arrival = metricClock + q * CONTINUE;
      node.style.setProperty('--arrow-delay', Math.round(arrival) + 'ms');
    });

    frames.push({height:metricSpan.toFixed(2) + 'px', offset:Math.min(1, metricClock / total)});
    frames.push({height:height.toFixed(2) + 'px', offset:1});
    timeline = {height, total, frames};

    if (reduce || axisDone) axis.style.height = height.toFixed(2) + 'px';
    return timeline;
  }

  function playArrow(){
    const data = measureArrow();
    if (!data) return;
    axisAnimation?.cancel();
    axis.style.height = '0px';
    axisAnimation = axis.animate(data.frames, {
      duration:data.total,
      easing:'linear',
      fill:'forwards'
    });
    axisAnimation.finished.then(() => {
      axisDone = true;
      const finalData = measureArrow() || data;
      axis.style.height = finalData.height.toFixed(2) + 'px';
      axisAnimation?.cancel();
      axisAnimation = null;
    }).catch(() => {});
  }

  function activate(){
    if (started) return;
    started = true;
    if (!mq.matches) return;
    measureArrow();
    home.classList.add('mobile-arrow-on');
    if (reduce){
      axisDone = true;
      axis.style.height = 'var(--mobile-arrow-h)';
    } else {
      playArrow();
    }
  }

  function sync(){
    if (!mq.matches) return;
    measureArrow();
    home.classList.add('mobile-arrow-ready');
    if (reduce){
      started = true;
      axisDone = true;
      axis.style.height = 'var(--mobile-arrow-h)';
      home.classList.add('mobile-arrow-on');
    } else if (started){
      home.classList.add('mobile-arrow-on');
      if (axisDone) axis.style.height = 'var(--mobile-arrow-h)';
    }
  }

  const EVENTS = ['scroll','wheel','pointerdown','pointermove','keydown','touchstart'];
  EVENTS.forEach(type => addEventListener(type, activate, {passive:true, once:true}));

  let measureRAF = 0;
  const scheduleMeasure = () => {
    if (measureRAF) cancelAnimationFrame(measureRAF);
    measureRAF = requestAnimationFrame(() => {
      measureRAF = requestAnimationFrame(() => {
        measureRAF = 0;
        const data = measureArrow();
        if (axisDone && data) axis.style.height = data.height.toFixed(2) + 'px';
      });
    });
  };

  mq.addEventListener?.('change', sync);
  addEventListener('resize', scheduleMeasure, {passive:true});
  addEventListener('orientationchange', scheduleMeasure, {passive:true});
  document.fonts?.ready.then(() => {
    requestAnimationFrame(() => requestAnimationFrame(sync));
  });

  if (typeof ResizeObserver === 'function'){
    const ro = new ResizeObserver(scheduleMeasure);
    ro.observe(home);
    ro.observe(arc);
    ro.observe(home.querySelector('.narr__stats'));
    ro.observe(home.querySelector('.arcade'));
    metricStats.forEach(el => ro.observe(el));
    titles.forEach(el => ro.observe(el));
  }

  requestAnimationFrame(() => requestAnimationFrame(sync));
})();

/* ========================================================================== */
/* Fonte original: hero-5to1-b2b-js */
/* ========================================================================== */
(() => {
  'use strict';

  const home = document.querySelector('.view[data-view="home"] .home');
  const zone = home && home.querySelector('.narr-zone');
  if (!home || !zone) return;

  const narr = zone.querySelector('.narr');
  const arc = zone.querySelector('.arc');
  const head = zone.querySelector('.bio__head');
  const name = zone.querySelector('.bio__name');
  const stats = [...zone.querySelectorAll('.narr__stat')];
  if (!narr || !arc || !head || !name || stats.length !== 5) return;

  const mq = matchMedia('(max-width:820px)');
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const numbers = stats.map(stat => stat.querySelector('.narr__n'));
  if (numbers.some(n => !n)) return;

  let axis = narr.querySelector('.hero-cross-axis');
  if (!axis){
    axis = document.createElement('span');
    axis.className = 'hero-cross-axis';
    axis.setAttribute('aria-hidden','true');
    narr.appendChild(axis);
  }
  let link = narr.querySelector('.hero-cross-link');
  if (!link){
    link = document.createElement('span');
    link.className = 'hero-cross-link';
    link.setAttribute('aria-hidden','true');
    narr.appendChild(link);
  }

  const detailOf = stat => stat.querySelector('.narr__detail');
  const buttonOf = stat => stat.querySelector('button.narr__n');
  const detailStats = stats.filter(stat => detailOf(stat) && buttonOf(stat));

  function closeAll(){
    detailStats.forEach(stat => {
      const detail = detailOf(stat);
      const button = buttonOf(stat);
      stat.classList.remove('is-open');
      detail.hidden = true;
      detail.setAttribute('aria-hidden','true');
      button.setAttribute('aria-expanded','false');
    });
  }

  detailStats.forEach(stat => {
    const button = buttonOf(stat);
    const detail = detailOf(stat);
    button.addEventListener('click', () => {
      if (mq.matches) return;
      const shouldOpen = detail.hidden;
      closeAll();
      if (shouldOpen){
        stat.classList.add('is-open');
        detail.hidden = false;
        detail.setAttribute('aria-hidden','false');
        button.setAttribute('aria-expanded','true');
      }
    });
  });

  let geometry = null;
  let played = false;
  let axisAnimation = null;
  let linkAnimation = null;
  let raf = 0;

  function expandedHeights(){
    return stats.map(stat => {
      const detail = detailOf(stat);
      if (!detail) return Math.ceil(stat.getBoundingClientRect().height);
      const wasHidden = detail.hidden;
      const oldVisibility = detail.style.visibility;
      detail.hidden = false;
      detail.style.visibility = 'hidden';
      const h = Math.ceil(stat.getBoundingClientRect().height);
      detail.style.visibility = oldVisibility;
      detail.hidden = wasHidden;
      return h;
    });
  }

  function layout(){
    if (mq.matches) return null;

    const zr = zone.getBoundingClientRect();
    const ar = arc.getBoundingClientRect();
    const hr = head.getBoundingClientRect();
    const nr = name.getBoundingClientRect();

    const axisX = ar.left - zr.left + ar.width / 2;
    const springY = ar.bottom - zr.top;
    const arcTop = ar.top - zr.top;
    narr.style.setProperty('--cross-axis-x', axisX.toFixed(2) + 'px');

    /* Mede todas as estações no estado expandido para que abrir uma
       legenda nunca invada a estação seguinte. */
    const heights = expandedHeights();
    const safeArc = Math.max(18, Math.min(28, innerWidth * .014));
    const safeTop = hr.bottom - zr.top + 20;
    const bottomEdge = arcTop - safeArc;

    const pack = gap => {
      const tops = new Array(stats.length);
      tops[0] = bottomEdge - heights[0];
      for (let i = 1; i < stats.length; i++){
        tops[i] = tops[i - 1] - gap - heights[i];
      }
      return tops;
    };

    let gap = 14;
    let tops = pack(gap);
    const spare = tops[4] - safeTop;
    if (spare > 0){
      gap += Math.min(24, spare / 4);
      tops = pack(gap);
    }
    if (tops[4] < safeTop){
      const deficit = safeTop - tops[4];
      gap = Math.max(7, gap - deficit / 4);
      tops = pack(gap);
    }

    stats.forEach((stat, i) => {
      stat.style.setProperty('--cross-top', tops[i].toFixed(2) + 'px');
    });

    const points = stats.map((stat, i) => {
      const numberRect = numbers[i].getBoundingClientRect();
      return tops[i] + numberRect.height / 2;
    });

    const axisTop = points[4];
    const axisHeight = Math.max(1, springY - axisTop);
    axis.style.left = (axisX - .5).toFixed(2) + 'px';
    axis.style.top = axisTop.toFixed(2) + 'px';
    axis.style.height = axisHeight.toFixed(2) + 'px';

    /* A transversal do 1 cresce em direção à identidade, mas para
       antes do nome. O topo da estação já está abaixo de bio__head. */
    const nameRight = nr.right - zr.left;
    const targetX = Math.max(0, Math.min(axisX - 56, nameRight + 24));
    link.style.left = targetX.toFixed(2) + 'px';
    link.style.top = (points[4] - .5).toFixed(2) + 'px';
    link.style.width = Math.max(0, axisX - targetX).toFixed(2) + 'px';

    geometry = { points, axisTop, axisHeight, springY };
    return geometry;
  }

  function scheduleLayout(){
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      raf = 0;
      layout();
    });
  }

  function play(){
    if (played || mq.matches) return;
    const g = layout();
    if (!g) return;

    const DRAW = 2200;
    const HOLD = 120;
    const total = DRAW + HOLD * 5;
    const arrivals = g.points.map((point, i) => {
      const progress = Math.max(0, Math.min(1, (g.springY - point) / g.axisHeight));
      return progress * DRAW + i * HOLD;
    });

    stats.forEach((stat, i) => {
      stat.style.setProperty('--cross-delay', Math.max(0, arrivals[i] - 120).toFixed(0) + 'ms');
    });

    played = true;
    home.classList.add('cross-sequence');

    if (reduce){
      axis.style.transform = 'scaleY(1)';
      link.style.transform = 'scaleX(1)';
      return;
    }

    const frames = [{ transform:'scaleY(0)', offset:0 }];
    g.points.forEach((point, i) => {
      const progress = Math.max(0, Math.min(1, (g.springY - point) / g.axisHeight));
      const arrival = arrivals[i];
      frames.push({ transform:`scaleY(${progress})`, offset:Math.max(0, Math.min(1, arrival / total)) });
      frames.push({ transform:`scaleY(${progress})`, offset:Math.max(0, Math.min(1, (arrival + HOLD) / total)) });
    });

    axisAnimation?.cancel();
    linkAnimation?.cancel();
    axisAnimation = axis.animate(frames, {
      duration:total,
      easing:'linear',
      fill:'forwards'
    });

    linkAnimation = link.animate(
      [{ transform:'scaleX(0)' }, { transform:'scaleX(1)' }],
      {
        duration:420,
        delay:arrivals[4],
        easing:'cubic-bezier(.22,1,.36,1)',
        fill:'forwards'
      }
    );
  }

  function syncMode(){
    if (mq.matches){
      detailStats.forEach(stat => {
        const detail = detailOf(stat);
        const button = buttonOf(stat);
        stat.classList.remove('is-open');
        detail.hidden = false;
        detail.setAttribute('aria-hidden','false');
        button.setAttribute('aria-expanded','true');
      });
      return;
    }

    closeAll();
    requestAnimationFrame(() => {
      layout();
      if (home.classList.contains('narr-on')) play();
      else if (played){
        axis.style.transform = 'scaleY(1)';
        link.style.transform = 'scaleX(1)';
        home.classList.add('cross-sequence');
      }
    });
  }

  home.classList.add('hero-cross-ready');
  syncMode();

  const mo = new MutationObserver(() => {
    if (home.classList.contains('narr-on')) play();
  });
  mo.observe(home, { attributes:true, attributeFilter:['class'] });

  mq.addEventListener?.('change', syncMode);
  addEventListener('resize', scheduleLayout, { passive:true });
  addEventListener('orientationchange', scheduleLayout, { passive:true });
  document.fonts?.ready.then(() => requestAnimationFrame(scheduleLayout));

  if (typeof ResizeObserver === 'function'){
    const ro = new ResizeObserver(scheduleLayout);
    ro.observe(zone);
    ro.observe(arc);
    ro.observe(head);
    ro.observe(name);
  }

  if (!mq.matches && home.classList.contains('narr-on')) play();
})();

/* ========================================================================== */
/* Fonte original: hero-5to1-b2b-v2-js */
/* ========================================================================== */
(() => {
  'use strict';

  const home = document.querySelector('.view[data-view="home"] .home');
  const zone = home && home.querySelector('.narr-zone');
  if (!home || !zone) return;

  const narr = zone.querySelector('.narr');
  const arc = zone.querySelector('.arc');
  const head = zone.querySelector('.bio__head');
  const heroTxt = zone.querySelector('.hero__txt');
  const stats = ['5','4','3','2','1'].map(step => zone.querySelector(`.narr__stat[data-step="${step}"]`));
  if (!narr || !arc || !head || stats.some(stat => !stat)) return;

  const numbers = stats.map(stat => stat.querySelector('.narr__n'));
  if (numbers.some(number => !number)) return;

  const mq = matchMedia('(max-width:820px)');
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const clamp = (min, value, max) => Math.max(min, Math.min(max, value));

  const segments = Array.from({length:5}, (_, i) => {
    let el = narr.querySelector(`.hero-v2-seg[data-seg="${i}"]`);
    if (!el){
      el = document.createElement('span');
      el.className = 'hero-v2-seg';
      el.dataset.seg = String(i);
      el.setAttribute('aria-hidden','true');
      narr.appendChild(el);
    }
    return el;
  });

  let link = narr.querySelector('.hero-v2-link');
  if (!link){
    link = document.createElement('span');
    link.className = 'hero-v2-link';
    link.setAttribute('aria-hidden','true');
    narr.appendChild(link);
  }

  function layoutBox(el){
    let x = 0, y = 0, node = el;
    while (node && node !== zone){
      x += node.offsetLeft || 0;
      y += node.offsetTop || 0;
      node = node.offsetParent;
    }
    if (node === zone){
      const width = el.offsetWidth || 0;
      const height = el.offsetHeight || 0;
      return {x, y, width, height, right:x + width, bottom:y + height};
    }
    const zr = zone.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return {x:r.left-zr.left, y:r.top-zr.top, width:r.width, height:r.height,
            right:r.right-zr.left, bottom:r.bottom-zr.top};
  }

  function alturaEmRepouso(stat){
    const detail = stat.querySelector('.narr__detail');
    if (!detail) return stat.offsetHeight || 1;
    const wasHidden = detail.hidden;
    const wasOpen = stat.classList.contains('is-open');
    detail.hidden = true;
    stat.classList.remove('is-open');
    const h = stat.offsetHeight || 1;
    detail.hidden = wasHidden;
    stat.classList.toggle('is-open', wasOpen);
    return h;
  }

  function expandedHeight(stat){
    const detail = stat.querySelector('.narr__detail');
    if (!detail) return stat.offsetHeight || 1;
    const wasHidden = detail.hidden;
    const wasOpen = stat.classList.contains('is-open');
    const oldVisibility = detail.style.visibility;
    detail.hidden = false;
    stat.classList.add('is-open');
    detail.style.visibility = 'hidden';
    const h = stat.offsetHeight || 1;
    detail.style.visibility = oldVisibility;
    detail.hidden = wasHidden;
    stat.classList.toggle('is-open', wasOpen);
    return h;
  }

  let played = false;
  let raf = 0;

  function layout(){
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      if (mq.matches){
        home.classList.remove('hero-v2-ready');
        stats.forEach(stat => stat.style.removeProperty('translate'));
        return;
      }

      home.classList.add('hero-v2-ready');
      stats.forEach(stat => stat.style.removeProperty('translate'));

      const ar = layoutBox(arc);
      const hr = layoutBox(head);
      if (!ar || !hr) return;

      /* (c) A coluna nasce a direita da coluna de texto e fecha na margem
         direita da pagina, como a faixa de cabecalho. */
      /* A coluna mede pela zona, nao pelo arco: o arco desconta a barra de
         rolagem e fecha 5px antes da margem da pagina. O cabecalho usa a
         zona, e a coluna tem de fechar na mesma linha que ele. */
      const zBox = zone.getBoundingClientRect();
      const zw = zBox.width;
      /* O eixo que sobe parte do segundo pilar da arcada — o mesmo x de onde
         a linha desce da nascenca. Nao e proporcao: e a coluna do meio. */
      const arcadeMovs = document.querySelectorAll('.view[data-view="home"] .arcade .mov');
      const numWInicial = numbers[0].offsetWidth || 1;
      const pilar2 = arcadeMovs[1]
        ? arcadeMovs[1].getBoundingClientRect().left - zBox.left
        : zw * .37 + numWInicial / 2;
      /* Primeira passagem: assenta o grid no eixo para obter a largura final
         do algarismo. A centralizacao acontece depois dessa medida. */
      const colLeft = pilar2;
      const springY = ar.bottom;
      /* Folga ate o arco. O piso era ar.y — o topo da CAIXA do svg, que
         comeca cerca de 65px acima da tinta da curva. O 1 parava no ar
         guardando distancia de uma borda invisivel, e o vao desperdicado
         saia dos quatro intervalos, que e onde ele fazia falta. Mede-se
         agora a curva de fora, que e o que o olho enxerga; a folga cresce na
         mesma proporcao porque agora ela e contada da linha certa. */
      const curvaExterna = arc.querySelector('.extra') || arc;
      const arcTinta = curvaExterna.getBoundingClientRect().top - zBox.top;
      const safeArc = clamp(24, innerWidth * .022, 42);
      const bottomEdge = arcTinta - safeArc;
      /* Alturas do estado padrao, nao do expandido. Reservar o expandido
         deixava a coluna terminando ~100px acima do arco em repouso, que e o
         que se ve quase sempre. Como os blocos sao absolutos, abrir um nao
         empurra o seguinte: o unico custo e o ultimo bloco crescer alguns
         pixels em direcao ao arco, dentro da folga. */
      const heights = stats.map(alturaEmRepouso);
      const totalHeight = heights.reduce((sum, h) => sum + h, 0);

      /* O topo da coluna e o topo do Itinerario: as duas colunas partem da
         mesma margem. Da para o pe do arco, os cinco numeros repartem a
         sobra — a coluna cabe inteira, sem depender de colapsar detalhe. */
      const alvoTopo = (heroTxt && heroTxt.querySelector('.mov__h')) || heroTxt;
      const tr = alvoTopo ? layoutBox(alvoTopo) : null;
      const topStart = tr ? tr.y : hr.bottom;
      const rawGap = (bottomEdge - topStart - totalHeight) / 4;
      /* respiro entre os BLOCOS — meio termo entre o apertado de antes e o
         espacado que empurrava o 1 contra o arco. O intervalo interno de cada
         bloco (rotulo + texto) nao e tocado aqui. */
      /* Sem teto: os dois extremos sao ancoras — o 5 na caixa alta do
         Itinerario e o 1 a distancia fixa do arco, descendo com ele. O que
         sobra entre elas reparte-se igualmente pelos quatro intervalos. Um
         teto quebraria a ancora de baixo em tela alta: o 1 pararia de
         acompanhar a curva. */
      const gap = Math.max(16, rawGap);

      /* Leitura 5 -> 1, de cima para baixo, na ordem do DOM. */
      const tops = new Array(5);
      tops[0] = topStart;
      for (let i = 1; i < 5; i++){
        tops[i] = tops[i - 1] + heights[i - 1] + gap;
      }

      const colWidth = zw - colLeft;
      stats.forEach((stat, i) => {
        stat.style.setProperty('--hero-v2-left', colLeft.toFixed(2) + 'px');
        stat.style.setProperty('--hero-v2-top', tops[i].toFixed(2) + 'px');
        stat.style.setProperty('--hero-v2-width', colWidth.toFixed(2) + 'px');
      });

      /* A caixa resultante nao pousa exatamente na coordenada pedida — sobra
         o offset do proprio item na lista. Em vez de adivinhar de onde vem,
         mede-se o desvio uma vez e desconta-se. */
      const zr0 = stats[0].getBoundingClientRect();
      const nr0 = numbers[0].getBoundingClientRect();
      const zz = zone.getBoundingClientRect();
      /* Alinha a caixa alta do algarismo com a do "Itinerario" — e o topo da
         letra que o olho compara. O alvo e relido agora, nao o capturado no
         inicio da passada: a ficha pode ter assentado no meio do caminho e
         empurrado o titulo, e a coluna tem de seguir a posicao atual. */
      const alvoAgora = alvoTopo
        ? alvoTopo.getBoundingClientRect().top - zz.top
        : tops[0];
      const desvioX = (zr0.left - zz.left) - colLeft;

      /* Duas ancoras, nao uma: em cima a caixa alta do algarismo encontra a
         do "Itinerario"; embaixo o ultimo bloco guarda distancia fixa do arco
         e desce com ele. Deslocar a coluna inteira so satisfaz uma das duas —
         o intervalo tem de ser recalculado entre as duas posicoes reais, e ai
         o que sobra reparte-se igualmente pelos quatro. */
      /* As contas acima estao em coordenada da zona; --hero-v2-top e lida pelo
         pai posicionado, que nao coincide com ela. O desvio e medido na
         primeira passada e descontado nos dois extremos — como e o mesmo nos
         dois, o intervalo entre eles nao muda. */
      const desvioCaixa = (zr0.top - zz.top) - tops[0];
      const dentroDoBloco = nr0.top - zr0.top;
      const topo0 = alvoAgora - dentroDoBloco - desvioCaixa;
      const topo4 = bottomEdge - heights[4] - desvioCaixa;
      const somaMeio = heights[0] + heights[1] + heights[2] + heights[3];
      const gapFinal = Math.max(16, (topo4 - topo0 - somaMeio) / 4);
      const finais = new Array(5);
      finais[0] = topo0;
      for (let i = 1; i < 5; i++){
        finais[i] = finais[i - 1] + heights[i - 1] + gapFinal;
      }
      stats.forEach((stat, i) => {
        stat.style.setProperty('--hero-v2-top', finais[i].toFixed(2) + 'px');
      });
      /* O alinhamento e da unidade completa, nao do desenho isolado de cada
         glifo. O avanco tabular ja oferece uma caixa comum aos cinco digitos;
         limpando os transforms individuais, numero e conteudo permanecem no
         mesmo sistema de coordenadas e cruzam o eixo pelo centro. */
      numbers.forEach(numero => {
        numero.style.transform = 'none';
      });

      /* Segunda passagem: a largura agora e a definitiva do grid. O eixo nao
         se move; cada bloco inteiro recua meia largura do numeral. O desvio
         da caixa ancestral e descontado da variavel de posicao, e a largura
         cresce na mesma medida para a borda direita continuar na margem. */
      void zone.offsetHeight;
      const numW = numbers[0].getBoundingClientRect().width;
      const blocoLeft = pilar2 - numW / 2;
      const ajusteEntreCaixas = 2.06;
      const blocoVarLeft = blocoLeft - desvioX;
      const blocoWidth = zw - blocoLeft;
      stats.forEach(stat => {
        stat.style.setProperty('--hero-v2-left', blocoVarLeft.toFixed(2) + 'px');
        stat.style.setProperty('--hero-v2-width', blocoWidth.toFixed(2) + 'px');
        stat.style.translate = (-ajusteEntreCaixas).toFixed(2) + 'px 0';
      });

      const axisX = pilar2;

      void zone.offsetHeight;
      const numberBoxes = numbers.map(layoutBox);
      let lower = springY;
      const interruption = 5;
      const segmentHeights = [];

      segments.forEach((seg, i) => {
        const nb = numberBoxes[i];
        const top = nb.bottom + interruption;
        const height = Math.max(0, lower - top);
        seg.style.left = (axisX - .5).toFixed(2) + 'px';
        seg.style.top = top.toFixed(2) + 'px';
        seg.style.height = height.toFixed(2) + 'px';
        segmentHeights.push(height);
        lower = nb.y - interruption;
      });

      const n1 = numberBoxes[4];
      const n1CenterY = n1.y + n1.height / 2;
      const linkWidth = clamp(48, innerWidth * .042, 72);
      link.style.left = (axisX - linkWidth).toFixed(2) + 'px';
      link.style.top = (n1CenterY - .5).toFixed(2) + 'px';
      link.style.width = linkWidth.toFixed(2) + 'px';

      const DRAW = 2200;
      const HOLD = 120;
      const totalLine = Math.max(1, segmentHeights.reduce((sum, h) => sum + h, 0));
      let cursor = 0;
      segmentHeights.forEach((height, i) => {
        const duration = Math.max(160, DRAW * (height / totalLine));
        segments[i].style.setProperty('--hero-v2-seg-delay', cursor.toFixed(0) + 'ms');
        segments[i].style.setProperty('--hero-v2-dur', duration.toFixed(0) + 'ms');
        const arrival = cursor + duration;
        stats[i].style.setProperty('--hero-v2-delay', Math.max(0, arrival - 80).toFixed(0) + 'ms');
        cursor = arrival + HOLD;
      });
      link.style.setProperty('--hero-v2-link-delay', cursor.toFixed(0) + 'ms');

      if (played) home.classList.add('hero-v2-play');
    });
  }

  /* os cinco, agora: o passo 1 deixou de ser rotulo solto e ganhou conteudo */
  stats.forEach((stat, i) => {
    const button = numbers[i];
    const detail = stat.querySelector('.narr__detail');
    if (!detail || button.tagName !== 'BUTTON') return;

    const set = shouldOpen => {
      if (mq.matches) return;
      detail.hidden = !shouldOpen;
      stat.classList.toggle('is-open', shouldOpen);
      detail.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');
      button.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    };

    /* Passar o cursor ja abre; o clique fixa, para quem quiser ler sem
       manter o ponteiro parado. Teclado usa foco, pelo mesmo caminho. */
    stat.addEventListener('pointerenter', () => { if (!stat.dataset.fixo) set(true); });
    stat.addEventListener('pointerleave', () => { if (!stat.dataset.fixo) set(false); });
    stat.addEventListener('focusin', () => set(true));
    stat.addEventListener('focusout', () => { if (!stat.dataset.fixo) set(false); });

    button.addEventListener('click', event => {
      if (mq.matches) return;
      event.stopImmediatePropagation();
      if (stat.dataset.fixo){ delete stat.dataset.fixo; set(false); }
      else { stat.dataset.fixo = '1'; set(true); }
    }, true);
  });

  function play(){
    if (played || mq.matches) return;
    played = true;
    home.classList.add('narr-on');
    layout();
    requestAnimationFrame(() => home.classList.add('hero-v2-play'));
  }

  const triggers = ['scroll','wheel','pointerdown','pointermove','keydown','touchstart'];
  const activate = () => {
    play();
    triggers.forEach(type => window.removeEventListener(type, activate));
  };

  if (reduce){
    played = true;
    home.classList.add('narr-on','hero-v2-play');
  } else {
    triggers.forEach(type => window.addEventListener(type, activate, {passive:true}));
  }

  layout();
  requestAnimationFrame(layout);
  window.addEventListener('resize', layout, {passive:true});
  mq.addEventListener?.('change', layout);
  document.fonts?.ready?.then(layout);

  if (typeof ResizeObserver === 'function'){
    const ro = new ResizeObserver(layout);
    ro.observe(zone);
    ro.observe(arc);
    ro.observe(head);
    /* o topo da coluna e o topo do Itinerario, e o Itinerario desce quando a
       ficha muda de altura: os dois precisam reposicionar a coluna */
    if (heroTxt) ro.observe(heroTxt);
    const ficha = zone.querySelector('.bio');
    if (ficha) ro.observe(ficha);
  }
})();

/* ========================================================================== */
/* Fonte original: hero-rail-b2b-v3-js */
/* ========================================================================== */
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
    const dataN = dataLink.querySelector('.n');
    const on = () => {
      dataLink.classList.add('is-data-hover');
      dataLink.style.setProperty('color','#00455D','important');
      dataN?.style.setProperty('color','#00455D','important');
    };
    const off = () => {
      dataLink.classList.remove('is-data-hover');
      dataLink.style.removeProperty('color');
      dataN?.style.removeProperty('color');
    };
    dataLink.addEventListener('mouseenter', on);
    dataLink.addEventListener('pointerenter', on);
    dataLink.addEventListener('mouseleave', off);
    dataLink.addEventListener('pointerleave', off);
    dataLink.addEventListener('focus', on);
    dataLink.addEventListener('blur', off);
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

      /* O alinhamento entre ARCO e o nome deixou de ser medido: rail e
         conteudo partem do mesmo --home-top e as duas caixas sao aparadas na
         caixa alta, entao a linha e a mesma por construcao. Medir aqui so
         reintroduzia dependencia de quando o script roda — foi o que fez o
         rail sumir ao recarregar a pagina rolada. */
      rail.classList.toggle('hero-v3-rail-ready', mqSideRail.matches);
      rail.style.removeProperty('--hero-v3-rail-shift');

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
