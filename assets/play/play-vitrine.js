/* ==========================================================================
   ECHO: vitrine do playbook (play.html?vitrine)
   --------------------------------------------------------------------------
   No ARCO, o painel Legal Operations mostra esta página num quadro: primeiro
   a folha de rosto (título, subtítulo e os números do ECHO), com um único
   botão, Explorar, que só existe com JS e só depois da partitura montada
   (este arquivo roda depois de play.js). Explorar leva à partitura na
   própria página, em desenho empilhado (so-partitura + empilha, play.css);
   Folha de rosto, ou Esc com nada aberto sobre a partitura, volta. Quando o
   ARCO pede página inteira (no celular, data-explorar="pagina" no quadro),
   Explorar abre o playbook completo na janela de cima.
   O ARCO mede o quadro por window.vitrine: folha() é a altura da folha de
   rosto; conteudo(), a da partitura aberta (o ARCO a reduz em escala até
   caber na tela) ou 0, com a folha.
   Ampliada (aviso ARCO_AMPLIA do ARCO, tela cheia), a página ganha
   vit-amplo; Esc na folha de rosto pede ao ARCO que reduza.
   A visita só é contada ao explorar: a folha à vista na home não é leitura.
   Montador: o segundo botão do pé, o carimbo no alto da folha e a pílula ao
   lado de Folha de rosto, na partitura, abrem a camada de Templates (#templates)
   já em tela cheia: a página pede ao ARCO que amplie (pedido "ampliar") e, ao
   fechar a camada, que reduza, se foi ela quem ampliou. No celular, abre a
   vista PLAY do ARCO já em #templates.
   Partitura aberta no quadro: o ARCO informa a altura útil (vitrine.ajusta) e
   os nomes das pautas crescem (--vz) até o limite em que a partitura ainda
   cabe sem rolagem nem redução; em tela cheia, a medida é a própria janela.
   ========================================================================== */
