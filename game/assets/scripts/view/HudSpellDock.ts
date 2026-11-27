import { Button, Color, Graphics, Label, Node, Sprite } from 'cc';
import { getSpellName, t } from '../data/I18n';
import { ALL_SPELLS, CAMPAIGN_SPELL_ORDER } from '../data/SpellsData';
import { SpellId } from '../data/Types';
import { BattleSim } from '../sim/BattleSim';
import { AudioManager } from './AudioManager';
import { SafeAreaInsets } from './SafeAreaHelper';
import { getHudHalfExtents } from './ScreenLayout';
import { createUiNode, drawPanel, getStaticSpriteFrame } from './SpriteLoader';

interface SpellSlotButton {
  slotIdx: number;
  spellId: SpellId;
  node: Node;
  bg: Graphics;
  iconNode: Node;
  iconSp: Sprite;
  nameLbl: Label;
  costLbl: Label;
  loadedIconKey: string;
}

export interface SpellDockCallbacks {
  onSelectSpell: (spellId: SpellId | null) => void;
  onQuickCastUltimate: () => void;
}

/**
 * Bottom-left 4-slot spell & ultimate dock with hotkey badges (1-4) and dirty-checked rendering.
 */
export class HudSpellDock {
  private readonly dockNode: Node;
  private readonly buttons: SpellSlotButton[] = [];
  private spellStates: string[] = ['', '', '', ''];

  constructor(
    parent: Node,
    private sim: BattleSim,
    private audio: AudioManager,
    safeInsets: SafeAreaInsets,
    private callbacks: SpellDockCallbacks,
  ) {
    this.dockNode = createUiNode('SpellDock', parent, 234, 120);
    const { halfW, halfH } = getHudHalfExtents();
    this.layout(halfW, halfH, safeInsets);
    drawPanel(
      this.dockNode.addComponent(Graphics),
      234,
      120,
      new Color(20, 20, 32, 235),
      new Color(180, 145, 78, 225),
      2,
      12,
    );

    const coords = [
      { x: -55, y: 28 },
      { x: 55, y: 28 },
      { x: -55, y: -28 },
      { x: 55, y: -28 },
    ];

    for (let idx = 0; idx < 4; idx++) {
      const pos = coords[idx];
      const b = createUiNode(`SpellSlot_${idx}`, this.dockNode, 104, 48);
      b.setPosition(pos.x, pos.y);
      const bg = b.addComponent(Graphics);

      const ic = createUiNode('Ic', b, 30, 30);
      ic.setPosition(-32, 0);
      const sp = ic.addComponent(Sprite);
      sp.sizeMode = Sprite.SizeMode.CUSTOM;

      const nLbl = createUiNode('Nm', b, 64, 18).addComponent(Label);
      nLbl.node.setPosition(16, 9);
      nLbl.fontSize = 11;
      nLbl.isBold = true;
      nLbl.overflow = Label.Overflow.SHRINK;
      nLbl.color = new Color(245, 240, 220, 255);

      const costLbl = createUiNode('Cost', b, 64, 18).addComponent(Label);
      costLbl.node.setPosition(16, -9);
      costLbl.fontSize = 11;
      costLbl.isBold = true;

      const keyBadge = createUiNode('Key', b, 18, 12).addComponent(Label);
      keyBadge.node.setPosition(42, 16);
      keyBadge.string = `${idx + 1}`;
      keyBadge.fontSize = 9;
      keyBadge.lineHeight = 11;
      keyBadge.isBold = true;
      keyBadge.color = new Color(210, 196, 150, 190);

      const comp = b.addComponent(Button);
      comp.transition = Button.Transition.SCALE;
      comp.zoomScale = 1.05;
      b.on(Button.EventType.CLICK, () => {
        this.onSlotClicked?.(idx);
      });

      this.buttons.push({
        slotIdx: idx,
        spellId: 'lords_judgement',
        node: b,
        bg,
        iconNode: ic,
        iconSp: sp,
        nameLbl: nLbl,
        costLbl,
        loadedIconKey: '',
      });
    }
  }

