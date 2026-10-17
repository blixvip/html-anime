import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { spawn } from "node:child_process";

/**
 * Assemble already-rendered silent MP4 shots. No shell evaluation is used.
 * Each input must have exact dimensions, FPS, and frame count.
 */
function run(binary, args) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(binary, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "", stderr = "";
    child.stdout.on("data", chunk => { stdout += chunk; });
    child.stderr.on("data", chunk => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", code => code === 0 ? resolveRun(stdout) : reject(new Error(`${binary} exited ${code}: ${stderr.slice(-2500)}`)));
  });
}

export function parseRate(rate) {
  if (typeof rate !== "string" || !/^\d+(\/\d+)?$/.test(rate)) throw new Error("Invalid frame rate");
  const [a, b = "1"] = rate.split("/").map(Number);
  if (!b) throw new Error("Invalid frame rate denominator");
  return a / b;
}

export function validateProbe(probe, shot, film) {
  const stream = probe.streams?.find(s => s.codec_type === "video");
  if (!stream) throw new Error(`${shot.id}: no video stream`);
  if (stream.width !== film.width || stream.height !== film.height)
    throw new Error(`${shot.id}: incorrect dimensions`);
  if (Math.abs(parseRate(stream.avg_frame_rate) - film.fps) > 0.001)
    throw new Error(`${shot.id}: incorrect FPS`);
  if (stream.nb_frames === undefined || Number(stream.nb_frames) !== shot.frames)
    throw new Error(`${shot.id}: incorrect frame count (expected ${shot.frames})`);
  if (probe.streams.some(s => s.codec_type === "audio"))
    throw new Error(`${shot.id}: shot must be silent; mix audio after assembly`);
}

export function validateTimeline(film) {
  if (!film || !Number.isInteger(film.fps) || film.fps <= 0 ||
      !Number.isInteger(film.width) || !Number.isInteger(film.height) ||
      !Array.isArray(film.shots) || !film.shots.length) throw new Error("Invalid timeline");
  let cursor = 0;
  for (const shot of film.shots) {
    if (!/^scene-\d{3,}$/.test(shot.id) || shot.startFrame !== cursor ||
        !Number.isInteger(shot.frames) || shot.frames <= 0 ||
        shot.endFrame !== cursor + shot.frames) throw new Error("Noncontiguous timeline");
    cursor = shot.endFrame;
  }
  if (cursor !== film.totalFrames) throw new Error("Total frame mismatch");
  return true;
}

export async function assembleFilm(timelinePath, shotsDirectory, outputPath) {
  const film = JSON.parse(await readFile(resolve(timelinePath), "utf8"));
  validateTimeline(film);
  const out = resolve(outputPath);
  await mkdir(resolve(out, ".."), { recursive: true });
  const normalized = [];
  for (const shot of film.shots) {
    const source = join(resolve(shotsDirectory), `${shot.id}.mp4`);
    const raw = await run("ffprobe", ["-v", "error", "-show_streams", "-of", "json", source]);
    validateProbe(JSON.parse(raw), shot, film);
    normalized.push(source);
  }
  // Concat demuxer requires matching encoding parameters; re-encode each input
  // into an identical H.264 stream to avoid codec/timebase discontinuities.
  const temporaryDir = resolve(out + ".parts");
  await mkdir(temporaryDir, { recursive: true });
  const parts = [];
  for (let i = 0; i < normalized.length; i++) {
    const part = join(temporaryDir, `part-${String(i).padStart(3, "0")}.mp4`);
    await run("ffmpeg", ["-y", "-i", normalized[i], "-an", "-vf", `fps=${film.fps},format=yuv420p`,
      "-c:v", "libx264", "-preset", "medium", "-crf", "18",
      "-r", String(film.fps), "-video_track_timescale", String(film.fps * 1000),
      "-frames:v", String(film.shots[i].frames), part]);
    parts.push(part);
  }
  // Use concat filter, not a shell or user-controlled concat script.
  const args = ["-y"];
  for (const part of parts) args.push("-i", part);
  const labels = parts.map((_, i) => `[${i}:v:0]`).join("");
  args.push("-filter_complex", `${labels}concat=n=${parts.length}:v=1:a=0[outv]`,
    "-map", "[outv]", "-an", "-c:v", "libx264", "-crf", "18", "-preset", "medium",
    "-pix_fmt", "yuv420p", "-r", String(film.fps), "-frames:v", String(film.totalFrames), out);
  await run("ffmpeg", args);
  const finalProbe = JSON.parse(await run("ffprobe", ["-v", "error", "-show_streams", "-of", "json", out]));
  validateProbe(finalProbe, { id: "final", frames: film.totalFrames }, film);
  return out;
}

if (process.argv[1] && import.meta.url === new URL(`file://${resolve(process.argv[1])}`).href) {
  const [timeline, shotDir, output] = process.argv.slice(2);
  if (!timeline || !shotDir || !output) {
    console.error("Usage: node harness/assemble-film.mjs <timeline.json> <rendered-shots-dir> <output.mp4>");
    process.exitCode = 2;
  } else {
    assembleFilm(timeline, shotDir, output)
      .then(path => console.log(`Film assembled: ${path}`))
      .catch(err => { console.error(err.message); process.exitCode = 1; });
  }
}
