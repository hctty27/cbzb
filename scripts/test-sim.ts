import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { retryAsync, withTimeout } from '../game/assets/scripts/core/AsyncRetry.ts';
import { cocosToFlash, dist, flashToCocos } from '../game/assets/scripts/core/CoordTransform.ts';
import { SPRITE_MANIFEST } from '../game/assets/scripts/data/AssetManifest.ts';
import { BADGES } from '../game/assets/scripts/data/BadgesData.ts';
import { CampaignProgressStore, createMemoryStorageAdapter } from '../game/assets/scripts/data/CampaignProgress.ts';
import { CAMPAIGN_EDICTS } from '../game/assets/scripts/data/EdictsData.ts';
import {
  getBadgeDesc,
  getBadgeName,
  getEdictName,
  getEdictRankDesc,
  getLanguage,
  getLevelBriefing,
  getLevelName,
  getSpellName,
  getUnitName,
  setLanguage,
  t,
} from '../game/assets/scripts/data/I18n.ts';
import { GOLD_MEDAL_SEC, PLAYER_START_GOLD, PLAYER_START_MANA } from '../game/assets/scripts/data/Level1Data.ts';
import {
  getCampaignBundleName,
  getCampaignLevelMetas,
  getLevelMetaById,
  LEVEL_CATALOG,
} from '../game/assets/scripts/data/LevelCatalog.ts';
import { ALL_SPELLS } from '../game/assets/scripts/data/SpellsData.ts';
import { LevelDef, PlayableCampaignId, SpellId } from '../game/assets/scripts/data/Types.ts';
import { getRecruitIdsForFaction, getWestariaRecruitIds, UNIT_DEFS } from '../game/assets/scripts/data/UnitsData.ts';
import { UserSettingsStore } from '../game/assets/scripts/data/UserSettings.ts';
import { BattleSim } from '../game/assets/scripts/sim/BattleSim.ts';
import { countAliveUnits, getSquadTotalHp } from '../game/assets/scripts/sim/CombatMath.ts';
import { computeNetGoldSpeed } from '../game/assets/scripts/sim/EconomySim.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(ROOT, 'game', 'assets');

const ALL_LEVELS: LevelDef[] = LEVEL_CATALOG.map((meta) => {
  const bundle = getCampaignBundleName(meta.campaign);
  const jsonPath = path.join(ASSETS_DIR, 'bundles', bundle, 'levels', `level_${meta.id}.json`);
  const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8')) as LevelDef;
  assert.equal(parsed.id, meta.id);
  assert.equal(parsed.bgKey, meta.bgKey);
  return parsed;
});

const LEVELS_BY_ID = new Map<number, LevelDef>(ALL_LEVELS.map((l) => [l.id, l]));
const getCampaignLevels = (campaign: PlayableCampaignId): LevelDef[] => ALL_LEVELS.filter((l) => l.campaign === campaign);
const getLevelById = (id: number): LevelDef => LEVELS_BY_ID.get(id) ?? ALL_LEVELS[0];
const WESTARIA_LEVELS = getCampaignLevels('Westaria');
const getWestariaLevel = (id: number): LevelDef => getLevelById(id);

// 1. CoordTransform round-trip & 16:9 mapping
{
  const center = flashToCocos(400, 300);
  assert.equal(Math.round(center.x), 0);
  assert.equal(Math.round(center.y), 0);
  const back = cocosToFlash(center.x, center.y);
  assert.ok(Math.abs(back.x - 400) < 0.01 && Math.abs(back.y - 300) < 0.01);
}

// 2. GraphNav shortest path & waypoints from Westaria Castle (057) -> Empire Town (077) -> Empire Castle (007)
{
  const lv1 = getLevelById(1);
  const sim = new BattleSim(() => 0.5, lv1);
  const pathToTown = sim.nav.findNodePath('057', '077');
  assert.deepEqual(pathToTown, ['057', '040', '060', '070', '077']);

  const pathToEmpireCastle = sim.nav.findNodePath('077', '007');
  assert.deepEqual(pathToEmpireCastle, ['077', '070', '080', '010', '007']);

  const poly = sim.nav.buildPath(450.95, 384.7, 150.75, 231.35, '077');
  assert.ok(poly.length >= 6, `Expected intermediate edge waypoints, got ${poly.length}`);
  const last = poly[poly.length - 1];
  assert.ok(Math.abs(last.x - 150.75) < 1 && Math.abs(last.y - 231.35) < 1);
  assert.equal(lv1.nodes.length, 10);
}

