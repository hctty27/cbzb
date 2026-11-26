import { BlockInputEvents, Button, Color, Graphics, Label, Node, Sprite } from 'cc';
import { COCOS_DESIGN_HEIGHT, COCOS_DESIGN_WIDTH } from '../core/CoordTransform';
import { MAX_STRONGHOLD_LEVEL, STRONGHOLD_STATS, STRONGHOLD_UPGRADE_COSTS } from '../data/BuildingsData';
import { TUTORIAL1_HINTS, TUTORIAL2_HINTS } from '../data/Level1Data';
import { ALL_SPELLS, CAMPAIGN_SPELL_ORDER } from '../data/SpellsData';
import { PlayableCampaignId, SpellId } from '../data/Types';
import { getRecruitIdsForFaction, UNIT_DEFS } from '../data/UnitsData';
import { UserSettingsStore } from '../data/UserSettings';
import { BattleSim } from '../sim/BattleSim';
import { countAliveUnits, getSquadTotalHp } from '../sim/CombatMath';
import { AudioManager } from './AudioManager';
import { getDesignSafeAreaInsets, SafeAreaInsets } from './SafeAreaHelper';
import { createUiNode, drawPanel, getStaticSpriteFrame } from './SpriteLoader';

export interface HudSelection {
  strongholdId: string | null;
  buildSiteId: string | null;
  squadId: number | null;
}

const FACTION_COLOR_SUFFIX: Record<PlayableCampaignId, string> = {
  Westaria: 'green',
  TheKhaganate: 'red',
  TheCult: 'blue',
};

export class HudView {
  readonly root: Node;

  private goldLabel!: Label;
  private supplyLabel!: Label;
  private manaLabel!: Label;
  private timerLabel!: Label;
  private speedLabel!: Label;
  private muteLabel!: Label;
  private tutLabel!: Label;

