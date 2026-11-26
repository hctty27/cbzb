import { dist, flashToSim, simToFlash } from '../core/CoordTransform';
import { FactionId, SquadStateModel, StrongholdState, UnitDefinition } from '../data/Types';
import { UNIT_DEFS } from '../data/UnitsData';
import {
  applyDamageToSquad,
  computeFortressDamage,
  computeSquadStrikeDamage,
  countAliveUnits,
  getAbilityValue,
  hasAbility,
} from './CombatMath';
import type { BattleSimContext } from './SimContext';

export const MELEE_ENGAGE_FLASH_DIST = 44;
export const FORTRESS_ENGAGE_FLASH_DIST = 48;
export const REPAIR_PER_HALF_SEC = 5;
export const OGRE_AGGRO_DIST = 85;
export const CHEST_PICKUP_DIST = 38;

function updateFacing(sq: SquadStateModel, dx: number, dy: number): void {
  if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) return;
  if (Math.abs(dx) >= Math.abs(dy)) {
    sq.facing = dx >= 0 ? 'right' : 'left';
  } else {
    sq.facing = dy >= 0 ? 'down' : 'up';
  }
}

function getEffectiveMoveSpeed(ctx: BattleSimContext, sq: SquadStateModel, def: UnitDefinition): number {
  let spd = def.speed;
  if (sq.owner === ctx.playerFaction) {
    spd *= ctx.bonuses.moveSpeedMul;
    if (def.unitClass === 'Siege') {
      spd *= ctx.bonuses.siegeSpeedMul;
    }
  }
  return spd;
}

function moveTowards(sq: SquadStateModel, targetFlashX: number, targetFlashY: number, speed: number, dt: number): boolean {
  const targetSim = flashToSim(targetFlashX, targetFlashY);
  const dx = targetSim.x - sq.simX;
  const dy = targetSim.y - sq.simY;
  const d = Math.hypot(dx, dy);
  updateFacing(sq, dx, targetFlashY - sq.flashY);

  const stepDist = speed * dt;
  if (d <= stepDist || d < 0.5) {
    sq.simX = targetSim.x;
    sq.simY = targetSim.y;
    sq.flashX = targetFlashX;
    sq.flashY = targetFlashY;
    return true;
  }

  const nx = dx / d;
  const ny = dy / d;
  sq.simX += nx * stepDist;
  sq.simY += ny * stepDist;
  const fl = simToFlash(sq.simX, sq.simY);
  sq.flashX = fl.x;
  sq.flashY = fl.y;
  return false;
}

function findNearestEnemySquad(ctx: BattleSimContext, sq: SquadStateModel, maxFlashRange: number): SquadStateModel | null {
  let best: SquadStateModel | null = null;
  let bestD = maxFlashRange;
  for (const other of ctx.squads) {
    if (other.owner === sq.owner || other.state === 'Dead' || countAliveUnits(other) <= 0) continue;
    const d = dist(sq.flashX, sq.flashY, other.flashX, other.flashY);
    if (d <= bestD) {
      bestD = d;
      best = other;
    }
  }
  return best;
}

function findNearestEnemyStronghold(ctx: BattleSimContext, sq: SquadStateModel, maxFlashRange: number): StrongholdState | null {
  let best: StrongholdState | null = null;
  let bestD = maxFlashRange;
  for (const sh of ctx.strongholds) {
    if (sh.owner === sq.owner) continue;
    const d = dist(sq.flashX, sq.flashY, sh.flashX, sh.flashY);
    if (d <= bestD) {
      bestD = d;
      best = sh;
    }
  }
  return best;
}

function applyOnHitEffects(
  ctx: BattleSimContext,
  attacker: SquadStateModel,
  attackerDef: UnitDefinition,
  target: SquadStateModel,
): void {
  if (target.state === 'Dead' || target.liberationTimer > 0) return;
  const targetDef = UNIT_DEFS[target.defId];

  // Poisonous (Khaganate Hunters / Serpent Archers / Poison Catapult)
  const poisonVal = getAbilityValue(attackerDef.abilities, 'Poisonous');
  if (poisonVal > 0 && !hasAbility(targetDef.abilities, 'PoisonImmunity') && !hasAbility(targetDef.abilities, 'Mechanism')) {
    const bonus = attacker.owner === ctx.playerFaction ? ctx.bonuses.poisonBonusDamage : 0;
    target.poisonTimer = 4.0;
    target.poisonDps = Math.max(target.poisonDps, poisonVal + bonus);
  }

  // Freeze on attack (Cult Acolytes FreezeArrow, Wizards FreezeBlast, or Rebel Army infantry freeze edict)
  let freezePct = Math.max(
    getAbilityValue(attackerDef.abilities, 'FreezeArrow'),
    getAbilityValue(attackerDef.abilities, 'FreezeBlast'),
  );
  if (
    attacker.owner === ctx.playerFaction &&
    attackerDef.unitClass === 'Infantry' &&
    ctx.bonuses.infantryFreezeChancePct > 0
  ) {
    freezePct = Math.max(freezePct, ctx.bonuses.infantryFreezeChancePct);
  }
  if (freezePct > 0 && !hasAbility(targetDef.abilities, 'Mechanism') && ctx.rng() * 100 < freezePct) {
    target.frozenTimer = Math.max(target.frozenTimer, 2.0);
  }
}

