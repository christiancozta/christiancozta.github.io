(() => {
  "use strict";

  const demo = document.getElementById("ratio-demo");
  if (!demo) return;

  const english = document.documentElement.lang.startsWith("en");
  const cases = english ? ratioDemoCases.en : ratioDemoCases.pt;
  const copy = english ? {
    idle: ["Choose a case", "Ready", "Choose"],
    ai: ["AI's turn", "Analyzing", "Wait"],
    print: ["TROIA is printing the matrix", "Printing", "Wait"],
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
    aiPaddle: "AI clock button",
    retry: "I still need the information requested in this phase. Check the excerpt in the case file and supplement your response."
  } : {
    idle: ["Escolha um caso", "Pronta", "Escolher"],
    ai: ["Vez da IA", "Analisa", "Aguarde"],
    print: ["TROIA está imprimindo a matriz", "Imprime", "Aguarde"],
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
    aiPaddle: "Botão da IA",
    retry: "Ainda preciso do dado pedido nesta fase. Consulte o trecho nos autos e complete sua resposta."
  };

  const find = (name) => demo.querySelector("[data-ratio-" + name + "]");
  const heading = document.getElementById("ratio-demo-title");
  const select = find("case");
  const stageHeading = find("stage");
  const humanPaddle = demo.querySelector('[data-ratio-paddle="human"]');
  const aiPaddle = demo.querySelector('[data-ratio-paddle="ai"]');
  const paper = find("troia");
  const source = find("source");
  const form = find("form");
  const reply = find("reply");
  const confirmation = find("confirmation");
  const confirmButton = find("confirm");
  const error = find("error");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
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
  }

  function clock(next) {
    state = next;
    demo.dataset.state = state;
    find("counter").textContent = session ? String(session.index + 1).padStart(2, "0") + " / " + String(stages.length).padStart(2, "0") : "— / —";
    const [status, ai, human] = copy[state];
    const computing = state === "ai" || state === "print";
    const humanTurn = state === "human" || state === "confirm";
    aiPaddle.classList.toggle("is-raised", computing);
    humanPaddle.classList.toggle("is-raised", humanTurn);
    humanPaddle.setAttribute("aria-disabled", String(!humanTurn));
    const paddleLabel = state === "confirm" ? copy.confirmPaddle : copy.paddle;
    humanPaddle.setAttribute("aria-label", paddleLabel);
    humanPaddle.title = paddleLabel;
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

  function finish() {
    paper.hidden = true;
    source.hidden = true;
    find("request").textContent = "";
    find("finding").textContent = copy.finished + " " + activeCase.phases.at(-2).excerpt;
    showLastReply();
    clock("done");
    if (!demo.hidden) stageHeading.focus({preventScroll: true});
  }

  function handToHuman(focus) {
    clock("human");
    if (focus && !demo.hidden) stageHeading.focus({preventScroll: true});
  }

  function printMatrix(entries, focus) {
    const matrix = find("matrix");
    const rows = entries.map(([label, value]) => {
      const row = document.createElement("div");
      const term = document.createElement("dt");
      const detail = document.createElement("dd");
      term.textContent = label;
      detail.textContent = value;
      row.append(term, detail);
      row.hidden = !motion.matches;
      return row;
    });
    matrix.replaceChildren(...rows);
    paper.hidden = false;
    if (motion.matches) {
      handToHuman(focus);
      return;
    }
    clock("print");
    paper.classList.add("is-printing");
    paper.setAttribute("aria-busy", "true");
    rows.forEach((row, index) => later(() => { row.hidden = false; }, index * 330));
    later(() => {
      paper.classList.remove("is-printing");
      paper.removeAttribute("aria-busy");
      handToHuman(focus);
    }, rows.length * 330);
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
    paper.hidden = true;
    paper.classList.remove("is-printing");
    paper.removeAttribute("aria-busy");
    source.hidden = true;
    source.open = false;
    error.hidden = true;
    find("request").textContent = "";
    find("finding").textContent = copy.working;
    reply.value = session.draft;

    later(() => {
      find("finding").textContent = current.reading;
      find("request").textContent = current.question;
      find("source-title").textContent = copy.source + " · " + current.source;
      find("excerpt").textContent = current.excerpt;
      source.hidden = false;
      if (current.matrix) printMatrix(current.matrix, focus);
      else handToHuman(focus);
    }, motion.matches ? 120 : 600);
  }

  function selectCase() {
    if (session) session.draft = reply.value;
    stopTimers();
    key = select.value;
    activeCase = cases[key];
    session = null;
    reply.value = "";
    paper.hidden = true;
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
      later(finish, motion.matches ? 120 : 450);
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
  humanPaddle.disabled = false;
  aiPaddle.setAttribute("aria-label", copy.aiPaddle);
  humanPaddle.addEventListener("click", () => {
    if (state === "confirm") confirm();
    else if (state === "human") form.requestSubmit();
  });

  function bindTabs() {
    const overview = document.getElementById("atrio-overview");
    const panel = overview.closest(".hm-panel");
    const art = overview.querySelector(".hm-nv");
    const sheet = overview.querySelector(":scope > .hm-ficha, :scope > .hm-narr");
    const tabs = [...panel.querySelectorAll('[role="tab"]')];
    const narrow = matchMedia("(max-width: 900px)");

    // The original card sizes the grid in both states, including an expanded origin.
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
    }

    function activate(tab) {
      const showClock = tab.id === "tab-ratio";
      overview.inert = showClock;
      overview.setAttribute("aria-hidden", String(showClock));
      demo.hidden = !showClock;
      tabs.forEach(item => {
        item.setAttribute("aria-selected", String(item === tab));
        item.tabIndex = item === tab ? 0 : -1;
      });
      fit();
    }

    for (const [i, tab] of tabs.entries()) {
      tab.addEventListener("click", () => activate(tab));
      tab.addEventListener("keydown", event => {
        const indices = {ArrowLeft: 1 - i, ArrowRight: 1 - i, Home: 0, End: 1};
        if (!(event.key in indices)) return;
        event.preventDefault();
        const next = tabs[indices[event.key]];
        activate(next);
        next.focus({preventScroll: true});
      });
    }
    document.querySelector("[data-clock-shortcut]")?.addEventListener("click", () => {
      activate(tabs[1]);
      heading.focus({preventScroll: true});
    });
    const observer = new ResizeObserver(fit);
    [art, sheet, panel].forEach(node => observer.observe(node));
  }

  selectCase();
  bindTabs();
})();
