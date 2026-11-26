import { CampaignBonuses, EdictDef, EdictId, PlayableCampaignId, SpellId } from './Types';

export const XP_RANK_TABLE: number[] = [
  1000, 2200, 3800, 6000, 9000, 13000, 18200, 24800, 33000, 43000, 55000, 69200, 85800, 105000,
];

export const SKILL_POINTS_PER_RANK = 2;
export const MAX_SKILL_POINTS = 27;

export const WESTARIA_EDICTS: EdictDef[] = [
  {
    id: 'lords_church',
    name: "THE LORD'S CHURCH",
    category: 'magic',
    maxRank: 3,
    ranks: [
      { rank: 1, description: 'Unlocks Banner of Consecration' },
      { rank: 2, description: '+25% banners duration' },
      { rank: 3, description: '+50% banners duration' },
    ],
  },
  {
    id: 'ducal_sovereignty',
    name: 'DUCAL SOVEREIGNTY',
    category: 'economy',
    maxRank: 3,
    ranks: [
      { rank: 1, description: 'Unlocks basic troops' },
      { rank: 2, description: '+75 gold at mission start' },
      { rank: 3, description: '+150 gold at mission start' },
    ],
  },
  {
    id: 'call_crusade',
    name: 'CALL FOR THE CRUSADE',
    category: 'magic',
    maxRank: 3,
    ranks: [
      { rank: 1, description: "Unlocks Lord's Judgement" },
      { rank: 2, description: "+15% Lord's Judgement damage" },
      { rank: 3, description: "+30% Lord's Judgement damage" },
    ],
  },
  {
    id: 'town_guilds',
    name: 'TOWN GUILDS',
    category: 'military',
    maxRank: 3,
    ranks: [
      { rank: 1, description: 'Upgrades Guards to Swordsmen' },
      { rank: 2, description: "+15% strongholds' HP" },
      { rank: 3, description: "+30% strongholds' HP" },
    ],
  },
  {
    id: 'zealots_order',
    name: 'THE ZEALOTS ORDER',
    category: 'magic',
    maxRank: 3,
    ranks: [
      { rank: 1, description: 'Upgrades Monks to Zealots' },
      { rank: 2, description: '-10% ultimate cooldown' },
      { rank: 3, description: '-20% ultimate cooldown' },
    ],
  },
  {
    id: 'mechanics_research',
    name: 'MECHANICS RESEARCH',
    category: 'military',
    maxRank: 3,
    ranks: [
      { rank: 1, description: 'Upgrades Archers to Crossbowmen' },
      { rank: 2, description: '+10% bows & siege damage' },
      { rank: 3, description: '+20% bows & siege damage' },
    ],
  },
  {
    id: 'heroic_epos',
    name: 'HEROIC EPOS',
    category: 'magic',
    maxRank: 3,
    ranks: [
      { rank: 1, description: 'Unlocks Banner of Heroism' },
      { rank: 2, description: '+7% troops base morale' },
      { rank: 3, description: '+15% troops base morale' },
    ],
  },
  {
    id: 'regular_tournaments',
    name: 'REGULAR TOURNAMENTS',
    category: 'military',
    maxRank: 3,
    ranks: [
      { rank: 1, description: 'Upgrades Knights to Champions' },
      { rank: 2, description: 'Cavalry charge causes 2.5x damage' },
      { rank: 3, description: 'Cavalry charge causes 3x damage' },
    ],
  },
  {
    id: 'legion',
    name: 'LEGION',
    category: 'military',
    maxRank: 3,
    ranks: [
      { rank: 1, description: 'Upgrades infantry to Legionaries' },
      { rank: 2, description: '+15% infantry HP' },
      { rank: 3, description: '+30% infantry HP' },
    ],
  },
];

