import { CampaignBonuses, FactionId, SquadStateModel, StrongholdState, UnitDefinition } from '../data/Types';

export function countAliveUnits(squad: SquadStateModel): number {
  let n = 0;
  for (const m of squad.members) {
    if (m.alive) n++;
  }
  return n;
}

export function getSquadTotalHp(squad: SquadStateModel): { hp: number; maxHp: number } {
  let hp = 0;
  let maxHp = 0;
  for (const m of squad.members) {
    maxHp += m.maxHp;
    if (m.alive) hp += Math.max(0, m.hp);
  }
  return { hp, maxHp };
}

export function getAbilityValue(abilities: string[], prefix: string): number {
  for (const ab of abilities) {
    if (ab === prefix) return 1;
    if (ab.startsWith(prefix + ' ')) {
      const val = Number(ab.slice(prefix.length + 1));
      return Number.isFinite(val) ? val : 0;
    }
  }
  return 0;
}

export function hasAbility(abilities: string[], prefix: string): boolean {
  return getAbilityValue(abilities, prefix) > 0 || abilities.includes(prefix);
}

/**
 * Computes strike damage incorporating Heroism (1.5x), Bloodlust (1.35x),
 * Frost Enchantment (max dmg + -25% incoming), Fear (-35%), Veterancy (+10%/lvl),
 * Cavalry Charge (2x/2.5x/3x), Mechanism Crit (Cult), LongSpear, and ShieldWall.
 */
export function computeSquadStrikeDamage(
  attacker: SquadStateModel,
  attackerDef: UnitDefinition,
  defenderDef: UnitDefinition,
  isCloseMelee: boolean,
  rng: () => number,
  bonuses?: CampaignBonuses,
  playerFaction: FactionId = 'Westaria',
  defender?: SquadStateModel,
): number {
  const alive = countAliveUnits(attacker);
  if (alive <= 0) return 0;

  let total = 0;
  const maxRoll = attacker.frostEnchantTimer > 0;
  for (let i = 0; i < alive; i++) {
    const roll = maxRoll
      ? attackerDef.dmgMax
      : attackerDef.dmgMin + Math.floor(rng() * (attackerDef.dmgMax - attackerDef.dmgMin + 1));
    total += roll;
  }

  if (isCloseMelee && attackerDef.range > 0 && attackerDef.meleePenaltyPct > 0) {
    total = Math.max(1, Math.round((total * (100 - attackerDef.meleePenaltyPct)) / 100));
  }

  // Player Ranged/Siege Edict bonus (Westaria)
  if (
    bonuses &&
    attacker.owner === playerFaction &&
    (attackerDef.unitClass === 'Archers' || attackerDef.unitClass === 'Siege')
  ) {
    total = Math.round(total * bonuses.rangedSiegeDamageMul);
  }

  // Veterancy bonus (+10% per vetLevel)
  if (attacker.vetLevel > 0) {
    total = Math.round(total * (1 + 0.1 * attacker.vetLevel));
  }

  // Cult Mechanism crit chance (2x)
  if (
    bonuses &&
    attacker.owner === playerFaction &&
    bonuses.mechanismCritPct > 0 &&
    hasAbility(attackerDef.abilities, 'Mechanism') &&
    rng() * 100 < bonuses.mechanismCritPct
  ) {
    total = Math.round(total * 2.0);
  }

  // Heroic (+50%), Bloodlust (+35%), Fear (-35%)
  if (attacker.heroicTimer > 0) {
    total = Math.round(total * 1.5);
  }
  if (attacker.bloodlustTimer > 0) {
    total = Math.round(total * 1.35);
  }
  if (attacker.fearTimer > 0) {
    total = Math.max(1, Math.round(total * 0.65));
  }

  // Cavalry first-strike Charge bonus
  if (attacker.chargeReady && hasAbility(attackerDef.abilities, 'Charge')) {
    const baseCharge = getAbilityValue(attackerDef.abilities, 'Charge') || 2;
    const chargeMul = attacker.owner === playerFaction && bonuses ? bonuses.cavalryChargeMul : baseCharge;
    total = Math.round(total * chargeMul);
  }

  // LongSpear bonus vs Cavalry
  const longSpearPct = getAbilityValue(attackerDef.abilities, 'LongSpear');
  if (longSpearPct > 0 && defenderDef.unitClass === 'Cavalry') {
    total = Math.round(total * ((100 + longSpearPct) / 100));
  }

  // Defender ShieldWall mitigation
  const shieldWallPct = getAbilityValue(defenderDef.abilities, 'ShieldWall');
  if (shieldWallPct > 0) {
    total = Math.max(1, Math.round((total * (100 - shieldWallPct)) / 100));
  }

  // Defender Frost Enchantment (-25% damage taken)
  if (defender && defender.frostEnchantTimer > 0) {
    total = Math.max(1, Math.round(total * 0.75));
  }

  return Math.max(1, total);
}

