import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const GAME_DIR = path.join(ROOT, 'game');
const GAME_TEMP_DIR = path.join(GAME_DIR, 'temp');

const VALID_TARGETS = ['web-desktop', 'web-mobile'];
const EXPECTED_REMOTE_BUNDLES = [
  'bundle_gameplay',
  'bundle_westaria',
  'bundle_khaganate',
  'bundle_cult',
  'bundle_shared_maps',
];
const MAX_RESOURCES_BYTES = 4 * 1024 * 1024;

function parseArgs(argv) {
  const opts = {
    target: 'all',
    cdnUrl: '',
    outDir: 'dist-release',
    skipChecks: false,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--target') {
      opts.target = argv[++i] ?? '';
    } else if (arg.startsWith('--target=')) {
      opts.target = arg.slice('--target='.length);
    } else if (arg === '--cdn-url') {
      opts.cdnUrl = argv[++i] ?? '';
    } else if (arg.startsWith('--cdn-url=')) {
      opts.cdnUrl = arg.slice('--cdn-url='.length);
    } else if (arg === '--out-dir') {
      opts.outDir = argv[++i] ?? '';
    } else if (arg.startsWith('--out-dir=')) {
      opts.outDir = arg.slice('--out-dir='.length);
    } else if (arg === '--skip-checks') {
      opts.skipChecks = true;
    } else if (arg === '--dry-run') {
      opts.dryRun = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (opts.target !== 'all' && !VALID_TARGETS.includes(opts.target)) {
    throw new Error(`Invalid --target "${opts.target}". Expected one of: web-desktop, web-mobile, all`);
  }

  opts.cdnUrl = opts.cdnUrl.trim().replace(/\/+$/, '');
  if (opts.cdnUrl) {
    let parsed;
    try {
      parsed = new URL(opts.cdnUrl);
    } catch {
      throw new Error(`Invalid --cdn-url "${opts.cdnUrl}". Must be a valid http(s) URL.`);
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error(`Invalid --cdn-url protocol "${parsed.protocol}". Expected http: or https:.`);
    }
  }

  if (!opts.outDir) {
    throw new Error('--out-dir must not be empty');
  }
  return opts;
}

function resolveTargets(target) {
  return target === 'all' ? [...VALID_TARGETS] : [target];
}

function getGitHeadShort() {
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function dirStats(dir) {
  let bytes = 0;
  let pngCount = 0;
  if (!fs.existsSync(dir)) return { bytes, pngCount };
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = dirStats(full);
      bytes += sub.bytes;
      pngCount += sub.pngCount;
    } else if (entry.isFile()) {
      bytes += fs.statSync(full).size;
      if (entry.name.toLowerCase().endsWith('.png')) pngCount++;
    }
  }
  return { bytes, pngCount };
}

function runNodeScript(scriptPath, args = []) {
  execFileSync(process.execPath, [scriptPath, ...args], { cwd: ROOT, stdio: 'inherit' });
}

function findHashedFile(dir, prefix, ext) {
  if (!fs.existsSync(dir)) return null;
  const re = new RegExp(`^${prefix}\\.([a-f0-9]+)\\.${ext}$`, 'i');
  for (const name of fs.readdirSync(dir)) {
    const m = name.match(re);
    if (m) return { name, hash: m[1] };
  }
  return null;
}

function md5Short(...buffers) {
  const h = crypto.createHash('md5');
  for (const b of buffers) h.update(b);
  return h.digest('hex').slice(0, 5);
}

/**
 * Cocos CLI hashes `bundleVers.main` from config JSON only, keeping `assets/main/index.<hash>.js`
 * identical across script-only changes. Re-hash from `config + index.js` and propagate up through
 * settings -> application -> index -> index.html so browser/CDN caches always bust cleanly.
 */
