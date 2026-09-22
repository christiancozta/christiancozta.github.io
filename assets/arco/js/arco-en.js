/* ========================================================================== 
   ARCO — English loader | 22.09.2026
   Mantém a base estabilizada intacta e aplica a camada final consolidada.
   ========================================================================== */
(() => {
  "use strict";

  const current = document.currentScript;
  const src = current?.src || new URL("../assets/arco/js/arco-en.js", document.baseURI).href;

  const base = document.createElement("script");
  base.src = new URL("arco-base-en-20260915.js?v=20260922-en-v2", src).href;
  base.async = false;
  base.onload = () => {
    const finalLayer = document.createElement("script");
    finalLayer.src = new URL("arco-final-en-20260915-v2.js?v=20260922-en-v1", src).href;
    finalLayer.async = false;
    finalLayer.onload = () => {
      const railLayer = document.createElement("script");
      railLayer.src = new URL("arco-rail-final.js?v=20260916-atrio-hero", src).href;
      railLayer.async = false;
      railLayer.onerror = () => console.error("ARCO: failed to load the final rail adjustment.");
      document.head.appendChild(railLayer);
    };
    finalLayer.onerror = () => console.error("ARCO: failed to load the consolidated final layer.");
    document.head.appendChild(finalLayer);
  };
  base.onerror = () => console.error("ARCO: failed to load the stabilized base.");
  document.head.appendChild(base);
})();