/** Applies once-per-second Poison DoT and Giantbot regeneration across live squads. */
export function tickStatusEffectsOneSecond(ctx: BattleSimContext): void {
  const pFaction = ctx.playerFaction;
  for (const sq of ctx.squads) {
    if (sq.state === 'Dead') continue;
    // Poison DoT
    if (sq.poisonTimer > 0 && sq.poisonDps > 0 && sq.liberationTimer <= 0) {
      const dmg = Math.max(1, Math.round(sq.poisonDps * countAliveUnits(sq)));
      const slain = applyDamageToSquad(sq, dmg);
      if (slain > 0 && countAliveUnits(sq) <= 0) {
        // Credit whichever hostile faction isn't the victim
        const killer: FactionId = sq.owner === pFaction ? ctx.levelDef.enemies[0] ?? 'TheEmpire' : pFaction;
        ctx.handleSquadDestroyed(killer, sq);
        continue;
      }
    }
    // Giantbots HP regeneration (Cult Giant Construction edict)
    if (sq.owner === pFaction && sq.defId === 'b_giantbots' && ctx.bonuses.giantbotRegenPctPerSec > 0) {
      for (const m of sq.members) {
        if (!m.alive || m.hp >= m.maxHp) continue;
        const gain = Math.max(1, Math.round((m.maxHp * ctx.bonuses.giantbotRegenPctPerSec) / 100));
        m.hp = Math.min(m.maxHp, m.hp + gain);
      }
    }
  }
}

/** Checks whether any non-bandit squad walks onto an uncollected gold chest. */
export function checkChestPickups(ctx: BattleSimContext): void {
  for (const ch of ctx.chests) {
    if (ch.collected) continue;
    const collector = ctx.squads.find(
      (sq) =>
        sq.owner !== 'Bandits' &&
        sq.state !== 'Dead' &&
        dist(sq.flashX, sq.flashY, ch.flashX, ch.flashY) <= CHEST_PICKUP_DIST,
    );
    if (collector) {
      ch.collected = true;
      ctx.combatants[collector.owner].gold += ch.gold;
      if (collector.owner === ctx.playerFaction) {
        ctx.battleStats.chestsOpened += 1;
        ctx.battleStats.goldCollected += ch.gold;
      }
      ctx.emitEvent({
        type: 'chest_collected',
        faction: collector.owner,
        squadId: collector.id,
        nodeId: ch.id,
        goldAmount: ch.gold,
        flashX: ch.flashX,
        flashY: ch.flashY,
      });
    }
  }
}