function rehashMainBundle(siteDir) {
  const mainDir = path.join(siteDir, 'assets', 'main');
  const mainCfg = findHashedFile(mainDir, 'config', 'json');
  const mainJs = findHashedFile(mainDir, 'index', 'js');
  if (!mainCfg || !mainJs || mainCfg.hash !== mainJs.hash) return;

  const oldMain = mainCfg.hash;
  const cfgPath = path.join(mainDir, mainCfg.name);
  const jsPath = path.join(mainDir, mainJs.name);
  const newMain = md5Short(fs.readFileSync(cfgPath), fs.readFileSync(jsPath));
  if (newMain === oldMain) return;

  fs.renameSync(cfgPath, path.join(mainDir, `config.${newMain}.json`));
  fs.renameSync(jsPath, path.join(mainDir, `index.${newMain}.js`));

  const srcDir = path.join(siteDir, 'src');
  const settingsFile = findHashedFile(srcDir, 'settings', 'json');
  if (!settingsFile) return;

  const oldSettingsPath = path.join(srcDir, settingsFile.name);
  const settingsRaw = fs.readFileSync(oldSettingsPath, 'utf8');
  const updatedSettings = settingsRaw.replaceAll(`"main":"${oldMain}"`, `"main":"${newMain}"`);
  const newSettingsHash = md5Short(Buffer.from(updatedSettings, 'utf8'));
  const newSettingsName = `settings.${newSettingsHash}.json`;
  fs.writeFileSync(path.join(srcDir, newSettingsName), updatedSettings, 'utf8');
  if (newSettingsName !== settingsFile.name) {
    fs.unlinkSync(oldSettingsPath);
  }

  const appFile = findHashedFile(siteDir, 'application', 'js');
  let appReplace = null;
  if (appFile) {
    const oldAppPath = path.join(siteDir, appFile.name);
    const appRaw = fs.readFileSync(oldAppPath, 'utf8');
    const updatedApp = appRaw.replaceAll(`src/${settingsFile.name}`, `src/${newSettingsName}`);
    const newAppHash = md5Short(Buffer.from(updatedApp, 'utf8'));
    const newAppName = `application.${newAppHash}.js`;
    fs.writeFileSync(path.join(siteDir, newAppName), updatedApp, 'utf8');
    if (newAppName !== appFile.name) {
      fs.unlinkSync(oldAppPath);
    }
    appReplace = { oldName: appFile.name, newName: newAppName };
  }

  const idxFile = findHashedFile(siteDir, 'index', 'js');
  let idxReplace = null;
  if (idxFile && appReplace) {
    const oldIdxPath = path.join(siteDir, idxFile.name);
    const idxRaw = fs.readFileSync(oldIdxPath, 'utf8');
    const updatedIdx = idxRaw.replaceAll(appReplace.oldName, appReplace.newName);
    const newIdxHash = md5Short(Buffer.from(updatedIdx, 'utf8'));
    const newIdxName = `index.${newIdxHash}.js`;
    fs.writeFileSync(path.join(siteDir, newIdxName), updatedIdx, 'utf8');
    if (newIdxName !== idxFile.name) {
      fs.unlinkSync(oldIdxPath);
    }
    idxReplace = { oldName: idxFile.name, newName: newIdxName };
  }

  const htmlPath = path.join(siteDir, 'index.html');
  if (fs.existsSync(htmlPath)) {
    let html = fs.readFileSync(htmlPath, 'utf8');
    if (idxReplace) html = html.replaceAll(idxReplace.oldName, idxReplace.newName);
    if (appReplace) html = html.replaceAll(appReplace.oldName, appReplace.newName);
    fs.writeFileSync(htmlPath, html, 'utf8');
  }
}

