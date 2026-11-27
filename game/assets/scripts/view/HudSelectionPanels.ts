import { Button, Color, Graphics, Label, Node, Sprite } from 'cc';
import { MAX_STRONGHOLD_LEVEL, STRONGHOLD_STATS, STRONGHOLD_UPGRADE_COSTS } from '../data/BuildingsData';
import { getUnitName, t } from '../data/I18n';
import { PlayableCampaignId } from '../data/Types';
import { getRecruitIdsForFaction, UNIT_DEFS } from '../data/UnitsData';
import { BattleSim } from '../sim/BattleSim';
import { countAliveUnits, getSquadTotalHp } from '../sim/CombatMath';
import { AudioManager } from './AudioManager';
import type { HudSelection } from './HudView';
import { SafeAreaInsets } from './SafeAreaHelper';
import { getHudHalfExtents } from './ScreenLayout';
import { createUiNode, drawPanel, getStaticSpriteFrame } from './SpriteLoader';

const FACTION_COLOR_SUFFIX: Record<PlayableCampaignId, string> = {
  Westaria: 'green',
  TheKhaganate: 'red',
  TheCult: 'blue',
};

export interface SelectionPanelCallbacks {
  onClearSelection: () => void;
  onSendSelectedSquadToNearest: () => void;
  onMutationRefresh: () => void;
}

/**
 * Contextual bottom action panels for Stronghold recruitment/upgrades,
 * BuildSite supply construction, and Selected Squad quick commands.
 */
export class HudSelectionPanels {
  private actionPanel!: Node;
  private actionTitleLabel!: Label;
  private upgradeBtn!: Node;
  private upgradeBtnLabel!: Label;
  private unitButtons: Array<{
    slotIdx: number;
    node: Node;
    bg: Graphics;
    iconSp: Sprite;
    nameLbl: Label;
    costLbl: Label;
    lockLbl: Label;
    loadedIconKey: string;
  }> = [];

  private buildPanel!: Node;
  private buildTitleLabel!: Label;
  private buildKindNodes: Array<{
    kind: 'Village' | 'Mine' | 'Obelisk';
    i18nKey: 'hud_build_farm' | 'hud_build_mine' | 'hud_build_obelisk';
    node: Node;
    iconNode: Node;
    iconSp: Sprite;
    lbl: Label;
    loadedIconKey: string;
  }> = [];

  private squadBar!: Node;
  private squadInfoLabel!: Label;
  private marchBtnLabel!: Label;

  private activeSelection: HudSelection = { strongholdId: null, buildSiteId: null, squadId: null };
  private unitBtnStates: string[] = ['', '', '', '', ''];
  private lastActionHeader = '';
  private lastUpgradeText = '';
  private lastBuildTitle = '';
  private lastSquadText = '';

  constructor(
    parent: Node,
    private sim: BattleSim,
    private audio: AudioManager,
    private safeInsets: SafeAreaInsets,
    private callbacks: SelectionPanelCallbacks,
  ) {
    this.buildStrongholdPanel(parent);
    this.buildSitePanel(parent);
    this.buildSquadBar(parent);
    this.layout(getHudHalfExtents().halfH, this.safeInsets);
  }

  layout(halfH: number, insets: SafeAreaInsets): void {
    this.safeInsets = insets;
    this.actionPanel.setPosition(85, -halfH + 64 + insets.bottom);
    this.buildPanel.setPosition(85, -halfH + 60 + insets.bottom);
    this.squadBar.setPosition(85, -halfH + 38 + insets.bottom);
  }

