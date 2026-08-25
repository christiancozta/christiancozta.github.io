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

  const tipFields = tooltip ? {
    source: tooltip.querySelector('[data-tip-source]'),
    numerator: tooltip.querySelector('[data-tip-numerator]'),
    denominator: tooltip.querySelector('[data-tip-denominator]'),
    period: tooltip.querySelector('[data-tip-period]')
  } : null;

  let activeDatum = null;

  const drawer = document.getElementById('file-drawer');
  const drawerCloseButtons = drawer ? drawer.querySelectorAll('[data-drawer-close]') : [];
  const drawerFields = drawer ? {
    source: drawer.querySelector('[data-drawer-source]'),
    numerator: drawer.querySelector('[data-drawer-numerator]'),
    denominator: drawer.querySelector('[data-drawer-denominator]'),
    period: drawer.querySelector('[data-drawer-period]')
  } : null;
  let drawerReturnFocus = null;

  const openDrawer = (target) => {
    if (!drawer || !drawerFields) return;
    drawerReturnFocus = target;
    drawerFields.source.textContent = target.dataset.source || 'Não informado';
    drawerFields.numerator.textContent = target.dataset.numerator || 'Não se aplica';
    drawerFields.denominator.textContent = target.dataset.denominator || 'Não se aplica';
    drawerFields.period.textContent = target.dataset.period || 'Não informado';
    drawer.hidden = false;
    document.body.classList.add('drawer-is-open');
    drawer.querySelector('.file-drawer__close').focus();
  };

  const closeDrawer = () => {
    if (!drawer || drawer.hidden) return;
    drawer.hidden = true;
    document.body.classList.remove('drawer-is-open');
    if (drawerReturnFocus) drawerReturnFocus.focus();
    drawerReturnFocus = null;
  };

  drawerCloseButtons.forEach((button) => button.addEventListener('click', closeDrawer));

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
    if (!tooltip || !tipFields) return;
    if (activeDatum && activeDatum !== target) activeDatum.removeAttribute('aria-describedby');
    activeDatum = target;
    tipFields.source.textContent = target.dataset.source || 'Não informado';
    tipFields.numerator.textContent = target.dataset.numerator || 'Não se aplica';
    tipFields.denominator.textContent = target.dataset.denominator || 'Não se aplica';
    tipFields.period.textContent = target.dataset.period || 'Não informado';
    target.setAttribute('aria-describedby', tooltip.id);
    tooltip.hidden = false;
    requestAnimationFrame(() => positionTooltip(target));
  };

  const hideTooltip = () => {
    if (activeDatum) activeDatum.removeAttribute('aria-describedby');
    activeDatum = null;
    if (tooltip) tooltip.hidden = true;
  };

  document.querySelectorAll('[data-datum]').forEach((datum) => {
    datum.addEventListener('click', () => openDrawer(datum));
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
    if (drawer && !drawer.hidden) {
      closeDrawer();
      return;
    }
    if (methodToggle && methodPanel && !methodPanel.hidden) {
      methodPanel.hidden = true;
      methodToggle.setAttribute('aria-expanded', 'false');
      methodToggle.focus();
    }
  });
})();
