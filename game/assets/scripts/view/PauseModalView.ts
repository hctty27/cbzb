import { BlockInputEvents, Button, Color, Graphics, Label, Node } from 'cc';
import { COCOS_DESIGN_HEIGHT, COCOS_DESIGN_WIDTH } from '../core/CoordTransform';
import { t } from '../data/I18n';
import { BattleSim } from '../sim/BattleSim';
import { AudioManager } from './AudioManager';
import { createUiNode, drawPanel } from './SpriteLoader';

export interface PauseModalCallbacks {
  onRestart: () => void;
  onCampaignMap: () => void;
  onMenu: () => void;
  onToggleLanguage: () => void;
}

/**
 * Battle pause overlay with audio volume steppers, live language toggle,
 * and match navigation actions.
 */
export class PauseModalView {
  private readonly modalNode: Node;
  private titleLabel!: Label;
  private bgmVolLabel!: Label;
  private sfxVolLabel!: Label;
  private langLabel!: Label;
  private langBtnLabel!: Label;
  private resumeLabel!: Label;
  private restartLabel!: Label;
  private mapLabel!: Label;
  private menuLabel!: Label;

  constructor(
    parent: Node,
    private sim: BattleSim,
    private audio: AudioManager,
    private callbacks: PauseModalCallbacks,
  ) {
    this.modalNode = createUiNode('PauseModal', parent, COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT);
    this.modalNode.addComponent(BlockInputEvents);
    drawPanel(
      this.modalNode.addComponent(Graphics),
      COCOS_DESIGN_WIDTH,
      COCOS_DESIGN_HEIGHT,
      new Color(8, 10, 16, 185),
      undefined,
      0,
      0,
    );

    const card = createUiNode('PauseCard', this.modalNode, 380, 456);
    drawPanel(card.addComponent(Graphics), 380, 456, new Color(28, 24, 38, 248), new Color(214, 173, 86, 255), 3, 14);
    this.titleLabel = createUiNode('PauseTitle', card, 320, 40).addComponent(Label);
    this.titleLabel.node.setPosition(0, 192);
    this.titleLabel.string = t('pause_title');
    this.titleLabel.fontSize = 25;
    this.titleLabel.isBold = true;
    this.titleLabel.overflow = Label.Overflow.SHRINK;
    this.titleLabel.color = new Color(255, 224, 130, 255);

    const makeVolRow = (title: string, y: number, onDelta: (delta: number) => void): Label => {
      const lbl = createUiNode(`VolLbl_${title}`, card, 158, 28).addComponent(Label);
      lbl.node.setPosition(-72, y);
      lbl.fontSize = 15;
      lbl.isBold = true;
      lbl.overflow = Label.Overflow.SHRINK;
      lbl.color = new Color(235, 232, 220, 255);

      const makeStep = (txt: string, x: number, delta: number) => {
        const b = createUiNode(`VolBtn_${title}_${txt}`, card, 42, 30);
        b.setPosition(x, y);
        drawPanel(b.addComponent(Graphics), 42, 30, new Color(54, 46, 76, 240), new Color(205, 168, 86, 220), 1.5, 6);
        const bl = createUiNode('L', b, 34, 24).addComponent(Label);
        bl.string = txt;
        bl.fontSize = 16;
        bl.isBold = true;
        bl.color = new Color(255, 232, 165, 255);
        b.addComponent(Button).node.on(Button.EventType.CLICK, () => {
          onDelta(delta);
          this.audio.playSfx('ui_click');
          this.refreshLabels();
        });
      };

      makeStep('-', 68, -0.15);
      makeStep('+', 120, 0.15);
      return lbl;
    };

    this.bgmVolLabel = makeVolRow('BGM', 138, (d) => {
      this.audio.setBgmVolume(this.audio.getBgmVolume() + d);
    });
    this.sfxVolLabel = makeVolRow('SFX', 98, (d) => {
      this.audio.setSfxVolume(this.audio.getSfxVolume() + d);
    });

    // Language toggle row inside Pause Modal
    this.langLabel = createUiNode('PauseLangLbl', card, 170, 28).addComponent(Label);
    this.langLabel.node.setPosition(-68, 58);
    this.langLabel.fontSize = 14;
    this.langLabel.isBold = true;
    this.langLabel.overflow = Label.Overflow.SHRINK;
    this.langLabel.color = new Color(235, 232, 220, 255);

    const langBtn = createUiNode('PauseBtnLang', card, 94, 30);
    langBtn.setPosition(94, 58);
    drawPanel(langBtn.addComponent(Graphics), 94, 30, new Color(54, 46, 76, 240), new Color(205, 168, 86, 220), 1.5, 6);
    this.langBtnLabel = createUiNode('L', langBtn, 86, 24).addComponent(Label);
    this.langBtnLabel.fontSize = 14;
    this.langBtnLabel.isBold = true;
    this.langBtnLabel.overflow = Label.Overflow.SHRINK;
    this.langBtnLabel.color = new Color(255, 232, 165, 255);
    langBtn.addComponent(Button).node.on(Button.EventType.CLICK, () => {
      this.audio.playSfx('ui_click');
      this.callbacks.onToggleLanguage();
    });

    this.refreshLabels();

    const makeBtn = (name: string, txt: string, y: number, fn: () => void): Label => {
      const b = createUiNode(name, card, 240, 42);
      b.setPosition(0, y);
      drawPanel(b.addComponent(Graphics), 240, 42, new Color(68, 42, 92, 240), new Color(214, 173, 86, 230), 2, 8);
      const l = createUiNode('L', b, 220, 28).addComponent(Label);
      l.string = txt;
      l.fontSize = 15;
      l.isBold = true;
      l.overflow = Label.Overflow.SHRINK;
      b.addComponent(Button).node.on(Button.EventType.CLICK, () => {
        this.audio.playSfx('ui_click');
        fn();
      });
      return l;
    };

    this.resumeLabel = makeBtn('PauseBtn_RESUME', t('pause_resume'), 2, () => {
      this.setPaused(false);
    });
    this.restartLabel = makeBtn('PauseBtn_RESTART', t('pause_restart'), -48, () => {
      this.setPaused(false);
      this.callbacks.onRestart();
    });
    this.mapLabel = makeBtn('PauseBtn_MAP', t('pause_map'), -98, () => {
      this.setPaused(false);
      this.callbacks.onCampaignMap();
    });
    this.menuLabel = makeBtn('PauseBtn_MENU', t('pause_menu'), -148, () => {
      this.setPaused(false);
      this.callbacks.onMenu();
    });

    this.modalNode.active = false;
  }

  refreshLabels(): void {
    const bgmPct = Math.round(this.audio.getBgmVolume() * 100);
    const sfxPct = Math.round(this.audio.getSfxVolume() * 100);
    this.bgmVolLabel.string = t('pause_bgm', { pct: bgmPct });
    this.sfxVolLabel.string = t('pause_sfx', { pct: sfxPct });
    this.langLabel.string = t('pause_lang_row');
    this.langBtnLabel.string = t('pause_lang_btn');
  }

  isOpen(): boolean {
    return this.modalNode.active;
  }

  setPaused(paused: boolean): void {
    this.sim.paused = paused;
    this.modalNode.active = paused;
    if (paused) {
      this.refreshLabels();
    }
  }

  refreshLocale(): void {
    this.titleLabel.string = t('pause_title');
    this.resumeLabel.string = t('pause_resume');
    this.restartLabel.string = t('pause_restart');
    this.mapLabel.string = t('pause_map');
    this.menuLabel.string = t('pause_menu');
    this.refreshLabels();
  }
}
