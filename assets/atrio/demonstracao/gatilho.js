/* ==========================================================================
   Legal Engineering e AI Governance: o acionador da demonstração (módulo ES).
   Em repouso, só isto: liga cada aparelho à sua superfície vazia.
     · relógio do RATIO (e RATIO/TROIA no cordão) → #demonstracao, a jornada
       ATRIO → RATIO → TROIA, logo abaixo do painel Legal Engineering;
     · foróptero do CERNE → #demonstracao-cerne, a rodada do CERNE, logo
       abaixo do foróptero, no painel AI Governance.
   Só uma superfície fica aberta: abrir uma fecha a outra antes. O fim da
   TROIA, que encaminha a minuta ao CERNE, também troca de superfície.
   Nada da demonstração é carregado nem inicializado antes do clique. No clique:
     1. pede, em paralelo, o motor, os dados (import()) e o estilo da demonstração;
     2. a superfície desce a partir do aparelho, empurrando o que vem depois,
        enquanto a página enquadra a superfície na viewport;
     3. só com a expansão concluída e os recursos carregados a reprodução começa.
   Ao encerrar, a superfície recolhe pelo movimento inverso e some.
   ========================================================================== */
const V = "20261128-foroptero";
const SUP = {
  jornada: { raiz: document.querySelector("[data-ld]"), gatilho: document.querySelector("[data-ld-gatilho]") },
  cerne: { raiz: document.querySelector("[data-ld-cerne]"), gatilho: document.querySelector("[data-cl-play]") }
};