export const KHAGANATE_EDICTS: EdictDef[] = [
  {
    id: 'bloodlust',
    name: 'BLOODLUST',
    category: 'magic',
    maxRank: 3,
    ranks: [
      { rank: 1, description: 'Unlocks Banner of Bloodlust' },
      { rank: 2, description: '+25% damage vs strongholds' },
      { rank: 3, description: '+50% damage vs strongholds' },
    ],
  },
  {
    id: 'declaration_of_war',
    name: 'DECLARATION OF WAR',
    category: 'military',
    maxRank: 3,
    ranks: [
      { rank: 1, description: 'Unlocks basic troops' },
      { rank: 2, description: '+10% troops moving speed' },
      { rank: 3, description: '+20% troops moving speed' },
    ],
  },
  {
    id: 'speaking_to_animals',
    name: 'SPEAKING TO ANIMALS',
    category: 'magic',
    maxRank: 3,
    ranks: [
      { rank: 1, description: 'Unlocks Lure Stoneworms spell' },
      { rank: 2, description: '+1 worm wave (stronger Stoneworms)' },
      { rank: 3, description: '+2 worm waves (stronger Stoneworms)' },
    ],
  },
  {
    id: 'three_days_plunder',
    name: '3 DAYS TO PLUNDER',
    category: 'economy',
    maxRank: 3,
    ranks: [
      { rank: 1, description: 'Upgrades Nomads to Raiders' },
      { rank: 2, description: '+75 gold when capturing a stronghold' },
      { rank: 3, description: '+150 gold when capturing a stronghold' },
    ],
  },
  {
    id: 'raid_the_tombs',
    name: 'RAID THE TOMBS',
    category: 'military',
    maxRank: 3,
    ranks: [
      { rank: 1, description: 'Upgrades Warriors to Immortals' },
      { rank: 2, description: '+1 unit in an Immortals squad' },
      { rank: 3, description: '+2 units in an Immortals squad' },
    ],
  },
  {
    id: 'poisons_research',
    name: 'POISONS RESEARCH',
    category: 'military',
    maxRank: 3,
    ranks: [
      { rank: 1, description: 'Upgrades Hunters to Serpent Archers' },
      { rank: 2, description: '+1 poison damage' },
      { rank: 3, description: '+2 poison damage' },
    ],
  },
  {
    id: 'dark_teaching',
    name: 'DARK TEACHING',
    category: 'magic',
    maxRank: 3,
    ranks: [
      { rank: 1, description: 'Unlocks Disentomb' },
      { rank: 2, description: '+3% ultimate charge when a squad dies' },
      { rank: 3, description: '+6% ultimate charge when a squad dies' },
    ],
  },
  {
    id: 'dreadful_machinery',
    name: 'DREADFUL MACHINERY',
    category: 'military',
    maxRank: 3,
    ranks: [
      { rank: 1, description: 'Upgrades Trebuchet to Poison Catapult' },
      { rank: 2, description: '+50% siege weapons moving speed' },
      { rank: 3, description: '+100% siege weapons moving speed' },
    ],
  },
  {
    id: 'necropolis_excavations',
    name: 'NECROPOLIS EXCAVATIONS',
    category: 'economy',
    maxRank: 3,
    ranks: [
      { rank: 1, description: 'Upgrades cavalry to Ancient Raiders' },
      { rank: 2, description: '-7% cost of your undead troops' },
      { rank: 3, description: '-15% cost of your undead troops' },
    ],
  },
];

export const CULT_EDICTS: EdictDef[] = [
  {
    id: 'arcane_frost',
    name: 'ARCANE FROST',
    category: 'magic',
    maxRank: 3,
    ranks: [
      { rank: 1, description: 'Unlocks Ice Blast' },
      { rank: 2, description: '+1 second to freeze duration' },
      { rank: 3, description: '+2 seconds to freeze duration' },
    ],
  },
  {
    id: 'declaration_of_independence',
    name: 'DECLARATION OF INDEPENDENCE',
    category: 'economy',
    maxRank: 3,
    ranks: [
      { rank: 1, description: 'Unlocks basic troops' },
      { rank: 2, description: '-15% farms, mines and obelisks cost' },
      { rank: 3, description: '-30% farms, mines and obelisks cost' },
    ],
  },
  {
    id: 'artisans_guild',
    name: 'ARTISANS GUILD',
    category: 'military',
    maxRank: 3,
    ranks: [
      { rank: 1, description: 'Upgrades Gunsmiths to Gunbots' },
      { rank: 2, description: '+5% crit chance for mechanisms' },
      { rank: 3, description: '+10% crit chance for mechanisms' },
    ],
  },
  {
    id: 'rebel_army',
    name: 'REBEL ARMY',
    category: 'military',
    maxRank: 3,
    ranks: [
      { rank: 1, description: 'Upgrades Rebels to Myrmidons' },
      { rank: 2, description: '+7% freeze chance for infantry' },
      { rank: 3, description: '+15% freeze chance for infantry' },
    ],
  },
  {
    id: 'magic_library',
    name: 'MAGIC LIBRARY',
    category: 'magic',
    maxRank: 3,
    ranks: [
      { rank: 1, description: 'Unlocks Frost Enchantment' },
      { rank: 2, description: '-10% spells mana cost' },
      { rank: 3, description: '-20% spells mana cost' },
    ],
  },
  {
    id: 'liberation_army',
    name: 'LIBERATION ARMY',
    category: 'magic',
    maxRank: 3,
    ranks: [
      { rank: 1, description: 'Unlocks Banner of Liberation' },
      { rank: 2, description: 'Squads gain XP 15% faster' },
      { rank: 3, description: 'Squads gain XP 30% faster' },
    ],
  },
  {
    id: 'magic_academy',
    name: 'MAGIC ACADEMY',
    category: 'economy',
    maxRank: 3,
    ranks: [
      { rank: 1, description: 'Upgrades Acolytes to Wizards' },
      { rank: 2, description: 'Magic Towers give +1 gold/supply/mana' },
      { rank: 3, description: 'Magic Towers give +2 gold/supply/mana' },
    ],
  },
  {
    id: 'tame_the_reptiles',
    name: 'TAME THE REPTILES',
    category: 'military',
    maxRank: 3,
    ranks: [
      { rank: 1, description: 'Upgrades Lancers to Dragon Lancers' },
      { rank: 2, description: '+10% cavalry HP' },
      { rank: 3, description: '+20% cavalry HP' },
    ],
  },
  {
    id: 'giant_construction',
    name: 'GIANT CONSTRUCTION',
    category: 'military',
    maxRank: 3,
    ranks: [
      { rank: 1, description: 'Upgrades marksmen to Giantbots' },
      { rank: 2, description: 'Giantbots restore 2% HP per second' },
      { rank: 3, description: 'Giantbots restore 4% HP per second' },
    ],
  },
];

