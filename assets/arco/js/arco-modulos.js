/* Módulos do ATRIO: um módulo selecionado por vez; a ficha abre abaixo.
   Sem JS, as cinco fichas ficam visíveis. */
(() => {
  "use strict";
  const root = document.querySelector('.arx-modules');
  if (!root) return;
  const buttons = [...root.querySelectorAll('.arx-mod')];
  function select(key) {
    buttons.forEach(button => {
      const on = button.dataset.arxModule === key;
      button.classList.toggle('is-selected', on);
      button.setAttribute('aria-expanded', String(on));
      document.getElementById(button.getAttribute('aria-controls')).hidden = !on;
    });
  }
  buttons.forEach(button => button.addEventListener('click', () => select(button.dataset.arxModule)));
  select('atrio');
  root.classList.add('is-ready');
})();
