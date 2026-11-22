/* ==========================================================================
   CERNE: vitrine da página (cerne.html?vitrine)
   --------------------------------------------------------------------------
   No ARCO, o painel AI Governance mostra esta página num quadro: primeiro a
   folha de rosto (marca, definição e os números das rodadas), com um único
   botão, Explorar, que só existe com JS e roda depois do script da página.
   Explorar abre a lista de atos (#mesa) na própria página; escolher um ato
   e reproduzir a rodada leva à impressora (#op), onde só a folha rola.
   Folha de rosto, ou Esc com nada aberto, volta. Quando o ARCO pede página
   inteira (no celular, data-explorar="pagina" no quadro), Explorar abre a
   demonstração completa na janela de cima.
   O ARCO mede o quadro por window.vitrine: folha() é a altura da folha de
   rosto; conteudo() é a altura da lista aberta (o ARCO a reduz em escala
   até caber na tela) ou 0, com a rodada, que ocupa a altura da tela.
   Ampliada (aviso ARCO_AMPLIA do ARCO, tela cheia), a página ganha
   vit-amplo: a folha de rosto vai ao centro e, aberta, a página rola por
   dentro. Esc na folha de rosto pede ao ARCO que reduza.
   A visita só é contada ao explorar: a folha à vista na home não é leitura.
   ========================================================================== */
(() => {
  'use strict';
  const H = document.documentElement;
  if (!H.classList.contains('vitrine')) return;
  const $ = (s) => document.querySelector(s);
  const pe = $('#vit-pe'), rosto = $('.vit-rosto'), mesa = $('#mesa'), op = $('#op');
  if (!pe || !rosto || !mesa || !op || !$('#atos .at')) return;

  const EN = (H.lang || '').toLowerCase().startsWith('en');
  const T = EN
    ? { ex: 'Explore', exA: 'Explore the recorded CERNE rounds', vo: 'Title page', voA: 'Back to the title page' }
    : { ex: 'Explorar', exA: 'Explorar as rodadas registradas do CERNE', vo: 'Folha de rosto', voA: 'Voltar à folha de rosto' };
  const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const explorar = document.createElement('button');
  explorar.type = 'button';
  explorar.className = 'btn solid rodar vit-explorar';
  explorar.setAttribute('aria-label', T.exA);
  explorar.innerHTML = `<span>${T.ex}</span><span class="ic" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 16 16"><path d="M2.5 8 H12.5 M8.5 3.5 L13 8 L8.5 12.5" fill="none" stroke="#FCFCFC" stroke-width="2" stroke-linecap="square"/></svg></span>`;
  pe.appendChild(explorar);

  const volta = document.createElement('button');
  volta.type = 'button';
  volta.className = 'btn vit-volta';
  volta.setAttribute('aria-label', T.voA);
  volta.innerHTML = `<span aria-hidden="true">${T.vo}</span><kbd aria-hidden="true">Esc</kbd>`;
  mesa.querySelector('.demo-tit')?.appendChild(volta);
  mesa.tabIndex = -1;

  /* dentro do quadro, rolar até um elemento rolaria também a home: aqui não há
     o que rolar (o ARCO dá ao quadro a altura do conteúdo), salvo nos diálogos */
  const rolar = Element.prototype.scrollIntoView;
  Element.prototype.scrollIntoView = function (o) { if (this.closest('dialog')) rolar.call(this, o); };

  const aberta = () => H.classList.contains('vit-aberta');
  const rodada = () => !op.hidden;
  const estado = () => (!aberta() ? 'folha' : rodada() ? 'rodada' : 'mesa');
  /* o ARCO ajusta o quadro a cada aviso */
  const avisa = () => { if (window.parent !== window) window.parent.postMessage({ type: 'CERNE_VITRINE', estado: estado() }, location.origin); };

  window.vitrine = {
    folha: () => Math.ceil(rosto.getBoundingClientRect().height),
    conteudo: () => (aberta() && !rodada() ? Math.ceil(mesa.getBoundingClientRect().height) + 2 : 0),
  };

  let contou = false;
  function abre() {
    const quadro = window.frameElement;
    if (quadro && quadro.dataset.explorar === 'pagina') {
      window.top.location.href = new URL('cerne.html#mesa', location.href).href;
      return;
    }
    H.classList.add('vit-aberta');
    avisa();
    window.scrollTo(0, 0);
    mesa.focus({ preventScroll: true });
    if (!contou && typeof window.gtag === 'function') { window.gtag('config', 'G-GD0Q3Z4KQ9'); contou = true; }
  }
  function fecha() {
    if (!aberta()) return;
    if (rodada()) $('#btnFechar')?.click();
    $('.at.aberta .at-btn')?.click();
    H.classList.remove('vit-aberta');
    avisa();
    window.scrollTo(0, 0);
    explorar.focus({ preventScroll: true });
  }
  explorar.addEventListener('click', abre);
  volta.addEventListener('click', fecha);

  /* a rodada aparece e some pelo atributo hidden de #op (script da página);
     o CSS troca a lista pela rodada, aqui só se avisa o ARCO */
  new MutationObserver(() => {
    if (!aberta()) return;
    avisa();
    window.scrollTo(0, 0);
  }).observe(op, { attributes: true, attributeFilter: ['hidden'] });

  /* abrir ou fechar o resumo de um ato muda a altura da lista: novo aviso ao
     fim da transição (ou logo, sem movimento) */
  let pend = 0;
  const remede = () => { clearTimeout(pend); pend = setTimeout(() => { if (aberta() && !rodada()) avisa(); }, 30); };
  mesa.addEventListener('click', (e) => { if (e.target.closest('.at-btn')) setTimeout(remede, reduz ? 0 : 540); });
  mesa.addEventListener('transitionend', (e) => { if (e.target.classList?.contains('at-d')) remede(); });

  /* captura: decide antes do script da página, que fecha a rodada com o mesmo
     Esc; com um ato aberto na lista, Esc o recolhe primeiro */
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !aberta() && H.classList.contains('vit-amplo') && window.parent !== window) {
      e.preventDefault();
      window.parent.postMessage({ type: 'CERNE_VITRINE', estado: 'folha', pedido: 'reduzir' }, location.origin);
      return;
    }
    if (e.key !== 'Escape' || !aberta() || rodada() || document.querySelector('dialog[open]')) return;
    e.preventDefault(); e.stopPropagation();
    const ato = $('.at.aberta .at-btn');
    if (ato) { ato.click(); ato.focus({ preventScroll: true }); } else fecha();
  }, true);

  /* tela cheia no ARCO; ao reduzir no celular, volta à folha de rosto */
  window.addEventListener('message', (e) => {
    if (e.origin !== location.origin || e.source !== window.parent || !e.data || e.data.type !== 'ARCO_AMPLIA') return;
    H.classList.toggle('vit-amplo', !!e.data.amplo);
    if (!e.data.amplo && e.data.fecha) fecha();
  });

  /* a folha de rosto muda de altura quando as fontes chegam */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!aberta()) avisa(); });
})();
