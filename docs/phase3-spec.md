# Takeover Phase 3 Technical Specification (Full 3-Campaign Remake)

This specification extends [docs/level1-spec.md](file:///e:/Works/ai/cbzb/docs/level1-spec.md) and [docs/phase2-spec.md](file:///e:/Works/ai/cbzb/docs/phase2-spec.md) to complete the **entire Takeover remake** in COCOS 4 + TypeScript (16:9 `1280×720`) from `flash/3986.swf`.

## 1. Three Playable Campaigns (24 Levels Total)
From `data/CompanyInfo.as`, `data/LevelInfo.as`, `scrCompaignMapClass` (`cid=8534`), and `Level{1..8, 11..18, 21..28}GraphMarkersClass`:

1. **The Duchy of Westaria (`Westaria`, Green)** — `Level 1..8` (`missionIndex 1..8`)
   - Rival Empire, Crimson Horde & Icedales Cult; starts with Mission 1 tutorial (`550g`) and Mission 2 Ogre/Chest/MageTower tutorial (`250g`).
2. **The Crimson Horde (`TheKhaganate`, Red)** — `Level 11..18` (`missionIndex 1..8`)
   - Pin sprite `cid=8517`; fights Empire, Westaria, and Cult culminating in invading the Capital held by Westaria in Mission 8 (`Level 18`).
3. **The Icedales Cult (`TheCult`, Blue)** — `Level 21..28` (`missionIndex 1..8`)
   - Pin sprite `cid=8531`; fights Empire, Westaria (Mission 3), Crimson Horde, and allies conceptually on the march to purge the Capital (`Level 28`).

Shared Progression Rules (`progress/CompanyProgress.as`):
- Each campaign maintains independent XP (`XP_RANK_TABLE`), Rank (1–15), Skill Points (`2 + (rank - 1) * 2`, cap `27`), Edict ranks (`0..3`, starting with 2 base edicts at Lv.1), and Level Medals (`Gold < 330s`, `Silver <= 570s`, `Bronze`).
- **Rivadis World Map Progression (`cid=8465`, 27 frames)**:
  `frame = min(27, max(1, completedCount + 1 + campaignIdx * 9))` where `campaignIdx` is `0` (Westaria), `1` (Khaganate), `2` (The Cult).

## 2. Complete 27 Royal Edicts (`§_-H7§/§_-Sj§.as`)

### Westaria (9 Edicts)
1. `lords_church` (Lv1 starter): Banner of Consecration / +25% / +50% banner duration.
2. `ducal_sovereignty` (Lv1 starter): Basic troops / +75g / +150g start gold.
3. `call_crusade`: Lord's Judgement / +15% / +30% damage.
4. `town_guilds`: Swordsmen (Inf T2) / +15% / +30% stronghold HP.
5. `zealots_order`: Zealots (Mag T2) / -10% / -20% ultimate cooldown.
6. `mechanics_research`: Crossbowmen (Arc T2) / +10% / +20% bows & siege damage.
7. `heroic_epos`: Banner of Heroism / +7% / +15% base morale.
8. `regular_tournaments`: Champions (Cav T2) / 2.5x / 3.0x Cavalry Charge.
9. `legion`: Legionaries (Inf T3) / +15% / +30% infantry HP.

### The Crimson Horde / Khaganate (9 Edicts)
1. `bloodlust` (Lv1 starter): Unlocks Banner of Bloodlust / +25% / +50% damage vs strongholds.
2. `declaration_of_war` (Lv1 starter): Unlocks basic troops / +10% / +20% troops move speed.
3. `speaking_to_animals`: Unlocks Lure Stoneworms / +1 worm wave / +2 worm waves.
4. `three_days_plunder`: Upgrades Nomads to Raiders (Cav T2) / +75g / +150g when capturing a stronghold.
5. `raid_the_tombs`: Upgrades Warriors to Immortals (Inf T2) / +1 / +2 unit per Immortals squad.
6. `poisons_research`: Upgrades Hunters to Serpent Archers (Arc T2) / +1 / +2 poison damage.
7. `dark_teaching`: Unlocks Disentomb / +3% / +6% ultimate charge when a friendly squad dies.
8. `dreadful_machinery`: Upgrades Trebuchet to Poison Catapult (Siege T2) / +50% / +100% siege move speed.
9. `necropolis_excavations`: Upgrades cavalry to Ancient Raiders (Cav T3) / -7% / -15% undead troop cost.

### The Icedales Cult (9 Edicts)
1. `arcane_frost` (Lv1 starter): Unlocks Ice Blast / +1s / +2s freeze duration.
2. `declaration_of_independence` (Lv1 starter): Unlocks basic troops / -15% / -30% farms, mines & obelisks cost.
3. `artisans_guild`: Upgrades Gunsmiths to Gunbots (Arc T2) / +5% / +10% crit chance for mechanisms.
4. `rebel_army`: Upgrades Rebels to Myrmidons (Inf T2) / +7% / +15% freeze chance on infantry strikes.
5. `magic_library`: Unlocks Frost Enchantment / -10% / -20% mana spells cost.
6. `liberation_army`: Unlocks Banner of Liberation / +15% / +30% squad XP gain.
7. `magic_academy`: Upgrades Acolytes to Wizards (Mag T2) / Magic Towers give +1 / +2 extra gold, supply, and mana/s.
8. `tame_the_reptiles`: Upgrades Lancers to Dragon Lancers (Cav T2) / +10% / +20% cavalry HP.
9. `giant_construction`: Upgrades marksmen to Giantbots (Arc T3) / Giantbots restore 2% / 4% HP per second.

## 3. All 16 Spells, Banners & Ultimates (`§_-7Y§/§_-8c§.as`)

| Faction | Spell 1 | Spell 2 | Banner (Spell 3) | Ultimate (Spell 4) |
|---|---|---|---|---|
| **Westaria** | `lords_judgement` (150m, r75, 30-60% maxHP AoE) | `banner_consecration` (50m, r75, p10, 12s heal+res) | `banner_heroism` (70m, r75, 12s, 1.5x dmg) | `sign_of_advent` (Summon Avatar 45s) |
| **Khaganate** | `summon_stoneworms` (100m, r75, p8 AoE burst) | `disentomb` (250m, summon temp Immortals squad 45s) | `banner_bloodlust` (50m, r75, 12s, +35% dmg) | `cataclysm` (Global meteor storm vs enemy squads/forts + self splash) |
| **The Cult** | `ice_blast` (100m, r75, 5s freeze + frost dmg) | `frost_enchantment` (150m, r75, 10s max dmg & -25% dmg taken) | `banner_liberation` (50m, r75, 12s cleanse & magic immunity) | `grand_transformation` (Slays 50% enemy living soldiers -> +20g & +20m each) |
| **The Empire (AI)** | `terror` (100m, r75, fear & strip heroic) | `raise_the_dead` (250m, summon Undying Warriors) | `banner_desecration` (75m, r75, 12s undead heal+res) | `call_of_the_grave` (Converts/strikes living enemy squads) |

## 4. Phase 3 Units & Abilities (`battle/§_-pl§.as`)
- Added **Khaganate T3**: `k_ancient_raiders` (`RedCavalry3`, 5 × 75 HP, dmg 7-12, Charge 2, Intimidation 20, Undead, cost 180).
- Added **Cult T3**: `b_giantbots` (`BlueArchers3`, 1 × 200 HP, dmg 30-50, period 1.0s, range 115, cost 120, Mechanism, MartialArtists).
- Status effects: `Frozen` (cannot move or attack), `Poisoned` (damage over time ignoring armor, blocked by `PoisonImmunity` or `Liberation`), `FrostEnchanted` (always rolls `dmgMax` + `-25%` incoming damage), `Bloodlust` (`1.35x` strike damage), `Liberation` (cleanses & prevents negative magic), `Feared` (`-35%` damage).

## 5. All 22 Badges (`progress/Badges.as`)
All 22 original Takeover Badges tracked persistently across campaigns and single-mission peaks (`takeover_save_v3` with automatic migration from `takeover_westaria_save_v2`).
