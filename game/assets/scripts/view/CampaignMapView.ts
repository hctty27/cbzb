import { Button, Color, Graphics, Label, Node, Sprite } from 'cc';
import { COCOS_BLEED_HEIGHT, COCOS_BLEED_WIDTH, COCOS_DESIGN_HEIGHT, COCOS_DESIGN_WIDTH } from '../core/CoordTransform';
import { SPRITE_MANIFEST } from '../data/AssetManifest';
import { CampaignProgressStore } from '../data/CampaignProgress';
import { getCampaignTitle, getFactionLabel, getLevelBriefing, getLevelName, getMedalLabel, t } from '../data/I18n';
import { getCampaignLevelMetas, LevelMeta } from '../data/LevelCatalog';
import { PlayableCampaignId } from '../data/Types';
import { preloadCampaign } from './AssetBundleManager';
import { AudioManager } from './AudioManager';
import { createUiNode, drawPanel, getStaticSpriteFrame, preloadTextureByKey } from './SpriteLoader';

interface PinVisual {
  levelId: number;
  missionIndex: number;
  ringG: Graphics;
  starSprite: Sprite;
  starNode: Node;
  lbl: Label;
  bgG: Graphics;
}

export class CampaignMapView {
  readonly root: Node;
  private titleLabel!: Label;
  private rankLabel!: Label;
  private pointsLabel!: Label;
  private xpBarG!: Graphics;
  private throneBtnLbl!: Label;
  private badgesBtnLbl!: Label;
  private campaignsBtnLbl!: Label;
  private mapSprite!: Sprite;
  private mapNode!: Node;
  private mapDiffSprite!: Sprite;
  private mapDiffNode!: Node;
  private pinContainer!: Node;
  private baseMapLoaded = false;
  private loadedDiffKey = '';
  private diffLoadSeq = 0;

  private infoTitle!: Label;
  private infoMeta!: Label;
  private infoBriefing!: Label;
  private infoRecord!: Label;
  private startBtnLabel!: Label;
  private freePlayLabel!: Label;
  private startBtnNode!: Node;

  private pins: PinVisual[] = [];
  private builtCampaign: PlayableCampaignId | null = null;

  constructor(
    parent: Node,
    private progress: CampaignProgressStore,
    private audio: AudioManager,
    private callbacks: {
      onStartLevel: (levelId: number) => void;
      onOpenThrone: () => void;
      onOpenBadges: () => void;
      onBackToSelect: () => void;
    },
  ) {
    this.root = createUiNode('CampaignMapView', parent, COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT);
    this.buildUi();
  }

