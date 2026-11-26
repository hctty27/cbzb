import { createBrowserStorageAdapter, IStorageAdapter } from './CampaignProgress';

const SETTINGS_STORAGE_KEY = 'takeover_settings_v1';

export interface UserSettingsState {
  muted: boolean;
  bgmVolume: number;
  sfxVolume: number;
  preferredSpeed: 1 | 2;
}

const DEFAULT_SETTINGS: UserSettingsState = {
  muted: false,
  bgmVolume: 0.45,
  sfxVolume: 0.7,
  preferredSpeed: 1,
};

function clampVolume(v: unknown, fallback: number): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) return fallback;
  const clamped = Math.max(0, Math.min(1, v));
  return Math.round(clamped * 100) / 100;
}

export class UserSettingsStore {
  private state: UserSettingsState;
  private storage: IStorageAdapter;

  constructor(autoLoad = true, storage: IStorageAdapter = createBrowserStorageAdapter()) {
    this.storage = storage;
    this.state = { ...DEFAULT_SETTINGS };
    if (autoLoad) this.load();
  }

  load(): void {
    try {
      const raw = this.storage.getItem(SETTINGS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<UserSettingsState>;
      this.state = {
        muted: typeof parsed.muted === 'boolean' ? parsed.muted : DEFAULT_SETTINGS.muted,
        bgmVolume: clampVolume(parsed.bgmVolume, DEFAULT_SETTINGS.bgmVolume),
        sfxVolume: clampVolume(parsed.sfxVolume, DEFAULT_SETTINGS.sfxVolume),
        preferredSpeed: parsed.preferredSpeed === 2 ? 2 : 1,
      };
    } catch {
      this.state = { ...DEFAULT_SETTINGS };
    }
  }

  save(): void {
    try {
      this.storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Ignore storage quota or private-mode errors
    }
  }

  getState(): Readonly<UserSettingsState> {
    return this.state;
  }

  isMuted(): boolean {
    return this.state.muted;
  }

  setMuted(muted: boolean): void {
    this.state.muted = muted;
    this.save();
  }

  toggleMute(): boolean {
    this.state.muted = !this.state.muted;
    this.save();
    return this.state.muted;
  }

  getBgmVolume(): number {
    return this.state.bgmVolume;
  }

  setBgmVolume(vol: number): void {
    this.state.bgmVolume = clampVolume(vol, DEFAULT_SETTINGS.bgmVolume);
    this.save();
  }

  getSfxVolume(): number {
    return this.state.sfxVolume;
  }

  setSfxVolume(vol: number): void {
    this.state.sfxVolume = clampVolume(vol, DEFAULT_SETTINGS.sfxVolume);
    this.save();
  }

  getPreferredSpeed(): 1 | 2 {
    return this.state.preferredSpeed;
  }

  setPreferredSpeed(speed: 1 | 2): void {
    this.state.preferredSpeed = speed === 2 ? 2 : 1;
    this.save();
  }

  reset(): void {
    this.state = { ...DEFAULT_SETTINGS };
    this.save();
  }
}
