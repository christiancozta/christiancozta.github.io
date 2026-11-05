(() => {
  "use strict";
  const root = document.querySelector('.arx-modules');
  if (!root) return;
  const cards = [...root.querySelectorAll('[data-arx-module]')];
  const buttons = cards.map(card => card.querySelector('.arx-module__select'));
  function select(key) {
    cards.forEach((card, index) => {
      const selected = card.dataset.arxModule === key;
      card.classList.toggle('is-selected', selected);
      buttons[index].setAttribute('aria-expanded', String(selected));
      card.querySelector('.arx-module__content').hidden = !selected;
      card.querySelector('.arx-module__mark').textContent = selected ? '−' : '+';
    });
    root.style.setProperty('--module-columns', cards.map(card => card.dataset.arxModule === key ? '4fr' : '1fr').join(' '));
  }
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => select(cards[index].dataset.arxModule));
    button.addEventListener('keydown', event => {
      const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 :
        (index + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next].focus();
    });
  });
  select('atrio');
  root.classList.add('is-ready');
})();
