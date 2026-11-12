// One-off: trims empty borders from the supplied brand logos so they all look the same size.
// Reads the originals in assets/brands/, writes trimmed, resized WebP files to public/brands/, and prints
// each new size for content/business.ts and content/catalogues.json. Run with: npm run logos
import { readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const src = fileURLToPath(new URL("../assets/brands/", import.meta.url));
const dest = fileURLToPath(new URL("../public/brands/", import.meta.url));

for (const file of await readdir(src)) {
  if (!/\.(png|jpe?g)$/i.test(file)) continue;
  const name = file.replace(/\.(png|jpe?g)$/i, ".webp");
  // Flatten onto white first, so transparent and white padding are trimmed the same way.
  const flat = await sharp(src + file).flatten({ background: "#ffffff" }).toBuffer();
  const out = await sharp(flat)
    .trim({ background: "#ffffff", threshold: 28 })
    .extend({ top: 4, bottom: 4, left: 4, right: 4, background: "#ffffff" })
    // Twice the height the site shows them at (56px; Shape 84px), so they stay sharp but small.
    .resize({ height: file.startsWith("shape") ? 168 : 112, withoutEnlargement: true })
    .webp({ quality: 90, effort: 6 })
    .toFile(dest + name);
  console.log(`${name.padEnd(22)} ${out.width} x ${out.height}`);
}
