import assert from "node:assert/strict";
import { ASPECTS, compileBrief, SCRIPTS, shotPlan } from "./compile.js";

for (const seconds of [8, 12, 20]) {
  const shots = shotPlan(seconds);
  const sum = shots.reduce((total, shot) => total + shot.dur, 0);
  assert.equal(Math.round(sum * 1000), seconds * 1000);
  assert.equal(shots.filter((shot) => shot.sakuga).length, 1);
}

assert.throws(() => shotPlan(15), /8, 12, or 20/);

const brief = compileBrief({
  logline: "On a roof in the rain, a red moon opens and a line of light falls.",
  seconds: 8,
  aspect: "16:9",
  script: "indigo",
  dialogue: "The rain hid the sound of the blade.",
});

assert.equal(brief.ok, true);
assert.equal(brief.frames, 192);
assert.equal(brief.slug, "roof-rain-red-moon");
assert.match(brief.markdown, /^# html-anime\n/);
assert.match(brief.markdown, /1920×1080/);
assert.match(brief.markdown, /192 frames/);
assert.match(brief.markdown, /Do not translate/);
assert.match(brief.markdown, /#e23b4a/);
assert.match(brief.markdown, /Sakuga — the expensive shot/);
assert.doesNotMatch(brief.markdown, /tall frame/);

const tall = compileBrief({
  logline: "A bell rings once.",
  seconds: 12,
  aspect: "9:16",
  script: "noon",
  dialogue: "",
});
assert.equal(tall.ok, true);
assert.match(tall.markdown, /1080×1920/);
assert.match(tall.markdown, /288 frames/);
assert.match(tall.markdown, /No dialogue/);
assert.match(tall.markdown, /tall frame/);
assert.equal(tall.slug, "bell-rings-once");

assert.equal(compileBrief({ logline: "   ", seconds: 8, aspect: "16:9", script: "indigo" }).ok, false);
assert.equal(
  compileBrief({ logline: "a".repeat(401), seconds: 8, aspect: "16:9", script: "indigo" }).ok,
  false,
);
assert.equal(
  compileBrief({ logline: "A bell.", seconds: 9, aspect: "16:9", script: "indigo" }).ok,
  false,
);
assert.equal(
  compileBrief({ logline: "A bell.", seconds: 8, aspect: "1:1", script: "indigo" }).ok,
  false,
);

for (const script of Object.values(SCRIPTS)) {
  for (const hex of Object.values(script.colors)) {
    assert.match(hex, /^#[0-9a-f]{6}$/);
  }
}

assert.deepEqual(Object.keys(ASPECTS), ["16:9", "9:16"]);

console.log("compile: ok");
