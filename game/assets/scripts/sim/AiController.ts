import { dist } from '../core/CoordTransform';
import {
  MAX_STRONGHOLD_LEVEL,
  STRONGHOLD_STATS,
  STRONGHOLD_UPGRADE_COSTS,
  SUPPLY_STATS,
} from '../data/BuildingsData';
import { TUTORIAL1_ENEMY_MARCH_TARGET } from '../data/Level1Data';
import { ALL_SPELLS, FACTION_SPELL_ORDER } from '../data/SpellsData';
import { FactionId, StrongholdState, UnitClass } from '../data/Types';
import { getUnitDefForClass, UNIT_DEFS } from '../data/UnitsData';
import type { BattleSim } from './BattleSim';

const ALL_WAR_FACTIONS: FactionId[] = ['Westaria', 'TheEmpire', 'TheKhaganate', 'TheCult'];

/**
 * Orchestrates Level 1 & Level 2 tutorial progression plus multi-faction CPU AI
 * (economy, recruitment, tactical marches, defense, and AI spellcasting) across all 24 levels.
 */
export class AiController {
  tutorialStep = 0;
  lockUnitAbove = 0; // 0 = Infantry only on L1 start; 4 = All unit classes unlocked
  cpuEnabled = false;
  tutor1EnemySquadId: number | null = null;
  tutor1EnemyTownId = '077';

  private recruitRotations = new Map<FactionId, number>();
  private spellCooldowns = new Map<FactionId, number>();

  reset(tutorialMode: 'tutorial1' | 'tutorial2' | 'none' = 'tutorial1'): void {
    this.tutorialStep = 0;
    this.tutor1EnemySquadId = null;
    this.tutor1EnemyTownId = '077';
    this.recruitRotations.clear();
    this.spellCooldowns.clear();

    if (tutorialMode === 'tutorial1') {
      this.lockUnitAbove = 0;
      this.cpuEnabled = false;
    } else if (tutorialMode === 'tutorial2') {
      this.lockUnitAbove = 4;
      this.cpuEnabled = false;
    } else {
      this.lockUnitAbove = 4;
      this.cpuEnabled = true;
    }
  }

  onPlayerBoughtSquad(sim: BattleSim): void {
    if (sim.levelDef.tutorialMode !== 'tutorial1' || this.tutorialStep !== 0) return;
    this.tutorialStep = 1;
    sim.emitEvent({ type: 'tutorial_step', tutorialStep: 1 });

    if (this.tutor1EnemySquadId !== null) {
      sim.orderSquadToPoint(
        this.tutor1EnemySquadId,
        TUTORIAL1_ENEMY_MARCH_TARGET.x,
        TUTORIAL1_ENEMY_MARCH_TARGET.y,
      );
    }
  }

  onSquadKilled(sim: BattleSim, squadId: number, killedOwner?: FactionId): void {
    if (sim.levelDef.tutorialMode === 'tutorial1' && this.tutor1EnemySquadId === squadId) {
      this.tutor1EnemySquadId = null;
      if (this.tutorialStep < 2) {
        this.tutorialStep = 2;
        this.lockUnitAbove = 1; // Unlock Archers!
        sim.emitEvent({ type: 'tutorial_step', tutorialStep: 2 });

        const town = sim.strongholds.find((s) => s.id === this.tutor1EnemyTownId);
        if (town && town.owner === 'TheEmpire') {
          sim.spawnUnitFree('e_undying_warriors', town.id);
        }
        this.cpuEnabled = true;
      }
    } else if (sim.levelDef.tutorialMode === 'tutorial2' && killedOwner === 'Bandits') {
      if (this.tutorialStep < 1) {
        this.tutorialStep = 1;
        sim.emitEvent({ type: 'tutorial_step', tutorialStep: 1 });
      }
      this.cpuEnabled = true;
    }
  }