// 3. EconomySim starting state, tax decay, supply building, stronghold upgrade
{
  assert.equal(computeNetGoldSpeed(10, 0), 10);
  assert.equal(computeNetGoldSpeed(10, 1), 7);
  assert.equal(computeNetGoldSpeed(10, 2), 7);
  assert.equal(computeNetGoldSpeed(10, 10), 3);

  const sim = new BattleSim(() => 0.5, getLevelById(1));
  const p = sim.getCombatant('Westaria');
  assert.equal(p.gold, PLAYER_START_GOLD);
  assert.equal(p.mana, PLAYER_START_MANA);
  assert.equal(p.totalSupply, 2);
  assert.equal(p.usedSupply, 0);

  const upOk = sim.upgradeStronghold('Westaria', '057');
  assert.equal(upOk, true);
  assert.equal(p.gold, 200);
  const castle = sim.strongholds.find((s) => s.id === '057')!;
  assert.equal(castle.level, 1);
  assert.equal(castle.maxHp, 1500);
}

// 4. Tutorial 1 progression + Victory with Gold medal
{
  const sim = new BattleSim(() => 0.5, getLevelById(1));
  assert.equal(sim.isUnitUnlockedForPlayer('w_guards'), true);
  assert.equal(sim.isUnitUnlockedForPlayer('w_archers'), false);
  assert.equal(sim.recruitUnit('Westaria', '057', 'w_archers'), null);

  const g1 = sim.recruitUnit('Westaria', '057', 'w_guards');
  assert.ok(g1);
  assert.equal(sim.ai.tutorialStep, 1);

  const g2 = sim.recruitUnit('Westaria', '057', 'w_guards');
  assert.ok(g2);
  sim.orderSquadToNode(g1.id, '077');
  sim.orderSquadToNode(g2.id, '077');

  for (let i = 0; i < 1800; i++) {
    sim.step(0.1);
    if (i % 20 === 0) {
      const comb = sim.getCombatant('Westaria');
      if (comb.totalSupply - comb.usedSupply > 0) {
        if (sim.isUnitUnlockedForPlayer('w_archers') && comb.gold >= 120) {
          sim.recruitUnit('Westaria', '057', 'w_archers');
        } else if (comb.gold >= 100) {
          sim.recruitUnit('Westaria', '057', 'w_guards');
        }
      }
      const pSquads = sim.squads.filter((s) => s.owner === 'Westaria' && s.state !== 'Dead');
      if (pSquads.length >= 2 || sim.squads.some((s) => s.owner === 'Westaria' && s.state === 'Fight')) {
        for (const sq of pSquads) {
          if (sq.state === 'Stand') sim.orderSquadToNode(sq.id, '077');
        }
      }
    }
    if (sim.ai.tutorialStep >= 3) break;
  }
  assert.ok(sim.ai.tutorialStep >= 2, 'Tutorial skirmish enemy squad should be defeated');
  assert.equal(sim.isUnitUnlockedForPlayer('w_archers'), true);
  const town = sim.strongholds.find((s) => s.id === '077')!;
  assert.equal(town.owner, 'Westaria', 'Empire Town should be captured by Westaria');
  assert.equal(sim.ai.tutorialStep, 3);

  for (let t = 0; t < 2000 && !sim.isMatchOver; t++) {
    sim.step(0.1);
    if (t % 50 === 0) {
      const comb = sim.getCombatant('Westaria');
      if (comb.totalSupply - comb.usedSupply > 0 && comb.gold >= 180) {
        sim.recruitUnit('Westaria', '057', 'w_knights');
      } else if (comb.totalSupply - comb.usedSupply > 0 && comb.gold >= 100) {
        sim.recruitUnit('Westaria', '057', 'w_guards');
      }
      for (const sq of sim.squads) {
        if (sq.owner === 'Westaria' && sq.state === 'Stand') {
          sim.orderSquadToNode(sq.id, '007');
        }
      }
    }
  }
  assert.equal(sim.isMatchOver, true, 'Match should reach Victory');
  assert.equal(sim.winner, 'Westaria');
  assert.ok(sim.elapsedSec < GOLD_MEDAL_SEC, `Expected fast clear <330s, got ${sim.elapsedSec}`);
  assert.equal(sim.medal, 'Gold');
}

// 5. Defeat condition when player owns 0 strongholds
{
  const sim = new BattleSim(() => 0.5, getLevelById(1));
  const playerCastle = sim.strongholds.find((s) => s.id === '057')!;
  playerCastle.hp = 5;
  const enemy = sim.squads.find((s) => s.owner === 'TheEmpire')!;
  enemy.flashX = playerCastle.flashX;
  enemy.flashY = playerCastle.flashY;
  enemy.simX = playerCastle.simX;
  enemy.simY = playerCastle.simY;
  enemy.pathFlash = [];
  for (let i = 0; i < 40 && !sim.isMatchOver; i++) {
    sim.step(0.1);
  }
  assert.equal(sim.isMatchOver, true);
  assert.equal(sim.winner, 'TheEmpire');
}

