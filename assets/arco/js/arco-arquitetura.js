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
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  /* soltura amortecida: passa um pouco do repouso e assenta */
  const release = t => Math.exp(-5.2 * t) * Math.cos(Math.PI * 2.6 * t) * (1 - t * t * t);

  /* ------------------------------------------------------------------
     GRAFISMO TÉCNICO — caixa de limites, cotas e anotações à mão.
     Coordenadas em pixels da coroa, refeitas a cada mudança de medida
     (inclusive enquanto a coroa cresce na formação).
     ------------------------------------------------------------------ */
  const tech = crown.querySelector(".arx-tech");
  const SVG_NS = "http://www.w3.org/2000/svg";
  const techNodes = new Map();

  /* ponto da curva (viewBox 1000×238) em t, para os chamados das notas */
  const bez = (t, p0, p1, p2, p3) => {
    const u = 1 - t;
    return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
  };
  const onExtra = (t, W, H) => [bez(t, 0, 180, 820, 1000) / 1000 * W, bez(t, 238, -20, -20, 238) / 238 * H];
  const onIntra = (t, W, H) => [bez(t, 0, 205, 795, 1000) / 1000 * W, bez(t, 238, 45, 45, 238) / 238 * H];

  const techNode = (key, tag, cls, delay) => {
    let node = techNodes.get(key);
    if (!node){
      node = document.createElementNS(SVG_NS, tag);
      node.setAttribute("class", cls);
      if (tag === "path") node.setAttribute("pathLength", "1");
      node.style.setProperty("--d", `${delay}ms`);
      tech.appendChild(node);
      techNodes.set(key, node);
    }
    return node;
  };
  const line = (key, cls, delay, pts) => {
    const d = pts.map((pt, i) => `${i ? "L" : "M"}${pt[0].toFixed(1)},${pt[1].toFixed(1)}`).join(" ");
    techNode(key, "path", cls, delay).setAttribute("d", d);
  };
  const label = (key, cls, delay, x, y, text, {anchor = "start", rotate = 0} = {}) => {
    const node = techNode(key, "text", cls, delay);
    node.setAttribute("x", x.toFixed(1));
    node.setAttribute("y", y.toFixed(1));
    node.setAttribute("text-anchor", anchor);
    if (rotate) node.setAttribute("transform", `rotate(${rotate} ${x.toFixed(1)} ${y.toFixed(1)})`);
    else node.removeAttribute("transform");
    if (node.textContent !== text) node.textContent = text;
  };
  const tick = (key, cls, delay, x, y) => line(key, cls, delay, [[x - 4, y + 4], [x + 4, y - 4]]);
  const hide = keys => keys.forEach(key => { techNodes.get(key)?.remove(); techNodes.delete(key); });

  const layoutTech = () => {
    if (!tech) return;
    const W = crown.clientWidth;
    const H = crown.clientHeight;
    if (!W || !H) return;
    const apex = 44.5 / 238 * H;          // fecho do extradorso: limite superior exato
    const ov = 10;                         // traço de construção além do canto
    const roomRight = document.documentElement.clientWidth - crown.getBoundingClientRect().right;
    const wide = W >= 700;

    /* caixa de limites: topo tangente ao fecho e laterais até a nascença */
    line("box-top", "is-box", 380, [[-ov, apex], [W + ov, apex]]);
    line("box-l", "is-box", 380, [[0, apex - ov], [0, H]]);
    line("box-r", "is-box", 380, [[W, apex - ov], [W, H]]);
    /* marca do fecho */
    line("key-v", "is-dim is-in", 900, [[W / 2, apex - 7], [W / 2, apex + 7]]);
    line("key-h", "is-dim is-in", 900, [[W / 2 - 7, apex], [W / 2 + 7, apex]]);
    label("key-t", "is-small is-in", 1500, W / 2 + 12, apex + 19, "fecho");

    /* cota do vão, acima da caixa */
    const yv = apex - 30;
    line("vao-el", "is-ext", 900, [[0, apex - 14], [0, yv - 8]]);
    line("vao-er", "is-ext", 900, [[W, apex - 14], [W, yv - 8]]);
    line("vao", "is-dim", 1000, [[0, yv], [W, yv]]);
    tick("vao-tl", "is-dim", 1200, 0, yv);
    tick("vao-tr", "is-dim", 1200, W, yv);
    label("vao-t", "", 1500, W / 2, yv - 7, wide ? "vão — três movimentos" : "vão", {anchor:"middle"});

    /* nascenças */
    /* dentro do vão, afastada do pé da curva */
    const nx = W * (wide ? .055 : .1);
    label("nasc-l", "is-small is-in", 1600, nx, H - 10, "nascença");
    if (wide) label("nasc-r", "is-small is-in", 1600, W - nx, H - 10, "nascença", {anchor:"end"});
    else hide(["nasc-r"]);

    /* cota da flecha, fora da caixa, quando há margem */
    if (roomRight >= 52){
      const xf = W + 26;
      line("fl-et", "is-ext", 900, [[W + ov + 4, apex], [xf + 8, apex]]);
      line("fl-eb", "is-ext", 900, [[W + 6, H], [xf + 8, H]]);
      line("fl", "is-dim", 1000, [[xf, apex], [xf, H]]);
      tick("fl-tt", "is-dim", 1200, xf, apex);
      tick("fl-tb", "is-dim", 1200, xf, H);
      label("fl-t", "", 1500, xf + 15, (apex + H) / 2, "flecha", {anchor:"middle", rotate:-90});
    } else hide(["fl-et","fl-eb","fl","fl-tt","fl-tb","fl-t"]);

    /* anotações à mão nos tímpanos e sob o intradorso */
    if (wide){
      const [ex, ey] = onExtra(.17, W, H);
      label("ext-t", "", 1650, W * .025, apex + 27, "extradorso", {rotate:-2});
      line("ext-l", "is-lead", 1450, [[W * .025 + 52, apex + 34], [ex, ey]]);

      const [ix, iy] = onIntra(.25, W, H);
      label("int-t", "is-in", 1750, W * .19, H * .8, "intradorso", {rotate:-2});
      line("int-l", "is-lead is-in", 1550, [[W * .19 + 40, H * .8 - 15], [ix, iy + 3]]);

      label("note-1", "", 1850, W * .975, apex + 25, "a flecha tensionou o arco —", {anchor:"end", rotate:-1.5});
      label("note-2", "", 1950, W * .975, apex + 45, "e o arco virou estrutura", {anchor:"end", rotate:-1.5});
    } else hide(["ext-t","ext-l","int-t","int-l","note-1","note-2"]);
  };

  if (tech){
    layoutTech();
    if ("ResizeObserver" in window) new ResizeObserver(layoutTech).observe(crown);
    addEventListener("resize", layoutTech, {passive:true});
    document.fonts?.ready?.then(layoutTech);
  }

  /* ------------------------------------------------------------------
     02 — TENSÃO E FORMAÇÃO
     ------------------------------------------------------------------ */
  let state = root.dataset.state || "rest";
  const setState = value => {
    state = value;
    root.dataset.state = value;
    crownTheme();
  };

  /* depois de um recolhimento, a última seleção não volta sozinha */
  let restoreOnForm = true;
  const finishFormation = () => {
    setState("formed");
    store.set(KEY_FORMED, "1");
    if (restoreOnForm) restoreSelection();
  };

  let forming = false;
  let formToken = 0;
  const form = async ({animate = true, tension = true} = {}) => {
    if (state !== "rest" || forming) return;
    /* a formação só acontece sob o olho: nunca com o ARCO fora de vista */
    if (homeView && homeView.dataset.active !== "true") return;
    forming = true;
    const token = ++formToken;
    disarmIntent();
    setPreview("");

    if (!animate || reduced()){
      drawArc(0);
      finishFormation();
      forming = false;
      return;
    }

    if (tension){
      setState("tension");
      await tween(520, t => drawArc(easeOutCubic(t)));
      /* devolvida a corda, a estrutura começa a se formar */
      setState("forming");
      await tween(900, t => drawArc(release(t)));
      drawArc(0);
      await wait(1100);
    } else {
      setState("forming");
      await wait(1800);
    }
    if (token !== formToken){ forming = false; return; }
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
    /* depois de recolhida pelo visitante, a estrutura só volta por escolha */
    if (intentArmed || state !== "rest" || !restoreOnForm) return;
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

  /* a coroa só ganha tema pela pré-seleção no repouso; formada, só pela seleção */
  function crownTheme(){
    const theme = selected || (state === "rest" ? preview : "");
    if (theme) root.dataset.crown = theme;
    else delete root.dataset.crown;
  }

  const setPreview = sys => {
    if (state === "tension" || state === "forming") sys = "";
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
      if (head.matches(":focus-visible")) setPreview(sys);
    });
    head.addEventListener("blur", () => {
      setPreview(hovered ? hovered.dataset.sys : "");
    });

    /* a coluna inteira seleciona; a leitura conceitual e o dado de lastro
       guardam seus próprios gestos */
    col.addEventListener("click", event => {
      if (event.target.closest(".arx-story,[data-datum]")) return;
      formAndSelect(sys);
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

  /* do repouso, um clique forma a estrutura (sem nova tensão) e abre o sistema */
  async function formAndSelect(sys){
    if (state === "tension") return;
    if (state === "rest"){
      if (reduced()){
        form({animate:false});
      } else {
        form({tension:false});
        await wait(700);
      }
    }
    select(sys, {animate:true});
  }

  /* fora do arco: tudo se recolhe ao repouso e as histórias reaparecem */
  const frame = root.querySelector(".arx-frame");
  async function collapse({keep = null} = {}){
    if (state === "rest" || state === "tension") return;
    const token = ++swapToken;
    formToken++;
    forming = false;
    restoreOnForm = false;
    store.set(KEY_FORMED, "0");
    store.set(KEY_SEL, "");
    setPreview("");
    hovered = null;

    /* o que está sob o olho não deve saltar quando o painel encolhe acima */
    const html = document.documentElement;
    const keepTop = keep ? keep.getBoundingClientRect().top : null;
    let follow = 0;
    if (keep){
      html.style.overflowAnchor = "none";
      const hold = () => {
        const delta = keep.getBoundingClientRect().top - keepTop;
        if (Math.abs(delta) > .5) window.scrollBy({top:delta, left:0, behavior:"instant"});
        follow = requestAnimationFrame(hold);
      };
      follow = requestAnimationFrame(hold);
    }

    const motion = !reduced();
    if (selected && motion){
      root.classList.add("is-collapsing");
      await wait(200);
      if (token !== swapToken) return;
      const from = summary.getBoundingClientRect().height;
      selected = "";
      paint("");
      root.classList.remove("is-collapsing");
      setState("rest");
      await animateHeight(from, 0, token);
    } else {
      selected = "";
      paint("");
      setState("rest");
      animateHeight(0, 0, token);
    }
    drawArc(0);

    await wait(motion ? 900 : 0);
    cancelAnimationFrame(follow);
    html.style.overflowAnchor = "";
  }

  if (frame){
    document.addEventListener("click", event => {
      if (state !== "formed" && state !== "forming") return;
      if (homeView && homeView.dataset.active !== "true") return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(".arx-arch, dialog, .rail, .data-tooltip, .progress-rail")) return;
      if (!target.closest("#stage")) return;
      const below = event.clientY > frame.getBoundingClientRect().bottom;
      collapse({keep: below ? target : null});
    });
    document.addEventListener("keydown", event => {
      if (event.key !== "Escape" || state === "rest") return;
      if (!root.contains(document.activeElement)) return;
      collapse();
    });
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
