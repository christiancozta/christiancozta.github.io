/* Vitrine editorial: o relógio só corre com os três blocos inteiros à vista.
   A revelação é decorativa; a seleção continua pertencendo ao arco existente. */
(() => {
  "use strict";
  const root = document.querySelector(".arx[data-showcase]");
  if (!root) return;
  const group = root.querySelector(".arx-cols");
  const cols = [...group.querySelectorAll(".arx-col")];
  const home = root.closest(".view");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const TIMING = Object.freeze({initial:2500, reveal:1500, hold:5000, retract:750, interval:2500, cycle:5000});
  const SYSTEMS = ["data", "echo", "atrio"];
  const clamp = n => Math.max(0, Math.min(1, n));
  const ease = n => { const t = clamp(n); return t * t * (3 - 2 * t); };
  let stopped = false, chosen = "", index = 0, phase = "initial", elapsed = 0;
  let frame = 0, previous = 0, hovering = false, focused = false;
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
    col.append(layer);
    surfaces.push({col, layer, sys:SYSTEMS[i], width:0, height:0});
  });

  // All art is vector-based. ECHO reuses the exact wordmark from its own page.
  function build(surface){
    const {col, layer, sys} = surface;
    const box = col.getBoundingClientRect();
    if (!box.width || !box.height) return;
    if (surface.width === box.width && surface.height === box.height) return;
    surface.width = box.width; surface.height = box.height;
    const w = 1000, h = box.height / box.width * w;
    surface.h = h;
    const img = (name, x, y, width, height, extra = "") => `<image href="assets/arco/showcase/${name}.svg" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMin meet" ${extra}/>`;
    let art = "", mask = "", ink = "";
    if (sys === "data"){
      const y = h * .5, logoHeight = Math.min(252, h * .25);
      const logoWidth = logoHeight * 1000 / 280, x = (1000 - logoWidth) / 2;
      const baseline = y + logoHeight;
      art = `<rect width="1000" height="${h}" fill="#4A90E2"/><rect y="${baseline}" width="1000" height="${h}" fill="#FCFCFC"/>`;
      // The reflected lettering stretches away from the shared baseline.
      art += `<g transform="translate(${x} ${baseline}) matrix(1 0 .28 -2.5 0 ${logoHeight * 2.5})" filter="url(#arx-data-ink-data)">${img("data", 0, 0, logoWidth, logoHeight)}</g>`;
      art += img("data", x, y, logoWidth, logoHeight);
      mask = Array.from({length:16}, (_, n) => `<rect data-bar="${n}" x="${n * 62.5}" y="${h}" width="63" height="0" fill="white"/>`).join("");
    } else if (sys === "echo"){
      art = `<rect width="1000" height="${h}" fill="#FFB627"/>`;
      // A stationary field of quiet marks, with the monumental original logo.
      for (let x = 40; x < w; x += 40) for (let y = 150; y < h; y += 44){
        const opacity = .035 + .10 * (1 + Math.sin(x * .013 + y * .009)) / 2;
        art += `<path d="M${x} ${y}v15" stroke="#2C2C2C" stroke-opacity="${opacity}" stroke-width="1.4"/>`;
      }
      art += img("echo", -25, Math.max(h * .6, h - 235), 1050, 260);
      surface.centers = [[240, h * .36], [730, h * .58], [420, h * .8]];
      mask = surface.centers.map(([x,y]) => `<circle data-wave cx="${x}" cy="${y}" r="0" fill="white"/>`).join("");
      ink = surface.centers.map(([x,y]) => `<g data-ripple><path data-drop d="M${x} ${y - 95}v20" stroke="#2C2C2C" stroke-width="2"/><circle cx="${x}" cy="${y}" r="0" fill="none" stroke="#2C2C2C" stroke-width="1.5"/><circle cx="${x}" cy="${y}" r="0" fill="none" stroke="#2C2C2C" stroke-width=".8"/></g>`).join("");
    } else {
      const headerBottom = (col.querySelector(".arx-col__head").getBoundingClientRect().bottom - box.top + 14) / box.width * w;
      const logoTop = Math.max(h * .25, headerBottom);
      const horizon = Math.max(h * .47, logoTop + 153);
      art = `<rect width="1000" height="${h}" fill="#D94F2D"/>` + img("atrio", 85, logoTop, 830, 133);
      // Perspective squares converge on a single vanishing point, as in ATRIO.
      const depth = h - horizon;
      const levels = Array.from({length:20}, (_, n) => n === 0 ? horizon : horizon + depth * Math.pow(.73, 19 - n));
      const xAt = (column, y) => 500 + (column - 4) * 320 * (y - horizon) / depth;
      for (let row = 0; row < levels.length - 1; row++){
        const top = levels[row], bottom = levels[row + 1];
        for (let c = 0; c < 8; c++) art += `<path d="M${xAt(c,top)} ${top}L${xAt(c+1,top)} ${top}L${xAt(c+1,bottom)} ${bottom}L${xAt(c,bottom)} ${bottom}Z" fill="${(row+c)%2 ? '#FCFCFC' : '#2C2C2C'}"/>`;
      }
      const lines = [];
      for (let n = 0; n < 12; n++){
        const y = h * (.16 + n * .075);
        lines.push(`M0 ${y}H1000`, `M${n * 91} 0V${h}`);
      }
      for (let n = 0; n < 9; n++) lines.push(`M500 ${horizon}L${(n-4)*320+500} ${h}`);
      mask = lines.map((d,n) => `<path data-plan="${n}" d="${d}" pathLength="1" stroke="white" fill="none" stroke-dasharray="1" stroke-dashoffset="1"/>`).join("") + `<rect data-solid width="1000" height="${h}" fill="white" opacity="0"/>`;
      ink = lines.map((d,n) => `<path data-sketch="${n}" d="${d}" pathLength="1" fill="none" stroke="#2C2C2C" stroke-width="1" stroke-dasharray="1" stroke-dashoffset="1"/>`).join("");
    }
    layer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 ${h}" focusable="false"><defs><filter id="arx-data-ink-${sys}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 .1725 0 0 0 0 .1725 0 0 0 0 .1725 0 0 0 1 0"/></filter><mask id="arx-reveal-${sys}" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="${h}">${mask}</mask></defs><g mask="url(#arx-reveal-${sys})">${art}</g><g data-ink>${ink}</g></svg>`;
    surface.bars = [...layer.querySelectorAll("[data-bar]")];
    surface.waves = [...layer.querySelectorAll("[data-wave]")];
    surface.ripples = [...layer.querySelectorAll("[data-ripple]")];
    surface.plans = [...layer.querySelectorAll("[data-plan]")];
    surface.sketches = [...layer.querySelectorAll("[data-sketch]")];
    surface.solid = layer.querySelector("[data-solid]");
    surface.ink = layer.querySelector("[data-ink]");
  }

  function reveal(surface, progress){
    const p = clamp(progress), h = surface.h;
    surface.bars.forEach((bar, n) => {
      const value = ease((p - (n * 7 % 16) * .025) / .625);
      bar.setAttribute("y", h * (1 - value));
      bar.setAttribute("height", h * value);
    });
    surface.waves.forEach((wave, n) => {
      const t = ease((p - .10 - n * .12) / .66);
      wave.setAttribute("r", Math.hypot(1000, h) * t);
      const ripple = surface.ripples[n];
      ripple.style.opacity = String((1 - t) * .36);
      const drop = ripple.querySelector("path");
      const fall = clamp((p - n * .12) / .1);
      drop.setAttribute("transform", `translate(0 ${fall * 75})`);
      drop.style.opacity = fall >= 1 ? "0" : "1";
      ripple.querySelectorAll("circle").forEach((circle, i) => circle.setAttribute("r", Math.hypot(1000, h) * t * (i ? .78 : 1)));
    });
    surface.plans.forEach((line, n) => {
      const t = ease((p - n * .012) / .45);
      line.setAttribute("stroke-dashoffset", 1 - t);
      line.setAttribute("stroke-width", 1 + 110 * ease((p - .40) / .6));
      surface.sketches[n].setAttribute("stroke-dashoffset", 1 - t);
    });
    if (surface.solid) surface.solid.setAttribute("opacity", ease((p - .66) / .34));
    if (surface.ink) surface.ink.style.opacity = String(1 - ease((p - .7) / .3));
  }

  function clear(){
    surfaces.forEach(({col, layer}) => {
      delete col.dataset.exhibiting;
      col.style.removeProperty("--story-opacity");
      layer.style.opacity = "0";
    });
  }
  function render(){
    clear();
    if (stopped || !["reveal", "hold", "retract"].includes(phase)) return;
    const surface = surfaces[index];
    if (!surface.h) return;
    const p = phase === "reveal" ? elapsed / TIMING.reveal : 1;
    const opacity = phase === "retract" ? 1 - ease(elapsed / TIMING.retract) : 1;
    surface.col.dataset.exhibiting = surface.sys;
    surface.layer.style.opacity = String(opacity);
    surface.col.style.setProperty("--story-opacity", 1 - ease(p * 4) * opacity);
    reveal(surface, p);
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
    return cols.every(col => {
      const r = col.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.top >= top - .5 && r.bottom <= bottom + .5 && r.left >= -.5 && r.right <= innerWidth + .5;
    });
  }
  const canRun = () => !stopped && !motion.matches && !document.hidden && !hovering && !focused && fullyVisible();
  function next(){
    elapsed = 0;
    if (phase === "initial" || phase === "interval" || phase === "cycle"){
      phase = "reveal"; root.dataset.showcase = "PREVIEW";
    } else if (phase === "reveal"){
      phase = "hold"; root.dataset.showcase = "AUTO";
    } else if (phase === "hold") phase = "retract";
    else {
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
  const resize = () => { surfaces.forEach(build); render(); sync(); };
  addEventListener("resize", resize, {passive:true});
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(group);
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