// 6. Phase 2: All 8 Westaria Levels load cleanly with connected graphs & valid strongholds
{
  assert.equal(WESTARIA_LEVELS.length, 8);
  const sim = new BattleSim(() => 0.5);
  for (const lvl of WESTARIA_LEVELS) {
    sim.loadLevel(lvl);
    const pForts = sim.strongholds.filter((s) => s.owner === 'Westaria');
    const eForts = sim.strongholds.filter((s) => s.owner !== 'Westaria' && s.owner !== 'Bandits');
    assert.ok(pForts.length >= 1, `Level ${lvl.id} should have at least 1 Westaria fort`);
    assert.ok(eForts.length >= 1, `Level ${lvl.id} should have at least 1 enemy fort`);
    const p = sim.nav.findNodePath(pForts[0].id, eForts[0].id);
    assert.equal(p[0], pForts[0].id);
    assert.equal(p[p.length - 1], eForts[0].id);
  }
}

// 7. Phase 2: CampaignProgressStore XP -> Rank -> SkillPoints -> Edicts & Unit Upgrades
{
  const prog = new CampaignProgressStore(false, createMemoryStorageAdapter());
  assert.equal(prog.getRank(), 1);
  assert.equal(prog.getMaxUnlockedLevelId(), 1);
  assert.equal(prog.getAvailableSkillPoints(), 0); // 2 pts at Rank 1 spent on ducal_sovereignty Lv1 + lords_church Lv1

  const summary = prog.recordVictory(1, 'Gold', 180);
  assert.equal(summary.xpEarned, 1250);
  assert.equal(prog.getRank(), 2);
  assert.equal(summary.skillPointsGained, 2);
  assert.equal(prog.getMaxUnlockedLevelId(), 2);
  assert.equal(prog.getAvailableSkillPoints(), 2);

  assert.equal(prog.upgradeEdict('call_crusade'), true);
  assert.equal(prog.upgradeEdict('town_guilds'), true);
  assert.equal(prog.getAvailableSkillPoints(), 0);

  const bonuses = prog.getBonuses();
  assert.ok(bonuses.unlockedSpells.includes('lords_judgement'));
  assert.equal(bonuses.infantryTier, 2);
  const recruitIds = getWestariaRecruitIds(bonuses);
  assert.equal(recruitIds[0], 'w_swordsmen');

  prog.resetEdicts();
  assert.equal(prog.getAvailableSkillPoints(), 2);
}

// 8. Phase 2: Spells, Banners & Ultimate (Consecration, Heroism, Lord's Judgement, MagicTower + Sign of Advent)
{
  const prog = new CampaignProgressStore(false, createMemoryStorageAdapter());
  prog.recordVictory(1, 'Gold', 120); // +2 pts -> Rank 2
  prog.upgradeEdict('call_crusade');
  prog.upgradeEdict('heroic_epos');
  const bonuses = prog.getBonuses();

  const sim = new BattleSim(() => 0.5);
  sim.loadLevel(getWestariaLevel(2), bonuses);
  const player = sim.getCombatant('Westaria');
  const camp = sim.strongholds.find((s) => s.owner === 'Westaria')!;

  player.mana = 400;
  camp.bonusSupply = 2;
  sim.recalcAll();
  const g = sim.recruitUnit('Westaria', camp.id, 'w_guards')!;
  g.members[0].hp = 5;
  g.members[1].alive = false;
  g.members[1].hp = 0;

  assert.equal(sim.castSpell('Westaria', 'banner_consecration', g.flashX, g.flashY), true);
  sim.step(0.1);
  assert.ok(g.members[0].hp > 5, 'Consecration should heal wounded guard');
  assert.equal(g.members[1].alive, true, 'Consecration should resurrect fallen guard');

  assert.equal(sim.castSpell('Westaria', 'banner_heroism', g.flashX, g.flashY), true);
  sim.step(0.1);
  assert.ok(g.heroicTimer > 0, 'Heroism banner should make squad heroic');

  const ogre = sim.squads.find((s) => s.owner === 'Bandits')!;
  const ogreBefore = getSquadTotalHp(ogre).hp;
  assert.equal(sim.castSpell('Westaria', 'lords_judgement', ogre.flashX, ogre.flashY), true);
  assert.ok(getSquadTotalHp(ogre).hp < ogreBefore, "Lord's Judgement should damage Ogre");

  const mageTower = sim.strongholds.find((s) => s.kind === 'MagicTower')!;
  mageTower.owner = 'Westaria';
  sim.squads = sim.squads.filter(
    (s) => s.owner === 'Westaria' || dist(s.flashX, s.flashY, mageTower.flashX, mageTower.flashY) > 65,
  );
  sim.recalcAll();
  assert.equal(player.magicTowerCount, 1);
  for (let i = 0; i < 800; i++) sim.step(0.25);
  assert.equal(player.ultimateCharge, player.ultimateMax);
  assert.equal(sim.canCastSpell('Westaria', 'sign_of_advent'), true);
  assert.equal(sim.castSpell('Westaria', 'sign_of_advent', camp.flashX, camp.flashY), true);
  const avatar = sim.squads.find((s) => s.isAvatar && countAliveUnits(s) > 0);
  assert.ok(avatar, 'Sign of the Advent should summon Avatar squad');
}

