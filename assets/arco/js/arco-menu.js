/* ==========================================================================
   ARCO — menu contextual de CERNE e PLAY (desktop acima de 1000px)
   COLLAPSED: o cordão vira faixa; o palco ganha a largura.
   PEEK: aproximação (ponteiro) ou foco (teclado) sobrepõe o cordão, sem reflow.
   PINNED: só a fixação explícita devolve a coluna ao cordão.
   Não roteia: lê a view que arco-core.js grava em .view[data-active]. Toda troca
   de view recomeça da política do destino; PINNED não passa de uma página a outra.
   Nenhum evento vem de dentro dos iframes.
   ========================================================================== */
(() => {
  "use strict";

  const POLICY = new Set(["cerne", "play"]);
  const OPEN_DELAY = 90;    /* intenção: um passe rápido pela borda não abre */
  const CLOSE_DELAY = 280;  /* folga entre faixa e cordão: evita abre-fecha */

  const root = document.documentElement;
  const rail = document.querySelector(".rail");
  const stage = document.getElementById("stage");
  if (!rail || !stage) return;
  const desktop = matchMedia("(min-width:1001px)");

  rail.id ||= "arco-rail";

  const strip = document.createElement("button");
  strip.type = "button";
  strip.className = "rail-strip";
  strip.setAttribute("aria-label", "Mostrar navegação");
  strip.setAttribute("aria-controls", rail.id);
  strip.setAttribute("aria-expanded", "false");
  rail.before(strip);

  const pin = document.createElement("button");
  pin.type = "button";
  pin.className = "rail__pin";
  pin.setAttribute("aria-controls", rail.id);
  (rail.querySelector(".rail__id") || rail).appendChild(pin);

  const currentView = () =>
    document.querySelector('.view[data-active="true"]')?.dataset.view || "home";
  /* antes do route() inicial do núcleo, o hash já diz qual view vai abrir */
  const initial = location.hash.slice(1);
  let view = POLICY.has(initial) ? initial : currentView();

  let pinned = false;
  const open = {hover:false, focus:false, tap:false};
  let suppressHover = false;   /* depois do Escape, até o ponteiro sair da zona */
  let openTimer = 0, closeTimer = 0;

  const inZone = node => !!node && (strip.contains(node) || rail.contains(node));
  const state = () => root.dataset.arcoMenu || "";
  const retractable = () => state() === "collapsed" || state() === "peek";

  function render(){
    if (!desktop.matches || !POLICY.has(view)){
      delete root.dataset.arcoMenu;
      strip.setAttribute("aria-expanded", "false");
      return;
    }
    const peek = !pinned && (open.hover || open.focus || open.tap);
    root.dataset.arcoMenu = pinned ? "pinned" : peek ? "peek" : "collapsed";
    strip.setAttribute("aria-expanded", String(peek));
    pin.textContent = pinned ? "Recolher" : "Fixar";
    pin.title = pinned ? "Recolher o menu" : "Fixar o menu ao lado";
  }

  function reset(){
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    pinned = false;
    open.hover = open.focus = open.tap = false;
    suppressHover = false;
  }

  /* ---- troca de view: a política do destino prevalece ---- */
  new MutationObserver(() => {
    const next = currentView();
    if (next === view) return;
    view = next;
    reset();
    render();
  }).observe(stage, {subtree:true, attributes:true, attributeFilter:["data-active"]});
  desktop.addEventListener?.("change", render);

  /* ---- ponteiro: faixa e cordão formam uma zona só ---- */
  const enter = () => {
    if (suppressHover || !retractable()) return;
    clearTimeout(closeTimer);
    if (open.hover) return;
    clearTimeout(openTimer);
    openTimer = setTimeout(() => { open.hover = true; render(); }, OPEN_DELAY);
  };
  const leave = event => {
    if (inZone(event.relatedTarget)) return;
    suppressHover = false;
    clearTimeout(openTimer);
    if (!open.hover) return;
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => { open.hover = false; render(); }, CLOSE_DELAY);
  };
  [strip, rail].forEach(node => {
    node.addEventListener("pointerenter", event => {
      if (event.pointerType === "mouse") enter();
    });
    node.addEventListener("pointerleave", leave);
  });

  /* clique na faixa: mouse abre já; toque (sem hover) abre até sair da zona */
  let lastPointer = "mouse";
  strip.addEventListener("pointerdown", event => { lastPointer = event.pointerType; });
  strip.addEventListener("click", event => {
    if (!retractable() || event.detail === 0) return;   /* teclado: o foco já abriu */
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    if (lastPointer === "mouse") open.hover = true;
    else open.tap = true;
    suppressHover = false;
    render();
  });
  document.addEventListener("pointerdown", event => {
    if (open.tap && !inZone(event.target)){ open.tap = false; render(); }
  });
  /* toque dentro do iframe tira o foco da janela-mãe: é o sinal de saída */
  window.addEventListener("blur", () => {
    if (open.tap){ open.tap = false; render(); }
  });

  /* ---- teclado: só o foco visível revela; clique de mouse não prende ---- */
  document.addEventListener("focusin", event => {
    const visible = inZone(event.target) && event.target.matches(":focus-visible");
    if (visible === open.focus || (visible && !retractable())) return;
    open.focus = visible;
    render();
  });
  document.addEventListener("focusout", event => {
    if (!open.focus || inZone(event.relatedTarget)) return;
    open.focus = false;
    render();
  });

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape" || state() !== "peek") return;
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    suppressHover = open.hover;
    open.hover = open.focus = open.tap = false;
    if (inZone(document.activeElement)) stage.focus({preventScroll:true});
    render();
  });

  /* ---- fixação: ação explícita nos dois sentidos ---- */
  pin.addEventListener("click", () => {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    pinned = !pinned;
    /* ao recolher, quem ainda está no cordão continua vendo-o até sair */
    open.hover = !pinned && rail.matches(":hover");
    open.focus = !pinned && pin.matches(":focus-visible");
    open.tap = false;
    render();
  });

  /* a primeira aplicação (ex.: arco.html#cerne) assenta sem animar a saída */
  root.dataset.arcoMenuInstant = "";
  render();
  getComputedStyle(rail).transform;   /* resolve o estado inicial ainda sem transição */
  requestAnimationFrame(() => requestAnimationFrame(() => delete root.dataset.arcoMenuInstant));
})();