  private buildStrongholdPanel(parent: Node): void {
    this.actionPanel = createUiNode('StrongholdActionPanel', parent, 760, 118);
    drawPanel(
      this.actionPanel.addComponent(Graphics),
      760,
      118,
      new Color(22, 20, 32, 240),
      new Color(205, 168, 86, 240),
      2.5,
      12,
    );

    this.actionTitleLabel = createUiNode('ActionTitle', this.actionPanel, 500, 26).addComponent(Label);
    this.actionTitleLabel.node.setPosition(-115, 42);
    this.actionTitleLabel.fontSize = 16;
    this.actionTitleLabel.lineHeight = 20;
    this.actionTitleLabel.isBold = true;
    this.actionTitleLabel.color = new Color(255, 230, 148, 255);

    const startX = -275;
    const stepX = 114;
    for (let i = 0; i < 5; i++) {
      const btnNode = createUiNode(`RecruitSlot_${i}`, this.actionPanel, 106, 76);
      btnNode.setPosition(startX + i * stepX, -12);
      const bg = btnNode.addComponent(Graphics);

      const iconNode = createUiNode('Icon', btnNode, 40, 40);
      iconNode.setPosition(-28, 12);
      const iconSp = iconNode.addComponent(Sprite);
      iconSp.sizeMode = Sprite.SizeMode.CUSTOM;

      const nameLbl = createUiNode('Name', btnNode, 62, 22).addComponent(Label);
      nameLbl.node.setPosition(18, 16);
      nameLbl.fontSize = 11;
      nameLbl.isBold = true;
      nameLbl.overflow = Label.Overflow.SHRINK;
      nameLbl.color = new Color(240, 244, 235, 255);

      const costLbl = createUiNode('Cost', btnNode, 98, 20).addComponent(Label);
      costLbl.node.setPosition(0, -18);
      costLbl.fontSize = 12;
      costLbl.color = new Color(255, 220, 110, 255);

      const lockLbl = createUiNode('Lock', btnNode, 98, 18).addComponent(Label);
      lockLbl.node.setPosition(0, -31);
      lockLbl.fontSize = 10;
      lockLbl.color = new Color(230, 130, 130, 255);

      const btn = btnNode.addComponent(Button);
      btn.transition = Button.Transition.SCALE;
      btn.zoomScale = 1.05;
      btnNode.on(Button.EventType.CLICK, () => {
        if (!this.activeSelection.strongholdId) return;
        const pFaction = this.sim.playerFaction;
        const order = getRecruitIdsForFaction(pFaction, this.sim.bonuses);
        const defId = order[i];
        if (!defId) return;
        const ok = this.sim.recruitUnit(pFaction, this.activeSelection.strongholdId, defId);
        if (ok) this.audio.playSfx('ui_click');
        this.callbacks.onMutationRefresh();
      });

      this.unitButtons.push({
        slotIdx: i,
        node: btnNode,
        bg,
        iconSp,
        nameLbl,
        costLbl,
        lockLbl,
        loadedIconKey: '',
      });
    }

    this.upgradeBtn = createUiNode('BtnUpgrade', this.actionPanel, 136, 76);
    this.upgradeBtn.setPosition(300, -12);
    drawPanel(
      this.upgradeBtn.addComponent(Graphics),
      136,
      76,
      new Color(70, 52, 28, 240),
      new Color(225, 185, 92, 240),
      2,
      8,
    );
    this.upgradeBtnLabel = createUiNode('UpLbl', this.upgradeBtn, 126, 62).addComponent(Label);
    this.upgradeBtnLabel.fontSize = 13;
    this.upgradeBtnLabel.lineHeight = 18;
    this.upgradeBtnLabel.isBold = true;
    this.upgradeBtnLabel.color = new Color(255, 232, 165, 255);

    const upComp = this.upgradeBtn.addComponent(Button);
    upComp.transition = Button.Transition.SCALE;
    this.upgradeBtn.on(Button.EventType.CLICK, () => {
      if (!this.activeSelection.strongholdId) return;
      if (this.sim.upgradeStronghold(this.sim.playerFaction, this.activeSelection.strongholdId)) {
        this.audio.playSfx('build_farm');
      }
      this.callbacks.onMutationRefresh();
    });

    const closeNode = createUiNode('CloseAction', this.actionPanel, 28, 28);
    closeNode.setPosition(360, 42);
    drawPanel(closeNode.addComponent(Graphics), 28, 28, new Color(90, 35, 35, 230), new Color(220, 140, 140, 220), 1.5, 6);
    const xLbl = createUiNode('X', closeNode, 24, 24).addComponent(Label);
    xLbl.string = 'X';
    xLbl.fontSize = 14;
    xLbl.isBold = true;
    closeNode.addComponent(Button).node.on(Button.EventType.CLICK, () => this.callbacks.onClearSelection());

    this.actionPanel.active = false;
  }

