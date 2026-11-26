import { Button, Color, Graphics, Label, Node, Sprite } from 'cc';
import { COCOS_DESIGN_HEIGHT, COCOS_DESIGN_WIDTH } from '../core/CoordTransform';
import { SPRITE_MANIFEST } from '../data/AssetManifest';
import { BADGES } from '../data/BadgesData';
import { CampaignProgressStore } from '../data/CampaignProgress';
import { getCampaignCardCopy, t } from '../data/I18n';
import { PlayableCampaignId } from '../data/Types';
import { AudioManager } from './AudioManager';
import { createUiNode, drawPanel, getStaticSpriteFrame } from './SpriteLoader';

interface CampaignCardSpec {
  id: PlayableCampaignId;
  iconKey: string;
  accent: Color;
  fill: Color;
}

const CAMPAIGN_CARDS: CampaignCardSpec[] = [
  {
    id: 'Westaria',
    iconKey: 'icons/unit_w_infantry3',
    accent: new Color(110, 225, 130, 245),
    fill: new Color(22, 42, 30, 240),
  },
  {
    id: 'TheKhaganate',
    iconKey: 'icons/unit_k_cavalry3',
    accent: new Color(235, 105, 95, 245),
    fill: new Color(46, 22, 24, 240),
  },
  {
    id: 'TheCult',
    iconKey: 'icons/unit_b_archers3',
    accent: new Color(95, 185, 245, 245),
    fill: new Color(20, 34, 52, 240),
  },
];

export class CampaignSelectView {
  readonly root: Node;
  private headerTitleLbl!: Label;
  private saveBtnLbl!: Label;
  private badgesBtnLbl!: Label;
  private backBtnLbl!: Label;
  private cardVisuals: Map<
    PlayableCampaignId,
    { title: Label; sub: Label; lore: Label; stats: Label; playBtn: Label }
  > = new Map();

  constructor(
    parent: Node,
    private progress: CampaignProgressStore,
    private audio: AudioManager,
    private callbacks: {
      onSelectCampaign: (campaign: PlayableCampaignId) => void;
      onOpenBadges: () => void;
      onOpenSaveModal: () => void;
      onBackToTitle: () => void;
    },
  ) {
    this.root = createUiNode('CampaignSelectView', parent, COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT);
    this.buildUi();
  }

