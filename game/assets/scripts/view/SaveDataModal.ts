import { BlockInputEvents, Button, Color, Graphics, Label, Node } from 'cc';
import { COCOS_DESIGN_HEIGHT, COCOS_DESIGN_WIDTH } from '../core/CoordTransform';
import { CampaignProgressStore } from '../data/CampaignProgress';
import { t } from '../data/I18n';
import { PlayableCampaignId } from '../data/Types';
import { AudioManager } from './AudioManager';
import { createUiNode, drawPanel } from './SpriteLoader';

const CAMPAIGN_IDS: PlayableCampaignId[] = ['Westaria', 'TheKhaganate', 'TheCult'];

export class SaveDataModal {
  readonly root: Node;
  private titleLabel!: Label;
  private summaryLabel!: Label;
  private hintLabel!: Label;
  private codePreviewLabel!: Label;
  private statusLabel!: Label;

  private copyBtnLbl!: Label;
  private downloadBtnLbl!: Label;
  private importBtnLbl!: Label;
  private resetBtnLbl!: Label;
  private resetBtnBg!: Graphics;
  private closeBtnLbl!: Label;

  private confirmResetPending = false;
  private domOverlay: HTMLElement | null = null;

  constructor(
    parent: Node,
    private progress: CampaignProgressStore,
    private audio: AudioManager,
    private onSaveChanged: () => void,
  ) {
    this.root = createUiNode('SaveDataModal', parent, COCOS_DESIGN_WIDTH, COCOS_DESIGN_HEIGHT);
    this.buildUi();
    this.root.active = false;
  }

  private buildUi(): void {
    this.root.addComponent(BlockInputEvents);
    drawPanel(
      this.root.addComponent(Graphics),
      COCOS_DESIGN_WIDTH,
      COCOS_DESIGN_HEIGHT,
      new Color(8, 10, 16, 200),
      undefined,
      0,
      0,
    );

    const card = createUiNode('SaveCard', this.root, 600, 420);
    drawPanel(card.addComponent(Graphics), 600, 420, new Color(24, 22, 36, 250), new Color(214, 173, 86, 250), 2.5, 14);

    this.titleLabel = createUiNode('SaveTitle', card, 540, 36).addComponent(Label);
    this.titleLabel.node.setPosition(0, 174);
    this.titleLabel.fontSize = 23;
    this.titleLabel.isBold = true;
    this.titleLabel.overflow = Label.Overflow.SHRINK;
    this.titleLabel.color = new Color(255, 226, 134, 255);

    this.summaryLabel = createUiNode('SaveSummary', card, 540, 28).addComponent(Label);
    this.summaryLabel.node.setPosition(0, 132);
    this.summaryLabel.fontSize = 14;
    this.summaryLabel.isBold = true;
    this.summaryLabel.overflow = Label.Overflow.SHRINK;
    this.summaryLabel.color = new Color(168, 225, 175, 255);

    this.hintLabel = createUiNode('CodeHint', card, 540, 24).addComponent(Label);
    this.hintLabel.node.setPosition(0, 96);
    this.hintLabel.fontSize = 13;
    this.hintLabel.overflow = Label.Overflow.SHRINK;
    this.hintLabel.color = new Color(210, 218, 232, 240);

    const codeBox = createUiNode('CodeBox', card, 536, 62);
    codeBox.setPosition(0, 48);
    drawPanel(codeBox.addComponent(Graphics), 536, 62, new Color(14, 14, 24, 245), new Color(120, 108, 72, 220), 1.5, 8);
    this.codePreviewLabel = createUiNode('CodeText', codeBox, 514, 50).addComponent(Label);
    this.codePreviewLabel.fontSize = 12;
    this.codePreviewLabel.lineHeight = 16;
    this.codePreviewLabel.enableWrapText = true;
    this.codePreviewLabel.overflow = Label.Overflow.CLAMP;
    this.codePreviewLabel.color = new Color(238, 215, 145, 255);

    this.statusLabel = createUiNode('SaveStatus', card, 540, 42).addComponent(Label);
    this.statusLabel.node.setPosition(0, -14);
    this.statusLabel.fontSize = 13;
    this.statusLabel.lineHeight = 18;
    this.statusLabel.enableWrapText = true;
    this.statusLabel.overflow = Label.Overflow.SHRINK;
    this.statusLabel.color = new Color(200, 220, 242, 245);

    const makeActionBtn = (
      name: string,
      x: number,
      y: number,
      w: number,
      fill: Color,
      stroke: Color,
      onClick: () => void,
    ): { label: Label; bg: Graphics } => {
      const btn = createUiNode(name, card, w, 40);
      btn.setPosition(x, y);
      const bg = btn.addComponent(Graphics);
      drawPanel(bg, w, 40, fill, stroke, 2, 8);
      const lbl = createUiNode('L', btn, w - 12, 26).addComponent(Label);
      lbl.fontSize = 14;
      lbl.isBold = true;
      lbl.overflow = Label.Overflow.SHRINK;
      lbl.color = new Color(255, 238, 185, 255);
      const comp = btn.addComponent(Button);
      comp.transition = Button.Transition.SCALE;
      comp.zoomScale = 1.05;
      btn.on(Button.EventType.CLICK, () => {
        this.audio.playSfx('ui_click');
        onClick();
      });
      return { label: lbl, bg };
    };

    const goldStroke = new Color(214, 173, 86, 235);
    this.copyBtnLbl = makeActionBtn('BtnSaveCopy', -182, -74, 168, new Color(48, 72, 92, 245), goldStroke, () => {
      void this.handleCopy();
    }).label;

    this.downloadBtnLbl = makeActionBtn('BtnSaveDownload', 0, -74, 168, new Color(48, 82, 56, 245), goldStroke, () => {
      this.handleDownload();
    }).label;

    this.importBtnLbl = makeActionBtn('BtnSaveImport', 182, -74, 168, new Color(76, 54, 92, 245), goldStroke, () => {
      this.openImportDialog();
    }).label;

    const resetBtn = makeActionBtn(
      'BtnSaveReset',
      -105,
      -134,
      195,
      new Color(102, 36, 40, 245),
      new Color(230, 125, 115, 235),
      () => this.handleReset(),
    );
    this.resetBtnLbl = resetBtn.label;
    this.resetBtnBg = resetBtn.bg;

    this.closeBtnLbl = makeActionBtn('BtnSaveClose', 120, -134, 175, new Color(54, 48, 68, 245), goldStroke, () => {
      this.hide();
    }).label;

    this.refreshLocale();
  }