// 9. Phase 2: Gold Chest pickup (+500g) & Multi-Faction Level 4 simulation (Empire + Cult)
{
  const sim = new BattleSim(() => 0.5);
  sim.loadLevel(getWestariaLevel(2));
  const ch = sim.chests[0];
  assert.ok(ch);
  const p = sim.getCombatant('Westaria');
  const startGold = p.gold;
  const camp = sim.strongholds.find((s) => s.owner === 'Westaria')!;
  const site = sim.buildSites.find((b) => b.owner === 'Westaria')!;
  assert.equal(sim.buildSupplyBuilding('Westaria', site.id, 'Village'), true);
  const sq = sim.recruitUnit('Westaria', camp.id, 'w_guards')!;
  assert.ok(sq);
  sq.flashX = ch.flashX;
  sq.flashY = ch.flashY;
  sim.step(0.1);
  assert.equal(ch.collected, true);
  assert.equal(p.gold, startGold - 150 - 100 + 500);

  sim.loadLevel(getWestariaLevel(4));
  const empCastle = sim.strongholds.find((s) => s.owner === 'TheEmpire')!;
  const cultCastle = sim.strongholds.find((s) => s.owner === 'TheCult')!;
  assert.ok(empCastle && cultCastle);
  for (let i = 0; i < 20; i++) sim.step(1.0);
  assert.ok(
    dist(empCastle.flashX, empCastle.flashY, cultCastle.flashX, cultCastle.flashY) > 0,
    'Multi-faction AI should step cleanly without errors',
  );
}

// 10. Phase 3: All 24 Levels (Westaria 1-8, Khaganate 11-18, Cult 21-28) load cleanly with connected graphs
{
  assert.equal(ALL_LEVELS.length, 24);
  assert.equal(getCampaignLevels('Westaria').length, 8);
  assert.equal(getCampaignLevels('TheKhaganate').length, 8);
  assert.equal(getCampaignLevels('TheCult').length, 8);

  const sim = new BattleSim(() => 0.5);
  for (const lvl of ALL_LEVELS) {
    sim.loadLevel(lvl);
    assert.equal(sim.playerFaction, lvl.campaign);
    const pForts = sim.strongholds.filter((s) => s.owner === lvl.playerFaction);
    const eForts = sim.strongholds.filter((s) => s.owner !== lvl.playerFaction && s.owner !== 'Bandits');
    assert.ok(pForts.length >= 1, `Level ${lvl.id} should have player fort`);
    assert.ok(eForts.length >= 1, `Level ${lvl.id} should have enemy fort`);
    const p = sim.nav.findNodePath(pForts[0].id, eForts[0].id);
    assert.equal(p[0], pForts[0].id);
    assert.equal(p[p.length - 1], eForts[0].id);
  }
}

// 11. Phase 3: Khaganate Edicts, T3 Ancient Raiders, Stoneworms, Disentomb, Banner of Bloodlust, Cataclysm
{
  const prog = new CampaignProgressStore(false, createMemoryStorageAdapter());
  prog.setActiveCampaign('TheKhaganate');
  assert.equal(prog.getRivadisMapFrame('TheKhaganate'), 10);
  assert.equal(CAMPAIGN_EDICTS.TheKhaganate.length, 9);

  prog.recordVictory(11, 'Gold', 120);
  prog.recordVictory(12, 'Gold', 120);
  prog.recordVictory(13, 'Gold', 120);
  assert.ok(prog.getAvailableSkillPoints('TheKhaganate') >= 4);
  assert.equal(prog.upgradeEdict('speaking_to_animals', 'TheKhaganate'), true);
  assert.equal(prog.upgradeEdict('dark_teaching', 'TheKhaganate'), true);
  assert.equal(prog.upgradeEdict('three_days_plunder', 'TheKhaganate'), true);
  assert.equal(prog.upgradeEdict('necropolis_excavations', 'TheKhaganate'), true);

  const bonuses = prog.getBonuses('TheKhaganate');
  assert.equal(bonuses.cavalryTier, 3);
  assert.equal(getRecruitIdsForFaction('TheKhaganate', bonuses)[2], 'k_ancient_raiders');

  const sim = new BattleSim(() => 0.5);
  sim.loadLevel(getLevelById(12), bonuses);
  assert.equal(sim.playerFaction, 'TheKhaganate');
  const kComb = sim.getCombatant('TheKhaganate');
  kComb.mana = 450;
  kComb.ultimateCharge = kComb.ultimateMax;
  const kFort = sim.strongholds.find((s) => s.owner === 'TheKhaganate')!;

  const raiders = sim.recruitUnit('TheKhaganate', kFort.id, 'k_ancient_raiders')!;
  assert.ok(raiders);

  assert.equal(sim.castSpell('TheKhaganate', 'banner_bloodlust', raiders.flashX, raiders.flashY), true);
  sim.step(0.1);
  assert.ok(raiders.bloodlustTimer > 0);

  assert.equal(sim.castSpell('TheKhaganate', 'disentomb', kFort.flashX, kFort.flashY), true);
  assert.ok(sim.squads.some((s) => s.owner === 'TheKhaganate' && s.defId === 'k_immortals'));

  const enemy = sim.squads.find((s) => s.owner === 'Westaria')!;
  const eBefore = getSquadTotalHp(enemy).hp;
  assert.equal(sim.castSpell('TheKhaganate', 'summon_stoneworms', enemy.flashX, enemy.flashY), true);
  assert.ok(getSquadTotalHp(enemy).hp < eBefore);

  const wFort = sim.strongholds.find((s) => s.owner === 'Westaria')!;
  const fortBefore = wFort.hp;
  assert.equal(sim.castSpell('TheKhaganate', 'cataclysm', kFort.flashX, kFort.flashY), true);
  assert.ok(wFort.hp < fortBefore);
}

