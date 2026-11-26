import {
  _decorator,
  BlockInputEvents,
  Button,
  Color,
  Component,
  EventKeyboard,
  Game,
  game,
  Graphics,
  Input,
  input,
  KeyCode,
  Label,
  Node,
  profiler,
  ResolutionPolicy,
  sys,
  view,
} from 'cc';
import { COCOS_DESIGN_HEIGHT, COCOS_DESIGN_WIDTH } from './core/CoordTransform';
import { CampaignProgressStore, IStorageAdapter } from './data/CampaignProgress';
import { getLevelName, setLanguage as setI18nLanguage, t } from './data/I18n';
import { getCampaignLevelMetas, getLevelMetaById } from './data/LevelCatalog';
import { CAMPAIGN_SPELL_ORDER } from './data/SpellsData';
import { LevelDef, PlayableCampaignId, SpellId } from './data/Types';
import { LanguageCode, UserSettingsStore } from './data/UserSettings';
import { BattleSim } from './sim/BattleSim';
import { ensureBundle, loadMissionAssets } from './view/AssetBundleManager';
import { AudioManager } from './view/AudioManager';
import { BadgesRoomView } from './view/BadgesRoomView';
import { BattleView } from './view/BattleView';
import { CampaignMapView } from './view/CampaignMapView';
import { CampaignSelectView } from './view/CampaignSelectView';
import { HudSelection, HudView } from './view/HudView';
import { ResultOverlay } from './view/ResultOverlay';
import { SaveDataModal } from './view/SaveDataModal';
import { createUiNode, drawPanel } from './view/SpriteLoader';
import { ThroneRoomView } from './view/ThroneRoomView';
import { TitleView } from './view/TitleView';

const { ccclass } = _decorator;

type ScreenMode = 'title' | 'campaign_select' | 'campaign' | 'throne' | 'badges' | 'battle';

const PROGRESS_BAR_WIDTH = 420;
const PROGRESS_BAR_HEIGHT = 16;

function createCocosStorageAdapter(): IStorageAdapter {
  return {
    getItem(key: string): string | null {
      try {
        return sys.localStorage?.getItem(key) ?? null;
      } catch {
        return null;
      }
    },
    setItem(key: string, value: string): void {
      try {
        sys.localStorage?.setItem(key, value);
      } catch {
        // Ignore storage errors
      }
    },
    removeItem(key: string): void {
      try {
        sys.localStorage?.removeItem(key);
      } catch {
        // Ignore storage errors
      }
    },
  };
}

function detectBrowserLanguage(): LanguageCode {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.language === 'string') {
      if (navigator.language.toLowerCase().startsWith('zh')) return 'zh';
    }
  } catch {
    // Ignore unsupported navigator access
  }
  return 'en';
}

@ccclass('GameApp')
export class GameApp extends Component {
  private settings!: UserSettingsStore;
  private audio!: AudioManager;
  private progress!: CampaignProgressStore;
  private sim!: BattleSim;

  private titleView!: TitleView;
  private campaignSelectView: CampaignSelectView | null = null;
  private campaignView: CampaignMapView | null = null;
  private throneView: ThroneRoomView | null = null;
  private badgesView: BadgesRoomView | null = null;
  private battleView: BattleView | null = null;
  private hudView: HudView | null = null;
  private resultOverlay: ResultOverlay | null = null;
  private saveModal: SaveDataModal | null = null;

  private loadingOverlay: Node | null = null;
  private loadingTitleLabel: Label | null = null;
  private loadingStatusLabel: Label | null = null;
  private loadingBarFillG: Graphics | null = null;
  private loadingErrorRow: Node | null = null;
  private loadingRetryBtnLbl: Label | null = null;
  private loadingBackBtnLbl: Label | null = null;
  private loadingErrorMode = false;
  private pendingLevelId: number | null = null;

  private mode: ScreenMode = 'title';
  private returnFromBadges: ScreenMode = 'campaign_select';
  private shownResult = false;
  private enterSeq = 0;

