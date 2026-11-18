/* ARCO — eventos GA4 para entradas, seleções e aberturas dos sistemas.
   Contrato: não altera navegação, estado, animações ou histórico. */
(() => {
  "use strict";

  /* Não registrar eventos autorais nos ambientes locais/de pré-visualização. */
  if (location.hostname !== "christiancozta.github.io") return;

  const MODULES = new Set(["data", "echo", "atrio"]);

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

  /* A home não tem mais o arco: o painel de cada obra abre o sistema pela
     assinatura (data-hm-view), e o cordão continua sendo a outra porta. */
  /* CTA e navegação lateral são portas diferentes para o mesmo sistema.
     O clique sintético no cordão, feito pelo CTA, não é contabilizado de novo. */
  document.addEventListener("click", event => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const openLink = target.closest("[data-hm-view]");
    if (openLink){
      track("arco_module_open", openLink.dataset.hmView, "panel");
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
