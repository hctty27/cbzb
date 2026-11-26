import { dist, flashToSim } from '../core/CoordTransform';
import { EventBus } from '../core/EventBus';
import {
  getStrongholdMaxHp,
  MAX_STRONGHOLD_LEVEL,
  STRONGHOLD_STATS,
  STRONGHOLD_UPGRADE_COSTS,
  SUPPLY_STATS,
} from '../data/BuildingsData';
import { DEFAULT_WESTARIA_BONUSES } from '../data/EdictsData';
import { ALL_SPELLS } from '../data/SpellsData';
import {
  ActiveBannerState,
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
import { AiController } from './AiController';
import { hasAbility } from './CombatMath';
import { applyOneSecondEconomyTick, recalculateEconomy } from './EconomySim';
import { GraphNav } from './GraphNav';
import {
  ALL_FACTIONS,
  BASE_ULTIMATE_MAX,
  BattleSimContext,
  CHEST_GOLD_REWARD,
  createMemberOffsets,
  SpawnSquadOptions,
  XP_LEVEL_THRESHOLDS,
} from './SimContext';
import { canCastSpell as resolverCanCastSpell, castSpell as resolverCastSpell, updateBanners } from './SpellResolver';
import { checkChestPickups, tickStatusEffectsOneSecond, updateSquad } from './SquadSystem';

export interface SimEvents {
  event: SimEventPayload;
}

const EMPTY_LEVEL_DEF: LevelDef = {
  id: 0,
  missionIndex: 1,
  campaign: 'Westaria',
  playerFaction: 'Westaria',
  name: 'Empty',
  briefing: '',
  bgKey: 'map/level1_bg',
  xpReward: 0,
  goldMedalSec: 330,
  silverMedalSec: 570,
  mapPin: { x: 0, y: 0 },
  enemies: [],
  enemyTechTier: 1,
  playerStartGold: 0,
  playerStartMana: 0,
  enemyStartGold: 0,
  tutorialMode: 'none',
  nodes: [],
  edges: [],
};

export class BattleSim {
  readonly events = new EventBus<SimEvents>();
  readonly ai = new AiController();

  levelDef: LevelDef = EMPTY_LEVEL_DEF;
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
  private readonly simCtx: BattleSimContext;

  constructor(rng: () => number = Math.random, initialLevel?: LevelDef, bonuses: CampaignBonuses = DEFAULT_WESTARIA_BONUSES) {
    this.rng = rng;
    this.simCtx = this.createSimContext();
    this.loadLevel(initialLevel ?? EMPTY_LEVEL_DEF, bonuses);
  }

  private createSimContext(): BattleSimContext {
    const self = this;
    return {
      get sim() {
        return self;
      },
      get levelDef() {
        return self.levelDef;
      },
      get bonuses() {
        return self.bonuses;
      },
      get playerFaction() {
        return self.playerFaction;
      },
      get isMatchOver() {
        return self.isMatchOver;
      },
      get strongholds() {
        return self.strongholds;
      },
      get buildSites() {
        return self.buildSites;
      },
      get chests() {
        return self.chests;
      },
      get squads() {
        return self.squads;
      },
      get activeBanners() {
        return self.activeBanners;
      },
      get combatants() {
        return self.combatants;
      },
      get battleStats() {
        return self.battleStats;
      },
      get ai() {
        return self.ai;
      },
      rng: () => self.rng(),
      allocateBannerId: () => self.nextBannerId++,
      emitEvent: (payload) => self.emitEvent(payload),
      getEffectiveSpellCost: (faction, spellId) => self.getEffectiveSpellCost(faction, spellId),
      spawnAtFlash: (defId, owner, fx, fy, garrisonNodeId, opts) =>
        self.spawnAtFlash(defId, owner, fx, fy, garrisonNodeId, opts),
      handleSquadDestroyed: (killer, victim) => self.handleSquadDestroyed(killer, victim),
      captureStronghold: (newOwner, sh) => self.captureStronghold(newOwner, sh),
      awardSquadXp: (sq, amount) => self.awardSquadXp(sq, amount),
    };
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

  loadLevel(levelDef: LevelDef = this.levelDef ?? EMPTY_LEVEL_DEF, bonuses: CampaignBonuses = DEFAULT_WESTARIA_BONUSES): void {
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
    opts?: SpawnSquadOptions,
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
    return resolverCanCastSpell(this.simCtx, faction, spellId);
  }

  castSpell(faction: FactionId, spellId: SpellId, flashX: number, flashY: number): boolean {
    return resolverCastSpell(this.simCtx, faction, spellId, flashX, flashY);
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
      tickStatusEffectsOneSecond(this.simCtx);
      this.updatePeakBadgeStats();
      this.ai.tickCpuOneSecond(this);
    }

    updateBanners(this.simCtx, dt);

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
      updateSquad(this.simCtx, sq, dt);
    }

    checkChestPickups(this.simCtx);

    const hadDead = this.squads.some((s) => s.state === 'Dead');
    if (hadDead) {
      this.squads = this.squads.filter((s) => s.state !== 'Dead');
      this.recalcAll();
    }

    this.checkWinLoss();
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
