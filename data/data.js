(() => {
  'use strict';

  const DATUM_SELECTOR = '[data-datum]';
  const FIELD_KEYS = ['source', 'calc', 'period', 'foundation', 'limit'];
  const ROW_IDS = {
    source: ['dt-s', 'dt-s-v'],
    calc: ['dt-c', 'dt-c-v'],
    period: ['dt-p', 'dt-p-v'],
    foundation: ['dt-f', 'dt-f-v'],
    limit: ['dt-l', 'dt-l-v']
  };

  let activeDatum = null;
  let majorityLines = null;

  const datumFrom = (node) => node instanceof Element ? node.closest(DATUM_SELECTOR) : null;

  const fieldCount = (dataset) => FIELD_KEYS.reduce((count, key) => {
    return count + (String(dataset[key] || '').trim() ? 1 : 0);
  }, 0);

  const determineMajority = () => {
    const occurrence = { 3: 0, 4: 0 };
    document.querySelectorAll(DATUM_SELECTOR).forEach((node) => {
      const n = fieldCount(node.dataset);
      if (n === 3 || n === 4) occurrence[n] += 1;
    });
    majorityLines = occurrence[4] > occurrence[3] ? 4 : 3;
    return occurrence;
  };

  const getTooltip = () => document.getElementById('dt');

  const positionTooltip = (target, tooltip) => {
    const rect = target.getBoundingClientRect();
    const box = tooltip.getBoundingClientRect();
    const gap = 12;
    let left = rect.left + (rect.width - box.width) / 2;
    let top = rect.top - box.height - gap;

    left = Math.max(gap, Math.min(left, window.innerWidth - box.width - gap));
    if (top < gap) top = Math.min(window.innerHeight - box.height - gap, rect.bottom + gap);

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  };

  const applyPalette = (tooltip, lineCount) => {
    if (majorityLines === null) determineMajority();

    const isMajority = lineCount === majorityLines;
    const background = isMajority ? '#181818' : '#2E71FF';
    const accent = isMajority ? '#2E71FF' : '#181818';

    tooltip.style.background = background;
    tooltip.style.color = '#FCFCFC';

    const stripe = tooltip.querySelector('#dt-stripe');
    if (stripe) stripe.style.background = accent;

    tooltip.querySelectorAll('[data-tip-accent]').forEach((node) => {
      node.style.color = accent;
    });
  };

  const showTooltip = (target) => {
    const tooltip = getTooltip();
    if (!tooltip) return;

    if (activeDatum && activeDatum !== target) activeDatum.removeAttribute('aria-describedby');

    FIELD_KEYS.forEach((key) => {
      const [rowId, valueId] = ROW_IDS[key];
      const row = document.getElementById(rowId);
      const valueNode = document.getElementById(valueId);
      const value = String(target.dataset[key] || '').trim();
      if (!row || !valueNode) return;
      valueNode.textContent = value;
      row.style.display = value ? 'grid' : 'none';
    });

    applyPalette(tooltip, fieldCount(target.dataset));

    activeDatum = target;
    target.setAttribute('aria-describedby', tooltip.id);
    tooltip.style.display = 'block';
    requestAnimationFrame(() => positionTooltip(target, tooltip));
  };

  const hideTooltip = () => {
    const tooltip = getTooltip();
    if (activeDatum) activeDatum.removeAttribute('aria-describedby');
    activeDatum = null;
    if (tooltip) tooltip.style.display = 'none';
  };

  document.addEventListener('mouseover', (event) => {
    const target = datumFrom(event.target);
    if (target && target !== activeDatum) showTooltip(target);
  });

  document.addEventListener('mouseout', (event) => {
    const target = datumFrom(event.target);
    if (!target || target !== activeDatum) return;
    const related = datumFrom(event.relatedTarget);
    if (related !== target) hideTooltip();
  });

  document.addEventListener('focusin', (event) => {
    const target = datumFrom(event.target);
    if (target) showTooltip(target);
  });

  document.addEventListener('focusout', (event) => {
    const target = datumFrom(event.target);
    if (target && target === activeDatum) hideTooltip();
  });

  // Touch/pointer fallback: tocar no dado abre; tocar fora fecha.
  document.addEventListener('pointerdown', (event) => {
    const target = datumFrom(event.target);
    if (target) showTooltip(target);
    else if (activeDatum) hideTooltip();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hideTooltip();
  });

  window.addEventListener('scroll', hideTooltip, { passive: true });
  window.addEventListener('resize', hideTooltip, { passive: true });
})();
