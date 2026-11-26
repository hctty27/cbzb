import { Color, EventMouse, EventTouch, Graphics, Label, Node, Sprite, SpriteFrame, UITransform } from 'cc';
import {
  COCOS_DESIGN_HEIGHT,
  COCOS_DESIGN_WIDTH,
  cocosToFlash,
  dist,
  flashToCocos,
  MAP_TO_COCOS_SCALE,
} from '../core/CoordTransform';
import { SPRITE_MANIFEST } from '../data/AssetManifest';
import { ALL_SPELLS } from '../data/SpellsData';
import { ActiveBannerState, BannerSpellId, SimEventPayload, SpellId, SquadStateModel, StrongholdState } from '../data/Types';
import { UNIT_DEFS } from '../data/UnitsData';
import { BattleSim } from '../sim/BattleSim';
import { countAliveUnits, getSquadTotalHp } from '../sim/CombatMath';
import { AudioManager } from './AudioManager';
import { HudSelection } from './HudView';
import { createUiNode, getStaticSpriteFrame, getStripFrames, getStripFramesSync } from './SpriteLoader';

interface StrongholdVisual {
  id: string;
  node: Node;
  sprite: Sprite;
  hpBar: Graphics;
  lvlLabel: Label;
  lastAppearanceKey: string;
}

interface BuildSiteVisual {
  id: string;
  node: Node;
  sprite: Sprite;
  lastKey: string;
}

interface ChestVisual {
  id: string;
  node: Node;
}

interface SquadVisual {
  id: number;
  root: Node;
  members: Array<{ node: Node; sprite: Sprite }>;
  hpBar: Graphics;
  countLbl: Label;
  animElapsed: number;
}

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
  elapsed: number;
  duration: number;
}

const SWF_MAP_EXPORT_ZOOM = 1.5;
const SWF_TO_COCOS_SCALE = MAP_TO_COCOS_SCALE / SWF_MAP_EXPORT_ZOOM; // 1.2 / 1.5 = 0.8

const FACTION_COLOR_NAME: Record<string, string> = {
  Westaria: 'green',
  TheEmpire: 'purple',
  TheKhaganate: 'red',
  TheCult: 'blue',
};

const FACTION_HP_COLORS: Record<string, Color> = {
  Westaria: new Color(75, 220, 95, 255),
  TheEmpire: new Color(195, 90, 240, 255),
  TheKhaganate: new Color(235, 75, 75, 255),
  TheCult: new Color(80, 175, 245, 255),
  Bandits: new Color(235, 175, 65, 255),
};

export class BattleView {
  readonly root: Node;
  private worldLayer!: Node;
  private mapNode!: Node;
  private mapSprite!: Sprite;
  private pathG!: Graphics;
  private selectG!: Graphics;
  private strongholdLayer!: Node;
  private bannerLayer!: Node;
  private unitLayer!: Node;
  private vfxLayer!: Node;

  private strongholdVisuals = new Map<string, StrongholdVisual>();
  private siteVisuals = new Map<string, BuildSiteVisual>();
  private chestVisuals = new Map<string, ChestVisual>();
  private squadVisuals = new Map<number, SquadVisual>();
  private bannerVisuals = new Map<number, BannerVisual>();
  private stripVfx: StripVfx[] = [];
  private floatingTexts: FloatingText[] = [];

  private selection: HudSelection = { strongholdId: null, buildSiteId: null, squadId: null };
  private activeSpell: SpellId | null = null;
  private hoverFlash: { x: number; y: number } | null = null;
  private unsubSim: (() => void) | null = null;

  constructor(
    parent: Node,
    private sim: BattleSim,
    private audio: AudioManager,
    private onSelectionChange: (sel: HudSelection) => void,
    private onSpellModeChange?: (spell: SpellId | null) => void,
  ) {
    this.root = createUiNode('BattleView', parent, COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT);
    this.buildLayers();
    this.bindInput();
    this.rebuildWorldEntities();
    this.unsubSim = this.sim.events.on('event', (ev) => this.handleSimEvent(ev));
  }