  private setStatus(msg: string, tone: 'info' | 'ok' | 'err' = 'info'): void {
    this.statusLabel.string = msg;
    this.statusLabel.color =
      tone === 'ok'
        ? new Color(130, 235, 145, 255)
        : tone === 'err'
          ? new Color(248, 130, 125, 255)
          : new Color(200, 220, 242, 245);
  }

  private refreshDataDisplay(): void {
    const done = CAMPAIGN_IDS.reduce((acc, c) => acc + this.progress.getCompletedCount(c), 0);
    const golds = CAMPAIGN_IDS.reduce((acc, c) => acc + this.progress.getGoldCount(c), 0);
    const badges = this.progress.getUnlockedBadgesCount();
    this.summaryLabel.string = t('save_summary', { done, golds, badges });

    const code = this.progress.exportSaveCode();
    if (code.length > 128) {
      this.codePreviewLabel.string = `${code.slice(0, 88)}...${code.slice(-24)}`;
    } else {
      this.codePreviewLabel.string = code;
    }
  }

  private refreshResetBtn(): void {
    this.resetBtnLbl.string = this.confirmResetPending ? t('save_btn_reset_confirm') : t('save_btn_reset');
    drawPanel(
      this.resetBtnBg,
      195,
      40,
      this.confirmResetPending ? new Color(165, 42, 42, 250) : new Color(102, 36, 40, 245),
      new Color(230, 125, 115, 240),
      2,
      8,
    );
  }

  refreshLocale(): void {
    this.titleLabel.string = t('save_modal_title');
    this.hintLabel.string = t('save_code_hint');
    this.copyBtnLbl.string = t('save_btn_copy');
    this.downloadBtnLbl.string = t('save_btn_download');
    this.importBtnLbl.string = t('save_btn_import');
    this.closeBtnLbl.string = t('save_btn_close');
    this.refreshResetBtn();
    this.refreshDataDisplay();
    if (!this.confirmResetPending) {
      this.setStatus(t('save_status_ready'), 'info');
    }
  }

