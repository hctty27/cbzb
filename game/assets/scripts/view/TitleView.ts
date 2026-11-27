import { Button, Color, Graphics, Label, Node, Sprite } from 'cc';
import { COCOS_BLEED_WIDTH, COCOS_DESIGN_HEIGHT, COCOS_DESIGN_WIDTH } from '../core/CoordTransform';
import { SPRITE_MANIFEST } from '../data/AssetManifest';
import { t } from '../data/I18n';
import { AudioManager } from './AudioManager';
import { computeCoverScale } from './ScreenLayout';
import { createUiNode, drawPanel, getStaticSpriteFrame } from './SpriteLoader';

export class TitleView {
  readonly root: Node;
  private bgNode!: Node;
  private titleShadowLabel!: Label;
  private titleGameLabel!: Label;
  private taglineLabel!: Label;
  private subLabel!: Label;
  private campLabel!: Label;
  private quickLabel!: Label;
  private langLabel!: Label;
  private saveLabel!: Label;
  private muteLabel!: Label;
  private attrLabel!: Label;

  constructor(
    parent: Node,
    private audio: AudioManager,
    private callbacks: {
      onOpenCampaign: () => void;
      onQuickPlayLevel1: () => void;
      onToggleLanguage: () => void;
      onOpenSaveModal: () => void;
    },
  ) {
    this.root = createUiNode('TitleView', parent, COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT);
    this.buildUi();
  }

