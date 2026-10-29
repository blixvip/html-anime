import { compileBrief, FPS, ASPECTS, SCRIPTS } from "./compile.js";

/**
 * Compile a film manifest into consecutive html-anime shot sheets.
 * This creates a production plan, not rendered video.
 */
export function compileFilm(manifest) {
  if (!manifest || typeof manifest !== "object") throw new Error("Film manifest required");
  const { title, aspect = "16:9", script = "indigo", scenes, characters = [] } = manifest;
  if (typeof title !== "string" || !title.trim()) throw new Error("Film title required");
  if (!ASPECTS[aspect]) throw new Error("Unsupported aspect ratio");
  if (!SCRIPTS[script]) throw new Error("Unsupported color script");
  if (!Array.isArray(scenes) || scenes.length === 0) throw new Error("At least one scene required");
  if (!Array.isArray(characters)) throw new Error("Characters must be an array");
  const ids = new Set();
  for (const character of characters) {
    if (!character || typeof character.id !== "string" || !/^[a-z0-9_-]+$/.test(character.id) || ids.has(character.id))
      throw new Error("Character IDs must be unique, lowercase and nonempty");
    ids.add(character.id);
  }
  let cursor = 0;
  const shots = scenes.map((scene, i) => {
    if (!scene || !Number.isInteger(scene.seconds) || ![8, 12, 20].includes(scene.seconds))
      throw new Error(`Scene ${i + 1}: duration must be 8, 12 or 20 seconds`);
    if (scene.characters !== undefined && (!Array.isArray(scene.characters) || scene.characters.some(id => !ids.has(id))))
      throw new Error(`Scene ${i + 1}: unknown character reference`);
    const result = compileBrief({
      logline: scene.logline, seconds: scene.seconds, aspect,
      script: scene.script ?? script, dialogue: scene.dialogue ?? ""
    });
    if (!result.ok) throw new Error(`Scene ${i + 1}: ${result.error}`);
    const startFrame = cursor;
    cursor += result.frames;
    return {
      id: `scene-${String(i + 1).padStart(3, "0")}`,
      startFrame, endFrame: cursor, frames: result.frames,
      seconds: result.seconds, characterIds: scene.characters ?? [],
      sheet: result.markdown, slug: result.slug
    };
  });
  return {
    version: 1, title: title.trim(), fps: FPS, aspect,
    width: ASPECTS[aspect].w, height: ASPECTS[aspect].h,
    totalFrames: cursor, totalSeconds: cursor / FPS,
    characters, shots
  };
}
