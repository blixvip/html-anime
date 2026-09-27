import { SCRIPTS, compileBrief } from "./harness/compile.js";

document.body.classList.add("is-live");

const stage = document.querySelector("#stage");
const frameInput = document.querySelector("#frame");
const counter = document.querySelector("#counter");
const cells = document.querySelector("#cells");
const holdBtn = document.querySelector("#hold");
const form = document.querySelector("#sheet");
const out = document.querySelector("#out");
const status = document.querySelector("#status");
const copySheet = document.querySelector("#copy-sheet");
const copyCommand = document.querySelector("#copy-command");
const command = document.querySelector("#command");
const agentNote = document.querySelector("#agent-note");

const CUT = 16;

const AGENTS = {
  claude: {
    note: "Claude Code reads CLAUDE.md, then the five skills.",
    command: "git clone https://github.com/blixvip/html-anime.git\ncd html-anime\nclaude",
  },
  codex: {
    note: "Codex reads AGENTS.md, then the five skills.",
    command: "git clone https://github.com/blixvip/html-anime.git\ncd html-anime\ncodex",
  },
  cursor: {
    note: "Cursor reads .cursor/rules/html-anime.mdc. Paste the sheet into Agent.",
    command: "git clone https://github.com/blixvip/html-anime.git\ncd html-anime\ncursor .",
  },
  grok: {
    note: "Grok reads AGENTS.md, then the five skills.",
    command: "git clone https://github.com/blixvip/html-anime.git\ncd html-anime\ngrok",
  },
};

let timer = 0;
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let playing = !reduced;

function paintSwatches() {
  for (const chip of document.querySelectorAll(".chip")) {
    const script = SCRIPTS[chip.dataset.script];
    const swatch = chip.querySelector(".swatch");
    swatch.style.background = script.colors.sky;
    swatch.style.boxShadow = `inset 0 0 0 3px ${script.colors.accent}`;
  }
}

function applyScript(id) {
  const script = SCRIPTS[id];
  if (!script) return;
  for (const [key, value] of Object.entries(script.colors)) {
    stage.style.setProperty(`--film-${key}`, value);
  }
  stage.dataset.script = id;
}

function applyFrame(n) {
  const frame = ((Number(n) % 24) + 24) % 24;
  frameInput.value = String(frame);
  stage.dataset.shot = frame >= CUT ? "close" : "wide";
  stage.dataset.flare = frame >= 10 && frame < CUT ? "on" : "off";
  if (frame >= CUT) {
    stage.dataset.pose = frame === 20 ? "blink" : "open";
  } else {
    stage.dataset.pose = frame % 8 < 4 ? "a" : "b";
  }
  counter.textContent = String(frame + 1).padStart(3, "0");
  for (const cell of cells.children) {
    cell.classList.toggle("on", Number(cell.dataset.frame) === frame);
  }
}

function buildCells() {
  for (let i = 0; i < 24; i += 1) {
    const cell = document.createElement("i");
    cell.dataset.frame = String(i);
    if (i === CUT) cell.classList.add("cut");
    if (i === 0 || i === 7 || i === CUT || i === 23) {
      cell.textContent = String(i + 1).padStart(2, "0");
    }
    cells.append(cell);
  }
}

function readForm() {
  const data = new FormData(form);
  return {
    logline: data.get("logline"),
    dialogue: data.get("dialogue"),
    seconds: data.get("seconds"),
    aspect: data.get("aspect"),
    script: data.get("script"),
    agent: data.get("agent"),
  };
}

function renderSheet() {
  const values = readForm();
  applyScript(values.script || "indigo");
  stage.dataset.aspect = values.aspect || "16:9";
  const brief = compileBrief(values);
  const agent = AGENTS[values.agent] || AGENTS.claude;
  agentNote.textContent = agent.note;
  command.textContent = agent.command;
  if (!brief.ok) {
    out.textContent = brief.error;
    copySheet.disabled = true;
    status.dataset.kind = "err";
    status.textContent = brief.error;
    return;
  }
  out.textContent = brief.markdown;
  copySheet.disabled = false;
  status.textContent = "";
  status.dataset.kind = "";
}

async function copyText(text, button, message) {
  try {
    await navigator.clipboard.writeText(text);
    const previous = button.textContent;
    button.textContent = "Copied";
    status.dataset.kind = "";
    status.textContent = message;
    window.setTimeout(() => {
      button.textContent = previous;
    }, 1600);
  } catch {
    status.dataset.kind = "err";
    status.textContent = "Clipboard blocked. Select the sheet and copy it.";
    const range = document.createRange();
    range.selectNodeContents(out);
    const selection = getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

function pause() {
  playing = false;
  window.clearInterval(timer);
  holdBtn.textContent = "Play";
  holdBtn.setAttribute("aria-pressed", "true");
}

function play() {
  playing = true;
  holdBtn.textContent = "Hold";
  holdBtn.setAttribute("aria-pressed", "false");
  window.clearInterval(timer);
  timer = window.setInterval(() => {
    applyFrame(Number(frameInput.value) + 1);
  }, 180);
}

form.addEventListener("submit", (event) => event.preventDefault());
form.addEventListener("input", renderSheet);
frameInput.addEventListener("input", () => {
  pause();
  applyFrame(frameInput.value);
});
holdBtn.addEventListener("click", () => {
  if (playing) pause();
  else play();
});
copySheet.addEventListener("click", () => {
  const brief = compileBrief(readForm());
  if (!brief.ok) return;
  copyText(brief.markdown, copySheet, "Sheet copied. Paste it as the first message.");
});
copyCommand.addEventListener("click", () => {
  const agent = AGENTS[readForm().agent] || AGENTS.claude;
  copyText(agent.command, copyCommand, "Command copied.");
});

buildCells();
paintSwatches();

const params = new URLSearchParams(location.search);
for (const name of ["aspect", "script", "seconds", "agent"]) {
  const value = params.get(name);
  if (!value) continue;
  const radio = form.querySelector(`input[name="${name}"][value="${CSS.escape(value)}"]`);
  if (radio) radio.checked = true;
}
renderSheet();

const frameParam = params.get("frame");
applyFrame(frameParam == null ? (reduced ? 8 : 0) : frameParam);
if (playing && frameParam == null) play();
else pause();

document.addEventListener("visibilitychange", () => {
  if (document.hidden && playing) pause();
});