function verifyAndStageTarget(target, cdnUrl, buildOutDir, absOutDir) {
  const resourcesOut = path.join(buildOutDir, 'assets', 'resources');
  if (!fs.existsSync(resourcesOut)) {
    throw new Error(`Missing built resources directory for ${target}: ${resourcesOut}`);
  }
  const resourcesStat = dirStats(resourcesOut);
  if (resourcesStat.bytes >= MAX_RESOURCES_BYTES) {
    throw new Error(
      `Built resources for ${target} exceeded 4 MB budget (${(resourcesStat.bytes / (1024 * 1024)).toFixed(3)} MB)`,
    );
  }

  const remoteDir = path.join(buildOutDir, 'remote');
  if (!fs.existsSync(remoteDir)) {
    throw new Error(`Missing built remote/ directory for ${target}: ${remoteDir}`);
  }

  const verifiedBundles = {};
  for (const bundleName of EXPECTED_REMOTE_BUNDLES) {
    const bDir = path.join(remoteDir, bundleName);
    if (!fs.existsSync(bDir)) {
      throw new Error(`Missing remote bundle "${bundleName}" for ${target} at ${bDir}`);
    }
    const entries = fs.readdirSync(bDir);
    const configFile = entries.find((f) => /^config(\.[a-f0-9]+)?\.json$/i.test(f));
    if (!configFile) {
      throw new Error(`Missing bundle config JSON in ${bDir}`);
    }
    const st = dirStats(bDir);
    verifiedBundles[bundleName] = { bytes: st.bytes, pngCount: st.pngCount, configFile };
  }

  const gameplayStat = verifiedBundles.bundle_gameplay;
  const siteDest = path.join(absOutDir, `${target}-site`);
  fs.rmSync(siteDest, { recursive: true, force: true });
  fs.mkdirSync(absOutDir, { recursive: true });
  fs.cpSync(buildOutDir, siteDest, {
    recursive: true,
    filter: (src) => {
      if (!cdnUrl) return true;
      const rel = path.relative(buildOutDir, src);
      return rel !== 'remote' && !rel.startsWith(`remote${path.sep}`);
    },
  });
  rehashMainBundle(siteDest);

  let cdnBytes = 0;
  let cdnDest = null;
  if (cdnUrl) {
    cdnDest = path.join(absOutDir, `${target}-cdn`, 'remote');
    fs.rmSync(path.join(absOutDir, `${target}-cdn`), { recursive: true, force: true });
    fs.cpSync(remoteDir, cdnDest, { recursive: true });
    cdnBytes = dirStats(cdnDest).bytes;
  }

  const siteBytes = dirStats(siteDest).bytes;
  return {
    platform: target,
    mode: cdnUrl ? 'split-cdn' : 'single-origin',
    cdnUrl,
    siteDir: path.relative(ROOT, siteDest).split(path.sep).join('/'),
    cdnDir: cdnDest ? path.relative(ROOT, cdnDest).split(path.sep).join('/') : null,
    siteBytes,
    cdnBytes,
    resourcesBytes: resourcesStat.bytes,
    resourcesPngCount: resourcesStat.pngCount,
    gameplayPngCount: gameplayStat.pngCount,
    bundles: verifiedBundles,
  };
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const targets = resolveTargets(opts.target);
  const absOutDir = path.resolve(ROOT, opts.outDir);

  const plannedConfigs = targets.map((t) => {
    const baseCfgPath = path.join(GAME_DIR, `build-${t}.json`);
    if (!fs.existsSync(baseCfgPath)) {
      throw new Error(`Missing base build config: ${baseCfgPath}`);
    }
    const baseCfg = JSON.parse(fs.readFileSync(baseCfgPath, 'utf8'));
    const resolved = {
      ...baseCfg,
      outputName: `${t}-release`,
      debug: false,
      sourceMaps: false,
      md5Cache: true,
      server: opts.cdnUrl,
    };
    return { target: t, baseCfgPath: path.relative(ROOT, baseCfgPath).split(path.sep).join('/'), resolved };
  });

  if (opts.dryRun) {
    console.log(
      JSON.stringify(
        {
          dryRun: true,
          outDir: opts.outDir,
          cdnUrl: opts.cdnUrl,
          targets: plannedConfigs,
        },
        null,
        2,
      ),
    );
    return;
  }

  const cocosCliPath = path.join(ROOT, 'tools', 'cocos-cli', 'dist', 'cli.js');
  if (!fs.existsSync(cocosCliPath)) {
    throw new Error(`Cocos CLI not found at ${cocosCliPath}`);
  }

  if (!opts.skipChecks) {
    runNodeScript(path.join(ROOT, 'scripts', 'check-hygiene.mjs'));
    const tsxCli = path.join(ROOT, 'tools', 'cocos-cli', 'node_modules', 'tsx', 'dist', 'cli.mjs');
    runNodeScript(tsxCli, [path.join(ROOT, 'scripts', 'test-sim.ts')]);
    const tscBin = path.join(ROOT, 'tools', 'cocos-cli', 'node_modules', 'typescript', 'bin', 'tsc');
    runNodeScript(tscBin, ['-p', path.join(GAME_DIR, 'tsconfig.json'), '--noEmit']);
  }

  const manifestPath = path.join(absOutDir, 'release-manifest.json');
  let existingTargets = {};
  if (fs.existsSync(manifestPath)) {
    try {
      const prev = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (prev && typeof prev.targets === 'object' && prev.targets !== null) {
        existingTargets = prev.targets;
      }
    } catch {
      existingTargets = {};
    }
  }

  const targetReports = { ...existingTargets };
  fs.mkdirSync(GAME_TEMP_DIR, { recursive: true });

  for (const item of plannedConfigs) {
    const tempCfgPath = path.join(GAME_TEMP_DIR, `release-config-${item.target}.json`);
    const backendLock = path.join(GAME_TEMP_DIR, '.cocos-cli-backend');
    fs.writeFileSync(tempCfgPath, JSON.stringify(item.resolved, null, 2), 'utf8');
    fs.rmSync(backendLock, { recursive: true, force: true });

    try {
      runNodeScript(cocosCliPath, [
        '--no-interactive',
        'build',
        '--project',
        'game',
        '--platform',
        item.target,
        '--build-config',
        tempCfgPath,
      ]);
    } finally {
      fs.rmSync(tempCfgPath, { force: true });
    }

    const builtOutDir = path.join(GAME_DIR, 'build', item.resolved.outputName);
    targetReports[item.target] = verifyAndStageTarget(item.target, opts.cdnUrl, builtOutDir, absOutDir);
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    gitCommit: getGitHeadShort(),
    lastBuiltTargets: targets,
    targets: targetReports,
  };
  fs.mkdirSync(absOutDir, { recursive: true });
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

  console.log('\n=== RELEASE BUILD SUMMARY ===');
  for (const t of targets) {
    const r = targetReports[t];
    console.log(
      `${t.padEnd(12)} | mode=${r.mode.padEnd(13)} | site=${(r.siteBytes / 1048576).toFixed(2)}MB | cdn=${(r.cdnBytes / 1048576).toFixed(2)}MB | resources=${(r.resourcesBytes / 1048576).toFixed(3)}MB (${r.resourcesPngCount} pngs) | gameplayPngs=${r.gameplayPngCount}`,
    );
  }
  console.log(`Manifest written to: ${path.relative(ROOT, manifestPath).split(path.sep).join('/')}`);
}

main();
