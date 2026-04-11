/**
 * Pattern Play — typed answers, pattern cards, sanitised input
 */

(function () {
  "use strict";

  const STORAGE_KEY = "patternPlay_y7_v1";
  const MAX_ANSWER_LEN = 24;

  const THEME_EMOJI = {
    arcade: "🎟️",
    sport: "⚽",
    space: "🌙",
    garden: "🌱",
    music: "🎵",
  };

  const CODEX_DEFS = [
    {
      id: "repeating",
      title: "Repeating pattern",
      def: "The same short group repeats over and over.",
      look: "Find how many tiles long the group is before it starts again.",
      ex: "□, △, ○, □, △, ○, …",
    },
    {
      id: "alternating",
      title: "Alternating sequences",
      def: "Two patterns hiding inside one line. It looks like one sequence but is actually two running in parallel.",
      look: "Write the odd spots in one row and the even spots in another.",
      ex: "5, 100, 7, 110, 9, 120, …",
    },
    {
      id: "growing",
      title: "Growing or decreasing pattern",
      def: "The step between neighbours stays the same — numbers can go up (growing) or down (decreasing) each time.",
      look: "Work out the gap between neighbours. Is it always the same?",
      ex: "50, 44, 38, … (decreasing — take away 6 each time)",
    },
    {
      id: "fibonacci",
      title: "Fibonacci pattern",
      def: "The next number is the two numbers before it, added together.",
      look: "Add the last two numbers to guess the next one.",
      ex: "2, 2, 4, 6, 10, …",
    },
    {
      id: "prime",
      title: "Prime numbers",
      def: "A prime is a whole number above 1 that only splits into 1 × itself (only two factors).",
      look: "Try small times tables. A prime won’t fit except 1 × itself.",
      ex: "11 is prime; 12 is not (3×4, 2×6, …).",
    },
  ];

  /**
   * answerType: "pair" = two whole numbers (comma or space); "number" = one integer; "label" unused reserved
   * correctAnswer: normalised string (e.g. "9,7", "26")
   * packetLines: optional — two+ rows; else use packets as one row
   */
  const MISSIONS = [
    {
      id: 1,
      theme: "arcade",
      stripLabel: "Prize booth",
      title: "Level 1 — Crumpled ticket strip",
      brief: "Part of the print got torn off. Fill in the two missing numbers in order.",
      question: "What are the two missing numbers?",
      answerType: "pair",
      correctAnswer: "9,7",
      packetLines: [
        [{ v: "3" }, { v: "7" }, { v: "2" }, { t: "q" }, { v: "5" }, { v: "3" }],
        [{ t: "q" }, { v: "2" }, { v: "9" }, { v: "5" }, { v: "3" }, { v: "7" }, { v: "2" }, { v: "9" }],
      ],
      codexId: "repeating",
    },
    {
      id: 2,
      theme: "sport",
      stripLabel: "Court — two rules",
      title: "Level 2 — Sports court: two number rows",
      brief:
        "Score numbers from two drills are mixed in one line — odd steps are one drill, even steps are another. What’s the next number?",
      question: "What number comes next? (type the number only)",
      answerType: "number",
      correctAnswer: "26",
      packets: [
        { v: "10" },
        { v: "20" },
        { v: "12" },
        { v: "22" },
        { v: "14" },
        { v: "24" },
        { v: "16" },
        { t: "q" },
      ],
      codexId: "alternating",
    },
    {
      id: 3,
      theme: "space",
      stripLabel: "Space — count down",
      title: "Level 3 — Space: decreasing hops",
      brief:
        "Each hop goes down by the same amount — like a rover stepping to lower moon rocks. What number is the next hop?",
      question: "What number comes next? (type the number only)",
      answerType: "number",
      correctAnswer: "10",
      packets: [{ v: "40" }, { v: "34" }, { v: "28" }, { v: "22" }, { v: "16" }, { t: "q" }],
      codexId: "growing",
    },
    {
      id: 4,
      theme: "garden",
      stripLabel: "Garden — plant maths",
      title: "Level 4 — Garden: add last two leaves",
      brief:
        "Plant heights follow a special rule: the next height is the last two heights added together. What’s next?",
      question: "What number comes next? (type the number only)",
      answerType: "number",
      correctAnswer: "29",
      packets: [{ v: "3" }, { v: "4" }, { v: "7" }, { v: "11" }, { v: "18" }, { t: "q" }],
      codexId: "fibonacci",
    },
    {
      id: 5,
      theme: "music",
      stripLabel: "Stage — special number",
      title: "Level 5 — Music stage: pick the special number",
      brief:
        "Backstage tags show five numbers. Only one is prime: it only splits into 1 × itself. Which tag is it?",
      question: "Which number is prime? (type the number only)",
      answerType: "number",
      correctAnswer: "11",
      packets: [{ v: "11" }, { v: "4" }, { v: "6" }, { v: "9" }, { v: "15" }],
      codexId: "prime",
    },
  ];

  const el = {
    missionStrip: document.getElementById("missionStrip"),
    introCard: document.getElementById("introCard"),
    gamePanel: document.getElementById("gamePanel"),
    completeCard: document.getElementById("completeCard"),
    missionTitle: document.getElementById("missionTitle"),
    missionBrief: document.getElementById("missionBrief"),
    patternRow: document.getElementById("patternRow"),
    brandEmoji: document.getElementById("brandEmoji"),
    questionText: document.getElementById("questionText"),
    answerFieldSingle: document.getElementById("answerFieldSingle"),
    answerFieldPair: document.getElementById("answerFieldPair"),
    answerInput: document.getElementById("answerInput"),
    answerInput1: document.getElementById("answerInput1"),
    answerInput2: document.getElementById("answerInput2"),
    answerLabel: document.getElementById("answerLabel"),
    feedback: document.getElementById("feedback"),
    btnSubmit: document.getElementById("btnSubmit"),
    btnStart: document.getElementById("btnStart"),
    btnReplay: document.getElementById("btnReplay"),
    btnHowTo: document.getElementById("btnHowTo"),
    btnCodex: document.getElementById("btnCodex"),
    codexCount: document.getElementById("codexCount"),
    codexGrid: document.getElementById("codexGrid"),
    modalHowTo: document.getElementById("modalHowTo"),
    modalCodex: document.getElementById("modalCodex"),
    modalCardReward: document.getElementById("modalCardReward"),
    cardRewardLevel: document.getElementById("cardRewardLevel"),
    cardRewardTask: document.getElementById("cardRewardTask"),
    cardRewardBox: document.getElementById("cardRewardBox"),
    btnCardNext: document.getElementById("btnCardNext"),
  };

  let state = loadState();
  let currentMissionIndex = 0;
  let pendingAfterCard = null;

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        return {
          highestUnlocked: Math.min(Math.max(1, p.highestUnlocked || 1), MISSIONS.length + 1),
          codexUnlocked: new Set(p.codexUnlocked || []),
          seenIntro: !!p.seenIntro,
        };
      }
    } catch (_) {}
    return { highestUnlocked: 1, codexUnlocked: new Set(), seenIntro: false };
  }

  function saveState() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        highestUnlocked: state.highestUnlocked,
        codexUnlocked: [...state.codexUnlocked],
        seenIntro: state.seenIntro,
      })
    );
  }

  /**
   * Strip control characters and characters that could break HTML or scripts.
   */
  function sanitizeAnswer(raw) {
    if (raw == null || typeof raw !== "string") return "";
    let s = raw.trim();
    s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
    s = s.replace(/[<>"'`\\]/g, "");
    if (s.length > MAX_ANSWER_LEN) s = s.slice(0, MAX_ANSWER_LEN);
    return s;
  }

  /**
   * Parse sanitised input into a normalised answer or return an error message for the user.
   */
  function parseAnswer(mission, sanitised) {
    if (!sanitised) {
      return { ok: false, error: "Type an answer, then press Submit." };
    }
    if (mission.answerType === "pair") {
      const parts = sanitised.split(/[\s,]+/).filter(Boolean);
      if (parts.length !== 2) {
        return {
          ok: false,
          error: "Each box must have one whole number (digits only).",
        };
      }
      if (!/^\d+$/.test(parts[0]) || !/^\d+$/.test(parts[1])) {
        return { ok: false, error: "Use digits only in each box." };
      }
      return { ok: true, value: `${parts[0]},${parts[1]}` };
    }
    if (mission.answerType === "label") {
      const u = sanitised.toUpperCase();
      if (!/^S[123]$/.test(u)) {
        return {
          ok: false,
          error: "Use a shell label only: S1, S2, or S3 (letters and number, no spaces).",
        };
      }
      return { ok: true, value: u };
    }
    const digits = sanitised.replace(/\s/g, "");
    if (!/^\d+$/.test(digits)) {
      return { ok: false, error: "Use a whole number with digits 0–9 only (no letters or symbols)." };
    }
    return { ok: true, value: digits };
  }

  function variantForIndex(i) {
    const mods = ["a", "b", "c"];
    return mods[i % 3];
  }

  function applyTheme(mission) {
    if (!mission || !mission.theme) {
      document.body.removeAttribute("data-mission-theme");
      if (el.brandEmoji) el.brandEmoji.textContent = "🎮";
      return;
    }
    document.body.dataset.missionTheme = mission.theme;
    if (el.brandEmoji) el.brandEmoji.textContent = THEME_EMOJI[mission.theme] || "🎮";
  }

  function renderPackets(mission) {
    el.patternRow.innerHTML = "";
    const lines = mission.packetLines || [mission.packets];
    let tileIndex = 0;
    lines.forEach((line) => {
      const row = document.createElement("div");
      row.className = "pattern-stage__row";
      line.forEach((p, i) => {
        if (i > 0) {
          const ar = document.createElement("span");
          ar.className = "arrow-between";
          ar.textContent = "→";
          ar.setAttribute("aria-hidden", "true");
          row.appendChild(ar);
        }
        const wrap = document.createElement("div");
        const isQ = p.t === "q";
        const variant = variantForIndex(tileIndex);
        tileIndex += 1;
        if (isQ) {
          wrap.className = `packet packet--${variant} packet--gap packet--q packet--question-only`;
          wrap.setAttribute("role", "img");
          wrap.setAttribute("aria-label", "Missing — what goes here?");
          const mark = document.createElement("span");
          mark.className = "packet__mark";
          mark.textContent = "?";
          wrap.appendChild(mark);
          wrap.title = "Missing";
        } else {
          wrap.className = `packet packet--${variant} packet--value-only`;
          wrap.setAttribute("role", "img");
          const code = document.createElement("span");
          code.className = "packet__code";
          code.textContent = p.v;
          wrap.appendChild(code);
          wrap.title = `Label ${p.v}`;
        }
        row.appendChild(wrap);
      });
      el.patternRow.appendChild(row);
    });
  }

  function renderMissionStrip() {
    el.missionStrip.innerHTML = "";
    MISSIONS.forEach((m, idx) => {
      const num = idx + 1;
      const li = document.createElement("li");
      const btn = document.createElement("button");
      const unlocked = num <= state.highestUnlocked;
      btn.type = "button";
      btn.disabled = !unlocked;
      btn.className = idx === currentMissionIndex && unlocked ? "is-current" : "";
      btn.innerHTML = `<span class="mi-num">L${num}</span><span class="mi-title">${escapeHtml(
        m.stripLabel
      )}</span><span class="mi-lock" aria-hidden="true">${unlocked ? "✓" : "🔒"}</span>`;
      btn.addEventListener("click", () => {
        if (unlocked) {
          currentMissionIndex = idx;
          showMission(idx);
        }
      });
      li.appendChild(btn);
      el.missionStrip.appendChild(li);
    });
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function clearFeedback() {
    el.feedback.textContent = "";
    el.feedback.className = "feedback";
  }

  function showFeedback(message, kind) {
    el.feedback.textContent = message;
    el.feedback.className = `feedback is-${kind}`;
  }

  function showMission(index) {
    const mission = MISSIONS[index];
    if (!mission) return;
    currentMissionIndex = index;
    clearFeedback();
    el.introCard.hidden = true;
    el.completeCard.hidden = true;
    el.gamePanel.hidden = false;

    el.missionTitle.textContent = mission.title;
    el.missionBrief.textContent = mission.brief;
    el.questionText.textContent = mission.question;

    if (mission.answerType === "pair") {
      el.answerFieldSingle.hidden = true;
      el.answerFieldPair.hidden = false;
      el.answerInput1.value = "";
      el.answerInput2.value = "";
    } else {
      el.answerFieldSingle.hidden = false;
      el.answerFieldPair.hidden = true;
      if (mission.answerType === "label") {
        el.answerLabel.textContent = "Type your answer (e.g. S1, S2, S3)";
      } else {
        el.answerLabel.textContent = "Type your answer (numbers only)";
      }
      el.answerInput.value = "";
      el.answerInput.maxLength = mission.answerType === "label" ? 8 : MAX_ANSWER_LEN;
      el.answerInput.inputMode = mission.answerType === "number" ? "numeric" : "text";
    }

    applyTheme(mission);
    renderPackets(mission);
    renderMissionStrip();

    el.btnSubmit.disabled = false;
    requestAnimationFrame(() => {
      if (mission.answerType === "pair") {
        el.answerInput1.focus();
      } else {
        el.answerInput.focus();
      }
    });
  }

  function unlockCodex(id) {
    if (!state.codexUnlocked.has(id)) {
      state.codexUnlocked.add(id);
      saveState();
    }
    updateCodexCount();
    renderCodexGrid();
  }

  function updateCodexCount() {
    el.codexCount.textContent = `${state.codexUnlocked.size}/${CODEX_DEFS.length}`;
  }

  function renderCodexGrid() {
    el.codexGrid.innerHTML = "";
    CODEX_DEFS.forEach((c) => {
      const locked = !state.codexUnlocked.has(c.id);
      const card = document.createElement("article");
      card.className = `codex-card${locked ? " is-locked" : ""}`;
      if (locked) {
        card.innerHTML = `<h3>???</h3><p><em>Finish that level to open this card.</em></p>`;
      } else {
        card.innerHTML = `
          <h3>${escapeHtml(c.title)}</h3>
          <p class="label">What it means</p>
          <p>${escapeHtml(c.def)}</p>
          <p class="label">Example</p>
          <p>${escapeHtml(c.ex)}</p>`;
      }
      el.codexGrid.appendChild(card);
    });
  }

  function fillCardRewardBox(mission) {
    const def = CODEX_DEFS.find((c) => c.id === mission.codexId);
    el.cardRewardBox.textContent = "";
    if (!def) return;

    const h3 = document.createElement("h3");
    h3.className = "card-reward__name";
    h3.textContent = def.title;

    const pMean = document.createElement("p");
    pMean.className = "label";
    pMean.textContent = "What it means";
    const pMeanBody = document.createElement("p");
    pMeanBody.textContent = def.def;

    const pEx = document.createElement("p");
    pEx.className = "label";
    pEx.textContent = "Example";
    const pExBody = document.createElement("p");
    pExBody.textContent = def.ex;

    el.cardRewardBox.appendChild(h3);
    el.cardRewardBox.appendChild(pMean);
    el.cardRewardBox.appendChild(pMeanBody);
    el.cardRewardBox.appendChild(pEx);
    el.cardRewardBox.appendChild(pExBody);
  }

  function showCardRewardModal(mission, onContinue) {
    el.cardRewardLevel.textContent = mission.title;
    el.cardRewardTask.textContent = mission.brief;
    fillCardRewardBox(mission);

    const nextIdx = currentMissionIndex + 1;
    const isLast = nextIdx >= MISSIONS.length;
    el.btnCardNext.textContent = isLast ? "Finish" : "Next level";

    pendingAfterCard = onContinue;
    el.modalCardReward.hidden = false;
    el.btnCardNext.focus();
  }

  function closeCardRewardModal() {
    el.modalCardReward.hidden = true;
  }

  function runPendingAfterCard() {
    const fn = pendingAfterCard;
    pendingAfterCard = null;
    closeCardRewardModal();
    if (typeof fn === "function") fn();
  }

  function onSubmit() {
    const mission = MISSIONS[currentMissionIndex];
    let parsed;

    if (mission.answerType === "pair") {
      const a = sanitizeAnswer(el.answerInput1.value);
      const b = sanitizeAnswer(el.answerInput2.value);
      if (!a || !b) {
        showFeedback("Fill in both boxes.", "notice");
        return;
      }
      parsed = parseAnswer(mission, `${a},${b}`);
    } else {
      const clean = sanitizeAnswer(el.answerInput.value);
      parsed = parseAnswer(mission, clean);
    }

    if (!parsed.ok) {
      showFeedback(parsed.error, "notice");
      return;
    }

    if (parsed.value !== mission.correctAnswer) {
      showFeedback("Not quite. Try another answer.", "error");
      return;
    }

    unlockCodex(mission.codexId);
    el.btnSubmit.disabled = true;

    const next = currentMissionIndex + 1;

    showCardRewardModal(mission, () => {
      if (next < MISSIONS.length) {
        state.highestUnlocked = Math.max(state.highestUnlocked, next + 1);
        saveState();
        showMission(next);
      } else {
        state.highestUnlocked = MISSIONS.length + 1;
        saveState();
        applyTheme(null);
        el.gamePanel.hidden = true;
        el.completeCard.hidden = false;
      }
      renderMissionStrip();
    });
  }

  function openModal(node) {
    node.hidden = false;
    const close = node.querySelector("[data-close-modal]");
    trapFocus(node, close);
  }

  function closeModal(node) {
    node.hidden = true;
  }

  function trapFocus(modal, firstCloseBtn) {
    const focusables = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const list = [...focusables].filter((n) => !n.disabled && n.offsetParent !== null);
    if (list.length) list[0].focus();
  }

  function init() {
    updateCodexCount();
    renderCodexGrid();

    el.btnStart.addEventListener("click", () => {
      state.seenIntro = true;
      saveState();
      showMission(0);
    });

    el.btnReplay.addEventListener("click", () => {
      state.highestUnlocked = 1;
      state.codexUnlocked = new Set();
      saveState();
      currentMissionIndex = 0;
      el.completeCard.hidden = true;
      showMission(0);
    });

    el.btnSubmit.addEventListener("click", onSubmit);
    el.answerInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (!el.btnSubmit.disabled) onSubmit();
      }
    });
    el.answerInput1.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        el.answerInput2.focus();
      }
    });
    el.answerInput2.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (!el.btnSubmit.disabled) onSubmit();
      }
    });

    el.btnCardNext.addEventListener("click", () => {
      runPendingAfterCard();
    });

    el.btnHowTo.addEventListener("click", () => openModal(el.modalHowTo));
    el.btnCodex.addEventListener("click", () => {
      renderCodexGrid();
      openModal(el.modalCodex);
    });

    [el.modalHowTo, el.modalCodex].forEach((modal) => {
      modal.querySelectorAll("[data-close-modal]").forEach((n) => {
        n.addEventListener("click", () => closeModal(modal));
      });
      modal.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal(modal);
      });
    });

    el.modalCardReward.addEventListener("keydown", (e) => {
      if (e.key === "Escape") e.preventDefault();
    });

    if (!state.seenIntro) {
      applyTheme(null);
      el.introCard.hidden = false;
      el.gamePanel.hidden = true;
      el.completeCard.hidden = true;
    } else if (state.highestUnlocked > MISSIONS.length) {
      applyTheme(null);
      el.introCard.hidden = true;
      el.gamePanel.hidden = true;
      el.completeCard.hidden = false;
    } else {
      el.introCard.hidden = true;
      currentMissionIndex = Math.min(state.highestUnlocked - 1, MISSIONS.length - 1);
      showMission(currentMissionIndex);
    }

    renderMissionStrip();
  }

  init();
})();
