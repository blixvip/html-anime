#!/usr/bin/env node
/**
 * Render generated HyperFrames-compatible HTML shots into silent MP4s.
 * Dependencies: npm install; ffmpeg on PATH; Chromium installed.
 * Browser capture is deterministic: GSAP timeline.seek(frame / fps) before each screenshot.
 */
import { readFile, mkdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { validateTimeline } from "./assemble-film.mjs";

const require = createRequire(import.meta.url);

export function validateRenderConfig(film) {
  validateTimeline(film);
  if (film.fps !== 24) throw new Error("Renderer currently supports 24 FPS only");
  if (film.width > 3840 || film.height > 3840) throw new Error("Canvas exceeds renderer limit");
  return true;
}

export async function renderShots(timelinePath, htmlDir, outputDir, options = {}) {
  const film = JSON.parse(await readFile(resolve(timelinePath), "utf8"));
  validateRenderConfig(film);
  const { chromium } = await import("playwright");
  const gsapSource = require.resolve("gsap/dist/gsap.min.js");
  const { readFile: read } = await import("node:fs/promises");
  const gsapCode = await read(gsapSource, "utf8");
  const output = resolve(outputDir);
  await mkdir(output, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    ...(options.chromiumPath ? { executablePath: options.chromiumPath } : {})
  });
  try {
    for (const shot of film.shots) {
      const page = await browser.newPage({
        viewport: { width: film.width, height: film.height },
        deviceScaleFactor: 1,
        reducedMotion: "reduce"
      });
      let encoder;
      try {
        // Supply pinned GSAP locally so rendering does not require network access.
        await page.route("https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js",
          route => route.fulfill({ status: 200, contentType: "application/javascript", body: gsapCode }));
        await page.goto("file://" + join(resolve(htmlDir), shot.id, "index.html"), { waitUntil: "load" });
        await page.evaluate(() => document.fonts.ready);
        const actual = await page.evaluate(() => {
          const root = document.querySelector('[data-composition-id="film"]');
          return {
            duration: Number(root?.dataset.duration),
            width: Number(root?.dataset.width),
            height: Number(root?.dataset.height),
            hasTimeline: Boolean(window.__timelines?.film)
          };
        });
        if (!actual.hasTimeline || actual.duration !== shot.seconds ||
            actual.width !== film.width || actual.height !== film.height)
          throw new Error(`${shot.id}: HTML composition metadata or GSAP timeline invalid`);
        const destination = join(output, `${shot.id}.mp4`);
        encoder = spawn("ffmpeg", [
          "-y", "-f", "image2pipe", "-framerate", String(film.fps),
          "-vcodec", "png", "-i", "pipe:0", "-an", "-c:v", "libx264",
          "-pix_fmt", "yuv420p", "-r", String(film.fps),
          "-frames:v", String(shot.frames), destination
        ], { stdio: ["pipe", "ignore", "pipe"] });
        let stderr = "";
        encoder.stderr.on("data", chunk => { stderr += chunk.toString().slice(-500); });
        const exit = new Promise((res, rej) => {
          encoder.on("error", rej);
          encoder.on("close", code => code === 0 ? res() : rej(new Error(`ffmpeg failed (${code}): ${stderr.slice(-1000)}`)));
        });
        for (let frame = 0; frame < shot.frames; frame++) {
          await page.evaluate(time => {
            const tl = window.__timelines.film;
            tl.pause();
            tl.seek(time, false);
          }, frame / film.fps);
          const png = await page.screenshot({ type: "png", animations: "allow" });
          if (!encoder.stdin.write(png)) await new Promise(res => encoder.stdin.once("drain", res));
        }
        encoder.stdin.end();
        await exit;
        console.log(`Rendered ${shot.id}: ${shot.frames} frames`);
      } catch (error) {
        if (encoder && !encoder.killed) encoder.kill("SIGKILL");
        throw error;
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
  return output;
}

if (process.argv[1] && import.meta.url === new URL(`file://${resolve(process.argv[1])}`).href) {
  const [timeline, htmlDir, outputDir] = process.argv.slice(2);
  if (!timeline || !htmlDir || !outputDir) {
    console.error("Usage: node harness/render-film.mjs <timeline.json> <html-scenes-dir> <output-dir>");
    process.exitCode = 2;
  } else {
    renderShots(timeline, htmlDir, outputDir, { chromiumPath: process.env.CHROMIUM_PATH })
      .then(dir => console.log(`Rendered shots in ${dir}`))
      .catch(err => { console.error(err.message); process.exitCode = 1; });
  }
}