  private buildLayers(): void {
    const sky = createUiNode('SkyBackdrop', this.root, COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT);
    const sg = sky.addComponent(Graphics);
    sg.fillColor = new Color(210, 232, 245, 255);
    sg.rect(-640, -360, 1280, 720);
    sg.fill();
    sg.fillColor = new Color(230, 244, 252, 210);
    sg.rect(-640, -120, 1280, 480);
    sg.fill();

    this.worldLayer = createUiNode('WorldLayer', this.root, COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT);

    const mapEntry = SPRITE_MANIFEST[this.sim.levelDef.bgKey] ?? SPRITE_MANIFEST['map/level1_bg'];
    this.mapNode = createUiNode('LevelBg', this.worldLayer, mapEntry.width, mapEntry.height, mapEntry.anchorX, mapEntry.anchorY);
    const originPos = flashToCocos(0, 0);
    this.mapNode.setPosition(originPos.x, originPos.y);
    this.mapNode.setScale(SWF_TO_COCOS_SCALE, SWF_TO_COCOS_SCALE, 1);
    this.mapSprite = this.mapNode.addComponent(Sprite);
    this.mapSprite.sizeMode = Sprite.SizeMode.RAW;

    // Soft atmospheric veil over +-480 sky rectangle border
    const veil = createUiNode('SkySeamVeil', this.worldLayer, COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT);
    const vg = veil.addComponent(Graphics);
    for (const side of [-1, 1]) {
      const seamX = side * 480;
      const bands = [
        { offset: -22, w: 32, a: 45 },
        { offset: -10, w: 28, a: 95 },
        { offset: 4, w: 34, a: 145 },
        { offset: 22, w: 40, a: 90 },
      ];
      for (const b of bands) {
        vg.fillColor = new Color(220, 238, 248, b.a);
        vg.rect(seamX + side * b.offset - b.w * 0.5, -360, b.w, 720);
        vg.fill();
      }
    }

    this.pathG = createUiNode('PathOverlay', this.worldLayer, COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT).addComponent(Graphics);
    this.selectG = createUiNode('SelectOverlay', this.worldLayer, COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT).addComponent(Graphics);

    this.strongholdLayer = createUiNode('StrongholdLayer', this.worldLayer, COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT);
    this.bannerLayer = createUiNode('BannerLayer', this.worldLayer, COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT);
    this.unitLayer = createUiNode('UnitLayer', this.worldLayer, COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT);
    this.vfxLayer = createUiNode('VfxLayer', this.worldLayer, COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT);
  }

  private drawBaseRoads(): void {
    const g = this.pathG;
    g.clear();
    g.strokeColor = new Color(255, 245, 205, 72);
    g.lineWidth = 2;
    const nodeMap = new Map(this.sim.levelDef.nodes.map((n) => [n.id, n]));
    for (const edge of this.sim.levelDef.edges) {
      const a = nodeMap.get(edge.from);
      const b = nodeMap.get(edge.to);
      if (!a || !b) continue;
      const pts = [{ x: a.flashX, y: a.flashY }, ...edge.waypoints, { x: b.flashX, y: b.flashY }];
      const p0 = flashToCocos(pts[0].x, pts[0].y);
      g.moveTo(p0.x, p0.y);
      for (let i = 1; i < pts.length; i++) {
        const pi = flashToCocos(pts[i].x, pts[i].y);
        g.lineTo(pi.x, pi.y);
      }
      g.stroke();
    }
  }

  setActiveSpell(spellId: SpellId | null): void {
    this.activeSpell = spellId;
    this.onSpellModeChange?.(spellId);
  }

  getActiveSpell(): SpellId | null {
    return this.activeSpell;
  }

