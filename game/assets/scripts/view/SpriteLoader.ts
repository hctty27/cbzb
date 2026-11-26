import { assetManager, Color, Graphics, Node, Rect, Size, SpriteFrame, Texture2D, UITransform } from 'cc';
import { retryAsync } from '../core/AsyncRetry';
import { SPRITE_MANIFEST, SpriteAssetEntry } from '../data/AssetManifest';
import { ensureBundle } from './AssetBundleManager';

const textureCache = new Map<string, Texture2D>();
const inFlightTextures = new Map<string, Promise<Texture2D>>();
const staticFrameCache = new Map<string, SpriteFrame>();
const inFlightStaticFrames = new Map<string, Promise<SpriteFrame>>();
const stripCache = new Map<string, SpriteFrame[]>();

export function createUiNode(name: string, parent?: Node, width = 100, height = 100, anchorX = 0.5, anchorY = 0.5): Node {
  const node = new Node(name);
  const tr = node.addComponent(UITransform);
  tr.setContentSize(width, height);
  tr.setAnchorPoint(anchorX, anchorY);
  if (parent) parent.addChild(node);
  return node;
}

export function drawPanel(
  g: Graphics,
  w: number,
  h: number,
  fill: Color,
  stroke?: Color,
  lineWidth = 2,
  radius = 8,
  anchorX = 0.5,
  anchorY = 0.5,
): void {
  g.clear();
  const x = -w * anchorX;
  const y = -h * anchorY;
  g.fillColor = fill;
  g.roundRect(x, y, w, h, radius);
  g.fill();
  if (stroke && lineWidth > 0) {
    g.strokeColor = stroke;
    g.lineWidth = lineWidth;
    g.roundRect(x, y, w, h, radius);
    g.stroke();
  }
}

export function loadTextureByKey(
  key: string,
  onRetry?: (nextAttempt: number, maxAttempts: number, err: unknown) => void,
): Promise<Texture2D> {
  const cached = textureCache.get(key);
  if (cached && cached.isValid) return Promise.resolve(cached);
  if (cached) textureCache.delete(key);

  const pending = inFlightTextures.get(key);
  if (pending) return pending;

  const entry: SpriteAssetEntry | undefined = SPRITE_MANIFEST[key];
  if (!entry) {
    return Promise.reject(new Error(`Unknown SpriteAsset key: ${key}`));
  }

  const bundleName = entry.bundle ?? 'resources';
  const p = retryAsync(
    async () => {
      const bundle = await ensureBundle(bundleName, onRetry);
      return await new Promise<Texture2D>((resolve, reject) => {
        bundle.load(`${entry.path}/texture`, Texture2D, (err, tex) => {
          if (err || !tex) {
            reject(err ?? new Error(`Failed to load texture ${entry.path}/texture from ${bundleName}`));
            return;
          }
          textureCache.set(key, tex);
          resolve(tex);
        });
      });
    },
    {
      maxAttempts: 3,
      timeoutMs: 12000,
      baseDelayMs: 400,
      label: `texture:${key}`,
      onRetry,
    },
  ).finally(() => {
    inFlightTextures.delete(key);
  });

  inFlightTextures.set(key, p);
  return p;
}

export function preloadTextureByKey(key: string): Promise<void> {
  const entry = SPRITE_MANIFEST[key];
  if (entry && entry.frameCount <= 1) {
    return getStaticSpriteFrame(key).then(
      () => undefined,
      () => undefined,
    );
  }
  return loadTextureByKey(key).then(
    () => undefined,
    () => undefined,
  );
}

export function releaseTextureByKey(key: string): void {
  stripLoading.delete(key);
  const sf = staticFrameCache.get(key);
  if (sf) {
    staticFrameCache.delete(key);
    if (sf.isValid) {
      assetManager.releaseAsset(sf);
    }
  }
  const strip = stripCache.get(key);
  if (strip) {
    stripCache.delete(key);
    for (const f of strip) {
      if (f.isValid) f.destroy();
    }
  }
  const tex = textureCache.get(key);
  if (tex) {
    textureCache.delete(key);
    if (tex.isValid) {
      assetManager.releaseAsset(tex);
    }
  }
}

export function getStaticSpriteFrame(
  key: string,
  onRetry?: (nextAttempt: number, maxAttempts: number, err: unknown) => void,
): Promise<SpriteFrame> {
  const cached = staticFrameCache.get(key);
  if (cached && cached.isValid) return Promise.resolve(cached);
  if (cached) staticFrameCache.delete(key);

  const pending = inFlightStaticFrames.get(key);
  if (pending) return pending;

  const entry: SpriteAssetEntry | undefined = SPRITE_MANIFEST[key];
  if (!entry) {
    return Promise.reject(new Error(`Unknown SpriteAsset key: ${key}`));
  }

  const bundleName = entry.bundle ?? 'resources';
  const p = retryAsync(
    async () => {
      const bundle = await ensureBundle(bundleName, onRetry);
      return await new Promise<SpriteFrame>((resolve, reject) => {
        bundle.load(`${entry.path}/spriteFrame`, SpriteFrame, (err, sf) => {
          if (err || !sf) {
            reject(err ?? new Error(`Failed to load SpriteFrame ${entry.path}/spriteFrame from ${bundleName}`));
            return;
          }
          staticFrameCache.set(key, sf);
          resolve(sf);
        });
      });
    },
    {
      maxAttempts: 3,
      timeoutMs: 12000,
      baseDelayMs: 400,
      label: `spriteFrame:${key}`,
      onRetry,
    },
  ).finally(() => {
    inFlightStaticFrames.delete(key);
  });

  inFlightStaticFrames.set(key, p);
  return p;
}

const stripLoading = new Set<string>();

export function getStripFramesSync(key: string): SpriteFrame[] | null {
  const cached = stripCache.get(key);
  if (cached && cached.length > 0 && cached[0].isValid) return cached;
  if (cached) stripCache.delete(key);
  if (!stripLoading.has(key)) {
    stripLoading.add(key);
    getStripFrames(key).catch(() => {});
  }
  return null;
}

export async function getStripFrames(key: string): Promise<SpriteFrame[]> {
  const cached = stripCache.get(key);
  if (cached && cached.length > 0 && cached[0].isValid) return cached;
  if (cached) stripCache.delete(key);

  const entry = SPRITE_MANIFEST[key];
  if (!entry) throw new Error(`Unknown strip key: ${key}`);
  const tex = await loadTextureByKey(key);
  const frames: SpriteFrame[] = [];
  const fw = entry.frameWidth;
  const fh = entry.frameHeight;
  for (let i = 0; i < entry.frameCount; i++) {
    const sf = new SpriteFrame();
    sf.texture = tex;
    sf.rect = new Rect(i * fw, 0, fw, fh);
    sf.originalSize = new Size(fw, fh);
    frames.push(sf);
  }
  stripCache.set(key, frames);
  return frames;
}
