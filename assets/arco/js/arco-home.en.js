/* GERADO por i18n/build.mjs a partir de arco-home.js | não editar à mão. */
/* ==========================================================================
   ARCO — home
   --------------------------------------------------------------------------
   1) ajuste tipográfico: nome, tese e títulos ocupam a largura exata do bloco;
   2) retícula: fileiras em múltiplos de --row, painel em quadrados inteiros;
   3) navegação interna: painéis, competências e verbetes, sem hover;
   4) índice "Do termo à prova": busca, filtro por projeto e recolhimento no celular;
   5) Rastro: abas (índice, finalização, fila) e tags de leitura do índice;
   7) hero: o feixe (feixes e esteira) e o cordão recolhido durante o hero.
   A casca (cordão, views, histórico) continua em arco-shell.js.
   ========================================================================== */
(() => {
  "use strict";
  const home = document.getElementById("hm");
  if (!home) return;
  const heroRoot = document.getElementById("autoria");
  const panels = [heroRoot, ...home.querySelectorAll(".hm-panel")].filter(Boolean);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stacked = matchMedia("(max-width:900px)");

  /* ---------- medida da fileira (--row resolvido em px) ---------- */
  const probe = document.createElement("div");
  probe.setAttribute("aria-hidden", "true");
  probe.style.cssText = "position:absolute;left:0;top:0;width:0;height:var(--row);visibility:hidden;pointer-events:none";
  home.appendChild(probe);
  const rowPx = () => probe.getBoundingClientRect().height || 64;

  /* ---------- 1. ajuste tipográfico ----------
     O bloco recebe o corpo que faz a linha mais longa caber exatamente na sua
     largura útil. Blocos do mesmo grupo (os títulos) usam um único corpo: o do
     mais longo, para que unidades equivalentes tenham a mesma escala. */
  const fitted = [...home.querySelectorAll("[data-fit]")];
  function fit(){
    fitted.forEach(el => el.style.removeProperty("font-size"));
    const groups = new Map();
    fitted.forEach(el => {
      const lines = [...el.querySelectorAll(".hm-fit")];
      if (!lines.length) return;
      const cs = getComputedStyle(el);
      const room = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const widest = Math.max(...lines.map(l => l.getBoundingClientRect().width));
      if (!(room > 0 && widest > 0)) return;
      const ratio = room / widest;
      const key = el.dataset.fit || el;
      const g = groups.get(key) || {ratio:Infinity, els:[]};
      g.ratio = Math.min(g.ratio, ratio);
      g.els.push([el, parseFloat(cs.fontSize)]);
      groups.set(key, g);
    });
    groups.forEach(({ratio, els}) => els.forEach(([el, size]) => {
      el.style.fontSize = (size * ratio * .995).toFixed(2) + "px";
    }));
  }

  /* ---------- retícula ancorada na base do hero ----------
     O hero ocupa a altura útil da tela, com os blocos na base. A origem da
     retícula visível desce o resto da divisão dessa altura pelo quadrado
     (--ret-y): uma linha cai na base do hero, e os painéis seguintes, em
     quadrados inteiros, seguem sobre as linhas. */
  let retY = 0, lastHero = 0;
  const heroH = () => heroRoot?.getBoundingClientRect().height || 0;
  function ancora(){
    const h = heroH();
    lastHero = h;
    retY = 0; // origem do corpo = costura da hero
    home.style.setProperty("--ret-y", retY.toFixed(2) + "px");
  }

  /* ---------- 2. retícula: fileiras em múltiplos de --row ---------- */
  function snap(panel){
    panel.style.gridTemplateRows = "";
    panel.style.paddingBottom = "";
    /* o hero tem a altura da tela, não de quadrados: a retícula é que se
       ancora na base dele (ancora) */
    if (panel.classList.contains("hm-autoria")) return;
    const r = rowPx();
    /* o painel fecha num número inteiro de quadrados: no desktop a fileira é
       meio quadrado, então o total de fileiras precisa ser par */
    const perCell = stacked.matches ? 1 : 2;
    if (getComputedStyle(panel).display !== "grid"){
      /* painel sem grade (o hero no celular): completa o último quadrado */
      const h = panel.getBoundingClientRect().height, q = r * perCell;
      panel.style.paddingBottom = (parseFloat(getComputedStyle(panel).paddingBottom) + Math.ceil((h - 1) / q) * q - h) + "px";
      return;
    }
    const tracks = getComputedStyle(panel).gridTemplateRows.split(/\s+/).map(parseFloat).filter(n => n > 0);
    if (!tracks.length) return;
    const units = tracks.map(t => Math.max(1, Math.ceil((t - 1) / r)));
    const sum = units.reduce((a, b) => a + b, 0);
    /* a fileira que completa o quadrado: a última, ou a que o painel indicar
       (data-sobra, 1 = primeira), para que uma faixa no pé não cresça */
    const sobra = Math.min(units.length, Math.max(1, +panel.dataset.sobra || units.length)) - 1;
    if (sum % perCell) units[sobra] += perCell - (sum % perCell);
    panel.style.gridTemplateRows = units.map(u => u * r + "px").join(" ");
  }
  const snapAll = () => panels.forEach(snap);

  /* ---------- frentes: distinções em alternância ----------
     Cada frente traz, na primeira coluna, a distinção do projeto que a prova.
     Onde há mais de uma (Legal Engineering: ATRIO, RATIO, TROIA), sem JS a
     série aparece inteira; com JS, uma por vez, trocando a cada 3,5 s; para
     sob o ponteiro ou o foco, com a aba escondida e com movimento reduzido.
     Quem escolhe no seletor assume: a troca para. Com RATIO ou TROIA na vez,
     o fio desce da tag ATRIO até a tag do módulo (.hm-fr__elo). */
  const MODULOS = {ratio:"RATIO", troia:"TROIA"};
  home.querySelectorAll(".hm-ds").forEach(ds => {
    const itens = [...ds.querySelectorAll(".hm-d")];
    const sel = ds.querySelector(".hm-ds__sel");
    const botoes = sel ? [...sel.querySelectorAll("button")] : [];
    if (itens.length < 2 || botoes.length !== itens.length) return;
    const linha = ds.closest(".hm-fr__r");
    const elo = linha && linha.querySelector(".hm-fr__elo");
    const eloTag = elo && elo.querySelector(".hm-chip--mod");
    let atual = 0, timer = 0, escolhido = false, sobre = false;
    const mostra = k => {
      atual = k;
      const proj = itens[k].dataset.proj || "";
      ds.dataset.proj = proj;
      itens.forEach((el, n) => el.classList.toggle("is-on", n === k));
      botoes.forEach((b, n) => b.setAttribute("aria-pressed", String(n === k)));
      if (elo){
        const mod = MODULOS[proj];
        if (mod) eloTag.textContent = mod;
        elo.dataset.on = String(!!mod);
      }
    };
    const para = () => { clearInterval(timer); timer = 0; };
    const roda = () => {
      para();
      if (reduce || escolhido || sobre || document.hidden) return;
      timer = setInterval(() => mostra((atual + 1) % itens.length), 3500);
    };
    botoes.forEach((b, n) => b.addEventListener("click", () => { escolhido = true; para(); mostra(n); }));
    /* a pausa vale para a linha inteira da frente: ler a área ou o elo não
       deixa a distinção trocar */
    const alvo = linha || ds;
    alvo.addEventListener("pointerenter", () => { sobre = true; para(); });
    alvo.addEventListener("pointerleave", () => { sobre = false; roda(); });
    alvo.addEventListener("focusin", () => { sobre = true; para(); });
    alvo.addEventListener("focusout", () => { sobre = false; roda(); });
    document.addEventListener("visibilitychange", roda);
    ds.classList.add("is-alt");
    sel.hidden = false;
    mostra(0);
    roda();
  });

  /* ---------- Rastro: abas de leitura e tags do índice ----------
     Sem JS, índice, finalização e fila descem em sequência e o índice fica
     inteiro. Com JS, as três partes viram abas (setas trocam de aba) e as
     tags deixam opaco, no índice, o que não é da leitura escolhida. */
  const rastro = home.querySelector(".hm-rastro");
  if (rastro){
    const tabs = [...rastro.querySelectorAll('[role="tab"]')];
    const panes = tabs.map(t => document.getElementById(t.getAttribute("aria-controls")));
    if (tabs.length && panes.every(Boolean)){
      rastro.classList.add("is-tabbed");
      const pick = (i, focus) => {
        tabs.forEach((t, k) => {
          const on = k === i;
          t.setAttribute("aria-selected", String(on));
          t.tabIndex = on ? 0 : -1;
          panes[k].hidden = !on;
        });
        if (focus) tabs[i].focus();
        const meta = rastro.querySelector(".hm-ix__bar");
        if (meta) meta.hidden = tabs[i].id !== "rx-tab-ix";
        snap(rastro);
      };
      tabs.forEach((t, i) => {
        t.addEventListener("click", () => pick(i));
        t.addEventListener("keydown", e => {
          const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
          if (!d) return;
          e.preventDefault();
          pick((i + d + tabs.length) % tabs.length, true);
        });
      });
      pick(0);
    }
    /* uma só linha de reticências, ao fim da tabela: revela todos os demais
       indicadores e vira flecha para recolher */
    rastro.querySelectorAll(".hm-ix__more button").forEach(b => b.addEventListener("click", () => {
      const t = b.closest("table");
      const aberto = !t.classList.contains("is-open");
      t.classList.toggle("is-open", aberto);
      b.setAttribute("aria-expanded", String(aberto));
      snap(rastro);
    }));
    const tabela = rastro.querySelector(".hm-ix");
    const tags = [...rastro.querySelectorAll(".hm-ix__tag")];
    tags.forEach(b => b.addEventListener("click", () => {
      tags.forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      if (tabela) tabela.dataset.tag = b.dataset.tag;
    }));
  }

  /* ---------- figura presa à retícula ----------
     ATRIO: como no hero do próprio ATRIO, o horizonte
     da esteira é travado num múltiplo inteiro da fileira e a base da esteira
     corre em oitavos da largura do campo. Sem JS, a figura fica no desenho
     estático, apenas sem esse travamento. */
  const f3 = n => n.toFixed(2);
  function lockFigures(){
    const r = rowPx();
    const atrio = home.querySelector(".hm-nv--atrio svg");
    if (atrio){
      const {width:W, height:H} = atrio.getBoundingClientRect();
      const light = atrio.querySelector(".hm-runway__light");
      const dark = atrio.querySelector(".hm-runway__dark");
      const mark = atrio.querySelector(".hm-atrio__mark");
      if (W > 0 && H > 0 && light && dark){
        const horizon = Math.max(r, Math.round((H * .61) / r) * r);
        const base = H - horizon, cx = W / 2, unit = W / 8, d0 = 2.2, max = 1.82;
        const rho = k => d0 / (d0 + k), x = (i, k) => f3(cx + (i - 4) * unit * k), y = k => f3(horizon + base * k);
        light.setAttribute("d", `M${f3(cx)},${f3(horizon)}L${x(8, max)},${y(max)}L${x(0, max)},${y(max)}Z`);
        const cells = [];
        for (let row = 0; row < 96; row++){
          const far = rho(row + 1);
          if (far > max) continue;
          const near = Math.min(rho(row), max);
          if (base * (near - far) < .35) break;
          for (let col = row % 2; col < 8; col += 2)
            cells.push(`M${x(col, near)},${y(near)}L${x(col + 1, near)},${y(near)}L${x(col + 1, far)},${y(far)}L${x(col, far)},${y(far)}Z`);
        }
        dark.setAttribute("d", cells.join(""));
        atrio.setAttribute("viewBox", `0 0 ${f3(W)} ${f3(H)}`);
        atrio.setAttribute("preserveAspectRatio", "none");
        if (mark){
          const size = Math.min(W * .135, (horizon - 8) * .9);
          mark.setAttribute("x", f3(W / 4));
          mark.setAttribute("y", f3(horizon - Math.max(10, W * .06)));
          mark.setAttribute("textLength", f3(W / 2));
          mark.style.fontSize = f3(size) + "px";
        }
      }
    }
  }

  /* ---------- 7. hero: o feixe ----------
     A mecânica é a da esteira do ATRIO (atrio.js: drawStaticRunway, draw,
     tick), levada a um ponto de fuga deslocado: o fim da esteira, onde as
     faixas se fecham num triângulo que faz as vezes de prisma. Unidades:
       c  = macrocoluna (largura / 8), a mesma de --cell;
       v  = c / 5, a unidade só visual da retícula de 40 colunas (--vu).
     O ponto de fuga pousa em (2c, horizonte); o horizonte fica a m·v da base (m
     inteiro), como o do ATRIO fica em múltiplos da unidade. As faixas da
     esteira são as colunas de v contadas a partir de x = 0: na base do hero,
     cada divisão longitudinal cai sobre uma linha da retícula, que continua
     pelos painéis abaixo. Os cortes transversais seguem a perspectiva do
     ATRIO, r = m / (m + n − fase): com d0 = m, a última fileira mede v na
     base, e o quadrado da esteira encontra o quadrado da retícula. O corte
     é uma faixa #2C2C2C que vai da direita da tela até a borda esquerda do
     feixe: sobre o fundo, invisível; sobre o branco, corta.
     Abertura (uma vez): os feixes entram pela esquerda até a ponta da esteira; o
     branco nasce dele, já dividido em faixas; os cortes avançam da direita
     para a esquerda; depois, a esteira corre. Movimento reduzido: o desenho
     final, parado (fase 0, quando a fileira da base pousa na linha da base).
     Fora da tela, o laço para. */
  const feixe = (() => {
    const hero = heroRoot;
    const svg = hero && hero.querySelector(".hm-feixe__svg");
    if (!svg) return null;
    const luz = svg.querySelector(".hm-feixe__luz");
    const faixas = svg.querySelector(".hm-feixe__faixas:not(.hm-feixe__faixas--maior)");
    const faixasM = svg.querySelector(".hm-feixe__faixas--maior");
    const cortes = svg.querySelector(".hm-feixe__cortes:not(.hm-feixe__cortes--maior)");
    const cortesM = svg.querySelector(".hm-feixe__cortes--maior");
    const maior = j => ((j % 5) + 5) % 5 === 0;     /* linha de macrocoluna */
    const cores = [...svg.querySelectorAll(".hm-feixe__cor")];
    const id = hero.querySelector(".hm-feixe__id");
    const txt = hero.querySelector(".hm-feixe__txt");
    const nomeEl = hero.querySelector(".hm-name");
    const fitLine = nomeEl && nomeEl.querySelector(".hm-fit");
    const linhas = fitLine ? [...fitLine.querySelectorAll(".hm-feixe__l")] : [];
    const alto = matchMedia("(max-aspect-ratio:10/11)");
    const anima = !reduce;
    const ROW_MS = 3200;                              /* uma fileira por período */
    /* corte: [início, duração de cada fileira, defasagem entre a primeira e
       a última]. A frente desce em "\": a fileira de cima começa antes, a da
       base por último. */
    const T = {cor:[0, 760], luz:[520, 820], corte:[1180, 1700, 1500]};
    const fim = T.corte[0] + T.corte[1] + T.corte[2] + 400;
    /* os cortes vivem da metade da profundidade da esteira para baixo (r0);
       acima disso o branco segue só com as faixas. Entram aos poucos, num
       trecho de rampa, para que a fileira que desce não surja de repente. */
    const R0 = .5, RAMPA = .12, MAX = 1.82; // projeção excedente do ATRIO
    const ease = u => u <= 0 ? 0 : u >= 1 ? 1 : 1 - Math.pow(1 - u, 3);
    const p2 = n => n.toFixed(2);
    const geo = n => String(n);
    let G = null, K = 1, t0 = 0, loop = 0, visivel = true, abertura = anima, estatico = "";

    /* baseline do nome: sonda de largura zero, como em raiseTitles, na
       última linha */
    let bl = null;
    if (fitLine){
      bl = document.createElement("span");
      bl.setAttribute("aria-hidden", "true");
      bl.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
      (linhas[linhas.length - 1] || fitLine).append(bl);
    }

    /* o nome ocupa a largura exata do seu bloco, como os títulos (fit):
       numa linha na composição larga; em duas na alta, pela mais longa, sem
       passar de 8,5% da altura da tela */
    function ajustaNome(largo){
      if (!nomeEl || !fitLine) return;
      nomeEl.style.removeProperty("font-size");
      const room = nomeEl.clientWidth;
      const els = largo || !linhas.length ? [fitLine] : linhas;
      const widest = Math.max(...els.map(l => l.getBoundingClientRect().width));
      if (!(room > 0 && widest > 0)) return;
      let fs = parseFloat(getComputedStyle(nomeEl).fontSize) * room / widest * .995;
      if (!largo) fs = Math.min(fs, innerHeight * .085);
      nomeEl.style.fontSize = p2(fs * K) + "px";
    }

    /* Alinhamento medido após as fontes: fim de Portfólio = início da ficha.
       As três frentes mantêm uma só linha e cedem de corpo apenas se preciso. */
    function ajustaIdentidade(largo){
      if (!txt) return;
      txt.style.removeProperty("--hm-identity-offset");
      txt.style.removeProperty("--hm-headline-size");
      if (!largo) return;
      const anchor = txt.querySelector(".hm-feixe__tag-anchor");
      const contact = txt.querySelector(".hm-canal dt");
      const fr = txt.querySelector(".hm-feixe__fr");
      if (anchor && contact){
        const offset = contact.getBoundingClientRect().left - anchor.getBoundingClientRect().right;
        txt.style.setProperty("--hm-identity-offset", `${offset}px`);
      }
      if (!fr) return;
      const items = [...fr.querySelectorAll(".hm-feixe__f")];
      if (!items.length) return;
      const gap = parseFloat(getComputedStyle(fr).columnGap) || 0;
      const room = fr.getBoundingClientRect().width - gap * (items.length - 1);
      const demand = items.reduce((sum, el) => sum + el.getBoundingClientRect().width, 0);
      if (room > 0 && demand > room){
        const fs = parseFloat(getComputedStyle(items[0]).fontSize);
        txt.style.setProperty("--hm-headline-size", `${fs * room / demand * .995 / K}px`);
      }
    }

    /* Quando o texto não cabe (na composição larga, o bloco sobe além do
       alto do hero; na alta, empurra a esteira abaixo do mínimo de 6v),
       todos os corpos cedem juntos, pelo fator K (--hm-k), até 0,6. */
    function mede(){
      K = 1;
      for (let i = 0; i < 6; i++){
        if (txt) txt.style.setProperty("--hm-k", K.toFixed(3));
        const sobra = arma();
        if (!sobra || !(sobra.falta > .5) || K <= .6) break;
        K = Math.max(.6, K * Math.max(.75, (sobra.h - sobra.falta) / sobra.h));
      }
    }

    function folga(){
      if (!G || !txt) return null;
      const pri = txt.firstElementChild, ult = txt.lastElementChild;
      if (!pri || !ult) return null;
      const top = hero.getBoundingClientRect().top;
      const ini = pri.getBoundingClientRect().top - top;
      const fundo = ult.getBoundingClientRect().bottom - top;
      if (G.largo){
        const lang = hero.querySelector(".hm-feixe__lang");
        const teto = Math.max(G.v * 2, lang ? lang.getBoundingClientRect().bottom - top + G.v : 0);
        return {falta: teto - ini, h: fundo - ini};
      }
      return {falta: fundo - (G.H - 8 * G.v), h: fundo - ini};
    }

    function arma(){
      const largo = !alto.matches;
      if (txt) txt.style.transform = "";
      ajustaIdentidade(largo);
      ajustaNome(largo);
      const {width: W, height: H} = svg.getBoundingClientRect();
      if (!(W > 0 && H > 0)){ G = null; return null; }
      const c = home.getBoundingClientRect().width / 8, v = c / 5;
      let m = Math.max(6, Math.round((largo ? .5 : .36) * H / v));
      /* na composição alta, o horizonte desce, em v inteiros, até ficar
         pelo menos 2v abaixo do texto */
      if (!largo && txt && txt.lastElementChild){
        const fundo = txt.lastElementChild.getBoundingClientRect().bottom - hero.getBoundingClientRect().top;
        m = Math.max(6, Math.min(m, Math.floor((H - fundo - 2 * v) / v)));
      }
      const D = m * v, py = H - D, px = 2 * c;
      /* Os dois raios extremos encontram exatamente os vértices da base.
         A extensão além da hero é recortada, como no ATRIO. */
      const kR = 40;
      const xL = 0, xR = kR * v;
      const Ye = H;
      const g = 1;                                    /* espessura na base: a da retícula */
      G = {W, H, c, v, m, D, px, py, xL, xR, kR, Ye, g, largo};
      hero.style.setProperty("--hz", p2(py) + "px");
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      estatico = "";
      nome();
      return folga();
    }

    /* O bloco inteiro sobe: sua base deve ficar acima da diagonal branca
       no eixo mais à esquerda do texto. O horizonte não se move. */
    function nome(){
      if (!txt) return;
      txt.style.transform = "";
      if (id) id.style.transform = "";
      if (!G || !G.largo) return;
      const origin = svg.getBoundingClientRect();
      const blocks = [id, txt.querySelector(".hm-feixe__fr"), txt.querySelector(".hm-feixe__bio"), txt.querySelector(".hm-canal")].filter(Boolean);
      const rects = blocks.map(el => el.getBoundingClientRect());
      const shift = Math.max(2*G.v, ...rects.map(r => {
        const left = r.left-origin.left;
        const edge = G.py + G.D * Math.max(0, Math.min(1, (left-G.px)/(G.xR-G.px)));
        return r.bottom-origin.top-edge+G.v;
      }));
      txt.style.transform = `translateY(-${shift}px)`;
    }

    /* um ponto da borda esquerda (x = 0, altura y), prolongado para fora da
       tela sobre a linha que vai ao ponto de fuga: as bordas não deixam frestas */
    const fora = y => p2(y + (y - G.py) * 2 / G.px);

    function desenhaEstatico(t){
      const {H, v, px, py, xL, xR, kR, Ye, g} = G;
      /* 1. os nove feixes, contíguos: cada um vai do seu topo até o fim do
         leque, e o seguinte o cobre; assim a junta é cor sobre cor */
      const fx = px * ease((t - T.cor[0]) / T.cor[1]);
      const yOf = j => Ye * j / 9;
      cores.forEach((path, j) => {
        if (fx <= 0){ path.setAttribute("d", ""); return; }
        const a = yOf(j), atx = y => p2(y + (py - y) * fx / px);
        path.setAttribute("d", `M-2,${fora(a)}L${p2(fx)},${atx(a)}L${p2(fx)},${atx(Ye)}L-2,${fora(Ye)}Z`);
      });
      /* 2. o branco nasce do ponto de fuga: alcance k de 0 a 1 */
      const k = ease((t - T.luz[0]) / T.luz[1]);
      const alcance = k < 1 ? k : MAX;
      if (k <= 0){ luz.setAttribute("d", ""); faixas.setAttribute("d", ""); faixasM?.setAttribute("d", ""); }
      else {
        const at = (x, y) => `${geo(px + (x - px) * alcance)},${geo(py + (y - py) * alcance)}`;
        luz.setAttribute("d", `M${geo(px)},${geo(py)}L${at(xR, H)}L${at(xL, H)}Z`);
        /* divisões longitudinais: do ponto de fuga até x = j·v na base, largura g
           na base e proporcional à profundidade (triângulo com vértice no
           ponto de fuga). A borda esquerda não leva divisão: é a junta com as cores */
        const d = [], dM = [];
        for (let j = 0; j < kR; j++){
          const tri = `M${geo(px)},${geo(py)}L${at(j * v, H)}L${at(j * v + g, H)}Z`;
          d.push(tri);
          if (maior(j)) dM.push(tri);
        }
        faixas.setAttribute("d", d.join(""));
        faixasM?.setAttribute("d", dM.join(""));
      }
    }

    /* 4. os cortes transversais, na perspectiva do ATRIO */
    /* ciclo: quantas fileiras já passaram; n + ciclo numera cada fileira de
       modo estável enquanto ela desce, e a cada cinco vem a linha maior */
    function desenhaCortes(t, fase, ciclo = 0){
      const {W, H, v, m, D, px, py, xL, xR, g} = G;
      if (t < T.corte[0]){ cortes.setAttribute("d", ""); cortesM?.setAttribute("d", ""); return; }
      const d = [], dM = [];
      for (let n = 0; n < 400; n++){
        const r = m / (m + n - fase);
        if (r > MAX) continue;
        const y = py + D * r;
        /* acima da metade da profundidade, nenhum corte */
        if (r < R0) break;
        if (D * (r - m / (m + n + 1 - fase)) < 1.2) break;
        const surge = Math.min(1, (r - R0) / RAMPA);
        const e = g * r * r * surge * surge * (3 - 2 * surge);
        if (e < .04) continue;
        const dir = px + (xR - px) * r + 1, esq = Math.max(0, px + (xL - px) * r);
        /* a frente do corte: da borda direita do branco à esquerda; a
           fileira de cima entra primeiro e a frente desce em "\" */
        const u = ease((t - T.corte[0] - (Math.min(r, 1) - R0) / (1 - R0) * T.corte[2]) / T.corte[1]);
        if (u <= 0) continue;
        const x0 = dir - (dir - esq + 1) * u;
        const faixa = `M${p2(x0)},${p2(y)}H${p2(W)}V${p2(y + e)}H${p2(x0)}Z`;
        d.push(faixa);
        if (maior(n + ciclo)) dM.push(faixa);
      }
      cortes.setAttribute("d", d.join(""));
      cortesM?.setAttribute("d", dM.join(""));
    }

    function quadro(now){
      loop = 0;
      if (!G) return;
      if (!t0) t0 = now;
      const t = abertura ? now - t0 : Infinity;
      if (t >= fim) abertura = false;
      const chave = abertura ? "" : "fim";
      if (abertura || estatico !== chave){ desenhaEstatico(t); estatico = chave; }
      desenhaCortes(t, anima ? (now / ROW_MS) % 1 : 0, anima ? Math.floor(now / ROW_MS) : 0);
      if (anima && visivel) loop = requestAnimationFrame(quadro);
    }
    const roda = () => { if (!loop && G) loop = requestAnimationFrame(quadro); };

    /* o cordão: recolhido enquanto o hero está na tela */
    const html = document.documentElement;
    html.classList.add("hm-veu-on", "hm-veu");
    if ("IntersectionObserver" in window){
      new IntersectionObserver(([e]) => {
        visivel = e.isIntersecting;
        html.classList.toggle("hm-veu", visivel);
        if (visivel) roda();
      }, {threshold:0}).observe(hero);
    }
    document.addEventListener("visibilitychange", () => { if (!document.hidden && visivel) roda(); });

    return {
      mede(){ mede(); if (!anima || !abertura) estatico = ""; roda(); }
    };
  })();

  let raf = 0, lastWidth = 0, lastRow = 0;
  function layout(force = false){
    raf = 0;
    const w = home.getBoundingClientRect().width;
    if (!(w > 0)) return;
    const unit = `${w / 8}px`;
    home.style.setProperty("--hm-shared-cell", unit);
    heroRoot?.style.setProperty("--hm-shared-cell", unit);
    const r = rowPx();
    if (!force && w === lastWidth && r === lastRow && Math.abs(heroH() - lastHero) < .5) return;
    lastWidth = w; lastRow = r;
    fit();
    scoreFit();
    snapAll();
    ancora();
    feixe?.mede();
    lockFigures();
    alignTabs();
    raiseTitles();
  }
  /* ---------- linhas da retícula visível ----------
     A retícula visível é um quadrado de lado = largura / 8, contínuo desde o
     topo da home. Estas funções só pousam elementos nas suas linhas. */
  const cellPx = () => home.getBoundingClientRect().width / 8;
  /* altura medida a partir da origem da retícula, não do topo da home */
  const yIn = el => el.getBoundingClientRect().bottom - home.getBoundingClientRect().top - retY;

  /* a linha do seletor de Rastro desce até a próxima linha da retícula */
  function alignTabs(){
    const top = home.querySelector(".hm-rx__top");
    if (!top) return;
    top.style.marginTop = "";
    if (stacked.matches) return;
    const c = cellPx(), y = yIn(top) - 1;
    const alvo = Math.ceil((y - .5) / c) * c;
    if (alvo - y > .5){
      top.style.marginTop = (alvo - y) + "px";
      snap(top.closest(".hm-panel"));
    }
  }

  /* títulos sobem até a linha da retícula logo acima da sua linha de base,
     sem mexer no que vem abaixo (só transform). Em Rastro, as distinções
     de leitura ocupam a mesma faixa, à direita do título */
  function raiseTitles(){
    const c = cellPx();
    /* o nome não: no hero ele pousa sobre os blocos da base, com vão curto */
    home.querySelectorAll(".hm-title").forEach(t => {
      t.style.transform = "";
      if (stacked.matches) return;
      let base = t.querySelector(".hm-base");
      if (!base){
        base = document.createElement("span");
        base.className = "hm-base";
        base.setAttribute("aria-hidden", "true");
        base.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
        (t.querySelector(".hm-fit") || t).append(base);
      }
      const y = yIn(base);
      let alvo = Math.floor((y - 1) / c) * c;
      /* nunca acima do topo do próprio painel: se a linha de cima o tiraria
         do painel (a linha de base quase pousada na linha seguinte), desce
         até a seguinte */
      const painel = t.closest(".hm-panel");
      if (painel && t.getBoundingClientRect().top + (alvo - y) < painel.getBoundingClientRect().top) alvo += c;
      if (Math.abs(y - alvo) > .5) t.style.transform = `translateY(${alvo - y}px)`;
      const neq = painel?.querySelector(".hm-neq");
      if (neq) placeNeq(neq, t, alvo, c);
    });
  }

  /* Distinções de leitura do Rastro (Schibsted Grotesk 900, maiúsculas). L é a linha da retícula onde pousa o
     título. As quatro primeiras ficam na faixa do título, a primeira no
     mesmo lugar de sempre (0,86 quadrado acima de L); as duas últimas descem
     para a faixa de baixo, a penúltima a partir de L e a última terminando
     a 40% dessa faixa. Daí sai a altura das maiúsculas (h) com um vão
     ínfimo (g) entre as linhas; cada linha começa um passo mais longe do
     título, sem passar da borda da tela. */
  function placeNeq(neq, titulo, alvo, c){
    const itens = [...neq.children];
    if (!itens.length) return;
    const painel = neq.closest(".hm-panel");
    const pr = painel.getBoundingClientRect(), hr = home.getBoundingClientRect();
    const L = alvo - (pr.top - hr.top - retY);
    const T1 = L - c * .86;
    const g = c * .012;
    const h = (c * .4 - g) / 2;
    neq.style.setProperty("--neq-fs", (h / .7) + "px");
    const fs0 = parseFloat(getComputedStyle(itens[0]).fontSize);
    const cap = itens[0].getBoundingClientRect().height / fs0 || .7;
    let fs = h / cap;
    neq.style.setProperty("--neq-fs", fs + "px");
    const fit = titulo.querySelector(".hm-fit") || titulo;
    const x0 = fit.getBoundingClientRect().right - pr.left + c * .22;
    const limite = c * 8 - c * .12;
    let larg = itens.map(li => li.getBoundingClientRect().width);
    let passo = c * .32;
    larg.forEach((w, i) => { if (i) passo = Math.min(passo, (limite - x0 - w) / i); });
    const minimo = c * .05;
    if (passo < minimo){
      const k = Math.min(1, ...larg.map((w, i) => (limite - x0 - i * minimo) / w));
      fs *= k;
      neq.style.setProperty("--neq-fs", fs + "px");
      passo = minimo;
    }
    const hReal = itens[0].getBoundingClientRect().height;
    itens.forEach((li, i) => {
      const topo = i < 4 ? T1 + i * (hReal + g)
        : i === 4 ? L
        : L + c * .4 - hReal;
      li.style.top = topo + "px";
      li.style.left = (x0 + i * passo) + "px";
    });
  }

  /* ---------- ECHO e CERNE: o quadro da vitrine ----------
     Folha de rosto, números e Explorar são da própria página, na vitrine
     (play.html?vitrine, cerne.html?vitrine). Aqui só se mede o quadro, pelo
     que a página expõe em window.vitrine: folha(), a altura da folha de
     rosto; conteudo(), a altura do que está aberto (0: ocupa a tela).
     Fechado, o quadro tem a altura exata da folha, para ficar perto da
     coluna de texto. Aberto (aviso ECHO_VITRINE ou CERNE_VITRINE, com estado
     diferente de "folha"), a altura útil da tela em fileiras inteiras: se o
     conteúdo não cabe, o quadro vira uma janela maior reduzida em escala,
     sem rolagem dentro dele; e, ao abrir, sobe ao alto da tela. No celular,
     o Explorar pede página inteira (data-explorar="pagina"), para não haver
     rolagem dentro da rolagem. Sem JS, valem as alturas do CSS.
     Ampliar: um botão ao lado do quadro (sobre ele, no celular), sempre à
     vista, põe a própria página em tela cheia sobre fundo escuro, sem
     recarregá-la (o quadro fica no lugar; só o iframe se fixa). Lá, nada se
     reduz em escala e o Explorar abre ali mesmo, também no celular. Esc
     (pedido "reduzir" da página, ou da home), o botão ou o fundo voltam. A
     página também pode pedir "ampliar" (o Montador do ECHO abre em tela cheia). */
  const railH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--rail-h")) || 0;
  const altura = () => {
    const r = rowPx(), util = innerHeight - railH();
    return Math.max(r * 4, Math.floor(util / r) * r);
  };
  const quadros = [...home.querySelectorAll(".hm-score")].map(score => {
    const quadro = score.querySelector(".hm-score__frame");
    if (!quadro) return null;
    const panel = score.closest(".hm-panel");
    const inTab = score.getAttribute("role") === "tabpanel";
    const vit = () => { try{ return quadro.contentWindow.vitrine || null; }catch(_){ return null; } };
    const mede = k => { try{ return Math.ceil(vit()?.[k]?.() || 0); }catch(_){ return 0; } };
    let aberto = false, amplo = false, inertes = [];
    const desescala = () => { quadro.style.width = quadro.style.height = quadro.style.transform = quadro.style.transformOrigin = ""; };
    const escala = () => {
      const util = altura(), largura = score.clientWidth;
      desescala();
      /* a página pode crescer o que mostra até caber na altura útil (ECHO) */
      try{ vit()?.ajusta?.(util); }catch(_){}
      let n = mede("conteudo");
      if (!n) return util;
      let s = Math.min(1, util / n);
      for (let i = 0; i < 2 && s < 1; i++){
        /* na janela mais larga o texto quebra menos: mede de novo */
        quadro.style.width = (largura / s) + "px";
        n = mede("conteudo") || n;
        s = Math.min(1, util / n);
      }
      quadro.style.width = (largura / s) + "px";
      quadro.style.height = n + "px";
      quadro.style.transformOrigin = "0 0";
      quadro.style.transform = s < 1 ? `scale(${s})` : "";
      return Math.ceil(n * s);
    };
    const fit = () => {
      if (score.hidden) return;
      if (amplo){ desescala(); delete quadro.dataset.explorar; return; }
      /* a folha é medida na largura do campo, nunca na janela escalada */
      if (stacked.matches || !aberto) desescala();
      const h = mede("folha");
      if (stacked.matches){
        score.style.removeProperty("--score-h");
        if (!inTab) quadro.dataset.explorar = "pagina";
        const height = inTab && aberto ? mede("conteudo") || altura() : h;
        if (height) score.style.setProperty("--vit-h", height + "px");
      } else {
        delete quadro.dataset.explorar;
        score.style.setProperty("--score-h", (aberto ? escala() : (h || altura())) + "px");
      }
      snap(panel);
    };
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "hm-amplia";
    botao.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path class="hm-amplia__mais" d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/><path class="hm-amplia__menos" d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5"/></svg>';
    const rotulo = () => {
      const t = amplo ? "Collapse" : "Expand";
      botao.setAttribute("aria-label", t); botao.title = t;
      botao.setAttribute("aria-pressed", String(amplo));
    };
    rotulo();
    score.prepend(botao);
    /* em tela cheia, o resto da página fica inerte: o foco não sai do quadro */
    const isola = v => {
      inertes.forEach(el => { el.inert = false; });
      inertes = [];
      if (!v) return;
      for (let el = score; el && el !== document.body; el = el.parentElement)
        for (const irmao of el.parentElement.children)
          if (irmao !== el && !irmao.inert && irmao.tagName !== "SCRIPT"){ irmao.inert = true; inertes.push(irmao); }
    };
    const amplia = v => {
      if (v === amplo) return;
      amplo = v; rotulo();
      score.classList.toggle("is-amplo", v);
      document.documentElement.classList.toggle("hm-amplo", v);
      isola(v);
      /* no celular, ao reduzir, a página volta à folha de rosto: o quadro tem a altura dela */
      try{ quadro.contentWindow.postMessage({ type:"ARCO_AMPLIA", amplo:v, fecha:!v && stacked.matches }, location.origin); }catch(_){}
      fit();
      (v ? quadro : botao).focus({preventScroll:true});
    };
    botao.addEventListener("click", () => amplia(!amplo));
    score.addEventListener("click", e => { if (amplo && e.target === score) amplia(false); });
    quadro.addEventListener("load", () => { aberto = false; fit(); });
    if (inTab) panel.addEventListener("arco:tabchange", () => {
      if (score.hidden) snap(panel);
      else fit();
    });
    return { score, quadro, fit, amplia, amplo: () => amplo,
      abre: v => { const antes = aberto; aberto = v; fit(); return v && !antes && !amplo; } };
  }).filter(Boolean);
  let scoreFit = () => quadros.forEach(q => q.fit());
  if (quadros.length){
    addEventListener("message", e => {
      if (e.origin !== location.origin || !e.data || !/^[A-Z]+_VITRINE$/.test(e.data.type || "")) return;
      const q = quadros.find(x => x.quadro.contentWindow === e.source);
      if (!q || q.score.hidden) return;
      if (e.data.pedido === "reduzir"){ q.amplia(false); return; }
      if (e.data.pedido === "ampliar"){ q.amplia(true); return; }
      const topo = q.score.getBoundingClientRect().top;
      if (q.abre(e.data.estado !== "folha") && !stacked.matches){
        const y = q.score.getBoundingClientRect().top + scrollY - railH();
        scrollTo({top:y, behavior: reduce ? "auto" : "smooth"});
      } else if (!q.amplo()){
        /* o quadro fica onde estava: a ancoragem de rolagem do navegador, ao
           refazer as fileiras do painel, empurraria a página */
        const d = q.score.getBoundingClientRect().top - topo;
        if (Math.abs(d) >= 1) scrollBy({top:d, behavior:"instant"});
      }
    });
    addEventListener("keydown", e => {
      if (e.key !== "Escape") return;
      const q = quadros.find(x => x.amplo());
      if (q){ e.preventDefault(); q.amplia(false); }
    });
    /* a altura da janela decide o quadro: muda sem mudar a largura */
    let hRaf = 0;
    addEventListener("resize", () => { if (!hRaf) hRaf = requestAnimationFrame(() => { hRaf = 0; scoreFit(); }); }, {passive:true});
    scoreFit();
  }

  const schedule = () => { if (!raf) raf = requestAnimationFrame(() => layout()); };
  addEventListener("resize", schedule, {passive:true});
  if ("ResizeObserver" in window && heroRoot) new ResizeObserver(schedule).observe(heroRoot);
  const homeView = home.closest(".view");
  if (homeView && "MutationObserver" in window) new MutationObserver(() => {
    if (homeView.dataset.active === "true") layout(true);
  }).observe(homeView, {attributes:true, attributeFilter:["data-active"]});
  stacked.addEventListener?.("change", () => layout(true));
  document.fonts?.ready.then(() => { layout(true); landOnHash(); });
  addEventListener("load", () => { layout(true); landOnHash(); });
  layout(true);

  /* ---------- 3. navegação interna ---------- */
  const PANEL_OF = {data:"rastro", echo:"legal-operations", atrio:"legal-engineering", cerne:"ai-governance"};
  const isHomeTarget = id => {
    const el = id && document.getElementById(id);
    return el && (home.contains(el) || heroRoot?.contains(el)) ? el : null;
  };
  function go(id, {push = true, focus = null} = {}){
    const target = isHomeTarget(id);
    if (!target) return;
    if (push && location.hash !== "#" + id) history.pushState({view:"home"}, "", "#" + id);
    target.scrollIntoView({block:"start", behavior: reduce ? "instant" : "smooth"});
    if (focus) focus.focus({preventScroll:true});
  }
  /* chegada por âncora de painel: depois do ajuste (fontes, depois carga),
     o ponto de pouso é refeito, sem animação e só enquanto o leitor não rolou */
  let landings = 0, userScrolled = false;
  ["wheel", "touchmove", "keydown"].forEach(t => addEventListener(t, () => { userScrolled = true; }, {once:true, passive:true}));
  function landOnHash(){
    if (landings++ > 1 || userScrolled) return;
    const target = isHomeTarget(decodeURIComponent(location.hash.slice(1)));
    if (target) target.scrollIntoView({block:"start", behavior:"instant"});
  }

  home.addEventListener("click", event => {
    const el = event.target instanceof Element ? event.target : null;
    if (!el) return;
    const panelLink = el.closest("a[data-hm-go]");
    if (panelLink){
      event.preventDefault();
      go(panelLink.getAttribute("href").slice(1));
      return;
    }
    const viewLink = el.closest("a[data-hm-view]");
    if (viewLink){
      event.preventDefault();
      const view = viewLink.dataset.hmView;
      const railLink = document.querySelector(`.rail__link[data-view="${view}"]`);
      /* pelo cordão, quando ele tem a entrada; senão a própria casca já abriu a
         view pelo data-view do link, quando a vista não está no cordão) */
      if (railLink) railLink.click();
      else if (!viewLink.dataset.view) location.hash = view;
      return;
    }
    const term = el.closest("a[data-hm-term]");
    if (term){
      event.preventDefault();
      const id = term.getAttribute("href").slice(1);
      const entry = document.getElementById(id);
      if (entry?.hidden) clearIndex();
      if (entry?.dataset.open === "false") setOpen(entry, true);
      home.querySelectorAll(".lex__e.is-target").forEach(e => e.classList.remove("is-target"));
      entry?.classList.add("is-target");
      go(id, {focus:entry});
      return;
    }
    const comp = el.closest("[data-arx-comp]");
    if (comp && PANEL_OF[comp.dataset.arxComp]){
      event.stopPropagation();
      go(PANEL_OF[comp.dataset.arxComp]);
    }
  });
  home.addEventListener("keydown", event => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const comp = event.target instanceof Element ? event.target.closest("[data-arx-comp][role='button']") : null;
    if (!comp || !PANEL_OF[comp.dataset.arxComp]) return;
    event.preventDefault();
    event.stopPropagation();
    go(PANEL_OF[comp.dataset.arxComp]);
  });

  /* A troca de idioma leva ao mesmo painel no outro idioma. */
  document.querySelectorAll(".arco-lang a").forEach(link =>
    link.addEventListener("click", () => {
      if (document.querySelector('.view[data-active="true"]')?.dataset.view !== "home") return;
      const marker = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--rail-h")) || 0) + innerHeight * .35;
      let current = null;
      for (const p of panels){ if (p.getBoundingClientRect().top <= marker) current = p; }
      if (!current || current === panels[0]) return;
      const target = new URL(link.href, location.href);
      target.hash = current.id;
      link.href = target.href;
    }, {capture:true}));

  /* ---------- 4. índice: busca, filtro e recolhimento ---------- */
  const lex = document.getElementById("eq-dicionario");
  const lexBar = home.querySelector(".lexf");
  const narrow = matchMedia("(max-width:900px)");
  let clearIndex = () => {};
  function setOpen(e, open){
    e.dataset.open = String(open);
    e.querySelector(".lex__t")?.setAttribute("aria-expanded", String(open));
  }
  if (lex && lexBar){
    const entries = [...lex.querySelectorAll(".lex__e")];
    const letters = [...lex.querySelectorAll(".lex__l")];
    const chips = [...lexBar.querySelectorAll("[data-lexf]")];
    const input = lexBar.querySelector(".lexf__i");
    const status = document.getElementById("lexf-status");
    const empty = home.querySelector(".lexf__vazio");
    const lastro = document.getElementById("lastro");
    const fold = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    const text = new Map(entries.map(e => [e, fold(e.textContent)]));
    let proj = "";

    const inProj = (e, p) => !p || e.dataset.proj.split(" ").includes(p);
    const apply = () => {
      const q = fold(input.value.trim());
      const hit = e => text.get(e).includes(q);
      let shown = 0;
      entries.forEach(e => {
        const on = inProj(e, proj) && hit(e);
        e.hidden = !on;
        if (on) shown++;
      });
      letters.forEach(l => {
        let n = l.nextElementSibling, any = false;
        while (n && !n.classList.contains("lex__l")){ if (n.matches(".lex__e") && !n.hidden) any = true; n = n.nextElementSibling; }
        l.hidden = !any;
      });
      chips.forEach(c => { c.querySelector(".lexf__c").textContent = entries.filter(e => inProj(e, c.dataset.lexf) && hit(e)).length; });
      empty.hidden = shown > 0;
      status.textContent = shown ? `${shown} of ${entries.length} entries` : "No entries in this selection";
      if (lastro) snap(lastro);
    };
    clearIndex = () => {
      input.value = "";
      proj = "";
      chips.forEach(c => c.setAttribute("aria-pressed", String(c === chips[0])));
      apply();
    };

    chips.forEach(chip => chip.addEventListener("click", () => {
      proj = chip.dataset.lexf;
      chips.forEach(c => c.setAttribute("aria-pressed", String(c === chip)));
      apply();
    }));
    /* buscando, o motivo do acerto pode estar na parte recolhida: abre; limpando, fecha */
    input.addEventListener("input", () => {
      const q = Boolean(input.value.trim());
      entries.forEach(e => { if (e.dataset.open) setOpen(e, q); });
      apply();
    });
    empty.querySelector(".lexf__limpa").addEventListener("click", () => {
      clearIndex();
      input.focus();
    });

    /* recolhimento: só no celular; no desktop o verbete fica inteiro */
    const setNarrow = () => {
      entries.forEach(e => {
        const t = e.querySelector(".lex__t");
        if (narrow.matches){
          e.dataset.open = "false";
          t.setAttribute("role", "button");
          t.setAttribute("tabindex", "0");
          t.setAttribute("aria-expanded", "false");
        } else {
          delete e.dataset.open;
          ["role", "tabindex", "aria-expanded"].forEach(a => t.removeAttribute(a));
        }
      });
      if (lastro) snap(lastro);
    };
    lex.addEventListener("click", ev => {
      const e = ev.target.closest(".lex__e[data-open]");
      if (!e || ev.target.closest(".lex__k")) return;
      setOpen(e, e.dataset.open !== "true");
      if (lastro) snap(lastro);
    });
    lex.addEventListener("keydown", ev => {
      const t = ev.target.closest(".lex__t[role='button']");
      if (!t || (ev.key !== "Enter" && ev.key !== " ")) return;
      ev.preventDefault();
      const e = t.closest(".lex__e");
      setOpen(e, e.dataset.open !== "true");
      if (lastro) snap(lastro);
    });
    narrow.addEventListener?.("change", setNarrow);
    setNarrow();
    apply();
    lexBar.hidden = false;
  }
  /* a origem recolhida muda a altura da obra: o painel refaz as fileiras */
  home.addEventListener("toggle", e => {
    const panel = e.target instanceof Element ? e.target.closest(".hm-panel") : null;
    if (panel) snap(panel);
  }, true);
})();
