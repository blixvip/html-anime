## What does this change?

<!-- A short description. Link the issue it fixes, e.g. "Fixes #12". -->

## How did you test it?

- [ ] `npm test` passes
- [ ] Site changes checked in a served folder (`python -m http.server`) at narrow and wide widths — screenshot or GIF below
- [ ] `npm run film:full` still produces a film (only if you touched the harness pipeline)

## Checklist

- [ ] One fix or feature, kept small and focused
- [ ] Scene HTML stays deterministic: no `async`/`setTimeout`/`Promise`, no `Math.random()`/`Date.now()`, no `repeat: -1`, no animating `visibility`/`display`
- [ ] The GSAP version in any `<script src>` still matches `package.json` (the renderer intercepts that exact URL)
- [ ] No new runtime dependency, or it's explained above
- [ ] Nothing here calls a video model
- [ ] README or `docs/` updated if behavior or setup changed

<!-- Questions? Ask in the Discord: https://discord.gg/zEB4VjmfSb -->
