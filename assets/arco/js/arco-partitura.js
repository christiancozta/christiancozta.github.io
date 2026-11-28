/* ARCO — Legal Operations: o playbook oficial em duas abas (27/11/2026)
   O quadro mostra play.html inteiro (?inteira: a partitura oficial, não a
   vitrine). As abas não trocam de página: Partitura fecha a camada de
   Templates; Montador a abre (play.html#templates). Se a camada for fechada
   por dentro ("Voltar à partitura", Esc), a aba acompanha, pela classe
   com-camada do corpo do quadro (mesma origem). Setas trocam de aba.
   Altura: o quadro cresce até a altura da folha inteira, sem rolagem dentro
   da rolagem; sem JS, vale a altura útil da tela (CSS). Ao trocar de aba,
   o quadro sobe ao alto da tela, sob a barra. */
(() => {
  "use strict";
  const raiz = document.querySelector("[data-hm-partitura]");
  if (!raiz) return;
  const quadro = raiz.querySelector(".hm-part__frame");
  const painel = raiz.querySelector('[role="tabpanel"]');
  const abas = [...raiz.querySelectorAll('[role="tab"]')];
  if (!quadro || !abas.length) return;

  const marca = vista => abas.forEach(a => {
    const on = a.dataset.vista === vista;
    a.setAttribute("aria-selected", String(on));
    a.tabIndex = on ? 0 : -1;
    if (on && painel) painel.setAttribute("aria-labelledby", a.id);
  });

  const doc = () => { try { return quadro.contentDocument; } catch (_) { return null; } };
  const pronto = () => {
    const d = doc();
    return !!(d && d.readyState !== "loading" && d.body && d.getElementById("sistema"));
  };

  let pendente = null;
  function mostra(vista){
    marca(vista);
    if (!pronto()){ pendente = vista; return; }
    const w = quadro.contentWindow;
    const comCamada = doc().body.classList.contains("com-camada");
    if (vista === "montador" && !comCamada) w.location.hash = "templates";
    else if (vista === "partitura" && comCamada) w.location.hash = "";
  }

  const railH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--rail-h")) || 0;
  const sobe = () => {
    const y = raiz.getBoundingClientRect().top - railH();
    if (Math.abs(y) > 4) window.scrollBy({ top:y, behavior:matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  /* a folha inteira: o quadro mede o que a página mostra; para poder
     diminuir (ao estreitar a janela), volta antes à altura do CSS */
  let medindo = 0;
  function mede(){
    const d = doc();
    if (!d || !d.documentElement) return;
    quadro.style.height = "";
    const h = Math.ceil(d.documentElement.scrollHeight);
    if (h > quadro.clientHeight) quadro.style.height = h + "px";
    /* a home refaz as fileiras do painel pelo evento toggle (arco-home.js) */
    raiz.dispatchEvent(new Event("toggle"));
  }
  const pedeMedida = () => { cancelAnimationFrame(medindo); medindo = requestAnimationFrame(mede); };

  abas.forEach((a, i) => {
    a.addEventListener("click", () => { mostra(a.dataset.vista); sobe(); });
    a.addEventListener("keydown", e => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const n = abas[(i + (e.key === "ArrowRight" ? 1 : abas.length - 1)) % abas.length];
      n.focus(); mostra(n.dataset.vista);
    });
  });

  function liga(){
    const d = doc();
    if (!d || !d.body) return;
    pedeMedida();
    d.fonts?.ready.then(pedeMedida);
    setTimeout(pedeMedida, 900);
    new MutationObserver(() => {
      marca(d.body.classList.contains("com-camada") ? "montador" : "partitura");
    }).observe(d.body, { attributes:true, attributeFilter:["class"] });
    if (pendente){ const v = pendente; pendente = null; setTimeout(() => mostra(v), 60); }
  }
  quadro.addEventListener("load", liga);
  let largura = innerWidth;
  window.addEventListener("resize", () => { if (innerWidth !== largura){ largura = innerWidth; pedeMedida(); } }, { passive:true });
  if (pronto()) liga();
})();
