import { dist, flashToSim, simToFlash } from '../core/CoordTransform';
import { EventBus } from '../core/EventBus';
import {
  getStrongholdMaxHp,
  MAX_STRONGHOLD_LEVEL,
  STRONGHOLD_STATS,
  STRONGHOLD_UPGRADE_COSTS,
  SUPPLY_STATS,
} from '../data/BuildingsData';
import { DEFAULT_WESTARIA_BONUSES } from '../data/EdictsData';
import { ALL_SPELLS, FACTION_SPELL_ORDER } from '../data/SpellsData';
import {
  ActiveBannerState,
  BannerSpellId,
  BattleBadgeStats,
  BuildSiteState,
  CampaignBonuses,
  ChestState,
  CombatantState,
  FactionId,
  LevelDef,
  MedalRank,
  PlayableCampaignId,
  SimEventPayload,
  SpellId,
  SquadStateModel,
  SquadUnitMember,
  StrongholdState,
  SupplyKind,
  UnitDefinition,
} from '../data/Types';
import { CLASS_LOCK_INDEX, getUnitDefForClass, UNIT_DEFS } from '../data/UnitsData';
import { WESTARIA_LEVELS } from '../data/WestariaLevelsData';
import { AiController } from './AiController';
import {
  applyDamageToSquad,
  computeFortressDamage,
  computeLordsJudgementDamage,
  computeSquadStrikeDamage,
  countAliveUnits,
  getAbilityValue,
  hasAbility,
  healAndResurrectSquad,
} from './CombatMath';
import { applyOneSecondEconomyTick, MAX_MANA, recalculateEconomy } from './EconomySim';
import { GraphNav } from './GraphNav';

export interface SimEvents {
  event: SimEventPayload;
}

const MELEE_ENGAGE_FLASH_DIST = 44;
const FORTRESS_ENGAGE_FLASH_DIST = 48;
const REPAIR_PER_HALF_SEC = 5;
const BANNER_TICK_SEC = 0.5;
const OGRE_AGGRO_DIST = 85;
const CHEST_PICKUP_DIST = 38;
const CHEST_GOLD_REWARD = 500;
const BASE_ULTIMATE_MAX = 200;
const XP_LEVEL_THRESHOLDS = [100, 250, 450];

const ALL_FACTIONS: FactionId[] = ['Westaria', 'TheEmpire', 'TheKhaganate', 'TheCult', 'Bandits'];

