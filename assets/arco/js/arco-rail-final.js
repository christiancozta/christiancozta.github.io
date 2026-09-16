/* ARCO — rail ATRIO sempre retorna à hero do filho. */
(() => {
  "use strict";

  const trigger = document.querySelector('.rail__link[data-view="atrio"]');
  const frame = document.querySelector('.view[data-view="atrio"] iframe.child__frame');
  if (!trigger || !frame) return;

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
})();
