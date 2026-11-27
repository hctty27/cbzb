import { Button, Color, Graphics, Label, Node, Sprite, UITransform } from 'cc';
import { COCOS_DESIGN_HEIGHT, COCOS_DESIGN_WIDTH } from '../core/CoordTransform';
import { SPRITE_MANIFEST } from '../data/AssetManifest';
import { getLevelName, getSpellName, getTutorialHint, t } from '../data/I18n';
import { TUTORIAL1_HINTS, TUTORIAL2_HINTS } from '../data/Level1Data';
import { ALL_SPELLS } from '../data/SpellsData';
import { SpellId } from '../data/Types';
import { UserSettingsStore } from '../data/UserSettings';
import { BattleSim } from '../sim/BattleSim';
import { AudioManager } from './AudioManager';
import { HudSelectionPanels } from './HudSelectionPanels';
import { HudSpellDock } from './HudSpellDock';
import { PauseModalView } from './PauseModalView';
import { getDesignSafeAreaInsets, SafeAreaInsets } from './SafeAreaHelper';
import { getHudHalfExtents } from './ScreenLayout';
import { createUiNode, drawPanel, getStaticSpriteFrame } from './SpriteLoader';

export interface HudSelection {
  strongholdId: string | null;
  buildSiteId: string | null;
  squadId: number | null;
}

export class HudView {
  readonly root: Node;

  private topBarNode!: Node;
  private topBarG!: Graphics;
  private goldIconNode!: Node;
  private foodIconNode!: Node;
  private manaIconNode!: Node;
  private speedBtnNode!: Node;
  private pauseBtnNode!: Node;
  private muteBtnNode!: Node;
  private mapBtnNode!: Node;
  private tutBannerNode!: Node;

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
  private cancelSpellBtn!: Node;

  private spellDock: HudSpellDock;
  private selectionPanels: HudSelectionPanels;
  private pauseModalView: PauseModalView;

  private safeInsets: SafeAreaInsets = { left: 0, right: 0, top: 0, bottom: 0 };
  private selection: HudSelection = { strongholdId: null, buildSiteId: null, squadId: null };
  private activeSpell: SpellId | null = null;

  private refreshAccum = 0;
  private dirty = true;
  private lastGoldText = '';
  private lastSupplyText = '';
  private lastManaText = '';
  private lastTimerText = '';
  private lastSpeedText = '';
  private lastMuteText = '';
  private lastTutText = '';

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

    this.spellDock = new HudSpellDock(this.root, this.sim, this.audio, this.safeInsets, {
      onSelectSpell: (spellId) => this.callbacks.onSelectSpell(spellId),
      onQuickCastUltimate: () => this.callbacks.onQuickCastUltimate(),
    });
    this.spellDock.onSlotClicked = (idx) => this.triggerSpellSlot(idx);

    this.selectionPanels = new HudSelectionPanels(this.root, this.sim, this.audio, this.safeInsets, {
      onClearSelection: () => this.callbacks.onClearSelection(),
      onSendSelectedSquadToNearest: () => this.callbacks.onSendSelectedSquadToNearest(),
      onMutationRefresh: () => this.refresh(),
    });

    this.pauseModalView = new PauseModalView(this.root, this.sim, this.audio, {
      onRestart: () => this.callbacks.onRestart(),
      onCampaignMap: () => this.callbacks.onCampaignMap(),
      onMenu: () => this.callbacks.onMenu(),
      onToggleLanguage: () => this.callbacks.onToggleLanguage(),
    });

