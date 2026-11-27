import { Button, Color, Graphics, Label, Node } from 'cc';
import { COCOS_BLEED_HEIGHT, COCOS_BLEED_WIDTH, COCOS_DESIGN_HEIGHT, COCOS_DESIGN_WIDTH } from '../core/CoordTransform';
import { CampaignProgressStore } from '../data/CampaignProgress';
import { CAMPAIGN_EDICTS } from '../data/EdictsData';
import { getEdictName, getEdictRankDesc, t } from '../data/I18n';
import { EdictDef, EdictId, PlayableCampaignId } from '../data/Types';
import { AudioManager } from './AudioManager';
import { createUiNode, drawPanel } from './SpriteLoader';

interface EdictCardVisual {
  def: EdictDef;
  cardG: Graphics;
  titleLabel: Label;
  rankLabel: Label;
  effectsLabel: Label;
  upgradeBtn: Node;
  upgradeLbl: Label;
  upgradeBg: Graphics;
}

export class ThroneRoomView {
  readonly root: Node;
  private titleLabel!: Label;
  private pointsLabel!: Label;
  private resetBtnLabel!: Label;
  private backBtnLabel!: Label;
  private bonusSummaryLabel!: Label;
  private cardsContainer!: Node;
  private cards: EdictCardVisual[] = [];
  private builtCampaign: PlayableCampaignId | null = null;

  constructor(
    parent: Node,
    private progress: CampaignProgressStore,
    private audio: AudioManager,
    private onBackToMap: () => void,
  ) {
    this.root = createUiNode('ThroneRoomView', parent, COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT);
    this.buildUi();
  }

  private buildUi(): void {
    const bg = createUiNode('ThroneBg', this.root, COCOS_BLEED_WIDTH, COCOS_BLEED_HEIGHT);
    const g = bg.addComponent(Graphics);
    g.fillColor = new Color(18, 16, 26, 255);
    g.rect(-1280, -720, 2560, 1440);
    g.fill();

    // Header
    const topBar = createUiNode('ThroneTopBar', this.root, COCOS_BLEED_WIDTH, 58);
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

    this.titleLabel = createUiNode('Title', topBar, 430, 34).addComponent(Label);
    this.titleLabel.node.setPosition(-405, 0);
    this.titleLabel.string = t('throne_title_westaria');
    this.titleLabel.fontSize = 20;
    this.titleLabel.isBold = true;
    this.titleLabel.overflow = Label.Overflow.SHRINK;
    this.titleLabel.color = new Color(255, 224, 130, 255);

    const pBadge = createUiNode('PointsBadge', topBar, 220, 36);
    pBadge.setPosition(-20, 0);
    drawPanel(pBadge.addComponent(Graphics), 220, 36, new Color(46, 36, 62, 240), new Color(214, 173, 86, 230), 2, 8);
    this.pointsLabel = createUiNode('L', pBadge, 210, 26).addComponent(Label);
    this.pointsLabel.fontSize = 15;
    this.pointsLabel.isBold = true;
    this.pointsLabel.overflow = Label.Overflow.SHRINK;
    this.pointsLabel.color = new Color(255, 230, 125, 255);

    const makeBtn = (name: string, txt: string, x: number, w: number, fill: Color, onClick: () => void): Label => {
      const b = createUiNode(name, topBar, w, 38);
      b.setPosition(x, 0);
      drawPanel(b.addComponent(Graphics), w, 38, fill, new Color(214, 173, 86, 230), 2, 8);
      const l = createUiNode('L', b, w - 12, 26).addComponent(Label);
      l.string = txt;
      l.fontSize = 14;
      l.isBold = true;
      l.overflow = Label.Overflow.SHRINK;
      l.color = new Color(255, 235, 175, 255);
      const comp = b.addComponent(Button);
      comp.transition = Button.Transition.SCALE;
      comp.zoomScale = 1.05;
      b.on(Button.EventType.CLICK, () => {
        this.audio.playSfx('ui_click');
        onClick();
      });
      return l;
    };

    this.resetBtnLabel = makeBtn('BtnResetEdicts', t('throne_btn_reset'), 240, 155, new Color(102, 42, 42, 240), () => {
      this.progress.resetEdicts();
      this.refresh();
    });
    this.backBtnLabel = makeBtn('BtnBackMap', t('throne_btn_back'), 470, 235, new Color(48, 82, 52, 245), () => {
      this.onBackToMap();
    });

    this.cardsContainer = createUiNode('EdictsGrid', this.root, COCOS_DESIGN_WIDTH, 580);

    // Bottom Summary Strip
    const bot = createUiNode('ThroneSummaryBar', this.root, COCOS_BLEED_WIDTH, 48);
    bot.setPosition(0, -COCOS_DESIGN_HEIGHT * 0.5 + 24);
    drawPanel(bot.addComponent(Graphics), COCOS_BLEED_WIDTH, 48, new Color(22, 20, 32, 242), new Color(175, 140, 72, 220), 2, 0);
    this.bonusSummaryLabel = createUiNode('SumLbl', bot, 1220, 30).addComponent(Label);
    this.bonusSummaryLabel.fontSize = 14;
    this.bonusSummaryLabel.overflow = Label.Overflow.SHRINK;
    this.bonusSummaryLabel.color = new Color(170, 235, 180, 255);
  }

