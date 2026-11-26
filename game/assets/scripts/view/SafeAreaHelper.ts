import { sys, view } from 'cc';

export interface SafeAreaInsets {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

function clampInset(value: number, maxInset: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.min(maxInset, Math.round(value));
}

export function getDesignSafeAreaInsets(): SafeAreaInsets {
  try {
    const visible = view.getVisibleSize();
    const safe = sys.getSafeAreaRect();
    if (!visible || !safe || visible.width <= 0 || visible.height <= 0) {
      return { left: 0, right: 0, top: 0, bottom: 0 };
    }
    const left = clampInset(safe.x, 80);
    const bottom = clampInset(safe.y, 48);
    const right = clampInset(visible.width - (safe.x + safe.width), 80);
    const top = clampInset(visible.height - (safe.y + safe.height), 48);
    return { left, right, top, bottom };
  } catch {
    return { left: 0, right: 0, top: 0, bottom: 0 };
  }
}
