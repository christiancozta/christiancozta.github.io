/* ==========================================================================
   ARCO — do arco tensionado ao arco arquitetônico
   --------------------------------------------------------------------------
   repouso → tensão → formação → interação (pré-seleção, seleção, alternância).
   A seleção não altera URL nem favicon. Só "Abrir DATA/ECHO/ATRIO/PLAY/CERNE"
   navega, pelo mesmo roteador do cordão (histórico, âncora e favicon).
   ========================================================================== */
(() => {
  "use strict";

  const root = document.getElementById("arco-arquitetura");
  if (!root) return;

  const homeView = root.closest('.view[data-view="home"]');
  const crown = root.querySelector(".arx-crown");
  const extra = root.querySelector(".arx-arc__extra");
  const intra = root.querySelector(".arx-arc__intra");
  const field = root.querySelector(".arx-arc__field");
  const cols = [...root.querySelectorAll(".arx-col[data-sys]")];
  const heads = cols.map(col => col.querySelector(".arx-col__head"));
  const sums = [...root.querySelectorAll(".arx-sum[data-sys]")];
  const summary = root.querySelector(".arx-summary");
  if (!crown || !extra || !intra || !field || cols.length !== 3 || heads.some(h => !h) || !summary) return;

  const SYSTEMS = ["data", "echo", "atrio"];
  const KEY_FORMED = "arco:arx:formed";
  const KEY_SEL = "arco:arx:sel";
  const reduceMq = matchMedia("(prefers-reduced-motion: reduce)");
  const reduced = () => reduceMq.matches;

  const store = {
    get(key){ try { return sessionStorage.getItem(key) || ""; } catch { return ""; } },
    set(key, value){ try { sessionStorage.setItem(key, value); } catch {} }
  };

  /* ------------------------------------------------------------------
     Geometria da curva (viewBox 1000×238). k = 0 é o desenho original;
     k > 0 puxa o extradorso e o intradorso para cima, como a corda puxada.
     ------------------------------------------------------------------ */
  const PULL = 118;
  const drawArc = k => {
    const e = (-20 - PULL * k).toFixed(2);
    const i = (45 - PULL * .82 * k).toFixed(2);
    extra.setAttribute("d", `M0,238 C180,${e} 820,${e} 1000,238`);
    intra.setAttribute("d", `M0,238 C205,${i} 795,${i} 1000,238`);
    field.setAttribute("d", `M0,238 C180,${e} 820,${e} 1000,238 Z`);
  };

  const tween = (ms, step) => new Promise(resolve => {
    const t0 = performance.now();
    const frame = now => {
      const t = Math.min(1, (now - t0) / ms);
      step(t);
      if (t < 1) requestAnimationFrame(frame);
      else resolve();
    };
    requestAnimationFrame(frame);
  });
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  /* soltura amortecida: passa um pouco do repouso e assenta */
  const release = t => Math.exp(-5.2 * t) * Math.cos(Math.PI * 2.6 * t) * (1 - t * t * t);

  /* ------------------------------------------------------------------
     02 — TENSÃO E FORMAÇÃO
     ------------------------------------------------------------------ */
  let state = root.dataset.state || "rest";
  const setState = value => { state = value; root.dataset.state = value; };

  const finishFormation = () => {
    setState("formed");
    store.set(KEY_FORMED, "1");
    restoreSelection();
  };

  let forming = false;
  const form = async ({animate = true} = {}) => {
    if (state !== "rest" || forming) return;
    /* a formação só acontece sob o olho: nunca com o ARCO fora de vista */
    if (homeView && homeView.dataset.active !== "true") return;
    forming = true;
    disarmIntent();

    if (!animate || reduced()){
      drawArc(0);
      finishFormation();
      forming = false;
      return;
    }

    setState("tension");
    await tween(520, t => drawArc(easeOutCubic(t)));
    /* devolvida a corda, a estrutura começa a se formar */
    setState("forming");
    await tween(900, t => drawArc(release(t)));
    drawArc(0);
    await new Promise(resolve => setTimeout(resolve, 900));
    finishFormation();
    forming = false;
  };

  /* primeira tentativa de rolagem — nunca bloqueia a rolagem */
  const INTENT_KEYS = new Set(["ArrowDown", "PageDown", "End", " ", "Spacebar"]);
  const onWheel = event => { if (event.deltaY > 0) form(); };
  const onTouchMove = () => form();
  const onKey = event => {
    if (INTENT_KEYS.has(event.key) && !event.target.closest?.("input,textarea,select,[contenteditable]")) form();
  };
  const onScroll = () => { if (window.scrollY > 4) form(); };
  let intentArmed = false;
  const armIntent = () => {
    if (intentArmed || state !== "rest") return;
    intentArmed = true;
    addEventListener("wheel", onWheel, {passive:true});
    addEventListener("touchmove", onTouchMove, {passive:true});
    addEventListener("keydown", onKey);
    addEventListener("scroll", onScroll, {passive:true});
  };
  function disarmIntent(){
    if (!intentArmed) return;
    intentArmed = false;
    removeEventListener("wheel", onWheel);
    removeEventListener("touchmove", onTouchMove);
    removeEventListener("keydown", onKey);
    removeEventListener("scroll", onScroll);
  }

  /* ------------------------------------------------------------------
     03 — PRÉ-SELEÇÃO (hover, foco, toque)
     ------------------------------------------------------------------ */
  let selected = "";
  let preview = "";

  const crownTheme = () => {
    const theme = preview || selected;
    if (theme) root.dataset.crown = theme;
    else delete root.dataset.crown;
  };

  const setPreview = sys => {
    if (state !== "formed" && state !== "forming") sys = "";
    if (sys === selected) sys = "";
    preview = sys;
    root.dataset.preview = sys;
    cols.forEach(col => col.classList.toggle("is-preview", col.dataset.sys === sys));
    crownTheme();
  };

  let hovered = null;
  const keyboardFocused = () =>
    heads.find(head => head === document.activeElement && head.matches(":focus-visible"));

  cols.forEach((col, index) => {
    const sys = col.dataset.sys;
    const head = heads[index];

    col.addEventListener("pointerenter", event => {
      if (event.pointerType === "touch") return;
      hovered = col;
      setPreview(sys);
    });
    col.addEventListener("pointerleave", event => {
      if (event.pointerType === "touch") return;
      if (hovered === col) hovered = null;
      const focused = keyboardFocused();
      setPreview(focused ? focused.closest(".arx-col").dataset.sys : "");
    });

    /* toque: pressionar antecipa, soltar confirma */
    col.addEventListener("pointerdown", event => {
      if (event.pointerType === "touch" && !event.target.closest(".arx-story,[data-datum]")) setPreview(sys);
    });
    col.addEventListener("pointercancel", () => { if (!hovered) setPreview(""); });

    head.addEventListener("focus", () => {
      /* chegar às colunas pelo teclado também é avançar no percurso */
      if (state === "rest") form();
      if (head.matches(":focus-visible")) setPreview(sys);
    });
    head.addEventListener("blur", () => {
      setPreview(hovered ? hovered.dataset.sys : "");
    });

    /* a coluna inteira seleciona; a leitura conceitual e o dado de lastro
       guardam seus próprios gestos */
    col.addEventListener("click", event => {
      if (event.target.closest(".arx-story,[data-datum]")) return;
      if (state === "rest") form({animate:false});
      select(sys, {animate:true});
    });

    /* teclado: setas percorrem os capitéis; Enter/Espaço confirmam (botão) */
    head.addEventListener("keydown", event => {
      let next = -1;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % cols.length;
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index + cols.length - 1) % cols.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = cols.length - 1;
      if (event.key === "Escape"){ setPreview(""); return; }
      if (next < 0) return;
      event.preventDefault();
      event.stopPropagation();
      heads[next].focus();
    });
  });

  /* leitura conceitual dentro do texto justificado: inline, quebra como
     palavra; Enter e Espaço abrem o diálogo como um botão */
  root.querySelectorAll(".arx-story[role='button']").forEach(story => {
    story.addEventListener("keydown", event => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      event.stopPropagation();
      story.click();
    });
  });

  /* ------------------------------------------------------------------
     04/05 — SELEÇÃO, EXPANSÃO E ALTERNÂNCIA
     A estrutura não sai do lugar: só o conteúdo troca, com a altura
     travada e então conduzida até a nova medida.
     ------------------------------------------------------------------ */
  let swapToken = 0;
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  const paint = sys => {
    root.dataset.sel = sys;
    cols.forEach((col, i) => {
      const on = col.dataset.sys === sys;
      col.classList.toggle("is-selected", on);
      heads[i].setAttribute("aria-pressed", String(on));
    });
    sums.forEach(sum => sum.classList.toggle("is-on", sum.dataset.sys === sys));
  };

  const animateHeight = async (from, to, token) => {
    if (reduced() || Math.abs(from - to) < 2){
      summary.style.height = "";
      summary.classList.add("is-resting");
      return;
    }
    summary.classList.remove("is-resting");
    summary.style.height = `${from}px`;
    void summary.offsetHeight;
    summary.style.transition = "height 620ms cubic-bezier(.22,1,.36,1)";
    summary.style.height = `${to}px`;
    await wait(640);
    if (token !== swapToken) return;
    summary.style.transition = "";
    summary.style.height = "";
    summary.classList.add("is-resting");
  };

  async function select(sys, {animate = true, persist = true} = {}){
    if (!SYSTEMS.includes(sys)) return;
    if (persist) store.set(KEY_SEL, sys);
    if (sys === selected){ setPreview(""); return; }

    const token = ++swapToken;
    const first = !selected;
    const motion = animate && !reduced();
    const from = summary.getBoundingClientRect().height;

    if (!first && motion){
      root.classList.add("is-swapping");
      await wait(220);
      if (token !== swapToken) return;
    }

    selected = sys;
    paint(sys);
    setPreview("");

    const to = summary.scrollHeight;
    root.classList.remove("is-swapping");
    if (motion) await animateHeight(first ? 0 : from, to, token);
    else animateHeight(0, 0, token);
  }

  function restoreSelection(){
    const remembered = store.get(KEY_SEL);
    if (SYSTEMS.includes(remembered) && !selected) select(remembered, {animate:false, persist:false});
  }

  /* ------------------------------------------------------------------
     06 — NAVEGAÇÃO: só os acessos "Abrir" mudam de vista
     O cordão já sabe empurrar o histórico, trocar a âncora e o favicon.
     ------------------------------------------------------------------ */
  root.querySelectorAll("[data-arx-open]").forEach(link => {
    link.addEventListener("click", event => {
      const view = link.dataset.arxOpen;
      const trigger = document.querySelector(`.rail__link[data-view="${view}"]`);
      if (!trigger) return;            // sem cordão, o href (#view) faz o trabalho
      event.preventDefault();
      if (selected) store.set(KEY_SEL, selected);
      trigger.click();
    });
  });

  /* Retorno ao ARCO: o estado arquitetônico e a última seleção permanecem.
     Pelo voltar/avançar do navegador, a vista repousa no próprio arco. */
  let lastView = document.querySelector('.view[data-active="true"]')?.dataset.view || "home";
  let returningByHistory = false;
  addEventListener("popstate", () => { returningByHistory = true; });

  const landOnArch = () => {
    const rail = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--rail-h")) || 0;
    const top = crown.getBoundingClientRect().top + window.scrollY - rail - 12;
    window.scrollTo({top:Math.max(0, top), left:0, behavior:"instant"});
  };

  if (homeView){
    new MutationObserver(() => {
      const active = document.querySelector('.view[data-active="true"]')?.dataset.view || "home";
      if (active === lastView) return;
      const cameFromSystem = lastView !== "home";
      lastView = active;

      if (active !== "home"){
        setPreview("");
        hovered = null;
        setTimeout(() => { returningByHistory = false; }, 0);
        return;
      }

      if (state === "rest") armIntent();
      else restoreSelection();

      /* o popstate do cordão dispara antes do nosso: decide no próximo ciclo */
      setTimeout(() => {
        if (cameFromSystem && returningByHistory && state === "formed" && selected){
          requestAnimationFrame(landOnArch);
        }
        returningByHistory = false;
      }, 0);
    }).observe(document.getElementById("stage") || document.body, {
      subtree:true, attributes:true, attributeFilter:["data-active"]
    });
  }

  function isHomeAnchor(hash){
    const id = (hash || "").slice(1);
    if (!id || ["home","echo","play","atrio","cerne","data"].includes(id)) return false;
    let target = null;
    try { target = document.getElementById(decodeURIComponent(id)); } catch {}
    return Boolean(target && homeView && homeView.contains(target));
  }

  /* ------------------------------------------------------------------
     Partida
     ------------------------------------------------------------------ */
  root.dataset.preview = "";
  root.dataset.sel = "";

  if (state !== "rest"){
    /* já formada nesta sessão (ou sem armazenamento disponível) */
    drawArc(0);
    setState("formed");
    restoreSelection();
  } else if (window.scrollY > 4 || isHomeAnchor(location.hash)){
    /* chegada já rolada, ou por âncora da própria home (#repertorio):
       a estrutura nasce formada, sem animação fora do olhar */
    form({animate:false});
  } else {
    armIntent();
  }

  window.__ARCO_ARCH__ = Object.freeze({
    form:() => form({animate:true}),
    select:sys => select(sys, {animate:true}),
    get state(){ return state; },
    get selected(){ return selected; }
  });
})();
