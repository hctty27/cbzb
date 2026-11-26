import { Color, Graphics, Label, Node, NodePool, Sprite, SpriteFrame, UITransform } from 'cc';
import { flashToCocos, MAP_TO_COCOS_SCALE } from '../core/CoordTransform';
import { SPRITE_MANIFEST, SpriteAssetEntry } from '../data/AssetManifest';
import { t } from '../data/I18n';
import { ActiveBannerState, BannerSpellId, SimEventPayload } from '../data/Types';
import { BattleSim } from '../sim/BattleSim';
import { AudioManager } from './AudioManager';
import { createUiNode, getStripFrames, getStripFramesSync } from './SpriteLoader';

interface BannerVisual {
  id: number;
  root: Node;
  poleSprite: Sprite;
  auraSprite: Sprite;
  ringG: Graphics;
  spellId: BannerSpellId;
  elapsed: number;
}

interface StripVfx {
  node: Node;
  sprite: Sprite;
  frames: SpriteFrame[];
  elapsed: number;
  fps: number;
  loopCount: number;
}

interface FloatingText {
  node: Node;
  label: Label;
  elapsed: number;
  duration: number;
}

/**
 * Manages pooled strip VFX, floating combat text, and active battlefield banners
 * for BattleView.
 */
export class BattleVfxController {
  private bannerVisuals = new Map<number, BannerVisual>();
  private stripVfx: StripVfx[] = [];
  private floatingTexts: FloatingText[] = [];

  private vfxPool = new NodePool();
  private floatTextPool = new NodePool();

  constructor(
    private bannerLayer: Node,
    private vfxLayer: Node,
    private audio: AudioManager,
    private swfToCocosScale: number,
  ) {}

