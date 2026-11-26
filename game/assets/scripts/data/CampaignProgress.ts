import { BADGES, BADGES_BY_ID } from './BadgesData';
import {
  CAMPAIGN_EDICTS,
  computeCampaignBonuses,
  createDefaultEdictRanks,
  MAX_SKILL_POINTS,
  SKILL_POINTS_PER_RANK,
  STARTER_EDICTS,
  XP_RANK_TABLE,
} from './EdictsData';
import { getCampaignLevelMetas, getLevelMetaById } from './LevelCatalog';
import {
  BadgeDef,
  BadgeId,
  BattleBadgeStats,
  CampaignBonuses,
  CampaignSaveState,
  EdictId,
  LevelCompletionRecord,
  MedalRank,
  MultiCampaignSaveState,
  PlayableCampaignId,
} from './Types';

const STORAGE_KEY_V3 = 'takeover_save_v3';
const STORAGE_KEY_V2 = 'takeover_westaria_save_v2';

export interface IStorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}

export function createBrowserStorageAdapter(): IStorageAdapter {
  return {
    getItem(key: string): string | null {
      if (typeof localStorage === 'undefined') return null;
      return localStorage.getItem(key);
    },
    setItem(key: string, value: string): void {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(key, value);
    },
    removeItem(key: string): void {
      if (typeof localStorage === 'undefined') return;
      localStorage.removeItem(key);
    },
  };
}

export function createMemoryStorageAdapter(initial: Record<string, string> = {}): IStorageAdapter {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
  };
}

const CAMPAIGN_ORDER: PlayableCampaignId[] = ['Westaria', 'TheKhaganate', 'TheCult'];

const MEDAL_ORDER: Record<MedalRank, number> = {
  Bronze: 1,
  Silver: 2,
  Gold: 3,
};

const MEDAL_XP_MULT: Record<MedalRank, number> = {
  Bronze: 0.75,
  Silver: 1.0,
  Gold: 1.25,
};

export interface VictoryRewardSummary {
  xpEarned: number;
  oldRank: number;
  newRank: number;
  skillPointsGained: number;
  unlockedLevelId: number | null;
  newlyUnlockedBadges: BadgeDef[];
}

const SAVE_TRANSFER_PREFIX = 'TKV3:';

export type SaveImportErrorCode = 'EMPTY' | 'INVALID_FORMAT' | 'CHECKSUM_MISMATCH' | 'UNSUPPORTED_VERSION';

export type SaveImportResult =
  | {
      ok: true;
      completedMissions: number;
      unlockedBadges: number;
      activeCampaign: PlayableCampaignId;
    }
  | {
      ok: false;
      error: SaveImportErrorCode;
    };

interface SaveTransferEnvelopeV3 {
  format: 'takeover-save';
  version: number;
  exportedAt: number;
  checksum: string;
  data: MultiCampaignSaveState;
}

function fnv1aHex(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

const B64_ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

function encodeBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    out += B64_ALPHA[b0 >> 2];
    out += B64_ALPHA[((b0 & 0x03) << 4) | (b1 >> 4)];
    if (i + 1 < bytes.length) out += B64_ALPHA[((b1 & 0x0f) << 2) | (b2 >> 6)];
    if (i + 2 < bytes.length) out += B64_ALPHA[b2 & 0x3f];
  }
  return out;
}