  private bindInput(): void {
    const handleMapClick = (uiX: number, uiY: number, isRightClick: boolean) => {
      this.audio.retryMusicOnGesture();
      const localX = uiX - COCOS_DESIGN_WIDTH * 0.5;
      const localY = uiY - COCOS_DESIGN_HEIGHT * 0.5;
      if (localY > COCOS_DESIGN_HEIGHT * 0.5 - 52) return;
      const fl = cocosToFlash(localX, localY);

      if (this.activeSpell) {
        if (isRightClick) {
          this.setActiveSpell(null);
          return;
        }
        const spell = this.activeSpell;
        this.setActiveSpell(null);
        this.sim.castSpell(this.sim.playerFaction, spell, fl.x, fl.y);
        return;
      }

      if (isRightClick && this.selection.squadId) {
        this.orderSelectedSquad(fl.x, fl.y);
        return;
      }

      const pFaction = this.sim.playerFaction;

      // 1. Prioritize player squad when closer than stronghold hitbox
      const hitPlayerSquad = this.sim.squads.find(
        (sq) => sq.owner === pFaction && sq.state !== 'Dead' && dist(sq.flashX, sq.flashY, fl.x, fl.y) <= 28,
      );
      const hitFort = this.sim.strongholds.find((sh) => dist(sh.flashX, sh.flashY, fl.x, fl.y) <= 42);

      if (
        hitPlayerSquad &&
        (!hitFort || dist(hitPlayerSquad.flashX, hitPlayerSquad.flashY, fl.x, fl.y) <= dist(hitFort.flashX, hitFort.flashY, fl.x, fl.y) + 6)
      ) {
        this.selection = { strongholdId: null, buildSiteId: null, squadId: hitPlayerSquad.id };
        this.audio.playSfx('ui_click');
        this.onSelectionChange(this.selection);
        return;
      }

      // 2. Click on Stronghold
      if (hitFort) {
        if (hitFort.owner === pFaction) {
          this.selection = { strongholdId: hitFort.id, buildSiteId: null, squadId: null };
          this.audio.playSfx('ui_click');
          this.onSelectionChange(this.selection);
          return;
        }
        if (this.selection.squadId) {
          this.orderSelectedSquad(hitFort.flashX, hitFort.flashY, hitFort.id);
          return;
        }
      }

      // 3. Click on owned empty BuildSite
      const hitSite = this.sim.buildSites.find(
        (bs) => bs.owner === pFaction && bs.supplyKind === 'Empty' && dist(bs.flashX, bs.flashY, fl.x, fl.y) <= 34,
      );
      if (hitSite) {
        this.selection = { strongholdId: null, buildSiteId: hitSite.id, squadId: null };
        this.audio.playSfx('ui_click');
        this.onSelectionChange(this.selection);
        return;
      }

      // 4. Click on Hostile/Bandit squad while player squad selected -> intercept!
      if (this.selection.squadId) {
        const hitEnemy = this.sim.squads.find(
          (sq) => sq.owner !== pFaction && sq.state !== 'Dead' && dist(sq.flashX, sq.flashY, fl.x, fl.y) <= 36,
        );
        if (hitEnemy) {
          this.sim.orderSquadToAttackSquad(this.selection.squadId, hitEnemy.id);
          this.playSendSound(this.selection.squadId);
          return;
        }
      }

      // 5. Fallback player squad wider radius
      const hitPlayerWide = this.sim.squads.find(
        (sq) => sq.owner === pFaction && sq.state !== 'Dead' && dist(sq.flashX, sq.flashY, fl.x, fl.y) <= 36,
      );
      if (hitPlayerWide) {
        this.selection = { strongholdId: null, buildSiteId: null, squadId: hitPlayerWide.id };
        this.audio.playSfx('ui_click');
        this.onSelectionChange(this.selection);
        return;
      }

      // 6. Move selected squad or march to clicked chest/ground
      if (this.selection.squadId) {
        this.orderSelectedSquad(fl.x, fl.y);
        return;
      }

      this.selection = { strongholdId: null, buildSiteId: null, squadId: null };
      this.onSelectionChange(this.selection);
    };

    this.root.on(Node.EventType.TOUCH_END, (ev: EventTouch) => {
      const loc = ev.getUILocation();
      handleMapClick(loc.x, loc.y, false);
    });

    this.root.on(Node.EventType.MOUSE_DOWN, (ev: EventMouse) => {
      if (ev.getButton() === EventMouse.BUTTON_RIGHT) {
        const loc = ev.getUILocation();
        handleMapClick(loc.x, loc.y, true);
      }
    });

    this.root.on(Node.EventType.MOUSE_MOVE, (ev: EventMouse) => {
      if (!this.activeSpell) {
        this.hoverFlash = null;
        return;
      }
      const loc = ev.getUILocation();
      this.hoverFlash = cocosToFlash(loc.x - COCOS_DESIGN_WIDTH * 0.5, loc.y - COCOS_DESIGN_HEIGHT * 0.5);
    });
  }

  private playSendSound(squadId: number): void {
    const sq = this.sim.squads.find((s) => s.id === squadId);
    if (!sq) return;
    if (sq.defId === 'b_gunbots' || sq.defId === 'b_giantbots') {
      this.audio.playSfx('send_bots');
      return;
    }
    if (sq.defId === 'b_dragon_lancers') {
      this.audio.playSfx('send_reptiles');
      return;
    }
    const uc = UNIT_DEFS[sq.defId].unitClass;
    const key = uc === 'Cavalry' ? 'send_horses' : uc === 'Siege' ? 'send_siege' : 'send_soldiers';
    this.audio.playSfx(key);
  }

  private orderSelectedSquad(fx: number, fy: number, targetNodeId?: string): void {
    if (!this.selection.squadId) return;
    const ok = targetNodeId
      ? this.sim.orderSquadToNode(this.selection.squadId, targetNodeId)
      : this.sim.orderSquadToPoint(this.selection.squadId, fx, fy);
    if (ok) this.playSendSound(this.selection.squadId);
  }