  private buildUi(): void {
    const backdrop = createUiNode('MapBackdrop', this.root, COCOS_BLEED_WIDTH, COCOS_BLEED_HEIGHT);
    const bgG = backdrop.addComponent(Graphics);
    bgG.fillColor = new Color(24, 20, 18, 255);
    bgG.rect(-1280, -720, 2560, 1440);
    bgG.fill();

    const mapEntry = SPRITE_MANIFEST['map/campaign_map_base'];
    this.mapNode = createUiNode('CampaignMapBg', this.root, mapEntry.width, mapEntry.height);
    this.mapNode.setPosition(-120, -24);
    this.mapSprite = this.mapNode.addComponent(Sprite);
    this.mapSprite.sizeMode = Sprite.SizeMode.RAW;
    const mapScale = (COCOS_DESIGN_HEIGHT - 64) / mapEntry.height;
    this.mapNode.setScale(mapScale, mapScale, 1);

    this.mapDiffNode = createUiNode('CampaignMapDiffOverlay', this.root, mapEntry.width, mapEntry.height);
    this.mapDiffNode.setPosition(-120, -24);
    this.mapDiffSprite = this.mapDiffNode.addComponent(Sprite);
    this.mapDiffSprite.sizeMode = Sprite.SizeMode.RAW;
    this.mapDiffNode.setScale(mapScale, mapScale, 1);
    this.mapDiffNode.active = false;

    const frameG = createUiNode('MapFrame', this.root, COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT).addComponent(Graphics);
    frameG.strokeColor = new Color(175, 138, 68, 200);
    frameG.lineWidth = 3;
    frameG.roundRect(
      -120 - (mapEntry.width * mapScale) / 2,
      -24 - (mapEntry.height * mapScale) / 2,
      mapEntry.width * mapScale,
      mapEntry.height * mapScale,
      6,
    );
    frameG.stroke();

    // Pins container aligned strictly to 800x600 Flash coordinate space
    this.pinContainer = createUiNode('PinsLayer', this.root, 800, 600);
    this.pinContainer.setPosition(-120, -24);
    const pinScale = (COCOS_DESIGN_HEIGHT - 64) / 600;
    this.pinContainer.setScale(pinScale, pinScale, 1);

    // Top Header Bar
    const topBar = createUiNode('CampaignTopBar', this.root, COCOS_BLEED_WIDTH, 56);
    topBar.setPosition(0, COCOS_DESIGN_HEIGHT * 0.5 - 28);
    drawPanel(
      topBar.addComponent(Graphics),
      COCOS_BLEED_WIDTH,
      56,
      new Color(20, 18, 28, 242),
      new Color(195, 155, 78, 235),
      2,
      0,
    );

    const titleN = createUiNode('Title', topBar, 320, 32);
    titleN.setPosition(-465, 0);
    this.titleLabel = titleN.addComponent(Label);
    this.titleLabel.fontSize = 20;
    this.titleLabel.isBold = true;
    this.titleLabel.overflow = Label.Overflow.SHRINK;
    this.titleLabel.color = new Color(255, 222, 130, 255);

    const rankN = createUiNode('RankLbl', topBar, 250, 26);
    rankN.setPosition(-160, 9);
    this.rankLabel = rankN.addComponent(Label);
    this.rankLabel.fontSize = 13;
    this.rankLabel.isBold = true;
    this.rankLabel.overflow = Label.Overflow.SHRINK;
    this.rankLabel.color = new Color(235, 238, 245, 255);

    const xpBarNode = createUiNode('XpBar', topBar, 220, 10);
    xpBarNode.setPosition(-160, -11);
    this.xpBarG = xpBarNode.addComponent(Graphics);

    const ptsBadge = createUiNode('PtsBadge', topBar, 145, 34);
    ptsBadge.setPosition(48, 0);
    drawPanel(ptsBadge.addComponent(Graphics), 145, 34, new Color(42, 34, 58, 240), new Color(214, 173, 86, 220), 2, 8);
    const ptsN = createUiNode('PtsLbl', ptsBadge, 138, 24);
    this.pointsLabel = ptsN.addComponent(Label);
    this.pointsLabel.fontSize = 13;
    this.pointsLabel.isBold = true;
    this.pointsLabel.overflow = Label.Overflow.SHRINK;
    this.pointsLabel.color = new Color(255, 228, 120, 255);

    const makeTopBtn = (name: string, text: string, x: number, w: number, fill: Color, onClick: () => void): Label => {
      const b = createUiNode(name, topBar, w, 38);
      b.setPosition(x, 0);
      drawPanel(b.addComponent(Graphics), w, 38, fill, new Color(220, 178, 92, 240), 2, 8);
      const l = createUiNode('L', b, w - 10, 26).addComponent(Label);
      l.string = text;
      l.fontSize = 13;
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

    this.throneBtnLbl = makeTopBtn('BtnThroneRoom', t('map_btn_throne'), 222, 165, new Color(56, 78, 46, 245), () => {
      this.callbacks.onOpenThrone();
    });
    this.badgesBtnLbl = makeTopBtn('BtnBadgesRoom', t('map_btn_badges'), 376, 118, new Color(76, 56, 30, 245), () => {
      this.callbacks.onOpenBadges();
    });
    this.campaignsBtnLbl = makeTopBtn('BtnCampaignSelect', t('map_btn_campaigns'), 530, 155, new Color(52, 38, 66, 245), () => {
      this.callbacks.onBackToSelect();
    });

    // Right-hand Mission Briefing Card
    const card = createUiNode('MissionBriefingCard', this.root, 355, 580);
    card.setPosition(442, -24);
    drawPanel(
      card.addComponent(Graphics),
      355,
      580,
      new Color(22, 20, 32, 242),
      new Color(205, 165, 82, 240),
      2.5,
      14,
    );

    const itN = createUiNode('MissionTitle', card, 315, 52);
    itN.setPosition(0, 240);
    this.infoTitle = itN.addComponent(Label);
    this.infoTitle.fontSize = 20;
    this.infoTitle.lineHeight = 25;
    this.infoTitle.isBold = true;
    this.infoTitle.enableWrapText = true;
    this.infoTitle.overflow = Label.Overflow.CLAMP;
    this.infoTitle.color = new Color(255, 224, 132, 255);

    const imN = createUiNode('MissionMeta', card, 315, 76);
    imN.setPosition(0, 170);
    this.infoMeta = imN.addComponent(Label);
    this.infoMeta.fontSize = 14;
    this.infoMeta.lineHeight = 19;
    this.infoMeta.enableWrapText = true;
    this.infoMeta.overflow = Label.Overflow.CLAMP;
    this.infoMeta.color = new Color(168, 216, 245, 255);

    const ibN = createUiNode('MissionBriefing', card, 310, 200);
    ibN.setPosition(0, 30);
    this.infoBriefing = ibN.addComponent(Label);
    this.infoBriefing.fontSize = 14;
    this.infoBriefing.lineHeight = 21;
    this.infoBriefing.enableWrapText = true;
    this.infoBriefing.overflow = Label.Overflow.CLAMP;
    this.infoBriefing.color = new Color(235, 232, 220, 255);

    const irN = createUiNode('MissionRecord', card, 315, 64);
    irN.setPosition(0, -110);
    this.infoRecord = irN.addComponent(Label);
    this.infoRecord.fontSize = 14;
    this.infoRecord.lineHeight = 20;
    this.infoRecord.enableWrapText = true;
    this.infoRecord.overflow = Label.Overflow.CLAMP;
    this.infoRecord.color = new Color(255, 218, 120, 255);

    this.startBtnNode = createUiNode('BtnStartMission', card, 260, 56);
    this.startBtnNode.setPosition(0, -185);
    const sp = this.startBtnNode.addComponent(Sprite);
    sp.sizeMode = Sprite.SizeMode.CUSTOM;
    getStaticSpriteFrame('ui/btn_pill').then((sf) => {
      if (this.startBtnNode.isValid) sp.spriteFrame = sf;
    });
    const sLbl = createUiNode('Lbl', this.startBtnNode, 220, 34).addComponent(Label);
    sLbl.string = t('map_btn_start');
    sLbl.fontSize = 20;
    sLbl.isBold = true;
    sLbl.overflow = Label.Overflow.SHRINK;
    sLbl.color = new Color(255, 228, 140, 255);
    this.startBtnLabel = sLbl;

    const sBtn = this.startBtnNode.addComponent(Button);
    sBtn.transition = Button.Transition.SCALE;
    sBtn.zoomScale = 1.06;
    this.startBtnNode.on(Button.EventType.CLICK, () => {
      this.audio.playSfx('ui_click');
      this.callbacks.onStartLevel(this.progress.selectedLevelId);
    });

    const fpBtn = createUiNode('BtnFreePlay', card, 230, 30);
    fpBtn.setPosition(0, -245);
    drawPanel(fpBtn.addComponent(Graphics), 230, 30, new Color(36, 34, 52, 230), new Color(145, 130, 95, 200), 1.5, 7);
    this.freePlayLabel = createUiNode('L', fpBtn, 218, 22).addComponent(Label);
    this.freePlayLabel.fontSize = 12;
    this.freePlayLabel.isBold = true;
    this.freePlayLabel.color = new Color(205, 215, 230, 255);
    const fpComp = fpBtn.addComponent(Button);
    fpComp.transition = Button.Transition.SCALE;
    fpComp.zoomScale = 1.04;
    fpBtn.on(Button.EventType.CLICK, () => {
      this.audio.playSfx('ui_click');
      this.progress.toggleFreePlayAll();
      this.refresh();
    });
  }

  private rebuildPins(campaign: PlayableCampaignId): void {
    this.pinContainer.removeAllChildren();
    this.pins = [];
    this.builtCampaign = campaign;

    const lvls = getCampaignLevelMetas(campaign);
    for (const lvl of lvls) {
      const p = createUiNode(`LevelPin_${lvl.id}`, this.pinContainer, 44, 44);
      p.setPosition(lvl.mapPin.x - 400, 300 - lvl.mapPin.y);
      const ringG = p.addComponent(Graphics);
      const bgNode = createUiNode('Circle', p, 36, 36);
      const bgG = bgNode.addComponent(Graphics);

      const lblNode = createUiNode('Num', p, 30, 24);
      const lbl = lblNode.addComponent(Label);
      lbl.string = `${lvl.missionIndex}`;
      lbl.fontSize = 17;
      lbl.isBold = true;
      lbl.color = new Color(255, 245, 220, 255);

      const starNode = createUiNode('Star', p, 24, 24);
      starNode.setPosition(16, 16);
      const starSprite = starNode.addComponent(Sprite);
      starSprite.sizeMode = Sprite.SizeMode.CUSTOM;
      starNode.active = false;

      const btn = p.addComponent(Button);
      btn.transition = Button.Transition.SCALE;
      btn.zoomScale = 1.12;
      p.on(Button.EventType.CLICK, () => {
        if (!this.progress.isLevelUnlocked(lvl.id)) return;
        this.audio.playSfx('ui_click');
        this.progress.setSelectedLevelId(lvl.id);
        preloadCampaign(campaign, lvl.id);
        preloadTextureByKey(lvl.bgKey);
        this.refresh();
      });

      this.pins.push({ levelId: lvl.id, missionIndex: lvl.missionIndex, ringG, starSprite, starNode, lbl, bgG });
    }
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
    this.throneBtnLbl.string = t('map_btn_throne');
    this.badgesBtnLbl.string = t('map_btn_badges');
    this.campaignsBtnLbl.string = t('map_btn_campaigns');
    this.startBtnLabel.string = t('map_btn_start');

    const campaign = this.progress.getActiveCampaign();
    if (this.builtCampaign !== campaign) {
      this.rebuildPins(campaign);
    }

    if (!this.baseMapLoaded) {
      this.baseMapLoaded = true;
      getStaticSpriteFrame('map/campaign_map_base').then((sf) => {
        if (this.mapNode.isValid) this.mapSprite.spriteFrame = sf;
      });
    }

    const usingOriginalWorldMap = Boolean(SPRITE_MANIFEST['map/campaign_map_base']?.path.startsWith('art/'));
    const mapFrame = this.progress.getRivadisMapFrame(campaign);
    if (usingOriginalWorldMap || mapFrame <= 1) {
      this.diffLoadSeq++;
      this.loadedDiffKey = '';
      this.mapDiffNode.active = false;
      this.mapDiffSprite.spriteFrame = null;
    } else {
      const diffKey = `map/campaign_map_diff_${mapFrame}`;
      if (this.loadedDiffKey !== diffKey) {
        this.loadedDiffKey = diffKey;
        const seq = ++this.diffLoadSeq;
        this.mapDiffNode.active = false;
        getStaticSpriteFrame(diffKey).then((sf) => {
          if (this.mapDiffNode.isValid && seq === this.diffLoadSeq && this.loadedDiffKey === diffKey) {
            this.mapDiffSprite.spriteFrame = sf;
            this.mapDiffNode.active = true;
          }
        });
      } else if (this.mapDiffSprite.spriteFrame) {
        this.mapDiffNode.active = true;
      }
    }

    preloadCampaign(campaign, this.progress.selectedLevelId);

    this.titleLabel.string = getCampaignTitle(campaign);
    const rank = this.progress.getRank(campaign);
    const nextXp = this.progress.getNextRankXp(campaign);
    const freePts = this.progress.getAvailableSkillPoints(campaign);

    this.rankLabel.string = nextXp
      ? t('map_rank_xp', { rank, xp: this.progress.xp, next: nextXp })
      : t('map_rank_max', { rank });
    this.pointsLabel.string = t('map_edict_pts', { pts: freePts });

    this.xpBarG.clear();
    this.xpBarG.fillColor = new Color(34, 38, 56, 240);
    this.xpBarG.roundRect(-110, -4, 220, 9, 4);
    this.xpBarG.fill();
    this.xpBarG.strokeColor = new Color(175, 140, 72, 220);
    this.xpBarG.lineWidth = 1.2;
    this.xpBarG.roundRect(-110, -4, 220, 9, 4);
    this.xpBarG.stroke();
    const ratio = nextXp ? Math.min(1, this.progress.xp / nextXp) : 1;
    if (ratio > 0) {
      this.xpBarG.fillColor = new Color(110, 215, 130, 255);
      this.xpBarG.roundRect(-109, -3, Math.max(4, 218 * ratio), 7, 3);
      this.xpBarG.fill();
    }
    this.freePlayLabel.string = this.progress.isFreePlayAll() ? t('map_freeplay_on') : t('map_freeplay_off');

    const selId = this.progress.selectedLevelId;
    for (const pv of this.pins) {
      const unlocked = this.progress.isLevelUnlocked(pv.levelId);
      const rec = this.progress.getLevelRecord(pv.levelId);
      const isSelected = pv.levelId === selId;

      pv.ringG.clear();
      if (isSelected) {
        pv.ringG.strokeColor = new Color(255, 232, 95, 255);
        pv.ringG.lineWidth = 4;
        pv.ringG.circle(0, 0, 23);
        pv.ringG.stroke();
      }

      const activeCol =
        campaign === 'TheKhaganate'
          ? new Color(165, 58, 52, 245)
          : campaign === 'TheCult'
            ? new Color(48, 108, 175, 245)
            : new Color(175, 118, 32, 245);
      const fill = rec.completed
        ? new Color(42, 135, 68, 245)
        : unlocked
          ? activeCol
          : new Color(55, 55, 65, 215);
      const stroke = unlocked ? new Color(255, 225, 135, 245) : new Color(120, 120, 130, 190);
      drawPanel(pv.bgG, 34, 34, fill, stroke, 2.5, 17);
      pv.lbl.color = unlocked ? new Color(255, 248, 225, 255) : new Color(165, 165, 175, 200);

      if (rec.completed && rec.bestMedal) {
        pv.starNode.active = true;
        const starKey = rec.bestMedal === 'Gold' ? 'ui/star_gold' : 'ui/star_silver';
        getStaticSpriteFrame(starKey).then((sf) => {
          if (pv.starNode.isValid) pv.starSprite.spriteFrame = sf;
        });
      } else {
        pv.starNode.active = false;
      }
    }

    const lvls = getCampaignLevelMetas(campaign);
    const lvl: LevelMeta = lvls.find((l) => l.id === selId) ?? lvls[0];
    preloadTextureByKey(lvl.bgKey);
    const rec = this.progress.getLevelRecord(lvl.id);
    const enemyNames = lvl.enemies.map((e) => getFactionLabel(e)).join('\n  ');

    this.infoTitle.string = t('map_mission_title', {
      num: lvl.missionIndex,
      name: getLevelName(lvl.id, lvl.name).toUpperCase(),
    });
    this.infoMeta.string = t('map_mission_meta', {
      xp: lvl.xpReward,
      tier: lvl.enemyTechTier,
      enemies: enemyNames,
    });
    this.infoBriefing.string = getLevelBriefing(lvl.id, lvl.briefing);

    if (rec.completed && rec.bestTimeSec !== null) {
      const mm = String(Math.floor(rec.bestTimeSec / 60)).padStart(2, '0');
      const ss = String(rec.bestTimeSec % 60).padStart(2, '0');
      this.infoRecord.string = t('map_record_conquered', {
        medal: getMedalLabel(rec.bestMedal ?? 'Bronze'),
        time: `${mm}:${ss}`,
      });
    } else {
      this.infoRecord.string = t('map_record_ready');
    }
  }
}
