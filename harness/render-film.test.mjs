import assert from "node:assert/strict";
import test from "node:test";
import { validateRenderConfig } from "./render-film.mjs";

const film = { fps: 24, width: 1920, height: 1080, totalFrames: 480,
  shots: [{ id: "scene-001", startFrame: 0, endFrame: 480, frames: 480 }] };

test("validateRenderConfig accepts a valid 24 FPS timeline", () => {
  assert.equal(validateRenderConfig(film), true);
});

for (const fps of [23, 25, 30, 60]) {
  test(`validateRenderConfig rejects ${fps} FPS`, () => {
    assert.throws(() => validateRenderConfig({ ...film, fps }), /24 FPS only/);
  });
}

for (const dimension of ["width", "height"]) {
  test(`validateRenderConfig rejects ${dimension} above 3840`, () => {
    assert.throws(() => validateRenderConfig({ ...film, [dimension]: 3841 }), /Canvas exceeds renderer limit/);
  });

  test(`validateRenderConfig accepts ${dimension} exactly 3840`, () => {
    assert.equal(validateRenderConfig({ ...film, [dimension]: 3840 }), true);
  });
}

test("validateRenderConfig accepts both dimensions exactly 3840", () => {
  assert.equal(validateRenderConfig({ ...film, width: 3840, height: 3840 }), true);
});

test("validateRenderConfig delegates missing timeline validation", () => {
  assert.throws(() => validateRenderConfig(null), /Invalid timeline/);
});

test("validateRenderConfig delegates empty shots validation", () => {
  assert.throws(() => validateRenderConfig({ ...film, shots: [] }), /Invalid timeline/);
});

test("validateRenderConfig delegates shot continuity validation", () => {
  const shots = [{ ...film.shots[0], startFrame: 1 }];
  assert.throws(() => validateRenderConfig({ ...film, shots }), /Noncontiguous timeline/);
});

test("validateRenderConfig delegates total frame validation", () => {
  assert.throws(() => validateRenderConfig({ ...film, totalFrames: 481 }), /Total frame mismatch/);
});
