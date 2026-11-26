import { Button, Color, Graphics, Label, Node } from 'cc';
import { COCOS_DESIGN_HEIGHT, COCOS_DESIGN_WIDTH } from '../core/CoordTransform';
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
import { createUiNode, drawPanel } from './SpriteLoader';

export interface HudSelection {
  strongholdId: string | null;
  buildSiteId: string | null;
  squadId: number | null;
}

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

    this.speedLabel = makeTopBtn(
      t('hud_speed_1x'),
      270,
      96,
      () => {
        this.toggleSpeed();
      },
      true,
    );

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

    this.spellDock.refresh(this.activeSpell);
    this.selectionPanels.refresh(this.selection);
  }
}
