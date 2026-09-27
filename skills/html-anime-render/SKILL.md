---
name: html-anime-render
description: Author an html-anime film as a deterministic HyperFrames HTML composition — timeline registration, a color-dip cut, drawing swaps, and the lint gate. Use when writing or fixing the HTML for a code-drawn anime short.
---

# Render

The film is one HTML file. HyperFrames seeks it. Same file, same frame.

## File

`films/<slug>/index.html`

Root element:

```html
<div
  id="root"
  data-composition-id="film"
  data-start="0"
  data-duration="8"
  data-width="1920"
  data-height="1080"
></div>
```

`data-duration` is the runtime on the sheet. Clips inside use `data-start`, `data-duration`, and `data-track-index`. Same-track clips do not overlap. `data-track-index` is not z-order. z-index is CSS.

A short under 30 seconds stays one file. Do not split shots into sub-compositions unless a shot is reused.

## Timeline

```js
const tl = gsap.timeline({ paused: true });
window.__timelines = window.__timelines || {};
window.__timelines["film"] = tl;
```

- Build the timeline synchronously. No `async`, `setTimeout`, or `Promise`.
- GSAP 3.14 from `https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js`.
- Animate transform, opacity, color, stroke. Do not animate `visibility` or `display`.
- Do not call `play()` on media. No `repeat: -1`. A looping rain field uses a finite `repeat` that covers the runtime.
- No `Math.random()`, `Date.now()`, or reading the clock. If you need variation, write the values out.
- `tl.set` is allowed at a clip's start time or later. Do not `gsap.set` a later shot's elements before that shot exists.
- The hero frame is the CSS. Tweens describe the way in. Layout before animation.

## How a cut works

Characters do not fade up. The cut is a color dip. This replaces the motion-graphics habit of fading every element in.

Straddle the cut by about a quarter second on each side. The outgoing shot is still fully drawn when the dip covers it. The incoming shot is already in its hero-frame CSS underneath.

```js
tl.set("#dip", { opacity: 0 }, 0);
tl.to("#dip", { opacity: 1, duration: 0.25, ease: "power2.in" }, cut - 0.25);
tl.to("#dip", { opacity: 0, duration: 0.35, ease: "power2.out" }, cut + 0.05);
```

`#dip` is a full-frame element on a higher track, filled with `accent` or `ink`. Scene content does not animate out, except the button shot's last 8 frames to `ink`.

Drawing changes inside a shot are `tl.set` opacity swaps, on frame boundaries.

## Type and fonts

Prefer a font shipped as a `.woff2` next to the file, with `@font-face`. A render must not depend on a stylesheet fetched at capture time. One family is enough for the line.

## Done

From the film directory:

```
npx hyperframes lint
npx hyperframes validate
```

Both pass. Then watch it (`npx hyperframes preview`) before you call the film finished. If a HyperFrames skill is also installed, it covers engine details this file does not. When it wants a fade-in on a character, this file wins.
