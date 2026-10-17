# Rendering integration — next milestone

The film CLI now writes `timeline.json` and per-scene shot sheets. It **does not** draw or render HTML yet.

## Generate production sheets

```sh
npm test
npm run film:demo
```

The output is in `build/moonlight-promise/`. An animation agent should use each generated sheet and the original five skills to create a HyperFrames-valid HTML composition for each scene. Preserve character continuity from the manifest. Run `npx hyperframes lint` and `npx hyperframes validate` in each composition directory.

## Next implementation requirements

1. Make a deterministic renderer contract: scene HTML path, FPS, dimensions, frame count, and output file.
2. Render scenes with isolated browser processes and a fixed frame clock.
3. Validate every scene video with ffprobe: exact dimensions, FPS, frame count, and audio layout.
4. Concatenate using FFmpeg only after codec/timebase normalization; preserve frame-accurate duration.
5. Add voice/music synchronization and quality gates.
6. Never execute untrusted generated scripts outside a sandbox.

The current `compileBrief` accepts only 8/12/20-second scenes; this is intentional until a richer duration model is tested.
