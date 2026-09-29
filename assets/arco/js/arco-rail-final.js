/* ARCO — navegação ATRIO: hero no título; módulos pousam em Arquitetura. */
(() => {
  "use strict";

  const trigger = document.querySelector('.rail__link[data-view="atrio"]');
  const moduleTriggers = [...document.querySelectorAll(
    '.rail__modlink[data-child="atrio"][data-target="arquitetura"][data-module]'
  )];
  const frame = document.querySelector('.view[data-view="atrio"] iframe.child__frame');
  if (!trigger || !frame) return;

  /* O título ATRIO é uma entrada de território: sempre volta à hero, sem
     reaproveitar a última subseção visitada. */
  trigger.addEventListener("click", () => {
    try { sessionStorage.removeItem("arco:child:atrio"); } catch {}

    const base = (frame.dataset.src || "atrio.html").split("#")[0];
    frame.dataset.src = base;

    if (frame.getAttribute("src") === "about:blank") return;

    try {
      const win = frame.contentWindow;
      const clean = win.location.pathname + win.location.search;
      win.history.replaceState(win.history.state, "", clean);
      win.scrollTo({top:0, left:0, behavior:"auto"});
    } catch {}
  }, {capture:true});

  /* CORPUS, RATIO, CERNE e LUX compartilham a mesma âncora de Arquitetura.
     O ATRIO interno normalmente reenquadra o módulo em 6% da viewport; quando
     a chamada vem do rail, suprimimos esse segundo enquadramento para que o
     ponto de pouso seja exatamente o mesmo do item "Arquitetura". */
  const prepareModuleLanding = (moduleKey, {activate = false} = {}) => {
    let doc, win;
    try {
      doc = frame.contentDocument;
      win = frame.contentWindow;
    } catch { return; }
    if (!doc || !win) return;

    const architecture = doc.getElementById("arquitetura");
    const system = doc.getElementById("architecture-system");
    if (system) system.dataset.suppressNextFrame = "true";

    if (architecture) architecture.scrollIntoView({block:"start", behavior:"auto"});

    if (activate) {
      const fn = win.atrioActivateModule;
      if (typeof fn === "function") fn(moduleKey);
    }
  };

  moduleTriggers.forEach(moduleTrigger => {
    moduleTrigger.addEventListener("click", () => {
      const moduleKey = moduleTrigger.dataset.module;
      const virgin = frame.getAttribute("src") === "about:blank";

      if (virgin) {
        frame.addEventListener("load", () => {
          prepareModuleLanding(moduleKey, {activate:true});
        }, {once:true});
        return;
      }

      /* Em iframe já carregado, o handler principal do ARCO fará a ativação
         logo depois desta captura. Aqui apenas neutralizamos o reenquadramento
         interno; o próprio handler comum executa a âncora de Arquitetura. */
      prepareModuleLanding(moduleKey);
    }, {capture:true});
  });
})();
