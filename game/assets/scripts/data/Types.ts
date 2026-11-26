export type PlayableCampaignId = 'Westaria' | 'TheKhaganate' | 'TheCult';

export type FactionId = PlayableCampaignId | 'TheEmpire' | 'Bandits';

export type UnitClass = 'Infantry' | 'Archers' | 'Cavalry' | 'Magic' | 'Siege';

export type StrongholdKind = 'Castle' | 'Town' | 'Camp' | 'MagicTower';

export type SupplyKind = 'Empty' | 'Village' | 'Mine' | 'Obelisk';

export type MedalRank = 'Gold' | 'Silver' | 'Bronze';

export type FacingDir = 'down' | 'left' | 'right' | 'up';

export type AnimPhase = 'go' | 'attack' | 'die';

export type SquadState = 'Stand' | 'Move' | 'Fight' | 'Repair' | 'Dead';

export type BannerSpellId =
  | 'banner_consecration'
  | 'banner_heroism'
  | 'banner_bloodlust'
  | 'banner_liberation'
  | 'banner_desecration';

export type SpellId =
  | 'lords_judgement'
  | 'banner_consecration'
  | 'banner_heroism'
  | 'sign_of_advent'
  | 'summon_stoneworms'
  | 'disentomb'
  | 'banner_bloodlust'
  | 'cataclysm'
  | 'ice_blast'
  | 'frost_enchantment'
  | 'banner_liberation'
  | 'grand_transformation'
  | 'terror'
  | 'raise_the_dead'
  | 'banner_desecration'
  | 'call_of_the_grave';

export type EdictId =
  // Westaria (9)
  | 'lords_church'
  | 'ducal_sovereignty'
  | 'call_crusade'
  | 'town_guilds'
  | 'zealots_order'
  | 'mechanics_research'
  | 'heroic_epos'
  | 'regular_tournaments'
  | 'legion'
  // Khaganate (9)
  | 'bloodlust'
  | 'declaration_of_war'
  | 'speaking_to_animals'
  | 'three_days_plunder'
  | 'raid_the_tombs'
  | 'poisons_research'
  | 'dark_teaching'
  | 'dreadful_machinery'
  | 'necropolis_excavations'
  // Cult (9)
  | 'arcane_frost'
  | 'declaration_of_independence'
  | 'artisans_guild'
  | 'rebel_army'
  | 'magic_library'
  | 'liberation_army'
  | 'magic_academy'
  | 'tame_the_reptiles'
  | 'giant_construction';

export type BadgeId =
  | 'BADGE_WESTARIA_CAMPAIGN_COMPLETE'
  | 'BADGE_HORDE_CAMPAIGN_COMPLETE'
  | 'BADGE_CULT_CAMPAIGN_COMPLETE'
  | 'BADGE_WESTARIA_ALL_PERFECT'
  | 'BADGE_HORDE_ALL_PERFECT'
  | 'BADGE_CULT_ALL_PERFECT'
  | 'BADGE_WESTARIA_ALL_BASE_EDICTS'
  | 'BADGE_HORDE_ALL_BASE_EDICTS'
  | 'BADGE_CULT_ALL_BASE_EDICTS'
  | 'BADGE_ANY_MISSION_PERFECT'
  | 'BADGE_VILLAGES_OWNED'
  | 'BADGE_MINES_OWNED'
  | 'BADGE_OBELISKS_OWNED'
  | 'BADGE_SQUADS_PURCHASED'
  | 'BADGE_BANNERS_SET'
  | 'BADGE_ULTIMATES_USED'
  | 'BADGE_CHESTS_OPENED'
  | 'BADGE_ENEMY_SQUADS_DESTROYED'
  | 'BADGE_HEROIC_MODE_ENGAGED'
  | 'BADGE_GOLD_COLLECTED'
  | 'BADGE_SQUADS_OWNED'
  | 'BADGE_STRONGHOLDS_SIEZED';

export interface BadgeDef {
  id: BadgeId;
  index: number;
  name: string;
  description: string;
  threshold: number;
}

