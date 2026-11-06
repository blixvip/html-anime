import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// Exercise the real entry points from paths whose characters must be URL-encoded.
const dir = await mkdtemp(join(tmpdir(), "html-anime #100%-"));
try {
  await writeFile(join(dir, "package.json"), JSON.stringify({ type: "module" }));
  const harness = join(dir, "harness");
  await cp(new URL(".", import.meta.url), harness, { recursive: true });
  for (const name of ["assemble-film", "preview-film", "render-film"]) {
    const result = spawnSync(process.execPath, [join(harness, `${name}.mjs`)], { encoding: "utf8" });
    assert.ifError(result.error);
    assert.equal(result.status, 2, `${name}: ${result.stderr}`);
    assert.match(result.stderr, /Usage: node harness\//);
    assert.equal(result.stdout, "");
  }

  const output = join(dir, "preview #100%");
  const manifest = fileURLToPath(new URL("../examples/moonlight-promise.json", import.meta.url));
  const result = spawnSync(process.execPath, [join(harness, "preview-film.mjs"), manifest, output], { encoding: "utf8" });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Generated 3 deterministic HTML scenes \(1440 frames\)/);
  const timeline = JSON.parse(await readFile(join(output, "timeline.json"), "utf8"));
  assert.equal(timeline.totalFrames, 1440);
  assert.equal(timeline.shots.length, 3);
  for (const shot of timeline.shots) {
    assert.match(await readFile(join(output, shot.id, "index.html"), "utf8"), /data-composition-id="film"/);
  }
  console.log("Harness file URL tests passed");
} finally {
  await rm(dir, { recursive: true, force: true });
}
