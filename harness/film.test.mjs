import assert from "node:assert/strict";
import { compileFilm } from "./film.js";

const base = {
  title: "Moonlight Promise",
  aspect: "16:9",
  script: "indigo",
  characters: [{ id: "ren", name: "Ren" }],
  scenes: [
    { seconds: 20, logline: "Ren stands under a moon in the rain.", characters: ["ren"] },
    { seconds: 20, logline: "Ren runs across the rooftop as lightning flashes.", characters: ["ren"] },
    { seconds: 20, logline: "Ren reaches the edge and sees the city below.", characters: ["ren"] }
  ]
};
const film = compileFilm(base);
assert.equal(film.totalSeconds, 60);
assert.equal(film.totalFrames, 1440);
assert.equal(film.shots.length, 3);
assert.deepEqual(film.shots.map(s => [s.startFrame, s.endFrame]), [[0, 480], [480, 960], [960, 1440]]);
assert.ok(film.shots.every(s => s.sheet.includes("# html-anime")));
assert.throws(() => compileFilm({ ...base, scenes: [{ seconds: 15, logline: "No" }] }), /duration/);
assert.throws(() => compileFilm({ ...base, scenes: [{ seconds: 20, logline: "Hello", characters: ["missing"] }] }), /unknown character/);
assert.throws(() => compileFilm({ ...base, characters: [{ id: "ren" }, { id: "ren" }] }), /unique/);
console.log("Film compiler tests passed");
