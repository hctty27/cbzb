import { AudioClip, AudioSource, Node, resources } from 'cc';
import { AUDIO_MANIFEST } from '../data/AssetManifest';

export class AudioManager {
  private bgmSource: AudioSource;
  private sfxSource: AudioSource;
  private clipCache = new Map<string, AudioClip>();
  private muted = false;
  private currentMusicKey: string | null = null;
  private lastSfxTime = new Map<string, number>();

  constructor(hostNode: Node) {
    const bgmNode = new Node('AudioBGM');
    hostNode.addChild(bgmNode);
    this.bgmSource = bgmNode.addComponent(AudioSource);
    this.bgmSource.loop = true;
    this.bgmSource.volume = 0.45;

    const sfxNode = new Node('AudioSFX');
    hostNode.addChild(sfxNode);
    this.sfxSource = sfxNode.addComponent(AudioSource);
    this.sfxSource.loop = false;
    this.sfxSource.volume = 0.7;
  }

  isMuted(): boolean {
    return this.muted;
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    this.bgmSource.volume = this.muted ? 0 : 0.45;
    this.sfxSource.volume = this.muted ? 0 : 0.7;
    if (!this.muted && this.currentMusicKey && !this.bgmSource.playing) {
      this.playMusic(this.currentMusicKey);
    }
    return this.muted;
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
    const clip = await this.loadClip(key);
    if (!clip || this.currentMusicKey !== key) return;
    this.bgmSource.stop();
    this.bgmSource.clip = clip;
    this.bgmSource.volume = this.muted ? 0 : 0.45;
    try {
      this.bgmSource.play();
    } catch {
      // Browser autoplay block will retry on next user gesture
    }
  }

  retryMusicOnGesture(): void {
    if (!this.muted && this.currentMusicKey && this.bgmSource.clip && !this.bgmSource.playing) {
      try {
        this.bgmSource.play();
      } catch {
        // Ignore if still blocked
      }
    }
  }

  async playSfx(key: string, minIntervalMs = 80): Promise<void> {
    if (this.muted) return;
    const now = Date.now();
    const prev = this.lastSfxTime.get(key) ?? 0;
    if (now - prev < minIntervalMs) return;
    this.lastSfxTime.set(key, now);

    const clip = await this.loadClip(key);
    if (!clip || this.muted) return;
    this.sfxSource.playOneShot(clip, 0.7);
  }
}
