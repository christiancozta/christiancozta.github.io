(() => {
  'use strict';

  const fail = (message, error) => {
    if (error) console.error('[DATA loader]', error);
    document.body.innerHTML = `<main style="font:16px/1.5 system-ui,sans-serif;padding:40px;max-width:760px;margin:auto"><h1>DATA</h1><p>${message}</p></main>`;
  };

  const loadScript = (src) => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`Falha ao carregar ${src}`));
    document.head.appendChild(script);
  });

  const boot = async () => {
    if (!('DecompressionStream' in window)) {
      throw new Error('DecompressionStream indisponível');
    }

    const response = await fetch('data/bootstrap.js?v=20260831-etapa1', { cache: 'no-store' });
    if (!response.ok) throw new Error(`bootstrap.js retornou HTTP ${response.status}`);

    const source = await response.text();
    const match = source.match(/const payload = '([^']+)'/);
    if (!match) throw new Error('Payload de DATA não encontrado');

    const bytes = Uint8Array.from(atob(match[1]), (char) => char.charCodeAt(0));
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    const html = await new Response(stream).text();
    const parsed = new DOMParser().parseFromString(html, 'text/html');

    const externalScripts = [...parsed.querySelectorAll('script[src]')].map((node) => node.getAttribute('src'));
    parsed.querySelectorAll('script[src]').forEach((node) => node.remove());

    document.documentElement.lang = parsed.documentElement.lang || 'pt-BR';
    document.head.innerHTML = parsed.head.innerHTML;
    document.body.innerHTML = parsed.body.innerHTML;

    for (const src of externalScripts) {
      const resolved = new URL(src, window.location.href).href;
      await loadScript(resolved);
    }
  };

  boot().catch((error) => {
    fail('Não foi possível carregar DATA.', error);
  });
})();
