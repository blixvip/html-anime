/**
 * Turns a scene into an html-anime sheet.
 * Drawing budgets match skills/html-anime-timing/SKILL.md.
 * Color scripts are the only paints an agent may use.
 */

export const FPS = 24;

export const ASPECTS = {
  "16:9": { w: 1920, h: 1080 },
  "9:16": { w: 1080, h: 1920 },
};

export const SCRIPTS = {
  indigo: {
    id: "indigo",
    name: "Indigo moon",
    colors: {
      sky: "#1b2d6b",
      ink: "#101628",
      moon: "#d5e2ff",
      accent: "#e23b4a",
      practical: "#f0c36a",
      iris: "#e7a04a",
      skin: "#f0c2ae",
      hair: "#16141c",
      sclera: "#f6f3ee",
      line: "#e7eefc",
    },
  },
  eclipse: {
    id: "eclipse",
    name: "Vermilion eclipse",
    colors: {
      sky: "#2a1016",
      ink: "#14080c",
      moon: "#100608",
      accent: "#ff3b3b",
      practical: "#f3f6ff",
      iris: "#ff5a4a",
      skin: "#e8b8a8",
      hair: "#1a1014",
      sclera: "#f6f3ee",
      line: "#f6e4e4",
    },
  },
  noon: {
    id: "noon",
    name: "Paper noon",
    colors: {
      sky: "#f2d7ae",
      ink: "#2c261f",
      moon: "#fff6e4",
      accent: "#c4452d",
      practical: "#fffaf2",
      iris: "#5c3d32",
      skin: "#f0c2ae",
      hair: "#241c16",
      sclera: "#f6f3ee",
      line: "#241c16",
    },
  },
  festival: {
    id: "festival",
    name: "Festival",
    colors: {
      sky: "#24143a",
      ink: "#140c1c",
      moon: "#ffd7a1",
      accent: "#ff4d6d",
      practical: "#ffb020",
      iris: "#ffd0a1",
      skin: "#f0c2ae",
      hair: "#1a1020",
      sclera: "#f6f3ee",
      line: "#fff1ea",
    },
  },
};

const PLANS = {
  8: [
    { id: "establish", label: "Establish", dur: 2.4, sakuga: false },
    { id: "sakuga", label: "Sakuga", dur: 3.6, sakuga: true },
    { id: "button", label: "Button", dur: 2, sakuga: false },
  ],
  12: [
    { id: "establish", label: "Establish", dur: 2.5, sakuga: false },
    { id: "approach", label: "Approach", dur: 2.5, sakuga: false },
    { id: "sakuga", label: "Sakuga", dur: 4, sakuga: true },
    { id: "button", label: "Button", dur: 3, sakuga: false },
  ],
  20: [
    { id: "establish", label: "Establish", dur: 3, sakuga: false },
    { id: "approach", label: "Approach", dur: 3, sakuga: false },
    { id: "turn", label: "Turn", dur: 3, sakuga: false },
    { id: "sakuga", label: "Sakuga", dur: 5, sakuga: true },
    { id: "aftermath", label: "Aftermath", dur: 3.5, sakuga: false },
    { id: "button", label: "Button", dur: 2.5, sakuga: false },
  ],
};

const DIRECTION = {
  establish:
    "The place in the logline. The figure is small, or not in it yet. One camera move: scale 100% to 106%, power1.inOut. Three drawings.",
  approach:
    "A cut closer. Who is there. Do not push past 106%, and do not add a second camera move. Three drawings.",
  turn:
    "The moment before the verb. Four frames of anticipation, then a hold. Three drawings. Camera locked.",
  sakuga:
    "The verb in the logline. The only shot that may use 8 unique drawings. Anticipate, play the action, one or two smear frames, then the settled drawing. Camera locked.",
  aftermath:
    "The result, already settled. Hold at least 12 frames. A blink or a hair follow-through may happen inside the hold. Three drawings. Camera locked.",
  button:
    "The line, if there is one, in the clear, bottom third, off the eyes. Then a hold. Fade the last 8 frames to ink. Three drawings.",
};

