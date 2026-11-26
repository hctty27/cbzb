import {
  ActiveBannerState,
  BattleBadgeStats,
  BuildSiteState,
  CampaignBonuses,
  ChestState,
  CombatantState,
  FactionId,
  LevelDef,
  PlayableCampaignId,
  SimEventPayload,
  SpellId,
  SquadStateModel,
  StrongholdState,
} from '../data/Types';
import type { AiController } from './AiController';
import type { BattleSim } from './BattleSim';

export const ALL_FACTIONS: FactionId[] = ['Westaria', 'TheEmpire', 'TheKhaganate', 'TheCult', 'Bandits'];
export const CHEST_GOLD_REWARD = 500;
export const BASE_ULTIMATE_MAX = 200;
export const XP_LEVEL_THRESHOLDS = [100, 250, 450];

export interface SpawnSquadOptions {
  lifetimeSec?: number | null;
  isAvatar?: boolean;
  isSummoned?: boolean;
  guardHomeFlash?: { x: number; y: number };
  upkeepOverride?: number;
}

/** Precomputed local squad formation offsets matching Flash squad member counts. */
export function createMemberOffsets(count: number): Array<{ x: number; y: number }> {
  if (count === 1) return [{ x: 0, y: 0 }];
  if (count === 3) {
    return [
      { x: -10, y: -3 },
      { x: 10, y: -3 },
      { x: 0, y: 6 },
    ];
  }
  if (count === 5) {
    return [
      { x: -12, y: -6 },
      { x: 12, y: -6 },
      { x: 0, y: 0 },
      { x: -10, y: 8 },
      { x: 10, y: 8 },
    ];
  }
  if (count === 6) {
    return [
      { x: -12, y: -5 },
      { x: 0, y: -5 },
      { x: 12, y: -5 },
      { x: -12, y: 5 },
      { x: 0, y: 5 },
      { x: 12, y: 5 },
    ];
  }
  if (count === 7) {
    return [
      { x: -12, y: -6 },
      { x: 0, y: -6 },
      { x: 12, y: -6 },
      { x: -14, y: 2 },
      { x: 0, y: 2 },
      { x: 14, y: 2 },
      { x: 0, y: 9 },
    ];
  }
  if (count >= 10) {
    const pts: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < count; i++) {
      const col = (i % 4) - 1.5;
      const row = Math.floor(i / 4) - 1;
      pts.push({ x: col * 9, y: row * 7 });
    }
    return pts;
  }
  const pts: Array<{ x: number; y: number }> = [];
  for (let r = -1; r <= 1; r++) {
    for (let c = -1; c <= 1; c++) {
      pts.push({ x: c * 11, y: r * 7 });
    }
  }
  return pts;
}

/**
 * Shared simulation context consumed by SpellResolver and SquadSystem without
 * introducing runtime circular dependencies with BattleSim.
 */
export interface BattleSimContext {
  readonly sim: BattleSim;
  readonly levelDef: LevelDef;
  readonly bonuses: CampaignBonuses;
  readonly playerFaction: PlayableCampaignId;
  readonly isMatchOver: boolean;
  strongholds: StrongholdState[];
  buildSites: BuildSiteState[];
  chests: ChestState[];
  squads: SquadStateModel[];
  activeBanners: ActiveBannerState[];
  combatants: Record<FactionId, CombatantState>;
  battleStats: BattleBadgeStats;
  readonly ai: AiController;
  rng(): number;
  allocateBannerId(): number;
  emitEvent(payload: SimEventPayload): void;
  getEffectiveSpellCost(faction: FactionId, spellId: SpellId): number;
  spawnAtFlash(
    defId: string,
    owner: FactionId,
    fx: number,
    fy: number,
    garrisonNodeId: string | null,
    opts?: SpawnSquadOptions,
  ): SquadStateModel | null;
  handleSquadDestroyed(killer: FactionId, victim: SquadStateModel): void;
  captureStronghold(newOwner: FactionId, sh: StrongholdState): void;
  awardSquadXp(sq: SquadStateModel, amount: number): void;
}
