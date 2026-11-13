/* ARCO — eventos GA4 para entradas, seleções e aberturas dos sistemas.
   Contrato: não altera navegação, estado, animações ou histórico. */
(() => {
  "use strict";

  /* Não registrar eventos autorais nos ambientes locais/de pré-visualização. */
  if (location.hostname !== "christiancozta.github.io") return;

  const MODULES = new Set(["data", "echo", "atrio"]);
  const root = document.getElementById("arco-arquitetura");

  const track = (eventName, module, interactionSource) => {
    if (!MODULES.has(module) || typeof window.gtag !== "function") return;
    window.gtag("event", eventName, {
      module,
      interaction_source: interactionSource
    });
  };

  /* A leitura ocorre uma única vez, no carregamento do documento.
     pushState dentro do ARCO não representa uma entrada externa. */
  const incomingHash = (() => {
    try { return decodeURIComponent(location.hash.slice(1)).toLowerCase(); }
    catch { return ""; }
  })();
  if (MODULES.has(incomingHash)){
    track("arco_anchor_entry", incomingHash, "url_hash");
  }

  if (!root) return;

  /* A arquitetura já emite arx:manual quando há uma seleção humana.
     Confirmamos a escolha pela mudança efetiva do módulo selecionado:
     a restauração da sessão e o recolhimento não geram o evento. */
  let intendedSelection = null;
  root.addEventListener("arx:manual", event => {
    const module = event.detail?.sys;
    intendedSelection = MODULES.has(module) ? module : null;
  });

  const selectionObserver = new MutationObserver(() => {
    if (!intendedSelection || root.dataset.sel !== intendedSelection) return;
    const module = intendedSelection;
    intendedSelection = null;
    track("arco_module_select", module, "arco");
  });
  selectionObserver.observe(root, {
    attributes: true,
    attributeFilter: ["data-sel"]
  });

  /* CTA e navegação lateral são portas diferentes para o mesmo sistema.
     O clique sintético no cordão, feito pelo CTA, não é contabilizado de novo. */
  document.addEventListener("click", event => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const openLink = target.closest("[data-arx-open]");
    if (openLink && root.contains(openLink)){
      const module = openLink.dataset.arxOpen;
      const source = openLink.closest(".arx-sum") ? "panel" : "narrative";
      track("arco_module_open", module, source);
      return;
    }

    const railLink = target.closest(".rail__link[data-view]");
    if (!railLink || !event.isTrusted) return;
    const home = document.querySelector('.view[data-view="home"]');
    if (home?.dataset.active === "true"){
      track("arco_module_open", railLink.dataset.view, "rail");
    }
  }, {capture: true});
})();
