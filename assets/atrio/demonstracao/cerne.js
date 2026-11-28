/* ==========================================================================
   CERNE na demonstração: o 4º estado da superfície (módulo ES, importado por
   demonstracao.js, só depois do clique).

   Linguagem própria, fora do percurso ATRIO → RATIO → TROIA: a superfície
   perde o grafite e deixa ver a retícula da home; a rodada sai impressa em
   folha contínua, como na tela oficial do CERNE (impressora, carro com
   tracionadores, etapas que saem da boca da máquina, serrilha e tesoura).
   A gramática da folha é a do site: furos quadrados, tinta #2C2C2C, azul do
   CERNE onde há operação, amarelo só no achado; Cabinet Grotesk, Schibsted
   Grotesk e Martian Mono.

   Seis passos: as cinco etapas do núcleo e a saída ("O que ficou de pé?").
   Cada passo se executa animado (ctx animado) ou de uma vez (ctx
   instantâneo), como os demais capítulos. Conteúdo: dados-cerne.js.
   ========================================================================== */
import C from "./dados-cerne.js?v=20261128-cerne";

const SVGNS = "http://www.w3.org/2000/svg";
const MOLA = "cubic-bezier(.32,.72,0,1)";
const INK = "#2C2C2C", PAPER = "#FCFCFC", TINT = "#E6E6E6";

/* marca nominal do CERNE (a mesma de cerne.html), definida uma vez por superfície */
const WM_SYMBOL = '<symbol id="lc-wm" viewBox="164 -1414 9346 1428"><path fill="currentColor" d="M164 -1111Q164 -1284 259 -1349Q354 -1414 540 -1414H1239Q1426 -1414 1521.5 -1349Q1617 -1284 1617 -1111V-926L1204 -850V-1064Q1204 -1064 1204 -1064Q1204 -1064 1204 -1064H577Q577 -1064 577 -1064Q577 -1064 577 -1064V-336Q577 -336 577 -336Q577 -336 577 -336H1211Q1211 -336 1211 -336Q1211 -336 1211 -336V-576L1624 -495V-301Q1624 -120 1531.5 -53Q1439 14 1246 14H540Q347 14 255.5 -53.5Q164 -121 164 -301ZM4023 0V-1400H5056Q5226 -1400 5330 -1341.5Q5434 -1283 5434 -1097V-794Q5434 -651 5356.5 -582.5Q5279 -514 5131 -504H5086L5559 0H5076L4630 -504H4436V0ZM4436 -837H4938Q4982 -837 5004 -857.5Q5026 -878 5026 -918V-981Q5026 -1021 5004 -1041.5Q4982 -1062 4938 -1062H4436ZM5979 0V-1400H6288L7162 -592V-1400H7544V0H7234L6362 -800V0ZM8125 0V-1400H9490V-1069H8538V-864H9104V-559H8538V-331H9510V0Z"/><path style="fill:var(--wm-d,#4F6BFF)" d="M2136 0V-1400H3501V-1069H2549V-864H3115V-559H2549V-331H3521V0Z"/></symbol>';
export const WM_CERNE = '<svg class="lc-wm" viewBox="0 0 9346 1428" role="img" aria-label="CERNE"><use href="#lc-wm"/></svg>';

/* ícones da tela oficial, no traço do site */
const ICO = {
  ok: '<svg viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="11" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M6.8 11.3l2.8 2.8 5.6-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  contrato: '<svg viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="11" r="8.5" fill="#E8A628" stroke="#2C2C2C" stroke-width="2"/><path d="M11 6.5V12" stroke="#2C2C2C" stroke-width="2.2" stroke-linecap="round"/><circle cx="11" cy="15.4" r="1.3" fill="#2C2C2C"/></svg>',
  execucao: '<svg viewBox="0 0 22 22" aria-hidden="true"><rect x="3" y="3" width="16" height="16" rx="3" fill="#FCFCFC" stroke="#2C2C2C" stroke-width="2"/><path d="M7 8.5H15M7 11.5H15M7 14.5H12" stroke="#2C2C2C" stroke-width="1.8" stroke-linecap="round"/></svg>',
  seta: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5L10.5 8L6 12.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  tesoura: '<svg viewBox="0 0 40 32" aria-hidden="true"><g fill="#FCFCFC" stroke="#2C2C2C" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 16L36 6"/><path d="M14 16L36 26"/><circle cx="8" cy="9" r="5"/><circle cx="8" cy="23" r="5"/><path d="M12.4 11.4L17 16l-4.6 4.6"/></g></svg>'
};

