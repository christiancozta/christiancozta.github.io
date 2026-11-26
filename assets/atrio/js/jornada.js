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

  /* ---------- a registradora: gravura a traço, em SVG (fonte única para PT e EN) ----------
     Visor com a conta e o módulo; rolo de papel sob a tampa; placa, LED e
     teclado; a janela da cabeça de impressão e a fenda de onde a folha desce. */
  const imp = $(".aj-imp");
  let visorConta = null, visorMod = null;
  if (imp) {
    const teclas = [];
    for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) {
      const x = 216 + c * 28, y = 80 + r * 19, ac = r === 1 && c === 4;
      teclas.push('<g class="aj-imp__tecla' + (ac ? " aj-imp__tecla--total" : "") + '"><rect class="aj-imp__base" x="' + x + '" y="' + (y + 2) + '" width="22" height="13" rx="3"/><rect class="aj-imp__cara" x="' + x + '" y="' + y + '" width="22" height="13" rx="3"/></g>');
    }
    imp.innerHTML =
      '<svg viewBox="0 0 400 190" focusable="false" aria-hidden="true">' +
      '<defs>' +
        '<pattern id="aj-reg-v" width="3.2" height="8" patternUnits="userSpaceOnUse"><rect width=".8" height="8"/></pattern>' +
        '<pattern id="aj-reg-h" width="8" height="3" patternUnits="userSpaceOnUse"><rect width="8" height=".7"/></pattern>' +
        '<pattern id="aj-reg-d" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><rect width=".8" height="4"/></pattern>' +
        '<clipPath id="aj-reg-rolo"><rect x="222" y="34" width="132" height="24" rx="12"/></clipPath>' +
      '</defs>' +
      /* visor */
      '<path class="aj-imp__l" d="M44 66V22a8 8 0 0 1 8-8h134a8 8 0 0 1 8 8v44"/>' +
      '<rect class="aj-imp__sombra" x="184" y="18" width="8" height="48"/>' +
      '<rect class="aj-imp__visor" x="52" y="23" width="128" height="32" rx="2"/>' +
      '<text class="aj-imp__conta" x="60" y="43.5">00 / 00</text>' +
      '<text class="aj-imp__mod" x="172" y="43.5" text-anchor="end"></text>' +
      /* tampa e rolo de papel */
      '<path class="aj-imp__l" d="M210 66V36a10 10 0 0 1 10-10h136a10 10 0 0 1 10 10v30"/>' +
      '<rect class="aj-imp__papelrolo" x="222" y="34" width="132" height="24" rx="12"/>' +
      '<g clip-path="url(#aj-reg-rolo)"><g class="aj-imp__giro"><rect class="aj-imp__hh" x="222" y="22" width="132" height="48"/></g></g>' +
      '<rect class="aj-imp__fio" x="222" y="34" width="132" height="24" rx="12"/>' +
      '<line class="aj-imp__fino" x1="236" y1="34" x2="236" y2="58"/><line class="aj-imp__fino" x1="340" y1="34" x2="340" y2="58"/>' +
      /* corpo */
      '<path class="aj-imp__l" d="M24 160V78a12 12 0 0 1 12-12h328a12 12 0 0 1 12 12v82z"/>' +
      '<rect class="aj-imp__lado" x="356" y="70" width="17" height="90"/>' +
      '<line class="aj-imp__fio" x1="356" y1="68" x2="356" y2="160"/>' +
      '<rect class="aj-imp__lado" x="27" y="70" width="7" height="90"/>' +
      /* placa com parafusos */
      '<rect class="aj-imp__placa" x="44" y="80" width="112" height="30" rx="2"/>' +
      '<circle class="aj-imp__paraf" cx="51" cy="95" r="2.6"/><circle class="aj-imp__paraf" cx="149" cy="95" r="2.6"/>' +
      '<text class="aj-imp__marca" x="100" y="100" text-anchor="middle">AT<tspan>R</tspan>IO</text>' +
      '<circle class="aj-imp__led" cx="178" cy="95" r="4.5"/>' +
      teclas.join("") +
      /* janela da cabeça de impressão */
      '<rect class="aj-imp__janela" x="60" y="122" width="280" height="14" rx="2"/>' +
      '<line class="aj-imp__fino" x1="66" y1="129" x2="334" y2="129"/>' +
      '<g class="aj-imp__cabeca"><rect x="66" y="124.5" width="22" height="9" rx="1.5"/></g>' +
      /* fenda */
      '<rect class="aj-imp__fenda" x="36" y="145" width="328" height="10" rx="5"/>' +
      '<line class="aj-imp__boca" x1="44" y1="150" x2="356" y2="150"/>' +
      /* base e pés */
      '<rect class="aj-imp__plinto" x="12" y="160" width="376" height="16" rx="3"/>' +
      '<rect class="aj-imp__l" x="30" y="176" width="34" height="7" rx="1.5"/><rect class="aj-imp__l" x="336" y="176" width="34" height="7" rx="1.5"/>' +
      '</svg>';
    visorConta = imp.querySelector(".aj-imp__conta");
    visorMod = imp.querySelector(".aj-imp__mod");
  }

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
    /* o mostrador corre: um arco que avança em sessenta passos, como o segundo */
    const cx = veu.getAttribute("cx"), cy = veu.getAttribute("cy");
    const anel = document.createElementNS("http://www.w3.org/2000/svg", "g");
    anel.setAttribute("class", "aj-relogio__anel");
    anel.innerHTML = '<circle class="aj-relogio__pista" cx="' + cx + '" cy="' + cy + '" r="178"/>' +
      '<circle class="aj-relogio__seg" cx="' + cx + '" cy="' + cy + '" r="178" pathLength="60"/>';
    veu.after(anel);
  }

  /* ---------- tabuleiro ---------- */
  const FILES = "abcdefgh";
  const pos = (c) => ({ x: FILES.indexOf(c[0]), y: 8 - Number(c[1]) });
  /* a moldura: borda gravada, coordenadas e a espessura da frente */
  const moldura = document.createElement("div");
  moldura.className = "aj-moldura";
  for (let i = 0; i < 8; i++) {
    const f = document.createElement("span");
    f.className = "aj-coord aj-coord--f";
    f.style.setProperty("--i", i);
    f.textContent = FILES[i];
    const r = document.createElement("span");
    r.className = "aj-coord aj-coord--r";
    r.style.setProperty("--i", i);
    r.textContent = 8 - i;
    moldura.append(f, r);
  }
  casasEl.before(moldura);
  const casas = {};
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    const c = FILES[x] + (8 - y);
    const el = document.createElement("div");
    el.className = "aj-casa";
    el.dataset.c = c;
    el.style.setProperty("--d", x + y);     // a vez da IA varre a mesa em diagonal
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
    const p = pos(c);
    const ult = pontos[pontos.length - 1];
    /* o rei se ergue da casa e pousa na seguinte */
    if (!rei.hidden && ult && (ult[0] !== p.x || ult[1] !== p.y) && !reduz.matches) {
      rei.classList.remove("is-anda"); void rei.offsetWidth; rei.classList.add("is-anda");
    }
    rei.hidden = false;
    poe(rei, c);
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
  const poeConta = (k) => {
    conta.textContent = String(k).padStart(2, "0") + " / " + String(J.length).padStart(2, "0");
    if (visorConta) visorConta.textContent = conta.textContent;
  };
  function poeMod(m) {
    raiz.dataset.mod = m;
    if (visorMod) visorMod.textContent = (T.modulos[m] && T.modulos[m].nome) || m.toUpperCase();
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

  /* a folha sai da fenda em linhas: a altura acompanha o que já foi impresso,
     em passos de uma linha do quadriculado (16px), até o teto; o que passa
     do teto é cortado antes de imprimir */
  const LINHA = 16;
  const medidas = () => {
    const cs = getComputedStyle(papel);
    return { pad: parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom), teto: parseFloat(cs.maxHeight) || Infinity, base: parseFloat(cs.minHeight) || 0 };
  };
  const excede = () => { const m = medidas(); return rolo.offsetHeight + m.pad > m.teto + 1; };
  let aposCorte = false;                    // depois do corte, a folha nova volta curta de uma vez
  function ajustaPapel(seco) {
    seco = seco || aposCorte;
    aposCorte = false;
    const m = medidas();
    const alvo = Math.min(m.teto, Math.max(m.base, Math.ceil((rolo.offsetHeight + m.pad) / LINHA) * LINHA));
    if (seco) papel.style.transition = "none";
    papel.style.height = alvo + "px";
    if (seco) { void papel.offsetHeight; papel.style.transition = ""; }
  }
  /* antes do jogo, a folha fica recolhida na fenda: só a ponta serrilhada */
  function recolhe() {
    papel.style.transition = "none";
    papel.style.height = "";
    papel.classList.add("is-recolhida");
    void papel.offsetHeight;
    papel.style.transition = "";
  }

  function corta(instantaneo) {
    const velhos = [...rolo.children];
    const fica = velhos.pop();               // a entrada que não coube segue para a folha nova
    guarda(velhos.map((n) => n.cloneNode(true)).filter((n) => !n.classList.contains("aj-cab")));
    if (!instantaneo && !reduz.matches) {
      /* o pedaço impresso se solta da registradora e cai */
      const cai = papel.cloneNode(true);
      cai.removeAttribute("aria-label");
      cai.setAttribute("aria-hidden", "true");
      cai.querySelector(".aj-rolo")?.lastElementChild?.remove();
      cai.classList.add("aj-papel--caida");
      Object.assign(cai.style, { left: papel.offsetLeft + "px", top: papel.offsetTop + "px", width: papel.offsetWidth + "px", height: papel.offsetHeight + "px", margin: 0 });
      papel.after(cai);
      setTimeout(() => cai.remove(), 900);
    }
    velhos.forEach((n) => n.remove());
    nFolha++;
    rolo.prepend(cabecalho());
    aposCorte = true;
    return fica;
  }

  /* põe a entrada no rolo (já medida com o texto inteiro); se a folha passaria
     do teto, corta antes */
  function coloca(el, instantaneo) {
    el.style.visibility = "hidden";
    rolo.append(el);
    if (excede() && rolo.children.length > 2) corta(instantaneo);
    el.style.visibility = "";
  }

  let geracao = 0;
  const espera = (ms, g) => new Promise((res, rej) => setTimeout(() => (g === geracao ? res() : rej(PARA)), reduz.matches ? Math.min(ms, 60) : ms));
  const PARA = Symbol("para");

  /* imprime caractere a caractere; a folha avança a cada linha nova */
  async function digita(el, texto, g, instantaneo, ritmo = 26) {
    if (instantaneo || reduz.matches) { el.textContent = texto; ajustaPapel(instantaneo); return; }
    papel.classList.remove("is-recolhida");
    el.dataset.digita = "";
    raiz.dataset.imprime = "true";
    for (let i = 1; i <= texto.length; i++) {
      el.textContent = texto.slice(0, i);
      ajustaPapel();
      await espera(texto[i - 1] === " " ? ritmo * .6 : ritmo, g);
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
    /* a IA pensa: o mostrador corre e as casas tomam o accent antes do lance */
    if (!instantaneo) await espera(1300, g);
    lanceIA(k, j);
    if (!instantaneo) await espera(650, g);
    const { e, t } = entradaIA(k, j);
    t.textContent = j.ia;                    // mede a entrada inteira antes de imprimir
    coloca(e, instantaneo);
    t.textContent = "";
    if (!instantaneo) { ajustaPapel(); await espera(260, g); }
    await digita(t, j.ia, g, instantaneo);
    if (!instantaneo) anuncia(j.ia);
    if (!instantaneo) {
      await espera(900, g);
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
      s.textContent = j.humano;
      if (excede() && rolo.children.length > 2) {
        rolo.lastElementChild.remove();
        coloca(e, instantaneo);
      }
      s.textContent = "";
      await digita(s, j.humano, g, instantaneo, 22);
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
    ajustaPapel();
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
        await espera(500, g);
      }
      fim();
    } catch (err) { if (err !== PARA) throw err; }
  }

  function zera() {
    geracao++;
    aguarda = null;
    raiz.dataset.imprime = "false";
    rolo.replaceChildren();
    raiz.querySelectorAll(".aj-papel--caida").forEach((n) => n.remove());
    nFolha = 1; guardadas = 0;
    rolo.append(cabecalho());
    papel.classList.remove("is-recolhida");
    ajustaPapel();
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
    rei.classList.remove("is-saida", "is-anda");
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
    const p = palco.getBoundingClientRect(), a = moldura.getBoundingClientRect();
    if (!p.height) return;
    raiz.style.setProperty("--aj-fundo", (a.top - p.top).toFixed(1) + "px");
  }
  new ResizeObserver(medeFundo).observe(palco);
  medeFundo();

  /* ---------- estado inicial ---------- */
  zera();
  recolhe();
  poeMod("atrio");
  poeConta(0);
  poeVez("pronto");
  poeStatus(T.status.pronto);
  painel("pronto", { k: U.k.pronto, peca: U.caso, q: U.resumo, p: U.comecaP, ops: [], bate: U.comeca });
})();
