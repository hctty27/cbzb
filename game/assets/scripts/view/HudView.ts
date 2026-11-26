import { BlockInputEvents, Button, Color, Graphics, Label, Node, Sprite } from 'cc';
import { COCOS_DESIGN_HEIGHT, COCOS_DESIGN_WIDTH } from '../core/CoordTransform';
import { MAX_STRONGHOLD_LEVEL, STRONGHOLD_STATS, STRONGHOLD_UPGRADE_COSTS } from '../data/BuildingsData';
import { getLevelName, getSpellName, getTutorialHint, getUnitName, t } from '../data/I18n';
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
  private pauseTopBtnLabel!: Label;
  private muteLabel!: Label;
  private mapTopBtnLabel!: Label;
  private tutLabel!: Label;
  private cancelSpellLabel!: Label;

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

  private pauseModal!: Node;
  private pauseTitleLabel!: Label;
  private bgmVolLabel!: Label;
  private sfxVolLabel!: Label;
  private pauseLangLabel!: Label;
  private pauseLangBtnLabel!: Label;
  private pauseResumeLabel!: Label;
  private pauseRestartLabel!: Label;
  private pauseMapLabel!: Label;
  private pauseMenuLabel!: Label;
  private cancelSpellBtn!: Node;
  private safeInsets: SafeAreaInsets = { left: 0, right: 0, top: 0, bottom: 0 };
  private selection: HudSelection = { strongholdId: null, buildSiteId: null, squadId: null };
  private activeSpell: SpellId | null = null;

  private refreshAccum = 0;
  private dirty = true;
  private spellStates: string[] = ['', '', '', ''];
  private unitBtnStates: string[] = ['', '', '', '', ''];
  private lastGoldText = '';
  private lastSupplyText = '';
  private lastManaText = '';
  private lastTimerText = '';
  private lastSpeedText = '';
  private lastMuteText = '';
  private lastTutText = '';
  private lastActionHeader = '';
  private lastUpgradeText = '';
  private lastBuildTitle = '';
  private lastSquadText = '';

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
      onToggleLanguage: () => void;
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
      lbl.cacheMode = Label.CacheMode.CHAR;
      lbl.overflow = Label.Overflow.SHRINK;
      lbl.color = color;
      return lbl;
    };

    this.goldLabel = makeStat(-515, new Color(255, 218, 92, 255));
    this.supplyLabel = makeStat(-315, new Color(130, 230, 140, 255));
    this.manaLabel = makeStat(-130, new Color(125, 200, 255, 255));
    this.timerLabel = makeStat(65, new Color(240, 236, 224, 255));

    const makeTopBtn = (labelText: string, x: number, w: number, onClick: () => void, charCache = false): Label => {
      const b = createUiNode(`TopBtn_${labelText}`, bar, w, 34);
      b.setPosition(x, 0);
      drawPanel(b.addComponent(Graphics), w, 34, new Color(46, 38, 62, 240), new Color(205, 168, 86, 230), 2, 7);
      const ln = createUiNode('Lbl', b, w - 8, 26);
      const l = ln.addComponent(Label);
      l.string = labelText;
      l.fontSize = 14;
      l.lineHeight = 18;
      l.isBold = true;
      l.overflow = Label.Overflow.SHRINK;
      if (charCache) l.cacheMode = Label.CacheMode.CHAR;
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

    this.speedLabel = makeTopBtn(t('hud_speed_1x'), 270, 96, () => {
      this.toggleSpeed();
    }, true);

    this.pauseTopBtnLabel = makeTopBtn(t('hud_pause_btn'), 382, 102, () => {
      this.togglePause();
    });

    this.muteLabel = makeTopBtn(t('hud_mute_off'), 498, 112, () => {
      this.audio.toggleMute();
      this.refresh();
    });

    this.mapTopBtnLabel = makeTopBtn(t('hud_map_btn'), 598, 72, () => {
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
    cLbl.string = t('hud_cancel_spell');
    cLbl.fontSize = 13;
    cLbl.isBold = true;
    cLbl.overflow = Label.Overflow.SHRINK;
    cLbl.color = new Color(255, 234, 195, 255);
    this.cancelSpellLabel = cLbl;
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

    const kinds: Array<{ kind: 'Village' | 'Mine' | 'Obelisk'; i18nKey: 'hud_build_farm' | 'hud_build_mine' | 'hud_build_obelisk'; x: number }> = [
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

    const card = createUiNode('PauseCard', this.pauseModal, 380, 456);
    drawPanel(card.addComponent(Graphics), 380, 456, new Color(28, 24, 38, 248), new Color(214, 173, 86, 255), 3, 14);
    this.pauseTitleLabel = createUiNode('PauseTitle', card, 320, 40).addComponent(Label);
    this.pauseTitleLabel.node.setPosition(0, 192);
    this.pauseTitleLabel.string = t('pause_title');
    this.pauseTitleLabel.fontSize = 25;
    this.pauseTitleLabel.isBold = true;
    this.pauseTitleLabel.overflow = Label.Overflow.SHRINK;
    this.pauseTitleLabel.color = new Color(255, 224, 130, 255);

    const makeVolRow = (title: string, y: number, onDelta: (delta: number) => void): Label => {
      const lbl = createUiNode(`VolLbl_${title}`, card, 158, 28).addComponent(Label);
      lbl.node.setPosition(-72, y);
      lbl.fontSize = 15;
      lbl.isBold = true;
      lbl.overflow = Label.Overflow.SHRINK;
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

    this.bgmVolLabel = makeVolRow('BGM', 138, (d) => {
      this.audio.setBgmVolume(this.audio.getBgmVolume() + d);
    });
    this.sfxVolLabel = makeVolRow('SFX', 98, (d) => {
      this.audio.setSfxVolume(this.audio.getSfxVolume() + d);
    });

    // Language toggle row inside Pause Modal
    this.pauseLangLabel = createUiNode('PauseLangLbl', card, 170, 28).addComponent(Label);
    this.pauseLangLabel.node.setPosition(-68, 58);
    this.pauseLangLabel.fontSize = 14;
    this.pauseLangLabel.isBold = true;
    this.pauseLangLabel.overflow = Label.Overflow.SHRINK;
    this.pauseLangLabel.color = new Color(235, 232, 220, 255);

    const langBtn = createUiNode('PauseBtnLang', card, 94, 30);
    langBtn.setPosition(94, 58);
    drawPanel(langBtn.addComponent(Graphics), 94, 30, new Color(54, 46, 76, 240), new Color(205, 168, 86, 220), 1.5, 6);
    this.pauseLangBtnLabel = createUiNode('L', langBtn, 86, 24).addComponent(Label);
    this.pauseLangBtnLabel.fontSize = 14;
    this.pauseLangBtnLabel.isBold = true;
    this.pauseLangBtnLabel.overflow = Label.Overflow.SHRINK;
    this.pauseLangBtnLabel.color = new Color(255, 232, 165, 255);
    langBtn.addComponent(Button).node.on(Button.EventType.CLICK, () => {
      this.audio.playSfx('ui_click');
      this.callbacks.onToggleLanguage();
    });

    this.refreshVolumeLabels();

    const makeBtn = (name: string, txt: string, y: number, fn: () => void): Label => {
      const b = createUiNode(name, card, 240, 42);
      b.setPosition(0, y);
      drawPanel(b.addComponent(Graphics), 240, 42, new Color(68, 42, 92, 240), new Color(214, 173, 86, 230), 2, 8);
      const l = createUiNode('L', b, 220, 28).addComponent(Label);
      l.string = txt;
      l.fontSize = 15;
      l.isBold = true;
      l.overflow = Label.Overflow.SHRINK;
      b.addComponent(Button).node.on(Button.EventType.CLICK, () => {
        this.audio.playSfx('ui_click');
        fn();
      });
      return l;
    };

    this.pauseResumeLabel = makeBtn('PauseBtn_RESUME', t('pause_resume'), 2, () => {
      this.setPaused(false);
    });
    this.pauseRestartLabel = makeBtn('PauseBtn_RESTART', t('pause_restart'), -48, () => {
      this.setPaused(false);
      this.callbacks.onRestart();
    });
    this.pauseMapLabel = makeBtn('PauseBtn_MAP', t('pause_map'), -98, () => {
      this.setPaused(false);
      this.callbacks.onCampaignMap();
    });
    this.pauseMenuLabel = makeBtn('PauseBtn_MENU', t('pause_menu'), -148, () => {
      this.setPaused(false);
      this.callbacks.onMenu();
    });

    this.pauseModal.active = false;
  }

  private refreshVolumeLabels(): void {
    if (!this.bgmVolLabel || !this.sfxVolLabel) return;
    const bgmPct = Math.round(this.audio.getBgmVolume() * 100);
    const sfxPct = Math.round(this.audio.getSfxVolume() * 100);
    this.bgmVolLabel.string = t('pause_bgm', { pct: bgmPct });
    this.sfxVolLabel.string = t('pause_sfx', { pct: sfxPct });
    if (this.pauseLangLabel) this.pauseLangLabel.string = t('pause_lang_row');
    if (this.pauseLangBtnLabel) this.pauseLangBtnLabel.string = t('pause_lang_btn');
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
      sb.nameLbl.string = getSpellName(sid, true, def.name, def.shortName);
      if (sb.loadedIconKey !== def.iconKey) {
        sb.loadedIconKey = def.iconKey;
        getStaticSpriteFrame(def.iconKey).then((sf) => {
          if (sb.iconNode.isValid) sb.iconSp.spriteFrame = sf;
        });
      }
    }

    const colSuffix = FACTION_COLOR_SUFFIX[pFaction] ?? 'green';
    for (const bn of this.buildKindNodes) {
      bn.lbl.string = t(bn.i18nKey);
      const base = bn.kind.toLowerCase();
      const key = `buildings/${base}_${colSuffix}`;
      if (bn.loadedIconKey !== key) {
        bn.loadedIconKey = key;
        getStaticSpriteFrame(key).then((sf) => {
          if (bn.iconNode.isValid) bn.iconSp.spriteFrame = sf;
        });
      }
    }
    this.markDirty();
  }

  refreshLocale(): void {
    this.spellStates = ['', '', '', ''];
    this.unitBtnStates = ['', '', '', '', ''];
    this.lastGoldText = '';
    this.lastSupplyText = '';
    this.lastManaText = '';
    this.lastTimerText = '';
    this.lastSpeedText = '';
    this.lastMuteText = '';
    this.lastTutText = '';
    this.lastActionHeader = '';
    this.lastUpgradeText = '';
    this.lastBuildTitle = '';
    this.lastSquadText = '';

    this.pauseTopBtnLabel.string = t('hud_pause_btn');
    this.mapTopBtnLabel.string = t('hud_map_btn');
    this.cancelSpellLabel.string = t('hud_cancel_spell');
    this.marchBtnLabel.string = t('hud_march_btn');
    this.pauseTitleLabel.string = t('pause_title');
    this.pauseResumeLabel.string = t('pause_resume');
    this.pauseRestartLabel.string = t('pause_restart');
    this.pauseMapLabel.string = t('pause_map');
    this.pauseMenuLabel.string = t('pause_menu');
    this.refreshVolumeLabels();
    this.rebuildForCampaign();
    this.refresh();
  }

  markDirty(): void {
    this.dirty = true;
  }

  tick(dt: number): void {
    this.refreshAccum += dt;
    if (this.dirty || this.refreshAccum >= 0.1) {
      this.refreshAccum = 0;
      this.dirty = false;
      this.refresh();
    }
  }

  setSelection(sel: HudSelection): void {
    this.selection = sel;
    this.markDirty();
    this.refresh();
  }

  setActiveSpell(spell: SpellId | null): void {
    this.activeSpell = spell;
    this.markDirty();
    this.refresh();
  }

  refresh(): void {
    this.dirty = false;
    this.refreshAccum = 0;

    const pFaction = this.sim.playerFaction;
    const p = this.sim.getCombatant(pFaction);

    const goldTxt = t('hud_gold', { gold: p.gold, rate: p.netGoldPerSec });
    if (goldTxt !== this.lastGoldText) {
      this.lastGoldText = goldTxt;
      this.goldLabel.string = goldTxt;
    }

    const supTxt = t('hud_supply', { used: p.usedSupply, total: p.totalSupply });
    if (supTxt !== this.lastSupplyText) {
      this.lastSupplyText = supTxt;
      this.supplyLabel.string = supTxt;
    }

    const manaTxt = t('hud_mana', { mana: p.mana });
    if (manaTxt !== this.lastManaText) {
      this.lastManaText = manaTxt;
      this.manaLabel.string = manaTxt;
    }

    const secs = Math.floor(this.sim.elapsedSec);
    const mm = String(Math.floor(secs / 60)).padStart(2, '0');
    const ss = String(secs % 60).padStart(2, '0');
    const timerTxt = t('hud_time', { time: `${mm}:${ss}` });
    if (timerTxt !== this.lastTimerText) {
      this.lastTimerText = timerTxt;
      this.timerLabel.string = timerTxt;
    }

    const speedTxt = this.sim.speedMultiplier === 2 ? t('hud_speed_2x') : t('hud_speed_1x');
    if (speedTxt !== this.lastSpeedText) {
      this.lastSpeedText = speedTxt;
      this.speedLabel.string = speedTxt;
    }

    const muteTxt = this.audio.isMuted() ? t('hud_mute_on') : t('hud_mute_off');
    if (muteTxt !== this.lastMuteText) {
      this.lastMuteText = muteTxt;
      this.muteLabel.string = muteTxt;
    }

    const showCancel = Boolean(this.activeSpell);
    if (this.cancelSpellBtn.active !== showCancel) {
      this.cancelSpellBtn.active = showCancel;
    }

    let tutTxt: string;
    if (this.activeSpell) {
      const spDef = ALL_SPELLS[this.activeSpell];
      tutTxt = t('hud_targeting', { spell: getSpellName(this.activeSpell, false, spDef.name, spDef.shortName) });
    } else if (this.sim.levelDef.tutorialMode === 'tutorial1') {
      tutTxt = getTutorialHint('tutorial1', this.sim.ai.tutorialStep, TUTORIAL1_HINTS);
    } else if (this.sim.levelDef.tutorialMode === 'tutorial2') {
      tutTxt = getTutorialHint('tutorial2', this.sim.ai.tutorialStep, TUTORIAL2_HINTS);
    } else {
      tutTxt = t('hud_mission_obj', {
        num: this.sim.levelDef.missionIndex,
        name: getLevelName(this.sim.levelDef.id, this.sim.levelDef.name),
      });
    }
    if (tutTxt !== this.lastTutText) {
      this.lastTutText = tutTxt;
      this.tutLabel.string = tutTxt;
    }

    // Update Spell Dock
    for (const sb of this.spellButtons) {
      const def = ALL_SPELLS[sb.spellId];
      const unlocked = this.sim.bonuses.unlockedSpells.includes(sb.spellId);
      const ready = this.sim.canCastSpell(pFaction, sb.spellId);
      const selected = this.activeSpell === sb.spellId;

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
          getStaticSpriteFrame(def.iconKey).then((sf) => {
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