// 12. Phase 3: Cult Edicts, T3 Giantbots, Ice Blast, Frost Enchantment, Liberation, Grand Transformation
{
  const prog = new CampaignProgressStore(false, createMemoryStorageAdapter());
  prog.setActiveCampaign('TheCult');
  assert.equal(prog.getRivadisMapFrame('TheCult'), 19);
  assert.equal(CAMPAIGN_EDICTS.TheCult.length, 9);

  prog.recordVictory(21, 'Gold', 120);
  prog.recordVictory(22, 'Gold', 120);
  prog.recordVictory(23, 'Gold', 120);
  assert.equal(prog.upgradeEdict('giant_construction', 'TheCult'), true);
  assert.equal(prog.upgradeEdict('giant_construction', 'TheCult'), true);
  assert.equal(prog.upgradeEdict('magic_library', 'TheCult'), true);
  assert.equal(prog.upgradeEdict('liberation_army', 'TheCult'), true);
  assert.equal(prog.upgradeEdict('magic_academy', 'TheCult'), true);
  assert.equal(prog.upgradeEdict('magic_academy', 'TheCult'), true);

  const bonuses = prog.getBonuses('TheCult');
  assert.equal(bonuses.archersTier, 3);
  assert.equal(getRecruitIdsForFaction('TheCult', bonuses)[1], 'b_giantbots');

  const sim = new BattleSim(() => 0.25);
  sim.loadLevel(getLevelById(22), bonuses);
  assert.equal(sim.playerFaction, 'TheCult');
  const bComb = sim.getCombatant('TheCult');
  bComb.mana = 450;
  bComb.gold = 500;
  bComb.ultimateCharge = bComb.ultimateMax;
  const bFort = sim.strongholds.find((s) => s.owner === 'TheCult')!;

  const gbot = sim.recruitUnit('TheCult', bFort.id, 'b_giantbots')!;
  assert.ok(gbot);
  gbot.members[0].hp = 100;
  for (let i = 0; i < 5; i++) sim.step(0.25);
  assert.ok(gbot.members[0].hp > 100, 'Giantbots Lv2 should regenerate HP per second');

  const enemy = sim.squads.find((s) => s.owner === 'TheEmpire')!;
  assert.equal(sim.castSpell('TheCult', 'ice_blast', enemy.flashX, enemy.flashY), true);
  assert.ok(enemy.frozenTimer > 0, 'Ice Blast should freeze target squad');

  assert.equal(sim.castSpell('TheCult', 'frost_enchantment', gbot.flashX, gbot.flashY), true);
  assert.ok(gbot.frostEnchantTimer > 0);
  gbot.poisonTimer = 3;
  assert.equal(sim.castSpell('TheCult', 'banner_liberation', gbot.flashX, gbot.flashY), true);
  sim.step(0.1);
  assert.equal(gbot.poisonTimer, 0, 'Banner of Liberation should cleanse poison');

  const goldBefore = bComb.gold;
  assert.equal(sim.castSpell('TheCult', 'grand_transformation', bFort.flashX, bFort.flashY), true);
  assert.ok(bComb.gold > goldBefore, 'Grand Transformation should grant gold for transformed enemies');
}