/**
 * Computes stronghold siege damage matching `§_-3q§.getDamageForFortress()`:
 * `ceil(totalUnitDamage * (100 + SiegeWeapon) / 100)` plus Heroic, Bloodlust, Khaganate vs-Stronghold bonus, & Ranged/Siege bonuses.
 */
export function computeFortressDamage(
  attacker: SquadStateModel,
  attackerDef: UnitDefinition,
  _target: StrongholdState,
  rng: () => number,
  bonuses?: CampaignBonuses,
  playerFaction: FactionId = 'Westaria',
): number {
  const alive = countAliveUnits(attacker);
  if (alive <= 0) return 0;

  let total = 0;
  const maxRoll = attacker.frostEnchantTimer > 0;
  for (let i = 0; i < alive; i++) {
    const roll = maxRoll
      ? attackerDef.dmgMax
      : attackerDef.dmgMin + Math.floor(rng() * (attackerDef.dmgMax - attackerDef.dmgMin + 1));
    total += roll;
  }

  if (
    bonuses &&
    attacker.owner === playerFaction &&
    (attackerDef.unitClass === 'Archers' || attackerDef.unitClass === 'Siege')
  ) {
    total = Math.round(total * bonuses.rangedSiegeDamageMul);
  }

  if (attacker.vetLevel > 0) {
    total = Math.round(total * (1 + 0.1 * attacker.vetLevel));
  }

  if (attacker.heroicTimer > 0) {
    total = Math.round(total * 1.5);
  }
  if (attacker.bloodlustTimer > 0) {
    total = Math.round(total * 1.35);
  }
  if (attacker.owner === playerFaction && bonuses && bonuses.strongholdDamageMul > 1) {
    total = Math.round(total * bonuses.strongholdDamageMul);
  }

  const siegeBonus = getAbilityValue(attackerDef.abilities, 'SiegeWeapon');
  return Math.max(1, Math.ceil(total * ((100 + siegeBonus) / 100)));
}

export function applyDamageToSquad(target: SquadStateModel, damage: number): number {
  let remaining = Math.max(0, Math.round(damage));
  let killed = 0;
  for (const m of target.members) {
    if (!m.alive || remaining <= 0) continue;
    if (remaining >= m.hp) {
      remaining -= m.hp;
      m.hp = 0;
      m.alive = false;
      killed++;
    } else {
      m.hp -= remaining;
      remaining = 0;
    }
  }
  return killed;
}

export function healAndResurrectSquad(target: SquadStateModel, def: UnitDefinition, healPoints: number): number {
  if (target.state === 'Dead' || healPoints <= 0) return 0;
  if (hasAbility(def.abilities, 'Mechanism')) return 0;

  let healedTotal = 0;
  let budget = Math.round(healPoints * Math.max(1, countAliveUnits(target)));

  for (const m of target.members) {
    if (!m.alive || m.hp >= m.maxHp || budget <= 0) continue;
    const gain = Math.min(healPoints, m.maxHp - m.hp, budget);
    m.hp += gain;
    budget -= gain;
    healedTotal += gain;
  }

  if (budget > 0) {
    for (const m of target.members) {
      if (m.alive) continue;
      m.alive = true;
      m.hp = Math.min(m.maxHp, Math.max(healPoints, Math.round(m.maxHp * 0.4)));
      healedTotal += m.hp;
      break;
    }
  }
  return healedTotal;
}

export function computeLordsJudgementDamage(
  memberMaxHp: number,
  judgementMul: number,
  rng: () => number,
): number {
  const pct = 30 + rng() * 30;
  return Math.max(1, Math.ceil((pct * judgementMul * memberMaxHp) / 100));
}