  onStrongholdCaptured(sim: BattleSim, sh: StrongholdState): void {
    if (sim.levelDef.tutorialMode === 'tutorial1') {
      if (sh.id === this.tutor1EnemyTownId && sh.owner === 'Westaria' && this.tutorialStep < 3) {
        this.tutorialStep = 3;
        this.lockUnitAbove = 4;
        this.cpuEnabled = true;
        const empire = sim.getCombatant('TheEmpire');
        empire.gold += UNIT_DEFS.e_undying_warriors.cost;
        sim.recalcAll();
        sim.emitEvent({ type: 'tutorial_step', tutorialStep: 3 });
      }
    } else if (sim.levelDef.tutorialMode === 'tutorial2' && sh.owner === 'Westaria') {
      if (sh.kind === 'MagicTower' && this.tutorialStep < 3) {
        this.tutorialStep = 3;
        this.cpuEnabled = true;
        sim.emitEvent({ type: 'tutorial_step', tutorialStep: 3 });
      } else if (this.tutorialStep < 2) {
        this.tutorialStep = 2;
        this.cpuEnabled = true;
        sim.emitEvent({ type: 'tutorial_step', tutorialStep: 2 });
      }
    }
  }

  onPlayerSpellCast(sim: BattleSim): void {
    if (sim.levelDef.tutorialMode === 'tutorial2' && this.tutorialStep < 2) {
      this.tutorialStep = 2;
      this.cpuEnabled = true;
      sim.emitEvent({ type: 'tutorial_step', tutorialStep: 2 });
    }
  }

  /** Runs once per 1.0s for every active AI faction in the current level. */
  tickCpuOneSecond(sim: BattleSim): void {
    if (sim.isMatchOver) return;

    if (!this.cpuEnabled && sim.levelDef.tutorialMode === 'tutorial2' && sim.elapsedSec >= 25) {
      this.cpuEnabled = true;
    }
    if (!this.cpuEnabled) return;

    const pFaction = sim.playerFaction;
    for (const faction of ALL_WAR_FACTIONS) {
      if (faction === pFaction) continue;
      this.tickFaction(sim, faction);
    }
  }

  private tickFaction(sim: BattleSim, faction: FactionId): void {
    const forts = sim.strongholds.filter((s) => s.owner === faction);
    if (forts.length === 0) return;

    const missionIdx = sim.levelDef.missionIndex ?? 1;
    const comb = sim.getCombatant(faction);
    const freeSupply = comb.totalSupply - comb.usedSupply;

    // 1. Supply expansion on owned BuildSites
    for (const site of sim.buildSites) {
      if (site.owner !== faction || site.supplyKind !== 'Empty') continue;
      if (comb.gold < SUPPLY_STATS.Village.cost) break;
      const parentFort = forts.find((s) => s.locationNum === site.locationNum);
      if (!parentFort) continue;
      const allowed = STRONGHOLD_STATS[parentFort.kind].allowedSupply;

      if (freeSupply <= 0 && allowed.includes('Village')) {
        sim.buildSupplyBuilding(faction, site.id, 'Village');
        break;
      } else if (comb.grossGoldPerSec < 10 && allowed.includes('Mine')) {
        sim.buildSupplyBuilding(faction, site.id, 'Mine');
        break;
      } else if (allowed.includes('Village')) {
        sim.buildSupplyBuilding(faction, site.id, 'Village');
        break;
      }
    }

    // 2. Occasionally upgrade primary Castle on mission 3+ if rich
    if (missionIdx >= 3 && comb.gold >= 480) {
      const castle = forts.find((s) => s.kind === 'Castle' && s.level < MAX_STRONGHOLD_LEVEL);
      if (castle && comb.gold >= (STRONGHOLD_UPGRADE_COSTS[castle.level] ?? 9999)) {
        sim.upgradeStronghold(faction, castle.id);
      }
    }

    // 3. Recruit squads from Castle (or strongest available fort)
    const updatedFree = comb.totalSupply - comb.usedSupply;
    const spawnFort =
      forts.find((s) => s.kind === 'Castle') ??
      forts.find((s) => s.kind === 'Town') ??
      forts[0];
    if (updatedFree > 0 && spawnFort) {
      const classes: UnitClass[] =
        missionIdx === 1
          ? ['Infantry', 'Archers']
          : missionIdx <= 3
            ? ['Infantry', 'Archers', 'Cavalry']
            : ['Infantry', 'Archers', 'Cavalry', 'Magic', 'Siege'];

      const rot = this.recruitRotations.get(faction) ?? 0;
      const chosenClass = classes[rot % classes.length];
      const def = getUnitDefForClass(faction, chosenClass, sim.levelDef.enemyTechTier);
      if (def && updatedFree >= def.upkeep && comb.gold >= def.cost) {
        const sq = sim.recruitUnit(faction, spawnFort.id, def.id);
        if (sq) {
          this.recruitRotations.set(faction, rot + 1);
        }
      } else if (rot % classes.length !== 0) {
        const inf = getUnitDefForClass(faction, 'Infantry', sim.levelDef.enemyTechTier);
        if (inf && comb.gold >= inf.cost + 80) {
          const sq = sim.recruitUnit(faction, spawnFort.id, inf.id);
          if (sq) this.recruitRotations.set(faction, rot + 1);
        }
      }
    }

    // 4. AI tactical spellcasting on mission 3+
    if (missionIdx >= 3) {
      this.tickAiSpellcasting(sim, faction, forts);
    }

    // 5. Tactical command: defend threatened forts or march on nearest hostile stronghold
    const hostileSquads = sim.squads.filter(
      (s) => s.owner !== faction && s.owner !== 'Bandits' && s.state !== 'Dead',
    );
    const idleSquads = sim.squads.filter((s) => s.owner === faction && s.state === 'Stand');

    for (const fort of forts) {
      const threatNear = hostileSquads.some((hs) => dist(hs.flashX, hs.flashY, fort.flashX, fort.flashY) < 115);
      const defenderNear = sim.squads.some(
        (fs) => fs.owner === faction && fs.state !== 'Dead' && dist(fs.flashX, fs.flashY, fort.flashX, fort.flashY) < 65,
      );
      if (threatNear && !defenderNear && idleSquads.length > 0) {
        const helper = idleSquads.shift()!;
        sim.orderSquadToNode(helper.id, fort.id);
      }
    }

    if (idleSquads.length >= 2) {
      const targets = sim.strongholds.filter((s) => s.owner !== faction);
      if (targets.length > 0) {
        const attacker = idleSquads[0];
        let bestTarget = targets[0];
        let bestD = Infinity;
        for (const tf of targets) {
          const d = dist(attacker.flashX, attacker.flashY, tf.flashX, tf.flashY);
          if (d < bestD) {
            bestD = d;
            bestTarget = tf;
          }
        }
        sim.orderSquadToNode(attacker.id, bestTarget.id);
      }
    }
  }

