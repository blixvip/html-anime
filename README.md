# Genga

An anime, drawn in code. You write a scene. [The desk](https://wasely.github.io/genga/) turns it into a shot sheet — holds, one expensive shot, a closed color script. Paste that sheet into Claude, Codex, Cursor, or Grok. The agent draws the frames.

The pictures are HTML, timed for [HyperFrames](https://github.com/heygen-com/hyperframes). Nothing here calls a video model.

## Start

```
git clone https://github.com/wasely/genga.git
cd genga
```

Open the folder in the agent you already use and paste a sheet as the first message. The desk builds the sheet in the browser. `harness/compile.js` builds the same sheet in Node.

| Agent | What it reads | Open |
| --- | --- | --- |
| Claude Code | `CLAUDE.md` | `claude` |
| Codex | `AGENTS.md` | `codex` |
| Cursor | `.cursor/rules/genga.mdc` | `cursor .` |
| Grok | `AGENTS.md` | `grok` |

## What is in the repo

- `index.html` — the desk
- `skills/` — direct, cel, timing, camera, render. Each owns one job
- `harness/compile.js` — logline to sheet
- `films/roof/` — an 8 second reference. File shape and the color-dip cut, not a film to remix
- `AGENTS.md` — the contract

## Render the reference

```
cd films/roof
npx hyperframes preview
```

Lint before you trust a new film:

```
npx hyperframes lint
npx hyperframes validate
```

## Sheet rules the agent is not allowed to break

- Shot times sum to 8, 12, or 20 seconds
- One sakuga shot. The others stay on three drawings
- Acting on twos. Rain and a blade on ones
- Only the hexes printed on the sheet
- The line you wrote, verbatim, or no dialogue at all
