import { Button, Color, Graphics, Label, Node, Sprite } from 'cc';
import { VictoryRewardSummary } from '../data/CampaignProgress';
import { COCOS_DESIGN_HEIGHT, COCOS_DESIGN_WIDTH } from '../core/CoordTransform';
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

    this.nextBtnNode = this.createActionButton(card, 'NEXT MISSION', -195, -155, () => {
      this.audio.playSfx('ui_click');
      this.callbacks.onNextMission();
    });
    this.createActionButton(card, 'THRONE ROOM', -65, -155, () => {
      this.audio.playSfx('ui_click');
      this.callbacks.onThroneRoom();
    });
    this.createActionButton(card, 'CAMPAIGN MAP', 65, -155, () => {
      this.audio.playSfx('ui_click');
      this.callbacks.onCampaignMap();
    });
    this.createActionButton(card, 'REPLAY', 195, -155, () => {
      this.audio.playSfx('ui_click');
      this.callbacks.onReplay();
    });
  }

  private createActionButton(parent: Node, text: string, x: number, y: number, onClick: () => void): Node {
    const btnNode = createUiNode(`Btn_${text}`, parent, 120, 44);
    btnNode.setPosition(x, y);
    drawPanel(btnNode.addComponent(Graphics), 120, 44, new Color(56, 42, 74, 245), new Color(214, 173, 86, 240), 2, 8);
    const lbl = createUiNode('Lbl', btnNode, 114, 28).addComponent(Label);
    lbl.string = text;
    lbl.fontSize = 12;
    lbl.isBold = true;
    lbl.color = new Color(255, 228, 138, 255);

    const btn = btnNode.addComponent(Button);
    btn.transition = Button.Transition.SCALE;
    btn.zoomScale = 1.06;
    btnNode.on(Button.EventType.CLICK, onClick);
    return btnNode;
  }

  show(sim: BattleSim, reward?: VictoryRewardSummary | null): void {
    this.root.active = true;
    const isVictory = sim.winner === sim.playerFaction;
    const secs = Math.floor(sim.elapsedSec);
    const mm = String(Math.floor(secs / 60)).padStart(2, '0');
    const ss = String(secs % 60).padStart(2, '0');
    const player = sim.getCombatant(sim.playerFaction);

    if (isVictory) {
      const rank: MedalRank = sim.medal ?? 'Bronze';
      this.titleLabel.string = `VICTORY! (${rank.toUpperCase()} MEDAL)`;
      this.titleLabel.color = new Color(115, 235, 130, 255);
      this.starNode.active = true;
      const starKey = rank === 'Gold' ? 'ui/star_gold' : 'ui/star_silver';
      getStaticSpriteFrame(starKey).then((sf) => {
        if (this.starNode.isValid) this.starSprite.spriteFrame = sf;
      });
      this.nextBtnNode.active = sim.levelDef.missionIndex < 8;
    } else {
      this.titleLabel.string = 'DEFEAT';
      this.titleLabel.color = new Color(240, 100, 100, 255);
      this.starNode.active = false;
      this.nextBtnNode.active = false;
    }

    const rewardLine =
      isVictory && reward
        ? `\nEarned XP: +${reward.xpEarned}  |  Rank: ${reward.newRank}${
            reward.skillPointsGained > 0 ? ` (+${reward.skillPointsGained} Edict Points!)` : ''
          }`
        : '';
    const badgeLine =
      isVictory && reward && reward.newlyUnlockedBadges.length > 0
        ? `\nBadges Unlocked: ${reward.newlyUnlockedBadges.map((b) => b.name).join(', ')}`
        : '';

    this.detailLabel.string =
      `Mission ${sim.levelDef.missionIndex}: ${sim.levelDef.name}\n` +
      `Time: ${mm}:${ss}   (Gold < 05:30, Silver <= 09:30)\n` +
      `Enemy Squads Destroyed: ${player.kills}   |   Squads Lost: ${player.lost}` +
      rewardLine +
      badgeLine;
  }

  hide(): void {
    this.root.active = false;
  }
}
