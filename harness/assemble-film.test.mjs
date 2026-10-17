import assert from "node:assert/strict";
import { parseRate, validateProbe, validateTimeline } from "./assemble-film.mjs";

assert.equal(parseRate("24000/1000"), 24);
assert.equal(parseRate("24/1"), 24);
assert.throws(() => parseRate("24/0"), /denominator/);
assert.throws(() => parseRate("bad"), /Invalid/);

const film = { fps: 24, width: 1920, height: 1080, totalFrames: 480,
  shots: [{ id: "scene-001", startFrame: 0, endFrame: 480, frames: 480 }] };
assert.equal(validateTimeline(film), true);
assert.throws(() => validateTimeline({ ...film, totalFrames: 481 }), /mismatch/);
assert.throws(() => validateTimeline({ ...film, shots: [{ ...film.shots[0], startFrame: 1 }] }), /Noncontiguous/);
const probe = { streams: [{ codec_type: "video", width: 1920, height: 1080,
  avg_frame_rate: "24/1", nb_frames: "480" }] };
assert.doesNotThrow(() => validateProbe(probe, film.shots[0], film));
assert.throws(() => validateProbe({ streams: [{ ...probe.streams[0], width: 1080 }] }, film.shots[0], film), /dimensions/);
assert.throws(() => validateProbe({ streams: [{ ...probe.streams[0], nb_frames: "479" }] }, film.shots[0], film), /frame count/);
assert.throws(() => validateProbe({ streams: [...probe.streams, { codec_type: "audio" }] }, film.shots[0], film), /silent/);
console.log("Film assembler validation tests passed");
