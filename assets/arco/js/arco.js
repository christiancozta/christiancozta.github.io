/* ========================================================================== 
   ARCO — loader final 16.09.2026
   Mantém a base estabilizada intacta e aplica a camada final consolidada.
   ========================================================================== */
(() => {
  "use strict";

  const current = document.currentScript;
  const src = current?.src || new URL("assets/arco/js/arco.js", document.baseURI).href;

  const base = document.createElement("script");
  base.src = new URL("arco-base-20260915.js?v=20260916-rail-contacts", src).href;
  base.async = false;
  base.onload = () => {
    const finalLayer = document.createElement("script");
    finalLayer.src = new URL("arco-final-20260915-v2.js?v=20260916-rail-contacts", src).href;
    finalLayer.async = false;
    finalLayer.onload = () => {
      const railLayer = document.createElement("script");
      railLayer.src = new URL("arco-rail-final.js?v=20260916-atrio-hero", src).href;
      railLayer.async = false;
      railLayer.onerror = () => console.error("ARCO: falha ao carregar o ajuste final do rail.");
      document.head.appendChild(railLayer);
    };
    finalLayer.onerror = () => console.error("ARCO: falha ao carregar a camada final consolidada.");
    document.head.appendChild(finalLayer);
  };
  base.onerror = () => console.error("ARCO: falha ao carregar a base estabilizada.");
  document.head.appendChild(base);
})();
