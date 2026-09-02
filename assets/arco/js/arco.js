(() => {
  "use strict";

  /* DATA entra no mesmo contrato estrutural de ECHO e ATRIO antes de o core
     do shell capturar as views e os controles do rail. O bootstrap fica
     separado para preservar o core existente sem duplicar sua lógica. */
  const stage = document.getElementById("stage");
  const currentDataLink = document.querySelector(".rail__link--data");

  if (currentDataLink && currentDataLink.tagName !== "BUTTON") {
    const dataButton = document.createElement("button");
    dataButton.className = currentDataLink.className;
    dataButton.type = "button";
    dataButton.dataset.view = "data";
    dataButton.innerHTML = currentDataLink.innerHTML;
    currentDataLink.replaceWith(dataButton);
  } else if (currentDataLink) {
    currentDataLink.type = "button";
    currentDataLink.dataset.view = "data";
  }

  if (stage && !stage.querySelector('.view[data-view="data"]')) {
    stage.insertAdjacentHTML("beforeend", `
    <!-- ===================== FILHO: DATA ===================== -->
    <section class="view" data-view="data" aria-label="DATA">
      <div class="child child--data">
        <div class="child__bar">
          <a class="child__full" href="data.html" target="_blank" rel="noopener">
            Prefere a página inteira? Por aqui <span class="arrow" aria-hidden="true">→</span>
          </a>
          <span class="child__load" aria-hidden="true"></span>
        </div>
        <iframe class="child__frame" title="DATA — página completa" src="about:blank" data-src="data.html" loading="lazy" referrerpolicy="no-referrer"></iframe>
      </div>
    </section>`);
  }

  const core = document.createElement("script");
  core.src = "assets/arco/js/arco-core.js?v=d39e436e2976f07bbf83f10504ff039ff8a2645e";
  core.async = false;
  document.head.appendChild(core);
})();
