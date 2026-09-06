(() => {
  'use strict';

  const home = document.querySelector('.view[data-view="home"] .home');
  const arc = home?.querySelector('.narr-zone .arc');
  const spring = arc?.querySelector('.spring');
  const stats = [...(home?.querySelectorAll('.narr__stat') || [])];
  const titles = [...(home?.querySelectorAll('.arcade > .mov > .mov__h') || [])];
  if (!home || !arc || !spring || stats.length !== 5 || titles.length !== 3) return;

  const numbers = stats.map(stat => stat.querySelector('.narr__n'));
  if (numbers.some(node => !node)) return;

  const mq = matchMedia('(max-width:820px)');
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  let axis = home.querySelector('.mobile-arrow-axis');
  if (!axis){
    axis = document.createElement('span');
    axis.className = 'mobile-arrow-axis';
    axis.setAttribute('aria-hidden','true');
    home.appendChild(axis);
  }
  axis.dataset.viewportControlled = 'true';

  if (!document.getElementById('arco-mobile-viewport-style')){
    const style = document.createElement('style');
    style.id = 'arco-mobile-viewport-style';
    style.textContent = `
@media (max-width:820px){
  .home.mobile-arrow-viewport.mobile-arrow-ready .narr__stat{
    opacity:0!important;
    transform:translateY(4px)!important;
    transition:none!important;
  }
  .home.mobile-arrow-viewport.mobile-arrow-ready .narr__stat[data-arrow-seen="true"]{
    opacity:1!important;
    transform:none!important;
    transition:opacity 420ms var(--ease),transform 420ms var(--ease)!important;
    transition-delay:0ms!important;
  }
  .home.mobile-arrow-viewport .narr__n::before{
    transform:scaleX(0)!important;
    transition:none!important;
  }
  .home.mobile-arrow-viewport .narr__stat[data-arrow-seen="true"] .narr__n::before{
    transform:scaleX(1)!important;
    transition:transform 280ms var(--ease)!important;
    transition-delay:0ms!important;
  }
  .home.mobile-arrow-viewport .arcade .mov__h::before{
    transform:scaleX(0)!important;
    transition:none!important;
  }
  .home.mobile-arrow-viewport .arcade .mov__h[data-arrow-seen="true"]::before{
    transform:scaleX(1)!important;
    transition:transform 300ms var(--ease)!important;
    transition-delay:0ms!important;
  }
  .home.mobile-arrow-viewport .mobile-arrow-axis{
    transition:height 360ms linear!important;
  }
}
@media (max-width:820px) and (prefers-reduced-motion:reduce){
  .home.mobile-arrow-viewport .mobile-arrow-axis,
  .home.mobile-arrow-viewport .narr__stat,
  .home.mobile-arrow-viewport .narr__n::before,
  .home.mobile-arrow-viewport .arcade .mov__h::before{
    transition:none!important;
  }
}`;
    document.head.appendChild(style);
  }

  const checkpoints = [
    ...stats.map((stat, i) => ({node:stat, anchor:numbers[i]})),
    ...titles.map(title => ({node:title, anchor:title}))
  ];

  let requested = reduce || home.classList.contains('mobile-arrow-on');
  let gateOpen = reduce;
  let active = false;
  let observer = null;
  let raf = 0;
  let currentIndex = -1;
  let gateTimer = 0;
  let gateArmed = false;

  function layoutBox(el){
    let x = 0, y = 0, node = el;
    while (node && node !== home){
      x += node.offsetLeft || 0;
      y += node.offsetTop || 0;
      node = node.offsetParent;
    }
    if (node === home){
      return {x, y, width:el.offsetWidth || 0, height:el.offsetHeight || 0};
    }
    const hr = home.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return {x:r.left-hr.left, y:r.top-hr.top, width:r.width, height:r.height};
  }

  function stopLegacyAnimation(){
    axis.getAnimations?.().forEach(animation => animation.cancel());
  }

  function measure(){
    if (!mq.matches) return null;
    const ab = layoutBox(arc);
    const last = layoutBox(titles[titles.length - 1]);
    if (!ab.width || !last.width) return null;

    const x = ab.x;
    const top = ab.y + ab.height;
    const end = last.y + last.height / 2;
    const fullHeight = Math.max(1, end - top);

    home.style.setProperty('--mobile-arrow-x', x.toFixed(2) + 'px');
    home.style.setProperty('--mobile-arrow-top', top.toFixed(2) + 'px');
    home.style.setProperty('--mobile-arrow-h', fullHeight.toFixed(2) + 'px');

    const ys = checkpoints.map(point => {
      const b = layoutBox(point.anchor);
      return b.y + b.height / 2;
    });
    const reached = currentIndex >= 0
      ? Math.max(0, Math.min(fullHeight, ys[currentIndex] - top))
      : 0;

    stopLegacyAnimation();
    axis.style.height = reached.toFixed(2) + 'px';
    return {top, fullHeight, ys, reached};
  }

  function revealThrough(index){
    if (!active || index <= currentIndex) return;
    currentIndex = Math.min(index, checkpoints.length - 1);
    checkpoints.forEach((point, i) => {
      if (i <= currentIndex) point.node.dataset.arrowSeen = 'true';
    });
    measure();
  }

  function installObserver(){
    observer?.disconnect();
    if (!active || reduce || !('IntersectionObserver' in window)){
      if (active) revealThrough(checkpoints.length - 1);
      return;
    }

    observer = new IntersectionObserver(entries => {
      let furthest = currentIndex;
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const index = checkpoints.findIndex(point => point.node === entry.target);
        if (index > furthest) furthest = index;
      });
      if (furthest > currentIndex) revealThrough(furthest);
    }, {threshold:.12, rootMargin:'0px 0px -8% 0px'});

    checkpoints.forEach(point => observer.observe(point.node));
  }

  function prepareMobile(){
    if (!mq.matches) return;
    home.classList.add('mobile-arrow-ready','mobile-arrow-viewport');
    axis.hidden = false;
    stopLegacyAnimation();
    measure();
  }

  function startMobile(){
    if (!mq.matches || !requested || !gateOpen) return;
    prepareMobile();
    if (active) return;
    active = true;
    home.classList.add('mobile-arrow-on');
    if (reduce){
      revealThrough(checkpoints.length - 1);
    } else {
      installObserver();
    }
  }

  function leaveMobile(){
    active = false;
    observer?.disconnect();
    observer = null;
    stopLegacyAnimation();
    axis.hidden = true;
    home.classList.remove('mobile-arrow-viewport');
  }

  function scheduleMeasure(){
    if (!mq.matches) return;
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => {
        raf = 0;
        prepareMobile();
        if (active) installObserver();
      });
    });
  }

  const timeList = value => value.split(',').map(item => {
    const token = item.trim();
    if (token.endsWith('ms')) return parseFloat(token) || 0;
    if (token.endsWith('s')) return (parseFloat(token) || 0) * 1000;
    return 0;
  });

  function transitionBudget(el){
    const cs = getComputedStyle(el);
    const durations = timeList(cs.transitionDuration);
    const delays = timeList(cs.transitionDelay);
    const n = Math.max(durations.length, delays.length, 1);
    let max = 0;
    for (let i = 0; i < n; i++){
      max = Math.max(max,
        (durations[i % durations.length] || 0) +
        (delays[i % delays.length] || 0));
    }
    return max;
  }

  function springSettled(){
    if (!arc.classList.contains('is-in')) return false;
    const value = parseFloat(getComputedStyle(spring).strokeDashoffset);
    return Number.isFinite(value) ? Math.abs(value) < .5 : false;
  }

  function openGate(){
    if (gateOpen) return;
    gateOpen = true;
    if (gateTimer) clearTimeout(gateTimer);
    startMobile();
  }

  function armGate(){
    if (gateOpen || gateArmed || !arc.classList.contains('is-in')) return;
    gateArmed = true;
    if (springSettled()){
      openGate();
      return;
    }
    const finish = event => {
      if (event.target !== spring) return;
      if (event.propertyName && event.propertyName !== 'stroke-dashoffset') return;
      spring.removeEventListener('transitionend', finish);
      spring.removeEventListener('transitioncancel', finish);
      openGate();
    };
    spring.addEventListener('transitionend', finish);
    spring.addEventListener('transitioncancel', finish);
    gateTimer = setTimeout(openGate, Math.max(60, transitionBudget(spring) + 80));
  }

  const arcObserver = new MutationObserver(() => armGate());
  arcObserver.observe(arc, {attributes:true, attributeFilter:['class']});
  armGate();

  const EVENTS = ['scroll','wheel','pointerdown','pointermove','keydown','touchstart'];
  const request = () => {
    requested = true;
    if (mq.matches){
      stopLegacyAnimation();
      axis.style.height = currentIndex >= 0 ? axis.style.height : '0px';
      prepareMobile();
      startMobile();
    }
  };
  EVENTS.forEach(type => addEventListener(type, request, {passive:true}));

  mq.addEventListener?.('change', event => {
    if (event.matches){
      prepareMobile();
      startMobile();
      scheduleMeasure();
    } else {
      leaveMobile();
    }
  });

  addEventListener('resize', scheduleMeasure, {passive:true});
  addEventListener('orientationchange', scheduleMeasure, {passive:true});
  document.fonts?.ready.then(scheduleMeasure);

  if (typeof ResizeObserver === 'function'){
    const ro = new ResizeObserver(scheduleMeasure);
    ro.observe(home);
    ro.observe(arc);
    stats.forEach(node => ro.observe(node));
    titles.forEach(node => ro.observe(node));
  }

  if (mq.matches){
    prepareMobile();
    if (reduce){
      requested = true;
      gateOpen = true;
      startMobile();
    }
  } else {
    axis.hidden = true;
  }
})();