  onLoad(): void {
    view.setDesignResolutionSize(COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT, ResolutionPolicy.SHOW_ALL);
    profiler?.hideStats?.();
    this.dismissHtmlSplash();

    const storage = createCocosStorageAdapter();
    this.settings = new UserSettingsStore(true, storage, detectBrowserLanguage());
    setI18nLanguage(this.settings.getLanguage());
    this.audio = new AudioManager(this.node, this.settings);
    this.progress = new CampaignProgressStore(true, storage);
    this.sim = new BattleSim();

    this.buildLoadingOverlay();

    this.titleView = new TitleView(this.node, this.audio, {
      onOpenCampaign: () => this.showCampaignSelect(),
      onQuickPlayLevel1: () => {
        this.progress.setActiveCampaign('Westaria');
        void this.enterLevel(1);
      },
      onToggleLanguage: () => this.toggleLanguage(),
      onOpenSaveModal: () => this.openSaveModal(),
    });

    game.on(Game.EVENT_HIDE, this.onAppHide, this);
    game.on(Game.EVENT_SHOW, this.onAppShow, this);
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);

    this.showTitle();
  }

  private toggleLanguage(): void {
    const next: LanguageCode = this.settings.getLanguage() === 'en' ? 'zh' : 'en';
    this.settings.setLanguage(next);
    setI18nLanguage(next);

    this.titleView.refreshLocale();
    this.campaignSelectView?.refreshLocale();
    this.campaignView?.refreshLocale();
    this.throneView?.refreshLocale();
    this.badgesView?.refreshLocale();
    this.hudView?.refreshLocale();
    this.resultOverlay?.refreshLocale();
    this.saveModal?.refreshLocale();
    if (this.loadingRetryBtnLbl) this.loadingRetryBtnLbl.string = t('load_btn_retry');
    if (this.loadingBackBtnLbl) this.loadingBackBtnLbl.string = t('load_btn_back');
  }

  private openSaveModal(): void {
    if (!this.saveModal) {
      this.saveModal = new SaveDataModal(this.node, this.progress, this.audio, () => {
        this.campaignSelectView?.refresh();
        this.campaignView?.refresh();
        this.throneView?.refresh();
        this.badgesView?.refresh();
      });
    }
    this.saveModal.show();
  }

  onDestroy(): void {
    game.off(Game.EVENT_HIDE, this.onAppHide, this);
    game.off(Game.EVENT_SHOW, this.onAppShow, this);
    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    this.battleView?.destroy();
  }

  private dismissHtmlSplash(): void {
    if (typeof document === 'undefined') return;
    const splash = document.getElementById('boot-splash');
    if (!splash) return;
    splash.classList.add('hidden');
    setTimeout(() => {
      if (splash.parentNode) {
        splash.parentNode.removeChild(splash);
      }
    }, 420);
  }

  private onAppHide(): void {
    this.audio.suspend();
    if (this.mode === 'battle' && !this.sim.isMatchOver && this.hudView && !this.hudView.isPauseModalOpen()) {
      this.hudView.setPaused(true);
    }
  }

  private onAppShow(): void {
    this.audio.resume();
  }

  private onKeyDown(ev: EventKeyboard): void {
    const code = ev.keyCode;
    if (code === KeyCode.ESCAPE || code === KeyCode.MOBILE_BACK) {
      if (this.saveModal?.isOpen()) {
        this.saveModal.hide();
        return;
      }
      if (this.loadingOverlay?.active) {
        if (this.loadingErrorMode) this.onLoadingBack();
        return;
      }
      if (this.mode === 'battle') {
        if (this.shownResult) {
          this.showCampaign();
        } else if (this.battleView?.getActiveSpell()) {
          this.battleView.setActiveSpell(null);
        } else if (this.battleView?.hasSelection()) {
          this.battleView.clearSelection();
        } else {
          this.hudView?.togglePause();
        }
      } else if (this.mode === 'throne') {
        this.showCampaign();
      } else if (this.mode === 'badges') {
        if (this.returnFromBadges === 'campaign') this.showCampaign();
        else this.showCampaignSelect();
      } else if (this.mode === 'campaign') {
        this.showCampaignSelect();
      } else if (this.mode === 'campaign_select') {
        this.showTitle();
      }
      return;
    }

    if (this.loadingOverlay?.active || this.saveModal?.isOpen()) return;

    if (this.mode === 'battle' && !this.shownResult && !this.sim.isMatchOver && this.hudView) {
      if (code === KeyCode.SPACE) {
        this.hudView.togglePause();
        return;
      }
      if (code === KeyCode.KEY_M) {
        this.audio.toggleMute();
        this.hudView.refresh();
        return;
      }
      if (this.sim.paused) return;

      if (code === KeyCode.KEY_F) {
        this.hudView.toggleSpeed();
      } else if (code === KeyCode.DIGIT_1 || code === KeyCode.NUM_1) {
        this.hudView.triggerSpellSlot(0);
      } else if (code === KeyCode.DIGIT_2 || code === KeyCode.NUM_2) {
        this.hudView.triggerSpellSlot(1);
      } else if (code === KeyCode.DIGIT_3 || code === KeyCode.NUM_3) {
        this.hudView.triggerSpellSlot(2);
      } else if (code === KeyCode.DIGIT_4 || code === KeyCode.NUM_4) {
        this.hudView.triggerSpellSlot(3);
      }
    }
  }

  private buildLoadingOverlay(): void {
    const overlay = createUiNode('LoadingOverlay', this.node, COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT);
    overlay.addComponent(BlockInputEvents);
    drawPanel(overlay.addComponent(Graphics), COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT, new Color(8, 10, 18, 215), undefined, 0, 0);

    const card = createUiNode('LoadingCard', overlay, 520, 215);
    drawPanel(card.addComponent(Graphics), 520, 215, new Color(24, 22, 36, 250), new Color(214, 173, 86, 245), 2.5, 14);

    const titleNode = createUiNode('LoadingTitle', card, 470, 44);
    titleNode.setPosition(0, 62);
    const titleLbl = titleNode.addComponent(Label);
    titleLbl.string = 'LOADING ASSETS...';
    titleLbl.fontSize = 20;
    titleLbl.lineHeight = 24;
    titleLbl.isBold = true;
    titleLbl.overflow = Label.Overflow.SHRINK;
    titleLbl.color = new Color(255, 228, 140, 255);

    const statusNode = createUiNode('LoadingStatus', card, 470, 38);
    statusNode.setPosition(0, 20);
    const statusLbl = statusNode.addComponent(Label);
    statusLbl.string = 'CONNECTING TO CDN...';
    statusLbl.fontSize = 14;
    statusLbl.lineHeight = 18;
    statusLbl.overflow = Label.Overflow.SHRINK;
    statusLbl.color = new Color(210, 224, 245, 240);

    const barTrack = createUiNode('LoadingBarTrack', card, PROGRESS_BAR_WIDTH, PROGRESS_BAR_HEIGHT);
    barTrack.setPosition(0, -14);
    drawPanel(
      barTrack.addComponent(Graphics),
      PROGRESS_BAR_WIDTH,
      PROGRESS_BAR_HEIGHT,
      new Color(14, 14, 22, 245),
      new Color(145, 120, 68, 215),
      1.5,
      6,
    );

    const barFill = createUiNode('LoadingBarFill', barTrack, PROGRESS_BAR_WIDTH, PROGRESS_BAR_HEIGHT);
    const fillG = barFill.addComponent(Graphics);

    const errorRow = createUiNode('LoadingErrorRow', card, 380, 46);
    errorRow.setPosition(0, -64);

    const makeErrBtn = (name: string, text: string, x: number, fillCol: Color, onClick: () => void): Label => {
      const btn = createUiNode(name, errorRow, 150, 38);
      btn.setPosition(x, 0);
      drawPanel(btn.addComponent(Graphics), 150, 38, fillCol, new Color(224, 185, 96, 240), 2, 8);
      const l = createUiNode('L', btn, 136, 26).addComponent(Label);
      l.string = text;
      l.fontSize = 15;
      l.isBold = true;
      l.overflow = Label.Overflow.SHRINK;
      l.color = new Color(255, 236, 185, 255);
      const comp = btn.addComponent(Button);
      comp.transition = Button.Transition.SCALE;
      comp.zoomScale = 1.05;
      btn.on(Button.EventType.CLICK, () => {
        this.audio.playSfx('ui_click');
        onClick();
      });
      return l;
    };

    this.loadingRetryBtnLbl = makeErrBtn('LoadingBtn_RETRY', t('load_btn_retry'), -90, new Color(56, 86, 48, 245), () => {
      if (this.pendingLevelId !== null) {
        void this.enterLevel(this.pendingLevelId);
      }
    });
    this.loadingBackBtnLbl = makeErrBtn('LoadingBtn_BACK', t('load_btn_back'), 90, new Color(92, 40, 44, 245), () => {
      this.onLoadingBack();
    });

    errorRow.active = false;
    overlay.active = false;

    this.loadingOverlay = overlay;
    this.loadingTitleLabel = titleLbl;
    this.loadingStatusLabel = statusLbl;
    this.loadingBarFillG = fillG;
    this.loadingErrorRow = errorRow;
  }

  private drawLoadingBar(ratio: number, isError = false): void {
    if (!this.loadingBarFillG) return;
    const g = this.loadingBarFillG;
    g.clear();
    const clamped = Math.max(0.02, Math.min(1, ratio));
    const fillW = (PROGRESS_BAR_WIDTH - 4) * clamped;
    g.fillColor = isError ? new Color(210, 80, 75, 245) : new Color(224, 178, 72, 250);
    g.roundRect(-PROGRESS_BAR_WIDTH * 0.5 + 2, -PROGRESS_BAR_HEIGHT * 0.5 + 2, fillW, PROGRESS_BAR_HEIGHT - 4, 4);
    g.fill();
  }

  private showLoading(titleText: string): void {
    if (!this.loadingOverlay || !this.loadingTitleLabel || !this.loadingStatusLabel) return;
    this.loadingErrorMode = false;
    this.loadingTitleLabel.string = titleText;
    this.loadingTitleLabel.color = new Color(255, 228, 140, 255);
    this.loadingStatusLabel.string = t('load_connecting');
    if (this.loadingErrorRow) this.loadingErrorRow.active = false;
    this.drawLoadingBar(0.05, false);
    this.loadingOverlay.setSiblingIndex(this.node.children.length - 1);
    this.loadingOverlay.active = true;
  }

  private updateLoadingProgress(ratio: number, status: string): void {
    if (!this.loadingOverlay?.active || this.loadingErrorMode || !this.loadingStatusLabel) return;
    const pct = Math.max(0, Math.min(100, Math.round(ratio * 100)));
    this.loadingStatusLabel.string = `${status} (${pct}%)`;
    this.drawLoadingBar(ratio, false);
  }

  private showLoadingError(err: unknown): void {
    if (!this.loadingOverlay || !this.loadingTitleLabel || !this.loadingStatusLabel) return;
    this.loadingErrorMode = true;
    this.loadingTitleLabel.string = t('load_failed_title');
    this.loadingTitleLabel.color = new Color(255, 145, 130, 255);
    const detail = err instanceof Error ? err.message : String(err);
    this.loadingStatusLabel.string = t('load_failed_detail', { detail: detail.slice(0, 76) });
    this.drawLoadingBar(1, true);
    if (this.loadingErrorRow) this.loadingErrorRow.active = true;
    this.loadingOverlay.setSiblingIndex(this.node.children.length - 1);
    this.loadingOverlay.active = true;
  }

  private onLoadingBack(): void {
    this.enterSeq++;
    this.hideLoading();
    if (this.mode === 'battle') {
      this.showCampaign();
    }
  }

  private hideLoading(): void {
    this.loadingErrorMode = false;
    if (this.loadingOverlay) {
      this.loadingOverlay.active = false;
    }
  }

  private hideAll(): void {
    this.titleView.hide();
    if (this.campaignSelectView) this.campaignSelectView.hide();
    if (this.campaignView) this.campaignView.hide();
    if (this.throneView) this.throneView.hide();
    if (this.badgesView) this.badgesView.hide();
    if (this.battleView) this.battleView.root.active = false;
    if (this.hudView) this.hudView.root.active = false;
    if (this.resultOverlay) this.resultOverlay.hide();
  }

  private leaveBattleIfActive(): void {
    if (this.mode === 'battle') {
      this.battleView?.releaseBattleAssets();
    }
  }

  private showTitle(): void {
    this.enterSeq++;
    this.hideLoading();
    this.leaveBattleIfActive();
    this.mode = 'title';
    this.shownResult = false;
    this.hideAll();
    this.titleView.show();
  }

  private showCampaignSelect(): void {
    this.enterSeq++;
    this.hideLoading();
    this.leaveBattleIfActive();
    this.mode = 'campaign_select';
    this.shownResult = false;
    this.hideAll();

    // Warm up shared gameplay bundle (units/vfx/buildings/campaign map base) in the background
    ensureBundle('bundle_gameplay').catch(() => {});

    if (!this.campaignSelectView) {
      this.campaignSelectView = new CampaignSelectView(this.node, this.progress, this.audio, {
        onSelectCampaign: (campaign: PlayableCampaignId) => {
          this.progress.setActiveCampaign(campaign);
          this.showCampaign();
        },
        onOpenBadges: () => this.showBadges('campaign_select'),
        onOpenSaveModal: () => this.openSaveModal(),
        onBackToTitle: () => this.showTitle(),
      });
    }
    this.campaignSelectView.show();
  }

  private showCampaign(): void {
    this.enterSeq++;
    this.hideLoading();
    this.leaveBattleIfActive();
    this.mode = 'campaign';
    this.shownResult = false;
    this.hideAll();

    if (!this.campaignView) {
      this.campaignView = new CampaignMapView(this.node, this.progress, this.audio, {
        onStartLevel: (levelId: number) => void this.enterLevel(levelId),
        onOpenThrone: () => this.showThroneRoom(),
        onOpenBadges: () => this.showBadges('campaign'),
        onBackToSelect: () => this.showCampaignSelect(),
      });
    }
    this.campaignView.show();
  }

  private showThroneRoom(): void {
    this.enterSeq++;
    this.hideLoading();
    this.leaveBattleIfActive();
    this.mode = 'throne';
    this.shownResult = false;
    this.hideAll();

    if (!this.throneView) {
      this.throneView = new ThroneRoomView(this.node, this.progress, this.audio, () => {
        this.showCampaign();
      });
    }
    this.throneView.show();
  }

  private showBadges(from: ScreenMode): void {
    this.enterSeq++;
    this.hideLoading();
    this.returnFromBadges = from;
    this.mode = 'badges';
    this.shownResult = false;
    this.hideAll();

    if (!this.badgesView) {
      this.badgesView = new BadgesRoomView(this.node, this.progress, this.audio, () => {
        if (this.returnFromBadges === 'campaign') this.showCampaign();
        else this.showCampaignSelect();
      });
    }
    this.badgesView.show();
  }

  private async enterLevel(levelId: number): Promise<void> {
    const seq = ++this.enterSeq;
    this.pendingLevelId = levelId;
    const meta = getLevelMetaById(levelId);
    this.showLoading(
      t('load_mission_header', {
        num: meta.missionIndex,
        name: getLevelName(meta.id, meta.name).toUpperCase(),
      }),
    );

    let lvl: LevelDef;
    try {
      lvl = await loadMissionAssets(levelId, (ratio, status) => {
        if (seq === this.enterSeq && this.node.isValid) {
          this.updateLoadingProgress(ratio, status);
        }
      });
    } catch (err) {
      if (seq === this.enterSeq && this.node.isValid) {
        this.showLoadingError(err);
      }
      console.error('Failed to enter level', levelId, err);
      return;
    }

    if (seq !== this.enterSeq || !this.node.isValid) return;

    this.hideLoading();
    this.progress.setActiveCampaign(lvl.campaign);
    const bonuses = this.progress.getBonuses(lvl.campaign);

    this.hideAll();
    this.sim.loadLevel(lvl, bonuses);
    this.sim.speedMultiplier = this.settings.getPreferredSpeed();
    this.shownResult = false;
    this.mode = 'battle';

    if (!this.battleView) {
      this.battleView = new BattleView(
        this.node,
        this.sim,
        this.audio,
        (sel: HudSelection) => this.hudView?.setSelection(sel),
        (spell: SpellId | null) => this.hudView?.setActiveSpell(spell),
      );
    } else {
      this.battleView.root.active = true;
      this.battleView.clearSelection();
      this.battleView.rebuildWorldEntities();
    }

    if (!this.hudView) {
      this.hudView = new HudView(this.node, this.sim, this.audio, this.settings, {
        onClearSelection: () => this.battleView?.clearSelection(),
        onRestart: () => void this.enterLevel(this.sim.levelDef.id),
        onCampaignMap: () => this.showCampaign(),
        onMenu: () => this.showTitle(),
        onSendSelectedSquadToNearest: () => this.battleView?.sendSelectedSquadToNearestEnemy(),
        onSelectSpell: (spell) => this.battleView?.setActiveSpell(spell),
        onQuickCastUltimate: () => {
          const fort = this.sim.strongholds.find((s) => s.owner === this.sim.playerFaction);
          const ultId = CAMPAIGN_SPELL_ORDER[this.sim.playerFaction][3];
          if (fort && ultId) this.sim.castSpell(this.sim.playerFaction, ultId, fort.flashX, fort.flashY);
        },
        onToggleLanguage: () => this.toggleLanguage(),
      });
    } else {
      this.hudView.root.active = true;
      this.hudView.setPaused(false);
      this.hudView.setSelection({ strongholdId: null, buildSiteId: null, squadId: null });
      this.hudView.setActiveSpell(null);
      this.hudView.rebuildForCampaign();
    }

    if (!this.resultOverlay) {
      this.resultOverlay = new ResultOverlay(this.node, this.audio, {
        onNextMission: () => {
          const lvls = getCampaignLevelMetas(this.sim.levelDef.campaign);
          const next = lvls.find((l) => l.missionIndex === this.sim.levelDef.missionIndex + 1) ?? this.sim.levelDef;
          void this.enterLevel(next.id);
        },
        onThroneRoom: () => this.showThroneRoom(),
        onCampaignMap: () => this.showCampaign(),
        onReplay: () => void this.enterLevel(this.sim.levelDef.id),
      });
    } else {
      this.resultOverlay.hide();
    }

    this.hudView.refresh();
    this.audio.playMusic('music_battle');
  }

  update(dt: number): void {
    if (this.mode !== 'battle' || !this.battleView || !this.hudView) return;

    this.sim.step(dt);
    this.battleView.updateView(dt);
    this.hudView.tick(dt);

    if (this.sim.isMatchOver && !this.shownResult) {
      this.shownResult = true;
      let reward = null;
      if (this.sim.winner === this.sim.playerFaction && this.sim.medal) {
        reward = this.progress.recordVictory(
          this.sim.levelDef.id,
          this.sim.medal,
          this.sim.elapsedSec,
          this.sim.battleStats,
        );
      }
      this.resultOverlay?.show(this.sim, reward);
    }
  }
}
