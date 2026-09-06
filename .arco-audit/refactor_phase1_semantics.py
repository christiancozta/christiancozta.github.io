from pathlib import Path

path = Path('assets/arco/js/arco-core.js')
text = path.read_text(encoding='utf-8')

anchor = """  const openStat = stat => {
"""
helpers = """  const exposeMobileDetails = () => {
    stats.forEach(stat => {
      const button = stat.querySelector('button.narr__n');
      const detail = stat.querySelector('.narr__detail');
      stat.classList.remove('is-open');
      if (detail){
        detail.hidden = false;
        detail.setAttribute('aria-hidden', 'false');
      }
      button?.setAttribute('aria-expanded', 'true');
    });
  };

  const closeDesktopDetails = () => {
    stats.forEach(stat => {
      const button = stat.querySelector('button.narr__n');
      const detail = stat.querySelector('.narr__detail');
      stat.classList.remove('is-open');
      if (detail){
        detail.hidden = true;
        detail.setAttribute('aria-hidden', 'true');
      }
      button?.setAttribute('aria-expanded', 'false');
    });
  };

"""
if text.count(anchor) != 1:
    raise SystemExit('openStat anchor not found exactly once')
text = text.replace(anchor, helpers + anchor, 1)

old_init = """  lockLegends();
  lockDetails();

  if (gateOpen){
"""
new_init = """  lockLegends();
  lockDetails();
  /* No carregamento já em mobile, o baseline expõe semanticamente os detalhes
     embora a cópia visual usada seja .narr__mobile-copy. */
  if (mq.matches) exposeMobileDetails();

  if (gateOpen){
"""
if text.count(old_init) != 1:
    raise SystemExit('initial detail state anchor not found')
text = text.replace(old_init, new_init, 1)

old_sync = """    if (event?.matches){
      if (legendTimer) clearTimeout(legendTimer);
      if (detailTimer) clearTimeout(detailTimer);
      clearLegendLock();
      clearPrematureDetailLockForMobile();
      return;
    }
    if (!detailsReady) lockDetails();
"""
new_sync = """    if (event?.matches){
      if (legendTimer) clearTimeout(legendTimer);
      if (detailTimer) clearTimeout(detailTimer);
      clearLegendLock();
      if (detailsReady || reduce) exposeMobileDetails();
      else clearPrematureDetailLockForMobile();
      return;
    }
    /* O hero-cross legado sempre fechava a semântica ao retornar ao desktop.
       Declaramos o mesmo efeito aqui antes de removê-lo no commit seguinte. */
    closeDesktopDetails();
    if (!detailsReady) lockDetails();
"""
if text.count(old_sync) != 1:
    raise SystemExit('syncMode detail state block not found')
text = text.replace(old_sync, new_sync, 1)

path.write_text(text, encoding='utf-8')
print('phase 1 breakpoint semantics staged')
