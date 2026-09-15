/* ========================================================================== 
   ARCO — camada final v2 | 15.09.2026
   --------------------------------------------------------------------------
   1) órbita/marca flutuante existe apenas na Home ARCO;
   2) rodapé comum entra no fluxo natural, sem efeito de revelar/ocultar;
   3) rail + rodapé formam uma única faixa preta no fim da página;
   4) ECHO/ATRIO encerram diretamente no rodapé comum;
   5) DATA recebe o mesmo rodapé comum;
   6) ECHO, ATRIO e DATA compartilham uma única scrollbar estrutural.
   ========================================================================== */
(() => {
  "use strict";

  const FOOTER_H = 84;
  const TOP_RAIL_MQ = matchMedia('(max-width:1000px)');
  const homeView = document.querySelector('.view[data-view="home"]');
  const dataTrigger = document.querySelector('.rail__link--data[data-view="data"]');
  const stage = document.querySelector('.stage');
  const childStates = new WeakMap();
  const childProgressInk = {
    echo:'#181818',
    atrio:'#A63A23',
    data:'#0057FF'
  };

  cleanupPreviousEndcap();
  installHostProgressOverride();
  installHomeFooter();
  installChildFooters();
  waitForContactOrbit();

  function cleanupPreviousEndcap(){
    document.querySelector('.arco-global-footer')?.remove();
    document.querySelectorAll('.arco-global-footer-spacer').forEach(node => node.remove());
    document.getElementById('arco-global-footer-style')?.remove();
    document.documentElement.classList.remove('arco-endcap-visible');
  }

  function footerMarkup(){
    const footer = document.createElement('footer');
    footer.className = 'arco-unified-footer';
    footer.setAttribute('aria-label','Encerramento do ARCO');
    footer.innerHTML = `
      <p class="arco-unified-footer__seal">ARCO © <time datetime="2026">2026</time></p>
      <button class="arco-unified-footer__method" type="button" aria-label="Abrir DATA — Base e Método">
        <span>BASE E MÉTODO:</span><strong>DATA</strong>
      </button>`;
    footer.querySelector('.arco-unified-footer__method')?.addEventListener('click',() => {
      dataTrigger?.click();
    });
    return footer;
  }

  function footerCss({embedded = false} = {}){
    return `
.arco-unified-footer{
  position:relative;
  width:100%;height:${FOOTER_H}px;min-height:${FOOTER_H}px;
  margin:0;padding:0;
  overflow:hidden;
  background:#181818;color:#FCFCFC;
  border:0;
}
.arco-unified-footer__seal{
  position:absolute;left:37.5%;top:50%;transform:translate(-50%,-50%);
  margin:0;padding:0;
  font-family:"Azeret Mono",ui-monospace,monospace;
  font-size:.58rem;font-weight:500;line-height:1.3;
  letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;
  color:#FCFCFC;text-align:center;
}
.arco-unified-footer__method{
  position:absolute;right:clamp(18px,2.1vw,34px);top:50%;transform:translateY(-50%);
  display:flex;align-items:baseline;justify-content:flex-end;gap:.5rem;
  margin:0;padding:.4rem 0;
  appearance:none;-webkit-appearance:none;border:0;background:none;
  text-align:right;cursor:pointer;color:#FCFCFC;
}
.arco-unified-footer__method span{
  font-family:"Azeret Mono",ui-monospace,monospace;
  font-size:.56rem;font-weight:500;line-height:1.3;
  letter-spacing:.08em;text-transform:uppercase;color:rgba(252,252,252,.58);white-space:nowrap;
}
.arco-unified-footer__method strong{
  font-family:"Commissioner",system-ui,sans-serif;
  font-size:.74rem;font-weight:600;line-height:1;
  letter-spacing:-.008em;color:#0057FF;white-space:nowrap;
}
.arco-unified-footer__method:hover strong,
.arco-unified-footer__method:focus-visible strong{color:#2e71ff}
.arco-unified-footer__method:focus-visible{outline:2px solid #0057FF;outline-offset:3px}
@media(max-width:1000px){
  .arco-unified-footer__seal{left:50%}
  .arco-unified-footer__method{right:max(1rem,env(safe-area-inset-right,0px));gap:.32rem}
  .arco-unified-footer__method span{font-size:clamp(.46rem,1.9vw,.54rem)}
  .arco-unified-footer__method strong{font-size:clamp(.64rem,2.5vw,.72rem)}
}
@media(max-width:560px){
  .arco-unified-footer__seal{font-size:.52rem}
  .arco-unified-footer__method span{display:none}
  .arco-unified-footer__method strong::before{content:"BASE E MÉTODO: ";font-family:"Azeret Mono",ui-monospace,monospace;font-size:.46rem;font-weight:500;letter-spacing:.06em;color:rgba(252,252,252,.58)}
}
${embedded ? 'html[data-arco-embedded="true"] footer.page-footer{display:none!important}' : ''}
`;
  }

  function installStyle(doc, embedded){
    if (doc.getElementById('arco-unified-footer-style')) return;
    const style = doc.createElement('style');
    style.id = 'arco-unified-footer-style';
    style.textContent = footerCss({embedded});
    doc.head.appendChild(style);
  }

  function installHomeFooter(){
    if (!homeView || homeView.querySelector(':scope > .arco-unified-footer')) return;
    installStyle(document,false);
    homeView.appendChild(footerMarkup());
  }

  function installHostProgressOverride(){
    if (!document.getElementById('arco-child-progress-host-style')){
      const style = document.createElement('style');
      style.id = 'arco-child-progress-host-style';
      style.textContent = 'html[data-arco-child-active="true"] #progress-rail{display:none!important}';
      document.head.appendChild(style);
    }

    const sync = () => {
      const active = document.querySelector('.view[data-active="true"]')?.dataset.view || 'home';
      document.documentElement.dataset.arcoChildActive = String(active !== 'home');
    };
    sync();
    if (stage){
      new MutationObserver(sync).observe(stage,{
        subtree:true,
        attributes:true,
        attributeFilter:['data-active']
      });
    }
  }

  function installChildFooters(){
    document.querySelectorAll('iframe.child__frame').forEach(frame => {
      const prepare = () => {
        let win,doc;
        try {
          win = frame.contentWindow;
          doc = frame.contentDocument;
        } catch {
          return;
        }
        if (!win || !doc?.documentElement || !doc.body) return;

        const view = frame.closest('.view')?.dataset.view;
        if (!view || !['echo','atrio','data'].includes(view)) return;

        doc.documentElement.dataset.arcoEmbedded = 'true';
        installStyle(doc,true);

        /* O shell é o dono da navegação entre projetos. Nunca deixar ARCO
           carregar dentro do próprio iframe. */
        doc.querySelectorAll('a[href="arco.html"],a[href^="arco.html#"]').forEach(link => {
          link.setAttribute('target','_top');
        });

        cleanupChild(view,doc);

        if (!doc.body.querySelector(':scope > .arco-unified-footer')){
          doc.body.appendChild(footerMarkup());
        }

        prepareChildScrollbar(frame,win,doc,view);
      };

      frame.addEventListener('load',prepare);
      try {
        if (frame.contentDocument?.readyState === 'complete' && frame.getAttribute('src') !== 'about:blank') prepare();
      } catch {}
    });
  }

  function cleanupChild(view,doc){
    if (view === 'echo'){
      const ecosystemLabel = [...doc.querySelectorAll('p')]
        .find(node => node.textContent.trim() === 'Ecossistema');
      const ecosystemBlock = ecosystemLabel?.closest('div[data-reveal]') || ecosystemLabel?.parentElement;
      ecosystemBlock?.remove();

      const legacyFooter = [...doc.querySelectorAll('div')].find(node => {
        const children = [...node.children];
        if (children.length !== 3 || children.some(child => child.tagName !== 'SPAN')) return false;
        return children[0].textContent.trim() === 'ECHO' &&
          children[1].textContent.trim() === 'Christian da Costa, Curitiba, Brasil' &&
          children[2].textContent.trim() === '2026';
      });
      legacyFooter?.remove();
    }

    if (view === 'atrio'){
      doc.querySelector('.project-sequence')?.remove();
    }
  }

  function prepareChildScrollbar(frame,win,doc,view){
    const previous = childStates.get(frame);
    if (previous){
      previous.win.removeEventListener('scroll',previous.schedule);
      previous.win.removeEventListener('resize',previous.schedule);
      previous.resizeObserver?.disconnect();
      previous.cleanupObserver?.disconnect();
    }

    installChildScrollbarStyle(view,doc);
    const progress = ensureChildScrollbar(view,doc);

    let raf = 0;
    const update = () => {
      raf = 0;
      const root = doc.scrollingElement || doc.documentElement;
      if (!root || !progress?.rail || !progress?.fill) return;
      const max = Math.max(0,root.scrollHeight - win.innerHeight);
      const ratio = max > 0 ? Math.min(1,Math.max(0,root.scrollTop / max)) : 0;
      progress.fill.style.transform = `scaleY(${ratio})`;
      progress.rail.hidden = max <= 1;
    };
    const schedule = () => {
      if (raf) return;
      raf = win.requestAnimationFrame(update);
    };

    win.addEventListener('scroll',schedule,{passive:true});
    win.addEventListener('resize',schedule,{passive:true});

    let resizeObserver = null;
    if ('ResizeObserver' in win){
      resizeObserver = new win.ResizeObserver(schedule);
      resizeObserver.observe(doc.documentElement);
      resizeObserver.observe(doc.body);
    }

    /* ECHO é montado por runtime. Durante a estabilização inicial, qualquer
       recomposição que tente devolver os blocos legados é limpa novamente. */
    let cleanupRaf = 0;
    const scheduleCleanup = () => {
      if (cleanupRaf) return;
      cleanupRaf = win.requestAnimationFrame(() => {
        cleanupRaf = 0;
        cleanupChild(view,doc);
        schedule();
      });
    };
    let cleanupObserver = null;
    if ('MutationObserver' in win){
      cleanupObserver = new win.MutationObserver(scheduleCleanup);
      cleanupObserver.observe(doc.body,{childList:true,subtree:true});
      win.setTimeout(() => cleanupObserver?.disconnect(),4000);
    }

    childStates.set(frame,{win,doc,schedule,resizeObserver,cleanupObserver});
    schedule();
    [60,260,900,2200].forEach(delay => win.setTimeout(scheduleCleanup,delay));
  }

  function installChildScrollbarStyle(view,doc){
    let style = doc.getElementById('arco-child-scrollbar-style');
    if (!style){
      style = doc.createElement('style');
      style.id = 'arco-child-scrollbar-style';
      style.textContent = `
html[data-arco-embedded="true"]{
  scrollbar-width:none!important;
  -ms-overflow-style:none!important;
}
html[data-arco-embedded="true"]::-webkit-scrollbar,
html[data-arco-embedded="true"] body::-webkit-scrollbar{
  width:0!important;height:0!important;display:none!important;
}
html[data-arco-embedded="true"] .atrio-progress,
html[data-arco-embedded="true"] .echo-trace{
  display:none!important;
}
.arco-child-scrollbar{
  position:fixed;top:0;right:2px;bottom:0;z-index:2147483000;
  width:2px;overflow:hidden;pointer-events:none;
  background:rgba(128,128,128,.24);
}
.arco-child-scrollbar__fill{
  position:absolute;inset:0 0 auto 0;width:100%;height:100%;
  transform:scaleY(0);transform-origin:50% 0;
  background:var(--arco-child-progress-ink,#181818);
  box-shadow:0 0 0 .5px rgba(252,252,252,.52);
  will-change:transform;
}
@media(max-width:760px){
  .arco-child-scrollbar{right:1px;width:2px}
}
@media(prefers-reduced-motion:reduce){
  .arco-child-scrollbar__fill{transition:none!important}
}`;
      doc.head.appendChild(style);
    }
    doc.documentElement.style.setProperty('--arco-child-progress-ink',childProgressInk[view] || '#181818');
  }

  function ensureChildScrollbar(view,doc){
    let rail = doc.getElementById('arco-child-scrollbar');
    if (!rail){
      rail = doc.createElement('div');
      rail.id = 'arco-child-scrollbar';
      rail.className = 'arco-child-scrollbar';
      rail.setAttribute('aria-hidden','true');
      rail.innerHTML = '<span class="arco-child-scrollbar__fill"></span>';
      doc.body.appendChild(rail);
    }
    rail.style.setProperty('--arco-child-progress-ink',childProgressInk[view] || '#181818');
    return {rail,fill:rail.querySelector('.arco-child-scrollbar__fill')};
  }

  function waitForContactOrbit(){
    let attempts = 0;
    const find = () => {
      const orbit = document.querySelector('.arco-contact-orbit');
      const mark = homeView?.querySelector('.bio__mark');
      if (orbit && homeView && mark){
        patchContactOrbit({orbit,mark});
        return;
      }
      if (++attempts < 240) setTimeout(find,25);
    };
    find();
  }

  function patchContactOrbit({orbit,mark}){
    if (orbit.dataset.arcoHomeOnly === 'true') return;
    orbit.dataset.arcoHomeOnly = 'true';

    const contentEdge = homeView.querySelector('.bio__head > div');
    if (!contentEdge) return;

    const style = document.createElement('style');
    style.id = 'arco-contact-orbit-home-only-style';
    style.textContent = String.raw`
.arco-contact-orbit[hidden]{display:none!important}
.arco-contact-orbit.is-external-view{display:none!important}
@media(min-width:821px) and (max-width:1000px){
  .arco-contact-orbit{
    position:fixed!important;z-index:72!important;left:50%!important;right:auto!important;
    bottom:max(12px,env(safe-area-inset-bottom,0px))!important;top:auto!important;
    width:auto!important;display:grid!important;grid-template-columns:repeat(5,46px)!important;
    gap:4px!important;padding:4px!important;
    background:color-mix(in srgb,var(--paper,#FCFCFC) 94%,transparent)!important;
    backdrop-filter:blur(12px);border:1px solid color-mix(in srgb,var(--ink,#181818) 24%,transparent)!important;
    box-shadow:0 10px 28px rgba(0,0,0,.10)!important;
    opacity:0!important;visibility:hidden!important;pointer-events:none!important;
    transform:translate(-50%,calc(100% + 18px))!important;
    transition:opacity 150ms cubic-bezier(.22,.68,0,1),transform 170ms cubic-bezier(.22,.68,0,1),visibility 0s linear 170ms!important
  }
  .arco-contact-orbit.is-collected,
  .arco-contact-orbit.is-mobile-visible{
    opacity:1!important;visibility:visible!important;pointer-events:auto!important;
    transform:translate(-50%,0)!important;transition-delay:0s!important
  }
  .arco-contact-orbit__brand{display:grid!important;width:46px!important;height:46px!important;padding:9px!important}
  .arco-contact-orbit__links{
    display:contents!important;width:auto!important;margin:0!important;
    opacity:1!important;visibility:visible!important;pointer-events:auto!important
  }
  .arco-contact-orbit__link{
    width:46px!important;height:46px!important;border:0!important;
    border-left:1px solid color-mix(in srgb,var(--ink,#181818) 20%,transparent)!important
  }
}
`;
    document.head.appendChild(style);

    let naturalLeft = null;
    let raf = 0;

    const restoreInlineMark = () => {
      mark.removeAttribute('style');
      delete mark.dataset.floating;
      mark.setAttribute('role','img');
      mark.removeAttribute('tabindex');
      mark.setAttribute('aria-label','Marca pessoal de Christian da Costa');
    };

    const cssIntendedLeft = () => {
      const contentRect = contentEdge.getBoundingClientRect();
      const markRect = mark.getBoundingClientRect();
      if (!contentRect.width || !markRect.width) return naturalLeft;
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 14.4;
      const margin = Math.max(.6 * rem,Math.min(innerWidth * .011,1 * rem));
      return contentRect.left - margin - markRect.width;
    };

    const captureNatural = () => {
      if (TOP_RAIL_MQ.matches || mark.dataset.floating === 'true') return;
      const rect = mark.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) naturalLeft = rect.left;
    };

    const enforce = () => {
      raf = 0;
      const homeActive = homeView.dataset.active === 'true';

      /* Nas filhas o recurso não existe: nada de marca, coleta ou contatos
         persistentes vindos da Home. */
      if (!homeActive){
        if (!orbit.hidden) orbit.hidden = true;
        orbit.classList.remove('is-external-view','is-collected','is-mobile-visible');
        homeView.classList.remove('arco-contacts-collected');
        if (mark.dataset.floating === 'true' || mark.hasAttribute('style')) restoreInlineMark();
        return;
      }

      if (orbit.hidden) orbit.hidden = false;
      orbit.classList.remove('is-external-view');

      /* Quando o rail já virou topo, não há calha lateral para a marca descer.
         O conjunto móvel continua funcionando, mas a marca permanece no fluxo. */
      if (TOP_RAIL_MQ.matches){
        if (mark.dataset.floating === 'true' || mark.hasAttribute('style')) restoreInlineMark();
        return;
      }

      captureNatural();
      if (mark.dataset.floating !== 'true') return;
      const desired = naturalLeft ?? cssIntendedLeft();
      if (!Number.isFinite(desired)) return;

      const current = parseFloat(mark.style.left || 'NaN');
      if (!Number.isFinite(current) || Math.abs(current - desired) > .25){
        mark.style.setProperty('left',`${desired}px`,'important');
      }
      orbit.style.setProperty('--orbit-left',`${desired}px`);
    };

    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(enforce);
    };

    captureNatural();
    window.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('resize',() => {naturalLeft = null;schedule();},{passive:true});
    window.addEventListener('orientationchange',() => {naturalLeft = null;schedule();},{passive:true});
    TOP_RAIL_MQ.addEventListener?.('change',() => {naturalLeft = null;schedule();});
    new MutationObserver(schedule).observe(homeView,{attributes:true,attributeFilter:['data-active']});
    new MutationObserver(schedule).observe(mark,{attributes:true,attributeFilter:['style','data-floating']});
    new MutationObserver(schedule).observe(orbit,{attributes:true,attributeFilter:['style','class','hidden']});
    schedule();
  }
})();