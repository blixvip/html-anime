#!/usr/bin/env node
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { compileFilm } from "./film.js";

const [input, output = "build/film"] = process.argv.slice(2);
if (!input) {
  console.error("Usage: node harness/film-cli.mjs <manifest.json> [output-directory]");
  process.exitCode = 2;
} else {
  try {
    const manifest = JSON.parse(await readFile(resolve(input), "utf8"));
    const film = compileFilm(manifest);
    const dir = resolve(output);
    await mkdir(dir, { recursive: true });
    const summary = { ...film, shots: film.shots.map(({ sheet, ...shot }) => shot) };
    await writeFile(join(dir, "timeline.json"), JSON.stringify(summary, null, 2) + "\n");
    for (let i = 0; i < film.shots.length; i++) {
      const shot = film.shots[i];
      const header = [
        "# Continuity contract",
        `Film: ${film.title}`,
        `Scene: ${shot.id}`,
        `Frame range: [${shot.startFrame}, ${shot.endFrame})`,
        "Keep characters, costumes, location, and palette consistent with the film manifest.",
        `Characters: ${JSON.stringify(film.characters.filter(c => shot.characterIds.includes(c.id)))}`,
        ""
      ].join("\n");
      await writeFile(join(dir, `${shot.id}.md`), header + shot.sheet);
    }
    console.log(`Compiled ${film.shots.length} scenes, ${film.totalFrames} frames (${film.totalSeconds}s) into ${dir}`);
    console.log("This command creates shot sheets, not HTML animations or an MP4.");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
