/* The public Markdown files are the complete, canonical technical sheets. */
(() => {
  "use strict";
  const keys = ['atrio', 'corpus', 'ratio', 'cerne', 'lux'];
  const base = new URL('../docs/', document.currentScript.src);
  let dialog, body, title, download, lastTrigger;
  let requestId = 0;
  const cache = new Map();
  const plain = value => value.replace(/\*/g, '').trim();
  function createDialog() {
    dialog = document.createElement('dialog');
    dialog.className = 'technical-sheet';
    dialog.setAttribute('aria-labelledby', 'technical-sheet-title');
    const header = document.createElement('header');
    header.className = 'technical-sheet__header';
    title = document.createElement('h2');
    title.id = 'technical-sheet-title';
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'Fechar';
    close.addEventListener('click', () => dialog.close());
    header.append(title, close);
    body = document.createElement('div');
    body.className = 'technical-sheet__body';
    body.setAttribute('aria-live', 'polite');
    download = document.createElement('a');
    download.textContent = 'Abrir ficha original em Markdown';
    dialog.append(header, body, download);
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const controls = [...dialog.querySelectorAll('button,a[href]')];
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    });
    dialog.addEventListener('close', () => {
      requestId++;
      lastTrigger?.focus({preventScroll:true});
    });
    dialog.addEventListener('click', event => { if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    }});
    document.body.append(dialog);
  }
  function render(markdown) {
    const fragment = document.createDocumentFragment();
    const list = document.createElement('dl');
    markdown.split(/\r?\n/).forEach(line => {
      if (line.startsWith('|') && !/^\|[-|\s]+$/.test(line)) {
        const cells = line.split('|').slice(1, -1).map(plain);
        for (let i = 0; i + 1 < cells.length; i += 2) {
          const row = document.createElement('div');
          const term = document.createElement('dt');
          const definition = document.createElement('dd');
          term.textContent = cells[i]; definition.textContent = cells[i + 1];
          row.append(term, definition); list.append(row);
        }
      } else if (line.trim() && !line.startsWith('#') && !line.startsWith('|')) {
        const p = document.createElement('p'); p.textContent = plain(line); fragment.append(p);
      }
    });
    // Source legend first, followed by all ten fields and the authorship note.
    fragment.insertBefore(list, fragment.children[1] || null);
    body.replaceChildren(fragment);
  }
  document.addEventListener('click', async event => {
    const trigger = event.target.closest('a[data-technical-sheet]');
    if (!trigger || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!keys.includes(trigger.dataset.technicalSheet)) return;
    event.preventDefault();
    if (!dialog) createDialog();
    lastTrigger = trigger;
    const currentRequest = ++requestId;
    const url = new URL(`FT_${trigger.dataset.technicalSheet.toUpperCase()}.md`, base).href;
    title.textContent = `${trigger.dataset.technicalSheet.toUpperCase()}: ficha técnica`;
    download.href = url;
    body.textContent = 'Carregando ficha técnica…';
    dialog.showModal();
    dialog.scrollTop = 0;
    try {
      let source = cache.get(url);
      if (!source) {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Ficha indisponível');
        source = await response.text(); cache.set(url, source);
      }
      if (currentRequest === requestId && dialog.open) render(source);
    } catch {
      if (currentRequest === requestId && dialog.open) body.textContent = 'Não foi possível carregar a visualização. Use o acesso à ficha original abaixo.';
    }
  });
})();