    this.relayout();
    this.rebuildForCampaign();
  }

  private buildTopBar(): void {
    const bar = createUiNode('TopBar', this.root, COCOS_DESIGN_WIDTH, 52);
    this.topBarNode = bar;
    this.topBarG = bar.addComponent(Graphics);

    const makeIcon = (name: string, key: string): Node => {
      const iconN = createUiNode(name, bar, 30, 30);
      const sp = iconN.addComponent(Sprite);
      sp.sizeMode = Sprite.SizeMode.CUSTOM;
      if (SPRITE_MANIFEST[key]) {
        void getStaticSpriteFrame(key).then((sf) => {
          if (iconN.isValid) sp.spriteFrame = sf;
        });
      }
      return iconN;
    };

    this.goldIconNode = makeIcon('IconGold', 'ui/icon_res_gold');
    this.foodIconNode = makeIcon('IconFood', 'ui/icon_res_food');
    this.manaIconNode = makeIcon('IconMana', 'ui/icon_res_mana');

    const makeStat = (width: number, color: Color): Label => {
      const n = createUiNode('Stat', bar, width, 32);
      const lbl = n.addComponent(Label);
      lbl.fontSize = 15;
      lbl.lineHeight = 22;
      lbl.isBold = true;
      lbl.enableWrapText = false;
      lbl.overflow = Label.Overflow.SHRINK;
      lbl.color = color;
      return lbl;
    };

    this.goldLabel = makeStat(176, new Color(255, 222, 108, 255));
    this.supplyLabel = makeStat(140, new Color(156, 232, 162, 255));
    this.manaLabel = makeStat(148, new Color(140, 220, 255, 255));
    this.timerLabel = makeStat(220, new Color(240, 234, 216, 255));

    const makeTopBtn = (labelText: string, w: number, onClick: () => void): { node: Node; lbl: Label } => {
      const b = createUiNode(`TopBtn_${labelText}`, bar, w, 34);
      drawPanel(b.addComponent(Graphics), w, 34, new Color(46, 38, 62, 240), new Color(205, 168, 86, 230), 2, 7);
      const ln = createUiNode('Lbl', b, w - 8, 26);
      const l = ln.addComponent(Label);
      l.string = labelText;
      l.fontSize = 14;
      l.lineHeight = 18;
      l.isBold = true;
      l.overflow = Label.Overflow.SHRINK;
      l.color = new Color(255, 230, 165, 255);
      const comp = b.addComponent(Button);
      comp.transition = Button.Transition.SCALE;
      comp.zoomScale = 1.05;
      b.on(Button.EventType.CLICK, () => {
        this.audio.playSfx('ui_click');
        onClick();
      });
      return { node: b, lbl: l };
    };

    const speedBtn = makeTopBtn(t('hud_speed_1x'), 96, () => {
      this.toggleSpeed();
    });
    this.speedBtnNode = speedBtn.node;
    this.speedLabel = speedBtn.lbl;

    const pauseBtn = makeTopBtn(t('hud_pause_btn'), 102, () => {
      this.togglePause();
    });
    this.pauseBtnNode = pauseBtn.node;
    this.pauseTopBtnLabel = pauseBtn.lbl;

    const muteBtn = makeTopBtn(t('hud_mute_off'), 112, () => {
      this.audio.toggleMute();
      this.refresh();
    });
    this.muteBtnNode = muteBtn.node;
    this.muteLabel = muteBtn.lbl;

    const mapBtn = makeTopBtn(t('hud_map_btn'), 72, () => {
      this.callbacks.onCampaignMap();
    });
    this.mapBtnNode = mapBtn.node;
    this.mapTopBtnLabel = mapBtn.lbl;
  }

  private buildTutorialBanner(): void {
    const tutNode = createUiNode('TutorialBanner', this.root, 760, 32);
    this.tutBannerNode = tutNode;
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

  relayout(): void {
    const { halfW, halfH } = getHudHalfExtents();
    const insets = getDesignSafeAreaInsets();
    this.safeInsets = insets;

    const barWidth = halfW * 2;
    this.topBarNode.getComponent(UITransform)?.setContentSize(barWidth, 52);
    this.topBarNode.setPosition(0, halfH - 26 - insets.top);
    this.topBarG.clear();
    drawPanel(
      this.topBarG,
      barWidth,
      52,
      new Color(16, 18, 24, 236),
      new Color(192, 152, 82, 235),
      2,
      0,
    );

    const L = -halfW + insets.left;
    this.goldIconNode.setPosition(L + 26, 0);
    this.goldLabel.node.setPosition(L + 130, 0);
    this.foodIconNode.setPosition(L + 234, 0);
    this.supplyLabel.node.setPosition(L + 318, 0);
    this.manaIconNode.setPosition(L + 402, 0);
    this.manaLabel.node.setPosition(L + 492, 0);
    this.timerLabel.node.setPosition(L + 692, 0);

    const R = halfW - insets.right;
    this.speedBtnNode.setPosition(R - 370, 0);
    this.pauseBtnNode.setPosition(R - 258, 0);
    this.muteBtnNode.setPosition(R - 142, 0);
    this.mapBtnNode.setPosition(R - 42, 0);

    const bannerY = halfH - 70 - insets.top;
    this.tutBannerNode.setPosition(-20, bannerY);
    this.cancelSpellBtn.setPosition(R - 184, bannerY);

    this.spellDock.layout(halfW, halfH, insets);
    this.selectionPanels.layout(halfH, insets);
  }

  isPauseModalOpen(): boolean {
    return this.pauseModalView.isOpen();
  }

  setPaused(paused: boolean): void {
    this.pauseModalView.setPaused(paused);
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
    this.spellDock.triggerSlot(slotIdx, this.activeSpell);
  }

  rebuildForCampaign(): void {
    this.spellDock.rebuildForCampaign();
    this.selectionPanels.rebuildForCampaign();
    this.markDirty();
  }

  refreshLocale(): void {
    this.lastGoldText = '';
    this.lastSupplyText = '';
    this.lastManaText = '';
    this.lastTimerText = '';
    this.lastSpeedText = '';
    this.lastMuteText = '';
    this.lastTutText = '';

    this.pauseTopBtnLabel.string = t('hud_pause_btn');
    this.mapTopBtnLabel.string = t('hud_map_btn');
    this.cancelSpellLabel.string = t('hud_cancel_spell');
    this.spellDock.refreshLocale();
    this.selectionPanels.refreshLocale();
    this.pauseModalView.refreshLocale();
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

    const p = this.sim.getCombatant(this.sim.playerFaction);

    const goldTxt = t('hud_gold', { gold: p.gold, rate: Math.round(p.netGoldPerSec * 10) / 10 });
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

    this.spellDock.refresh(this.activeSpell);
    this.selectionPanels.refresh(this.selection);
  }
}