// 13. Phase 3: Empire AI Spellcasting (Terror, Banner of Desecration) & Badges Unlocking
{
  assert.equal(BADGES.length, 22);
  const prog = new CampaignProgressStore(false, createMemoryStorageAdapter());
  const summary = prog.recordVictory(1, 'Gold', 150, {
    maxVillagesOwned: 7,
    maxMinesOwned: 7,
    maxObelisksOwned: 7,
    maxSquadsOwned: 20,
    squadsPurchased: 12,
    bannersSet: 5,
    ultimatesUsed: 5,
    chestsOpened: 1,
    enemySquadsDestroyed: 30,
    heroicEngagedCount: 20,
    goldCollected: 3500,
    strongholdsSeized: 10,
  });
  assert.equal(prog.isBadgeUnlocked('BADGE_ANY_MISSION_PERFECT'), true);
  assert.equal(prog.isBadgeUnlocked('BADGE_CHESTS_OPENED'), true);
  assert.equal(prog.isBadgeUnlocked('BADGE_GOLD_COLLECTED'), true);
  assert.ok(summary.newlyUnlockedBadges.length >= 12);

  const sim = new BattleSim(() => 0.5);
  sim.loadLevel(getLevelById(21));
  const empComb = sim.getCombatant('TheEmpire');
  empComb.mana = 400;
  const cSq = sim.squads.find((s) => s.owner === 'Westaria') ?? sim.recruitUnit('TheCult', sim.strongholds.find((s) => s.owner === 'TheCult')!.id, 'b_rebels')!;
  cSq.heroicTimer = 5;
  assert.equal(sim.castSpell('TheEmpire', 'terror', cSq.flashX, cSq.flashY), true);
  assert.equal(cSq.heroicTimer, 0, 'Empire Terror should dispel Heroic');
  assert.ok(cSq.fearTimer > 0, 'Empire Terror should inflict Fear');
}

// 14. Cross-Platform Storage Adapter (Save/Reload/v2 Migration) & Asset Bundle Integrity
{
  const mem = createMemoryStorageAdapter();
  const store1 = new CampaignProgressStore(true, mem);
  store1.recordVictory(1, 'Gold', 140);
  store1.setActiveCampaign('TheCult');
  assert.ok(mem.getItem('takeover_save_v3'));

  const store2 = new CampaignProgressStore(true, mem);
  assert.equal(store2.getActiveCampaign(), 'TheCult');
  assert.equal(store2.getCompletedCount('Westaria'), 1);
  assert.equal(store2.getLevelRecord(1).bestMedal, 'Gold');

  store2.resetAll();
  const store3 = new CampaignProgressStore(true, mem);
  assert.equal(store3.getActiveCampaign(), 'Westaria');
  assert.equal(store3.getCompletedCount('Westaria'), 0);

  // Verify Phase 2 v2 -> v3 migration through injected adapter
  const v2Payload = JSON.stringify({
    xp: 2500,
    edictRanks: { ducal_sovereignty: 2, call_crusade: 1 },
    levels: { 1: { completed: true, bestMedal: 'Silver', bestTimeSec: 390 } },
    selectedLevelId: 2,
  });
  const memV2 = createMemoryStorageAdapter({ takeover_westaria_save_v2: v2Payload });
  const migrated = new CampaignProgressStore(true, memV2);
  assert.equal(migrated.getLevelRecord(1).bestMedal, 'Silver');
  assert.equal(migrated.getEdictRank('call_crusade', 'Westaria'), 1);
  assert.ok(memV2.getItem('takeover_save_v3'), 'v2 migration should persist v3 into adapter');

  // Verify all 24 LEVEL_CATALOG entries match JSON files on disk
  assert.equal(LEVEL_CATALOG.length, 24);
  assert.equal(getCampaignLevelMetas('Westaria').length, 8);
  assert.equal(getCampaignLevelMetas('TheKhaganate').length, 8);
  assert.equal(getCampaignLevelMetas('TheCult').length, 8);
  assert.equal(getLevelMetaById(28).campaign, 'TheCult');

  // Verify every SPRITE_MANIFEST entry resolves to an actual PNG in its bundle & no duplicate battle maps exist
  const bgHashes = new Map<string, string>();
  for (const [key, entry] of Object.entries(SPRITE_MANIFEST)) {
    const bundle = entry.bundle ?? 'resources';
    const rootDir = bundle === 'resources' ? path.join(ASSETS_DIR, 'resources') : path.join(ASSETS_DIR, 'bundles', bundle);
    const pngPath = path.join(rootDir, `${entry.path}.png`);
    assert.ok(fs.existsSync(pngPath), `Missing PNG for manifest key "${key}" at ${pngPath}`);

    if (key.startsWith('map/level')) {
      const h = crypto.createHash('md5').update(fs.readFileSync(pngPath)).digest('hex');
      const seenPath = bgHashes.get(h);
      if (seenPath) {
        assert.equal(seenPath, pngPath, `Duplicate battle map file found on disk: ${pngPath} == ${seenPath}`);
      } else {
        bgHashes.set(h, pngPath);
      }
    }
  }
  // Verify Rivadis base + 26 diff overlays exist in manifest
  assert.ok(SPRITE_MANIFEST['map/campaign_map_base']);
  for (let f = 2; f <= 27; f++) {
    assert.ok(SPRITE_MANIFEST[`map/campaign_map_diff_${f}`], `Missing manifest entry map/campaign_map_diff_${f}`);
  }
}

