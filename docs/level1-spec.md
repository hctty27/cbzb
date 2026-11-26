# Takeover (flash/3986.swf) — Phase 1 / Level 1 Specification

This document records the verified game rules, map topology, entity stats, tutorial script, and 16:9 adaptation targets extracted from the original `flash/3986.swf` (`Main.as`, `LevelParser.as`, `GameBattle.as`, `CompanyProgress.as`, `LevelInfo.as`, `battle/§_-pl§.as`, `battle/§_-k0§.as`, `level/§_-Xq§.as`, `level/§finally§.as`, `level/§_-UV§.as`, `level/§_-8S§.as`, `§_-GB§/§_-3q§.as`, `§_-7§/§_-rb§.as`, and `SWF` display tags).

---

## 1. Level Identity & Victory Timing
- **Game Title**: Takeover (IriySoft, 2012)
- **Campaign**: Westaria (`companyId = 0`, race `Westaria`, color `Green`)
- **Level**: `levelNum = 0`, `levelUID = 1` — **"The World's Edge"**
- **Original SWF Stage**: `800 × 600` px at `30 fps`
- **Target COCOS 4 Canvas**: **`1280 × 720` (16:9)**, `FIXED_HEIGHT` / responsive layout
  - `Level1Class` background spans Flash coordinates `X: [-192.0, +1079.45]` (`1271.45px` wide) × `Y: [-87.25, +770.95]` (`858.2px` tall).
  - Mapping Flash logical `800 × 600` centered into `1280 × 720` at scale **`1.2`** (`800*1.2 = 960`, `600*1.2 = 720`) aligns Flash `Y ∈ [0, 600]` onto `[-360, +360]` and exposes Flash `X ∈ [-133.33, +933.33]` across the full `1280px` 16:9 width without letterbox bars.
- **Medal Thresholds** (`GamePanel.as`):
  - **Gold**: `< 330s` (5:30)
  - **Silver**: `<= 570s` (9:30)
  - **Bronze**: any slower victory
- **Win / Loss** (`§_-UV§.§_-6l§`):
  - **Victory**: Player (`Westaria`) owns `>= 1` stronghold and all non-Bandit enemy strongholds (`TheEmpire`) have been captured (no enemy strongholds remain).
  - **Defeat**: Player owns `0` strongholds.

---

## 2. Level 1 Map Graph (`Level1GraphMarkersClass`, cid=7458)

`LevelParser.as` groups nodes by `locationNum` (`l<loc>nd_<id>`). Logical simulation coordinates use `Y_KOEFF = 2` (`simY = flashY * 2`) when computing movement speed/distance in `Level.as`/`FSquad.as`. Below are exact Flash stage `(x, y)` coordinates with `simY = y * 2`.

### Nodes
| Node ID | Type | Symbol / Role | Loc | Owner at Start | Flash `(x, y)` | Build Sites Owned |
|---|---|---|---|---|---|---|
| `057` (`l02nd_057`) | Stronghold (`Castle`) | Player Westaria Castle | 2 | `Westaria` (Green) | `(450.95, 384.70)` | — |
| `040` (`l02nd_040`) | Junction (`EmptyNode`) | Westaria Road Junction | 2 | — | `(408.90, 374.85)` | — |
| `060` (`l02nd_060`) | Junction (`EmptyNode`) | Central Bridge Junction | 2 | — | `(339.95, 286.80)` | — |
| `070` (`l01nd_070`) | Junction (`EmptyNode`) | Town Approach Junction | 1 | — | `(200.30, 212.00)` | — |
| `077` (`l01nd_077`) | Stronghold (`Town`) | Empire Town (`ref_tutor1EnemyTown`) | 1 | `TheEmpire` (Purple) | `(150.75, 231.35)` | — |
| `080` (`l01nd_080`) | Junction (`EmptyNode`) | Northern Bend Junction | 1 | — | `(272.10, 125.20)` | — |
| `010` (`l00nd_010`) | Junction (`EmptyNode`) | Empire Castle Gate | 0 | — | `(525.30, 170.20)` | — |
| `007` (`l00nd_007`) | Stronghold (`Castle`) | Empire Castle | 0 | `TheEmpire` (Purple) | `(573.50, 178.10)` | `014`, `024` |
| `014` (`l00nd_014`) | `BuildPlace` | Empire Build Site 1 | 0 | `TheEmpire` | `(609.95, 240.90)` | Slot in Loc 0 |
| `024` (`l00nd_024`) | `BuildPlace` | Empire Build Site 2 | 0 | `TheEmpire` | `(671.00, 200.90)` | Slot in Loc 0 |

