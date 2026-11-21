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

  /* ---------- 2. retícula: fileiras em múltiplos de --row ---------- */
  function snap(panel){
    panel.style.gridTemplateRows = "";
    const r = rowPx();
    const tracks = getComputedStyle(panel).gridTemplateRows.split(/\s+/).map(parseFloat).filter(n => n > 0);
    if (!tracks.length) return;
    const units = tracks.map(t => Math.max(1, Math.ceil((t - 1) / r)));
    /* o painel fecha num número inteiro de quadrados: no desktop a fileira é
       meio quadrado, então o total de fileiras precisa ser par */
    const perCell = stacked.matches ? 1 : 2;
    const sum = units.reduce((a, b) => a + b, 0);
    if (sum % perCell) units[units.length - 1] += perCell - (sum % perCell);
    panel.style.gridTemplateRows = units.map(u => u * r + "px").join(" ");
  }
  const snapAll = () => panels.forEach(snap);

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
    if (!force && w === lastWidth && r === lastRow) return;
    lastWidth = w; lastRow = r;
    fit();
    scoreFit();
    snapAll();
    lockFigures();
    alignTabs();
    raiseTitles();
  }
  /* ---------- linhas da retícula visível ----------
     A retícula visível é um quadrado de lado = largura / 8, contínuo desde o
     topo da home. Estas funções só pousam elementos nas suas linhas. */
  const cellPx = () => home.clientWidth / 8;
  const yIn = el => el.getBoundingClientRect().bottom - home.getBoundingClientRect().top;

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
    home.querySelectorAll(".hm-title, .hm-name").forEach(t => {
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
    const L = alvo - (pr.top - hr.top);
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

  /* ---------- ECHO: folha de rosto e partitura ----------
     A folha de rosto ocupa o campo da esquerda do painel, na altura útil da
     tela em fileiras inteiras, para que leitor, parte e montador, que abrem
     dentro da partitura, fiquem sempre à vista. Aberta, a folha vira para a
     esquerda e a partitura em coluna (play.html?partitura&empilha, carregada
     só agora, desenho empilhado) fica no lugar dela, rolando por dentro.
     Sem JS ou no celular, fica a folha, sem convite. */
  const score = home.querySelector(".hm-score");
  let scoreFit = () => {};
  if (score){
    const panel = score.closest(".hm-panel");
    const rosto = score.querySelector(".hm-rosto");
    const pe = score.querySelector(".hm-rosto__pe");
    const railH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--rail-h")) || 0;
    /* teto: a partitura empilhada inteira (1155 px medidos; depois, a medida
       real), para que uma tela muito alta não sobre papel em branco */
    let frame = null, medida = 0;
    const altura = () => {
      const r = rowPx(), util = innerHeight - railH();
      const teto = Math.ceil((medida || 1155) / r) * r;
      return Math.max(r * 4, Math.min(Math.floor(util / r) * r, teto));
    };
    const cabe = () => !stacked.matches;
    const seta = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h13M12.5 6.5 18 12l-5.5 5.5"/></svg>';
    const xis = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m7 7 10 10M17 7 7 17"/></svg>';
    const convite = document.createElement("button");
    convite.type = "button"; convite.className = "hm-pil hm-score__abrir"; convite.hidden = true;
    convite.setAttribute("aria-expanded", "false");
    convite.innerHTML = '<span class="hm-pil__t">View documents</span><span class="hm-pil__b">' + seta + '</span>';
    const fechar = document.createElement("button");
    fechar.type = "button"; fechar.className = "hm-pil hm-score__fechar"; fechar.hidden = true;
    fechar.setAttribute("aria-label", "Close the score and return to the title page");
    fechar.innerHTML = '<span class="hm-pil__t" aria-hidden="true">Close</span><kbd aria-hidden="true">Esc</kbd><span class="hm-pil__b">' + xis + '</span>';
    pe.appendChild(convite);
    score.appendChild(fechar);
    score.classList.add("is-live");

    const aberto = () => score.classList.contains("is-open");
    function fecha(devolveFoco = true){
      if (!aberto()) return;
      score.classList.remove("is-open");
      convite.setAttribute("aria-expanded", "false");
      fechar.hidden = true; rosto.inert = false;
      if (frame) frame.tabIndex = -1;
      if (devolveFoco) convite.focus({preventScroll:true});
    }
    function mede(){
      try{
        const pag = frame.contentDocument.querySelector(".pag");
        if (!pag) return;
        medida = Math.ceil(pag.getBoundingClientRect().height);
        scoreFit();
      }catch(_){}
    }
    function monta(){
      frame = document.createElement("iframe");
      frame.className = "hm-score__frame";
      frame.title = "ECHO score: the method documents";
      frame.src = score.dataset.score;
      frame.addEventListener("load", () => {
        mede();
        try{
          const w = frame.contentWindow, d = frame.contentDocument;
          /* Esc fecha a partitura só quando nada está aberto dentro dela */
          w.addEventListener("keydown", e => {
            if (e.key !== "Escape") return;
            const livre = d.getElementById("sov")?.hidden !== false && d.getElementById("leitor")?.hidden !== false
              && d.getElementById("camada")?.hidden !== false && !d.getElementById("parte")?.classList.contains("on")
              && !d.querySelector(".gaveta.on");
            if (livre){ e.preventDefault(); fecha(); }
          }, true);
          w.addEventListener("resize", mede);
        }catch(_){}
      });
      score.insertBefore(frame, score.firstChild);
    }
    function abre(){
      if (!cabe()) return;
      if (!frame) monta();
      score.classList.add("is-open");
      convite.setAttribute("aria-expanded", "true");
      fechar.hidden = false; rosto.inert = true; frame.tabIndex = 0;
      const y = score.getBoundingClientRect().top + scrollY - railH();
      scrollTo({top:y, behavior: reduce ? "auto" : "smooth"});
      setTimeout(() => frame.focus({preventScroll:true}), reduce ? 0 : 420);
    }
    scoreFit = () => {
      if (stacked.matches){ score.style.removeProperty("--score-h"); }
      else score.style.setProperty("--score-h", altura() + "px");
      const ok = cabe();
      convite.hidden = !ok;
      if (!ok && aberto()) fecha(false);
      snap(panel);
    };
    convite.addEventListener("click", abre);
    fechar.addEventListener("click", () => fecha());
    score.addEventListener("keydown", e => { if (e.key === "Escape" && aberto()){ e.preventDefault(); fecha(); } });
    /* a altura da janela decide o convite: muda sem mudar a largura */
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
