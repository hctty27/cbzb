import { AudioClip, AudioSource, Node, resources } from 'cc';
import { AUDIO_MANIFEST } from '../data/AssetManifest';
import { UserSettingsStore } from '../data/UserSettings';

export class AudioManager {
  private bgmSource: AudioSource;
  private sfxSource: AudioSource;
  private settings: UserSettingsStore;
  private clipCache = new Map<string, AudioClip>();
  private muted = false;
  private bgmVolume = 0.45;
  private sfxVolume = 0.7;
  private suspended = false;
  private wasPlayingBeforeSuspend = false;
  private currentMusicKey: string | null = null;
  private lastSfxTime = new Map<string, number>();

  constructor(hostNode: Node, settings?: UserSettingsStore) {
    this.settings = settings ?? new UserSettingsStore(true);
    this.muted = this.settings.isMuted();
    this.bgmVolume = this.settings.getBgmVolume();
    this.sfxVolume = this.settings.getSfxVolume();

    const bgmNode = new Node('AudioBGM');
    hostNode.addChild(bgmNode);
    this.bgmSource = bgmNode.addComponent(AudioSource);
    this.bgmSource.loop = true;
    this.bgmSource.volume = this.muted ? 0 : this.bgmVolume;

    const sfxNode = new Node('AudioSFX');
    hostNode.addChild(sfxNode);
    this.sfxSource = sfxNode.addComponent(AudioSource);
    this.sfxSource.loop = false;
    this.sfxSource.volume = this.muted ? 0 : this.sfxVolume;
  }

  isMuted(): boolean {
    return this.muted;
  }

  toggleMute(): boolean {
    this.muted = this.settings.toggleMute();
    this.applyVolumes();
    if (!this.muted && !this.suspended && this.currentMusicKey && !this.bgmSource.playing) {
      void this.playMusic(this.currentMusicKey);
    }
    return this.muted;
  }

  getBgmVolume(): number {
    return this.bgmVolume;
  }

  setBgmVolume(vol: number): void {
    this.settings.setBgmVolume(vol);
    this.bgmVolume = this.settings.getBgmVolume();
    this.applyVolumes();
  }

  getSfxVolume(): number {
    return this.sfxVolume;
  }

  setSfxVolume(vol: number): void {
    this.settings.setSfxVolume(vol);
    this.sfxVolume = this.settings.getSfxVolume();
    this.applyVolumes();
  }

  suspend(): void {
    this.suspended = true;
    this.wasPlayingBeforeSuspend = Boolean(this.bgmSource.playing);
    try {
      if (this.bgmSource.playing) {
        this.bgmSource.pause();
      }
    } catch {
      // Ignore audio backend pause errors
    }
  }

  resume(): void {
    this.suspended = false;
    if (!this.muted && this.wasPlayingBeforeSuspend && this.currentMusicKey && this.bgmSource.clip && !this.bgmSource.playing) {
      try {
        this.bgmSource.play();
      } catch {
        // Ignore if browser requires a fresh gesture
      }
    }
    this.wasPlayingBeforeSuspend = false;
  }

  private applyVolumes(): void {
    this.bgmSource.volume = this.muted ? 0 : this.bgmVolume;
    this.sfxSource.volume = this.muted ? 0 : this.sfxVolume;
  }

  private loadClip(key: string): Promise<AudioClip | null> {
    const cached = this.clipCache.get(key);
    if (cached) return Promise.resolve(cached);
    const path = AUDIO_MANIFEST[key];
    if (!path) return Promise.resolve(null);
    return new Promise((resolve) => {
      resources.load(path, AudioClip, (err, clip) => {
        if (err || !clip) {
          resolve(null);
          return;
        }
        this.clipCache.set(key, clip);
        resolve(clip);
      });
    });
  }

  async playMusic(key: string): Promise<void> {
    if (this.currentMusicKey === key && this.bgmSource.playing) return;
    this.currentMusicKey = key;
    if (this.suspended) {
      this.wasPlayingBeforeSuspend = true;
      return;
    }
    const clip = await this.loadClip(key);
    if (!clip || this.currentMusicKey !== key || this.suspended) return;
    this.bgmSource.stop();
    this.bgmSource.clip = clip;
    this.bgmSource.volume = this.muted ? 0 : this.bgmVolume;
    try {
      this.bgmSource.play();
    } catch {
      // Browser autoplay block will retry on next user gesture
    }
  }

  retryMusicOnGesture(): void {
    if (!this.muted && !this.suspended && this.currentMusicKey && this.bgmSource.clip && !this.bgmSource.playing) {
      try {
        this.bgmSource.play();
      } catch {
        // Ignore if still blocked
      }
    }
  }

  async playSfx(key: string, minIntervalMs = 80): Promise<void> {
    if (this.muted || this.suspended || this.sfxVolume <= 0) return;
    const now = Date.now();
    const prev = this.lastSfxTime.get(key) ?? 0;
    if (now - prev < minIntervalMs) return;
    this.lastSfxTime.set(key, now);

    const clip = await this.loadClip(key);
    if (!clip || this.muted || this.suspended) return;
    this.sfxSource.playOneShot(clip, this.sfxVolume);
  }
}
