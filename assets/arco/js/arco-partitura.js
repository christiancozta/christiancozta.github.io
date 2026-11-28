/* ARCO — Legal Operations: o playbook oficial em duas abas (27/11/2026)
   O quadro mostra play.html inteiro (?inteira: a partitura oficial, não a
   vitrine). As abas não trocam de página: Partitura fecha a camada de
   Templates; Montador a abre (play.html#templates). Se a camada for fechada
   por dentro ("Voltar à partitura", Esc), a aba acompanha, pela classe
   com-camada do corpo do quadro (mesma origem). Setas trocam de aba.
   Medida (28/11/2026): na partitura, o quadro tem a altura da própria folha,
   inteira e sem rolagem interna; a página é que rola. A folha (.a4) tem
   altura mínima de uma tela, que aqui se desliga (classe altura-livre no
   documento do quadro, mesma origem), para que ela tenha só a altura do que
   contém. Quando o PLAY abre uma camada de tela inteira (montador, parte,
   leitor, busca), o quadro volta à altura da tela (CSS) e sobe ao alto,
   sob o cordão. A cada mudança de altura, o painel volta a fechar em
   quadrados inteiros da retícula (evento arco:medida, em arco-home.js).
   Ao trocar de aba, as abas sobem ao alto da tela, sob o cordão. */
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
    const topo = raiz.querySelector(".hm-part__top") || raiz;
    const y = topo.getBoundingClientRect().top - railH();
    if (Math.abs(y) > 4) window.scrollBy({ top:y, behavior:matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  abas.forEach((a, i) => {
    a.addEventListener("click", () => { mostra(a.dataset.vista); sobe(); });
    a.addEventListener("keydown", e => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const n = abas[(i + (e.key === "ArrowRight" ? 1 : abas.length - 1)) % abas.length];
      n.focus(); mostra(n.dataset.vista);
    });
  });

  /* ---------- medida: a partitura inteira ---------- */
  const emCamada = d => {
    const h = d.documentElement.classList, b = d.body.classList;
    if (h.contains("com-parte") || h.contains("com-leitor") || b.contains("com-camada")) return true;
    const ov = d.querySelector(".overlay");
    return !!(ov && !ov.hidden && ov.getClientRects().length);
  };
  let rafM = 0, ultima = -1;
  function mede(){
    rafM = 0;
    const d = doc();
    if (!d || !d.body) return;
    let alvo = "";
    if (emCamada(d)){
      d.documentElement.classList.remove("altura-livre");
      if (quadro.style.height) sobe();
    } else {
      d.documentElement.classList.add("altura-livre");
      /* duas passadas: o rosto da folha tem folgas em vh, que mudam com a altura do quadro */
      for (let i = 0; i < 3; i++){
        const h = Math.ceil(d.body.offsetHeight);
        if (!h || Math.abs(h - quadro.clientHeight) <= 1) break;
        quadro.style.height = h + "px";
      }
      alvo = quadro.style.height;
    }
    if (!alvo) quadro.style.height = "";
    const agora = quadro.offsetHeight;
    if (agora !== ultima){ ultima = agora; raiz.dispatchEvent(new CustomEvent("arco:medida", { bubbles:true })); }
  }
  const agenda = () => { if (!rafM) rafM = requestAnimationFrame(mede); };
  addEventListener("resize", agenda, { passive:true });

  function liga(){
    const d = doc();
    if (!d || !d.body) return;
    if (!d.getElementById("arco-altura-livre")){
      const s = d.createElement("style");
      s.id = "arco-altura-livre";
      s.textContent = "html.altura-livre .a4{min-height:0}";
      d.head.append(s);
    }
    new MutationObserver(() => {
      marca(d.body.classList.contains("com-camada") ? "montador" : "partitura");
      agenda();
    }).observe(d.body, { attributes:true, attributeFilter:["class"] });
    new MutationObserver(agenda).observe(d.documentElement, { attributes:true, attributeFilter:["class"] });
    new MutationObserver(agenda).observe(d.body, { subtree:true, attributes:true, attributeFilter:["hidden"] });
    if ("ResizeObserver" in window) new ResizeObserver(agenda).observe(d.body);
    d.fonts?.ready.then(agenda);
    agenda();
    if (pendente){ const v = pendente; pendente = null; setTimeout(() => mostra(v), 60); }
  }
  quadro.addEventListener("load", liga);
  if (pronto()) liga();
})();