function createMemberOffsets(count: number): Array<{ x: number; y: number }> {
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

export class BattleSim {
  readonly events = new EventBus<SimEvents>();
  readonly ai = new AiController();

  levelDef: LevelDef = WESTARIA_LEVELS[0];
  bonuses: CampaignBonuses = DEFAULT_WESTARIA_BONUSES;
  nav!: GraphNav;

  strongholds: StrongholdState[] = [];
  buildSites: BuildSiteState[] = [];
  chests: ChestState[] = [];
  squads: SquadStateModel[] = [];
  activeBanners: ActiveBannerState[] = [];
  combatants!: Record<FactionId, CombatantState>;
  battleStats!: BattleBadgeStats;

  elapsedSec = 0;
  paused = false;
  speedMultiplier: 1 | 2 = 1;
  isMatchOver = false;
  winner: FactionId | null = null;
  medal: MedalRank | null = null;

  private nextSquadId = 1;
  private nextBannerId = 1;
  private secondAccum = 0;
  private rng: () => number;

  constructor(rng: () => number = Math.random) {
    this.rng = rng;
    this.loadLevel(WESTARIA_LEVELS[0], DEFAULT_WESTARIA_BONUSES);
  }

  get playerFaction(): PlayableCampaignId {
    return this.levelDef.playerFaction ?? 'Westaria';
  }

  private emptyCombatant(faction: FactionId, ultMax = BASE_ULTIMATE_MAX): CombatantState {
    return {
      faction,
      gold: 0,
      mana: 0,
      grossGoldPerSec: 0,
      netGoldPerSec: 0,
      manaPerSec: 0,
      totalSupply: 0,
      usedSupply: 0,
      upkeepSquads: 0,
      magicTowerCount: 0,
      ultimateCharge: 0,
      ultimateMax: ultMax,
      kills: 0,
      lost: 0,
    };
  }

  reset(): void {
    this.loadLevel(this.levelDef, this.bonuses);
  }

  loadLevel(levelDef: LevelDef = WESTARIA_LEVELS[0], bonuses: CampaignBonuses = DEFAULT_WESTARIA_BONUSES): void {
    // Preserve external event listeners (e.g. BattleView) across replays / level changes!
    this.levelDef = levelDef;
    this.bonuses = bonuses;
    this.nav = new GraphNav(levelDef.nodes, levelDef.edges);
    this.ai.reset(levelDef.tutorialMode);

    this.nextSquadId = 1;
    this.nextBannerId = 1;
    this.elapsedSec = 0;
    this.secondAccum = 0;
    this.paused = false;
    this.speedMultiplier = 1;
    this.isMatchOver = false;
    this.winner = null;
    this.medal = null;

    this.battleStats = {
      maxVillagesOwned: 0,
      maxMinesOwned: 0,
      maxObelisksOwned: 0,
      maxSquadsOwned: 0,
      squadsPurchased: 0,
      bannersSet: 0,
      ultimatesUsed: 0,
      chestsOpened: 0,
      enemySquadsDestroyed: 0,
      heroicEngagedCount: 0,
      goldCollected: levelDef.playerStartGold + bonuses.startGoldBonus,
      strongholdsSeized: 0,
    };

    const pFaction = this.playerFaction;
    const playerUltMax = Math.max(40, Math.round(BASE_ULTIMATE_MAX * bonuses.ultimateCooldownMul));
    this.combatants = {
      Westaria: {
        ...this.emptyCombatant('Westaria', pFaction === 'Westaria' ? playerUltMax : BASE_ULTIMATE_MAX),
        gold: pFaction === 'Westaria' ? levelDef.playerStartGold + bonuses.startGoldBonus : levelDef.enemyStartGold,
        mana: pFaction === 'Westaria' ? levelDef.playerStartMana : 100,
      },
      TheEmpire: {
        ...this.emptyCombatant('TheEmpire'),
        gold: levelDef.enemyStartGold,
        mana: 100,
      },
      TheKhaganate: {
        ...this.emptyCombatant('TheKhaganate', pFaction === 'TheKhaganate' ? playerUltMax : BASE_ULTIMATE_MAX),
        gold: pFaction === 'TheKhaganate' ? levelDef.playerStartGold + bonuses.startGoldBonus : levelDef.enemyStartGold,
        mana: pFaction === 'TheKhaganate' ? levelDef.playerStartMana : 100,
      },
      TheCult: {
        ...this.emptyCombatant('TheCult', pFaction === 'TheCult' ? playerUltMax : BASE_ULTIMATE_MAX),
        gold: pFaction === 'TheCult' ? levelDef.playerStartGold + bonuses.startGoldBonus : levelDef.enemyStartGold,
        mana: pFaction === 'TheCult' ? levelDef.playerStartMana : 100,
      },
      Bandits: this.emptyCombatant('Bandits'),
    };

    this.strongholds = [];
    this.buildSites = [];
    this.chests = [];
    this.squads = [];
    this.activeBanners = [];

    for (const node of levelDef.nodes) {
      const simPos = flashToSim(node.flashX, node.flashY);
      if (node.kind === 'Stronghold' && node.strongholdKind) {
        const owner = node.initialOwner ?? 'TheEmpire';
        const baseMax = getStrongholdMaxHp(node.strongholdKind, 0);
        const maxHp = owner === pFaction ? Math.round(baseMax * bonuses.strongholdHpMul) : baseMax;
        this.strongholds.push({
          id: node.id,
          name: node.label,
          kind: node.strongholdKind,
          locationNum: node.locationNum,
          owner,
          level: 0,
          hp: maxHp,
          maxHp,
          bonusSupply: owner !== pFaction ? 1 : 0,
          flashX: node.flashX,
          flashY: node.flashY,
          simX: simPos.x,
          simY: simPos.y,
        });
      } else if (node.kind === 'BuildSite') {
        this.buildSites.push({
          id: node.id,
          locationNum: node.locationNum,
          owner: node.initialOwner ?? 'TheEmpire',
          supplyKind: 'Empty',
          flashX: node.flashX,
          flashY: node.flashY,
          simX: simPos.x,
          simY: simPos.y,
        });
      } else if (node.kind === 'Chest') {
        this.chests.push({
          id: node.id,
          gold: CHEST_GOLD_REWARD,
          collected: false,
          flashX: node.flashX,
          flashY: node.flashY,
          simX: simPos.x,
          simY: simPos.y,
        });
      } else if (node.kind === 'OgreGuard') {
        this.spawnAtFlash('n_ogre', 'Bandits', node.flashX, node.flashY, node.id, {
          guardHomeFlash: { x: node.flashX, y: node.flashY },
        });
      }
    }

    // Spawn initial enemy defenders
    if (levelDef.tutorialMode === 'tutorial1') {
      for (const sh of this.strongholds) {
        if (sh.owner === 'TheEmpire') {
          const sq = this.spawnUnitFree('e_undying_warriors', sh.id);
          if (sq && sh.kind === 'Town') {
            sq.isTutorialSquad = true;
            this.ai.tutor1EnemySquadId = sq.id;
            this.ai.tutor1EnemyTownId = sh.id;
          }
        }
      }
    } else {
      for (const sh of this.strongholds) {
        if (sh.owner === pFaction) continue;
        if (sh.kind === 'Castle' || sh.kind === 'Town' || sh.kind === 'MagicTower') {
          const def = getUnitDefForClass(sh.owner, 'Infantry', levelDef.enemyTechTier);
          if (def) {
            this.spawnUnitFree(def.id, sh.id);
          }
        }
      }
    }

    this.recalcAll();
    this.updatePeakBadgeStats();
  }

  getCombatant(faction: FactionId): CombatantState {
    return this.combatants[faction];
  }

  recalcAll(): void {
    const pFaction = this.playerFaction;
    for (const f of ALL_FACTIONS) {
      const magicBonus = f === pFaction ? this.bonuses.magicTowerResourceBonus : 0;
      recalculateEconomy(this.combatants[f], this.strongholds, this.buildSites, this.squads, magicBonus);
    }
  }

  emitEvent(payload: SimEventPayload): void {
    this.events.emit('event', payload);
  }

  getEffectiveUnitCost(faction: FactionId, def: UnitDefinition): number {
    if (faction === this.playerFaction && hasAbility(def.abilities, 'Undead')) {
      return Math.max(10, Math.round(def.cost * this.bonuses.undeadCostMul));
    }
    return def.cost;
  }

  getEffectiveSupplyCost(faction: FactionId, kind: Exclude<SupplyKind, 'Empty'>): number {
    const base = SUPPLY_STATS[kind].cost;
    if (faction === this.playerFaction && this.bonuses.supplyCostMul < 1) {
      return Math.max(10, Math.round(base * this.bonuses.supplyCostMul));
    }
    return base;
  }

  getEffectiveSpellCost(faction: FactionId, spellId: SpellId): number {
    const def = ALL_SPELLS[spellId];
    if (!def || def.kind === 'ultimate') return 0;
    if (faction === this.playerFaction && this.bonuses.spellCostMul < 1) {
      return Math.max(10, Math.round(def.costMana * this.bonuses.spellCostMul));
    }
    return def.costMana;
  }

  isUnitUnlockedForPlayer(defId: string): boolean {
    const def = UNIT_DEFS[defId];
    if (!def || def.faction !== this.playerFaction || defId === 'w_avatar') return false;
    return CLASS_LOCK_INDEX[def.unitClass] <= this.ai.lockUnitAbove;
  }

  private spawnAtFlash(
    defId: string,
    owner: FactionId,
    fx: number,
    fy: number,
    garrisonNodeId: string | null,
    opts?: {
      lifetimeSec?: number | null;
      isAvatar?: boolean;
      isSummoned?: boolean;
      guardHomeFlash?: { x: number; y: number };
      upkeepOverride?: number;
    },
  ): SquadStateModel | null {
    const def = UNIT_DEFS[defId];
    if (!def) return null;
    const simPos = flashToSim(fx, fy);
    const isPlayer = owner === this.playerFaction;

    let hpMul = 1.0;
    if (isPlayer) {
      if (def.unitClass === 'Infantry') hpMul = this.bonuses.infantryHpMul;
      else if (def.unitClass === 'Cavalry') hpMul = this.bonuses.cavalryHpMul;
    }
    const memberHp = Math.round(def.hpPerUnit * hpMul);
    const morale = def.morale + (isPlayer ? Math.round((def.morale * this.bonuses.moraleBonusPct) / 100) : 0);

    let unitCount = def.unitsCount;
    if (isPlayer && defId === 'k_immortals' && this.bonuses.immortalsExtraUnits > 0) {
      unitCount += this.bonuses.immortalsExtraUnits;
    }

    const offsets = createMemberOffsets(unitCount);
    const members: SquadUnitMember[] = offsets.map((o) => ({
      hp: memberHp,
      maxHp: memberHp,
      alive: true,
      offsetX: o.x,
      offsetY: o.y,
    }));

    const squad: SquadStateModel = {
      id: this.nextSquadId++,
      defId,
      owner,
      state: 'Stand',
      flashX: fx,
      flashY: fy,
      simX: simPos.x,
      simY: simPos.y,
      facing: owner === 'Westaria' ? 'up' : 'down',
      animPhase: 'go',
      targetNodeId: null,
      targetSquadId: null,
      pathFlash: [],
      attackTimer: 0,
      repairTimer: 0,
      morale,
      maxMorale: morale,
      heroicTimer: 0,
      frozenTimer: 0,
      poisonTimer: 0,
      poisonDps: 0,
      frostEnchantTimer: 0,
      bloodlustTimer: 0,
      bloodlustPower: 0,
      liberationTimer: 0,
      fearTimer: 0,
      xp: 0,
      vetLevel: 0,
      chargeReady: hasAbility(def.abilities, 'Charge'),
      lifetimeSec: opts?.lifetimeSec ?? null,
      isAvatar: opts?.isAvatar,
      isSummoned: opts?.isSummoned,
      guardHomeFlash: opts?.guardHomeFlash,
      members,
      upkeep: opts?.upkeepOverride ?? (opts?.isAvatar || opts?.isSummoned ? 0 : def.upkeep),
      garrisonNodeId,
    };
    this.squads.push(squad);
    this.recalcAll();
    this.updatePeakBadgeStats();
    return squad;
  }

  spawnUnitFree(defId: string, strongholdId: string): SquadStateModel | null {
    const sh = this.strongholds.find((s) => s.id === strongholdId);
    if (!sh) return null;

    const spawnOffset = this.squads.filter(
      (s) => s.owner === sh.owner && dist(s.flashX, s.flashY, sh.flashX, sh.flashY) < 55,
    ).length;
    const fx = sh.flashX + ((spawnOffset % 3) - 1) * 16 - (sh.owner === this.playerFaction ? 14 : 0);
    const fy = sh.flashY + (sh.owner === this.playerFaction ? 28 : 24) + Math.floor(spawnOffset / 3) * 14;
    return this.spawnAtFlash(defId, sh.owner, fx, fy, sh.id);
  }

  recruitUnit(faction: FactionId, strongholdId: string, defId: string): SquadStateModel | null {
    if (this.isMatchOver) return null;
    const def = UNIT_DEFS[defId];
    const sh = this.strongholds.find((s) => s.id === strongholdId && s.owner === faction);
    if (!def || !sh || def.faction !== faction || defId === 'w_avatar') return null;
    if (faction === this.playerFaction && !this.isUnitUnlockedForPlayer(defId)) return null;

    const comb = this.combatants[faction];
    const freeSupply = comb.totalSupply - comb.usedSupply;
    const cost = this.getEffectiveUnitCost(faction, def);
    if (comb.gold < cost || freeSupply < def.upkeep) return null;

    comb.gold -= cost;
    const squad = this.spawnUnitFree(defId, sh.id);
    if (!squad) return null;

    if (faction === this.playerFaction) {
      this.battleStats.squadsPurchased += 1;
      this.updatePeakBadgeStats();
      this.ai.onPlayerBoughtSquad(this);
    }

    this.emitEvent({
      type: 'squad_bought',
      faction,
      nodeId: sh.id,
      squadId: squad.id,
      flashX: squad.flashX,
      flashY: squad.flashY,
      unitClass: def.unitClass,
    });
    return squad;
  }

  upgradeStronghold(faction: FactionId, strongholdId: string): boolean {
    if (this.isMatchOver) return false;
    const sh = this.strongholds.find((s) => s.id === strongholdId && s.owner === faction);
    if (!sh || sh.level >= MAX_STRONGHOLD_LEVEL) return false;

    const cost = STRONGHOLD_UPGRADE_COSTS[sh.level];
    const comb = this.combatants[faction];
    if (!cost || comb.gold < cost) return false;

    comb.gold -= cost;
    sh.level += 1;
    const oldMax = sh.maxHp;
    const baseMax = getStrongholdMaxHp(sh.kind, sh.level);
    sh.maxHp = faction === this.playerFaction ? Math.round(baseMax * this.bonuses.strongholdHpMul) : baseMax;
    sh.hp = Math.min(sh.maxHp, sh.hp + Math.max(0, sh.maxHp - oldMax));

    this.recalcAll();
    this.emitEvent({
      type: 'stronghold_upgraded',
      faction,
      nodeId: sh.id,
      flashX: sh.flashX,
      flashY: sh.flashY,
    });
    return true;
  }

  buildSupplyBuilding(faction: FactionId, siteId: string, kind: Exclude<SupplyKind, 'Empty'>): boolean {
    if (this.isMatchOver) return false;
    const site = this.buildSites.find((b) => b.id === siteId && b.owner === faction && b.supplyKind === 'Empty');
    if (!site) return false;

    const locStronghold = this.strongholds.find((s) => s.locationNum === site.locationNum && s.owner === faction);
    if (!locStronghold) return false;
    const allowed = STRONGHOLD_STATS[locStronghold.kind].allowedSupply;
    if (!allowed.includes(kind)) return false;

    const cost = this.getEffectiveSupplyCost(faction, kind);
    const comb = this.combatants[faction];
    if (comb.gold < cost) return false;

    comb.gold -= cost;
    site.supplyKind = kind;
    this.recalcAll();
    if (faction === this.playerFaction) {
      this.updatePeakBadgeStats();
    }
    this.emitEvent({
      type: 'supply_built',
      faction,
      nodeId: site.id,
      supplyKind: kind,
      flashX: site.flashX,
      flashY: site.flashY,
    });
    return true;
  }

  canCastSpell(faction: FactionId, spellId: SpellId): boolean {
    if (this.isMatchOver || faction === 'Bandits') return false;
    const def = ALL_SPELLS[spellId];
    if (!def || def.faction !== faction) return false;
    if (faction === this.playerFaction && !this.bonuses.unlockedSpells.includes(spellId)) return false;
    if (faction !== this.playerFaction && !FACTION_SPELL_ORDER[faction].includes(spellId)) return false;
    const comb = this.combatants[faction];
    if (def.kind === 'ultimate') {
      return comb.ultimateCharge >= comb.ultimateMax;
    }
    return comb.mana >= this.getEffectiveSpellCost(faction, spellId);
  }

  castSpell(faction: FactionId, spellId: SpellId, flashX: number, flashY: number): boolean {
    if (!this.canCastSpell(faction, spellId)) return false;
    const comb = this.combatants[faction];
    const def = ALL_SPELLS[spellId];
    const isPlayer = faction === this.playerFaction;
    const manaCost = this.getEffectiveSpellCost(faction, spellId);

    // 1. Instant / Offensive Spells
    if (spellId === 'lords_judgement') {
      comb.mana -= manaCost;
      const rad = def.radius + 16;
      const mul = isPlayer ? this.bonuses.lordsJudgementMul : 1.0;
      for (const sq of this.squads) {
        if (sq.owner === faction || sq.state === 'Dead' || sq.liberationTimer > 0) continue;
        if (dist(sq.flashX, sq.flashY, flashX, flashY) <= rad) {
          for (const m of sq.members) {
            if (!m.alive) continue;
            const dmg = computeLordsJudgementDamage(m.maxHp, mul, this.rng);
            if (dmg >= m.hp) {
              m.hp = 0;
              m.alive = false;
            } else {
              m.hp -= dmg;
            }
          }
          if (countAliveUnits(sq) <= 0) this.handleSquadDestroyed(faction, sq);
        }
      }
      this.emitEvent({ type: 'spell_cast', faction, spellId, flashX, flashY });
      if (isPlayer) this.ai.onPlayerSpellCast(this);
      return true;
    }

    if (spellId === 'summon_stoneworms') {
      comb.mana -= manaCost;
      const rad = def.radius + 16;
      const waves = 1 + (isPlayer ? this.bonuses.stonewormsExtraWaves : 0);
      const waveScale = 1 + 0.35 * (waves - 1);
      for (const sq of this.squads) {
        if (sq.owner === faction || sq.state === 'Dead' || sq.liberationTimer > 0) continue;
        if (dist(sq.flashX, sq.flashY, flashX, flashY) <= rad) {
          const totalDmg = Math.max(12, Math.round(countAliveUnits(sq) * def.power * 3.2 * waveScale));
          const slain = applyDamageToSquad(sq, totalDmg);
          if (slain >= 0 && countAliveUnits(sq) <= 0) this.handleSquadDestroyed(faction, sq);
        }
      }
      this.emitEvent({ type: 'spell_cast', faction, spellId, flashX, flashY });
      if (isPlayer) this.ai.onPlayerSpellCast(this);
      return true;
    }

    if (spellId === 'disentomb') {
      comb.mana -= manaCost;
      const sq = this.spawnAtFlash('k_immortals', faction, flashX, flashY, null, {
        lifetimeSec: def.baseDurationSec,
        isSummoned: true,
      });
      if (!sq) return false;
      this.emitEvent({ type: 'spell_cast', faction, spellId, squadId: sq.id, flashX, flashY });
      if (isPlayer) this.ai.onPlayerSpellCast(this);
      return true;
    }

    if (spellId === 'raise_the_dead') {
      comb.mana -= manaCost;
      const sq = this.spawnAtFlash('e_undying_warriors', faction, flashX, flashY, null, {
        lifetimeSec: def.baseDurationSec,
        isSummoned: true,
      });
      if (!sq) return false;
      this.emitEvent({ type: 'spell_cast', faction, spellId, squadId: sq.id, flashX, flashY });
      return true;
    }

    if (spellId === 'ice_blast') {
      comb.mana -= manaCost;
      const rad = def.radius + 16;
      const dur = def.baseDurationSec + (isPlayer ? this.bonuses.freezeDurationBonusSec : 0);
      for (const sq of this.squads) {
        if (sq.owner === faction || sq.state === 'Dead' || sq.liberationTimer > 0) continue;
        if (dist(sq.flashX, sq.flashY, flashX, flashY) <= rad) {
          const sqDef = UNIT_DEFS[sq.defId];
          if (!hasAbility(sqDef.abilities, 'Mechanism')) {
            sq.frozenTimer = Math.max(sq.frozenTimer, dur);
          }
          const frostDmg = Math.max(10, Math.round(countAliveUnits(sq) * def.power * 2));
          applyDamageToSquad(sq, frostDmg);
          if (countAliveUnits(sq) <= 0) this.handleSquadDestroyed(faction, sq);
        }
      }
      this.emitEvent({ type: 'spell_cast', faction, spellId, flashX, flashY });
      if (isPlayer) this.ai.onPlayerSpellCast(this);
      return true;
    }

    if (spellId === 'frost_enchantment') {
      comb.mana -= manaCost;
      const rad = def.radius + 16;
      for (const sq of this.squads) {
        if (sq.owner !== faction || sq.state === 'Dead') continue;
        if (dist(sq.flashX, sq.flashY, flashX, flashY) <= rad) {
          sq.frostEnchantTimer = Math.max(sq.frostEnchantTimer, def.baseDurationSec);
        }
      }
      this.emitEvent({ type: 'spell_cast', faction, spellId, flashX, flashY });
      if (isPlayer) this.ai.onPlayerSpellCast(this);
      return true;
    }

    if (spellId === 'terror') {
      comb.mana -= manaCost;
      const rad = def.radius + 16;
      for (const sq of this.squads) {
        if (sq.owner === faction || sq.state === 'Dead' || sq.liberationTimer > 0) continue;
        if (dist(sq.flashX, sq.flashY, flashX, flashY) <= rad) {
          sq.heroicTimer = 0;
          if (!hasAbility(UNIT_DEFS[sq.defId].abilities, 'Discipline')) {
            sq.fearTimer = Math.max(sq.fearTimer, def.baseDurationSec);
          }
        }
      }
      this.emitEvent({ type: 'spell_cast', faction, spellId, flashX, flashY });
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
      const durMul = faction === 'Westaria' && isPlayer ? this.bonuses.bannerDurationMul : 1.0;
      const totalDur = def.baseDurationSec * durMul;
      const banner: ActiveBannerState = {
        id: this.nextBannerId++,
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
      this.activeBanners.push(banner);
      if (isPlayer) this.battleStats.bannersSet += 1;
      this.emitEvent({
        type: 'banner_placed',
        faction,
        spellId,
        bannerId: banner.id,
        flashX,
        flashY,
      });
      if (isPlayer) this.ai.onPlayerSpellCast(this);
      return true;
    }

    // 3. Ultimates (4 faction ultimates)
    if (spellId === 'sign_of_advent') {
      comb.ultimateCharge = 0;
      const avatar = this.spawnAtFlash('w_avatar', faction, flashX, flashY, null, {
        lifetimeSec: def.baseDurationSec,
        isAvatar: true,
      });
      if (!avatar) return false;
      if (isPlayer) this.battleStats.ultimatesUsed += 1;
      this.emitEvent({
        type: 'ultimate_cast',
        faction,
        spellId,
        squadId: avatar.id,
        flashX,
        flashY,
      });
      if (isPlayer) this.ai.onPlayerSpellCast(this);
      return true;
    }

    if (spellId === 'cataclysm') {
      comb.ultimateCharge = 0;
      // Meteor barrage across enemy squads, enemy strongholds, and light splash on caster's non-liberated squads
      for (const sq of this.squads) {
        if (sq.state === 'Dead') continue;
        if (sq.owner !== faction) {
          if (sq.liberationTimer > 0) continue;
          for (const m of sq.members) {
            if (!m.alive) continue;
            const dmg = Math.max(8, Math.ceil(m.maxHp * (0.4 + this.rng() * 0.2)));
            if (dmg >= m.hp) {
              m.hp = 0;
              m.alive = false;
            } else {
              m.hp -= dmg;
            }
          }
          if (countAliveUnits(sq) <= 0) this.handleSquadDestroyed(faction, sq);
        } else if (sq.liberationTimer <= 0) {
          for (const m of sq.members) {
            if (!m.alive) continue;
            const selfDmg = Math.max(1, Math.floor(m.maxHp * 0.12));
            m.hp = Math.max(1, m.hp - selfDmg);
          }
        }
      }
      for (const sh of this.strongholds) {
        if (sh.owner === faction) continue;
        const fortDmg = Math.max(80, Math.round(sh.maxHp * 0.25));
        sh.hp = Math.max(0, sh.hp - fortDmg);
        if (sh.hp <= 0) {
          this.captureStronghold(faction, sh);
        }
      }
      if (isPlayer) this.battleStats.ultimatesUsed += 1;
      this.emitEvent({ type: 'ultimate_cast', faction, spellId, flashX, flashY });
      if (isPlayer) this.ai.onPlayerSpellCast(this);
      return true;
    }

    if (spellId === 'grand_transformation') {
      comb.ultimateCharge = 0;
      let harvestedSoldiers = 0;
      for (const sq of this.squads) {
        if (sq.owner === faction || sq.owner === 'Bandits' || sq.state === 'Dead' || sq.liberationTimer > 0) continue;
        const sqDef = UNIT_DEFS[sq.defId];
        if (hasAbility(sqDef.abilities, 'Mechanism')) continue;
        let livingInSquad = 0;
        for (const m of sq.members) {
          if (m.alive) livingInSquad++;
        }
        let targetKills = Math.floor(livingInSquad * 0.5);
        if (targetKills === 0 && livingInSquad >= 1 && this.rng() <= 0.5) targetKills = 1;
        for (const m of sq.members) {
          if (!m.alive || targetKills <= 0) continue;
          m.alive = false;
          m.hp = 0;
          targetKills--;
          harvestedSoldiers++;
        }
        if (countAliveUnits(sq) <= 0) {
          this.handleSquadDestroyed(faction, sq);
        }
      }
      const rewardGold = harvestedSoldiers * def.power;
      const rewardMana = harvestedSoldiers * def.power;
      comb.gold += rewardGold;
      comb.mana = Math.min(MAX_MANA, comb.mana + rewardMana);
      if (isPlayer) {
        this.battleStats.goldCollected += rewardGold;
        this.battleStats.ultimatesUsed += 1;
      }
      this.emitEvent({
        type: 'ultimate_cast',
        faction,
        spellId,
        goldAmount: rewardGold,
        flashX,
        flashY,
      });
      if (isPlayer) this.ai.onPlayerSpellCast(this);
      return true;
    }

    if (spellId === 'call_of_the_grave') {
      comb.ultimateCharge = 0;
      let strikes = 0;
      for (const sq of this.squads) {
        if (strikes >= 2) break;
        if (sq.owner === faction || sq.owner === 'Bandits' || sq.state === 'Dead' || sq.liberationTimer > 0) continue;
        const sqDef = UNIT_DEFS[sq.defId];
        if (hasAbility(sqDef.abilities, 'Undead') || hasAbility(sqDef.abilities, 'Mechanism')) continue;
        strikes++;
        const slain = applyDamageToSquad(sq, Math.max(40, Math.round(sq.members[0].maxHp * 2.5)));
        if (slain >= 0 && countAliveUnits(sq) <= 0) {
          this.handleSquadDestroyed(faction, sq);
          this.spawnAtFlash('e_undying_warriors', faction, sq.flashX, sq.flashY, null, {
            lifetimeSec: 40,
            isSummoned: true,
          });
        }
      }
      this.emitEvent({ type: 'ultimate_cast', faction, spellId, flashX, flashY });
      return true;
    }

    return false;
  }

  orderSquadToNode(squadId: number, nodeId: string): boolean {
    const sq = this.squads.find((s) => s.id === squadId && s.state !== 'Dead');
    const node = this.nav.getNode(nodeId);
    if (!sq || !node) return false;

    const def = UNIT_DEFS[sq.defId];
    sq.pathFlash = this.nav.buildPath(sq.flashX, sq.flashY, node.flashX, node.flashY, node.id);
    sq.targetNodeId = node.id;
    sq.targetSquadId = null;
    sq.garrisonNodeId = null;
    sq.state = sq.pathFlash.length > 0 ? 'Move' : 'Stand';
    sq.animPhase = 'go';
    if (sq.state === 'Move' && hasAbility(def.abilities, 'Charge')) {
      sq.chargeReady = true;
    }
    this.emitEvent({
      type: 'squad_ordered',
      faction: sq.owner,
      squadId: sq.id,
      nodeId,
      flashX: node.flashX,
      flashY: node.flashY,
      unitClass: def.unitClass,
    });
    return true;
  }

  orderSquadToPoint(squadId: number, flashX: number, flashY: number): boolean {
    const sq = this.squads.find((s) => s.id === squadId && s.state !== 'Dead');
    if (!sq) return false;

    const clickedStronghold = this.strongholds.find((sh) => dist(sh.flashX, sh.flashY, flashX, flashY) <= 46);
    if (clickedStronghold) {
      return this.orderSquadToNode(squadId, clickedStronghold.id);
    }

    const def = UNIT_DEFS[sq.defId];
    sq.pathFlash = this.nav.buildPath(sq.flashX, sq.flashY, flashX, flashY);
    sq.targetNodeId = null;
    sq.targetSquadId = null;
    sq.garrisonNodeId = null;
    sq.state = sq.pathFlash.length > 0 ? 'Move' : 'Stand';
    sq.animPhase = 'go';
    if (sq.state === 'Move' && hasAbility(def.abilities, 'Charge')) {
      sq.chargeReady = true;
    }
    this.emitEvent({
      type: 'squad_ordered',
      faction: sq.owner,
      squadId: sq.id,
      flashX,
      flashY,
      unitClass: def.unitClass,
    });
    return true;
  }

  orderSquadToAttackSquad(squadId: number, targetSquadId: number): boolean {
    const target = this.squads.find((s) => s.id === targetSquadId && s.state !== 'Dead');
    if (!target) return false;
    const ok = this.orderSquadToPoint(squadId, target.flashX, target.flashY);
    const sq = this.squads.find((s) => s.id === squadId);
    if (ok && sq) {
      sq.targetSquadId = targetSquadId;
    }
    return ok;
  }

  step(rawDt: number): void {
    if (this.paused || this.isMatchOver || rawDt <= 0) return;

    const dt = Math.min(rawDt, 0.25) * this.speedMultiplier;
    this.elapsedSec += dt;
    this.secondAccum += dt;

    while (this.secondAccum >= 1.0) {
      this.secondAccum -= 1.0;
      this.recalcAll();
      for (const f of ALL_FACTIONS) {
        const beforeGold = this.combatants[f].gold;
        applyOneSecondEconomyTick(this.combatants[f]);
        if (f === this.playerFaction) {
          this.battleStats.goldCollected += Math.max(0, this.combatants[f].gold - beforeGold);
        }
      }
      // Poison DoT & Giantbots regeneration once per second
      this.tickStatusEffectsOneSecond();
      this.updatePeakBadgeStats();
      this.ai.tickCpuOneSecond(this);
    }

    this.updateBanners(dt);

    for (const sq of this.squads) {
      if (sq.state === 'Dead') continue;
      if (sq.heroicTimer > 0) sq.heroicTimer = Math.max(0, sq.heroicTimer - dt);
      if (sq.frozenTimer > 0) sq.frozenTimer = Math.max(0, sq.frozenTimer - dt);
      if (sq.poisonTimer > 0) {
        sq.poisonTimer = Math.max(0, sq.poisonTimer - dt);
        if (sq.poisonTimer <= 0) sq.poisonDps = 0;
      }
      if (sq.frostEnchantTimer > 0) sq.frostEnchantTimer = Math.max(0, sq.frostEnchantTimer - dt);
      if (sq.bloodlustTimer > 0) sq.bloodlustTimer = Math.max(0, sq.bloodlustTimer - dt);
      if (sq.liberationTimer > 0) sq.liberationTimer = Math.max(0, sq.liberationTimer - dt);
      if (sq.fearTimer > 0) sq.fearTimer = Math.max(0, sq.fearTimer - dt);

      if (sq.lifetimeSec !== null) {
        sq.lifetimeSec -= dt;
        if (sq.lifetimeSec <= 0) {
          sq.state = 'Dead';
          continue;
        }
      }
      this.updateSquad(sq, dt);
    }

    this.checkChestPickups();

    const hadDead = this.squads.some((s) => s.state === 'Dead');
    if (hadDead) {
      this.squads = this.squads.filter((s) => s.state !== 'Dead');
      this.recalcAll();
    }

    this.checkWinLoss();
  }

  private tickStatusEffectsOneSecond(): void {
    const pFaction = this.playerFaction;
    for (const sq of this.squads) {
      if (sq.state === 'Dead') continue;
      // Poison DoT
      if (sq.poisonTimer > 0 && sq.poisonDps > 0 && sq.liberationTimer <= 0) {
        const dmg = Math.max(1, Math.round(sq.poisonDps * countAliveUnits(sq)));
        const slain = applyDamageToSquad(sq, dmg);
        if (slain > 0 && countAliveUnits(sq) <= 0) {
          // Credit whichever hostile faction isn't the victim
          const killer: FactionId = sq.owner === pFaction ? this.levelDef.enemies[0] ?? 'TheEmpire' : pFaction;
          this.handleSquadDestroyed(killer, sq);
          continue;
        }
      }
      // Giantbots HP regeneration (Cult Giant Construction edict)
      if (sq.owner === pFaction && sq.defId === 'b_giantbots' && this.bonuses.giantbotRegenPctPerSec > 0) {
        for (const m of sq.members) {
          if (!m.alive || m.hp >= m.maxHp) continue;
          const gain = Math.max(1, Math.round((m.maxHp * this.bonuses.giantbotRegenPctPerSec) / 100));
          m.hp = Math.min(m.maxHp, m.hp + gain);
        }
      }
    }
  }

  private updatePeakBadgeStats(): void {
    const pFaction = this.playerFaction;
    let villages = 0;
    let mines = 0;
    let obelisks = 0;
    for (const bs of this.buildSites) {
      if (bs.owner !== pFaction) continue;
      if (bs.supplyKind === 'Village') villages++;
      else if (bs.supplyKind === 'Mine') mines++;
      else if (bs.supplyKind === 'Obelisk') obelisks++;
    }
    const ownedSquads = this.squads.filter((s) => s.owner === pFaction && s.state !== 'Dead').length;
    if (villages > this.battleStats.maxVillagesOwned) this.battleStats.maxVillagesOwned = villages;
    if (mines > this.battleStats.maxMinesOwned) this.battleStats.maxMinesOwned = mines;
    if (obelisks > this.battleStats.maxObelisksOwned) this.battleStats.maxObelisksOwned = obelisks;
    if (ownedSquads > this.battleStats.maxSquadsOwned) this.battleStats.maxSquadsOwned = ownedSquads;
  }

  private updateBanners(dt: number): void {
    for (let i = this.activeBanners.length - 1; i >= 0; i--) {
      const b = this.activeBanners[i];
      b.remainingSec -= dt;
      b.tickTimer -= dt;
      if (b.tickTimer <= 0) {
        b.tickTimer = BANNER_TICK_SEC;
        for (const sq of this.squads) {
          if (sq.owner !== b.owner || sq.state === 'Dead') continue;
          if (dist(sq.flashX, sq.flashY, b.flashX, b.flashY) > b.radius + 14) continue;
          if (b.spellId === 'banner_consecration' || b.spellId === 'banner_desecration') {
            healAndResurrectSquad(sq, UNIT_DEFS[sq.defId], b.power);
          } else if (b.spellId === 'banner_heroism') {
            if (sq.heroicTimer <= 0 && b.owner === this.playerFaction) {
              this.battleStats.heroicEngagedCount += 1;
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
        this.emitEvent({
          type: 'banner_expired',
          faction: b.owner,
          bannerId: b.id,
          spellId: b.spellId,
          flashX: b.flashX,
          flashY: b.flashY,
        });
        this.activeBanners.splice(i, 1);
      }
    }
  }

  private checkChestPickups(): void {
    for (const ch of this.chests) {
      if (ch.collected) continue;
      const collector = this.squads.find(
        (sq) =>
          sq.owner !== 'Bandits' &&
          sq.state !== 'Dead' &&
          dist(sq.flashX, sq.flashY, ch.flashX, ch.flashY) <= CHEST_PICKUP_DIST,
      );
      if (collector) {
        ch.collected = true;
        this.combatants[collector.owner].gold += ch.gold;
        if (collector.owner === this.playerFaction) {
          this.battleStats.chestsOpened += 1;
          this.battleStats.goldCollected += ch.gold;
        }
        this.emitEvent({
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

  private updateFacing(sq: SquadStateModel, dx: number, dy: number): void {
    if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) return;
    if (Math.abs(dx) >= Math.abs(dy)) {
      sq.facing = dx >= 0 ? 'right' : 'left';
    } else {
      sq.facing = dy >= 0 ? 'down' : 'up';
    }
  }

  private applyOnHitEffects(attacker: SquadStateModel, attackerDef: UnitDefinition, target: SquadStateModel): void {
    if (target.state === 'Dead' || target.liberationTimer > 0) return;
    const targetDef = UNIT_DEFS[target.defId];

    // Poisonous (Khaganate Hunters / Serpent Archers / Poison Catapult)
    const poisonVal = getAbilityValue(attackerDef.abilities, 'Poisonous');
    if (poisonVal > 0 && !hasAbility(targetDef.abilities, 'PoisonImmunity') && !hasAbility(targetDef.abilities, 'Mechanism')) {
      const bonus = attacker.owner === this.playerFaction ? this.bonuses.poisonBonusDamage : 0;
      target.poisonTimer = 4.0;
      target.poisonDps = Math.max(target.poisonDps, poisonVal + bonus);
    }

    // Freeze on attack (Cult Acolytes FreezeArrow, Wizards FreezeBlast, or Rebel Army infantry freeze edict)
    let freezePct = Math.max(
      getAbilityValue(attackerDef.abilities, 'FreezeArrow'),
      getAbilityValue(attackerDef.abilities, 'FreezeBlast'),
    );
    if (
      attacker.owner === this.playerFaction &&
      attackerDef.unitClass === 'Infantry' &&
      this.bonuses.infantryFreezeChancePct > 0
    ) {
      freezePct = Math.max(freezePct, this.bonuses.infantryFreezeChancePct);
    }
    if (freezePct > 0 && !hasAbility(targetDef.abilities, 'Mechanism') && this.rng() * 100 < freezePct) {
      target.frozenTimer = Math.max(target.frozenTimer, 2.0);
    }
  }

  private getEffectiveMoveSpeed(sq: SquadStateModel, def: UnitDefinition): number {
    let spd = def.speed;
    if (sq.owner === this.playerFaction) {
      spd *= this.bonuses.moveSpeedMul;
      if (def.unitClass === 'Siege') {
        spd *= this.bonuses.siegeSpeedMul;
      }
    }
    return spd;
  }

  private awardSquadXp(sq: SquadStateModel, amount: number): void {
    if (sq.owner !== this.playerFaction || sq.state === 'Dead' || sq.vetLevel >= 3) return;
    const mul = this.bonuses.squadXpMul;
    sq.xp += Math.round(amount * mul);
    while (sq.vetLevel < XP_LEVEL_THRESHOLDS.length && sq.xp >= XP_LEVEL_THRESHOLDS[sq.vetLevel]) {
      sq.vetLevel += 1;
      for (const m of sq.members) {
        m.maxHp = Math.round(m.maxHp * 1.1);
        if (m.alive) m.hp = Math.min(m.maxHp, Math.round(m.hp * 1.1));
      }
      this.emitEvent({
        type: 'squad_level_up',
        faction: sq.owner,
        squadId: sq.id,
        flashX: sq.flashX,
        flashY: sq.flashY,
      });
    }
  }

  private updateSquad(sq: SquadStateModel, dt: number): void {
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
    const moveSpeed = this.getEffectiveMoveSpeed(sq, def);
    if (sq.attackTimer > 0) sq.attackTimer = Math.max(0, sq.attackTimer - dt);

    // 1. Check nearby enemy squad engagement
    const aggro = sq.owner === 'Bandits' ? OGRE_AGGRO_DIST : Math.max(MELEE_ENGAGE_FLASH_DIST, def.range);
    const enemySquad = this.findNearestEnemySquad(sq, aggro);
    if (enemySquad) {
      sq.state = 'Fight';
      sq.animPhase = 'attack';
      const dx = enemySquad.flashX - sq.flashX;
      const dy = enemySquad.flashY - sq.flashY;
      this.updateFacing(sq, dx, dy);

      const d = dist(sq.flashX, sq.flashY, enemySquad.flashX, enemySquad.flashY);
      if (def.range === 0 && d > 28) {
        this.moveTowards(sq, enemySquad.flashX, enemySquad.flashY, moveSpeed, dt);
      } else if (sq.attackTimer <= 0) {
        sq.attackTimer = def.attackPeriodSec;
        const enemyDef = UNIT_DEFS[enemySquad.defId];
        const dmg = computeSquadStrikeDamage(
          sq,
          def,
          enemyDef,
          d <= MELEE_ENGAGE_FLASH_DIST,
          this.rng,
          this.bonuses,
          this.playerFaction,
          enemySquad,
        );
        if (sq.chargeReady && d <= MELEE_ENGAGE_FLASH_DIST) {
          sq.chargeReady = false;
        }
        const slain = applyDamageToSquad(enemySquad, dmg);
        this.applyOnHitEffects(sq, def, enemySquad);
        this.emitEvent({
          type: 'attack_hit',
          faction: sq.owner,
          squadId: sq.id,
          flashX: enemySquad.flashX,
          flashY: enemySquad.flashY,
          unitClass: def.unitClass,
        });
        if (slain > 0) {
          this.awardSquadXp(sq, slain * 3);
          if (countAliveUnits(enemySquad) <= 0) {
            this.handleSquadDestroyed(sq.owner, enemySquad);
            this.awardSquadXp(sq, 20);
          }
        }

        // SplashDamage support (Trebuchet / Poison Catapult / Ogre / Avatar)
        const splashPct = getAbilityValue(def.abilities, 'SplashDamage');
        if (splashPct > 0) {
          const splashDmg = Math.max(1, Math.round((dmg * splashPct) / 100));
          for (const extra of this.squads) {
            if (extra.id === enemySquad.id || extra.owner === sq.owner || extra.state === 'Dead') continue;
            if (dist(extra.flashX, extra.flashY, enemySquad.flashX, enemySquad.flashY) <= 44) {
              const sSlain = applyDamageToSquad(extra, splashDmg);
              this.applyOnHitEffects(sq, def, extra);
              if (sSlain > 0 && countAliveUnits(extra) <= 0) {
                this.handleSquadDestroyed(sq.owner, extra);
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
        this.moveTowards(sq, sq.guardHomeFlash.x, sq.guardHomeFlash.y, moveSpeed, dt);
        return;
      }
    }

    // 2. Check enemy stronghold siege engagement (Bandits never besiege strongholds)
    if (sq.owner !== 'Bandits') {
      const enemyFortRange = Math.max(FORTRESS_ENGAGE_FLASH_DIST, def.range);
      const enemyFort = this.findNearestEnemyStronghold(sq, enemyFortRange);
      if (enemyFort) {
        sq.state = 'Fight';
        sq.animPhase = 'attack';
        this.updateFacing(sq, enemyFort.flashX - sq.flashX, enemyFort.flashY - sq.flashY);
        if (sq.attackTimer <= 0) {
          sq.attackTimer = def.attackPeriodSec;
          const dmg = computeFortressDamage(sq, def, enemyFort, this.rng, this.bonuses, this.playerFaction);
          enemyFort.hp = Math.max(0, enemyFort.hp - dmg);
          this.emitEvent({
            type: 'attack_hit',
            faction: sq.owner,
            squadId: sq.id,
            nodeId: enemyFort.id,
            flashX: enemyFort.flashX,
            flashY: enemyFort.flashY,
            unitClass: def.unitClass,
          });
          if (enemyFort.hp <= 0) {
            this.captureStronghold(sq.owner, enemyFort);
            this.awardSquadXp(sq, 60);
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
      const arrived = this.moveTowards(sq, wp.x, wp.y, moveSpeed, dt);
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
      const nearFriendly = this.strongholds.find(
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

  private moveTowards(sq: SquadStateModel, targetFlashX: number, targetFlashY: number, speed: number, dt: number): boolean {
    const targetSim = flashToSim(targetFlashX, targetFlashY);
    const dx = targetSim.x - sq.simX;
    const dy = targetSim.y - sq.simY;
    const d = Math.hypot(dx, dy);
    this.updateFacing(sq, dx, targetFlashY - sq.flashY);

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

  private findNearestEnemySquad(sq: SquadStateModel, maxFlashRange: number): SquadStateModel | null {
    let best: SquadStateModel | null = null;
    let bestD = maxFlashRange;
    for (const other of this.squads) {
      if (other.owner === sq.owner || other.state === 'Dead' || countAliveUnits(other) <= 0) continue;
      const d = dist(sq.flashX, sq.flashY, other.flashX, other.flashY);
      if (d <= bestD) {
        bestD = d;
        best = other;
      }
    }
    return best;
  }

  private findNearestEnemyStronghold(sq: SquadStateModel, maxFlashRange: number): StrongholdState | null {
    let best: StrongholdState | null = null;
    let bestD = maxFlashRange;
    for (const sh of this.strongholds) {
      if (sh.owner === sq.owner) continue;
      const d = dist(sq.flashX, sq.flashY, sh.flashX, sh.flashY);
      if (d <= bestD) {
        bestD = d;
        best = sh;
      }
    }
    return best;
  }

  private handleSquadDestroyed(killer: FactionId, victim: SquadStateModel): void {
    if (victim.state === 'Dead') return;
    victim.state = 'Dead';
    victim.animPhase = 'die';
    if (this.combatants[killer]) this.combatants[killer].kills += 1;
    if (this.combatants[victim.owner]) this.combatants[victim.owner].lost += 1;

    if (killer === this.playerFaction && victim.owner !== this.playerFaction) {
      this.battleStats.enemySquadsDestroyed += 1;
    }

    // Khaganate Dark Teaching: gain ultimate charge when friendly squad dies
    if (victim.owner === this.playerFaction && this.bonuses.deathUltimatePct > 0) {
      const pComb = this.combatants[this.playerFaction];
      if (pComb.magicTowerCount > 0) {
        const gain = Math.max(1, Math.round((pComb.ultimateMax * this.bonuses.deathUltimatePct) / 100));
        pComb.ultimateCharge = Math.min(pComb.ultimateMax, pComb.ultimateCharge + gain);
      }
    }

    const kComb = this.combatants[killer];
    if (kComb && kComb.magicTowerCount > 0) {
      kComb.ultimateCharge = Math.min(kComb.ultimateMax, kComb.ultimateCharge + 4);
    }

    this.emitEvent({
      type: 'squad_killed',
      faction: victim.owner,
      squadId: victim.id,
      flashX: victim.flashX,
      flashY: victim.flashY,
      unitClass: UNIT_DEFS[victim.defId].unitClass,
    });
    this.ai.onSquadKilled(this, victim.id, victim.owner);
    this.recalcAll();
  }

  private captureStronghold(newOwner: FactionId, sh: StrongholdState): void {
    const prevOwner = sh.owner;
    if (prevOwner === newOwner) return;

    sh.owner = newOwner;
    sh.level = 0;
    sh.bonusSupply = 0;
    const baseMax = getStrongholdMaxHp(sh.kind, 0);
    sh.maxHp = newOwner === this.playerFaction ? Math.round(baseMax * this.bonuses.strongholdHpMul) : baseMax;
    sh.hp = Math.round(sh.maxHp * 0.5);

    for (const bs of this.buildSites) {
      if (bs.locationNum === sh.locationNum) {
        bs.owner = newOwner;
      }
    }

    if (newOwner === this.playerFaction) {
      this.battleStats.strongholdsSeized += 1;
      if (this.bonuses.captureGoldBonus > 0) {
        this.combatants[newOwner].gold += this.bonuses.captureGoldBonus;
        this.battleStats.goldCollected += this.bonuses.captureGoldBonus;
      }
    }

    this.recalcAll();
    this.updatePeakBadgeStats();
    const kComb = this.combatants[newOwner];
    if (kComb.magicTowerCount > 0) {
      kComb.ultimateCharge = Math.min(kComb.ultimateMax, kComb.ultimateCharge + 15);
    }

    this.emitEvent({
      type: 'stronghold_captured',
      faction: newOwner,
      nodeId: sh.id,
      flashX: sh.flashX,
      flashY: sh.flashY,
    });
    this.ai.onStrongholdCaptured(this, sh);
  }

  private checkWinLoss(): void {
    if (this.isMatchOver) return;
    const pFaction = this.playerFaction;
    const playerForts = this.strongholds.filter((s) => s.owner === pFaction).length;
    const enemyForts = this.strongholds.filter((s) => s.owner !== pFaction && s.owner !== 'Bandits').length;

    if (playerForts === 0) {
      this.isMatchOver = true;
      const remainingEnemy = this.strongholds.find((s) => s.owner !== pFaction && s.owner !== 'Bandits')?.owner;
      this.winner = remainingEnemy ?? this.levelDef.enemies[0] ?? 'TheEmpire';
      this.medal = null;
      this.emitEvent({ type: 'match_over', winner: this.winner });
    } else if (enemyForts === 0) {
      this.isMatchOver = true;
      this.winner = pFaction;
      this.medal =
        this.elapsedSec < this.levelDef.goldMedalSec
          ? 'Gold'
          : this.elapsedSec <= this.levelDef.silverMedalSec
            ? 'Silver'
            : 'Bronze';
      this.emitEvent({ type: 'match_over', winner: pFaction, rank: this.medal });
    }
  }
}
