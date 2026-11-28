/* ==========================================================================
   Legal Engineering: o acionador da demonstração (módulo ES).
   Em repouso, só isto: liga o relógio do RATIO à superfície vazia (#demonstracao).
   Nada da demonstração é carregado nem inicializado antes do clique. No clique:
     1. pede, em paralelo, o motor, os dados (import()) e o estilo da demonstração;
     2. a superfície grafite desce a partir da base do painel, empurrando o que
        vem depois, enquanto a página enquadra a superfície na viewport;
     3. só com a expansão concluída e os recursos carregados a reprodução começa.
   Ao encerrar, a superfície recolhe pelo movimento inverso e some.
   ========================================================================== */
const V = "20261128-confrontar";
const raiz = document.querySelector("[data-ld]");
const gatilho = document.querySelector("[data-ld-gatilho]");

if (raiz && gatilho) {
  const EN = (document.documentElement.lang || "").toLowerCase().startsWith("en");
  const TXT = EN
    ? { carregando: "Loading the demonstration", falha: "The demonstration could not be loaded.", regiao: "Legal Engineering demonstration" }
    : { carregando: "Carregando a demonstração", falha: "Não foi possível carregar a demonstração.", regiao: "Demonstração de Legal Engineering" };
  const reduz = matchMedia("(prefers-reduced-motion: reduce)");
  const home = raiz.closest(".hm") || document.body;
  const EASE = "cubic-bezier(.65,0,.35,1)";

  let estado = "repouso";          // repouso | abrindo | aberta | fechando
  let modulo = null;               // promessa do motor (com dados e estilo)
  let ctrl = null;                 // controle devolvido pelo motor
  let sup = null;

  /* ---------- carga sob demanda ---------- */
  /* o estilo da jornada e o do 4º estado (CERNE), na mesma carga */
  const estilo = (nome) => new Promise((res, rej) => {
    const href = new URL("./" + nome + ".css?v=" + V, import.meta.url).href;
    const ja = document.querySelector('link[data-ld-css="' + nome + '"]');
    if (ja) return res();
    const l = document.createElement("link");
    l.rel = "stylesheet"; l.href = href; l.dataset.ldCss = nome;
    l.onload = () => res(); l.onerror = () => { l.remove(); rej(new Error("css")); };
    document.head.append(l);
  });
  const carrega = () => {
    if (!modulo) {
      modulo = Promise.all([import("./demonstracao.js?v=" + V), estilo("demonstracao"), estilo("cerne")]).then(([m]) => m);
      modulo.catch(() => { modulo = null; });
    }
    return modulo;
  };

  /* ---------- medidas ---------- */
  const railH = () => {
    const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--rail-h"));
    return Number.isFinite(v) ? v : 0;
  };
  /* o lado do quadrado da retícula (largura da home / 8, como em arco-home.js):
     a superfície mede uma viewport útil; o espaço que ela ocupa na página
     fecha em quadrados inteiros, para que o painel seguinte pouse numa linha */
  const cell = () => home.getBoundingClientRect().width / 8 || 1;
  const fechaQuadrado = () => {
    if (!sup) return 0;
    const h = sup.offsetHeight, c = cell();
    return Math.ceil((h - .5) / c) * c;
  };
  const ajusta = () => {
    if (estado !== "aberta" || !sup) return;
    raiz.style.paddingBottom = Math.max(0, fechaQuadrado() - sup.offsetHeight) + "px";
  };
  addEventListener("resize", () => requestAnimationFrame(ajusta), { passive: true });

  const rola = (y) => scrollTo({ top: Math.max(0, y), behavior: reduz.matches ? "instant" : "smooth" });

  /* ---------- abrir ---------- */
  async function abre(inicio) {
    if (estado === "aberta") {
      /* já aberta (pelo cordão): vai ao capítulo e reenquadra a superfície */
      if (inicio && ctrl) ctrl.vai(inicio);
      rola(raiz.getBoundingClientRect().top + scrollY - railH());
      return;
    }
    if (estado !== "repouso") return;
    estado = "abrindo";
    const carga = carrega();
    gatilho.setAttribute("aria-expanded", "true");

    raiz.hidden = false;
    raiz.setAttribute("aria-label", TXT.regiao);
    sup = document.createElement("div");
    sup.className = "ld-sup";
    /* o CERNE desce já sem o grafite: a retícula da home é o fundo da folha */
    if (String(inicio || "").startsWith("cerne")) sup.dataset.cap = "cerne";
    raiz.replaceChildren(sup);
    const alvo = fechaQuadrado();

    /* enquadra a superfície e a faz descer ao mesmo tempo */
    rola(raiz.getBoundingClientRect().top + scrollY - railH());
    const desce = raiz.animate([{ height: "0px" }, { height: alvo + "px" }],
      { duration: reduz.matches ? 0 : 950, easing: EASE, fill: "forwards" });
    try { await desce.finished; } catch (_) { /* cancelada */ }
    raiz.style.height = "";
    raiz.style.paddingBottom = Math.max(0, alvo - sup.offsetHeight) + "px";
    desce.cancel();
    estado = "aberta";

    let aviso = null;
    const lento = setTimeout(() => {
      aviso = document.createElement("p");
      aviso.className = "ld-aviso";
      aviso.setAttribute("role", "status");
      aviso.textContent = TXT.carregando;
      aviso.style.cssText = "margin:0;padding:24px;font:600 .62rem/1.3 'Martian Mono',monospace;letter-spacing:.14em;text-transform:uppercase;color:inherit;opacity:.62";
      sup.append(aviso);
    }, 120);
    try {
      const m = await carga;
      clearTimeout(lento);
      aviso?.remove();
      if (estado !== "aberta") return;
      ctrl = m.cria({ raiz, sup, en: EN, inicio, fecha });
    } catch (err) {
      clearTimeout(lento);
      if (!aviso) { aviso = document.createElement("p"); aviso.className = "ld-aviso"; aviso.setAttribute("role", "status"); sup.append(aviso); }
      aviso.style.cssText = "margin:0;padding:24px;font:600 .62rem/1.3 'Martian Mono',monospace;letter-spacing:.14em;text-transform:uppercase;color:inherit";
      aviso.textContent = TXT.falha;
      const b = document.createElement("button");
      b.type = "button"; b.textContent = "×"; b.setAttribute("aria-label", EN ? "Close" : "Encerrar");
      b.style.cssText = "margin:0 24px;min-width:44px;min-height:44px;border:0;background:none;color:inherit;font:400 1.4rem/1 sans-serif;cursor:pointer";
      b.addEventListener("click", () => fecha());
      sup.append(b);
    }
  }

  /* ---------- fechar: o movimento inverso ---------- */
  async function fecha(destino) {
    if (estado !== "aberta") return;
    estado = "fechando";
    ctrl?.destroi();
    ctrl = null;
    const h = raiz.offsetHeight;
    raiz.style.paddingBottom = "";
    const alvoEl = destino ? document.getElementById(destino) : null;
    if (alvoEl) {
      /* o destino fica abaixo da superfície: a posição dele depois do recolhimento */
      rola(alvoEl.getBoundingClientRect().top + scrollY - h - railH());
    } else {
      const r = gatilho.getBoundingClientRect();
      const util = innerHeight - railH();
      rola(r.top + scrollY - railH() - Math.max(0, (util - r.height) / 2));
    }
    const sobe = raiz.animate([{ height: h + "px" }, { height: "0px" }],
      { duration: reduz.matches ? 0 : 800, easing: EASE, fill: "forwards" });
    try { await sobe.finished; } catch (_) { /* cancelada */ }
    raiz.hidden = true;
    raiz.replaceChildren();
    raiz.style.height = "";
    sobe.cancel();
    sup = null;
    gatilho.setAttribute("aria-expanded", "false");
    estado = "repouso";
    if (!alvoEl) gatilho.focus({ preventScroll: true });
  }

  gatilho.addEventListener("click", () => {
    if (estado === "repouso") abre();
    else if (estado === "aberta") ctrl?.foca();
  });
  /* RATIO e TROIA no cordão, e o foróptero do CERNE: abrem a demonstração já
     no capítulo (ou no passo, "cerne@3") lido no momento do clique */
  document.querySelectorAll("[data-ld-ir]").forEach((b) => b.addEventListener("click", () => {
    setTimeout(() => abre(b.dataset.ldIr), 0);
  }));
  gatilho.dataset.ldPronto = "";
}