  private buildSitePanel(parent: Node): void {
    this.buildPanel = createUiNode('BuildSitePanel', parent, 460, 108);
    drawPanel(
      this.buildPanel.addComponent(Graphics),
      460,
      108,
      new Color(22, 20, 32, 240),
      new Color(205, 168, 86, 240),
      2.5,
      12,
    );

    this.buildTitleLabel = createUiNode('Title', this.buildPanel, 380, 24).addComponent(Label);
    this.buildTitleLabel.node.setPosition(-20, 38);
    this.buildTitleLabel.string = 'CONSTRUCT SUPPLY BUILDING (150 Gold)';
    this.buildTitleLabel.fontSize = 15;
    this.buildTitleLabel.isBold = true;
    this.buildTitleLabel.color = new Color(255, 228, 150, 255);

    const kinds: Array<{
      kind: 'Village' | 'Mine' | 'Obelisk';
      i18nKey: 'hud_build_farm' | 'hud_build_mine' | 'hud_build_obelisk';
      x: number;
    }> = [
      { kind: 'Village', i18nKey: 'hud_build_farm', x: -140 },
      { kind: 'Mine', i18nKey: 'hud_build_mine', x: 0 },
      { kind: 'Obelisk', i18nKey: 'hud_build_obelisk', x: 140 },
    ];

    for (const k of kinds) {
      const b = createUiNode(`Build_${k.kind}`, this.buildPanel, 128, 66);
      b.setPosition(k.x, -12);
      drawPanel(b.addComponent(Graphics), 128, 66, new Color(40, 48, 62, 240), new Color(135, 195, 125, 220), 2, 8);
      const ic = createUiNode('Ic', b, 34, 34);
      ic.setPosition(-38, 0);
      const sp = ic.addComponent(Sprite);
      sp.sizeMode = Sprite.SizeMode.CUSTOM;

      const lbl = createUiNode('L', b, 80, 44).addComponent(Label);
      lbl.node.setPosition(20, 0);
      lbl.string = t(k.i18nKey);
      lbl.fontSize = 13;
      lbl.lineHeight = 17;
      lbl.overflow = Label.Overflow.SHRINK;
      lbl.isBold = true;
      b.addComponent(Button).node.on(Button.EventType.CLICK, () => {
        if (!this.activeSelection.buildSiteId) return;
        const ok = this.sim.buildSupplyBuilding(this.sim.playerFaction, this.activeSelection.buildSiteId, k.kind);
        if (ok) {
          const sfx = k.kind === 'Village' ? 'build_farm' : k.kind === 'Mine' ? 'build_mine' : 'build_obelisk';
          this.audio.playSfx(sfx);
          this.callbacks.onClearSelection();
        }
        this.callbacks.onMutationRefresh();
      });

      this.buildKindNodes.push({
        kind: k.kind,
        i18nKey: k.i18nKey,
        node: b,
        iconNode: ic,
        iconSp: sp,
        lbl,
        loadedIconKey: '',
      });
    }

    this.buildPanel.active = false;
  }

