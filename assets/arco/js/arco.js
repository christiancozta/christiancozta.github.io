/* ========================================================================== 
   ARCO — loader final 15.09.2026
   Mantém a base estabilizada intacta e aplica a camada final de fechamento.
   ========================================================================== */
(() => {
  "use strict";

  const current = document.currentScript;
  const src = current?.src || new URL("assets/arco/js/arco.js", document.baseURI).href;

  const base = document.createElement("script");
  base.src = new URL("arco-base-20260915.js?v=20260915-endcap2", src).href;
  base.async = false;
  base.onload = () => {
    const finalLayer = document.createElement("script");
    finalLayer.src = new URL("arco-final-20260915-v2.js?v=20260915-endcap2", src).href;
    finalLayer.async = false;
    finalLayer.onerror = () => console.error("ARCO: falha ao carregar a camada final v2.");
    document.head.appendChild(finalLayer);
  };
  base.onerror = () => console.error("ARCO: falha ao carregar a base estabilizada.");
  document.head.appendChild(base);
})();
