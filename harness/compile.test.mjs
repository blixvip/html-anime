import assert from "node:assert/strict";
import { ASPECTS, compileBrief, SCRIPTS, shotPlan, slugFrom } from "./compile.js";

for (const [logline, expected] of [
  ["月の下で剣士が刀を抜く", "月の下て剣士か刀を抜く"],
  ["星空下 少年 拔刀", "星空下-少年-拔刀"],
  ["달빛 아래", "달빛-아래"],
  ["Café à minuit", "cafe-minuit"],
  ["Cafe\u0301 a\u0300 minuit", "cafe-minuit"],
  ["Cafe\u1ab0 minuit", "cafe-minuit"],
  ["Crème brûlée", "creme-brulee"],
  ["Ｃａｆé １２３", "cafe-123"],
  ["\u{10400} moon", "\u{10428}-moon"],
  ["On a roof in the rain, a red moon opens.", "roof-rain-red-moon"],
  ["A bell rings once.", "bell-rings-once"],
  ["ONE two THREE four five", "one-two-three-four"],
  ["a an the of to and in on for with as at from by into over", "untitled"],
  ["theater android", "theater-android"],
  ["  red\tmoon\n rises  ", "red-moon-rises"],
  ["Moon's light--falls_now", "moon-s-light-falls"],
  ["../月\\星:夜*光?\"<>|", "月-星-夜-光"],
  ["月／星＼夜", "月-星-夜"],
  ["moon🌙light", "moon-light"],
  ["", "untitled"],
  [" \t\n ", "untitled"],
  ["../\\:*?\"<>|---!!!", "untitled"],
  ["🌙✨🎬", "untitled"],
  ["\u0301\u1ab0", "untitled"],
]) {
  const slug = slugFrom(logline);
  assert.equal(slug, expected, logline);
  assert.match(slug, /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u, logline);
}

for (const logline of ["Café à minuit", "月の下で剣士が刀を抜く"]) {
  const sheet = compileBrief({ logline, seconds: 8, aspect: "16:9", script: "indigo" });
  assert.equal(sheet.ok, true);
  assert.equal(sheet.slug, slugFrom(logline));
  assert.ok(sheet.markdown.includes(`Write films/${sheet.slug}/index.html.`));
}

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
assert.match(brief.markdown, /> The rain hid the sound of the blade\./);
assert.match(brief.markdown, /Sakuga — the expensive shot/);
assert.doesNotMatch(brief.markdown, /tall frame/);

const listed = new Set([...brief.markdown.matchAll(/#[0-9a-f]{6}/g)].map((match) => match[0]));
const allowed = new Set(Object.values(SCRIPTS.indigo.colors));
assert.deepEqual(listed, allowed);

const spans = [...brief.markdown.matchAll(/(\d+\.\d+)–(\d+\.\d+)/g)];
assert.equal(spans[0][1], "0.00");
assert.equal(spans.at(-1)[2], "8.00");
let cursor = 0;
for (const span of spans) {
  assert.equal(Number(span[1]), cursor);
  cursor = Number(span[2]);
}
assert.equal(cursor, 8);

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
assert.doesNotMatch(tall.markdown, /Do not translate/);
const noonHexes = new Set([...tall.markdown.matchAll(/#[0-9a-f]{6}/g)].map((match) => match[0]));
assert.deepEqual(noonHexes, new Set(Object.values(SCRIPTS.noon.colors)));
assert.equal(noonHexes.has("#e23b4a"), false);
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
