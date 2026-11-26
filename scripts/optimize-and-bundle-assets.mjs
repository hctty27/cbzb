#!/usr/bin/env node
/**
 * Zero-loss asset optimization & Cocos 4 Asset Bundle restructuring:
 * 1. Verifies 100% pixel-exact RGBA alpha-over diffs for Rivadis campaign maps (frames 2..27).
 * 2. Moves shared gameplay sprites (units, vfx, buildings) + campaign_map_base to bundle_gameplay.
 * 3. Deduplicates 6 identical battle map pairs via MD5 into bundle_shared_maps.
 * 4. Distributes unique battle maps & Rivadis diff layers into bundle_westaria / bundle_khaganate / bundle_cult.
 * 5. Keeps resources/ strictly lightweight (< 4 MB: UI, icons, audio, chest, build_site).
 * 6. Emits Cocos 4 directory .meta files with bundleConfigID="cdn_remote" and updates AssetManifest.ts.
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

const ASSETS_DIR = path.join(ROOT, 'game', 'assets');
const RESOURCES_DIR = path.join(ASSETS_DIR, 'resources');
const RES_TEX_DIR = path.join(RESOURCES_DIR, 'textures');
const RES_MAP_DIR = path.join(RES_TEX_DIR, 'map');
const BUNDLES_DIR = path.join(ASSETS_DIR, 'bundles');
const MANIFEST_PATH = path.join(ASSETS_DIR, 'scripts', 'data', 'AssetManifest.ts');

const SHARED_DUPLICATE_PAIRS = [
  ['level23_bg', 'level4_bg'],
  ['level24_bg', 'level7_bg'],
  ['level27_bg', 'level14_bg'],
  ['level26_bg', 'level15_bg'],
  ['level25_bg', 'level16_bg'],
  ['level28_bg', 'level18_bg'],
];

const UNIQUE_CAMPAIGN_MAPS = {
  bundle_westaria: [1, 2, 3, 5, 6, 8],
  bundle_khaganate: [11, 12, 13, 17],
  bundle_cult: [21, 22],
};

function deterministicUuid(seed) {
  const buf = crypto.createHash('sha256').update(seed).digest().subarray(0, 16);
  buf[6] = (buf[6] & 0x0f) | 0x40;
  buf[8] = (buf[8] & 0x3f) | 0x80;
  const h = buf.toString('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

function writeDirMeta(dirPath, userData = {}) {
  const rel = path.relative(ASSETS_DIR, dirPath).replace(/\\/g, '/');
  const metaPath = `${dirPath}.meta`;
  if (fs.existsSync(metaPath) && Object.keys(userData).length === 0) {
    return;
  }
  const meta = {
    ver: '1.2.0',
    importer: 'directory',
    imported: true,
    uuid: deterministicUuid(`cbzb-dir:${rel}`),
    files: [],
    subMetas: {},
    userData,
  };
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n', 'utf8');
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function md5File(filePath) {
  return crypto.createHash('md5').update(fs.readFileSync(filePath)).digest('hex');
}

function moveDirWithMeta(srcDir, dstDir) {
  if (!fs.existsSync(srcDir)) {
    if (fs.existsSync(dstDir)) {
      console.log(`Already moved: ${path.relative(ROOT, dstDir)}`);
      return;
    }
    throw new Error(`Missing source directory: ${srcDir}`);
  }
  ensureDir(path.dirname(dstDir));
  fs.renameSync(srcDir, dstDir);
  const srcMeta = `${srcDir}.meta`;
  const dstMeta = `${dstDir}.meta`;
  if (fs.existsSync(srcMeta)) {
    fs.renameSync(srcMeta, dstMeta);
  }
}

function moveFileWithMeta(srcFile, dstFile) {
  if (!fs.existsSync(srcFile)) {
    if (fs.existsSync(dstFile)) {
      return;
    }
    throw new Error(`Missing source file: ${srcFile}`);
  }
  ensureDir(path.dirname(dstFile));
  fs.renameSync(srcFile, dstFile);
  const srcMeta = `${srcFile}.meta`;
  const dstMeta = `${dstFile}.meta`;
  if (fs.existsSync(srcMeta)) {
    fs.renameSync(srcMeta, dstMeta);
  }
}

function deleteFileWithMeta(filePath) {
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  if (fs.existsSync(`${filePath}.meta`)) fs.unlinkSync(`${filePath}.meta`);
}

function dirStats(dirPath) {
  let bytes = 0;
  let files = 0;
  if (!fs.existsSync(dirPath)) return { bytes, files };
  for (const e of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const p = path.join(dirPath, e.name);
    if (e.isDirectory()) {
      const sub = dirStats(p);
      bytes += sub.bytes;
      files += sub.files;
    } else {
      bytes += fs.statSync(p).size;
      files++;
    }
  }
  return { bytes, files };
}

function bundleForDiffFrame(frame) {
  if (frame >= 2 && frame <= 9) return 'bundle_westaria';
  if (frame >= 10 && frame <= 18) return 'bundle_khaganate';
  return 'bundle_cult';
}

async function main() {
  const beforeRes = dirStats(RESOURCES_DIR);
  console.log(`Before resources/: ${(beforeRes.bytes / 1024 / 1024).toFixed(2)} MB (${beforeRes.files} files)`);

  // 1. Verify MD5 identity of the 6 battle map duplicate pairs before deleting anything
  for (const [dupName, canonName] of SHARED_DUPLICATE_PAIRS) {
    const dupPath = path.join(RES_MAP_DIR, `${dupName}.png`);
    const canonPath = path.join(RES_MAP_DIR, `${canonName}.png`);
    const movedCanonPath = path.join(BUNDLES_DIR, 'bundle_shared_maps', 'maps', `${canonName}.png`);
    if (fs.existsSync(dupPath) && fs.existsSync(canonPath)) {
      const h1 = md5File(dupPath);
      const h2 = md5File(canonPath);
      if (h1 !== h2) {
        throw new Error(`MD5 mismatch between ${dupName} (${h1}) and ${canonName} (${h2})`);
      }
      console.log(`Verified MD5 identical: ${dupName} == ${canonName} (${h1})`);
    } else if (fs.existsSync(movedCanonPath) && !fs.existsSync(dupPath)) {
      console.log(`Verified already deduplicated: ${dupName} -> ${canonName}`);
    } else {
      throw new Error(`Unexpected state for duplicate pair ${dupName} / ${canonName}`);
    }
  }

  // 2. Verify & build pixel-exact Rivadis campaign map diffs (frames 2..27) BEFORE deleting originals
  const baseSourcePath = fs.existsSync(path.join(RES_MAP_DIR, 'campaign_map_1.png'))
    ? path.join(RES_MAP_DIR, 'campaign_map_1.png')
    : path.join(BUNDLES_DIR, 'bundle_gameplay', 'maps', 'campaign_map_base.png');
  if (!fs.existsSync(baseSourcePath)) {
    throw new Error(`Missing campaign_map_1.png / campaign_map_base.png`);
  }

  const baseRaw = await sharp(baseSourcePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const bw = baseRaw.info.width;
  const bh = baseRaw.info.height;
  const basePixels = baseRaw.data;

  const baseOutDir = path.join(BUNDLES_DIR, 'bundle_gameplay', 'maps');
  ensureDir(baseOutDir);
  const baseOutPath = path.join(baseOutDir, 'campaign_map_base.png');
  await sharp(basePixels, { raw: { width: bw, height: bh, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(baseOutPath);

  let totalDiffBytes = 0;
  for (let frame = 2; frame <= 27; frame++) {
    const srcFrame = path.join(RES_MAP_DIR, `campaign_map_${frame}.png`);
    const targetBundle = bundleForDiffFrame(frame);
    const diffOutDir = path.join(BUNDLES_DIR, targetBundle, 'maps');
    ensureDir(diffOutDir);
    const diffOutPath = path.join(diffOutDir, `campaign_map_diff_${frame}.png`);

    if (!fs.existsSync(srcFrame)) {
      if (fs.existsSync(diffOutPath)) {
        totalDiffBytes += fs.statSync(diffOutPath).size;
        continue;
      }
      throw new Error(`Missing ${srcFrame}`);
    }

    const frameRaw = await sharp(srcFrame).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    if (frameRaw.info.width !== bw || frameRaw.info.height !== bh) {
      throw new Error(`Dimension mismatch on campaign_map_${frame}.png: ${frameRaw.info.width}x${frameRaw.info.height}`);
    }
    const fp = frameRaw.data;
    const diffBuf = Buffer.alloc(fp.length);
    let changedPixels = 0;

    for (let i = 0; i < fp.length; i += 4) {
      const r = fp[i], g = fp[i + 1], b = fp[i + 2], a = fp[i + 3];
      const br = basePixels[i], bg = basePixels[i + 1], bb = basePixels[i + 2], ba = basePixels[i + 3];
      if (r === br && g === bg && b === bb && a === ba) {
        continue; // stays (0,0,0,0)
      }
      if (a < 255) {
        throw new Error(`Frame ${frame} changed pixel at byte ${i} has non-opaque alpha=${a} (base=${ba}); cannot do exact alpha-over diff.`);
      }
      diffBuf[i] = r;
      diffBuf[i + 1] = g;
      diffBuf[i + 2] = b;
      diffBuf[i + 3] = a;
      changedPixels++;
    }

    await sharp(diffBuf, { raw: { width: bw, height: bh, channels: 4 } })
      .png({ compressionLevel: 9 })
      .toFile(diffOutPath);

    // Lossless round-trip check: alpha-over(diff, base) must equal frame pixels with maxDiff === 0
    const decodedDiff = await sharp(diffOutPath).ensureAlpha().raw().toBuffer();
    let maxDiff = 0;
    for (let i = 0; i < fp.length; i += 4) {
      const da = decodedDiff[i + 3];
      const outR = da === 255 ? decodedDiff[i] : basePixels[i];
      const outG = da === 255 ? decodedDiff[i + 1] : basePixels[i + 1];
      const outB = da === 255 ? decodedDiff[i + 2] : basePixels[i + 2];
      const outA = da === 255 ? 255 : basePixels[i + 3];
      const d = Math.max(
        Math.abs(outR - fp[i]),
        Math.abs(outG - fp[i + 1]),
        Math.abs(outB - fp[i + 2]),
        Math.abs(outA - fp[i + 3]),
      );
      if (d > maxDiff) maxDiff = d;
    }
    if (maxDiff !== 0) {
      throw new Error(`Round-trip verification failed for frame ${frame}: maxDiff=${maxDiff}`);
    }
    const sz = fs.statSync(diffOutPath).size;
    totalDiffBytes += sz;
    if (frame <= 4 || frame === 10 || frame === 19 || frame === 27) {
      console.log(`Verified campaign_map_diff_${frame}.png (${targetBundle}): changedPx=${changedPixels}, size=${(sz / 1024).toFixed(1)}KB, maxDiff=0`);
    }
  }
  console.log(`All 26 Rivadis diff overlays verified lossless (maxDiff=0), total diff size=${(totalDiffBytes / 1024 / 1024).toFixed(2)} MB`);

  // Delete original campaign_map.png and campaign_map_1..27.png (+ .meta) now that diffs are verified
  deleteFileWithMeta(path.join(RES_MAP_DIR, 'campaign_map.png'));
  for (let frame = 1; frame <= 27; frame++) {
    deleteFileWithMeta(path.join(RES_MAP_DIR, `campaign_map_${frame}.png`));
  }

  // 3. Move shared gameplay dirs (units, vfx, buildings) into bundle_gameplay/textures/
  moveDirWithMeta(path.join(RES_TEX_DIR, 'units'), path.join(BUNDLES_DIR, 'bundle_gameplay', 'textures', 'units'));
  moveDirWithMeta(path.join(RES_TEX_DIR, 'vfx'), path.join(BUNDLES_DIR, 'bundle_gameplay', 'textures', 'vfx'));
  moveDirWithMeta(path.join(RES_TEX_DIR, 'buildings'), path.join(BUNDLES_DIR, 'bundle_gameplay', 'textures', 'buildings'));

  // 4. Deduplicate & distribute battle maps
  for (const [dupName, canonName] of SHARED_DUPLICATE_PAIRS) {
    deleteFileWithMeta(path.join(RES_MAP_DIR, `${dupName}.png`));
    moveFileWithMeta(
      path.join(RES_MAP_DIR, `${canonName}.png`),
      path.join(BUNDLES_DIR, 'bundle_shared_maps', 'maps', `${canonName}.png`),
    );
  }
  for (const [bundleName, levelIds] of Object.entries(UNIQUE_CAMPAIGN_MAPS)) {
    for (const id of levelIds) {
      moveFileWithMeta(
        path.join(RES_MAP_DIR, `level${id}_bg.png`),
        path.join(BUNDLES_DIR, bundleName, 'maps', `level${id}_bg.png`),
      );
    }
  }

  // 5. Write Cocos 4 directory .meta files for bundles/ and all 5 bundle roots + internal subdirs
  writeDirMeta(BUNDLES_DIR, {});
  const bundleSpecs = [
    { name: 'bundle_gameplay', priority: 6 },
    { name: 'bundle_westaria', priority: 5 },
    { name: 'bundle_khaganate', priority: 5 },
    { name: 'bundle_cult', priority: 5 },
    { name: 'bundle_shared_maps', priority: 5 },
  ];
  for (const spec of bundleSpecs) {
    const bDir = path.join(BUNDLES_DIR, spec.name);
    ensureDir(bDir);
    writeDirMeta(bDir, {
      isBundle: true,
      bundleConfigID: 'cdn_remote',
      bundleName: spec.name,
      priority: spec.priority,
    });
    for (const sub of ['textures', 'maps', 'levels']) {
      const subDir = path.join(bDir, sub);
      if (fs.existsSync(subDir)) {
        writeDirMeta(subDir, {});
      }
    }
  }

  // 6. Rewrite AssetManifest.ts with AssetBundleName + bundle field + updated paths
  const origTs = fs.readFileSync(MANIFEST_PATH, 'utf8');
  const spriteMatch = origTs.match(/export const SPRITE_MANIFEST[^=]*=\s*(\{[\s\S]*?\n\});/);
  const audioMatch = origTs.match(/export const AUDIO_MANIFEST[^=]*=\s*(\{[\s\S]*?\n\});/);
  if (!spriteMatch || !audioMatch) {
    throw new Error('Could not parse SPRITE_MANIFEST or AUDIO_MANIFEST from AssetManifest.ts');
  }
  const oldSprites = JSON.parse(spriteMatch[1]);
  const audioManifest = JSON.parse(audioMatch[1]);

  const sharedAliasMap = new Map(SHARED_DUPLICATE_PAIRS.map(([dup, canon]) => [`map/${dup}`, `map/${canon}`]));
  const uniqueBundleByKey = new Map();
  for (const [bName, ids] of Object.entries(UNIQUE_CAMPAIGN_MAPS)) {
    for (const id of ids) uniqueBundleByKey.set(`map/level${id}_bg`, bName);
  }
  for (const [, canon] of SHARED_DUPLICATE_PAIRS) {
    uniqueBundleByKey.set(`map/${canon}`, 'bundle_shared_maps');
  }

  const newSprites = {};
  let baseMapDims = { width: bw, height: bh, frameWidth: bw, frameHeight: bh, frameCount: 1, anchorX: 0.5, anchorY: 0.5 };
  if (oldSprites['map/campaign_map_1']) {
    baseMapDims = { ...oldSprites['map/campaign_map_1'] };
  }

  for (const [key, entry] of Object.entries(oldSprites)) {
    if (key === 'map/campaign_map' || /^map\/campaign_map_\d+$/.test(key)) {
      continue;
    }
    if (key.startsWith('units/') || key.startsWith('vfx/') || key.startsWith('buildings/')) {
      newSprites[key] = { ...entry, bundle: 'bundle_gameplay' };
      continue;
    }
    if (key.startsWith('ui/') || key.startsWith('icons/') || key === 'map/build_site' || key === 'map/chest') {
      newSprites[key] = { ...entry, bundle: 'resources' };
      continue;
    }
    if (sharedAliasMap.has(key)) {
      const canonKey = sharedAliasMap.get(key);
      const canonName = canonKey.slice(4);
      newSprites[key] = {
        ...entry,
        bundle: 'bundle_shared_maps',
        path: `maps/${canonName}`,
      };
      continue;
    }
    if (uniqueBundleByKey.has(key)) {
      const imgName = key.slice(4);
      newSprites[key] = {
        ...entry,
        bundle: uniqueBundleByKey.get(key),
        path: `maps/${imgName}`,
      };
      continue;
    }
    newSprites[key] = { ...entry, bundle: 'resources' };
  }

  // Add Rivadis campaign base map + alias + 26 lossless diff overlays
  newSprites['map/campaign_map_base'] = {
    path: 'maps/campaign_map_base',
    bundle: 'bundle_gameplay',
    width: baseMapDims.width,
    height: baseMapDims.height,
    frameWidth: baseMapDims.width,
    frameHeight: baseMapDims.height,
    frameCount: 1,
    anchorX: 0.5,
    anchorY: 0.5,
  };
  newSprites['map/campaign_map_1'] = {
    ...newSprites['map/campaign_map_base'],
  };
  for (let frame = 2; frame <= 27; frame++) {
    newSprites[`map/campaign_map_diff_${frame}`] = {
      path: `maps/campaign_map_diff_${frame}`,
      bundle: bundleForDiffFrame(frame),
      width: bw,
      height: bh,
      frameWidth: bw,
      frameHeight: bh,
      frameCount: 1,
      anchorX: 0.5,
      anchorY: 0.5,
    };
  }

  const outTs = [
    '// Auto-generated by scripts/export-assets.py and organized into bundles by scripts/optimize-and-bundle-assets.mjs',
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
    '  flashBounds?: { xmin: number; xmax: number; ymin: number; ymax: number; width: number; height: number };',
    '}',
    '',
    `export const SPRITE_MANIFEST: Record<string, SpriteAssetEntry> = ${JSON.stringify(newSprites, null, 2)};`,
    '',
    `export const AUDIO_MANIFEST: Record<string, string> = ${JSON.stringify(audioManifest, null, 2)};`,
    '',
  ].join('\n');
  fs.writeFileSync(MANIFEST_PATH, outTs, 'utf8');
  console.log(`Updated ${path.relative(ROOT, MANIFEST_PATH)} (${Object.keys(newSprites).length} sprite entries)`);

  // 7. Report final sizes
  console.log('\n=== Bundle Size Summary ===');
  const afterRes = dirStats(RESOURCES_DIR);
  console.log(`resources (local main): ${(afterRes.bytes / 1024 / 1024).toFixed(2)} MB (${afterRes.files} files)`);
  let totalAll = afterRes.bytes;
  for (const spec of bundleSpecs) {
    const s = dirStats(path.join(BUNDLES_DIR, spec.name));
    totalAll += s.bytes;
    console.log(`${spec.name}: ${(s.bytes / 1024 / 1024).toFixed(2)} MB (${s.files} files)`);
  }
  console.log(`Total source assets: ${(beforeRes.bytes / 1024 / 1024).toFixed(2)} MB -> ${(totalAll / 1024 / 1024).toFixed(2)} MB (0% quality loss)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
