import { assetManager, AssetManager, JsonAsset, resources, SpriteFrame } from 'cc';
import { retryAsync } from '../core/AsyncRetry';
import { AssetBundleName, SPRITE_MANIFEST } from '../data/AssetManifest';
import { t } from '../data/I18n';
import { getCampaignBundleName, getLevelMetaById } from '../data/LevelCatalog';
import { LevelDef, PlayableCampaignId } from '../data/Types';
import { getStaticSpriteFrame } from './SpriteLoader';

const bundleCache = new Map<AssetBundleName, AssetManager.Bundle>();
const bundleInFlight = new Map<AssetBundleName, Promise<AssetManager.Bundle>>();
const levelCache = new Map<number, LevelDef>();
const levelInFlight = new Map<number, Promise<LevelDef>>();

export type RetryProgressHook = (nextAttempt: number, maxAttempts: number, err: unknown) => void;

export function ensureBundle(name: AssetBundleName, onRetry?: RetryProgressHook): Promise<AssetManager.Bundle> {
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

  const p = retryAsync(
    () =>
      new Promise<AssetManager.Bundle>((resolve, reject) => {
        assetManager.loadBundle(name, (err, bundle) => {
          if (err || !bundle) {
            reject(err ?? new Error(`Failed to load AssetBundle: ${name}`));
            return;
          }
          bundleCache.set(name, bundle);
          resolve(bundle);
        });
      }),
    {
      maxAttempts: 3,
      timeoutMs: 12000,
      baseDelayMs: 400,
      label: `bundle:${name}`,
      onRetry,
    },
  ).finally(() => {
    bundleInFlight.delete(name);
  });

  bundleInFlight.set(name, p);
  return p;
}

export async function loadLevelDef(levelId: number, onRetry?: RetryProgressHook): Promise<LevelDef> {
  const cached = levelCache.get(levelId);
  if (cached) return cached;

  const pending = levelInFlight.get(levelId);
  if (pending) return pending;

  const p = retryAsync(
    async () => {
      const meta = getLevelMetaById(levelId);
      const bundleName = getCampaignBundleName(meta.campaign);
      const bundle = await ensureBundle(bundleName, onRetry);
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
    },
    {
      maxAttempts: 3,
      timeoutMs: 10000,
      baseDelayMs: 400,
      label: `level:${levelId}`,
      onRetry,
    },
  ).finally(() => {
    levelInFlight.delete(levelId);
  });

  levelInFlight.set(levelId, p);
  return p;
}

/**
 * Sequential staged mission loader with smooth monotonic progress & retry notifications.
 * Rejects on unrecoverable CDN/network failure so UI can present a Retry modal.
 */
export async function loadMissionAssets(
  levelId: number,
  onProgress?: (ratio: number, status: string) => void,
): Promise<LevelDef> {
  const meta = getLevelMetaById(levelId);

  onProgress?.(0.08, t('load_gameplay_bundle'));
  await ensureBundle('bundle_gameplay', (next, max) => {
    onProgress?.(0.18, t('load_retrying_bundle', { next, max }));
  });

  onProgress?.(0.4, t('load_mission_data'));
  const levelDef = await loadLevelDef(levelId, (next, max) => {
    onProgress?.(0.5, t('load_retrying_mission', { next, max }));
  });

  onProgress?.(0.72, t('load_battlefield_map'));
  await getStaticSpriteFrame(meta.bgKey, (next, max) => {
    onProgress?.(0.8, t('load_retrying_map', { next, max }));
  });

  onProgress?.(1, t('load_ready'));
  return levelDef;
}

/**
 * Fires off non-blocking background preloading for gameplay assets, campaign diff map,
 * and optionally the currently selected mission JSON & battle background SpriteFrame.
 */
export function preloadCampaign(campaign: PlayableCampaignId, selectedLevelId?: number): void {
  const campaignBundle = getCampaignBundleName(campaign);
  ensureBundle('bundle_gameplay')
    .then((b) => {
      const baseEntry = SPRITE_MANIFEST['map/campaign_map_base'];
      if (baseEntry) b.preload(`${baseEntry.path}/spriteFrame`, SpriteFrame);
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
          b.preload(`${bgEntry.path}/spriteFrame`, SpriteFrame);
        })
        .catch(() => {});
    }
  }
}