  private buildSquadBar(parent: Node): void {
    this.squadBar = createUiNode('SelectedSquadBar', parent, 620, 62);
    drawPanel(
      this.squadBar.addComponent(Graphics),
      620,
      62,
      new Color(20, 26, 36, 235),
      new Color(108, 210, 120, 235),
      2,
      10,
    );

    this.squadInfoLabel = createUiNode('SquadLbl', this.squadBar, 400, 44).addComponent(Label);
    this.squadInfoLabel.node.setPosition(-90, 0);
    this.squadInfoLabel.fontSize = 13;
    this.squadInfoLabel.lineHeight = 18;
    this.squadInfoLabel.overflow = Label.Overflow.SHRINK;
    this.squadInfoLabel.color = new Color(235, 245, 235, 255);

    const atkBtn = createUiNode('BtnQuickAttack', this.squadBar, 176, 40);
    atkBtn.setPosition(208, 0);
    drawPanel(atkBtn.addComponent(Graphics), 176, 40, new Color(120, 44, 44, 240), new Color(235, 160, 120, 230), 2, 8);
    const atkLbl = createUiNode('L', atkBtn, 166, 26).addComponent(Label);
    atkLbl.string = t('hud_march_btn');
    atkLbl.fontSize = 14;
    atkLbl.isBold = true;
    atkLbl.overflow = Label.Overflow.SHRINK;
    this.marchBtnLabel = atkLbl;
    atkBtn.addComponent(Button).node.on(Button.EventType.CLICK, () => {
      this.audio.playSfx('ui_click');
      this.callbacks.onSendSelectedSquadToNearest();
    });

    this.squadBar.active = false;
  }

  rebuildForCampaign(): void {
    const colSuffix = FACTION_COLOR_SUFFIX[this.sim.playerFaction] ?? 'green';
    for (const bn of this.buildKindNodes) {
      bn.lbl.string = t(bn.i18nKey);
      const base = bn.kind.toLowerCase();
      const key = `buildings/${base}_${colSuffix}`;
      if (bn.loadedIconKey !== key) {
        bn.loadedIconKey = key;
        void getStaticSpriteFrame(key).then((sf) => {
          if (bn.iconNode.isValid) bn.iconSp.spriteFrame = sf;
        });
      }
    }
  }

  refreshLocale(): void {
    this.unitBtnStates = ['', '', '', '', ''];
    this.lastActionHeader = '';
    this.lastUpgradeText = '';
    this.lastBuildTitle = '';
    this.lastSquadText = '';
    this.marchBtnLabel.string = t('hud_march_btn');
    this.rebuildForCampaign();
  }

