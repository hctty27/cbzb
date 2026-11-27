import { Color, Graphics, Label, Node, NodePool, Sprite, UITransform } from 'cc';
import {
  COCOS_BLEED_HEIGHT,
  COCOS_BLEED_WIDTH,
  COCOS_DESIGN_HEIGHT,
  COCOS_DESIGN_WIDTH,
  flashToCocos,
  MAP_TO_COCOS_SCALE,
} from '../core/CoordTransform';
import { SPRITE_MANIFEST } from '../data/AssetManifest';
import { SpellId, SquadStateModel, StrongholdState } from '../data/Types';
import { UNIT_DEFS } from '../data/UnitsData';
import { BattleSim } from '../sim/BattleSim';
import { countAliveUnits, getSquadTotalHp } from '../sim/CombatMath';
import { AudioManager } from './AudioManager';
import { BattleInputController } from './BattleInputController';
import { BattleVfxController } from './BattleVfxController';
import type { HudSelection } from './HudView';
import { createUiNode, getStaticSpriteFrame, getStripFramesSync, releaseTextureByKey } from './SpriteLoader';

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

  private squadRootPool = new NodePool();
  private squadMemberPool = new NodePool();

  private inputCtrl: BattleInputController;
  private vfxCtrl!: BattleVfxController;
  private unsubSim: (() => void) | null = null;
  private currentBgKey: string | null = null;
  private bgLoadSeq = 0;

  constructor(
    parent: Node,
    private sim: BattleSim,
    audio: AudioManager,
    onSelectionChange: (sel: HudSelection) => void,
    onSpellModeChange?: (spell: SpellId | null) => void,
  ) {
    this.root = createUiNode('BattleView', parent, COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT);
    this.buildLayers();
    this.inputCtrl = new BattleInputController(sim, audio, onSelectionChange, onSpellModeChange);
    this.inputCtrl.bind(this.root);
    this.vfxCtrl = new BattleVfxController(this.bannerLayer, this.vfxLayer, audio, SWF_TO_COCOS_SCALE);
    this.rebuildWorldEntities();
    this.unsubSim = this.sim.events.on('event', (ev) => this.vfxCtrl.handleSimEvent(ev, this.sim));
  }

  private buildLayers(): void {
    const sky = createUiNode('SkyBackdrop', this.root, COCOS_BLEED_WIDTH, COCOS_BLEED_HEIGHT);
    const sg = sky.addComponent(Graphics);
    sg.fillColor = new Color(210, 232, 245, 255);
    sg.rect(-1280, -720, 2560, 1440);
    sg.fill();
    sg.fillColor = new Color(230, 244, 252, 210);
    sg.rect(-1280, -120, 2560, 720 + 120);
    sg.fill();

    this.worldLayer = createUiNode('WorldLayer', this.root, COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT);

    const mapEntry = SPRITE_MANIFEST[this.sim.levelDef.bgKey] ?? SPRITE_MANIFEST['map/level1_bg'];
    this.mapNode = createUiNode('LevelBg', this.worldLayer, mapEntry.width, mapEntry.height, mapEntry.anchorX, mapEntry.anchorY);
    const originPos = flashToCocos(0, 0);
    this.mapNode.setPosition(originPos.x, originPos.y);
    this.mapNode.setScale(SWF_TO_COCOS_SCALE, SWF_TO_COCOS_SCALE, 1);
    this.mapSprite = this.mapNode.addComponent(Sprite);
    this.mapSprite.sizeMode = Sprite.SizeMode.RAW;

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
    this.inputCtrl.setActiveSpell(spellId);
  }

  getActiveSpell(): SpellId | null {
    return this.inputCtrl.getActiveSpell();
  }

  hasSelection(): boolean {
    return this.inputCtrl.hasSelection();
  }

  sendSelectedSquadToNearestEnemy(): void {
    this.inputCtrl.sendSelectedSquadToNearestEnemy();
  }

  clearSelection(): void {
    this.inputCtrl.clearSelection();
  }

  releaseBattleAssets(): void {
    this.bgLoadSeq++;
    this.inputCtrl.resetTransientState(false);
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
    void getStaticSpriteFrame(bgKey).then((sf) => {
      if (this.mapNode.isValid && seq === this.bgLoadSeq) {
        this.mapSprite.spriteFrame = sf;
      }
    });

    this.drawBaseRoads();

    // Recycle pooled visuals BEFORE clearing layers so reusable nodes aren't destroyed
    for (const vis of this.squadVisuals.values()) {
      this.recycleSquadVisual(vis);
    }
    this.squadVisuals.clear();
    this.vfxCtrl.recycleAll();

    this.strongholdLayer.removeAllChildren();
    this.bannerLayer.removeAllChildren();
    this.unitLayer.removeAllChildren();
    this.vfxLayer.removeAllChildren();
    this.strongholdVisuals.clear();
    this.siteVisuals.clear();
    this.chestVisuals.clear();
    this.inputCtrl.resetTransientState(true);

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
      void getStaticSpriteFrame('map/chest').then((sf) => {
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
          void getStaticSpriteFrame(key).then((sf) => {
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
          void getStaticSpriteFrame(key).then((sf) => {
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
    this.vfxCtrl.syncBanners(this.sim, dt);

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

    // 5. Selection, Spell Target Preview & Tap Ripples
    this.inputCtrl.drawOverlay(this.selectG, dt);

    // 6. Strip VFX & Floating Text
    this.vfxCtrl.updateEffects(dt);
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
    this.vfxCtrl.destroy();
    this.squadRootPool.clear();
    this.squadMemberPool.clear();
  }
}