  private spellDockNode!: Node;
  private spellButtons: Array<{
    slotIdx: number;
    spellId: SpellId;
    node: Node;
    bg: Graphics;
    iconNode: Node;
    iconSp: Sprite;
    nameLbl: Label;
    costLbl: Label;
    loadedIconKey: string;
  }> = [];

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
    label: string;
    sub: string;
    node: Node;
    iconNode: Node;
    iconSp: Sprite;
    lbl: Label;
    loadedIconKey: string;
  }> = [];
  private squadBar!: Node;
  private squadInfoLabel!: Label;

  private pauseModal!: Node;
  private bgmVolLabel!: Label;
  private sfxVolLabel!: Label;
  private cancelSpellBtn!: Node;
  private safeInsets: SafeAreaInsets = { left: 0, right: 0, top: 0, bottom: 0 };
  private selection: HudSelection = { strongholdId: null, buildSiteId: null, squadId: null };
  private activeSpell: SpellId | null = null;

  constructor(
    parent: Node,
    private sim: BattleSim,
    private audio: AudioManager,
    private settings: UserSettingsStore,
    private callbacks: {
      onClearSelection: () => void;
      onRestart: () => void;
      onCampaignMap: () => void;
      onMenu: () => void;
      onSendSelectedSquadToNearest: () => void;
      onSelectSpell: (spellId: SpellId | null) => void;
      onQuickCastUltimate: () => void;
    },
  ) {
    this.safeInsets = getDesignSafeAreaInsets();
    this.root = createUiNode('HudView', parent, COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT);
    this.buildTopBar();
    this.buildTutorialBanner();
    this.buildSpellDock();
    this.buildStrongholdPanel();
    this.buildSitePanel();
    this.buildSquadBar();
    this.buildPauseModal();
    this.rebuildForCampaign();
  }

  private buildTopBar(): void {
    const bar = createUiNode('TopBar', this.root, COCOS_DESIGN_WIDTH, 50);
    bar.setPosition(0, COCOS_DESIGN_HEIGHT * 0.5 - 25 - this.safeInsets.top);
    drawPanel(
      bar.addComponent(Graphics),
      COCOS_DESIGN_WIDTH,
      50,
      new Color(18, 22, 32, 232),
      new Color(175, 140, 72, 220),
      2,
      0,
    );

    const makeStat = (x: number, color: Color): Label => {
      const n = createUiNode('Stat', bar, 210, 32);
      n.setPosition(x, 0);
      const lbl = n.addComponent(Label);
      lbl.fontSize = 17;
      lbl.lineHeight = 22;
      lbl.isBold = true;
      lbl.color = color;
      return lbl;
    };

    this.goldLabel = makeStat(-515, new Color(255, 218, 92, 255));
    this.supplyLabel = makeStat(-315, new Color(130, 230, 140, 255));
    this.manaLabel = makeStat(-130, new Color(125, 200, 255, 255));
    this.timerLabel = makeStat(65, new Color(240, 236, 224, 255));

    const makeTopBtn = (labelText: string, x: number, w: number, onClick: () => void): Label => {
      const b = createUiNode(`TopBtn_${labelText}`, bar, w, 34);
      b.setPosition(x, 0);
      drawPanel(b.addComponent(Graphics), w, 34, new Color(46, 38, 62, 240), new Color(205, 168, 86, 230), 2, 7);
      const ln = createUiNode('Lbl', b, w - 8, 26);
      const l = ln.addComponent(Label);
      l.string = labelText;
      l.fontSize = 14;
      l.lineHeight = 18;
      l.isBold = true;
      l.color = new Color(255, 230, 165, 255);
      const comp = b.addComponent(Button);
      comp.transition = Button.Transition.SCALE;
      comp.zoomScale = 1.05;
      b.on(Button.EventType.CLICK, () => {
        this.audio.playSfx('ui_click');
        onClick();
      });
      return l;
    };

    this.speedLabel = makeTopBtn('1X [F]', 270, 96, () => {
      this.toggleSpeed();
    });

    makeTopBtn('PAUSE [SPC]', 382, 102, () => {
      this.togglePause();
    });

    this.muteLabel = makeTopBtn('SFX ON [M]', 498, 112, () => {
      this.audio.toggleMute();
      this.refresh();
    });

    makeTopBtn('MAP', 598, 72, () => {
      this.callbacks.onCampaignMap();
    });
  }

  private buildTutorialBanner(): void {
    const bannerY = COCOS_DESIGN_HEIGHT * 0.5 - 70 - this.safeInsets.top;
    const tutNode = createUiNode('TutorialBanner', this.root, 760, 32);
    tutNode.setPosition(-20, bannerY);
    drawPanel(
      tutNode.addComponent(Graphics),
      760,
      32,
      new Color(22, 26, 38, 212),
      new Color(140, 165, 200, 180),
      1.5,
      8,
    );
    this.tutLabel = createUiNode('TutLbl', tutNode, 740, 26).addComponent(Label);
    this.tutLabel.fontSize = 14;
    this.tutLabel.lineHeight = 18;
    this.tutLabel.overflow = Label.Overflow.SHRINK;
    this.tutLabel.color = new Color(242, 236, 205, 255);

    this.cancelSpellBtn = createUiNode('CancelSpellBtn', this.root, 148, 32);
    this.cancelSpellBtn.setPosition(456, bannerY);
    drawPanel(
      this.cancelSpellBtn.addComponent(Graphics),
      148,
      32,
      new Color(120, 36, 36, 240),
      new Color(240, 175, 120, 235),
      2,
      8,
    );
    const cLbl = createUiNode('CancelLbl', this.cancelSpellBtn, 138, 24).addComponent(Label);
    cLbl.string = 'CANCEL [ESC]';
    cLbl.fontSize = 13;
    cLbl.isBold = true;
    cLbl.color = new Color(255, 234, 195, 255);
    const cBtn = this.cancelSpellBtn.addComponent(Button);
    cBtn.transition = Button.Transition.SCALE;
    cBtn.zoomScale = 1.05;
    this.cancelSpellBtn.on(Button.EventType.CLICK, () => {
      this.audio.playSfx('ui_click');
      this.callbacks.onSelectSpell(null);
    });
    this.cancelSpellBtn.active = false;
  }

  private buildSpellDock(): void {
    this.spellDockNode = createUiNode('SpellDock', this.root, 234, 120);
    this.spellDockNode.setPosition(
      -COCOS_DESIGN_WIDTH * 0.5 + 126 + this.safeInsets.left,
      -COCOS_DESIGN_HEIGHT * 0.5 + 65 + this.safeInsets.bottom,
    );
    drawPanel(
      this.spellDockNode.addComponent(Graphics),
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
      const b = createUiNode(`SpellSlot_${idx}`, this.spellDockNode, 104, 48);
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
        this.triggerSpellSlot(idx);
      });

      this.spellButtons.push({
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

  private buildStrongholdPanel(): void {
    this.actionPanel = createUiNode('StrongholdActionPanel', this.root, 760, 118);
    this.actionPanel.setPosition(85, -COCOS_DESIGN_HEIGHT * 0.5 + 64 + this.safeInsets.bottom);
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
        if (!this.selection.strongholdId) return;
        const pFaction = this.sim.playerFaction;
        const order = getRecruitIdsForFaction(pFaction, this.sim.bonuses);
        const defId = order[i];
        if (!defId) return;
        const ok = this.sim.recruitUnit(pFaction, this.selection.strongholdId, defId);
        if (ok) this.audio.playSfx('ui_click');
        this.refresh();
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
      if (!this.selection.strongholdId) return;
      if (this.sim.upgradeStronghold(this.sim.playerFaction, this.selection.strongholdId)) {
        this.audio.playSfx('build_farm');
      }
      this.refresh();
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

  private buildSitePanel(): void {
    this.buildPanel = createUiNode('BuildSitePanel', this.root, 460, 108);
    this.buildPanel.setPosition(85, -COCOS_DESIGN_HEIGHT * 0.5 + 60 + this.safeInsets.bottom);
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

    const kinds: Array<{ kind: 'Village' | 'Mine' | 'Obelisk'; label: string; sub: string; x: number }> = [
      { kind: 'Village', label: 'Farm', sub: '+1 Supply', x: -140 },
      { kind: 'Mine', label: 'Mine', sub: '+2 Gold/s', x: 0 },
      { kind: 'Obelisk', label: 'Obelisk', sub: '+1 Mana/s', x: 140 },
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
      lbl.string = `${k.label}\n${k.sub}`;
      lbl.fontSize = 13;
      lbl.lineHeight = 17;
      lbl.isBold = true;
      b.addComponent(Button).node.on(Button.EventType.CLICK, () => {
        if (!this.selection.buildSiteId) return;
        const ok = this.sim.buildSupplyBuilding(this.sim.playerFaction, this.selection.buildSiteId, k.kind);
        if (ok) {
          const sfx = k.kind === 'Village' ? 'build_farm' : k.kind === 'Mine' ? 'build_mine' : 'build_obelisk';
          this.audio.playSfx(sfx);
          this.callbacks.onClearSelection();
        }
        this.refresh();
      });

      this.buildKindNodes.push({
        kind: k.kind,
        label: k.label,
        sub: k.sub,
        node: b,
        iconNode: ic,
        iconSp: sp,
        lbl,
        loadedIconKey: '',
      });
    }

    this.buildPanel.active = false;
  }

  private buildSquadBar(): void {
    this.squadBar = createUiNode('SelectedSquadBar', this.root, 620, 62);
    this.squadBar.setPosition(85, -COCOS_DESIGN_HEIGHT * 0.5 + 38 + this.safeInsets.bottom);
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
    atkLbl.string = 'MARCH TO ENEMY';
    atkLbl.fontSize = 14;
    atkLbl.isBold = true;
    atkBtn.addComponent(Button).node.on(Button.EventType.CLICK, () => {
      this.audio.playSfx('ui_click');
      this.callbacks.onSendSelectedSquadToNearest();
    });

    this.squadBar.active = false;
  }

  private buildPauseModal(): void {
    this.pauseModal = createUiNode('PauseModal', this.root, COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT);
    this.pauseModal.addComponent(BlockInputEvents);
    drawPanel(
      this.pauseModal.addComponent(Graphics),
      COCOS_DESIGN_WIDTH,
      COCOS_DESIGN_HEIGHT,
      new Color(8, 10, 16, 185),
      undefined,
      0,
      0,
    );

    const card = createUiNode('PauseCard', this.pauseModal, 380, 410);
    drawPanel(card.addComponent(Graphics), 380, 410, new Color(28, 24, 38, 248), new Color(214, 173, 86, 255), 3, 14);
    const tl = createUiNode('PauseTitle', card, 320, 40).addComponent(Label);
    tl.node.setPosition(0, 166);
    tl.string = 'GAME PAUSED';
    tl.fontSize = 26;
    tl.isBold = true;
    tl.color = new Color(255, 224, 130, 255);

    const makeVolRow = (title: string, y: number, onDelta: (delta: number) => void): Label => {
      const lbl = createUiNode(`VolLbl_${title}`, card, 150, 28).addComponent(Label);
      lbl.node.setPosition(-72, y);
      lbl.fontSize = 15;
      lbl.isBold = true;
      lbl.color = new Color(235, 232, 220, 255);

      const makeStep = (txt: string, x: number, delta: number) => {
        const b = createUiNode(`VolBtn_${title}_${txt}`, card, 42, 30);
        b.setPosition(x, y);
        drawPanel(b.addComponent(Graphics), 42, 30, new Color(54, 46, 76, 240), new Color(205, 168, 86, 220), 1.5, 6);
        const bl = createUiNode('L', b, 34, 24).addComponent(Label);
        bl.string = txt;
        bl.fontSize = 16;
        bl.isBold = true;
        bl.color = new Color(255, 232, 165, 255);
        b.addComponent(Button).node.on(Button.EventType.CLICK, () => {
          onDelta(delta);
          this.audio.playSfx('ui_click');
          this.refreshVolumeLabels();
        });
      };

      makeStep('-', 68, -0.15);
      makeStep('+', 120, 0.15);
      return lbl;
    };

    this.bgmVolLabel = makeVolRow('BGM', 110, (d) => {
      this.audio.setBgmVolume(this.audio.getBgmVolume() + d);
    });
    this.sfxVolLabel = makeVolRow('SFX', 68, (d) => {
      this.audio.setSfxVolume(this.audio.getSfxVolume() + d);
    });
    this.refreshVolumeLabels();

    const makeBtn = (txt: string, y: number, fn: () => void) => {
      const b = createUiNode(`PauseBtn_${txt}`, card, 240, 42);
      b.setPosition(0, y);
      drawPanel(b.addComponent(Graphics), 240, 42, new Color(68, 42, 92, 240), new Color(214, 173, 86, 230), 2, 8);
      const l = createUiNode('L', b, 220, 28).addComponent(Label);
      l.string = txt;
      l.fontSize = 15;
      l.isBold = true;
      b.addComponent(Button).node.on(Button.EventType.CLICK, () => {
        this.audio.playSfx('ui_click');
        fn();
      });
    };

    makeBtn('RESUME', 12, () => {
      this.setPaused(false);
    });
    makeBtn('RESTART MISSION', -40, () => {
      this.setPaused(false);
      this.callbacks.onRestart();
    });
    makeBtn('CAMPAIGN MAP', -92, () => {
      this.setPaused(false);
      this.callbacks.onCampaignMap();
    });
    makeBtn('MAIN MENU', -144, () => {
      this.setPaused(false);
      this.callbacks.onMenu();
    });

    this.pauseModal.active = false;
  }

  private refreshVolumeLabels(): void {
    if (!this.bgmVolLabel || !this.sfxVolLabel) return;
    const bgmPct = Math.round(this.audio.getBgmVolume() * 100);
    const sfxPct = Math.round(this.audio.getSfxVolume() * 100);
    this.bgmVolLabel.string = `BGM: ${bgmPct}%`;
    this.sfxVolLabel.string = `SFX: ${sfxPct}%`;
  }

  isPauseModalOpen(): boolean {
    return Boolean(this.pauseModal?.active);
  }

  setPaused(paused: boolean): void {
    this.sim.paused = paused;
    this.pauseModal.active = paused;
    if (paused) {
      this.refreshVolumeLabels();
    }
  }

  togglePause(): void {
    this.setPaused(!this.sim.paused);
  }

  toggleSpeed(): void {
    const next: 1 | 2 = this.sim.speedMultiplier === 1 ? 2 : 1;
    this.sim.speedMultiplier = next;
    this.settings.setPreferredSpeed(next);
    this.refresh();
  }

  triggerSpellSlot(slotIdx: number): void {
    const order = CAMPAIGN_SPELL_ORDER[this.sim.playerFaction];
    const spellId = order[slotIdx];
    if (!spellId || !this.sim.canCastSpell(this.sim.playerFaction, spellId)) return;
    this.audio.playSfx('ui_click');
    const def = ALL_SPELLS[spellId];
    if (def.kind === 'ultimate' && this.activeSpell === spellId) {
      this.callbacks.onSelectSpell(null);
      this.callbacks.onQuickCastUltimate();
      return;
    }
    const next = this.activeSpell === spellId ? null : spellId;
    this.callbacks.onSelectSpell(next);
  }

  rebuildForCampaign(): void {
    const pFaction = this.sim.playerFaction;
    const order = CAMPAIGN_SPELL_ORDER[pFaction];
    for (const sb of this.spellButtons) {
      const sid = order[sb.slotIdx];
      sb.spellId = sid;
      const def = ALL_SPELLS[sid];
      sb.nameLbl.string = def.shortName;
      if (sb.loadedIconKey !== def.iconKey) {
        sb.loadedIconKey = def.iconKey;
        getStaticSpriteFrame(def.iconKey).then((sf) => {
          if (sb.iconNode.isValid) sb.iconSp.spriteFrame = sf;
        });
      }
    }

    const colSuffix = FACTION_COLOR_SUFFIX[pFaction] ?? 'green';
    for (const bn of this.buildKindNodes) {
      const base = bn.kind.toLowerCase();
      const key = `buildings/${base}_${colSuffix}`;
      if (bn.loadedIconKey !== key) {
        bn.loadedIconKey = key;
        getStaticSpriteFrame(key).then((sf) => {
          if (bn.iconNode.isValid) bn.iconSp.spriteFrame = sf;
        });
      }
    }
  }

  setSelection(sel: HudSelection): void {
    this.selection = sel;
    this.refresh();
  }

  setActiveSpell(spell: SpellId | null): void {
    this.activeSpell = spell;
    this.refresh();
  }

  refresh(): void {
    const pFaction = this.sim.playerFaction;
    const p = this.sim.getCombatant(pFaction);
    this.goldLabel.string = `GOLD: ${p.gold} (+${p.netGoldPerSec}/s)`;
    this.supplyLabel.string = `SUPPLY: ${p.usedSupply}/${p.totalSupply}`;
    this.manaLabel.string = `MANA: ${p.mana}/500`;

    const secs = Math.floor(this.sim.elapsedSec);
    const mm = String(Math.floor(secs / 60)).padStart(2, '0');
    const ss = String(secs % 60).padStart(2, '0');
    this.timerLabel.string = `TIME: ${mm}:${ss}  (GOLD <05:30)`;
    this.speedLabel.string = this.sim.speedMultiplier === 2 ? '2X [F]' : '1X [F]';
    this.muteLabel.string = this.audio.isMuted() ? 'MUTED [M]' : 'SFX ON [M]';
    this.cancelSpellBtn.active = Boolean(this.activeSpell);

    if (this.activeSpell) {
      this.tutLabel.string = `TARGETING: ${ALL_SPELLS[this.activeSpell].name} — Tap/Click map to cast`;
    } else if (this.sim.levelDef.tutorialMode === 'tutorial1') {
      this.tutLabel.string = TUTORIAL1_HINTS[Math.min(this.sim.ai.tutorialStep, TUTORIAL1_HINTS.length - 1)];
    } else if (this.sim.levelDef.tutorialMode === 'tutorial2') {
      this.tutLabel.string = TUTORIAL2_HINTS[Math.min(this.sim.ai.tutorialStep, TUTORIAL2_HINTS.length - 1)];
    } else {
      this.tutLabel.string = `Mission ${this.sim.levelDef.missionIndex}: ${this.sim.levelDef.name} — Capture all hostile strongholds!`;
    }

    // Update Spell Dock
    for (const sb of this.spellButtons) {
      const def = ALL_SPELLS[sb.spellId];
      const unlocked = this.sim.bonuses.unlockedSpells.includes(sb.spellId);
      const ready = this.sim.canCastSpell(pFaction, sb.spellId);
      const selected = this.activeSpell === sb.spellId;

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

      if (!unlocked) {
        sb.costLbl.string = 'LOCKED';
        sb.costLbl.color = new Color(200, 120, 120, 220);
      } else if (def.kind === 'ultimate') {
        const pct = Math.min(100, Math.floor((p.ultimateCharge / p.ultimateMax) * 100));
        sb.costLbl.string = ready ? 'READY!' : `${pct}%`;
        sb.costLbl.color = ready ? new Color(255, 232, 95, 255) : new Color(170, 200, 225, 230);
      } else {
        const cost = this.sim.getEffectiveSpellCost(pFaction, sb.spellId);
        sb.costLbl.string = `${cost}m`;
        sb.costLbl.color = ready ? new Color(135, 220, 255, 255) : new Color(195, 130, 130, 220);
      }
    }

    // Bottom panel state
    const sh = this.selection.strongholdId
      ? this.sim.strongholds.find((s) => s.id === this.selection.strongholdId && s.owner === pFaction)
      : undefined;
    const bs = this.selection.buildSiteId
      ? this.sim.buildSites.find((b) => b.id === this.selection.buildSiteId && b.owner === pFaction && b.supplyKind === 'Empty')
      : undefined;
    const sq = this.selection.squadId
      ? this.sim.squads.find((q) => q.id === this.selection.squadId && q.owner === pFaction && q.state !== 'Dead')
      : undefined;

    this.actionPanel.active = Boolean(sh);
    this.buildPanel.active = Boolean(!sh && bs);
    this.squadBar.active = Boolean(!sh && !bs && sq);

    if (sh) {
      this.actionTitleLabel.string = `${sh.name} (Lv.${sh.level}) · HP ${sh.hp}/${sh.maxHp}`;
      const freeSupply = p.totalSupply - p.usedSupply;
      const recruitIds = getRecruitIdsForFaction(pFaction, this.sim.bonuses);
      for (const ub of this.unitButtons) {
        const defId = recruitIds[ub.slotIdx];
        const def = UNIT_DEFS[defId];
        if (!def) continue;
        const effCost = this.sim.getEffectiveUnitCost(pFaction, def);
        ub.nameLbl.string = def.name;
        ub.costLbl.string = `${effCost}g · ${def.upkeep}sup`;
        if (ub.loadedIconKey !== def.iconKey) {
          ub.loadedIconKey = def.iconKey;
          getStaticSpriteFrame(def.iconKey).then((sf) => {
            if (ub.node.isValid) ub.iconSp.spriteFrame = sf;
          });
        }
        const unlocked = this.sim.isUnitUnlockedForPlayer(defId);
        const affordable = unlocked && p.gold >= effCost && freeSupply >= def.upkeep;
        drawPanel(
          ub.bg,
          106,
          76,
          affordable ? new Color(40, 56, 48, 245) : new Color(32, 32, 42, 225),
          affordable ? new Color(130, 225, 130, 240) : new Color(100, 100, 115, 180),
          2,
          8,
        );
        ub.lockLbl.string = !unlocked ? 'LOCKED' : freeSupply < def.upkeep ? 'NO SUPPLY' : '';
      }

      if (sh.level >= MAX_STRONGHOLD_LEVEL) {
        this.upgradeBtnLabel.string = 'MAX\nLEVEL';
      } else {
        const upCost = STRONGHOLD_UPGRADE_COSTS[sh.level];
        this.upgradeBtnLabel.string = `UPGRADE\n${upCost} Gold\n(+50% HP)`;
      }
    } else if (bs) {
      const supplyCost = this.sim.getEffectiveSupplyCost(pFaction, 'Village');
      this.buildTitleLabel.string = `CONSTRUCT SUPPLY BUILDING (${supplyCost} Gold)`;
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
      if (sq.heroicTimer > 0) tags.push('HEROIC');
      if (sq.bloodlustTimer > 0) tags.push('BLOODLUST');
      if (sq.frostEnchantTimer > 0) tags.push('FROST ARMOR');
      if (sq.liberationTimer > 0) tags.push('LIBERATED');
      if (sq.frozenTimer > 0) tags.push('FROZEN');
      if (sq.poisonTimer > 0) tags.push('POISONED');
      if (sq.fearTimer > 0) tags.push('FEARED');
      const tagTxt = tags.length > 0 ? ` [${tags.join(' · ')}]` : '';
      this.squadInfoLabel.string = `${def.name}${tagTxt} (${alive}/${sq.members.length}, HP ${hp.hp}/${hp.maxHp})\nClick map or enemy stronghold to march & attack`;
    }
  }
}
