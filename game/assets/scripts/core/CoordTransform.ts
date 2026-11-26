/**
 * Coordinate conversions between Takeover's Flash stage (800x600 Y-down, logical Y_KOEFF=2)
 * and COCOS 4 16:9 Canvas space (1280x720 Y-up centered at origin).
 */
export const FLASH_WIDTH = 800;
export const FLASH_HEIGHT = 600;
export const LOGICAL_Y_KOEFF = 2;

export const COCOS_DESIGN_WIDTH = 1280;
export const COCOS_DESIGN_HEIGHT = 720;

/**
 * Scale factor mapping Flash height 600 -> Cocos height 720 cleanly (1.2x),
 * centering Flash X=[0..800] inside Cocos 1280px width while revealing outer terrain wings.
 */
export const MAP_TO_COCOS_SCALE = COCOS_DESIGN_HEIGHT / FLASH_HEIGHT; // 1.2

export interface Vec2 {
  x: number;
  y: number;
}

/** Converts Flash stage (x, y) to Cocos world (x, y) centered on Canvas (0, 0). */
export function flashToCocos(fx: number, fy: number): Vec2 {
  return {
    x: (fx - FLASH_WIDTH * 0.5) * MAP_TO_COCOS_SCALE,
    y: (FLASH_HEIGHT * 0.5 - fy) * MAP_TO_COCOS_SCALE,
  };
}

/** Converts Cocos world (x, y) centered on Canvas (0, 0) back to Flash stage (x, y). */
export function cocosToFlash(cx: number, cy: number): Vec2 {
  return {
    x: cx / MAP_TO_COCOS_SCALE + FLASH_WIDTH * 0.5,
    y: FLASH_HEIGHT * 0.5 - cy / MAP_TO_COCOS_SCALE,
  };
}

/** Converts Flash (x, y) to logical simulation space (with Y_KOEFF = 2 for isometric distance fairness). */
export function flashToSim(fx: number, fy: number): Vec2 {
  return { x: fx, y: fy * LOGICAL_Y_KOEFF };
}

/** Converts logical simulation space back to Flash stage (x, y). */
export function simToFlash(sx: number, sy: number): Vec2 {
  return { x: sx, y: sy / LOGICAL_Y_KOEFF };
}

/** Converts logical simulation space directly to Cocos world (x, y). */
export function simToCocos(sx: number, sy: number): Vec2 {
  return flashToCocos(sx, sy / LOGICAL_Y_KOEFF);
}

/** Computes Euclidean distance between two points. */
export function dist(ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  return Math.hypot(dx, dy);
}