  handleSimEvent(ev: SimEventPayload, sim: BattleSim): void {
    if (ev.type === 'attack_hit') {
      if (ev.unitClass === 'Archers') this.audio.playSfx('attack_bow', 250);
      else if (ev.unitClass === 'Siege') {
        this.audio.playSfx('attack_siege', 400);
        if (ev.flashX !== undefined && ev.flashY !== undefined) {
          void this.spawnStripVfx('vfx/explosion', ev.flashX, ev.flashY, 0.7, 18);
        }
      } else if (ev.unitClass === 'Magic') {
        this.audio.playSfx('attack_magic', 260);
      } else {
        this.audio.playSfx('attack_sword', 180);
      }
    } else if (ev.type === 'squad_killed') {
      const deadKey =
        ev.faction === 'Bandits'
          ? 'dead_ogre'
          : ev.unitClass === 'Cavalry'
            ? 'dead_horse'
            : ev.unitClass === 'Siege'
              ? 'dead_siege'
              : ev.faction === 'TheEmpire'
                ? 'dead_undead'
                : 'dead_man';
      this.audio.playSfx(deadKey, 150);
      if (ev.flashX !== undefined && ev.flashY !== undefined) {
        void this.spawnStripVfx('vfx/explosion', ev.flashX, ev.flashY, 0.7, 18);
      }
    } else if (ev.type === 'squad_level_up') {
      this.audio.playSfx('squad_level_up', 250);
      if (ev.flashX !== undefined && ev.flashY !== undefined) {
        this.spawnFloatingText(ev.flashX, ev.flashY - 14, t('vfx_veteran_up'), new Color(255, 224, 90, 255));
      }
    } else if (ev.type === 'stronghold_captured') {
      this.audio.playSfx('capture_stronghold', 100);
      if (ev.flashX !== undefined && ev.flashY !== undefined) {
        void this.spawnStripVfx('vfx/explosion', ev.flashX, ev.flashY, 0.9, 18);
      }
    } else if (ev.type === 'spell_cast' && ev.spellId) {
      const fx = ev.flashX ?? 400;
      const fy = ev.flashY ?? 300;
      if (ev.spellId === 'lords_judgement') {
        this.audio.playSfx('spell_lords_judgement', 100);
        void this.spawnStripVfx('vfx/spell_thunder', fx, fy, 1.0, 14);
        this.spawnFloatingText(fx, fy - 12, t('vfx_lords_judgement'), new Color(255, 235, 130, 255));
      } else if (ev.spellId === 'summon_stoneworms') {
        this.audio.playSfx('spell_stoneworms', 100);
        void this.spawnStripVfx('vfx/stoneworms', fx, fy, 1.0, 14);
        this.spawnFloatingText(fx, fy - 12, t('vfx_stoneworms'), new Color(245, 175, 95, 255));
      } else if (ev.spellId === 'disentomb' || ev.spellId === 'raise_the_dead') {
        this.audio.playSfx('spell_disentomb', 100);
        void this.spawnStripVfx('vfx/raise_dead', fx, fy, 1.0, 14);
        this.spawnFloatingText(
          fx,
          fy - 14,
          ev.spellId === 'disentomb' ? t('vfx_immortals_risen') : t('vfx_undead_raised'),
          new Color(205, 150, 255, 255),
        );
      } else if (ev.spellId === 'ice_blast') {
        this.audio.playSfx('spell_ice_blast', 100);
        this.audio.playSfx('unit_frozen', 200);
        void this.spawnStripVfx('vfx/ice_blast', fx, fy, 1.0, 14);
        this.spawnFloatingText(fx, fy - 14, t('vfx_frozen'), new Color(135, 225, 255, 255));
      } else if (ev.spellId === 'frost_enchantment') {
        this.audio.playSfx('spell_frost_enchant', 100);
        void this.spawnStripVfx('vfx/frost_enchant', fx, fy, 1.0, 14);
        this.spawnFloatingText(fx, fy - 14, t('vfx_frost_enchant'), new Color(165, 235, 255, 255));
      } else if (ev.spellId === 'terror') {
        this.audio.playSfx('spell_terror', 100);
        this.audio.playSfx('unit_feared', 200);
        void this.spawnStripVfx('vfx/terror_splash', fx, fy, 1.0, 14);
      }
    } else if (ev.type === 'banner_placed') {
      this.audio.playSfx('banner_set', 100);
      if (ev.spellId === 'banner_heroism') this.audio.playSfx('unit_heroic', 200);
    } else if (ev.type === 'banner_expired') {
      this.audio.playSfx('banner_remove', 100);
    } else if (ev.type === 'ultimate_cast') {
      const fx = ev.flashX ?? 400;
      const fy = ev.flashY ?? 300;
      if (ev.spellId === 'cataclysm') {
        this.audio.playSfx('ultimate_cataclysm', 100);
        for (const sh of sim.strongholds) {
          void this.spawnStripVfx('vfx/explosion', sh.flashX, sh.flashY, 1.15, 16);
        }
        this.spawnFloatingText(400, 280, t('vfx_cataclysm'), new Color(255, 120, 75, 255));
      } else if (ev.spellId === 'grand_transformation') {
        this.audio.playSfx('ultimate_transformation', 100);
        void this.spawnStripVfx('vfx/grand_transform', fx, fy, 1.15, 14);
        this.spawnFloatingText(
          fx,
          fy - 22,
          t('vfx_transformation', { gold: ev.goldAmount ?? 0 }),
          new Color(140, 230, 255, 255),
        );
      } else if (ev.spellId === 'call_of_the_grave') {
        this.audio.playSfx('ultimate_undead', 100);
        void this.spawnStripVfx('vfx/grand_transform', fx, fy, 1.0, 14);
      } else {
        this.audio.playSfx('ultimate_avatar', 100);
        void this.spawnStripVfx('vfx/sign_of_advent', fx, fy, 0.95, 14);
        this.spawnFloatingText(fx, fy - 22, t('vfx_lords_avatar'), new Color(255, 224, 100, 255));
      }
    } else if (ev.type === 'chest_collected') {
      this.audio.playSfx('chest_open', 100);
      this.audio.playSfx('chest_gold', 100);
      if (ev.flashX !== undefined && ev.flashY !== undefined) {
        this.spawnFloatingText(
          ev.flashX,
          ev.flashY - 10,
          t('vfx_gold_gain', { gold: ev.goldAmount ?? 500 }),
          new Color(255, 225, 85, 255),
        );
      }
    }
  }

