/* ==========================================================================
   ATRIO: a jornada no painel Legal Engineering.
   O caso é o rei. A cada jogada, a IA lança (as casas escuras tomam o accent
   do ATRIO, o mostrador da IA corre, a registradora imprime) e passa a vez;
   o humano bate o relógio para validar, e a registradora imprime o lance
   humano. No RATIO a RI_04 é a escolha da rota; na TROIA o humano não joga:
   três rivais entram e dão xeque, com o estado dos julgadores. Quando a
   folha chega ao tabuleiro, a registradora a corta e a guarda sob o
   tabuleiro. O seletor leva a qualquer módulo (o que vem antes é impresso
   de uma vez). Dados em jornada-dados.js.
   ========================================================================== */
(() => {
  "use strict";
  const raiz = document.querySelector("[data-aj]");
  const BASE = window.ATRIO_JORNADA;
  if (!raiz || !BASE) return;

  const EN = (document.documentElement.lang || "").toLowerCase().startsWith("en");
  const T = EN ? BASE.en : BASE.pt;
  const J = T.jogadas;
  const ESC = (BASE.escolhas && (EN ? BASE.escolhas.en : BASE.escolhas.pt)) || [];
  const U = EN ? {
    k: { pronto: "Your move", ia: "AI's turn: wait for its move", humano: "Your move", troia: "TROIA's turn", fim: "End of the path" },
    caso: "Case 0012345 · fictional",
    resumo: "Someone called Christian pretending to be the bank. He gave a code, and in the small hours R$ 10,000.00 left his account. Who pays?",
    comecaP: "The case enters the board. You play the human: read the excerpt, choose, press the clock.",
    comeca: "Start", bate: "Press the clock", seguir: "Next",
    troiaP: "TROIA plays alone. The human only watches the rivals.",
    fimQ: "Legality holds. The half split is unstable. The draft goes on to CERNE for audit.",
    fimP: "Contest ≠ audit.", recomeca: "Restart", escolhaFeita: "Press the clock to confirm.",
    letras: "ABC"
  } : {
    k: { pronto: "Sua jogada", ia: "Vez da IA: aguarde o lance", humano: "Sua jogada", troia: "Vez da TROIA", fim: "Fim do percurso" },
    caso: "Caso 0012345 · fictício",
    resumo: "Alguém ligou para o Christian fingindo ser do banco. Ele passou um código, e de madrugada saíram R$ 10.000,00 da conta. Quem paga?",
    comecaP: "O caso entra no tabuleiro. Você joga como humano: lê o trecho, escolhe, bate o relógio.",
    comeca: "Começar", bate: "Bater o relógio", seguir: "Seguir",
    troiaP: "A TROIA joga sozinha. O humano só acompanha as rivais.",
    fimQ: "A legalidade resiste. A divisão em metade fica instável. A minuta segue para o CERNE, para auditoria.",
    fimP: "Contrariar ≠ auditar.", recomeca: "Recomeçar", escolhaFeita: "Bata o relógio para confirmar.",
    letras: "ABC"
  };
  const reduz = matchMedia("(prefers-reduced-motion: reduce)");
  const $ = (s) => raiz.querySelector(s);

  const papel = $(".aj-papel"), rolo0 = $(".aj-rolo");
  const tab = $(".aj-tab"), casasEl = $(".aj-casas"), pecasEl = $(".aj-pecas"), linhas = $(".aj-linhas");
  const botao = $('[data-dono="humano"]');
  const txtIA = $("[data-aj-ia]"), txtHum = $("[data-aj-humano]");
  const status = $(".aj-relogio__status"), conta = $(".aj-relogio__conta");
  const vivo = $(".aj-vivo");
  const mods = [...raiz.querySelectorAll(".aj-mod")];
  const arq = $(".aj-arq"), arqDet = $(".aj-arq details"), arqN = $(".aj-arq__n"), folhasEl = $(".aj-folhas");
  const btnMinuta = $("[data-aj-minuta]"), lnkCerne = $("[data-aj-cerne]");
  const dlg = $(".aj-minuta");
  if (!papel || !rolo0 || !tab || !botao) return;

  /* ---------- o botão da IA: cópia decorativa do botão humano ---------- */
  const botaoIA = document.createElement("span");
  botaoIA.className = botao.className;
  botaoIA.dataset.dono = "ia";
  botaoIA.setAttribute("aria-hidden", "true");
  botaoIA.append(botao.firstElementChild.cloneNode(true));
  botao.before(botaoIA);
  for (const veu of raiz.querySelectorAll(".aj-relogio__veu")) {
    const sombra = veu.cloneNode(false);
    sombra.setAttribute("class", "aj-relogio__sombra");
    veu.before(sombra);
  }

  /* ---------- tabuleiro ---------- */
  const FILES = "abcdefgh";
  const pos = (c) => ({ x: FILES.indexOf(c[0]), y: 8 - Number(c[1]) });
  const casas = {};
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    const c = FILES[x] + (8 - y);
    const el = document.createElement("div");
    el.className = "aj-casa";
    el.dataset.c = c;
    if ((x + y) % 2) el.dataset.esc = "";
    casas[c] = el;
    casasEl.append(el);
  }
  const SVG = "http://www.w3.org/2000/svg";
  linhas.setAttribute("viewBox", "0 0 8 8");
  linhas.setAttribute("preserveAspectRatio", "none");
  const trilha = document.createElementNS(SVG, "polyline");
  trilha.setAttribute("class", "aj-trilha");
  linhas.append(trilha);

  const img = (nome) => {
    const i = document.createElement("img");
    i.src = (EN ? "../" : "") + "assets/atrio/brand/" + nome + ".svg";
    i.alt = ""; i.decoding = "async";
    return i;
  };
  const peca = (classe, nome) => {
    const p = document.createElement("span");
    p.className = "aj-peca " + classe;
    const f = document.createElement("span");
    f.className = "aj-peca__f";
    f.append(img(nome));
    p.append(f);
    return p;
  };
  const rei = peca("aj-peca--rei", "atrio-rei");
  rei.hidden = true;
  pecasEl.append(rei);
  const rivais = [];

  const poe = (peca, c) => { const p = pos(c); peca.style.setProperty("--x", p.x); peca.style.setProperty("--y", p.y); };
  /* rótulo de pé na frente da casa */
  const tags = {};
  const rotula = (c, n, texto, extra, classe) => {
    tags[c]?.remove();
    const t = document.createElement("span");
    t.className = "aj-tag" + (classe ? " " + classe : "");
    poe(t, c);
    const f = document.createElement("span");
    f.className = "aj-tag__f";
    f.innerHTML = (n ? "<b>" + n + "</b>" : "") + "<span>" + esc(texto) + "</span>" + (extra || "");
    t.append(f);
    pecasEl.append(t);
    tags[c] = t;
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  const pontos = [];
  const anda = (c) => {
    rei.hidden = false;
    poe(rei, c);
    const p = pos(c);
    const ult = pontos[pontos.length - 1];
    if (!ult || ult[0] !== p.x || ult[1] !== p.y) pontos.push([p.x, p.y]);
    trilha.setAttribute("points", pontos.map(([x, y]) => (x + .5) + "," + (y + .5)).join(" "));
  };

  /* ---------- a vez do humano: trecho do caso e escolha ---------- */
  const vezEl = $(".aj-vez");
  const V = vezEl ? {
    k: vezEl.querySelector(".aj-vez__k"), peca: vezEl.querySelector(".aj-vez__peca"), q: vezEl.querySelector(".aj-vez__q"),
    p: vezEl.querySelector(".aj-vez__p"), ops: vezEl.querySelector(".aj-vez__ops"), dica: vezEl.querySelector(".aj-vez__dica"),
    bate: vezEl.querySelector(".aj-vez__bate")
  } : null;
  if (V) {
    V.expl = document.createElement("div");
    V.expl.className = "aj-vez__expl";
    V.p.before(V.expl);
  }
  /* texto, lista de tópicos ou nós prontos */
  function conteudo(x) {
    if (x == null) return [];
    if (x instanceof Node) return [x];
    if (Array.isArray(x)) {
      const ul = document.createElement("ul");
      ul.className = "aj-vez__lista";
      x.forEach((t) => { const li = document.createElement("li"); li.textContent = t; ul.append(li); });
      return [ul];
    }
    return [document.createTextNode(x)];
  }
  /* os nomes riscados e trocados por código */
  function trocas(lista) {
    const d = document.createElement("div");
    d.className = "aj-troca";
    lista.forEach(([nome, cod], n) => {
      const l = document.createElement("p");
      l.className = "aj-troca__l";
      l.style.setProperty("--n", n);
      l.innerHTML = "<s>" + esc(nome) + '</s><span class="aj-troca__cod"><span class="aj-troca__seta" aria-hidden="true">→</span><b>' + esc(cod) + "</b></span>";
      d.append(l);
    });
    return d;
  }
  let liberado = false;
  function painel(estado, o) {
    if (!V) return;
    vezEl.dataset.estado = estado;
    V.k.textContent = o.k;
    if (o.peca !== undefined) {
      V.peca.textContent = o.peca;
      V.q.replaceChildren(...conteudo(o.q));
      V.p.textContent = o.p;
      V.expl.replaceChildren(...(o.expl ? conteudo(o.expl) : []));
    }
    if (o.ops !== undefined) V.ops.replaceChildren(...o.ops);
    V.dica.textContent = "";
    V.bate.hidden = !o.bate;
    if (o.bate) { V.bate.textContent = o.bate; V.bate.disabled = !!o.trava; }
  }
  function opcoes(k, e) {
    return e.opcoes.map((txt, n) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "aj-op";
      b.innerHTML = '<span class="aj-op__l" aria-hidden="true">' + U.letras[n] + "</span><span>" + esc(txt) + "</span>";
      b.addEventListener("click", () => escolhe(k, e, n, b));
      return b;
    });
  }
  function escolhe(k, e, n, b) {
    if (vez !== "humano" || liberado) return;
    if (n === e.certa) {
      liberado = true;
      b.dataset.res = "certa";
      b.setAttribute("aria-pressed", "true");
      V.ops.querySelectorAll(".aj-op").forEach((x) => { x.disabled = true; });
      V.dica.textContent = "";
      V.bate.disabled = false;
      botao.disabled = false;
      poeStatus(U.escolhaFeita);
      anuncia(U.escolhaFeita);
      V.bate.focus({ preventScroll: true });
    } else {
      b.dataset.res = "errada";
      b.disabled = true;
      V.dica.textContent = e.dica;
    }
  }

  /* ---------- relógio, vez e módulo ---------- */
  let vez = "pronto";
  const dizRelogio = (par) => { txtIA.textContent = par[0]; txtHum.textContent = par[1]; };
  function poeVez(v, j) {
    vez = v;
    raiz.dataset.vez = v === "humano" || v === "pronto" || v === "fim" ? (v === "humano" ? "humano" : "nenhuma") : "ia";
    const troia = j && j.mod === "troia" && !j.humano;
    if (v === "pronto") dizRelogio(T.relogio.pronto);
    else if (v === "ia") dizRelogio(troia ? T.relogio.troia : T.relogio.ia);
    else if (v === "humano") dizRelogio(troia ? [T.relogio.troia[0], T.relogio.humano[1]] : T.relogio.humano);
    else dizRelogio(T.relogio.fim);
    const livre = v === "pronto" || v === "fim" || (v === "humano" && liberado);
    botao.disabled = !livre;
    const rot = v === "pronto" ? T.relogio.pronto[1] : v === "fim" ? T.recomecar : v === "humano" ? j.botao : T.relogio.botaoTrava;
    botao.setAttribute("aria-label", rot);
    botao.title = rot;
  }
  const poeStatus = (s) => { status.textContent = s; };
  const poeConta = (k) => { conta.textContent = String(k).padStart(2, "0") + " / " + String(J.length).padStart(2, "0"); };
  function poeMod(m) {
    raiz.dataset.mod = m;
    mods.forEach((b) => { if (b.dataset.mod === m) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); });
  }
  const anuncia = (s) => { vivo.textContent = ""; requestAnimationFrame(() => { vivo.textContent = s; }); };

  /* ---------- registradora: imprime, corta, guarda ---------- */
  let rolo = rolo0, nFolha = 1, guardadas = 0;
  const cabecalho = () => {
    const p = document.createElement("p");
    p.className = "aj-cab";
    p.textContent = nFolha === 1 ? T.cabeca : T.arquivo.folha + " " + nFolha;
    return p;
  };
  rolo.append(cabecalho());

  function guarda(conteudo) {
    folhasEl.querySelector(".aj-folhas__vazio")?.remove();
    const f = document.createElement("article");
    f.className = "aj-folha";
    const n = document.createElement("p");
    n.className = "aj-folha__n";
    n.textContent = T.arquivo.folha + " " + nFolha;
    f.append(n, ...conteudo);
    folhasEl.append(f);
    guardadas++;
    arqN.textContent = guardadas;
    arqN.classList.remove("is-novo"); void arqN.offsetWidth; arqN.classList.add("is-novo");
    ajustaArq();
  }

  function corta(instantaneo) {
    const velhos = [...rolo.children];
    const fica = velhos.pop();               // a entrada que não coube segue para a folha nova
    guarda(velhos.map((n) => n.cloneNode(true)).filter((n) => !n.classList.contains("aj-cab")));
    if (!instantaneo && !reduz.matches) {
      const cai = rolo.cloneNode(true);
      cai.lastElementChild?.remove();
      Object.assign(cai.style, { position: "absolute", left: "20px", right: "20px", top: "12px" });
      cai.classList.add("is-corte");
      papel.classList.add("is-corte");
      papel.append(cai);
      setTimeout(() => { cai.remove(); papel.classList.remove("is-corte"); }, 520);
    }
    velhos.forEach((n) => n.remove());
    nFolha++;
    rolo.prepend(cabecalho());
    return fica;
  }

  /* põe a entrada no rolo; se a folha passa do tabuleiro, corta antes */
  function coloca(el, instantaneo) {
    el.style.visibility = "hidden";
    rolo.append(el);
    if (papel.scrollHeight > papel.clientHeight + 1 && rolo.children.length > 2) corta(instantaneo);
    el.style.visibility = "";
  }

  let geracao = 0;
  const espera = (ms, g) => new Promise((res, rej) => setTimeout(() => (g === geracao ? res() : rej(PARA)), reduz.matches ? Math.min(ms, 60) : ms));
  const PARA = Symbol("para");

  async function digita(el, texto, g, instantaneo) {
    if (instantaneo || reduz.matches) { el.textContent = texto; return; }
    el.dataset.digita = "";
    raiz.dataset.imprime = "true";
    for (let i = 1; i <= texto.length; i += 2) {
      el.textContent = texto.slice(0, i);
      await espera(14, g);
    }
    el.textContent = texto;
    delete el.dataset.digita;
    raiz.dataset.imprime = "false";
  }

  function entradaIA(k, j) {
    const e = document.createElement("div");
    e.className = "aj-e";
    const h = document.createElement("p");
    h.className = "aj-e__h";
    const quem = j.rival ? T.rotulos.troia : T.rotulos.ia;
    h.innerHTML = "<b>" + String(k + 1).padStart(2, "0") + "</b><span>" + (j.depois || j.rival?.casa || j.casa) + "</span><span>" + esc(T.modulos[j.mod].nome) + "</span><span class=\"aj-e__q\">" + esc(quem) + "</span>";
    const t = document.createElement("p");
    t.className = "aj-e__t";
    e.append(h, t);
    return { e, t };
  }

  /* ---------- lances ---------- */
  function lanceIA(k, j) {
    if (j.rival) {
      const r = peca("aj-peca--rival", "troia-cavalo");
      r.dataset.estado = j.rival.estado;
      poe(r, j.rival.casa);
      pecasEl.append(r);
      rivais.push(r);
      const a = pos(j.rival.casa), b = pos(j.casa);
      const l = document.createElementNS(SVG, "line");
      l.setAttribute("class", "aj-ataque aj-ataque--" + j.rival.estado);
      l.setAttribute("x1", a.x + .5); l.setAttribute("y1", a.y + .5);
      l.setAttribute("x2", b.x + .5); l.setAttribute("y2", b.y + .5);
      linhas.append(l);
      rotula(j.rival.casa, String(k + 1).padStart(2, "0"), j.rival.rotulo,
        ' <span class="aj-e__est aj-e__est--' + j.rival.estado + '">' + esc(T.estados[j.rival.estado]) + "</span>");
    } else if (j.rotas) {
      j.rotas.forEach((r) => { casas[r.casa].dataset.rota = "aberta"; rotula(r.casa, "", r.r); });
    } else {
      anda(j.casa);
      rotula(j.casa, String(k + 1).padStart(2, "0"), j.rotulo);
    }
  }
  function lanceHumano(k, j) {
    if (j.rotas) {
      j.rotas.forEach((r) => {
        casas[r.casa].dataset.rota = r.escolha ? "escolha" : "descartada";
        if (!r.escolha) rotula(r.casa, "", r.r, "", "aj-tag--descartada");
      });
      anda(j.depois);
      rotula(j.depois, String(k + 1).padStart(2, "0"), j.rotulo);
    }
    if (j.saida) rei.classList.add("is-saida");
  }

  let aguarda = null;
  const vezHumana = (j) => new Promise((res) => { aguarda = res; });

  async function passo(k, g, instantaneo) {
    const j = J[k];
    poeMod(j.mod);
    poeConta(k + 1);
    if (!instantaneo) painel("ia", { k: U.k.ia, bate: "" });
    poeVez("ia", j);
    poeStatus(T.status.ia);
    lanceIA(k, j);
    const { e, t } = entradaIA(k, j);
    coloca(e, instantaneo);
    await digita(t, j.ia, g, instantaneo);
    if (!instantaneo) anuncia(j.ia);
    if (!instantaneo) {
      await espera(420, g);
      const e = ESC[k];
      const semEscolha = !e || !e.opcoes;
      liberado = semEscolha;
      const kk = U.k.humano + " · " + (j.rotulo || "");
      if (e && e.tipo === "troca") painel("humano", { k: kk, peca: e.peca, q: trocas(e.trocas), expl: e.explica, p: e.pergunta, ops: [], bate: U.bate });
      else if (e && e.tipo === "bater") painel("humano", { k: kk, peca: e.peca, q: e.trecho, p: e.pergunta, ops: [], bate: U.bate });
      else if (e) painel("humano", { k: kk, peca: e.peca, q: e.trecho, p: e.pergunta, ops: opcoes(k, e), bate: U.bate, trava: true });
      else painel("troia", { k: U.k.troia, peca: j.rival ? j.rival.rotulo : "", q: j.ia, p: U.troiaP, ops: [], bate: U.seguir });
      poeVez("humano", j);
      poeStatus(e ? e.pergunta : j.pede);
      if (semEscolha) V?.bate.focus({ preventScroll: true });
      await vezHumana(j);
      if (g !== geracao) throw PARA;
    }
    lanceHumano(k, j);
    if (j.humano) {
      const h = document.createElement("p");
      h.className = "aj-e__hum";
      h.innerHTML = "<span>" + esc(T.rotulos.humano) + "</span>";
      const s = document.createElement("span");
      s.style.cssText = "all:unset";
      h.append(s);
      e.append(h);
      if (papel.scrollHeight > papel.clientHeight + 1 && rolo.children.length > 2) {
        rolo.lastElementChild.remove();
        coloca(e, instantaneo);
      }
      await digita(s, j.humano, g, instantaneo);
      if (!instantaneo) anuncia(T.rotulos.humano + ": " + j.humano);
    }
  }

  function fim() {
    poeVez("fim");
    poeStatus(T.status.fim);
    painel("fim", { k: U.k.fim, peca: U.caso, q: U.fimQ, p: U.fimP, ops: [], bate: U.recomeca });
    const p = document.createElement("p");
    p.className = "aj-e__fim";
    p.innerHTML = '<a href="#ai-governance" data-hm-go>' + esc(T.arquivo.cerne) + "</a>";
    coloca(p, false);
    btnMinuta.hidden = false;
    lnkCerne.hidden = false;
    anuncia(T.status.fim);
  }

  async function roda(desde) {
    const g = geracao;
    try {
      for (let k = desde; k < J.length; k++) {
        await passo(k, g, false);
        if (g !== geracao) return;
        await espera(380, g);
      }
      fim();
    } catch (err) { if (err !== PARA) throw err; }
  }

  function zera() {
    geracao++;
    aguarda = null;
    raiz.dataset.imprime = "false";
    rolo.replaceChildren();
    papel.querySelectorAll(".is-corte").forEach((n) => n.remove());
    papel.classList.remove("is-corte");
    nFolha = 1; guardadas = 0;
    rolo.append(cabecalho());
    folhasEl.replaceChildren();
    const v = document.createElement("p");
    v.className = "aj-folhas__vazio";
    v.textContent = T.arquivo.vazio;
    folhasEl.append(v);
    arqN.textContent = "0";
    Object.values(casas).forEach((c) => { delete c.dataset.rota; });
    Object.keys(tags).forEach((c) => { tags[c].remove(); delete tags[c]; });
    rivais.splice(0).forEach((r) => r.remove());
    linhas.querySelectorAll(".aj-ataque").forEach((l) => l.remove());
    pontos.length = 0;
    trilha.setAttribute("points", "");
    rei.hidden = true;
    rei.classList.remove("is-saida");
    btnMinuta.hidden = true;
    lnkCerne.hidden = true;
    ajustaArq();
  }

  function comeca(desde) {
    zera();
    const g = geracao;
    (async () => {
      try {
        for (let k = 0; k < desde; k++) await passo(k, g, true);
      } catch (err) { if (err !== PARA) throw err; return; }
      roda(desde);
    })();
  }

  /* ---------- controles ---------- */
  function bate() {
    if (vez === "pronto" || vez === "fim") { comeca(0); return; }
    if (vez === "humano" && liberado && aguarda) { const r = aguarda; aguarda = null; liberado = false; poeVez("ia", null); r(); }
  }
  botao.addEventListener("click", bate);
  V?.bate.addEventListener("click", bate);
  mods.forEach((b) => b.addEventListener("click", () => {
    const k = J.findIndex((j) => j.mod === b.dataset.mod);
    if (k >= 0) comeca(k);
  }));
  document.querySelectorAll("[data-aj-ir]").forEach((a) => a.addEventListener("click", () => {
    const k = J.findIndex((j) => j.mod === a.dataset.ajIr);
    if (k >= 0) comeca(k);
  }));

  /* a minuta */
  if (dlg) {
    const t = dlg.querySelector(".aj-minuta__t");
    t.replaceChildren(...BASE.minuta.map((s) => { const p = document.createElement("p"); p.textContent = s; return p; }));
    btnMinuta.addEventListener("click", () => dlg.showModal());
    dlg.querySelector("[data-aj-fecha]").addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  }

  /* ---------- as folhas guardadas fecham em quadrados inteiros ---------- */
  function ajustaArq() {
    if (!arq) return;
    arq.style.minHeight = "";
    const c = (raiz.closest(".hm-panel") || raiz).getBoundingClientRect().width / 8;
    if (!(c > 0)) return;
    const h = arq.getBoundingClientRect().height;
    arq.style.minHeight = Math.max(1, Math.ceil((h - .5) / c)) * c + "px";
    arq.dispatchEvent(new Event("toggle"));   // o painel refaz as fileiras (arco-home.js)
  }
  arqDet?.addEventListener("toggle", () => { arqN.classList.remove("is-novo"); ajustaArq(); });
  let largura = 0;
  new ResizeObserver(() => {
    const w = tab.getBoundingClientRect().width;
    if (Math.abs(w - largura) < .5) return;
    largura = w;
    ajustaArq();
  }).observe(tab);

  /* ---------- a borda do fundo da mesa: onde pousam relógio, registradora e seletor ---------- */
  const palco = $(".aj-palco");
  function medeFundo() {
    const p = palco.getBoundingClientRect(), a = casas.a8.getBoundingClientRect();
    if (!p.height) return;
    raiz.style.setProperty("--aj-fundo", (a.top - p.top).toFixed(1) + "px");
  }
  new ResizeObserver(medeFundo).observe(palco);
  medeFundo();

  /* ---------- estado inicial ---------- */
  zera();
  poeMod("atrio");
  poeConta(0);
  poeVez("pronto");
  poeStatus(T.status.pronto);
  painel("pronto", { k: U.k.pronto, peca: U.caso, q: U.resumo, p: U.comecaP, ops: [], bate: U.comeca });
})();