// 15. Phase A: UserSettingsStore Persistence & AsyncRetry / Timeout Resilience
async function runPhaseATests(): Promise<void> {
  const mem = createMemoryStorageAdapter();
  const s1 = new UserSettingsStore(true, mem);
  assert.equal(s1.isMuted(), false);
  assert.equal(s1.getBgmVolume(), 0.45);
  assert.equal(s1.getSfxVolume(), 0.7);
  assert.equal(s1.getPreferredSpeed(), 1);

  assert.equal(s1.toggleMute(), true);
  s1.setBgmVolume(-0.5);
  s1.setSfxVolume(1.8);
  s1.setPreferredSpeed(2);
  assert.equal(s1.getBgmVolume(), 0);
  assert.equal(s1.getSfxVolume(), 1);

  const s2 = new UserSettingsStore(true, mem);
  assert.equal(s2.isMuted(), true);
  assert.equal(s2.getBgmVolume(), 0);
  assert.equal(s2.getSfxVolume(), 1);
  assert.equal(s2.getPreferredSpeed(), 2);

  s2.reset();
  const s3 = new UserSettingsStore(true, mem);
  assert.equal(s3.isMuted(), false);
  assert.equal(s3.getBgmVolume(), 0.45);
  assert.equal(s3.getPreferredSpeed(), 1);

  // Malformed JSON resilience
  const corruptMem = createMemoryStorageAdapter({ takeover_settings_v1: '{broken-json' });
  const s4 = new UserSettingsStore(true, corruptMem);
  assert.equal(s4.getSfxVolume(), 0.7);

  // retryAsync succeeds after 2 transient failures
  let calls = 0;
  let retryHooks = 0;
  const val = await retryAsync(
    async () => {
      calls++;
      if (calls < 3) throw new Error(`transient_${calls}`);
      return 'ok';
    },
    {
      maxAttempts: 3,
      timeoutMs: 200,
      baseDelayMs: 5,
      label: 'test_retry',
      onRetry: () => {
        retryHooks++;
      },
    },
  );
  assert.equal(val, 'ok');
  assert.equal(calls, 3);
  assert.equal(retryHooks, 2);

  // retryAsync exhausts and rejects
  await assert.rejects(
    retryAsync(async () => {
      throw new Error('always_fail');
    }, { maxAttempts: 2, timeoutMs: 200, baseDelayMs: 5, label: 'test_exhaust' }),
    /always_fail/,
  );

  // withTimeout rejects on slow promise
  await assert.rejects(
    withTimeout(() => new Promise((resolve) => setTimeout(resolve, 120)), 15, 'slow_op'),
    /slow_op timed out/,
  );
}