  refresh(selection: HudSelection): void {
    this.activeSelection = selection;
    const pFaction = this.sim.playerFaction;
    const p = this.sim.getCombatant(pFaction);

    const sh = selection.strongholdId
      ? this.sim.strongholds.find((s) => s.id === selection.strongholdId && s.owner === pFaction)
      : undefined;
    const bs = selection.buildSiteId
      ? this.sim.buildSites.find((b) => b.id === selection.buildSiteId && b.owner === pFaction && b.supplyKind === 'Empty')
      : undefined;
    const sq = selection.squadId
      ? this.sim.squads.find((q) => q.id === selection.squadId && q.owner === pFaction && q.state !== 'Dead')
      : undefined;

    this.actionPanel.active = Boolean(sh);
    this.buildPanel.active = Boolean(!sh && bs);
    this.squadBar.active = Boolean(!sh && !bs && sq);

    if (sh) {
      const headerTxt = t('hud_fort_header', { name: sh.name, lv: sh.level, hp: sh.hp, maxHp: sh.maxHp });
      if (headerTxt !== this.lastActionHeader) {
        this.lastActionHeader = headerTxt;
        this.actionTitleLabel.string = headerTxt;
      }
      const freeSupply = p.totalSupply - p.usedSupply;
      const recruitIds = getRecruitIdsForFaction(pFaction, this.sim.bonuses);
      for (const ub of this.unitButtons) {
        const defId = recruitIds[ub.slotIdx];
        const def = UNIT_DEFS[defId];
        if (!def) continue;
        const effCost = this.sim.getEffectiveUnitCost(pFaction, def);
        ub.nameLbl.string = getUnitName(defId, def.name);
        ub.costLbl.string = t('hud_unit_cost', { cost: effCost, upkeep: def.upkeep });
        if (ub.loadedIconKey !== def.iconKey) {
          ub.loadedIconKey = def.iconKey;
          void getStaticSpriteFrame(def.iconKey).then((sf) => {
            if (ub.node.isValid) ub.iconSp.spriteFrame = sf;
          });
        }
        const unlocked = this.sim.isUnitUnlockedForPlayer(defId);
        const affordable = unlocked && p.gold >= effCost && freeSupply >= def.upkeep;
        const stateKey = `${affordable}`;
        if (this.unitBtnStates[ub.slotIdx] !== stateKey) {
          this.unitBtnStates[ub.slotIdx] = stateKey;
          drawPanel(
            ub.bg,
            106,
            76,
            affordable ? new Color(40, 56, 48, 245) : new Color(32, 32, 42, 225),
            affordable ? new Color(130, 225, 130, 240) : new Color(100, 100, 115, 180),
            2,
            8,
          );
        }
        ub.lockLbl.string = !unlocked ? t('hud_spell_locked') : freeSupply < def.upkeep ? t('hud_no_supply') : '';
      }

      const upTxt =
        sh.level >= MAX_STRONGHOLD_LEVEL
          ? t('hud_upgrade_max')
          : t('hud_upgrade_cost', { cost: STRONGHOLD_UPGRADE_COSTS[sh.level] });
      if (upTxt !== this.lastUpgradeText) {
        this.lastUpgradeText = upTxt;
        this.upgradeBtnLabel.string = upTxt;
      }
    } else if (bs) {
      const supplyCost = this.sim.getEffectiveSupplyCost(pFaction, 'Village');
      const buildTitle = t('hud_build_title', { cost: supplyCost });
      if (buildTitle !== this.lastBuildTitle) {
        this.lastBuildTitle = buildTitle;
        this.buildTitleLabel.string = buildTitle;
      }
      const parentFort = this.sim.strongholds.find((s) => s.locationNum === bs.locationNum && s.owner === pFaction);
      const allowed = parentFort ? STRONGHOLD_STATS[parentFort.kind].allowedSupply : ['Village'];
      for (const bn of this.buildKindNodes) {
        bn.node.active = allowed.includes(bn.kind);
      }
    } else if (sq) {
      const def = UNIT_DEFS[sq.defId];
      const hp = getSquadTotalHp(sq);
      const alive = countAliveUnits(sq);
      const tags: string[] = [];
      if (sq.vetLevel > 0) tags.push(`LV.${sq.vetLevel}`);
      if (sq.heroicTimer > 0) tags.push(t('hud_tag_heroic'));
      if (sq.bloodlustTimer > 0) tags.push(t('hud_tag_bloodlust'));
      if (sq.frostEnchantTimer > 0) tags.push(t('hud_tag_frost'));
      if (sq.liberationTimer > 0) tags.push(t('hud_tag_liberation'));
      if (sq.frozenTimer > 0) tags.push(t('hud_tag_frozen'));
      if (sq.poisonTimer > 0) tags.push(t('hud_tag_poisoned'));
      if (sq.fearTimer > 0) tags.push(t('hud_tag_feared'));
      const tagTxt = tags.length > 0 ? ` [${tags.join(' · ')}]` : '';
      const sqTxt = t('hud_squad_info', {
        name: getUnitName(sq.defId, def.name),
        tags: tagTxt,
        alive,
        total: sq.members.length,
        hp: hp.hp,
        maxHp: hp.maxHp,
      });
      if (sqTxt !== this.lastSquadText) {
        this.lastSquadText = sqTxt;
        this.squadInfoLabel.string = sqTxt;
      }
    }
  }
}
