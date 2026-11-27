#!/usr/bin/env node
/**
 * Phase-B Art Processing Pipeline for 《山海烽火》:
 * 1. Flood-fill background matting + edge feathering + despill on Phase-A concept arts.
 * 2. Slices concept_ui_hud_style.png into 7 bronze/jade/iron UI components.
 * 3. Generates darkened Title backdrop, unit portraits, and faction emblems.
 * 4. Produces 4 faction Castles + damaged Ruin (<40% HP) variants with contact shadows.
 * 5. Produces 3 faction Basic Infantry 8-frame horizontal sprite strips (up/down/left go & attack + die)
 *    and maps right_* strips cleanly via flipX=true in AssetManifest.ts.
 * 6. Aligns Zhongzhou Level 1 battlefield map (1920x1080) with subtle stronghold ground pads.
 * 7. Emits Cocos Creator 4 .png.meta / directory .meta files, deletes legacy iriysoft_logo,
 *    updates AssetManifest.ts, and renders docs/shanhai/phase-b-sprites-preview.png for visual QA.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const sharp = require(path.join(ROOT, 'tools', 'cocos-cli', 'node_modules', 'sharp'));

const CONCEPTS_DIR = path.join(ROOT, 'docs', 'shanhai', 'concepts');
const ASSETS_DIR = path.join(ROOT, 'game', 'assets');
const RESOURCES_DIR = path.join(ASSETS_DIR, 'resources');
const BUNDLES_DIR = path.join(ASSETS_DIR, 'bundles');
const MANIFEST_PATH = path.join(ASSETS_DIR, 'scripts', 'data', 'AssetManifest.ts');

function deterministicUuid(seed) {
  const buf = crypto.createHash('sha256').update(seed).digest().subarray(0, 16);
  buf[6] = (buf[6] & 0x0f) | 0x40;
  buf[8] = (buf[8] & 0x3f) | 0x80;
  const h = buf.toString('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeDirMetaRecursive(dirPath, stopAtDir) {
  let cur = path.resolve(dirPath);
  const stop = path.resolve(stopAtDir);
  while (cur.startsWith(stop) && cur !== stop) {
    ensureDir(cur);
    const rel = path.relative(ASSETS_DIR, cur).replace(/\\/g, '/');
    const metaPath = `${cur}.meta`;
    if (!fs.existsSync(metaPath)) {
      const meta = {
        ver: '1.2.0',
        importer: 'directory',
        imported: true,
        uuid: deterministicUuid(`shanhai-dir:${rel}`),
        files: [],
        subMetas: {},
        userData: {},
      };
      fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n', 'utf8');
    }
    cur = path.dirname(cur);
  }
}

function writeImageMeta(pngPath, width, height, anchorX = 0.5, anchorY = 0.5, trimThreshold = 1) {
  const rel = path.relative(ASSETS_DIR, pngPath).replace(/\\/g, '/');
  const displayName = path.basename(pngPath, '.png');
  const uuid = deterministicUuid(`shanhai-img:${rel}`);
  const hw = width / 2;
  const hh = height / 2;
  const meta = {
    ver: '1.0.27',
    importer: 'image',
    imported: true,
    uuid,
    files: ['.json', '.png'],
    subMetas: {
      '6c48a': {
        importer: 'texture',
        uuid: `${uuid}@6c48a`,
        displayName,
        id: '6c48a',
        name: 'texture',
        userData: {
          wrapModeS: 'clamp-to-edge',
          wrapModeT: 'clamp-to-edge',
          imageUuidOrDatabaseUri: uuid,
          isUuid: true,
          visible: false,
          minfilter: 'linear',
          magfilter: 'linear',
          mipfilter: 'none',
          anisotropy: 0,
        },
        ver: '1.0.22',
        imported: true,
        files: ['.json'],
        subMetas: {},
      },
      f9941: {
        importer: 'sprite-frame',
        uuid: `${uuid}@f9941`,
        displayName,
        id: 'f9941',
        name: 'spriteFrame',
        userData: {
          trimThreshold,
          rotated: false,
          offsetX: 0,
          offsetY: 0,
          trimX: 0,
          trimY: 0,
          width,
          height,
          rawWidth: width,
          rawHeight: height,
          borderTop: 0,
          borderBottom: 0,
          borderLeft: 0,
          borderRight: 0,
          packable: true,
          pixelsToUnit: 100,
          pivotX: anchorX,
          pivotY: anchorY,
          meshType: 0,
          vertices: {
            rawPosition: [-hw, -hh, 0, hw, -hh, 0, -hw, hh, 0, hw, hh, 0],
            indexes: [0, 1, 2, 2, 1, 3],
            uv: [0, height, width, height, 0, 0, width, 0],
            nuv: [0, 0, 1, 0, 0, 1, 1, 1],
            minPos: [-hw, -hh, 0],
            maxPos: [hw, hh, 0],
          },
          isUuid: true,
          imageUuidOrDatabaseUri: `${uuid}@6c48a`,
          atlasUuid: '',
          trimType: 'none',
        },
        ver: '1.0.12',
        imported: true,
        files: ['.json'],
        subMetas: {},
      },
    },
    userData: {
      type: 'sprite-frame',
      fixAlphaTransparencyArtifacts: false,
      hasAlpha: true,
      redirect: `${uuid}@6c48a`,
    },
  };
  fs.writeFileSync(`${pngPath}.meta`, JSON.stringify(meta, null, 2) + '\n', 'utf8');
}

function sampleBorderBg(data, w, h) {
  const samples = [[], [], []];
  const add = (x, y) => {
    const i = (y * w + x) * 4;
    if (data[i + 3] < 200) return;
    samples[0].push(data[i]);
    samples[1].push(data[i + 1]);
    samples[2].push(data[i + 2]);
  };
  for (let y = 0; y < Math.min(8, h); y++) {
    for (let x = 0; x < Math.min(8, w); x++) {
      add(x, y);
      add(w - 1 - x, y);
      add(x, h - 1 - y);
      add(w - 1 - x, h - 1 - y);
    }
  }
  if (samples[0].length === 0) return [24, 26, 30];
  const med = (arr) => {
    const s = [...arr].sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)];
  };
  return [med(samples[0]), med(samples[1]), med(samples[2])];
}

/**
 * Border-seeded 4-connected BFS background remover + 2-pass edge feather & dark-fringe despill.
 * Leaves interior dark pixels (like black-iron armor or UI panel fills) completely opaque.
 */
function matteRawBuffer(rawData, w, h, opts = {}) {
  const {
    seedDist = 26,
    fillDist = 36,
    edgeDist = 54,
    forcedBg = null,
    pad = 4,
    preMaskFn = null,
  } = opts;

  const data = Buffer.from(rawData);
  const bg = forcedBg ?? sampleBorderBg(data, w, h);

  if (preMaskFn) preMaskFn(data, w, h, bg);

  const visited = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let head = 0;
  let tail = 0;

  const colorDist = (pIdx) => {
    const i = pIdx * 4;
    if (data[i + 3] === 0) return 0;
    return Math.hypot(data[i] - bg[0], data[i + 1] - bg[1], data[i + 2] - bg[2]);
  };

  const trySeed = (x, y) => {
    const pIdx = y * w + x;
    if (visited[pIdx]) return;
    if (colorDist(pIdx) <= seedDist) {
      visited[pIdx] = 1;
      queue[tail++] = pIdx;
    }
  };

  for (let x = 0; x < w; x++) {
    trySeed(x, 0);
    trySeed(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    trySeed(0, y);
    trySeed(w - 1, y);
  }

  while (head < tail) {
    const cur = queue[head++];
    const cx = cur % w;
    const cy = (cur / w) | 0;
    if (cx > 0) {
      const n = cur - 1;
      if (!visited[n] && colorDist(n) <= fillDist) {
        visited[n] = 1;
        queue[tail++] = n;
      }
    }
    if (cx + 1 < w) {
      const n = cur + 1;
      if (!visited[n] && colorDist(n) <= fillDist) {
        visited[n] = 1;
        queue[tail++] = n;
      }
    }
    if (cy > 0) {
      const n = cur - w;
      if (!visited[n] && colorDist(n) <= fillDist) {
        visited[n] = 1;
        queue[tail++] = n;
      }
    }
    if (cy + 1 < h) {
      const n = cur + w;
      if (!visited[n] && colorDist(n) <= fillDist) {
        visited[n] = 1;
        queue[tail++] = n;
      }
    }
  }

  for (let p = 0; p < w * h; p++) {
    if (visited[p]) {
      data[p * 4 + 3] = 0;
    }
  }

  // Edge feathering + despill pass on boundary pixels adjacent to removed background
  for (let pass = 0; pass < 2; pass++) {
    const alphaSnapshot = new Uint8Array(w * h);
    for (let p = 0; p < w * h; p++) alphaSnapshot[p] = data[p * 4 + 3];

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const p = y * w + x;
        const a = alphaSnapshot[p];
        if (a === 0) continue;
        const nearClear =
          alphaSnapshot[p - 1] === 0 ||
          alphaSnapshot[p + 1] === 0 ||
          alphaSnapshot[p - w] === 0 ||
          alphaSnapshot[p + w] === 0;
        if (!nearClear) continue;

        const i = p * 4;
        const d = Math.hypot(data[i] - bg[0], data[i + 1] - bg[1], data[i + 2] - bg[2]);
        if (d < edgeDist) {
          const factor = Math.max(0, Math.min(1, (d - fillDist * 0.72) / Math.max(1, edgeDist - fillDist * 0.72)));
          const newA = Math.round(a * (pass === 0 ? factor : Math.sqrt(factor)));
          data[i + 3] = newA;
          // Despill dark studio halo slightly toward warmer neutral midtone
          if (newA > 0 && newA < 235) {
            const blend = 1 - newA / 255;
            data[i] = Math.min(255, Math.round(data[i] + (100 - bg[0]) * blend * 0.25));
            data[i + 1] = Math.min(255, Math.round(data[i + 1] + (96 - bg[1]) * blend * 0.25));
            data[i + 2] = Math.min(255, Math.round(data[i + 2] + (90 - bg[2]) * blend * 0.25));
          }
        }
      }
    }
  }

  // Trim bounding box around non-transparent pixels (alpha > 8)
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = data[(y * w + x) * 4 + 3];
      if (a > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX || maxY < minY) {
    return { data, width: w, height: h };
  }

  const cropX = Math.max(0, minX - pad);
  const cropY = Math.max(0, minY - pad);
  const cropW = Math.min(w - cropX, maxX - cropX + 1 + pad);
  const cropH = Math.min(h - cropY, maxY - cropY + 1 + pad);
  const out = Buffer.alloc(cropW * cropH * 4);
  for (let ry = 0; ry < cropH; ry++) {
    const srcStart = ((cropY + ry) * w + cropX) * 4;
    const dstStart = ry * cropW * 4;
    data.copy(out, dstStart, srcStart, srcStart + cropW * 4);
  }
  return { data: out, width: cropW, height: cropH };
}

