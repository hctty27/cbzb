import { _decorator, Color, Component, Graphics, Label, Node, profiler, ResolutionPolicy, sys, view } from 'cc';
import { COCOS_DESIGN_HEIGHT, COCOS_DESIGN_WIDTH } from './core/CoordTransform';
import { CampaignProgressStore, IStorageAdapter } from './data/CampaignProgress';
import { getCampaignLevelMetas, getLevelMetaById } from './data/LevelCatalog';
import { CAMPAIGN_SPELL_ORDER } from './data/SpellsData';
import { PlayableCampaignId, SpellId } from './data/Types';
import { BattleSim } from './sim/BattleSim';
import { ensureBundle, loadLevelDef } from './view/AssetBundleManager';
import { AudioManager } from './view/AudioManager';
import { BadgesRoomView } from './view/BadgesRoomView';
import { BattleView } from './view/BattleView';
import { CampaignMapView } from './view/CampaignMapView';
import { CampaignSelectView } from './view/CampaignSelectView';
import { HudSelection, HudView } from './view/HudView';
import { ResultOverlay } from './view/ResultOverlay';
import { createUiNode, drawPanel, preloadTextureByKey } from './view/SpriteLoader';
import { ThroneRoomView } from './view/ThroneRoomView';
import { TitleView } from './view/TitleView';

const { ccclass } = _decorator;

type ScreenMode = 'title' | 'campaign_select' | 'campaign' | 'throne' | 'badges' | 'battle';

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

@ccclass('GameApp')
export class GameApp extends Component {
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

  private loadingOverlay: Node | null = null;
  private loadingLabel: Label | null = null;

  private mode: ScreenMode = 'title';
  private returnFromBadges: ScreenMode = 'campaign_select';
  private shownResult = false;
  private enterSeq = 0;

  onLoad(): void {
    view.setDesignResolutionSize(COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT, ResolutionPolicy.SHOW_ALL);
    profiler?.hideStats?.();

    this.audio = new AudioManager(this.node);
    this.progress = new CampaignProgressStore(true, createCocosStorageAdapter());
    this.sim = new BattleSim();

    this.buildLoadingOverlay();

    this.titleView = new TitleView(this.node, this.audio, {
      onOpenCampaign: () => this.showCampaignSelect(),
      onQuickPlayLevel1: () => {
        this.progress.setActiveCampaign('Westaria');
        void this.enterLevel(1);
      },
    });

    this.showTitle();
  }

  private buildLoadingOverlay(): void {
    const overlay = createUiNode('LoadingOverlay', this.node, COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT);
    drawPanel(overlay.addComponent(Graphics), COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT, new Color(8, 10, 18, 210), undefined, 0, 0);

    const card = createUiNode('LoadingCard', overlay, 480, 120);
    drawPanel(card.addComponent(Graphics), 480, 120, new Color(24, 22, 36, 248), new Color(214, 173, 86, 245), 2.5, 14);

    const lblNode = createUiNode('LoadingLabel', card, 440, 64);
    const lbl = lblNode.addComponent(Label);
    lbl.string = 'LOADING ASSETS...';
    lbl.fontSize = 20;
    lbl.lineHeight = 26;
    lbl.isBold = true;
    lbl.enableWrapText = true;
    lbl.color = new Color(255, 228, 140, 255);

    overlay.active = false;
    this.loadingOverlay = overlay;
    this.loadingLabel = lbl;
  }

  private showLoading(text: string): void {
    if (!this.loadingOverlay || !this.loadingLabel) return;
    this.loadingLabel.string = text;
    this.loadingOverlay.setSiblingIndex(this.node.children.length - 1);
    this.loadingOverlay.active = true;
  }

  private hideLoading(): void {
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
    const meta = getLevelMetaById(levelId);
    this.showLoading(`LOADING MISSION ${meta.missionIndex}:\n${meta.name.toUpperCase()}...`);

    let lvl;
    try {
      const [, loadedLvl] = await Promise.all([
        ensureBundle('bundle_gameplay'),
        loadLevelDef(levelId),
        preloadTextureByKey(meta.bgKey),
      ]);
      lvl = loadedLvl;
    } catch (err) {
      if (seq === this.enterSeq && this.node.isValid) {
        this.hideLoading();
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
      this.hudView = new HudView(this.node, this.sim, this.audio, {
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
      });
    } else {
      this.hudView.root.active = true;
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
    this.hudView.refresh();

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