  sendSelectedSquadToNearestEnemy(): void {
    if (!this.selection.squadId) return;
    const sq = this.sim.squads.find((s) => s.id === this.selection.squadId && s.state !== 'Dead');
    if (!sq) return;
    const enemyForts = this.sim.strongholds.filter((s) => s.owner !== this.sim.playerFaction && s.owner !== 'Bandits');
    if (enemyForts.length === 0) return;
    let best = enemyForts[0];
    let bestD = Infinity;
    for (const f of enemyForts) {
      const d = dist(sq.flashX, sq.flashY, f.flashX, f.flashY);
      if (d < bestD) {
        bestD = d;
        best = f;
      }
    }
    this.orderSelectedSquad(best.flashX, best.flashY, best.id);
  }

  clearSelection(): void {
    this.selection = { strongholdId: null, buildSiteId: null, squadId: null };
    this.setActiveSpell(null);
    this.onSelectionChange(this.selection);
  }

  rebuildWorldEntities(): void {
    const bgKey = this.sim.levelDef.bgKey;
    const mapEntry = SPRITE_MANIFEST[bgKey] ?? SPRITE_MANIFEST['map/level1_bg'];
    const mapTr = this.mapNode.getComponent(UITransform)!;
    mapTr.setContentSize(mapEntry.width, mapEntry.height);
    mapTr.setAnchorPoint(mapEntry.anchorX, mapEntry.anchorY);
    this.mapSprite.spriteFrame = null;
    getStaticSpriteFrame(bgKey).then((sf) => {
      if (this.mapNode.isValid) this.mapSprite.spriteFrame = sf;
    });

    this.drawBaseRoads();

    this.strongholdLayer.removeAllChildren();
    this.bannerLayer.removeAllChildren();
    this.unitLayer.removeAllChildren();
    this.vfxLayer.removeAllChildren();
    this.strongholdVisuals.clear();
    this.siteVisuals.clear();
    this.chestVisuals.clear();
    this.squadVisuals.clear();
    this.bannerVisuals.clear();
    this.stripVfx = [];
    this.floatingTexts = [];
    this.activeSpell = null;

    for (const sh of this.sim.strongholds) {
      const pos = flashToCocos(sh.flashX, sh.flashY);
      const node = createUiNode(`SH_${sh.id}`, this.strongholdLayer, 80, 80);
      node.setPosition(pos.x, pos.y);
      const sp = node.addComponent(Sprite);
      sp.sizeMode = Sprite.SizeMode.RAW;
      node.setScale(SWF_TO_COCOS_SCALE, SWF_TO_COCOS_SCALE, 1);

      const uiOverlay = createUiNode(`SH_UI_${sh.id}`, this.strongholdLayer, 90, 40);
      uiOverlay.setPosition(pos.x, pos.y - 46);
      const hpBar = uiOverlay.addComponent(Graphics);
      const lvlNode = createUiNode('Lvl', uiOverlay, 60, 18);
      lvlNode.setPosition(0, 14);
      const lvlLabel = lvlNode.addComponent(Label);
      lvlLabel.fontSize = 11;
      lvlLabel.isBold = true;
      lvlLabel.color = new Color(255, 224, 120, 255);

      this.strongholdVisuals.set(sh.id, {
        id: sh.id,
        node,
        sprite: sp,
        hpBar,
        lvlLabel,
        lastAppearanceKey: '',
      });
    }

    for (const bs of this.sim.buildSites) {
      const pos = flashToCocos(bs.flashX, bs.flashY);
      const node = createUiNode(`BS_${bs.id}`, this.strongholdLayer, 50, 50);
      node.setPosition(pos.x, pos.y);
      const sp = node.addComponent(Sprite);
      sp.sizeMode = Sprite.SizeMode.RAW;
      node.setScale(SWF_TO_COCOS_SCALE, SWF_TO_COCOS_SCALE, 1);
      this.siteVisuals.set(bs.id, { id: bs.id, node, sprite: sp, lastKey: '' });
    }

    for (const ch of this.sim.chests) {
      const pos = flashToCocos(ch.flashX, ch.flashY);
      const entry = SPRITE_MANIFEST['map/chest'];
      const node = createUiNode(`Chest_${ch.id}`, this.strongholdLayer, entry.width, entry.height, entry.anchorX, entry.anchorY);
      node.setPosition(pos.x, pos.y);
      node.setScale(SWF_TO_COCOS_SCALE, SWF_TO_COCOS_SCALE, 1);
      const sp = node.addComponent(Sprite);
      sp.sizeMode = Sprite.SizeMode.RAW;
      getStaticSpriteFrame('map/chest').then((sf) => {
        if (node.isValid) sp.spriteFrame = sf;
      });
      this.chestVisuals.set(ch.id, { id: ch.id, node });
    }
  }