// 16. Phase B: Localization (zh/en coverage), UserSettingsStore Language & Save Export/Import
{
  const memLang = createMemoryStorageAdapter();
  const lStore1 = new UserSettingsStore(true, memLang, 'zh');
  assert.equal(lStore1.getLanguage(), 'zh');
  lStore1.setLanguage('en');
  const lStore2 = new UserSettingsStore(true, memLang, 'zh');
  assert.equal(lStore2.getLanguage(), 'en');
  lStore2.setLanguage('invalid' as 'en');
  assert.equal(lStore2.getLanguage(), 'zh');

  setLanguage('en');
  assert.equal(getLanguage(), 'en');
  const enStart = t('map_btn_start');
  assert.equal(t('hud_gold', { gold: 500, rate: 4 }), 'GOLD: 500 (+4/s)');

  setLanguage('zh');
  assert.equal(getLanguage(), 'zh');
  const zhStart = t('map_btn_start');
  assert.notEqual(zhStart, enStart);
  assert.equal(t('hud_gold', { gold: 500, rate: 4 }), '金铢: 500 (+4/秒)');

  // 100% Chinese coverage across Spells, Units, Edicts, Badges, and 24 Levels
  for (const [id, sp] of Object.entries(ALL_SPELLS)) {
    const zhName = getSpellName(id as SpellId, false, sp.name, sp.shortName);
    const zhShort = getSpellName(id as SpellId, true, sp.name, sp.shortName);
    assert.ok(zhName && zhName !== sp.name, `Spell ${id} missing zh name`);
    assert.ok(zhShort && zhShort !== sp.shortName, `Spell ${id} missing zh shortName`);
  }
  for (const [id, u] of Object.entries(UNIT_DEFS)) {
    const zhU = getUnitName(id, u.name);
    assert.ok(zhU && zhU !== u.name, `Unit ${id} missing zh name`);
  }
  for (const edList of Object.values(CAMPAIGN_EDICTS)) {
    for (const ed of edList) {
      const zhEd = getEdictName(ed.id, ed.name);
      assert.ok(zhEd && zhEd !== ed.name, `Edict ${ed.id} missing zh name`);
      for (const rk of ed.ranks) {
        const zhDesc = getEdictRankDesc(ed.id, rk.rank, rk.description);
        assert.ok(zhDesc && zhDesc !== rk.description, `Edict ${ed.id} rank ${rk.rank} missing zh desc`);
      }
    }
  }
  for (const b of BADGES) {
    assert.notEqual(getBadgeName(b.id, b.name), b.name, `Badge ${b.id} missing zh name`);
    assert.notEqual(getBadgeDesc(b.id, b.description), b.description, `Badge ${b.id} missing zh desc`);
  }
  for (const lvl of LEVEL_CATALOG) {
    assert.notEqual(getLevelName(lvl.id, lvl.name), lvl.name, `Level ${lvl.id} missing zh name`);
    assert.notEqual(getLevelBriefing(lvl.id, lvl.briefing), lvl.briefing, `Level ${lvl.id} missing zh briefing`);
  }
  setLanguage('en');

  // Save Export / Import round-trip + error checks
  const srcMem = createMemoryStorageAdapter();
  const srcStore = new CampaignProgressStore(true, srcMem);
  srcStore.recordVictory(1, 'Gold', 142, {
    maxVillagesOwned: 2,
    maxMinesOwned: 1,
    maxObelisksOwned: 1,
    squadsPurchased: 4,
    bannersSet: 1,
    ultimatesUsed: 0,
    chestsOpened: 1,
    enemySquadsDestroyed: 10,
    heroicEngagedCount: 2,
    goldCollected: 1200,
    maxSquadsOwned: 4,
    strongholdsSeized: 3,
  });
  srcStore.upgradeEdict('town_guilds', 'Westaria');
  srcStore.setActiveCampaign('TheCult');
  srcStore.recordVictory(21, 'Silver', 420);

  const code = srcStore.exportSaveCode();
  assert.ok(code.startsWith('TKV3:'), 'Exported code must start with TKV3:');

  // Import with whitespace/newlines wrapped around
  const dstMem = createMemoryStorageAdapter();
  const dstStore = new CampaignProgressStore(true, dstMem);
  const resOk = dstStore.importSaveCode(`  ${code.slice(0, 40)}\n  ${code.slice(40)}  `);
  assert.equal(resOk.ok, true);
  if (resOk.ok) {
    assert.equal(resOk.completedMissions, 2);
    assert.equal(resOk.activeCampaign, 'TheCult');
    assert.ok(resOk.unlockedBadges >= 2);
  }
  assert.equal(dstStore.getActiveCampaign(), 'TheCult');
  assert.equal(dstStore.getLevelRecord(1).bestMedal, 'Gold');
  assert.equal(dstStore.getLevelRecord(21).bestMedal, 'Silver');
  assert.equal(dstStore.getEdictRank('town_guilds', 'Westaria'), 1);
  assert.equal(dstStore.isBadgeUnlocked('BADGE_CHESTS_OPENED'), true);
  assert.equal(dstStore.isBadgeUnlocked('BADGE_ANY_MISSION_PERFECT'), true);

  // Error validation paths
  assert.deepEqual(dstStore.importSaveCode('   '), { ok: false, error: 'EMPTY' });
  assert.deepEqual(dstStore.importSaveCode('hello-world'), { ok: false, error: 'INVALID_FORMAT' });
  const badChecksumPayload = Buffer.from(
    JSON.stringify({
      format: 'takeover-save',
      version: 3,
      exportedAt: 1,
      checksum: 'deadbeef',
      data: { activeCampaign: 'Westaria', campaigns: {}, badges: {} },
    }),
    'utf8',
  )
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  assert.deepEqual(dstStore.importSaveCode(`TKV3:${badChecksumPayload}`), { ok: false, error: 'CHECKSUM_MISMATCH' });

  const badVerPayload = Buffer.from(
    JSON.stringify({ format: 'takeover-save', version: 99, exportedAt: 1, checksum: '00000000', data: {} }),
    'utf8',
  )
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  assert.deepEqual(dstStore.importSaveCode(`TKV3:${badVerPayload}`), { ok: false, error: 'UNSUPPORTED_VERSION' });
}

runPhaseATests()
  .then(() => {
    console.log('ALL_SIM_TESTS_PASSED');
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
