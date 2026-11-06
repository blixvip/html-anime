import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../films/roof/index.html", import.meta.url), "utf8");

// The renderer reads the root's declared id and looks the timeline up under it.
const root = html.match(/<[^>]*\bdata-composition-id="([^"]+)"[^>]*>/);
assert.ok(root, "roof film declares a data-composition-id root");
const id = root[1];
assert.equal(id, "roof");
for (const attribute of ["data-duration", "data-width", "data-height"])
  assert.match(root[0], new RegExp(`\\b${attribute}="\\d+"`));
assert.ok(html.includes(`window.__timelines["${id}"]`), "roof film registers its timeline under its own id");

console.log("Film composition metadata tests passed");