export interface BattleBadgeStats {
  maxVillagesOwned: number;
  maxMinesOwned: number;
  maxObelisksOwned: number;
  maxSquadsOwned: number;
  squadsPurchased: number;
  bannersSet: number;
  ultimatesUsed: number;
  chestsOpened: number;
  enemySquadsDestroyed: number;
  heroicEngagedCount: number;
  goldCollected: number;
  strongholdsSeized: number;
}

export interface UnitDefinition {
  id: string;
  name: string;
  faction: FactionId;
  unitClass: UnitClass;
  techLevel: number;
  hpPerUnit: number;
  unitsCount: number;
  dmgMin: number;
  dmgMax: number;
  attackPeriodSec: number;
  range: number;
  meleePenaltyPct: number;
  morale: number;
  speed: number;
  cost: number;
  upkeep: number;
  abilities: string[];
  iconKey: string;
  spritePrefix: string;
}

export interface StrongholdStats {
  kind: StrongholdKind;
  name: string;
  baseHp: number;
  goldIncome: number;
  manaIncome: number;
  foodSupply: number;
  allowedSupply: SupplyKind[];
}

export interface SupplyStats {
  kind: SupplyKind;
  nameWestaria: string;
  nameEmpire: string;
  cost: number;
  goldIncome: number;
  manaIncome: number;
  foodSupply: number;
}

export interface MapNodeDef {
  id: string;
  label: string;
  kind: 'Stronghold' | 'Junction' | 'BuildSite' | 'Chest' | 'OgreGuard';
  strongholdKind?: StrongholdKind;
  locationNum: number;
  initialOwner?: FactionId;
  flashX: number;
  flashY: number;
}

export interface MapEdgeDef {
  id: string;
  from: string;
  to: string;
  /** Intermediate waypoints in Flash coordinates ordered from `from` -> `to`. */
  waypoints: Array<{ x: number; y: number }>;
}

export interface LevelDef {
  id: number;
  missionIndex: number;
  campaign: PlayableCampaignId;
  playerFaction: PlayableCampaignId;
  name: string;
  briefing: string;
  bgKey: string;
  xpReward: number;
  goldMedalSec: number;
  silverMedalSec: number;
  mapPin: { x: number; y: number };
  enemies: FactionId[];
  enemyTechTier: 1 | 2;
  playerStartGold: number;
  playerStartMana: number;
  enemyStartGold: number;
  tutorialMode: 'tutorial1' | 'tutorial2' | 'none';
  nodes: MapNodeDef[];
  edges: MapEdgeDef[];
}

export interface CombatantState {
  faction: FactionId;
  gold: number;
  mana: number;
  grossGoldPerSec: number;
  netGoldPerSec: number;
  manaPerSec: number;
  totalSupply: number;
  usedSupply: number;
  upkeepSquads: number;
  magicTowerCount: number;
  ultimateCharge: number;
  ultimateMax: number;
  kills: number;
  lost: number;
}

export interface StrongholdState {
  id: string;
  name: string;
  kind: StrongholdKind;
  locationNum: number;
  owner: FactionId;
  level: number;
  hp: number;
  maxHp: number;
  bonusSupply: number;
  flashX: number;
  flashY: number;
  simX: number;
  simY: number;
}

export interface BuildSiteState {
  id: string;
  locationNum: number;
  owner: FactionId;
  supplyKind: SupplyKind;
  flashX: number;
  flashY: number;
  simX: number;
  simY: number;
}

export interface ChestState {
  id: string;
  gold: number;
  collected: boolean;
  flashX: number;
  flashY: number;
  simX: number;
  simY: number;
}

export interface SquadUnitMember {
  hp: number;
  maxHp: number;
  alive: boolean;
  offsetX: number;
  offsetY: number;
}

export interface SquadStateModel {
  id: number;
  defId: string;
  owner: FactionId;
  state: SquadState;
  flashX: number;
  flashY: number;
  simX: number;
  simY: number;
  facing: FacingDir;
  animPhase: AnimPhase;
  targetNodeId: string | null;
  targetSquadId: number | null;
  pathFlash: Array<{ x: number; y: number }>;
  attackTimer: number;
  repairTimer: number;
  morale: number;
  maxMorale: number;
  heroicTimer: number;
  frozenTimer: number;
  poisonTimer: number;
  poisonDps: number;
  frostEnchantTimer: number;
  bloodlustTimer: number;
  bloodlustPower: number;
  liberationTimer: number;
  fearTimer: number;
  xp: number;
  vetLevel: number;
  chargeReady: boolean;
  lifetimeSec: number | null;
  isAvatar?: boolean;
  isSummoned?: boolean;
  guardHomeFlash?: { x: number; y: number };
  members: SquadUnitMember[];
  upkeep: number;
  isTutorialSquad?: boolean;
  garrisonNodeId: string | null;
}