function decodeBase64Url(b64Url: string): string {
  const norm = b64Url.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const bytes: number[] = [];
  for (let i = 0; i < norm.length; i += 4) {
    const c0 = B64_ALPHA.indexOf(norm[i]);
    const c1 = i + 1 < norm.length ? B64_ALPHA.indexOf(norm[i + 1]) : -1;
    const c2 = i + 2 < norm.length ? B64_ALPHA.indexOf(norm[i + 2]) : -1;
    const c3 = i + 3 < norm.length ? B64_ALPHA.indexOf(norm[i + 3]) : -1;
    if (c0 < 0 || c1 < 0) throw new Error('Invalid base64url');
    bytes.push((c0 << 2) | (c1 >> 4));
    if (c2 >= 0) {
      bytes.push(((c1 & 0x0f) << 4) | (c2 >> 2));
      if (c3 >= 0) {
        bytes.push(((c2 & 0x03) << 6) | c3);
      }
    }
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

export class CampaignProgressStore {
  private state: MultiCampaignSaveState;
  private freePlayAll = false;
  private storage: IStorageAdapter;

  constructor(autoLoad = true, storage: IStorageAdapter = createBrowserStorageAdapter()) {
    this.storage = storage;
    this.state = this.createFreshMultiState();
    if (autoLoad) this.load();
  }

  private createFreshCampaignState(campaign: PlayableCampaignId): CampaignSaveState {
    const lvls = getCampaignLevelMetas(campaign);
    const levels: Record<number, LevelCompletionRecord> = {};
    for (const lv of lvls) {
      levels[lv.id] = { completed: false, bestMedal: null, bestTimeSec: null };
    }
    return {
      xp: 0,
      edictRanks: createDefaultEdictRanks(campaign),
      levels,
      selectedLevelId: lvls[0]?.id ?? 1,
    };
  }

  private createFreshMultiState(): MultiCampaignSaveState {
    return {
      version: 3,
      activeCampaign: 'Westaria',
      campaigns: {
        Westaria: this.createFreshCampaignState('Westaria'),
        TheKhaganate: this.createFreshCampaignState('TheKhaganate'),
        TheCult: this.createFreshCampaignState('TheCult'),
      },
      badges: {},
    };
  }

  private sanitizeCampaignState(
    campaign: PlayableCampaignId,
    raw: Partial<CampaignSaveState> | undefined,
  ): CampaignSaveState {
    const fresh = this.createFreshCampaignState(campaign);
    if (!raw) return fresh;
    if (typeof raw.xp === 'number' && raw.xp >= 0) fresh.xp = Math.floor(raw.xp);
    const validIds = getCampaignLevelMetas(campaign).map((l) => l.id);
    if (typeof raw.selectedLevelId === 'number' && validIds.includes(raw.selectedLevelId)) {
      fresh.selectedLevelId = raw.selectedLevelId;
    }
    if (raw.edictRanks) {
      for (const ed of CAMPAIGN_EDICTS[campaign]) {
        const val = raw.edictRanks[ed.id];
        if (typeof val === 'number') {
          fresh.edictRanks[ed.id] = Math.max(0, Math.min(3, Math.floor(val)));
        }
      }
      for (const st of STARTER_EDICTS[campaign]) {
        fresh.edictRanks[st] = Math.max(1, fresh.edictRanks[st] ?? 1);
      }
    }
    if (raw.levels) {
      for (const id of validIds) {
        const rec = raw.levels[id];
        if (rec && typeof rec.completed === 'boolean') {
          fresh.levels[id] = {
            completed: rec.completed,
            bestMedal: rec.bestMedal ?? null,
            bestTimeSec: typeof rec.bestTimeSec === 'number' ? rec.bestTimeSec : null,
          };
        }
      }
    }
    return fresh;
  }

  load(): void {
    try {
      const rawV3 = this.storage.getItem(STORAGE_KEY_V3);
      if (rawV3) {
        const parsed = JSON.parse(rawV3) as Partial<MultiCampaignSaveState>;
        const fresh = this.createFreshMultiState();
        if (parsed.activeCampaign && CAMPAIGN_ORDER.includes(parsed.activeCampaign)) {
          fresh.activeCampaign = parsed.activeCampaign;
        }
        if (parsed.campaigns) {
          for (const cid of CAMPAIGN_ORDER) {
            fresh.campaigns[cid] = this.sanitizeCampaignState(cid, parsed.campaigns[cid]);
          }
        }
        if (parsed.badges) {
          for (const b of BADGES) {
            if (parsed.badges[b.id]) fresh.badges[b.id] = true;
          }
        }
        this.state = fresh;
        return;
      }

      // Migrate Phase 2 v2 Westaria save automatically
      const rawV2 = this.storage.getItem(STORAGE_KEY_V2);
      if (rawV2) {
        const parsedV2 = JSON.parse(rawV2) as Partial<CampaignSaveState>;
        const fresh = this.createFreshMultiState();
        fresh.campaigns.Westaria = this.sanitizeCampaignState('Westaria', parsedV2);
        this.state = fresh;
        this.evaluatePersistentBadges();
        this.save();
      }
    } catch {
      // Ignore corrupt storage
    }
  }

  save(): void {
    try {
      this.storage.setItem(STORAGE_KEY_V3, JSON.stringify(this.state));
    } catch {
      // Ignore storage quota errors
    }
  }

  resetAll(): void {
    this.state = this.createFreshMultiState();
    this.save();
  }

  exportSaveCode(): string {
    const dataJson = JSON.stringify(this.state);
    const envelope: SaveTransferEnvelopeV3 = {
      format: 'takeover-save',
      version: 3,
      exportedAt: Date.now(),
      checksum: fnv1aHex(dataJson),
      data: this.state,
    };
    return `${SAVE_TRANSFER_PREFIX}${encodeBase64Url(JSON.stringify(envelope))}`;
  }

  importSaveCode(rawCode: string): SaveImportResult {
    const cleaned = (rawCode ?? '').replace(/\s+/g, '');
    if (!cleaned) {
      return { ok: false, error: 'EMPTY' };
    }
    if (!cleaned.startsWith(SAVE_TRANSFER_PREFIX)) {
      return { ok: false, error: 'INVALID_FORMAT' };
    }

    let parsed: Partial<SaveTransferEnvelopeV3>;
    try {
      const jsonStr = decodeBase64Url(cleaned.slice(SAVE_TRANSFER_PREFIX.length));
      parsed = JSON.parse(jsonStr) as Partial<SaveTransferEnvelopeV3>;
    } catch {
      return { ok: false, error: 'INVALID_FORMAT' };
    }

    if (!parsed || parsed.format !== 'takeover-save' || !parsed.data || typeof parsed.checksum !== 'string') {
      return { ok: false, error: 'INVALID_FORMAT' };
    }
    if (parsed.version !== 3) {
      return { ok: false, error: 'UNSUPPORTED_VERSION' };
    }
    if (fnv1aHex(JSON.stringify(parsed.data)) !== parsed.checksum) {
      return { ok: false, error: 'CHECKSUM_MISMATCH' };
    }

    const fresh = this.createFreshMultiState();
    if (parsed.data.activeCampaign && CAMPAIGN_ORDER.includes(parsed.data.activeCampaign)) {
      fresh.activeCampaign = parsed.data.activeCampaign;
    }
    if (parsed.data.campaigns) {
      for (const cid of CAMPAIGN_ORDER) {
        fresh.campaigns[cid] = this.sanitizeCampaignState(cid, parsed.data.campaigns[cid]);
      }
    }
    if (parsed.data.badges) {
      for (const b of BADGES) {
        if (parsed.data.badges[b.id]) fresh.badges[b.id] = true;
      }
    }

    this.state = fresh;
    this.evaluatePersistentBadges();
    this.save();

    const completedMissions = CAMPAIGN_ORDER.reduce((sum, cid) => sum + this.getCompletedCount(cid), 0);
    return {
      ok: true,
      completedMissions,
      unlockedBadges: this.getUnlockedBadgesCount(),
      activeCampaign: this.state.activeCampaign,
    };
  }

  getActiveCampaign(): PlayableCampaignId {
    return this.state.activeCampaign;
  }

  setActiveCampaign(campaign: PlayableCampaignId): void {
    this.state.activeCampaign = campaign;
    this.save();
  }

  private cState(campaign: PlayableCampaignId = this.state.activeCampaign): CampaignSaveState {
    return this.state.campaigns[campaign];
  }

  get xp(): number {
    return this.cState().xp;
  }

  get selectedLevelId(): number {
    return this.cState().selectedLevelId;
  }

  setSelectedLevelId(id: number): void {
    const campaign = getLevelMetaById(id).campaign;
    if (this.isLevelUnlocked(id)) {
      this.cState(campaign).selectedLevelId = id;
      this.save();
    }
  }

  isFreePlayAll(): boolean {
    return this.freePlayAll;
  }

  toggleFreePlayAll(): boolean {
    this.freePlayAll = !this.freePlayAll;
    return this.freePlayAll;
  }

  getRank(campaign: PlayableCampaignId = this.state.activeCampaign): number {
    const xp = this.cState(campaign).xp;
    let rank = 1;
    for (const threshold of XP_RANK_TABLE) {
      if (xp >= threshold) rank++;
      else break;
    }
    return rank;
  }

  getNextRankXp(campaign: PlayableCampaignId = this.state.activeCampaign): number | null {
    const rank = this.getRank(campaign);
    return XP_RANK_TABLE[rank - 1] ?? null;
  }

  getTotalSkillPoints(campaign: PlayableCampaignId = this.state.activeCampaign): number {
    return Math.min(2 + (this.getRank(campaign) - 1) * SKILL_POINTS_PER_RANK, MAX_SKILL_POINTS);
  }

  getSpentSkillPoints(campaign: PlayableCampaignId = this.state.activeCampaign): number {
    let total = 0;
    const ranks = this.cState(campaign).edictRanks;
    for (const ed of CAMPAIGN_EDICTS[campaign]) {
      total += ranks[ed.id] ?? 0;
    }
    return total;
  }

  getAvailableSkillPoints(campaign: PlayableCampaignId = this.state.activeCampaign): number {
    return Math.max(0, this.getTotalSkillPoints(campaign) - this.getSpentSkillPoints(campaign));
  }

  getEdictRank(id: EdictId, campaign: PlayableCampaignId = this.state.activeCampaign): number {
    return this.cState(campaign).edictRanks[id] ?? 0;
  }

  getEdictRanksCopy(campaign: PlayableCampaignId = this.state.activeCampaign): Partial<Record<EdictId, number>> {
    return { ...this.cState(campaign).edictRanks };
  }

  getBonuses(campaign: PlayableCampaignId = this.state.activeCampaign): CampaignBonuses {
    return computeCampaignBonuses(campaign, this.cState(campaign).edictRanks);
  }

  canUpgradeEdict(id: EdictId, campaign: PlayableCampaignId = this.state.activeCampaign): boolean {
    const valid = CAMPAIGN_EDICTS[campaign].some((e) => e.id === id);
    return valid && this.getEdictRank(id, campaign) < 3 && this.getAvailableSkillPoints(campaign) > 0;
  }

  upgradeEdict(id: EdictId, campaign: PlayableCampaignId = this.state.activeCampaign): boolean {
    if (!this.canUpgradeEdict(id, campaign)) return false;
    this.cState(campaign).edictRanks[id] = this.getEdictRank(id, campaign) + 1;
    this.evaluatePersistentBadges();
    this.save();
    return true;
  }

  resetEdicts(campaign: PlayableCampaignId = this.state.activeCampaign): void {
    this.cState(campaign).edictRanks = createDefaultEdictRanks(campaign);
    this.save();
  }

  getLevelRecord(id: number): LevelCompletionRecord {
    const campaign = getLevelMetaById(id).campaign;
    return this.cState(campaign).levels[id] ?? { completed: false, bestMedal: null, bestTimeSec: null };
  }

  getCompletedCount(campaign: PlayableCampaignId = this.state.activeCampaign): number {
    const cs = this.cState(campaign);
    return getCampaignLevelMetas(campaign).filter((l) => cs.levels[l.id]?.completed).length;
  }

  getGoldCount(campaign: PlayableCampaignId = this.state.activeCampaign): number {
    const cs = this.cState(campaign);
    return getCampaignLevelMetas(campaign).filter((l) => cs.levels[l.id]?.bestMedal === 'Gold').length;
  }

  getMaxUnlockedLevelId(campaign: PlayableCampaignId = this.state.activeCampaign): number {
    const lvls = getCampaignLevelMetas(campaign);
    const cs = this.cState(campaign);
    let highestMissionCompleted = 0;
    for (const lv of lvls) {
      if (cs.levels[lv.id]?.completed) highestMissionCompleted = Math.max(highestMissionCompleted, lv.missionIndex);
    }
    const nextIdx = Math.min(8, highestMissionCompleted + 1);
    return lvls[nextIdx - 1]?.id ?? lvls[0].id;
  }

  isLevelUnlocked(id: number): boolean {
    const lvl = getLevelMetaById(id);
    if (this.freePlayAll) return true;
    const cs = this.cState(lvl.campaign);
    if (cs.levels[id]?.completed) return true;
    return id <= this.getMaxUnlockedLevelId(lvl.campaign);
  }

  /** Computes 1-based Rivadis Map frame (1..27) inside cid=8465 for the active campaign. */
  getRivadisMapFrame(campaign: PlayableCampaignId = this.state.activeCampaign): number {
    const idx = CAMPAIGN_ORDER.indexOf(campaign);
    const completed = this.getCompletedCount(campaign);
    const frame = completed + 1 + idx * 9;
    return Math.max(1, Math.min(27, frame));
  }

  isBadgeUnlocked(id: BadgeId): boolean {
    return Boolean(this.state.badges[id]);
  }

  getUnlockedBadgesCount(): number {
    return BADGES.filter((b) => this.state.badges[b.id]).length;
  }

  private unlockBadge(id: BadgeId, newlyUnlocked: BadgeDef[]): void {
    if (this.state.badges[id]) return;
    this.state.badges[id] = true;
    const def = BADGES_BY_ID[id];
    if (def) newlyUnlocked.push(def);
  }

  private evaluatePersistentBadges(newlyUnlocked: BadgeDef[] = []): void {
    if (this.getCompletedCount('Westaria') >= 8) this.unlockBadge('BADGE_WESTARIA_CAMPAIGN_COMPLETE', newlyUnlocked);
    if (this.getCompletedCount('TheKhaganate') >= 8) this.unlockBadge('BADGE_HORDE_CAMPAIGN_COMPLETE', newlyUnlocked);
    if (this.getCompletedCount('TheCult') >= 8) this.unlockBadge('BADGE_CULT_CAMPAIGN_COMPLETE', newlyUnlocked);

    if (this.getGoldCount('Westaria') >= 8) this.unlockBadge('BADGE_WESTARIA_ALL_PERFECT', newlyUnlocked);
    if (this.getGoldCount('TheKhaganate') >= 8) this.unlockBadge('BADGE_HORDE_ALL_PERFECT', newlyUnlocked);
    if (this.getGoldCount('TheCult') >= 8) this.unlockBadge('BADGE_CULT_ALL_PERFECT', newlyUnlocked);

    const hasAllBase = (c: PlayableCampaignId) =>
      CAMPAIGN_EDICTS[c].every((ed) => (this.cState(c).edictRanks[ed.id] ?? 0) >= 1);
    if (hasAllBase('Westaria')) this.unlockBadge('BADGE_WESTARIA_ALL_BASE_EDICTS', newlyUnlocked);
    if (hasAllBase('TheKhaganate')) this.unlockBadge('BADGE_HORDE_ALL_BASE_EDICTS', newlyUnlocked);
    if (hasAllBase('TheCult')) this.unlockBadge('BADGE_CULT_ALL_BASE_EDICTS', newlyUnlocked);
  }

  recordVictory(
    levelId: number,
    medal: MedalRank,
    elapsedSec: number,
    battleStats?: BattleBadgeStats,
  ): VictoryRewardSummary {
    const lvl = getLevelMetaById(levelId);
    const campaign = lvl.campaign;
    const cs = this.cState(campaign);

    const oldRank = this.getRank(campaign);
    const oldPts = this.getTotalSkillPoints(campaign);
    const prevUnlocked = this.getMaxUnlockedLevelId(campaign);

    const rec = this.getLevelRecord(levelId);
    const oldRankNum = rec.bestMedal ? MEDAL_ORDER[rec.bestMedal] : 0;
    const newRankNum = MEDAL_ORDER[medal];

    const oldMult = rec.bestMedal ? MEDAL_XP_MULT[rec.bestMedal] : 0;
    const newMult = MEDAL_XP_MULT[medal];
    const xpEarned = newMult > oldMult ? Math.round(lvl.xpReward * (newMult - oldMult)) : 0;

    cs.xp += xpEarned;
    rec.completed = true;
    if (newRankNum > oldRankNum) rec.bestMedal = medal;
    if (rec.bestTimeSec === null || elapsedSec < rec.bestTimeSec) {
      rec.bestTimeSec = Math.floor(elapsedSec);
    }
    cs.levels[levelId] = rec;

    const newUnlocked = this.getMaxUnlockedLevelId(campaign);
    if (newUnlocked > prevUnlocked) {
      cs.selectedLevelId = newUnlocked;
    }

    const newlyUnlockedBadges: BadgeDef[] = [];
    this.evaluatePersistentBadges(newlyUnlockedBadges);
    if (medal === 'Gold') this.unlockBadge('BADGE_ANY_MISSION_PERFECT', newlyUnlockedBadges);
    if (battleStats) {
      if (battleStats.maxVillagesOwned >= 7) this.unlockBadge('BADGE_VILLAGES_OWNED', newlyUnlockedBadges);
      if (battleStats.maxMinesOwned >= 7) this.unlockBadge('BADGE_MINES_OWNED', newlyUnlockedBadges);
      if (battleStats.maxObelisksOwned >= 7) this.unlockBadge('BADGE_OBELISKS_OWNED', newlyUnlockedBadges);
      if (battleStats.squadsPurchased >= 10) this.unlockBadge('BADGE_SQUADS_PURCHASED', newlyUnlockedBadges);
      if (battleStats.bannersSet >= 5) this.unlockBadge('BADGE_BANNERS_SET', newlyUnlockedBadges);
      if (battleStats.ultimatesUsed >= 5) this.unlockBadge('BADGE_ULTIMATES_USED', newlyUnlockedBadges);
      if (battleStats.chestsOpened >= 1) this.unlockBadge('BADGE_CHESTS_OPENED', newlyUnlockedBadges);
      if (battleStats.enemySquadsDestroyed >= 30) this.unlockBadge('BADGE_ENEMY_SQUADS_DESTROYED', newlyUnlockedBadges);
      if (battleStats.heroicEngagedCount >= 20) this.unlockBadge('BADGE_HEROIC_MODE_ENGAGED', newlyUnlockedBadges);
      if (battleStats.goldCollected >= 3000) this.unlockBadge('BADGE_GOLD_COLLECTED', newlyUnlockedBadges);
      if (battleStats.maxSquadsOwned >= 20) this.unlockBadge('BADGE_SQUADS_OWNED', newlyUnlockedBadges);
      if (battleStats.strongholdsSeized >= 10) this.unlockBadge('BADGE_STRONGHOLDS_SIEZED', newlyUnlockedBadges);
    }

    this.save();
    const newRank = this.getRank(campaign);
    const newPts = this.getTotalSkillPoints(campaign);
    return {
      xpEarned,
      oldRank,
      newRank,
      skillPointsGained: Math.max(0, newPts - oldPts),
      unlockedLevelId: newUnlocked > prevUnlocked ? newUnlocked : null,
      newlyUnlockedBadges,
    };
  }
}
