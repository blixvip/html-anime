---
name: html-anime-cel
description: Paint code-drawn anime frames as flat cels in SVG or HTML — line, local color, one hard shadow, silhouette backgrounds, rain, and a closed color script. Use when drawing a character, background, blade, or effect for an html-anime or HyperFrames film.
---

# Cel

A frame is flat paint plus a line. Build the hero frame of each shot at full opacity before any tween.

## Paint

Use only the hexes on the sheet. A highlight is `line`, `moon`, or `practical`. It is not a new hex.

- Sky may be a gradient between `sky` and `ink`. Characters, cloth, and the blade are flat.
- One shadow shape per character, hard-edged, `ink` at about 20% over the local color. No airbrush, no soft light on skin.
- The eye white is `sclera`. The iris is `iris`. Pupil is `hair` or `ink`. Two catchlights maximum, cut from `line` or `moon`, window-shaped.
- Hair is two or three masses. Bangs are chunks. One hard sheen band in `moon` or `line`. Not strands, not a glow.
- Line sits on top. At 1080px tall, outer contour about 6px, interior lines about 3px. Taper by drawing the path, not with a blur filter.

## Depth, back to front

1. Sky
2. Far silhouette — lighter, lower contrast, few windows in `practical`
3. Ground and the wide-shot figure
4. Rain, on its own layer
5. Close figure
6. Type

Wide shots are silhouettes. Detail belongs to the close shot. One practical light in the shot (window, moon rim, or blade), drawn as a flat shape.

## Effects

- Rain is a field of straight strokes in `line`, on its own layer. Positions are written out or come from a seeded series. Never `Math.random()`.
- A blade trail is one tapered shape in `practical`, plus one smear drawing behind a fast arc. Not a stack of glow circles.
- Speed lines are few, straight, and only inside the sakuga shot.

## Type

The line sits in the bottom third, in the clear, off the eyes and off the blade. Letterbox bars may hold it. No title, logo, or credit unless the sheet's logline is a title.

## Order

For each shot: sky, silhouette, local color, shadow shape, line, effects, type. Then timing.
