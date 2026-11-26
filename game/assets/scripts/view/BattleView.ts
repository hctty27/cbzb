import {
  Color,
  EventMouse,
  EventTouch,
  Graphics,
  Label,
  Node,
  NodePool,
  Sprite,
  SpriteFrame,
  sys,
  UITransform,
  view,
} from 'cc';
import {
  COCOS_DESIGN_HEIGHT,
  COCOS_DESIGN_WIDTH,
  cocosToFlash,
  dist,
  flashToCocos,
  MAP_TO_COCOS_SCALE,
} from '../core/CoordTransform';
import { SPRITE_MANIFEST, SpriteAssetEntry } from '../data/AssetManifest';
import { t } from '../data/I18n';
import { ALL_SPELLS } from '../data/SpellsData';
import { ActiveBannerState, BannerSpellId, SimEventPayload, SpellId, SquadStateModel, StrongholdState } from '../data/Types';
import { UNIT_DEFS } from '../data/UnitsData';
import { BattleSim } from '../sim/BattleSim';
import { countAliveUnits, getSquadTotalHp } from '../sim/CombatMath';
import { AudioManager } from './AudioManager';
import { HudSelection } from './HudView';
import { createUiNode, getStaticSpriteFrame, getStripFrames, getStripFramesSync, releaseTextureByKey } from './SpriteLoader';

interface StrongholdVisual {
  id: string;
  node: Node;
  sprite: Sprite;
  hpBar: Graphics;
  lvlLabel: Label;
  lastAppearanceKey: string;
  lastHp: number;
  lastMaxHp: number;
  lastOwner: string;
  lastLevel: number;
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
  lastHp: number;
  lastMaxHp: number;
  lastOwner: string;
  lastRingKey: string;
  lastCountStr: string;
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
  label: Label;
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
  private tapRipples: Array<{ x: number; y: number; elapsed: number; duration: number; color: Color }> = [];

  private vfxPool = new NodePool();
  private floatTextPool = new NodePool();
  private squadRootPool = new NodePool();
  private squadMemberPool = new NodePool();

  private selection: HudSelection = { strongholdId: null, buildSiteId: null, squadId: null };
  private activeSpell: SpellId | null = null;
  private hoverFlash: { x: number; y: number } | null = null;
  private unsubSim: (() => void) | null = null;
  private currentBgKey: string | null = null;
  private bgLoadSeq = 0;

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

  hasSelection(): boolean {
    return Boolean(this.selection.strongholdId || this.selection.buildSiteId || this.selection.squadId);
  }

  private spawnTapRipple(flashX: number, flashY: number, color: Color): void {
    this.tapRipples.push({ x: flashX, y: flashY, elapsed: 0, duration: 0.32, color });
  }

