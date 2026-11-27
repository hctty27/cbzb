import { Button, Color, Graphics, Label, Node, Sprite } from 'cc';
import { COCOS_BLEED_HEIGHT, COCOS_BLEED_WIDTH, COCOS_DESIGN_HEIGHT, COCOS_DESIGN_WIDTH } from '../core/CoordTransform';
import { BADGES } from '../data/BadgesData';
import { CampaignProgressStore } from '../data/CampaignProgress';
import { getBadgeDesc, getBadgeName, t } from '../data/I18n';
import { BadgeDef } from '../data/Types';
import { AudioManager } from './AudioManager';
import { createUiNode, drawPanel, getStaticSpriteFrame } from './SpriteLoader';

interface BadgeSlotVisual {
  def: BadgeDef;
  cardG: Graphics;
  starSprite: Sprite;
  starNode: Node;
  nameLbl: Label;
  descLbl: Label;
  statusLbl: Label;
}

export class BadgesRoomView {
  readonly root: Node;
  private titleLabel!: Label;
  private countLabel!: Label;
  private pageLabel!: Label;
  private page1BtnG!: Graphics;
  private page2BtnG!: Graphics;
  private page1BtnLbl!: Label;
  private page2BtnLbl!: Label;
  private backBtnLbl!: Label;
  private page = 0; // 0 = badges 1..12, 1 = badges 13..22
  private slots: BadgeSlotVisual[] = [];
  private slotContainer!: Node;

  constructor(
    parent: Node,
    private progress: CampaignProgressStore,
    private audio: AudioManager,
    private onBack: () => void,
  ) {
    this.root = createUiNode('BadgesRoomView', parent, COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT);
    this.buildUi();
  }

  private buildUi(): void {
    const bg = createUiNode('BadgesBg', this.root, COCOS_BLEED_WIDTH, COCOS_BLEED_HEIGHT);
    drawPanel(bg.addComponent(Graphics), COCOS_BLEED_WIDTH, COCOS_BLEED_HEIGHT, new Color(18, 16, 26, 255), undefined, 0, 0);

    const topBar = createUiNode('BadgesTopBar', this.root, COCOS_BLEED_WIDTH, 58);
    topBar.setPosition(0, COCOS_DESIGN_HEIGHT * 0.5 - 29);
    drawPanel(
      topBar.addComponent(Graphics),
      COCOS_BLEED_WIDTH,
      58,
      new Color(26, 20, 34, 245),
      new Color(214, 173, 86, 240),
      2,
      0,
    );

    const tLbl = createUiNode('Title', topBar, 380, 34).addComponent(Label);
    tLbl.node.setPosition(-425, 0);
    tLbl.string = t('badges_title');
    tLbl.fontSize = 21;
    tLbl.isBold = true;
    tLbl.overflow = Label.Overflow.SHRINK;
    tLbl.color = new Color(255, 224, 130, 255);
    this.titleLabel = tLbl;

    const cBadge = createUiNode('CountBadge', topBar, 200, 34);
    cBadge.setPosition(-90, 0);
    drawPanel(cBadge.addComponent(Graphics), 200, 34, new Color(46, 36, 62, 240), new Color(214, 173, 86, 230), 2, 8);
    this.countLabel = createUiNode('L', cBadge, 188, 24).addComponent(Label);
    this.countLabel.fontSize = 14;
    this.countLabel.isBold = true;
    this.countLabel.overflow = Label.Overflow.SHRINK;
    this.countLabel.color = new Color(255, 230, 125, 255);

    const makePageBtn = (name: string, txt: string, x: number, pg: number): { bgG: Graphics; lbl: Label } => {
      const b = createUiNode(name, topBar, 118, 36);
      b.setPosition(x, 0);
      const bgG = b.addComponent(Graphics);
      const l = createUiNode('L', b, 108, 24).addComponent(Label);
      l.string = txt;
      l.fontSize = 13;
      l.isBold = true;
      l.overflow = Label.Overflow.SHRINK;
      l.color = new Color(255, 235, 175, 255);
      const comp = b.addComponent(Button);
      comp.transition = Button.Transition.SCALE;
      comp.zoomScale = 1.05;
      b.on(Button.EventType.CLICK, () => {
        this.audio.playSfx('ui_click');
        this.page = pg;
        this.refresh();
      });
      return { bgG, lbl: l };
    };

    const p1 = makePageBtn('BtnPage1', t('badges_page_1'), 115, 0);
    const p2 = makePageBtn('BtnPage2', t('badges_page_2'), 248, 1);
    this.page1BtnG = p1.bgG;
    this.page1BtnLbl = p1.lbl;
    this.page2BtnG = p2.bgG;
    this.page2BtnLbl = p2.lbl;

    const backBtn = createUiNode('BtnBack', topBar, 185, 38);
    backBtn.setPosition(485, 0);
    drawPanel(backBtn.addComponent(Graphics), 185, 38, new Color(48, 82, 52, 245), new Color(214, 173, 86, 230), 2, 8);
    const bLbl = createUiNode('L', backBtn, 175, 26).addComponent(Label);
    bLbl.string = t('badges_back');
    bLbl.fontSize = 14;
    bLbl.isBold = true;
    bLbl.overflow = Label.Overflow.SHRINK;
    bLbl.color = new Color(255, 235, 175, 255);
    this.backBtnLbl = bLbl;
    const bc = backBtn.addComponent(Button);
    bc.transition = Button.Transition.SCALE;
    bc.zoomScale = 1.05;
    backBtn.on(Button.EventType.CLICK, () => {
      this.audio.playSfx('ui_click');
      this.onBack();
    });

    this.slotContainer = createUiNode('BadgeGrid', this.root, COCOS_DESIGN_WIDTH, 580);
    this.slotContainer.setPosition(0, -18);

    const bot = createUiNode('Footer', this.root, COCOS_BLEED_WIDTH, 40);
    bot.setPosition(0, -COCOS_DESIGN_HEIGHT * 0.5 + 20);
    drawPanel(bot.addComponent(Graphics), COCOS_BLEED_WIDTH, 40, new Color(22, 20, 32, 242), new Color(175, 140, 72, 220), 2, 0);
    this.pageLabel = createUiNode('L', bot, 640, 26).addComponent(Label);
    this.pageLabel.fontSize = 13;
    this.pageLabel.color = new Color(210, 215, 230, 255);
  }