  private getStrongholdTextureKey(sh: StrongholdState): string {
    const color = FACTION_COLOR_NAME[sh.owner] ?? 'purple';
    const base =
      sh.kind === 'Castle'
        ? 'castle'
        : sh.kind === 'Town'
          ? 'town'
          : sh.kind === 'Camp'
            ? 'camp'
            : 'magictower';
    const razed = sh.hp < sh.maxHp * 0.4 ? '_raze' : '';
    return `buildings/${base}_${color}${razed}`;
  }

  private handleSimEvent(ev: SimEventPayload): void {
    if (ev.type === 'attack_hit') {
      if (ev.unitClass === 'Archers') this.audio.playSfx('attack_bow', 250);
      else if (ev.unitClass === 'Siege') {
        this.audio.playSfx('attack_siege', 400);
        if (ev.flashX !== undefined && ev.flashY !== undefined) {
          this.spawnStripVfx('vfx/explosion', ev.flashX, ev.flashY, 0.7, 18);
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
        this.spawnStripVfx('vfx/explosion', ev.flashX, ev.flashY, 0.7, 18);
      }
    } else if (ev.type === 'squad_level_up') {
      this.audio.playSfx('squad_level_up', 250);
      if (ev.flashX !== undefined && ev.flashY !== undefined) {
        this.spawnFloatingText(ev.flashX, ev.flashY - 14, 'VETERAN UP!', new Color(255, 224, 90, 255));
      }
    } else if (ev.type === 'stronghold_captured') {
      this.audio.playSfx('capture_stronghold', 100);
      if (ev.flashX !== undefined && ev.flashY !== undefined) {
        this.spawnStripVfx('vfx/explosion', ev.flashX, ev.flashY, 0.9, 18);
      }
    } else if (ev.type === 'spell_cast' && ev.spellId) {
      const fx = ev.flashX ?? 400;
      const fy = ev.flashY ?? 300;
      if (ev.spellId === 'lords_judgement') {
        this.audio.playSfx('spell_lords_judgement', 100);
        this.spawnStripVfx('vfx/spell_thunder', fx, fy, 1.0, 14);
        this.spawnFloatingText(fx, fy - 12, "LORD'S JUDGEMENT!", new Color(255, 235, 130, 255));
      } else if (ev.spellId === 'summon_stoneworms') {
        this.audio.playSfx('spell_stoneworms', 100);
        this.spawnStripVfx('vfx/stoneworms', fx, fy, 1.0, 14);
        this.spawnFloatingText(fx, fy - 12, 'STONEWORMS!', new Color(245, 175, 95, 255));
      } else if (ev.spellId === 'disentomb' || ev.spellId === 'raise_the_dead') {
        this.audio.playSfx('spell_disentomb', 100);
        this.spawnStripVfx('vfx/raise_dead', fx, fy, 1.0, 14);
        this.spawnFloatingText(
          fx,
          fy - 14,
          ev.spellId === 'disentomb' ? 'IMMORTALS RISEN!' : 'UNDEAD RAISED!',
          new Color(205, 150, 255, 255),
        );
      } else if (ev.spellId === 'ice_blast') {
        this.audio.playSfx('spell_ice_blast', 100);
        this.audio.playSfx('unit_frozen', 200);
        this.spawnStripVfx('vfx/ice_blast', fx, fy, 1.0, 14);
        this.spawnFloatingText(fx, fy - 14, 'FROZEN!', new Color(135, 225, 255, 255));
      } else if (ev.spellId === 'frost_enchantment') {
        this.audio.playSfx('spell_frost_enchant', 100);
        this.spawnStripVfx('vfx/frost_enchant', fx, fy, 1.0, 14);
        this.spawnFloatingText(fx, fy - 14, 'FROST ENCHANT!', new Color(165, 235, 255, 255));
      } else if (ev.spellId === 'terror') {
        this.audio.playSfx('spell_terror', 100);
        this.audio.playSfx('unit_feared', 200);
        this.spawnStripVfx('vfx/terror_splash', fx, fy, 1.0, 14);
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
        for (const sh of this.sim.strongholds) {
          this.spawnStripVfx('vfx/explosion', sh.flashX, sh.flashY, 1.15, 16);
        }
        this.spawnFloatingText(400, 280, 'CATACLYSM!', new Color(255, 120, 75, 255));
      } else if (ev.spellId === 'grand_transformation') {
        this.audio.playSfx('ultimate_transformation', 100);
        this.spawnStripVfx('vfx/grand_transform', fx, fy, 1.15, 14);
        this.spawnFloatingText(
          fx,
          fy - 22,
          `TRANSFORMATION +${ev.goldAmount ?? 0}G/M!`,
          new Color(140, 230, 255, 255),
        );
      } else if (ev.spellId === 'call_of_the_grave') {
        this.audio.playSfx('ultimate_undead', 100);
        this.spawnStripVfx('vfx/grand_transform', fx, fy, 1.0, 14);
      } else {
        this.audio.playSfx('ultimate_avatar', 100);
        this.spawnStripVfx('vfx/sign_of_advent', fx, fy, 0.95, 14);
        this.spawnFloatingText(fx, fy - 22, "LORD'S AVATAR!", new Color(255, 224, 100, 255));
      }
    } else if (ev.type === 'chest_collected') {
      this.audio.playSfx('chest_open', 100);
      this.audio.playSfx('chest_gold', 100);
      if (ev.flashX !== undefined && ev.flashY !== undefined) {
        this.spawnFloatingText(ev.flashX, ev.flashY - 10, `+${ev.goldAmount ?? 500} GOLD!`, new Color(255, 225, 85, 255));
      }
    }
  }

  private async spawnStripVfx(key: string, flashX: number, flashY: number, scale = 0.75, fps = 16): Promise<void> {
    const entry = SPRITE_MANIFEST[key];
    if (!entry) return;
    const frames = await getStripFrames(key);
    if (!this.vfxLayer.isValid) return;
    const pos = flashToCocos(flashX, flashY);
    const n = createUiNode(`VFX_${key}`, this.vfxLayer, entry.frameWidth, entry.frameHeight, entry.anchorX, entry.anchorY);
    n.setPosition(pos.x, pos.y);
    n.setScale(scale, scale, 1);
    const sp = n.addComponent(Sprite);
    sp.sizeMode = Sprite.SizeMode.RAW;
    sp.spriteFrame = frames[0];
    this.stripVfx.push({ node: n, sprite: sp, frames, elapsed: 0, fps, loopCount: 1 });
  }

  private spawnFloatingText(flashX: number, flashY: number, text: string, color: Color): void {
    const pos = flashToCocos(flashX, flashY);
    const n = createUiNode('FloatTxt', this.vfxLayer, 200, 28);
    n.setPosition(pos.x, pos.y);
    const lbl = n.addComponent(Label);
    lbl.string = text;
    lbl.fontSize = 15;
    lbl.isBold = true;
    lbl.color = color;
    this.floatingTexts.push({ node: n, elapsed: 0, duration: 1.4 });
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
    poleN.setScale(SWF_TO_COCOS_SCALE, SWF_TO_COCOS_SCALE, 1);
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

  updateView(dt: number): void {
    // 1. Strongholds
    for (const sh of this.sim.strongholds) {
      const vis = this.strongholdVisuals.get(sh.id);
      if (!vis) continue;
      const key = this.getStrongholdTextureKey(sh);
      if (key !== vis.lastAppearanceKey) {
        vis.lastAppearanceKey = key;
        const entry = SPRITE_MANIFEST[key];
        if (entry) {
          vis.node.getComponent(UITransform)!.setAnchorPoint(entry.anchorX, entry.anchorY);
          getStaticSpriteFrame(key).then((sf) => {
            if (vis.node.isValid) vis.sprite.spriteFrame = sf;
          });
        }
      }
      const ratio = Math.max(0, Math.min(1, sh.hp / sh.maxHp));
      const g = vis.hpBar;
      g.clear();
      g.fillColor = new Color(15, 15, 20, 220);
      g.roundRect(-34, -4, 68, 8, 3);
      g.fill();
      g.fillColor = FACTION_HP_COLORS[sh.owner] ?? FACTION_HP_COLORS.TheEmpire;
      g.roundRect(-32, -2.5, 64 * ratio, 5, 2);
      g.fill();
      vis.lvlLabel.string = sh.level > 0 ? '★'.repeat(sh.level) : '';
    }

    // 2. BuildSites & Chests
    for (const bs of this.sim.buildSites) {
      const vis = this.siteVisuals.get(bs.id);
      if (!vis) continue;
      let key = 'map/build_site';
      if (bs.supplyKind !== 'Empty') {
        const col = FACTION_COLOR_NAME[bs.owner] ?? 'purple';
        key = `buildings/${bs.supplyKind.toLowerCase()}_${col}`;
      }
      if (key !== vis.lastKey) {
        vis.lastKey = key;
        const entry = SPRITE_MANIFEST[key];
        if (entry) {
          vis.node.getComponent(UITransform)!.setAnchorPoint(entry.anchorX, entry.anchorY);
          getStaticSpriteFrame(key).then((sf) => {
            if (vis.node.isValid) vis.sprite.spriteFrame = sf;
          });
        }
      }
    }

    for (const ch of this.sim.chests) {
      const cv = this.chestVisuals.get(ch.id);
      if (cv) cv.node.active = !ch.collected;
    }

    // 3. Active Banners
    const activeBannerIds = new Set(this.sim.activeBanners.map((b) => b.id));
    for (const [id, bv] of [...this.bannerVisuals.entries()]) {
      if (!activeBannerIds.has(id)) {
        bv.root.destroy();
        this.bannerVisuals.delete(id);
      }
    }
    for (const b of this.sim.activeBanners) {
      let bv = this.bannerVisuals.get(b.id);
      if (!bv) {
        bv = this.createBannerVisual(b);
        this.bannerVisuals.set(b.id, bv);
      }
      bv.elapsed += dt * this.sim.speedMultiplier;
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

    // 4. Squads
    const activeIds = new Set(this.sim.squads.map((s) => s.id));
    for (const [id, vis] of [...this.squadVisuals.entries()]) {
      if (!activeIds.has(id)) {
        vis.root.destroy();
        this.squadVisuals.delete(id);
      }
    }

    for (const sq of this.sim.squads) {
      let vis = this.squadVisuals.get(sq.id);
      if (!vis) {
        vis = this.createSquadVisual(sq);
        this.squadVisuals.set(sq.id, vis);
      }
      const pos = flashToCocos(sq.flashX, sq.flashY);
      vis.root.setPosition(pos.x, pos.y);
      vis.animElapsed += dt * this.sim.speedMultiplier;

      const def = UNIT_DEFS[sq.defId];
      const phase = sq.animPhase === 'attack' ? 'attack' : 'go';
      const animKey = `${def.spritePrefix}/${sq.facing}_${phase}`;
      const stripEntry = SPRITE_MANIFEST[animKey];
      if (stripEntry) {
        const fps = phase === 'attack' ? 10 : sq.state === 'Move' ? 12 : 3;
        const frameIdx = sq.state === 'Stand' ? 0 : Math.floor(vis.animElapsed * fps) % stripEntry.frameCount;
        const frames = getStripFramesSync(animKey);
        for (let i = 0; i < sq.members.length && i < vis.members.length; i++) {
          const m = sq.members[i];
          const mv = vis.members[i];
          mv.node.active = m.alive;
          if (m.alive && frames) {
            mv.node.getComponent(UITransform)!.setAnchorPoint(stripEntry.anchorX, stripEntry.anchorY);
            mv.sprite.spriteFrame = frames[(frameIdx + i) % frames.length];
          }
        }
      }

      const hp = getSquadTotalHp(sq);
      const alive = countAliveUnits(sq);
      const ratio = hp.maxHp > 0 ? hp.hp / hp.maxHp : 0;
      const g = vis.hpBar;
      g.clear();
      const ringCol =
        sq.frozenTimer > 0
          ? new Color(110, 225, 255, 240)
          : sq.bloodlustTimer > 0
            ? new Color(245, 75, 75, 235)
            : sq.frostEnchantTimer > 0
              ? new Color(155, 215, 255, 235)
              : sq.liberationTimer > 0
                ? new Color(255, 250, 195, 235)
                : sq.heroicTimer > 0
                  ? new Color(255, 220, 75, 230)
                  : sq.poisonTimer > 0
                    ? new Color(105, 215, 70, 220)
                    : sq.fearTimer > 0
                      ? new Color(185, 95, 235, 220)
                      : null;
      if (ringCol) {
        g.strokeColor = ringCol;
        g.lineWidth = 2;
        g.circle(0, 0, 26);
        g.stroke();
      }
      g.fillColor = new Color(15, 15, 22, 220);
      g.roundRect(-22, 24, 44, 6, 2);
      g.fill();
      g.fillColor = FACTION_HP_COLORS[sq.owner] ?? FACTION_HP_COLORS.TheEmpire;
      g.roundRect(-21, 25, 42 * ratio, 4, 1.5);
      g.fill();
      vis.countLbl.string = sq.isAvatar && sq.lifetimeSec !== null ? `${Math.ceil(sq.lifetimeSec)}s` : `${alive}`;
    }

    // 5. Selection & Spell Target Preview
    this.selectG.clear();
    if (this.activeSpell) {
      const targetPos = this.hoverFlash ? flashToCocos(this.hoverFlash.x, this.hoverFlash.y) : { x: 0, y: 0 };
      const rad = Math.min(240, ALL_SPELLS[this.activeSpell].radius * MAP_TO_COCOS_SCALE);
      this.selectG.strokeColor = new Color(255, 224, 90, 235);
      this.selectG.fillColor = new Color(255, 224, 90, 36);
      this.selectG.lineWidth = 3;
      this.selectG.circle(targetPos.x, targetPos.y, rad);
      this.selectG.fill();
      this.selectG.stroke();
    } else {
      if (this.selection.strongholdId) {
        const sh = this.sim.strongholds.find((s) => s.id === this.selection.strongholdId);
        if (sh) {
          const p = flashToCocos(sh.flashX, sh.flashY);
          this.selectG.strokeColor = new Color(255, 228, 105, 230);
          this.selectG.lineWidth = 3;
          this.selectG.circle(p.x, p.y, 48);
          this.selectG.stroke();
        }
      }
      if (this.selection.buildSiteId) {
        const bs = this.sim.buildSites.find((b) => b.id === this.selection.buildSiteId);
        if (bs) {
          const p = flashToCocos(bs.flashX, bs.flashY);
          this.selectG.strokeColor = new Color(255, 228, 105, 230);
          this.selectG.lineWidth = 2.5;
          this.selectG.circle(p.x, p.y, 32);
          this.selectG.stroke();
        }
      }
      if (this.selection.squadId) {
        const sq = this.sim.squads.find((s) => s.id === this.selection.squadId && s.state !== 'Dead');
        if (sq) {
          const p = flashToCocos(sq.flashX, sq.flashY);
          this.selectG.strokeColor = new Color(115, 250, 140, 240);
          this.selectG.lineWidth = 3;
          this.selectG.circle(p.x, p.y, 32);
          this.selectG.stroke();

          if (sq.pathFlash.length > 0) {
            this.selectG.strokeColor = new Color(130, 245, 150, 190);
            this.selectG.lineWidth = 2.5;
            this.selectG.moveTo(p.x, p.y);
            for (const wp of sq.pathFlash) {
              const cw = flashToCocos(wp.x, wp.y);
              this.selectG.lineTo(cw.x, cw.y);
            }
            this.selectG.stroke();
          }
        }
      }
    }

    // 6. Strip VFX & Floating Text
    for (let i = this.stripVfx.length - 1; i >= 0; i--) {
      const fx = this.stripVfx[i];
      fx.elapsed += dt;
      const idx = Math.floor(fx.elapsed * fx.fps);
      if (idx >= fx.frames.length * fx.loopCount) {
        fx.node.destroy();
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
        ft.node.destroy();
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  private createSquadVisual(sq: SquadStateModel): SquadVisual {
    const root = createUiNode(`Squad_${sq.id}`, this.unitLayer, 60, 60);
    const members: Array<{ node: Node; sprite: Sprite }> = [];
    for (let i = 0; i < sq.members.length; i++) {
      const m = sq.members[i];
      const mn = createUiNode(`M_${i}`, root, 40, 40);
      mn.setPosition(m.offsetX * MAP_TO_COCOS_SCALE, -m.offsetY * MAP_TO_COCOS_SCALE);
      const scale = sq.isAvatar || sq.owner === 'Bandits' ? 0.92 : 0.78;
      mn.setScale(scale, scale, 1);
      const sp = mn.addComponent(Sprite);
      sp.sizeMode = Sprite.SizeMode.RAW;
      members.push({ node: mn, sprite: sp });
    }

    const hpBar = root.addComponent(Graphics);
    const cntNode = createUiNode('Cnt', root, 36, 16);
    cntNode.setPosition(-28, 26);
    const countLbl = cntNode.addComponent(Label);
    countLbl.fontSize = 11;
    countLbl.isBold = true;
    countLbl.color = new Color(255, 255, 255, 255);

    return {
      id: sq.id,
      root,
      members,
      hpBar,
      countLbl,
      animElapsed: 0,
    };
  }

  destroy(): void {
    if (this.unsubSim) this.unsubSim();
  }
}
