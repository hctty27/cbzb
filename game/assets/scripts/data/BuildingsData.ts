import { StrongholdKind, StrongholdStats, SupplyKind, SupplyStats } from './Types';

export const STRONGHOLD_STATS: Record<StrongholdKind, StrongholdStats> = {
  Town: {
    kind: 'Town',
    name: 'Town',
    baseHp: 500,
    goldIncome: 2,
    manaIncome: 0,
    foodSupply: 1,
    allowedSupply: ['Village', 'Mine'],
  },
  Castle: {
    kind: 'Castle',
    name: 'Castle',
    baseHp: 1000,
    goldIncome: 3,
    manaIncome: 1,
    foodSupply: 2,
    allowedSupply: ['Village', 'Mine', 'Obelisk'],
  },
  Camp: {
    kind: 'Camp',
    name: 'Camp',
    baseHp: 500,
    goldIncome: 1,
    manaIncome: 0,
    foodSupply: 0,
    allowedSupply: ['Village', 'Mine'],
  },
  MagicTower: {
    kind: 'MagicTower',
    name: 'Magic Tower',
    baseHp: 500,
    goldIncome: 1,
    manaIncome: 2,
    foodSupply: 1,
    allowedSupply: ['Village', 'Obelisk'],
  },
};

export const SUPPLY_STATS: Record<Exclude<SupplyKind, 'Empty'>, SupplyStats> = {
  Village: {
    kind: 'Village',
    nameWestaria: 'Farm',
    nameEmpire: 'Graveyard',
    cost: 150,
    goldIncome: 0,
    manaIncome: 0,
    foodSupply: 1,
  },
  Mine: {
    kind: 'Mine',
    nameWestaria: 'Mine',
    nameEmpire: 'Mine',
    cost: 150,
    goldIncome: 2,
    manaIncome: 0,
    foodSupply: 0,
  },
  Obelisk: {
    kind: 'Obelisk',
    nameWestaria: 'Obelisk',
    nameEmpire: 'Obelisk',
    cost: 150,
    goldIncome: 0,
    manaIncome: 1,
    foodSupply: 0,
  },
};

export const STRONGHOLD_UPGRADE_COSTS: Record<number, number> = {
  0: 350,
  1: 500,
};

export const MAX_STRONGHOLD_LEVEL = 2;

export function getStrongholdMaxHp(kind: StrongholdKind, level: number): number {
  const base = STRONGHOLD_STATS[kind].baseHp;
  return Math.round(base + base * level * 0.5);
}