  private rebuildGrid(): void {
    this.slotContainer.removeAllChildren();
    this.slots = [];
    const startIdx = this.page === 0 ? 0 : 12;
    const items = BADGES.slice(startIdx, startIdx + 12);

    const colXs = [-450, -150, 150, 450];
    const rowYs = [175, 0, -175];

    items.forEach((def, idx) => {
      const col = idx % 4;
      const row = Math.floor(idx / 4);
      const card = createUiNode(`BadgeCard_${def.id}`, this.slotContainer, 282, 156);
      card.setPosition(colXs[col], rowYs[row]);
      const cardG = card.addComponent(Graphics);

      const starNode = createUiNode('Star', card, 38, 38);
      starNode.setPosition(-108, 42);
      const starSprite = starNode.addComponent(Sprite);
      starSprite.sizeMode = Sprite.SizeMode.CUSTOM;

      const nameLbl = createUiNode('Name', card, 200, 34).addComponent(Label);
      nameLbl.node.setPosition(18, 46);
      nameLbl.fontSize = 14;
      nameLbl.lineHeight = 18;
      nameLbl.isBold = true;
      nameLbl.enableWrapText = true;
      nameLbl.overflow = Label.Overflow.CLAMP;

      const descLbl = createUiNode('Desc', card, 256, 62).addComponent(Label);
      descLbl.node.setPosition(0, -10);
      descLbl.fontSize = 13;
      descLbl.lineHeight = 18;
      descLbl.enableWrapText = true;
      descLbl.overflow = Label.Overflow.CLAMP;

      const statusLbl = createUiNode('Status', card, 250, 22).addComponent(Label);
      statusLbl.node.setPosition(0, -56);
      statusLbl.fontSize = 12;
      statusLbl.isBold = true;

      this.slots.push({ def, cardG, starSprite, starNode, nameLbl, descLbl, statusLbl });
    });
  }

  refreshLocale(): void {
    this.refresh();
  }

  show(): void {
    this.root.active = true;
    this.refresh();
    this.audio.playMusic('music_menu');
  }

  hide(): void {
    this.root.active = false;
  }

  refresh(): void {
    this.rebuildGrid();
    this.titleLabel.string = t('badges_title');
    this.page1BtnLbl.string = t('badges_page_1');
    this.page2BtnLbl.string = t('badges_page_2');
    this.backBtnLbl.string = t('badges_back');

    const unlockedTotal = this.progress.getUnlockedBadgesCount();
    this.countLabel.string = t('badges_unlocked_count', { unlocked: unlockedTotal, total: BADGES.length });
    this.pageLabel.string = t('badges_footer', {
      range: this.page === 0 ? '1 - 12' : '13 - 22',
      total: BADGES.length,
    });

    drawPanel(
      this.page1BtnG,
      118,
      36,
      this.page === 0 ? new Color(86, 66, 32, 245) : new Color(38, 34, 52, 235),
      this.page === 0 ? new Color(255, 220, 110, 255) : new Color(130, 120, 150, 200),
      2,
      8,
    );
    drawPanel(
      this.page2BtnG,
      118,
      36,
      this.page === 1 ? new Color(86, 66, 32, 245) : new Color(38, 34, 52, 235),
      this.page === 1 ? new Color(255, 220, 110, 255) : new Color(130, 120, 150, 200),
      2,
      8,
    );

    for (const s of this.slots) {
      const unlocked = this.progress.isBadgeUnlocked(s.def.id);
      drawPanel(
        s.cardG,
        282,
        156,
        unlocked ? new Color(38, 48, 34, 242) : new Color(26, 26, 36, 230),
        unlocked ? new Color(245, 205, 82, 255) : new Color(95, 95, 112, 180),
        unlocked ? 2.5 : 1.5,
        12,
      );
      s.nameLbl.string = `#${s.def.index} ${getBadgeName(s.def.id, s.def.name)}`;
      s.nameLbl.color = unlocked ? new Color(255, 228, 132, 255) : new Color(195, 195, 210, 220);
      s.descLbl.string = getBadgeDesc(s.def.id, s.def.description);
      s.descLbl.color = unlocked ? new Color(235, 242, 232, 255) : new Color(160, 165, 175, 205);
      s.statusLbl.string = unlocked ? t('badges_status_unlocked') : t('badges_status_locked');
      s.statusLbl.color = unlocked ? new Color(125, 235, 135, 255) : new Color(150, 130, 140, 200);
      const starKey = unlocked ? 'ui/star_gold' : 'ui/star_silver';
      getStaticSpriteFrame(starKey).then((sf) => {
        if (s.starNode.isValid) s.starSprite.spriteFrame = sf;
      });
    }
  }
}