(() => {
  'use strict';
  const H = document.documentElement;
  if (!H.classList.contains('vitrine')) return;
  const pe = document.getElementById('vit-pe');
  const sis = document.getElementById('sistema');
  if (!pe || !sis || !document.querySelector('#naipes .voz')) return;

  const EN = (H.lang || '').toLowerCase().startsWith('en');
  const T = EN
    ? { ex: 'Score', exA: 'Open the ECHO score', mo: 'Builder', moA: 'Open the draft builder, full screen', ca: 'BUILDER', cv: 'Back to the title page', vo: 'Title page', voA: 'Back to the title page' }
    : { ex: 'Partitura', exA: 'Abrir a partitura do ECHO', mo: 'Montador', moA: 'Abrir o montador de minutas, em tela cheia', ca: 'MONTADOR', cv: 'Voltar à folha de rosto', vo: 'Folha de rosto', voA: 'Voltar à folha de rosto' };
  const ic = (d) => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`;

  const explorar = document.createElement('button');
  explorar.type = 'button';
  explorar.className = 'pil vit-explorar';
  explorar.setAttribute('aria-label', T.exA);
  explorar.innerHTML = `<span class="t">${T.ex}</span><span class="b">${ic('M5 12h13M12.5 6.5 18 12l-5.5 5.5')}</span>`;
  pe.appendChild(explorar);

  /* Montador: segundo botão do pé, carimbo da folha e pílula da partitura */
  const icMont = ic('M4 5h16M4 10h10M4 15h16M4 20h7');
  const montar = document.createElement('button');
  montar.type = 'button';
  montar.className = 'pil vit-explorar vit-montador';
  montar.setAttribute('aria-label', T.moA);
  montar.innerHTML = `<span class="t">${T.mo}</span><span class="b">${icMont}</span>`;
  pe.appendChild(montar);

  const carimbo = document.createElement('button');
  carimbo.type = 'button';
  carimbo.className = 'carimbo vit-carimbo';
  carimbo.setAttribute('aria-label', T.moA);
  carimbo.title = T.mo;
  carimbo.innerHTML = `<svg viewBox="0 0 160 160" aria-hidden="true" focusable="false"><g filter="url(#tinta)">`
    + '<circle class="c-anel" cx="80" cy="80" r="74"/><circle class="c-anel2" cx="80" cy="80" r="67.5"/>'
    + '<path class="c-faixa" d="M16 64.5H144M16 95.5H144"/>'
    + `<text class="c-palavra" x="80" y="88.5" text-anchor="middle" textLength="${T.ca.length > 7 ? 118 : 104}" lengthAdjust="spacingAndGlyphs">${T.ca}</text>`
    + '</g></svg>';
  const a4 = document.querySelector('.a4');
  (a4 || document.body).appendChild(carimbo);
  /* o carimbo cresce no vão entre o título e a borda, sem tocar o título */
  const tituloEl = document.querySelector('.rosto h1');
  function medeCarimbo() {
    if (!a4 || !tituloEl || H.classList.contains('so-partitura')) return;
    const r = document.createRange();
    r.selectNodeContents(tituloEl);
    const t = r.getBoundingClientRect(), caixa = a4.getBoundingClientRect();
    const cs = getComputedStyle(carimbo);
    const lado = caixa.right - (parseFloat(cs.right) || 16) - t.right - 14;   /* ao lado do título */
    const acima = t.top - caixa.top - (parseFloat(cs.top) || 8) - 6;          /* ou por cima dele */
    carimbo.style.width = Math.max(84, Math.min(156, Math.max(lado, acima))) + 'px';
  }
  medeCarimbo();
  document.fonts?.ready.then(medeCarimbo);
  window.addEventListener('resize', medeCarimbo, { passive: true });

  const topo = document.createElement('div');
  topo.className = 'vit-topo';
  topo.hidden = true;
  const montar2 = document.createElement('button');
  montar2.type = 'button';
  montar2.className = 'pil vit-volta vit-montador2';
  montar2.setAttribute('aria-label', T.moA);
  montar2.innerHTML = `<span class="t" aria-hidden="true">${T.mo}</span><span class="b">${icMont}</span>`;
  const volta = document.createElement('button');
  volta.type = 'button';
  volta.className = 'pil vit-volta';
  volta.setAttribute('aria-label', T.voA);
  volta.innerHTML = `<span class="t" aria-hidden="true">${T.vo}</span><kbd aria-hidden="true">Esc</kbd><span class="b">${ic('m7 7 10 10M17 7 7 17')}</span>`;
  topo.append(montar2, volta);
  document.body.appendChild(topo);

  /* a folha: a soma do que ela mostra (a margem automática dos números não
     conta, porque é ela que estica a folha até o fim do quadro) */
  window.vitrine = {
    folha() {
      const pag = document.querySelector('.pag');
      if (!pag) return 0;
      const px = (v) => parseFloat(v) || 0;
      let h = 0;
      for (const el of pag.children) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none') continue;
        h += el.offsetHeight + px(cs.marginBottom) + (el.classList.contains('vit-nums') ? 0 : px(cs.marginTop));
      }
      const ps = getComputedStyle(pag), bs = getComputedStyle(document.body);
      return Math.ceil(h + px(ps.paddingTop) + px(ps.paddingBottom) + px(bs.paddingTop) + px(bs.paddingBottom));
    },
    conteudo() {
      const a4 = aberta() && document.querySelector('.a4');
      return a4 ? Math.ceil(a4.getBoundingClientRect().height) + 2 : 0;
    },
    /* nomes das pautas no maior porte em que a partitura cabe em alvo px */
    ajusta(alvo) {
      if (!aberta() || !alvo || !a4) { H.style.removeProperty('--vz'); return 1; }
      const alt = () => a4.getBoundingClientRect().height + 2;
      const vz = (v) => H.style.setProperty('--vz', v.toFixed(3));
      vz(1);
      if (alt() > alvo) return 1;
      let lo = 1, hi = VZ_MAX;
      vz(hi);
      if (alt() <= alvo) return hi;
      for (let i = 0; i < 9; i++) {
        const m = (lo + hi) / 2;
        vz(m);
        if (alt() <= alvo) lo = m; else hi = m;
      }
      vz(lo);
      return lo;
    },
  };
  const VZ_MAX = 1.9;
  const amplo = () => H.classList.contains('vit-amplo');
  const ajustaJanela = () => { if (amplo() && aberta()) window.vitrine.ajusta(window.innerHeight); };
  let rz = 0;
  window.addEventListener('resize', () => { if (!rz) rz = requestAnimationFrame(() => { rz = 0; ajustaJanela(); }); }, { passive: true });

  let contou = false;
  /* No celular, a página inteira é a vista-filha do ARCO (as páginas avulsas
     não têm acesso direto): a âncora interna vai por sessionStorage. */
  const noArco = (vista, alvo) => {
    const T = window.top;
    try { if (alvo) T.sessionStorage.setItem('arco:alvo:' + vista, alvo); } catch (e) {}
    try {
      if (T.location.hash === '#' + vista) T.dispatchEvent(new PopStateEvent('popstate'));
      else { T.location.hash = vista; T.dispatchEvent(new PopStateEvent('popstate')); }
    } catch (e) { T.location.href = new URL('arco.html#' + vista, location.href).href; }
  };
  const aberta = () => H.classList.contains('so-partitura');
  /* o ARCO ajusta o quadro: altura da folha fechada, altura da tela aberta */
  const avisa = (estado) => { if (window.parent !== window) window.parent.postMessage({ type: 'ECHO_VITRINE', estado }, location.origin); };

  function abre() {
    const quadro = window.frameElement;
    if (quadro && quadro.dataset.explorar === 'pagina') {
      noArco('play');
      return;
    }
    H.classList.add('so-partitura', 'empilha');
    topo.hidden = false;
    ajustaJanela();
    avisa('partitura');
    window.scrollTo(0, 0);
    sis.focus({ preventScroll: true });
    conta();
  }
  function conta() { if (!contou && typeof window.gtag === 'function') { window.gtag('config', 'G-GD0Q3Z4KQ9'); contou = true; } }
  function fecha() {
    if (!aberta()) return;
    H.classList.remove('so-partitura', 'empilha');
    H.style.removeProperty('--vz');
    topo.hidden = true;
    avisa('folha');
    window.scrollTo(0, 0);
    explorar.focus({ preventScroll: true });
  }

  /* montador: camada de Templates em tela cheia */
  const cam = document.getElementById('camada');
  let ampliou = false;
  function montador() {
    const quadro = window.frameElement;
    if (quadro && quadro.dataset.explorar === 'pagina') {
      noArco('play', 'templates');
      return;
    }
    if (window.parent !== window && !amplo()) {
      ampliou = true;
      window.parent.postMessage({ type: 'ECHO_VITRINE', estado: aberta() ? 'partitura' : 'folha', pedido: 'ampliar' }, location.origin);
    }
    const camT = document.querySelector('#camada-x .t');
    if (camT) { camT.dataset.orig ??= camT.textContent; camT.textContent = aberta() ? camT.dataset.orig : T.cv; }
    if (location.hash === '#templates') window.dispatchEvent(new HashChangeEvent('hashchange'));
    else location.hash = '#templates';
    conta();
  }
  /* fechada a camada, o quadro volta ao porte em que estava */
  if (cam) new MutationObserver(() => {
    if (!cam.hidden || !ampliou) return;
    ampliou = false;
    if (window.parent !== window) window.parent.postMessage({ type: 'ECHO_VITRINE', estado: aberta() ? 'partitura' : 'folha', pedido: 'reduzir' }, location.origin);
  }).observe(cam, { attributes: true, attributeFilter: ['hidden'] });

  explorar.addEventListener('click', abre);
  volta.addEventListener('click', fecha);
  montar.addEventListener('click', montador);
  montar2.addEventListener('click', montador);
  carimbo.addEventListener('click', montador);
  /* captura: decide antes de play.js, que fecha a camada aberta com o mesmo Esc */
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cam && !cam.hidden) return; /* play.js fecha a camada; o observador reduz */
    if (e.key === 'Escape' && !aberta() && H.classList.contains('vit-amplo') && window.parent !== window) {
      e.preventDefault();
      window.parent.postMessage({ type: 'ECHO_VITRINE', estado: 'folha', pedido: 'reduzir' }, location.origin);
      return;
    }
    if (e.key !== 'Escape' || !aberta()) return;
    const id = (x) => document.getElementById(x);
    const livre = id('sov')?.hidden !== false && id('leitor')?.hidden !== false
      && id('camada')?.hidden !== false && !id('parte')?.classList.contains('on')
      && !document.querySelector('.gaveta.on');
    if (livre) { e.preventDefault(); e.stopPropagation(); fecha(); }
  }, true);
  /* tela cheia no ARCO; ao reduzir no celular, volta à folha de rosto */
  window.addEventListener('message', (e) => {
    if (e.origin !== location.origin || e.source !== window.parent || !e.data || e.data.type !== 'ARCO_AMPLIA') return;
    H.classList.toggle('vit-amplo', !!e.data.amplo);
    if (e.data.amplo) ajustaJanela();
    else if (cam && !cam.hidden) { ampliou = false; document.getElementById('camada-x')?.click(); }
    if (!e.data.amplo && e.data.fecha) fecha();
  });
})();
