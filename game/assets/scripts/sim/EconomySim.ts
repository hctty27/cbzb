import { STRONGHOLD_STATS, SUPPLY_STATS } from '../data/BuildingsData';
import {
  BuildSiteState,
  CombatantState,
  FactionId,
  SquadStateModel,
  StrongholdState,
} from '../data/Types';

export const MAX_MANA = 500;

/**
 * Computes gold decay formula directly from `§_-k0§.getGoldSpeed()`:
 * If upkeepSquads == 0 -> grossGold.
 * Else taxPct = 30 + 5 * (min(upkeepSquads, 10) - 1), net = round(max(grossGold * (100 - taxPct)/100, 1)).
 */
export function computeNetGoldSpeed(grossGold: number, upkeepSquads: number): number {
  if (grossGold <= 0) return 0;
  if (upkeepSquads <= 0) return grossGold;
  const k = Math.min(upkeepSquads, 10) - 1;
  const taxPct = 30 + k * 5;
  const mult = (100 - taxPct) / 100;
  return Math.round(Math.max(grossGold * mult, 1));
}

export function recalculateEconomy(
  combatant: CombatantState,
  strongholds: StrongholdState[],
  buildSites: BuildSiteState[],
  squads: SquadStateModel[],
  magicTowerExtraBonus = 0,
): void {
  const faction: FactionId = combatant.faction;
  if (faction === 'Bandits') return;

  let grossGold = 0;
  let manaRate = 0;
  let totalSupply = 0;
  let magicTowerCount = 0;

  for (const sh of strongholds) {
    if (sh.owner !== faction) continue;
    const stats = STRONGHOLD_STATS[sh.kind];
    grossGold += stats.goldIncome;
    manaRate += stats.manaIncome;
    totalSupply += stats.foodSupply + sh.bonusSupply;
    if (sh.kind === 'MagicTower') {
      magicTowerCount++;
      if (magicTowerExtraBonus > 0) {
        grossGold += magicTowerExtraBonus;
        manaRate += magicTowerExtraBonus;
        totalSupply += magicTowerExtraBonus;
      }
    }
  }

  for (const bs of buildSites) {
    if (bs.owner !== faction || bs.supplyKind === 'Empty') continue;
    const stats = SUPPLY_STATS[bs.supplyKind];
    grossGold += stats.goldIncome;
    manaRate += stats.manaIncome;
    totalSupply += stats.foodSupply;
  }

  let usedSupply = 0;
  let upkeepSquads = 0;
  for (const sq of squads) {
    if (sq.owner !== faction || sq.state === 'Dead') continue;
    usedSupply += sq.upkeep;
    if (sq.upkeep > 0) upkeepSquads++;
  }

  combatant.grossGoldPerSec = grossGold;
  combatant.netGoldPerSec = computeNetGoldSpeed(grossGold, upkeepSquads);
  combatant.manaPerSec = manaRate;
  combatant.totalSupply = totalSupply;
  combatant.usedSupply = usedSupply;
  combatant.upkeepSquads = upkeepSquads;
  combatant.magicTowerCount = magicTowerCount;
}

export function applyOneSecondEconomyTick(combatant: CombatantState): void {
  if (combatant.faction === 'Bandits') return;
  combatant.gold += combatant.netGoldPerSec;
  combatant.mana = Math.min(MAX_MANA, combatant.mana + combatant.manaPerSec);
  if (combatant.magicTowerCount > 0 && combatant.ultimateCharge < combatant.ultimateMax) {
    combatant.ultimateCharge = Math.min(
      combatant.ultimateMax,
      combatant.ultimateCharge + combatant.magicTowerCount,
    );
  }
}
