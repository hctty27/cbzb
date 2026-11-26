import { dist } from '../core/CoordTransform';
import { ALL_SPELLS, FACTION_SPELL_ORDER } from '../data/SpellsData';
import { ActiveBannerState, BannerSpellId, FactionId, SpellId } from '../data/Types';
import { UNIT_DEFS } from '../data/UnitsData';
import {
  applyDamageToSquad,
  computeLordsJudgementDamage,
  countAliveUnits,
  hasAbility,
  healAndResurrectSquad,
} from './CombatMath';
import { MAX_MANA } from './EconomySim';
import type { BattleSimContext } from './SimContext';

const BANNER_TICK_SEC = 0.5;

/** Checks whether a faction can currently cast the given spell or ultimate. */
export function canCastSpell(ctx: BattleSimContext, faction: FactionId, spellId: SpellId): boolean {
  if (ctx.isMatchOver || faction === 'Bandits') return false;
  const def = ALL_SPELLS[spellId];
  if (!def || def.faction !== faction) return false;
  if (faction === ctx.playerFaction && !ctx.bonuses.unlockedSpells.includes(spellId)) return false;
  if (faction !== ctx.playerFaction && !FACTION_SPELL_ORDER[faction].includes(spellId)) return false;
  const comb = ctx.combatants[faction];
  if (def.kind === 'ultimate') {
    return comb.ultimateCharge >= comb.ultimateMax;
  }
  return comb.mana >= ctx.getEffectiveSpellCost(faction, spellId);
}

