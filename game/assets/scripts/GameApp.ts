import { _decorator, Component, profiler, ResolutionPolicy, view } from 'cc';
import { COCOS_DESIGN_HEIGHT, COCOS_DESIGN_WIDTH } from './core/CoordTransform';
import { getCampaignLevels, getLevelById } from './data/AllLevelsData';
import { CampaignProgressStore } from './data/CampaignProgress';
import { CAMPAIGN_SPELL_ORDER } from './data/SpellsData';
import { PlayableCampaignId, SpellId } from './data/Types';
import { BattleSim } from './sim/BattleSim';
import { AudioManager } from './view/AudioManager';
import { BadgesRoomView } from './view/BadgesRoomView';
import { BattleView } from './view/BattleView';
import { CampaignMapView } from './view/CampaignMapView';
import { CampaignSelectView } from './view/CampaignSelectView';
import { HudSelection, HudView } from './view/HudView';
import { ResultOverlay } from './view/ResultOverlay';
import { ThroneRoomView } from './view/ThroneRoomView';
import { TitleView } from './view/TitleView';

const { ccclass } = _decorator;

type ScreenMode = 'title' | 'campaign_select' | 'campaign' | 'throne' | 'badges' | 'battle';

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

  private mode: ScreenMode = 'title';
  private returnFromBadges: ScreenMode = 'campaign_select';
  private shownResult = false;

  onLoad(): void {
    view.setDesignResolutionSize(COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT, ResolutionPolicy.SHOW_ALL);
    profiler?.hideStats?.();

    this.audio = new AudioManager(this.node);
    this.progress = new CampaignProgressStore(true);
    this.sim = new BattleSim();

    this.titleView = new TitleView(this.node, this.audio, {
      onOpenCampaign: () => this.showCampaignSelect(),
      onQuickPlayLevel1: () => {
        this.progress.setActiveCampaign('Westaria');
        this.enterLevel(1);
      },
    });

    this.showTitle();
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

  private showTitle(): void {
    this.mode = 'title';
    this.shownResult = false;
    this.hideAll();
    this.titleView.show();
  }

  private showCampaignSelect(): void {
    this.mode = 'campaign_select';
    this.shownResult = false;
    this.hideAll();

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
    this.mode = 'campaign';
    this.shownResult = false;
    this.hideAll();

    if (!this.campaignView) {
      this.campaignView = new CampaignMapView(this.node, this.progress, this.audio, {
        onStartLevel: (levelId: number) => this.enterLevel(levelId),
        onOpenThrone: () => this.showThroneRoom(),
        onOpenBadges: () => this.showBadges('campaign'),
        onBackToSelect: () => this.showCampaignSelect(),
      });
    }
    this.campaignView.show();
  }

  private showThroneRoom(): void {
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

  private enterLevel(levelId: number): void {
    const lvl = getLevelById(levelId);
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
        onRestart: () => this.enterLevel(this.sim.levelDef.id),
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
          const lvls = getCampaignLevels(this.sim.levelDef.campaign);
          const next = lvls.find((l) => l.missionIndex === this.sim.levelDef.missionIndex + 1) ?? this.sim.levelDef;
          this.enterLevel(next.id);
        },
        onThroneRoom: () => this.showThroneRoom(),
        onCampaignMap: () => this.showCampaign(),
        onReplay: () => this.enterLevel(this.sim.levelDef.id),
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