### Edges & Affine-Transformed Waypoints (Flash coordinates, undirected)
| Edge | From -> To | Intermediate Waypoints `Flash (x, y)` |
|---|---|---|
| `ed_040_057` | `040` <-> `057` | Direct |
| `ed_040_060` | `040` <-> `060` | `(393.70, 366.60)`, `(377.70, 351.00)`, `(366.70, 331.10)`, `(351.70, 304.05)` |
| `ed_060_070` | `060` <-> `070` | Direct |
| `ed_070_077` | `070` <-> `077` | Direct |
| `ed_070_080` | `070` <-> `080` | `(207.96, 190.86)`, `(214.87, 162.79)`, `(228.39, 141.45)`, `(246.46, 127.31)` |
| `ed_080_010` | `080` <-> `010` | `(307.03, 123.62)`, `(350.00, 118.76)`, `(397.73, 121.11)`, `(442.76, 145.48)`, `(489.23, 164.31)` |
| `ed_010_007` | `010` <-> `007` | Direct |

---

## 3. Starting State & Economy Formulas

### Starting Resources (`CompanyProgress.as`, `LevelInfo.as`, `GameBattle.as`)
- **Player (`Westaria`)**: `250 + 300 = 550 Gold`, `100 Mana`. Starts owning Castle `057` (Level 0, 1000/1000 HP), 0 initial squads.
- **Enemy (`TheEmpire`)**: Starts with `0 Gold, 0 Mana` per `LevelInfo`, overridden by `GameBattle.initTutorial1`:
  - Sets `enemy.__setGold(UndyingWarriors.cost * 2)` = **`200 Gold`**.
  - On each Empire stronghold (`Castle 007` and `Town 077`), sets temporary `foodSupply = 1` and spawns **1 squad of `Undying Warriors`** (`cost=100`, temporary `upkeep=0` during spawn, then `upkeep` restored to `1`).
  - Town squad reference stored as `ref_tutor1EnemySquad` at `Town 077` (`ref_tutor1EnemyTown`).
- **Spells**: Player spells disabled on Level 1 (`player.__setSpells([null, null, null])`).
- **Build Menu / Recruitment Locks on Start**: `LOCK_UNIT_ABOVE = 0` (only Tech Level 1 `Infantry` unlocked initially). `Village`, `Mine`, `Obelisk` panels remain standard (`WindowContentManager`).

### Strongholds (`§_-Xq§.as`)
| Type | Base HP | Gold/s | Mana/s | Food Supply | Ult/s | Allowed Supply Types |
|---|---|---|---|---|---|---|
| `Town` | `500` | `2` | `0` | `1` | `0` | `Village` |
| `Castle` | `1000` | `3` | `1` | `2` | `0` | `Village`, `Mine`, `Obelisk` |
| `Camp` | `500` | `1` | `0` | `0` | `0` | `Village` |
| `MagicTower` | `500` | `1` | `2` | `1` | `1` | *(Level >1)* |

- **Stronghold Upgrades**:
  - Level `0 -> 1`: **`350 Gold`** (`level` max `2`)
  - Level `1 -> 2`: **`500 Gold`**
  - Max HP formula: `round(baseHP + baseHP * level * 0.5)` (`1000 -> 1500 -> 2000` for Castle; `500 -> 750 -> 1000` for Town).
  - Razed/Damaged Stronghold Repair: Friendly garrisoned/stationed squad heals node **`+5 HP per 0.5s`** (`+10 HP/s`).

### Supply Buildings (`§finally§.as`, `BuildPlace.as`, `§_-k0§.as`)
- **Base Cost**: **`150 Gold`** for all supply buildings (`Village`, `Mine`, `Obelisk`). Can also be upgraded/demolished in owned location.
- **Income per building**:
  - `Village` (`Farm` for Westaria, `Graveyard` for Empire): `Food +1`
  - `Mine`: `Gold +2/s`
  - `Obelisk`: `Mana +1/s`

### 1-Second Economy Tick (`§_-8S§.customUpdate` -> `§_-k0§.§_-PK§()`)
Triggered each time elapsed battle time crosses an integer second:
1. `grossGold = sum(owned strongholds.gold + owned supplyBuildings.gold)`
2. `upkeepSquads = count of alive squads with upkeep > 0`
3. **Gold Income Decay** (`getGoldSpeed()`):
   - If `upkeepSquads == 0` or `grossGold == 0`: `netGold = grossGold`
   - Else `k = min(upkeepSquads, 10) - 1`, `taxPct = 30 + 5 * k` (30% for 1 squad up to 75% for 10+ squads)
   - `netGold = Math.round(Math.max(grossGold * (100 - taxPct) / 100, 1))`