  private tickAiSpellcasting(sim: BattleSim, faction: FactionId, forts: StrongholdState[]): void {
    const cd = this.spellCooldowns.get(faction) ?? 12;
    if (cd > 0) {
      this.spellCooldowns.set(faction, cd - 1);
      return;
    }

    const spellOrder = FACTION_SPELL_ORDER[faction];
    if (spellOrder.length === 0) return;

    const hostileCombatSquad = sim.squads.find(
      (s) => s.owner !== faction && s.owner !== 'Bandits' && s.state !== 'Dead',
    );
    const friendlyFighting = sim.squads.find((s) => s.owner === faction && s.state === 'Fight');

    // Prioritize Ultimate if charged, then Banner in active combat, then offensive spell
    for (const sid of [...spellOrder].reverse()) {
      if (!sim.canCastSpell(faction, sid)) continue;
      const def = ALL_SPELLS[sid];
      if (def.kind === 'ultimate') {
        const fort = forts[0];
        if (fort && sim.castSpell(faction, sid, fort.flashX, fort.flashY)) {
          this.spellCooldowns.set(faction, 18);
          return;
        }
      } else if (def.kind === 'banner' && friendlyFighting) {
        if (sim.castSpell(faction, sid, friendlyFighting.flashX, friendlyFighting.flashY)) {
          this.spellCooldowns.set(faction, 18);
          return;
        }
      } else if (def.kind === 'instant' && hostileCombatSquad) {
        const target =
          sid === 'frost_enchantment' || sid === 'disentomb' || sid === 'raise_the_dead'
            ? (friendlyFighting ?? forts[0])
            : hostileCombatSquad;
        if (target && sim.castSpell(faction, sid, target.flashX, target.flashY)) {
          this.spellCooldowns.set(faction, 18);
          return;
        }
      }
    }
  }
}