if (SUP.jornada.raiz && SUP.jornada.gatilho) {
  const EN = (document.documentElement.lang || "").toLowerCase().startsWith("en");
  const TXT = EN
    ? { carregando: "Loading the demonstration", falha: "The demonstration could not be loaded.", jornada: "Legal Engineering demonstration", cerne: "CERNE round" }
    : { carregando: "Carregando a demonstração", falha: "Não foi possível carregar a demonstração.", jornada: "Demonstração de Legal Engineering", cerne: "Rodada do CERNE" };
  const reduz = matchMedia("(prefers-reduced-motion: reduce)");
  const home = SUP.jornada.raiz.closest(".hm") || document.body;
  const EASE = "cubic-bezier(.65,0,.35,1)";
  /* sem a superfície própria (página antiga), o CERNE desce na da jornada */
  const segDe = (inicio) => (String(inicio || "").startsWith("cerne") && SUP.cerne.raiz ? "cerne" : "jornada");

  let estado = "repouso";          // repouso | abrindo | aberta | fechando
  let seg = null;                  // superfície aberta: jornada | cerne
  let modulo = null;               // promessa do motor (com dados e estilo)
  let ctrl = null;                 // controle devolvido pelo motor
  let sup = null;
  const raizDe = () => SUP[seg]?.raiz;

  /* ---------- carga sob demanda ---------- */
  /* o estilo da jornada e o do CERNE, na mesma carga */
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
  /* o lado do quadrado da retícula (largura da home / 8, como em arco-home.js).
     A jornada fica entre painéis: o espaço que ela ocupa fecha em quadrados
     inteiros, para que o painel seguinte pouse numa linha. A do CERNE fica
     dentro do painel, e quem fecha os quadrados é o próprio painel. */
  const cell = () => home.getBoundingClientRect().width / 8 || 1;
  const fechaQuadrado = () => {
    if (!sup) return 0;
    const h = sup.offsetHeight;
    if (seg === "cerne") return h;
    const c = cell();
    return Math.ceil((h - .5) / c) * c;
  };
  /* painel em que a superfície está (a do CERNE): durante o movimento, as
     fileiras da grade ficam livres; depois, o painel volta a fechar em quadrados */
  const painel = (r) => (r && r !== SUP.jornada.raiz ? r.closest(".hm-panel") : null);
  const solta = (r) => { const p = painel(r); if (p) p.style.gridTemplateRows = ""; };
  const mede = (r) => { if (painel(r)) r.dispatchEvent(new CustomEvent("arco:medida", { bubbles: true })); };
  const ajusta = () => {
    const r = raizDe();
    if (estado !== "aberta" || !sup || !r) return;
    r.style.paddingBottom = Math.max(0, fechaQuadrado() - sup.offsetHeight) + "px";
    mede(r);
  };
  addEventListener("resize", () => requestAnimationFrame(ajusta), { passive: true });

  const rola = (y) => scrollTo({ top: Math.max(0, y), behavior: reduz.matches ? "instant" : "smooth" });
  const visivel = (el) => { const b = el.getBoundingClientRect(); return b.bottom > 0 && b.top < innerHeight; };

  /* ---------- abrir ---------- */
  async function abre(inicio) {
    const alvo = segDe(inicio);
    if (estado === "aberta" && seg === alvo) {
      /* já aberta (pelo cordão): vai ao capítulo e reenquadra a superfície */
      if (inicio && ctrl) ctrl.vai(inicio);
      rola(raizDe().getBoundingClientRect().top + scrollY - railH());
      return;
    }
    if (estado === "aberta") await fecha(null, { troca: true });
    if (estado !== "repouso") return;
    estado = "abrindo";
    seg = alvo;
    const { raiz, gatilho } = SUP[seg];
    const carga = carrega();
    gatilho.setAttribute("aria-expanded", "true");

    raiz.hidden = false;
    raiz.setAttribute("aria-label", TXT[seg]);
    sup = document.createElement("div");
    sup.className = "ld-sup";
    /* o CERNE desce já sem o grafite: a retícula da home é o fundo da folha */
    if (seg === "cerne" || String(inicio || "").startsWith("cerne")) sup.dataset.cap = "cerne";
    raiz.replaceChildren(sup);
    solta(raiz);
    const altura = fechaQuadrado();

    /* enquadra a superfície e a faz descer ao mesmo tempo */
    rola(raiz.getBoundingClientRect().top + scrollY - railH());
    const desce = raiz.animate([{ height: "0px" }, { height: altura + "px" }],
      { duration: reduz.matches ? 0 : 950, easing: EASE, fill: "forwards" });
    try { await desce.finished; } catch (_) { /* cancelada */ }
    raiz.style.height = "";
    raiz.style.paddingBottom = Math.max(0, altura - sup.offsetHeight) + "px";
    desce.cancel();
    estado = "aberta";
    mede(raiz);

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
      if (estado !== "aberta" || raizDe() !== raiz) return;
      /* troca: quando a reprodução pede o outro segmento (o fim da TROIA
         encaminha a minuta ao CERNE), esta superfície fecha e a outra abre */
      ctrl = m.cria({ raiz, sup, en: EN, inicio, fecha, troca: (ini) => setTimeout(() => abre(ini), 0) });
      mede(raiz);
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

  /* ---------- fechar: o movimento inverso ----------
     Encerrar devolve a página ao aparelho que abriu a superfície. Na troca
     (abrir a outra), a página não rola: quem enquadra é a abertura seguinte;
     se a superfície que fecha está fora da tela, recolhe sem animação. */
  async function fecha(destino, { troca = false } = {}) {
    if (estado !== "aberta") return;
    estado = "fechando";
    const { raiz, gatilho } = SUP[seg];
    ctrl?.destroi();
    ctrl = null;
    const h = raiz.offsetHeight;
    raiz.style.paddingBottom = "";
    solta(raiz);
    const alvoEl = !troca && seg === "jornada" && destino ? document.getElementById(destino) : null;
    if (troca) {
      /* nada: a abertura seguinte enquadra a outra superfície */
    } else if (alvoEl) {
      /* o destino fica abaixo da superfície: a posição dele depois do recolhimento */
      rola(alvoEl.getBoundingClientRect().top + scrollY - h - railH());
    } else {
      const ap = seg === "cerne" ? (gatilho.closest(".cl__inst") || gatilho) : gatilho;
      const r = ap.getBoundingClientRect();
      const util = innerHeight - railH();
      rola(r.top + scrollY - railH() - Math.max(0, (util - r.height) / 2));
    }
    const instante = reduz.matches || (troca && !visivel(raiz));
    const sobe = raiz.animate([{ height: h + "px" }, { height: "0px" }],
      { duration: instante ? 0 : 800, easing: EASE, fill: "forwards" });
    try { await sobe.finished; } catch (_) { /* cancelada */ }
    raiz.hidden = true;
    raiz.replaceChildren();
    raiz.style.height = "";
    sobe.cancel();
    mede(raiz);
    sup = null;
    gatilho.setAttribute("aria-expanded", "false");
    estado = "repouso";
    seg = null;
    if (!troca && !alvoEl) gatilho.focus({ preventScroll: true });
  }

  SUP.jornada.gatilho.addEventListener("click", () => {
    if (estado === "aberta" && seg === "jornada") ctrl?.foca();
    else abre();
  });
  /* RATIO e TROIA no cordão, e o foróptero do CERNE: abrem a demonstração já
     no capítulo (ou no passo, "cerne@3") lido no momento do clique */
  document.querySelectorAll("[data-ld-ir]").forEach((b) => b.addEventListener("click", () => {
    setTimeout(() => abre(b.dataset.ldIr), 0);
  }));
  SUP.jornada.gatilho.dataset.ldPronto = "";
}