4. `gold += netGold`
5. `mana = Math.min(500, mana + manaSpeed)`
6. **Army Supply Check**: `freeSupply = totalSupplyPower - sum(alive squads.upkeep)`. Buying a squad requires `gold >= unit.cost` and `freeSupply >= unit.upkeep`.

---

## 4. Phase 1 Unit Roster (`battle/§_-pl§.as`)

Fields: `(name, hpPerUnit, side, unitsCount, dmgMin, dmgMax, attackCooldownTenths, range, meleePenalty, morale, speed, cost, upkeep, abilities, techLevel, class)`

### Westaria (Player — Green)
| Class / Tech | Name | Count | HP/Unit (Squad HP) | Dmg Min-Max | Atk Period | Range | Melee Pen% | Speed | Cost | Upkeep | Abilities |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Infantry T1 | Guards | 9 | 26 (`234`) | 2–3 | 1.5s | 0 | 0 | 40 | 100 | 1 | — |
| Infantry T2 | Swordsmen | 9 | 36 (`324`) | 3–4 | 1.5s | 0 | 0 | 40 | 100 | 1 | `ShieldWall 15` |
| Infantry T3 | Legionaries | 9 | 40 (`360`) | 4–5 | 1.5s | 0 | 0 | 40 | 100 | 1 | `ShieldWall 20;Discipline` |
| Archers T1 | Archers | 9 | 16 (`144`) | 4–8 | 3.0s | 100 | 70 | 40 | 120 | 1 | — |
| Archers T2 | Crossbowmen | 9 | 22 (`198`) | 8–10 | 3.0s | 100 | 70 | 40 | 120 | 1 | — |
| Cavalry T1 | Knights | 5 | 58 (`290`) | 5–8 | 1.5s | 0 | 0 | 60 | 180 | 1 | `Charge 2` |
| Cavalry T2 | Champions | 5 | 72 (`360`) | 6–9 | 1.5s | 0 | 0 | 60 | 180 | 1 | `Charge 2` |
| Magic T1 | Monks | 6 | 65 (`390`) | 5–6 | 1.5s | 0 | 0 | 40 | 150 | 1 | `DivinePresence 10` |
| Magic T2 | Zealots | 6 | 75 (`450`) | 6–9 | 1.5s | 50 | 0 | 40 | 150 | 1 | `DivinePresence 10;MartialArtists` |
| Siege T1 | Trebuchet | 1 | 400 (`400`) | 15–25 | 5.0s | 200 | 100 | 20 | 200 | 2 | `Mechanism;SplashDamage 25;SiegeWeapon 50` |

### TheEmpire (Enemy — Purple)
| Class / Tech | Name | Count | HP/Unit (Squad HP) | Dmg Min-Max | Atk Period | Range | Melee Pen% | Speed | Cost | Upkeep | Abilities |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Infantry T1 | Undying Warriors | 9 | 18 (`162`) | 2–4 | 1.7s | 0 | 0 | 40 | 100 | 1 | `Undead` |
| Infantry T2 | Zombie Warriors | 9 | 25 (`225`) | 3–5 | 1.7s | 0 | 0 | 40 | 100 | 1 | `Undead` |
| Archers T1 | Undying Archers | 9 | 12 (`108`) | 4–8 | 3.0s | 100 | 70 | 40 | 120 | 1 | `Undead` |
| Cavalry T1 | Undying Horsemen | 5 | 54 (`270`) | 5–8 | 1.7s | 0 | 0 | 60 | 180 | 1 | `Charge 2;Undead` |
| Siege T1 | Trebuchet | 1 | 400 (`400`) | 15–25 | 5.0s | 200 | 100 | 20 | 200 | 2 | `Mechanism;SplashDamage 25;SiegeWeapon 50` |

*Note on Tech Level*: In a single battle (`CompanyProgress` / `Stronghold.techLevel`), T1 units recruit by default; upgrading/researching unit class tech or building level controls higher tiers. For Phase 1, Player starts with Guards (Infantry), unlocks Archers after killing the first enemy squad, and can unlock/recruit T1 Guards, Archers, Knights, Monks, Trebuchet (or Castle-level-gated upgrades).

---

## 5. Tutorial 1 Script & AI Flow (`GameBattle.as`, `§_-8S§.as`)
1. **Start (`initTutorial1`)**:
   - AI disabled (`cpuDisabled = true`), Player AI/help prompt frame 0: click your Castle to open recruit menu.
   - `LOCK_UNIT_ABOVE = 0` (only Infantry / Guards selectable).
   - Empire starts with 1 `Undying Warriors` at Castle `007` and 1 `Undying Warriors` (`ref_tutor1EnemySquad`) at Town `077`.