/** Advances a single squad for one simulation tick: combat, siege, movement, or repair. */
export function updateSquad(ctx: BattleSimContext, sq: SquadStateModel, dt: number): void {
  if (countAliveUnits(sq) <= 0) {
    sq.state = 'Dead';
    return;
  }

  // Frozen squads cannot move or attack
  if (sq.frozenTimer > 0) {
    sq.state = 'Stand';
    sq.animPhase = 'go';
    return;
  }

  const def = UNIT_DEFS[sq.defId];
  const moveSpeed = getEffectiveMoveSpeed(ctx, sq, def);
  if (sq.attackTimer > 0) sq.attackTimer = Math.max(0, sq.attackTimer - dt);

  // 1. Check nearby enemy squad engagement
  const aggro = sq.owner === 'Bandits' ? OGRE_AGGRO_DIST : Math.max(MELEE_ENGAGE_FLASH_DIST, def.range);
  const enemySquad = findNearestEnemySquad(ctx, sq, aggro);
  if (enemySquad) {
    sq.state = 'Fight';
    sq.animPhase = 'attack';
    const dx = enemySquad.flashX - sq.flashX;
    const dy = enemySquad.flashY - sq.flashY;
    updateFacing(sq, dx, dy);

    const d = dist(sq.flashX, sq.flashY, enemySquad.flashX, enemySquad.flashY);
    if (def.range === 0 && d > 28) {
      moveTowards(sq, enemySquad.flashX, enemySquad.flashY, moveSpeed, dt);
    } else if (sq.attackTimer <= 0) {
      sq.attackTimer = def.attackPeriodSec;
      const enemyDef = UNIT_DEFS[enemySquad.defId];
      const dmg = computeSquadStrikeDamage(
        sq,
        def,
        enemyDef,
        d <= MELEE_ENGAGE_FLASH_DIST,
        () => ctx.rng(),
        ctx.bonuses,
        ctx.playerFaction,
        enemySquad,
      );
      if (sq.chargeReady && d <= MELEE_ENGAGE_FLASH_DIST) {
        sq.chargeReady = false;
      }
      const slain = applyDamageToSquad(enemySquad, dmg);
      applyOnHitEffects(ctx, sq, def, enemySquad);
      ctx.emitEvent({
        type: 'attack_hit',
        faction: sq.owner,
        squadId: sq.id,
        flashX: enemySquad.flashX,
        flashY: enemySquad.flashY,
        unitClass: def.unitClass,
      });
      if (slain > 0) {
        ctx.awardSquadXp(sq, slain * 3);
        if (countAliveUnits(enemySquad) <= 0) {
          ctx.handleSquadDestroyed(sq.owner, enemySquad);
          ctx.awardSquadXp(sq, 20);
        }
      }

      // SplashDamage support (Trebuchet / Poison Catapult / Ogre / Avatar)
      const splashPct = getAbilityValue(def.abilities, 'SplashDamage');
      if (splashPct > 0) {
        const splashDmg = Math.max(1, Math.round((dmg * splashPct) / 100));
        for (const extra of ctx.squads) {
          if (extra.id === enemySquad.id || extra.owner === sq.owner || extra.state === 'Dead') continue;
          if (dist(extra.flashX, extra.flashY, enemySquad.flashX, enemySquad.flashY) <= 44) {
            const sSlain = applyDamageToSquad(extra, splashDmg);
            applyOnHitEffects(ctx, sq, def, extra);
            if (sSlain > 0 && countAliveUnits(extra) <= 0) {
              ctx.handleSquadDestroyed(sq.owner, extra);
            }
          }
        }
      }
    }
    return;
  }

  // Bandit Ogre returns to guard post if unengaged
  if (sq.owner === 'Bandits' && sq.guardHomeFlash) {
    if (dist(sq.flashX, sq.flashY, sq.guardHomeFlash.x, sq.guardHomeFlash.y) > 12) {
      sq.state = 'Move';
      sq.animPhase = 'go';
      moveTowards(sq, sq.guardHomeFlash.x, sq.guardHomeFlash.y, moveSpeed, dt);
      return;
    }
  }

  // 2. Check enemy stronghold siege engagement (Bandits never besiege strongholds)
  if (sq.owner !== 'Bandits') {
    const enemyFortRange = Math.max(FORTRESS_ENGAGE_FLASH_DIST, def.range);
    const enemyFort = findNearestEnemyStronghold(ctx, sq, enemyFortRange);
    if (enemyFort) {
      sq.state = 'Fight';
      sq.animPhase = 'attack';
      updateFacing(sq, enemyFort.flashX - sq.flashX, enemyFort.flashY - sq.flashY);
      if (sq.attackTimer <= 0) {
        sq.attackTimer = def.attackPeriodSec;
        const dmg = computeFortressDamage(sq, def, enemyFort, () => ctx.rng(), ctx.bonuses, ctx.playerFaction);
        enemyFort.hp = Math.max(0, enemyFort.hp - dmg);
        ctx.emitEvent({
          type: 'attack_hit',
          faction: sq.owner,
          squadId: sq.id,
          nodeId: enemyFort.id,
          flashX: enemyFort.flashX,
          flashY: enemyFort.flashY,
          unitClass: def.unitClass,
        });
        if (enemyFort.hp <= 0) {
          ctx.captureStronghold(sq.owner, enemyFort);
          ctx.awardSquadXp(sq, 60);
          sq.targetNodeId = enemyFort.id;
          sq.pathFlash = [];
          sq.state = 'Stand';
          sq.animPhase = 'go';
        }
      }
      return;
    }
  }

  // 3. Follow movement path if ordered
  if (sq.pathFlash.length > 0) {
    sq.state = 'Move';
    sq.animPhase = 'go';
    const wp = sq.pathFlash[0];
    const arrived = moveTowards(sq, wp.x, wp.y, moveSpeed, dt);
    if (arrived) {
      sq.pathFlash.shift();
      if (sq.pathFlash.length === 0) {
        sq.state = 'Stand';
        sq.targetSquadId = null;
      }
    }
    return;
  }

  // 4. Repair damaged friendly stronghold nearby
  if (sq.owner !== 'Bandits') {
    const nearFriendly = ctx.strongholds.find(
      (sh) => sh.owner === sq.owner && dist(sh.flashX, sh.flashY, sq.flashX, sq.flashY) <= 52,
    );
    if (nearFriendly && nearFriendly.hp < nearFriendly.maxHp) {
      sq.state = 'Repair';
      sq.animPhase = 'go';
      sq.repairTimer += dt;
      while (sq.repairTimer >= 0.5) {
        sq.repairTimer -= 0.5;
        nearFriendly.hp = Math.min(nearFriendly.maxHp, nearFriendly.hp + REPAIR_PER_HALF_SEC);
      }
      return;
    }
  }

  sq.state = 'Stand';
  sq.animPhase = 'go';
}
