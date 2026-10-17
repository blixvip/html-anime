# Short Film Engine — Phase 1

Goal: extend html-anime from individual 8/12/20-second shot sheets to a coherent 60-second multi-shot film without generative video models.

## Architecture
- **Film manifest:** structured JSON with film metadata, character registry, scenes, shot durations, audio cues, and asset references.
- **Planner:** split a screenplay into 6–10 shots, each compiled using the existing harness.
- **Continuity:** immutable character IDs, palette, costumes, and scene locations.
- **Timeline:** cumulative frame offsets at fixed FPS; validate exact duration.
- **Renderer:** render each shot separately with HyperFrames, then stitch via FFmpeg, retaining synchronized audio.
- **Validator:** reject invalid shot durations, missing assets, timeline gaps, and unsafe executable content.

## First milestone
Produce one original 60-second film, 16:9, 24 FPS, with six or more shots, consistent characters, narration/dialogue, and an MP4. Record commands, execution time, actual output path, and test results.

## Engineering sequence
1. Audit AGENTS.md, harness/compile.js, skills, and test suite.
2. Define versioned film-manifest JSON schema.
3. Implement deterministic timeline and validation tests.
4. Implement shot compilation using existing primitives.
5. Add render queue, retry, and FFmpeg concatenation.
6. Add voice/music cue integration and a playable example.
7. Only then extend to 180 seconds and a UI.

## Constraints
Preserve upstream license and original behavior. Keep generated scripts isolated. Do not claim a film exists until rendered and inspected.