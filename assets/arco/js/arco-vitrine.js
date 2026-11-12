/* Vitrine do ARCO: a linha de base do arco é o horizonte das três heroes.
   Em revezamento, da esquerda para a direita, a coluna em exibição e o trecho
   da coroa logo acima dela se preenchem por inteiro com a cor do sistema,
   translúcida, sem gradiente, e recebem o chão animado da hero, sem letreiro:
     DATA  — uma régua passada sobre o campo: do dia para a noite e de volta;
     ECHO  — o campo de pressão, na entrelinha do próprio parágrafo;
     ATRIO — o xadrez em perspectiva, avançando a partir do horizonte.
   O texto fica sempre por cima e legível. A vitrine começa assim que o arco
   se forma e não para mais: roda em looping, em ordem, com troca cruzada.
   Sob o cursor (ou com foco) o bloco segura a animação para si; no celular,
   fica com o bloco mais visível. Com um sistema aberto no arco, a animação
   segue no bloco selecionado; a diferença é a coroa, que o arco preenche. */
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
  const SHOW = 5400;                                           // tempo de cada sistema na ordem
  const XF = 700;                                              // troca cruzada entre blocos
  const TINT = .24;                                            // cor do sistema sobre o papel
  const SYSTEMS = ["data", "echo", "atrio"];
  const clamp = n => Math.max(0, Math.min(1, n));
  const ease = n => { const t = clamp(n); return t * t * (3 - 2 * t); };
  const liso = (a, b, x) => ease((x - a) / (b - a));
  let chosen = "", started = false, cur = 0, curT = 0, prev = -1, prevT = 0, xf = XF, pinned = -1;
  let frame = 0, previous = 0, dpr = 1;
  const surfaces = [];

  const help = document.createElement("p");
  help.id = "arx-vitrine-help";
  help.className = "arx-sr";
  help.textContent = "Ative para selecionar e expandir o projeto no arco. Ative novamente o mesmo bloco para recolher.";
  group.append(help);
  const status = document.createElement("p");
  status.className = "arx-sr";
  status.setAttribute("role", "status");
  group.append(status);

  const makeLayer = host => {
    const layer = document.createElement("div");
    layer.className = "arx-vitrine";
    layer.setAttribute("aria-hidden", "true");
    const canvas = document.createElement("canvas");
    layer.append(canvas);
    host.append(layer);
    return {host, layer, canvas, ctx:canvas.getContext("2d"), w:0, h:0};
  };
  cols.forEach((col, i) => {
    const head = col.querySelector(".arx-col__head");
    head.setAttribute("aria-describedby", help.id);
    const own = makeLayer(col);
    // a célula "Movimento" do painel do mesmo sistema: com ele aberto, o campo
    // desce do bloco para ela e as duas se animam como uma só
    const cell = root.querySelector(`.arx-sum[data-sys="${SYSTEMS[i]}"] .arx-mov`);
    surfaces.push({col, layer:own.layer, canvas:own.canvas, ctx:own.ctx, mov:cell ? makeLayer(cell) : null,
      sys:SYSTEMS[i], w:0, h:0, x:0, y:0});
  });
  // a coroa: um único plano sob as linhas do arco, recortado pela curva
  const sky = document.createElement("canvas");
  sky.className = "arx-vitrine-coroa";
  sky.setAttribute("aria-hidden", "true");
  crown.prepend(sky);
  const skyCtx = sky.getContext("2d");
  let skyW = 0, skyH = 0, arcD = "", arcPath = null;

  /* O campo de cada sistema tem coordenadas próprias, com origem no canto do
     bloco: acima de 0 fica o trecho da coroa (fora da seleção); abaixo da
     altura do bloco, a célula "Movimento" (com o sistema aberto). Cada plano —
     coroa, bloco, célula — pinta o mesmo campo, recortado no seu lugar. */
  const extent = s => ({
    top:s.under && !root.dataset.sel ? -s.y : 0,
    bottom:s.h + (s.movOn ? s.mov.h : 0)
  });

  /* ---------- DATA: a régua passada ----------
     A aresta graduada atravessa o campo da esquerda para a direita. Uma
     passagem leva o dia à noite (o branco vira azul atrás dela); a seguinte
     devolve o dia; e assim alterna enquanto a vitrine roda. */
  const PASS = SHOW / 3, SWEEP = .82;   // três passagens inteiras por exibição
  const glide = n => { const t = clamp(n); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  function ruler(mt){
    const k = Math.floor(mt / PASS), x = glide((mt - k * PASS) / PASS / SWEEP);
    return {x, night:k % 2 === 0};
  }
  // azul do lado já medido; a aresta com graduação voltada para o lado ainda por medir
  function measureBand(ctx, s, r, top, bottom, origin, a){
    const X = r.x * s.w;
    ctx.globalAlpha = TINT * a; ctx.fillStyle = s.color;
    if (r.night) ctx.fillRect(0, top, X, bottom - top);
    else ctx.fillRect(X, top, s.w - X, bottom - top);
    ctx.globalAlpha = a;
    if (r.x <= 0 || r.x >= 1){ ctx.globalAlpha = 1; return; }
    ctx.strokeStyle = "rgba(44,44,44,.55)"; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(X, top); ctx.lineTo(X, bottom);
    const step = 6;
    for (let n = Math.ceil((top - origin) / step); origin + n * step <= bottom; n++){
      const y = origin + n * step, l = n % 10 === 0 ? 11 : n % 5 === 0 ? 7 : 4;
      ctx.moveTo(X, y + .5); ctx.lineTo(X + l, y + .5);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  /* ---------- ECHO: campo de pressão (algoritmo de echo.html) ----------
     Grade de traços no passo do parágrafo (2 caracteres × 1 entrelinha),
     com os traços na entrelinha, entre as linhas de texto. Gotas caem sozinhas
     em pontos ao acaso do campo e abrem ondas como na água (na hero, é o toque
     que as faz); ao fundo, gabinetes à esquerda — do lado do DATA — emitem
     pulsos mais fracos. Sobre o texto a agitação é amortecida. */
  const VEL = 9, TAU = 6.2832;      // mais lento que na hero: a vitrine é fundo
  const ruido = n => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
  const GAB = [.08, .3, .5, .7, .92].map((fy, i) => ({
    fx:-6 - 16 * ruido(i + 3), fy:fy + (ruido(i + 5) - .5) * .12,
    P:2.6 + 2.4 * ruido(i + 7), lam:3.4 + 2.8 * ruido(i + 9), a:.5 + .25 * ruido(i + 13)
  }));
  const shown = el => el && el.getClientRects().length;
  // blocos de texto em coordenadas do campo: título e parágrafo do bloco; com
  // o sistema aberto, também o texto do Movimento
  function textBlocks(s){
    const txt = s.col.querySelector(".arx-col__txt");
    const c = s.col.getBoundingClientRect();
    const rel = (r, ox, oy) => [r.left - ox, r.top - oy, r.right - ox, r.bottom - oy];
    const hd = s.col.querySelector(".arx-col__head").getBoundingClientRect();
    const blocks = [];
    if (shown(txt)){ const t = txt.getBoundingClientRect(); blocks.push([t.left - c.left, hd.top - c.top, t.right - c.left, t.bottom - c.top]); }
    else blocks.push(rel(hd, c.left, c.top));
    if (s.movOn){
      const m = s.mov.layer.getBoundingClientRect();
      s.mov.host.querySelectorAll("p").forEach(p => {
        const r = rel(p.getBoundingClientRect(), m.left, m.top);
        blocks.push([r[0], r[1] + s.h, r[2], r[3] + s.h]);
      });
    }
    return blocks;
  }
  function echoGrid(s, F){
    const txt = s.col.querySelector(".arx-col__txt");
    const cs = getComputedStyle(txt);
    s.ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const adv = s.ctx.measureText("M").width + (parseFloat(cs.letterSpacing) || 0);
    const passo = 2 * adv, linha = parseFloat(cs.lineHeight) || adv * 2.4;
    const c = s.col.getBoundingClientRect();
    const blocks = textBlocks(s);
    const L = blocks[0][0], T = shown(txt) ? txt.getBoundingClientRect().top - c.top : blocks[0][1];
    const pts = [];
    for (let j = Math.floor((F.top - T) / linha); T + j * linha < F.bottom + linha; j++){
      const y = T + j * linha;
      for (let i = Math.floor(-L / passo) - 1; L + passo / 2 + i * passo < s.w + passo; i++){
        const x = L + passo / 2 + i * passo;
        let d = Infinity;
        for (const [l, t, r, b] of blocks) d = Math.min(d, Math.hypot(Math.max(l - x, 0, x - r), Math.max(t - y, 0, y - b)));
        const m = .55 + .45 * liso(0, 6, d / passo);
        pts.push(x, y, m, .1 + .1 * (1 - m));
      }
    }
    return {passo, linha, top:F.top, bottom:F.bottom, pts:new Float32Array(pts)};
  }
  // gotas ao acaso, mas com intervalo entre .9 e 1.6 s: nunca há campo parado
  const DROP = 1.25, JITTER = .35;
  const T0 = 3;        // relógio do campo no início de cada exibição
  function echoPulses(g, W, t, life, h){
    const list = [], H = g.bottom - g.top;
    // a primeira gota cai logo na entrada, no meio do bloco
    if (t - (T0 + .05) >= 0 && t - (T0 + .05) <= life) list.push({x:W / 2, y:h * .5, t0:T0 + .05, a:.42, lam:3.8, sig:3.2});
    for (let k = Math.floor((t - life) / DROP) - 1; k <= Math.floor(t / DROP) + 1; k++){
      const t0 = k * DROP + (ruido(k * 7 + 1) - .5) * JITTER, age = t - t0;
      if (age < 0 || age > life) continue;
      list.push({x:(.06 + .88 * ruido(k * 13 + 2)) * W, y:g.top + (.06 + .88 * ruido(k * 19 + 3)) * H, t0,
        a:.38 + .18 * ruido(k * 23 + 4), lam:3.6 + ruido(k * 29 + 5), sig:3.2});
    }
    GAB.forEach((p, n) => {
      for (let k = Math.floor((t - life) / p.P) - 1; k <= Math.floor(t / p.P) + 1; k++){
        const t0 = (k + (ruido(n * 31 + k) - .5) * .6) * p.P, age = t - t0;
        if (age < 0 || age > life) continue;
        list.push({x:p.fx * g.passo, y:g.top + p.fy * H, t0, a:.4 * p.a * (.75 + .5 * ruido(n * 17 + k)), lam:p.lam, sig:p.lam * .75});
      }
    });
    return list;
  }
  function echoField(s, F, t){
    const key = `${F.top}|${F.bottom}|${s.w}`;
    if (!s.grid || s.gridKey !== key){ s.grid = echoGrid(s, F); s.gridKey = key; }
    const g = s.grid, ps = echoPulses(g, s.w, t, (s.w / g.passo + 40) / VEL, s.h);
    const set = Array.from({length:16}, () => []);
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
      const alpha = Math.min(.42, Math.max(.04, g.pts[i + 3] - tension * .75));
      const px = x + dx * g.passo, py = y + dy * g.passo;
      const l = half * (1 + .5 * Math.min(1, Math.abs(tension)));
      set[Math.min(15, Math.round(alpha * 21))].push(px, py - l, py + l);
    }
    return ctx => {
      ctx.lineWidth = Math.max(.75, g.passo * .05);
      ctx.lineCap = "butt";
      set.forEach((b, j) => {
        if (!b.length) return;
        ctx.strokeStyle = `rgba(44,44,44,${(j / 21).toFixed(3)})`;
        ctx.beginPath();
        for (let i = 0; i < b.length; i += 3){ ctx.moveTo(b[i], b[i + 1]); ctx.lineTo(b[i], b[i + 2]); }
        ctx.stroke();
      });
    };
  }

  /* ---------- ATRIO: o chão xadrez a partir do horizonte ----------
     Ponto de fuga no centro do bloco, sobre a linha de base. As fileiras têm
     passo constante em profundidade e avançam para quem olha, sem emenda;
     com o sistema aberto, o chão desce até o pé da célula Movimento. */
  function floor(ctx, s, mt, H){
    const W = s.w, cx = W / 2, half = .2 * W, S = .28;
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
    // a esteira em cinza, não em preto: o texto em #2C2C2C se lê por cima
    ctx.fillStyle = "rgba(252,252,252,.38)"; ctx.fill(paper);
    ctx.fillStyle = "rgba(128,128,128,.12)"; ctx.fill(ink);
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
      // só o bloco rente à base do arco herda o trecho da coroa
      s.under = r.width > 0 && Math.abs(r.top - c.bottom) < 3;
      s.color = getComputedStyle(s.col).getPropertyValue("--c").trim() || "#2C2C2C";
      s.grid = null;
      fit(s.canvas, s.w, s.h);
      if (s.mov){
        const m = s.mov.layer.getBoundingClientRect();   // inclui a borda de cima da célula
        s.mov.w = m.width; s.mov.h = m.height;
        s.movOn = root.dataset.sel === s.sys && m.height > 0;
        fit(s.mov.canvas, s.mov.w, s.mov.h);
      }
    });
    fitNames();
  }
  /* Nomes na coroa: os três com a mesma altura de letra, a base encostada na
     linha do tempo (1,5 px de respiro) e o mesmo tamanho para todos — o maior
     em que nenhum toca a curva interna do arco (o D do DATA à esquerda, o O do
     ATRIO à direita) nem passa de 86% do trecho. Cada fonte tem proporções
     próprias, então a altura comum vira um corpo de fonte por sistema. */
  const names = Object.fromEntries(SYSTEMS.map(sys => [sys, root.querySelector(`.arx-name [data-sys="${sys}"]`)]));
  const intra = root.querySelector(".arx-arc__intra");
  const GAP = 1.5, CLEAR = 5;
  function nameMetrics(){
    const c = document.createElement("canvas").getContext("2d"), ref = 100, out = {};
    for (const sys of SYSTEMS){
      const el = names[sys];
      if (!el) continue;
      const cs = getComputedStyle(el);
      c.font = `${cs.fontStyle} ${cs.fontWeight} ${ref}px ${cs.fontFamily}`;
      if ("fontStretch" in c) c.fontStretch = parseFloat(cs.fontStretch) >= 125 ? "expanded" : "normal";
      const m = c.measureText(el.textContent.trim());
      out[sys] = {ink:m.actualBoundingBoxAscent / ref, inkD:m.actualBoundingBoxDescent / ref,
        fA:m.fontBoundingBoxAscent / ref, fD:m.fontBoundingBoxDescent / ref,
        w:(m.actualBoundingBoxLeft + m.actualBoundingBoxRight) / ref};
    }
    return out;
  }
  function fitNames(){
    if (!intra || !intra.getTotalLength || !skyW) return;
    const vb = intra.ownerSVGElement.viewBox.baseVal, sx = skyW / vb.width, sy = skyH / vb.height;
    const len = intra.getTotalLength(), pts = [];
    for (let i = 0; i <= 160; i++){ const p = intra.getPointAtLength(len * i / 160); pts.push([p.x * sx, skyH - p.y * sy]); }
    const rise = x => {   // altura da curva interna sobre a base em x (px da coroa)
      if (x <= pts[0][0]) return 0;
      for (let i = 1; i < pts.length; i++) if (pts[i][0] >= x){
        const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
        return y0 + (y1 - y0) * ((x - x0) / ((x1 - x0) || 1));
      }
      return 0;
    };
    const M = nameMetrics();
    const fits = H => surfaces.every(s => {
      const m = M[s.sys];
      if (!m || !s.under || !s.w) return true;
      const w = m.w * H / m.ink, cx = s.x + s.w / 2, top = GAP + H + CLEAR;
      return w <= .86 * s.w && rise(cx - w / 2) >= top && rise(cx + w / 2) >= top;
    });
    let H = skyH * .6;
    while (H > 8 && !fits(H)) H -= .5;
    for (const sys of SYSTEMS){
      const m = M[sys];
      if (!m) continue;
      const fs = H / m.ink;
      // line-height 1: a linha de base fica a (fs − (fA+fD)·fs)/2 + fD·fs do pé da caixa
      const baseline = (fs - (m.fA + m.fD) * fs) / 2 + m.fD * fs;
      root.style.setProperty(`--vit-fs-${sys}`, `${fs.toFixed(2)}px`);
      root.style.setProperty(`--vit-bottom-${sys}`, `${(GAP + m.inkD * fs - baseline).toFixed(2)}px`);
    }
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
  // um plano (bloco, coroa ou célula) pinta o campo inteiro, recortado em R
  function region(ctx, s, F, mt, a, R, motif){
    if (s.sys === "data"){ measureBand(ctx, s, ruler(mt), R.top, R.bottom, F.top, a); return; }
    ctx.save();
    ctx.globalAlpha = a;
    if (motif) motif(ctx, R);
    // a cor do sistema por baixo do desenho (o xadrez recorta a si, não a ela)
    ctx.globalCompositeOperation = "destination-over";
    ctx.globalAlpha = TINT * a; ctx.fillStyle = s.color; ctx.fillRect(0, R.top, s.w, R.bottom - R.top);
    ctx.restore();
  }
  // pinta o bloco e a célula (opacidade pela camada) e o trecho da coroa (alfa no plano único)
  function paint(s, mt, a){
    const F = extent(s);
    const echo = s.sys === "echo" ? echoField(s, F, T0 + mt / 1000) : null;
    const motif = echo ? ctx => echo(ctx) : s.sys === "atrio" ? (ctx, R) => { if (R.top >= 0) floor(ctx, s, mt, F.bottom); } : null;
    const g = s.ctx;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, s.w, s.h);
    region(g, s, F, mt, 1, {top:0, bottom:s.h}, motif);
    if (F.top < 0){
      skyCtx.save(); clipCrown(s);
      skyCtx.setTransform(dpr, 0, 0, dpr, dpr * s.x, dpr * s.y);
      region(skyCtx, s, F, mt, a, {top:F.top, bottom:0}, motif);
      skyCtx.restore();
    }
    if (s.movOn){
      const m = s.mov.ctx;
      m.setTransform(dpr, 0, 0, dpr, 0, 0);
      m.clearRect(0, 0, s.mov.w, s.mov.h);
      m.setTransform(dpr, 0, 0, dpr, 0, -dpr * s.h);
      region(m, s, F, mt, 1, {top:s.h, bottom:F.bottom}, motif);
    }
  }

  function clear(){
    surfaces.forEach(({col, layer, mov}) => {
      delete col.dataset.exhibiting; layer.style.opacity = "0";
      if (mov){ delete mov.host.dataset.exhibiting; mov.layer.style.opacity = "0"; }
    });
    delete root.dataset.exhibit;
    delete root.dataset.exhibitCrown;
    skyCtx.setTransform(1, 0, 0, 1, 0, 0);
    skyCtx.clearRect(0, 0, sky.width, sky.height);
  }
  function render(){
    clear();
    if (!started) return;
    skyCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const k = ease(xf / XF);
    const shown = [[cur, curT, prev === -1 ? 1 : k]];
    if (prev >= 0 && k < 1) shown.unshift([prev, prevT, 1 - k]);
    for (const [i, mt, a] of shown){
      const s = surfaces[i];
      if (!s.w || !s.h || a <= 0) continue;
      s.col.dataset.exhibiting = s.sys;
      s.layer.style.opacity = String(a);
      if (s.movOn){ s.mov.host.dataset.exhibiting = s.sys; s.mov.layer.style.opacity = String(a); }
      paint(s, mt, a);
    }
    const c = surfaces[cur];
    root.dataset.exhibit = c.sys;
    // o nome na coroa fica sobre o trecho do bloco ativo; sem trecho, não aparece
    if (c.under && !root.dataset.sel){
      root.dataset.exhibitCrown = "";
      root.style.setProperty("--vit-name-x", `${c.x + c.w / 2}px`);
    } else delete root.dataset.exhibitCrown;
  }

  /* ---------- quando roda ---------- */
  const viewTop = () => {
    let top = window.visualViewport?.offsetTop || 0;
    const rail = document.querySelector(".rail");
    if (rail && ["fixed", "sticky"].includes(getComputedStyle(rail).position)){
      const r = rail.getBoundingClientRect();
      if (r.width >= innerWidth * .8 && r.top <= top + 1) top = Math.max(top, r.bottom);
    }
    return top;
  };
  // fração visível de cada bloco; a vitrine roda enquanto algum estiver na tela
  function seen(){
    const top = viewTop(), bottom = (window.visualViewport?.offsetTop || 0) + (window.visualViewport?.height || innerHeight);
    return cols.map(col => {
      const r = col.getBoundingClientRect();
      if (!r.height || !r.width) return 0;
      return Math.max(0, Math.min(r.bottom, bottom) - Math.max(r.top, top)) / r.height;
    });
  }
  const formed = () => root.classList.contains("is-drawn") && ["formed", "rest"].includes(root.dataset.state);
  const canRun = () => formed() && !motion.matches && !document.hidden &&
    home.dataset.active === "true" && seen().some(v => v > 0);
  const stacked = () => innerWidth <= 640;

  function switchTo(i){
    if (i === cur) return;
    if (prev === -1 && xf < XF) { cur = i; curT = 0; return; }   // ainda entrando: troca direta
    prev = cur; prevT = curT; cur = i; curT = 0; xf = 0;
  }
  function tick(now){
    frame = 0;
    if (!canRun()){ previous = 0; return; }
    const dt = previous ? Math.min(250, now - previous) : 0;
    previous = now;
    if (!started){ started = true; root.dataset.showcase = "AUTO"; prev = -1; xf = 0; curT = 0; }
    // no celular a animação fica com o bloco mais visível; no desktop, com o
    // bloco sob o cursor ou em foco; sem nenhum dos dois, segue a ordem
    // com um sistema aberto, a animação fica no bloco dele
    const sel = SYSTEMS.indexOf(root.dataset.sel || "");
    let target = sel >= 0 ? sel : pinned, ring = null;
    if (target < 0 && stacked()){
      // no celular: com mais de um bloco inteiro na tela, a ordem roda entre
      // eles; com um só, fica nele (no empate, o mais perto do centro)
      const v = seen(), full = v.map((f, i) => f >= .98 ? i : -1).filter(i => i >= 0);
      if (full.length > 1) ring = full;
      else {
        const mid = innerHeight / 2, dist = i => { const r = cols[i].getBoundingClientRect(); return Math.abs((r.top + r.bottom) / 2 - mid); };
        target = v.reduce((best, f, i) => f > v[best] + .01 || (Math.abs(f - v[best]) <= .01 && dist(i) < dist(best)) ? i : best, 0);
      }
    }
    if (target >= 0) switchTo(target);
    else if (ring){
      if (!ring.includes(cur)) switchTo(ring[0]);
      else if (curT >= SHOW) switchTo(ring[(ring.indexOf(cur) + 1) % ring.length]);
    }
    else if (curT >= SHOW) switchTo((cur + 1) % surfaces.length);
    curT += dt; prevT += dt; xf = Math.min(XF, xf + dt);
    render();
    frame = requestAnimationFrame(tick);
  }
  function sync(){
    if (!canRun()){
      cancelAnimationFrame(frame); frame = 0; previous = 0;
      if (motion.matches) clear();
    } else if (!frame) frame = requestAnimationFrame(tick);
  }

  /* ---------- seleção: a animação segue no bloco escolhido ---------- */
  function selectManually(sys){
    chosen = sys;
    root.dataset.showcase = "SELECTED";
    sync();
    status.textContent = `${sys.toUpperCase()} selecionado. Ative o mesmo bloco novamente para recolher.`;
  }
  root.addEventListener("arx:manual", event => selectManually(event.detail.sys));
  /* a troca de ordem desliza: cada bloco parte de onde estava (FLIP) */
  let lefts = cols.map(col => col.getBoundingClientRect().left), lastSel = root.dataset.sel || "";
  const remember = () => { lefts = cols.map(col => col.getBoundingClientRect().left); };
  function slide(){
    const before = lefts;
    remember();
    if (motion.matches) return;
    const dxs = cols.map((col, i) => before[i] - lefts[i]);
    // o bloco que atravessa os outros vai por cima, com fundo de papel
    const far = dxs.reduce((m, dx, i) => Math.abs(dx) > Math.abs(dxs[m]) ? i : m, 0);
    cols.forEach((col, i) => {
      const dx = dxs[i];
      if (Math.abs(dx) < 1) return;
      col.style.transition = "none";
      col.style.transform = `translateX(${dx}px)`;
      if (i === far){ col.style.backgroundColor = "#FCFCFC"; col.style.zIndex = "2"; }
      col.getBoundingClientRect();
      requestAnimationFrame(() => {
        col.style.transition = "transform 640ms cubic-bezier(.22, 1, .36, 1)";
        col.style.transform = "";
        col.addEventListener("transitionend", () => {
          col.style.transition = ""; col.style.backgroundColor = ""; col.style.zIndex = "";
          measure();
        }, {once:true});
      });
    });
  }
  new MutationObserver(() => {
    const sys = root.dataset.sel;
    if ((sys || "") !== lastSel){ lastSel = sys || ""; slide(); measure(); }
    if (sys && chosen !== sys) selectManually(sys);
    else if (!sys && chosen){
      // fechado o painel, a ordem recomeça pelo sistema que estava aberto
      chosen = "";
      curT = 0;
      if (started) root.dataset.showcase = "AUTO";
    }
    sync();
  }).observe(root, {attributes:true, attributeFilter:["data-sel", "data-state", "class"]});

  // sob o cursor ou com foco, o bloco segura a animação para si
  const release = () => { pinned = -1; curT = Math.min(curT, SHOW - 1500); };
  cols.forEach((col, i) => {
    col.addEventListener("pointerenter", event => { if (event.pointerType !== "touch") pinned = i; });
    col.addEventListener("pointerleave", event => { if (event.pointerType !== "touch" && pinned === i) release(); });
    col.addEventListener("focusin", () => { pinned = i; });
    col.addEventListener("focusout", () => queueMicrotask(() => { if (!col.contains(document.activeElement) && pinned === i) release(); }));
  });

  document.addEventListener("visibilitychange", sync);
  addEventListener("scroll", sync, {passive:true});
  window.visualViewport?.addEventListener("resize", sync);
  window.visualViewport?.addEventListener("scroll", sync);
  const resize = () => { measure(); remember(); render(); sync(); };
  addEventListener("resize", resize, {passive:true});
  if ("ResizeObserver" in window){
    const observer = new ResizeObserver(resize);
    observer.observe(group); observer.observe(crown);
    surfaces.forEach(s => s.mov && observer.observe(s.mov.host));
  }
  if ("IntersectionObserver" in window){
    const observer = new IntersectionObserver(sync, {threshold:[0, .01, 1]});
    cols.forEach(col => observer.observe(col));
  }
  new MutationObserver(sync).observe(home, {attributes:true, attributeFilter:["data-active"]});
  motion.addEventListener("change", () => { if (motion.matches) clear(); sync(); });
  document.fonts?.ready.then(resize);
  resize();
})();
