import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(new URL("..", import.meta.url).pathname);
const outDir = join(root, "base-submission");
const W = 1284;
const H = 2778;

const c = {
  paper: "#f5f0df",
  cream: "#fffaf0",
  ink: "#15130f",
  green: "#dfff35",
  coral: "#ff6b57",
  blue: "#315cff",
  cyan: "#7bdff2",
};

function esc(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function wrap(text, maxChars) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function frame(content) {
  return `
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="${c.paper}"/>
    <path d="M0 170H1284M0 340H1284M0 510H1284M0 680H1284M0 850H1284M0 1020H1284M0 1190H1284M0 1360H1284M0 1530H1284M0 1700H1284M0 1870H1284M0 2040H1284M0 2210H1284M0 2380H1284M0 2550H1284" stroke="rgba(21,19,15,0.08)" stroke-width="3"/>
    <path d="M170 0V2778M340 0V2778M510 0V2778M680 0V2778M850 0V2778M1020 0V2778M1190 0V2778" stroke="rgba(21,19,15,0.08)" stroke-width="3"/>
    ${content}
  </svg>`;
}

function titleBlock(title, subtitle) {
  return `
    <text x="78" y="130" font-family="Courier New, monospace" font-size="30" font-weight="900" letter-spacing="7" fill="${c.ink}">TYPE MARK</text>
    <text x="76" y="238" font-family="Arial Black, Arial, sans-serif" font-size="86" font-weight="900" fill="${c.ink}">${esc(title)}</text>
    <rect x="78" y="286" width="1128" height="70" fill="${c.green}" stroke="${c.ink}" stroke-width="5"/>
    <text x="110" y="334" font-family="Arial, sans-serif" font-size="34" font-weight="900" fill="${c.ink}">${esc(subtitle)}</text>
  `;
}

function poster(x, y, phrase, style, ink, note, fill = c.green) {
  const words = phrase.split(" ").slice(0, 5);
  const noteLines = wrap(note, 34).slice(0, 3);
  return `
    <rect x="${x + 12}" y="${y + 12}" width="1080" height="1180" fill="${c.ink}"/>
    <rect x="${x}" y="${y}" width="1080" height="1180" fill="${c.cream}" stroke="${c.ink}" stroke-width="7"/>
    <path d="M${x + 700} ${y}V${y + 1180}M${x} ${y + 250}H${x + 1080}" stroke="${c.ink}" stroke-width="7"/>
    <text x="${x + 54}" y="${y + 88}" font-family="Courier New, monospace" font-size="26" font-weight="900" letter-spacing="6" fill="${c.ink}">ONCHAIN TYPE</text>
    <rect x="${x + 826}" y="${y + 44}" width="176" height="56" fill="${fill}" stroke="${c.ink}" stroke-width="5"/>
    <text x="${x + 858}" y="${y + 82}" font-family="Courier New, monospace" font-size="20" font-weight="900" fill="${c.ink}">${esc(style)}</text>
    ${words.map((word, i) => `
      <rect x="${x + 54 + (i % 2) * 46}" y="${y + 340 + i * 124}" width="${Math.min(920, 72 + word.length * 58)}" height="104" fill="${fill}"/>
      <text x="${x + 78 + (i % 2) * 46}" y="${y + 418 + i * 124}" font-family="Arial Black, Arial, sans-serif" font-size="78" font-weight="900" fill="${ink}">${esc(word)}</text>
    `).join("")}
    <rect x="${x + 54}" y="${y + 1014}" width="438" height="104" fill="${c.cyan}" stroke="${c.ink}" stroke-width="5"/>
    <text x="${x + 80}" y="${y + 1056}" font-family="Courier New, monospace" font-size="20" font-weight="900" fill="${c.ink}">INK</text>
    <text x="${x + 80}" y="${y + 1094}" font-family="Arial, sans-serif" font-size="32" font-weight="900" fill="${c.ink}">${esc(ink === c.ink ? "Black" : "Color")}</text>
    <rect x="${x + 520}" y="${y + 1014}" width="486" height="104" fill="${c.cream}" stroke="${c.ink}" stroke-width="5"/>
    ${noteLines.map((line, i) => `<text x="${x + 550}" y="${y + 1054 + i * 31}" font-family="Arial, sans-serif" font-size="27" font-weight="800" fill="${c.ink}">${esc(line)}</text>`).join("")}
  `;
}

function panel(x, y, title, body, fill) {
  return `
    <rect x="${x + 10}" y="${y + 10}" width="520" height="230" fill="${c.ink}"/>
    <rect x="${x}" y="${y}" width="520" height="230" fill="${fill}" stroke="${c.ink}" stroke-width="6"/>
    <text x="${x + 34}" y="${y + 78}" font-family="Arial Black, Arial, sans-serif" font-size="40" font-weight="900" fill="${c.ink}">${esc(title)}</text>
    ${wrap(body, 28).slice(0, 3).map((line, i) => `<text x="${x + 34}" y="${y + 132 + i * 34}" font-family="Arial, sans-serif" font-size="28" font-weight="850" fill="${c.ink}">${esc(line)}</text>`).join("")}
  `;
}

function screenshot1() {
  return frame(`
    ${titleBlock("Stamp your phrase.", "Compose a short mark and save it on Base.")}
    ${poster(102, 500, "SHIP SMALL THINGS", "Poster", c.ink, "A visible mark for a useful Base app iteration.", c.green)}
    ${panel(102, 1870, "Phrase", "Short typographic marks for launches, updates, and receipts.", c.cream)}
    ${panel(672, 1870, "On Base", "Wallet and timestamp stay visible by mark ID.", c.cyan)}
  `);
}

function screenshot2() {
  return frame(`
    ${titleBlock("Pick the ink.", "Switch phrase style before stamping.")}
    ${panel(102, 430, "Style", "Poster, mono, editorial, or block treatment.", c.green)}
    ${panel(672, 430, "Ink", "Acid green, signal blue, hot coral, or black.", c.coral)}
    ${poster(102, 790, "PROOF OVER PROMISE", "Mono", c.cream, "A compact phrase for receipts, launch notes, and builder updates.", c.blue)}
  `);
}

function screenshot3() {
  return frame(`
    ${titleBlock("Load any mark.", "Retrieve the public poster by ID.")}
    ${poster(102, 500, "MAKE IT REAL", "Editorial", c.ink, "A public type mark for a product moment worth remembering.", c.coral)}
    ${panel(102, 1870, "Mark ID", "Look up a stamped phrase and its maker.", c.cyan)}
    ${panel(672, 1870, "Receipt", "BaseScan transaction link after confirmation.", c.cream)}
  `);
}

function iconSvg() {
  return `
  <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <rect width="1024" height="1024" fill="${c.paper}"/>
    <rect x="156" y="156" width="712" height="712" fill="${c.ink}"/>
    <rect x="118" y="118" width="712" height="712" fill="${c.cream}" stroke="${c.ink}" stroke-width="30"/>
    <rect x="196" y="294" width="514" height="128" fill="${c.green}"/>
    <rect x="196" y="452" width="408" height="128" fill="${c.coral}"/>
    <rect x="196" y="610" width="540" height="128" fill="${c.cyan}"/>
    <text x="230" y="392" font-family="Arial Black, Arial, sans-serif" font-size="116" font-weight="900" fill="${c.ink}">TYPE</text>
    <text x="230" y="550" font-family="Arial Black, Arial, sans-serif" font-size="116" font-weight="900" fill="${c.ink}">MARK</text>
    <text x="230" y="708" font-family="Arial Black, Arial, sans-serif" font-size="116" font-weight="900" fill="${c.ink}">BASE</text>
  </svg>`;
}

function thumbnailSvg() {
  return `
  <svg width="1910" height="1000" viewBox="0 0 1910 1000" xmlns="http://www.w3.org/2000/svg">
    <rect width="1910" height="1000" fill="${c.paper}"/>
    <path d="M0 125H1910M0 250H1910M0 375H1910M0 500H1910M0 625H1910M0 750H1910M0 875H1910" stroke="rgba(21,19,15,0.08)" stroke-width="3"/>
    <text x="94" y="166" font-family="Arial Black, Arial, sans-serif" font-size="118" font-weight="900" fill="${c.ink}">Type Mark</text>
    <rect x="102" y="226" width="690" height="72" fill="${c.green}" stroke="${c.ink}" stroke-width="6"/>
    <text x="134" y="275" font-family="Arial, sans-serif" font-size="38" font-weight="900" fill="${c.ink}">Stamp typographic phrases on Base.</text>
    ${panel(102, 430, "Compose", "Phrase, style, ink, and note.", c.cream)}
    ${panel(102, 700, "Stamp", "Wallet and timestamp on Base.", c.cyan)}
    ${poster(820, 70, "SHIP SMALL THINGS", "Poster", c.ink, "A visible mark for a useful Base app iteration.", c.green)}
  </svg>`;
}

async function writePng(name, svg, width = W, height = H) {
  const file = join(outDir, name);
  await sharp(Buffer.from(svg)).resize(width, height).png({ compressionLevel: 9 }).toFile(file);
  return file;
}

async function writeJpg(name, svg, width, height) {
  const file = join(outDir, name);
  await sharp(Buffer.from(svg)).resize(width, height).jpeg({ quality: 88, mozjpeg: true }).toFile(file);
  return file;
}

await mkdir(outDir, { recursive: true });

const files = [
  await writeJpg("app-icon.jpg", iconSvg(), 1024, 1024),
  await writeJpg("app-thumbnail.jpg", thumbnailSvg(), 1910, 1000),
  await writePng("screenshot-1.png", screenshot1()),
  await writePng("screenshot-2.png", screenshot2()),
  await writePng("screenshot-3.png", screenshot3()),
];

await writeFile(join(outDir, "asset-manifest.json"), JSON.stringify({ generatedAt: new Date().toISOString(), files }, null, 2), "utf8");
await writeFile(
  join(outDir, "submission-copy.md"),
  [
    "# Type Mark",
    "",
    "App Name: Type Mark",
    "Tagline: Stamp your phrase",
    "Description: Compose a short typographic mark and stamp its phrase, style, ink, note, wallet, and timestamp on Base.",
    "",
    "Domain: https://type-mark.vercel.app",
    "",
    "Assets:",
    "- app-icon.jpg",
    "- app-thumbnail.jpg",
    "- screenshot-1.png",
    "- screenshot-2.png",
    "- screenshot-3.png",
    "",
  ].join("\n"),
  "utf8",
);

console.log(`Generated ${files.length} Base submission assets in ${outDir}`);
