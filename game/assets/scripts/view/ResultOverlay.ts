import { Button, Color, Graphics, Label, Node, Sprite } from 'cc';
import { COCOS_DESIGN_HEIGHT, COCOS_DESIGN_WIDTH } from '../core/CoordTransform';
import { VictoryRewardSummary } from '../data/CampaignProgress';
import { getBadgeName, getLevelName, getMedalLabel, t } from '../data/I18n';
import { MedalRank } from '../data/Types';
import { BattleSim } from '../sim/BattleSim';
import { AudioManager } from './AudioManager';
import { createUiNode, drawPanel, getStaticSpriteFrame } from './SpriteLoader';

export class ResultOverlay {
  readonly root: Node;
  private titleLabel!: Label;
  private detailLabel!: Label;
  private starSprite!: Sprite;
  private starNode!: Node;
  private nextBtnNode!: Node;
  private nextBtnLbl!: Label;
  private throneBtnLbl!: Label;
  private mapBtnLbl!: Label;
  private replayBtnLbl!: Label;

  private lastSim: BattleSim | null = null;
  private lastReward: VictoryRewardSummary | null | undefined = null;

  constructor(
    parent: Node,
    private audio: AudioManager,
    private callbacks: {
      onNextMission: () => void;
      onThroneRoom: () => void;
      onCampaignMap: () => void;
      onReplay: () => void;
    },
  ) {
    this.root = createUiNode('ResultOverlay', parent, COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT);
    this.buildUi();
    this.root.active = false;
  }

  private buildUi(): void {
    const dim = createUiNode('ResultDim', this.root, COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT);
    drawPanel(dim.addComponent(Graphics), COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT, new Color(8, 10, 16, 200), undefined, 0, 0);

    const card = createUiNode('ResultCard', this.root, 640, 440);
    drawPanel(
      card.addComponent(Graphics),
      640,
      440,
      new Color(26, 22, 34, 248),
      new Color(214, 173, 86, 255),
      3,
      16,
    );

    const tNode = createUiNode('ResultTitle', card, 580, 48);
    tNode.setPosition(0, 172);
    this.titleLabel = tNode.addComponent(Label);
    this.titleLabel.fontSize = 30;
    this.titleLabel.lineHeight = 36;
    this.titleLabel.isBold = true;

    this.starNode = createUiNode('MedalStar', card, 56, 56);
    this.starNode.setPosition(0, 114);
    this.starSprite = this.starNode.addComponent(Sprite);
    this.starSprite.sizeMode = Sprite.SizeMode.CUSTOM;
    this.starNode.setScale(1.85, 1.85, 1);

    const dNode = createUiNode('ResultDetails', card, 570, 162);
    dNode.setPosition(0, -10);
    this.detailLabel = dNode.addComponent(Label);
    this.detailLabel.fontSize = 16;
    this.detailLabel.lineHeight = 23;
    this.detailLabel.enableWrapText = true;
    this.detailLabel.overflow = Label.Overflow.CLAMP;
    this.detailLabel.color = new Color(235, 232, 225, 255);

    const nextBtn = this.createActionButton(card, 'NEXT', t('result_btn_next'), -195, -155, () => {
      this.audio.playSfx('ui_click');
      this.callbacks.onNextMission();
    });
    this.nextBtnNode = nextBtn.node;
    this.nextBtnLbl = nextBtn.label;
    this.throneBtnLbl = this.createActionButton(card, 'THRONE', t('result_btn_throne'), -65, -155, () => {
      this.audio.playSfx('ui_click');
      this.callbacks.onThroneRoom();
    }).label;
    this.mapBtnLbl = this.createActionButton(card, 'MAP', t('result_btn_map'), 65, -155, () => {
      this.audio.playSfx('ui_click');
      this.callbacks.onCampaignMap();
    }).label;
    this.replayBtnLbl = this.createActionButton(card, 'REPLAY', t('result_btn_replay'), 195, -155, () => {
      this.audio.playSfx('ui_click');
      this.callbacks.onReplay();
    }).label;
  }

  private createActionButton(
    parent: Node,
    id: string,
    text: string,
    x: number,
    y: number,
    onClick: () => void,
  ): { node: Node; label: Label } {
    const btnNode = createUiNode(`Btn_${id}`, parent, 120, 44);
    btnNode.setPosition(x, y);
    drawPanel(btnNode.addComponent(Graphics), 120, 44, new Color(56, 42, 74, 245), new Color(214, 173, 86, 240), 2, 8);
    const lbl = createUiNode('Lbl', btnNode, 114, 28).addComponent(Label);
    lbl.string = text;
    lbl.fontSize = 12;
    lbl.isBold = true;
    lbl.overflow = Label.Overflow.SHRINK;
    lbl.color = new Color(255, 228, 138, 255);

    const btn = btnNode.addComponent(Button);
    btn.transition = Button.Transition.SCALE;
    btn.zoomScale = 1.06;
    btnNode.on(Button.EventType.CLICK, onClick);
    return { node: btnNode, label: lbl };
  }

  refreshLocale(): void {
    this.nextBtnLbl.string = t('result_btn_next');
    this.throneBtnLbl.string = t('result_btn_throne');
    this.mapBtnLbl.string = t('result_btn_map');
    this.replayBtnLbl.string = t('result_btn_replay');
    if (this.root.active && this.lastSim) {
      this.show(this.lastSim, this.lastReward);
    }
  }

  show(sim: BattleSim, reward?: VictoryRewardSummary | null): void {
    this.lastSim = sim;
    this.lastReward = reward;
    this.root.active = true;
    const isVictory = sim.winner === sim.playerFaction;
    const secs = Math.floor(sim.elapsedSec);
    const mm = String(Math.floor(secs / 60)).padStart(2, '0');
    const ss = String(secs % 60).padStart(2, '0');
    const player = sim.getCombatant(sim.playerFaction);

    if (isVictory) {
      const rank: MedalRank = sim.medal ?? 'Bronze';
      this.titleLabel.string = t('result_victory', { medal: getMedalLabel(rank) });
      this.titleLabel.color = new Color(115, 235, 130, 255);
      this.starNode.active = true;
      const starKey = rank === 'Gold' ? 'ui/star_gold' : 'ui/star_silver';
      getStaticSpriteFrame(starKey).then((sf) => {
        if (this.starNode.isValid) this.starSprite.spriteFrame = sf;
      });
      this.nextBtnNode.active = sim.levelDef.missionIndex < 8;
    } else {
      this.titleLabel.string = t('result_defeat');
      this.titleLabel.color = new Color(240, 100, 100, 255);
      this.starNode.active = false;
      this.nextBtnNode.active = false;
    }

    const rewardPts =
      isVictory && reward && reward.skillPointsGained > 0
        ? t('result_reward_pts', { pts: reward.skillPointsGained })
        : '';
    const rewardLine =
      isVictory && reward
        ? t('result_reward_xp', { xp: reward.xpEarned, rank: reward.newRank, pts: rewardPts })
        : '';
    const badgeLine =
      isVictory && reward && reward.newlyUnlockedBadges.length > 0
        ? t('result_badges_unlocked', {
            list: reward.newlyUnlockedBadges.map((b) => getBadgeName(b.id, b.name)).join(', '),
          })
        : '';

    this.detailLabel.string =
      t('result_details', {
        num: sim.levelDef.missionIndex,
        name: getLevelName(sim.levelDef.id, sim.levelDef.name),
        time: `${mm}:${ss}`,
        kills: player.kills,
        lost: player.lost,
      }) +
      rewardLine +
      badgeLine;
  }

  hide(): void {
    this.root.active = false;
  }
}
