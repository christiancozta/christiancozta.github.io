/* ========================================================================== 
   ARCO — entrada desktop/mobile + proveniência sob demanda
   O runtime estabilizado permanece em arco-runtime.js. Esta camada acrescenta
   apenas a leitura territorial das tags no desktop, sem alterar a geometria.
   ========================================================================== */
(() => {
  "use strict";

  const current = document.currentScript;
  const src = current?.src || new URL("assets/arco/js/arco.js", document.baseURI).href;
  const runtimeUrl = new URL("arco-runtime.js?v=20260912-provenance-v1", src);

  const runtime = document.createElement("script");
  runtime.src = runtimeUrl.href;
  runtime.async = false;
  runtime.onload = installProvenanceHover;
  runtime.onerror = () => console.error("ARCO: falha ao carregar o runtime estabilizado.");
  document.head.appendChild(runtime);

  function installProvenanceHover(){
    const homeView = document.querySelector('.view[data-view="home"]');
    const home = homeView?.querySelector(".home");
    const zone = home?.querySelector(".narr-zone");
    const stats = zone ? [...zone.querySelectorAll(".narr__stat")] : [];
    const mq = matchMedia("(max-width:820px)");
    if (!homeView || !home || !zone || stats.length !== 5) return;

    const projects = {
      "5": {tag:"ARCO", cls:"arco"},
      "4": {tag:"ATRIO", cls:"atrio"},
      "3": {tag:"ECHO", cls:"echo"},
      "2": {tag:"DATA", cls:"data"}
    };

    if (!document.getElementById("arco-provenance-hover-style")){
      const style = document.createElement("style");
      style.id = "arco-provenance-hover-style";
      style.textContent = String.raw`
@media (min-width:821px){
  /* Proveniência sai da composição em repouso. */
  .view[data-view="home"] .home .narr__tag{
    display:none!important;
  }

  /* O final segue sem clique; somente o número responde à faixa explorada. */
  .view[data-view="home"] .home.hero-commit01-final .narr__n{
    transition:background-color 120ms cubic-bezier(.22,.68,0,1), color 120ms cubic-bezier(.22,.68,0,1)!important;
  }
  .view[data-view="home"] .home.hero-commit01-final .narr__stat[data-step="5"].is-provenance-hover .narr__n{
    background:#181818!important;
    color:#FCFCFC!important;
  }
  .view[data-view="home"] .home.hero-commit01-final .narr__stat[data-step="4"].is-provenance-hover .narr__n{
    background:#A63A23!important;
    color:#FCFCFC!important;
  }
  .view[data-view="home"] .home.hero-commit01-final .narr__stat[data-step="3"].is-provenance-hover .narr__n{
    background:#FFB627!important;
    color:#181818!important;
  }
  .view[data-view="home"] .home.hero-commit01-final .narr__stat[data-step="2"].is-provenance-hover .narr__n{
    background:#0057FF!important;
    color:#FCFCFC!important;
  }

  .arco-provenance-tag{
    position:fixed;
    left:0;
    top:0;
    z-index:1000;
    display:inline-flex;
    align-items:center;
    min-height:1.42em;
    padding:.08em .38em .12em;
    border-radius:0;
    font-family:var(--f-micro);
    font-size:.54rem;
    font-weight:700;
    line-height:1.2;
    letter-spacing:.085em;
    text-transform:uppercase;
    white-space:nowrap;
    opacity:0;
    visibility:hidden;
    pointer-events:none;
    transition:opacity 120ms cubic-bezier(.22,.68,0,1), visibility 0s linear 120ms;
  }
  .arco-provenance-tag.is-visible{
    opacity:1;
    visibility:visible;
    transition:opacity 120ms cubic-bezier(.22,.68,0,1);
  }
  .arco-provenance-tag--arco{background:#181818;color:#FCFCFC}
  .arco-provenance-tag--atrio{background:#A63A23;color:#FCFCFC}
  .arco-provenance-tag--echo{background:#FFB627;color:#181818}
  .arco-provenance-tag--data{background:#0057FF;color:#FCFCFC}
}

@media (max-width:820px){
  .arco-provenance-tag{display:none!important}
}

@media (prefers-reduced-motion:reduce){
  .arco-provenance-tag,
  .view[data-view="home"] .home.hero-commit01-final .narr__n{
    transition:none!important;
  }
}
`;
      document.head.appendChild(style);
    }

    const cursorTag = document.createElement("span");
    cursorTag.className = "arco-provenance-tag";
    cursorTag.setAttribute("aria-hidden", "true");
    document.body.appendChild(cursorTag);

    let activeStat = null;

    const clearHover = () => {
      if (activeStat) activeStat.classList.remove("is-provenance-hover");
      activeStat = null;
      cursorTag.className = "arco-provenance-tag";
      cursorTag.textContent = "";
    };

    const bandAt = (clientX, clientY) => {
      const rows = stats
        .map(stat => {
          const number = stat.querySelector(".narr__n");
          if (!number) return null;
          const statRect = stat.getBoundingClientRect();
          const numberRect = number.getBoundingClientRect();
          return {
            stat,
            step:stat.dataset.step,
            center:numberRect.top + numberRect.height / 2,
            left:Math.min(statRect.left, numberRect.left) - 8,
            right:Math.max(statRect.right, numberRect.right) + 8
          };
        })
        .filter(Boolean)
        .sort((a,b) => a.center - b.center);

      for (let i = 0; i < rows.length; i++){
        const row = rows[i];
        const previous = rows[i - 1];
        const next = rows[i + 1];
        const top = previous
          ? (previous.center + row.center) / 2
          : row.center - (next ? (next.center - row.center) / 2 : 24);
        const bottom = next
          ? (row.center + next.center) / 2
          : row.center + (previous ? (row.center - previous.center) / 2 : 24);

        if (
          clientY >= top && clientY < bottom &&
          clientX >= row.left && clientX <= row.right
        ) return row;
      }

      return null;
    };

    const moveTag = event => {
      const gapX = 14;
      const gapY = 12;
      const margin = 8;
      const rect = cursorTag.getBoundingClientRect();

      let x = event.clientX + gapX;
      let y = event.clientY + gapY;

      if (x + rect.width + margin > innerWidth) x = event.clientX - rect.width - gapX;
      if (y + rect.height + margin > innerHeight) y = event.clientY - rect.height - gapY;

      cursorTag.style.left = `${Math.max(margin, x)}px`;
      cursorTag.style.top = `${Math.max(margin, y)}px`;
    };

    const handlePointerMove = event => {
      if (
        mq.matches ||
        (event.pointerType && event.pointerType !== "mouse") ||
        homeView.dataset.active === "false" ||
        !home.classList.contains("hero-commit01-final")
      ){
        clearHover();
        return;
      }

      const row = bandAt(event.clientX, event.clientY);
      const project = row ? projects[row.step] : null;
      if (!row || !project){
        clearHover();
        return;
      }

      if (activeStat !== row.stat){
        if (activeStat) activeStat.classList.remove("is-provenance-hover");
        activeStat = row.stat;
        activeStat.classList.add("is-provenance-hover");
        cursorTag.textContent = project.tag;
        cursorTag.className = `arco-provenance-tag arco-provenance-tag--${project.cls} is-visible`;
      }

      moveTag(event);
    };

    window.addEventListener("pointermove", handlePointerMove, {passive:true});
    window.addEventListener("scroll", clearHover, {passive:true, capture:true});
    window.addEventListener("resize", clearHover, {passive:true});
    window.addEventListener("blur", clearHover);
    document.addEventListener("pointerout", event => {
      if (!event.relatedTarget) clearHover();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) clearHover();
    });
    mq.addEventListener?.("change", clearHover);

    const viewObserver = new MutationObserver(() => {
      if (homeView.dataset.active === "false") clearHover();
    });
    viewObserver.observe(homeView,{attributes:true,attributeFilter:["data-active"]});
  }
})();
