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

  /* altura do extradorso (fração de H) na abscissa u = x/W */
  const extraAt = u => {
    let lo = 0, hi = 1;
    for (let i = 0; i < 22; i++){
      const mid = (lo + hi) / 2;
      if (bez(mid, 0, 180, 820, 1000) / 1000 < u) lo = mid; else hi = mid;
    }
    return bez((lo + hi) / 2, 238, -20, -20, 238) / 238;
  };
  const APEX = 44.5 / 238;                 // fecho do extradorso, em fração de H
  const fmt = px => (px / 100).toLocaleString("pt-BR", {minimumFractionDigits:2, maximumFractionDigits:2});

  /* rótulo dentro da caixa só fica se couber inteiro acima da curva */
  const keepAboveCurve = (key, W, H) => {
    const node = techNodes.get(key);
    if (!node) return;
    let box;
    try { box = node.getBBox(); } catch { return; }
    const ok = [box.x, box.x + box.width].every(x =>
      x > 2 && x < W - 2 && box.y + box.height < extraAt(x / W) * H - 4);
    node.style.visibility = ok ? "" : "hidden";
  };

  /* O grafismo nunca entra no vão do arco: vive acima da caixa, nas margens
     e nos tímpanos (entre a curva e a caixa). Só números, níveis e graus,
     em escala 1:100 (1 px = 1 cm). */
  const layoutTech = () => {
    if (!tech) return;
    const W = crown.clientWidth;
    const H = crown.clientHeight;
    if (!W || !H) return;
    const apex = APEX * H;
    const ov = 10;
    const rect = crown.getBoundingClientRect();
    const roomRight = document.documentElement.clientWidth - rect.right;
    const roomLeft = rect.left;
    const wide = W >= 700;

    /* caixa de limites: topo tangente ao fecho, laterais até a nascença */
    line("box-top", "is-box", 380, [[-ov, apex], [W + ov, apex]]);
    line("box-l", "is-box", 380, [[0, apex - ov], [0, H]]);
    line("box-r", "is-box", 380, [[W, apex - ov], [W, H]]);
    /* eixo: só acima do fecho */
    line("axis", "is-dim", 900, [[W / 2, apex - 9], [W / 2, apex]]);

    /* cadeia de cotas do vão: parciais (três movimentos) e total */
    const y1 = apex - 18;
    line("v-ext-l", "is-ext", 900, [[0, apex - 14], [0, y1 - (wide ? 30 : 6)]]);
    line("v-ext-r", "is-ext", 900, [[W, apex - 14], [W, y1 - (wide ? 30 : 6)]]);
    if (wide){
      line("v-ext-1", "is-ext", 900, [[W / 3, apex - 4], [W / 3, y1 - 6]]);
      line("v-ext-2", "is-ext", 900, [[W * 2 / 3, apex - 4], [W * 2 / 3, y1 - 6]]);
      line("v-part", "is-dim", 1000, [[0, y1], [W, y1]]);
      [0, W / 3, W * 2 / 3, W].forEach((x, i) => tick(`v-pt${i}`, "is-dim", 1200, x, y1));
      [0, 1, 2].forEach(i => label(`v-pn${i}`, "is-small", 1500 + i * 90, W * (i * 2 + 1) / 6, y1 - 6, fmt(W / 3), {anchor:"middle"}));
      const y2 = y1 - 24;
      line("v-tot", "is-dim", 1100, [[0, y2], [W, y2]]);
      tick("v-tt0", "is-dim", 1250, 0, y2);
      tick("v-tt1", "is-dim", 1250, W, y2);
      label("v-tn", "", 1750, W / 2, y2 - 6, fmt(W), {anchor:"middle"});
    } else {
      hide(["v-ext-1","v-ext-2","v-part","v-pt0","v-pt1","v-pt2","v-pt3","v-pn0","v-pn1","v-pn2","v-tot","v-tt0","v-tt1"]);
      line("v-tot-m", "is-dim", 1000, [[0, y1], [W, y1]]);
      tick("v-tm0", "is-dim", 1200, 0, y1);
      tick("v-tm1", "is-dim", 1200, W, y1);
      label("v-tn-m", "is-small", 1500, W / 2, y1 - 6, fmt(W), {anchor:"middle"});
    }
    if (wide) hide(["v-tot-m","v-tm0","v-tm1","v-tn-m"]);

    /* cota da flecha (altura do fecho sobre a nascença), à direita */
    if (roomRight >= 52){
      const xf = W + 26;
      line("fl-et", "is-ext", 900, [[W + ov + 4, apex], [xf + 8, apex]]);
      line("fl-eb", "is-ext", 900, [[W + 6, H], [xf + 8, H]]);
      line("fl", "is-dim", 1000, [[xf, apex], [xf, H]]);
      tick("fl-tt", "is-dim", 1200, xf, apex);
      tick("fl-tb", "is-dim", 1200, xf, H);
      label("fl-t", "", 1550, xf + 15, (apex + H) / 2, fmt(H - apex), {anchor:"middle", rotate:-90});
    } else hide(["fl-et","fl-eb","fl","fl-tt","fl-tb","fl-t"]);

    /* níveis à esquerda: nascença ±0,00 e fecho +f */
    if (roomLeft >= 64){
      const lv = (key, y, text, delay) => {
        line(`${key}-l`, "is-ext", delay - 300, [[-ov - 4, y], [-46, y]]);
        line(`${key}-m`, "is-dim", delay - 200, [[-30, y - 7], [-24, y], [-18, y - 7], [-30, y - 7]]);
        label(`${key}-t`, "is-small", delay, -14, y - 9, text, {anchor:"end"});
      };
      lv("lv0", H, "±0,00", 1550);
      lv("lv1", apex, `+${fmt(H - apex)}`, 1650);
    } else hide(["lv0-l","lv0-m","lv0-t","lv1-l","lv1-m","lv1-t"]);

    /* ângulo de nascença: entre a lateral da caixa e a tangente da curva,
       desenhado no tímpano, fora do vão */
    const tx = .18 * W, ty = (258 / 238) * H;
    const fromVertical = Math.atan2(tx, ty);           // radianos, a partir da vertical
    const deg = Math.round(fromVertical * 180 / Math.PI);
    const r = Math.min(30, H * .14);
    const arcPath = (cx, dir) => {
      const steps = 10, pts = [];
      for (let i = 0; i <= steps; i++){
        const a = fromVertical * i / steps;
        pts.push([cx + dir * r * Math.sin(a), H - r * Math.cos(a)]);
      }
      return pts;
    };
    /* em telas estreitas o tímpano é pequeno demais para o grau */
    if (W >= 600){
      line("ang-l", "is-dim", 1300, arcPath(0, 1));
      line("ang-r", "is-dim", 1300, arcPath(W, -1));
      /* o grau pousa rente à lateral, acima do arco de medida */
      label("ang-lt", "is-small", 1700, 5, H - r - 22, `${deg}°`, {anchor:"start"});
      label("ang-rt", "is-small", 1700, W - 5, H - r - 22, `${deg}°`, {anchor:"end"});
    } else hide(["ang-l","ang-r","ang-lt","ang-rt"]);

    /* razão flecha/vão no tímpano direito */
    if (wide){
      label("ratio", "is-small", 1850, W - 14, apex + 26, `f/L = ${((H - apex) / W).toLocaleString("pt-BR", {maximumFractionDigits:2, minimumFractionDigits:2})}`, {anchor:"end", rotate:-1.5});
      label("scale", "is-small", 1900, 14, apex + 26, "1:100", {anchor:"start", rotate:-1.5});
    } else hide(["ratio","scale"]);

    ["ang-lt","ang-rt","ratio","scale"].forEach(key => keepAboveCurve(key, W, H));
  };

  /* vão real do arco, para a proporção fixa da coroa */
  let spanW = 0;
  const measureSpan = () => {
    const w = root.querySelector(".arx-arch")?.clientWidth || 0;
    if (!w || Math.abs(w - spanW) < .5) return;
    spanW = w;
    root.style.setProperty("--arx-span", `${w}px`);
  };
  measureSpan();
  if ("ResizeObserver" in window){
    const arch = root.querySelector(".arx-arch");
    if (arch) new ResizeObserver(measureSpan).observe(arch);
  }
  addEventListener("resize", measureSpan, {passive:true});

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
    const theme = selected;
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

  /* arco narrativo: os dois primeiros parágrafos de cada leitura conceitual
     vêm do próprio diálogo, para que o texto tenha uma única fonte */
  root.querySelectorAll(".arx-lede__story[data-tale-src]").forEach(story => {
    const tale = document.getElementById(story.dataset.taleSrc);
    const prose = tale?.querySelector(".tale__prose");
    const source = prose ? [...prose.querySelectorAll(":scope > p")].slice(0, 2) : [];
    if (source.length < 2) return;
    /* o título da leitura conceitual vira a primeira frase do texto */
    const title = (tale.querySelector(".tale__title")?.textContent || "").trim().replace(/[.:;]+$/, "");
    story.replaceChildren(...source.map((p, i) => {
      const copy = document.createElement("p");
      copy.innerHTML = p.innerHTML;
      if (i === 0 && title) copy.prepend(`${title}. `);
      return copy;
    }));
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
        const token = formToken;
        await wait(700);
        /* recolhida no meio do caminho: a seleção não chega a acontecer */
        if (token !== formToken || state === "rest") return;
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

  /* faixa de respiro: da base do quadro até o topo da caixa (fecho),
     laterais incluídas, barra de rolagem excluída. Dentro dela, conta como
     "fora" o que não é arco nem quadro: margens laterais e tímpanos. */
  const INTERACTIVE = 'a,button,input,select,textarea,label,summary,[role="button"],[role="tab"],[role="link"],[data-datum]';
  const outsideArch = (x, y) => {
    if (x >= document.documentElement.clientWidth) return false;
    const c = crown.getBoundingClientRect();
    const f = frame.getBoundingClientRect();
    const top = c.top + APEX * c.height;
    if (y < top || y > f.bottom) return false;
    if (x < f.left || x > f.right) return true;
    if (y >= c.bottom) return false;
    return y < c.top + extraAt((x - c.left) / c.width) * c.height;
  };

  if (frame){
    document.addEventListener("click", event => {
      if (state !== "formed" && state !== "forming") return;
      if (homeView && homeView.dataset.active !== "true") return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(INTERACTIVE) || target.closest("dialog, .rail")) return;
      if (!outsideArch(event.clientX, event.clientY)) return;
      collapse();
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