  onSlotClicked: ((idx: number) => void) | null = null;

  layout(halfW: number, halfH: number, safeInsets: SafeAreaInsets): void {
    this.dockNode.setPosition(-halfW + 126 + safeInsets.left, -halfH + 65 + safeInsets.bottom);
  }

  triggerSlot(slotIdx: number, activeSpell: SpellId | null): void {
    const order = CAMPAIGN_SPELL_ORDER[this.sim.playerFaction];
    const spellId = order[slotIdx];
    if (!spellId || !this.sim.canCastSpell(this.sim.playerFaction, spellId)) return;
    this.audio.playSfx('ui_click');
    const def = ALL_SPELLS[spellId];
    if (def.kind === 'ultimate' && activeSpell === spellId) {
      this.callbacks.onSelectSpell(null);
      this.callbacks.onQuickCastUltimate();
      return;
    }
    const next = activeSpell === spellId ? null : spellId;
    this.callbacks.onSelectSpell(next);
  }

  rebuildForCampaign(): void {
    const order = CAMPAIGN_SPELL_ORDER[this.sim.playerFaction];
    for (const sb of this.buttons) {
      const sid = order[sb.slotIdx];
      sb.spellId = sid;
      const def = ALL_SPELLS[sid];
      sb.nameLbl.string = getSpellName(sid, true, def.name, def.shortName);
      if (sb.loadedIconKey !== def.iconKey) {
        sb.loadedIconKey = def.iconKey;
        void getStaticSpriteFrame(def.iconKey).then((sf) => {
          if (sb.iconNode.isValid) sb.iconSp.spriteFrame = sf;
        });
      }
    }
  }

  refreshLocale(): void {
    this.spellStates = ['', '', '', ''];
    this.rebuildForCampaign();
  }

  refresh(activeSpell: SpellId | null): void {
    const pFaction = this.sim.playerFaction;
    const p = this.sim.getCombatant(pFaction);
    for (const sb of this.buttons) {
      const def = ALL_SPELLS[sb.spellId];
      const unlocked = this.sim.bonuses.unlockedSpells.includes(sb.spellId);
      const ready = this.sim.canCastSpell(pFaction, sb.spellId);
      const selected = activeSpell === sb.spellId;

      const panelKey = `${unlocked}|${ready}|${selected}`;
      if (this.spellStates[sb.slotIdx] !== panelKey) {
        this.spellStates[sb.slotIdx] = panelKey;
        const fill = selected
          ? new Color(86, 70, 26, 245)
          : ready
            ? new Color(36, 52, 68, 245)
            : new Color(28, 28, 36, 225);
        const stroke = selected
          ? new Color(255, 230, 95, 255)
          : ready
            ? new Color(115, 195, 245, 240)
            : new Color(90, 90, 105, 180);
        drawPanel(sb.bg, 104, 48, fill, stroke, selected ? 2.5 : 1.5, 8);
      }

      if (!unlocked) {
        sb.costLbl.string = t('hud_spell_locked');
        sb.costLbl.color = new Color(200, 120, 120, 220);
      } else if (def.kind === 'ultimate') {
        const pct = Math.min(100, Math.floor((p.ultimateCharge / p.ultimateMax) * 100));
        sb.costLbl.string = ready ? t('hud_spell_ready') : `${pct}%`;
        sb.costLbl.color = ready ? new Color(255, 232, 95, 255) : new Color(170, 200, 225, 230);
      } else {
        const cost = this.sim.getEffectiveSpellCost(pFaction, sb.spellId);
        sb.costLbl.string = t('hud_spell_mana', { cost });
        sb.costLbl.color = ready ? new Color(135, 220, 255, 255) : new Color(195, 130, 130, 220);
      }
    }
  }
}