2. **Player recruits first squad (`onBuySquad_Tutorial1`)**:
   - Advances tutorial hint (send your squad toward the center bridge / enemy).
   - `ref_tutor1EnemySquad` marches to `(340, 290)` (near junction `060`).
3. **Player destroys `ref_tutor1EnemySquad` (`onKillSquad_Tutorial1`)**:
   - Advances tutorial hint (Archers unlocked, capture the Empire Town `077`).
   - Sets `LOCK_UNIT_ABOVE = 1` (unlocks Archers).
   - Spawns a replacement `Undying Warriors` defending `ref_tutor1EnemyTown` (`077`).
   - Enables CPU AI (`cpuDisabled = false`).
4. **Player captures `Town 077` (`onKeyNodeCaptured_Tutorial1`)**:
   - Advances tutorial hint (capture the final Empire Castle `007`!).
   - Gives Empire `+100 Gold` (`UndyingWarriors.cost`), recalculates economy, ensures AI active.
5. **CPU AI (`updateCpuCombotantLogic`, every 1.0s when enabled)**:
   - Checks free supply -> builds `Graveyard` (Village) / `Mine` if needed and affordable on Loc 0 build sites (`014`, `024`).
   - Recruits `Undying Warriors` / `Undying Archers` if `freeSupply > 0` and `gold >= cost`.
   - Orders idle squads past threshold power to reinforce threatened nodes or counter-attack weakly defended player nodes.

---

## 6. SWF Symbol & Audio Manifest (Phase 1 Subset)
- **Screens**: `scrTitleClass` (cid `7090`, background `cid 2664` + IriySoft logo `2671` + Play button `butStart` `617` — omit `butArmorLogo` portal branding), `scrBattleClass` (`7392`), `Level1Class` (`4324`), `Level1GraphMarkersClass` (`7458`).
- **Strongholds** (`FKeyNodeContentView.as`): `NodeCastleGreenClass`, `NodeCastlePurpleClass`, `NodeCastleRazeClass`, `NodeTownGreenClass`, `NodeTownPurpleClass`, `NodeTownRazeClass`, `KeyNodeHealthBarClass`, `BuildHereTopClass`, `VillageGreenClass`, `VillagePurpleClass`, `MineGreenClass`, `MinePurpleClass`, `ObeliskGreenClass`, `ObeliskPurpleClass`.
- **Units (`XMLData.as`)**: `BowmanGreen`/`Purple`, `SwordsmanGreen`/`Purple`, `HorsemanGreen`/`Purple`, `PikemanGreen`/`Purple` (Monk fallback), `TrebuchetGreen`/`Purple` (Walk, Attack, Die directions).
- **Audio** (`decompiled/sounds/`):
  - `8352_musicMenuClass_musicMenuClass.mp3` -> `music_menu.mp3`
  - `2978_musicGameplayClass_musicGameplayClass.mp3` -> `music_battle.mp3`
  - `7256_sndButtonClick_sndButtonClick.mp3` -> `ui_click.mp3`
  - `5368_sndSendSoldiers_sndSendSoldiers.mp3` -> `send_soldiers.mp3`
  - `2495_sndSendHorses_sndSendHorses.mp3` -> `send_horses.mp3`
  - `1722_sndSendSiege_sndSendSiege.mp3` -> `send_siege.mp3`
  - `5638_sndAttackSword1_sndAttackSword1.mp3` -> `attack_sword.mp3`
  - `6895_sndAttackBow1_sndAttackBow1.mp3` -> `attack_bow.mp3`
  - `7616_sndHitArrow1_sndHitArrow1.mp3` -> `hit_arrow.mp3`
  - `7442_sndAttackSiege_sndAttackSiege.mp3` -> `attack_siege.mp3`
  - `3258_sndBuildFarm_sndBuildFarm.mp3` -> `build_farm.mp3`
  - `5602_sndBuildMine_sndBuildMine.mp3` -> `build_mine.mp3`
  - `5331_sndBuildObelisk_sndBuildObelisk.mp3` -> `build_obelisk.mp3`
  - `6251_sndDestructionStronghold_sndDestructionStronghold.mp3` -> `capture_stronghold.mp3`
  - `7373_sndDeadMan1_sndDeadMan1.mp3` -> `dead_man.mp3`
  - `3271_sndDeadUndead1_sndDeadUndead1.mp3` -> `dead_undead.mp3`
