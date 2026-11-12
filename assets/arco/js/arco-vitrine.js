/* Vitrine do ARCO: a linha de base do arco é o horizonte das três heroes.
   Em revezamento, da esquerda para a direita, a coluna em exibição e o trecho
   da coroa logo acima dela se preenchem por inteiro com a cor do sistema,
   translúcida, sem gradiente, e recebem o chão animado da hero, sem letreiro:
     DATA  — uma régua passada sobre o campo: do dia para a noite e de volta;
     ECHO  — o campo de pressão, na entrelinha do próprio parágrafo;
     ATRIO — o xadrez em perspectiva, avançando a partir do horizonte.
   O texto fica sempre por cima e legível. O relógio só corre com os blocos
   inteiros à vista; a seleção continua pertencendo ao arco existente. */
(() => {
  "use strict";
  const root = document.querySelector(".arx[data-showcase]");
  if (!root) return;
  const group = root.querySelector(".arx-cols");
  const crown = root.querySelector(".arx-crown");
  const field = root.querySelector(".arx-arc__field");
  const cols = [...group.querySelectorAll(".arx-col")];
  const home = root.closest(".view");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const TIMING = Object.freeze({initial:2500, reveal:1500, hold:5000, retract:750, interval:2500, cycle:5000});
  const SHOW = TIMING.reveal + TIMING.hold + TIMING.retract;   // uma passagem inteira por sistema
  const FADE_IN = 900;
  const TINT = .24;                                            // cor do sistema sobre o papel
  const SYSTEMS = ["data", "echo", "atrio"];
  const clamp = n => Math.max(0, Math.min(1, n));
  const ease = n => { const t = clamp(n); return t * t * (3 - 2 * t); };
  const liso = (a, b, x) => ease((x - a) / (b - a));
  let stopped = false, chosen = "", index = 0, phase = "initial", elapsed = 0, idle = false, viewportIndex = -1;
  let frame = 0, previous = 0, hovering = false, focused = false, dpr = 1;
  const surfaces = [];

  const help = document.createElement("p");
  help.id = "arx-vitrine-help";
  help.className = "arx-sr";
  help.textContent = "Ative uma vez para selecionar e expandir o projeto no arco. Ative novamente o mesmo bloco para abrir sua página.";
  group.append(help);
  const status = document.createElement("p");
  status.className = "arx-sr";
  status.setAttribute("role", "status");
  group.append(status);

  cols.forEach((col, i) => {
    const head = col.querySelector(".arx-col__head");
    head.setAttribute("aria-describedby", help.id);
    const layer = document.createElement("div");
    layer.className = "arx-vitrine";
    layer.setAttribute("aria-hidden", "true");
    const canvas = document.createElement("canvas");
    layer.append(canvas);
    col.append(layer);
    surfaces.push({col, layer, canvas, ctx:canvas.getContext("2d"), sys:SYSTEMS[i], w:0, h:0, x:0, y:0});
  });
  // a coroa: um único plano sob as linhas do arco, recortado pela curva
  const sky = document.createElement("canvas");
  sky.className = "arx-vitrine-coroa";
  sky.setAttribute("aria-hidden", "true");
  crown.prepend(sky);
  const skyCtx = sky.getContext("2d");
  let skyW = 0, skyH = 0, arcD = "", arcPath = null;

  /* ---------- DATA: a régua passada ----------
     A aresta graduada atravessa o bloco e o trecho da coroa da esquerda para a
     direita. Uma passagem leva o dia à noite (o branco vira azul atrás dela);
     a seguinte devolve o dia; e assim alterna enquanto a vitrine roda. */
  const PASS = 2400, SWEEP = .82;
  const glide = n => { const t = clamp(n); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  function ruler(mt){
    const k = Math.floor(mt / PASS), x = glide((mt - k * PASS) / PASS / SWEEP);
    return {x, night:k % 2 === 0};
  }
  // azul do lado já medido; a aresta com graduação voltada para o lado ainda por medir
  function measureBand(ctx, s, r, top, bottom, ox, oy, tint){
    const X = r.x * s.w;
    ctx.globalAlpha = tint; ctx.fillStyle = s.color;
    if (r.night) ctx.fillRect(ox, oy + top, X, bottom - top);
    else ctx.fillRect(ox + X, oy + top, s.w - X, bottom - top);
    ctx.globalAlpha = 1;
    if (r.x <= 0 || r.x >= 1) return;
    ctx.strokeStyle = "rgba(44,44,44,.55)"; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ox + X, oy + top); ctx.lineTo(ox + X, oy + bottom);
    const step = 6, from = Math.ceil((top - s.top0) / step);
    for (let n = from; s.top0 + n * step <= bottom; n++){
      const y = oy + s.top0 + n * step, l = n % 10 === 0 ? 11 : n % 5 === 0 ? 7 : 4;
      ctx.moveTo(ox + X, y + .5); ctx.lineTo(ox + X + l, y + .5);
    }
    ctx.stroke();
  }

  /* ---------- ECHO: campo de pressão (algoritmo de echo.html) ----------
     Grade de traços no passo do parágrafo (2 caracteres × 1 entrelinha),
     com os traços na entrelinha, entre as linhas de texto. Gabinetes à
     esquerda da coluna — do lado do DATA — emitem pulsos longitudinais;
     sobre o bloco de texto a agitação é amortecida, não apagada. */
  const VEL = 13, TAU = 6.2832;
  const ruido = n => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
  const GAB = [.08, .3, .5, .7, .92].map((fy, i) => ({
    fx:-6 - 16 * ruido(i + 3), fy:fy + (ruido(i + 5) - .5) * .12,
    P:2.6 + 2.4 * ruido(i + 7), lam:3.4 + 2.8 * ruido(i + 9), a:.5 + .25 * ruido(i + 13)
  }));
  function echoGrid(s){
    const txt = s.col.querySelector(".arx-col__txt");
    const cs = getComputedStyle(txt);
    s.ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const adv = s.ctx.measureText("M").width + (parseFloat(cs.letterSpacing) || 0);
    const passo = 2 * adv, linha = parseFloat(cs.lineHeight) || adv * 2.4;
    // o bloco que absorve a agitação vai do título ao fim do parágrafo
    const c = s.col.getBoundingClientRect(), t = txt.getBoundingClientRect();
    const hd = s.col.querySelector(".arx-col__head").getBoundingClientRect();
    const L = t.left - c.left, T = t.top - c.top, R = t.right - c.left, B = t.bottom - c.top, HT = hd.top - c.top;
    const top = s.under ? -s.y : 0;
    const pts = [];
    for (let j = Math.floor((top - T) / linha); T + j * linha < s.h + linha; j++){
      const y = T + j * linha;
      for (let i = Math.floor(-L / passo) - 1; L + passo / 2 + i * passo < s.w + passo; i++){
        const x = L + passo / 2 + i * passo;
        const dx = Math.max(L - x, 0, x - R), dy = Math.max(HT - y, 0, y - B);
        const m = .55 + .45 * liso(0, 6, Math.hypot(dx, dy) / passo);
        pts.push(x, y, m, .1 + .1 * (1 - m));
      }
    }
    return {passo, linha, top, pts:new Float32Array(pts)};
  }
  function echoPulses(g, H, t, life){
    const list = [];
    GAB.forEach((p, n) => {
      for (let k = Math.floor((t - life) / p.P) - 1; k <= Math.floor(t / p.P) + 1; k++){
        const t0 = (k + (ruido(n * 31 + k) - .5) * .6) * p.P, age = t - t0;
        if (age < 0 || age > life) continue;
        list.push({x:p.fx * g.passo, y:g.top + p.fy * H, t0, a:p.a * (.75 + .5 * ruido(n * 17 + k)), lam:p.lam, sig:p.lam * .75});
      }
    });
    return list;
  }
  const buckets = Array.from({length:16}, () => []);
  function echoField(s, t){
    const g = s.grid || (s.grid = echoGrid(s));
    const H = s.h - g.top, ps = echoPulses(g, H, t, (s.w / g.passo + 40) / VEL);
    const sets = [buckets.map(() => []), buckets.map(() => [])];   // [coluna, coroa]
    const half = g.linha * .14;
    for (let i = 0; i < g.pts.length; i += 4){
      const x = g.pts[i], y = g.pts[i + 1], m = g.pts[i + 2];
      let dx = 0, dy = 0, tension = 0;
      for (const p of ps){
        const rx = x - p.x, ry = y - p.y, rr = Math.hypot(rx, ry), r = rr / g.passo;
        const u = r - VEL * (t - p.t0);
        if (u > 2.6 * p.sig || u < -2.6 * p.sig) continue;
        const q = u / p.sig, e = Math.exp(-q * q), k = TAU / p.lam;
        const ag = p.a * Math.sqrt(20 / (20 + r)) * m * e;
        const sn = Math.sin(k * u), cs = Math.cos(k * u);
        tension += ag * (k * cs - 2 * u / (p.sig * p.sig) * sn);
        dx += ag * sn * rx / rr; dy += ag * sn * ry / rr;
      }
      const alpha = Math.min(.62, Math.max(.03, g.pts[i + 3] - tension * 1.1));
      const px = x + dx * g.passo, py = y + dy * g.passo;
      const l = half * (1 + .8 * Math.min(1, Math.abs(tension)));
      sets[py < 0 ? 1 : 0][Math.min(15, Math.round(alpha * 21))].push(px, py - l, py + l);
    }
    const stroke = (ctx, set, ox, oy) => {
      ctx.lineWidth = Math.max(.75, g.passo * .05);
      ctx.lineCap = "butt";
      set.forEach((b, j) => {
        if (!b.length) return;
        ctx.strokeStyle = `rgba(44,44,44,${(j / 21).toFixed(3)})`;
        ctx.beginPath();
        for (let i = 0; i < b.length; i += 3){ ctx.moveTo(ox + b[i], oy + b[i + 1]); ctx.lineTo(ox + b[i], oy + b[i + 2]); }
        ctx.stroke();
      });
    };
    return {column:ctx => stroke(ctx, sets[0], 0, 0), crown:ctx => stroke(ctx, sets[1], s.x, s.y)};
  }

  /* ---------- ATRIO: o chão xadrez a partir do horizonte ----------
     Ponto de fuga no centro da coluna, sobre a linha de base. As fileiras têm
     passo constante em profundidade e avançam para quem olha, sem emenda. */
  function floor(ctx, s, mt){
    const W = s.w, H = s.h, cx = W / 2, half = .2 * W, S = .28;
    const run = mt / 1000 * .55, base = Math.floor(run), ph = run - base;
    const rows = [];
    for (let n = 0; n < 600; n++){
      const y = H / (1 + (n - ph) * S);
      if (rows.length && rows[rows.length - 1] - y < .35) break;
      rows.push(y);
    }
    const ink = new Path2D(), paper = new Path2D();
    for (let k = 0; k < rows.length - 1; k++){
      const y0 = rows[k], y1 = rows[k + 1], f0 = y0 / H, f1 = y1 / H;
      for (let c = 0; c < 8; c++){
        const a = (c - 4) * half, b = a + half, path = (k + base + c) % 2 ? paper : ink;
        path.moveTo(cx + a * f0, y0); path.lineTo(cx + b * f0, y0);
        path.lineTo(cx + b * f1, y1); path.lineTo(cx + a * f1, y1); path.closePath();
      }
    }
    ctx.fillStyle = "rgba(252,252,252,.38)"; ctx.fill(paper);
    ctx.fillStyle = "rgba(44,44,44,.12)"; ctx.fill(ink);
  }

  /* ---------- medida e pintura ---------- */
  function fit(cv, w, h){
    const W = Math.max(1, Math.round(w * dpr)), H = Math.max(1, Math.round(h * dpr));
    if (cv.width !== W || cv.height !== H){ cv.width = W; cv.height = H; }
  }
  function measure(){
    dpr = Math.min(2, devicePixelRatio || 1);
    const c = crown.getBoundingClientRect();
    skyW = c.width; skyH = c.height; fit(sky, skyW, skyH);
    surfaces.forEach(s => {
      const r = s.col.getBoundingClientRect();
      s.w = r.width; s.h = r.height; s.x = r.left - c.left; s.y = r.top - c.top;
      // só a coluna rente à base do arco herda o trecho da coroa (no celular, a primeira)
      s.under = r.width > 0 && Math.abs(r.top - c.bottom) < 3;
      s.color = getComputedStyle(s.col).getPropertyValue("--c").trim() || "#2C2C2C";
      s.grid = null;
      s.top0 = s.under ? -s.y : 0;   // a graduação começa no alto do campo inteiro
      fit(s.canvas, s.w, s.h);
    });
  }
  function clipCrown(s){
    const d = field.getAttribute("d");
    if (d !== arcD){ arcD = d; arcPath = new Path2D(d); }
    const vb = field.ownerSVGElement.viewBox.baseVal;
    skyCtx.setTransform(dpr * skyW / vb.width, 0, 0, dpr * skyH / vb.height, 0, 0);
    skyCtx.clip(arcPath);
    skyCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    skyCtx.beginPath(); skyCtx.rect(s.x, 0, s.w, skyH); skyCtx.clip();
  }
  function paint(s, mt){
    const g = s.ctx, data = s.sys === "data", r = data ? ruler(mt) : null;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, s.w, s.h);
    if (data) measureBand(g, s, r, 0, s.h, 0, 0, TINT);
    else { g.globalAlpha = TINT; g.fillStyle = s.color; g.fillRect(0, 0, s.w, s.h); g.globalAlpha = 1; }
    skyCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    skyCtx.clearRect(0, 0, skyW, skyH);
    const echo = s.sys === "echo" ? echoField(s, 3 + mt / 1000) : null;
    if (s.under){
      skyCtx.save(); clipCrown(s);
      if (data) measureBand(skyCtx, s, r, -s.y, 0, s.x, s.y, TINT);
      else { skyCtx.globalAlpha = TINT; skyCtx.fillStyle = s.color; skyCtx.fillRect(s.x, 0, s.w, skyH); skyCtx.globalAlpha = 1; }
      if (echo) echo.crown(skyCtx);
      skyCtx.restore();
    }
    if (echo) echo.column(g);
    else if (!data) floor(g, s, mt);
  }

  function clear(){
    surfaces.forEach(({col, layer}) => { delete col.dataset.exhibiting; layer.style.opacity = "0"; });
    delete root.dataset.exhibit;
    sky.style.opacity = "0";
  }
  function render(){
    clear();
    if (stopped || !["reveal", "hold", "retract"].includes(phase)) return;
    const surface = surfaces[index];
    if (!surface.w || !surface.h) return;
    const mt = phase === "reveal" ? elapsed : phase === "hold" ? TIMING.reveal + elapsed : TIMING.reveal + TIMING.hold + elapsed;
    const opacity = phase === "reveal" ? ease(elapsed / FADE_IN) : phase === "retract" ? 1 - ease(elapsed / TIMING.retract) : 1;
    surface.col.dataset.exhibiting = surface.sys;
    root.dataset.exhibit = surface.sys;
    surface.layer.style.opacity = String(opacity);
    sky.style.opacity = surface.under ? String(opacity) : "0";
    paint(surface, mt);
  }
  function fullyVisible(){
    if (home.dataset.active !== "true") return false;
    const viewport = window.visualViewport;
    let top = viewport?.offsetTop || 0;
    const bottom = top + (viewport?.height || innerHeight);
    const rail = document.querySelector(".rail");
    if (rail && getComputedStyle(rail).position === "fixed"){
      const r = rail.getBoundingClientRect();
      if (r.width >= innerWidth * .8 && r.top <= top) top = Math.max(top, r.bottom);
    }
    const visible = cols.map((col, i) => {
      const r = col.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.top >= top - .5 && r.bottom <= bottom + .5 && r.left >= -.5 && r.right <= innerWidth + .5 ? i : -1;
    }).filter(i => i >= 0);
    if (visible.length === cols.length){ viewportIndex = -1; return true; }
    // On a narrow, vertically stacked layout, reveal the card the reader has
    // brought fully into view. Never scroll the page or animate an unseen card.
    if (innerWidth <= 640 && visible.length){
      const candidate = visible.reduce((best, i) => {
        const r = cols[i].getBoundingClientRect(), center = (top + bottom) / 2;
        return Math.abs((r.top + r.bottom) / 2 - center) < Math.abs((cols[best].getBoundingClientRect().top + cols[best].getBoundingClientRect().bottom) / 2 - center) ? i : best;
      }, visible[0]);
      if (candidate !== viewportIndex){
        viewportIndex = candidate; index = candidate; phase = "initial"; elapsed = 0; idle = false;
        root.dataset.showcase = "CLEAN"; clear();
      }
      return !idle;
    }
    viewportIndex = -1;
    return false;
  }
  const canRun = () => !stopped && !idle && !motion.matches && !document.hidden && !hovering && !focused && fullyVisible();
  function next(){
    elapsed = 0;
    if (phase === "initial" || phase === "interval" || phase === "cycle"){
      phase = "reveal"; root.dataset.showcase = "PREVIEW";
    } else if (phase === "reveal"){
      phase = "hold"; root.dataset.showcase = "AUTO";
    } else if (phase === "hold") phase = "retract";
    else {
      if (innerWidth <= 640 && viewportIndex >= 0){ idle = true; root.dataset.showcase = "CLEAN"; return; }
      index = (index + 1) % cols.length;
      phase = index ? "interval" : "cycle";
      root.dataset.showcase = "AUTO";
    }
  }
  function tick(now){
    frame = 0;
    if (!canRun()){ previous = 0; return; }
    if (previous) elapsed += now - previous;
    previous = now;
    if (elapsed >= TIMING[phase]) next();
    render();
    frame = requestAnimationFrame(tick);
  }
  function sync(){
    root.toggleAttribute("data-reading", hovering || focused);
    if (!canRun()){
      cancelAnimationFrame(frame); frame = 0; previous = 0;
    } else if (!frame) frame = requestAnimationFrame(tick);
  }
  function selectManually(sys){
    stopped = true; chosen = sys;
    root.dataset.showcase = "SELECTED";
    clear(); sync();
    status.textContent = `${sys.toUpperCase()} selecionado. Ative o mesmo bloco novamente para abrir sua página.`;
  }
  root.addEventListener("arx:activate", event => {
    const {sys} = event.detail;
    if (chosen === sys){
      event.preventDefault();
      root.dataset.showcase = "NAVIGATE";
      location.assign(`${sys}.html`);
    } else selectManually(sys);
  });
  root.addEventListener("arx:manual", event => selectManually(event.detail.sys));
  // Selections from other existing controls also end automatic playback.
  new MutationObserver(() => {
    const sys = root.dataset.sel;
    if (sys && chosen !== sys) selectManually(sys);
    else if (!sys && stopped) chosen = "";
    sync();
  }).observe(root, {attributes:true, attributeFilter:["data-sel"]});
  group.addEventListener("pointerenter", event => { if (event.pointerType !== "touch"){ hovering = true; sync(); } });
  group.addEventListener("pointerleave", event => { if (event.pointerType !== "touch"){ hovering = false; sync(); } });
  group.addEventListener("focusin", () => { focused = true; sync(); });
  group.addEventListener("focusout", () => queueMicrotask(() => { focused = group.contains(document.activeElement); sync(); }));
  document.addEventListener("visibilitychange", sync);
  addEventListener("scroll", sync, {passive:true});
  window.visualViewport?.addEventListener("resize", sync);
  window.visualViewport?.addEventListener("scroll", sync);
  const resize = () => { measure(); render(); sync(); };
  addEventListener("resize", resize, {passive:true});
  if ("ResizeObserver" in window){
    const observer = new ResizeObserver(resize);
    observer.observe(group); observer.observe(crown);
  }
  if ("IntersectionObserver" in window){
    const observer = new IntersectionObserver(sync, {threshold:[0, 1]});
    cols.forEach(col => observer.observe(col));
  }
  new MutationObserver(sync).observe(home, {attributes:true, attributeFilter:["data-active"]});
  motion.addEventListener("change", () => {
    if (motion.matches && !stopped){ phase = "initial"; elapsed = 0; index = 0; root.dataset.showcase = "CLEAN"; clear(); }
    sync();
  });
  document.fonts?.ready.then(resize);
  resize();
})();