async function matteFile(filePath, opts = {}) {
  const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return matteRawBuffer(data, info.width, info.height, opts);
}

async function matteRegion(filePath, rect, opts = {}) {
  const { data, info } = await sharp(filePath)
    .extract(rect)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return matteRawBuffer(data, info.width, info.height, opts);
}

async function saveSpritePng(sharpImg, outPath, metaOpts = {}, pngOpts = {}) {
  writeDirMetaRecursive(path.dirname(outPath), ASSETS_DIR);
  const palette = pngOpts.palette ?? true;
  const buf = await sharpImg
    .png({
      compressionLevel: 9,
      palette,
      quality: pngOpts.quality ?? 90,
      effort: 9,
    })
    .toBuffer({ resolveWithObject: true });
  fs.writeFileSync(outPath, buf.data);
  const { width, height } = buf.info;
  writeImageMeta(outPath, width, height, metaOpts.anchorX ?? 0.5, metaOpts.anchorY ?? 0.5, metaOpts.trimThreshold ?? 1);
  return {
    outPath,
    width,
    height,
    bytes: buf.data.length,
    anchorX: metaOpts.anchorX ?? 0.5,
    anchorY: metaOpts.anchorY ?? 0.5,
  };
}

async function fitOnCanvas(rawObj, boxW, boxH, align = 'center', pad = 4, bottomPad = 6) {
  const srcW = rawObj.width ?? rawObj.info.width;
  const srcH = rawObj.height ?? rawObj.info.height;
  const innerW = boxW - pad * 2;
  const innerH = boxH - pad - bottomPad;
  const resized = await sharp(rawObj.data, {
    raw: { width: srcW, height: srcH, channels: 4 },
  })
    .resize({ width: innerW, height: innerH, fit: 'inside', kernel: 'lanczos3' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rw = resized.info.width;
  const rh = resized.info.height;
  const left = Math.round((boxW - rw) / 2);
  const top = align === 'bottom' ? boxH - bottomPad - rh : Math.round((boxH - rh) / 2);

  return sharp({
    create: { width: boxW, height: boxH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: resized.data, raw: { width: rw, height: rh, channels: 4 }, left, top }])
    .png();
}

function makeEllipseShadowSvg(w, h, cx, cy, rx, ry, opacity = 0.42) {
  return Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="s" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#050608" stop-opacity="${opacity}"/>
          <stop offset="65%" stop-color="#050608" stop-opacity="${(opacity * 0.55).toFixed(2)}"/>
          <stop offset="100%" stop-color="#050608" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#s)"/>
    </svg>`,
  );
}

function makeSlashSvg(w, h, colorHex, phase01, mode = 'horizontal') {
  if (phase01 < 0.25 || phase01 > 0.78) return null;
  const t = (phase01 - 0.25) / 0.53;
  const alpha = Math.sin(t * Math.PI);
  const strokeW = (5 + alpha * 5).toFixed(1);
  if (mode === 'up') {
    const yOff = Math.round(32 - t * 24);
    return Buffer.from(
      `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <path d="M 38 ${yOff + 26} Q 80 ${yOff - 4}, 122 ${yOff + 26}" fill="none" stroke="${colorHex}" stroke-width="${strokeW}" stroke-linecap="round" stroke-opacity="${(alpha * 0.9).toFixed(2)}"/>
        <path d="M 48 ${yOff + 22} Q 80 ${yOff + 2}, 112 ${yOff + 22}" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-opacity="${(alpha * 0.7).toFixed(2)}"/>
      </svg>`,
    );
  }
  if (mode === 'down') {
    const yOff = Math.round(92 + t * 26);
    return Buffer.from(
      `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <path d="M 38 ${yOff - 20} Q 80 ${yOff + 18}, 122 ${yOff - 20}" fill="none" stroke="${colorHex}" stroke-width="${strokeW}" stroke-linecap="round" stroke-opacity="${(alpha * 0.9).toFixed(2)}"/>
        <path d="M 48 ${yOff - 16} Q 80 ${yOff + 10}, 112 ${yOff - 16}" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-opacity="${(alpha * 0.7).toFixed(2)}"/>
      </svg>`,
    );
  }
  // Leftward melee arc in front of left-facing character
  const sweep = t * 18;
  return Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <path d="M ${56 - sweep * 0.4} ${34 + sweep} C ${14 - sweep * 0.2} ${62 + sweep * 0.5}, ${18} ${102 + sweep * 0.4}, ${62} ${128}" fill="none" stroke="${colorHex}" stroke-width="${strokeW}" stroke-linecap="round" stroke-opacity="${(alpha * 0.92).toFixed(2)}"/>
      <path d="M ${50 - sweep * 0.3} ${44 + sweep} C ${24} ${68 + sweep * 0.4}, ${24} ${98 + sweep * 0.3}, ${56} ${120}" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-opacity="${(alpha * 0.72).toFixed(2)}"/>
    </svg>`,
  );
}

function makeRangedBoltSvg(w, h, colorHex, phase01, mode = 'horizontal') {
  if (phase01 < 0.28 || phase01 > 0.85) return null;
  const t = (phase01 - 0.28) / 0.57;
  const alpha = Math.sin(Math.min(1, t) * Math.PI);
  if (mode === 'up') {
    const yTip = Math.round(62 - t * 52);
    return Buffer.from(
      `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <line x1="80" y1="${yTip + 24}" x2="80" y2="${yTip}" stroke="${colorHex}" stroke-width="5" stroke-linecap="round" stroke-opacity="${(alpha * 0.92).toFixed(2)}"/>
        <line x1="80" y1="${yTip + 16}" x2="80" y2="${yTip - 2}" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-opacity="${(alpha * 0.85).toFixed(2)}"/>
      </svg>`,
    );
  }
  if (mode === 'down') {
    const yTip = Math.round(86 + t * 54);
    return Buffer.from(
      `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <line x1="80" y1="${yTip - 24}" x2="80" y2="${yTip}" stroke="${colorHex}" stroke-width="5" stroke-linecap="round" stroke-opacity="${(alpha * 0.92).toFixed(2)}"/>
        <line x1="80" y1="${yTip - 16}" x2="80" y2="${yTip + 2}" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-opacity="${(alpha * 0.85).toFixed(2)}"/>
      </svg>`,
    );
  }
  const xTip = Math.round(52 - t * 44);
  return Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <line x1="${xTip + 26}" y1="68" x2="${xTip}" y2="68" stroke="${colorHex}" stroke-width="5.5" stroke-linecap="round" stroke-opacity="${(alpha * 0.95).toFixed(2)}"/>
      <line x1="${xTip + 18}" y1="68" x2="${xTip - 2}" y2="68" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-opacity="${(alpha * 0.85).toFixed(2)}"/>
      <circle cx="${xTip}" cy="68" r="5" fill="${colorHex}" fill-opacity="${(alpha * 0.65).toFixed(2)}"/>
    </svg>`,
  );
}

/** Rotates an RGBA image around a given pixel pivot (px, py) by `deg` degrees inside a `cw x ch` canvas. */
function transformSpriteToCanvas(srcData, sw, sh, cw, ch, {
  pivotX = sw / 2,
  pivotY = sh * 0.92,
  dstX = cw / 2,
  dstY = ch * 0.9,
  deg = 0,
  scaleX = 1,
  scaleY = 1,
  alphaMul = 1,
  tintMul = [1, 1, 1],
}) {
  const out = Buffer.alloc(cw * ch * 4);
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const dx = x - dstX;
      const dy = y - dstY;
      // Inverse transform (screen -> source)
      const rx = dx * cos + dy * sin;
      const ry = -dx * sin + dy * cos;
      const sx = rx / scaleX + pivotX;
      const sy = ry / scaleY + pivotY;

      const x0 = Math.floor(sx);
      const y0 = Math.floor(sy);
      if (x0 < 0 || x0 >= sw - 1 || y0 < 0 || y0 >= sh - 1) continue;
      const fx = sx - x0;
      const fy = sy - y0;

      const i00 = (y0 * sw + x0) * 4;
      const i10 = i00 + 4;
      const i01 = i00 + sw * 4;
      const i11 = i01 + 4;

      const w00 = (1 - fx) * (1 - fy);
      const w10 = fx * (1 - fy);
      const w01 = (1 - fx) * fy;
      const w11 = fx * fy;

      const a =
        srcData[i00 + 3] * w00 +
        srcData[i10 + 3] * w10 +
        srcData[i01 + 3] * w01 +
        srcData[i11 + 3] * w11;
      if (a < 2) continue;

      // Premultiplied-style color weighting prevents dark borders on bilinear interpolation
      const a00 = srcData[i00 + 3] * w00;
      const a10 = srcData[i10 + 3] * w10;
      const a01 = srcData[i01 + 3] * w01;
      const a11 = srcData[i11 + 3] * w11;
      const aSum = a00 + a10 + a01 + a11;
      if (aSum <= 0) continue;

      const r = (srcData[i00] * a00 + srcData[i10] * a10 + srcData[i01] * a01 + srcData[i11] * a11) / aSum;
      const g = (srcData[i00 + 1] * a00 + srcData[i10 + 1] * a10 + srcData[i01 + 1] * a01 + srcData[i11 + 1] * a11) / aSum;
      const b = (srcData[i00 + 2] * a00 + srcData[i10 + 2] * a10 + srcData[i01 + 2] * a01 + srcData[i11 + 2] * a11) / aSum;

      const di = (y * cw + x) * 4;
      out[di] = Math.max(0, Math.min(255, Math.round(r * tintMul[0])));
      out[di + 1] = Math.max(0, Math.min(255, Math.round(g * tintMul[1])));
      out[di + 2] = Math.max(0, Math.min(255, Math.round(b * tintMul[2])));
      out[di + 3] = Math.max(0, Math.min(255, Math.round(a * alphaMul)));
    }
  }
  return out;
}

async function generateUiKit() {
  const uiSrc = path.join(CONCEPTS_DIR, 'concept_ui_hud_style.png');
  const uiOutDir = path.join(RESOURCES_DIR, 'art', 'ui');
  ensureDir(uiOutDir);

  const results = {};

  // 1. Top resource bar (mask out wheat tips in gap [x=1120..1490, y=204..238])
  const topRaw = await matteRegion(uiSrc, { left: 40, top: 0, width: 1592, height: 238 }, {
    seedDist: 28,
    fillDist: 40,
    edgeDist: 58,
    forcedBg: [22, 24, 27],
    preMaskFn: (buf, w, h, bg) => {
      for (let y = 204; y < h; y++) {
        for (let x = 1080; x <= 1450 && x < w; x++) {
          const i = (y * w + x) * 4;
          buf[i] = bg[0];
          buf[i + 1] = bg[1];
          buf[i + 2] = bg[2];
        }
      }
    },
  });
  results['ui/hud_top_bar'] = await saveSpritePng(
    await fitOnCanvas(topRaw, 960, 140, 'center', 4, 4),
    path.join(uiOutDir, 'ui_hud_top_bar.png'),
    { anchorX: 0.5, anchorY: 0.5 },
  );

  // 2. Three diamond resource icons (Gold / Mana / Food)
  const goldRaw = await matteRegion(uiSrc, { left: 190, top: 222, width: 354, height: 342 }, {
    seedDist: 26,
    fillDist: 38,
    edgeDist: 56,
    forcedBg: [22, 24, 27],
  });
  results['ui/icon_res_gold'] = await saveSpritePng(
    await fitOnCanvas(goldRaw, 64, 64, 'center', 2, 2),
    path.join(uiOutDir, 'icon_res_gold.png'),
  );

  const manaRaw = await matteRegion(uiSrc, { left: 660, top: 222, width: 352, height: 368 }, {
    seedDist: 26,
    fillDist: 36,
    edgeDist: 54,
    forcedBg: [22, 24, 27],
  });
  results['ui/icon_res_mana'] = await saveSpritePng(
    await fitOnCanvas(manaRaw, 64, 64, 'center', 2, 2),
    path.join(uiOutDir, 'icon_res_mana.png'),
  );

  const foodRaw = await matteRegion(uiSrc, { left: 1130, top: 210, width: 350, height: 355 }, {
    seedDist: 26,
    fillDist: 38,
    edgeDist: 56,
    forcedBg: [22, 24, 27],
  });
  results['ui/icon_res_food'] = await saveSpritePng(
    await fitOnCanvas(foodRaw, 64, 64, 'center', 2, 2),
    path.join(uiOutDir, 'icon_res_food.png'),
  );

  // 3. Spell dock frame
  const dockRaw = await matteRegion(uiSrc, { left: 78, top: 576, width: 844, height: 326 }, {
    seedDist: 28,
    fillDist: 40,
    edgeDist: 56,
    forcedBg: [22, 24, 27],
  });
  results['ui/hud_spell_dock'] = await saveSpritePng(
    await fitOnCanvas(dockRaw, 384, 148, 'center', 4, 4),
    path.join(uiOutDir, 'ui_hud_spell_dock.png'),
  );

  // 4. Two pill buttons (dark stone & molten gold)
  const darkBtnRaw = await matteRegion(uiSrc, { left: 984, top: 588, width: 600, height: 140 }, {
    seedDist: 28,
    fillDist: 40,
    edgeDist: 58,
    forcedBg: [22, 24, 27],
  });
  results['ui/btn_pill'] = await saveSpritePng(
    await fitOnCanvas(darkBtnRaw, 286, 72, 'center', 4, 4),
    path.join(uiOutDir, 'ui_btn_bronze_pill.png'),
  );

  const goldBtnRaw = await matteRegion(uiSrc, { left: 984, top: 742, width: 600, height: 148 }, {
    seedDist: 28,
    fillDist: 40,
    edgeDist: 58,
    forcedBg: [22, 24, 27],
  });
  results['ui/btn_pill_active'] = await saveSpritePng(
    await fitOnCanvas(goldBtnRaw, 286, 74, 'center', 4, 4),
    path.join(uiOutDir, 'ui_btn_gold_pill.png'),
  );

  // 5. Title backdrop from concept_battlefield_zhongzhou.png with moody dark vignette for high UI contrast
  const titleVignette = Buffer.from(
    `<svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="v" cx="50%" cy="46%" r="72%">
          <stop offset="0%" stop-color="#0a0c10" stop-opacity="0.28"/>
          <stop offset="62%" stop-color="#0b0d12" stop-opacity="0.54"/>
          <stop offset="100%" stop-color="#07080c" stop-opacity="0.82"/>
        </radialGradient>
        <linearGradient id="tb" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#090b10" stop-opacity="0.65"/>
          <stop offset="30%" stop-color="#090b10" stop-opacity="0.15"/>
          <stop offset="72%" stop-color="#090b10" stop-opacity="0.20"/>
          <stop offset="100%" stop-color="#080a0e" stop-opacity="0.78"/>
        </linearGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#v)"/>
      <rect width="1280" height="720" fill="url(#tb)"/>
    </svg>`,
  );
  const titleImg = sharp(path.join(CONCEPTS_DIR, 'concept_battlefield_zhongzhou.png'))
    .resize(1280, 720, { fit: 'cover', kernel: 'lanczos3' })
    .modulate({ saturation: 0.88, brightness: 0.92 })
    .composite([{ input: titleVignette, blend: 'over' }]);
  results['ui/title_bg'] = await saveSpritePng(
    titleImg,
    path.join(uiOutDir, 'ui_title_bg_shanhai.png'),
    { anchorX: 0.5, anchorY: 0.5 },
    { palette: true, quality: 82 },
  );

  // 6. 4 Human Skill Icons (2x2 quadrants from concept_skills_human_set.png)
  const skillsSrc = path.join(CONCEPTS_DIR, 'concept_skills_human_set.png');
  const skillSpecs = [
    { key: 'icons/spell_lords_judgement', file: 'icon_skill_human_rain_of_arrows.png', left: 0, top: 0 },
    { key: 'icons/spell_banner_consecration', file: 'icon_skill_human_iron_wall.png', left: 627, top: 0 },
    { key: 'icons/spell_banner_heroism', file: 'icon_skill_human_war_drums.png', left: 0, top: 627 },
    { key: 'icons/spell_sign_of_advent', file: 'icon_skill_human_sovereign_decree.png', left: 627, top: 627 },
  ];
  for (const sk of skillSpecs) {
    const rawSk = await matteRegion(skillsSrc, { left: sk.left, top: sk.top, width: 627, height: 627 }, {
      seedDist: 26,
      fillDist: 38,
      edgeDist: 56,
      forcedBg: [17, 19, 26],
      pad: 2,
    });
    results[sk.key] = await saveSpritePng(
      await fitOnCanvas(rawSk, 64, 64, 'center', 1, 1),
      path.join(uiOutDir, sk.file),
      { anchorX: 0.5, anchorY: 0.5 },
      { palette: true, quality: 90 },
    );
  }

  // 7. Original Bronze-and-Jade Boundary Stele Marker for empty Build Sites (map/build_site)
  const terrainResDir = path.join(RESOURCES_DIR, 'art', 'terrain');
  ensureDir(terrainResDir);
  const steleSvg = Buffer.from(
    `<svg width="48" height="68" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#050608" stop-opacity="0.52"/>
          <stop offset="70%" stop-color="#050608" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="#050608" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="jade" cx="50%" cy="42%" r="50%">
          <stop offset="0%" stop-color="#9ff5eb" stop-opacity="0.95"/>
          <stop offset="65%" stop-color="#4ab5b8" stop-opacity="0.85"/>
          <stop offset="100%" stop-color="#1e4f58" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="24" cy="58" rx="18" ry="7" fill="url(#sg)"/>
      <ellipse cx="24" cy="56" rx="14" ry="5" fill="none" stroke="#c89f52" stroke-width="1.8" stroke-opacity="0.8"/>
      <path d="M 16 55 L 18 16 L 24 8 L 30 16 L 32 55 Z" fill="#3a3b42" stroke="#1e1f24" stroke-width="1.5"/>
      <path d="M 18 55 L 20 17 L 24 10 L 24 55 Z" fill="#52555f" fill-opacity="0.7"/>
      <path d="M 15 55 L 33 55 L 35 60 L 13 60 Z" fill="#6b5636" stroke="#c89f52" stroke-width="1.2"/>
      <circle cx="24" cy="27" r="7" fill="url(#jade)"/>
      <circle cx="24" cy="27" r="3.6" fill="#bafaf4" stroke="#c89f52" stroke-width="1"/>
      <rect x="22.5" y="37" width="3" height="12" rx="1" fill="#c89f52" fill-opacity="0.85"/>
    </svg>`,
  );
  results['map/build_site'] = await saveSpritePng(
    sharp(steleSvg),
    path.join(terrainResDir, 'terrain_build_site_seal.png'),
    { anchorX: 0.5, anchorY: 0.16 },
    { palette: true, quality: 92 },
  );

  return results;
}

async function generateBuildingsAndEmblems() {
  const bldgOutDir = path.join(BUNDLES_DIR, 'bundle_gameplay', 'art', 'buildings');
  const uiOutDir = path.join(RESOURCES_DIR, 'art', 'ui');
  ensureDir(bldgOutDir);
  ensureDir(uiOutDir);

  const specs = [
    {
      concept: 'concept_castle_human.png',
      key: 'buildings/castle_green',
      razeKey: 'buildings/castle_green_raze',
      emblemKey: 'ui/icon_faction_human',
      slug: 'human',
    },
    {
      concept: 'concept_castle_celestial.png',
      key: 'buildings/castle_blue',
      razeKey: 'buildings/castle_blue_raze',
      emblemKey: 'ui/icon_faction_celestial',
      slug: 'celestial',
    },
    {
      concept: 'concept_castle_beast.png',
      key: 'buildings/castle_red',
      razeKey: 'buildings/castle_red_raze',
      emblemKey: 'ui/icon_faction_beast',
      slug: 'beast',
    },
    {
      concept: 'concept_castle_chaos.png',
      key: 'buildings/castle_purple',
      razeKey: 'buildings/castle_purple_raze',
      emblemKey: null,
      slug: 'chaos',
    },
  ];

  const results = {};
  const size = 216;
  const shadowSvg = makeEllipseShadowSvg(size, size, size / 2, size - 36, 90, 26, 0.44);

  const ruinSmokeSvg = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ember" cx="48%" cy="66%" r="38%">
          <stop offset="0%" stop-color="#ff6228" stop-opacity="0.42"/>
          <stop offset="52%" stop-color="#9e2012" stop-opacity="0.20"/>
          <stop offset="100%" stop-color="#1a0906" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="smoke1" cx="46%" cy="34%" r="36%">
          <stop offset="0%" stop-color="#100f12" stop-opacity="0.68"/>
          <stop offset="65%" stop-color="#1e1b20" stop-opacity="0.34"/>
          <stop offset="100%" stop-color="#18161a" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="106" cy="134" r="78" fill="url(#ember)"/>
      <circle cx="88" cy="72" r="68" fill="url(#smoke1)"/>
      <circle cx="134" cy="58" r="54" fill="url(#smoke1)"/>
      <path d="M 74 102 L 82 118 L 78 134 L 86 150 M 136 96 L 129 112 L 135 129 L 128 144" fill="none" stroke="#161012" stroke-width="2.2" stroke-linecap="round" stroke-opacity="0.55"/>
    </svg>`,
  );

  for (const sp of specs) {
    const raw = await matteFile(path.join(CONCEPTS_DIR, sp.concept), {
      seedDist: 24,
      fillDist: 36,
      edgeDist: 52,
      pad: 4,
    });

    const resizedCastle = await sharp(raw.data, { raw: { width: raw.width, height: raw.height, channels: 4 } })
      .resize({ width: size - 16, height: size - 24, fit: 'inside', kernel: 'lanczos3' })
      .ensureAlpha()
      .png()
      .toBuffer({ resolveWithObject: true });

    const cLeft = Math.round((size - resizedCastle.info.width) / 2);
    const cTop = Math.round((size - 24 - resizedCastle.info.height) / 2 + 4);

    const normalComposite = sharp({
      create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    }).composite([
      { input: shadowSvg, left: 0, top: 0 },
      { input: resizedCastle.data, left: cLeft, top: cTop },
    ]);

    results[sp.key] = await saveSpritePng(
      normalComposite,
      path.join(bldgOutDir, `building_${sp.slug}_castle_lv1.png`),
      { anchorX: 0.5, anchorY: 0.27 },
      { palette: true, quality: 90 },
    );

    const darkenedCastle = await sharp(resizedCastle.data)
      .modulate({ brightness: 0.62, saturation: 0.42 })
      .ensureAlpha()
      .png()
      .toBuffer();

    const ruinComposite = sharp({
      create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    }).composite([
      { input: shadowSvg, left: 0, top: 0 },
      { input: darkenedCastle, left: cLeft, top: cTop },
      { input: ruinSmokeSvg, left: 0, top: 0, blend: 'atop' },
    ]);

    results[sp.razeKey] = await saveSpritePng(
      ruinComposite,
      path.join(bldgOutDir, `building_${sp.slug}_castle_ruin.png`),
      { anchorX: 0.5, anchorY: 0.25 },
      { palette: true, quality: 88 },
    );

    if (sp.emblemKey) {
      results[sp.emblemKey] = await saveSpritePng(
        await fitOnCanvas(raw, 96, 96, 'center', 4, 4),
        path.join(uiOutDir, `icon_faction_${sp.slug}.png`),
        { anchorX: 0.5, anchorY: 0.5 },
        { palette: true, quality: 88 },
      );
    }
  }

  // Secondary Human Buildings (Town / Granary / Mine) + Chaos Corrupted Town / Granary / Mine
  const makeRuinSmokeSvg = (w, h) => Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ember" cx="48%" cy="66%" r="38%">
          <stop offset="0%" stop-color="#ff6228" stop-opacity="0.40"/>
          <stop offset="55%" stop-color="#9e2012" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#1a0906" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="smoke1" cx="46%" cy="34%" r="36%">
          <stop offset="0%" stop-color="#100f12" stop-opacity="0.65"/>
          <stop offset="65%" stop-color="#1e1b20" stop-opacity="0.32"/>
          <stop offset="100%" stop-color="#18161a" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="${Math.round(w * 0.49)}" cy="${Math.round(h * 0.62)}" r="${Math.round(w * 0.34)}" fill="url(#ember)"/>
      <circle cx="${Math.round(w * 0.42)}" cy="${Math.round(h * 0.34)}" r="${Math.round(w * 0.28)}" fill="url(#smoke1)"/>
      <circle cx="${Math.round(w * 0.62)}" cy="${Math.round(h * 0.28)}" r="${Math.round(w * 0.22)}" fill="url(#smoke1)"/>
    </svg>`,
  );

  const chaosRiftTintSvg = (w, h) => Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rift" cx="50%" cy="56%" r="44%">
          <stop offset="0%" stop-color="#a844ff" stop-opacity="0.48"/>
          <stop offset="55%" stop-color="#4e1678" stop-opacity="0.28"/>
          <stop offset="100%" stop-color="#160822" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="${Math.round(w * 0.5)}" cy="${Math.round(h * 0.56)}" r="${Math.round(Math.min(w, h) * 0.42)}" fill="url(#rift)"/>
    </svg>`,
  );

  const saveSecondaryBuilding = async ({
    rawObj,
    w,
    h,
    anchorY,
    normalKey,
    normalFile,
    razeKey = null,
    razeFile = null,
    chaosCorrupt = false,
  }) => {
    const shSvg = makeEllipseShadowSvg(w, h, w / 2, h - Math.round(h * 0.16), Math.round(w * 0.42), Math.round(h * 0.15), 0.44);
    const rs = await sharp(rawObj.data, { raw: { width: rawObj.width, height: rawObj.height, channels: 4 } })
      .resize({ width: w - 12, height: h - 16, fit: 'inside', kernel: 'lanczos3' })
      .ensureAlpha()
      .png()
      .toBuffer({ resolveWithObject: true });
    const left = Math.round((w - rs.info.width) / 2);
    const top = Math.round((h - Math.round(h * 0.12) - rs.info.height) / 2 + 2);

    let mainLayer = rs.data;
    if (chaosCorrupt) {
      mainLayer = await sharp(rs.data)
        .modulate({ brightness: 0.72, saturation: 0.55, hue: 260 })
        .ensureAlpha()
        .png()
        .toBuffer();
    }

    const baseComposites = [
      { input: shSvg, left: 0, top: 0 },
      { input: mainLayer, left, top },
    ];
    if (chaosCorrupt) {
      baseComposites.push({ input: chaosRiftTintSvg(w, h), left: 0, top: 0, blend: 'atop' });
    }

    results[normalKey] = await saveSpritePng(
      sharp({ create: { width: w, height: h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite(baseComposites),
      path.join(bldgOutDir, normalFile),
      { anchorX: 0.5, anchorY },
      { palette: true, quality: 90 },
    );

    if (razeKey && razeFile) {
      const darkBuf = await sharp(rs.data).modulate({ brightness: 0.62, saturation: 0.42 }).ensureAlpha().png().toBuffer();
      results[razeKey] = await saveSpritePng(
        sharp({ create: { width: w, height: h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([
          { input: shSvg, left: 0, top: 0 },
          { input: darkBuf, left, top },
          { input: makeRuinSmokeSvg(w, h), left: 0, top: 0, blend: 'atop' },
        ]),
        path.join(bldgOutDir, razeFile),
        { anchorX: 0.5, anchorY: Math.max(0.2, anchorY - 0.02) },
        { palette: true, quality: 88 },
      );
    }
  };

  const secSrc = path.join(CONCEPTS_DIR, 'concept_buildings_human_secondary.png');
  const humanTownRaw = await matteRegion(secSrc, { left: 0, top: 0, width: 650, height: 941 }, {
    seedDist: 26, fillDist: 38, edgeDist: 54, forcedBg: [28, 30, 35], pad: 4,
  });
  await saveSecondaryBuilding({
    rawObj: humanTownRaw,
    w: 184,
    h: 140,
    anchorY: 0.36,
    normalKey: 'buildings/town_green',
    normalFile: 'building_human_town_lv1.png',
    razeKey: 'buildings/town_green_raze',
    razeFile: 'building_human_town_ruin.png',
  });

  const humanGranaryRaw = await matteRegion(secSrc, { left: 650, top: 0, width: 525, height: 941 }, {
    seedDist: 26, fillDist: 38, edgeDist: 54, forcedBg: [28, 30, 35], pad: 4,
  });
  await saveSecondaryBuilding({
    rawObj: humanGranaryRaw,
    w: 108,
    h: 88,
    anchorY: 0.42,
    normalKey: 'buildings/village_green',
    normalFile: 'building_human_granary_lv1.png',
  });
  await saveSecondaryBuilding({
    rawObj: humanGranaryRaw,
    w: 108,
    h: 88,
    anchorY: 0.42,
    normalKey: 'buildings/village_purple',
    normalFile: 'building_chaos_granary_lv1.png',
    chaosCorrupt: true,
  });

  const humanMineRaw = await matteRegion(secSrc, { left: 1175, top: 0, width: 497, height: 941 }, {
    seedDist: 26, fillDist: 38, edgeDist: 54, forcedBg: [28, 30, 35], pad: 4,
  });
  await saveSecondaryBuilding({
    rawObj: humanMineRaw,
    w: 102,
    h: 84,
    anchorY: 0.42,
    normalKey: 'buildings/mine_green',
    normalFile: 'building_human_mine_lv1.png',
  });
  await saveSecondaryBuilding({
    rawObj: humanMineRaw,
    w: 102,
    h: 84,
    anchorY: 0.42,
    normalKey: 'buildings/mine_purple',
    normalFile: 'building_chaos_mine_lv1.png',
    chaosCorrupt: true,
  });

  const chaosTownRaw = await matteFile(path.join(CONCEPTS_DIR, 'concept_town_chaos.png'), {
    seedDist: 24, fillDist: 36, edgeDist: 52, pad: 4,
  });
  await saveSecondaryBuilding({
    rawObj: chaosTownRaw,
    w: 184,
    h: 156,
    anchorY: 0.36,
    normalKey: 'buildings/town_purple',
    normalFile: 'building_chaos_town_lv1.png',
    razeKey: 'buildings/town_purple_raze',
    razeFile: 'building_chaos_town_ruin.png',
  });

  return results;
}

async function generateInfantryUnits() {
  const unitsRoot = path.join(BUNDLES_DIR, 'bundle_gameplay', 'art', 'units');
  const uiOutDir = path.join(RESOURCES_DIR, 'art', 'ui');
  ensureDir(unitsRoot);
  ensureDir(uiOutDir);

  const unitSpecs = [
    {
      concept: 'concept_infantry_human.png',
      prefix: 'units/w_infantry',
      iconKey: 'icons/unit_w_infantry',
      slug: 'human_infantry_iron_guard',
      iconFile: 'icon_unit_human_infantry.png',
      flipToLeft: true,
      kind: 'melee',
      slashColor: '#f5b841',
    },
    {
      concept: 'concept_ranged_human_crossbow.png',
      prefix: 'units/w_archers',
      iconKey: 'icons/unit_w_archers',
      slug: 'human_ranged_crossbowman',
      iconFile: 'icon_unit_human_crossbow.png',
      flipToLeft: true,
      kind: 'ranged',
      slashColor: '#ffbe4f',
    },
    {
      concept: 'concept_infantry_celestial.png',
      prefix: 'units/b_infantry',
      iconKey: 'icons/unit_b_infantry',
      slug: 'celestial_infantry_heavenly_soldier',
      iconFile: 'icon_unit_celestial_infantry.png',
      flipToLeft: true,
      kind: 'melee',
      slashColor: '#7be3ff',
    },
    {
      concept: 'concept_infantry_beast.png',
      prefix: 'units/k_infantry',
      iconKey: 'icons/unit_k_infantry',
      slug: 'beast_infantry_mandrill_warrior',
      iconFile: 'icon_unit_beast_infantry.png',
      flipToLeft: false,
      kind: 'melee',
      slashColor: '#9be254',
    },
    {
      concept: 'concept_infantry_chaos_soul.png',
      prefix: 'units/e_infantry',
      iconKey: 'icons/unit_e_infantry',
      slug: 'chaos_infantry_soul_corroder',
      iconFile: 'icon_unit_chaos_infantry.png',
      flipToLeft: true,
      kind: 'melee',
      slashColor: '#c85cff',
    },
    {
      concept: 'concept_ranged_chaos_nether.png',
      prefix: 'units/e_archers',
      iconKey: 'icons/unit_e_archers',
      slug: 'chaos_ranged_nether_marksman',
      iconFile: 'icon_unit_chaos_ranged.png',
      flipToLeft: true,
      kind: 'ranged',
      slashColor: '#c066ff',
    },
  ];

  const results = {};
  const WORK = 160;
  const FRAME = 64;
  const FRAMES = 8;

  for (const u of unitSpecs) {
    const uDir = path.join(unitsRoot, u.slug);
    ensureDir(uDir);

    const raw = await matteFile(path.join(CONCEPTS_DIR, u.concept), {
      seedDist: 22,
      fillDist: 33,
      edgeDist: 50,
      pad: 4,
    });

    // Portrait icon from upper 55% of matted character (face + helm + weapon head + upper armor)
    const upperCrop = await sharp(raw.data, { raw: { width: raw.width, height: raw.height, channels: 4 } })
      .extract({ left: 0, top: 0, width: raw.width, height: Math.round(raw.height * 0.56) })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    results[u.iconKey] = await saveSpritePng(
      await fitOnCanvas(upperCrop, 64, 64, 'center', 2, 2),
      path.join(uiOutDir, u.iconFile),
      { anchorX: 0.5, anchorY: 0.5 },
      { palette: true, quality: 90 },
    );

    // Prepare 160x160 working figure, oriented facing LEFT for left_* base strips
    let basePipeline = sharp(raw.data, { raw: { width: raw.width, height: raw.height, channels: 4 } });
    if (u.flipToLeft) basePipeline = basePipeline.flop();
    const workSprite = await basePipeline
      .resize({ width: WORK - 28, height: WORK - 26, fit: 'inside', kernel: 'lanczos3' })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const sw = workSprite.info.width;
    const sh = workSprite.info.height;
    const sd = workSprite.data;

    const buildStrip = async (actionName, makeFrame) => {
      const frameBuffers = [];
      for (let f = 0; f < FRAMES; f++) {
        const workFrame = await makeFrame(f);
        const small = await sharp(workFrame, { raw: { width: WORK, height: WORK, channels: 4 } })
          .resize(FRAME, FRAME, { kernel: 'lanczos3' })
          .png()
          .toBuffer();
        frameBuffers.push({ input: small, left: f * FRAME, top: 0 });
      }
      const stripImg = sharp({
        create: { width: FRAME * FRAMES, height: FRAME, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
      }).composite(frameBuffers);

      const saved = await saveSpritePng(
        stripImg,
        path.join(uDir, `${actionName}.png`),
        { anchorX: 0.5, anchorY: 0.14 },
        { palette: true, quality: 90 },
      );

      results[`${u.prefix}/${actionName}`] = {
        ...saved,
        width: FRAME * FRAMES,
        height: FRAME,
        frameWidth: FRAME,
        frameHeight: FRAME,
        frameCount: FRAMES,
        flipX: false,
      };
    };

    const renderPose = async (opts, overlaySvg = null) => {
      const shRx = opts.shadowRx ?? 38;
      const shRy = opts.shadowRy ?? 11;
      const shX = Math.round(opts.shadowX ?? WORK / 2);
      const shY = Math.round(opts.shadowY ?? WORK * 0.88);
      const bodyRaw = transformSpriteToCanvas(sd, sw, sh, WORK, WORK, {
        pivotX: sw * 0.5,
        pivotY: sh * 0.94,
        dstX: WORK * 0.5 + (opts.dx ?? 0),
        dstY: WORK * 0.89 + (opts.dy ?? 0),
        deg: opts.deg ?? 0,
        scaleX: opts.scaleX ?? 1,
        scaleY: opts.scaleY ?? 1,
        alphaMul: opts.alphaMul ?? 1,
        tintMul: opts.tintMul ?? [1, 1, 1],
      });
      const layers = [
        { input: makeEllipseShadowSvg(WORK, WORK, shX, shY, shRx, shRy, opts.shadowOp ?? 0.44), left: 0, top: 0 },
        { input: bodyRaw, raw: { width: WORK, height: WORK, channels: 4 }, left: 0, top: 0 },
      ];
      if (overlaySvg) layers.push({ input: overlaySvg, left: 0, top: 0 });
      return sharp({
        create: { width: WORK, height: WORK, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
      })
        .composite(layers)
        .ensureAlpha()
        .raw()
        .toBuffer();
    };

    // left_go (and mirrored -> right_go)
    await buildStrip('left_go', async (f) => {
      const a = (f / FRAMES) * Math.PI * 2;
      const bounce = -Math.abs(Math.sin(a)) * 6;
      return renderPose({
        dy: bounce,
        deg: Math.sin(a) * 3.8,
        scaleX: 1 - Math.sin(a * 2) * 0.03,
        scaleY: 1 + Math.sin(a * 2) * 0.03,
        shadowRx: 36 - Math.abs(Math.sin(a)) * 4,
      });
    });

    // up_go (slightly darker back/shoulder shading + upward bob)
    await buildStrip('up_go', async (f) => {
      const a = (f / FRAMES) * Math.PI * 2;
      return renderPose({
        dy: -Math.abs(Math.sin(a)) * 5 - 2,
        deg: Math.sin(a) * 2.5,
        scaleX: 0.96,
        scaleY: 1.02 + Math.sin(a * 2) * 0.025,
        tintMul: [0.84, 0.86, 0.92],
      });
    });

    // down_go (front-lit downward march bounce)
    await buildStrip('down_go', async (f) => {
      const a = (f / FRAMES) * Math.PI * 2;
      return renderPose({
        dy: -Math.abs(Math.sin(a)) * 5 + 2,
        deg: Math.sin(a) * 3.0,
        scaleX: 1.03,
        scaleY: 0.98 + Math.sin(a * 2) * 0.025,
        tintMul: [1.04, 1.03, 1.0],
      });
    });

    // left_attack (windup -> forward lunge + slash arc or ranged shot -> recovery)
    await buildStrip('left_attack', async (f) => {
      const phase = f / (FRAMES - 1);
      if (u.kind === 'ranged') {
        const recoil = phase >= 0.28 && phase <= 0.52 ? 5 : 0;
        const fx = makeRangedBoltSvg(WORK, WORK, u.slashColor, phase, 'horizontal');
        return renderPose({ dx: recoil, deg: recoil > 0 ? 3 : 0 }, fx);
      }
      const lunge = phase < 0.35 ? phase * 18 : phase < 0.65 ? 6 - (phase - 0.35) * 70 : -15 + (phase - 0.65) * 42;
      const deg = phase < 0.35 ? 10 * (phase / 0.35) : phase < 0.65 ? 10 - 24 * ((phase - 0.35) / 0.3) : -14 * (1 - (phase - 0.65) / 0.35);
      const dy = phase >= 0.35 && phase <= 0.65 ? -4 : 0;
      const slash = makeSlashSvg(WORK, WORK, u.slashColor, phase, 'horizontal');
      return renderPose({ dx: lunge, dy, deg, shadowX: WORK / 2 + lunge * 0.6 }, slash);
    });

    // up_attack
    await buildStrip('up_attack', async (f) => {
      const phase = f / (FRAMES - 1);
      if (u.kind === 'ranged') {
        const recoilY = phase >= 0.28 && phase <= 0.52 ? 4 : 0;
        const fx = makeRangedBoltSvg(WORK, WORK, u.slashColor, phase, 'up');
        return renderPose({ dy: recoilY, tintMul: [0.88, 0.9, 0.96] }, fx);
      }
      const thrustY = phase < 0.35 ? 5 : phase < 0.65 ? -10 : -2;
      const slash = makeSlashSvg(WORK, WORK, u.slashColor, phase, 'up');
      return renderPose({ dy: thrustY, deg: Math.sin(phase * Math.PI) * -5, tintMul: [0.88, 0.9, 0.96] }, slash);
    });

    // down_attack
    await buildStrip('down_attack', async (f) => {
      const phase = f / (FRAMES - 1);
      if (u.kind === 'ranged') {
        const recoilY = phase >= 0.28 && phase <= 0.52 ? -4 : 0;
        const fx = makeRangedBoltSvg(WORK, WORK, u.slashColor, phase, 'down');
        return renderPose({ dy: recoilY, tintMul: [1.05, 1.04, 1.0] }, fx);
      }
      const thrustY = phase < 0.35 ? -6 : phase < 0.65 ? 8 : 2;
      const slash = makeSlashSvg(WORK, WORK, u.slashColor, phase, 'down');
      return renderPose({ dy: thrustY, deg: Math.sin(phase * Math.PI) * 6, tintMul: [1.05, 1.04, 1.0] }, slash);
    });

    // die (collapse backwards + dust ring + fade)
    await buildStrip('die', async (f) => {
      const p = f / (FRAMES - 1);
      const deg = Math.min(86, Math.pow(p, 0.85) * 88);
      const dy = p * 12;
      const dx = p * 10;
      const alphaMul = p < 0.55 ? 1 : Math.max(0.16, 1 - (p - 0.55) / 0.45 * 0.84);
      const dustOp = Math.sin(Math.min(1, p * 1.4) * Math.PI) * 0.45;
      const dustSvg = dustOp > 0.04
        ? Buffer.from(`<svg width="${WORK}" height="${WORK}" xmlns="http://www.w3.org/2000/svg"><ellipse cx="88" cy="140" rx="${28 + p * 22}" ry="${8 + p * 6}" fill="#8a7e6e" fill-opacity="${dustOp.toFixed(2)}"/></svg>`)
        : null;
      return renderPose({
        dx,
        dy,
        deg,
        alphaMul,
        tintMul: [0.82, 0.78, 0.78],
        shadowOp: 0.38 * alphaMul,
        shadowRx: 38 + p * 14,
      }, dustSvg);
    });

    // right_go & right_attack reuse left_go / left_attack via flipX
    results[`${u.prefix}/right_go`] = {
      ...results[`${u.prefix}/left_go`],
      flipX: true,
    };
    results[`${u.prefix}/right_attack`] = {
      ...results[`${u.prefix}/left_attack`],
      flipX: true,
    };
  }

  return results;
}

async function generateLevel1BattlefieldMap() {
  const src = path.join(CONCEPTS_DIR, 'concept_battlefield_zhongzhou.png');
  const outDir = path.join(BUNDLES_DIR, 'bundle_westaria', 'art', 'terrain');
  ensureDir(outDir);

  const W = 1920;
  const H = 1080;
  const anchorX = 0.1875;
  const anchorY = 0.9167;

  // Map Flash stage coords to 1920x1080 pixels aligned with BattleView (SWF_MAP_EXPORT_ZOOM = 1.5)
  const fxToPx = (fx, fy) => ({
    x: Math.round(W * anchorX + fx * 1.5),
    y: Math.round(H * (1 - anchorY) + fy * 1.5),
  });

  // Stronghold coords from level_1.json: 057 (player castle), 077 (enemy town), 007 (enemy castle)
  const pads = [
    fxToPx(450.95, 384.7),
    fxToPx(150.75, 231.35),
    fxToPx(573.5, 178.1),
  ];

  const padOverlaySvg = Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="pad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#3a3022" stop-opacity="0.34"/>
          <stop offset="68%" stop-color="#2b241a" stop-opacity="0.20"/>
          <stop offset="100%" stop-color="#1e1a14" stop-opacity="0"/>
        </radialGradient>
      </defs>
      ${pads.map((p) => `<ellipse cx="${p.x}" cy="${p.y + 8}" rx="108" ry="62" fill="url(#pad)"/>`).join('\n')}
    </svg>`,
  );

  const mapImg = sharp(src)
    .resize(W, H, { fit: 'cover', kernel: 'lanczos3' })
    .composite([{ input: padOverlaySvg, blend: 'over' }]);

  const saved = await saveSpritePng(
    mapImg,
    path.join(outDir, 'terrain_zhongzhou_l1.png'),
    { anchorX, anchorY },
    { palette: false },
  );

  // Jiuzhou World Map (1008x759 aligned with CampaignMapView)
  const worldSrc = path.join(CONCEPTS_DIR, 'concept_worldmap_jiuzhou.png');
  const worldOutDir = path.join(BUNDLES_DIR, 'bundle_gameplay', 'art', 'terrain');
  ensureDir(worldOutDir);
  const worldImg = sharp(worldSrc)
    .resize(1008, 759, { fit: 'cover', kernel: 'lanczos3' })
    .modulate({ saturation: 0.94, brightness: 0.95 });
  const savedWorld = await saveSpritePng(
    worldImg,
    path.join(worldOutDir, 'map_jiuzhou_world_base.png'),
    { anchorX: 0.5, anchorY: 0.5 },
    { palette: false },
  );

  return {
    'map/level1_bg': {
      ...saved,
      bundle: 'bundle_westaria',
      relPath: 'art/terrain/terrain_zhongzhou_l1',
      flashBounds: { xmin: -240, xmax: 1040, ymin: -60, ymax: 660, width: 1280, height: 720 },
    },
    'map/campaign_map_base': {
      ...savedWorld,
      bundle: 'bundle_gameplay',
      relPath: 'art/terrain/map_jiuzhou_world_base',
    },
    'map/campaign_map_1': {
      ...savedWorld,
      bundle: 'bundle_gameplay',
      relPath: 'art/terrain/map_jiuzhou_world_base',
    },
  };
}

async function generateContactSheet(uiMap, bldgMap, unitMap) {
  // Composite key Phase-B processed assets onto a neutral #2b2e36 review board
  const W = 1440;
  const H = 960;
  const labels = Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${W}" height="${H}" fill="#2b2e36"/>
      <rect x="20" y="20" width="1400" height="230" rx="10" fill="#1e2026" stroke="#4c515f"/>
      <rect x="20" y="268" width="1400" height="270" rx="10" fill="#1e2026" stroke="#4c515f"/>
      <rect x="20" y="556" width="1400" height="384" rx="10" fill="#1e2026" stroke="#4c515f"/>
    </svg>`,
  );

  const composites = [{ input: labels, left: 0, top: 0 }];

  const placePng = async (filePath, x, y, fitW, fitH) => {
    const buf = await sharp(filePath)
      .resize({ width: fitW, height: fitH, fit: 'inside', kernel: 'lanczos3' })
      .png()
      .toBuffer();
    composites.push({ input: buf, left: x, top: y });
  };

  // Row 1: UI Kit + Icons + Faction Emblems
  await placePng(uiMap['ui/hud_top_bar'].outPath, 40, 36, 620, 96);
  await placePng(uiMap['ui/hud_spell_dock'].outPath, 40, 140, 260, 100);
  await placePng(uiMap['ui/btn_pill'].outPath, 320, 152, 200, 62);
  await placePng(uiMap['ui/btn_pill_active'].outPath, 540, 152, 200, 62);
  await placePng(uiMap['ui/icon_res_gold'].outPath, 690, 44, 64, 64);
  await placePng(uiMap['ui/icon_res_mana'].outPath, 768, 44, 64, 64);
  await placePng(uiMap['ui/icon_res_food'].outPath, 846, 44, 64, 64);
  await placePng(bldgMap['ui/icon_faction_human'].outPath, 940, 36, 90, 90);
  await placePng(bldgMap['ui/icon_faction_celestial'].outPath, 1044, 36, 90, 90);
  await placePng(bldgMap['ui/icon_faction_beast'].outPath, 1148, 36, 90, 90);
  await placePng(unitMap['icons/unit_w_infantry'].outPath, 950, 148, 64, 64);
  await placePng(unitMap['icons/unit_b_infantry'].outPath, 1030, 148, 64, 64);
  await placePng(unitMap['icons/unit_k_infantry'].outPath, 1110, 148, 64, 64);

  // Row 2: 4 Normal Castles + 4 Damaged Ruins
  const castleKeys = [
    ['buildings/castle_green', 'buildings/castle_green_raze'],
    ['buildings/castle_blue', 'buildings/castle_blue_raze'],
    ['buildings/castle_red', 'buildings/castle_red_raze'],
    ['buildings/castle_purple', 'buildings/castle_purple_raze'],
  ];
  for (let i = 0; i < castleKeys.length; i++) {
    const cx = 42 + i * 345;
    await placePng(bldgMap[castleKeys[i][0]].outPath, cx, 286, 162, 162);
    await placePng(bldgMap[castleKeys[i][1]].outPath, cx + 168, 286, 162, 162);
  }

  // Row 3: Infantry Strips (w_infantry, b_infantry, k_infantry: left_go, left_attack, die)
  const stripGroups = ['units/w_infantry', 'units/b_infantry', 'units/k_infantry'];
  for (let r = 0; r < stripGroups.length; r++) {
    const yBase = 572 + r * 122;
    const pfx = stripGroups[r];
    await placePng(unitMap[`${pfx}/left_go`].outPath, 36, yBase, 440, 56);
    await placePng(unitMap[`${pfx}/left_attack`].outPath, 496, yBase, 440, 56);
    await placePng(unitMap[`${pfx}/die`].outPath, 956, yBase, 440, 56);
    await placePng(unitMap[`${pfx}/up_go`].outPath, 36, yBase + 60, 440, 52);
    await placePng(unitMap[`${pfx}/down_attack`].outPath, 496, yBase + 60, 440, 52);
  }

  const outSheet = path.join(ROOT, 'docs', 'shanhai', 'phase-b-sprites-preview.png');
  await sharp({
    create: { width: W, height: H, channels: 4, background: { r: 43, g: 46, b: 54, alpha: 255 } },
  })
    .composite(composites)
    .png({ compressionLevel: 9 })
    .toFile(outSheet);

  // Batch-2 Contact Sheet (Skill icons, Stele, Secondary Buildings, World Map, 3 New Units)
  const b2Labels = Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${W}" height="${H}" fill="#2b2e36"/>
      <rect x="20" y="20" width="1400" height="220" rx="10" fill="#1e2026" stroke="#4c515f"/>
      <rect x="20" y="256" width="1400" height="280" rx="10" fill="#1e2026" stroke="#4c515f"/>
      <rect x="20" y="552" width="1400" height="388" rx="10" fill="#1e2026" stroke="#4c515f"/>
    </svg>`,
  );
  const b2Comp = [{ input: b2Labels, left: 0, top: 0 }];
  const placeB2 = async (filePath, x, y, fitW, fitH) => {
    const buf = await sharp(filePath)
      .resize({ width: fitW, height: fitH, fit: 'inside', kernel: 'lanczos3' })
      .png()
      .toBuffer();
    b2Comp.push({ input: buf, left: x, top: y });
  };

  // Row 1: 4 Skill icons + Build Stele + 3 New Unit Portraits + Jiuzhou World Map thumb
  await placeB2(uiMap['icons/spell_lords_judgement'].outPath, 42, 48, 84, 84);
  await placeB2(uiMap['icons/spell_banner_consecration'].outPath, 140, 48, 84, 84);
  await placeB2(uiMap['icons/spell_banner_heroism'].outPath, 238, 48, 84, 84);
  await placeB2(uiMap['icons/spell_sign_of_advent'].outPath, 336, 48, 84, 84);
  await placeB2(uiMap['map/build_site'].outPath, 448, 42, 72, 102);
  await placeB2(unitMap['icons/unit_w_archers'].outPath, 550, 48, 84, 84);
  await placeB2(unitMap['icons/unit_e_infantry'].outPath, 650, 48, 84, 84);
  await placeB2(unitMap['icons/unit_e_archers'].outPath, 750, 48, 84, 84);
  await placeB2(path.join(BUNDLES_DIR, 'bundle_gameplay', 'art', 'terrain', 'map_jiuzhou_world_base.png'), 1120, 34, 260, 196);

  // Row 2: Secondary Buildings (town_green, town_green_raze, village_green, mine_green, town_purple, town_purple_raze, village_purple, mine_purple)
  const secBldgOrder = [
    ['buildings/town_green', 38, 282, 168, 130],
    ['buildings/town_green_raze', 218, 282, 168, 130],
    ['buildings/village_green', 402, 298, 128, 108],
    ['buildings/mine_green', 544, 298, 128, 108],
    ['buildings/town_purple', 704, 276, 174, 144],
    ['buildings/town_purple_raze', 888, 276, 174, 144],
    ['buildings/village_purple', 1078, 298, 128, 108],
    ['buildings/mine_purple', 1220, 298, 128, 108],
  ];
  for (const [k, x, y, fw, fh] of secBldgOrder) {
    await placeB2(bldgMap[k].outPath, x, y, fw, fh);
  }

  // Row 3: 3 New Unit Strips (w_archers, e_infantry, e_archers)
  const b2Units = ['units/w_archers', 'units/e_infantry', 'units/e_archers'];
  for (let r = 0; r < b2Units.length; r++) {
    const yBase = 568 + r * 124;
    const pfx = b2Units[r];
    await placeB2(unitMap[`${pfx}/left_go`].outPath, 36, yBase, 440, 56);
    await placeB2(unitMap[`${pfx}/left_attack`].outPath, 496, yBase, 440, 56);
    await placeB2(unitMap[`${pfx}/die`].outPath, 956, yBase, 440, 56);
    await placeB2(unitMap[`${pfx}/up_attack`].outPath, 36, yBase + 60, 440, 52);
    await placeB2(unitMap[`${pfx}/down_attack`].outPath, 496, yBase + 60, 440, 52);
  }

  const outSheet2 = path.join(ROOT, 'docs', 'shanhai', 'phase-b2-sprites-preview.png');
  await sharp({
    create: { width: W, height: H, channels: 4, background: { r: 43, g: 46, b: 54, alpha: 255 } },
  })
    .composite(b2Comp)
    .png({ compressionLevel: 9 })
    .toFile(outSheet2);

  return outSheet2;
}

function updateAssetManifest({ uiMap, bldgMap, unitMap, mapMap }) {
  const origTs = fs.readFileSync(MANIFEST_PATH, 'utf8');
  const spriteMatch = origTs.match(/export const SPRITE_MANIFEST[^=]*=\s*(\{[\s\S]*?\n\});/);
  const audioMatch = origTs.match(/export const AUDIO_MANIFEST[^=]*=\s*(\{[\s\S]*?\n\});/);
  if (!spriteMatch || !audioMatch) {
    throw new Error('Could not parse SPRITE_MANIFEST or AUDIO_MANIFEST from AssetManifest.ts');
  }

  const sprites = JSON.parse(spriteMatch[1]);
  const audioManifest = JSON.parse(audioMatch[1]);

  // Remove legacy third-party brand logo
  delete sprites['ui/iriysoft_logo'];

  const toRelPath = (absPath, bundle) => {
    const base = bundle === 'resources' ? RESOURCES_DIR : path.join(BUNDLES_DIR, bundle);
    return path.relative(base, absPath).replace(/\\/g, '/').replace(/\.png$/, '');
  };

  for (const [key, info] of Object.entries(uiMap)) {
    const bundle = 'resources';
    sprites[key] = {
      path: toRelPath(info.outPath, bundle),
      width: info.width,
      height: info.height,
      frameWidth: info.width,
      frameHeight: info.height,
      frameCount: 1,
      anchorX: info.anchorX,
      anchorY: info.anchorY,
      bundle,
    };
  }

  for (const [key, info] of Object.entries(bldgMap)) {
    const bundle = key.startsWith('ui/') ? 'resources' : 'bundle_gameplay';
    sprites[key] = {
      path: toRelPath(info.outPath, bundle),
      width: info.width,
      height: info.height,
      frameWidth: info.width,
      frameHeight: info.height,
      frameCount: 1,
      anchorX: info.anchorX,
      anchorY: info.anchorY,
      bundle,
    };
  }

  for (const [key, info] of Object.entries(unitMap)) {
    const isIcon = key.startsWith('icons/');
    const bundle = isIcon ? 'resources' : 'bundle_gameplay';
    sprites[key] = {
      path: toRelPath(info.outPath, bundle),
      width: info.width,
      height: info.height,
      frameWidth: info.frameWidth ?? info.width,
      frameHeight: info.frameHeight ?? info.height,
      frameCount: info.frameCount ?? 1,
      anchorX: info.anchorX,
      anchorY: info.anchorY,
      ...(info.flipX ? { flipX: true } : {}),
      bundle,
    };
  }

  for (const [key, info] of Object.entries(mapMap)) {
    sprites[key] = {
      path: info.relPath,
      width: info.width,
      height: info.height,
      frameWidth: info.width,
      frameHeight: info.height,
      frameCount: 1,
      anchorX: info.anchorX,
      anchorY: info.anchorY,
      flashBounds: info.flashBounds,
      bundle: info.bundle,
    };
  }

  const outTs = [
    '// Managed by scripts/process-phase-b-art.mjs and scripts/optimize-and-bundle-assets.mjs',
    "export type AssetBundleName = 'resources' | 'bundle_gameplay' | 'bundle_westaria' | 'bundle_khaganate' | 'bundle_cult' | 'bundle_shared_maps';",
    '',
    'export interface SpriteAssetEntry {',
    '  path: string;',
    '  bundle?: AssetBundleName;',
    '  width: number;',
    '  height: number;',
    '  frameWidth: number;',
    '  frameHeight: number;',
    '  frameCount: number;',
    '  anchorX: number;',
    '  anchorY: number;',
    '  flipX?: boolean;',
    '  flashBounds?: { xmin: number; xmax: number; ymin: number; ymax: number; width: number; height: number };',
    '}',
    '',
    `export const SPRITE_MANIFEST: Record<string, SpriteAssetEntry> = ${JSON.stringify(sprites, null, 2)};`,
    '',
    `export const AUDIO_MANIFEST: Record<string, string> = ${JSON.stringify(audioManifest, null, 2)};`,
    '',
  ].join('\n');
  fs.writeFileSync(MANIFEST_PATH, outTs, 'utf8');
  return Object.keys(sprites).length;
}

async function main() {
  const uiMap = await generateUiKit();
  const bldgMap = await generateBuildingsAndEmblems();
  const unitMap = await generateInfantryUnits();
  const mapMap = await generateLevel1BattlefieldMap();

  // Delete legacy iriysoft_logo.png & .meta
  for (const f of [
    path.join(RESOURCES_DIR, 'textures', 'ui', 'iriysoft_logo.png'),
    path.join(RESOURCES_DIR, 'textures', 'ui', 'iriysoft_logo.png.meta'),
  ]) {
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }

  const totalEntries = updateAssetManifest({ uiMap, bldgMap, unitMap, mapMap });
  const sheetPath = await generateContactSheet(uiMap, bldgMap, unitMap);

  const uiBytes = Object.values(uiMap).reduce((s, v) => s + v.bytes, 0) +
    ['ui/icon_faction_human', 'ui/icon_faction_celestial', 'ui/icon_faction_beast'].reduce((s, k) => s + bldgMap[k].bytes, 0) +
    Object.entries(unitMap).filter(([k]) => k.startsWith('icons/')).reduce((s, [, v]) => s + v.bytes, 0);

  console.log(
    `PHASE_B_ART_OK uiFiles=${Object.keys(uiMap).length + 6} buildings=${Object.keys(bldgMap).length - 3} unitKeys=${Object.keys(unitMap).filter((k) => !k.startsWith('icons/')).length} maps=${Object.keys(mapMap).length} addedResourcesKB=${(uiBytes / 1024).toFixed(1)} manifestEntries=${totalEntries} preview=${path.relative(ROOT, sheetPath)}`,
  );
}

main().catch((err) => {
  console.error(err?.stack ?? err);
  process.exit(1);
});
