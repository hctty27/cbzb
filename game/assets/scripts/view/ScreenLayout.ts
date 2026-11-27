import { ResolutionPolicy, screen, view } from 'cc';
import { COCOS_DESIGN_HEIGHT, COCOS_DESIGN_WIDTH } from '../core/CoordTransform';

const DESIGN_ASPECT = COCOS_DESIGN_WIDTH / COCOS_DESIGN_HEIGHT;

/**
 * Selects FIXED_HEIGHT on wider-than-16:9 screens and FIXED_WIDTH on narrower screens
 * so the 1280x720 core area always fits cleanly with full-bleed background coverage.
 */
export function applyAdaptiveResolution(): void {
  const win = screen.windowSize;
  const w = Math.max(1, win?.width || COCOS_DESIGN_WIDTH);
  const h = Math.max(1, win?.height || COCOS_DESIGN_HEIGHT);
  const aspect = w / h;
  const policy = aspect >= DESIGN_ASPECT ? ResolutionPolicy.FIXED_HEIGHT : ResolutionPolicy.FIXED_WIDTH;
  view.setDesignResolutionSize(COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT, policy);
}

/**
 * Returns half-width and half-height of the currently visible design-space viewport,
 * clamped at least to the 1280x720 core design bounds.
 */
export function getHudHalfExtents(): { halfW: number; halfH: number } {
  const vis = view.getVisibleSize();
  const halfW = Math.max(COCOS_DESIGN_WIDTH * 0.5, (vis?.width || COCOS_DESIGN_WIDTH) * 0.5);
  const halfH = Math.max(COCOS_DESIGN_HEIGHT * 0.5, (vis?.height || COCOS_DESIGN_HEIGHT) * 0.5);
  return { halfW, halfH };
}

/**
 * Computes cover scale for a sprite covering the entire visible design-space viewport.
 */
export function computeCoverScale(spriteWidth: number, spriteHeight: number): number {
  const { halfW, halfH } = getHudHalfExtents();
  return Math.max((halfW * 2) / Math.max(1, spriteWidth), (halfH * 2) / Math.max(1, spriteHeight));
}

/**
 * Subscribes to screen/window/canvas resize events and returns an unsubscribe cleanup callback.
 */
export function onScreenResize(cb: () => void): () => void {
  let busy = false;
  const handler = () => {
    if (busy) return;
    busy = true;
    try {
      cb();
    } finally {
      busy = false;
    }
  };
  screen.on('window-resize', handler);
  screen.on('orientation-change', handler);
  view.on('canvas-resize', handler);
  return () => {
    screen.off('window-resize', handler);
    screen.off('orientation-change', handler);
    view.off('canvas-resize', handler);
  };
}
