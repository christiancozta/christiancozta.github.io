(() => {
  'use strict';

  const shell = document.querySelector('[data-prototype]');
  const scene = document.querySelector('[data-scene]');
  const archive = document.getElementById('metric-archive');
  const archiveToggle = document.querySelector('[data-archive-toggle]');
  const panel = document.querySelector('[data-panel]');
  const closeButton = document.querySelector('[data-close-panel]');
  const activeTab = document.querySelector('[data-active-tab]');
  const metricsRoot = document.querySelector('[data-sheet-metrics]');
  const sheet = document.querySelector('.sheet');
  const files = Array.from(document.querySelectorAll('.metric-file'));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const fields = {
    fileId: document.querySelector('[data-sheet="fileId"]'),
    source: document.querySelector('[data-sheet="source"]'),
    period: document.querySelector('[data-sheet="period"]'),
    document: document.querySelector('[data-sheet="document"]'),
    method: document.querySelector('[data-sheet="method"]'),
    pageLabel: document.querySelector('[data-sheet="pageLabel"]')
  };

  const documents = {
    corpus: {
      keys: ['corpus'],
      fileId: 'PAGE / 01',
      pageLabel: 'LASTRO / 01',
      source: 'CORPUS / inventário consolidado',
      period: '2018—2026',
      document: 'diagnostico_corpus_publico.md',
      method: 'Contagem de registros processuais únicos após normalização e deduplicação.',
      metrics: [
        {
          key: 'corpus', value: '115.114', title: 'Julgados na base governada',
          numerator: '115.114 registros', denominator: 'não se aplica', calculation: 'contagem absoluta'
        }
      ]
    },
    modelos: {
      keys: ['modelos'],
      fileId: 'PAGE / 02',
      pageLabel: 'LASTRO / 02',
      source: 'Banco de modelos',
      period: 'operação documentada',
      document: 'banco_modelos.pdf',
      method: 'Contagem das unidades estruturadas no acervo institucional de referência.',
      metrics: [
        {
          key: 'modelos', value: '2.758', title: 'Modelos de ementa estruturados',
          numerator: '2.758 modelos', denominator: 'não se aplica', calculation: 'contagem absoluta'
        }
      ]
    },
    triagem: {
      keys: ['mapeados', 'diretrizes'],
      fileId: 'PAGE / 03',
      pageLabel: 'LASTRO / 03',
      source: 'Mapeamento operacional / triagem',
      period: '30 dias',
      document: 'acervo_publico.xlsx',
      method: 'As duas métricas usam o mesmo universo documental; o percentual deriva do conjunto triado.',
      metrics: [
        {
          key: 'mapeados', value: '1.192', title: 'Processos mapeados',
          numerator: '1.192 processos', denominator: 'universo triado', calculation: 'contagem do conjunto'
        },
        {
          key: 'diretrizes', value: '56%', title: 'Diretrizes antecipadas',
          numerator: 'processos com diretriz', denominator: '1.192 processos', calculation: 'diretrizes ÷ universo'
        }
      ]
    },
    jurimetria: {
      keys: ['votos', 'produtividade'],
      fileId: 'PAGE / 04',
      pageLabel: 'LASTRO / 04',
      source: 'Série operacional / jurimetria',
      period: 'recorte documentado',
      document: 'jurimetria_prod.csv',
      method: 'Volume e taxa permanecem ligados à mesma série, com campos de cálculo próprios por métrica.',
      metrics: [
        {
          key: 'votos', value: '899', title: 'Votos observados',
          numerator: '899 votos', denominator: 'amostra operacional', calculation: 'contagem do resultado'
        },
        {
          key: 'produtividade', value: '60,4%', title: 'Produtividade no recorte',
          numerator: 'votos classificados', denominator: 'despachos elegíveis', calculation: 'votos ÷ despachos'
        }
      ]
    }
  };

  const documentByMetric = Object.values(documents).reduce((index, page) => {
    page.keys.forEach((key) => { index[key] = page; });
    return index;
  }, {});

  let activeKey = null;
  let lastFocus = null;
  let closePromise = null;
  let switchTimer = 0;

  const motionTime = (duration) => reduceMotion.matches ? 0 : duration;

  function makeField(label, value) {
    const wrapper = document.createElement('div');
    const term = document.createElement('dt');
    const definition = document.createElement('dd');
    term.textContent = label;
    definition.textContent = value;
    wrapper.append(term, definition);
    return wrapper;
  }

  function makeMetricBlock(metric, index) {
    const block = document.createElement('section');
    block.className = 'sheet-metric';
    block.classList.toggle('is-active', metric.key === activeKey);
    block.setAttribute('aria-label', `Métrica ${index + 1}: ${metric.value} — ${metric.title}`);

    const head = document.createElement('div');
    head.className = 'sheet-metric__head';

    const valueGroup = document.createElement('div');
    const metricIndex = document.createElement('p');
    const value = document.createElement('p');
    metricIndex.className = 'sheet-metric__index';
    metricIndex.textContent = `MÉTRICA ${String.fromCharCode(65 + index)}`;
    value.className = 'sheet-metric__value';
    value.textContent = metric.value;
    valueGroup.append(metricIndex, value);

    const title = document.createElement('h2');
    title.className = 'sheet-metric__title';
    title.textContent = metric.title;
    head.append(valueGroup, title);

    const metricFields = document.createElement('dl');
    metricFields.className = 'sheet-metric__fields';
    metricFields.append(
      makeField('NUMERADOR', metric.numerator),
      makeField('DENOMINADOR', metric.denominator),
      makeField('CÁLCULO', metric.calculation)
    );

    block.append(head, metricFields);
    return block;
  }

  function fillSheet(key) {
    const page = documentByMetric[key];
    const file = files.find((item) => item.dataset.key === key);
    if (!page || !file) return;

    activeTab.textContent = file.querySelector('.metric-file__tab').textContent;
    activeTab.setAttribute('aria-label', `Fechar evidência da métrica ${activeTab.textContent} e devolver a pasta`);
    fields.fileId.textContent = page.fileId;
    fields.source.textContent = page.source;
    fields.period.textContent = page.period;
    fields.document.textContent = page.document;
    fields.method.textContent = page.method;
    fields.pageLabel.textContent = page.pageLabel;

    sheet.classList.toggle('is-single', page.metrics.length === 1);
    metricsRoot.replaceChildren(...page.metrics.map(makeMetricBlock));
  }

  function selectFile(file) {
    files.forEach((item) => {
      const selected = item === file;
      item.classList.toggle('is-selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
  }

  function animateMetricSwitch() {
    window.clearTimeout(switchTimer);
    scene.classList.remove('is-switching');
    requestAnimationFrame(() => {
      scene.classList.add('is-switching');
      switchTimer = window.setTimeout(() => scene.classList.remove('is-switching'), motionTime(260));
    });
  }

  async function openEvidence(file) {
    if (closePromise) await closePromise;

    const key = file.dataset.key;
    if (scene.classList.contains('is-evidence-open') && activeKey === key) {
      await closeEvidence();
      return;
    }

    lastFocus = file;
    activeKey = key;
    selectFile(file);
    fillSheet(key);

    if (scene.classList.contains('is-evidence-open')) {
      animateMetricSwitch();
      return;
    }

    panel.hidden = false;
    panel.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
      scene.classList.add('is-evidence-open');
      activeTab.focus({ preventScroll: true });
    });
  }

  function closeEvidence({ restoreFocus = true } = {}) {
    if (closePromise) return closePromise;
    if (!scene.classList.contains('is-evidence-open')) return Promise.resolve();

    const focusTarget = lastFocus;
    scene.classList.remove('is-evidence-open', 'is-switching');
    scene.classList.add('is-returning');
    panel.setAttribute('aria-hidden', 'true');

    closePromise = new Promise((resolve) => {
      window.setTimeout(() => {
        panel.hidden = true;
        scene.classList.remove('is-returning');
        files.forEach((item) => {
          item.classList.remove('is-selected');
          item.setAttribute('aria-pressed', 'false');
        });
        activeKey = null;
        lastFocus = null;
        closePromise = null;
        if (restoreFocus && focusTarget) focusTarget.focus({ preventScroll: true });
        resolve();
      }, motionTime(580));
    });

    return closePromise;
  }

  function openArchive() {
    shell.classList.add('is-archive-open');
    archive.setAttribute('aria-hidden', 'false');
    archiveToggle.setAttribute('aria-expanded', 'true');
    archiveToggle.setAttribute('aria-label', 'Recolher caixa de métricas no rail ARCO');
  }

  async function closeArchive() {
    if (scene.classList.contains('is-evidence-open') || closePromise) {
      await closeEvidence({ restoreFocus: false });
    }
    shell.classList.remove('is-archive-open');
    archive.setAttribute('aria-hidden', 'true');
    archiveToggle.setAttribute('aria-expanded', 'false');
    archiveToggle.setAttribute('aria-label', 'Extrair caixa de métricas do rail ARCO');
    archiveToggle.focus({ preventScroll: true });
  }

  files.forEach((file) => file.addEventListener('click', () => openEvidence(file)));
  closeButton.addEventListener('click', () => closeEvidence());
  activeTab.addEventListener('click', () => closeEvidence());
  archiveToggle.addEventListener('click', () => {
    if (shell.classList.contains('is-archive-open')) closeArchive();
    else openArchive();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (scene.classList.contains('is-evidence-open') || closePromise) {
      closeEvidence();
      return;
    }
    if (shell.classList.contains('is-archive-open')) closeArchive();
  });

  files.forEach((item) => item.setAttribute('aria-pressed', 'false'));
  archiveToggle.setAttribute('aria-label', 'Recolher caixa de métricas no rail ARCO');
})();