export interface SpellDef {
  id: SpellId;
  faction: FactionId;
  name: string;
  shortName: string;
  kind: 'instant' | 'banner' | 'ultimate';
  costMana: number;
  radius: number;
  power: number;
  baseDurationSec: number;
  hint: string;
  iconKey: string;
}

export interface ActiveBannerState {
  id: number;
  spellId: BannerSpellId;
  owner: FactionId;
  flashX: number;
  flashY: number;
  radius: number;
  power: number;
  remainingSec: number;
  totalDurationSec: number;
  tickTimer: number;
}

export interface EdictRankEffect {
  rank: number;
  description: string;
}

export interface EdictDef {
  id: EdictId;
  name: string;
  category: 'magic' | 'military' | 'economy';
  maxRank: 3;
  ranks: EdictRankEffect[];
}

export interface CampaignBonuses {
  campaign: PlayableCampaignId;
  infantryTier: 1 | 2 | 3;
  archersTier: 1 | 2 | 3;
  cavalryTier: 1 | 2 | 3;
  magicTier: 1 | 2;
  siegeTier: 1 | 2;
  unlockedSpells: SpellId[];
  // Westaria modifiers
  bannerDurationMul: number;
  lordsJudgementMul: number;
  startGoldBonus: number;
  strongholdHpMul: number;
  ultimateCooldownMul: number;
  rangedSiegeDamageMul: number;
  moraleBonusPct: number;
  cavalryChargeMul: number;
  infantryHpMul: number;
  // Khaganate modifiers
  strongholdDamageMul: number;
  moveSpeedMul: number;
  stonewormsExtraWaves: number;
  captureGoldBonus: number;
  immortalsExtraUnits: number;
  poisonBonusDamage: number;
  deathUltimatePct: number;
  siegeSpeedMul: number;
  undeadCostMul: number;
  // Cult modifiers
  freezeDurationBonusSec: number;
  supplyCostMul: number;
  mechanismCritPct: number;
  infantryFreezeChancePct: number;
  spellCostMul: number;
  squadXpMul: number;
  magicTowerResourceBonus: number;
  cavalryHpMul: number;
  giantbotRegenPctPerSec: number;
}

export type WestariaBonuses = CampaignBonuses;

export interface LevelCompletionRecord {
  completed: boolean;
  bestMedal: MedalRank | null;
  bestTimeSec: number | null;
}

export interface CampaignSaveState {
  xp: number;
  edictRanks: Partial<Record<EdictId, number>>;
  levels: Record<number, LevelCompletionRecord>;
  selectedLevelId: number;
}

export interface MultiCampaignSaveState {
  version: 3;
  activeCampaign: PlayableCampaignId;
  campaigns: Record<PlayableCampaignId, CampaignSaveState>;
  badges: Partial<Record<BadgeId, boolean>>;
}

export interface SimEventPayload {
  type:
    | 'squad_bought'
    | 'squad_ordered'
    | 'attack_hit'
    | 'squad_killed'
    | 'squad_level_up'
    | 'stronghold_captured'
    | 'stronghold_upgraded'
    | 'supply_built'
    | 'spell_cast'
    | 'banner_placed'
    | 'banner_expired'
    | 'ultimate_cast'
    | 'chest_collected'
    | 'tutorial_step'
    | 'match_over';
  faction?: FactionId;
  nodeId?: string;
  squadId?: number;
  bannerId?: number;
  spellId?: SpellId;
  goldAmount?: number;
  flashX?: number;
  flashY?: number;
  unitClass?: UnitClass;
  supplyKind?: SupplyKind;
  tutorialStep?: number;
  winner?: FactionId;
  rank?: MedalRank;
}
