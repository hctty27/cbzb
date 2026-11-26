import { Color, Graphics, Node, Rect, resources, Size, SpriteFrame, Texture2D, UITransform } from 'cc';
import { SPRITE_MANIFEST, SpriteAssetEntry } from '../data/AssetManifest';

const textureCache = new Map<string, Texture2D>();
const staticFrameCache = new Map<string, SpriteFrame>();
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

export function loadTextureByKey(key: string): Promise<Texture2D> {
  const cached = textureCache.get(key);
  if (cached) return Promise.resolve(cached);

  const entry: SpriteAssetEntry | undefined = SPRITE_MANIFEST[key];
  if (!entry) {
    return Promise.reject(new Error(`Unknown SpriteAsset key: ${key}`));
  }

  return new Promise((resolve, reject) => {
    resources.load(`${entry.path}/texture`, Texture2D, (err, tex) => {
      if (err || !tex) {
        reject(err ?? new Error(`Failed to load texture ${entry.path}/texture`));
        return;
      }
      textureCache.set(key, tex);
      resolve(tex);
    });
  });
}

export async function getStaticSpriteFrame(key: string): Promise<SpriteFrame> {
  const cached = staticFrameCache.get(key);
  if (cached) return cached;

  const tex = await loadTextureByKey(key);
  const sf = new SpriteFrame();
  sf.texture = tex;
  sf.rect = new Rect(0, 0, tex.width, tex.height);
  sf.originalSize = new Size(tex.width, tex.height);
  staticFrameCache.set(key, sf);
  return sf;
}

const stripLoading = new Set<string>();

export function getStripFramesSync(key: string): SpriteFrame[] | null {
  const cached = stripCache.get(key);
  if (cached) return cached;
  if (!stripLoading.has(key)) {
    stripLoading.add(key);
    getStripFrames(key).catch(() => {});
  }
  return null;
}

export async function getStripFrames(key: string): Promise<SpriteFrame[]> {
  const cached = stripCache.get(key);
  if (cached) return cached;

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