  private async handleCopy(): Promise<void> {
    this.confirmResetPending = false;
    this.refreshResetBtn();
    const code = this.progress.exportSaveCode();
    let copied = false;

    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(code);
        copied = true;
      } catch {
        copied = false;
      }
    }

    if (!copied && typeof document !== 'undefined') {
      try {
        const ta = document.createElement('textarea');
        ta.value = code;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        copied = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        copied = false;
      }
    }

    if (copied) {
      this.setStatus(t('save_status_copied'), 'ok');
    } else {
      this.setStatus(t('save_status_copy_fallback'), 'err');
    }
  }

  private handleDownload(): void {
    this.confirmResetPending = false;
    this.refreshResetBtn();
    if (typeof document === 'undefined' || typeof Blob === 'undefined' || typeof URL === 'undefined') {
      this.setStatus(t('save_status_download_unavail'), 'err');
      return;
    }
    try {
      const code = this.progress.exportSaveCode();
      const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'takeover-save.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      this.setStatus(t('save_status_downloaded'), 'ok');
    } catch {
      this.setStatus(t('save_status_download_unavail'), 'err');
    }
  }

  private applyImportedCode(rawCode: string): void {
    const res = this.progress.importSaveCode(rawCode);
    if (res.ok) {
      this.refreshDataDisplay();
      this.setStatus(t('save_status_imported', { done: res.completedMissions, badges: res.unlockedBadges }), 'ok');
      this.onSaveChanged();
      return;
    }
    const errKey =
      res.error === 'EMPTY'
        ? 'save_err_empty'
        : res.error === 'CHECKSUM_MISMATCH'
          ? 'save_err_checksum'
          : res.error === 'UNSUPPORTED_VERSION'
            ? 'save_err_version'
            : 'save_err_format';
    this.setStatus(t(errKey), 'err');
  }

  private openImportDialog(): void {
    this.confirmResetPending = false;
    this.refreshResetBtn();

    if (typeof document === 'undefined') {
      if (typeof prompt === 'function') {
        const val = prompt(t('save_import_prompt_title')) ?? '';
        this.applyImportedCode(val);
      }
      return;
    }

    this.closeDomOverlay();
    const wrap = document.createElement('div');
    wrap.id = 'takeover-import-overlay';
    wrap.style.cssText =
      'position:fixed;inset:0;z-index:9999;background:rgba(8,10,16,0.82);display:flex;align-items:center;justify-content:center;padding:16px;font-family:sans-serif;';

    const box = document.createElement('div');
    box.style.cssText =
      'width:min(520px,94vw);background:#181624;border:2px solid #d6ad56;border-radius:12px;padding:18px;color:#f5ebd6;box-shadow:0 12px 40px rgba(0,0,0,0.65);';

    const title = document.createElement('div');
    title.textContent = t('save_import_prompt_title');
    title.style.cssText = 'font-size:16px;font-weight:700;color:#ffe286;margin-bottom:10px;';

    const ta = document.createElement('textarea');
    ta.placeholder = t('save_import_prompt_placeholder');
    ta.rows = 5;
    ta.style.cssText =
      'width:100%;box-sizing:border-box;background:#0e0e18;color:#f0dfaa;border:1px solid #8a7340;border-radius:8px;padding:10px;font-family:monospace;font-size:12px;resize:vertical;';

    const row = document.createElement('div');
    row.style.cssText = 'display:flex;justify-content:flex-end;gap:10px;margin-top:12px;';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = t('save_import_prompt_cancel');
    cancelBtn.style.cssText =
      'padding:8px 16px;border-radius:7px;border:1px solid #9687a8;background:#2f293e;color:#f2e8d4;font-weight:700;cursor:pointer;';
    cancelBtn.onclick = () => {
      this.closeDomOverlay();
    };

    const okBtn = document.createElement('button');
    okBtn.type = 'button';
    okBtn.textContent = t('save_import_prompt_ok');
    okBtn.style.cssText =
      'padding:8px 16px;border-radius:7px;border:1px solid #d6ad56;background:#3a623f;color:#fff4cc;font-weight:700;cursor:pointer;';
    okBtn.onclick = () => {
      const val = ta.value;
      this.closeDomOverlay();
      this.applyImportedCode(val);
    };

    row.appendChild(cancelBtn);
    row.appendChild(okBtn);
    box.appendChild(title);
    box.appendChild(ta);
    box.appendChild(row);
    wrap.appendChild(box);
    document.body.appendChild(wrap);
    this.domOverlay = wrap;
    ta.focus();
  }

  private closeDomOverlay(): void {
    if (this.domOverlay && this.domOverlay.parentNode) {
      this.domOverlay.parentNode.removeChild(this.domOverlay);
    }
    this.domOverlay = null;
  }

  private handleReset(): void {
    if (!this.confirmResetPending) {
      this.confirmResetPending = true;
      this.refreshResetBtn();
      this.setStatus(t('save_status_reset_warn'), 'err');
      return;
    }
    this.confirmResetPending = false;
    this.progress.resetAll();
    this.refreshResetBtn();
    this.refreshDataDisplay();
    this.setStatus(t('save_status_reset_done'), 'ok');
    this.onSaveChanged();
  }

  isOpen(): boolean {
    return Boolean(this.root?.active);
  }

  show(): void {
    this.confirmResetPending = false;
    this.root.setSiblingIndex((this.root.parent?.children.length ?? 1) - 1);
    this.root.active = true;
    this.refreshLocale();
  }

  hide(): void {
    this.confirmResetPending = false;
    this.closeDomOverlay();
    this.root.active = false;
  }
}
