// Auto-generated from flash/3986.swf by scripts/extract-all-levels.py
import { LevelDef, PlayableCampaignId } from './Types';

export const ALL_LEVELS: LevelDef[] = [
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
    "tutorialMode": "tutorial1",
    "nodes": [
      {
        "id": "080",
        "label": "Junction 080",
        "kind": "Junction",
        "locationNum": 1,
        "flashX": 272.1,
        "flashY": 125.2
      },
      {
        "id": "070",
        "label": "Junction 070",
        "kind": "Junction",
        "locationNum": 1,
        "flashX": 200.3,
        "flashY": 212.0
      },
      {
        "id": "010",
        "label": "Junction 010",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 525.3,
        "flashY": 170.2
      },
      {
        "id": "060",
        "label": "Junction 060",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 339.95,
        "flashY": 286.8
      },
      {
        "id": "057",
        "label": "Westaria Castle",
        "kind": "Stronghold",
        "locationNum": 2,
        "flashX": 450.95,
        "flashY": 384.7,
        "strongholdKind": "Castle",
        "initialOwner": "Westaria"
      },
      {
        "id": "077",
        "label": "Empire Town",
        "kind": "Stronghold",
        "locationNum": 1,
        "flashX": 150.75,
        "flashY": 231.35,
        "strongholdKind": "Town",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_00_0",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 609.95,
        "flashY": 240.9,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_00_1",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 671.0,
        "flashY": 200.9,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "040",
        "label": "Junction 040",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 408.9,
        "flashY": 374.85
      },
      {
        "id": "007",
        "label": "Empire Castle",
        "kind": "Stronghold",
        "locationNum": 0,
        "flashX": 573.5,
        "flashY": 178.1,
        "strongholdKind": "Castle",
        "initialOwner": "TheEmpire"
      }
    ],
    "edges": [
      {
        "id": "ed_010_007",
        "from": "010",
        "to": "007",
        "waypoints": []
      },
      {
        "id": "ed_040_060",
        "from": "040",
        "to": "060",
        "waypoints": [
          {
            "x": 393.7,
            "y": 366.6
          },
          {
            "x": 377.7,
            "y": 351.0
          },
          {
            "x": 366.7,
            "y": 331.1
          },
          {
            "x": 351.7,
            "y": 304.05
          }
        ]
      },
      {
        "id": "ed_040_057",
        "from": "040",
        "to": "057",
        "waypoints": []
      },
      {
        "id": "ed_060_070",
        "from": "060",
        "to": "070",
        "waypoints": []
      },
      {
        "id": "ed_070_080",
        "from": "070",
        "to": "080",
        "waypoints": [
          {
            "x": 207.96,
            "y": 190.86
          },
          {
            "x": 214.87,
            "y": 162.79
          },
          {
            "x": 228.39,
            "y": 141.45
          },
          {
            "x": 246.46,
            "y": 127.31
          }
        ]
      },
      {
        "id": "ed_070_077",
        "from": "070",
        "to": "077",
        "waypoints": []
      },
      {
        "id": "ed_080_010",
        "from": "080",
        "to": "010",
        "waypoints": [
          {
            "x": 307.03,
            "y": 123.62
          },
          {
            "x": 350.0,
            "y": 118.76
          },
          {
            "x": 397.73,
            "y": 121.11
          },
          {
            "x": 442.76,
            "y": 145.48
          },
          {
            "x": 489.23,
            "y": 164.31
          }
        ]
      }
    ]
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
    "tutorialMode": "tutorial2",
    "nodes": [
      {
        "id": "050",
        "label": "Junction 050",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 396.6,
        "flashY": 157.65
      },
      {
        "id": "015",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 1,
        "flashX": 491.5,
        "flashY": 263.6,
        "initialOwner": "Bandits"
      },
      {
        "id": "017",
        "label": "Westaria Camp",
        "kind": "Stronghold",
        "locationNum": 1,
        "flashX": 409.8,
        "flashY": 350.8,
        "strongholdKind": "Camp",
        "initialOwner": "Westaria"
      },
      {
        "id": "007",
        "label": "Khaganate Castle",
        "kind": "Stronghold",
        "locationNum": 0,
        "flashX": 586.95,
        "flashY": 141.05,
        "strongholdKind": "Castle",
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "027",
        "label": "Khaganate MagicTower",
        "kind": "Stronghold",
        "locationNum": 2,
        "flashX": 151.5,
        "flashY": 199.4,
        "strongholdKind": "MagicTower",
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_00_0",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 519.5,
        "flashY": 112.9,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_01_0",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 288.85,
        "flashY": 322.2,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_00_1",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 672.65,
        "flashY": 160.6,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_00_2",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 609.5,
        "flashY": 193.15,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_01_1",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 342.0,
        "flashY": 304.55,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_01_2",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 494.9,
        "flashY": 368.35,
        "initialOwner": "Westaria"
      },
      {
        "id": "016",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 1,
        "flashX": 546.85,
        "flashY": 260.5
      },
      {
        "id": "bs_02_0",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 118.5,
        "flashY": 270.75,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "030",
        "label": "Junction 030",
        "kind": "Junction",
        "locationNum": 1,
        "flashX": 475.05,
        "flashY": 271.15
      },
      {
        "id": "060",
        "label": "Junction 060",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 216.0,
        "flashY": 197.1
      },
      {
        "id": "070",
        "label": "Junction 070",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 305.0,
        "flashY": 173.05
      },
      {
        "id": "090",
        "label": "Junction 090",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 543.0,
        "flashY": 154.6
      },
      {
        "id": "bs_01_3",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 520.5,
        "flashY": 328.5,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_01_4",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 320.1,
        "flashY": 358.05,
        "initialOwner": "Westaria"
      },
      {
        "id": "056",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 1,
        "flashX": 312.45,
        "flashY": 110.75
      },
      {
        "id": "055",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 1,
        "flashX": 348.75,
        "flashY": 122.35,
        "initialOwner": "Bandits"
      }
    ],
    "edges": [
      {
        "id": "ed_050_055",
        "from": "050",
        "to": "055",
        "waypoints": [
          {
            "x": 360.2,
            "y": 138.65
          }
        ]
      },
      {
        "id": "ed_030_050",
        "from": "030",
        "to": "050",
        "waypoints": []
      },
      {
        "id": "ed_030_015",
        "from": "030",
        "to": "015",
        "waypoints": [
          {
            "x": 502.75,
            "y": 264.25
          }
        ]
      },
      {
        "id": "ed_016_015",
        "from": "016",
        "to": "015",
        "waypoints": [
          {
            "x": 555.0,
            "y": 260.1
          }
        ]
      },
      {
        "id": "ed_060_027",
        "from": "060",
        "to": "027",
        "waypoints": [
          {
            "x": 230.9,
            "y": 210.55
          }
        ]
      },
      {
        "id": "ed_060_070",
        "from": "060",
        "to": "070",
        "waypoints": [
          {
            "x": 239.3,
            "y": 208.4
          }
        ]
      },
      {
        "id": "ed_050_070",
        "from": "050",
        "to": "070",
        "waypoints": [
          {
            "x": 323.65,
            "y": 164.35
          }
        ]
      },
      {
        "id": "ed_050_090",
        "from": "050",
        "to": "090",
        "waypoints": [
          {
            "x": 423.8,
            "y": 157.91
          },
          {
            "x": 455.53,
            "y": 161.7
          },
          {
            "x": 487.42,
            "y": 160.89
          },
          {
            "x": 519.51,
            "y": 154.58
          }
        ]
      },
      {
        "id": "ed_090_007",
        "from": "090",
        "to": "007",
        "waypoints": []
      },
      {
        "id": "ed_017_030",
        "from": "017",
        "to": "030",
        "waypoints": [
          {
            "x": 438.9,
            "y": 326.15
          },
          {
            "x": 454.1,
            "y": 315.05
          },
          {
            "x": 465.5,
            "y": 301.05
          },
          {
            "x": 472.0,
            "y": 284.55
          }
        ]
      },
      {
        "id": "ed_055_056",
        "from": "055",
        "to": "056",
        "waypoints": []
      }
    ]
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
    "tutorialMode": "none",
    "nodes": [
      {
        "id": "010",
        "label": "Junction 010",
        "kind": "Junction",
        "locationNum": 1,
        "flashX": 186.5,
        "flashY": 262.5
      },
      {
        "id": "020",
        "label": "Junction 020",
        "kind": "Junction",
        "locationNum": 1,
        "flashX": 128.0,
        "flashY": 340.0
      },
      {
        "id": "000",
        "label": "Junction 000",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 351.5,
        "flashY": 179.5
      },
      {
        "id": "005",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 0,
        "flashX": 389.15,
        "flashY": 228.75,
        "initialOwner": "Bandits"
      },
      {
        "id": "007",
        "label": "Westaria Castle",
        "kind": "Stronghold",
        "locationNum": 0,
        "flashX": 472.5,
        "flashY": 129.5,
        "strongholdKind": "Castle",
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_00_0",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 398.0,
        "flashY": 109.3,
        "initialOwner": "Westaria"
      },
      {
        "id": "037",
        "label": "Empire Castle",
        "kind": "Stronghold",
        "locationNum": 2,
        "flashX": 130.95,
        "flashY": 451.3,
        "strongholdKind": "Castle",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "017",
        "label": "Empire Town",
        "kind": "Stronghold",
        "locationNum": 3,
        "flashX": 425.4,
        "flashY": 475.75,
        "strongholdKind": "Town",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "006",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 0,
        "flashX": 421.5,
        "flashY": 250.7
      },
      {
        "id": "027",
        "label": "Empire MagicTower",
        "kind": "Stronghold",
        "locationNum": 1,
        "flashX": 125.2,
        "flashY": 210.85,
        "strongholdKind": "MagicTower",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "057",
        "label": "Empire Castle",
        "kind": "Stronghold",
        "locationNum": 4,
        "flashX": 648.35,
        "flashY": 209.35,
        "strongholdKind": "Castle",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_00_1",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 543.0,
        "flashY": 157.3,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_01_0",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 206.0,
        "flashY": 211.3,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_01_1",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 112.0,
        "flashY": 263.3,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_05_0",
        "label": "Site 5",
        "kind": "BuildSite",
        "locationNum": 5,
        "flashX": 652.5,
        "flashY": 271.3,
        "initialOwner": "Westaria"
      },
      {
        "id": "016",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 5,
        "flashX": 491.7,
        "flashY": 308.75
      },
      {
        "id": "015",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 5,
        "flashX": 521.0,
        "flashY": 337.5,
        "initialOwner": "Bandits"
      },
      {
        "id": "030",
        "label": "Junction 030",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 301.8,
        "flashY": 448.8
      },
      {
        "id": "040",
        "label": "Junction 040",
        "kind": "Junction",
        "locationNum": 3,
        "flashX": 384.6,
        "flashY": 409.85
      },
      {
        "id": "050",
        "label": "Junction 050",
        "kind": "Junction",
        "locationNum": 4,
        "flashX": 548.55,
        "flashY": 371.0
      },
      {
        "id": "060",
        "label": "Junction 060",
        "kind": "Junction",
        "locationNum": 5,
        "flashX": 708.5,
        "flashY": 304.5
      },
      {
        "id": "080",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 2,
        "flashX": 291.1,
        "flashY": 526.1
      },
      {
        "id": "070",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 2,
        "flashX": 322.8,
        "flashY": 507.0,
        "initialOwner": "Bandits"
      },
      {
        "id": "025",
        "label": "Junction 025",
        "kind": "Junction",
        "locationNum": 1,
        "flashX": 173.95,
        "flashY": 415.35
      },
      {
        "id": "bs_02_0",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 206.0,
        "flashY": 467.55,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_02_1",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 169.4,
        "flashY": 508.95,
        "initialOwner": "TheEmpire"
      }
    ],
    "edges": [
      {
        "id": "ed_007_000",
        "from": "007",
        "to": "000",
        "waypoints": []
      },
      {
        "id": "ed_000_010",
        "from": "000",
        "to": "010",
        "waypoints": []
      },
      {
        "id": "ed_017_040",
        "from": "017",
        "to": "040",
        "waypoints": [
          {
            "x": 416.6,
            "y": 464.35
          }
        ]
      },
      {
        "id": "ed_020_010",
        "from": "020",
        "to": "010",
        "waypoints": []
      },
      {
        "id": "ed_000_005",
        "from": "000",
        "to": "005",
        "waypoints": [
          {
            "x": 353.35,
            "y": 217.5
          }
        ]
      },
      {
        "id": "ed_005_006",
        "from": "005",
        "to": "006",
        "waypoints": [
          {
            "x": 392.05,
            "y": 247.25
          }
        ]
      },
      {
        "id": "ed_027_010",
        "from": "027",
        "to": "010",
        "waypoints": [
          {
            "x": 212.95,
            "y": 225.15
          }
        ]
      },
      {
        "id": "ed_037_025",
        "from": "037",
        "to": "025",
        "waypoints": [
          {
            "x": 146.15,
            "y": 401.1
          }
        ]
      },
      {
        "id": "ed_040_050",
        "from": "040",
        "to": "050",
        "waypoints": [
          {
            "x": 413.05,
            "y": 412.95
          },
          {
            "x": 452.55,
            "y": 418.95
          },
          {
            "x": 488.5,
            "y": 405.5
          },
          {
            "x": 520.55,
            "y": 387.0
          }
        ]
      },
      {
        "id": "ed_050_060",
        "from": "050",
        "to": "060",
        "waypoints": []
      },
      {
        "id": "ed_050_015",
        "from": "050",
        "to": "015",
        "waypoints": [
          {
            "x": 513.7,
            "y": 332.95
          }
        ]
      },
      {
        "id": "ed_015_016",
        "from": "015",
        "to": "016",
        "waypoints": [
          {
            "x": 512.55,
            "y": 297.7
          }
        ]
      },
      {
        "id": "ed_060_057",
        "from": "060",
        "to": "057",
        "waypoints": [
          {
            "x": 712.5,
            "y": 283.5
          },
          {
            "x": 703.5,
            "y": 259.5
          },
          {
            "x": 688.5,
            "y": 239.5
          },
          {
            "x": 672.5,
            "y": 222.5
          }
        ]
      },
      {
        "id": "ed_070_080",
        "from": "070",
        "to": "080",
        "waypoints": [
          {
            "x": 304.6,
            "y": 530.95
          }
        ]
      },
      {
        "id": "ed_030_070",
        "from": "030",
        "to": "070",
        "waypoints": [
          {
            "x": 295.1,
            "y": 492.0
          }
        ]
      },
      {
        "id": "ed_020_025",
        "from": "020",
        "to": "025",
        "waypoints": []
      },
      {
        "id": "ed_030_040",
        "from": "030",
        "to": "040",
        "waypoints": [
          {
            "x": 315.15,
            "y": 441.35
          },
          {
            "x": 329.9,
            "y": 430.85
          },
          {
            "x": 342.15,
            "y": 413.8
          },
          {
            "x": 364.15,
            "y": 409.85
          }
        ]
      },
      {
        "id": "ed_025_030",
        "from": "025",
        "to": "030",
        "waypoints": [
          {
            "x": 218.4,
            "y": 405.7
          }
        ]
      }
    ]
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
    "tutorialMode": "none",
    "nodes": [
      {
        "id": "006",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 5,
        "flashX": 519.0,
        "flashY": 268.0
      },
      {
        "id": "005",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 5,
        "flashX": 476.0,
        "flashY": 266.95,
        "initialOwner": "Bandits"
      },
      {
        "id": "007",
        "label": "Cult Castle",
        "kind": "Stronghold",
        "locationNum": 0,
        "flashX": 679.55,
        "flashY": 196.5,
        "strongholdKind": "Castle",
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_04_0",
        "label": "Site 4",
        "kind": "BuildSite",
        "locationNum": 4,
        "flashX": 93.0,
        "flashY": 284.3,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_04_1",
        "label": "Site 4",
        "kind": "BuildSite",
        "locationNum": 4,
        "flashX": 248.45,
        "flashY": 195.0,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_04_2",
        "label": "Site 4",
        "kind": "BuildSite",
        "locationNum": 4,
        "flashX": 91.0,
        "flashY": 198.4,
        "initialOwner": "Westaria"
      },
      {
        "id": "017",
        "label": "Cult Town",
        "kind": "Stronghold",
        "locationNum": 1,
        "flashX": 662.5,
        "flashY": 386.5,
        "strongholdKind": "Town",
        "initialOwner": "TheCult"
      },
      {
        "id": "000",
        "label": "Junction 000",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 693.0,
        "flashY": 243.6
      },
      {
        "id": "037",
        "label": "Empire Town",
        "kind": "Stronghold",
        "locationNum": 3,
        "flashX": 142.6,
        "flashY": 469.25,
        "strongholdKind": "Town",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "057",
        "label": "Cult MagicTower",
        "kind": "Stronghold",
        "locationNum": 5,
        "flashX": 414.5,
        "flashY": 208.5,
        "strongholdKind": "MagicTower",
        "initialOwner": "TheCult"
      },
      {
        "id": "047",
        "label": "Westaria Castle",
        "kind": "Stronghold",
        "locationNum": 4,
        "flashX": 153.0,
        "flashY": 149.65,
        "strongholdKind": "Castle",
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_00_0",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 587.5,
        "flashY": 226.55,
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_00_1",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 570.45,
        "flashY": 179.55,
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_00_2",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 739.35,
        "flashY": 170.2,
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_01_0",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 593.4,
        "flashY": 423.05,
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_01_1",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 647.45,
        "flashY": 440.4,
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_02_0",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 323.95,
        "flashY": 481.05,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_03_0",
        "label": "Site 3",
        "kind": "BuildSite",
        "locationNum": 3,
        "flashX": 66.45,
        "flashY": 470.15,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_02_1",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 481.45,
        "flashY": 482.25,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_05_0",
        "label": "Site 5",
        "kind": "BuildSite",
        "locationNum": 5,
        "flashX": 278.0,
        "flashY": 272.3,
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_05_1",
        "label": "Site 5",
        "kind": "BuildSite",
        "locationNum": 5,
        "flashX": 333.0,
        "flashY": 314.3,
        "initialOwner": "TheCult"
      },
      {
        "id": "010",
        "label": "Junction 010",
        "kind": "Junction",
        "locationNum": 1,
        "flashX": 661.5,
        "flashY": 288.0
      },
      {
        "id": "020",
        "label": "Junction 020",
        "kind": "Junction",
        "locationNum": 1,
        "flashX": 587.5,
        "flashY": 350.15
      },
      {
        "id": "040",
        "label": "Junction 040",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 485.0,
        "flashY": 430.5
      },
      {
        "id": "050",
        "label": "Junction 050",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 477.0,
        "flashY": 359.4
      },
      {
        "id": "120",
        "label": "Junction 120",
        "kind": "Junction",
        "locationNum": 5,
        "flashX": 431.0,
        "flashY": 295.0
      },
      {
        "id": "110",
        "label": "Junction 110",
        "kind": "Junction",
        "locationNum": 5,
        "flashX": 367.0,
        "flashY": 270.0
      },
      {
        "id": "100",
        "label": "Junction 100",
        "kind": "Junction",
        "locationNum": 4,
        "flashX": 240.0,
        "flashY": 228.0
      },
      {
        "id": "090",
        "label": "Junction 090",
        "kind": "Junction",
        "locationNum": 4,
        "flashX": 155.0,
        "flashY": 201.5
      },
      {
        "id": "080",
        "label": "Junction 080",
        "kind": "Junction",
        "locationNum": 4,
        "flashX": 181.0,
        "flashY": 268.0
      },
      {
        "id": "070",
        "label": "Junction 070",
        "kind": "Junction",
        "locationNum": 3,
        "flashX": 193.0,
        "flashY": 324.0
      },
      {
        "id": "060",
        "label": "Junction 060",
        "kind": "Junction",
        "locationNum": 3,
        "flashX": 256.0,
        "flashY": 425.0
      },
      {
        "id": "130",
        "label": "Junction 130",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 422.9,
        "flashY": 465.55
      },
      {
        "id": "027",
        "label": "Empire Castle",
        "kind": "Stronghold",
        "locationNum": 2,
        "flashX": 397.35,
        "flashY": 414.5,
        "strongholdKind": "Castle",
        "initialOwner": "TheEmpire"
      }
    ],
    "edges": [
      {
        "id": "ed_007_000",
        "from": "007",
        "to": "000",
        "waypoints": [
          {
            "x": 648.25,
            "y": 204.8
          }
        ]
      },
      {
        "id": "ed_020_017",
        "from": "020",
        "to": "017",
        "waypoints": []
      },
      {
        "id": "ed_010_020",
        "from": "010",
        "to": "020",
        "waypoints": [
          {
            "x": 639.5,
            "y": 293.0
          },
          {
            "x": 620.0,
            "y": 302.5
          },
          {
            "x": 600.0,
            "y": 312.0
          },
          {
            "x": 585.5,
            "y": 327.0
          }
        ]
      },
      {
        "id": "ed_130_027",
        "from": "130",
        "to": "027",
        "waypoints": [
          {
            "x": 426.6,
            "y": 473.5
          }
        ]
      },
      {
        "id": "ed_040_050",
        "from": "040",
        "to": "050",
        "waypoints": [
          {
            "x": 486.54,
            "y": 413.43
          },
          {
            "x": 487.78,
            "y": 398.33
          },
          {
            "x": 486.35,
            "y": 383.89
          },
          {
            "x": 482.47,
            "y": 371.22
          }
        ]
      },
      {
        "id": "ed_060_037",
        "from": "060",
        "to": "037",
        "waypoints": [
          {
            "x": 229.9,
            "y": 432.55
          },
          {
            "x": 207.9,
            "y": 438.55
          },
          {
            "x": 185.9,
            "y": 447.55
          },
          {
            "x": 164.9,
            "y": 457.55
          }
        ]
      },
      {
        "id": "ed_130_060",
        "from": "130",
        "to": "060",
        "waypoints": [
          {
            "x": 396.55,
            "y": 466.75
          },
          {
            "x": 358.55,
            "y": 452.75
          },
          {
            "x": 319.55,
            "y": 441.25
          },
          {
            "x": 279.55,
            "y": 435.25
          }
        ]
      },
      {
        "id": "ed_060_070",
        "from": "060",
        "to": "070",
        "waypoints": [
          {
            "x": 243.5,
            "y": 407.5
          },
          {
            "x": 229.5,
            "y": 386.5
          },
          {
            "x": 215.5,
            "y": 363.5
          },
          {
            "x": 206.5,
            "y": 340.5
          }
        ]
      },
      {
        "id": "ed_070_080",
        "from": "070",
        "to": "080",
        "waypoints": [
          {
            "x": 181.5,
            "y": 313.5
          },
          {
            "x": 172.5,
            "y": 301.5
          },
          {
            "x": 170.5,
            "y": 288.5
          },
          {
            "x": 180.5,
            "y": 278.5
          }
        ]
      },
      {
        "id": "ed_080_090",
        "from": "080",
        "to": "090",
        "waypoints": [
          {
            "x": 167.05,
            "y": 256.0
          },
          {
            "x": 142.55,
            "y": 248.0
          },
          {
            "x": 135.55,
            "y": 232.5
          },
          {
            "x": 144.05,
            "y": 215.0
          }
        ]
      },
      {
        "id": "ed_090_100",
        "from": "090",
        "to": "100",
        "waypoints": [
          {
            "x": 170.05,
            "y": 203.75
          },
          {
            "x": 192.05,
            "y": 210.75
          },
          {
            "x": 210.55,
            "y": 219.25
          },
          {
            "x": 230.05,
            "y": 226.75
          }
        ]
      },
      {
        "id": "ed_100_110",
        "from": "100",
        "to": "110",
        "waypoints": [
          {
            "x": 271.5,
            "y": 233.5
          },
          {
            "x": 305.5,
            "y": 234.5
          },
          {
            "x": 327.5,
            "y": 249.5
          },
          {
            "x": 350.5,
            "y": 267.5
          }
        ]
      },
      {
        "id": "ed_110_057",
        "from": "110",
        "to": "057",
        "waypoints": []
      },
      {
        "id": "ed_110_120",
        "from": "110",
        "to": "120",
        "waypoints": []
      },
      {
        "id": "ed_120_005",
        "from": "120",
        "to": "005",
        "waypoints": []
      },
      {
        "id": "ed_005_006",
        "from": "005",
        "to": "006",
        "waypoints": []
      },
      {
        "id": "ed_130_040",
        "from": "130",
        "to": "040",
        "waypoints": [
          {
            "x": 429.8,
            "y": 475.05
          }
        ]
      },
      {
        "id": "ed_120_050",
        "from": "120",
        "to": "050",
        "waypoints": [
          {
            "x": 428.75,
            "y": 312.5
          },
          {
            "x": 443.25,
            "y": 323.25
          },
          {
            "x": 456.75,
            "y": 333.0
          },
          {
            "x": 468.0,
            "y": 349.0
          }
        ]
      },
      {
        "id": "ed_090_047",
        "from": "090",
        "to": "047",
        "waypoints": [
          {
            "x": 160.6,
            "y": 191.55
          }
        ]
      },
      {
        "id": "ed_000_010",
        "from": "000",
        "to": "010",
        "waypoints": [
          {
            "x": 628.05,
            "y": 239.9
          }
        ]
      },
      {
        "id": "ed_050_020",
        "from": "050",
        "to": "020",
        "waypoints": [
          {
            "x": 507.1,
            "y": 374.5
          }
        ]
      }
    ]
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
    "tutorialMode": "none",
    "nodes": [
      {
        "id": "087",
        "label": "Empire Castle",
        "kind": "Stronghold",
        "locationNum": 4,
        "flashX": 209.6,
        "flashY": 312.0,
        "strongholdKind": "Castle",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "027",
        "label": "Westaria Town",
        "kind": "Stronghold",
        "locationNum": 1,
        "flashX": 599.85,
        "flashY": 139.75,
        "strongholdKind": "Town",
        "initialOwner": "Westaria"
      },
      {
        "id": "067",
        "label": "Khaganate Castle",
        "kind": "Stronghold",
        "locationNum": 3,
        "flashX": 103.95,
        "flashY": 494.65,
        "strongholdKind": "Castle",
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "007",
        "label": "Empire MagicTower",
        "kind": "Stronghold",
        "locationNum": 0,
        "flashX": 215.9,
        "flashY": 166.3,
        "strongholdKind": "MagicTower",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "047",
        "label": "Empire Town",
        "kind": "Stronghold",
        "locationNum": 2,
        "flashX": 597.3,
        "flashY": 377.85,
        "strongholdKind": "Town",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "000",
        "label": "Junction 000",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 208.35,
        "flashY": 132.35
      },
      {
        "id": "010",
        "label": "Junction 010",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 386.3,
        "flashY": 117.35
      },
      {
        "id": "020",
        "label": "Junction 020",
        "kind": "Junction",
        "locationNum": 1,
        "flashX": 576.25,
        "flashY": 175.35
      },
      {
        "id": "030",
        "label": "Junction 030",
        "kind": "Junction",
        "locationNum": 1,
        "flashX": 711.25,
        "flashY": 287.35
      },
      {
        "id": "040",
        "label": "Junction 040",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 628.25,
        "flashY": 412.3
      },
      {
        "id": "050",
        "label": "Junction 050",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 529.25,
        "flashY": 469.3
      },
      {
        "id": "060",
        "label": "Junction 060",
        "kind": "Junction",
        "locationNum": 3,
        "flashX": 150.35,
        "flashY": 471.3
      },
      {
        "id": "070",
        "label": "Junction 070",
        "kind": "Junction",
        "locationNum": 3,
        "flashX": 105.3,
        "flashY": 422.3
      },
      {
        "id": "080",
        "label": "Junction 080",
        "kind": "Junction",
        "locationNum": 4,
        "flashX": 160.15,
        "flashY": 297.35
      },
      {
        "id": "090",
        "label": "Junction 090",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 147.35,
        "flashY": 178.35
      },
      {
        "id": "bs_01_0",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 692.25,
        "flashY": 140.4,
        "initialOwner": "Westaria"
      },
      {
        "id": "035",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 1,
        "flashX": 600.75,
        "flashY": 256.15,
        "initialOwner": "Bandits"
      },
      {
        "id": "036",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 1,
        "flashX": 558.45,
        "flashY": 264.85
      },
      {
        "id": "bs_01_1",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 716.65,
        "flashY": 199.25,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_01_2",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 494.4,
        "flashY": 103.6,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_04_0",
        "label": "Site 4",
        "kind": "BuildSite",
        "locationNum": 4,
        "flashX": 299.4,
        "flashY": 295.4,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_04_1",
        "label": "Site 4",
        "kind": "BuildSite",
        "locationNum": 4,
        "flashX": 282.4,
        "flashY": 335.8,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_04_2",
        "label": "Site 4",
        "kind": "BuildSite",
        "locationNum": 4,
        "flashX": 231.75,
        "flashY": 366.3,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_02_0",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 644.65,
        "flashY": 454.35,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_03_0",
        "label": "Site 3",
        "kind": "BuildSite",
        "locationNum": 3,
        "flashX": 206.55,
        "flashY": 460.4,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "045",
        "label": "Junction 045",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 649.2,
        "flashY": 209.95
      },
      {
        "id": "055",
        "label": "Junction 055",
        "kind": "Junction",
        "locationNum": 5,
        "flashX": 396.3,
        "flashY": 501.5
      },
      {
        "id": "057",
        "label": "Khaganate MagicTower",
        "kind": "Stronghold",
        "locationNum": 5,
        "flashX": 401.5,
        "flashY": 471.05,
        "strongholdKind": "MagicTower",
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_05_0",
        "label": "Site 5",
        "kind": "BuildSite",
        "locationNum": 5,
        "flashX": 317.95,
        "flashY": 460.7,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_00_0",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 140.8,
        "flashY": 110.95,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_05_1",
        "label": "Site 5",
        "kind": "BuildSite",
        "locationNum": 5,
        "flashX": 487.9,
        "flashY": 446.2,
        "initialOwner": "TheKhaganate"
      }
    ],
    "edges": [
      {
        "id": "ed_007_000",
        "from": "007",
        "to": "000",
        "waypoints": []
      },
      {
        "id": "ed_010_020",
        "from": "010",
        "to": "020",
        "waypoints": [
          {
            "x": 456.8,
            "y": 128.45
          }
        ]
      },
      {
        "id": "ed_050_040",
        "from": "050",
        "to": "040",
        "waypoints": [
          {
            "x": 566.75,
            "y": 431.55
          }
        ]
      },
      {
        "id": "ed_070_060",
        "from": "070",
        "to": "060",
        "waypoints": [
          {
            "x": 121.6,
            "y": 444.4
          }
        ]
      },
      {
        "id": "ed_027_020",
        "from": "027",
        "to": "020",
        "waypoints": [
          {
            "x": 555.5,
            "y": 142.6
          }
        ]
      },
      {
        "id": "ed_047_040",
        "from": "047",
        "to": "040",
        "waypoints": []
      },
      {
        "id": "ed_067_060",
        "from": "067",
        "to": "060",
        "waypoints": [
          {
            "x": 129.3,
            "y": 462.4
          }
        ]
      },
      {
        "id": "ed_087_080",
        "from": "087",
        "to": "080",
        "waypoints": [
          {
            "x": 179.45,
            "y": 299.6
          }
        ]
      },
      {
        "id": "ed_036_035",
        "from": "036",
        "to": "035",
        "waypoints": [
          {
            "x": 564.8,
            "y": 249.8
          }
        ]
      },
      {
        "id": "ed_090_080",
        "from": "090",
        "to": "080",
        "waypoints": [
          {
            "x": 165.35,
            "y": 203.35
          },
          {
            "x": 211.1,
            "y": 231.8
          },
          {
            "x": 214.6,
            "y": 254.55
          },
          {
            "x": 190.05,
            "y": 282.25
          }
        ]
      },
      {
        "id": "ed_070_080",
        "from": "070",
        "to": "080",
        "waypoints": [
          {
            "x": 100.35,
            "y": 394.45
          },
          {
            "x": 100.35,
            "y": 364.95
          },
          {
            "x": 121.6,
            "y": 344.65
          },
          {
            "x": 138.05,
            "y": 318.35
          }
        ]
      },
      {
        "id": "ed_090_000",
        "from": "090",
        "to": "000",
        "waypoints": [
          {
            "x": 156.4,
            "y": 153.9
          },
          {
            "x": 185.15,
            "y": 138.35
          }
        ]
      },
      {
        "id": "ed_010_000",
        "from": "010",
        "to": "000",
        "waypoints": [
          {
            "x": 356.6,
            "y": 109.3
          },
          {
            "x": 313.35,
            "y": 109.3
          },
          {
            "x": 275.8,
            "y": 109.3
          },
          {
            "x": 237.25,
            "y": 120.5
          }
        ]
      },
      {
        "id": "ed_045_030",
        "from": "045",
        "to": "030",
        "waypoints": [
          {
            "x": 675.5,
            "y": 231.65
          }
        ]
      },
      {
        "id": "ed_045_035",
        "from": "045",
        "to": "035",
        "waypoints": [
          {
            "x": 616.8,
            "y": 215.6
          }
        ]
      },
      {
        "id": "ed_055_060",
        "from": "055",
        "to": "060",
        "waypoints": [
          {
            "x": 347.75,
            "y": 499.3
          },
          {
            "x": 269.8,
            "y": 500.3
          },
          {
            "x": 190.05,
            "y": 496.8
          },
          {
            "x": 162.0,
            "y": 483.0
          }
        ]
      },
      {
        "id": "ed_020_045",
        "from": "020",
        "to": "045",
        "waypoints": [
          {
            "x": 597.55,
            "y": 174.95
          }
        ]
      },
      {
        "id": "ed_030_040",
        "from": "030",
        "to": "040",
        "waypoints": [
          {
            "x": 718.15,
            "y": 319.0
          },
          {
            "x": 708.25,
            "y": 343.5
          },
          {
            "x": 680.0,
            "y": 373.25
          },
          {
            "x": 654.45,
            "y": 394.45
          }
        ]
      },
      {
        "id": "ed_057_055",
        "from": "057",
        "to": "055",
        "waypoints": [
          {
            "x": 382.3,
            "y": 468.75
          }
        ]
      },
      {
        "id": "ed_050_055",
        "from": "050",
        "to": "055",
        "waypoints": [
          {
            "x": 510.25,
            "y": 479.15
          },
          {
            "x": 480.85,
            "y": 490.9
          },
          {
            "x": 449.6,
            "y": 496.9
          },
          {
            "x": 414.55,
            "y": 498.6
          }
        ]
      }
    ]
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
    "tutorialMode": "none",
    "nodes": [
      {
        "id": "037",
        "label": "Westaria Town",
        "kind": "Stronghold",
        "locationNum": 1,
        "flashX": 661.0,
        "flashY": 176.05,
        "strongholdKind": "Town",
        "initialOwner": "Westaria"
      },
      {
        "id": "010",
        "label": "Junction 010",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 407.7,
        "flashY": 155.35
      },
      {
        "id": "bs_01_0",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 579.15,
        "flashY": 165.95,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_03_0",
        "label": "Site 3",
        "kind": "BuildSite",
        "locationNum": 3,
        "flashX": 283.1,
        "flashY": 446.4,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_02_0",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 531.1,
        "flashY": 407.25,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_03_1",
        "label": "Site 3",
        "kind": "BuildSite",
        "locationNum": 3,
        "flashX": 224.7,
        "flashY": 450.2,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "057",
        "label": "Khaganate Town",
        "kind": "Stronghold",
        "locationNum": 3,
        "flashX": 146.45,
        "flashY": 487.6,
        "strongholdKind": "Town",
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "020",
        "label": "Junction 020",
        "kind": "Junction",
        "locationNum": 1,
        "flashX": 593.7,
        "flashY": 120.35
      },
      {
        "id": "030",
        "label": "Junction 030",
        "kind": "Junction",
        "locationNum": 1,
        "flashX": 691.8,
        "flashY": 144.35
      },
      {
        "id": "040",
        "label": "Junction 040",
        "kind": "Junction",
        "locationNum": 1,
        "flashX": 763.8,
        "flashY": 222.35
      },
      {
        "id": "050",
        "label": "Junction 050",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 662.85,
        "flashY": 297.35
      },
      {
        "id": "060",
        "label": "Junction 060",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 535.25,
        "flashY": 328.8
      },
      {
        "id": "070",
        "label": "Junction 070",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 447.6,
        "flashY": 332.95
      },
      {
        "id": "090",
        "label": "Junction 090",
        "kind": "Junction",
        "locationNum": 3,
        "flashX": 192.8,
        "flashY": 478.8
      },
      {
        "id": "100",
        "label": "Junction 100",
        "kind": "Junction",
        "locationNum": 3,
        "flashX": 177.3,
        "flashY": 358.35
      },
      {
        "id": "110",
        "label": "Junction 110",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 316.2,
        "flashY": 274.95
      },
      {
        "id": "063",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 2,
        "flashX": 610.8,
        "flashY": 368.0,
        "initialOwner": "Bandits"
      },
      {
        "id": "066",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 2,
        "flashX": 666.5,
        "flashY": 382.65
      },
      {
        "id": "bs_02_1",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 358.7,
        "flashY": 377.3,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_03_2",
        "label": "Site 3",
        "kind": "BuildSite",
        "locationNum": 3,
        "flashX": 247.9,
        "flashY": 489.25,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "036",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 1,
        "flashX": 221.45,
        "flashY": 257.25
      },
      {
        "id": "033",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 1,
        "flashX": 268.95,
        "flashY": 262.4,
        "initialOwner": "Bandits"
      },
      {
        "id": "bs_01_1",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 719.2,
        "flashY": 226.45,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_00_0",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 342.35,
        "flashY": 169.25,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_02_2",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 437.9,
        "flashY": 456.2,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "027",
        "label": "Khaganate MagicTower",
        "kind": "Stronghold",
        "locationNum": 0,
        "flashX": 433.05,
        "flashY": 187.75,
        "strongholdKind": "MagicTower",
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "047",
        "label": "Khaganate Castle",
        "kind": "Stronghold",
        "locationNum": 2,
        "flashX": 439.85,
        "flashY": 397.95,
        "strongholdKind": "Castle",
        "initialOwner": "TheKhaganate"
      }
    ],
    "edges": [
      {
        "id": "ed_027_010",
        "from": "027",
        "to": "010",
        "waypoints": []
      },
      {
        "id": "ed_037_030",
        "from": "037",
        "to": "030",
        "waypoints": [
          {
            "x": 668.85,
            "y": 140.45
          }
        ]
      },
      {
        "id": "ed_047_070",
        "from": "047",
        "to": "070",
        "waypoints": [
          {
            "x": 430.6,
            "y": 339.05
          }
        ]
      },
      {
        "id": "ed_057_090",
        "from": "057",
        "to": "090",
        "waypoints": [
          {
            "x": 161.55,
            "y": 462.4
          }
        ]
      },
      {
        "id": "ed_063_066",
        "from": "063",
        "to": "066",
        "waypoints": [
          {
            "x": 623.5,
            "y": 364.45
          }
        ]
      },
      {
        "id": "ed_090_100",
        "from": "090",
        "to": "100",
        "waypoints": [
          {
            "x": 175.55,
            "y": 461.95
          },
          {
            "x": 155.55,
            "y": 437.85
          },
          {
            "x": 150.8,
            "y": 407.65
          },
          {
            "x": 158.45,
            "y": 376.35
          }
        ]
      },
      {
        "id": "ed_070_110",
        "from": "070",
        "to": "110",
        "waypoints": [
          {
            "x": 426.55,
            "y": 325.7
          },
          {
            "x": 396.05,
            "y": 314.4
          },
          {
            "x": 364.8,
            "y": 298.9
          },
          {
            "x": 336.45,
            "y": 281.6
          }
        ]
      },
      {
        "id": "ed_100_110",
        "from": "100",
        "to": "110",
        "waypoints": [
          {
            "x": 200.8,
            "y": 346.6
          },
          {
            "x": 243.9,
            "y": 338.6
          },
          {
            "x": 279.15,
            "y": 326.1
          },
          {
            "x": 304.8,
            "y": 296.95
          }
        ]
      },
      {
        "id": "ed_040_050",
        "from": "040",
        "to": "050",
        "waypoints": [
          {
            "x": 757.85,
            "y": 245.95
          },
          {
            "x": 741.85,
            "y": 264.95
          },
          {
            "x": 717.1,
            "y": 278.15
          },
          {
            "x": 686.8,
            "y": 289.35
          }
        ]
      },
      {
        "id": "ed_110_010",
        "from": "110",
        "to": "010",
        "waypoints": [
          {
            "x": 329.45,
            "y": 259.3
          },
          {
            "x": 348.05,
            "y": 229.3
          },
          {
            "x": 367.3,
            "y": 198.5
          },
          {
            "x": 387.45,
            "y": 172.15
          }
        ]
      },
      {
        "id": "ed_020_030",
        "from": "020",
        "to": "030",
        "waypoints": [
          {
            "x": 612.8,
            "y": 119.15
          },
          {
            "x": 635.9,
            "y": 120.65
          },
          {
            "x": 654.65,
            "y": 128.65
          },
          {
            "x": 675.35,
            "y": 137.35
          }
        ]
      },
      {
        "id": "ed_030_040",
        "from": "030",
        "to": "040",
        "waypoints": [
          {
            "x": 708.75,
            "y": 148.85
          },
          {
            "x": 727.85,
            "y": 161.65
          },
          {
            "x": 746.6,
            "y": 179.15
          },
          {
            "x": 757.8,
            "y": 201.35
          }
        ]
      },
      {
        "id": "ed_060_050",
        "from": "060",
        "to": "050",
        "waypoints": [
          {
            "x": 554.35,
            "y": 322.85
          },
          {
            "x": 581.85,
            "y": 317.85
          },
          {
            "x": 614.6,
            "y": 310.5
          },
          {
            "x": 647.3,
            "y": 304.2
          }
        ]
      },
      {
        "id": "ed_033_036",
        "from": "033",
        "to": "036",
        "waypoints": [
          {
            "x": 230.5,
            "y": 247.15
          }
        ]
      },
      {
        "id": "ed_060_063",
        "from": "060",
        "to": "063",
        "waypoints": [
          {
            "x": 553.3,
            "y": 335.6
          }
        ]
      },
      {
        "id": "ed_110_033",
        "from": "110",
        "to": "033",
        "waypoints": [
          {
            "x": 281.45,
            "y": 253.45
          }
        ]
      },
      {
        "id": "ed_070_060",
        "from": "070",
        "to": "060",
        "waypoints": [
          {
            "x": 481.25,
            "y": 315.65
          }
        ]
      },
      {
        "id": "ed_010_020",
        "from": "010",
        "to": "020",
        "waypoints": [
          {
            "x": 431.25,
            "y": 138.35
          },
          {
            "x": 463.35,
            "y": 122.85
          },
          {
            "x": 497.1,
            "y": 113.35
          },
          {
            "x": 532.8,
            "y": 114.35
          },
          {
            "x": 573.2,
            "y": 116.85
          }
        ]
      }
    ]
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
    "tutorialMode": "none",
    "nodes": [
      {
        "id": "027",
        "label": "Westaria Castle",
        "kind": "Stronghold",
        "locationNum": 0,
        "flashX": 182.95,
        "flashY": 159.0,
        "strongholdKind": "Castle",
        "initialOwner": "Westaria"
      },
      {
        "id": "077",
        "label": "Empire Castle",
        "kind": "Stronghold",
        "locationNum": 5,
        "flashX": 78.85,
        "flashY": 404.65,
        "strongholdKind": "Castle",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "037",
        "label": "Cult MagicTower",
        "kind": "Stronghold",
        "locationNum": 1,
        "flashX": 637.9,
        "flashY": 157.6,
        "strongholdKind": "MagicTower",
        "initialOwner": "TheCult"
      },
      {
        "id": "047",
        "label": "Cult Castle",
        "kind": "Stronghold",
        "locationNum": 2,
        "flashX": 677.45,
        "flashY": 359.2,
        "strongholdKind": "Castle",
        "initialOwner": "TheCult"
      },
      {
        "id": "057",
        "label": "Cult Town",
        "kind": "Stronghold",
        "locationNum": 3,
        "flashX": 448.15,
        "flashY": 311.45,
        "strongholdKind": "Town",
        "initialOwner": "TheCult"
      },
      {
        "id": "067",
        "label": "Empire MagicTower",
        "kind": "Stronghold",
        "locationNum": 4,
        "flashX": 307.1,
        "flashY": 485.05,
        "strongholdKind": "MagicTower",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_02_0",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 736.25,
        "flashY": 318.4,
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_01_0",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 534.3,
        "flashY": 128.65,
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_02_1",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 623.25,
        "flashY": 399.35,
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_05_0",
        "label": "Site 5",
        "kind": "BuildSite",
        "locationNum": 5,
        "flashX": 160.4,
        "flashY": 444.35,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "010",
        "label": "Junction 010",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 219.35,
        "flashY": 180.2
      },
      {
        "id": "016",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 0,
        "flashX": 274.0,
        "flashY": 276.15,
        "initialOwner": "Bandits"
      },
      {
        "id": "017",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 0,
        "flashX": 272.6,
        "flashY": 314.75
      },
      {
        "id": "bs_00_0",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 92.5,
        "flashY": 88.55,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_02_2",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 644.7,
        "flashY": 489.2,
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_00_1",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 249.9,
        "flashY": 121.95,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_00_2",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 118.95,
        "flashY": 199.95,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_01_1",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 591.2,
        "flashY": 193.35,
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_05_1",
        "label": "Site 5",
        "kind": "BuildSite",
        "locationNum": 5,
        "flashX": 92.05,
        "flashY": 469.9,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "036",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 3,
        "flashX": 455.15,
        "flashY": 192.25
      },
      {
        "id": "033",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 3,
        "flashX": 488.45,
        "flashY": 186.65,
        "initialOwner": "Bandits"
      },
      {
        "id": "044",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 2,
        "flashX": 616.95,
        "flashY": 289.15,
        "initialOwner": "Bandits"
      },
      {
        "id": "048",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 2,
        "flashX": 568.9,
        "flashY": 260.05
      },
      {
        "id": "020",
        "label": "Junction 020",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 413.95,
        "flashY": 159.45
      },
      {
        "id": "030",
        "label": "Junction 030",
        "kind": "Junction",
        "locationNum": 1,
        "flashX": 616.75,
        "flashY": 96.25
      },
      {
        "id": "040",
        "label": "Junction 040",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 723.95,
        "flashY": 234.95
      },
      {
        "id": "050",
        "label": "Junction 050",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 608.95,
        "flashY": 358.95
      },
      {
        "id": "060",
        "label": "Junction 060",
        "kind": "Junction",
        "locationNum": 4,
        "flashX": 344.5,
        "flashY": 497.1
      },
      {
        "id": "070",
        "label": "Junction 070",
        "kind": "Junction",
        "locationNum": 5,
        "flashX": 137.35,
        "flashY": 392.45
      },
      {
        "id": "032",
        "label": "Junction 032",
        "kind": "Junction",
        "locationNum": 3,
        "flashX": 482.65,
        "flashY": 284.5
      },
      {
        "id": "066",
        "label": "Junction 066",
        "kind": "Junction",
        "locationNum": 3,
        "flashX": 443.95,
        "flashY": 325.95
      },
      {
        "id": "015",
        "label": "Junction 015",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 276.95,
        "flashY": 215.95
      },
      {
        "id": "bs_05_2",
        "label": "Site 5",
        "kind": "BuildSite",
        "locationNum": 5,
        "flashX": 153.75,
        "flashY": 345.0,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "031",
        "label": "Junction 031",
        "kind": "Junction",
        "locationNum": 1,
        "flashX": 591.3,
        "flashY": 125.4
      },
      {
        "id": "035",
        "label": "Junction 035",
        "kind": "Junction",
        "locationNum": 3,
        "flashX": 543.95,
        "flashY": 182.6
      }
    ],
    "edges": [
      {
        "id": "ed_060_070",
        "from": "060",
        "to": "070",
        "waypoints": [
          {
            "x": 250.45,
            "y": 507.65
          },
          {
            "x": 224.7,
            "y": 478.15
          },
          {
            "x": 228.95,
            "y": 436.15
          },
          {
            "x": 206.65,
            "y": 403.15
          }
        ]
      },
      {
        "id": "ed_040_050",
        "from": "040",
        "to": "050",
        "waypoints": [
          {
            "x": 718.85,
            "y": 267.95
          },
          {
            "x": 698.1,
            "y": 298.95
          },
          {
            "x": 668.4,
            "y": 321.45
          },
          {
            "x": 633.05,
            "y": 347.95
          }
        ]
      },
      {
        "id": "ed_010_015",
        "from": "010",
        "to": "015",
        "waypoints": [
          {
            "x": 234.5,
            "y": 200.95
          }
        ]
      },
      {
        "id": "ed_015_016",
        "from": "015",
        "to": "016",
        "waypoints": [
          {
            "x": 253.95,
            "y": 237.95
          }
        ]
      },
      {
        "id": "ed_016_017",
        "from": "016",
        "to": "017",
        "waypoints": [
          {
            "x": 253.95,
            "y": 289.95
          }
        ]
      },
      {
        "id": "ed_015_066",
        "from": "015",
        "to": "066",
        "waypoints": [
          {
            "x": 334.95,
            "y": 259.95
          }
        ]
      },
      {
        "id": "ed_033_036",
        "from": "033",
        "to": "036",
        "waypoints": []
      },
      {
        "id": "ed_057_032",
        "from": "057",
        "to": "032",
        "waypoints": [
          {
            "x": 447.65,
            "y": 298.0
          }
        ]
      },
      {
        "id": "ed_060_066",
        "from": "060",
        "to": "066",
        "waypoints": [
          {
            "x": 374.95,
            "y": 398.95
          }
        ]
      },
      {
        "id": "ed_044_048",
        "from": "044",
        "to": "048",
        "waypoints": []
      },
      {
        "id": "ed_010_027",
        "from": "010",
        "to": "027",
        "waypoints": [
          {
            "x": 184.35,
            "y": 169.55
          }
        ]
      },
      {
        "id": "ed_066_057",
        "from": "066",
        "to": "057",
        "waypoints": [
          {
            "x": 428.95,
            "y": 316.9
          }
        ]
      },
      {
        "id": "ed_070_077",
        "from": "070",
        "to": "077",
        "waypoints": [
          {
            "x": 92.0,
            "y": 407.8
          }
        ]
      },
      {
        "id": "ed_060_067",
        "from": "060",
        "to": "067",
        "waypoints": []
      },
      {
        "id": "ed_037_031",
        "from": "037",
        "to": "031",
        "waypoints": []
      },
      {
        "id": "ed_050_047",
        "from": "050",
        "to": "047",
        "waypoints": [
          {
            "x": 621.75,
            "y": 359.7
          }
        ]
      },
      {
        "id": "ed_010_020",
        "from": "010",
        "to": "020",
        "waypoints": [
          {
            "x": 246.3,
            "y": 162.95
          },
          {
            "x": 299.55,
            "y": 143.95
          },
          {
            "x": 355.8,
            "y": 156.95
          },
          {
            "x": 404.45,
            "y": 162.95
          }
        ]
      },
      {
        "id": "ed_020_030",
        "from": "020",
        "to": "030",
        "waypoints": [
          {
            "x": 431.55,
            "y": 141.6
          },
          {
            "x": 457.8,
            "y": 111.35
          },
          {
            "x": 514.05,
            "y": 94.85
          },
          {
            "x": 572.95,
            "y": 92.85
          }
        ]
      },
      {
        "id": "ed_030_040",
        "from": "030",
        "to": "040",
        "waypoints": [
          {
            "x": 632.1,
            "y": 99.25
          },
          {
            "x": 651.1,
            "y": 103.75
          },
          {
            "x": 671.1,
            "y": 114.05
          },
          {
            "x": 685.75,
            "y": 126.0
          }
        ]
      },
      {
        "id": "ed_070_010",
        "from": "070",
        "to": "010",
        "waypoints": [
          {
            "x": 67.05,
            "y": 352.5
          },
          {
            "x": 70.8,
            "y": 314.5
          },
          {
            "x": 127.55,
            "y": 286.5
          },
          {
            "x": 190.7,
            "y": 198.5
          }
        ]
      },
      {
        "id": "ed_050_060",
        "from": "050",
        "to": "060",
        "waypoints": [
          {
            "x": 569.8,
            "y": 405.95
          },
          {
            "x": 528.55,
            "y": 450.95
          },
          {
            "x": 461.85,
            "y": 481.45
          },
          {
            "x": 383.5,
            "y": 504.95
          }
        ]
      },
      {
        "id": "ed_030_031",
        "from": "030",
        "to": "031",
        "waypoints": [
          {
            "x": 585.25,
            "y": 110.25
          }
        ]
      },
      {
        "id": "ed_035_033",
        "from": "035",
        "to": "033",
        "waypoints": [
          {
            "x": 497.45,
            "y": 181.2
          }
        ]
      },
      {
        "id": "ed_050_044",
        "from": "050",
        "to": "044",
        "waypoints": [
          {
            "x": 609.25,
            "y": 344.4
          },
          {
            "x": 614.0,
            "y": 331.4
          },
          {
            "x": 615.25,
            "y": 316.9
          },
          {
            "x": 615.0,
            "y": 303.4
          }
        ]
      },
      {
        "id": "ed_050_066",
        "from": "050",
        "to": "066",
        "waypoints": [
          {
            "x": 511.6,
            "y": 341.05
          }
        ]
      },
      {
        "id": "ed_031_035",
        "from": "031",
        "to": "035",
        "waypoints": [
          {
            "x": 546.3,
            "y": 153.95
          }
        ]
      },
      {
        "id": "ed_032_035",
        "from": "032",
        "to": "035",
        "waypoints": [
          {
            "x": 490.45,
            "y": 240.95
          }
        ]
      }
    ]
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
    "tutorialMode": "none",
    "nodes": [
      {
        "id": "067",
        "label": "Empire Castle",
        "kind": "Stronghold",
        "locationNum": 6,
        "flashX": 419.85,
        "flashY": 475.85,
        "strongholdKind": "Castle",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "027",
        "label": "Empire Town",
        "kind": "Stronghold",
        "locationNum": 2,
        "flashX": 584.5,
        "flashY": 127.95,
        "strongholdKind": "Town",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "007",
        "label": "Westaria Town",
        "kind": "Stronghold",
        "locationNum": 0,
        "flashX": 131.25,
        "flashY": 151.35,
        "strongholdKind": "Town",
        "initialOwner": "Westaria"
      },
      {
        "id": "037",
        "label": "Empire Castle",
        "kind": "Stronghold",
        "locationNum": 3,
        "flashX": 240.0,
        "flashY": 322.45,
        "strongholdKind": "Castle",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "017",
        "label": "Empire Castle",
        "kind": "Stronghold",
        "locationNum": 1,
        "flashX": 410.95,
        "flashY": 165.45,
        "strongholdKind": "Castle",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "047",
        "label": "Empire Castle",
        "kind": "Stronghold",
        "locationNum": 4,
        "flashX": 601.0,
        "flashY": 277.9,
        "strongholdKind": "Castle",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "077",
        "label": "Empire MagicTower",
        "kind": "Stronghold",
        "locationNum": 7,
        "flashX": 700.6,
        "flashY": 427.9,
        "strongholdKind": "MagicTower",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "057",
        "label": "Westaria MagicTower",
        "kind": "Stronghold",
        "locationNum": 5,
        "flashX": 75.9,
        "flashY": 424.95,
        "strongholdKind": "MagicTower",
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_05_0",
        "label": "Site 5",
        "kind": "BuildSite",
        "locationNum": 5,
        "flashX": 114.95,
        "flashY": 467.55,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_00_0",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 91.45,
        "flashY": 194.95,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_00_1",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 159.5,
        "flashY": 203.2,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_00_2",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 217.7,
        "flashY": 145.1,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_02_0",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 531.9,
        "flashY": 118.25,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_02_1",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 703.45,
        "flashY": 128.55,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_02_2",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 646.9,
        "flashY": 142.9,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_05_1",
        "label": "Site 5",
        "kind": "BuildSite",
        "locationNum": 5,
        "flashX": 162.95,
        "flashY": 439.15,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_05_2",
        "label": "Site 5",
        "kind": "BuildSite",
        "locationNum": 5,
        "flashX": 121.45,
        "flashY": 374.6,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_07_0",
        "label": "Site 7",
        "kind": "BuildSite",
        "locationNum": 7,
        "flashX": 646.9,
        "flashY": 454.0,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_07_1",
        "label": "Site 7",
        "kind": "BuildSite",
        "locationNum": 7,
        "flashX": 707.45,
        "flashY": 472.05,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_07_2",
        "label": "Site 7",
        "kind": "BuildSite",
        "locationNum": 7,
        "flashX": 767.45,
        "flashY": 451.6,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "076",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 7,
        "flashX": 702.3,
        "flashY": 518.95
      },
      {
        "id": "073",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 7,
        "flashX": 665.95,
        "flashY": 499.25,
        "initialOwner": "Bandits"
      },
      {
        "id": "080",
        "label": "Junction 080",
        "kind": "Junction",
        "locationNum": 6,
        "flashX": 419.0,
        "flashY": 521.0
      },
      {
        "id": "016",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 0,
        "flashX": 93.75,
        "flashY": 236.1
      },
      {
        "id": "013",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 0,
        "flashX": 132.5,
        "flashY": 238.45,
        "initialOwner": "Bandits"
      },
      {
        "id": "010",
        "label": "Junction 010",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 211.1,
        "flashY": 236.45
      },
      {
        "id": "056",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 2,
        "flashX": 713.45,
        "flashY": 197.15
      },
      {
        "id": "053",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 2,
        "flashX": 681.5,
        "flashY": 189.05,
        "initialOwner": "Bandits"
      },
      {
        "id": "116",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 0,
        "flashX": 163.8,
        "flashY": 496.9
      },
      {
        "id": "113",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 0,
        "flashX": 193.45,
        "flashY": 471.15,
        "initialOwner": "Bandits"
      },
      {
        "id": "020",
        "label": "Junction 020",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 243.0,
        "flashY": 202.5
      },
      {
        "id": "030",
        "label": "Junction 030",
        "kind": "Junction",
        "locationNum": 1,
        "flashX": 404.0,
        "flashY": 119.0
      },
      {
        "id": "040",
        "label": "Junction 040",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 574.0,
        "flashY": 172.0
      },
      {
        "id": "050",
        "label": "Junction 050",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 649.0,
        "flashY": 224.9
      },
      {
        "id": "060",
        "label": "Junction 060",
        "kind": "Junction",
        "locationNum": 3,
        "flashX": 665.0,
        "flashY": 285.0
      },
      {
        "id": "070",
        "label": "Junction 070",
        "kind": "Junction",
        "locationNum": 7,
        "flashX": 592.0,
        "flashY": 461.0
      },
      {
        "id": "071",
        "label": "Junction 071",
        "kind": "Junction",
        "locationNum": 7,
        "flashX": 630.0,
        "flashY": 408.55
      },
      {
        "id": "090",
        "label": "Junction 090",
        "kind": "Junction",
        "locationNum": 6,
        "flashX": 292.0,
        "flashY": 474.0
      },
      {
        "id": "100",
        "label": "Junction 100",
        "kind": "Junction",
        "locationNum": 5,
        "flashX": 161.1,
        "flashY": 398.55
      },
      {
        "id": "120",
        "label": "Junction 120",
        "kind": "Junction",
        "locationNum": 3,
        "flashX": 169.0,
        "flashY": 329.0
      },
      {
        "id": "095",
        "label": "Junction 095",
        "kind": "Junction",
        "locationNum": 6,
        "flashX": 221.1,
        "flashY": 415.55
      },
      {
        "id": "005",
        "label": "Junction 005",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 172.0,
        "flashY": 168.55
      },
      {
        "id": "045",
        "label": "Junction 045",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 590.95,
        "flashY": 147.05
      }
    ],
    "edges": [
      {
        "id": "ed_007_005",
        "from": "007",
        "to": "005",
        "waypoints": [
          {
            "x": 137.0,
            "y": 162.25
          }
        ]
      },
      {
        "id": "ed_010_013",
        "from": "010",
        "to": "013",
        "waypoints": [
          {
            "x": 156.1,
            "y": 234.85
          }
        ]
      },
      {
        "id": "ed_013_016",
        "from": "013",
        "to": "016",
        "waypoints": []
      },
      {
        "id": "ed_005_020",
        "from": "005",
        "to": "020",
        "waypoints": [
          {
            "x": 191.95,
            "y": 189.0
          }
        ]
      },
      {
        "id": "ed_050_060",
        "from": "050",
        "to": "060",
        "waypoints": [
          {
            "x": 651.85,
            "y": 253.5
          }
        ]
      },
      {
        "id": "ed_040_053",
        "from": "040",
        "to": "053",
        "waypoints": [
          {
            "x": 609.95,
            "y": 178.5
          }
        ]
      },
      {
        "id": "ed_053_056",
        "from": "053",
        "to": "056",
        "waypoints": []
      },
      {
        "id": "ed_077_071",
        "from": "077",
        "to": "071",
        "waypoints": []
      },
      {
        "id": "ed_070_073",
        "from": "070",
        "to": "073",
        "waypoints": [
          {
            "x": 608.0,
            "y": 475.95
          }
        ]
      },
      {
        "id": "ed_073_076",
        "from": "073",
        "to": "076",
        "waypoints": []
      },
      {
        "id": "ed_057_100",
        "from": "057",
        "to": "100",
        "waypoints": [
          {
            "x": 113.95,
            "y": 403.5
          }
        ]
      },
      {
        "id": "ed_095_113",
        "from": "095",
        "to": "113",
        "waypoints": [
          {
            "x": 191.95,
            "y": 442.8
          }
        ]
      },
      {
        "id": "ed_113_116",
        "from": "113",
        "to": "116",
        "waypoints": [
          {
            "x": 166.1,
            "y": 481.8
          }
        ]
      },
      {
        "id": "ed_070_071",
        "from": "070",
        "to": "071",
        "waypoints": [
          {
            "x": 591.0,
            "y": 434.9
          }
        ]
      },
      {
        "id": "ed_020_030",
        "from": "020",
        "to": "030",
        "waypoints": [
          {
            "x": 261.25,
            "y": 188.3
          },
          {
            "x": 288.25,
            "y": 171.3
          },
          {
            "x": 313.1,
            "y": 135.2
          },
          {
            "x": 367.25,
            "y": 125.05
          }
        ]
      },
      {
        "id": "ed_030_040",
        "from": "030",
        "to": "040",
        "waypoints": [
          {
            "x": 428.6,
            "y": 126.25
          },
          {
            "x": 472.1,
            "y": 130.75
          },
          {
            "x": 510.45,
            "y": 147.65
          },
          {
            "x": 546.15,
            "y": 160.0
          }
        ]
      },
      {
        "id": "ed_040_050",
        "from": "040",
        "to": "050",
        "waypoints": [
          {
            "x": 582.7,
            "y": 182.65
          },
          {
            "x": 595.7,
            "y": 196.7
          },
          {
            "x": 610.2,
            "y": 204.65
          },
          {
            "x": 626.2,
            "y": 210.65
          }
        ]
      },
      {
        "id": "ed_060_071",
        "from": "060",
        "to": "071",
        "waypoints": [
          {
            "x": 669.5,
            "y": 302.45
          },
          {
            "x": 668.5,
            "y": 333.95
          },
          {
            "x": 652.0,
            "y": 361.45
          },
          {
            "x": 634.0,
            "y": 383.45
          }
        ]
      },
      {
        "id": "ed_070_080",
        "from": "070",
        "to": "080",
        "waypoints": [
          {
            "x": 567.0,
            "y": 477.45
          },
          {
            "x": 535.5,
            "y": 491.95
          },
          {
            "x": 497.5,
            "y": 507.5
          },
          {
            "x": 453.5,
            "y": 519.5
          }
        ]
      },
      {
        "id": "ed_080_090",
        "from": "080",
        "to": "090",
        "waypoints": [
          {
            "x": 395.1,
            "y": 520.55
          },
          {
            "x": 363.6,
            "y": 510.95
          },
          {
            "x": 337.1,
            "y": 497.05
          },
          {
            "x": 310.1,
            "y": 484.5
          }
        ]
      },
      {
        "id": "ed_090_095",
        "from": "090",
        "to": "095",
        "waypoints": [
          {
            "x": 292.6,
            "y": 457.25
          },
          {
            "x": 284.1,
            "y": 436.25
          },
          {
            "x": 265.6,
            "y": 421.2
          },
          {
            "x": 239.1,
            "y": 413.25
          }
        ]
      },
      {
        "id": "ed_037_120",
        "from": "037",
        "to": "120",
        "waypoints": [
          {
            "x": 183.0,
            "y": 328.5
          }
        ]
      },
      {
        "id": "ed_017_030",
        "from": "017",
        "to": "030",
        "waypoints": [
          {
            "x": 385.6,
            "y": 138.5
          }
        ]
      },
      {
        "id": "ed_047_060",
        "from": "047",
        "to": "060",
        "waypoints": [
          {
            "x": 622.5,
            "y": 285.9
          }
        ]
      },
      {
        "id": "ed_067_080",
        "from": "067",
        "to": "080",
        "waypoints": [
          {
            "x": 402.95,
            "y": 508.1
          }
        ]
      },
      {
        "id": "ed_100_120",
        "from": "100",
        "to": "120",
        "waypoints": [
          {
            "x": 147.5,
            "y": 369.0
          }
        ]
      },
      {
        "id": "ed_095_100",
        "from": "095",
        "to": "100",
        "waypoints": [
          {
            "x": 177.0,
            "y": 403.5
          }
        ]
      },
      {
        "id": "ed_010_020",
        "from": "010",
        "to": "020",
        "waypoints": [
          {
            "x": 208.0,
            "y": 219.95
          }
        ]
      },
      {
        "id": "ed_027_045",
        "from": "027",
        "to": "045",
        "waypoints": [
          {
            "x": 572.0,
            "y": 134.0
          }
        ]
      },
      {
        "id": "ed_040_045",
        "from": "040",
        "to": "045",
        "waypoints": [
          {
            "x": 572.0,
            "y": 157.95
          }
        ]
      },
      {
        "id": "ed_120_010",
        "from": "120",
        "to": "010",
        "waypoints": [
          {
            "x": 169.0,
            "y": 309.05
          },
          {
            "x": 171.5,
            "y": 288.05
          },
          {
            "x": 181.0,
            "y": 266.45
          },
          {
            "x": 196.5,
            "y": 248.3
          }
        ]
      }
    ]
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
    "tutorialMode": "none",
    "nodes": [
      {
        "id": "027",
        "label": "Empire Castle",
        "kind": "Stronghold",
        "locationNum": 2,
        "flashX": 271.6,
        "flashY": 130.85,
        "strongholdKind": "Castle",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "017",
        "label": "Empire Town",
        "kind": "Stronghold",
        "locationNum": 1,
        "flashX": 618.8,
        "flashY": 320.65,
        "strongholdKind": "Town",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "007",
        "label": "Khaganate Town",
        "kind": "Stronghold",
        "locationNum": 0,
        "flashX": 314.7,
        "flashY": 439.75,
        "strongholdKind": "Town",
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_02_0",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 221.35,
        "flashY": 187.55,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_02_1",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 288.9,
        "flashY": 198.95,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "023",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 3,
        "flashX": 452.9,
        "flashY": 346.0,
        "initialOwner": "Bandits"
      },
      {
        "id": "026",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 3,
        "flashX": 408.65,
        "flashY": 322.75
      },
      {
        "id": "bs_01_0",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 653.4,
        "flashY": 384.25,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_00_0",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 400.35,
        "flashY": 409.9,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_00_1",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 233.45,
        "flashY": 401.9,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_00_2",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 196.95,
        "flashY": 484.9,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "010",
        "label": "Junction 010",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 314.6,
        "flashY": 476.3
      },
      {
        "id": "020",
        "label": "Junction 020",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 444.45,
        "flashY": 459.95
      },
      {
        "id": "030",
        "label": "Junction 030",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 599.45,
        "flashY": 359.35
      },
      {
        "id": "040",
        "label": "Junction 040",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 192.5,
        "flashY": 438.9
      },
      {
        "id": "050",
        "label": "Junction 050",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 133.5,
        "flashY": 303.95
      },
      {
        "id": "060",
        "label": "Junction 060",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 268.1,
        "flashY": 236.95
      },
      {
        "id": "070",
        "label": "Junction 070",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 304.6,
        "flashY": 158.95
      }
    ],
    "edges": [
      {
        "id": "ed_007_010",
        "from": "007",
        "to": "010",
        "waypoints": [
          {
            "x": 294.5,
            "y": 461.95
          }
        ]
      },
      {
        "id": "ed_023_026",
        "from": "023",
        "to": "026",
        "waypoints": [
          {
            "x": 410.9,
            "y": 330.95
          }
        ]
      },
      {
        "id": "ed_017_030",
        "from": "017",
        "to": "030",
        "waypoints": [
          {
            "x": 587.45,
            "y": 345.9
          }
        ]
      },
      {
        "id": "ed_070_027",
        "from": "070",
        "to": "027",
        "waypoints": [
          {
            "x": 277.45,
            "y": 148.95
          }
        ]
      },
      {
        "id": "ed_060_070",
        "from": "060",
        "to": "070",
        "waypoints": [
          {
            "x": 300.25,
            "y": 240.35
          },
          {
            "x": 337.0,
            "y": 228.35
          },
          {
            "x": 349.25,
            "y": 195.35
          },
          {
            "x": 320.9,
            "y": 168.85
          }
        ]
      },
      {
        "id": "ed_050_060",
        "from": "050",
        "to": "060",
        "waypoints": [
          {
            "x": 144.55,
            "y": 285.05
          },
          {
            "x": 167.8,
            "y": 256.8
          },
          {
            "x": 200.8,
            "y": 236.3
          },
          {
            "x": 243.45,
            "y": 234.55
          }
        ]
      },
      {
        "id": "ed_040_050",
        "from": "040",
        "to": "050",
        "waypoints": [
          {
            "x": 176.55,
            "y": 422.0
          },
          {
            "x": 153.8,
            "y": 397.75
          },
          {
            "x": 135.3,
            "y": 366.5
          },
          {
            "x": 131.45,
            "y": 329.5
          }
        ]
      },
      {
        "id": "ed_010_040",
        "from": "010",
        "to": "040",
        "waypoints": [
          {
            "x": 296.6,
            "y": 473.45
          },
          {
            "x": 267.85,
            "y": 468.45
          },
          {
            "x": 239.85,
            "y": 459.45
          },
          {
            "x": 213.0,
            "y": 446.45
          }
        ]
      },
      {
        "id": "ed_010_020",
        "from": "010",
        "to": "020",
        "waypoints": [
          {
            "x": 341.45,
            "y": 473.95
          },
          {
            "x": 367.65,
            "y": 471.45
          },
          {
            "x": 393.15,
            "y": 470.45
          },
          {
            "x": 419.75,
            "y": 467.95
          }
        ]
      },
      {
        "id": "ed_020_023",
        "from": "020",
        "to": "023",
        "waypoints": [
          {
            "x": 449.95,
            "y": 438.5
          },
          {
            "x": 460.35,
            "y": 413.5
          },
          {
            "x": 458.85,
            "y": 386.5
          },
          {
            "x": 449.95,
            "y": 364.5
          }
        ]
      },
      {
        "id": "ed_020_030",
        "from": "020",
        "to": "030",
        "waypoints": [
          {
            "x": 470.95,
            "y": 452.0
          },
          {
            "x": 510.85,
            "y": 430.0
          },
          {
            "x": 546.35,
            "y": 406.0
          },
          {
            "x": 581.95,
            "y": 377.0
          }
        ]
      }
    ]
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
    "tutorialMode": "none",
    "nodes": [
      {
        "id": "037",
        "label": "Westaria Town",
        "kind": "Stronghold",
        "locationNum": 1,
        "flashX": 661.0,
        "flashY": 176.05,
        "strongholdKind": "Town",
        "initialOwner": "Westaria"
      },
      {
        "id": "010",
        "label": "Junction 010",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 407.7,
        "flashY": 155.35
      },
      {
        "id": "bs_01_0",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 579.15,
        "flashY": 165.95,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_03_0",
        "label": "Site 3",
        "kind": "BuildSite",
        "locationNum": 3,
        "flashX": 283.1,
        "flashY": 446.4,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_02_0",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 531.1,
        "flashY": 407.25,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_03_1",
        "label": "Site 3",
        "kind": "BuildSite",
        "locationNum": 3,
        "flashX": 224.7,
        "flashY": 450.2,
        "initialOwner": "Westaria"
      },
      {
        "id": "020",
        "label": "Junction 020",
        "kind": "Junction",
        "locationNum": 1,
        "flashX": 593.7,
        "flashY": 120.35
      },
      {
        "id": "030",
        "label": "Junction 030",
        "kind": "Junction",
        "locationNum": 1,
        "flashX": 691.8,
        "flashY": 144.35
      },
      {
        "id": "040",
        "label": "Junction 040",
        "kind": "Junction",
        "locationNum": 1,
        "flashX": 763.8,
        "flashY": 222.35
      },
      {
        "id": "050",
        "label": "Junction 050",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 662.85,
        "flashY": 297.35
      },
      {
        "id": "060",
        "label": "Junction 060",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 535.25,
        "flashY": 328.8
      },
      {
        "id": "070",
        "label": "Junction 070",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 447.6,
        "flashY": 332.95
      },
      {
        "id": "090",
        "label": "Junction 090",
        "kind": "Junction",
        "locationNum": 3,
        "flashX": 192.8,
        "flashY": 478.8
      },
      {
        "id": "100",
        "label": "Junction 100",
        "kind": "Junction",
        "locationNum": 3,
        "flashX": 177.3,
        "flashY": 358.35
      },
      {
        "id": "110",
        "label": "Junction 110",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 316.2,
        "flashY": 274.95
      },
      {
        "id": "063",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 2,
        "flashX": 610.8,
        "flashY": 368.0,
        "initialOwner": "Bandits"
      },
      {
        "id": "066",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 2,
        "flashX": 666.5,
        "flashY": 382.65
      },
      {
        "id": "bs_02_1",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 358.7,
        "flashY": 375.3,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_03_2",
        "label": "Site 3",
        "kind": "BuildSite",
        "locationNum": 3,
        "flashX": 247.9,
        "flashY": 489.25,
        "initialOwner": "Westaria"
      },
      {
        "id": "036",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 1,
        "flashX": 221.45,
        "flashY": 257.25
      },
      {
        "id": "033",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 1,
        "flashX": 268.95,
        "flashY": 262.4,
        "initialOwner": "Bandits"
      },
      {
        "id": "bs_01_1",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 719.2,
        "flashY": 226.45,
        "initialOwner": "Westaria"
      },
      {
        "id": "027",
        "label": "Westaria MagicTower",
        "kind": "Stronghold",
        "locationNum": 0,
        "flashX": 433.85,
        "flashY": 191.0,
        "strongholdKind": "MagicTower",
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_00_0",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 342.35,
        "flashY": 169.25,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_02_2",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 437.9,
        "flashY": 456.2,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "047",
        "label": "Khaganate Castle",
        "kind": "Stronghold",
        "locationNum": 2,
        "flashX": 439.85,
        "flashY": 394.95,
        "strongholdKind": "Castle",
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "057",
        "label": "Westaria Town",
        "kind": "Stronghold",
        "locationNum": 3,
        "flashX": 144.75,
        "flashY": 486.45,
        "strongholdKind": "Town",
        "initialOwner": "Westaria"
      }
    ],
    "edges": [
      {
        "id": "ed_027_010",
        "from": "027",
        "to": "010",
        "waypoints": []
      },
      {
        "id": "ed_037_030",
        "from": "037",
        "to": "030",
        "waypoints": [
          {
            "x": 668.85,
            "y": 140.45
          }
        ]
      },
      {
        "id": "ed_047_070",
        "from": "047",
        "to": "070",
        "waypoints": [
          {
            "x": 430.6,
            "y": 339.05
          }
        ]
      },
      {
        "id": "ed_057_090",
        "from": "057",
        "to": "090",
        "waypoints": [
          {
            "x": 161.55,
            "y": 462.4
          }
        ]
      },
      {
        "id": "ed_063_066",
        "from": "063",
        "to": "066",
        "waypoints": [
          {
            "x": 623.5,
            "y": 364.45
          }
        ]
      },
      {
        "id": "ed_090_100",
        "from": "090",
        "to": "100",
        "waypoints": [
          {
            "x": 175.55,
            "y": 461.95
          },
          {
            "x": 155.55,
            "y": 437.85
          },
          {
            "x": 150.8,
            "y": 407.65
          },
          {
            "x": 158.45,
            "y": 376.35
          }
        ]
      },
      {
        "id": "ed_070_110",
        "from": "070",
        "to": "110",
        "waypoints": [
          {
            "x": 426.55,
            "y": 325.7
          },
          {
            "x": 396.05,
            "y": 314.4
          },
          {
            "x": 364.8,
            "y": 298.9
          },
          {
            "x": 336.45,
            "y": 281.6
          }
        ]
      },
      {
        "id": "ed_100_110",
        "from": "100",
        "to": "110",
        "waypoints": [
          {
            "x": 200.8,
            "y": 346.6
          },
          {
            "x": 243.9,
            "y": 338.6
          },
          {
            "x": 279.15,
            "y": 326.1
          },
          {
            "x": 304.8,
            "y": 296.95
          }
        ]
      },
      {
        "id": "ed_040_050",
        "from": "040",
        "to": "050",
        "waypoints": [
          {
            "x": 757.85,
            "y": 245.95
          },
          {
            "x": 741.85,
            "y": 264.95
          },
          {
            "x": 717.1,
            "y": 278.15
          },
          {
            "x": 686.8,
            "y": 289.35
          }
        ]
      },
      {
        "id": "ed_110_010",
        "from": "110",
        "to": "010",
        "waypoints": [
          {
            "x": 329.45,
            "y": 259.3
          },
          {
            "x": 348.05,
            "y": 229.3
          },
          {
            "x": 367.3,
            "y": 198.5
          },
          {
            "x": 387.45,
            "y": 172.15
          }
        ]
      },
      {
        "id": "ed_020_030",
        "from": "020",
        "to": "030",
        "waypoints": [
          {
            "x": 612.8,
            "y": 119.15
          },
          {
            "x": 635.9,
            "y": 120.65
          },
          {
            "x": 654.65,
            "y": 128.65
          },
          {
            "x": 675.35,
            "y": 137.35
          }
        ]
      },
      {
        "id": "ed_030_040",
        "from": "030",
        "to": "040",
        "waypoints": [
          {
            "x": 708.75,
            "y": 148.85
          },
          {
            "x": 727.85,
            "y": 161.65
          },
          {
            "x": 746.6,
            "y": 179.15
          },
          {
            "x": 757.8,
            "y": 201.35
          }
        ]
      },
      {
        "id": "ed_060_050",
        "from": "060",
        "to": "050",
        "waypoints": [
          {
            "x": 554.35,
            "y": 322.85
          },
          {
            "x": 581.85,
            "y": 317.85
          },
          {
            "x": 614.6,
            "y": 310.5
          },
          {
            "x": 647.3,
            "y": 304.2
          }
        ]
      },
      {
        "id": "ed_033_036",
        "from": "033",
        "to": "036",
        "waypoints": [
          {
            "x": 230.5,
            "y": 247.15
          }
        ]
      },
      {
        "id": "ed_060_063",
        "from": "060",
        "to": "063",
        "waypoints": [
          {
            "x": 553.3,
            "y": 335.6
          }
        ]
      },
      {
        "id": "ed_110_033",
        "from": "110",
        "to": "033",
        "waypoints": [
          {
            "x": 281.45,
            "y": 253.45
          }
        ]
      },
      {
        "id": "ed_070_060",
        "from": "070",
        "to": "060",
        "waypoints": [
          {
            "x": 481.25,
            "y": 315.65
          }
        ]
      },
      {
        "id": "ed_010_020",
        "from": "010",
        "to": "020",
        "waypoints": [
          {
            "x": 431.25,
            "y": 138.35
          },
          {
            "x": 463.35,
            "y": 122.85
          },
          {
            "x": 497.1,
            "y": 113.35
          },
          {
            "x": 532.8,
            "y": 114.35
          },
          {
            "x": 573.2,
            "y": 116.85
          }
        ]
      }
    ]
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
    "tutorialMode": "none",
    "nodes": [
      {
        "id": "027",
        "label": "Empire Town",
        "kind": "Stronghold",
        "locationNum": 2,
        "flashX": 494.0,
        "flashY": 130.1,
        "strongholdKind": "Town",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "047",
        "label": "Empire MagicTower",
        "kind": "Stronghold",
        "locationNum": 4,
        "flashX": 686.7,
        "flashY": 216.95,
        "strongholdKind": "MagicTower",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "037",
        "label": "Empire Castle",
        "kind": "Stronghold",
        "locationNum": 3,
        "flashX": 463.7,
        "flashY": 367.8,
        "strongholdKind": "Castle",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "007",
        "label": "Khaganate Castle",
        "kind": "Stronghold",
        "locationNum": 0,
        "flashX": 117.1,
        "flashY": 302.25,
        "strongholdKind": "Castle",
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "017",
        "label": "Empire Town",
        "kind": "Stronghold",
        "locationNum": 1,
        "flashX": 156.5,
        "flashY": 171.6,
        "strongholdKind": "Town",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_01_0",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 259.3,
        "flashY": 133.65,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_01_1",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 220.9,
        "flashY": 84.95,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "013",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 0,
        "flashX": 202.95,
        "flashY": 409.0,
        "initialOwner": "Bandits"
      },
      {
        "id": "016",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 0,
        "flashX": 153.7,
        "flashY": 428.15
      },
      {
        "id": "bs_02_0",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 592.4,
        "flashY": 133.65,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_03_0",
        "label": "Site 3",
        "kind": "BuildSite",
        "locationNum": 3,
        "flashX": 466.35,
        "flashY": 440.7,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_00_0",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 95.45,
        "flashY": 367.8,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "056",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 3,
        "flashX": 361.0,
        "flashY": 422.8
      },
      {
        "id": "053",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 3,
        "flashX": 380.25,
        "flashY": 461.85,
        "initialOwner": "Bandits"
      },
      {
        "id": "bs_02_1",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 558.4,
        "flashY": 168.5,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_02_2",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 432.4,
        "flashY": 169.5,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_00_1",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 164.45,
        "flashY": 375.35,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_03_1",
        "label": "Site 3",
        "kind": "BuildSite",
        "locationNum": 3,
        "flashX": 549.4,
        "flashY": 332.95,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_03_2",
        "label": "Site 3",
        "kind": "BuildSite",
        "locationNum": 3,
        "flashX": 558.4,
        "flashY": 392.05,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "010",
        "label": "Junction 010",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 179.9,
        "flashY": 309.05
      },
      {
        "id": "020",
        "label": "Junction 020",
        "kind": "Junction",
        "locationNum": 1,
        "flashX": 288.3,
        "flashY": 184.95
      },
      {
        "id": "030",
        "label": "Junction 030",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 372.45,
        "flashY": 178.45
      },
      {
        "id": "040",
        "label": "Junction 040",
        "kind": "Junction",
        "locationNum": 4,
        "flashX": 633.45,
        "flashY": 236.95
      },
      {
        "id": "050",
        "label": "Junction 050",
        "kind": "Junction",
        "locationNum": 3,
        "flashX": 584.45,
        "flashY": 445.85
      },
      {
        "id": "060",
        "label": "Junction 060",
        "kind": "Junction",
        "locationNum": 3,
        "flashX": 405.2,
        "flashY": 500.0
      },
      {
        "id": "070",
        "label": "Junction 070",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 224.0,
        "flashY": 366.0
      }
    ],
    "edges": [
      {
        "id": "ed_053_056",
        "from": "053",
        "to": "056",
        "waypoints": [
          {
            "x": 350.45,
            "y": 434.0
          }
        ]
      },
      {
        "id": "ed_060_053",
        "from": "060",
        "to": "053",
        "waypoints": [
          {
            "x": 377.45,
            "y": 483.0
          }
        ]
      },
      {
        "id": "ed_007_010",
        "from": "007",
        "to": "010",
        "waypoints": [
          {
            "x": 135.0,
            "y": 308.95
          }
        ]
      },
      {
        "id": "ed_020_030",
        "from": "020",
        "to": "030",
        "waypoints": [
          {
            "x": 310.45,
            "y": 181.95
          }
        ]
      },
      {
        "id": "ed_047_040",
        "from": "047",
        "to": "040",
        "waypoints": []
      },
      {
        "id": "ed_017_020",
        "from": "017",
        "to": "020",
        "waypoints": [
          {
            "x": 200.15,
            "y": 184.65
          },
          {
            "x": 218.4,
            "y": 171.3
          },
          {
            "x": 240.35,
            "y": 161.85
          },
          {
            "x": 262.55,
            "y": 164.3
          },
          {
            "x": 279.95,
            "y": 173.95
          }
        ]
      },
      {
        "id": "ed_027_030",
        "from": "027",
        "to": "030",
        "waypoints": [
          {
            "x": 463.6,
            "y": 150.6
          },
          {
            "x": 444.4,
            "y": 138.75
          },
          {
            "x": 418.35,
            "y": 143.8
          },
          {
            "x": 399.05,
            "y": 154.75
          },
          {
            "x": 382.95,
            "y": 167.4
          }
        ]
      },
      {
        "id": "ed_030_040",
        "from": "030",
        "to": "040",
        "waypoints": [
          {
            "x": 399.3,
            "y": 193.65
          },
          {
            "x": 452.1,
            "y": 201.8
          },
          {
            "x": 502.05,
            "y": 196.35
          },
          {
            "x": 557.75,
            "y": 204.65
          },
          {
            "x": 611.1,
            "y": 224.45
          }
        ]
      },
      {
        "id": "ed_040_050",
        "from": "040",
        "to": "050",
        "waypoints": [
          {
            "x": 670.05,
            "y": 274.45
          },
          {
            "x": 688.85,
            "y": 320.6
          },
          {
            "x": 682.85,
            "y": 366.15
          },
          {
            "x": 656.55,
            "y": 407.45
          },
          {
            "x": 605.9,
            "y": 438.75
          }
        ]
      },
      {
        "id": "ed_013_016",
        "from": "013",
        "to": "016",
        "waypoints": [
          {
            "x": 162.5,
            "y": 422.9
          }
        ]
      },
      {
        "id": "ed_037_050",
        "from": "037",
        "to": "050",
        "waypoints": [
          {
            "x": 491.4,
            "y": 392.75
          },
          {
            "x": 506.15,
            "y": 408.4
          },
          {
            "x": 523.6,
            "y": 421.95
          },
          {
            "x": 543.3,
            "y": 434.4
          },
          {
            "x": 566.7,
            "y": 440.4
          }
        ]
      },
      {
        "id": "ed_050_060",
        "from": "050",
        "to": "060",
        "waypoints": [
          {
            "x": 563.5,
            "y": 464.65
          },
          {
            "x": 533.45,
            "y": 478.3
          },
          {
            "x": 499.95,
            "y": 490.45
          },
          {
            "x": 465.7,
            "y": 497.45
          },
          {
            "x": 426.0,
            "y": 500.45
          }
        ]
      },
      {
        "id": "ed_010_020",
        "from": "010",
        "to": "020",
        "waypoints": [
          {
            "x": 197.45,
            "y": 284.4
          },
          {
            "x": 213.7,
            "y": 258.05
          },
          {
            "x": 228.15,
            "y": 229.6
          },
          {
            "x": 247.35,
            "y": 208.05
          },
          {
            "x": 271.75,
            "y": 195.7
          }
        ]
      },
      {
        "id": "ed_060_070",
        "from": "060",
        "to": "070",
        "waypoints": [
          {
            "x": 385.5,
            "y": 498.0
          },
          {
            "x": 317.0,
            "y": 492.0
          },
          {
            "x": 294.2,
            "y": 479.2
          },
          {
            "x": 283.4,
            "y": 457.15
          },
          {
            "x": 270.05,
            "y": 395.15
          }
        ]
      },
      {
        "id": "ed_070_013",
        "from": "070",
        "to": "013",
        "waypoints": [
          {
            "x": 199.25,
            "y": 388.25
          }
        ]
      },
      {
        "id": "ed_010_070",
        "from": "010",
        "to": "070",
        "waypoints": [
          {
            "x": 189.0,
            "y": 340.4
          }
        ]
      }
    ]
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
    "tutorialMode": "none",
    "nodes": [
      {
        "id": "047",
        "label": "Empire Castle",
        "kind": "Stronghold",
        "locationNum": 4,
        "flashX": 664.95,
        "flashY": 431.85,
        "strongholdKind": "Castle",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "017",
        "label": "Empire Town",
        "kind": "Stronghold",
        "locationNum": 1,
        "flashX": 112.7,
        "flashY": 166.7,
        "strongholdKind": "Town",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "027",
        "label": "Empire Town",
        "kind": "Stronghold",
        "locationNum": 2,
        "flashX": 644.45,
        "flashY": 180.2,
        "strongholdKind": "Town",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "037",
        "label": "Empire MagicTower",
        "kind": "Stronghold",
        "locationNum": 3,
        "flashX": 465.55,
        "flashY": 283.3,
        "strongholdKind": "MagicTower",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "007",
        "label": "Khaganate Castle",
        "kind": "Stronghold",
        "locationNum": 0,
        "flashX": 305.45,
        "flashY": 284.8,
        "strongholdKind": "Castle",
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_01_0",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 191.9,
        "flashY": 203.45,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_01_1",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 196.3,
        "flashY": 133.95,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_02_0",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 653.35,
        "flashY": 248.75,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_00_0",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 344.35,
        "flashY": 351.8,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_00_1",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 283.4,
        "flashY": 356.0,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_04_0",
        "label": "Site 4",
        "kind": "BuildSite",
        "locationNum": 4,
        "flashX": 695.9,
        "flashY": 487.4,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_04_1",
        "label": "Site 4",
        "kind": "BuildSite",
        "locationNum": 4,
        "flashX": 631.9,
        "flashY": 491.5,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "033",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 3,
        "flashX": 448.9,
        "flashY": 388.1,
        "initialOwner": "Bandits"
      },
      {
        "id": "036",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 3,
        "flashX": 456.65,
        "flashY": 431.2
      },
      {
        "id": "053",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 2,
        "flashX": 573.4,
        "flashY": 145.55,
        "initialOwner": "Bandits"
      },
      {
        "id": "056",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 2,
        "flashX": 550.45,
        "flashY": 111.3
      },
      {
        "id": "010",
        "label": "Junction 010",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 277.45,
        "flashY": 321.45
      },
      {
        "id": "060",
        "label": "Junction 060",
        "kind": "Junction",
        "locationNum": 4,
        "flashX": 630.95,
        "flashY": 457.6
      },
      {
        "id": "020",
        "label": "Junction 020",
        "kind": "Junction",
        "locationNum": 1,
        "flashX": 193.5,
        "flashY": 171.45
      },
      {
        "id": "030",
        "label": "Junction 030",
        "kind": "Junction",
        "locationNum": 3,
        "flashX": 448.7,
        "flashY": 313.4
      },
      {
        "id": "040",
        "label": "Junction 040",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 580.95,
        "flashY": 292.4
      },
      {
        "id": "050",
        "label": "Junction 050",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 594.45,
        "flashY": 195.7
      }
    ],
    "edges": [
      {
        "id": "ed_050_027",
        "from": "050",
        "to": "027",
        "waypoints": []
      },
      {
        "id": "ed_050_053",
        "from": "050",
        "to": "053",
        "waypoints": [
          {
            "x": 567.45,
            "y": 170.45
          }
        ]
      },
      {
        "id": "ed_053_056",
        "from": "053",
        "to": "056",
        "waypoints": [
          {
            "x": 541.95,
            "y": 125.5
          }
        ]
      },
      {
        "id": "ed_060_047",
        "from": "060",
        "to": "047",
        "waypoints": [
          {
            "x": 613.5,
            "y": 435.4
          }
        ]
      },
      {
        "id": "ed_040_050",
        "from": "040",
        "to": "050",
        "waypoints": [
          {
            "x": 589.45,
            "y": 279.2
          },
          {
            "x": 599.7,
            "y": 259.7
          },
          {
            "x": 600.95,
            "y": 237.65
          },
          {
            "x": 597.6,
            "y": 215.45
          }
        ]
      },
      {
        "id": "ed_030_040",
        "from": "030",
        "to": "040",
        "waypoints": [
          {
            "x": 470.6,
            "y": 308.95
          },
          {
            "x": 501.7,
            "y": 304.95
          },
          {
            "x": 529.95,
            "y": 299.4
          },
          {
            "x": 556.7,
            "y": 292.4
          }
        ]
      },
      {
        "id": "ed_007_010",
        "from": "007",
        "to": "010",
        "waypoints": [
          {
            "x": 268.45,
            "y": 307.9
          }
        ]
      },
      {
        "id": "ed_020_017",
        "from": "020",
        "to": "017",
        "waypoints": [
          {
            "x": 148.9,
            "y": 170.45
          }
        ]
      },
      {
        "id": "ed_010_030",
        "from": "010",
        "to": "030",
        "waypoints": [
          {
            "x": 319.95,
            "y": 314.95
          }
        ]
      },
      {
        "id": "ed_030_033",
        "from": "030",
        "to": "033",
        "waypoints": [
          {
            "x": 418.45,
            "y": 346.4
          }
        ]
      },
      {
        "id": "ed_033_036",
        "from": "033",
        "to": "036",
        "waypoints": [
          {
            "x": 432.9,
            "y": 402.35
          }
        ]
      },
      {
        "id": "ed_037_030",
        "from": "037",
        "to": "030",
        "waypoints": [
          {
            "x": 439.35,
            "y": 295.9
          }
        ]
      },
      {
        "id": "ed_010_020",
        "from": "010",
        "to": "020",
        "waypoints": [
          {
            "x": 253.0,
            "y": 329.4
          },
          {
            "x": 215.25,
            "y": 332.9
          },
          {
            "x": 188.65,
            "y": 318.35
          },
          {
            "x": 177.65,
            "y": 288.65
          },
          {
            "x": 195.65,
            "y": 261.65
          },
          {
            "x": 238.15,
            "y": 246.15
          },
          {
            "x": 255.85,
            "y": 214.9
          },
          {
            "x": 232.15,
            "y": 179.35
          }
        ]
      },
      {
        "id": "ed_040_060",
        "from": "040",
        "to": "060",
        "waypoints": [
          {
            "x": 610.75,
            "y": 310.4
          },
          {
            "x": 634.65,
            "y": 343.9
          },
          {
            "x": 641.5,
            "y": 381.35
          },
          {
            "x": 626.65,
            "y": 412.65
          },
          {
            "x": 610.75,
            "y": 448.65
          }
        ]
      }
    ]
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
    "tutorialMode": "none",
    "nodes": [
      {
        "id": "017",
        "label": "Empire Castle",
        "kind": "Stronghold",
        "locationNum": 1,
        "flashX": 126.7,
        "flashY": 269.4,
        "strongholdKind": "Castle",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "007",
        "label": "Khaganate Town",
        "kind": "Stronghold",
        "locationNum": 0,
        "flashX": 125.6,
        "flashY": 414.5,
        "strongholdKind": "Town",
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "027",
        "label": "Cult MagicTower",
        "kind": "Stronghold",
        "locationNum": 2,
        "flashX": 491.5,
        "flashY": 183.45,
        "strongholdKind": "MagicTower",
        "initialOwner": "TheCult"
      },
      {
        "id": "037",
        "label": "Cult Town",
        "kind": "Stronghold",
        "locationNum": 3,
        "flashX": 639.15,
        "flashY": 338.4,
        "strongholdKind": "Town",
        "initialOwner": "TheCult"
      },
      {
        "id": "047",
        "label": "Cult Castle",
        "kind": "Stronghold",
        "locationNum": 4,
        "flashX": 370.05,
        "flashY": 371.2,
        "strongholdKind": "Castle",
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_01_0",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 209.3,
        "flashY": 235.95,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_00_0",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 120.4,
        "flashY": 472.0,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_00_1",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 59.45,
        "flashY": 439.2,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_03_0",
        "label": "Site 3",
        "kind": "BuildSite",
        "locationNum": 3,
        "flashX": 572.9,
        "flashY": 310.45,
        "initialOwner": "TheCult"
      },
      {
        "id": "052",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 3,
        "flashX": 256.45,
        "flashY": 161.2,
        "initialOwner": "Bandits"
      },
      {
        "id": "054",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 3,
        "flashX": 208.2,
        "flashY": 142.2
      },
      {
        "id": "023",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 3,
        "flashX": 460.9,
        "flashY": 449.1,
        "initialOwner": "Bandits"
      },
      {
        "id": "026",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 3,
        "flashX": 416.25,
        "flashY": 476.4
      },
      {
        "id": "043",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 2,
        "flashX": 566.2,
        "flashY": 97.55,
        "initialOwner": "Bandits"
      },
      {
        "id": "046",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 2,
        "flashX": 524.65,
        "flashY": 70.3
      },
      {
        "id": "012",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 0,
        "flashX": 177.0,
        "flashY": 534.2
      },
      {
        "id": "011",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 0,
        "flashX": 127.45,
        "flashY": 542.15,
        "initialOwner": "Bandits"
      },
      {
        "id": "bs_00_2",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 180.35,
        "flashY": 465.65,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_01_1",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 192.1,
        "flashY": 330.85,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_03_1",
        "label": "Site 3",
        "kind": "BuildSite",
        "locationNum": 3,
        "flashX": 553.9,
        "flashY": 393.05,
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_03_2",
        "label": "Site 3",
        "kind": "BuildSite",
        "locationNum": 3,
        "flashX": 618.9,
        "flashY": 406.4,
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_04_0",
        "label": "Site 4",
        "kind": "BuildSite",
        "locationNum": 4,
        "flashX": 439.35,
        "flashY": 343.2,
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_04_1",
        "label": "Site 4",
        "kind": "BuildSite",
        "locationNum": 4,
        "flashX": 481.85,
        "flashY": 311.35,
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_04_2",
        "label": "Site 4",
        "kind": "BuildSite",
        "locationNum": 4,
        "flashX": 285.4,
        "flashY": 375.9,
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_02_0",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 395.25,
        "flashY": 151.35,
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_02_1",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 623.25,
        "flashY": 183.8,
        "initialOwner": "TheCult"
      },
      {
        "id": "010",
        "label": "Junction 010",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 173.45,
        "flashY": 435.85
      },
      {
        "id": "020",
        "label": "Junction 020",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 529.45,
        "flashY": 335.9
      },
      {
        "id": "030",
        "label": "Junction 030",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 605.5,
        "flashY": 364.5
      },
      {
        "id": "040",
        "label": "Junction 040",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 496.95,
        "flashY": 214.45
      },
      {
        "id": "050",
        "label": "Junction 050",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 269.5,
        "flashY": 244.45
      },
      {
        "id": "060",
        "label": "Junction 060",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 164.7,
        "flashY": 288.45
      },
      {
        "id": "025",
        "label": "Junction 025",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 381.85,
        "flashY": 411.1
      },
      {
        "id": "015",
        "label": "Junction 015",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 229.45,
        "flashY": 415.3
      },
      {
        "id": "065",
        "label": "Junction 065",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 201.8,
        "flashY": 284.15
      },
      {
        "id": "022",
        "label": "Junction 022",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 487.95,
        "flashY": 360.0
      }
    ],
    "edges": [
      {
        "id": "ed_022_020",
        "from": "022",
        "to": "020",
        "waypoints": [
          {
            "x": 485.85,
            "y": 345.5
          }
        ]
      },
      {
        "id": "ed_007_010",
        "from": "007",
        "to": "010",
        "waypoints": [
          {
            "x": 138.45,
            "y": 426.95
          }
        ]
      },
      {
        "id": "ed_023_026",
        "from": "023",
        "to": "026",
        "waypoints": [
          {
            "x": 423.45,
            "y": 463.45
          }
        ]
      },
      {
        "id": "ed_011_012",
        "from": "011",
        "to": "012",
        "waypoints": [
          {
            "x": 131.0,
            "y": 534.95
          }
        ]
      },
      {
        "id": "ed_037_030",
        "from": "037",
        "to": "030",
        "waypoints": [
          {
            "x": 600.5,
            "y": 358.0
          }
        ]
      },
      {
        "id": "ed_027_040",
        "from": "027",
        "to": "040",
        "waypoints": [
          {
            "x": 478.4,
            "y": 199.05
          }
        ]
      },
      {
        "id": "ed_043_046",
        "from": "043",
        "to": "046",
        "waypoints": [
          {
            "x": 518.4,
            "y": 84.5
          }
        ]
      },
      {
        "id": "ed_052_054",
        "from": "052",
        "to": "054",
        "waypoints": []
      },
      {
        "id": "ed_017_060",
        "from": "017",
        "to": "060",
        "waypoints": [
          {
            "x": 119.7,
            "y": 284.95
          }
        ]
      },
      {
        "id": "ed_015_025",
        "from": "015",
        "to": "025",
        "waypoints": [
          {
            "x": 245.0,
            "y": 413.1
          },
          {
            "x": 276.25,
            "y": 410.6
          },
          {
            "x": 304.7,
            "y": 412.1
          },
          {
            "x": 333.7,
            "y": 414.3
          },
          {
            "x": 361.85,
            "y": 414.3
          }
        ]
      },
      {
        "id": "ed_020_030",
        "from": "020",
        "to": "030",
        "waypoints": [
          {
            "x": 546.85,
            "y": 342.55
          },
          {
            "x": 560.6,
            "y": 352.85
          },
          {
            "x": 575.5,
            "y": 361.85
          },
          {
            "x": 591.95,
            "y": 365.05
          }
        ]
      },
      {
        "id": "ed_022_023",
        "from": "022",
        "to": "023",
        "waypoints": [
          {
            "x": 489.45,
            "y": 375.75
          },
          {
            "x": 487.3,
            "y": 391.8
          },
          {
            "x": 483.45,
            "y": 408.05
          },
          {
            "x": 476.2,
            "y": 424.25
          }
        ]
      },
      {
        "id": "ed_010_011",
        "from": "010",
        "to": "011",
        "waypoints": [
          {
            "x": 106.5,
            "y": 442.95
          },
          {
            "x": 82.25,
            "y": 462.95
          },
          {
            "x": 64.7,
            "y": 489.95
          },
          {
            "x": 74.7,
            "y": 520.15
          },
          {
            "x": 106.5,
            "y": 539.85
          }
        ]
      },
      {
        "id": "ed_040_020",
        "from": "040",
        "to": "020",
        "waypoints": [
          {
            "x": 506.2,
            "y": 236.55
          },
          {
            "x": 518.05,
            "y": 261.6
          },
          {
            "x": 527.2,
            "y": 286.05
          },
          {
            "x": 531.7,
            "y": 313.8
          }
        ]
      },
      {
        "id": "ed_040_043",
        "from": "040",
        "to": "043",
        "waypoints": [
          {
            "x": 534.45,
            "y": 201.35
          },
          {
            "x": 566.3,
            "y": 184.4
          },
          {
            "x": 580.7,
            "y": 152.65
          },
          {
            "x": 577.7,
            "y": 117.85
          }
        ]
      },
      {
        "id": "ed_040_050",
        "from": "040",
        "to": "050",
        "waypoints": [
          {
            "x": 470.65,
            "y": 204.75
          },
          {
            "x": 436.05,
            "y": 190.05
          },
          {
            "x": 386.95,
            "y": 194.05
          },
          {
            "x": 338.95,
            "y": 208.5
          },
          {
            "x": 292.95,
            "y": 232.45
          }
        ]
      },
      {
        "id": "ed_050_065",
        "from": "050",
        "to": "065",
        "waypoints": [
          {
            "x": 254.7,
            "y": 255.65
          },
          {
            "x": 234.6,
            "y": 266.85
          },
          {
            "x": 213.0,
            "y": 276.95
          }
        ]
      },
      {
        "id": "ed_050_052",
        "from": "050",
        "to": "052",
        "waypoints": [
          {
            "x": 276.95,
            "y": 221.65
          },
          {
            "x": 284.35,
            "y": 192.6
          },
          {
            "x": 275.75,
            "y": 170.95
          }
        ]
      },
      {
        "id": "ed_047_025",
        "from": "047",
        "to": "025",
        "waypoints": [
          {
            "x": 358.95,
            "y": 402.5
          }
        ]
      },
      {
        "id": "ed_010_015",
        "from": "010",
        "to": "015",
        "waypoints": [
          {
            "x": 183.95,
            "y": 428.25
          }
        ]
      },
      {
        "id": "ed_060_065",
        "from": "060",
        "to": "065",
        "waypoints": []
      },
      {
        "id": "ed_015_065",
        "from": "015",
        "to": "065",
        "waypoints": [
          {
            "x": 235.7,
            "y": 394.5
          },
          {
            "x": 239.7,
            "y": 358.05
          },
          {
            "x": 232.7,
            "y": 326.0
          },
          {
            "x": 212.45,
            "y": 297.75
          }
        ]
      },
      {
        "id": "ed_025_022",
        "from": "025",
        "to": "022",
        "waypoints": [
          {
            "x": 399.1,
            "y": 405.5
          },
          {
            "x": 417.1,
            "y": 397.5
          },
          {
            "x": 434.55,
            "y": 390.0
          },
          {
            "x": 453.3,
            "y": 380.25
          },
          {
            "x": 472.45,
            "y": 369.25
          }
        ]
      }
    ]
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
    "tutorialMode": "none",
    "nodes": [
      {
        "id": "007",
        "label": "Khaganate Town",
        "kind": "Stronghold",
        "locationNum": 0,
        "flashX": 79.6,
        "flashY": 376.5,
        "strongholdKind": "Town",
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "017",
        "label": "Cult MagicTower",
        "kind": "Stronghold",
        "locationNum": 1,
        "flashX": 143.05,
        "flashY": 153.45,
        "strongholdKind": "MagicTower",
        "initialOwner": "TheCult"
      },
      {
        "id": "037",
        "label": "Cult Town",
        "kind": "Stronghold",
        "locationNum": 3,
        "flashX": 652.15,
        "flashY": 152.45,
        "strongholdKind": "Town",
        "initialOwner": "TheCult"
      },
      {
        "id": "027",
        "label": "Cult Castle",
        "kind": "Stronghold",
        "locationNum": 2,
        "flashX": 378.1,
        "flashY": 233.5,
        "strongholdKind": "Castle",
        "initialOwner": "TheCult"
      },
      {
        "id": "047",
        "label": "Cult MagicTower",
        "kind": "Stronghold",
        "locationNum": 4,
        "flashX": 425.25,
        "flashY": 454.1,
        "strongholdKind": "MagicTower",
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_02_0",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 465.85,
        "flashY": 216.35,
        "initialOwner": "TheCult"
      },
      {
        "id": "018",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 0,
        "flashX": 134.45,
        "flashY": 522.1,
        "initialOwner": "Bandits"
      },
      {
        "id": "019",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 0,
        "flashX": 91.8,
        "flashY": 536.55
      },
      {
        "id": "bs_00_0",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 122.95,
        "flashY": 436.05,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_00_1",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 83.9,
        "flashY": 471.95,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_03_0",
        "label": "Site 3",
        "kind": "BuildSite",
        "locationNum": 3,
        "flashX": 569.8,
        "flashY": 170.6,
        "initialOwner": "TheCult"
      },
      {
        "id": "093",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 3,
        "flashX": 393.9,
        "flashY": 519.1,
        "initialOwner": "Bandits"
      },
      {
        "id": "096",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 3,
        "flashX": 344.75,
        "flashY": 524.25
      },
      {
        "id": "043",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 2,
        "flashX": 422.2,
        "flashY": 135.55,
        "initialOwner": "Bandits"
      },
      {
        "id": "046",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 2,
        "flashX": 471.65,
        "flashY": 158.3
      },
      {
        "id": "bs_02_1",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 373.1,
        "flashY": 311.45,
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_02_2",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 441.4,
        "flashY": 302.45,
        "initialOwner": "TheCult"
      },
      {
        "id": "063",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 2,
        "flashX": 567.7,
        "flashY": 280.55,
        "initialOwner": "Bandits"
      },
      {
        "id": "066",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 2,
        "flashX": 601.65,
        "flashY": 301.3
      },
      {
        "id": "050",
        "label": "Junction 050",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 338.1,
        "flashY": 274.6
      },
      {
        "id": "060",
        "label": "Junction 060",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 561.45,
        "flashY": 237.1
      },
      {
        "id": "070",
        "label": "Junction 070",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 650.45,
        "flashY": 188.55
      },
      {
        "id": "080",
        "label": "Junction 080",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 678.45,
        "flashY": 332.25
      },
      {
        "id": "090",
        "label": "Junction 090",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 496.45,
        "flashY": 440.0
      },
      {
        "id": "100",
        "label": "Junction 100",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 286.45,
        "flashY": 395.0
      },
      {
        "id": "010",
        "label": "Junction 010",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 154.95,
        "flashY": 387.35
      },
      {
        "id": "020",
        "label": "Junction 020",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 86.7,
        "flashY": 204.55
      },
      {
        "id": "030",
        "label": "Junction 030",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 109.0,
        "flashY": 128.35
      },
      {
        "id": "040",
        "label": "Junction 040",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 344.8,
        "flashY": 123.95
      }
    ],
    "edges": [
      {
        "id": "ed_060_063",
        "from": "060",
        "to": "063",
        "waypoints": [
          {
            "x": 541.35,
            "y": 246.6
          }
        ]
      },
      {
        "id": "ed_063_066",
        "from": "063",
        "to": "066",
        "waypoints": [
          {
            "x": 557.45,
            "y": 290.45
          }
        ]
      },
      {
        "id": "ed_080_090",
        "from": "080",
        "to": "090",
        "waypoints": [
          {
            "x": 572.25,
            "y": 392.95
          }
        ]
      },
      {
        "id": "ed_093_096",
        "from": "093",
        "to": "096",
        "waypoints": []
      },
      {
        "id": "ed_070_080",
        "from": "070",
        "to": "080",
        "waypoints": [
          {
            "x": 687.45,
            "y": 188.05
          },
          {
            "x": 720.45,
            "y": 200.95
          },
          {
            "x": 745.05,
            "y": 225.45
          },
          {
            "x": 749.7,
            "y": 263.0
          },
          {
            "x": 724.95,
            "y": 295.0
          },
          {
            "x": 695.15,
            "y": 322.0
          }
        ]
      },
      {
        "id": "ed_090_093",
        "from": "090",
        "to": "093",
        "waypoints": [
          {
            "x": 499.2,
            "y": 459.35
          },
          {
            "x": 477.7,
            "y": 483.85
          },
          {
            "x": 450.8,
            "y": 501.85
          },
          {
            "x": 417.95,
            "y": 513.9
          }
        ]
      },
      {
        "id": "ed_090_100",
        "from": "090",
        "to": "100",
        "waypoints": [
          {
            "x": 489.4,
            "y": 427.45
          },
          {
            "x": 468.4,
            "y": 406.8
          },
          {
            "x": 441.0,
            "y": 398.8
          },
          {
            "x": 399.65,
            "y": 396.85
          },
          {
            "x": 357.4,
            "y": 396.85
          },
          {
            "x": 311.1,
            "y": 395.35
          }
        ]
      },
      {
        "id": "ed_007_010",
        "from": "007",
        "to": "010",
        "waypoints": [
          {
            "x": 96.5,
            "y": 384.95
          }
        ]
      },
      {
        "id": "ed_018_019",
        "from": "018",
        "to": "019",
        "waypoints": [
          {
            "x": 93.5,
            "y": 525.4
          }
        ]
      },
      {
        "id": "ed_010_100",
        "from": "010",
        "to": "100",
        "waypoints": [
          {
            "x": 219.5,
            "y": 394.95
          }
        ]
      },
      {
        "id": "ed_040_043",
        "from": "040",
        "to": "043",
        "waypoints": [
          {
            "x": 360.45,
            "y": 122.95
          }
        ]
      },
      {
        "id": "ed_043_046",
        "from": "043",
        "to": "046",
        "waypoints": [
          {
            "x": 423.0,
            "y": 144.4
          }
        ]
      },
      {
        "id": "ed_027_050",
        "from": "027",
        "to": "050",
        "waypoints": [
          {
            "x": 349.45,
            "y": 265.1
          }
        ]
      },
      {
        "id": "ed_037_070",
        "from": "037",
        "to": "070",
        "waypoints": [
          {
            "x": 630.0,
            "y": 176.05
          }
        ]
      },
      {
        "id": "ed_047_090",
        "from": "047",
        "to": "090",
        "waypoints": [
          {
            "x": 449.45,
            "y": 443.5
          }
        ]
      },
      {
        "id": "ed_010_018",
        "from": "010",
        "to": "018",
        "waypoints": [
          {
            "x": 164.75,
            "y": 417.55
          },
          {
            "x": 167.75,
            "y": 447.45
          },
          {
            "x": 170.25,
            "y": 476.45
          },
          {
            "x": 157.75,
            "y": 500.45
          }
        ]
      },
      {
        "id": "ed_010_020",
        "from": "010",
        "to": "020",
        "waypoints": [
          {
            "x": 172.1,
            "y": 368.05
          },
          {
            "x": 180.0,
            "y": 332.4
          },
          {
            "x": 168.1,
            "y": 290.4
          },
          {
            "x": 142.25,
            "y": 249.4
          },
          {
            "x": 110.2,
            "y": 220.0
          }
        ]
      },
      {
        "id": "ed_020_030",
        "from": "020",
        "to": "030",
        "waypoints": [
          {
            "x": 75.6,
            "y": 194.0
          },
          {
            "x": 70.5,
            "y": 180.8
          },
          {
            "x": 72.2,
            "y": 165.3
          },
          {
            "x": 83.1,
            "y": 151.8
          },
          {
            "x": 95.7,
            "y": 139.9
          }
        ]
      },
      {
        "id": "ed_030_040",
        "from": "030",
        "to": "040",
        "waypoints": [
          {
            "x": 141.0,
            "y": 119.05
          },
          {
            "x": 186.4,
            "y": 111.9
          },
          {
            "x": 233.9,
            "y": 107.9
          },
          {
            "x": 289.65,
            "y": 110.55
          },
          {
            "x": 327.6,
            "y": 119.05
          }
        ]
      },
      {
        "id": "ed_040_050",
        "from": "040",
        "to": "050",
        "waypoints": [
          {
            "x": 337.3,
            "y": 146.5
          },
          {
            "x": 305.7,
            "y": 169.85
          },
          {
            "x": 271.7,
            "y": 200.35
          },
          {
            "x": 264.2,
            "y": 229.0
          },
          {
            "x": 279.45,
            "y": 253.95
          },
          {
            "x": 318.4,
            "y": 272.0
          }
        ]
      },
      {
        "id": "ed_050_060",
        "from": "050",
        "to": "060",
        "waypoints": [
          {
            "x": 380.0,
            "y": 269.95
          },
          {
            "x": 431.5,
            "y": 267.85
          },
          {
            "x": 481.35,
            "y": 261.85
          },
          {
            "x": 533.0,
            "y": 248.1
          }
        ]
      },
      {
        "id": "ed_060_070",
        "from": "060",
        "to": "070",
        "waypoints": [
          {
            "x": 570.75,
            "y": 224.55
          },
          {
            "x": 585.5,
            "y": 208.2
          },
          {
            "x": 606.6,
            "y": 197.7
          },
          {
            "x": 630.5,
            "y": 191.95
          }
        ]
      },
      {
        "id": "ed_017_030",
        "from": "017",
        "to": "030",
        "waypoints": [
          {
            "x": 107.2,
            "y": 141.4
          }
        ]
      },
      {
        "id": "ed_050_010",
        "from": "050",
        "to": "010",
        "waypoints": [
          {
            "x": 318.3,
            "y": 301.9
          },
          {
            "x": 286.4,
            "y": 329.25
          },
          {
            "x": 249.3,
            "y": 349.75
          },
          {
            "x": 208.45,
            "y": 364.25
          },
          {
            "x": 175.95,
            "y": 381.3
          }
        ]
      }
    ]
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
    "tutorialMode": "none",
    "nodes": [
      {
        "id": "067",
        "label": "Empire MagicTower",
        "kind": "Stronghold",
        "locationNum": 4,
        "flashX": 311.85,
        "flashY": 496.9,
        "strongholdKind": "MagicTower",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "027",
        "label": "Cult Castle",
        "kind": "Stronghold",
        "locationNum": 0,
        "flashX": 187.0,
        "flashY": 164.35,
        "strongholdKind": "Castle",
        "initialOwner": "TheCult"
      },
      {
        "id": "047",
        "label": "Khaganate Castle",
        "kind": "Stronghold",
        "locationNum": 2,
        "flashX": 676.4,
        "flashY": 358.8,
        "strongholdKind": "Castle",
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "057",
        "label": "Empire Town",
        "kind": "Stronghold",
        "locationNum": 3,
        "flashX": 446.65,
        "flashY": 310.7,
        "strongholdKind": "Town",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "077",
        "label": "Empire Castle",
        "kind": "Stronghold",
        "locationNum": 5,
        "flashX": 78.85,
        "flashY": 405.65,
        "strongholdKind": "Castle",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "037",
        "label": "Empire MagicTower",
        "kind": "Stronghold",
        "locationNum": 1,
        "flashX": 639.85,
        "flashY": 154.6,
        "strongholdKind": "MagicTower",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_01_0",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 534.3,
        "flashY": 128.65,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_02_0",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 623.25,
        "flashY": 399.35,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_05_0",
        "label": "Site 5",
        "kind": "BuildSite",
        "locationNum": 5,
        "flashX": 156.4,
        "flashY": 444.35,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "010",
        "label": "Junction 010",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 219.35,
        "flashY": 180.2
      },
      {
        "id": "016",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 0,
        "flashX": 274.0,
        "flashY": 276.15,
        "initialOwner": "Bandits"
      },
      {
        "id": "017",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 0,
        "flashX": 272.6,
        "flashY": 314.75
      },
      {
        "id": "bs_00_0",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 92.5,
        "flashY": 88.55,
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_02_1",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 644.7,
        "flashY": 489.2,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_00_1",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 249.9,
        "flashY": 121.95,
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_00_2",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 118.95,
        "flashY": 199.95,
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_01_1",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 591.2,
        "flashY": 193.35,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_05_1",
        "label": "Site 5",
        "kind": "BuildSite",
        "locationNum": 5,
        "flashX": 92.05,
        "flashY": 469.9,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "036",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 3,
        "flashX": 455.75,
        "flashY": 196.25
      },
      {
        "id": "033",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 3,
        "flashX": 498.65,
        "flashY": 181.8,
        "initialOwner": "Bandits"
      },
      {
        "id": "044",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 2,
        "flashX": 616.95,
        "flashY": 289.15,
        "initialOwner": "Bandits"
      },
      {
        "id": "048",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 2,
        "flashX": 568.9,
        "flashY": 260.05
      },
      {
        "id": "020",
        "label": "Junction 020",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 413.95,
        "flashY": 159.45
      },
      {
        "id": "030",
        "label": "Junction 030",
        "kind": "Junction",
        "locationNum": 1,
        "flashX": 616.75,
        "flashY": 96.25
      },
      {
        "id": "040",
        "label": "Junction 040",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 723.95,
        "flashY": 234.95
      },
      {
        "id": "050",
        "label": "Junction 050",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 608.95,
        "flashY": 358.95
      },
      {
        "id": "060",
        "label": "Junction 060",
        "kind": "Junction",
        "locationNum": 4,
        "flashX": 344.5,
        "flashY": 497.1
      },
      {
        "id": "070",
        "label": "Junction 070",
        "kind": "Junction",
        "locationNum": 5,
        "flashX": 137.35,
        "flashY": 392.45
      },
      {
        "id": "032",
        "label": "Junction 032",
        "kind": "Junction",
        "locationNum": 3,
        "flashX": 491.75,
        "flashY": 264.75
      },
      {
        "id": "066",
        "label": "Junction 066",
        "kind": "Junction",
        "locationNum": 3,
        "flashX": 443.95,
        "flashY": 325.95
      },
      {
        "id": "015",
        "label": "Junction 015",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 276.95,
        "flashY": 215.95
      },
      {
        "id": "bs_05_2",
        "label": "Site 5",
        "kind": "BuildSite",
        "locationNum": 5,
        "flashX": 152.75,
        "flashY": 346.0,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "031",
        "label": "Junction 031",
        "kind": "Junction",
        "locationNum": 1,
        "flashX": 696.8,
        "flashY": 139.6
      },
      {
        "id": "034",
        "label": "Junction 034",
        "kind": "Junction",
        "locationNum": 3,
        "flashX": 547.1,
        "flashY": 181.25
      }
    ],
    "edges": [
      {
        "id": "ed_060_070",
        "from": "060",
        "to": "070",
        "waypoints": [
          {
            "x": 250.45,
            "y": 507.65
          },
          {
            "x": 224.7,
            "y": 478.15
          },
          {
            "x": 228.95,
            "y": 436.15
          },
          {
            "x": 206.65,
            "y": 403.15
          }
        ]
      },
      {
        "id": "ed_040_050",
        "from": "040",
        "to": "050",
        "waypoints": [
          {
            "x": 718.85,
            "y": 267.95
          },
          {
            "x": 698.1,
            "y": 298.95
          },
          {
            "x": 668.4,
            "y": 321.45
          },
          {
            "x": 633.05,
            "y": 347.95
          }
        ]
      },
      {
        "id": "ed_031_040",
        "from": "031",
        "to": "040",
        "waypoints": [
          {
            "x": 707.15,
            "y": 150.6
          },
          {
            "x": 718.9,
            "y": 171.6
          },
          {
            "x": 722.7,
            "y": 193.6
          },
          {
            "x": 723.9,
            "y": 218.1
          }
        ]
      },
      {
        "id": "ed_010_015",
        "from": "010",
        "to": "015",
        "waypoints": [
          {
            "x": 234.5,
            "y": 200.95
          }
        ]
      },
      {
        "id": "ed_015_016",
        "from": "015",
        "to": "016",
        "waypoints": [
          {
            "x": 253.95,
            "y": 237.95
          }
        ]
      },
      {
        "id": "ed_016_017",
        "from": "016",
        "to": "017",
        "waypoints": [
          {
            "x": 253.95,
            "y": 289.95
          }
        ]
      },
      {
        "id": "ed_015_066",
        "from": "015",
        "to": "066",
        "waypoints": [
          {
            "x": 334.95,
            "y": 259.95
          }
        ]
      },
      {
        "id": "ed_033_036",
        "from": "033",
        "to": "036",
        "waypoints": [
          {
            "x": 450.95,
            "y": 186.1
          }
        ]
      },
      {
        "id": "ed_057_032",
        "from": "057",
        "to": "032",
        "waypoints": [
          {
            "x": 466.15,
            "y": 280.5
          }
        ]
      },
      {
        "id": "ed_060_066",
        "from": "060",
        "to": "066",
        "waypoints": [
          {
            "x": 374.95,
            "y": 398.95
          }
        ]
      },
      {
        "id": "ed_044_048",
        "from": "044",
        "to": "048",
        "waypoints": []
      },
      {
        "id": "ed_010_027",
        "from": "010",
        "to": "027",
        "waypoints": []
      },
      {
        "id": "ed_066_057",
        "from": "066",
        "to": "057",
        "waypoints": [
          {
            "x": 428.95,
            "y": 316.9
          }
        ]
      },
      {
        "id": "ed_070_077",
        "from": "070",
        "to": "077",
        "waypoints": [
          {
            "x": 92.0,
            "y": 407.8
          }
        ]
      },
      {
        "id": "ed_060_067",
        "from": "060",
        "to": "067",
        "waypoints": [
          {
            "x": 309.5,
            "y": 484.4
          }
        ]
      },
      {
        "id": "ed_037_031",
        "from": "037",
        "to": "031",
        "waypoints": [
          {
            "x": 659.55,
            "y": 143.1
          }
        ]
      },
      {
        "id": "ed_050_047",
        "from": "050",
        "to": "047",
        "waypoints": [
          {
            "x": 621.75,
            "y": 359.7
          }
        ]
      },
      {
        "id": "ed_010_020",
        "from": "010",
        "to": "020",
        "waypoints": [
          {
            "x": 246.3,
            "y": 162.95
          },
          {
            "x": 299.55,
            "y": 143.95
          },
          {
            "x": 355.8,
            "y": 156.95
          },
          {
            "x": 404.45,
            "y": 162.95
          }
        ]
      },
      {
        "id": "ed_020_030",
        "from": "020",
        "to": "030",
        "waypoints": [
          {
            "x": 431.55,
            "y": 141.6
          },
          {
            "x": 457.8,
            "y": 111.35
          },
          {
            "x": 514.05,
            "y": 94.85
          },
          {
            "x": 572.95,
            "y": 92.85
          }
        ]
      },
      {
        "id": "ed_030_031",
        "from": "030",
        "to": "031",
        "waypoints": [
          {
            "x": 632.1,
            "y": 99.25
          },
          {
            "x": 651.1,
            "y": 103.75
          },
          {
            "x": 671.1,
            "y": 114.05
          },
          {
            "x": 685.75,
            "y": 126.0
          }
        ]
      },
      {
        "id": "ed_070_010",
        "from": "070",
        "to": "010",
        "waypoints": [
          {
            "x": 67.05,
            "y": 352.5
          },
          {
            "x": 70.8,
            "y": 314.5
          },
          {
            "x": 127.55,
            "y": 286.5
          },
          {
            "x": 190.7,
            "y": 198.5
          }
        ]
      },
      {
        "id": "ed_050_060",
        "from": "050",
        "to": "060",
        "waypoints": [
          {
            "x": 569.8,
            "y": 405.95
          },
          {
            "x": 528.55,
            "y": 450.95
          },
          {
            "x": 461.85,
            "y": 481.45
          },
          {
            "x": 383.5,
            "y": 504.95
          }
        ]
      },
      {
        "id": "ed_030_034",
        "from": "030",
        "to": "034",
        "waypoints": [
          {
            "x": 551.6,
            "y": 146.1
          }
        ]
      },
      {
        "id": "ed_050_044",
        "from": "050",
        "to": "044",
        "waypoints": [
          {
            "x": 609.25,
            "y": 344.4
          },
          {
            "x": 614.0,
            "y": 331.4
          },
          {
            "x": 615.25,
            "y": 316.9
          },
          {
            "x": 615.0,
            "y": 303.4
          }
        ]
      },
      {
        "id": "ed_050_066",
        "from": "050",
        "to": "066",
        "waypoints": [
          {
            "x": 515.9,
            "y": 345.4
          }
        ]
      },
      {
        "id": "ed_032_034",
        "from": "032",
        "to": "034",
        "waypoints": [
          {
            "x": 493.65,
            "y": 225.25
          }
        ]
      },
      {
        "id": "ed_034_033",
        "from": "034",
        "to": "033",
        "waypoints": []
      }
    ]
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
    "tutorialMode": "none",
    "nodes": [
      {
        "id": "007",
        "label": "Westaria Town",
        "kind": "Stronghold",
        "locationNum": 0,
        "flashX": 131.25,
        "flashY": 151.35,
        "strongholdKind": "Town",
        "initialOwner": "Westaria"
      },
      {
        "id": "017",
        "label": "Westaria Castle",
        "kind": "Stronghold",
        "locationNum": 1,
        "flashX": 408.55,
        "flashY": 165.9,
        "strongholdKind": "Castle",
        "initialOwner": "Westaria"
      },
      {
        "id": "047",
        "label": "Westaria Castle",
        "kind": "Stronghold",
        "locationNum": 4,
        "flashX": 602.3,
        "flashY": 283.05,
        "strongholdKind": "Castle",
        "initialOwner": "Westaria"
      },
      {
        "id": "037",
        "label": "Westaria Castle",
        "kind": "Stronghold",
        "locationNum": 3,
        "flashX": 240.7,
        "flashY": 326.0,
        "strongholdKind": "Castle",
        "initialOwner": "Westaria"
      },
      {
        "id": "067",
        "label": "Westaria Castle",
        "kind": "Stronghold",
        "locationNum": 6,
        "flashX": 419.2,
        "flashY": 472.35,
        "strongholdKind": "Castle",
        "initialOwner": "Westaria"
      },
      {
        "id": "057",
        "label": "Westaria MagicTower",
        "kind": "Stronghold",
        "locationNum": 5,
        "flashX": 78.7,
        "flashY": 423.6,
        "strongholdKind": "MagicTower",
        "initialOwner": "Westaria"
      },
      {
        "id": "077",
        "label": "Khaganate MagicTower",
        "kind": "Stronghold",
        "locationNum": 7,
        "flashX": 704.05,
        "flashY": 424.7,
        "strongholdKind": "MagicTower",
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_05_0",
        "label": "Site 5",
        "kind": "BuildSite",
        "locationNum": 5,
        "flashX": 114.95,
        "flashY": 467.55,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_00_0",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 91.45,
        "flashY": 194.95,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_00_1",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 159.5,
        "flashY": 203.2,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_00_2",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 217.7,
        "flashY": 145.1,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_02_0",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 531.35,
        "flashY": 117.35,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_02_1",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 705.1,
        "flashY": 128.55,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_02_2",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 646.9,
        "flashY": 142.9,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_05_1",
        "label": "Site 5",
        "kind": "BuildSite",
        "locationNum": 5,
        "flashX": 162.95,
        "flashY": 439.15,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_05_2",
        "label": "Site 5",
        "kind": "BuildSite",
        "locationNum": 5,
        "flashX": 121.45,
        "flashY": 374.6,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_07_0",
        "label": "Site 7",
        "kind": "BuildSite",
        "locationNum": 7,
        "flashX": 646.9,
        "flashY": 454.0,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_07_1",
        "label": "Site 7",
        "kind": "BuildSite",
        "locationNum": 7,
        "flashX": 707.45,
        "flashY": 472.05,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_07_2",
        "label": "Site 7",
        "kind": "BuildSite",
        "locationNum": 7,
        "flashX": 767.45,
        "flashY": 451.6,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "076",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 7,
        "flashX": 702.3,
        "flashY": 518.95
      },
      {
        "id": "073",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 7,
        "flashX": 665.95,
        "flashY": 499.25,
        "initialOwner": "Bandits"
      },
      {
        "id": "080",
        "label": "Junction 080",
        "kind": "Junction",
        "locationNum": 6,
        "flashX": 419.0,
        "flashY": 521.0
      },
      {
        "id": "016",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 0,
        "flashX": 93.75,
        "flashY": 236.1
      },
      {
        "id": "013",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 0,
        "flashX": 132.5,
        "flashY": 238.45,
        "initialOwner": "Bandits"
      },
      {
        "id": "010",
        "label": "Junction 010",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 211.1,
        "flashY": 236.45
      },
      {
        "id": "056",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 2,
        "flashX": 709.15,
        "flashY": 197.15
      },
      {
        "id": "053",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 2,
        "flashX": 670.0,
        "flashY": 180.95,
        "initialOwner": "Bandits"
      },
      {
        "id": "116",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 0,
        "flashX": 163.8,
        "flashY": 496.9
      },
      {
        "id": "113",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 0,
        "flashX": 193.45,
        "flashY": 471.15,
        "initialOwner": "Bandits"
      },
      {
        "id": "020",
        "label": "Junction 020",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 243.0,
        "flashY": 202.5
      },
      {
        "id": "030",
        "label": "Junction 030",
        "kind": "Junction",
        "locationNum": 1,
        "flashX": 404.0,
        "flashY": 119.0
      },
      {
        "id": "040",
        "label": "Junction 040",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 582.0,
        "flashY": 182.5
      },
      {
        "id": "050",
        "label": "Junction 050",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 649.0,
        "flashY": 224.9
      },
      {
        "id": "060",
        "label": "Junction 060",
        "kind": "Junction",
        "locationNum": 3,
        "flashX": 665.0,
        "flashY": 285.0
      },
      {
        "id": "070",
        "label": "Junction 070",
        "kind": "Junction",
        "locationNum": 7,
        "flashX": 592.0,
        "flashY": 461.0
      },
      {
        "id": "071",
        "label": "Junction 071",
        "kind": "Junction",
        "locationNum": 7,
        "flashX": 630.0,
        "flashY": 408.55
      },
      {
        "id": "090",
        "label": "Junction 090",
        "kind": "Junction",
        "locationNum": 6,
        "flashX": 292.0,
        "flashY": 474.0
      },
      {
        "id": "100",
        "label": "Junction 100",
        "kind": "Junction",
        "locationNum": 5,
        "flashX": 161.1,
        "flashY": 398.55
      },
      {
        "id": "120",
        "label": "Junction 120",
        "kind": "Junction",
        "locationNum": 3,
        "flashX": 169.0,
        "flashY": 329.0
      },
      {
        "id": "095",
        "label": "Junction 095",
        "kind": "Junction",
        "locationNum": 6,
        "flashX": 221.1,
        "flashY": 415.55
      },
      {
        "id": "005",
        "label": "Junction 005",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 172.0,
        "flashY": 168.55
      },
      {
        "id": "027",
        "label": "Khaganate Town",
        "kind": "Stronghold",
        "locationNum": 2,
        "flashX": 586.65,
        "flashY": 125.3,
        "strongholdKind": "Town",
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "045",
        "label": "Junction 045",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 588.4,
        "flashY": 159.5
      }
    ],
    "edges": [
      {
        "id": "ed_007_005",
        "from": "007",
        "to": "005",
        "waypoints": [
          {
            "x": 137.0,
            "y": 162.25
          }
        ]
      },
      {
        "id": "ed_010_013",
        "from": "010",
        "to": "013",
        "waypoints": [
          {
            "x": 156.1,
            "y": 234.85
          }
        ]
      },
      {
        "id": "ed_013_016",
        "from": "013",
        "to": "016",
        "waypoints": []
      },
      {
        "id": "ed_005_020",
        "from": "005",
        "to": "020",
        "waypoints": [
          {
            "x": 191.95,
            "y": 189.0
          }
        ]
      },
      {
        "id": "ed_050_060",
        "from": "050",
        "to": "060",
        "waypoints": [
          {
            "x": 651.85,
            "y": 253.5
          }
        ]
      },
      {
        "id": "ed_040_053",
        "from": "040",
        "to": "053",
        "waypoints": [
          {
            "x": 609.95,
            "y": 177.2
          }
        ]
      },
      {
        "id": "ed_053_056",
        "from": "053",
        "to": "056",
        "waypoints": []
      },
      {
        "id": "ed_077_071",
        "from": "077",
        "to": "071",
        "waypoints": []
      },
      {
        "id": "ed_070_073",
        "from": "070",
        "to": "073",
        "waypoints": [
          {
            "x": 608.0,
            "y": 475.95
          }
        ]
      },
      {
        "id": "ed_073_076",
        "from": "073",
        "to": "076",
        "waypoints": []
      },
      {
        "id": "ed_057_100",
        "from": "057",
        "to": "100",
        "waypoints": [
          {
            "x": 113.95,
            "y": 403.5
          }
        ]
      },
      {
        "id": "ed_095_113",
        "from": "095",
        "to": "113",
        "waypoints": [
          {
            "x": 191.95,
            "y": 442.8
          }
        ]
      },
      {
        "id": "ed_113_116",
        "from": "113",
        "to": "116",
        "waypoints": [
          {
            "x": 166.1,
            "y": 481.8
          }
        ]
      },
      {
        "id": "ed_070_071",
        "from": "070",
        "to": "071",
        "waypoints": [
          {
            "x": 591.0,
            "y": 434.9
          }
        ]
      },
      {
        "id": "ed_020_030",
        "from": "020",
        "to": "030",
        "waypoints": [
          {
            "x": 261.25,
            "y": 188.3
          },
          {
            "x": 288.25,
            "y": 171.3
          },
          {
            "x": 313.1,
            "y": 135.2
          },
          {
            "x": 367.25,
            "y": 125.05
          }
        ]
      },
      {
        "id": "ed_030_040",
        "from": "030",
        "to": "040",
        "waypoints": [
          {
            "x": 428.6,
            "y": 126.25
          },
          {
            "x": 472.1,
            "y": 130.75
          },
          {
            "x": 510.45,
            "y": 147.65
          },
          {
            "x": 546.15,
            "y": 160.0
          }
        ]
      },
      {
        "id": "ed_040_050",
        "from": "040",
        "to": "050",
        "waypoints": [
          {
            "x": 591.0,
            "y": 192.6
          },
          {
            "x": 604.0,
            "y": 206.65
          },
          {
            "x": 618.5,
            "y": 214.6
          },
          {
            "x": 634.5,
            "y": 220.6
          }
        ]
      },
      {
        "id": "ed_060_071",
        "from": "060",
        "to": "071",
        "waypoints": [
          {
            "x": 669.5,
            "y": 302.45
          },
          {
            "x": 668.5,
            "y": 333.95
          },
          {
            "x": 652.0,
            "y": 361.45
          },
          {
            "x": 634.0,
            "y": 383.45
          }
        ]
      },
      {
        "id": "ed_070_080",
        "from": "070",
        "to": "080",
        "waypoints": [
          {
            "x": 567.0,
            "y": 477.45
          },
          {
            "x": 535.5,
            "y": 491.95
          },
          {
            "x": 497.5,
            "y": 507.5
          },
          {
            "x": 453.5,
            "y": 519.5
          }
        ]
      },
      {
        "id": "ed_080_090",
        "from": "080",
        "to": "090",
        "waypoints": [
          {
            "x": 395.1,
            "y": 520.55
          },
          {
            "x": 363.6,
            "y": 510.95
          },
          {
            "x": 337.1,
            "y": 497.05
          },
          {
            "x": 310.1,
            "y": 484.5
          }
        ]
      },
      {
        "id": "ed_090_095",
        "from": "090",
        "to": "095",
        "waypoints": [
          {
            "x": 292.6,
            "y": 457.25
          },
          {
            "x": 284.1,
            "y": 436.25
          },
          {
            "x": 265.6,
            "y": 421.2
          },
          {
            "x": 239.1,
            "y": 413.25
          }
        ]
      },
      {
        "id": "ed_037_120",
        "from": "037",
        "to": "120",
        "waypoints": [
          {
            "x": 183.0,
            "y": 328.5
          }
        ]
      },
      {
        "id": "ed_017_030",
        "from": "017",
        "to": "030",
        "waypoints": [
          {
            "x": 385.6,
            "y": 138.5
          }
        ]
      },
      {
        "id": "ed_047_060",
        "from": "047",
        "to": "060",
        "waypoints": [
          {
            "x": 622.5,
            "y": 285.9
          }
        ]
      },
      {
        "id": "ed_067_080",
        "from": "067",
        "to": "080",
        "waypoints": [
          {
            "x": 402.95,
            "y": 508.1
          }
        ]
      },
      {
        "id": "ed_100_120",
        "from": "100",
        "to": "120",
        "waypoints": [
          {
            "x": 147.5,
            "y": 369.0
          }
        ]
      },
      {
        "id": "ed_095_100",
        "from": "095",
        "to": "100",
        "waypoints": [
          {
            "x": 177.0,
            "y": 403.5
          }
        ]
      },
      {
        "id": "ed_010_020",
        "from": "010",
        "to": "020",
        "waypoints": [
          {
            "x": 208.0,
            "y": 219.95
          }
        ]
      },
      {
        "id": "ed_027_045",
        "from": "027",
        "to": "045",
        "waypoints": [
          {
            "x": 568.0,
            "y": 151.5
          }
        ]
      },
      {
        "id": "ed_040_045",
        "from": "040",
        "to": "045",
        "waypoints": [
          {
            "x": 564.7,
            "y": 167.55
          }
        ]
      },
      {
        "id": "ed_120_010",
        "from": "120",
        "to": "010",
        "waypoints": [
          {
            "x": 169.0,
            "y": 309.05
          },
          {
            "x": 171.5,
            "y": 288.05
          },
          {
            "x": 181.0,
            "y": 266.45
          },
          {
            "x": 196.5,
            "y": 248.3
          }
        ]
      }
    ]
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
    "tutorialMode": "none",
    "nodes": [
      {
        "id": "007",
        "label": "Cult Town",
        "kind": "Stronghold",
        "locationNum": 0,
        "flashX": 671.15,
        "flashY": 228.8,
        "strongholdKind": "Town",
        "initialOwner": "TheCult"
      },
      {
        "id": "017",
        "label": "Empire MagicTower",
        "kind": "Stronghold",
        "locationNum": 1,
        "flashX": 430.05,
        "flashY": 486.05,
        "strongholdKind": "MagicTower",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_02_0",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 62.9,
        "flashY": 307.05,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_00_0",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 577.8,
        "flashY": 211.6,
        "initialOwner": "TheCult"
      },
      {
        "id": "053",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 2,
        "flashX": 199.25,
        "flashY": 158.65,
        "initialOwner": "Bandits"
      },
      {
        "id": "056",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 2,
        "flashX": 263.7,
        "flashY": 156.3
      },
      {
        "id": "bs_02_1",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 139.45,
        "flashY": 311.95,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "013",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 0,
        "flashX": 517.45,
        "flashY": 111.55,
        "initialOwner": "Bandits"
      },
      {
        "id": "016",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 0,
        "flashX": 595.65,
        "flashY": 85.3
      },
      {
        "id": "010",
        "label": "Junction 010",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 650.45,
        "flashY": 261.6
      },
      {
        "id": "bs_00_1",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 751.4,
        "flashY": 255.95,
        "initialOwner": "TheCult"
      },
      {
        "id": "020",
        "label": "Junction 020",
        "kind": "Junction",
        "locationNum": 1,
        "flashX": 617.45,
        "flashY": 423.4
      },
      {
        "id": "030",
        "label": "Junction 030",
        "kind": "Junction",
        "locationNum": 1,
        "flashX": 428.45,
        "flashY": 511.4
      },
      {
        "id": "040",
        "label": "Junction 040",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 220.3,
        "flashY": 364.4
      },
      {
        "id": "050",
        "label": "Junction 050",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 149.5,
        "flashY": 243.45
      },
      {
        "id": "027",
        "label": "Empire Castle",
        "kind": "Stronghold",
        "locationNum": 2,
        "flashX": 94.65,
        "flashY": 237.1,
        "strongholdKind": "Castle",
        "initialOwner": "TheEmpire"
      }
    ],
    "edges": [
      {
        "id": "ed_027_050",
        "from": "027",
        "to": "050",
        "waypoints": [
          {
            "x": 106.85,
            "y": 243.1
          }
        ]
      },
      {
        "id": "ed_053_056",
        "from": "053",
        "to": "056",
        "waypoints": []
      },
      {
        "id": "ed_050_053",
        "from": "050",
        "to": "053",
        "waypoints": [
          {
            "x": 137.65,
            "y": 214.1
          },
          {
            "x": 151.15,
            "y": 198.6
          },
          {
            "x": 164.4,
            "y": 182.1
          },
          {
            "x": 182.55,
            "y": 168.95
          }
        ]
      },
      {
        "id": "ed_040_050",
        "from": "040",
        "to": "050",
        "waypoints": [
          {
            "x": 221.3,
            "y": 344.05
          },
          {
            "x": 213.3,
            "y": 311.55
          },
          {
            "x": 197.05,
            "y": 285.05
          },
          {
            "x": 171.2,
            "y": 258.9
          }
        ]
      },
      {
        "id": "ed_030_040",
        "from": "030",
        "to": "040",
        "waypoints": [
          {
            "x": 380.85,
            "y": 503.05
          },
          {
            "x": 327.85,
            "y": 488.05
          },
          {
            "x": 284.1,
            "y": 471.55
          },
          {
            "x": 252.25,
            "y": 447.9
          },
          {
            "x": 224.3,
            "y": 411.95
          }
        ]
      },
      {
        "id": "ed_013_016",
        "from": "013",
        "to": "016",
        "waypoints": [
          {
            "x": 533.5,
            "y": 92.1
          }
        ]
      },
      {
        "id": "ed_007_010",
        "from": "007",
        "to": "010",
        "waypoints": [
          {
            "x": 638.45,
            "y": 249.95
          }
        ]
      },
      {
        "id": "ed_017_030",
        "from": "017",
        "to": "030",
        "waypoints": [
          {
            "x": 408.45,
            "y": 500.4
          }
        ]
      },
      {
        "id": "ed_020_030",
        "from": "020",
        "to": "030",
        "waypoints": [
          {
            "x": 598.35,
            "y": 427.95
          },
          {
            "x": 566.35,
            "y": 443.95
          },
          {
            "x": 537.6,
            "y": 464.5
          },
          {
            "x": 504.25,
            "y": 485.35
          },
          {
            "x": 467.8,
            "y": 503.4
          }
        ]
      },
      {
        "id": "ed_010_020",
        "from": "010",
        "to": "020",
        "waypoints": [
          {
            "x": 683.75,
            "y": 270.85
          },
          {
            "x": 727.75,
            "y": 297.85
          },
          {
            "x": 749.0,
            "y": 337.25
          },
          {
            "x": 726.25,
            "y": 386.8
          },
          {
            "x": 651.65,
            "y": 412.35
          }
        ]
      },
      {
        "id": "ed_010_013",
        "from": "010",
        "to": "013",
        "waypoints": [
          {
            "x": 614.05,
            "y": 256.35
          },
          {
            "x": 564.55,
            "y": 250.35
          },
          {
            "x": 518.3,
            "y": 233.75
          },
          {
            "x": 481.55,
            "y": 197.75
          },
          {
            "x": 492.95,
            "y": 145.3
          }
        ]
      }
    ]
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
    "tutorialMode": "none",
    "nodes": [
      {
        "id": "017",
        "label": "Empire MagicTower",
        "kind": "Stronghold",
        "locationNum": 1,
        "flashX": 315.05,
        "flashY": 488.05,
        "strongholdKind": "MagicTower",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "037",
        "label": "Empire MagicTower",
        "kind": "Stronghold",
        "locationNum": 3,
        "flashX": 478.2,
        "flashY": 185.2,
        "strongholdKind": "MagicTower",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "007",
        "label": "Cult Castle",
        "kind": "Stronghold",
        "locationNum": 0,
        "flashX": 696.95,
        "flashY": 359.55,
        "strongholdKind": "Castle",
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_02_0",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 146.9,
        "flashY": 245.05,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_00_0",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 595.85,
        "flashY": 342.9,
        "initialOwner": "TheCult"
      },
      {
        "id": "043",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 2,
        "flashX": 148.25,
        "flashY": 359.05,
        "initialOwner": "Bandits"
      },
      {
        "id": "046",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 2,
        "flashX": 191.7,
        "flashY": 392.65
      },
      {
        "id": "bs_02_1",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 333.4,
        "flashY": 241.5,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "053",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 0,
        "flashX": 622.4,
        "flashY": 83.25,
        "initialOwner": "Bandits"
      },
      {
        "id": "056",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 0,
        "flashX": 679.65,
        "flashY": 77.9
      },
      {
        "id": "bs_00_1",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 586.4,
        "flashY": 434.9,
        "initialOwner": "TheCult"
      },
      {
        "id": "010",
        "label": "Junction 010",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 635.45,
        "flashY": 373.4
      },
      {
        "id": "bs_00_2",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 668.85,
        "flashY": 425.35,
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_02_2",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 241.45,
        "flashY": 298.55,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "020",
        "label": "Junction 020",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 523.45,
        "flashY": 401.45
      },
      {
        "id": "030",
        "label": "Junction 030",
        "kind": "Junction",
        "locationNum": 1,
        "flashX": 368.15,
        "flashY": 486.9
      },
      {
        "id": "040",
        "label": "Junction 040",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 293.45,
        "flashY": 267.95
      },
      {
        "id": "050",
        "label": "Junction 050",
        "kind": "Junction",
        "locationNum": 3,
        "flashX": 535.45,
        "flashY": 176.95
      },
      {
        "id": "013",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 0,
        "flashX": 691.4,
        "flashY": 477.55,
        "initialOwner": "Bandits"
      },
      {
        "id": "015",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 0,
        "flashX": 635.75,
        "flashY": 476.2
      },
      {
        "id": "027",
        "label": "Empire Castle",
        "kind": "Stronghold",
        "locationNum": 2,
        "flashX": 237.0,
        "flashY": 236.4,
        "strongholdKind": "Castle",
        "initialOwner": "TheEmpire"
      }
    ],
    "edges": [
      {
        "id": "ed_020_040",
        "from": "020",
        "to": "040",
        "waypoints": [
          {
            "x": 502.95,
            "y": 390.9
          },
          {
            "x": 459.15,
            "y": 386.4
          },
          {
            "x": 414.05,
            "y": 371.35
          },
          {
            "x": 369.95,
            "y": 348.2
          },
          {
            "x": 350.65,
            "y": 308.8
          },
          {
            "x": 316.2,
            "y": 277.8
          }
        ]
      },
      {
        "id": "ed_007_010",
        "from": "007",
        "to": "010",
        "waypoints": []
      },
      {
        "id": "ed_010_020",
        "from": "010",
        "to": "020",
        "waypoints": [
          {
            "x": 559.45,
            "y": 390.9
          }
        ]
      },
      {
        "id": "ed_043_046",
        "from": "043",
        "to": "046",
        "waypoints": [
          {
            "x": 140.5,
            "y": 379.9
          }
        ]
      },
      {
        "id": "ed_053_056",
        "from": "053",
        "to": "056",
        "waypoints": [
          {
            "x": 630.45,
            "y": 76.95
          }
        ]
      },
      {
        "id": "ed_017_030",
        "from": "017",
        "to": "030",
        "waypoints": [
          {
            "x": 325.45,
            "y": 487.4
          }
        ]
      },
      {
        "id": "ed_027_040",
        "from": "027",
        "to": "040",
        "waypoints": [
          {
            "x": 252.0,
            "y": 256.95
          }
        ]
      },
      {
        "id": "ed_037_050",
        "from": "037",
        "to": "050",
        "waypoints": [
          {
            "x": 490.45,
            "y": 177.45
          }
        ]
      },
      {
        "id": "ed_040_043",
        "from": "040",
        "to": "043",
        "waypoints": [
          {
            "x": 263.05,
            "y": 263.1
          },
          {
            "x": 212.55,
            "y": 263.1
          },
          {
            "x": 172.3,
            "y": 287.1
          },
          {
            "x": 147.45,
            "y": 316.45
          }
        ]
      },
      {
        "id": "ed_050_053",
        "from": "050",
        "to": "053",
        "waypoints": [
          {
            "x": 530.05,
            "y": 152.45
          },
          {
            "x": 538.45,
            "y": 122.45
          },
          {
            "x": 560.3,
            "y": 101.45
          },
          {
            "x": 589.95,
            "y": 85.8
          }
        ]
      },
      {
        "id": "ed_010_050",
        "from": "010",
        "to": "050",
        "waypoints": [
          {
            "x": 649.95,
            "y": 347.6
          },
          {
            "x": 649.95,
            "y": 312.1
          },
          {
            "x": 635.55,
            "y": 276.1
          },
          {
            "x": 609.45,
            "y": 245.95
          },
          {
            "x": 579.65,
            "y": 223.5
          },
          {
            "x": 551.15,
            "y": 198.5
          }
        ]
      },
      {
        "id": "ed_013_015",
        "from": "013",
        "to": "015",
        "waypoints": [
          {
            "x": 644.45,
            "y": 472.4
          }
        ]
      },
      {
        "id": "ed_020_030",
        "from": "020",
        "to": "030",
        "waypoints": [
          {
            "x": 498.8,
            "y": 424.4
          },
          {
            "x": 470.2,
            "y": 449.4
          },
          {
            "x": 437.05,
            "y": 469.95
          },
          {
            "x": 389.2,
            "y": 484.3
          }
        ]
      },
      {
        "id": "ed_010_013",
        "from": "010",
        "to": "013",
        "waypoints": [
          {
            "x": 708.0,
            "y": 382.1
          },
          {
            "x": 720.4,
            "y": 410.6
          },
          {
            "x": 722.75,
            "y": 440.6
          },
          {
            "x": 710.4,
            "y": 463.5
          }
        ]
      }
    ]
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
    "tutorialMode": "none",
    "nodes": [
      {
        "id": "006",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 5,
        "flashX": 519.0,
        "flashY": 268.0
      },
      {
        "id": "005",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 5,
        "flashX": 476.0,
        "flashY": 266.95,
        "initialOwner": "Bandits"
      },
      {
        "id": "007",
        "label": "Cult Castle",
        "kind": "Stronghold",
        "locationNum": 0,
        "flashX": 679.55,
        "flashY": 196.5,
        "strongholdKind": "Castle",
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_04_0",
        "label": "Site 4",
        "kind": "BuildSite",
        "locationNum": 4,
        "flashX": 93.0,
        "flashY": 284.3,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_04_1",
        "label": "Site 4",
        "kind": "BuildSite",
        "locationNum": 4,
        "flashX": 248.45,
        "flashY": 195.0,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_04_2",
        "label": "Site 4",
        "kind": "BuildSite",
        "locationNum": 4,
        "flashX": 91.0,
        "flashY": 198.4,
        "initialOwner": "Westaria"
      },
      {
        "id": "000",
        "label": "Junction 000",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 693.0,
        "flashY": 243.6
      },
      {
        "id": "047",
        "label": "Westaria Castle",
        "kind": "Stronghold",
        "locationNum": 4,
        "flashX": 153.0,
        "flashY": 149.65,
        "strongholdKind": "Castle",
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_00_0",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 587.0,
        "flashY": 226.05,
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_00_1",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 571.45,
        "flashY": 179.05,
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_00_2",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 739.35,
        "flashY": 170.2,
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_01_0",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 593.4,
        "flashY": 423.05,
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_01_1",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 647.45,
        "flashY": 440.4,
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_02_0",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 323.95,
        "flashY": 481.05,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_03_0",
        "label": "Site 3",
        "kind": "BuildSite",
        "locationNum": 3,
        "flashX": 66.45,
        "flashY": 470.15,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_02_1",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 482.45,
        "flashY": 481.25,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_05_0",
        "label": "Site 5",
        "kind": "BuildSite",
        "locationNum": 5,
        "flashX": 272.0,
        "flashY": 280.3,
        "initialOwner": "Westaria"
      },
      {
        "id": "bs_05_1",
        "label": "Site 5",
        "kind": "BuildSite",
        "locationNum": 5,
        "flashX": 333.0,
        "flashY": 314.3,
        "initialOwner": "Westaria"
      },
      {
        "id": "010",
        "label": "Junction 010",
        "kind": "Junction",
        "locationNum": 1,
        "flashX": 661.5,
        "flashY": 288.0
      },
      {
        "id": "020",
        "label": "Junction 020",
        "kind": "Junction",
        "locationNum": 1,
        "flashX": 587.5,
        "flashY": 350.15
      },
      {
        "id": "040",
        "label": "Junction 040",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 485.0,
        "flashY": 430.5
      },
      {
        "id": "050",
        "label": "Junction 050",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 477.0,
        "flashY": 359.4
      },
      {
        "id": "120",
        "label": "Junction 120",
        "kind": "Junction",
        "locationNum": 5,
        "flashX": 431.0,
        "flashY": 295.0
      },
      {
        "id": "110",
        "label": "Junction 110",
        "kind": "Junction",
        "locationNum": 5,
        "flashX": 367.0,
        "flashY": 270.0
      },
      {
        "id": "100",
        "label": "Junction 100",
        "kind": "Junction",
        "locationNum": 4,
        "flashX": 240.0,
        "flashY": 228.0
      },
      {
        "id": "090",
        "label": "Junction 090",
        "kind": "Junction",
        "locationNum": 4,
        "flashX": 155.0,
        "flashY": 201.5
      },
      {
        "id": "080",
        "label": "Junction 080",
        "kind": "Junction",
        "locationNum": 4,
        "flashX": 181.0,
        "flashY": 268.0
      },
      {
        "id": "070",
        "label": "Junction 070",
        "kind": "Junction",
        "locationNum": 3,
        "flashX": 193.0,
        "flashY": 324.0
      },
      {
        "id": "060",
        "label": "Junction 060",
        "kind": "Junction",
        "locationNum": 3,
        "flashX": 256.0,
        "flashY": 425.0
      },
      {
        "id": "130",
        "label": "Junction 130",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 422.9,
        "flashY": 465.55
      },
      {
        "id": "027",
        "label": "Westaria Castle",
        "kind": "Stronghold",
        "locationNum": 2,
        "flashX": 395.95,
        "flashY": 416.75,
        "strongholdKind": "Castle",
        "initialOwner": "Westaria"
      },
      {
        "id": "057",
        "label": "Westaria MagicTower",
        "kind": "Stronghold",
        "locationNum": 5,
        "flashX": 413.35,
        "flashY": 207.4,
        "strongholdKind": "MagicTower",
        "initialOwner": "Westaria"
      },
      {
        "id": "037",
        "label": "Westaria Town",
        "kind": "Stronghold",
        "locationNum": 3,
        "flashX": 140.15,
        "flashY": 467.8,
        "strongholdKind": "Town",
        "initialOwner": "Westaria"
      },
      {
        "id": "017",
        "label": "Cult Town",
        "kind": "Stronghold",
        "locationNum": 1,
        "flashX": 668.0,
        "flashY": 380.5,
        "strongholdKind": "Town",
        "initialOwner": "TheCult"
      }
    ],
    "edges": [
      {
        "id": "ed_007_000",
        "from": "007",
        "to": "000",
        "waypoints": [
          {
            "x": 648.25,
            "y": 204.8
          }
        ]
      },
      {
        "id": "ed_010_020",
        "from": "010",
        "to": "020",
        "waypoints": [
          {
            "x": 646.5,
            "y": 302.0
          },
          {
            "x": 627.0,
            "y": 311.5
          },
          {
            "x": 607.0,
            "y": 321.0
          },
          {
            "x": 592.5,
            "y": 336.0
          }
        ]
      },
      {
        "id": "ed_130_027",
        "from": "130",
        "to": "027",
        "waypoints": [
          {
            "x": 426.6,
            "y": 473.5
          }
        ]
      },
      {
        "id": "ed_040_050",
        "from": "040",
        "to": "050",
        "waypoints": [
          {
            "x": 486.54,
            "y": 413.43
          },
          {
            "x": 487.78,
            "y": 398.33
          },
          {
            "x": 486.35,
            "y": 383.89
          },
          {
            "x": 482.47,
            "y": 371.22
          }
        ]
      },
      {
        "id": "ed_060_037",
        "from": "060",
        "to": "037",
        "waypoints": [
          {
            "x": 229.9,
            "y": 432.55
          },
          {
            "x": 207.9,
            "y": 438.55
          },
          {
            "x": 185.9,
            "y": 447.55
          },
          {
            "x": 164.9,
            "y": 457.55
          }
        ]
      },
      {
        "id": "ed_130_060",
        "from": "130",
        "to": "060",
        "waypoints": [
          {
            "x": 396.55,
            "y": 466.75
          },
          {
            "x": 358.55,
            "y": 452.75
          },
          {
            "x": 319.55,
            "y": 441.25
          },
          {
            "x": 279.55,
            "y": 435.25
          }
        ]
      },
      {
        "id": "ed_060_070",
        "from": "060",
        "to": "070",
        "waypoints": [
          {
            "x": 243.5,
            "y": 407.5
          },
          {
            "x": 229.5,
            "y": 386.5
          },
          {
            "x": 215.5,
            "y": 363.5
          },
          {
            "x": 206.5,
            "y": 340.5
          }
        ]
      },
      {
        "id": "ed_070_080",
        "from": "070",
        "to": "080",
        "waypoints": [
          {
            "x": 181.5,
            "y": 313.5
          },
          {
            "x": 172.5,
            "y": 301.5
          },
          {
            "x": 170.5,
            "y": 288.5
          },
          {
            "x": 180.5,
            "y": 278.5
          }
        ]
      },
      {
        "id": "ed_080_090",
        "from": "080",
        "to": "090",
        "waypoints": [
          {
            "x": 167.05,
            "y": 256.0
          },
          {
            "x": 142.55,
            "y": 248.0
          },
          {
            "x": 135.55,
            "y": 232.5
          },
          {
            "x": 144.05,
            "y": 215.0
          }
        ]
      },
      {
        "id": "ed_090_100",
        "from": "090",
        "to": "100",
        "waypoints": [
          {
            "x": 170.05,
            "y": 203.75
          },
          {
            "x": 192.05,
            "y": 210.75
          },
          {
            "x": 210.55,
            "y": 219.25
          },
          {
            "x": 230.05,
            "y": 226.75
          }
        ]
      },
      {
        "id": "ed_100_110",
        "from": "100",
        "to": "110",
        "waypoints": [
          {
            "x": 271.5,
            "y": 233.5
          },
          {
            "x": 305.5,
            "y": 234.5
          },
          {
            "x": 327.5,
            "y": 249.5
          },
          {
            "x": 350.5,
            "y": 267.5
          }
        ]
      },
      {
        "id": "ed_110_057",
        "from": "110",
        "to": "057",
        "waypoints": []
      },
      {
        "id": "ed_110_120",
        "from": "110",
        "to": "120",
        "waypoints": []
      },
      {
        "id": "ed_120_005",
        "from": "120",
        "to": "005",
        "waypoints": []
      },
      {
        "id": "ed_005_006",
        "from": "005",
        "to": "006",
        "waypoints": []
      },
      {
        "id": "ed_130_040",
        "from": "130",
        "to": "040",
        "waypoints": [
          {
            "x": 429.8,
            "y": 475.05
          }
        ]
      },
      {
        "id": "ed_120_050",
        "from": "120",
        "to": "050",
        "waypoints": [
          {
            "x": 428.75,
            "y": 312.5
          },
          {
            "x": 443.25,
            "y": 323.25
          },
          {
            "x": 456.75,
            "y": 333.0
          },
          {
            "x": 468.0,
            "y": 349.0
          }
        ]
      },
      {
        "id": "ed_090_047",
        "from": "090",
        "to": "047",
        "waypoints": [
          {
            "x": 160.6,
            "y": 191.55
          }
        ]
      },
      {
        "id": "ed_020_050",
        "from": "020",
        "to": "050",
        "waypoints": [
          {
            "x": 502.25,
            "y": 338.9
          }
        ]
      },
      {
        "id": "ed_000_010",
        "from": "000",
        "to": "010",
        "waypoints": [
          {
            "x": 628.05,
            "y": 239.9
          }
        ]
      },
      {
        "id": "ed_017_020",
        "from": "017",
        "to": "020",
        "waypoints": [
          {
            "x": 625.0,
            "y": 379.0
          },
          {
            "x": 610.5,
            "y": 377.5
          },
          {
            "x": 598.0,
            "y": 372.5
          },
          {
            "x": 590.0,
            "y": 361.5
          }
        ]
      }
    ]
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
    "tutorialMode": "none",
    "nodes": [
      {
        "id": "067",
        "label": "Empire MagicTower",
        "kind": "Stronghold",
        "locationNum": 4,
        "flashX": 311.85,
        "flashY": 496.9,
        "strongholdKind": "MagicTower",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "047",
        "label": "Khaganate Castle",
        "kind": "Stronghold",
        "locationNum": 2,
        "flashX": 676.4,
        "flashY": 358.8,
        "strongholdKind": "Castle",
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "077",
        "label": "Empire Castle",
        "kind": "Stronghold",
        "locationNum": 5,
        "flashX": 81.85,
        "flashY": 404.65,
        "strongholdKind": "Castle",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "037",
        "label": "Cult MagicTower",
        "kind": "Stronghold",
        "locationNum": 1,
        "flashX": 640.55,
        "flashY": 154.6,
        "strongholdKind": "MagicTower",
        "initialOwner": "TheCult"
      },
      {
        "id": "057",
        "label": "Khaganate Town",
        "kind": "Stronghold",
        "locationNum": 3,
        "flashX": 446.7,
        "flashY": 310.75,
        "strongholdKind": "Town",
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "027",
        "label": "Empire Castle",
        "kind": "Stronghold",
        "locationNum": 0,
        "flashX": 186.5,
        "flashY": 161.4,
        "strongholdKind": "Castle",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_01_0",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 534.3,
        "flashY": 128.65,
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_02_0",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 623.25,
        "flashY": 399.35,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_05_0",
        "label": "Site 5",
        "kind": "BuildSite",
        "locationNum": 5,
        "flashX": 158.4,
        "flashY": 443.35,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "010",
        "label": "Junction 010",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 219.35,
        "flashY": 180.2
      },
      {
        "id": "016",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 0,
        "flashX": 274.0,
        "flashY": 276.15,
        "initialOwner": "Bandits"
      },
      {
        "id": "017",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 0,
        "flashX": 272.6,
        "flashY": 314.75
      },
      {
        "id": "bs_00_0",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 92.5,
        "flashY": 88.55,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_02_1",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 644.7,
        "flashY": 489.2,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_00_1",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 249.9,
        "flashY": 121.95,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_00_2",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 118.95,
        "flashY": 199.95,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_01_1",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 591.2,
        "flashY": 193.35,
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_05_1",
        "label": "Site 5",
        "kind": "BuildSite",
        "locationNum": 5,
        "flashX": 92.05,
        "flashY": 469.9,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "036",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 3,
        "flashX": 455.75,
        "flashY": 196.25
      },
      {
        "id": "033",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 3,
        "flashX": 498.65,
        "flashY": 181.8,
        "initialOwner": "Bandits"
      },
      {
        "id": "044",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 2,
        "flashX": 616.95,
        "flashY": 289.15,
        "initialOwner": "Bandits"
      },
      {
        "id": "048",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 2,
        "flashX": 568.9,
        "flashY": 260.05
      },
      {
        "id": "020",
        "label": "Junction 020",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 413.95,
        "flashY": 159.45
      },
      {
        "id": "030",
        "label": "Junction 030",
        "kind": "Junction",
        "locationNum": 1,
        "flashX": 616.75,
        "flashY": 96.25
      },
      {
        "id": "040",
        "label": "Junction 040",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 723.95,
        "flashY": 234.95
      },
      {
        "id": "050",
        "label": "Junction 050",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 608.95,
        "flashY": 358.95
      },
      {
        "id": "060",
        "label": "Junction 060",
        "kind": "Junction",
        "locationNum": 4,
        "flashX": 344.5,
        "flashY": 497.1
      },
      {
        "id": "070",
        "label": "Junction 070",
        "kind": "Junction",
        "locationNum": 5,
        "flashX": 137.35,
        "flashY": 392.45
      },
      {
        "id": "032",
        "label": "Junction 032",
        "kind": "Junction",
        "locationNum": 3,
        "flashX": 491.75,
        "flashY": 264.75
      },
      {
        "id": "066",
        "label": "Junction 066",
        "kind": "Junction",
        "locationNum": 3,
        "flashX": 443.95,
        "flashY": 325.95
      },
      {
        "id": "015",
        "label": "Junction 015",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 276.95,
        "flashY": 215.95
      },
      {
        "id": "bs_05_2",
        "label": "Site 5",
        "kind": "BuildSite",
        "locationNum": 5,
        "flashX": 154.45,
        "flashY": 346.0,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "031",
        "label": "Junction 031",
        "kind": "Junction",
        "locationNum": 1,
        "flashX": 696.8,
        "flashY": 139.6
      },
      {
        "id": "034",
        "label": "Junction 034",
        "kind": "Junction",
        "locationNum": 3,
        "flashX": 547.1,
        "flashY": 181.25
      }
    ],
    "edges": [
      {
        "id": "ed_060_070",
        "from": "060",
        "to": "070",
        "waypoints": [
          {
            "x": 250.45,
            "y": 507.65
          },
          {
            "x": 224.7,
            "y": 478.15
          },
          {
            "x": 228.95,
            "y": 436.15
          },
          {
            "x": 206.65,
            "y": 403.15
          }
        ]
      },
      {
        "id": "ed_040_050",
        "from": "040",
        "to": "050",
        "waypoints": [
          {
            "x": 718.85,
            "y": 267.95
          },
          {
            "x": 698.1,
            "y": 298.95
          },
          {
            "x": 668.4,
            "y": 321.45
          },
          {
            "x": 633.05,
            "y": 347.95
          }
        ]
      },
      {
        "id": "ed_031_040",
        "from": "031",
        "to": "040",
        "waypoints": [
          {
            "x": 707.15,
            "y": 150.6
          },
          {
            "x": 718.9,
            "y": 171.6
          },
          {
            "x": 722.7,
            "y": 193.6
          },
          {
            "x": 723.9,
            "y": 218.1
          }
        ]
      },
      {
        "id": "ed_010_015",
        "from": "010",
        "to": "015",
        "waypoints": [
          {
            "x": 234.5,
            "y": 200.95
          }
        ]
      },
      {
        "id": "ed_015_016",
        "from": "015",
        "to": "016",
        "waypoints": [
          {
            "x": 253.95,
            "y": 237.95
          }
        ]
      },
      {
        "id": "ed_016_017",
        "from": "016",
        "to": "017",
        "waypoints": [
          {
            "x": 253.95,
            "y": 289.95
          }
        ]
      },
      {
        "id": "ed_015_066",
        "from": "015",
        "to": "066",
        "waypoints": [
          {
            "x": 334.95,
            "y": 259.95
          }
        ]
      },
      {
        "id": "ed_033_036",
        "from": "033",
        "to": "036",
        "waypoints": [
          {
            "x": 450.95,
            "y": 186.1
          }
        ]
      },
      {
        "id": "ed_057_032",
        "from": "057",
        "to": "032",
        "waypoints": [
          {
            "x": 466.15,
            "y": 280.5
          }
        ]
      },
      {
        "id": "ed_060_066",
        "from": "060",
        "to": "066",
        "waypoints": [
          {
            "x": 374.95,
            "y": 398.95
          }
        ]
      },
      {
        "id": "ed_044_048",
        "from": "044",
        "to": "048",
        "waypoints": []
      },
      {
        "id": "ed_010_027",
        "from": "010",
        "to": "027",
        "waypoints": [
          {
            "x": 184.35,
            "y": 169.55
          }
        ]
      },
      {
        "id": "ed_066_057",
        "from": "066",
        "to": "057",
        "waypoints": [
          {
            "x": 428.95,
            "y": 316.9
          }
        ]
      },
      {
        "id": "ed_070_077",
        "from": "070",
        "to": "077",
        "waypoints": [
          {
            "x": 92.0,
            "y": 407.8
          }
        ]
      },
      {
        "id": "ed_060_067",
        "from": "060",
        "to": "067",
        "waypoints": [
          {
            "x": 309.5,
            "y": 484.4
          }
        ]
      },
      {
        "id": "ed_037_031",
        "from": "037",
        "to": "031",
        "waypoints": [
          {
            "x": 659.55,
            "y": 143.1
          }
        ]
      },
      {
        "id": "ed_050_047",
        "from": "050",
        "to": "047",
        "waypoints": [
          {
            "x": 621.75,
            "y": 359.7
          }
        ]
      },
      {
        "id": "ed_010_020",
        "from": "010",
        "to": "020",
        "waypoints": [
          {
            "x": 246.3,
            "y": 162.95
          },
          {
            "x": 299.55,
            "y": 143.95
          },
          {
            "x": 355.8,
            "y": 156.95
          },
          {
            "x": 404.45,
            "y": 162.95
          }
        ]
      },
      {
        "id": "ed_020_030",
        "from": "020",
        "to": "030",
        "waypoints": [
          {
            "x": 431.55,
            "y": 141.6
          },
          {
            "x": 457.8,
            "y": 111.35
          },
          {
            "x": 514.05,
            "y": 94.85
          },
          {
            "x": 572.95,
            "y": 92.85
          }
        ]
      },
      {
        "id": "ed_030_031",
        "from": "030",
        "to": "031",
        "waypoints": [
          {
            "x": 632.1,
            "y": 99.25
          },
          {
            "x": 651.1,
            "y": 103.75
          },
          {
            "x": 671.1,
            "y": 114.05
          },
          {
            "x": 685.75,
            "y": 126.0
          }
        ]
      },
      {
        "id": "ed_070_010",
        "from": "070",
        "to": "010",
        "waypoints": [
          {
            "x": 67.05,
            "y": 352.5
          },
          {
            "x": 70.8,
            "y": 314.5
          },
          {
            "x": 127.55,
            "y": 286.5
          },
          {
            "x": 190.7,
            "y": 198.5
          }
        ]
      },
      {
        "id": "ed_050_060",
        "from": "050",
        "to": "060",
        "waypoints": [
          {
            "x": 569.8,
            "y": 405.95
          },
          {
            "x": 528.55,
            "y": 450.95
          },
          {
            "x": 461.85,
            "y": 481.45
          },
          {
            "x": 383.5,
            "y": 504.95
          }
        ]
      },
      {
        "id": "ed_030_034",
        "from": "030",
        "to": "034",
        "waypoints": [
          {
            "x": 551.6,
            "y": 146.1
          }
        ]
      },
      {
        "id": "ed_050_044",
        "from": "050",
        "to": "044",
        "waypoints": [
          {
            "x": 609.25,
            "y": 344.4
          },
          {
            "x": 614.0,
            "y": 331.4
          },
          {
            "x": 615.25,
            "y": 316.9
          },
          {
            "x": 615.0,
            "y": 303.4
          }
        ]
      },
      {
        "id": "ed_050_066",
        "from": "050",
        "to": "066",
        "waypoints": [
          {
            "x": 515.9,
            "y": 345.4
          }
        ]
      },
      {
        "id": "ed_032_034",
        "from": "032",
        "to": "034",
        "waypoints": [
          {
            "x": 493.65,
            "y": 225.25
          }
        ]
      },
      {
        "id": "ed_034_033",
        "from": "034",
        "to": "033",
        "waypoints": []
      }
    ]
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
    "tutorialMode": "none",
    "nodes": [
      {
        "id": "007",
        "label": "Khaganate Town",
        "kind": "Stronghold",
        "locationNum": 0,
        "flashX": 79.6,
        "flashY": 376.5,
        "strongholdKind": "Town",
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "037",
        "label": "Cult Town",
        "kind": "Stronghold",
        "locationNum": 3,
        "flashX": 652.15,
        "flashY": 152.45,
        "strongholdKind": "Town",
        "initialOwner": "TheCult"
      },
      {
        "id": "027",
        "label": "Empire Castle",
        "kind": "Stronghold",
        "locationNum": 2,
        "flashX": 376.0,
        "flashY": 233.5,
        "strongholdKind": "Castle",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "017",
        "label": "Khaganate MagicTower",
        "kind": "Stronghold",
        "locationNum": 1,
        "flashX": 143.3,
        "flashY": 152.95,
        "strongholdKind": "MagicTower",
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "047",
        "label": "Khaganate MagicTower",
        "kind": "Stronghold",
        "locationNum": 4,
        "flashX": 424.6,
        "flashY": 452.9,
        "strongholdKind": "MagicTower",
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_02_0",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 465.85,
        "flashY": 216.35,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "018",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 0,
        "flashX": 134.45,
        "flashY": 522.1,
        "initialOwner": "Bandits"
      },
      {
        "id": "019",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 0,
        "flashX": 91.8,
        "flashY": 536.55
      },
      {
        "id": "bs_00_0",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 122.95,
        "flashY": 436.05,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_00_1",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 83.9,
        "flashY": 471.95,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_03_0",
        "label": "Site 3",
        "kind": "BuildSite",
        "locationNum": 3,
        "flashX": 569.8,
        "flashY": 170.6,
        "initialOwner": "TheCult"
      },
      {
        "id": "093",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 3,
        "flashX": 393.9,
        "flashY": 519.1,
        "initialOwner": "Bandits"
      },
      {
        "id": "096",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 3,
        "flashX": 344.75,
        "flashY": 524.25
      },
      {
        "id": "043",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 2,
        "flashX": 422.2,
        "flashY": 135.55,
        "initialOwner": "Bandits"
      },
      {
        "id": "046",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 2,
        "flashX": 471.65,
        "flashY": 158.3
      },
      {
        "id": "bs_02_1",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 374.95,
        "flashY": 311.95,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_02_2",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 441.4,
        "flashY": 302.45,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "063",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 2,
        "flashX": 571.7,
        "flashY": 285.85,
        "initialOwner": "Bandits"
      },
      {
        "id": "066",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 2,
        "flashX": 601.65,
        "flashY": 301.3
      },
      {
        "id": "050",
        "label": "Junction 050",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 335.45,
        "flashY": 278.05
      },
      {
        "id": "060",
        "label": "Junction 060",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 563.45,
        "flashY": 235.6
      },
      {
        "id": "070",
        "label": "Junction 070",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 650.45,
        "flashY": 188.55
      },
      {
        "id": "080",
        "label": "Junction 080",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 678.45,
        "flashY": 332.25
      },
      {
        "id": "090",
        "label": "Junction 090",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 496.45,
        "flashY": 440.0
      },
      {
        "id": "100",
        "label": "Junction 100",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 286.45,
        "flashY": 395.0
      },
      {
        "id": "010",
        "label": "Junction 010",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 154.95,
        "flashY": 387.35
      },
      {
        "id": "020",
        "label": "Junction 020",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 86.7,
        "flashY": 204.55
      },
      {
        "id": "030",
        "label": "Junction 030",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 109.0,
        "flashY": 128.35
      },
      {
        "id": "040",
        "label": "Junction 040",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 344.8,
        "flashY": 123.95
      }
    ],
    "edges": [
      {
        "id": "ed_060_063",
        "from": "060",
        "to": "063",
        "waypoints": [
          {
            "x": 546.45,
            "y": 253.15
          }
        ]
      },
      {
        "id": "ed_063_066",
        "from": "063",
        "to": "066",
        "waypoints": [
          {
            "x": 557.45,
            "y": 290.45
          }
        ]
      },
      {
        "id": "ed_080_090",
        "from": "080",
        "to": "090",
        "waypoints": [
          {
            "x": 572.25,
            "y": 392.95
          }
        ]
      },
      {
        "id": "ed_093_096",
        "from": "093",
        "to": "096",
        "waypoints": []
      },
      {
        "id": "ed_070_080",
        "from": "070",
        "to": "080",
        "waypoints": [
          {
            "x": 687.45,
            "y": 188.05
          },
          {
            "x": 720.45,
            "y": 200.95
          },
          {
            "x": 745.05,
            "y": 225.45
          },
          {
            "x": 749.7,
            "y": 263.0
          },
          {
            "x": 724.95,
            "y": 295.0
          },
          {
            "x": 695.15,
            "y": 322.0
          }
        ]
      },
      {
        "id": "ed_090_093",
        "from": "090",
        "to": "093",
        "waypoints": [
          {
            "x": 499.2,
            "y": 459.35
          },
          {
            "x": 477.7,
            "y": 483.85
          },
          {
            "x": 450.8,
            "y": 501.85
          },
          {
            "x": 417.95,
            "y": 513.9
          }
        ]
      },
      {
        "id": "ed_090_100",
        "from": "090",
        "to": "100",
        "waypoints": [
          {
            "x": 489.4,
            "y": 427.45
          },
          {
            "x": 468.4,
            "y": 406.8
          },
          {
            "x": 441.0,
            "y": 398.8
          },
          {
            "x": 399.65,
            "y": 396.85
          },
          {
            "x": 357.4,
            "y": 396.85
          },
          {
            "x": 311.1,
            "y": 395.35
          }
        ]
      },
      {
        "id": "ed_007_010",
        "from": "007",
        "to": "010",
        "waypoints": [
          {
            "x": 96.5,
            "y": 384.95
          }
        ]
      },
      {
        "id": "ed_018_019",
        "from": "018",
        "to": "019",
        "waypoints": [
          {
            "x": 93.5,
            "y": 525.4
          }
        ]
      },
      {
        "id": "ed_010_100",
        "from": "010",
        "to": "100",
        "waypoints": [
          {
            "x": 219.5,
            "y": 394.95
          }
        ]
      },
      {
        "id": "ed_040_043",
        "from": "040",
        "to": "043",
        "waypoints": [
          {
            "x": 360.45,
            "y": 122.95
          }
        ]
      },
      {
        "id": "ed_043_046",
        "from": "043",
        "to": "046",
        "waypoints": [
          {
            "x": 423.0,
            "y": 144.4
          }
        ]
      },
      {
        "id": "ed_027_050",
        "from": "027",
        "to": "050",
        "waypoints": [
          {
            "x": 349.45,
            "y": 265.1
          }
        ]
      },
      {
        "id": "ed_037_070",
        "from": "037",
        "to": "070",
        "waypoints": [
          {
            "x": 630.0,
            "y": 176.05
          }
        ]
      },
      {
        "id": "ed_047_090",
        "from": "047",
        "to": "090",
        "waypoints": [
          {
            "x": 449.45,
            "y": 443.5
          }
        ]
      },
      {
        "id": "ed_010_018",
        "from": "010",
        "to": "018",
        "waypoints": [
          {
            "x": 164.75,
            "y": 417.55
          },
          {
            "x": 167.75,
            "y": 447.45
          },
          {
            "x": 170.25,
            "y": 476.45
          },
          {
            "x": 157.75,
            "y": 500.45
          }
        ]
      },
      {
        "id": "ed_010_020",
        "from": "010",
        "to": "020",
        "waypoints": [
          {
            "x": 172.1,
            "y": 368.05
          },
          {
            "x": 180.0,
            "y": 332.4
          },
          {
            "x": 168.1,
            "y": 290.4
          },
          {
            "x": 142.25,
            "y": 249.4
          },
          {
            "x": 110.2,
            "y": 220.0
          }
        ]
      },
      {
        "id": "ed_020_030",
        "from": "020",
        "to": "030",
        "waypoints": [
          {
            "x": 75.6,
            "y": 194.0
          },
          {
            "x": 70.5,
            "y": 180.8
          },
          {
            "x": 72.2,
            "y": 165.3
          },
          {
            "x": 83.1,
            "y": 151.8
          },
          {
            "x": 95.7,
            "y": 139.9
          }
        ]
      },
      {
        "id": "ed_030_040",
        "from": "030",
        "to": "040",
        "waypoints": [
          {
            "x": 141.0,
            "y": 119.05
          },
          {
            "x": 186.4,
            "y": 111.9
          },
          {
            "x": 233.9,
            "y": 107.9
          },
          {
            "x": 289.65,
            "y": 110.55
          },
          {
            "x": 327.6,
            "y": 119.05
          }
        ]
      },
      {
        "id": "ed_040_050",
        "from": "040",
        "to": "050",
        "waypoints": [
          {
            "x": 337.3,
            "y": 146.5
          },
          {
            "x": 305.7,
            "y": 169.85
          },
          {
            "x": 271.7,
            "y": 200.35
          },
          {
            "x": 264.2,
            "y": 229.0
          },
          {
            "x": 279.45,
            "y": 253.95
          },
          {
            "x": 318.4,
            "y": 272.0
          }
        ]
      },
      {
        "id": "ed_050_060",
        "from": "050",
        "to": "060",
        "waypoints": [
          {
            "x": 378.5,
            "y": 273.55
          },
          {
            "x": 430.0,
            "y": 271.45
          },
          {
            "x": 479.85,
            "y": 265.45
          },
          {
            "x": 531.5,
            "y": 251.7
          }
        ]
      },
      {
        "id": "ed_060_070",
        "from": "060",
        "to": "070",
        "waypoints": [
          {
            "x": 571.35,
            "y": 223.1
          },
          {
            "x": 586.1,
            "y": 206.75
          },
          {
            "x": 607.2,
            "y": 196.25
          },
          {
            "x": 631.1,
            "y": 190.5
          }
        ]
      },
      {
        "id": "ed_017_030",
        "from": "017",
        "to": "030",
        "waypoints": [
          {
            "x": 107.2,
            "y": 141.4
          }
        ]
      },
      {
        "id": "ed_050_010",
        "from": "050",
        "to": "010",
        "waypoints": [
          {
            "x": 320.05,
            "y": 301.6
          },
          {
            "x": 292.45,
            "y": 325.95
          },
          {
            "x": 263.55,
            "y": 341.95
          },
          {
            "x": 232.7,
            "y": 356.45
          },
          {
            "x": 192.15,
            "y": 370.6
          }
        ]
      }
    ]
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
    "tutorialMode": "none",
    "nodes": [
      {
        "id": "007",
        "label": "Khaganate Town",
        "kind": "Stronghold",
        "locationNum": 0,
        "flashX": 125.6,
        "flashY": 414.5,
        "strongholdKind": "Town",
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "037",
        "label": "Khaganate Town",
        "kind": "Stronghold",
        "locationNum": 3,
        "flashX": 639.55,
        "flashY": 339.7,
        "strongholdKind": "Town",
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_01_0",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 209.3,
        "flashY": 235.95,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_00_0",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 120.4,
        "flashY": 472.0,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_00_1",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 59.45,
        "flashY": 439.2,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_03_0",
        "label": "Site 3",
        "kind": "BuildSite",
        "locationNum": 3,
        "flashX": 572.9,
        "flashY": 310.45,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "052",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 3,
        "flashX": 256.45,
        "flashY": 161.2,
        "initialOwner": "Bandits"
      },
      {
        "id": "054",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 3,
        "flashX": 208.2,
        "flashY": 142.2
      },
      {
        "id": "023",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 3,
        "flashX": 460.9,
        "flashY": 449.1,
        "initialOwner": "Bandits"
      },
      {
        "id": "026",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 3,
        "flashX": 416.25,
        "flashY": 476.4
      },
      {
        "id": "043",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 2,
        "flashX": 566.2,
        "flashY": 97.55,
        "initialOwner": "Bandits"
      },
      {
        "id": "046",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 2,
        "flashX": 524.65,
        "flashY": 70.3
      },
      {
        "id": "012",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 0,
        "flashX": 177.0,
        "flashY": 534.2
      },
      {
        "id": "011",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 0,
        "flashX": 127.45,
        "flashY": 542.15,
        "initialOwner": "Bandits"
      },
      {
        "id": "bs_00_2",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 180.35,
        "flashY": 465.65,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_01_1",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 192.1,
        "flashY": 330.85,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_03_1",
        "label": "Site 3",
        "kind": "BuildSite",
        "locationNum": 3,
        "flashX": 553.9,
        "flashY": 393.05,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_03_2",
        "label": "Site 3",
        "kind": "BuildSite",
        "locationNum": 3,
        "flashX": 618.9,
        "flashY": 406.4,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_04_0",
        "label": "Site 4",
        "kind": "BuildSite",
        "locationNum": 4,
        "flashX": 439.35,
        "flashY": 343.2,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_04_1",
        "label": "Site 4",
        "kind": "BuildSite",
        "locationNum": 4,
        "flashX": 481.85,
        "flashY": 311.35,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_04_2",
        "label": "Site 4",
        "kind": "BuildSite",
        "locationNum": 4,
        "flashX": 285.4,
        "flashY": 375.9,
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "bs_02_0",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 621.35,
        "flashY": 183.8,
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_02_1",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 393.25,
        "flashY": 151.95,
        "initialOwner": "TheCult"
      },
      {
        "id": "010",
        "label": "Junction 010",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 173.45,
        "flashY": 435.85
      },
      {
        "id": "020",
        "label": "Junction 020",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 529.45,
        "flashY": 335.9
      },
      {
        "id": "030",
        "label": "Junction 030",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 605.5,
        "flashY": 364.5
      },
      {
        "id": "040",
        "label": "Junction 040",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 496.95,
        "flashY": 214.45
      },
      {
        "id": "050",
        "label": "Junction 050",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 269.5,
        "flashY": 244.45
      },
      {
        "id": "017",
        "label": "Khaganate Castle",
        "kind": "Stronghold",
        "locationNum": 1,
        "flashX": 131.3,
        "flashY": 276.15,
        "strongholdKind": "Castle",
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "060",
        "label": "Junction 060",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 164.7,
        "flashY": 288.45
      },
      {
        "id": "025",
        "label": "Junction 025",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 381.85,
        "flashY": 411.1
      },
      {
        "id": "015",
        "label": "Junction 015",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 229.45,
        "flashY": 415.3
      },
      {
        "id": "065",
        "label": "Junction 065",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 201.8,
        "flashY": 284.15
      },
      {
        "id": "022",
        "label": "Junction 022",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 487.95,
        "flashY": 360.0
      },
      {
        "id": "047",
        "label": "Khaganate Castle",
        "kind": "Stronghold",
        "locationNum": 4,
        "flashX": 368.25,
        "flashY": 372.35,
        "strongholdKind": "Castle",
        "initialOwner": "TheKhaganate"
      },
      {
        "id": "027",
        "label": "Cult MagicTower",
        "kind": "Stronghold",
        "locationNum": 2,
        "flashX": 492.5,
        "flashY": 184.0,
        "strongholdKind": "MagicTower",
        "initialOwner": "TheCult"
      }
    ],
    "edges": [
      {
        "id": "ed_022_020",
        "from": "022",
        "to": "020",
        "waypoints": [
          {
            "x": 485.85,
            "y": 345.5
          }
        ]
      },
      {
        "id": "ed_007_010",
        "from": "007",
        "to": "010",
        "waypoints": [
          {
            "x": 138.45,
            "y": 426.95
          }
        ]
      },
      {
        "id": "ed_023_026",
        "from": "023",
        "to": "026",
        "waypoints": [
          {
            "x": 423.45,
            "y": 463.45
          }
        ]
      },
      {
        "id": "ed_011_012",
        "from": "011",
        "to": "012",
        "waypoints": [
          {
            "x": 131.0,
            "y": 534.95
          }
        ]
      },
      {
        "id": "ed_037_030",
        "from": "037",
        "to": "030",
        "waypoints": [
          {
            "x": 600.5,
            "y": 358.0
          }
        ]
      },
      {
        "id": "ed_027_040",
        "from": "027",
        "to": "040",
        "waypoints": [
          {
            "x": 478.4,
            "y": 199.05
          }
        ]
      },
      {
        "id": "ed_043_046",
        "from": "043",
        "to": "046",
        "waypoints": [
          {
            "x": 518.4,
            "y": 84.5
          }
        ]
      },
      {
        "id": "ed_052_054",
        "from": "052",
        "to": "054",
        "waypoints": []
      },
      {
        "id": "ed_017_060",
        "from": "017",
        "to": "060",
        "waypoints": [
          {
            "x": 119.7,
            "y": 284.95
          }
        ]
      },
      {
        "id": "ed_015_025",
        "from": "015",
        "to": "025",
        "waypoints": [
          {
            "x": 245.0,
            "y": 413.1
          },
          {
            "x": 276.25,
            "y": 410.6
          },
          {
            "x": 304.7,
            "y": 412.1
          },
          {
            "x": 333.7,
            "y": 414.3
          },
          {
            "x": 361.85,
            "y": 414.3
          }
        ]
      },
      {
        "id": "ed_020_030",
        "from": "020",
        "to": "030",
        "waypoints": [
          {
            "x": 546.85,
            "y": 342.55
          },
          {
            "x": 560.6,
            "y": 352.85
          },
          {
            "x": 575.5,
            "y": 361.85
          },
          {
            "x": 591.95,
            "y": 365.05
          }
        ]
      },
      {
        "id": "ed_022_023",
        "from": "022",
        "to": "023",
        "waypoints": [
          {
            "x": 489.45,
            "y": 375.75
          },
          {
            "x": 487.3,
            "y": 391.8
          },
          {
            "x": 483.45,
            "y": 408.05
          },
          {
            "x": 476.2,
            "y": 424.25
          }
        ]
      },
      {
        "id": "ed_010_011",
        "from": "010",
        "to": "011",
        "waypoints": [
          {
            "x": 106.5,
            "y": 442.95
          },
          {
            "x": 82.25,
            "y": 462.95
          },
          {
            "x": 64.7,
            "y": 489.95
          },
          {
            "x": 74.7,
            "y": 520.15
          },
          {
            "x": 106.5,
            "y": 539.85
          }
        ]
      },
      {
        "id": "ed_040_020",
        "from": "040",
        "to": "020",
        "waypoints": [
          {
            "x": 506.2,
            "y": 236.55
          },
          {
            "x": 518.05,
            "y": 261.6
          },
          {
            "x": 527.2,
            "y": 286.05
          },
          {
            "x": 531.7,
            "y": 313.8
          }
        ]
      },
      {
        "id": "ed_040_043",
        "from": "040",
        "to": "043",
        "waypoints": [
          {
            "x": 534.45,
            "y": 201.35
          },
          {
            "x": 566.3,
            "y": 184.4
          },
          {
            "x": 580.7,
            "y": 152.65
          },
          {
            "x": 577.7,
            "y": 117.85
          }
        ]
      },
      {
        "id": "ed_040_050",
        "from": "040",
        "to": "050",
        "waypoints": [
          {
            "x": 470.65,
            "y": 204.75
          },
          {
            "x": 436.05,
            "y": 190.05
          },
          {
            "x": 386.95,
            "y": 194.05
          },
          {
            "x": 338.95,
            "y": 208.5
          },
          {
            "x": 292.95,
            "y": 232.45
          }
        ]
      },
      {
        "id": "ed_050_065",
        "from": "050",
        "to": "065",
        "waypoints": [
          {
            "x": 254.7,
            "y": 255.65
          },
          {
            "x": 234.6,
            "y": 266.85
          },
          {
            "x": 213.0,
            "y": 276.95
          }
        ]
      },
      {
        "id": "ed_050_052",
        "from": "050",
        "to": "052",
        "waypoints": [
          {
            "x": 276.95,
            "y": 221.65
          },
          {
            "x": 284.35,
            "y": 192.6
          },
          {
            "x": 275.75,
            "y": 170.95
          }
        ]
      },
      {
        "id": "ed_047_025",
        "from": "047",
        "to": "025",
        "waypoints": [
          {
            "x": 358.95,
            "y": 402.5
          }
        ]
      },
      {
        "id": "ed_010_015",
        "from": "010",
        "to": "015",
        "waypoints": [
          {
            "x": 183.95,
            "y": 428.25
          }
        ]
      },
      {
        "id": "ed_060_065",
        "from": "060",
        "to": "065",
        "waypoints": []
      },
      {
        "id": "ed_015_065",
        "from": "015",
        "to": "065",
        "waypoints": [
          {
            "x": 235.7,
            "y": 394.5
          },
          {
            "x": 239.7,
            "y": 358.05
          },
          {
            "x": 232.7,
            "y": 326.0
          },
          {
            "x": 212.45,
            "y": 297.75
          }
        ]
      },
      {
        "id": "ed_025_022",
        "from": "025",
        "to": "022",
        "waypoints": [
          {
            "x": 399.1,
            "y": 405.5
          },
          {
            "x": 417.1,
            "y": 397.5
          },
          {
            "x": 434.55,
            "y": 390.0
          },
          {
            "x": 453.3,
            "y": 380.25
          },
          {
            "x": 472.45,
            "y": 369.25
          }
        ]
      }
    ]
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
    "tutorialMode": "none",
    "nodes": [
      {
        "id": "047",
        "label": "Empire Castle",
        "kind": "Stronghold",
        "locationNum": 4,
        "flashX": 664.95,
        "flashY": 431.85,
        "strongholdKind": "Castle",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "017",
        "label": "Empire Town",
        "kind": "Stronghold",
        "locationNum": 1,
        "flashX": 112.7,
        "flashY": 166.7,
        "strongholdKind": "Town",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "037",
        "label": "Empire MagicTower",
        "kind": "Stronghold",
        "locationNum": 3,
        "flashX": 465.55,
        "flashY": 285.3,
        "strongholdKind": "MagicTower",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "027",
        "label": "Cult Town",
        "kind": "Stronghold",
        "locationNum": 2,
        "flashX": 643.45,
        "flashY": 182.4,
        "strongholdKind": "Town",
        "initialOwner": "TheCult"
      },
      {
        "id": "007",
        "label": "Empire Castle",
        "kind": "Stronghold",
        "locationNum": 0,
        "flashX": 304.7,
        "flashY": 287.7,
        "strongholdKind": "Castle",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_01_0",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 191.9,
        "flashY": 203.45,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_01_1",
        "label": "Site 1",
        "kind": "BuildSite",
        "locationNum": 1,
        "flashX": 196.3,
        "flashY": 133.95,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_02_0",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 653.35,
        "flashY": 248.75,
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_00_0",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 344.35,
        "flashY": 351.8,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_00_1",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 283.4,
        "flashY": 356.0,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_04_0",
        "label": "Site 4",
        "kind": "BuildSite",
        "locationNum": 4,
        "flashX": 695.9,
        "flashY": 487.4,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_04_1",
        "label": "Site 4",
        "kind": "BuildSite",
        "locationNum": 4,
        "flashX": 631.9,
        "flashY": 491.5,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "033",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 3,
        "flashX": 448.9,
        "flashY": 388.1,
        "initialOwner": "Bandits"
      },
      {
        "id": "036",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 3,
        "flashX": 456.65,
        "flashY": 431.2
      },
      {
        "id": "053",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 2,
        "flashX": 573.4,
        "flashY": 145.55,
        "initialOwner": "Bandits"
      },
      {
        "id": "056",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 2,
        "flashX": 550.45,
        "flashY": 111.3
      },
      {
        "id": "010",
        "label": "Junction 010",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 277.45,
        "flashY": 321.45
      },
      {
        "id": "060",
        "label": "Junction 060",
        "kind": "Junction",
        "locationNum": 4,
        "flashX": 630.95,
        "flashY": 457.6
      },
      {
        "id": "020",
        "label": "Junction 020",
        "kind": "Junction",
        "locationNum": 1,
        "flashX": 193.5,
        "flashY": 171.45
      },
      {
        "id": "030",
        "label": "Junction 030",
        "kind": "Junction",
        "locationNum": 3,
        "flashX": 451.85,
        "flashY": 314.4
      },
      {
        "id": "040",
        "label": "Junction 040",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 580.95,
        "flashY": 292.4
      },
      {
        "id": "050",
        "label": "Junction 050",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 594.45,
        "flashY": 195.7
      }
    ],
    "edges": [
      {
        "id": "ed_050_027",
        "from": "050",
        "to": "027",
        "waypoints": []
      },
      {
        "id": "ed_050_053",
        "from": "050",
        "to": "053",
        "waypoints": [
          {
            "x": 567.45,
            "y": 170.45
          }
        ]
      },
      {
        "id": "ed_053_056",
        "from": "053",
        "to": "056",
        "waypoints": [
          {
            "x": 541.95,
            "y": 125.5
          }
        ]
      },
      {
        "id": "ed_060_047",
        "from": "060",
        "to": "047",
        "waypoints": [
          {
            "x": 613.5,
            "y": 435.4
          }
        ]
      },
      {
        "id": "ed_040_050",
        "from": "040",
        "to": "050",
        "waypoints": [
          {
            "x": 589.45,
            "y": 279.2
          },
          {
            "x": 599.7,
            "y": 259.7
          },
          {
            "x": 600.95,
            "y": 237.65
          },
          {
            "x": 597.6,
            "y": 215.45
          }
        ]
      },
      {
        "id": "ed_030_040",
        "from": "030",
        "to": "040",
        "waypoints": [
          {
            "x": 472.45,
            "y": 313.45
          },
          {
            "x": 503.55,
            "y": 309.45
          },
          {
            "x": 531.8,
            "y": 303.9
          },
          {
            "x": 558.55,
            "y": 296.9
          }
        ]
      },
      {
        "id": "ed_007_010",
        "from": "007",
        "to": "010",
        "waypoints": [
          {
            "x": 268.45,
            "y": 307.9
          }
        ]
      },
      {
        "id": "ed_020_017",
        "from": "020",
        "to": "017",
        "waypoints": [
          {
            "x": 148.9,
            "y": 170.45
          }
        ]
      },
      {
        "id": "ed_010_030",
        "from": "010",
        "to": "030",
        "waypoints": [
          {
            "x": 333.95,
            "y": 314.95
          }
        ]
      },
      {
        "id": "ed_030_033",
        "from": "030",
        "to": "033",
        "waypoints": [
          {
            "x": 418.45,
            "y": 346.4
          }
        ]
      },
      {
        "id": "ed_033_036",
        "from": "033",
        "to": "036",
        "waypoints": [
          {
            "x": 432.9,
            "y": 402.35
          }
        ]
      },
      {
        "id": "ed_037_030",
        "from": "037",
        "to": "030",
        "waypoints": [
          {
            "x": 439.35,
            "y": 304.9
          }
        ]
      },
      {
        "id": "ed_010_020",
        "from": "010",
        "to": "020",
        "waypoints": [
          {
            "x": 253.0,
            "y": 329.4
          },
          {
            "x": 215.25,
            "y": 332.9
          },
          {
            "x": 188.65,
            "y": 318.35
          },
          {
            "x": 177.65,
            "y": 288.65
          },
          {
            "x": 195.65,
            "y": 261.65
          },
          {
            "x": 238.15,
            "y": 246.15
          },
          {
            "x": 255.85,
            "y": 214.9
          },
          {
            "x": 232.15,
            "y": 179.35
          }
        ]
      },
      {
        "id": "ed_040_060",
        "from": "040",
        "to": "060",
        "waypoints": [
          {
            "x": 610.75,
            "y": 310.4
          },
          {
            "x": 634.65,
            "y": 343.9
          },
          {
            "x": 641.5,
            "y": 381.35
          },
          {
            "x": 626.65,
            "y": 412.65
          },
          {
            "x": 610.75,
            "y": 448.65
          }
        ]
      }
    ]
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
    "tutorialMode": "none",
    "nodes": [
      {
        "id": "067",
        "label": "Empire Castle",
        "kind": "Stronghold",
        "locationNum": 6,
        "flashX": 419.85,
        "flashY": 475.85,
        "strongholdKind": "Castle",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "037",
        "label": "Empire Castle",
        "kind": "Stronghold",
        "locationNum": 3,
        "flashX": 240.0,
        "flashY": 322.45,
        "strongholdKind": "Castle",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "017",
        "label": "Empire Castle",
        "kind": "Stronghold",
        "locationNum": 1,
        "flashX": 410.95,
        "flashY": 165.45,
        "strongholdKind": "Castle",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "047",
        "label": "Empire Castle",
        "kind": "Stronghold",
        "locationNum": 4,
        "flashX": 601.0,
        "flashY": 277.9,
        "strongholdKind": "Castle",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "057",
        "label": "Empire MagicTower",
        "kind": "Stronghold",
        "locationNum": 5,
        "flashX": 71.9,
        "flashY": 424.9,
        "strongholdKind": "MagicTower",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "007",
        "label": "Empire Town",
        "kind": "Stronghold",
        "locationNum": 0,
        "flashX": 132.45,
        "flashY": 152.05,
        "strongholdKind": "Town",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "027",
        "label": "Empire Town",
        "kind": "Stronghold",
        "locationNum": 2,
        "flashX": 587.5,
        "flashY": 125.25,
        "strongholdKind": "Town",
        "initialOwner": "TheEmpire"
      },
      {
        "id": "077",
        "label": "Cult MagicTower",
        "kind": "Stronghold",
        "locationNum": 7,
        "flashX": 702.6,
        "flashY": 426.6,
        "strongholdKind": "MagicTower",
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_05_0",
        "label": "Site 5",
        "kind": "BuildSite",
        "locationNum": 5,
        "flashX": 114.95,
        "flashY": 467.55,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_00_0",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 91.45,
        "flashY": 194.95,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_00_1",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 159.5,
        "flashY": 203.2,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_00_2",
        "label": "Site 0",
        "kind": "BuildSite",
        "locationNum": 0,
        "flashX": 217.7,
        "flashY": 145.1,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_02_0",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 532.85,
        "flashY": 117.05,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_02_1",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 703.5,
        "flashY": 129.05,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_02_2",
        "label": "Site 2",
        "kind": "BuildSite",
        "locationNum": 2,
        "flashX": 646.9,
        "flashY": 142.9,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_05_1",
        "label": "Site 5",
        "kind": "BuildSite",
        "locationNum": 5,
        "flashX": 162.95,
        "flashY": 439.15,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_05_2",
        "label": "Site 5",
        "kind": "BuildSite",
        "locationNum": 5,
        "flashX": 120.45,
        "flashY": 374.6,
        "initialOwner": "TheEmpire"
      },
      {
        "id": "bs_07_0",
        "label": "Site 7",
        "kind": "BuildSite",
        "locationNum": 7,
        "flashX": 646.9,
        "flashY": 454.0,
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_07_1",
        "label": "Site 7",
        "kind": "BuildSite",
        "locationNum": 7,
        "flashX": 707.45,
        "flashY": 472.05,
        "initialOwner": "TheCult"
      },
      {
        "id": "bs_07_2",
        "label": "Site 7",
        "kind": "BuildSite",
        "locationNum": 7,
        "flashX": 767.45,
        "flashY": 451.6,
        "initialOwner": "TheCult"
      },
      {
        "id": "076",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 7,
        "flashX": 702.3,
        "flashY": 518.95
      },
      {
        "id": "073",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 7,
        "flashX": 665.95,
        "flashY": 499.25,
        "initialOwner": "Bandits"
      },
      {
        "id": "080",
        "label": "Junction 080",
        "kind": "Junction",
        "locationNum": 6,
        "flashX": 419.0,
        "flashY": 521.0
      },
      {
        "id": "016",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 0,
        "flashX": 76.25,
        "flashY": 251.75
      },
      {
        "id": "013",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 0,
        "flashX": 115.0,
        "flashY": 254.1,
        "initialOwner": "Bandits"
      },
      {
        "id": "010",
        "label": "Junction 010",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 168.5,
        "flashY": 268.45
      },
      {
        "id": "056",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 2,
        "flashX": 711.3,
        "flashY": 196.3
      },
      {
        "id": "053",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 2,
        "flashX": 677.95,
        "flashY": 184.05,
        "initialOwner": "Bandits"
      },
      {
        "id": "116",
        "label": "Gold Chest",
        "kind": "Chest",
        "locationNum": 0,
        "flashX": 163.8,
        "flashY": 496.9
      },
      {
        "id": "113",
        "label": "Ogre Guard",
        "kind": "OgreGuard",
        "locationNum": 0,
        "flashX": 193.45,
        "flashY": 471.15,
        "initialOwner": "Bandits"
      },
      {
        "id": "020",
        "label": "Junction 020",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 243.0,
        "flashY": 202.5
      },
      {
        "id": "030",
        "label": "Junction 030",
        "kind": "Junction",
        "locationNum": 1,
        "flashX": 404.0,
        "flashY": 119.0
      },
      {
        "id": "040",
        "label": "Junction 040",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 583.0,
        "flashY": 184.65
      },
      {
        "id": "050",
        "label": "Junction 050",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 649.0,
        "flashY": 224.9
      },
      {
        "id": "060",
        "label": "Junction 060",
        "kind": "Junction",
        "locationNum": 3,
        "flashX": 665.0,
        "flashY": 285.0
      },
      {
        "id": "070",
        "label": "Junction 070",
        "kind": "Junction",
        "locationNum": 7,
        "flashX": 592.0,
        "flashY": 461.0
      },
      {
        "id": "071",
        "label": "Junction 071",
        "kind": "Junction",
        "locationNum": 7,
        "flashX": 630.0,
        "flashY": 408.55
      },
      {
        "id": "090",
        "label": "Junction 090",
        "kind": "Junction",
        "locationNum": 6,
        "flashX": 292.0,
        "flashY": 474.0
      },
      {
        "id": "100",
        "label": "Junction 100",
        "kind": "Junction",
        "locationNum": 5,
        "flashX": 161.1,
        "flashY": 398.55
      },
      {
        "id": "120",
        "label": "Junction 120",
        "kind": "Junction",
        "locationNum": 3,
        "flashX": 169.0,
        "flashY": 329.0
      },
      {
        "id": "095",
        "label": "Junction 095",
        "kind": "Junction",
        "locationNum": 6,
        "flashX": 221.1,
        "flashY": 415.55
      },
      {
        "id": "005",
        "label": "Junction 005",
        "kind": "Junction",
        "locationNum": 0,
        "flashX": 172.0,
        "flashY": 168.55
      },
      {
        "id": "045",
        "label": "Junction 045",
        "kind": "Junction",
        "locationNum": 2,
        "flashX": 589.9,
        "flashY": 140.5
      }
    ],
    "edges": [
      {
        "id": "ed_007_005",
        "from": "007",
        "to": "005",
        "waypoints": [
          {
            "x": 137.0,
            "y": 162.25
          }
        ]
      },
      {
        "id": "ed_010_013",
        "from": "010",
        "to": "013",
        "waypoints": [
          {
            "x": 131.05,
            "y": 262.95
          }
        ]
      },
      {
        "id": "ed_013_016",
        "from": "013",
        "to": "016",
        "waypoints": []
      },
      {
        "id": "ed_005_020",
        "from": "005",
        "to": "020",
        "waypoints": [
          {
            "x": 191.95,
            "y": 189.0
          }
        ]
      },
      {
        "id": "ed_050_060",
        "from": "050",
        "to": "060",
        "waypoints": [
          {
            "x": 651.85,
            "y": 253.5
          }
        ]
      },
      {
        "id": "ed_050_053",
        "from": "050",
        "to": "053",
        "waypoints": [
          {
            "x": 604.0,
            "y": 179.15
          }
        ]
      },
      {
        "id": "ed_053_056",
        "from": "053",
        "to": "056",
        "waypoints": []
      },
      {
        "id": "ed_077_071",
        "from": "077",
        "to": "071",
        "waypoints": []
      },
      {
        "id": "ed_070_073",
        "from": "070",
        "to": "073",
        "waypoints": [
          {
            "x": 608.0,
            "y": 475.95
          }
        ]
      },
      {
        "id": "ed_073_076",
        "from": "073",
        "to": "076",
        "waypoints": []
      },
      {
        "id": "ed_057_100",
        "from": "057",
        "to": "100",
        "waypoints": [
          {
            "x": 113.95,
            "y": 403.5
          }
        ]
      },
      {
        "id": "ed_095_113",
        "from": "095",
        "to": "113",
        "waypoints": [
          {
            "x": 191.95,
            "y": 442.8
          }
        ]
      },
      {
        "id": "ed_113_116",
        "from": "113",
        "to": "116",
        "waypoints": [
          {
            "x": 166.1,
            "y": 481.8
          }
        ]
      },
      {
        "id": "ed_070_071",
        "from": "070",
        "to": "071",
        "waypoints": [
          {
            "x": 591.0,
            "y": 434.9
          }
        ]
      },
      {
        "id": "ed_020_030",
        "from": "020",
        "to": "030",
        "waypoints": [
          {
            "x": 261.25,
            "y": 188.3
          },
          {
            "x": 288.25,
            "y": 171.3
          },
          {
            "x": 313.1,
            "y": 135.2
          },
          {
            "x": 367.25,
            "y": 125.05
          }
        ]
      },
      {
        "id": "ed_030_040",
        "from": "030",
        "to": "040",
        "waypoints": [
          {
            "x": 428.6,
            "y": 126.25
          },
          {
            "x": 472.1,
            "y": 130.75
          },
          {
            "x": 510.45,
            "y": 147.65
          },
          {
            "x": 546.15,
            "y": 160.0
          }
        ]
      },
      {
        "id": "ed_040_050",
        "from": "040",
        "to": "050",
        "waypoints": [
          {
            "x": 591.5,
            "y": 194.65
          },
          {
            "x": 604.5,
            "y": 208.7
          },
          {
            "x": 619.0,
            "y": 216.65
          },
          {
            "x": 635.0,
            "y": 222.65
          }
        ]
      },
      {
        "id": "ed_060_071",
        "from": "060",
        "to": "071",
        "waypoints": [
          {
            "x": 669.5,
            "y": 302.45
          },
          {
            "x": 668.5,
            "y": 333.95
          },
          {
            "x": 652.0,
            "y": 361.45
          },
          {
            "x": 634.0,
            "y": 383.45
          }
        ]
      },
      {
        "id": "ed_070_080",
        "from": "070",
        "to": "080",
        "waypoints": [
          {
            "x": 567.0,
            "y": 477.45
          },
          {
            "x": 535.5,
            "y": 491.95
          },
          {
            "x": 497.5,
            "y": 507.5
          },
          {
            "x": 453.5,
            "y": 519.5
          }
        ]
      },
      {
        "id": "ed_080_090",
        "from": "080",
        "to": "090",
        "waypoints": [
          {
            "x": 395.1,
            "y": 520.55
          },
          {
            "x": 363.6,
            "y": 510.95
          },
          {
            "x": 337.1,
            "y": 497.05
          },
          {
            "x": 310.1,
            "y": 484.5
          }
        ]
      },
      {
        "id": "ed_090_095",
        "from": "090",
        "to": "095",
        "waypoints": [
          {
            "x": 292.6,
            "y": 457.25
          },
          {
            "x": 284.1,
            "y": 436.25
          },
          {
            "x": 265.6,
            "y": 421.2
          },
          {
            "x": 239.1,
            "y": 413.25
          }
        ]
      },
      {
        "id": "ed_037_120",
        "from": "037",
        "to": "120",
        "waypoints": [
          {
            "x": 183.0,
            "y": 328.5
          }
        ]
      },
      {
        "id": "ed_017_030",
        "from": "017",
        "to": "030",
        "waypoints": [
          {
            "x": 385.6,
            "y": 138.5
          }
        ]
      },
      {
        "id": "ed_047_060",
        "from": "047",
        "to": "060",
        "waypoints": [
          {
            "x": 622.5,
            "y": 285.9
          }
        ]
      },
      {
        "id": "ed_067_080",
        "from": "067",
        "to": "080",
        "waypoints": [
          {
            "x": 402.95,
            "y": 508.1
          }
        ]
      },
      {
        "id": "ed_100_120",
        "from": "100",
        "to": "120",
        "waypoints": [
          {
            "x": 147.5,
            "y": 369.0
          }
        ]
      },
      {
        "id": "ed_095_100",
        "from": "095",
        "to": "100",
        "waypoints": [
          {
            "x": 177.0,
            "y": 403.5
          }
        ]
      },
      {
        "id": "ed_120_010",
        "from": "120",
        "to": "010",
        "waypoints": [
          {
            "x": 153.95,
            "y": 297.95
          }
        ]
      },
      {
        "id": "ed_010_020",
        "from": "010",
        "to": "020",
        "waypoints": [
          {
            "x": 193.95,
            "y": 242.0
          }
        ]
      },
      {
        "id": "ed_027_045",
        "from": "027",
        "to": "045",
        "waypoints": [
          {
            "x": 576.9,
            "y": 129.65
          }
        ]
      },
      {
        "id": "ed_040_045",
        "from": "040",
        "to": "045",
        "waypoints": [
          {
            "x": 570.0,
            "y": 161.5
          }
        ]
      }
    ]
  }
];

export const ALL_LEVELS_BY_ID: Record<number, LevelDef> = Object.fromEntries(
  ALL_LEVELS.map((lvl) => [lvl.id, lvl]),
);

export const CAMPAIGN_LEVELS: Record<PlayableCampaignId, LevelDef[]> = {
  Westaria: ALL_LEVELS.filter((l) => l.campaign === 'Westaria'),
  TheKhaganate: ALL_LEVELS.filter((l) => l.campaign === 'TheKhaganate'),
  TheCult: ALL_LEVELS.filter((l) => l.campaign === 'TheCult'),
};

export function getCampaignLevels(campaign: PlayableCampaignId): LevelDef[] {
  return CAMPAIGN_LEVELS[campaign];
}

export function getLevelById(id: number): LevelDef {
  return ALL_LEVELS_BY_ID[id] ?? ALL_LEVELS[0];
}
