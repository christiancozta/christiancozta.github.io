/* ========================================================================== 
   ARCO — acabamento das páginas filhas | 15.09.2026
   --------------------------------------------------------------------------
   1) ECHO termina no rodapé comum: remove Ecossistema e rodapé legado;
   2) ATRIO termina no rodapé comum: remove a sequência 5→1;
   3) DATA recebe o mesmo rodapé comum já instalado pela camada final v2;
   4) ECHO, ATRIO e DATA usam uma única scrollbar estrutural, do topo ao fim;
   5) barras nativas/legadas dos filhos e o rail concorrente do host são ocultos.
   ========================================================================== */
(() => {
  "use strict";

  const stage = document.querySelector('.stage');
  const childStates = new WeakMap();
  const progressInk = {
    echo:'#181818',
    atrio:'#A63A23',
    data:'#0057FF'
  };

  installHostProgressOverride();
  installChildren();

  function activeViewName(){
    return document.querySelector('.view[data-active="true"]')?.dataset.view || 'home';
  }

  function installHostProgressOverride(){
    if (!document.getElementById('arco-child-progress-host-style')){
      const style = document.createElement('style');
      style.id = 'arco-child-progress-host-style';
      style.textContent = 'html[data-arco-child-active="true"] #progress-rail{display:none!important}';
      document.head.appendChild(style);
    }

    const sync = () => {
      document.documentElement.dataset.arcoChildActive = String(activeViewName() !== 'home');
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

  function installChildren(){
    document.querySelectorAll('iframe.child__frame').forEach(frame => {
      const prepare = () => prepareFrame(frame);
      frame.addEventListener('load',prepare);
      try {
        if (frame.contentDocument?.readyState === 'complete' && frame.getAttribute('src') !== 'about:blank') prepare();
      } catch {}
    });
  }

  function prepareFrame(frame){
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

    const previous = childStates.get(frame);
    if (previous){
      previous.win.removeEventListener('scroll',previous.schedule);
      previous.win.removeEventListener('resize',previous.schedule);
      previous.resizeObserver?.disconnect();
      previous.cleanupObserver?.disconnect();
    }

    doc.documentElement.dataset.arcoEmbedded = 'true';
    cleanupChild(view,doc);
    installChildStyle(view,doc);
    const progress = ensureChildProgress(view,doc);

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

  function installChildStyle(view,doc){
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
    doc.documentElement.style.setProperty('--arco-child-progress-ink',progressInk[view] || '#181818');
  }

  function ensureChildProgress(view,doc){
    let rail = doc.getElementById('arco-child-scrollbar');
    if (!rail){
      rail = doc.createElement('div');
      rail.id = 'arco-child-scrollbar';
      rail.className = 'arco-child-scrollbar';
      rail.setAttribute('aria-hidden','true');
      rail.innerHTML = '<span class="arco-child-scrollbar__fill"></span>';
      doc.body.appendChild(rail);
    }
    rail.style.setProperty('--arco-child-progress-ink',progressInk[view] || '#181818');
    return {rail,fill:rail.querySelector('.arco-child-scrollbar__fill')};
  }
})();
