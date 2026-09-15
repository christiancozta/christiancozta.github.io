/* ========================================================================== 
   ARCO — fechamento global + correção de órbita da marca
   15.09.2026
   --------------------------------------------------------------------------
   Camada final não destrutiva sobre o runtime estabilizado:
   1) rodapé ARCO de 84 px, revelado apenas no fim da view corrente;
   2) DATA como destino de Base e Método;
   3) marca/contatos exclusivamente na Home;
   4) alinhamento horizontal preserva a origem real da marca;
   5) breakpoint da órbita acompanha o rail (1000 px), inclusive mobile/tablet.
   ========================================================================== */
(() => {
  "use strict";

  const FOOTER_H = 84;
  const TOP_RAIL_MQ = matchMedia('(max-width:1000px)');

  installGlobalEndcap();
  waitForContactOrbit();

  function installGlobalEndcap(){
    if (document.querySelector('.arco-global-footer')) return;

    const views = [...document.querySelectorAll('.view[data-view]')];
    const homeView = document.querySelector('.view[data-view="home"]');
    const dataTrigger = document.querySelector('.rail__link--data[data-view="data"]');
    if (!views.length || !homeView) return;

    const footer = document.createElement('footer');
    footer.className = 'arco-global-footer';
    footer.setAttribute('aria-label','Encerramento do ARCO');
    footer.setAttribute('aria-hidden','true');
    footer.innerHTML = `
      <div class="arco-global-footer__grid">
        <div class="arco-global-footer__identity">
          <strong>Christian da Costa</strong>
          <span>LAW <i aria-hidden="true">|</i> OPS <i aria-hidden="true">|</i> TECH <i aria-hidden="true">|</i> AI</span>
        </div>
        <p class="arco-global-footer__seal">ARCO © <time datetime="2026">2026</time></p>
        <button class="arco-global-footer__method" type="button" aria-label="Abrir DATA — Base e Método">
          <span>BASE E MÉTODO:</span><strong>DATA</strong>
        </button>
      </div>`;
    document.body.appendChild(footer);

    const style = document.createElement('style');
    style.id = 'arco-global-footer-style';
    style.textContent = String.raw`
.arco-global-footer{
  position:fixed;left:var(--rail-w);right:0;bottom:0;z-index:71;
  height:84px;min-height:84px;overflow:hidden;
  color:var(--paper,#FCFCFC);background-color:var(--ink,#181818);
  background-image:linear-gradient(to right,rgba(252,252,252,.075) 1px,transparent 1px);
  background-size:12.5% 100%;
  border-top:1px solid rgba(252,252,252,.12);
  transform:translateY(100%);opacity:0;visibility:hidden;pointer-events:none;
  transition:transform 260ms cubic-bezier(.22,.68,0,1),opacity 180ms linear,visibility 0s linear 260ms
}
.arco-global-footer.is-visible{
  transform:none;opacity:1;visibility:visible;pointer-events:auto;transition-delay:0s
}
.arco-global-footer__grid{
  height:100%;display:grid;grid-template-columns:repeat(8,minmax(0,1fr));align-items:stretch
}
.arco-global-footer__identity,
.arco-global-footer__seal,
.arco-global-footer__method{
  min-width:0;margin:0;padding:0 clamp(16px,1.45vw,26px);
  display:flex;align-items:center;justify-content:center
}
.arco-global-footer__identity{
  grid-column:2/span 2;align-items:flex-start;justify-content:center;flex-direction:column;text-align:left
}
.arco-global-footer__identity strong{
  font-family:var(--f-display);font-weight:700;font-size:1.02rem;line-height:1.1;letter-spacing:0;color:var(--paper)
}
.arco-global-footer__identity span{
  margin-top:.5rem;font-family:var(--f-micro);font-size:.58rem;line-height:1.5;
  letter-spacing:.12em;text-transform:uppercase;color:var(--pp-58)
}
.arco-global-footer__identity i{font-style:normal;color:var(--hair-inv);margin:0 .2rem}
.arco-global-footer__seal{
  grid-column:4/span 2;font-family:var(--f-micro);font-weight:500;font-size:.58rem;line-height:1.3;
  letter-spacing:.08em;text-transform:uppercase;color:var(--paper);text-align:center
}
.arco-global-footer__method{
  grid-column:6/span 2;justify-content:flex-end;gap:.5rem;
  appearance:none;-webkit-appearance:none;border:0;background:none;color:var(--pp-72);
  text-align:right;cursor:pointer
}
.arco-global-footer__method span{
  font-family:var(--f-micro);font-size:.56rem;font-weight:500;line-height:1.3;
  letter-spacing:.08em;text-transform:uppercase;color:var(--pp-58)
}
.arco-global-footer__method strong{
  font-family:var(--f-body);font-size:.74rem;font-weight:600;line-height:1.2;
  letter-spacing:-.008em;color:#0057FF
}
.arco-global-footer__method:hover strong,
.arco-global-footer__method:focus-visible strong{color:#2e71ff}
.arco-global-footer__method:focus-visible{outline:2px solid #0057FF;outline-offset:-5px}
.arco-global-footer-spacer{display:block;width:100%;height:84px;min-height:84px;pointer-events:none;background:transparent}
.arco-endcap-visible .arco-contact-orbit{opacity:0!important;visibility:hidden!important;pointer-events:none!important}

@media(max-width:1000px){
  .arco-global-footer{
    left:0;height:calc(84px + env(safe-area-inset-bottom,0px));min-height:84px;
    padding-bottom:env(safe-area-inset-bottom,0px);background-size:25% 100%
  }
  .arco-global-footer__grid{
    grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);
    gap:clamp(.55rem,2vw,1rem);padding:0 max(1rem,env(safe-area-inset-right,0px)) 0 max(1rem,env(safe-area-inset-left,0px))
  }
  .arco-global-footer__identity,
  .arco-global-footer__seal,
  .arco-global-footer__method{grid-column:auto;padding:0}
  .arco-global-footer__identity strong{font-size:clamp(.72rem,2.8vw,.9rem)}
  .arco-global-footer__identity span{margin-top:.34rem;font-size:clamp(.46rem,1.9vw,.54rem);letter-spacing:.08em;white-space:nowrap}
  .arco-global-footer__seal{font-size:clamp(.48rem,2vw,.56rem);white-space:nowrap}
  .arco-global-footer__method{gap:.3rem;flex-wrap:wrap;align-content:center}
  .arco-global-footer__method span{font-size:clamp(.44rem,1.8vw,.52rem);white-space:nowrap}
  .arco-global-footer__method strong{font-size:clamp(.60rem,2.3vw,.70rem)}
  .arco-global-footer-spacer{height:calc(84px + env(safe-area-inset-bottom,0px));min-height:84px}
}
@media(max-width:430px){
  .arco-global-footer__grid{gap:.55rem;padding-inline:.8rem}
  .arco-global-footer__identity span{letter-spacing:.055em}
  .arco-global-footer__method{max-width:8.2rem}
}
@media(prefers-reduced-motion:reduce){.arco-global-footer{transition:none!important}}
`;
    document.head.appendChild(style);

    const homeSpacer = document.createElement('div');
    homeSpacer.className = 'arco-global-footer-spacer';
    homeSpacer.setAttribute('aria-hidden','true');
    homeView.appendChild(homeSpacer);

    const frameStates = new WeakMap();
    let activeFrame = null;
    let visible = false;
    let syncRaf = 0;

    const setVisible = on => {
      if (visible === on) return;
      visible = on;
      footer.classList.toggle('is-visible',on);
      footer.setAttribute('aria-hidden',String(!on));
      document.documentElement.classList.toggle('arco-endcap-visible',on);
    };

    const scrollingElement = (doc = document) => doc.scrollingElement || doc.documentElement;
    const reachedBoundary = (win, doc, spacer) => {
      const root = scrollingElement(doc);
      if (!root) return false;
      const reserve = spacer?.getBoundingClientRect ? spacer.getBoundingClientRect().height : FOOTER_H;
      const boundary = Math.max(0,root.scrollHeight - reserve);
      return root.scrollTop + win.innerHeight >= boundary - 3;
    };

    const currentView = () => document.querySelector('.view[data-active="true"]');

    const sync = () => {
      syncRaf = 0;
      const view = currentView();
      if (!view){setVisible(false);return;}
      const name = view.dataset.view;
      if (name === 'home'){
        activeFrame = null;
        setVisible(reachedBoundary(window,document,homeSpacer));
        return;
      }
      const frame = view.querySelector('iframe.child__frame');
      if (!frame){setVisible(false);return;}
      activeFrame = frame;
      const state = frameStates.get(frame);
      if (!state){setVisible(false);return;}
      setVisible(reachedBoundary(state.win,state.doc,state.spacer));
    };

    const scheduleSync = () => {
      if (syncRaf) return;
      syncRaf = requestAnimationFrame(sync);
    };

    const prepareFrame = frame => {
      let win,doc;
      try { win = frame.contentWindow; doc = frame.contentDocument; }
      catch { return; }
      if (!win || !doc?.documentElement || !doc.body) return;

      const previous = frameStates.get(frame);
      if (previous){
        previous.win.removeEventListener('scroll',previous.schedule);
        previous.win.removeEventListener('resize',previous.schedule);
        previous.resizeObserver?.disconnect();
      }

      doc.documentElement.dataset.arcoEmbedded = 'true';

      let childStyle = doc.getElementById('arco-parent-embedding-style');
      if (!childStyle){
        childStyle = doc.createElement('style');
        childStyle.id = 'arco-parent-embedding-style';
        childStyle.textContent = `
html[data-arco-embedded="true"] footer.page-footer{display:none!important}
html[data-arco-embedded="true"] .arco-parent-footer-spacer{display:block!important;width:100%!important;height:84px!important;min-height:84px!important;pointer-events:none!important;background:transparent!important}
@media(max-width:1000px){html[data-arco-embedded="true"] .arco-parent-footer-spacer{height:calc(84px + env(safe-area-inset-bottom,0px))!important}}
`;
        doc.head.appendChild(childStyle);
      }

      doc.querySelectorAll('a[href="arco.html"],a[href^="arco.html#"]').forEach(link => link.setAttribute('target','_top'));

      let spacer = doc.body.querySelector(':scope > .arco-parent-footer-spacer');
      if (!spacer){
        spacer = doc.createElement('div');
        spacer.className = 'arco-parent-footer-spacer';
        spacer.setAttribute('aria-hidden','true');
        doc.body.appendChild(spacer);
      }

      let childRaf = 0;
      const childSync = () => {
        childRaf = 0;
        if (frame !== activeFrame && currentView()?.querySelector('iframe.child__frame') !== frame) return;
        scheduleSync();
      };
      const schedule = () => {
        if (childRaf) return;
        childRaf = win.requestAnimationFrame(childSync);
      };
      win.addEventListener('scroll',schedule,{passive:true});
      win.addEventListener('resize',schedule,{passive:true});
      let resizeObserver = null;
      if ('ResizeObserver' in win){
        resizeObserver = new win.ResizeObserver(schedule);
        resizeObserver.observe(doc.documentElement);
        resizeObserver.observe(doc.body);
      }
      frameStates.set(frame,{win,doc,spacer,schedule,resizeObserver});
      if (currentView()?.querySelector('iframe.child__frame') === frame){
        activeFrame = frame;
      }
      scheduleSync();
    };

    document.querySelectorAll('iframe.child__frame').forEach(frame => {
      frame.addEventListener('load',() => prepareFrame(frame));
      try {
        if (frame.contentDocument?.readyState === 'complete' && frame.getAttribute('src') !== 'about:blank') prepareFrame(frame);
      } catch {}
    });

    footer.querySelector('.arco-global-footer__method')?.addEventListener('click',() => {
      dataTrigger?.click();
    });

    window.addEventListener('scroll',scheduleSync,{passive:true});
    window.addEventListener('resize',scheduleSync,{passive:true});
    window.addEventListener('orientationchange',scheduleSync,{passive:true});
    new MutationObserver(scheduleSync).observe(document.querySelector('.stage') || document.body,{
      subtree:true,attributes:true,attributeFilter:['data-active']
    });
    scheduleSync();
  }

  function waitForContactOrbit(){
    let attempts = 0;
    const find = () => {
      const orbit = document.querySelector('.arco-contact-orbit');
      const homeView = document.querySelector('.view[data-view="home"]');
      const mark = homeView?.querySelector('.bio__mark');
      if (orbit && homeView && mark){
        patchContactOrbit({orbit,homeView,mark});
        return;
      }
      if (++attempts < 180) setTimeout(find,25);
    };
    find();
  }

  function patchContactOrbit({orbit,homeView,mark}){
    if (orbit.dataset.arcoFinalPatched === 'true') return;
    orbit.dataset.arcoFinalPatched = 'true';

    const contentEdge = homeView.querySelector('.bio__head > div');
    if (!contentEdge) return;

    const style = document.createElement('style');
    style.id = 'arco-contact-orbit-final-style';
    style.textContent = String.raw`
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
  .arco-contact-orbit.is-collected{
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

    const restoreInlineMark = () => {
      mark.removeAttribute('style');
      delete mark.dataset.floating;
      mark.setAttribute('role','img');
      mark.removeAttribute('tabindex');
      mark.setAttribute('aria-label','Marca pessoal de Christian da Costa');
    };

    const align = () => {
      raf = 0;
      const homeActive = homeView.dataset.active !== 'false';

      if (!homeActive){
        orbit.classList.remove('is-external-view','is-collected','is-mobile-visible');
        return;
      }

      orbit.classList.remove('is-external-view');

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
      raf = requestAnimationFrame(align);
    };

    captureNatural();
    window.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('resize',() => {naturalLeft = null;schedule();},{passive:true});
    window.addEventListener('orientationchange',() => {naturalLeft = null;schedule();},{passive:true});
    TOP_RAIL_MQ.addEventListener?.('change',() => {naturalLeft = null;schedule();});
    new MutationObserver(schedule).observe(homeView,{attributes:true,attributeFilter:['data-active']});
    new MutationObserver(schedule).observe(mark,{attributes:true,attributeFilter:['style','data-floating']});
    new MutationObserver(schedule).observe(orbit,{attributes:true,attributeFilter:['style','class']});
    schedule();
  }
})();
