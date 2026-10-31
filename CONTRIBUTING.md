# Contributing to html-anime

Thanks for helping! Questions and ideas are welcome in the **[Discord](https://discord.gg/zEB4VjmfSb)**, and bugs go in [GitHub issues](https://github.com/blixvip/html-anime/issues/new/choose).

## Finding something to work on

- [Good first issues](https://github.com/blixvip/html-anime/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) are small and list the files to touch.
- [Help wanted](https://github.com/blixvip/html-anime/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) issues are bigger.
- Comment on the issue to claim it so two people don't build the same thing. If you go quiet for a week, it opens up again.
- Have your own idea? Open a [Discussion](https://github.com/blixvip/html-anime/discussions) first for anything larger than a bug fix.

By contributing, you agree your work is released under the project's [MIT License](LICENSE).

## Setup

You need **Node.js 20+** (22 is what CI runs).

```sh
git clone https://github.com/<you>/html-anime.git
cd html-anime
npm install
```

**For the site** (`index.html`, `site.js`, the shot-sheet compiler), serve the folder — don't open the file directly. `site.js` imports `harness/compile.js` as an ES module, so `file://` won't work:

```sh
python -m http.server
```

**For the film pipeline** you also need **FFmpeg and ffprobe** on your `PATH` and Chromium:

```sh
npx playwright install chromium     # or set CHROMIUM_PATH to a system binary
npm run film:full                   # preview → render → assemble
```

A full render is 1,440 frames at 1920×1080, so it is not quick. `docs/LOCAL_RENDER.md` has the details.

## Before you open a pull request

```sh
npm test
```

- Keep changes small and focused. One fix or feature per pull request.
- Check visual changes in a real browser at narrow and wide widths, and add a screenshot or GIF.
- There is no linter or formatter. Match the style of the file you are editing.
- Scene HTML must stay **deterministic**: build the timeline synchronously, and no `async`, `setTimeout`, `Promise`, `Math.random()`, `Date.now()`, `repeat: -1`, or animating `visibility`/`display`. The renderer seeks frame by frame, so anything driven by wall-clock time will not match. `skills/html-anime-render/SKILL.md` is the full contract.
- Keep GSAP pinned. The renderer intercepts one exact CDN URL and serves it from the local npm dependency, so the version in the `<script src>` and the one in `package.json` have to agree.
- Don't add runtime dependencies without saying why in the pull request.
- Nothing here calls a video model, and nothing should start to. The frames are code.

## Where things live

- `harness/compile.js`: the single source of truth — `FPS = 24`, the two aspects, the four colour scripts, the 8/12/20s shot tables, and `compileBrief()` which renders the Markdown sheet. Everything depends on it, and it has no dependencies of its own.
- `harness/film.js` → `preview-film.mjs` → `render-film.mjs` → `assemble-film.mjs`: the four pipeline stages — manifest to frame-accurate timeline, timeline to scene HTML, HTML to per-shot silent MP4s, MP4s to the final film.
- `skills/html-anime-render/SKILL.md`: the authoring contract for a film file — the root `data-composition-id` element, the paused `window.__timelines[...]` GSAP timeline, the colour-dip cut, and the determinism rules above.
- `films/roof/index.html`: the only complete hand-authored film. 172 lines, and the best way to see the file shape, inline SVG cels, and `tl.set` drawing swaps.
- `AGENTS.md`: the agent contract. `CLAUDE.md`, `GEMINI.md` and `.cursor/rules/html-anime.mdc` are one-line redirects to it.
- `site.js` + `index.html`: the browser front end.

Made a film with it? Show it off in the [Discord](https://discord.gg/zEB4VjmfSb).
