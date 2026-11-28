/* ==========================================================================
   Legal Engineering: a demonstração (módulo ES, importado só no clique).
   ATRIO → RATIO → TROIA numa só superfície, em reprodução automática de uma
   execução registrada (caso 0012345, fictício). Nada aqui é inferência em
   tempo real: os outputs vêm de dados.js e são revelados por palavras
   inteiras, no ritmo de leitura.

   Arquitetura
   - PASSOS: a linha do tempo inteira, passo a passo. Cada passo sabe se
     executar animado (ctx animado) ou de uma vez (ctx instantâneo). Ir a um
     passo = remontar a cena do capítulo, aplicar de uma vez os passos
     anteriores do mesmo capítulo e animar o passo pedido. Assim Avançar,
     Retroceder e a navegação pelas fases dão sempre o mesmo estado.
   - Tempo: todos os intervalos e animações (Web Animations) passam por ele;
     pausar congela os dois, encerrar cancela tudo.
   - Movimento reduzido: nada se desloca; textos aparecem inteiros; as pausas
     de leitura permanecem, e os controles dão acesso a todos os outputs.
   ========================================================================== */
import D from "./dados.js?v=20261128-feixes";

const PARA = Symbol("para");
const ACC = "#A63A23";
const EASE = "cubic-bezier(.32,.72,0,1)";
const EASE_IO = "cubic-bezier(.65,0,.35,1)";
const reduz = matchMedia("(prefers-reduced-motion: reduce)");
/* os voos dos dados (do documento à lista, da lista ao cofre) pedem documento e
   custódia lado a lado; em coluna única, os dados aparecem no lugar de destino */
const largo = matchMedia("(min-width: 901px)");

/* ---------- DOM ---------- */
function h(tag, attrs, ...filhos) {
  const el = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "text") el.textContent = v;
    else if (k === "html") el.innerHTML = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (k === "style") el.style.cssText = v;
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const f of filhos.flat()) if (f != null && f !== false) el.append(f instanceof Node ? f : document.createTextNode(f));
  return el;
}
/* só as etiquetas da taxonomia de pseudonimização (identificadores de fase,
   como RI_01, ficam como texto) */
const ETIQUETAS = new Set(Object.values(D.dados).map((d) => d.etiqueta));
const ETIQUETA = /^([A-Z]+(?:_[A-Z]+)*_\d{2})(.*)$/;
const etiqueta = (t) => h("span", { class: "ld-tag" }, t);
/* uma palavra: texto, ou etiqueta de pseudonimização seguida da pontuação */
function palavra(w) {
  const m = w.match(ETIQUETA);
  if (!m || !ETIQUETAS.has(m[1])) return document.createTextNode(w);
  const f = document.createDocumentFragment();
  f.append(etiqueta(m[1]));
  if (m[2]) f.append(m[2]);
  return f;
}
const solta = (p) => { p?.catch?.(() => {}); };
const conta = (t) => String(t).split(/\s+/).filter(Boolean).length;
const dois = (n) => String(n).padStart(2, "0");
const WM = { atrio: "A<em>T</em>RIO", ratio: "R<em>A</em>TIO", troia: "T<em>R</em>OIA" };
const NOME = { atrio: "ATRIO", ratio: "RATIO", troia: "TROIA" };

/* ícones dos controles (traço do site, sem ornamento) */
const ICO = {
  pausa: '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="5" y="4" width="3" height="12"/><rect x="12" y="4" width="3" height="12"/></svg>',
  toca: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 4l10 6-10 6z"/></svg>',
  volta: '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="4" y="4" width="2" height="12"/><path d="M16 4L8 10l8 6z"/></svg>',
  segue: '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="14" y="4" width="2" height="12"/><path d="M4 4l8 6-8 6z"/></svg>',
  fecha: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
  recomeca: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M15.5 10a5.5 5.5 0 1 1-1.9-4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M15.6 2.8v4.6H11z"/></svg>'
};

/* ---------- tempo: intervalos e animações que pausam juntos ---------- */
class Tempo {
  constructor() { this.pausado = false; this.timers = new Set(); this.anims = new Set(); }
  espera(ms) {
    return new Promise((res, rej) => {
      const t = { resta: Math.max(0, ms), ini: 0, id: 0, rej };
      t.arma = () => { t.ini = performance.now(); t.id = setTimeout(() => { this.timers.delete(t); res(); }, t.resta); };
      this.timers.add(t);
      if (!this.pausado) t.arma();
    });
  }
  registra(a) {
    this.anims.add(a);
    const sai = () => this.anims.delete(a);
    a.addEventListener("finish", sai); a.addEventListener("cancel", sai);
    if (this.pausado) a.pause();
    return a;
  }
  pausa() {
    if (this.pausado) return;
    this.pausado = true;
    const agora = performance.now();
    for (const t of this.timers) { clearTimeout(t.id); t.resta = Math.max(0, t.resta - (agora - t.ini)); }
    for (const a of this.anims) if (a.playState === "running") a.pause();
  }
  retoma() {
    if (!this.pausado) return;
    this.pausado = false;
    for (const t of this.timers) t.arma();
    for (const a of this.anims) if (a.playState === "paused") a.play();
  }
  aborta() {
    for (const t of this.timers) { clearTimeout(t.id); t.rej(PARA); }
    this.timers.clear();
    for (const a of [...this.anims]) a.cancel();
    this.anims.clear();
  }
  get ativo() { return this.timers.size > 0 || this.anims.size > 0; }
}

