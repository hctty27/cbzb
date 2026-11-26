import { assetManager, AssetManager, JsonAsset, resources, Texture2D } from 'cc';
import { AssetBundleName, SPRITE_MANIFEST } from '../data/AssetManifest';
import { getCampaignBundleName, getLevelMetaById } from '../data/LevelCatalog';
import { LevelDef, PlayableCampaignId } from '../data/Types';

const bundleCache = new Map<AssetBundleName, AssetManager.Bundle>();
const bundleInFlight = new Map<AssetBundleName, Promise<AssetManager.Bundle>>();
const levelCache = new Map<number, LevelDef>();
const levelInFlight = new Map<number, Promise<LevelDef>>();

export function ensureBundle(name: AssetBundleName): Promise<AssetManager.Bundle> {
  if (name === 'resources') {
    bundleCache.set('resources', resources);
    return Promise.resolve(resources);
  }
  const existing = assetManager.getBundle(name) ?? bundleCache.get(name);
  if (existing) {
    bundleCache.set(name, existing);
    return Promise.resolve(existing);
  }
  const pending = bundleInFlight.get(name);
  if (pending) return pending;

  const p = new Promise<AssetManager.Bundle>((resolve, reject) => {
    assetManager.loadBundle(name, (err, bundle) => {
      bundleInFlight.delete(name);
      if (err || !bundle) {
        reject(err ?? new Error(`Failed to load AssetBundle: ${name}`));
        return;
      }
      bundleCache.set(name, bundle);
      resolve(bundle);
    });
  });
  bundleInFlight.set(name, p);
  return p;
}

export async function loadLevelDef(levelId: number): Promise<LevelDef> {
  const cached = levelCache.get(levelId);
  if (cached) return cached;

  const pending = levelInFlight.get(levelId);
  if (pending) return pending;

  const p = (async () => {
    const meta = getLevelMetaById(levelId);
    const bundleName = getCampaignBundleName(meta.campaign);
    const bundle = await ensureBundle(bundleName);
    const levelDef = await new Promise<LevelDef>((resolve, reject) => {
      bundle.load(`levels/level_${meta.id}`, JsonAsset, (err, asset) => {
        if (err || !asset?.json) {
          reject(err ?? new Error(`Failed to load level JSON levels/level_${meta.id} from ${bundleName}`));
          return;
        }
        resolve(asset.json as LevelDef);
      });
    });
    levelCache.set(levelId, levelDef);
    return levelDef;
  })().finally(() => {
    levelInFlight.delete(levelId);
  });

  levelInFlight.set(levelId, p);
  return p;
}

/**
 * Fires off non-blocking background preloading for gameplay assets, campaign diff map,
 * and optionally the currently selected mission JSON & battle background texture.
 */
export function preloadCampaign(campaign: PlayableCampaignId, selectedLevelId?: number): void {
  const campaignBundle = getCampaignBundleName(campaign);
  ensureBundle('bundle_gameplay')
    .then((b) => {
      const baseEntry = SPRITE_MANIFEST['map/campaign_map_base'];
      if (baseEntry) b.preload(`${baseEntry.path}/texture`, Texture2D);
    })
    .catch(() => {});

  ensureBundle(campaignBundle).catch(() => {});

  if (selectedLevelId !== undefined) {
    loadLevelDef(selectedLevelId).catch(() => {});
    const meta = getLevelMetaById(selectedLevelId);
    const bgEntry = SPRITE_MANIFEST[meta.bgKey];
    if (bgEntry) {
      ensureBundle(bgEntry.bundle ?? 'resources')
        .then((b) => {
          b.preload(`${bgEntry.path}/texture`, Texture2D);
        })
        .catch(() => {});
    }
  }
}
