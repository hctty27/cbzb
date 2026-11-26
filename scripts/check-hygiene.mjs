import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const IGNORED_DIRS = new Set([
  '.git',
  'node_modules',
  'tools',
  'decompiled',
  'flash',
  'dist-release',
  '__pycache__',
]);

const IGNORED_REL_PREFIXES = [
  'game/build',
  'game/library',
  'game/temp',
  'game/local',
  'game/profiles',
];

const TEXT_EXTENSIONS = new Set(['.ts', '.mjs', '.js', '.json', '.ejs', '.css', '.md', '.yml', '.yaml']);
const FORBIDDEN_PORTAL_TERMS = ['armorgames', 'kongregate', 'newgrounds', 'mochiads', 'cpmstar', 'playtomic'];
const MAX_RESOURCES_BYTES = 4 * 1024 * 1024;

function toPosixRel(absPath) {
  return path.relative(ROOT, absPath).split(path.sep).join('/');
}

function collectFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = toPosixRel(full);
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      if (IGNORED_REL_PREFIXES.some((p) => rel === p || rel.startsWith(`${p}/`))) continue;
      collectFiles(full, out);
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

function dirSizeBytes(dir) {
  let total = 0;
  if (!fs.existsSync(dir)) return 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) total += dirSizeBytes(full);
    else if (entry.isFile()) total += fs.statSync(full).size;
  }
  return total;
}

const files = collectFiles(ROOT);
const failures = [];
let scannedText = 0;
let bomCount = 0;
let replacementCount = 0;
let forbiddenCount = 0;
let simCcImports = 0;

for (const absPath of files) {
  const ext = path.extname(absPath).toLowerCase();
  if (!TEXT_EXTENSIONS.has(ext)) continue;
  scannedText++;

  const rel = toPosixRel(absPath);
  const buf = fs.readFileSync(absPath);
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    bomCount++;
    failures.push(`UTF-8 BOM detected: ${rel}`);
  }

  const text = buf.toString('utf8');
  if (text.includes('\uFFFD')) {
    replacementCount++;
    failures.push(`Unicode replacement char U+FFFD detected: ${rel}`);
  }

  if (rel.startsWith('game/assets/scripts/') || rel.startsWith('game/build-templates/')) {
    const lower = text.toLowerCase();
    for (const term of FORBIDDEN_PORTAL_TERMS) {
      if (lower.includes(term)) {
        forbiddenCount++;
        failures.push(`Forbidden legacy portal reference "${term}" in ${rel}`);
      }
    }
  }

  if (
    rel.endsWith('.ts') &&
    (rel.startsWith('game/assets/scripts/core/') ||
      rel.startsWith('game/assets/scripts/data/') ||
      rel.startsWith('game/assets/scripts/sim/'))
  ) {
    if (/\bfrom\s+['"]cc['"]|\bimport\s+['"]cc['"]/.test(text)) {
      simCcImports++;
      failures.push(`Coupled Cocos "cc" import in pure module: ${rel}`);
    }
  }
}

const resourcesDir = path.join(ROOT, 'game', 'assets', 'resources');
const resourcesBytes = dirSizeBytes(resourcesDir);
const resourcesMB = resourcesBytes / (1024 * 1024);
if (resourcesBytes > MAX_RESOURCES_BYTES) {
  failures.push(`game/assets/resources exceeds 4.00 MB limit (${resourcesMB.toFixed(2)} MB)`);
}

console.log(
  `HYGIENE_CHECK scanned=${scannedText} bom=${bomCount} replacement=${replacementCount} forbidden=${forbiddenCount} simCcImports=${simCcImports} resourcesMB=${resourcesMB.toFixed(2)}/4.00`,
);

if (failures.length > 0) {
  for (const msg of failures) console.error(`ERROR: ${msg}`);
  process.exit(1);
}