/** Executes instant spells, banners, and faction ultimates at the target Flash coordinate. */
export function castSpell(
  ctx: BattleSimContext,
  faction: FactionId,
  spellId: SpellId,
  flashX: number,
  flashY: number,
): boolean {
  if (!canCastSpell(ctx, faction, spellId)) return false;
  const comb = ctx.combatants[faction];
  const def = ALL_SPELLS[spellId];
  const isPlayer = faction === ctx.playerFaction;
  const manaCost = ctx.getEffectiveSpellCost(faction, spellId);

  // 1. Instant / Offensive Spells
  if (spellId === 'lords_judgement') {
    comb.mana -= manaCost;
    const rad = def.radius + 16;
    const mul = isPlayer ? ctx.bonuses.lordsJudgementMul : 1.0;
    for (const sq of ctx.squads) {
      if (sq.owner === faction || sq.state === 'Dead' || sq.liberationTimer > 0) continue;
      if (dist(sq.flashX, sq.flashY, flashX, flashY) <= rad) {
        for (const m of sq.members) {
          if (!m.alive) continue;
          const dmg = computeLordsJudgementDamage(m.maxHp, mul, () => ctx.rng());
          if (dmg >= m.hp) {
            m.hp = 0;
            m.alive = false;
          } else {
            m.hp -= dmg;
          }
        }
        if (countAliveUnits(sq) <= 0) ctx.handleSquadDestroyed(faction, sq);
      }
    }
    ctx.emitEvent({ type: 'spell_cast', faction, spellId, flashX, flashY });
    if (isPlayer) ctx.ai.onPlayerSpellCast(ctx.sim);
    return true;
  }

  if (spellId === 'summon_stoneworms') {
    comb.mana -= manaCost;
    const rad = def.radius + 16;
    const waves = 1 + (isPlayer ? ctx.bonuses.stonewormsExtraWaves : 0);
    const waveScale = 1 + 0.35 * (waves - 1);
    for (const sq of ctx.squads) {
      if (sq.owner === faction || sq.state === 'Dead' || sq.liberationTimer > 0) continue;
      if (dist(sq.flashX, sq.flashY, flashX, flashY) <= rad) {
        const totalDmg = Math.max(12, Math.round(countAliveUnits(sq) * def.power * 3.2 * waveScale));
        const slain = applyDamageToSquad(sq, totalDmg);
        if (slain >= 0 && countAliveUnits(sq) <= 0) ctx.handleSquadDestroyed(faction, sq);
      }
    }
    ctx.emitEvent({ type: 'spell_cast', faction, spellId, flashX, flashY });
    if (isPlayer) ctx.ai.onPlayerSpellCast(ctx.sim);
    return true;
  }

  if (spellId === 'disentomb') {
    comb.mana -= manaCost;
    const sq = ctx.spawnAtFlash('k_immortals', faction, flashX, flashY, null, {
      lifetimeSec: def.baseDurationSec,
      isSummoned: true,
    });
    if (!sq) return false;
    ctx.emitEvent({ type: 'spell_cast', faction, spellId, squadId: sq.id, flashX, flashY });
    if (isPlayer) ctx.ai.onPlayerSpellCast(ctx.sim);
    return true;
  }

  if (spellId === 'raise_the_dead') {
    comb.mana -= manaCost;
    const sq = ctx.spawnAtFlash('e_undying_warriors', faction, flashX, flashY, null, {
      lifetimeSec: def.baseDurationSec,
      isSummoned: true,
    });
    if (!sq) return false;
    ctx.emitEvent({ type: 'spell_cast', faction, spellId, squadId: sq.id, flashX, flashY });
    return true;
  }

  if (spellId === 'ice_blast') {
    comb.mana -= manaCost;
    const rad = def.radius + 16;
    const dur = def.baseDurationSec + (isPlayer ? ctx.bonuses.freezeDurationBonusSec : 0);
    for (const sq of ctx.squads) {
      if (sq.owner === faction || sq.state === 'Dead' || sq.liberationTimer > 0) continue;
      if (dist(sq.flashX, sq.flashY, flashX, flashY) <= rad) {
        const sqDef = UNIT_DEFS[sq.defId];
        if (!hasAbility(sqDef.abilities, 'Mechanism')) {
          sq.frozenTimer = Math.max(sq.frozenTimer, dur);
        }
        const frostDmg = Math.max(10, Math.round(countAliveUnits(sq) * def.power * 2));
        applyDamageToSquad(sq, frostDmg);
        if (countAliveUnits(sq) <= 0) ctx.handleSquadDestroyed(faction, sq);
      }
    }
    ctx.emitEvent({ type: 'spell_cast', faction, spellId, flashX, flashY });
    if (isPlayer) ctx.ai.onPlayerSpellCast(ctx.sim);
    return true;
  }

  if (spellId === 'frost_enchantment') {
    comb.mana -= manaCost;
    const rad = def.radius + 16;
    for (const sq of ctx.squads) {
      if (sq.owner !== faction || sq.state === 'Dead') continue;
      if (dist(sq.flashX, sq.flashY, flashX, flashY) <= rad) {
        sq.frostEnchantTimer = Math.max(sq.frostEnchantTimer, def.baseDurationSec);
      }
    }
    ctx.emitEvent({ type: 'spell_cast', faction, spellId, flashX, flashY });
    if (isPlayer) ctx.ai.onPlayerSpellCast(ctx.sim);
    return true;
  }

  if (spellId === 'terror') {
    comb.mana -= manaCost;
    const rad = def.radius + 16;
    for (const sq of ctx.squads) {
      if (sq.owner === faction || sq.state === 'Dead' || sq.liberationTimer > 0) continue;
      if (dist(sq.flashX, sq.flashY, flashX, flashY) <= rad) {
        sq.heroicTimer = 0;
        if (!hasAbility(UNIT_DEFS[sq.defId].abilities, 'Discipline')) {
          sq.fearTimer = Math.max(sq.fearTimer, def.baseDurationSec);
        }
      }
    }
    ctx.emitEvent({ type: 'spell_cast', faction, spellId, flashX, flashY });
    return true;
  }

  // 2. Banners (5 types across 4 factions)
  if (
    spellId === 'banner_consecration' ||
    spellId === 'banner_heroism' ||
    spellId === 'banner_bloodlust' ||
    spellId === 'banner_liberation' ||
    spellId === 'banner_desecration'
  ) {
    comb.mana -= manaCost;
    const durMul = faction === 'Westaria' && isPlayer ? ctx.bonuses.bannerDurationMul : 1.0;
    const totalDur = def.baseDurationSec * durMul;
    const banner: ActiveBannerState = {
      id: ctx.allocateBannerId(),
      spellId: spellId as BannerSpellId,
      owner: faction,
      flashX,
      flashY,
      radius: def.radius,
      power: def.power,
      remainingSec: totalDur,
      totalDurationSec: totalDur,
      tickTimer: 0,
    };
    ctx.activeBanners.push(banner);
    if (isPlayer) ctx.battleStats.bannersSet += 1;
    ctx.emitEvent({
      type: 'banner_placed',
      faction,
      spellId,
      bannerId: banner.id,
      flashX,
      flashY,
    });
    if (isPlayer) ctx.ai.onPlayerSpellCast(ctx.sim);
    return true;
  }

  // 3. Ultimates (4 faction ultimates)
  if (spellId === 'sign_of_advent') {
    comb.ultimateCharge = 0;
    const avatar = ctx.spawnAtFlash('w_avatar', faction, flashX, flashY, null, {
      lifetimeSec: def.baseDurationSec,
      isAvatar: true,
    });
    if (!avatar) return false;
    if (isPlayer) ctx.battleStats.ultimatesUsed += 1;
    ctx.emitEvent({
      type: 'ultimate_cast',
      faction,
      spellId,
      squadId: avatar.id,
      flashX,
      flashY,
    });
    if (isPlayer) ctx.ai.onPlayerSpellCast(ctx.sim);
    return true;
  }

  if (spellId === 'cataclysm') {
    comb.ultimateCharge = 0;
    // Meteor barrage across enemy squads, enemy strongholds, and light splash on caster's non-liberated squads
    for (const sq of ctx.squads) {
      if (sq.state === 'Dead') continue;
      if (sq.owner !== faction) {
        if (sq.liberationTimer > 0) continue;
        for (const m of sq.members) {
          if (!m.alive) continue;
          const dmg = Math.max(8, Math.ceil(m.maxHp * (0.4 + ctx.rng() * 0.2)));
          if (dmg >= m.hp) {
            m.hp = 0;
            m.alive = false;
          } else {
            m.hp -= dmg;
          }
        }
        if (countAliveUnits(sq) <= 0) ctx.handleSquadDestroyed(faction, sq);
      } else if (sq.liberationTimer <= 0) {
        for (const m of sq.members) {
          if (!m.alive) continue;
          const selfDmg = Math.max(1, Math.floor(m.maxHp * 0.12));
          m.hp = Math.max(1, m.hp - selfDmg);
        }
      }
    }
    for (const sh of ctx.strongholds) {
      if (sh.owner === faction) continue;
      const fortDmg = Math.max(80, Math.round(sh.maxHp * 0.25));
      sh.hp = Math.max(0, sh.hp - fortDmg);
      if (sh.hp <= 0) {
        ctx.captureStronghold(faction, sh);
      }
    }
    if (isPlayer) ctx.battleStats.ultimatesUsed += 1;
    ctx.emitEvent({ type: 'ultimate_cast', faction, spellId, flashX, flashY });
    if (isPlayer) ctx.ai.onPlayerSpellCast(ctx.sim);
    return true;
  }

  if (spellId === 'grand_transformation') {
    comb.ultimateCharge = 0;
    let harvestedSoldiers = 0;
    for (const sq of ctx.squads) {
      if (sq.owner === faction || sq.owner === 'Bandits' || sq.state === 'Dead' || sq.liberationTimer > 0) continue;
      const sqDef = UNIT_DEFS[sq.defId];
      if (hasAbility(sqDef.abilities, 'Mechanism')) continue;
      let livingInSquad = 0;
      for (const m of sq.members) {
        if (m.alive) livingInSquad++;
      }
      let targetKills = Math.floor(livingInSquad * 0.5);
      if (targetKills === 0 && livingInSquad >= 1 && ctx.rng() <= 0.5) targetKills = 1;
      for (const m of sq.members) {
        if (!m.alive || targetKills <= 0) continue;
        m.alive = false;
        m.hp = 0;
        targetKills--;
        harvestedSoldiers++;
      }
      if (countAliveUnits(sq) <= 0) {
        ctx.handleSquadDestroyed(faction, sq);
      }
    }
    const rewardGold = harvestedSoldiers * def.power;
    const rewardMana = harvestedSoldiers * def.power;
    comb.gold += rewardGold;
    comb.mana = Math.min(MAX_MANA, comb.mana + rewardMana);
    if (isPlayer) {
      ctx.battleStats.goldCollected += rewardGold;
      ctx.battleStats.ultimatesUsed += 1;
    }
    ctx.emitEvent({
      type: 'ultimate_cast',
      faction,
      spellId,
      goldAmount: rewardGold,
      flashX,
      flashY,
    });
    if (isPlayer) ctx.ai.onPlayerSpellCast(ctx.sim);
    return true;
  }

  if (spellId === 'call_of_the_grave') {
    comb.ultimateCharge = 0;
    let strikes = 0;
    for (const sq of ctx.squads) {
      if (strikes >= 2) break;
      if (sq.owner === faction || sq.owner === 'Bandits' || sq.state === 'Dead' || sq.liberationTimer > 0) continue;
      const sqDef = UNIT_DEFS[sq.defId];
      if (hasAbility(sqDef.abilities, 'Undead') || hasAbility(sqDef.abilities, 'Mechanism')) continue;
      strikes++;
      const slain = applyDamageToSquad(sq, Math.max(40, Math.round(sq.members[0].maxHp * 2.5)));
      if (slain >= 0 && countAliveUnits(sq) <= 0) {
        ctx.handleSquadDestroyed(faction, sq);
        ctx.spawnAtFlash('e_undying_warriors', faction, sq.flashX, sq.flashY, null, {
          lifetimeSec: 40,
          isSummoned: true,
        });
      }
    }
    ctx.emitEvent({ type: 'ultimate_cast', faction, spellId, flashX, flashY });
    return true;
  }

  return false;
}

