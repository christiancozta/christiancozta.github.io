(() => {
  const drawer = document.querySelector('[data-drawer]');
  const metrics = document.querySelectorAll('[data-metric]');
  const closeButtons = document.querySelectorAll('[data-close-drawer]');
  const files = document.querySelectorAll('[data-file]');
  const railTrigger = document.querySelector('[data-open-drawer]');
  const sheetEl = document.querySelector('.sheet');
  const sheet = {
    metric: document.querySelector('[data-sheet="metric"]'),
    source: document.querySelector('[data-sheet="source"]'),
    numerator: document.querySelector('[data-sheet="numerator"]'),
    denominator: document.querySelector('[data-sheet="denominator"]'),
    period: document.querySelector('[data-sheet="period"]'),
    calculation: document.querySelector('[data-sheet="calculation"]')
  };
  const data = {
    taxa: {value:'72,4%', metric:'Taxa de confirmação', source:'Corpus público — placeholder', numerator:'904 ocorrências', denominator:'1.248 observações', period:'jan — dez / 2025', calculation:'904 ÷ 1.248 × 100'},
    volume: {value:'1.248', metric:'Processos observados', source:'Base jurisdicional — placeholder', numerator:'1.248 processos', denominator:'universo observado', period:'jan — dez / 2025', calculation:'contagem absoluta'},
    tempo: {value:'18,6 d', metric:'Tempo mediano', source:'Série temporal — placeholder', numerator:'18,6 dias', denominator:'processos válidos', period:'jan — dez / 2025', calculation:'mediana dos intervalos'}
  };
  let lastFocus;

  function pullSheet() {
    if (!sheetEl) return;
    sheetEl.classList.remove('is-pulling');
    void sheetEl.offsetWidth;
    sheetEl.classList.add('is-pulling');
  }

  function open(key) {
    const item = data[key] || data.taxa;
    document.querySelector('#sheet-metric').textContent = item.value;
    Object.entries(sheet).forEach(([field, element]) => { element.textContent = item[field]; });
    lastFocus = document.activeElement;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden','false');
    document.body.classList.add('is-locked');
    drawer.querySelector('.close').focus();
  }

  function close() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden','true');
    document.body.classList.remove('is-locked');
    if (lastFocus) lastFocus.focus();
  }

  metrics.forEach(metric => metric.addEventListener('click', () => open(metric.dataset.metric)));
  railTrigger.addEventListener('click', () => open('taxa'));
  closeButtons.forEach(button => button.addEventListener('click', close));
  files.forEach(file => file.addEventListener('click', () => {
    files.forEach(item => item.classList.remove('is-active'));
    file.classList.add('is-active');
    pullSheet();
  }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && drawer.classList.contains('is-open')) close();
  });
})();