export const CAMPAIGN_EDICTS: Record<PlayableCampaignId, EdictDef[]> = {
  Westaria: WESTARIA_EDICTS,
  TheKhaganate: KHAGANATE_EDICTS,
  TheCult: CULT_EDICTS,
};

export const STARTER_EDICTS: Record<PlayableCampaignId, [EdictId, EdictId]> = {
  Westaria: ['lords_church', 'ducal_sovereignty'],
  TheKhaganate: ['bloodlust', 'declaration_of_war'],
  TheCult: ['arcane_frost', 'declaration_of_independence'],
};

export function createDefaultEdictRanks(campaign: PlayableCampaignId = 'Westaria'): Partial<Record<EdictId, number>> {
  const ranks: Partial<Record<EdictId, number>> = {};
  const starters = STARTER_EDICTS[campaign];
  for (const ed of CAMPAIGN_EDICTS[campaign]) {
    ranks[ed.id] = starters.includes(ed.id) ? 1 : 0;
  }
  return ranks;
}

export function computeCampaignBonuses(
  campaign: PlayableCampaignId,
  ranks: Partial<Record<EdictId, number>>,
): CampaignBonuses {
  const g = (id: EdictId) => ranks[id] ?? 0;

  const unlockedSpells: SpellId[] = [];
  let infRaw: 1 | 2 | 3 = 1;
  let arcTier: 1 | 2 | 3 = 1;
  let cavTier: 1 | 2 | 3 = 1;
  let magTier: 1 | 2 = 1;
  let siegeTier: 1 | 2 = 1;

  if (campaign === 'Westaria') {
    unlockedSpells.push('sign_of_advent');
    if (g('lords_church') >= 1) unlockedSpells.push('banner_consecration');
    if (g('call_crusade') >= 1) unlockedSpells.push('lords_judgement');
    if (g('heroic_epos') >= 1) unlockedSpells.push('banner_heroism');
    infRaw = g('legion') >= 1 ? 3 : g('town_guilds') >= 1 ? 2 : 1;
    arcTier = g('mechanics_research') >= 1 ? 2 : 1;
    cavTier = g('regular_tournaments') >= 1 ? 2 : 1;
    magTier = g('zealots_order') >= 1 ? 2 : 1;
  } else if (campaign === 'TheKhaganate') {
    unlockedSpells.push('cataclysm');
    if (g('speaking_to_animals') >= 1) unlockedSpells.push('summon_stoneworms');
    if (g('dark_teaching') >= 1) unlockedSpells.push('disentomb');
    if (g('bloodlust') >= 1) unlockedSpells.push('banner_bloodlust');
    infRaw = g('raid_the_tombs') >= 1 ? 2 : 1;
    arcTier = g('poisons_research') >= 1 ? 2 : 1;
    cavTier = g('necropolis_excavations') >= 1 ? 3 : g('three_days_plunder') >= 1 ? 2 : 1;
    siegeTier = g('dreadful_machinery') >= 1 ? 2 : 1;
  } else {
    unlockedSpells.push('grand_transformation');
    if (g('arcane_frost') >= 1) unlockedSpells.push('ice_blast');
    if (g('magic_library') >= 1) unlockedSpells.push('frost_enchantment');
    if (g('liberation_army') >= 1) unlockedSpells.push('banner_liberation');
    infRaw = g('rebel_army') >= 1 ? 2 : 1;
    arcTier = g('giant_construction') >= 1 ? 3 : g('artisans_guild') >= 1 ? 2 : 1;
    cavTier = g('tame_the_reptiles') >= 1 ? 2 : 1;
    magTier = g('magic_academy') >= 1 ? 2 : 1;
  }

  return {
    campaign,
    infantryTier: infRaw,
    archersTier: arcTier,
    cavalryTier: cavTier,
    magicTier: magTier,
    siegeTier,
    unlockedSpells,

    bannerDurationMul: g('lords_church') >= 3 ? 1.5 : g('lords_church') >= 2 ? 1.25 : 1.0,
    lordsJudgementMul: g('call_crusade') >= 3 ? 1.3 : g('call_crusade') >= 2 ? 1.15 : 1.0,
    startGoldBonus: g('ducal_sovereignty') >= 3 ? 150 : g('ducal_sovereignty') >= 2 ? 75 : 0,
    strongholdHpMul: g('town_guilds') >= 3 ? 1.3 : g('town_guilds') >= 2 ? 1.15 : 1.0,
    ultimateCooldownMul: g('zealots_order') >= 3 ? 0.8 : g('zealots_order') >= 2 ? 0.9 : 1.0,
    rangedSiegeDamageMul: g('mechanics_research') >= 3 ? 1.2 : g('mechanics_research') >= 2 ? 1.1 : 1.0,
    moraleBonusPct: g('heroic_epos') >= 3 ? 15 : g('heroic_epos') >= 2 ? 7 : 0,
    cavalryChargeMul: g('regular_tournaments') >= 3 ? 3.0 : g('regular_tournaments') >= 2 ? 2.5 : 2.0,
    infantryHpMul: g('legion') >= 3 ? 1.3 : g('legion') >= 2 ? 1.15 : 1.0,

    strongholdDamageMul: g('bloodlust') >= 3 ? 1.5 : g('bloodlust') >= 2 ? 1.25 : 1.0,
    moveSpeedMul: g('declaration_of_war') >= 3 ? 1.2 : g('declaration_of_war') >= 2 ? 1.1 : 1.0,
    stonewormsExtraWaves: g('speaking_to_animals') >= 3 ? 2 : g('speaking_to_animals') >= 2 ? 1 : 0,
    captureGoldBonus: g('three_days_plunder') >= 3 ? 150 : g('three_days_plunder') >= 2 ? 75 : 0,
    immortalsExtraUnits: g('raid_the_tombs') >= 3 ? 2 : g('raid_the_tombs') >= 2 ? 1 : 0,
    poisonBonusDamage: g('poisons_research') >= 3 ? 2 : g('poisons_research') >= 2 ? 1 : 0,
    deathUltimatePct: g('dark_teaching') >= 3 ? 6 : g('dark_teaching') >= 2 ? 3 : 0,
    siegeSpeedMul: g('dreadful_machinery') >= 3 ? 2.0 : g('dreadful_machinery') >= 2 ? 1.5 : 1.0,
    undeadCostMul: g('necropolis_excavations') >= 3 ? 0.85 : g('necropolis_excavations') >= 2 ? 0.93 : 1.0,

    freezeDurationBonusSec: g('arcane_frost') >= 3 ? 2 : g('arcane_frost') >= 2 ? 1 : 0,
    supplyCostMul: g('declaration_of_independence') >= 3 ? 0.7 : g('declaration_of_independence') >= 2 ? 0.85 : 1.0,
    mechanismCritPct: g('artisans_guild') >= 3 ? 10 : g('artisans_guild') >= 2 ? 5 : 0,
    infantryFreezeChancePct: g('rebel_army') >= 3 ? 15 : g('rebel_army') >= 2 ? 7 : 0,
    spellCostMul: g('magic_library') >= 3 ? 0.8 : g('magic_library') >= 2 ? 0.9 : 1.0,
    squadXpMul: g('liberation_army') >= 3 ? 1.3 : g('liberation_army') >= 2 ? 1.15 : 1.0,
    magicTowerResourceBonus: g('magic_academy') >= 3 ? 2 : g('magic_academy') >= 2 ? 1 : 0,
    cavalryHpMul: g('tame_the_reptiles') >= 3 ? 1.2 : g('tame_the_reptiles') >= 2 ? 1.1 : 1.0,
    giantbotRegenPctPerSec: g('giant_construction') >= 3 ? 4 : g('giant_construction') >= 2 ? 2 : 0,
  };
}

export function computeWestariaBonuses(ranks: Partial<Record<EdictId, number>>): CampaignBonuses {
  return computeCampaignBonuses('Westaria', ranks);
}

export const DEFAULT_WESTARIA_BONUSES: CampaignBonuses = computeCampaignBonuses(
  'Westaria',
  createDefaultEdictRanks('Westaria'),
);
