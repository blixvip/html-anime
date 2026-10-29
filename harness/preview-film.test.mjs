import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildPreview } from "./preview-film.mjs";

const dir = await mkdtemp(join(tmpdir(), "html-anime-preview-"));
try {
  const result = await buildPreview("examples/moonlight-promise.json", dir);
  assert.equal(result.scenes, 3);
  assert.equal(result.frames, 1440);
  const timeline = JSON.parse(await readFile(join(dir, "timeline.json"), "utf8"));
  assert.equal(timeline.totalFrames, 1440);
  for (let i = 1; i <= 3; i++) {
    const html = await readFile(join(dir, `scene-${String(i).padStart(3, "0")}`, "index.html"), "utf8");
    assert.match(html, /data-composition-id="film"/);
    assert.match(html, /data-duration="20"/);
    assert.match(html, /window.__timelines\["film"\]/);
    assert.match(html, /<svg /);
  }
  console.log("Film preview generation tests passed");
} finally {
  await rm(dir, { recursive: true, force: true });
}