const pad = (n) => String(n).padStart(2, "0");
const f = (t, o) => String(t).replace(/\{(\w+)\}/g, (_, k) => (o[k] ?? ""));
const sigla = (u) => (u === "SOURCE_INTEGRITY" ? "SI" : u);
const num = (p) => p.replace(/^p/, "");

export function cerne({ h, en, mostra }) {
  const L = C[en ? "en" : "pt"];
  const V = L.visor;
  const onde = (p) => f(L.onde, { n: num(p) });
  const pl = (n, par) => n + " " + (n === 1 ? par[0] : par[1]);
  const html = (tag, attrs, s) => { const el = h(tag, attrs); el.innerHTML = s; return el; };

  /* --------------------------------------------------------------- cena */
  function monta() {
    const S = { cap: "cerne", cand: 0, achados: 0 };

    /* trilho: acompanhamento da rodada */
    const led = document.createElementNS(SVGNS, "svg");
    led.setAttribute("viewBox", "0 0 10 10"); led.setAttribute("aria-hidden", "true"); led.classList.add("lc-led");
    const ledC = document.createElementNS(SVGNS, "circle");
    ledC.setAttribute("cx", "5"); ledC.setAttribute("cy", "5"); ledC.setAttribute("r", "4");
    led.append(ledC);
    S.vz = [h("p", { class: "lc-vz1" }), h("p", { class: "lc-meta" }), h("p", { class: "lc-meta" })];
    S.etapasRail = L.etapas.map((n) => h("li", { class: "off" }, h("span", { class: "lc-lamp", "aria-hidden": "true" }), h("b", null, n)));
    S.nCand = h("dd", null, "00");
    S.nAch = h("dd", { class: "lc-ach" }, "0");
    S.nAf = h("dd", { class: "lc-af" }, "0");
    S.atoTxt = h("div", { class: "lc-ato__txt", lang: "pt-BR", tabindex: "0" },
      C.paragrafos.map((t, i) => h("p", { "data-p": "p" + (i + 1) }, h("span", { class: "lc-pn" }, "p" + (i + 1)), h("span", null, t))));
    S.saltado = h("div", { class: "lc-saltado" });
    const lado = h("aside", { class: "lc-lado", "aria-label": L.ind },
      h("p", { class: "lc-ind" }, L.ind),
      h("div", { class: "lc-status" }, led, S.vz[0]), S.vz[1], S.vz[2],
      h("ol", { class: "lc-etapas" }, S.etapasRail),
      h("dl", { class: "lc-cont" },
        h("div", { class: "lc-cont__c" }, h("dt", null, L.cont.candidatos), S.nCand),
        h("div", null, h("dt", null, L.cont.achados), S.nAch),
        h("div", null, h("dt", null, L.cont.afastados), S.nAf)),
      h("details", { class: "lc-ato" },
        h("summary", null, L.consultar),
        h("p", { class: "lc-ato__cab" }, h("b", null, L.atoTitulo), h("span", null, pl(C.paragrafos.length, [L.paragrafos.replace(/s$/, ""), L.paragrafos]))),
        S.atoTxt),
      S.saltado);
    S.led = ledC;

    /* a impressora (desenho da tela oficial, em peças) */
    S.imp = h("div", { class: "lc-imp ativo", "aria-hidden": "true" },
      ["tampa", "corpo", "faixa", "cabeca", "leds", "led", "lado", "fenda"].map((p) => h("i", { class: "lc-imp__" + p })));

    /* a folha: cada etapa sai da boca da máquina */
    const feeds = h("div", { class: "lc-feeds", "aria-live": "polite" });
    const feed = (id, ...filhos) => {
      const fi = h("div", { class: "lc-fi lc-fi--" + id }, filhos);
      const fd = h("div", { class: "lc-feed", "data-f": id }, h("div", { class: "lc-dob" }, fi));
      feeds.append(fd);
      return fd;
    };
    const etapaH = (i) => {
      const lamp = h("span", { class: "lc-lamp", "aria-hidden": "true" });
      return h("h3", { class: "lc-et__t" }, lamp, pad(i + 1) + " · " + L.etapas[i]);
    };
    const frase = (i) => h("p", { class: "lc-frase" }, L.frases[i]);

    S.selo = h("p", { class: "lc-selo" }, html("span", { class: "lc-selo__wm" }, WM_CERNE),
      h("span", null, f(L.selo, { versao: C.versao, eid: C.episodio, data: C.data[en ? "en" : "pt"] })));
    S.f = {};
    S.f.head = feed("head", S.selo);
    S.f.head.classList.add("on");

    /* 01 */
    S.chk = h("ul", { class: "lc-chk" });
    S.f.s1 = feed("s1", etapaH(0), frase(0), S.chk);
    /* 02 */
    S.segN = h("span", { class: "lc-seg__n" }, "00");
    S.segH = h("code", { class: "lc-seg__h" });
    S.f.s2 = feed("s2", etapaH(1), frase(1), h("div", { class: "lc-seg" }, S.segN, h("span", { class: "lc-seg__l" }, L.paragrafos), S.segH));
    /* 03 */
    S.progN = h("b", null, "00");
    S.cel = {};
    const canais = h("ol", { class: "lc-canais" }, C.unidades.map((u) => {
      const b = h("b");
      const c = h("span", { class: "lc-cel", "data-u": u }, b);
      S.cel[u] = c;
      return h("li", { title: u }, c, h("span", null, u === "SOURCE_INTEGRITY" ? "SI" : u.slice(3)));
    }));
    S.f.s3 = feed("s3", etapaH(2), frase(2), h("div", { class: "lc-prog" }, S.progN, h("span", null, L.candidatosFormados)), canais);
    /* 04 */
    S.toks = h("ol", { class: "lc-toks" });
    S.agora = h("p", { class: "lc-agora" });
    S.dec = h("ol", { class: "lc-dec" });
    S.f.s4 = feed("s4", etapaH(3), frase(3), h("div", { class: "lc-crivo", "aria-hidden": "true" }, h("div", { class: "lc-malha" }), S.toks), S.agora, S.dec);
    /* 05: tiras proporcionais ao tamanho de cada parágrafo */
    S.slip = {}; S.bdg = {};
    const paras = h("ol", { class: "lc-paras", "aria-hidden": "true" }, C.paragrafos.map((t, i) => {
      const id = "p" + (i + 1);
      const alt = Math.min(Math.round(16 + Math.sqrt(t.length || 100) * 2.4), 120);
      S.bdg[id] = h("span", { class: "lc-badges" });
      S.slip[id] = h("span", { class: "lc-slip", style: "--h:" + alt });
      return h("li", null, S.bdg[id], S.slip[id], h("span", null, String(i + 1)));
    }));
    S.f.s5 = feed("s5", etapaH(4), frase(4), paras);

    /* saída: o que ficou de pé */
    S.f.o0 = feed("o0", h("h3", { class: "lc-out" }, L.titulo));
    const nP = C.perguntas.length;
    const cards = h("ol", { class: "lc-pqs" }, C.perguntas.map((p) => {
      const T = L.perguntas[p.n];
      const id = "lc-tr" + p.n;
      const bq = h("blockquote", { class: "lc-trecho", id, lang: "pt-BR", hidden: true }, p.trecho);
      const tog = html("button", { type: "button", class: "lc-tog", "aria-expanded": "false", "aria-controls": id }, ICO.seta + "<span></span>");
      tog.lastChild.textContent = L.trecho;
      tog.addEventListener("click", () => {
        const aberto = tog.getAttribute("aria-expanded") === "true";
        tog.setAttribute("aria-expanded", String(!aberto));
        bq.hidden = aberto;
      });
      return h("li", { class: "lc-pq" },
        h("span", { class: "lc-pq__n", "aria-hidden": "true" }, String(p.n)),
        h("div", { class: "lc-pq__meta" }, h("span", { class: "arx-sr" }, f(L.pergunta, { n: p.n })),
          h("span", { class: "lc-est" }, L.achado), h("span", null, onde(p.p) + " · " + pl(p.eixos.length, L.eixo))),
        h("p", { class: "lc-pq__tx" }, T.q),
        h("p", { class: "lc-pq__leit" }, L.leitura),
        tog, bq,
        h("ul", { class: "lc-eixos" }, p.eixos.map((e, j) => h("li", null,
          h("span", { class: "lc-eixos__cod" }, e.u),
          h("span", { class: "lc-eixos__desc" }, T.eixos[j][0]),
          h("span", { class: "lc-eixos__enf" }, h("i", null, L.enfrentar), T.eixos[j][1])))));
    }));
    S.f.oe = feed("oe", h("h4", { class: "lc-res" }, f(L.tituloVarias, { n: nP })),
      h("p", { class: "lc-res__sub" }, f(L.contagem, { n: C.decisoes.length })), cards);
    S.f.oc = feed("oc", html("h4", { class: "lc-rub" }, ICO.contrato + "<span></span>"), h("p", { class: "lc-contrato" }, L.contrato));
    S.f.oc.querySelector(".lc-rub span").textContent = L.contratoTitulo;
    S.f.od = feed("od",
      h("div", { class: "lc-cnts" },
        h("div", { class: "lc-cnt lc-cnt--a" }, h("span", { class: "lc-cnt__k" }, h("i", { "aria-hidden": "true" }), L.cont.achados), h("span", { class: "lc-cnt__v" }, String(C.decisoes.length))),
        h("div", { class: "lc-cnt lc-cnt--f" }, h("span", { class: "lc-cnt__k" }, h("i", { "aria-hidden": "true" }), L.cont.afastados), h("span", { class: "lc-cnt__v" }, "0"))),
      h("ul", { class: "lc-leg" },
        h("li", null, h("b", null, L.achado), h("span", null, L.legAchado)),
        h("li", null, h("b", null, L.afastado), h("span", null, L.legAfastado)),
        h("li", null, h("span"), h("span", { class: "lc-leg__nota" }, L.legNota))));
    const ficha = h("dl", { class: "lc-ficha" }, L.ficha.flatMap(([k, val, mono]) => [
      h("dt", null, k),
      h("dd", mono ? { class: "lc-mono" } : null, f(val, { eid: C.episodio, data: C.data[en ? "en" : "pt"], hash: C.hash }))]));
    S.f.ox = feed("ox", html("h4", { class: "lc-rub" }, ICO.execucao + "<span></span>"), ficha);
    S.f.ox.querySelector(".lc-rub span").textContent = L.execucao;
    S.f.og = feed("og", html("div", { class: "lc-serrilha", role: "separator", "aria-hidden": "true" }, '<span class="lc-serrilha__lin"></span>' + ICO.tesoura));

    /* o carro: tracionadores que giram com o comprimento da folha */
    const roda = () => {
      const s = document.createElementNS(SVGNS, "svg");
      s.setAttribute("viewBox", "-15 -15 30 30"); s.classList.add("lc-spr");
      const g = document.createElementNS(SVGNS, "g");
      const el = (tag, at) => { const e = document.createElementNS(SVGNS, tag); for (const [k, v] of Object.entries(at)) e.setAttribute(k, v); g.append(e); };
      for (let i = 0; i < 8; i++) el("rect", { x: -2.6, y: -14, width: 5.2, height: 7, fill: INK, transform: "rotate(" + i * 45 + ")" });
      el("circle", { r: 10, fill: TINT, stroke: INK, "stroke-width": 2.2 });
      el("rect", { x: -3, y: -3, width: 6, height: 6, fill: PAPER, stroke: INK, "stroke-width": 1.8 });
      el("path", { d: "M0 -9.6V-4", stroke: INK, "stroke-width": 1.8, "stroke-linecap": "square" });
      s.append(g);
      return s;
    };
    const sprL = roda(), sprR = roda();
    sprL.classList.add("lc-spr--l"); sprR.classList.add("lc-spr--r");
    S.carro = h("div", { class: "lc-carro ativo", "aria-hidden": "true" }, sprL, h("div", { class: "lc-carro__corpo" }), sprR);
    S.folha = h("div", { class: "lc-folha" }, feeds, S.carro);
    S.giro = () => {
      const ang = ((S.carro.hidden ? S.folha.offsetHeight : S.carro.offsetTop) / (2 * Math.PI * 10)) * 360;
      [sprL, sprR].forEach((s) => s.firstChild.setAttribute("transform", "rotate(" + ang.toFixed(1) + ")"));
    };
    if ("ResizeObserver" in window) { S.ro = new ResizeObserver(() => S.giro()); S.ro.observe(S.folha); }

    const [a, b] = L.distincao.split("≠");
    S.dist = h("p", { class: "lc-dist" }, a.trim(), h("span", { class: "lc-dist__x" }, "≠"), b.trim());
    S.col = h("div", { class: "lc-col" }, h("div", { class: "lc-impw" }, S.imp, S.folha), S.dist);
    /* o símbolo da marca nasce em SVG (um <svg> criado como HTML não o reconheceria) */
    const defs = document.createElement("div");
    defs.innerHTML = '<svg class="lc-defs" aria-hidden="true" focusable="false">' + WM_SYMBOL + "</svg>";
    S.root = h("div", { class: "ld-cena lc" }, defs.firstChild, lado, S.col);
    S.main = S.col;

    visor(S, V.ocioso, "off");
    return S;
  }

  /* --------------------------------------------------------------- peças */
  function visor(S, linhas, estado) {
    S.vz[0].textContent = linhas[0] || ""; S.vz[1].textContent = linhas[1] || ""; S.vz[2].textContent = linhas[2] || "";
    S.root?.setAttribute("data-led", estado || "on");
  }
  function lampada(S, i, est) {
    S.etapasRail[i].className = est;
    const fd = S.f["s" + (i + 1)];
    fd.classList.toggle("is-on", est === "on");
    fd.classList.toggle("is-feita", est === "feita");
  }
  /* uma etapa sai da boca da máquina: a dobra abre e o texto assenta */
  async function sai(S, id, ctx) {
    const fd = S.f[id];
    fd.classList.add("on");
    if (ctx.anim) {
      const fi = fd.querySelector(".lc-fi");
      const p1 = ctx.anima(fd, [{ gridTemplateRows: "0fr" }, { gridTemplateRows: "1fr" }], { duration: 900, easing: MOLA });
      const p2 = ctx.anima(fi, [{ opacity: 0, transform: "translateY(-6px)" }, { opacity: 1, transform: "none" }], { duration: 800, easing: MOLA });
      segue(S, ctx);
      await Promise.all([p1, p2]);
    }
    segue(S, ctx);
  }
  /* a folha cresce para baixo; a leitura acompanha o carro */
  function segue(S, ctx) {
    requestAnimationFrame(() => { S.giro(); mostra(S.col, S.carro.hidden ? S.f.og : S.carro, ctx, 32); });
  }
  const conta = (S) => {
    S.nCand.textContent = pad(S.cand);
    S.progN.textContent = pad(S.cand);
    S.nAch.textContent = String(S.achados);
  };

  /* --------------------------------------------------------------- passos */
  async function admissibilidade(S, ctx) {
    lampada(S, 0, "on");
    visor(S, [V.adm, "", ""], "on");
    await sai(S, "s1", ctx);
    for (const t of L.checagens) {
      const li = h("li", null, html("span", { class: "lc-chk__b" }, ICO.ok), h("span", null, t));
      S.chk.append(li);
      await ctx.entra(li, { y: -4, dur: 420 });
      await ctx.espera(320);
    }
    lampada(S, 0, "feita");
    visor(S, [V.adm, V.admitida, ""], "on");
    segue(S, ctx);
    await ctx.espera(900);
  }
  async function segmentacao(S, ctx) {
    lampada(S, 1, "on");
    visor(S, [V.seg, "", ""], "on");
    await sai(S, "s2", ctx);
    const n = C.paragrafos.length;
    for (let i = 1; i <= n; i++) { S.segN.textContent = pad(i); if (ctx.anim) await ctx.espera(55); }
    S.segH.textContent = C.hash + " · " + C.ref;
    await ctx.entra(S.segH, { y: 0, dur: 500 });
    lampada(S, 1, "feita");
    visor(S, [V.seg, n + " " + L.paragrafos, V.hash], "on");
    await ctx.espera(1100);
  }
  async function formacao(S, ctx) {
    lampada(S, 2, "on");
    visor(S, [V.form, f(V.unidade, { k: 0, t: C.unidades.length }), f(V.candidatos, { n: S.cand })], "on");
    await sai(S, "s3", ctx);
    const T = C.unidades.length;
    for (let k = 0; k < T; k++) {
      const u = C.unidades[k], c = S.cel[u], n = C.formados[u] || 0;
      c.className = "lc-cel ativo";
      visor(S, [V.form, f(V.unidade, { k: k + 1, t: T }), f(V.candidatos, { n: S.cand })], "on");
      await ctx.espera(300);
      c.className = "lc-cel feito" + (n ? "" : " zero");
      c.firstChild.textContent = String(n);
      S.cand += n;
      conta(S);
      await ctx.espera(140);
    }
    lampada(S, 2, "feita");
    visor(S, [V.form, f(V.unidade, { k: T, t: T }), f(V.candidatos, { n: S.cand })], "on");
    await ctx.espera(900);
  }
  async function tribunal(S, ctx) {
    lampada(S, 3, "on");
    visor(S, [V.trib, f(V.decididos, { d: 0, n: C.decisoes.length }), ""], "on");
    S.toks.replaceChildren(...C.decisoes.map(() => h("li", null, h("span", { class: "lc-tok" }))));
    await sai(S, "s4", ctx);
    const toks = [...S.toks.querySelectorAll(".lc-tok")];
    const n = C.decisoes.length;
    for (let i = 0; i < n; i++) {
      const d = C.decisoes[i];
      toks[i].className = "lc-tok cur";
      S.agora.textContent = f(L.agoraConfronto, { u: sigla(d.u), onde: onde(d.p) });
      visor(S, [V.trib, f(V.decididos, { d: i, n }), sigla(d.u) + " · " + onde(d.p)], "on");
      await ctx.espera(560);
      S.agora.textContent = f(L.agoraDecisor, { u: sigla(d.u) });
      await ctx.espera(340);
      toks[i].className = "lc-tok achado";
      const mk = en && C.en.marcadores[d.m] ? C.en.marcadores[d.m] : d.m;
      const li = h("li", null, h("b", null, sigla(d.u)), h("span", null, onde(d.p) + " · " + mk), h("i", null, L.achado));
      S.dec.append(li);
      S.achados++;
      conta(S);
      visor(S, [V.trib, f(V.decididos, { d: i + 1, n }), pl(S.achados, [L.achado.toLowerCase(), L.cont.achados.toLowerCase()]) + " · 0 " + L.cont.afastados.toLowerCase()], "on");
      await ctx.entra(li, { y: -6, dur: 500 });
      segue(S, ctx);
      await ctx.espera(180);
    }
    S.agora.textContent = "";
    lampada(S, 3, "feita");
    await ctx.espera(900);
  }
  async function consolidacao(S, ctx) {
    lampada(S, 4, "on");
    visor(S, [V.cons, V.formulando, ""], "on");
    await sai(S, "s5", ctx);
    await ctx.espera(700);
    for (const p of C.perguntas) {
      S.slip[p.p].classList.add("mk");
      const b = h("span", { class: "lc-bdg" }, String(p.n));
      S.bdg[p.p].append(b);
      S.atoTxt.querySelector('[data-p="' + p.p + '"]')?.classList.add("tem");
      await ctx.anima(b, [{ transform: "scale(.2)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 360, easing: MOLA });
      await ctx.espera(380);
    }
    lampada(S, 4, "feita");
    visor(S, [V.cons, f(V.perguntas, { n: C.perguntas.length }), V.porTrecho], "on");
    await ctx.espera(1000);
  }
  async function saida(S, ctx) {
    S.imp.classList.remove("ativo");
    for (const id of ["o0", "oe", "oc", "od", "ox"]) {
      await sai(S, id, ctx);
      if (id === "oe") await ctx.leitura(60, 2400);
      else await ctx.espera(220);
    }
    S.carro.hidden = true;
    S.carro.classList.remove("ativo");
    S.folha.classList.add("fim");
    await sai(S, "og", ctx);
    visor(S, [V.concluida, f(V.perguntas, { n: C.perguntas.length }), V.aResponder], "ok");
    S.dist.classList.add("on");
    await ctx.entra(S.dist, { y: 8, dur: 620 });
    mostra(S.col, S.dist, ctx, 32);
    await ctx.espera(1400);
  }

  return {
    monta,
    passos: [admissibilidade, segmentacao, formacao, tribunal, consolidacao, saida],
    nomes: L.passos,
    linha: L.linha,
    rastro: L.rastro,
    /* chegada do atalho: a nota vai para o trilho, no lugar de acompanhamento */
    saltado(S, no) { S.saltado.replaceChildren(no); }
  };
}
