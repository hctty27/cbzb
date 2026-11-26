/** Lightweight typed event bus decoupled from Cocos runtime. */
export type Listener<T> = (payload: T) => void;

export class EventBus<Events extends Record<string, any>> {
  private listeners: { [K in keyof Events]?: Set<Listener<Events[K]>> } = {};

  on<K extends keyof Events>(event: K, fn: Listener<Events[K]>): () => void {
    let set = this.listeners[event];
    if (!set) {
      set = new Set();
      this.listeners[event] = set;
    }
    set.add(fn);
    return () => set!.delete(fn);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    const set = this.listeners[event];
    if (!set) return;
    for (const fn of [...set]) {
      fn(payload);
    }
  }

  clear(): void {
    this.listeners = {};
  }
}
