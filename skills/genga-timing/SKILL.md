---
name: genga-timing
description: Time code-drawn anime on twos — holds, anticipation, smear frames, and a drawing budget with one sakuga shot. Use when animating a Genga shot, deciding how many drawings a beat gets, or stopping an anime from moving like a UI tween.
---

# Timing

24 fps. The still drawing is the performance.

## Budget

- Character acting is on twos. Each drawing holds 2 frames.
- Rain, sparks, and a blade are on ones.
- The sakuga shot may use 8 unique drawings. Every other shot uses 3.
- After an action settles, hold at least 12 frames. Inside a hold, a 2-frame blink or a hair follow-through is allowed. Do not keep tweening the pose.

## The expensive shot

1. Anticipation: 4 frames the other way, on the silhouette.
2. The action, as drawing swaps, not as one long ease.
3. One or two smear frames: a stretched silhouette along the travel. Not a CSS blur standing in for the smear.
4. The settled drawing, then the hold.

## Camera on a hold

If the sheet allows a move, it is one scale from 100% to 106% across that shot, `power1.inOut`. Action shots stay locked so the drawings do the moving.

## What not to ease

Do not fade a character in from opacity 0. They are in the hero frame, or they cut in when the shot cuts. Type may rise about 24px and fade over 0.4s. The last 8 frames of the button shot fade to `ink`. That fade is the only scene-level exit.

Swap drawings with stepped opacity at frame boundaries (`tl.set` at that time). A 1-frame step is `1/24` seconds.
