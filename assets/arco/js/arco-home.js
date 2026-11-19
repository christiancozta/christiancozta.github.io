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
    /* reticências: abrem a legenda e o resto do local, e voltam a fechar */
    rastro.querySelectorAll(".hm-ix__more button").forEach(b => b.addEventListener("click", () => {
      const corpo = b.closest("tbody");
      const linha = b.closest("tr");
      const aberto = !corpo.classList.contains("is-open");
      corpo.classList.toggle("is-open", aberto);
      b.setAttribute("aria-expanded", String(aberto));
      /* aberto, a linha desce para o fim do local e vira flecha; fechado,
         volta para logo abaixo dos itens visíveis */
      if (aberto) corpo.appendChild(linha);
      else corpo.insertBefore(linha, corpo.querySelector("tr.is-extra:not(.hm-ix__leg)"));
      snap(rastro);
    }));
    const tabela = rastro.querySelector(".hm-ix");
    const tags = [...rastro.querySelectorAll(".hm-ix__tag")];
    tags.forEach(b => b.addEventListener("click", () => {
      tags.forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      if (tabela) tabela.dataset.tag = b.dataset.tag;
    }));
  }

  /* ---------- figuras presas à retícula ----------
     ECHO: a pauta do símbolo (24 unidades) ocupa exatamente duas fileiras; a
     linha superior pousa numa linha da retícula e o ritornelo encosta na
     margem direita do campo. ATRIO: como no hero do próprio ATRIO, o horizonte
     da esteira é travado num múltiplo inteiro da fileira e a base da esteira
     corre em oitavos da largura do campo. Sem JS, as figuras ficam no desenho
     estático, apenas sem esse travamento. */
  const f3 = n => n.toFixed(2);
  function lockFigures(){
    const r = rowPx();
    const echo = home.querySelector(".hm-nv--echo svg");
    const art = echo?.querySelector(".hm-art");
    if (echo && art){
      const {width:W, height:H} = echo.getBoundingClientRect();
      if (W > 0 && H > 0){
        const n = Math.max(2, Math.round(H / r)), s = (2 * r) / 240;
        const top = Math.floor((n - 2) / 2) * r;
        echo.setAttribute("viewBox", `0 0 ${f3(W)} ${f3(H)}`);
        echo.setAttribute("preserveAspectRatio", "none");
        art.setAttribute("transform", `translate(${f3(W - 720 * s)} ${f3(top - 180 * s)}) scale(${s.toFixed(5)})`);
      }
    }
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
    snapAll();
    lockFigures();
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
      status.textContent = shown ? `${shown} de ${entries.length} verbetes` : "Nenhum verbete neste recorte";
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
