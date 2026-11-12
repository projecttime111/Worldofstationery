// Generates the Open Graph image, apple-touch-icon and favicon.ico from the logo mark.
// Run with: npm run images   (only needed again if the logo or tagline changes)
// Uses next/og (bundled with Next.js), so no extra dependencies.

import { readFile, writeFile } from "node:fs/promises";
import { createElement as h } from "react";
import { ImageResponse } from "next/og.js";

const root = new URL("../", import.meta.url);
const markSvg = await readFile(new URL("assets/logos/world-of-stationery-mark.svg", root), "utf8");
const smallSvg = await readFile(new URL("app/icon.svg", root), "utf8");
const dataUri = (svg) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

async function render(element, width, height) {
  const res = new ImageResponse(element, { width, height });
  return Buffer.from(await res.arrayBuffer());
}

// 1200 x 630 Open Graph image
const og = h(
  "div",
  {
    style: {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      gap: 56,
      padding: "0 80px",
      background: "#F7F5EF",
      borderBottom: "24px solid #1B3A6B",
      fontFamily: "sans-serif",
    },
  },
  h("img", { src: dataUri(markSvg), width: 300, height: 300 }),
  h(
    "div",
    { style: { display: "flex", flexDirection: "column", color: "#1A1D21" } },
    h("div", { style: { fontSize: 44, color: "#5A5F66", fontWeight: 600 } }, "World of"),
    h("div", { style: { fontSize: 92, color: "#1B3A6B", fontWeight: 800, letterSpacing: 2, lineHeight: 1 } }, "STATIONERY"),
    h("div", { style: { fontSize: 28, color: "#5A5F66", marginTop: 12 } }, "by Yamuna Enterprises · Akola"),
    h(
      "div",
      { style: { fontSize: 34, color: "#1A1D21", marginTop: 36, maxWidth: 640, lineHeight: 1.25 } },
      "2,000+ stationery and IT products. One supplier you can trust.",
    ),
  ),
);
await writeFile(new URL("public/og.png", root), await render(og, 1200, 630));

// 180 x 180 apple-touch-icon (opaque background, iOS adds the rounded corners)
const apple = h(
  "div",
  { style: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#FFFFFF" } },
  h("img", { src: dataUri(markSvg), width: 196, height: 196 }),
);
await writeFile(new URL("app/apple-icon.png", root), await render(apple, 180, 180));

// favicon.ico with 16, 32 and 48 px PNGs inside (ICO files may hold PNG data directly)
const sizes = [16, 32, 48];
const pngs = [];
for (const s of sizes) {
  const el = h(
    "div",
    { style: { width: "100%", height: "100%", display: "flex" } },
    h("img", { src: dataUri(s < 48 ? smallSvg : markSvg), width: s, height: s }),
  );
  pngs.push(await render(el, s, s));
}
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(pngs.length, 4);
let offset = 6 + 16 * pngs.length;
const entries = pngs.map((png, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(sizes[i], 0);
  e.writeUInt8(sizes[i], 1);
  e.writeUInt8(0, 2);
  e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(png.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += png.length;
  return e;
});
await writeFile(new URL("app/favicon.ico", root), Buffer.concat([header, ...entries, ...pngs]));

console.log("Wrote public/og.png, app/apple-icon.png, app/favicon.ico");
