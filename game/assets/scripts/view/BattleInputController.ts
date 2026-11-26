import { Color, EventMouse, EventTouch, Graphics, Node, sys, view } from 'cc';
import { COCOS_DESIGN_HEIGHT, cocosToFlash, dist, flashToCocos, MAP_TO_COCOS_SCALE } from '../core/CoordTransform';
import { ALL_SPELLS } from '../data/SpellsData';
import { SpellId } from '../data/Types';
import { UNIT_DEFS } from '../data/UnitsData';
import { BattleSim } from '../sim/BattleSim';
import { AudioManager } from './AudioManager';
import type { HudSelection } from './HudView';

/**
 * Handles battlefield touch/mouse hit-testing, squad movement & intercept orders,
 * spell-targeting preview overlays, and tap ripple feedback for BattleView.
 */
export class BattleInputController {
  selection: HudSelection = { strongholdId: null, buildSiteId: null, squadId: null };
  private activeSpell: SpellId | null = null;
  private hoverFlash: { x: number; y: number } | null = null;
  private tapRipples: Array<{ x: number; y: number; elapsed: number; duration: number; color: Color }> = [];

  constructor(
    private sim: BattleSim,
    private audio: AudioManager,
    private onSelectionChange: (sel: HudSelection) => void,
    private onSpellModeChange?: (spell: SpellId | null) => void,
  ) {}

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

  clearSelection(): void {
    this.selection = { strongholdId: null, buildSiteId: null, squadId: null };
    this.setActiveSpell(null);
    this.onSelectionChange(this.selection);
  }

  resetTransientState(clearSpell = true): void {
    this.tapRipples = [];
    if (clearSpell) {
      this.activeSpell = null;
    }
  }

  bind(root: Node): void {
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

    root.on(Node.EventType.TOUCH_END, (ev: EventTouch) => {
      const loc = ev.getUILocation();
      handleMapClick(loc.x, loc.y, false);
    });

    root.on(Node.EventType.MOUSE_DOWN, (ev: EventMouse) => {
      if (ev.getButton() === EventMouse.BUTTON_RIGHT) {
        const loc = ev.getUILocation();
        handleMapClick(loc.x, loc.y, true);
      }
    });

    root.on(Node.EventType.MOUSE_MOVE, (ev: EventMouse) => {
      if (!this.activeSpell) {
        this.hoverFlash = null;
        return;
      }
      const vis = view.getVisibleSize();
      const loc = ev.getUILocation();
      this.hoverFlash = cocosToFlash(loc.x - vis.width * 0.5, loc.y - vis.height * 0.5);
    });
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

  drawOverlay(selectG: Graphics, dt: number): void {
    selectG.clear();
    if (this.activeSpell) {
      const targetPos = this.hoverFlash ? flashToCocos(this.hoverFlash.x, this.hoverFlash.y) : { x: 0, y: 0 };
      const rad = Math.min(240, ALL_SPELLS[this.activeSpell].radius * MAP_TO_COCOS_SCALE);
      selectG.strokeColor = new Color(255, 224, 90, 235);
      selectG.fillColor = new Color(255, 224, 90, 36);
      selectG.lineWidth = 3;
      selectG.circle(targetPos.x, targetPos.y, rad);
      selectG.fill();
      selectG.stroke();
    } else {
      if (this.selection.strongholdId) {
        const sh = this.sim.strongholds.find((s) => s.id === this.selection.strongholdId);
        if (sh) {
          const p = flashToCocos(sh.flashX, sh.flashY);
          selectG.strokeColor = new Color(255, 228, 105, 230);
          selectG.lineWidth = 3;
          selectG.circle(p.x, p.y, 48);
          selectG.stroke();
        }
      }
      if (this.selection.buildSiteId) {
        const bs = this.sim.buildSites.find((b) => b.id === this.selection.buildSiteId);
        if (bs) {
          const p = flashToCocos(bs.flashX, bs.flashY);
          selectG.strokeColor = new Color(255, 228, 105, 230);
          selectG.lineWidth = 2.5;
          selectG.circle(p.x, p.y, 32);
          selectG.stroke();
        }
      }
      if (this.selection.squadId) {
        const sq = this.sim.squads.find((s) => s.id === this.selection.squadId && s.state !== 'Dead');
        if (sq) {
          const p = flashToCocos(sq.flashX, sq.flashY);
          selectG.strokeColor = new Color(115, 250, 140, 240);
          selectG.lineWidth = 3;
          selectG.circle(p.x, p.y, 32);
          selectG.stroke();

          if (sq.pathFlash.length > 0) {
            selectG.strokeColor = new Color(130, 245, 150, 190);
            selectG.lineWidth = 2.5;
            selectG.moveTo(p.x, p.y);
            for (const wp of sq.pathFlash) {
              const cw = flashToCocos(wp.x, wp.y);
              selectG.lineTo(cw.x, cw.y);
            }
            selectG.stroke();
          }
        }
      }
    }

    // Tap/Click Ripple Feedback
    for (let i = this.tapRipples.length - 1; i >= 0; i--) {
      const r = this.tapRipples[i];
      r.elapsed += dt;
      const t = Math.min(1, r.elapsed / r.duration);
      const cp = flashToCocos(r.x, r.y);
      const radius = 8 + 26 * t;
      const alpha = Math.max(0, Math.round(r.color.a * (1 - t)));
      selectG.strokeColor = new Color(r.color.r, r.color.g, r.color.b, alpha);
      selectG.lineWidth = 2.5 * (1 - 0.5 * t);
      selectG.circle(cp.x, cp.y, radius);
      selectG.stroke();
      if (r.elapsed >= r.duration) {
        this.tapRipples.splice(i, 1);
      }
    }
  }

  private spawnTapRipple(flashX: number, flashY: number, color: Color): void {
    this.tapRipples.push({ x: flashX, y: flashY, elapsed: 0, duration: 0.32, color });
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
}