  private rebuildGrid(campaign: PlayableCampaignId): void {
    this.cardsContainer.removeAllChildren();
    this.cards = [];
    this.builtCampaign = campaign;

    const colXs = [-405, 0, 405];
    const rowYs = [182, 2, -178];
    const edicts = CAMPAIGN_EDICTS[campaign];

    edicts.forEach((def, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const card = createUiNode(`EdictCard_${def.id}`, this.cardsContainer, 380, 162);
      card.setPosition(colXs[col], rowYs[row]);
      const cardG = card.addComponent(Graphics);

      const title = createUiNode('Title', card, 255, 26).addComponent(Label);
      title.node.setPosition(-50, 60);
      title.string = def.name;
      title.fontSize = 14;
      title.isBold = true;
      title.overflow = Label.Overflow.SHRINK;
      title.color = new Color(255, 224, 132, 255);

      const rankLabel = createUiNode('Rank', card, 100, 24).addComponent(Label);
      rankLabel.node.setPosition(125, 60);
      rankLabel.fontSize = 14;
      rankLabel.isBold = true;

      const effectsLabel = createUiNode('Effects', card, 354, 78).addComponent(Label);
      effectsLabel.node.setPosition(0, 8);
      effectsLabel.fontSize = 13;
      effectsLabel.lineHeight = 19;
      effectsLabel.enableWrapText = true;
      effectsLabel.overflow = Label.Overflow.CLAMP;
      effectsLabel.color = new Color(230, 234, 242, 255);

      const upBtn = createUiNode('BtnUpgrade', card, 210, 34);
      upBtn.setPosition(0, -54);
      const upBg = upBtn.addComponent(Graphics);
      const upLbl = createUiNode('L', upBtn, 195, 24).addComponent(Label);
      upLbl.fontSize = 13;
      upLbl.isBold = true;
      const comp = upBtn.addComponent(Button);
      comp.transition = Button.Transition.SCALE;
      comp.zoomScale = 1.05;
      upBtn.on(Button.EventType.CLICK, () => {
        if (this.progress.upgradeEdict(def.id as EdictId)) {
          this.audio.playSfx('build_obelisk');
          this.refresh();
        }
      });

      this.cards.push({
        def,
        cardG,
        titleLabel: title,
        rankLabel,
        effectsLabel,
        upgradeBtn: upBtn,
        upgradeLbl: upLbl,
        upgradeBg: upBg,
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
    const campaign = this.progress.getActiveCampaign();
    if (this.builtCampaign !== campaign) {
      this.rebuildGrid(campaign);
    }

    this.resetBtnLabel.string = t('throne_btn_reset');
    this.backBtnLabel.string = t('throne_btn_back');
    this.titleLabel.string =
      campaign === 'TheKhaganate'
        ? t('throne_title_khaganate')
        : campaign === 'TheCult'
          ? t('throne_title_cult')
          : t('throne_title_westaria');
    const freePts = this.progress.getAvailableSkillPoints(campaign);
    this.pointsLabel.string = t('throne_available_pts', { pts: freePts });

    for (const cv of this.cards) {
      const r = this.progress.getEdictRank(cv.def.id, campaign);
      const canUp = this.progress.canUpgradeEdict(cv.def.id, campaign);

      const borderCol = r === 3 ? new Color(245, 205, 82, 255) : r > 0 ? new Color(125, 205, 125, 235) : new Color(110, 105, 125, 180);
      drawPanel(cv.cardG, 380, 162, new Color(28, 26, 40, 240), borderCol, 2, 12);

      cv.titleLabel.string = getEdictName(cv.def.id, cv.def.name);
      const pips = `${'●'.repeat(r)}${'○'.repeat(3 - r)}  (${r}/3)`;
      cv.rankLabel.string = pips;
      cv.rankLabel.color = r > 0 ? new Color(125, 235, 135, 255) : new Color(180, 175, 190, 220);

      cv.effectsLabel.string = cv.def.ranks
        .map((rk) => `${r >= rk.rank ? '✓' : '·'} Lv${rk.rank}: ${getEdictRankDesc(cv.def.id, rk.rank, rk.description)}`)
        .join('\n');

      if (r >= 3) {
        drawPanel(cv.upgradeBg, 210, 34, new Color(46, 56, 36, 235), new Color(214, 173, 86, 200), 1.5, 8);
        cv.upgradeLbl.string = t('throne_maxed');
        cv.upgradeLbl.color = new Color(245, 220, 135, 255);
      } else if (canUp) {
        drawPanel(cv.upgradeBg, 210, 34, new Color(50, 92, 54, 245), new Color(135, 230, 135, 245), 2, 8);
        cv.upgradeLbl.string = t('throne_upgrade', { lv: r + 1 });
        cv.upgradeLbl.color = new Color(255, 248, 210, 255);
      } else {
        drawPanel(cv.upgradeBg, 210, 34, new Color(36, 36, 46, 225), new Color(95, 95, 110, 180), 1.5, 8);
        cv.upgradeLbl.string = t('throne_need_pt');
        cv.upgradeLbl.color = new Color(160, 160, 175, 210);
      }
    }

    const b = this.progress.getBonuses(campaign);
    if (campaign === 'TheKhaganate') {
      this.bonusSummaryLabel.string = t('throne_sum_khaganate', {
        inf: b.infantryTier,
        arc: b.archersTier,
        cav: b.cavalryTier,
        siege: b.siegeTier,
        spells: b.unlockedSpells.length,
        spd: b.moveSpeedMul.toFixed(2),
        cap: b.captureGoldBonus,
        poi: b.poisonBonusDamage,
      });
    } else if (campaign === 'TheCult') {
      this.bonusSummaryLabel.string = t('throne_sum_cult', {
        inf: b.infantryTier,
        arc: b.archersTier,
        cav: b.cavalryTier,
        mag: b.magicTier,
        spells: b.unlockedSpells.length,
        sup: b.supplyCostMul.toFixed(2),
        spc: b.spellCostMul.toFixed(2),
        twr: b.magicTowerResourceBonus,
      });
    } else {
      this.bonusSummaryLabel.string = t('throne_sum_westaria', {
        inf: b.infantryTier,
        arc: b.archersTier,
        cav: b.cavalryTier,
        mag: b.magicTier,
        spells: b.unlockedSpells.length,
        gold: b.startGoldBonus,
        shp: b.strongholdHpMul.toFixed(2),
        chg: b.cavalryChargeMul,
      });
    }
  }
}