const STOP = new Set("a,an,the,of,to,and,in,on,for,with,as,at,from,by,into,over".split(","));

export function shotPlan(seconds) {
  const plan = PLANS[seconds];
  if (!plan) {
    throw new Error("Runtime must be 8, 12, or 20 seconds.");
  }
  return plan.map((shot) => ({ ...shot, direction: DIRECTION[shot.id] }));
}

export function slugFrom(logline) {
  const words = logline
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word && !STOP.has(word));
  return words.slice(0, 4).join("-") || "untitled";
}

function clock(seconds) {
  return seconds.toFixed(2);
}

export function compileBrief(input) {
  const logline = String(input.logline ?? "").trim().replace(/\s+/g, " ");
  if (!logline) {
    return { ok: false, error: "Write the scene first." };
  }
  if (logline.length > 400) {
    return { ok: false, error: "Keep the scene under 400 characters." };
  }

  const seconds = Number(input.seconds);
  if (!PLANS[seconds]) {
    return { ok: false, error: "Length has to be 8, 12, or 20 seconds." };
  }

  const aspect = ASPECTS[input.aspect];
  if (!aspect) {
    return { ok: false, error: "Frame has to be 16:9 or 9:16." };
  }

  const script = SCRIPTS[input.script];
  if (!script) {
    return { ok: false, error: "Pick a color script." };
  }

  const dialogue = String(input.dialogue ?? "").trim();
  if (dialogue.length > 180) {
    return { ok: false, error: "Keep the line under 180 characters." };
  }

  const shots = shotPlan(seconds);
  const slug = slugFrom(logline);
  const frameLine =
    input.aspect === "9:16"
      ? "Compose the tall frame. The head sits in the upper half. Type sits in the lower fifth."
      : "Compose the wide frame. Put the eyes on a third, with room in front of the gaze.";

  let t = 0;
  const shotBlocks = shots.map((shot, index) => {
    const start = t;
    t += shot.dur;
    const name = shot.sakuga ? `${shot.label} — the expensive shot` : shot.label;
    return [`### ${index + 1} · ${name} · ${clock(start)}–${clock(t)}`, shot.direction].join("\n");
  });

  const dialogueBlock = dialogue
    ? ["Set this line verbatim on the button shot. Do not translate it.", "", `> ${dialogue}`].join("\n")
    : "No dialogue. No mouth shapes. No captions.";

  const paints = Object.entries(script.colors)
    .map(([name, hex]) => `- ${name} ${hex}`)
    .join("\n");

  const markdown = [
    "# html-anime",
    "",
    logline,
    "",
    `${seconds}s · ${FPS}fps · ${seconds * FPS} frames · ${aspect.w}×${aspect.h}`,
    `Color script: ${script.name}`,
    paints,
    "",
    frameLine,
    "",
    "## Drawing budget",
    "Character acting is on twos. Rain, sparks, and a blade are on ones.",
    "The sakuga shot may use 8 unique drawings. Every other shot uses 3.",
    "A hold after a settle lasts at least 12 frames.",
    "",
    "## Shots",
    shotBlocks.join("\n\n"),
    "",
    "## Dialogue",
    dialogueBlock,
    "",
    "## Build",
    `Write films/${slug}/index.html.`,
    "Read, in order: skills/html-anime-direct/SKILL.md, skills/html-anime-cel/SKILL.md, skills/html-anime-timing/SKILL.md, skills/html-anime-camera/SKILL.md, skills/html-anime-render/SKILL.md.",
    "films/roof/index.html shows the file shape and the color-dip cut. Draw this sheet, not a remix of that film.",
    "Use only the hexes above. One sakuga shot.",
    "Done when `npx hyperframes lint` and `npx hyperframes validate` pass in that film's directory.",
    "",
  ].join("\n");

  return {
    ok: true,
    markdown,
    slug,
    seconds,
    frames: seconds * FPS,
    width: aspect.w,
    height: aspect.h,
    script: script.id,
  };
}
