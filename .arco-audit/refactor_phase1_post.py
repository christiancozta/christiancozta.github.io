from pathlib import Path

path = Path('assets/arco/js/arco-core.js')
text = path.read_text(encoding='utf-8')
old = """  const beginDesktopRequest = () => {
    if (mq.matches) return;
    if (!played){
      played = true;
      home.classList.add('narr-on');
      layout();
    }
    startLine();
  };
"""
new = """  const beginDesktopRequest = () => {
    if (mq.matches) return;
    if (!played){
      played = true;
      home.classList.add('narr-on');
      layout();
      /* Baseline: se o arco ja assentou antes do primeiro gesto, o play entra
         no frame seguinte ao pedido, depois da passada de layout. */
      requestAnimationFrame(startLine);
      return;
    }
    startLine();
  };
"""
if text.count(old) != 1:
    raise SystemExit('phase 1 beginDesktopRequest block not found exactly once')
path.write_text(text.replace(old, new, 1), encoding='utf-8')
print('phase 1 timing correction staged')
