import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { compileFilm } from "./film.js";
import { SCRIPTS } from "./compile.js";

const esc = value => String(value).replace(/[&<>"']/g, c => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));

function sceneHtml(film, shot, scene) {
  const colors = SCRIPTS[scene.script ?? film.script].colors;
  const w = film.width, h = film.height, seconds = shot.seconds;
  const chars = film.characters.filter(c => shot.characterIds.includes(c.id));
  const name = chars.map(c => c.name || c.id).join(" & ");
  // Static SVG geometry with deterministic GSAP motion: a baseline renderable
  // composition. An animation agent can replace this with richer hand-drawn art.
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${esc(film.title)} — ${esc(shot.id)}</title>
<style>
html,body{margin:0;background:${colors.ink}}
#root{position:relative;width:${w}px;height:${h}px;overflow:hidden;background:${colors.sky}}
svg{width:100%;height:100%}
</style>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
</head><body>
<div id="root" data-composition-id="film" data-start="0" data-duration="${seconds}" data-width="${w}" data-height="${h}">
<svg viewBox="0 0 ${w} ${h}" aria-label="${esc(scene.logline)}">
<rect width="${w}" height="${h}" fill="${colors.sky}"/>
<circle id="moon" cx="${Math.round(w*.76)}" cy="${Math.round(h*.26)}" r="${Math.round(h*.105)}" fill="${colors.moon}"/>
<path d="M0 ${h*.74} L${w*.16} ${h*.61} L${w*.33} ${h*.70} L${w*.50} ${h*.55} L${w*.72} ${h*.71} L${w} ${h*.59} L${w} ${h} L0 ${h}Z" fill="${colors.ink}"/>
<g id="hero" transform="translate(${Math.round(w*.48)} ${Math.round(h*.76)})">
<path d="M-60 0 L-90 180 L95 180 L55 0Z" fill="${colors.accent}"/>
<circle cy="-64" r="55" fill="${colors.skin}"/>
<path d="M-58 -74 Q-65 -160 5 -150 Q75 -145 65 -67 L37 -108 L-20 -97Z" fill="${colors.hair}"/>
<circle cx="-18" cy="-64" r="5" fill="${colors.iris}"/><circle cx="25" cy="-64" r="5" fill="${colors.iris}"/>
</g>
<rect x="0" y="${Math.round(h*.91)}" width="${w}" height="${Math.round(h*.09)}" fill="${colors.ink}"/>
<text x="${w/2}" y="${Math.round(h*.965)}" fill="${colors.line}" font-size="${Math.round(h*.031)}" text-anchor="middle" font-family="serif">${esc(scene.dialogue || name || film.title)}</text>
</svg></div>
<script>
const tl=gsap.timeline({paused:true});
tl.fromTo("#moon",{scale:0.96},{scale:1.04,duration:${seconds},ease:"none",transformOrigin:"50% 50%"},0);
tl.fromTo("#hero",{x:-16},{x:16,duration:${seconds},ease:"none"},0);
window.__timelines=window.__timelines||{};
window.__timelines["film"]=tl;
</script></body></html>`;
}

export async function buildPreview(manifestPath, outputDir) {
  const manifest = JSON.parse(await readFile(resolve(manifestPath), "utf8"));
  const film = compileFilm(manifest);
  const dir = resolve(outputDir);
  await mkdir(dir, { recursive: true });
  for (let i = 0; i < film.shots.length; i++) {
    const shot = film.shots[i];
    const sceneDir = join(dir, shot.id);
    await mkdir(sceneDir, { recursive: true });
    await writeFile(join(sceneDir, "index.html"), sceneHtml({
      ...film, script: manifest.script ?? "indigo"
    }, shot, manifest.scenes[i]));
  }
  await writeFile(join(dir, "timeline.json"), JSON.stringify({
    ...film, shots: film.shots.map(({ sheet, ...s }) => s)
  }, null, 2) + "\n");
  return { dir, scenes: film.shots.length, frames: film.totalFrames };
}

if (process.argv[1] && import.meta.url === new URL(`file://${resolve(process.argv[1])}`).href) {
  const [manifest, output = "build/preview"] = process.argv.slice(2);
  if (!manifest) {
    console.error("Usage: node harness/preview-film.mjs <manifest.json> [output-directory]");
    process.exitCode = 2;
  } else {
    buildPreview(manifest, output)
      .then(result => console.log(`Generated ${result.scenes} deterministic HTML scenes (${result.frames} frames) in ${result.dir}. Not an MP4.`))
      .catch(err => { console.error(err.message); process.exitCode = 1; });
  }
}
