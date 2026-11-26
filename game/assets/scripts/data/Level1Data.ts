import { MapEdgeDef, MapNodeDef } from './Types';
import { WESTARIA_LEVELS } from './WestariaLevelsData';

const LV1 = WESTARIA_LEVELS[0];

export const LEVEL1_ID = LV1.id;
export const LEVEL1_NAME = LV1.name;
export const PLAYER_START_GOLD = LV1.playerStartGold;
export const PLAYER_START_MANA = LV1.playerStartMana;
export const ENEMY_START_GOLD = LV1.enemyStartGold;
export const ENEMY_START_MANA = 0;

export const GOLD_MEDAL_SEC = LV1.goldMedalSec;
export const SILVER_MEDAL_SEC = LV1.silverMedalSec;

export const LEVEL1_NODES: MapNodeDef[] = LV1.nodes;
export const LEVEL1_EDGES: MapEdgeDef[] = LV1.edges;

export const TUTORIAL1_ENEMY_MARCH_TARGET = { x: 340, y: 290 };

export const TUTORIAL1_HINTS: string[] = [
  'Tutorial 1/4: Click your green Castle (bottom) and recruit Guards (100g).',
  'Tutorial 2/4: Click your Guards squad, then click the marching Undying Warriors or enemy Town to attack!',
  'Tutorial 3/4: Archers unlocked! Build a Farm/Mine on your empty Build Site (flag) and capture the Enemy Town.',
  'Tutorial 4/4: Capture the Purple Castle (top-right) to win Level 1! (Gold Medal < 05:30)',
];

export const TUTORIAL2_HINTS: string[] = [
  'Mission 2: Recruit troops from your War Camp and defeat the Bandit Ogre guarding the Gold Chest (+500g)!',
  'Tip: Use your Banner of Consecration (50 Mana) to heal & resurrect soldiers during battle!',
  'Objective: Capture the Mage Tower to charge Sign of the Advent, then crush the Red Khaganate!',
  'Victory Near: Summon Lord\'s Avatar when charged or seize the Red Castle!',
];
