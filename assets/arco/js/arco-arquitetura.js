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
  /* vários segmentos num só traço: menos nós, menos pintura */
  const multi = (key, cls, delay, segs) => {
    const d = segs.map(seg => seg.map((pt, i) => `${i ? "L" : "M"}${pt[0].toFixed(1)},${pt[1].toFixed(1)}`).join(" ")).join(" ");
    techNode(key, "path", cls, delay).setAttribute("d", d || "M0,0");
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

  /* ------------------------------------------------------------------
     RABISCOS DE PRANCHETA — camada densa de construção, sempre fora do vão:
     traços duplos de esboço, réguas, pontos de construção, tangentes de
     nascença, hachura dos tímpanos, cotas de altura da curva, escala
     gráfica, marcas de eixo e numeração dos movimentos. Sem palavras.
     ------------------------------------------------------------------ */
  let clipReady = false;
  const ensureClips = () => {
    if (clipReady || !tech) return;
    const defs = document.createElementNS(SVG_NS, "defs");
    ["l", "r"].forEach(side => {
      const clip = document.createElementNS(SVG_NS, "clipPath");
      clip.setAttribute("id", `arx-spandrel-${side}`);
      const path = document.createElementNS(SVG_NS, "path");
      clip.appendChild(path);
      defs.appendChild(clip);
      /* a hachura se dissolve à medida que se afasta da lateral */
      const grad = document.createElementNS(SVG_NS, "linearGradient");
      grad.setAttribute("id", `arx-fade-g-${side}`);
      grad.setAttribute("gradientUnits", "userSpaceOnUse");
      [["0", "1"], ["1", "0"]].forEach(([offset, opacity]) => {
        const stop = document.createElementNS(SVG_NS, "stop");
        stop.setAttribute("offset", offset);
        stop.setAttribute("stop-color", "#fff");
        stop.setAttribute("stop-opacity", opacity);
        grad.appendChild(stop);
      });
      defs.appendChild(grad);
      const mask = document.createElementNS(SVG_NS, "mask");
      mask.setAttribute("id", `arx-fade-${side}`);
      mask.setAttribute("maskUnits", "userSpaceOnUse");
      const rect = document.createElementNS(SVG_NS, "rect");
      rect.setAttribute("fill", `url(#arx-fade-g-${side})`);
      mask.appendChild(rect);
      defs.appendChild(mask);
    });
    tech.prepend(defs);
    clipReady = true;
  };
  /* tímpano = região entre a caixa e o extradorso, de cada lado do fecho */
  const spandrelPath = (W, H, apex, side) => {
    const pts = [];
    for (let i = 0; i <= 24; i++){
      const [x, y] = onExtra(i / 48, W, H);       // meia curva, do pé ao fecho
      pts.push(side === "l" ? [x, y] : [W - x, y]);
    }
    const corner = side === "l" ? [0, apex] : [W, apex];
    return "M" + pts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L") +
      ` L${(W / 2).toFixed(1)},${apex.toFixed(1)} L${corner[0].toFixed(1)},${corner[1].toFixed(1)} Z`;
  };

  function sketch(W, H, apex, wide, roomLeft, roomRight){
    ensureClips();
    tech.querySelector("#arx-spandrel-l path")?.setAttribute("d", spandrelPath(W, H, apex, "l"));
    tech.querySelector("#arx-spandrel-r path")?.setAttribute("d", spandrelPath(W, H, apex, "r"));
    const fadeReach = W * (W >= 600 ? .2 : .16);
    ["l", "r"].forEach(side => {
      const g = tech.querySelector(`#arx-fade-g-${side}`);
      const r = tech.querySelector(`#arx-fade-${side} rect`);
      const x0 = side === "l" ? 0 : W, x1 = side === "l" ? fadeReach : W - fadeReach;
      g?.setAttribute("x1", x0); g?.setAttribute("x2", x1);
      g?.setAttribute("y1", 0); g?.setAttribute("y2", 0);
      if (r){
        r.setAttribute("x", Math.min(x0, x1)); r.setAttribute("y", apex - 2);
        r.setAttribute("width", fadeReach); r.setAttribute("height", H - apex + 4);
      }
    });
    const mid = W >= 600;

    /* traços duplos de esboço: a mão repassa a caixa, com folga nos cantos */
    line("sk-top", "is-sketch", 300, [[-22, apex - 1.4], [W + 24, apex + .8]]);
    line("sk-l", "is-sketch", 340, [[-1.2, apex - 20], [.9, H + 7]]);
    line("sk-r", "is-sketch", 340, [[W + 1.1, apex - 18], [W - .8, H + 7]]);
    line("sk-base", "is-sketch", 360, [[-16, H + 1.2], [W + 14, H - .6]]);

    /* pontos de construção nos cantos superiores */
    const ring = (key, cx, cy, r, delay) => {
      const pts = [];
      for (let i = 0; i <= 16; i++){
        const a = i / 16 * Math.PI * 2;
        pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
      line(key, "is-dim", delay, pts);
    };
    ring("pt-l", 0, apex, 3.2, 1100);
    ring("pt-r", W, apex, 3.2, 1100);

    /* régua sobre a linha superior (marcas para cima, fora do vão) */
    const steps = mid ? 24 : 12;
    const rulerTop = [];
    for (let i = 1; i < steps; i++){
      const x = W * i / steps;
      if (Math.abs(x - W / 2) < 1) continue;
      rulerTop.push([[x, apex], [x, apex - (i % 4 === 0 ? 7 : 3.5)]]);
    }
    multi("ru-t", "is-tick", 1000, rulerTop);

    /* régua nas laterais (marcas para fora) */
    const rl = [], rr = [];
    for (let i = 1; i < 8; i++){
      const y = apex + (H - apex) * i / 8;
      const len = i % 2 === 0 ? 6 : 3;
      rl.push([[0, y], [-len, y]]);
      rr.push([[W, y], [W + len, y]]);
    }
    multi("ru-l", "is-tick", 1050, rl);
    multi("ru-r", "is-tick", 1050, rr);

    /* tangentes de nascença até a linha superior, com ponto de encontro */
    const s = (H - apex) / ((258 / 238) * H);
    const xt = .18 * W * s;
    line("tg-l", "is-cons", 1200, [[0, H], [xt, apex]]);
    line("tg-r", "is-cons", 1200, [[W, H], [W - xt, apex]]);
    ring("tg-pl", xt, apex, 2.4, 1500);
    ring("tg-pr", W - xt, apex, 2.4, 1500);

    /* hachura dos tímpanos, concentrada junto às laterais: um traço por
       lado, um só recorte e uma só máscara */
    const gap = mid ? 6 : 5;
    const reach = W * (mid ? .2 : .16);
    const hl = [], hr = [];
    for (let k = apex; k < H + reach; k += gap){
      const d = Math.min(reach, k - apex);
      hl.push([[0, k], [d, k - d]]);
      hr.push([[W, k], [W - d, k - d]]);
    }
    multi("ha-l", "is-hatch", 1300, hl);
    multi("ha-r", "is-hatch", 1300, hr);
    const hatchL = techNodes.get("ha-l"), hatchR = techNodes.get("ha-r");
    if (hatchL && !hatchL.hasAttribute("mask")){
      hatchL.setAttribute("clip-path", "url(#arx-spandrel-l)");
      hatchL.setAttribute("mask", "url(#arx-fade-l)");
      hatchR.setAttribute("clip-path", "url(#arx-spandrel-r)");
      hatchR.setAttribute("mask", "url(#arx-fade-r)");
    }

    /* cotas de altura da curva a um quarto e três quartos do vão */
    if (mid){
      [.25, .75].forEach((u, i) => {
        const x = u * W, y = extraAt(u) * H;
        line(`hm-${i}`, "is-dim", 1500, [[x, y - 3], [x, y - 13]]);
        line(`hm-c${i}`, "is-dim", 1500, [[x - 3, y - 6], [x + 3, y - 6]]);
        label(`hm-t${i}`, "is-small", 1800, x + (i ? -6 : 6), y - 17, `+${fmt(H - y)}`, {anchor: i ? "end" : "start"});
      });
    } else hide(["hm-0","hm-c0","hm-t0","hm-1","hm-c1","hm-t1"]);

    /* eixo: alvo de construção acima do fecho */
    ring("ax-ring", W / 2, apex - 9, 4.2, 950);
    line("ax-h", "is-dim", 950, [[W / 2 - 8, apex - 9], [W / 2 + 8, apex - 9]]);

    /* numeração dos movimentos sobre as cotas parciais */
    if (wide){
      const yc = apex - 30;
      [0, 1, 2].forEach(i => {
        const cx = W * i / 3 + 16;
        ring(`mv-c${i}`, cx, yc, 6.5, 1600 + i * 80);
        label(`mv-n${i}`, "is-small", 1700 + i * 80, cx, yc + 4, String(i + 1), {anchor:"middle"});
      });
    } else hide(["mv-c0","mv-c1","mv-c2","mv-n0","mv-n1","mv-n2"]);

    /* escala gráfica no tímpano esquerdo, sob o 1:100 */
    if (wide){
      const x0 = 14, y0 = apex + 36, u = 12;
      line("sc-base", "is-dim", 1700, [[x0, y0], [x0 + u * 4, y0]]);
      line("sc-top", "is-dim", 1700, [[x0, y0 - 3], [x0 + u * 4, y0 - 3]]);
      for (let i = 0; i <= 4; i++) line(`sc-t${i}`, "is-dim", 1750, [[x0 + u * i, y0 - 3], [x0 + u * i, y0 + 2]]);
      line("sc-f1", "is-dim", 1800, [[x0, y0 - 1.5], [x0 + u, y0 - 1.5]]);
      line("sc-f3", "is-dim", 1800, [[x0 + u * 2, y0 - 1.5], [x0 + u * 3, y0 - 1.5]]);
      label("sc-n0", "is-small", 1850, x0, y0 + 12, "0", {anchor:"middle"});
      label("sc-n4", "is-small", 1850, x0 + u * 4, y0 + 12, "4", {anchor:"middle"});
    } else hide(["sc-base","sc-top","sc-t0","sc-t1","sc-t2","sc-t3","sc-t4","sc-f1","sc-f3","sc-n0","sc-n4"]);

    /* rosa de orientação no tímpano direito, sob f/L */
    if (W >= 900){
      const cx = W - 40, cy = apex + 74;
      ring("or-ring", cx, cy, 9, 1800);
      line("or-v", "is-dim", 1850, [[cx, cy + 12], [cx, cy - 15]]);
      line("or-h", "is-dim", 1850, [[cx - 12, cy], [cx + 12, cy]]);
      line("or-a", "is-dim", 1900, [[cx - 3.5, cy - 9], [cx, cy - 15], [cx + 3.5, cy - 9]]);
    } else hide(["or-ring","or-v","or-h","or-a"]);

    /* rabiscos de margem: setas de chamada e marcas de conferência */
    if (roomLeft >= 64){
      line("mg-l1", "is-sketch", 1900, [[-52, H - 30], [-40, H - 40], [-28, H - 36]]);
      line("mg-l2", "is-sketch", 1950, [[-50, apex + 24], [-44, apex + 30], [-34, apex + 16]]);
    } else hide(["mg-l1","mg-l2"]);
    if (roomRight >= 52){
      line("mg-r1", "is-sketch", 1950, [[W + 44, apex - 6], [W + 50, apex + 2], [W + 58, apex - 12]]);
    } else hide(["mg-r1"]);
  }

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

    sketch(W, H, apex, wide, roomLeft, roomRight);

    ["ang-lt","ang-rt","ratio","scale"].forEach(key => keepAboveCurve(key, W, H));
    for (const key of techNodes.keys()) if (key.startsWith("hm-t")) keepAboveCurve(key, W, H);
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
    /* no máximo um recálculo por quadro, e só quando a medida mudou */
    let techRaf = 0, lastW = 0, lastH = 0, lastRoom = -1;
    const scheduleTech = force => {
      if (techRaf) return;
      techRaf = requestAnimationFrame(() => {
        techRaf = 0;
        const W = crown.clientWidth, H = crown.clientHeight;
        const room = Math.round(document.documentElement.clientWidth - crown.getBoundingClientRect().right);
        if (force !== true && W === lastW && Math.abs(H - lastH) < .5 && room === lastRoom) return;
        lastW = W; lastH = H; lastRoom = room;
        layoutTech();
      });
    };
    layoutTech();
    if ("ResizeObserver" in window) new ResizeObserver(() => scheduleTech()).observe(crown);
    addEventListener("resize", () => scheduleTech(), {passive:true});
    document.fonts?.ready?.then(() => scheduleTech(true));
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
    /* sem o "Quando" inicial: a oração vira frase própria, com ponto final */
    let title = (tale.querySelector(".tale__title")?.textContent || "").trim().replace(/[.:;]+$/, "");
    title = title.replace(/^quando\s+/i, "");
    if (title) title = title.charAt(0).toLocaleUpperCase("pt-BR") + title.slice(1);
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
