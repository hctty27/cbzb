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
    getStaticSpriteFrame('ui/title_bg').then((sf) => {
      if (bgNode.isValid) bgSprite.spriteFrame = sf;
    });

    const topGrad = createUiNode('TopShade', this.root, COCOS_BLEED_WIDTH, 140);
    topGrad.setPosition(0, COCOS_DESIGN_HEIGHT * 0.5 - 70);
    drawPanel(topGrad.addComponent(Graphics), COCOS_BLEED_WIDTH, 140, new Color(10, 8, 12, 115), undefined, 0, 0);

    const botGrad = createUiNode('BottomShade', this.root, COCOS_BLEED_WIDTH, 160);
    botGrad.setPosition(0, -COCOS_DESIGN_HEIGHT * 0.5 + 80);
    drawPanel(botGrad.addComponent(Graphics), COCOS_BLEED_WIDTH, 160, new Color(10, 8, 12, 175), undefined, 0, 0);

    const logoEntry = SPRITE_MANIFEST['ui/title_logo'];
    const logoNode = createUiNode('TakeoverLogo', this.root, logoEntry.width, logoEntry.height);
    logoNode.setPosition(0, 175);
    const logoSprite = logoNode.addComponent(Sprite);
    logoSprite.sizeMode = Sprite.SizeMode.RAW;
    logoNode.setScale(0.75, 0.75, 1);
    getStaticSpriteFrame('ui/title_logo').then((sf) => {
      if (logoNode.isValid) logoSprite.spriteFrame = sf;
    });

    const subNode = createUiNode('SubtitleBadge', this.root, 560, 36);
    subNode.setPosition(0, 62);
    drawPanel(
      subNode.addComponent(Graphics),
      560,
      36,
      new Color(20, 16, 28, 200),
      new Color(214, 173, 86, 220),
      2,
      10,
    );
    const subLbl = createUiNode('SubLabel', subNode, 540, 30).addComponent(Label);
    subLbl.string = t('title_subtitle');
    subLbl.fontSize = 14;
    subLbl.lineHeight = 20;
    subLbl.isBold = true;
    subLbl.overflow = Label.Overflow.SHRINK;
    subLbl.color = new Color(248, 224, 152, 255);
    this.subLabel = subLbl;

    const iriyEntry = SPRITE_MANIFEST['ui/iriysoft_logo'];
    const iriyNode = createUiNode('IriySoftLogo', this.root, iriyEntry.width, iriyEntry.height);
    iriyNode.setPosition(-COCOS_DESIGN_WIDTH * 0.5 + 120, -COCOS_DESIGN_HEIGHT * 0.5 + 42);
    iriyNode.setScale(0.75, 0.75, 1);
    const iriySp = iriyNode.addComponent(Sprite);
    iriySp.sizeMode = Sprite.SizeMode.RAW;
    getStaticSpriteFrame('ui/iriysoft_logo').then((sf) => {
      if (iriyNode.isValid) iriySp.spriteFrame = sf;
    });

    // Primary button: CAMPAIGN (opens Rivadis Campaign Map)
    const btnEntry = SPRITE_MANIFEST['ui/btn_pill'];
    const campBtn = createUiNode('BtnCampaign', this.root, btnEntry.width, btnEntry.height);
    campBtn.setPosition(-125, -238);
    campBtn.setScale(0.82, 0.82, 1);
    const campSp = campBtn.addComponent(Sprite);
    campSp.sizeMode = Sprite.SizeMode.RAW;
    getStaticSpriteFrame('ui/btn_pill').then((sf) => {
      if (campBtn.isValid) campSp.spriteFrame = sf;
    });
    const campLbl = createUiNode('Lbl', campBtn, 220, 44).addComponent(Label);
    campLbl.string = t('title_btn_campaign');
    campLbl.fontSize = 24;
    campLbl.isBold = true;
    campLbl.overflow = Label.Overflow.SHRINK;
    campLbl.color = new Color(255, 224, 130, 255);
    this.campLabel = campLbl;
    const cBtn = campBtn.addComponent(Button);
    cBtn.transition = Button.Transition.SCALE;
    cBtn.zoomScale = 1.06;
    campBtn.on(Button.EventType.CLICK, () => {
      this.audio.retryMusicOnGesture();
      this.audio.playSfx('ui_click');
      this.callbacks.onOpenCampaign();
    });

    // Secondary button: QUICK PLAY LV.1
    const quickBtn = createUiNode('BtnQuickLevel1', this.root, btnEntry.width, btnEntry.height);
    quickBtn.setPosition(125, -238);
    quickBtn.setScale(0.74, 0.74, 1);
    const qSp = quickBtn.addComponent(Sprite);
    qSp.sizeMode = Sprite.SizeMode.RAW;
    getStaticSpriteFrame('ui/btn_pill').then((sf) => {
      if (quickBtn.isValid) qSp.spriteFrame = sf;
    });
    const qLbl = createUiNode('Lbl', quickBtn, 220, 44).addComponent(Label);
    qLbl.string = t('title_btn_quick');
    qLbl.fontSize = 21;
    qLbl.isBold = true;
    qLbl.overflow = Label.Overflow.SHRINK;
    qLbl.color = new Color(220, 240, 210, 255);
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
        new Color(22, 24, 34, 215),
        new Color(180, 145, 76, 220),
        2,
        8,
      );
      const lbl = createUiNode('Lbl', btnNode, w - 12, 28).addComponent(Label);
      lbl.fontSize = 14;
      lbl.lineHeight = 20;
      lbl.isBold = true;
      lbl.overflow = Label.Overflow.SHRINK;
      lbl.color = new Color(240, 232, 210, 255);
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

    const attrLbl = createUiNode('AttrLabel', this.root, 360, 28).addComponent(Label);
    attrLbl.node.setPosition(COCOS_DESIGN_WIDTH * 0.5 - 195, -COCOS_DESIGN_HEIGHT * 0.5 + 30);
    attrLbl.string = t('title_attr');
    attrLbl.fontSize = 13;
    attrLbl.overflow = Label.Overflow.SHRINK;
    attrLbl.color = new Color(200, 195, 185, 220);
    this.attrLabel = attrLbl;
    this.refreshLocale();
  }

  private refreshMuteLabel(): void {
    this.muteLabel.string = this.audio.isMuted() ? t('title_sound_off') : t('title_sound_on');
  }

  refreshLocale(): void {
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
