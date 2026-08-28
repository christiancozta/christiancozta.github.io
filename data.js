(() => {
  'use strict';

  const root = document.documentElement;
  const tooltip = document.getElementById('data-tooltip');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  requestAnimationFrame(() => root.classList.add('is-ready'));

  const revealItems = [...document.querySelectorAll('[data-reveal]')];
  if (!('IntersectionObserver' in window) || reduceMotion.matches) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const REGIMES = {
    lastro: { nome: 'Rastro documental', campos: ['FONTE', 'CONTAGEM', 'UNIVERSO', 'RECORTE', 'VER EM'] },
    derivacao: { nome: 'Rastro derivado', campos: ['DERIVA DE', 'CONTAGEM', 'UNIVERSO', 'RECORTE', 'VER EM'] }
  };
  const TIP_KEYS = ['source', 'numerator', 'denominator', 'period', 'detail'];
  const LASTRO_KEYS = ['numerator', 'denominator', 'period'];
  const SLOT_ORDER = ['source', 'detail', 'numerator', 'denominator', 'period'];
  const DATUM_SELECTOR = '[data-datum][data-regime]';
  const tipFields = {};
  const tipLabels = {};
  const tipSlots = {};
  if (tooltip) TIP_KEYS.forEach((key) => {
    tipFields[key] = tooltip.querySelector(`[data-tip-${key}]`);
    tipLabels[key] = tooltip.querySelector(`[data-tip-label="${key}"]`);
    tipSlots[key] = tooltip.querySelector(`[data-tip-slot="${key}"]`);
  });
  const lastroHead = tooltip && tooltip.querySelector('[data-tip-lastro]');

  let activeDatum = null;

  const positionTooltip = (target) => {
    if (!tooltip || tooltip.hidden) return;
    const rect = target.getBoundingClientRect();
    const gap = 12;
    const tipRect = tooltip.getBoundingClientRect();
    let left = rect.left + (rect.width - tipRect.width) / 2;
    let top = rect.top - tipRect.height - gap;

    left = Math.max(gap, Math.min(left, window.innerWidth - tipRect.width - gap));
    if (top < gap) top = Math.min(window.innerHeight - tipRect.height - gap, rect.bottom + gap);

    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
  };

  const showTooltip = (target) => {
    if (!tooltip) return;
    if (activeDatum && activeDatum !== target) activeDatum.removeAttribute('aria-describedby');
    activeDatum = target;
    const regimeKey = REGIMES[target.dataset.regime] ? target.dataset.regime : 'lastro';
    const regime = REGIMES[regimeKey];
    tooltip.className = 'data-tooltip is-' + regimeKey;
    tooltip.querySelector('[data-tip-regime]').textContent = regime.nome;
    TIP_KEYS.forEach((key, index) => {
      const value = target.dataset[key] || '';
      if (tipLabels[key]) tipLabels[key].textContent = regime.campos[index];
      if (tipFields[key]) tipFields[key].textContent = value;
      if (tipSlots[key]) tipSlots[key].hidden = !value;
    });
    lastroHead.hidden = !LASTRO_KEYS.some((key) => target.dataset[key]);
    let lastVisible = null;
    SLOT_ORDER.forEach((key) => {
      const slot = tipSlots[key];
      if (!slot) return;
      slot.classList.remove('is-last');
      if (!slot.hidden) lastVisible = slot;
    });
    if (lastVisible) lastVisible.classList.add('is-last');
    target.setAttribute('aria-describedby', tooltip.id);
    tooltip.hidden = false;
    requestAnimationFrame(() => positionTooltip(target));
  };

  const hideTooltip = () => {
    if (activeDatum) activeDatum.removeAttribute('aria-describedby');
    activeDatum = null;
    if (tooltip) tooltip.hidden = true;
  };

  const datumFrom = (node) => node instanceof Element ? node.closest(DATUM_SELECTOR) : null;

  // M3: no toque nao ha hover. O ponteiro abre sobre o dado e fecha fora dele.
  document.addEventListener('pointerdown', (event) => {
    const target = datumFrom(event.target);
    if (target) showTooltip(target);
    else if (activeDatum) hideTooltip();
  });

  document.querySelectorAll(DATUM_SELECTOR).forEach((datum) => {
    datum.addEventListener('mouseenter', () => showTooltip(datum));
    datum.addEventListener('mouseleave', hideTooltip);
    datum.addEventListener('focus', () => showTooltip(datum));
    datum.addEventListener('blur', hideTooltip);
  });

  window.addEventListener('scroll', hideTooltip, { passive: true });
  window.addEventListener('resize', hideTooltip, { passive: true });

  const methodToggle = document.getElementById('method-toggle');
  const methodPanel = document.getElementById('method-panel');
  if (methodToggle && methodPanel) {
    methodToggle.addEventListener('click', () => {
      const isOpen = methodToggle.getAttribute('aria-expanded') === 'true';
      methodToggle.setAttribute('aria-expanded', String(!isOpen));
      methodPanel.hidden = isOpen;
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    hideTooltip();
    if (methodToggle && methodPanel && !methodPanel.hidden) {
      methodPanel.hidden = true;
      methodToggle.setAttribute('aria-expanded', 'false');
      methodToggle.focus();
    }
  });
})();
