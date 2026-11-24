/* GERADO por i18n/build.mjs a partir de arco-home.js | não editar à mão. */
/* ==========================================================================
   ARCO — home
   --------------------------------------------------------------------------
   1) ajuste tipográfico: nome, tese e títulos ocupam a largura exata do bloco;
   2) retícula: fileiras em múltiplos de --row, painel em quadrados inteiros;
   3) navegação interna: painéis, competências e verbetes, sem hover;
   4) índice "Do termo à prova": busca, filtro por projeto e recolhimento no celular;
   5) Rastro: abas (índice, finalização, fila) e tags de leitura do índice.
   A casca (cordão, views, histórico) continua em arco-shell.js.
   ========================================================================== */
(() => {
  "use strict";
  const home = document.getElementById("hm");
  if (!home) return;
  const panels = [...home.querySelectorAll(".hm-panel")];
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
  const heroH = () => home.querySelector(".hm-autoria")?.getBoundingClientRect().height || 0;
  function ancora(){
    const c = home.clientWidth / 8, h = heroH();
    lastHero = h;
    retY = c > 0 ? ((h % c) + c) % c : 0;
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
    if (sum % perCell) units[units.length - 1] += perCell - (sum % perCell);
    panel.style.gridTemplateRows = units.map(u => u * r + "px").join(" ");
  }
  const snapAll = () => panels.forEach(snap);

  /* ---------- hero: distinções em alternância ----------
     Sem JS, a série aparece inteira, em lista. Com JS, uma por vez, trocando
     a cada 5 s; para sob o ponteiro ou o foco, com a aba escondida e com
     movimento reduzido. Quem escolhe no seletor assume: a troca para. */
  const ds = home.querySelector(".hm-ds");
  if (ds){
    const itens = [...ds.querySelectorAll(".hm-d")];
    const sel = ds.querySelector(".hm-ds__sel");
    const botoes = sel ? [...sel.querySelectorAll("button")] : [];
    if (itens.length > 1 && botoes.length === itens.length){
      let atual = 0, timer = 0, escolhido = false, sobre = false;
      const mostra = k => {
        atual = k;
        ds.dataset.proj = itens[k].dataset.proj || "";
        itens.forEach((el, n) => el.classList.toggle("is-on", n === k));
        botoes.forEach((b, n) => b.setAttribute("aria-pressed", String(n === k)));
      };
      const para = () => { clearInterval(timer); timer = 0; };
      const roda = () => {
        para();
        if (reduce || escolhido || sobre || document.hidden) return;
        timer = setInterval(() => mostra((atual + 1) % itens.length), 5000);
      };
      botoes.forEach((b, n) => b.addEventListener("click", () => { escolhido = true; para(); mostra(n); }));
      ds.addEventListener("pointerenter", () => { sobre = true; para(); });
      ds.addEventListener("pointerleave", () => { sobre = false; roda(); });
      ds.addEventListener("focusin", () => { sobre = true; para(); });
      ds.addEventListener("focusout", () => { sobre = false; roda(); });
      document.addEventListener("visibilitychange", roda);
      ds.classList.add("is-alt");
      sel.hidden = false;
      mostra(0);
      roda();
    }
  }

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

  let raf = 0, lastWidth = 0, lastRow = 0;
  function layout(force = false){
    raf = 0;
    const w = home.clientWidth, r = rowPx();
    if (!force && w === lastWidth && r === lastRow && Math.abs(heroH() - lastHero) < .5) return;
    lastWidth = w; lastRow = r;
    fit();
    scoreFit();
    snapAll();
    ancora();
    lockFigures();
    alignTabs();
    raiseTitles();
  }
  /* ---------- linhas da retícula visível ----------
     A retícula visível é um quadrado de lado = largura / 8, contínuo desde o
     topo da home. Estas funções só pousam elementos nas suas linhas. */
  const cellPx = () => home.clientWidth / 8;
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
      const alvo = Math.floor((y - 1) / c) * c;
      if (y - alvo > .5) t.style.transform = `translateY(${alvo - y}px)`;
      const neq = t.closest(".hm-panel")?.querySelector(".hm-neq");
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
     (pedido "reduzir" da página, ou da home), o botão ou o fundo voltam. */
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
  stacked.addEventListener?.("change", () => layout(true));
  document.fonts?.ready.then(() => { layout(true); landOnHash(); });
  addEventListener("load", () => { layout(true); landOnHash(); });
  layout(true);

  /* ---------- 3. navegação interna ---------- */
  const PANEL_OF = {data:"rastro", echo:"legal-operations", atrio:"legal-engineering"};
  const isHomeTarget = id => {
    const el = id && document.getElementById(id);
    return el && home.contains(el) ? el : null;
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
         view pelo data-view do link (DATA, base e método, não está no cordão) */
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
})();