  private buildUi(): void {
    const bgEntry = SPRITE_MANIFEST['ui/title_bg'];
    const bgNode = createUiNode('TitleBg', this.root, bgEntry.width, bgEntry.height);
    this.bgNode = bgNode;
    const bgSprite = bgNode.addComponent(Sprite);
    bgSprite.sizeMode = Sprite.SizeMode.RAW;
    this.relayout();
    void getStaticSpriteFrame('ui/title_bg').then((sf) => {
      if (bgNode.isValid) bgSprite.spriteFrame = sf;
    });

    const topGrad = createUiNode('TopShade', this.root, COCOS_BLEED_WIDTH, 136);
    topGrad.setPosition(0, COCOS_DESIGN_HEIGHT * 0.5 - 68);
    drawPanel(topGrad.addComponent(Graphics), COCOS_BLEED_WIDTH, 136, new Color(10, 8, 12, 125), undefined, 0, 0);

    const botGrad = createUiNode('BottomShade', this.root, COCOS_BLEED_WIDTH, 170);
    botGrad.setPosition(0, -COCOS_DESIGN_HEIGHT * 0.5 + 85);
    drawPanel(botGrad.addComponent(Graphics), COCOS_BLEED_WIDTH, 170, new Color(10, 8, 12, 185), undefined, 0, 0);

    // Programmatic Eastern Dark Realism Title Plaque (Art Bible 9.6/9.7: all text rendered by UI Labels)
    const plaque = createUiNode('ShanhaiTitlePlaque', this.root, 560, 152);
    plaque.setPosition(0, 178);
    const pg = plaque.addComponent(Graphics);
    drawPanel(pg, 560, 152, new Color(18, 16, 22, 205), new Color(196, 154, 80, 235), 2.5, 14);
    pg.strokeColor = new Color(128, 92, 46, 200);
    pg.lineWidth = 1.5;
    pg.roundRect(-270, -66, 540, 132, 10);
    pg.stroke();
    pg.fillColor = new Color(172, 54, 42, 230);
    pg.rect(-248, -42, 6, 84);
    pg.rect(242, -42, 6, 84);
    pg.fill();

    const shadowLbl = createUiNode('TitleShadow', plaque, 500, 78).addComponent(Label);
    shadowLbl.node.setPosition(3, 12);
    shadowLbl.string = t('title_game_name');
    shadowLbl.fontSize = 62;
    shadowLbl.lineHeight = 70;
    shadowLbl.isBold = true;
    shadowLbl.overflow = Label.Overflow.SHRINK;
    shadowLbl.color = new Color(12, 8, 8, 225);
    this.titleShadowLabel = shadowLbl;

    const gameLbl = createUiNode('TitleName', plaque, 500, 78).addComponent(Label);
    gameLbl.node.setPosition(0, 16);
    gameLbl.string = t('title_game_name');
    gameLbl.fontSize = 62;
    gameLbl.lineHeight = 70;
    gameLbl.isBold = true;
    gameLbl.overflow = Label.Overflow.SHRINK;
    gameLbl.color = new Color(252, 224, 138, 255);
    this.titleGameLabel = gameLbl;

    const tagLbl = createUiNode('Tagline', plaque, 500, 30).addComponent(Label);
    tagLbl.node.setPosition(0, -40);
    tagLbl.string = t('title_tagline');
    tagLbl.fontSize = 16;
    tagLbl.lineHeight = 22;
    tagLbl.isBold = true;
    tagLbl.overflow = Label.Overflow.SHRINK;
    tagLbl.color = new Color(232, 212, 174, 245);
    this.taglineLabel = tagLbl;

    const subNode = createUiNode('SubtitleBadge', this.root, 580, 36);
    subNode.setPosition(0, 62);
    drawPanel(
      subNode.addComponent(Graphics),
      580,
      36,
      new Color(20, 18, 24, 215),
      new Color(204, 162, 82, 220),
      2,
      10,
    );
    const subLbl = createUiNode('SubLabel', subNode, 560, 30).addComponent(Label);
    subLbl.string = t('title_subtitle');
    subLbl.fontSize = 14;
    subLbl.lineHeight = 20;
    subLbl.isBold = true;
    subLbl.overflow = Label.Overflow.SHRINK;
    subLbl.color = new Color(246, 224, 156, 255);
    this.subLabel = subLbl;

    // Primary button: CAMPAIGN (molten gold beveled bronze frame)
    const activeBtnEntry = SPRITE_MANIFEST['ui/btn_pill_active'] ?? SPRITE_MANIFEST['ui/btn_pill'];
    const campBtn = createUiNode('BtnCampaign', this.root, activeBtnEntry.width, activeBtnEntry.height);
    campBtn.setPosition(-145, -225);
    campBtn.setScale(0.94, 0.94, 1);
    const campSp = campBtn.addComponent(Sprite);
    campSp.sizeMode = Sprite.SizeMode.RAW;
    void getStaticSpriteFrame(SPRITE_MANIFEST['ui/btn_pill_active'] ? 'ui/btn_pill_active' : 'ui/btn_pill').then((sf) => {
      if (campBtn.isValid) campSp.spriteFrame = sf;
    });
    const campLbl = createUiNode('Lbl', campBtn, 210, 42).addComponent(Label);
    campLbl.string = t('title_btn_campaign');
    campLbl.fontSize = 23;
    campLbl.isBold = true;
    campLbl.overflow = Label.Overflow.SHRINK;
    campLbl.color = new Color(255, 240, 190, 255);
    this.campLabel = campLbl;
    const cBtn = campBtn.addComponent(Button);
    cBtn.transition = Button.Transition.SCALE;
    cBtn.zoomScale = 1.06;
    campBtn.on(Button.EventType.CLICK, () => {
      this.audio.retryMusicOnGesture();
      this.audio.playSfx('ui_click');
      this.callbacks.onOpenCampaign();
    });

    // Secondary button: CH.1 QUICK PLAY (dark stone bronze frame)
    const btnEntry = SPRITE_MANIFEST['ui/btn_pill'];
    const quickBtn = createUiNode('BtnQuickLevel1', this.root, btnEntry.width, btnEntry.height);
    quickBtn.setPosition(145, -225);
    quickBtn.setScale(0.90, 0.90, 1);
    const qSp = quickBtn.addComponent(Sprite);
    qSp.sizeMode = Sprite.SizeMode.RAW;
    void getStaticSpriteFrame('ui/btn_pill').then((sf) => {
      if (quickBtn.isValid) qSp.spriteFrame = sf;
    });
    const qLbl = createUiNode('Lbl', quickBtn, 210, 40).addComponent(Label);
    qLbl.string = t('title_btn_quick');
    qLbl.fontSize = 20;
    qLbl.isBold = true;
    qLbl.overflow = Label.Overflow.SHRINK;
    qLbl.color = new Color(234, 228, 210, 255);
    this.quickLabel = qLbl;
    const qComp = quickBtn.addComponent(Button);
    qComp.transition = Button.Transition.SCALE;
    qComp.zoomScale = 1.06;
    quickBtn.on(Button.EventType.CLICK, () => {
      this.audio.retryMusicOnGesture();
      this.audio.playSfx('ui_click');
      this.callbacks.onQuickPlayLevel1();
    });

    const makeTopBtn = (name: string, x: number, w: number, onClick: () => void): Label => {
      const btnNode = createUiNode(name, this.root, w, 36);
      btnNode.setPosition(x, COCOS_DESIGN_HEIGHT * 0.5 - 38);
      drawPanel(
        btnNode.addComponent(Graphics),
        w,
        36,
        new Color(20, 22, 30, 220),
        new Color(188, 150, 80, 225),
        2,
        8,
      );
      const lbl = createUiNode('Lbl', btnNode, w - 12, 28).addComponent(Label);
      lbl.fontSize = 14;
      lbl.lineHeight = 20;
      lbl.isBold = true;
      lbl.overflow = Label.Overflow.SHRINK;
      lbl.color = new Color(242, 232, 206, 255);
      const bComp = btnNode.addComponent(Button);
      bComp.transition = Button.Transition.SCALE;
      bComp.zoomScale = 1.05;
      btnNode.on(Button.EventType.CLICK, () => {
        this.audio.playSfx('ui_click');
        onClick();
      });
      return lbl;
    };

    this.saveLabel = makeTopBtn('BtnTitleSave', COCOS_DESIGN_WIDTH * 0.5 - 344, 118, () => {
      this.callbacks.onOpenSaveModal();
    });

    this.langLabel = makeTopBtn('BtnTitleLang', COCOS_DESIGN_WIDTH * 0.5 - 214, 112, () => {
      this.callbacks.onToggleLanguage();
    });

    this.muteLabel = makeTopBtn('BtnTitleMute', COCOS_DESIGN_WIDTH * 0.5 - 84, 120, () => {
      this.audio.toggleMute();
      this.refreshMuteLabel();
    });

    const attrLbl = createUiNode('AttrLabel', this.root, 460, 28).addComponent(Label);
    attrLbl.node.setPosition(COCOS_DESIGN_WIDTH * 0.5 - 245, -COCOS_DESIGN_HEIGHT * 0.5 + 30);
    attrLbl.string = t('title_attr');
    attrLbl.fontSize = 13;
    attrLbl.overflow = Label.Overflow.SHRINK;
    attrLbl.color = new Color(210, 200, 182, 225);
    this.attrLabel = attrLbl;
    this.refreshLocale();
  }

  private refreshMuteLabel(): void {
    this.muteLabel.string = this.audio.isMuted() ? t('title_sound_off') : t('title_sound_on');
  }

  refreshLocale(): void {
    this.titleShadowLabel.string = t('title_game_name');
    this.titleGameLabel.string = t('title_game_name');
    this.taglineLabel.string = t('title_tagline');
    this.subLabel.string = t('title_subtitle');
    this.campLabel.string = t('title_btn_campaign');
    this.quickLabel.string = t('title_btn_quick');
    this.langLabel.string = t('lang_toggle_btn');
    this.saveLabel.string = t('title_btn_save');
    this.attrLabel.string = t('title_attr');
    this.refreshMuteLabel();
  }

  relayout(): void {
    if (!this.bgNode?.isValid) return;
    const bgEntry = SPRITE_MANIFEST['ui/title_bg'];
    const coverScale = computeCoverScale(bgEntry.width, bgEntry.height);
    this.bgNode.setScale(coverScale, coverScale, 1);
  }

  show(): void {
    this.root.active = true;
    this.relayout();
    this.refreshLocale();
    this.audio.playMusic('music_menu');
  }

  hide(): void {
    this.root.active = false;
  }
}