  private bindInput(): void {
    const handleMapClick = (uiX: number, uiY: number, isRightClick: boolean) => {
      this.audio.retryMusicOnGesture();
      const vis = view.getVisibleSize();
      const localX = uiX - vis.width * 0.5;
      const localY = uiY - vis.height * 0.5;
      if (localY > COCOS_DESIGN_HEIGHT * 0.5 - 52) return;
      const fl = cocosToFlash(localX, localY);
      const pad = sys.isMobile ? 8 : 0;

      if (this.activeSpell) {
        if (isRightClick) {
          this.setActiveSpell(null);
          return;
        }
        const spell = this.activeSpell;
        this.setActiveSpell(null);
        this.spawnTapRipple(fl.x, fl.y, new Color(255, 224, 95, 240));
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
        (sq) => sq.owner === pFaction && sq.state !== 'Dead' && dist(sq.flashX, sq.flashY, fl.x, fl.y) <= 28 + pad,
      );
      const hitFort = this.sim.strongholds.find((sh) => dist(sh.flashX, sh.flashY, fl.x, fl.y) <= 42 + pad);

      if (
        hitPlayerSquad &&
        (!hitFort || dist(hitPlayerSquad.flashX, hitPlayerSquad.flashY, fl.x, fl.y) <= dist(hitFort.flashX, hitFort.flashY, fl.x, fl.y) + 6)
      ) {
        this.selection = { strongholdId: null, buildSiteId: null, squadId: hitPlayerSquad.id };
        this.spawnTapRipple(hitPlayerSquad.flashX, hitPlayerSquad.flashY, new Color(240, 250, 255, 220));
        this.audio.playSfx('ui_click');
        this.onSelectionChange(this.selection);
        return;
      }

      // 2. Click on Stronghold
      if (hitFort) {
        if (hitFort.owner === pFaction) {
          this.selection = { strongholdId: hitFort.id, buildSiteId: null, squadId: null };
          this.spawnTapRipple(hitFort.flashX, hitFort.flashY, new Color(255, 232, 130, 225));
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
        (bs) => bs.owner === pFaction && bs.supplyKind === 'Empty' && dist(bs.flashX, bs.flashY, fl.x, fl.y) <= 34 + pad,
      );
      if (hitSite) {
        this.selection = { strongholdId: null, buildSiteId: hitSite.id, squadId: null };
        this.spawnTapRipple(hitSite.flashX, hitSite.flashY, new Color(255, 232, 130, 225));
        this.audio.playSfx('ui_click');
        this.onSelectionChange(this.selection);
        return;
      }

      // 4. Click on Hostile/Bandit squad while player squad selected -> intercept!
      if (this.selection.squadId) {
        const hitEnemy = this.sim.squads.find(
          (sq) => sq.owner !== pFaction && sq.state !== 'Dead' && dist(sq.flashX, sq.flashY, fl.x, fl.y) <= 36 + pad,
        );
        if (hitEnemy) {
          this.spawnTapRipple(hitEnemy.flashX, hitEnemy.flashY, new Color(255, 110, 80, 235));
          this.sim.orderSquadToAttackSquad(this.selection.squadId, hitEnemy.id);
          this.playSendSound(this.selection.squadId);
          return;
        }
      }

      // 5. Fallback player squad wider radius
      const hitPlayerWide = this.sim.squads.find(
        (sq) => sq.owner === pFaction && sq.state !== 'Dead' && dist(sq.flashX, sq.flashY, fl.x, fl.y) <= 36 + pad,
      );
      if (hitPlayerWide) {
        this.selection = { strongholdId: null, buildSiteId: null, squadId: hitPlayerWide.id };
        this.spawnTapRipple(hitPlayerWide.flashX, hitPlayerWide.flashY, new Color(240, 250, 255, 220));
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
      const vis = view.getVisibleSize();
      const loc = ev.getUILocation();
      this.hoverFlash = cocosToFlash(loc.x - vis.width * 0.5, loc.y - vis.height * 0.5);
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
    if (ok) {
      this.spawnTapRipple(fx, fy, new Color(120, 245, 145, 230));
      this.playSendSound(this.selection.squadId);
    }
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

  releaseBattleAssets(): void {
    this.bgLoadSeq++;
    this.tapRipples = [];
    if (this.mapNode?.isValid && this.mapSprite) {
      this.mapSprite.spriteFrame = null;
    }
    if (this.currentBgKey) {
      releaseTextureByKey(this.currentBgKey);
      this.currentBgKey = null;
    }
  }

  rebuildWorldEntities(): void {
    const prevBgKey = this.currentBgKey;
    const bgKey = this.sim.levelDef.bgKey;
    if (prevBgKey && prevBgKey !== bgKey) {
      if (this.mapNode?.isValid && this.mapSprite) {
        this.mapSprite.spriteFrame = null;
      }
      releaseTextureByKey(prevBgKey);
    }
    this.currentBgKey = bgKey;

    const mapEntry = SPRITE_MANIFEST[bgKey] ?? SPRITE_MANIFEST['map/level1_bg'];
    const mapTr = this.mapNode.getComponent(UITransform)!;
    mapTr.setContentSize(mapEntry.width, mapEntry.height);
    mapTr.setAnchorPoint(mapEntry.anchorX, mapEntry.anchorY);
    this.mapSprite.spriteFrame = null;
    const seq = ++this.bgLoadSeq;
    getStaticSpriteFrame(bgKey).then((sf) => {
      if (this.mapNode.isValid && seq === this.bgLoadSeq) {
        this.mapSprite.spriteFrame = sf;
      }
    });

    this.drawBaseRoads();

    // Recycle pooled visuals before clearing layers so reusable nodes aren't destroyed
    for (const vis of this.squadVisuals.values()) {
      this.recycleSquadVisual(vis);
    }
    this.squadVisuals.clear();
    for (const fx of this.stripVfx) {
      fx.sprite.spriteFrame = null;
      this.vfxPool.put(fx.node);
    }
    this.stripVfx = [];
    for (const ft of this.floatingTexts) {
      this.floatTextPool.put(ft.node);
    }
    this.floatingTexts = [];

    this.strongholdLayer.removeAllChildren();
    this.bannerLayer.removeAllChildren();
    this.unitLayer.removeAllChildren();
    this.vfxLayer.removeAllChildren();
    this.strongholdVisuals.clear();
    this.siteVisuals.clear();
    this.chestVisuals.clear();
    this.bannerVisuals.clear();
    this.tapRipples = [];
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
      lvlLabel.cacheMode = Label.CacheMode.CHAR;
      lvlLabel.color = new Color(255, 224, 120, 255);

      this.strongholdVisuals.set(sh.id, {
        id: sh.id,
        node,
        sprite: sp,
        hpBar,
        lvlLabel,
        lastAppearanceKey: '',
        lastHp: -1,
        lastMaxHp: -1,
        lastOwner: '',
        lastLevel: -1,
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
        this.spawnFloatingText(ev.flashX, ev.flashY - 14, t('vfx_veteran_up'), new Color(255, 224, 90, 255));
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
        this.spawnFloatingText(fx, fy - 12, t('vfx_lords_judgement'), new Color(255, 235, 130, 255));
      } else if (ev.spellId === 'summon_stoneworms') {
        this.audio.playSfx('spell_stoneworms', 100);
        this.spawnStripVfx('vfx/stoneworms', fx, fy, 1.0, 14);
        this.spawnFloatingText(fx, fy - 12, t('vfx_stoneworms'), new Color(245, 175, 95, 255));
      } else if (ev.spellId === 'disentomb' || ev.spellId === 'raise_the_dead') {
        this.audio.playSfx('spell_disentomb', 100);
        this.spawnStripVfx('vfx/raise_dead', fx, fy, 1.0, 14);
        this.spawnFloatingText(
          fx,
          fy - 14,
          ev.spellId === 'disentomb' ? t('vfx_immortals_risen') : t('vfx_undead_raised'),
          new Color(205, 150, 255, 255),
        );
      } else if (ev.spellId === 'ice_blast') {
        this.audio.playSfx('spell_ice_blast', 100);
        this.audio.playSfx('unit_frozen', 200);
        this.spawnStripVfx('vfx/ice_blast', fx, fy, 1.0, 14);
        this.spawnFloatingText(fx, fy - 14, t('vfx_frozen'), new Color(135, 225, 255, 255));
      } else if (ev.spellId === 'frost_enchantment') {
        this.audio.playSfx('spell_frost_enchant', 100);
        this.spawnStripVfx('vfx/frost_enchant', fx, fy, 1.0, 14);
        this.spawnFloatingText(fx, fy - 14, t('vfx_frost_enchant'), new Color(165, 235, 255, 255));
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
        this.spawnFloatingText(400, 280, t('vfx_cataclysm'), new Color(255, 120, 75, 255));
      } else if (ev.spellId === 'grand_transformation') {
        this.audio.playSfx('ultimate_transformation', 100);
        this.spawnStripVfx('vfx/grand_transform', fx, fy, 1.15, 14);
        this.spawnFloatingText(
          fx,
          fy - 22,
          t('vfx_transformation', { gold: ev.goldAmount ?? 0 }),
          new Color(140, 230, 255, 255),
        );
      } else if (ev.spellId === 'call_of_the_grave') {
        this.audio.playSfx('ultimate_undead', 100);
        this.spawnStripVfx('vfx/grand_transform', fx, fy, 1.0, 14);
      } else {
        this.audio.playSfx('ultimate_avatar', 100);
        this.spawnStripVfx('vfx/sign_of_advent', fx, fy, 0.95, 14);
        this.spawnFloatingText(fx, fy - 22, t('vfx_lords_avatar'), new Color(255, 224, 100, 255));
      }
    } else if (ev.type === 'chest_collected') {
      this.audio.playSfx('chest_open', 100);
      this.audio.playSfx('chest_gold', 100);
      if (ev.flashX !== undefined && ev.flashY !== undefined) {
        this.spawnFloatingText(ev.flashX, ev.flashY - 10, t('vfx_gold_gain', { gold: ev.goldAmount ?? 500 }), new Color(255, 225, 85, 255));
      }
    }
  }

  private acquireVfxNode(entry: SpriteAssetEntry, pos: { x: number; y: number }, scale: number, firstFrame: SpriteFrame): { node: Node; sp: Sprite } {
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
      if (sh.hp !== vis.lastHp || sh.maxHp !== vis.lastMaxHp || sh.owner !== vis.lastOwner) {
        vis.lastHp = sh.hp;
        vis.lastMaxHp = sh.maxHp;
        vis.lastOwner = sh.owner;
        const ratio = Math.max(0, Math.min(1, sh.hp / sh.maxHp));
        const g = vis.hpBar;
        g.clear();
        g.fillColor = new Color(15, 15, 20, 220);
        g.roundRect(-34, -4, 68, 8, 3);
        g.fill();
        g.fillColor = FACTION_HP_COLORS[sh.owner] ?? FACTION_HP_COLORS.TheEmpire;
        g.roundRect(-32, -2.5, 64 * ratio, 5, 2);
        g.fill();
      }
      if (sh.level !== vis.lastLevel) {
        vis.lastLevel = sh.level;
        vis.lvlLabel.string = sh.level > 0 ? '★'.repeat(sh.level) : '';
      }
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
        this.recycleSquadVisual(vis);
        this.squadVisuals.delete(id);
      }
    }

    for (const sq of this.sim.squads) {
      let vis = this.squadVisuals.get(sq.id);
      if (!vis) {
        vis = this.acquireSquadVisual(sq);
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
      const ringKey =
        sq.frozenTimer > 0
          ? 'frozen'
          : sq.bloodlustTimer > 0
            ? 'bloodlust'
            : sq.frostEnchantTimer > 0
              ? 'frost'
              : sq.liberationTimer > 0
                ? 'lib'
                : sq.heroicTimer > 0
                  ? 'heroic'
                  : sq.poisonTimer > 0
                    ? 'poison'
                    : sq.fearTimer > 0
                      ? 'fear'
                      : '';
      if (hp.hp !== vis.lastHp || hp.maxHp !== vis.lastMaxHp || sq.owner !== vis.lastOwner || ringKey !== vis.lastRingKey) {
        vis.lastHp = hp.hp;
        vis.lastMaxHp = hp.maxHp;
        vis.lastOwner = sq.owner;
        vis.lastRingKey = ringKey;
        const ratio = hp.maxHp > 0 ? hp.hp / hp.maxHp : 0;
        const g = vis.hpBar;
        g.clear();
        const ringCol =
          ringKey === 'frozen'
            ? new Color(110, 225, 255, 240)
            : ringKey === 'bloodlust'
              ? new Color(245, 75, 75, 235)
              : ringKey === 'frost'
                ? new Color(155, 215, 255, 235)
                : ringKey === 'lib'
                  ? new Color(255, 250, 195, 235)
                  : ringKey === 'heroic'
                    ? new Color(255, 220, 75, 230)
                    : ringKey === 'poison'
                      ? new Color(105, 215, 70, 220)
                      : ringKey === 'fear'
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
      }
      const countStr = sq.isAvatar && sq.lifetimeSec !== null ? `${Math.ceil(sq.lifetimeSec)}s` : `${alive}`;
      if (countStr !== vis.lastCountStr) {
        vis.lastCountStr = countStr;
        vis.countLbl.string = countStr;
      }
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

    // 5b. Tap/Click Ripple Feedback
    for (let i = this.tapRipples.length - 1; i >= 0; i--) {
      const r = this.tapRipples[i];
      r.elapsed += dt;
      const t = Math.min(1, r.elapsed / r.duration);
      const cp = flashToCocos(r.x, r.y);
      const radius = 8 + 26 * t;
      const alpha = Math.max(0, Math.round(r.color.a * (1 - t)));
      this.selectG.strokeColor = new Color(r.color.r, r.color.g, r.color.b, alpha);
      this.selectG.lineWidth = 2.5 * (1 - 0.5 * t);
      this.selectG.circle(cp.x, cp.y, radius);
      this.selectG.stroke();
      if (r.elapsed >= r.duration) {
        this.tapRipples.splice(i, 1);
      }
    }

    // 6. Strip VFX & Floating Text
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

  private recycleSquadVisual(vis: SquadVisual): void {
    for (const mv of vis.members) {
      mv.sprite.spriteFrame = null;
      this.squadMemberPool.put(mv.node);
    }
    vis.members.length = 0;
    vis.hpBar.clear();
    this.squadRootPool.put(vis.root);
  }

  private acquireSquadVisual(sq: SquadStateModel): SquadVisual {
    let root = this.squadRootPool.get();
    let hpBar: Graphics;
    let countLbl: Label;

    if (root) {
      hpBar = root.getComponent(Graphics)!;
      const cntNode = root.getChildByName('Cnt')!;
      countLbl = cntNode.getComponent(Label)!;
    } else {
      root = createUiNode(`Squad_${sq.id}`, undefined, 60, 60);
      hpBar = root.addComponent(Graphics);
      const cntNode = createUiNode('Cnt', root, 36, 16);
      cntNode.setPosition(-28, 26);
      countLbl = cntNode.addComponent(Label);
      countLbl.fontSize = 11;
      countLbl.isBold = true;
      countLbl.cacheMode = Label.CacheMode.CHAR;
      countLbl.color = new Color(255, 255, 255, 255);
    }

    root.name = `Squad_${sq.id}`;
    this.unitLayer.addChild(root);

    const members: Array<{ node: Node; sprite: Sprite }> = [];
    const scale = sq.isAvatar || sq.owner === 'Bandits' ? 0.92 : 0.78;
    for (let i = 0; i < sq.members.length; i++) {
      const m = sq.members[i];
      let mn = this.squadMemberPool.get();
      let sp: Sprite;
      if (mn) {
        sp = mn.getComponent(Sprite)!;
      } else {
        mn = createUiNode(`M_${i}`, undefined, 40, 40);
        sp = mn.addComponent(Sprite);
        sp.sizeMode = Sprite.SizeMode.RAW;
      }
      mn.name = `M_${i}`;
      mn.active = true;
      sp.spriteFrame = null;
      mn.setPosition(m.offsetX * MAP_TO_COCOS_SCALE, -m.offsetY * MAP_TO_COCOS_SCALE);
      mn.setScale(scale, scale, 1);
      root.addChild(mn);
      members.push({ node: mn, sprite: sp });
    }

    return {
      id: sq.id,
      root,
      members,
      hpBar,
      countLbl,
      animElapsed: 0,
      lastHp: -1,
      lastMaxHp: -1,
      lastOwner: '',
      lastRingKey: '',
      lastCountStr: '',
    };
  }

  destroy(): void {
    if (this.unsubSim) this.unsubSim();
    this.vfxPool.clear();
    this.floatTextPool.clear();
    this.squadRootPool.clear();
    this.squadMemberPool.clear();
  }
}
