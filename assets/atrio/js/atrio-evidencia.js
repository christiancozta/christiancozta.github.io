/* Evidência: abre a captura de execução correspondente ao campo da matriz. */
(() => {
  const note = document.getElementById("evidence-note");
  if (!note) return;
  const closeBtn = document.getElementById("evidence-note-close");
  const items = [...note.querySelectorAll("[data-evidence-id]")];
  let trigger = null;

  const focusables = () => [...note.querySelectorAll("button, [href], [tabindex]:not([tabindex='-1'])")]
    .filter(el => !el.hidden && el.offsetParent !== null);

  function open(id, button) {
    const item = items.find(el => el.dataset.evidenceId === id);
    if (!item) return;
    items.forEach(el => { el.hidden = el !== item; });
    trigger = button;
    button.setAttribute("aria-expanded", "true");
    note.hidden = false;
    document.body.classList.add("sample-dialog-open");
    requestAnimationFrame(() => note.focus({ preventScroll: true }));
  }

  function close() {
    if (note.hidden) return;
    note.hidden = true;
    document.body.classList.remove("sample-dialog-open");
    if (trigger) {
      trigger.setAttribute("aria-expanded", "false");
      trigger.focus({ preventScroll: true });
    }
    trigger = null;
  }

  document.querySelectorAll("[data-evidence]").forEach(button => {
    button.addEventListener("click", () => open(button.dataset.evidence, button));
  });
  closeBtn?.addEventListener("click", close);
  note.addEventListener("click", event => { if (event.target === note) close(); });
  document.addEventListener("keydown", event => {
    if (note.hidden) return;
    if (event.key === "Escape") { event.preventDefault(); close(); return; }
    if (event.key !== "Tab") return;
    const list = focusables();
    if (!list.length) { event.preventDefault(); note.focus(); return; }
    const first = list[0], last = list[list.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === note)) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
})();
