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
    ? { ex: 'Explore', exA: 'Explore the ECHO score', vo: 'Title page', voA: 'Back to the title page' }
    : { ex: 'Explorar', exA: 'Explorar a partitura do ECHO', vo: 'Folha de rosto', voA: 'Voltar à folha de rosto' };
  const ic = (d) => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`;

  const explorar = document.createElement('button');
  explorar.type = 'button';
  explorar.className = 'pil vit-explorar';
  explorar.setAttribute('aria-label', T.exA);
  explorar.innerHTML = `<span class="t">${T.ex}</span><span class="b">${ic('M5 12h13M12.5 6.5 18 12l-5.5 5.5')}</span>`;
  pe.appendChild(explorar);

  const volta = document.createElement('button');
  volta.type = 'button';
  volta.className = 'pil vit-volta';
  volta.hidden = true;
  volta.setAttribute('aria-label', T.voA);
  volta.innerHTML = `<span class="t" aria-hidden="true">${T.vo}</span><kbd aria-hidden="true">Esc</kbd><span class="b">${ic('m7 7 10 10M17 7 7 17')}</span>`;
  document.body.appendChild(volta);

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
  };

  let contou = false;
  const aberta = () => H.classList.contains('so-partitura');
  /* o ARCO ajusta o quadro: altura da folha fechada, altura da tela aberta */
  const avisa = (estado) => { if (window.parent !== window) window.parent.postMessage({ type: 'ECHO_VITRINE', estado }, location.origin); };

  function abre() {
    const quadro = window.frameElement;
    if (quadro && quadro.dataset.explorar === 'pagina') {
      window.top.location.href = new URL('play.html', location.href).href;
      return;
    }
    H.classList.add('so-partitura', 'empilha');
    volta.hidden = false;
    avisa('partitura');
    window.scrollTo(0, 0);
    sis.focus({ preventScroll: true });
    if (!contou && typeof window.gtag === 'function') { window.gtag('config', 'G-GD0Q3Z4KQ9'); contou = true; }
  }
  function fecha() {
    if (!aberta()) return;
    H.classList.remove('so-partitura', 'empilha');
    volta.hidden = true;
    avisa('folha');
    window.scrollTo(0, 0);
    explorar.focus({ preventScroll: true });
  }

  explorar.addEventListener('click', abre);
  volta.addEventListener('click', fecha);
  /* captura: decide antes de play.js, que fecha a camada aberta com o mesmo Esc */
  window.addEventListener('keydown', (e) => {
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
    if (!e.data.amplo && e.data.fecha) fecha();
  });
})();
