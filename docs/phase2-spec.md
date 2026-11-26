# Takeover — Phase 2 Specification (Westaria Full Campaign, Edicts, Spells & Multi-Faction)

Extracted and verified from `flash/3986.swf` (`Takeover`, IriySoft 2012) for COCOS 4 (`4.0.0-beta.3`) + TypeScript (`1280×720` 16:9).

## 1. Westaria Campaign (8 Levels)

Source: `data/LevelInfo.as`, `gui/GlobalMapScreen.as`, `scrCompaignMapClass`, `Level1Class`..`Level8Class`.

| Level | Name | Map Pin (Flash) | XP Reward | Enemy Factions | Enemy Tech Tier | Gold / Silver Threshold |
|---|---|---|---|---|---|---|
| 1 | The World's Edge | `(139.0, 262.2)` | 1000 | TheEmpire | 1 | `< 330s` / `<= 570s` |
| 2 | The Empire's End | `(172.3, 187.2)` | 1500 | TheKhaganate | 1 | `< 330s` / `<= 570s` |
| 3 | Friend Or Foe? | `(322.9, 138.2)` | 1750 | TheEmpire | 1 | `< 330s` / `<= 570s` |
| 4 | New Plague | `(414.8, 165.7)` | 2000 | TheEmpire, TheCult | 1 | `< 330s` / `<= 570s` |
| 5 | Light And Magic | `(322.9, 231.7)` | 3000 | TheEmpire, TheKhaganate | 2 | `< 330s` / `<= 570s` |
| 6 | Remedy | `(290.9, 338.6)` | 4000 | TheKhaganate | 2 | `< 330s` / `<= 570s` |
| 7 | Close The Circle | `(527.8, 172.7)` | 5000 | TheCult, TheEmpire | 2 | `< 330s` / `<= 570s` |
| 8 | The Final Battle | `(473.8, 281.6)` | 7500 | TheEmpire | 2 | `< 330s` / `<= 570s` |

Starting resources (`progress/CompanyProgress.as`):
- Level 1: `550 Gold` (`250 + 300`), `100 Mana`
- Levels 2–8: `250 Gold` (+ Ducal Sovereignty edict bonus `+75` / `+150`), `100 Mana`

## 2. Factions & Stronghold Types

| FactionId | Color | Castle / Town / Camp / MagicTower Sprite Prefix |
|---|---|---|
| `Westaria` | Green | `castle_green`, `town_green`, `camp_green`, `magictower_green` |
| `TheEmpire` | Purple | `castle_purple`, `town_purple`, `camp_purple`, `magictower_purple` |
| `TheKhaganate` | Red | `castle_red`, `town_red`, `camp_red`, `magictower_red` |
| `TheCult` | Blue | `castle_blue`, `town_blue`, `camp_blue`, `magictower_blue` |
| `Bandits` | Gray | Neutral Ogre defenders (`n_ogre`) guarding `+500 Gold` Chests |

Stronghold stats (`BuildingsData.ts` / `level/§_-um§.as`):
- `Castle`: `1000 Base HP`, `+3g/s`, `+1m/s`, `+2 Supply`
- `Town`: `500 Base HP`, `+2g/s`, `+0m/s`, `+1 Supply`
- `Camp` (`Warcamp`): `500 Base HP`, `+1g/s`, `+0m/s`, `+0 Supply`
- `MagicTower`: `500 Base HP`, `+1g/s`, `+2m/s`, `+1 Supply`, `+1 Ultimate Charge/s`

## 3. Westaria Spells, Banners & Ultimate (`§_-7Y§/§_-8c§.as`, `level/§_-UV§.as`, `§_-BD§/*`)

| Spell ID | Name | Cost | Radius | Duration | Effect |
|---|---|---|---|---|---|
| `lords_judgement` | Lord's Judgement | 150 Mana | 75 | Instant | Strikes every enemy soldier in radius for `ceil((30 + rand(0..30)) * judgementMul * unit.maxHp / 100)` (`SpellThunderClass`) |
| `banner_consecration` | Banner of Consecration | 50 Mana | 75 | `12s * bannerDurMul` | Every `0.5s`, heals & resurrects friendly non-mechanism soldiers by `10 HP` (`BannerHealClass` + `BannerAuraHealClass`) |
| `banner_heroism` | Banner of Heroism | 70 Mana | 75 | `12s * bannerDurMul` | Every `0.5s`, grants friendly squads Heroic state (`1.5×` damage) (`BannerHeroismClass` + `BannerAuraHeroismClass`) |
| `sign_of_advent` | Sign of the Advent | Ultimate (`200 * cdMul`) | — | 45s Avatar | Charged `+1/s` per owned `MagicTower` (+ battle charge bonus); summons `Avatar` (`1000 HP`, `10–15 dmg`, `SplashDamage 25`, `SiegeWeapon 50`, `0 upkeep`) |

## 4. XP Progression & 9 Westaria Edicts (`data/XPConverter.as`, `§_-H7§/§_-Sj§.as`)

- `RANK_TABLE`: `[1000, 2200, 3800, 6000, 9000, 13000, 18200, 24800, 33000, 43000, 55000, 69200, 85800, 105000]`
- Skill Points: `min(2 + (rank - 1) * 2, 27)` total points (`THE LORD'S CHURCH` Lv1 & `DUCAL SOVEREIGNTY` Lv1 pre-unlocked at Rank 1; each victory to a new rank adds `+2` Skill Points).
- Edicts (3 Ranks each, 1 Skill Point per rank):
  1. `lords_church` ("THE LORD'S CHURCH"): `[1] Banner of Consecration`, `[2] +25% banners duration`, `[3] +50% banners duration`
  2. `ducal_sovereignty` ("DUCAL SOVEREIGNTY"): `[1] Unlocks basic troops`, `[2] +75 starting gold`, `[3] +150 starting gold`
  3. `call_crusade` ("CALL FOR THE CRUSADE"): `[1] Lord's Judgement`, `[2] +15% Lord's Judgement damage`, `[3] +30% Lord's Judgement damage`
  4. `town_guilds` ("TOWN GUILDS"): `[1] Guards → Swordsmen`, `[2] +15% strongholds HP`, `[3] +30% strongholds HP`
  5. `zealots_order` ("THE ZEALOTS ORDER"): `[1] Monks → Zealots`, `[2] -10% ultimate cooldown`, `[3] -20% ultimate cooldown`
  6. `mechanics_research` ("MECHANICS RESEARCH"): `[1] Archers → Crossbowmen`, `[2] +10% bows/siege damage`, `[3] +20% bows/siege damage`
  7. `heroic_epos` ("HEROIC EPOS"): `[1] Banner of Heroism`, `[2] +7% troops base morale`, `[3] +15% troops base morale`
  8. `regular_tournaments` ("REGULAR TOURNAMENTS"): `[1] Knights → Champions`, `[2] Cavalry charge 2.5×`, `[3] Cavalry charge 3×`
  9. `legion` ("LEGION"): `[1] Infantry → Legionaries`, `[2] +15% infantry HP`, `[3] +30% infantry HP`

## 5. Full Unit Roster (`battle/§_-pl§.as`)

All 4 factions' T1–T2 (+ Westaria T3 Legionaries, Avatar, Bandit Ogre) combat stats are ported 1:1 from `battle/§_-pl§.as` into `game/assets/scripts/data/UnitsData.ts`.
