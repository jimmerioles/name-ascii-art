import { readFileSync, writeFileSync, mkdtempSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const ART_FILE = "jimmerioles.txt";
const OUT_FILE = "jimmerioles-cyberpunk.svg";
const BG = "#0d0221";
const GRADIENT = ["#ff00ff", "#00ffff", "#ff00ff"];

const art = readFileSync(ART_FILE, "utf8").replace(/\n$/, "");
const lines = art.split("\n");
const cols = Math.max(...lines.map((l) => [...l].length));

const fontSize = 16;
const charWidth = fontSize * 0.6;
const lineHeight = 20;
const pad = 8;

const width = Math.ceil(cols * charWidth) + pad * 2;
const height = lines.length * lineHeight + pad * 2;

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const texts = lines
  .map(
    (line, i) =>
      `    <text x="${pad}" y="${pad + (i + 1) * lineHeight - 4}">${escape(line)}</text>`,
  )
  .join("\n");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="jimmerioles">
  <defs>
    <linearGradient id="cyberpunk" x1="0" y1="0" x2="${width}" y2="${height}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${GRADIENT[0]}"/>
      <stop offset="50%" stop-color="${GRADIENT[1]}"/>
      <stop offset="100%" stop-color="${GRADIENT[2]}"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" rx="8" fill="${BG}"/>
  <g fill="url(#cyberpunk)" shape-rendering="crispEdges" font-family="'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace" font-size="${fontSize}" xml:space="preserve">
${texts}
  </g>
</svg>
`;

const tmp = mkdtempSync(join(tmpdir(), "name-ascii-art-"));
const textSvg = join(tmp, "text.svg");
writeFileSync(textSvg, svg);

const proc = Bun.spawnSync({
  cmd: [
    "inkscape",
    textSvg,
    "--export-text-to-path",
    "--export-plain-svg",
    `--export-filename=${OUT_FILE}`,
  ],
  stdout: "pipe",
  stderr: "pipe",
});

if (proc.exitCode !== 0) {
  console.error("inkscape failed:");
  console.error(proc.stderr.toString());
  process.exit(proc.exitCode ?? 1);
}

console.log(`wrote ${OUT_FILE} (${width}x${height}, text converted to paths)`);
