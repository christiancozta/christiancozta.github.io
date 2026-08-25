(() => {
  const scene = document.querySelector('[data-scene]');
  const panel = document.querySelector('[data-panel]');
  const closeButton = document.querySelector('[data-close-panel]');
  const files = Array.from(document.querySelectorAll('.metric-file'));
  const activeTab = document.querySelector('[data-active-tab]');

  const fields = {
    fileId: document.querySelector('[data-sheet="fileId"]'),
    value: document.querySelector('[data-sheet="value"]'),
    metric: document.querySelector('[data-sheet="metric"]'),
    source: document.querySelector('[data-sheet="source"]'),
    numerator: document.querySelector('[data-sheet="numerator"]'),
    denominator: document.querySelector('[data-sheet="denominator"]'),
    period: document.querySelector('[data-sheet="period"]'),
    calculation: document.querySelector('[data-sheet="calculation"]'),
    document: document.querySelector('[data-sheet="document"]')
  };

  const data = {
    corpus: {
      tab:'115.114', fileId:'FILE 01', value:'115.114', metric:'Julgados de base',
      source:'Corpus CODA', numerator:'115.114 julgados', denominator:'n/a — contagem absoluta',
      period:'base consolidada', calculation:'contagem absoluta', document:'corpus_coda.jsonl'
    },
    modelos: {
      tab:'2.758', fileId:'FILE 02', value:'2.758', metric:'Modelos estruturados',
      source:'Banco de modelos', numerator:'2.758 modelos', denominator:'n/a — contagem absoluta',
      period:'operação documentada', calculation:'contagem absoluta', document:'banco_modelos.pdf'
    },
    mapeados: {
      tab:'1.192', fileId:'FILE 03', value:'1.192', metric:'Processos mapeados',
      source:'Mapeamento operacional', numerator:'1.192 processos', denominator:'recorte de 30 dias',
      period:'30 dias', calculation:'contagem absoluta', document:'documento a vincular'
    },
    votos: {
      tab:'899', fileId:'FILE 04', value:'899', metric:'Votos observados',
      source:'Base jurimétrica', numerator:'899 votos', denominator:'amostra analisada',
      period:'recorte documentado', calculation:'contagem absoluta', document:'documento a vincular'
    },
    produtividade: {
      tab:'60,4%', fileId:'FILE 05', value:'60,4%', metric:'Produtividade',
      source:'Série operacional', numerator:'60,4%', denominator:'baseline operacional',
      period:'recorte documentado', calculation:'+16,2 p.p. sobre baseline', document:'documento a vincular'
    },
    diretrizes: {
      tab:'56%', fileId:'FILE 06', value:'56%', metric:'Diretrizes antecipadas',
      source:'Triagem / diretrizes', numerator:'56%', denominator:'universo analisado',
      period:'30 dias', calculation:'proporção de diretrizes antecipadas', document:'documento a vincular'
    }
  };

  let lastFocus = null;

  function fillSheet(key) {
    const item = data[key];
    if (!item) return;
    activeTab.textContent = item.tab;
    Object.entries(fields).forEach(([field, element]) => {
      element.textContent = item[field];
    });
  }

  function openEvidence(file) {
    fillSheet(file.dataset.key);
    lastFocus = file;
    files.forEach(item => item.classList.toggle('is-selected', item === file));

    panel.hidden = false;
    panel.setAttribute('aria-hidden','false');

    requestAnimationFrame(() => {
      scene.classList.add('is-open');
      closeButton.focus({preventScroll:true});
    });
  }

  function closeEvidence() {
    scene.classList.remove('is-open');
    panel.setAttribute('aria-hidden','true');
    files.forEach(item => item.classList.remove('is-selected'));

    window.setTimeout(() => {
      panel.hidden = true;
      if (lastFocus) lastFocus.focus({preventScroll:true});
    }, 260);
  }

  files.forEach(file => file.addEventListener('click', () => openEvidence(file)));
  closeButton.addEventListener('click', closeEvidence);

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && scene.classList.contains('is-open')) closeEvidence();
  });
})();