export function cria({ raiz, sup, en, inicio, fecha }) {
  const L = en ? D.en : D.pt;
  const U = L.ui;
  const tempo = new Tempo();

  /* ---------- casca: cabeçalho, palco, rodapé ---------- */
  const wm = h("p", { class: "ld-wm", "aria-hidden": "true" });
  const opN = h("span", { class: "ld-cab__n" });
  const opNome = h("span", { class: "ld-cab__nome" });
  const opLinha = h("span", { class: "ld-cab__linha" });
  const titulo = h("h2", { class: "ld-cab__op", id: "ld-op", tabindex: "-1" }, h("span", { class: "arx-sr ld-cab__mod" }), opN, opNome);
  const caps = ["atrio", "ratio", "troia"].map((c) =>
    h("li", null, h("button", { type: "button", class: "ld-per__b", "data-cap": c, onclick: () => vaiCap(c) }, NOME[c])));
  const percurso = h("ol", { class: "ld-per", "aria-label": U.percurso }, caps);
  const bt = (nome, ico, rot, fn) => h("button", { type: "button", class: "ld-ctl__b", "data-ctl": nome, "aria-label": rot, title: rot, onclick: fn, html: ico + '<span class="ld-ctl__t">' + rot + "</span>" });
  const bVolta = bt("volta", ICO.volta, U.retroceder, () => passoRel(-1));
  const bToca = bt("toca", ICO.pausa, U.pausar, () => alterna());
  const bSegue = bt("segue", ICO.segue, U.avancar, () => passoRel(1));
  const bFecha = bt("fecha", ICO.fecha, U.encerrar, () => fecha());
  /* Desgovernar: o atalho que salta o percurso e pousa no estado final. A
     chegada diz o que o atalho não apaga: o rastro de cada passagem. */
  const bDesg = h("button", { type: "button", class: "ld-desg", "aria-label": U.desgovernarRot, title: U.desgovernarRot, onclick: () => desgoverna() }, U.desgovernar);
  const ctl = h("div", { class: "ld-ctl", role: "group", "aria-label": U.teclas },
    h("div", { class: "ld-ctl__ic" }, bVolta, bToca, bSegue, bFecha), bDesg);
  const cab = h("header", { class: "ld-cab" },
    h("div", { class: "ld-cab__id" }, wm, h("div", null, titulo, opLinha)),
    percurso, ctl);
  const palco = h("div", { class: "ld-palco" });
  const contador = h("span", { class: "ld-pe__n" });
  const pe = h("footer", { class: "ld-pe" },
    h("span", { class: "ld-pe__reg" }, U.registro), h("span", null, U.caso), contador);
  const vivo = h("p", { class: "arx-sr", "aria-live": "polite" });
  const casca = h("div", { class: "ld-in", role: "region", "aria-label": U.regiao, tabindex: "-1" }, cab, palco, pe, vivo);
  sup.replaceChildren(casca);
  sup.dataset.estado = "tocando";

  const anuncia = (t) => { vivo.textContent = ""; requestAnimationFrame(() => { vivo.textContent = t; }); };

  /* ---------- contextos de execução ---------- */
  let ger = 0;
  function ctxAnimado(g) {
    const vivoG = () => { if (g !== ger) throw PARA; };
    const c = {
      anim: true,
      get mov() { return !reduz.matches; },
      get voo() { return !reduz.matches && largo.matches; },
      async espera(ms) { vivoG(); await tempo.espera(ms); vivoG(); },
      /* anima a partir dos quadros dados até o estado natural do elemento */
      async anima(el, quadros, o = {}) {
        vivoG();
        if (!c.mov || !el.isConnected) return;
        const a = tempo.registra(el.animate(quadros, { duration: 500, easing: EASE, fill: "backwards", ...o }));
        try { await a.finished; } catch (_) { throw PARA; }
        vivoG();
      },
      entra(el, o = {}) {
        return c.anima(el, [{ opacity: 0, transform: "translateY(" + (o.y ?? 10) + "px)" }, { opacity: 1, transform: "none" }], { duration: o.dur ?? 520, delay: o.delay ?? 0 });
      },
      /* revela por palavras inteiras; vírgula e ponto alongam a pausa */
      async palavras(el, texto, o = {}) {
        vivoG();
        const ws = String(texto).split(/[ \t\n]+/).filter(Boolean);
        const wps = o.wps ?? 5;
        if (!c.mov) {
          ws.forEach((w, i) => { if (i) el.append(" "); el.append(palavra(w)); });
          if (o.rolar) o.rolar();
          await c.espera(o.leituraInteira ?? ws.length * 230);
          return ws.length;
        }
        el.dataset.formando = "";
        el.setAttribute("aria-busy", "true");
        const base = 1000 / wps;
        try {
          for (let i = 0; i < ws.length; i++) {
            if (i) el.append(" ");
            el.append(palavra(ws[i]));
            if (o.rolar) o.rolar();
            const fim = ws[i].slice(-1);
            const extra = wps > 10 ? 0 : (".:;?!".includes(fim) ? base * 1.4 : fim === "," ? base * .5 : 0);
            await c.espera(base + extra);
          }
        } finally { delete el.dataset.formando; el.removeAttribute("aria-busy"); }
        return ws.length;
      },
      leitura(n, min = 900) { return c.espera(Math.min(4200, min + n * 90)); }
    };
    return c;
  }
  const INST = {
    anim: false, mov: false, voo: false,
    espera: async () => {}, anima: async () => {}, entra: async () => {},
    async palavras(el, texto, o = {}) {
      String(texto).split(/[ \t\n]+/).filter(Boolean).forEach((w, i) => { if (i) el.append(" "); el.append(palavra(w)); });
      if (o.rolar) o.rolar(true);
      return 0;
    },
    leitura: async () => {}
  };
  /* rola um contêiner até mostrar o elemento, sem mexer na página */
  function mostra(cont, el, ctx, folga = 24) {
    const rola = (c) => c && c.scrollHeight > c.clientHeight + 1;
    if (!rola(cont)) cont = rola(palco) && getComputedStyle(palco).overflowY === "auto" ? palco : null;
    if (!cont || !el) return;
    const rc = cont.getBoundingClientRect(), re = el.getBoundingClientRect();
    let alvo = cont.scrollTop;
    if (re.bottom > rc.bottom - folga) alvo += re.bottom - rc.bottom + folga;
    if (re.top < rc.top + folga) alvo -= rc.top + folga - re.top;
    cont.scrollTo({ top: alvo, behavior: ctx && ctx.mov ? "smooth" : "instant" });
  }

  /* ======================================================================
     Peças de documento: o recurso (A4) e a minuta
     ====================================================================== */
  function pagina(blocos, pseudo) {
    const pg = h("div", { class: "ld-pag", lang: "pt-BR" });
    const fl = h("div", { class: "ld-pag__in" });
    pg.append(fl);
    const dado = (id) => {
      const d = D.dados[id];
      const s = h("span", { class: "ld-d", "data-d": id });
      if (pseudo) { s.classList.add("is-tag"); s.append(etiqueta(d.etiqueta)); }
      else s.textContent = d.original;
      return s;
    };
    for (const b of blocos) {
      if (b.k === "titulo") fl.append(h("p", { class: "ld-pag__tit" }, b.t));
      else if (b.k === "campo") fl.append(h("p", { class: "ld-pag__campo" }, h("span", { class: "ld-pag__rot" }, b.rotulo), dado(b.d)));
      else if (b.k === "secao") fl.append(h("p", { class: "ld-pag__sec" }, b.t));
      else if (b.k === "texto") fl.append(h("p", { class: "ld-pag__txt" }, b.t));
      else if (b.k === "pe") fl.append(h("p", { class: "ld-pag__pe" }, b.t));
      else if (b.k === "linhas") {
        const par = h("div", { class: "ld-pag__par" + (b.classe ? " ld-pag__par--" + b.classe : "") });
        for (const ln of b.linhas) {
          const nums = ln.filter((x) => typeof x === "number");
          const curta = nums.length === ln.length && nums.reduce((a, x) => a + x, 0) < 70;
          const l = h("div", { class: "ld-l" });
          for (const x of ln) {
            if (typeof x === "number") l.append(h("i", { class: "ld-b", style: curta ? "flex:none;width:" + x + "%" : "flex:" + x + " 1 0" }));
            else if (x[0] === "@") l.append(dado(x.slice(1)));
            else l.append(h("span", { class: "ld-w" }, x.slice(1)));
          }
          par.append(l);
        }
        fl.append(par);
      }
    }
    return pg;
  }
  function paginas(pseudo) {
    return h("div", { class: "ld-pags" }, D.recurso.map((b) => pagina(b, pseudo)));
  }
  /* a minuta inteira; com trechos, as passagens confrontadas pela TROIA ficam marcáveis */
  function minutaPar(p, trechos) {
    const el = h("p", { class: "ld-min__p" + (p.ementa ? " is-ementa" : "") + (p.dispositivo ? " is-disp" : "") });
    if (!trechos) { el.textContent = p.t; return el; }
    const achados = Object.entries(trechos).map(([id, t]) => ({ id, t, i: p.t.indexOf(t) })).filter((x) => x.i >= 0).sort((a, b) => a.i - b.i);
    let pos = 0;
    for (const a of achados) {
      el.append(p.t.slice(pos, a.i), h("span", { class: "ld-min__trecho", "data-lente": a.id }, a.t));
      pos = a.i + a.t.length;
    }
    el.append(p.t.slice(pos));
    return el;
  }
  function marca(el, alvo) {
    const t = el.textContent, i = t.indexOf(alvo);
    if (i < 0) return null;
    const m = h("mark", { class: "ld-mk" }, alvo);
    el.replaceChildren(t.slice(0, i), m, t.slice(i + alvo.length));
    return m;
  }

  /* blocos de manifestação: IA (texto aberto sobre o grafite) e humano (registro em moldura) */
  const quemIA = (mod) => h("p", { class: "ld-quem ld-quem--ia" }, h("i", { "aria-hidden": "true" }), U.ia + " · " + mod);
  function blocoHumano(texto, nota) {
    return h("div", { class: "ld-hum" },
      h("p", { class: "ld-quem ld-quem--hum" }, h("b", null, U.humano), h("span", null, U.humanoReg)),
      h("p", { class: "ld-hum__t" }, texto),
      nota ? h("p", { class: "ld-hum__nota" }, nota) : null);
  }

  /* ======================================================================
     ATRIO · documental, mecânico, preciso
     ====================================================================== */
  const A = L.atrio;
  function montaAtrio() {
    const rotDoc = h("p", { class: "ld-rot" }, A.documento);
    const pags = paginas(false);
    const docs = h("div", { class: "ld-at__docs" }, h("div", { class: "ld-at__rots" }, rotDoc, h("p", { class: "ld-nota" }, U.ilustrativo)), h("div", { class: "ld-at__mesa" }, pags));
    const etapa = h("p", { class: "ld-at__etapa" });
    const desc = h("p", { class: "ld-at__desc" });
    const cont = h("p", { class: "ld-at__cont" });
    const ocorr = [...pags.querySelectorAll(".ld-d")].map((el) => ({ id: el.dataset.d, el }));
    const ids = [...new Set(ocorr.map((o) => o.id))];
    const vezes = (id) => ocorr.filter((o) => o.id === id).length;
    const linhasOrig = {};
    const lista = h("ul", { class: "ld-orig__l" }, ids.map((id) => {
      const li = h("li", { "data-d": id }, h("span", { class: "ld-dado" }, D.dados[id].original), vezes(id) > 1 ? h("span", { class: "ld-orig__x" }, "×" + vezes(id)) : null);
      linhasOrig[id] = li;
      return li;
    }));
    const orig = h("div", { class: "ld-orig", hidden: true }, h("p", { class: "ld-rot" }, A.originais), lista);
    const linhasCofre = {};
    const corpo = h("table", { class: "ld-cofre__tab" },
      h("thead", null, h("tr", null, h("th", { scope: "col" }, A.colOriginal), h("th", { scope: "col" }, A.colEtiqueta))),
      h("tbody", null, ids.map((id) => {
        const tr = h("tr", { "data-d": id }, h("td", null, h("span", { class: "ld-dado" }, D.dados[id].original)), h("td", null, etiqueta(D.dados[id].etiqueta)));
        linhasCofre[id] = tr;
        return tr;
      })));
    const corpoBox = h("div", { class: "ld-cofre__corpo" }, corpo);
    const estadoCofre = h("p", { class: "ld-cofre__estado" });
    const cofre = h("div", { class: "ld-cofre", hidden: true },
      h("div", { class: "ld-cofre__cab" }, h("p", { class: "ld-cofre__t" }, A.cofre), h("p", { class: "ld-cofre__sub" }, A.cofreSub)),
      corpoBox, estadoCofre);
    const vaga = h("div", { class: "ld-pasta__vaga" });
    const pasta = h("div", { class: "ld-pasta", hidden: true },
      h("div", { class: "ld-pasta__cab" }, h("p", { class: "ld-pasta__t" }, A.pasta), h("p", { class: "ld-pasta__sub" }, A.pastaSub)), vaga);
    const custodia = h("div", { class: "ld-at__cust" }, orig, pasta, cofre);
    const lado = h("div", { class: "ld-at__lado" }, h("div", { class: "ld-at__leg" }, etapa, desc, cont), custodia);
    const root = h("div", { class: "ld-cena ld-at" }, docs, lado);
    palco.replaceChildren(root);
    return { cap: "atrio", root, rotDoc, pags, etapa, desc, cont, ocorr, ids, linhasOrig, linhasCofre, orig, lista, cofre, corpoBox, estadoCofre, pasta, vaga, custodia, voos: [] };
  }
  const rel = (S, el) => {
    const R = S.root.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { x: r.left - R.left, y: r.top - R.top, w: r.width, h: r.height };
  };
  async function legenda(S, k, ctx) {
    const [e, d] = A.etapas[k];
    S.etapa.replaceChildren(h("span", { class: "ld-at__en" }, dois(k + 1)), e);
    S.desc.textContent = d;
    await ctx.entra(S.etapa, { y: 6, dur: 380 });
    await ctx.entra(S.desc, { y: 6, dur: 380 });
  }
  /* FLIP: muda o leiaute e anima cada elemento da posição antiga para a nova */
  async function flip(ctx, els, muda, dur = 700) {
    const antes = els.map((el) => el.getBoundingClientRect());
    muda();
    if (!ctx.mov) return;
    const ps = els.map((el, i) => {
      const a = antes[i], b = el.getBoundingClientRect();
      if (!b.width || !a.width) return null;
      const s = a.width / b.width;
      return ctx.anima(el, [{ transformOrigin: "0 0", transform: "translate(" + (a.left - b.left) + "px," + (a.top - b.top) + "px) scale(" + s + ")" }, { transformOrigin: "0 0", transform: "none" }], { duration: dur, easing: EASE_IO });
    });
    await Promise.all(ps);
  }

  const passosAtrio = [
    /* 1 · ingresso: as duas páginas entram; daí em diante o documento fica imóvel */
    async (S, ctx) => {
      solta(legenda(S, 0, ctx));
      const pgs = [...S.pags.children];
      await Promise.all(pgs.map((p, i) => ctx.anima(p, [{ opacity: 0, transform: "translateY(28px)" }, { opacity: 1, transform: "none" }], { duration: 900, delay: 200 + i * 220, easing: EASE })));
      await ctx.espera(1400);
    },
    /* 2 · identificação: os dados destacados um a um, com a contagem */
    async (S, ctx) => {
      await legenda(S, 1, ctx);
      const tipos = new Set();
      for (let i = 0; i < S.ocorr.length; i++) {
        const o = S.ocorr[i];
        o.el.classList.add("is-id");
        tipos.add(o.id);
        S.cont.textContent = A.ocorrencias(i + 1, tipos.size);
        if (ctx.anim) await ctx.espera(170);
      }
      await ctx.espera(1500);
    },
    /* 3 · substituição: a etiqueta toma o lugar do dado; o original se ergue sobre a linha */
    async (S, ctx) => {
      await legenda(S, 2, ctx);
      S.voos = [];
      for (const o of S.ocorr) {
        let voo = null;
        if (ctx.voo) {
          const r = rel(S, o.el);
          const cs = getComputedStyle(o.el);
          voo = h("span", { class: "ld-voo", "aria-hidden": "true", style: "left:" + r.x + "px;top:" + r.y + "px;font-size:" + cs.fontSize + ";line-height:" + r.h + "px" }, D.dados[o.id].original);
          S.root.append(voo);
          S.voos.push({ id: o.id, el: voo, fs: parseFloat(cs.fontSize), y: r.y, x: r.x, h: r.h });
        }
        o.el.classList.add("is-tag");
        o.el.replaceChildren(etiqueta(D.dados[o.id].etiqueta));
        if (ctx.anim) {
          const tag = o.el.firstChild;
          solta(ctx.anima(tag, [{ opacity: 0, transform: "scaleX(.4)" }, { opacity: 1, transform: "none" }], { duration: 360, easing: EASE }));
          if (voo) {
            const sobe = -(S.voos[S.voos.length - 1].h * .95);
            voo.style.transform = "translateY(" + sobe + "px)";
            solta(ctx.anima(voo, [{ transform: "none" }, { transform: "translateY(" + sobe + "px)" }], { duration: 420, easing: EASE }));
          }
          await ctx.espera(240);
        }
      }
      await ctx.espera(1300);
    },
    /* 4 · desprendimento: os originais deixam o documento e ficam à vista, fora dele */
    async (S, ctx) => {
      await legenda(S, 3, ctx);
      S.orig.hidden = false;
      mostra(null, S.orig, ctx);
      const itens = [...S.lista.children];
      if (!ctx.voo || !S.voos.length) {
        S.voos.forEach((v) => v.el.remove()); S.voos = [];
        if (ctx.anim) for (const li of itens) { solta(ctx.entra(li, { y: 6 })); await ctx.espera(120); }
        await ctx.espera(1400);
        return;
      }
      itens.forEach((li) => { li.style.opacity = "0"; });
      await ctx.entra(S.orig.firstChild, { y: 4, dur: 300 });
      const chegou = new Set();
      const voos = S.voos.slice();
      await Promise.all(voos.map((v, i) => (async () => {
        await ctx.espera(i * 130);
        const li = S.linhasOrig[v.id], alvo = li.querySelector(".ld-dado");
        const r = rel(S, alvo);
        const fsAlvo = parseFloat(getComputedStyle(alvo).fontSize);
        const s = fsAlvo / v.fs;
        const de = v.el.style.transform || "none";
        const para = "translate(" + (r.x - v.x) + "px," + (r.y - v.y + (r.h - v.h * s) / 2) + "px) scale(" + s + ")";
        v.el.style.transformOrigin = "0 0";
        v.el.style.transform = para;
        await ctx.anima(v.el, [{ transform: de }, { transform: para }], { duration: 860, easing: EASE_IO });
        if (!chegou.has(v.id)) { chegou.add(v.id); li.style.opacity = ""; }
        v.el.remove();
      })()));
      S.voos = [];
      await ctx.espera(1500);
    },
    /* 5 · o cofre surge */
    async (S, ctx) => {
      await legenda(S, 4, ctx);
      S.cofre.hidden = false;
      S.cofre.classList.add("is-vazio");
      mostra(null, S.cofre, ctx);
      await ctx.anima(S.cofre, [{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)" }], { duration: 700, easing: EASE_IO });
      await ctx.espera(1300);
    },
    /* 6 · custódia: cada original desce ao cofre, e a etiqueta se põe ao lado */
    async (S, ctx) => {
      await legenda(S, 5, ctx);
      S.cofre.classList.remove("is-vazio");
      const trs = S.ids.map((id) => S.linhasCofre[id]);
      if (!ctx.voo) {
        if (ctx.mov && ctx.anim) {
          /* coluna única: cada par entra no cofre no próprio lugar */
          trs.forEach((tr) => tr.classList.add("is-espera"));
          for (const tr of trs) {
            S.linhasOrig[tr.dataset.d].style.opacity = "0";
            tr.classList.remove("is-espera");
            await ctx.anima(tr, [{ opacity: 0, transform: "translateY(-6px)" }, { opacity: 1, transform: "none" }], { duration: 320 });
            await ctx.espera(120);
          }
        }
        S.orig.hidden = true;
        mostra(null, S.cofre, ctx);
        await ctx.espera(1200);
        return;
      }
      trs.forEach((tr) => tr.classList.add("is-espera"));
      for (const id of S.ids) {
        const li = S.linhasOrig[id], de = li.querySelector(".ld-dado"), tr = S.linhasCofre[id];
        const para = tr.querySelector(".ld-dado");
        const a = rel(S, de), b = rel(S, para);
        const voo = h("span", { class: "ld-voo ld-voo--dado", "aria-hidden": "true", style: "left:" + a.x + "px;top:" + a.y + "px;font-size:" + getComputedStyle(de).fontSize }, D.dados[id].original);
        S.root.append(voo);
        li.style.opacity = "0";
        const fim = "translate(" + (b.x - a.x) + "px," + (b.y - a.y) + "px)";
        voo.style.transform = fim;
        await ctx.anima(voo, [{ transform: "none" }, { transform: fim }], { duration: 640, easing: EASE_IO });
        tr.classList.remove("is-espera");
        voo.remove();
        solta(ctx.anima(tr.querySelector(".ld-tag"), [{ opacity: 0, transform: "translateX(-8px)" }, { opacity: 1, transform: "none" }], { duration: 360 }));
        await ctx.espera(140);
      }
      await ctx.espera(500);
      await flip(ctx, [S.cofre], () => { S.orig.hidden = true; }, 600);
      await ctx.espera(1000);
    },
    /* 7 · o cofre se fecha */
    async (S, ctx) => {
      await legenda(S, 6, ctx);
      const h0 = S.corpoBox.offsetHeight;
      if (ctx.mov) {
        await ctx.anima(S.corpoBox, [{ height: h0 + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 760, easing: EASE_IO, fill: "forwards" });
      }
      S.cofre.classList.add("is-fechado");
      S.estadoCofre.textContent = A.cofreFechado(S.ids.length);
      await ctx.entra(S.estadoCofre, { y: 4, dur: 360 });
      await ctx.espera(1400);
    },
    /* 8 · segregação: a pasta de backend recebe o cofre */
    async (S, ctx) => {
      await legenda(S, 7, ctx);
      /* a pasta abre acima do cofre; o cofre sobe e entra nela. A pasta não se
         desloca: só o cofre faz o percurso */
      await Promise.all([
        flip(ctx, [S.cofre], () => { S.pasta.hidden = false; }, 520),
        ctx.entra(S.pasta, { y: 8, dur: 520 })
      ]);
      mostra(null, S.pasta, ctx);
      await ctx.espera(400);
      await flip(ctx, [S.cofre], () => { S.vaga.append(S.cofre); S.pasta.classList.add("is-cheia"); }, 860);
      mostra(null, S.pasta, ctx);
      await ctx.espera(1500);
    },
    /* 9 · liberação: o documento pseudonimizado segue ao RATIO */
    async (S, ctx) => {
      await legenda(S, 8, ctx);
      S.rotDoc.textContent = A.documentoPseudo;
      S.root.classList.add("is-liberado");
      if (ctx.anim && getComputedStyle(palco).overflowY === "auto") palco.scrollTo({ top: 0, behavior: ctx.mov ? "smooth" : "instant" });
      await ctx.entra(S.rotDoc, { y: 4, dur: 360 });
      await ctx.espera(2000);
    }
  ];

  /* ======================================================================
     RATIO · progressivo, argumentativo
     ====================================================================== */
  const R = L.ratio;
  function indice(rot, itens, cap) {
    const lis = itens.map((it, k) => h("li", { "data-k": k },
      h("button", { type: "button", class: "ld-fases__b", onclick: () => vai(inicioDe(cap) + k, { manual: true }) },
        h("span", { class: "ld-fases__id" }, it.id), h("span", { class: "ld-fases__n" }, it.nome), h("span", { class: "ld-fases__r" }))));
    return { nav: h("nav", { class: "ld-fases", "aria-label": rot }, h("ol", null, lis)), lis };
  }
  /* fase em curso (k) e fases concluídas; com "fechada", a própria k já mostra o resultado */
  function marcaIndice(lis, k, resumos, fechada) {
    lis.forEach((li, i) => {
      const feito = i < k || (fechada && i === k);
      if (i === k) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
      li.classList.toggle("is-feito", feito);
      li.querySelector(".ld-fases__r").textContent = feito && resumos[i] ? resumos[i] : "";
    });
  }
  function montaRatio() {
    const fases = R.fasesDados;
    const ix = indice(R.fases, fases, "ratio");
    const main = h("div", { class: "ld-ra__main" });
    const doc = h("div", { class: "ld-ref__doc" }, h("p", { class: "ld-rot" }, R.entrada), h("div", { class: "ld-ref__mesa" }, paginas(true)));
    const minTxt = h("div", { class: "ld-min", lang: "pt-BR", tabindex: "0" });
    const minR = h("p", { class: "ld-rot" }, R.minuta);
    const min = h("div", { class: "ld-ref__min", hidden: true }, minR, minTxt);
    const ref = h("aside", { class: "ld-ref" }, doc, min);
    const root = h("div", { class: "ld-cena ld-ra" }, ix.nav, main, ref);
    palco.replaceChildren(root);
    return { cap: "ratio", root, lis: ix.lis, main, doc, min, minTxt, minR, resumos: fases.map((f) => f.resumo + " · " + R.validada) };
  }
  async function trocaFase(S, ctx, el) {
    const velho = S.main.firstElementChild;
    if (velho && ctx.mov) await ctx.anima(velho, [{ opacity: 1 }, { opacity: 0 }], { duration: 280, fill: "forwards" });
    S.main.replaceChildren(el);
    S.main.scrollTop = 0;
  }
  function cabecaFase(id, nome, fonte) {
    return [h("p", { class: "ld-fase__id" }, id), h("h3", { class: "ld-fase__t" }, nome), fonte ? h("p", { class: "ld-fonte" }, h("span", null, R.fonte), fonte) : null];
  }
  async function humano(S, ctx, bloco, cont) {
    (cont || S.main.firstElementChild).append(bloco);
    mostra(S.main, bloco, ctx);
    await ctx.anima(bloco, [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 480 });
    const n = conta(bloco.textContent);
    await ctx.espera(Math.min(5200, 1300 + n * 230));
  }
  function passoRatio(k) {
    return async (S, ctx) => {
      const f = R.fasesDados[k];
      marcaIndice(S.lis, k, S.resumos);
      const ia = h("p", { class: "ld-ia__t" });
      const iaBox = h("div", { class: "ld-ia" }, quemIA("RATIO"), ia);
      const fase = h("article", { class: "ld-fase" }, cabecaFase(f.id, f.nome, f.fonte), iaBox);
      await trocaFase(S, ctx, fase);
      if (ctx.anim) anuncia(f.id + " · " + f.nome + ". " + f.ia);
      await ctx.entra(fase.querySelector(".ld-fase__t"), { y: 8, dur: 420 });
      await ctx.espera(500);
      const n = await ctx.palavras(ia, f.ia, { rolar: (i) => mostra(S.main, ia, i ? null : ctx) });

      if (f.posicoes) {
        const ul = h("ul", { class: "ld-pos" });
        iaBox.append(ul);
        for (const [quem, t] of f.posicoes) {
          const txt = h("span", { class: "ld-pos__t" });
          const li = h("li", null, etiqueta(quem), txt);
          ul.append(li);
          await ctx.entra(li, { y: 6, dur: 300 });
          await ctx.palavras(txt, t);
        }
      }
      if (f.matriz) {
        const dl = h("dl", { class: "ld-mat" });
        iaBox.append(dl);
        for (const [rot, t] of f.matriz) {
          const dd = h("dd");
          dl.append(h("div", { class: "ld-mat__l" }, h("dt", null, rot), dd));
          mostra(S.main, dl, ctx);
          await ctx.palavras(dd, t);
          await ctx.espera(300);
        }
      }
      let rotasEls = null;
      if (f.rotas) {
        const ol = h("ol", { class: "ld-rotas", "aria-label": R.rotas });
        rotasEls = f.rotas.map(([nome, nota]) => h("li", null, h("span", { class: "ld-rotas__n" }, nome), h("span", { class: "ld-rotas__e" }, nota ? R.recomendada : "")));
        ol.append(...rotasEls);
        iaBox.append(ol);
        for (const li of rotasEls) { await ctx.entra(li, { y: 6, dur: 320 }); await ctx.espera(260); }
      }
      if (k === 4) {
        /* RI_05: o montador do ECHO forma a minuta ao lado */
        iaBox.append(h("p", { class: "ld-eco" }, h("i", { "aria-hidden": "true" }), R.ecoMontador));
        await ctx.leitura(n, 700);
        S.doc.hidden = true;
        S.min.hidden = false;
        S.minR.textContent = R.minutaMontagem;
        await ctx.entra(S.min, { y: 10, dur: 480 });
        for (const p of D.minuta) {
          const el = h("p", { class: "ld-min__p" + (p.ementa ? " is-ementa" : "") + (p.dispositivo ? " is-disp" : "") });
          S.minTxt.append(el);
          await ctx.palavras(el, p.t, { wps: p.ementa || p.dispositivo ? 8 : 70, leituraInteira: p.ementa || p.dispositivo ? 2400 : 400, rolar: () => { S.minTxt.scrollTop = S.minTxt.scrollHeight; } });
          if (ctx.anim) await ctx.espera(p.ementa || p.dispositivo ? 700 : 160);
        }
        S.minR.textContent = R.minuta;
        if (ctx.anim) S.minTxt.scrollTo({ top: 0, behavior: ctx.mov ? "smooth" : "instant" });
        else S.minTxt.scrollTop = 0;
      } else if (k > 4) {
        S.doc.hidden = true;
        S.min.hidden = false;
      }
      if (f.conferencia) {
        /* RI_06: ementa e dispositivo, lado a lado e marcados na minuta */
        const ul = h("ul", { class: "ld-conf" });
        iaBox.append(ul);
        const alvos = [S.minTxt.querySelector(".is-ementa"), S.minTxt.querySelector(".is-disp")];
        for (let i = 0; i < f.conferencia.length; i++) {
          const [rot, t] = f.conferencia[i];
          const li = h("li", null, h("span", { class: "ld-conf__r" }, rot), h("span", { class: "ld-conf__t", lang: "pt-BR" }, t));
          ul.append(li);
          const m = alvos[i] && marca(alvos[i], D.minuta[i ? 10 : 0].marca);
          if (m) mostra(S.minTxt, m, ctx, 60);
          await ctx.entra(li, { y: 6, dur: 320 });
          await ctx.espera(1300);
        }
        const ok = h("p", { class: "ld-conf__ok" }, R.coerente);
        iaBox.append(ok);
        await ctx.entra(ok, { y: 4, dur: 300 });
      }
      if (k !== 4) await ctx.leitura(n);

      /* intervenção humana registrada: aparece inteira, como registro */
      if (rotasEls) {
        rotasEls.forEach((li, i) => {
          li.classList.add(i === f.escolha ? "is-escolhida" : "is-nao");
          const e = li.querySelector(".ld-rotas__e");
          e.textContent = (f.rotas[i][1] ? R.recomendada + " · " : "") + (i === f.escolha ? R.escolhida : R.naoSeguida);
        });
      }
      if (ctx.anim) anuncia(U.humano + ": " + f.humano + (f.nota ? " " + f.nota : ""));
      await humano(S, ctx, blocoHumano(f.humano, f.nota), fase);
      marcaIndice(S.lis, k, S.resumos, true);
      if (ctx.anim) await ctx.espera(500);
    };
  }
  const passosRatio = R.fasesDados.map((_, k) => passoRatio(k));

  /* ======================================================================
     TROIA · alternada, adversarial
     ====================================================================== */
  const T = L.troia;
  function montaTroia() {
    const itens = T.lentesDados.map((l, i) => ({ id: dois(i + 1), nome: l.nome })).concat([{ id: "→", nome: T.encaminhamento.nome }]);
    const ix = indice(T.lentes, itens, "troia");
    const tese = h("div", { class: "ld-tr__tese" }, h("p", { class: "ld-rot" }, T.sobConfronto), h("p", { class: "ld-tr__tese-t" }, T.tese));
    const main = h("div", { class: "ld-ra__main" });
    const coluna = h("div", { class: "ld-tr__col" }, tese, main);
    const minTxt = h("div", { class: "ld-min", lang: "pt-BR", tabindex: "0" }, D.minuta.map((p) => minutaPar(p, D.trechos)));
    const exe = h("p", { class: "ld-ref__exe" }, T.execucao + " " + D.execucao + " · " + T.contrato);
    const min = h("div", { class: "ld-ref__min" }, h("p", { class: "ld-rot" }, R.minuta), minTxt, exe);
    const ref = h("aside", { class: "ld-ref" }, min);
    const root = h("div", { class: "ld-cena ld-ra ld-tr" }, ix.nav, coluna, ref);
    palco.replaceChildren(root);
    const placares = T.lentesDados.map((l) => D.julgadores[l.id].map((j) => j.filter(Boolean).length));
    const resumos = T.lentesDados.map((l) => T.estados[l.estado]);
    return { cap: "troia", root, lis: ix.lis, main, minTxt, ref, resumos, placares };
  }
  function passoLente(k) {
    return async (S, ctx) => {
      const l = T.lentesDados[k];
      marcaIndice(S.lis, k, S.resumos);
      S.lis.forEach((li, i) => { li.dataset.estado = i < k ? T.lentesDados[i].estado : ""; });
      const contra = h("p", { class: "ld-ia__t" });
      const trecho = h("blockquote", { class: "ld-trecho", lang: "pt-BR" }, D.trechos[l.id]);
      const julg = D.julgadores[l.id];
      const marcas = julg.map(() => []);
      const placar = julg.map(() => h("span", { class: "ld-jg__p" }));
      const linhas = julg.map((rod, j) => h("div", { class: "ld-jg__l" },
        h("span", { class: "ld-jg__n" }, T.julgador(j + 1)),
        h("span", { class: "ld-jg__m" }, rod.map((d) => { const m = h("i", { class: "ld-jg__x", "data-d": d ? "1" : "0", title: d ? T.derruba : T.naoDerruba }); marcas[j].push(m); return m; })),
        placar[j]));
      const div = h("p", { class: "ld-jg__div" });
      const estado = h("p", { class: "ld-estado", "data-estado": l.estado });
      const fase = h("article", { class: "ld-fase ld-lente" },
        h("p", { class: "ld-fase__id" }, T.lente + " " + dois(k + 1) + " / " + dois(T.lentesDados.length)),
        h("h3", { class: "ld-fase__t" }, l.nome),
        h("div", { class: "ld-duelo" },
          h("div", { class: "ld-ia ld-duelo__a" }, h("p", { class: "ld-quem ld-quem--ia" }, h("i", { "aria-hidden": "true" }), "TROIA · " + T.contraTese), contra),
          h("div", { class: "ld-duelo__b" }, h("p", { class: "ld-quem" }, T.trecho), trecho)),
        h("div", { class: "ld-jg" }, h("p", { class: "ld-quem" }, T.adjudicacao), linhas, h("p", { class: "ld-jg__nota" }, T.julgadoresNota), div),
        estado);
      await trocaFase(S, ctx, fase);
      S.minTxt.querySelectorAll(".ld-min__trecho").forEach((t) => t.classList.toggle("is-ativo", t.dataset.lente === l.id));
      const ativo = S.minTxt.querySelector('.ld-min__trecho[data-lente="' + l.id + '"]');
      if (ativo) {
        const rc = S.minTxt.getBoundingClientRect(), ra = ativo.getBoundingClientRect();
        S.minTxt.scrollTo({ top: S.minTxt.scrollTop + ra.top - rc.top - 40, behavior: ctx.mov ? "smooth" : "instant" });
      }
      if (ctx.anim) anuncia(l.nome + ". " + T.contraTese + ": " + l.contra);
      await ctx.entra(fase.querySelector(".ld-fase__t"), { y: 8, dur: 420 });
      await ctx.espera(400);
      /* a tese contraposta se forma; a minuta responde com o próprio texto */
      const n = await ctx.palavras(contra, l.contra);
      await ctx.espera(600);
      const duB = fase.querySelector(".ld-duelo__b");
      duB.classList.add("is-on");
      await ctx.anima(duB, [{ opacity: 0, transform: "translateX(12px)" }, { opacity: 1, transform: "none" }], { duration: 520 });
      await ctx.espera(Math.min(4200, 1200 + conta(D.trechos[l.id]) * 70));
      /* adjudicação alternada: julgador 1, julgador 2, rodada a rodada */
      const jg = fase.querySelector(".ld-jg");
      jg.classList.add("is-on");
      mostra(S.main, jg, ctx);
      await ctx.entra(jg, { y: 8, dur: 380 });
      const tot = julg.map(() => 0);
      for (let r = 0; r < 3; r++) for (let j = 0; j < julg.length; j++) {
        const m = marcas[j][r];
        m.classList.add("is-on");
        if (julg[j][r]) tot[j]++;
        placar[j].textContent = T.placar(tot[j], r + 1);
        await ctx.anima(m, [{ transform: "scale(.2)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 260 });
        await ctx.espera(380);
      }
      const diverge = tot[0] !== tot[1];
      div.textContent = diverge ? T.divergencia : T.convergencia;
      div.dataset.diverge = diverge ? "1" : "0";
      await ctx.entra(div, { y: 4, dur: 320 });
      await ctx.espera(700);
      estado.textContent = T.estados[l.estado];
      mostra(S.main, estado, ctx);
      await ctx.anima(estado, [{ opacity: 0, transform: "scale(1.06)" }, { opacity: 1, transform: "none" }], { duration: 420 });
      if (ctx.anim) anuncia(l.nome + ": " + T.estados[l.estado] + ". " + T.julgador(1) + ": " + T.placar(tot[0], 3) + ". " + T.julgador(2) + ": " + T.placar(tot[1], 3) + ".");
      S.lis[k].dataset.estado = l.estado;
      marcaIndice(S.lis, k, S.resumos, true);
      await ctx.leitura(n, 2200);
    };
  }
  async function passoEncaminha(S, ctx) {
    const E = T.encaminhamento, k = T.lentesDados.length;
    marcaIndice(S.lis, k, S.resumos);
    S.lis.forEach((li, i) => { li.dataset.estado = i < k ? T.lentesDados[i].estado : ""; });
    S.minTxt.querySelectorAll(".ld-min__trecho").forEach((t) => t.classList.add("is-ativo"));
    const tab = h("table", { class: "ld-est" },
      h("caption", { class: "ld-quem" }, T.estabilidade),
      h("tbody", null, T.lentesDados.map((l, i) => h("tr", null,
        h("th", { scope: "row" }, l.nome),
        h("td", { class: "ld-est__p" }, T.julgador(1) + " " + S.placares[i][0] + "/3 · " + T.julgador(2) + " " + S.placares[i][1] + "/3"),
        h("td", null, h("span", { class: "ld-estado ld-estado--min", "data-estado": l.estado }, T.estados[l.estado]))))));
    const ia = h("p", { class: "ld-ia__t" });
    const [a, b] = E.distincao.split("≠");
    const dist = h("p", { class: "ld-dist" }, a, h("span", { class: "ld-dist__x" }, "≠"), b);
    const fase = h("article", { class: "ld-fase ld-enc" },
      h("p", { class: "ld-fase__id" }, "TROIA"),
      h("h3", { class: "ld-fase__t" }, E.nome),
      tab,
      h("div", { class: "ld-ia" }, h("p", { class: "ld-quem ld-quem--ia" }, h("i", { "aria-hidden": "true" }), U.ia + " · TROIA"), ia),
      dist);
    await trocaFase(S, ctx, fase);
    if (ctx.anim) anuncia(E.nome + ". " + E.ia);
    await ctx.entra(fase.querySelector(".ld-fase__t"), { y: 8, dur: 420 });
    for (const tr of tab.tBodies[0].rows) { await ctx.entra(tr, { y: 6, dur: 320 }); await ctx.espera(220); }
    await ctx.espera(500);
    const n = await ctx.palavras(ia, E.ia);
    await ctx.leitura(n, 600);
    await ctx.entra(dist, { y: 6, dur: 420 });
    await ctx.espera(1100);
    if (ctx.anim) anuncia(U.humano + ": " + E.humano);
    await humano(S, ctx, blocoHumano(E.humano), fase);
  }
  const passosTroia = T.lentesDados.map((_, k) => passoLente(k)).concat([passoEncaminha]);

  /* ======================================================================
     Linha do tempo
     ====================================================================== */
  const PASSOS = [
    ...passosAtrio.map((faz, k) => ({ cap: "atrio", faz, n: dois(k + 1), nome: A.etapas[k][0], linha: A.linha })),
    ...passosRatio.map((faz, k) => ({ cap: "ratio", faz, n: R.fasesDados[k].id, nome: R.fasesDados[k].nome, linha: R.linha })),
    ...passosTroia.map((faz, k) => ({ cap: "troia", faz, n: k < T.lentesDados.length ? dois(k + 1) : "→", nome: k < T.lentesDados.length ? T.lentesDados[k].nome : T.encaminhamento.nome, linha: T.linha }))
  ];
  const N = PASSOS.length;
  const MONTA = { atrio: montaAtrio, ratio: montaRatio, troia: montaTroia };
  const inicioDe = (cap) => PASSOS.findIndex((p) => p.cap === cap);

  let S = null, atual = -1, completo = false, modo = "tocando", continua = null, porAuto = false;

  function cabecalho(k) {
    const p = PASSOS[k];
    if (wm.dataset.cap !== p.cap) {
      wm.dataset.cap = p.cap;
      wm.innerHTML = WM[p.cap];
      sup.dataset.cap = p.cap;
    }
    titulo.firstChild.textContent = NOME[p.cap] + " · ";
    opN.textContent = p.n;
    opNome.textContent = p.nome;
    opLinha.textContent = p.linha;
    caps.forEach((li) => {
      const b = li.firstChild;
      if (b.dataset.cap === p.cap) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
      b.dataset.feito = inicioDe(b.dataset.cap) < inicioDe(p.cap) ? "1" : "0";
    });
    contador.textContent = U.etapa + " " + dois(k + 1) + " / " + dois(N);
  }
  function poeModo(m) {
    modo = m;
    sup.dataset.estado = m;
    const [ico, rot] = m === "fim" ? [ICO.recomeca, U.recomecar] : m === "pausado" ? [ICO.toca, U.retomar] : [ICO.pausa, U.pausar];
    bToca.innerHTML = ico + '<span class="ld-ctl__t">' + rot + "</span>";
    bToca.setAttribute("aria-label", rot);
    bToca.title = rot;
    bSegue.disabled = m === "fim";
    bDesg.disabled = m === "fim";
  }

  /* monta a cena do passo k, aplica de uma vez os anteriores do capítulo */
  async function prepara(k) {
    const cap = PASSOS[k].cap;
    S = MONTA[cap]();
    for (let j = inicioDe(cap); j < k; j++) await PASSOS[j].faz(S, INST);
  }
  async function transicao(g) {
    const ctx = ctxAnimado(g);
    const cena = palco.firstElementChild;
    if (cena && ctx.mov) await ctx.anima(cena, [{ opacity: 1 }, { opacity: 0 }], { duration: 520, fill: "forwards", easing: EASE_IO });
    await ctx.espera(ctx.mov ? 180 : 400);
  }
  /* executa o passo k animado e segue sozinho até o fim */
  async function roda(k, reconstroi) {
    fechaRastro(false);
    const g = ++ger;
    tempo.aborta();
    continua = null;
    try {
      if (reconstroi || !S || S.cap !== PASSOS[k].cap) await prepara(k);
      atual = k; completo = false;
      cabecalho(k);
      anunciaPasso(k);
      await PASSOS[k].faz(S, ctxAnimado(g));
      if (g !== ger) return;
      completo = true;
      segue(k, g);
    } catch (e) { if (e !== PARA) throw e; }
  }
  async function segue(k, g) {
    if (k >= N - 1) { termina(); return; }
    try {
      if (PASSOS[k + 1].cap !== PASSOS[k].cap) { await transicao(g); if (g !== ger) return; roda(k + 1, true); }
      else roda(k + 1, false);
    } catch (e) { if (e !== PARA) throw e; }
  }
  /* mostra o passo k concluído, sem animação (pausado ou movimento manual) */
  async function mostraPronto(k) {
    fechaRastro(false);
    ++ger;
    tempo.aborta();
    await prepara(k);
    await PASSOS[k].faz(S, INST);
    atual = k; completo = true;
    cabecalho(k);
    anunciaPasso(k);
    if (k >= N - 1) { termina(); return; }
    continua = () => { const g = ++ger; segue(k, g); };
  }
  const anunciaPasso = (k) => anuncia(NOME[PASSOS[k].cap] + " · " + PASSOS[k].n + " · " + PASSOS[k].nome);

  let saltado = false;
  function termina() {
    continua = null;
    poeModo("fim");
    const nota = saltado;
    saltado = false;
    if (!S || S.cap !== "troia" || S.root.querySelector(".ld-fimbox")) return;
    const F = T.fim;
    const bMin = h("button", { type: "button", class: "ld-acao" }, F.minuta);
    bMin.addEventListener("click", () => {
      const lendo = S.root.classList.toggle("is-leitura");
      bMin.textContent = lendo ? F.voltar : F.minuta;
      if (lendo) S.minTxt.focus({ preventScroll: true });
    });
    const bCerne = h("button", { type: "button", class: "ld-acao ld-acao--link" }, F.cerne);
    bCerne.addEventListener("click", () => fecha("ai-governance"));
    const box = h("div", { class: "ld-fimbox" },
      nota ? h("p", { class: "ld-saltado" }, U.saltado[0],
        h("button", { type: "button", class: "ld-saltado__a", "aria-label": RT.abrir, onclick: (e) => abreRastro(e.currentTarget) }, U.saltado[1]),
        U.saltado[2]) : null,
      h("p", { class: "ld-quem" }, F.titulo),
      h("div", { class: "ld-fimbox__a" }, bMin, bCerne),
      h("p", { class: "ld-fimbox__n" }, F.cerneNota));
    S.main.firstElementChild?.append(box);
    mostra(S.main, box, null);
    if (nota) anuncia(U.saltado.join(""));
  }
  /* ---------- o rastro: as passagens registradas, em ordem, com o ator ----------
     Abre na própria superfície, no lugar do palco (que fica intacto por baixo).
     Só conteúdo registrado: o que cada módulo e cada humano registrou em cada
     passagem; nenhum horário, hash ou versão que o site não tenha. */
  const RT = L.rastro;
  let rastroEl = null, rastroDe = null;
  function txt(el, t) {
    String(t).split(/[ \t\n]+/).filter(Boolean).forEach((w, i) => { if (i) el.append(" "); el.append(palavra(w)); });
    return el;
  }
  function montaRastro() {
    const passagens = [];
    RT.atrio.forEach((a) => passagens.push({ mod: "ATRIO", nome: a.nome, e: [["ia", "ATRIO", a.ia], ["hum", U.humano, a.humano]] }));
    R.fasesDados.forEach((f) => passagens.push({ mod: "RATIO", nome: f.id + " · " + f.nome, e: [["ia", U.ia + " · RATIO", f.ia], ["hum", U.humano, f.humano]] }));
    T.lentesDados.forEach((l) => {
      const p = D.julgadores[l.id].map((j) => j.filter(Boolean).length);
      passagens.push({ mod: "TROIA", nome: l.nome, e: [
        ["ia", "TROIA", l.contra],
        ["jg", RT.julgadores, T.julgador(1) + ": " + T.placar(p[0], 3) + " · " + T.julgador(2) + ": " + T.placar(p[1], 3)],
        ["est", RT.estado, T.estados[l.estado]]] });
    });
    const E = T.encaminhamento;
    passagens.push({ mod: "TROIA", nome: E.nome, e: [["ia", "TROIA", E.ia], ["hum", U.humano, E.humano]] });

    const lista = h("ol", { class: "ld-rastro__l" }, passagens.map((p, i) => h("li", null,
      h("span", { class: "ld-rastro__n" }, dois(i + 1)),
      h("div", { class: "ld-rastro__p" },
        h("p", { class: "ld-rastro__nome" }, h("span", null, p.mod), p.nome),
        p.e.map(([tipo, quem, t]) => h("p", { class: "ld-rastro__e", "data-tipo": tipo },
          h("span", { class: "ld-rastro__q" }, quem), txt(h("span", { class: "ld-rastro__t" }), t)))))));
    const arq = D.arquivos.length
      ? h("ul", { class: "ld-rastro__arq" }, D.arquivos.map((a) => h("li", null, h("a", { href: new URL("../../../" + a.href, import.meta.url).href, target: "_blank", rel: "noopener" }, a.rotulo))))
      : null;
    const tit = h("h3", { class: "ld-fase__t", id: "ld-rastro-t", tabindex: "-1" }, RT.caso);
    const voltar = h("button", { type: "button", class: "ld-acao", onclick: () => fechaRastro(true) }, RT.voltar);
    return h("section", { class: "ld-rastro", "aria-labelledby": "ld-rastro-t" },
      h("div", { class: "ld-rastro__cab" },
        h("div", null, h("p", { class: "ld-fase__id" }, RT.titulo), tit,
          h("p", { class: "ld-rastro__sub" }, RT.execucao + " " + D.execucao + " · " + T.contrato + " · " + D.registroData[en ? "en" : "pt"])),
        voltar),
      lista,
      h("div", { class: "ld-rastro__pe" },
        h("p", { class: "ld-rastro__lim" }, RT.limite),
        h("p", { class: "ld-rastro__lim" }, h("b", null, RT.arquivos + ": "), arq ? "" : RT.semArquivos),
        arq));
  }
  function abreRastro(origem) {
    rastroDe = origem || null;
    if (!rastroEl) rastroEl = montaRastro();
    casca.insertBefore(rastroEl, pe);
    casca.classList.add("is-rastro");
    rastroEl.scrollTop = 0;
    rastroEl.querySelector("#ld-rastro-t").focus({ preventScroll: true });
    anuncia(RT.titulo + " · " + RT.caso);
  }
  function fechaRastro(foca) {
    if (!casca.classList.contains("is-rastro")) return;
    casca.classList.remove("is-rastro");
    rastroEl.remove();
    if (foca && rastroDe?.isConnected) rastroDe.focus({ preventScroll: true });
  }

  function desgoverna() {
    if (modo === "fim") return;
    S?.root.classList.remove("is-leitura");
    porAuto = false;
    saltado = true;
    mostraPronto(N - 1);
  }

  /* ---------- controles ---------- */
  function vai(k, o = {}) {
    k = Math.max(0, Math.min(N - 1, k));
    S?.root.classList.remove("is-leitura");
    if (modo === "pausado") { mostraPronto(k); return; }
    poeModo("tocando");
    roda(k, true);
  }
  function passoRel(d) {
    if (d > 0) {
      if (modo === "fim") return;
      if (atual >= N - 1) { mostraPronto(N - 1); return; }
      vai(atual + 1);
    } else {
      if (modo === "fim") poeModo("tocando");
      vai(atual - 1);
    }
  }
  function vaiCap(cap) { vai(inicioDe(cap)); }
  function pausa(auto) {
    if (modo !== "tocando") return;
    porAuto = !!auto;
    tempo.pausa();
    poeModo("pausado");
  }
  function retoma() {
    if (modo !== "pausado") return;
    porAuto = false;
    poeModo("tocando");
    if (continua) { const c = continua; continua = null; c(); }
    else tempo.retoma();
  }
  function alterna() {
    if (modo === "fim") { poeModo("tocando"); roda(0, true); return; }
    if (modo === "pausado") retoma(); else pausa(false);
  }

  /* teclado, dentro da superfície */
  casca.addEventListener("keydown", (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const alvo = e.target;
    const campo = alvo.closest("button, a, [tabindex='0']") && alvo !== casca;
    if (e.key === "Escape") { e.preventDefault(); if (casca.classList.contains("is-rastro")) fechaRastro(true); else fecha(); }
    else if ((e.key === " " || e.key === "k") && !campo) { e.preventDefault(); alterna(); }
    else if (e.key === "ArrowRight" && !alvo.closest(".ld-min")) { e.preventDefault(); passoRel(1); }
    else if (e.key === "ArrowLeft" && !alvo.closest(".ld-min")) { e.preventDefault(); passoRel(-1); }
  });

  /* fora de vista, a reprodução espera; de volta, continua (só se a pausa foi automática) */
  let io = null;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver(([en]) => {
      if (!en) return;
      if (en.intersectionRatio < .3) pausa(true);
      else if (porAuto) retoma();
    }, { threshold: [0, .3, .6] });
    io.observe(sup);
  }
  const visivel = () => { if (document.hidden) pausa(true); else if (porAuto) retoma(); };
  document.addEventListener("visibilitychange", visivel);
  const reMov = () => { if (modo !== "fim" && atual >= 0) { if (modo === "pausado") mostraPronto(atual); else roda(atual, true); } };
  reduz.addEventListener?.("change", reMov);
  largo.addEventListener?.("change", reMov);

  /* começa: depois da expansão e da carga (garantidas pelo acionador) */
  casca.focus({ preventScroll: true });
  const k0 = inicio && inicioDe(inicio) >= 0 ? inicioDe(inicio) : 0;
  poeModo("tocando");
  roda(k0, true);

  return {
    vai: (cap) => vaiCap(cap),
    foca: () => casca.focus({ preventScroll: true }),
    destroi() {
      ++ger;
      tempo.aborta();
      io?.disconnect();
      document.removeEventListener("visibilitychange", visivel);
      reduz.removeEventListener?.("change", reMov);
      largo.removeEventListener?.("change", reMov);
      continua = null;
    }
  };
}
