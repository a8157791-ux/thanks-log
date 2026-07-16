import { readdirSync } from "node:fs";
import path from "node:path";
import type { StickerItem } from "@/lib/stickers";

const IMAGE_EXTENSIONS = new Set([".png", ".svg", ".jpg", ".jpeg", ".webp"]);

/** Server-only: scan public/stickers/placeholder/ so dropping a new image in there is enough
 * to make it pickable — no manifest entry to hand-write or keep in sync. */
export function listPlaceholderStickers(): StickerItem[] {
  const dir = path.join(process.cwd(), "public", "stickers", "placeholder");

  let files: string[];
  try {
    files = readdirSync(dir);
  } catch {
    return [];
  }

  return files
    .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .map((file) => {
      const name = path.basename(file, path.extname(file));
      const label = name.replace(/[-_]+/g, " ");
      return { kind: "placeholder" as const, name, label };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
