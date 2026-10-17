# Local end-to-end render

The film pipeline is now wired from a manifest to HTML scene generation, browser capture, scene MP4s, and final MP4 assembly. **It has not been validated end-to-end in CI yet.**

Prerequisites: Node.js 20+, FFmpeg and ffprobe installed and on PATH, and Chromium. From the repository root:

```bash
npm install
npx playwright install chromium
npm test
npm run film:full
```

If you prefer a system Chromium executable, use `CHROMIUM_PATH=/usr/bin/chromium npm run film:full` (change path for your OS). Output: `build/final/moonlight-promise.mp4`.

Stages can be run separately:
```bash
npm run film:preview
npm run film:render
npm run film:assemble -- build/preview/timeline.json build/rendered build/final/moonlight-promise.mp4
```

This renderer seeks the paused GSAP timeline to each exact 24 FPS frame and pipes screenshots into FFmpeg. Rendering 1,440 frames at 1920×1080 can take significant CPU time and disk space. Each scene must have a `data-composition-id="film"` root and a synchronous `window.__timelines.film` GSAP timeline. For reproducibility the renderer serves GSAP from the pinned local npm dependency rather than the CDN.

**Known limitations:** HTML/SVG preview art is deliberately basic, no TTS/music, no LLM-generated art, no scene QA, and no security sandbox for untrusted generated HTML. Only render trusted local scenes. The render/assembly path needs execution and visual review before production use.

## Independent repository transition

The existing MIT-licensed upstream copyright notice in LICENSE must remain with reused code. Once the pipeline is validated, create a new independent GitHub repository (not a fork), push a clean project history with attribution, and only delete the old fork after checking files and tags.
