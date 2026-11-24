(() => {
  "use strict";

  const demo = document.getElementById("ratio-demo");
  if (!demo) return;

  const english = document.documentElement.lang.startsWith("en");
  const cases = english ? ratioDemoCases.en : ratioDemoCases.pt;
  const copy = english ? {
    idle: ["Choose a case", "Ready", "Choose"],
    ai: ["AI's turn", "Analyzing", "Wait"],
    human: ["Your turn to respond", "Requested", "Respond"],
    confirm: ["Awaiting your confirmation", "Requested", "Confirm"],
    done: ["Simulated handoff to CERNE", "Drafted", "Confirmed"],
    intro: "Choose a case to see the AI's first move.",
    working: "The AI is preparing this phase from the fictional record.",
    finished: "The last confirmation completed the draft. It is ready for the simulated handoff to CERNE.",
    recorded: "Last confirmed response",
    source: "Open case file",
    paddle: "Review your response",
    confirmPaddle: "Confirm and press the clock",
    lockedKnob: "Clock button, locked until your turn",
    retry: "I still need the information requested in this phase. Check the excerpt in the case file and supplement your response."
  } : {
    idle: ["Escolha um caso", "Pronta", "Escolher"],
    ai: ["Vez da IA", "Analisa", "Aguarde"],
    human: ["Sua vez de responder", "Solicitou", "Responder"],
    confirm: ["Aguardando sua confirmação", "Solicitou", "Confirmar"],
    done: ["Encaminhamento simulado ao CERNE", "Formulado", "Confirmado"],
    intro: "Escolha um caso para ver a primeira jogada da IA.",
    working: "A IA está preparando esta fase a partir dos autos fictícios.",
    finished: "A última confirmação encerrou a minuta. Ela está pronta para o encaminhamento simulado ao CERNE.",
    recorded: "Última resposta confirmada",
    source: "Abrir autos",
    paddle: "Revisar sua resposta",
    confirmPaddle: "Confirmar e bater o relógio",
    lockedKnob: "Botão do relógio, travado até a sua vez",
    retry: "Ainda preciso do dado pedido nesta fase. Consulte o trecho nos autos e complete sua resposta."
  };

  const find = (name) => demo.querySelector("[data-ratio-" + name + "]");
  const select = find("case");
  const stageHeading = find("stage");
  const knob = find("knob");
  const leftKnob = document.createElement("span");
  leftKnob.className = knob.className;
  leftKnob.dataset.owner = "ai";
  leftKnob.setAttribute("aria-hidden", "true");
  leftKnob.append(knob.firstElementChild.cloneNode(true));
  knob.dataset.owner = "human";
  knob.before(leftKnob);
  for (const veil of demo.querySelectorAll(".ratio-clock__veil")) {
    const shade = veil.cloneNode(false);
    shade.setAttribute("class", "ratio-clock__shade");
    veil.before(shade);
  }
  const work = demo.querySelector(".ratio-work");
  const matrixPanel = find("matrix-panel");
  const matrixHeading = matrixPanel.querySelector("h4");
  const source = find("source");
  const form = find("form");
  const reply = find("reply");
  const confirmation = find("confirmation");
  const confirmButton = find("confirm");
  const error = find("error");
  const finding = find("finding");
  const request = find("request");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const turnPause = 520;
  const timers = new Set();
  const sessions = new Map();

  let key;
  let activeCase;
  let session;
  let current;
  let stages = [];
  let state = "idle";
  let enterHeld = false;

  function later(action, delay) {
    const id = setTimeout(() => {
      timers.delete(id);
      action();
    }, delay);
    timers.add(id);
  }

  function stopTimers() {
    timers.forEach(clearTimeout);
    timers.clear();
    finding.removeAttribute("data-typing");
    request.removeAttribute("data-typing");
    finding.parentElement.removeAttribute("aria-busy");
  }

  function typeResponse(entries, complete) {
    const lines = entries.map(([node, text]) => ({node, characters: Array.from(text)}));
    const length = lines.reduce((total, line) => total + line.characters.length, 0);
    const duration = Math.max(900, Math.min(3600, length * 24));
    const started = performance.now();
    finding.parentElement.setAttribute("aria-busy", "true");

    function write() {
      const instant = motion.matches || demo.hidden || document.hidden;
      const progress = instant ? 1 : Math.min(1, (performance.now() - started) / duration);
      let remaining = Math.ceil(progress * length);
      for (const {node, characters} of lines) {
        const shown = Math.max(0, remaining);
        node.textContent = characters.slice(0, shown).join("");
        node.toggleAttribute("data-typing", progress < 1 && remaining >= 0 && remaining < characters.length);
        remaining -= characters.length;
      }
      if (progress < 1) {
        later(write, 28);
        return;
      }
      finding.parentElement.removeAttribute("aria-busy");
      complete();
    }

    write();
  }

  function clock(next) {
    state = next;
    demo.dataset.state = state;
    find("counter").textContent = session ? String(session.index + 1).padStart(2, "0") + " / " + String(stages.length).padStart(2, "0") : "— / —";
    const [status, ai, human] = copy[state];
    const humanTurn = state === "human" || state === "confirm";
    demo.dataset.turn = humanTurn ? "human" : state === "ai" ? "ai" : "none";
    knob.disabled = !humanTurn;
    const knobLabel = !humanTurn ? copy.lockedKnob : state === "confirm" ? copy.confirmPaddle : copy.paddle;
    knob.setAttribute("aria-label", knobLabel);
    knob.title = knobLabel;
    find("ai").textContent = ai;
    find("human").textContent = human;
    find("status").textContent = status;
    form.hidden = state !== "human";
    confirmation.hidden = state !== "confirm";
    find("reset").hidden = !session;
  }

  function markPhase() {
    stages.forEach((item, index) => {
      if (index === session.index) item.setAttribute("aria-current", "step");
      else item.removeAttribute("aria-current");
    });
  }

  function showLastReply() {
    const last = session.replies.at(-1);
    const record = find("last");
    record.hidden = !last;
    record.textContent = last ? copy.recorded + " · " + last.phase + " — " + last.answer : "";
  }

  function finish(animate = false) {
    matrixPanel.hidden = true;
    source.hidden = true;
    request.textContent = "";
    const message = copy.finished + " " + activeCase.phases.at(-2).excerpt;
    const complete = () => {
      showLastReply();
      clock("done");
      if (!demo.hidden) stageHeading.focus({preventScroll: true});
    };
    if (animate) {
      typeResponse([[finding, message]], complete);
    } else {
      finding.textContent = message;
      complete();
    }
  }

  function handToHuman(focus, heading = stageHeading) {
    clock("human");
    if (focus && !demo.hidden) heading.focus({preventScroll: true});
  }

  function showMatrix(entries) {
    const rows = entries.map(([label, value]) => {
      const row = document.createElement("div");
      const term = document.createElement("dt");
      const detail = document.createElement("dd");
      term.textContent = label;
      detail.textContent = value;
      row.append(term, detail);
      return row;
    });
    find("matrix").replaceChildren(...rows);
    matrixPanel.hidden = false;
  }

  function renderMove(focus = false) {
    current = activeCase.phases[session.index];
    stageHeading.textContent = stages[session.index].textContent;
    markPhase();
    showLastReply();
    if (session.done) {
      finish();
      return;
    }

    clock("ai");
    matrixPanel.hidden = true;
    source.hidden = true;
    source.open = false;
    error.hidden = true;
    request.textContent = "";
    finding.textContent = copy.working;
    reply.value = session.draft;

    later(() => typeResponse([[finding, current.reading], [request, current.question]], () => {
      find("source-title").textContent = copy.source + " · " + current.source;
      find("excerpt").textContent = current.excerpt;
      source.hidden = false;
      if (current.matrix) {
        showMatrix(current.matrix);
        handToHuman(focus, matrixHeading);
        if (!demo.hidden) {
          work.scrollTop += matrixPanel.getBoundingClientRect().top - work.getBoundingClientRect().top;
        }
      } else {
        handToHuman(focus);
      }
    }), motion.matches ? 0 : turnPause);
  }

  function selectCase() {
    if (session) session.draft = reply.value;
    stopTimers();
    key = select.value;
    activeCase = cases[key];
    session = null;
    reply.value = "";
    matrixPanel.hidden = true;
    source.hidden = true;
    find("last").hidden = true;
    find("request").textContent = "";
    find("case-summary").textContent = "";
    find("stages").replaceChildren();
    if (!activeCase) {
      stageHeading.textContent = "";
      find("finding").textContent = copy.intro;
      clock("idle");
      return;
    }

    if (!sessions.has(key)) sessions.set(key, {index: 0, replies: [], draft: "", done: false});
    session = sessions.get(key);
    find("case-summary").textContent = activeCase.title + " — " + activeCase.summary;
    stages = activeCase.phases.map((phase, index) => {
      const item = document.createElement("li");
      item.textContent = key + "_0" + (index + 1) + " · " + phase.title;
      return item;
    });
    find("stages").append(...stages);
    renderMove();
  }

  function prepareConfirmation(event) {
    event.preventDefault();
    if (state !== "human") return;
    if (!reply.value.trim()) {
      reply.value = "";
      reply.reportValidity();
      return;
    }
    find("preview").textContent = reply.value.trim();
    clock("confirm");
    confirmButton.focus();
  }

  function edit() {
    if (state !== "confirm") return;
    clock("human");
    reply.focus();
  }

  function hasRequestedEvidence(answer) {
    // The demo checks for evidence cues in its fictional files. It does not assess legal merit.
    const normalized = answer.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
    const validating = current.matrix || session.index === activeCase.phases.length - 1;
    const withheld = /\b(?:nao|do not|cannot|can.t)\s+(?:valid|confirm|approv|aprovo|avanc|proceed|autor|author|segu|send)/.test(normalized);
    return !(validating && withheld) &&
      current.cues.every((group) => group.split("|").some((cue) => normalized.includes(cue)));
  }

  function confirm() {
    if (state !== "confirm") return;
    const answer = reply.value.trim();
    clock("ai");
    if (!hasRequestedEvidence(answer)) {
      later(() => {
        error.textContent = copy.retry;
        error.hidden = false;
        handToHuman(false);
        if (!demo.hidden) reply.focus({preventScroll: true});
      }, motion.matches ? 120 : 450);
      return;
    }

    session.replies.push({phase: stages[session.index].textContent, answer});
    session.draft = "";
    reply.value = "";
    if (session.index === activeCase.phases.length - 1) {
      session.done = true;
      later(() => finish(true), motion.matches ? 0 : turnPause);
    } else {
      session.index += 1;
      renderMove(true);
    }
  }

  find("reset").addEventListener("click", () => {
    sessions.delete(key);
    session = null;
    selectCase();
    select.focus();
  });
  select.addEventListener("change", selectCase);
  form.addEventListener("submit", prepareConfirmation);
  reply.addEventListener("input", () => { error.hidden = true; });
  reply.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.shiftKey || event.isComposing) return;
    event.preventDefault();
    if (event.repeat) return;
    enterHeld = true;
    form.requestSubmit();
  });
  window.addEventListener("keyup", (event) => { if (event.key === "Enter") enterHeld = false; });
  confirmButton.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && (enterHeld || event.repeat)) event.preventDefault();
  });
  confirmButton.addEventListener("click", confirm);
  find("edit").addEventListener("click", edit);
  // The right button runs the same checks as the form.
  knob.addEventListener("click", () => {
    if (state !== "human" && state !== "confirm") return;
    if (state === "confirm") confirm();
    else form.requestSubmit();
  });

  function bindTabs() {
    const overview = document.getElementById("atrio-overview");
    const troia = document.getElementById("troia-demo");
    const panel = overview.closest(".hm-panel");
    const grid = panel.closest(".hm");
    const clockFace = demo.querySelector(".ratio-clock");
    const art = overview.querySelector(".hm-nv");
    const sheet = overview.querySelector(":scope > .hm-ficha, :scope > .hm-narr");
    const tabs = [...panel.querySelectorAll('.ratio-tabs [role="tab"]')];
    const narrow = matchMedia("(max-width: 900px)");

    // The overview keeps the grid dimensions while the clock is active.
    function fit() {
      if (demo.hidden) return;
      const bounds = panel.getBoundingClientRect();
      const picture = art.getBoundingClientRect();
      const copy = sheet.getBoundingClientRect();
      if (!picture.width) return;
      const left = Math.min(picture.left, copy.left);
      const top = Math.min(picture.top, copy.top);
      demo.style.setProperty("--selector-height", panel.querySelector(".hm-sig--atrio").getBoundingClientRect().height + "px");
      const bottom = narrow.matches ? Math.max(picture.bottom, copy.bottom) : picture.bottom;
      Object.assign(demo.style, {
        left: (left - bounds.left) + "px",
        top: (top - bounds.top) + "px",
        width: (Math.max(picture.right, copy.right) - left) + "px",
        height: (bottom - top) + "px"
      });
      demo.style.setProperty("--picture-height", picture.height + "px");
      const page = grid.getBoundingClientRect();
      const face = clockFace.getBoundingClientRect();
      clockFace.style.setProperty("--clock-grid-x", (page.left - face.left) + "px");
      clockFace.style.setProperty("--clock-grid-y", (page.top - face.top) + "px");
    }

    function activate(tab) {
      const showClock = tab.id === "tab-ratio";
      const showTroia = tab.id === "tab-troia";
      overview.hidden = showTroia;
      overview.inert = showClock || showTroia;
      overview.setAttribute("aria-hidden", String(overview.inert));
      demo.hidden = !showClock;
      troia.hidden = !showTroia;
      tabs.forEach(item => {
        item.setAttribute("aria-selected", String(item === tab));
        item.tabIndex = item === tab ? 0 : -1;
      });
      panel.dispatchEvent(new Event("arco:tabchange"));
      fit();
    }

    for (const [i, tab] of tabs.entries()) {
      tab.addEventListener("click", () => activate(tab));
      tab.addEventListener("keydown", event => {
        const last = tabs.length - 1;
        const indices = {ArrowLeft: (i + last) % tabs.length, ArrowRight: (i + 1) % tabs.length, Home: 0, End: last};
        if (!(event.key in indices)) return;
        event.preventDefault();
        const next = tabs[indices[event.key]];
        activate(next);
        next.focus({preventScroll: true});
      });
    }
    document.querySelectorAll("[data-demo-tab]").forEach(shortcut => {
      shortcut.addEventListener("click", () => {
        const tab = document.getElementById(shortcut.dataset.demoTab);
        activate(tab);
        (tab.id === "tab-ratio" ? document.getElementById("ratio-demo-title") : tab).focus({preventScroll: true});
      });
    });
    const observer = new ResizeObserver(fit);
    [art, sheet, panel, grid].forEach(node => observer.observe(node));
  }

  selectCase();
  bindTabs();
})();
