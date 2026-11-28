/* ARCO — resultado e origem (27/11/2026)
   "Conheça a origem" abre a origem de cada caso num <dialog> modal: Esc,
   o botão Fechar e o clique fora fecham; o foco volta ao botão que abriu.
   No CERNE, arma a frase "Errar não é só humano." para que o "não" e o "só"
   entrem quando o bloco chega à tela (sem JS ou com movimento reduzido, a
   frase aparece inteira). */
(() => {
  "use strict";

  /* ---------- modal ---------- */
  document.querySelectorAll("[data-hm-origem]").forEach(botao => {
    const dlg = document.getElementById(botao.dataset.hmOrigem);
    if (!dlg || typeof dlg.showModal !== "function") return;
    botao.setAttribute("aria-controls", dlg.id);
    botao.addEventListener("click", () => {
      dlg.showModal();
      dlg.scrollTop = 0;
      dlg.querySelector("[data-hm-fecha]")?.focus();
    });
    dlg.addEventListener("close", () => botao.focus());
  });
  document.querySelectorAll(".hm-mod").forEach(dlg => {
    dlg.querySelectorAll("[data-hm-fecha]").forEach(b => b.addEventListener("click", () => dlg.close()));
    /* clique no fundo (fora da caixa) fecha */
    dlg.addEventListener("click", e => {
      if (e.target !== dlg) return;
      const r = dlg.getBoundingClientRect();
      const dentro = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!dentro) dlg.close();
    });
  });

  /* ---------- CERNE: a frase que se corrige ---------- */
  const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cerne = document.querySelector(".hm-res--cerne");
  if (!cerne || reduz || !("IntersectionObserver" in window)) return;
  const frase = cerne.querySelector(".hm-res__q");
  cerne.classList.add("is-armada");
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    cerne.classList.add("is-vista");
    io.disconnect();
  }, {threshold:.9});
  io.observe(frase || cerne);
})();
