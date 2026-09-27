---
name: html-anime-direct
description: Turn a logline into an html-anime shot sheet — runtime, one sakuga shot, holds, and a color script — before any drawing. Use when someone asks for a code-drawn anime, an html-anime sheet, or a short made as HTML.
---

# Direct

The sheet is the film. Draw only after it exists.

If the user pasted an html-anime sheet, that sheet is the brief. If they wrote a logline and nothing else, write the sheet with `harness/compile.js` (8, 12, or 20 seconds) and show it before you draw.

## What you decide

- The logline's verb is the sakuga shot. Name that shot. Every other shot is the place, the approach, or the button.
- Shot times sum to the runtime. An 8s film is three shots. Do not add a prologue, a credit, or a second action.
- Dialogue is the line they wrote, on the button shot, or there is no dialogue. One language. Do not translate.
- The color script on the sheet is closed. You do not pick a mood they did not ask for.

## What you hand off

Write `films/<slug>/index.html` at the width and height printed on the sheet.

Then read, in this order, and follow them. They own their subjects. Do not restate them.

1. `skills/html-anime-cel/SKILL.md` — the paint
2. `skills/html-anime-timing/SKILL.md` — the drawings
3. `skills/html-anime-camera/SKILL.md` — the cut and the lens
4. `skills/html-anime-render/SKILL.md` — the file

`films/roof/index.html` is the file shape and the color-dip cut. It is not a character, a plot, or a palette to reuse.

Done when `npx hyperframes lint` and `npx hyperframes validate` pass in the film directory, the shot times still sum to the runtime, and one shot is the sakuga shot.