  syncBanners(sim: BattleSim, dt: number): void {
    const activeBannerIds = new Set(sim.activeBanners.map((b) => b.id));
    for (const [id, bv] of [...this.bannerVisuals.entries()]) {
      if (!activeBannerIds.has(id)) {
        bv.root.destroy();
        this.bannerVisuals.delete(id);
      }
    }
    for (const b of sim.activeBanners) {
      let bv = this.bannerVisuals.get(b.id);
      if (!bv) {
        bv = this.createBannerVisual(b);
        this.bannerVisuals.set(b.id, bv);
      }
      bv.elapsed += dt * sim.speedMultiplier;
      const keys = this.bannerKeys(b.spellId);
      const pFrames = getStripFramesSync(keys.pole);
      const aFrames = getStripFramesSync(keys.aura);
      if (pFrames && pFrames.length > 0) {
        bv.poleSprite.spriteFrame = pFrames[Math.floor(bv.elapsed * 10) % pFrames.length];
      }
      if (aFrames && aFrames.length > 0) {
        bv.auraSprite.spriteFrame = aFrames[Math.floor(bv.elapsed * 12) % aFrames.length];
      }
    }
  }

  updateEffects(dt: number): void {
    for (let i = this.stripVfx.length - 1; i >= 0; i--) {
      const fx = this.stripVfx[i];
      fx.elapsed += dt;
      const idx = Math.floor(fx.elapsed * fx.fps);
      if (idx >= fx.frames.length * fx.loopCount) {
        fx.sprite.spriteFrame = null;
        this.vfxPool.put(fx.node);
        this.stripVfx.splice(i, 1);
      } else {
        fx.sprite.spriteFrame = fx.frames[idx % fx.frames.length];
      }
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.elapsed += dt;
      const p = ft.node.position;
      ft.node.setPosition(p.x, p.y + 28 * dt);
      if (ft.elapsed >= ft.duration) {
        this.floatTextPool.put(ft.node);
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  /** Recycles pooled VFX/text nodes BEFORE layers are cleared on level rebuild. */
  recycleAll(): void {
    for (const fx of this.stripVfx) {
      fx.sprite.spriteFrame = null;
      this.vfxPool.put(fx.node);
    }
    this.stripVfx = [];
    for (const ft of this.floatingTexts) {
      this.floatTextPool.put(ft.node);
    }
    this.floatingTexts = [];
    this.bannerVisuals.clear();
  }

  destroy(): void {
    this.vfxPool.clear();
    this.floatTextPool.clear();
  }

  private acquireVfxNode(
    entry: SpriteAssetEntry,
    pos: { x: number; y: number },
    scale: number,
    firstFrame: SpriteFrame,
  ): { node: Node; sp: Sprite } {
    let n = this.vfxPool.get();
    let sp: Sprite;
    if (n) {
      sp = n.getComponent(Sprite)!;
    } else {
      n = createUiNode('VFX_Pooled', undefined, entry.frameWidth, entry.frameHeight, entry.anchorX, entry.anchorY);
      sp = n.addComponent(Sprite);
      sp.sizeMode = Sprite.SizeMode.RAW;
    }
    n.name = `VFX_${entry.path}`;
    const tr = n.getComponent(UITransform)!;
    tr.setContentSize(entry.frameWidth, entry.frameHeight);
    tr.setAnchorPoint(entry.anchorX, entry.anchorY);
    n.setPosition(pos.x, pos.y);
    n.setScale(scale, scale, 1);
    sp.spriteFrame = firstFrame;
    this.vfxLayer.addChild(n);
    return { node: n, sp };
  }

  private acquireFloatTextNode(pos: { x: number; y: number }, text: string, color: Color): { node: Node; label: Label } {
    let n = this.floatTextPool.get();
    let lbl: Label;
    if (n) {
      lbl = n.getComponent(Label)!;
    } else {
      n = createUiNode('FloatTxt', undefined, 240, 28);
      lbl = n.addComponent(Label);
      lbl.fontSize = 15;
      lbl.lineHeight = 20;
      lbl.isBold = true;
    }
    n.setPosition(pos.x, pos.y);
    lbl.string = text;
    lbl.color = color;
    this.vfxLayer.addChild(n);
    return { node: n, label: lbl };
  }

  private async spawnStripVfx(key: string, flashX: number, flashY: number, scale = 0.75, fps = 16): Promise<void> {
    const entry = SPRITE_MANIFEST[key];
    if (!entry) return;
    const frames = await getStripFrames(key);
    if (!this.vfxLayer.isValid || frames.length === 0) return;
    const pos = flashToCocos(flashX, flashY);
    const { node, sp } = this.acquireVfxNode(entry, pos, scale, frames[0]);
    this.stripVfx.push({ node, sprite: sp, frames, elapsed: 0, fps, loopCount: 1 });
  }

  private spawnFloatingText(flashX: number, flashY: number, text: string, color: Color): void {
    const pos = flashToCocos(flashX, flashY);
    const { node, label } = this.acquireFloatTextNode(pos, text, color);
    this.floatingTexts.push({ node, label, elapsed: 0, duration: 1.4 });
  }

  private bannerKeys(spellId: BannerSpellId): { pole: string; aura: string; ring: Color } {
    if (spellId === 'banner_heroism') {
      return { pole: 'vfx/banner_heroism', aura: 'vfx/banner_aura_heroism', ring: new Color(255, 200, 65, 190) };
    }
    if (spellId === 'banner_bloodlust') {
      return { pole: 'vfx/banner_bloodlust', aura: 'vfx/banner_aura_bloodlust', ring: new Color(240, 75, 75, 190) };
    }
    if (spellId === 'banner_liberation') {
      return { pole: 'vfx/banner_liberation', aura: 'vfx/banner_aura_liberation', ring: new Color(135, 220, 255, 190) };
    }
    if (spellId === 'banner_desecration') {
      return { pole: 'vfx/banner_desecration', aura: 'vfx/banner_aura_desecration', ring: new Color(195, 95, 240, 190) };
    }
    return { pole: 'vfx/banner_heal', aura: 'vfx/banner_aura_heal', ring: new Color(110, 235, 165, 190) };
  }

  private createBannerVisual(b: ActiveBannerState): BannerVisual {
    const pos = flashToCocos(b.flashX, b.flashY);
    const root = createUiNode(`Banner_${b.id}`, this.bannerLayer, 180, 180);
    root.setPosition(pos.x, pos.y);

    const keys = this.bannerKeys(b.spellId);
    const ringG = root.addComponent(Graphics);
    ringG.strokeColor = keys.ring;
    ringG.lineWidth = 2;
    ringG.circle(0, 0, b.radius * MAP_TO_COCOS_SCALE);
    ringG.stroke();

    const auraN = createUiNode('Aura', root, 96, 96);
    const auraSprite = auraN.addComponent(Sprite);
    auraSprite.sizeMode = Sprite.SizeMode.RAW;
    auraN.setScale(0.95, 0.95, 1);

    const pEntry = SPRITE_MANIFEST[keys.pole] ?? SPRITE_MANIFEST['vfx/banner_heal'];
    const poleN = createUiNode('Pole', root, pEntry.frameWidth, pEntry.frameHeight, pEntry.anchorX, pEntry.anchorY);
    poleN.setScale(this.swfToCocosScale, this.swfToCocosScale, 1);
    const poleSprite = poleN.addComponent(Sprite);
    poleSprite.sizeMode = Sprite.SizeMode.RAW;

    return {
      id: b.id,
      root,
      poleSprite,
      auraSprite,
      ringG,
      spellId: b.spellId,
      elapsed: 0,
    };
  }
}