/** Updates active battlefield banners (0.5s aura ticks + expiration cleanup). */
export function updateBanners(ctx: BattleSimContext, dt: number): void {
  for (let i = ctx.activeBanners.length - 1; i >= 0; i--) {
    const b = ctx.activeBanners[i];
    b.remainingSec -= dt;
    b.tickTimer -= dt;
    if (b.tickTimer <= 0) {
      b.tickTimer = BANNER_TICK_SEC;
      for (const sq of ctx.squads) {
        if (sq.owner !== b.owner || sq.state === 'Dead') continue;
        if (dist(sq.flashX, sq.flashY, b.flashX, b.flashY) > b.radius + 14) continue;
        if (b.spellId === 'banner_consecration' || b.spellId === 'banner_desecration') {
          healAndResurrectSquad(sq, UNIT_DEFS[sq.defId], b.power);
        } else if (b.spellId === 'banner_heroism') {
          if (sq.heroicTimer <= 0 && b.owner === ctx.playerFaction) {
            ctx.battleStats.heroicEngagedCount += 1;
          }
          sq.heroicTimer = 0.8;
        } else if (b.spellId === 'banner_bloodlust') {
          sq.bloodlustTimer = 0.8;
          sq.bloodlustPower = b.power;
        } else if (b.spellId === 'banner_liberation') {
          sq.liberationTimer = 0.8;
          sq.frozenTimer = 0;
          sq.poisonTimer = 0;
          sq.poisonDps = 0;
          sq.fearTimer = 0;
        }
      }
    }
    if (b.remainingSec <= 0) {
      ctx.emitEvent({
        type: 'banner_expired',
        faction: b.owner,
        bannerId: b.id,
        spellId: b.spellId,
        flashX: b.flashX,
        flashY: b.flashY,
      });
      ctx.activeBanners.splice(i, 1);
    }
  }
}