  private buildUi(): void {
    const bgEntry = SPRITE_MANIFEST['ui/title_bg'];
    const bgN = createUiNode('SelectBg', this.root, bgEntry.width, bgEntry.height);
    const bgSp = bgN.addComponent(Sprite);
    bgSp.sizeMode = Sprite.SizeMode.RAW;
    const coverScale = Math.max(COCOS_DESIGN_WIDTH / bgEntry.width, COCOS_DESIGN_HEIGHT / bgEntry.height);
    bgN.setScale(coverScale, coverScale, 1);
    getStaticSpriteFrame('ui/title_bg').then((sf) => {
      if (bgN.isValid) bgSp.spriteFrame = sf;
    });

    const shade = createUiNode('Shade', this.root, COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT);
    drawPanel(shade.addComponent(Graphics), COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT, new Color(12, 10, 18, 200), undefined, 0, 0);

    // Top bar
    const topBar = createUiNode('SelectTopBar', this.root, COCOS_DESIGN_WIDTH, 58);
    topBar.setPosition(0, COCOS_DESIGN_HEIGHT * 0.5 - 29);
    drawPanel(
      topBar.addComponent(Graphics),
      COCOS_DESIGN_WIDTH,
      58,
      new Color(22, 18, 32, 245),
      new Color(205, 168, 86, 240),
      2,
      0,
    );

    const tLbl = createUiNode('Title', topBar, 460, 34).addComponent(Label);
    tLbl.node.setPosition(-375, 0);
    tLbl.string = t('select_title');
    tLbl.fontSize = 24;
    tLbl.isBold = true;
    tLbl.overflow = Label.Overflow.SHRINK;
    tLbl.color = new Color(255, 224, 130, 255);
    this.headerTitleLbl = tLbl;

    const makeTopBtn = (name: string, txt: string, x: number, w: number, fill: Color, onClick: () => void): Label => {
      const b = createUiNode(name, topBar, w, 38);
      b.setPosition(x, 0);
      drawPanel(b.addComponent(Graphics), w, 38, fill, new Color(214, 173, 86, 235), 2, 8);
      const l = createUiNode('L', b, w - 12, 26).addComponent(Label);
      l.string = txt;
      l.fontSize = 14;
      l.isBold = true;
      l.overflow = Label.Overflow.SHRINK;
      l.color = new Color(255, 236, 178, 255);
      const comp = b.addComponent(Button);
      comp.transition = Button.Transition.SCALE;
      comp.zoomScale = 1.05;
      b.on(Button.EventType.CLICK, () => {
        this.audio.playSfx('ui_click');
        onClick();
      });
      return l;
    };

    this.saveBtnLbl = makeTopBtn('BtnSaveData', t('title_btn_save'), 120, 140, new Color(46, 62, 76, 245), () => {
      this.callbacks.onOpenSaveModal();
    });
    this.badgesBtnLbl = makeTopBtn('BtnBadges', t('select_badges_btn', { unlocked: 0, total: BADGES.length }), 305, 195, new Color(68, 52, 28, 245), () => {
      this.callbacks.onOpenBadges();
    });
    this.backBtnLbl = makeTopBtn('BtnBackMenu', t('select_back_menu'), 515, 155, new Color(52, 38, 68, 245), () => {
      this.callbacks.onBackToTitle();
    });

    // 3 Faction Campaign Cards
    const xs = [-395, 0, 395];
    CAMPAIGN_CARDS.forEach((spec, idx) => {
      const card = createUiNode(`CampaignCard_${spec.id}`, this.root, 365, 520);
      card.setPosition(xs[idx], -20);
      drawPanel(card.addComponent(Graphics), 365, 520, spec.fill, spec.accent, 3, 16);

      const emblem = createUiNode('Emblem', card, 96, 96);
      emblem.setPosition(0, 175);
      drawPanel(emblem.addComponent(Graphics), 106, 106, new Color(18, 18, 28, 220), spec.accent, 2, 16);
      const icN = createUiNode('Icon', emblem, 78, 78);
      const icSp = icN.addComponent(Sprite);
      icSp.sizeMode = Sprite.SizeMode.CUSTOM;
      getStaticSpriteFrame(spec.iconKey).then((sf) => {
        if (icN.isValid) icSp.spriteFrame = sf;
      });

      const titleL = createUiNode('Title', card, 330, 36).addComponent(Label);
      titleL.node.setPosition(0, 92);
      titleL.fontSize = 21;
      titleL.isBold = true;
      titleL.overflow = Label.Overflow.SHRINK;
      titleL.color = new Color(255, 226, 138, 255);

      const subL = createUiNode('Sub', card, 325, 26).addComponent(Label);
      subL.node.setPosition(0, 58);
      subL.fontSize = 14;
      subL.isBold = true;
      subL.overflow = Label.Overflow.SHRINK;
      subL.color = spec.accent;

      const loreL = createUiNode('Lore', card, 320, 128).addComponent(Label);
      loreL.node.setPosition(0, -18);
      loreL.fontSize = 14;
      loreL.lineHeight = 22;
      loreL.enableWrapText = true;
      loreL.overflow = Label.Overflow.CLAMP;
      loreL.color = new Color(235, 232, 224, 255);

      const statsL = createUiNode('Stats', card, 320, 64).addComponent(Label);
      statsL.node.setPosition(0, -124);
      statsL.fontSize = 14;
      statsL.lineHeight = 21;
      statsL.enableWrapText = true;
      statsL.overflow = Label.Overflow.CLAMP;
      statsL.color = new Color(255, 224, 128, 255);

      const playBtn = createUiNode(`BtnSelect_${spec.id}`, card, 250, 54);
      playBtn.setPosition(0, -204);
      const pSp = playBtn.addComponent(Sprite);
      pSp.sizeMode = Sprite.SizeMode.CUSTOM;
      getStaticSpriteFrame('ui/btn_pill').then((sf) => {
        if (playBtn.isValid) pSp.spriteFrame = sf;
      });
      const pLbl = createUiNode('L', playBtn, 220, 34).addComponent(Label);
      pLbl.fontSize = 18;
      pLbl.isBold = true;
      pLbl.overflow = Label.Overflow.SHRINK;
      pLbl.color = new Color(255, 232, 148, 255);
      const bComp = playBtn.addComponent(Button);
      bComp.transition = Button.Transition.SCALE;
      bComp.zoomScale = 1.06;
      playBtn.on(Button.EventType.CLICK, () => {
        this.audio.playSfx('ui_click');
        this.progress.setActiveCampaign(spec.id);
        this.callbacks.onSelectCampaign(spec.id);
      });

      this.cardVisuals.set(spec.id, {
        title: titleL,
        sub: subL,
        lore: loreL,
        stats: statsL,
        playBtn: pLbl,
      });
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
    this.headerTitleLbl.string = t('select_title');
    this.saveBtnLbl.string = t('title_btn_save');
    this.backBtnLbl.string = t('select_back_menu');
    this.badgesBtnLbl.string = t('select_badges_btn', {
      unlocked: this.progress.getUnlockedBadgesCount(),
      total: BADGES.length,
    });
    for (const spec of CAMPAIGN_CARDS) {
      const vis = this.cardVisuals.get(spec.id);
      if (!vis) continue;
      const copy = getCampaignCardCopy(spec.id);
      vis.title.string = copy.title;
      vis.sub.string = copy.subtitle;
      vis.lore.string = copy.lore;
      vis.playBtn.string = t('select_play_btn');

      const done = this.progress.getCompletedCount(spec.id);
      const golds = this.progress.getGoldCount(spec.id);
      const rank = this.progress.getRank(spec.id);
      vis.stats.string = t('select_card_stats', {
        done,
        golds,
        rank,
        pts: this.progress.getAvailableSkillPoints(spec.id),
      });
    }
  }
}
