// Auto-generated from flash/3986.swf by scripts/extract-all-levels.py
import { LevelDef, PlayableCampaignId } from './Types';

export type LevelMeta = Omit<LevelDef, 'nodes' | 'edges'>;

export type CampaignBundleName = 'bundle_westaria' | 'bundle_khaganate' | 'bundle_cult';

export const CAMPAIGN_BUNDLE_NAMES: Record<PlayableCampaignId, CampaignBundleName> = {
  Westaria: 'bundle_westaria',
  TheKhaganate: 'bundle_khaganate',
  TheCult: 'bundle_cult',
};

export const LEVEL_CATALOG: LevelMeta[] = [
  {
    "id": 1,
    "missionIndex": 1,
    "campaign": "Westaria",
    "playerFaction": "Westaria",
    "name": "The World's Edge",
    "briefing": "The Duchy of Westaria is located on the western islands. It was always safe from the troubles of the continent. But here they come.",
    "bgKey": "map/level1_bg",
    "xpReward": 1000,
    "goldMedalSec": 330,
    "silverMedalSec": 570,
    "mapPin": {
      "x": 139.0,
      "y": 262.2
    },
    "enemies": [
      "TheEmpire"
    ],
    "enemyTechTier": 1,
    "playerStartGold": 550,
    "playerStartMana": 100,
    "enemyStartGold": 200,
    "tutorialMode": "tutorial1"
  },
  {
    "id": 2,
    "missionIndex": 2,
    "campaign": "Westaria",
    "playerFaction": "Westaria",
    "name": "The Empire's End",
    "briefing": "The Crimson Horde was conquered by the Empire ages ago but they never were fully bent. Havoc reigns in Rivadis. And these barbarians are trying to seize our land.",
    "bgKey": "map/level2_bg",
    "xpReward": 1500,
    "goldMedalSec": 330,
    "silverMedalSec": 570,
    "mapPin": {
      "x": 172.3,
      "y": 187.2
    },
    "enemies": [
      "TheKhaganate"
    ],
    "enemyTechTier": 1,
    "playerStartGold": 250,
    "playerStartMana": 100,
    "enemyStartGold": 260,
    "tutorialMode": "tutorial2"
  },
  {
    "id": 3,
    "missionIndex": 3,
    "campaign": "Westaria",
    "playerFaction": "Westaria",
    "name": "Friend Or Foe?",
    "briefing": "We wage a crusade against the filth in the name of The Lord. City of Westport is well fortified against a direct attack. But we can use limited forces to create a springboard for our advancement on the continent.",
    "bgKey": "map/level3_bg",
    "xpReward": 1750,
    "goldMedalSec": 330,
    "silverMedalSec": 570,
    "mapPin": {
      "x": 322.9,
      "y": 138.2
    },
    "enemies": [
      "TheEmpire"
    ],
    "enemyTechTier": 1,
    "playerStartGold": 250,
    "playerStartMana": 100,
    "enemyStartGold": 320,
    "tutorialMode": "none"
  },
  {
    "id": 4,
    "missionIndex": 4,
    "campaign": "Westaria",
    "playerFaction": "Westaria",
    "name": "New Plague",
    "briefing": "We must cut Westport off from the Capital. But the recons report that the rebels from the North were seen there and they are practicing forbidden magic. Our duty is to destroy them along with the necromancers!",
    "bgKey": "map/level4_bg",
    "xpReward": 2000,
    "goldMedalSec": 330,
    "silverMedalSec": 570,
    "mapPin": {
      "x": 414.8,
      "y": 165.7
    },
    "enemies": [
      "TheCult",
      "TheEmpire"
    ],
    "enemyTechTier": 1,
    "playerStartGold": 250,
    "playerStartMana": 100,
    "enemyStartGold": 350,
    "tutorialMode": "none"
  },
  {
    "id": 5,
    "missionIndex": 5,
    "campaign": "Westaria",
    "playerFaction": "Westaria",
    "name": "Light And Magic",
    "briefing": "Our forces on the continent have to fight on two fronts these days. Moreover we have to deal with the Horde too! The only way out is to attack Westport and seize it to secure the transfer of the reinforcement.",
    "bgKey": "map/level5_bg",
    "xpReward": 3000,
    "goldMedalSec": 330,
    "silverMedalSec": 570,
    "mapPin": {
      "x": 322.9,
      "y": 231.7
    },
    "enemies": [
      "TheEmpire",
      "TheKhaganate"
    ],
    "enemyTechTier": 2,
    "playerStartGold": 250,
    "playerStartMana": 100,
    "enemyStartGold": 420,
    "tutorialMode": "none"
  },
  {
    "id": 6,
    "missionIndex": 6,
    "campaign": "Westaria",
    "playerFaction": "Westaria",
    "name": "Remedy",
    "briefing": "The Horde still threatens us from the west coast. Let's wipe them out from the lands granted to us by The Lord!",
    "bgKey": "map/level6_bg",
    "xpReward": 4000,
    "goldMedalSec": 330,
    "silverMedalSec": 570,
    "mapPin": {
      "x": 290.9,
      "y": 338.6
    },
    "enemies": [
      "TheKhaganate"
    ],
    "enemyTechTier": 2,
    "playerStartGold": 250,
    "playerStartMana": 100,
    "enemyStartGold": 460,
    "tutorialMode": "none"
  },
  {
    "id": 7,
    "missionIndex": 7,
    "campaign": "Westaria",
    "playerFaction": "Westaria",
    "name": "Close The Circle",
    "briefing": "Before we attack the Capital we have to complete the outflanking of the left wing. Necromancers are fighting against the northern Cult in these snowy lands. Let's annihilate both of them with one strike!",
    "bgKey": "map/level7_bg",
    "xpReward": 5000,
    "goldMedalSec": 330,
    "silverMedalSec": 570,
    "mapPin": {
      "x": 527.8,
      "y": 172.7
    },
    "enemies": [
      "TheCult",
      "TheEmpire"
    ],
    "enemyTechTier": 2,
    "playerStartGold": 250,
    "playerStartMana": 100,
    "enemyStartGold": 520,
    "tutorialMode": "none"
  },
  {
    "id": 8,
    "missionIndex": 8,
    "campaign": "Westaria",
    "playerFaction": "Westaria",
    "name": "The Final Battle",
    "briefing": "The Empire of Rivadis must get rid of necromancers and regenerate. Hail to the new Empire, hail to the new Emperor! For the Lord's sake!",
    "bgKey": "map/level8_bg",
    "xpReward": 7500,
    "goldMedalSec": 330,
    "silverMedalSec": 570,
    "mapPin": {
      "x": 473.8,
      "y": 281.6
    },
    "enemies": [
      "TheEmpire"
    ],
    "enemyTechTier": 2,
    "playerStartGold": 250,
    "playerStartMana": 120,
    "enemyStartGold": 600,
    "tutorialMode": "none"
  },
  {
    "id": 11,
    "missionIndex": 1,
    "campaign": "TheKhaganate",
    "playerFaction": "TheKhaganate",
    "name": "Rise of the Khan",
    "briefing": "The Horde was defeated and fled in disgrace. But the new khan will lead our warriors to the new victories. We shall requite and our rivals will shed their blood. If they have blood...",
    "bgKey": "map/level11_bg",
    "xpReward": 1000,
    "goldMedalSec": 330,
    "silverMedalSec": 570,
    "mapPin": {
      "x": 375.9,
      "y": 431.2
    },
    "enemies": [
      "TheEmpire"
    ],
    "enemyTechTier": 1,
    "playerStartGold": 250,
    "playerStartMana": 100,
    "enemyStartGold": 200,
    "tutorialMode": "none"
  },
  {
    "id": 12,
    "missionIndex": 2,
    "campaign": "TheKhaganate",
    "playerFaction": "TheKhaganate",
    "name": "Pillaging the West",
    "briefing": "The prophets foresee a great victory. Westarian cowards won't hide behind the thick walls. We'll pillage their towns and temples and seize their coastal strongholds!",
    "bgKey": "map/level12_bg",
    "xpReward": 1500,
    "goldMedalSec": 330,
    "silverMedalSec": 570,
    "mapPin": {
      "x": 300.2,
      "y": 332.2
    },
    "enemies": [
      "Westaria"
    ],
    "enemyTechTier": 1,
    "playerStartGold": 250,
    "playerStartMana": 100,
    "enemyStartGold": 260,
    "tutorialMode": "none"
  },
  {
    "id": 13,
    "missionIndex": 3,
    "campaign": "TheKhaganate",
    "playerFaction": "TheKhaganate",
    "name": "Forefathers' Lands",
    "briefing": "Once the lands on the east were our forefathers' homeland. We can't let the Empire possess it any longer. We'll get it back as we are stronger!",
    "bgKey": "map/level13_bg",
    "xpReward": 1750,
    "goldMedalSec": 330,
    "silverMedalSec": 570,
    "mapPin": {
      "x": 498.3,
      "y": 415.1
    },
    "enemies": [
      "TheEmpire"
    ],
    "enemyTechTier": 1,
    "playerStartGold": 250,
    "playerStartMana": 100,
    "enemyStartGold": 320,
    "tutorialMode": "none"
  },
  {
    "id": 14,
    "missionIndex": 4,
    "campaign": "TheKhaganate",
    "playerFaction": "TheKhaganate",
    "name": "The Eastern Cape",
    "briefing": "The necromancers built their magical laboratories on the eastern cape. We must seize them all before the northern wizards do that.",
    "bgKey": "map/level14_bg",
    "xpReward": 2000,
    "goldMedalSec": 330,
    "silverMedalSec": 570,
    "mapPin": {
      "x": 601.8,
      "y": 380.1
    },
    "enemies": [
      "TheEmpire"
    ],
    "enemyTechTier": 1,
    "playerStartGold": 250,
    "playerStartMana": 100,
    "enemyStartGold": 350,
    "tutorialMode": "none"
  },
  {
    "id": 15,
    "missionIndex": 5,
    "campaign": "TheKhaganate",
    "playerFaction": "TheKhaganate",
    "name": "Clash on the Plateau",
    "briefing": "The northern wizards and Imperial necromancers stand between the Horde and the mountain passes. Let our riders and siege engines crush both armies in one fury!",
    "bgKey": "map/level15_bg",
    "xpReward": 3000,
    "goldMedalSec": 330,
    "silverMedalSec": 570,
    "mapPin": {
      "x": 636.8,
      "y": 257.2
    },
    "enemies": [
      "TheCult",
      "TheEmpire"
    ],
    "enemyTechTier": 2,
    "playerStartGold": 250,
    "playerStartMana": 100,
    "enemyStartGold": 420,
    "tutorialMode": "none"
  },
  {
    "id": 16,
    "missionIndex": 6,
    "campaign": "TheKhaganate",
    "playerFaction": "TheKhaganate",
    "name": "Riches of the North",
    "briefing": "These lands are famous for the riches hidden here. We will seize the mines of The Cult and force the wizards to mine gold and gems for us.",
    "bgKey": "map/level16_bg",
    "xpReward": 4000,
    "goldMedalSec": 330,
    "silverMedalSec": 570,
    "mapPin": {
      "x": 679.8,
      "y": 177.2
    },
    "enemies": [
      "TheCult"
    ],
    "enemyTechTier": 2,
    "playerStartGold": 250,
    "playerStartMana": 100,
    "enemyStartGold": 460,
    "tutorialMode": "none"
  },
  {
    "id": 17,
    "missionIndex": 7,
    "campaign": "TheKhaganate",
    "playerFaction": "TheKhaganate",
    "name": "Secrets of the Grave",
    "briefing": "Our shamans conceived the secrets of the Empire's necromancers and our forefathers are now fighting on our side. The Empire must take these secrets to the grave \u2013 these secrets now belong to us!",
    "bgKey": "map/level17_bg",
    "xpReward": 5000,
    "goldMedalSec": 330,
    "silverMedalSec": 570,
    "mapPin": {
      "x": 534.8,
      "y": 171.2
    },
    "enemies": [
      "TheCult",
      "TheEmpire"
    ],
    "enemyTechTier": 2,
    "playerStartGold": 250,
    "playerStartMana": 100,
    "enemyStartGold": 520,
    "tutorialMode": "none"
  },
  {
    "id": 18,
    "missionIndex": 8,
    "campaign": "TheKhaganate",
    "playerFaction": "TheKhaganate",
    "name": "Rule Over All",
    "briefing": "The Capital of The Empire. The very Empire which have been killing us for ages. This is the time for the Great Khan to rule over all the lands and all the creatures, both alive and dead.",
    "bgKey": "map/level18_bg",
    "xpReward": 7500,
    "goldMedalSec": 330,
    "silverMedalSec": 570,
    "mapPin": {
      "x": 471.8,
      "y": 273.2
    },
    "enemies": [
      "Westaria"
    ],
    "enemyTechTier": 2,
    "playerStartGold": 250,
    "playerStartMana": 120,
    "enemyStartGold": 600,
    "tutorialMode": "none"
  },
  {
    "id": 21,
    "missionIndex": 1,
    "campaign": "TheCult",
    "playerFaction": "TheCult",
    "name": "Awakening of the Cult",
    "briefing": "The Empire enslaved us, the church persecuted our wizards, the steppe barbarians plundered our towns. And when the time came to fight for our freedom we were defeated. We hadn't enough experience, but the Cult evolves.",
    "bgKey": "map/level21_bg",
    "xpReward": 1000,
    "goldMedalSec": 330,
    "silverMedalSec": 570,
    "mapPin": {
      "x": 623.5,
      "y": 146.2
    },
    "enemies": [
      "TheEmpire"
    ],
    "enemyTechTier": 1,
    "playerStartGold": 250,
    "playerStartMana": 100,
    "enemyStartGold": 200,
    "tutorialMode": "none"
  },
  {
    "id": 22,
    "missionIndex": 2,
    "campaign": "TheCult",
    "playerFaction": "TheCult",
    "name": "Remnants of the Empire",
    "briefing": "Alarming reports came from our spies in the Capital: Khan and his shamans are corrupted by necromancy. They sacrifice their enemies and resurrect them. We have to get rid of the Imperial forces' remnants in our homelands.",
    "bgKey": "map/level22_bg",
    "xpReward": 1500,
    "goldMedalSec": 330,
    "silverMedalSec": 570,
    "mapPin": {
      "x": 493.8,
      "y": 146.7
    },
    "enemies": [
      "TheEmpire"
    ],
    "enemyTechTier": 1,
    "playerStartGold": 250,
    "playerStartMana": 100,
    "enemyStartGold": 260,
    "tutorialMode": "none"
  },
  {
    "id": 23,
    "missionIndex": 3,
    "campaign": "TheCult",
    "playerFaction": "TheCult",
    "name": "Fanatic Templars",
    "briefing": "Westaria could be our ally but the fanatic templars don't let our envoy reach the Duke, who is now the Emperor. They hate us even more than they hate the undeads. Let's fight for a free life!",
    "bgKey": "map/level23_bg",
    "xpReward": 1750,
    "goldMedalSec": 330,
    "silverMedalSec": 570,
    "mapPin": {
      "x": 417.8,
      "y": 164.1
    },
    "enemies": [
      "Westaria"
    ],
    "enemyTechTier": 1,
    "playerStartGold": 250,
    "playerStartMana": 100,
    "enemyStartGold": 320,
    "tutorialMode": "none"
  },
  {
    "id": 24,
    "missionIndex": 4,
    "campaign": "TheCult",
    "playerFaction": "TheCult",
    "name": "Border of the Dead",
    "briefing": "Dreadful news comes from The Capital. Undeads crawl from the city. Resurrected Horde warriors rose against their masters. We must stop the undead invasion on our borders.",
    "bgKey": "map/level24_bg",
    "xpReward": 2000,
    "goldMedalSec": 330,
    "silverMedalSec": 570,
    "mapPin": {
      "x": 547.5,
      "y": 194.6
    },
    "enemies": [
      "TheEmpire",
      "TheKhaganate"
    ],
    "enemyTechTier": 1,
    "playerStartGold": 250,
    "playerStartMana": 100,
    "enemyStartGold": 350,
    "tutorialMode": "none"
  },
  {
    "id": 25,
    "missionIndex": 5,
    "campaign": "TheCult",
    "playerFaction": "TheCult",
    "name": "Northern Remedy",
    "briefing": "No one should play with the dark forces. The shamans of Horde believed that these forces obeyed them but they didn't have enough strength. The plague devours the Horde from within. We'll bring the remedy to them.",
    "bgKey": "map/level25_bg",
    "xpReward": 3000,
    "goldMedalSec": 330,
    "silverMedalSec": 570,
    "mapPin": {
      "x": 689.5,
      "y": 176.6
    },
    "enemies": [
      "TheEmpire",
      "TheKhaganate"
    ],
    "enemyTechTier": 2,
    "playerStartGold": 250,
    "playerStartMana": 100,
    "enemyStartGold": 420,
    "tutorialMode": "none"
  },
  {
    "id": 26,
    "missionIndex": 6,
    "campaign": "TheCult",
    "playerFaction": "TheCult",
    "name": "Storm the Plains",
    "briefing": "We have finally allied with the Westarians. Now we can send all the forces to the east and the Westarian army will strike from the south. We'd better hurry up \u2013 our forces on the Capital outskirts are exhausted.",
    "bgKey": "map/level26_bg",
    "xpReward": 4000,
    "goldMedalSec": 330,
    "silverMedalSec": 570,
    "mapPin": {
      "x": 636.5,
      "y": 255.6
    },
    "enemies": [
      "TheKhaganate"
    ],
    "enemyTechTier": 2,
    "playerStartGold": 250,
    "playerStartMana": 100,
    "enemyStartGold": 460,
    "tutorialMode": "none"
  },
  {
    "id": 27,
    "missionIndex": 7,
    "campaign": "TheCult",
    "playerFaction": "TheCult",
    "name": "Encircle the Capital",
    "briefing": "The lands which are not controlled by the Alliance are abundant in undeads. We will strike together with the Westarians and encircle The Capital.",
    "bgKey": "map/level27_bg",
    "xpReward": 5000,
    "goldMedalSec": 330,
    "silverMedalSec": 570,
    "mapPin": {
      "x": 600.5,
      "y": 362.6
    },
    "enemies": [
      "TheEmpire"
    ],
    "enemyTechTier": 2,
    "playerStartGold": 250,
    "playerStartMana": 100,
    "enemyStartGold": 520,
    "tutorialMode": "none"
  },
  {
    "id": 28,
    "missionIndex": 8,
    "campaign": "TheCult",
    "playerFaction": "TheCult",
    "name": "Light and Frost",
    "briefing": "We'll meet the Westarians in the battlefield again but now we'll fight shoulder to shoulder. Let the combined light of The Lord and Northern Magic wipe the undeads out from our world forever!",
    "bgKey": "map/level28_bg",
    "xpReward": 7500,
    "goldMedalSec": 330,
    "silverMedalSec": 570,
    "mapPin": {
      "x": 479.4,
      "y": 270.6
    },
    "enemies": [
      "TheEmpire"
    ],
    "enemyTechTier": 2,
    "playerStartGold": 250,
    "playerStartMana": 120,
    "enemyStartGold": 600,
    "tutorialMode": "none"
  }
];

export const LEVEL_CATALOG_BY_ID: Record<number, LevelMeta> = Object.fromEntries(
  LEVEL_CATALOG.map((lvl) => [lvl.id, lvl]),
);

export const CAMPAIGN_LEVEL_METAS: Record<PlayableCampaignId, LevelMeta[]> = {
  Westaria: LEVEL_CATALOG.filter((l) => l.campaign === 'Westaria'),
  TheKhaganate: LEVEL_CATALOG.filter((l) => l.campaign === 'TheKhaganate'),
  TheCult: LEVEL_CATALOG.filter((l) => l.campaign === 'TheCult'),
};

export function getCampaignLevelMetas(campaign: PlayableCampaignId): LevelMeta[] {
  return CAMPAIGN_LEVEL_METAS[campaign];
}

export function getLevelMetaById(id: number): LevelMeta {
  return LEVEL_CATALOG_BY_ID[id] ?? LEVEL_CATALOG[0];
}

export function getCampaignBundleName(campaign: PlayableCampaignId): CampaignBundleName {
  return CAMPAIGN_BUNDLE_NAMES[campaign];
}
