#!/usr/bin/env python3
"""
Parses flash/3986.swf directly for ALL 24 playable levels across 3 campaigns:
- Westaria (Levels 1..8)
- The Khaganate / Crimson Horde (Levels 11..18)
- The Cult / Icedales Cult (Levels 21..28)
Emits game/assets/scripts/data/AllLevelsData.ts and compatibility WestariaLevelsData.ts.
"""
import json
import math
import re
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SWF_PATH = ROOT / "flash" / "3986.swf"
OUT_ALL_TS = ROOT / "game" / "assets" / "scripts" / "data" / "AllLevelsData.ts"
OUT_WEST_TS = ROOT / "game" / "assets" / "scripts" / "data" / "WestariaLevelsData.ts"


class BitReader:
    def __init__(self, data: bytes, offset: int = 0):
        self.data = data
        self.byte_pos = offset
        self.bit_pos = 0

    def read_bits(self, n: int) -> int:
        val = 0
        for _ in range(n):
            if self.byte_pos >= len(self.data):
                return val
            b = (self.data[self.byte_pos] >> (7 - self.bit_pos)) & 1
            val = (val << 1) | b
            self.bit_pos += 1
            if self.bit_pos == 8:
                self.bit_pos = 0
                self.byte_pos += 1
        return val

    def read_sbits(self, n: int) -> int:
        if n == 0:
            return 0
        v = self.read_bits(n)
        if v & (1 << (n - 1)):
            v -= 1 << n
        return v

    def align(self):
        if self.bit_pos:
            self.bit_pos = 0
            self.byte_pos += 1


def read_matrix(data: bytes, offset: int):
    br = BitReader(data, offset)
    sx, sy = 1.0, 1.0
    if br.read_bits(1):
        nb = br.read_bits(5)
        sx = br.read_sbits(nb) / 65536.0
        sy = br.read_sbits(nb) / 65536.0
    r0, r1 = 0.0, 0.0
    if br.read_bits(1):
        nb = br.read_bits(5)
        r0 = br.read_sbits(nb) / 65536.0
        r1 = br.read_sbits(nb) / 65536.0
    nbt = br.read_bits(5)
    tx = br.read_sbits(nbt) / 20.0
    ty = br.read_sbits(nbt) / 20.0
    br.align()
    return {"tx": tx, "ty": ty, "sx": sx, "sy": sy, "r0": r0, "r1": r1}, br.byte_pos


def parse_place(tag_id: int, body: bytes):
    pos = 0
    f1 = body[pos]
    pos += 1
    f2 = 0
    if tag_id == 70:
        f2 = body[pos]
        pos += 1
    depth = struct.unpack_from("<H", body, pos)[0]
    pos += 2
    if tag_id == 70 and (f2 & 0x10 or f2 & 0x08):
        pos = body.index(b"\x00", pos) + 1
    char_id = None
    if f1 & 0x02:
        char_id = struct.unpack_from("<H", body, pos)[0]
        pos += 2
    mat = {"tx": 0.0, "ty": 0.0, "sx": 1.0, "sy": 1.0, "r0": 0.0, "r1": 0.0}
    if f1 & 0x04:
        mat, pos = read_matrix(body, pos)
    if f1 & 0x08:
        br = BitReader(body, pos)
        has_add = br.read_bits(1)
        has_mul = br.read_bits(1)
        nb = br.read_bits(4)
        if has_mul:
            for _ in range(4):
                br.read_sbits(nb)
        if has_add:
            for _ in range(4):
                br.read_sbits(nb)
        br.align()
        pos = br.byte_pos
    if f1 & 0x10:
        pos += 2
    name = None
    if f1 & 0x20:
        end = body.index(b"\x00", pos)
        name = body[pos:end].decode("utf-8", errors="replace")
        pos = end + 1
    return {"depth": depth, "charId": char_id, "matrix": mat, "name": name}


def transform_pt(mat: dict, lx: float, ly: float):
    gx = mat["sx"] * lx + mat["r1"] * ly + mat["tx"]
    gy = mat["r0"] * lx + mat["sy"] * ly + mat["ty"]
    return (round(gx, 2), round(gy, 2))


def parse_sprite_children(sprites: dict[int, bytes], cid: int):
    if cid not in sprites:
        return []
    tb = sprites[cid]
    p = 4
    items = []
    while p < len(tb):
        th = struct.unpack_from("<H", tb, p)[0]
        p += 2
        tid, tlen = th >> 6, th & 0x3F
        if tlen == 0x3F:
            tlen = struct.unpack_from("<I", tb, p)[0]
            p += 4
        sub = tb[p : p + tlen]
        p += tlen
        if tid in (26, 70):
            items.append(parse_place(tid, sub))
        elif tid == 1:
            break
    return items


def classify_node(sym_name: str):
    if sym_name == "NodeBuildHereClass":
        return ("BuildSite", None, None)
    if sym_name == "NodeChestClass":
        return ("Chest", None, None)
    if sym_name == "NodeDefenderOgreClass":
        return ("OgreGuard", None, "Bandits")
    if sym_name == "EmptyNodeClass":
        return ("Junction", None, None)

    m = re.match(r"^Node(Castle|Town|Warcamp|Camp|MageTower)(Green|Purple|Red|Blue)Class$", sym_name)
    if not m:
        raise RuntimeError(f"Unmapped marker symbol: {sym_name}")
    raw_kind, raw_col = m.group(1), m.group(2)
    kind_map = {
        "Castle": "Castle",
        "Town": "Town",
        "Warcamp": "Camp",
        "Camp": "Camp",
        "MageTower": "MagicTower",
    }
    faction_map = {
        "Green": "Westaria",
        "Purple": "TheEmpire",
        "Red": "TheKhaganate",
        "Blue": "TheCult",
    }
    return ("Stronghold", kind_map[raw_kind], faction_map[raw_col])


XP_BY_MISSION = [1000, 1500, 1750, 2000, 3000, 4000, 5000, 7500]
ENEMY_GOLD_BY_MISSION = [200, 260, 320, 350, 420, 460, 520, 600]

LEVEL_SPECS = [
    # ===== WESTARIA (1..8) =====
    (1, 1, "Westaria", "The World's Edge", {"x": 139.0, "y": 262.2}, "tutorial1",
     "The Duchy of Westaria is located on the western islands. It was always safe from the troubles of the continent. But here they come."),
    (2, 2, "Westaria", "The Empire's End", {"x": 172.3, "y": 187.2}, "tutorial2",
     "The Crimson Horde was conquered by the Empire ages ago but they never were fully bent. Havoc reigns in Rivadis. And these barbarians are trying to seize our land."),
    (3, 3, "Westaria", "Friend Or Foe?", {"x": 322.9, "y": 138.2}, "none",
     "We wage a crusade against the filth in the name of The Lord. City of Westport is well fortified against a direct attack. But we can use limited forces to create a springboard for our advancement on the continent."),
    (4, 4, "Westaria", "New Plague", {"x": 414.8, "y": 165.7}, "none",
     "We must cut Westport off from the Capital. But the recons report that the rebels from the North were seen there and they are practicing forbidden magic. Our duty is to destroy them along with the necromancers!"),
    (5, 5, "Westaria", "Light And Magic", {"x": 322.9, "y": 231.7}, "none",
     "Our forces on the continent have to fight on two fronts these days. Moreover we have to deal with the Horde too! The only way out is to attack Westport and seize it to secure the transfer of the reinforcement."),
    (6, 6, "Westaria", "Remedy", {"x": 290.9, "y": 338.6}, "none",
     "The Horde still threatens us from the west coast. Let's wipe them out from the lands granted to us by The Lord!"),
    (7, 7, "Westaria", "Close The Circle", {"x": 527.8, "y": 172.7}, "none",
     "Before we attack the Capital we have to complete the outflanking of the left wing. Necromancers are fighting against the northern Cult in these snowy lands. Let's annihilate both of them with one strike!"),
    (8, 8, "Westaria", "The Final Battle", {"x": 473.8, "y": 281.6}, "none",
     "The Empire of Rivadis must get rid of necromancers and regenerate. Hail to the new Empire, hail to the new Emperor! For the Lord's sake!"),

    # ===== THE KHAGANATE / CRIMSON HORDE (11..18) =====
    (11, 1, "TheKhaganate", "Rise of the Khan", {"x": 375.9, "y": 431.2}, "none",
     "The Horde was defeated and fled in disgrace. But the new khan will lead our warriors to the new victories. We shall requite and our rivals will shed their blood. If they have blood..."),
    (12, 2, "TheKhaganate", "Pillaging the West", {"x": 300.2, "y": 332.2}, "none",
     "The prophets foresee a great victory. Westarian cowards won't hide behind the thick walls. We'll pillage their towns and temples and seize their coastal strongholds!"),
    (13, 3, "TheKhaganate", "Forefathers' Lands", {"x": 498.3, "y": 415.1}, "none",
     "Once the lands on the east were our forefathers' homeland. We can't let the Empire possess it any longer. We'll get it back as we are stronger!"),
    (14, 4, "TheKhaganate", "The Eastern Cape", {"x": 601.8, "y": 380.1}, "none",
     "The necromancers built their magical laboratories on the eastern cape. We must seize them all before the northern wizards do that."),
    (15, 5, "TheKhaganate", "Clash on the Plateau", {"x": 636.8, "y": 257.2}, "none",
     "The northern wizards and Imperial necromancers stand between the Horde and the mountain passes. Let our riders and siege engines crush both armies in one fury!"),
    (16, 6, "TheKhaganate", "Riches of the North", {"x": 679.8, "y": 177.2}, "none",
     "These lands are famous for the riches hidden here. We will seize the mines of The Cult and force the wizards to mine gold and gems for us."),
    (17, 7, "TheKhaganate", "Secrets of the Grave", {"x": 534.8, "y": 171.2}, "none",
     "Our shamans conceived the secrets of the Empire's necromancers and our forefathers are now fighting on our side. The Empire must take these secrets to the grave – these secrets now belong to us!"),
    (18, 8, "TheKhaganate", "Rule Over All", {"x": 471.8, "y": 273.2}, "none",
     "The Capital of The Empire. The very Empire which have been killing us for ages. This is the time for the Great Khan to rule over all the lands and all the creatures, both alive and dead."),

    # ===== THE CULT / ICEDALES CULT (21..28) =====
    (21, 1, "TheCult", "Awakening of the Cult", {"x": 623.5, "y": 146.2}, "none",
     "The Empire enslaved us, the church persecuted our wizards, the steppe barbarians plundered our towns. And when the time came to fight for our freedom we were defeated. We hadn't enough experience, but the Cult evolves."),
    (22, 2, "TheCult", "Remnants of the Empire", {"x": 493.8, "y": 146.7}, "none",
     "Alarming reports came from our spies in the Capital: Khan and his shamans are corrupted by necromancy. They sacrifice their enemies and resurrect them. We have to get rid of the Imperial forces' remnants in our homelands."),
    (23, 3, "TheCult", "Fanatic Templars", {"x": 417.8, "y": 164.1}, "none",
     "Westaria could be our ally but the fanatic templars don't let our envoy reach the Duke, who is now the Emperor. They hate us even more than they hate the undeads. Let's fight for a free life!"),
    (24, 4, "TheCult", "Border of the Dead", {"x": 547.5, "y": 194.6}, "none",
     "Dreadful news comes from The Capital. Undeads crawl from the city. Resurrected Horde warriors rose against their masters. We must stop the undead invasion on our borders."),
    (25, 5, "TheCult", "Northern Remedy", {"x": 689.5, "y": 176.6}, "none",
     "No one should play with the dark forces. The shamans of Horde believed that these forces obeyed them but they didn't have enough strength. The plague devours the Horde from within. We'll bring the remedy to them."),
    (26, 6, "TheCult", "Storm the Plains", {"x": 636.5, "y": 255.6}, "none",
     "We have finally allied with the Westarians. Now we can send all the forces to the east and the Westarian army will strike from the south. We'd better hurry up – our forces on the Capital outskirts are exhausted."),
    (27, 7, "TheCult", "Encircle the Capital", {"x": 600.5, "y": 362.6}, "none",
     "The lands which are not controlled by the Alliance are abundant in undeads. We will strike together with the Westarians and encircle The Capital."),
    (28, 8, "TheCult", "Light and Frost", {"x": 479.4, "y": 270.6}, "none",
     "We'll meet the Westarians in the battlefield again but now we'll fight shoulder to shoulder. Let the combined light of The Lord and Northern Magic wipe the undeads out from our world forever!"),
]


def main():
    raw = SWF_PATH.read_bytes()
    body = zlib.decompress(raw[8:]) if raw[:3] == b"CWS" else raw[8:]
    nbits = body[0] >> 3
    pos = ((5 + nbits * 4) + 7) // 8 + 4

    sprites: dict[int, bytes] = {}
    cid_to_sym: dict[int, str] = {}
    sym_to_cid: dict[str, int] = {}

    while pos < len(body):
        th = struct.unpack_from("<H", body, pos)[0]
        pos += 2
        tid, tlen = th >> 6, th & 0x3F
        if tlen == 0x3F:
            tlen = struct.unpack_from("<I", body, pos)[0]
            pos += 4
        tb = body[pos : pos + tlen]
        pos += tlen
        if tid == 39:
            sprites[struct.unpack_from("<H", tb, 0)[0]] = tb
        elif tid == 76:
            cnt = struct.unpack_from("<H", tb, 0)[0]
            p = 2
            for _ in range(cnt):
                cid = struct.unpack_from("<H", tb, p)[0]
                p += 2
                end = tb.index(b"\x00", p)
                name = tb[p:end].decode("utf-8", errors="replace")
                p = end + 1
                cid_to_sym[cid] = name
                sym_to_cid[name] = cid
        elif tid == 0:
            break

    levels = []
    for lv_id, mission_idx, campaign, title, pin, tut_mode, briefing in LEVEL_SPECS:
        gm_sym = f"Level{lv_id}GraphMarkersClass"
        gm_cid = sym_to_cid[gm_sym]
        children = parse_sprite_children(sprites, gm_cid)

        nodes = []
        non_build_ids = set()
        bs_counters: dict[int, int] = {}
        enemies_set = set()
        stronghold_owners: dict[int, str] = {}

        parsed_nodes = []
        for c in children:
            name = c.get("name") or ""
            m_node = re.match(r"^l(\d+)nd_(.+)$", name)
            if not m_node:
                continue
            loc_num = int(m_node.group(1))
            raw_id = m_node.group(2)
            sym_name = cid_to_sym.get(c["charId"], "")
            kind, sh_kind, owner = classify_node(sym_name)
            fx = round(c["matrix"]["tx"], 2)
            fy = round(c["matrix"]["ty"], 2)
            if kind == "Stronghold" and owner:
                stronghold_owners[loc_num] = owner
                if owner != campaign:
                    enemies_set.add(owner)
            parsed_nodes.append((loc_num, raw_id, kind, sh_kind, owner, fx, fy))

        for loc_num, raw_id, kind, sh_kind, owner, fx, fy in parsed_nodes:
            if kind == "BuildSite":
                idx = bs_counters.get(loc_num, 0)
                bs_counters[loc_num] = idx + 1
                nid = f"bs_{loc_num:02d}_{idx}"
                owner = stronghold_owners.get(loc_num, campaign)
                label = f"Site {loc_num}"
            else:
                nid = raw_id
                non_build_ids.add(nid)
                if kind == "Stronghold":
                    prefix = (
                        "Westaria" if owner == "Westaria"
                        else "Khaganate" if owner == "TheKhaganate"
                        else "Cult" if owner == "TheCult"
                        else "Empire" if owner == "TheEmpire"
                        else "Neutral"
                    )
                    label = f"{prefix} {sh_kind}"
                elif kind == "Chest":
                    label = "Gold Chest"
                elif kind == "OgreGuard":
                    label = "Ogre Guard"
                else:
                    label = f"Junction {raw_id}"

            node_obj = {
                "id": nid,
                "label": label,
                "kind": kind,
                "locationNum": loc_num,
                "flashX": fx,
                "flashY": fy,
            }
            if sh_kind:
                node_obj["strongholdKind"] = sh_kind
            if owner:
                node_obj["initialOwner"] = owner
            nodes.append(node_obj)

        node_pos_map = {n["id"]: (n["flashX"], n["flashY"]) for n in nodes if n["kind"] != "BuildSite"}

        edges = []
        for c in children:
            name = c.get("name") or ""
            m_edge = re.match(r"^ed_([^_]+)_([^_]+)$", name)
            if not m_edge:
                continue
            from_id, to_id = m_edge.group(1), m_edge.group(2)
            if from_id not in non_build_ids or to_id not in non_build_ids:
                raise RuntimeError(f"Level {lv_id} edge {name} references missing node!")

            raw_pts = []
            edge_cid = c.get("charId")
            if edge_cid and edge_cid in sprites:
                sub_children = parse_sprite_children(sprites, edge_cid)
                for sc in sub_children:
                    gx, gy = transform_pt(c["matrix"], sc["matrix"]["tx"], sc["matrix"]["ty"])
                    raw_pts.append({"x": gx, "y": gy})

            ax, ay = node_pos_map[from_id]
            bx, by = node_pos_map[to_id]
            if len(raw_pts) >= 2:
                d_first_to_a = math.hypot(raw_pts[0]["x"] - ax, raw_pts[0]["y"] - ay)
                d_last_to_a = math.hypot(raw_pts[-1]["x"] - ax, raw_pts[-1]["y"] - ay)
                if d_last_to_a < d_first_to_a:
                    raw_pts.reverse()

            clean_wps = []
            for p in raw_pts:
                if math.hypot(p["x"] - ax, p["y"] - ay) < 8 or math.hypot(p["x"] - bx, p["y"] - by) < 8:
                    continue
                if clean_wps and math.hypot(p["x"] - clean_wps[-1]["x"], p["y"] - clean_wps[-1]["y"]) < 2:
                    continue
                clean_wps.append(p)

            edges.append({
                "id": name,
                "from": from_id,
                "to": to_id,
                "waypoints": clean_wps,
            })

        start_gold = 550 if lv_id == 1 else 250
        start_mana = 120 if mission_idx == 8 else 100
        levels.append({
            "id": lv_id,
            "missionIndex": mission_idx,
            "campaign": campaign,
            "playerFaction": campaign,
            "name": title,
            "briefing": briefing,
            "bgKey": f"map/level{lv_id}_bg",
            "xpReward": XP_BY_MISSION[mission_idx - 1],
            "goldMedalSec": 330,
            "silverMedalSec": 570,
            "mapPin": pin,
            "enemies": sorted(enemies_set),
            "enemyTechTier": 1 if mission_idx <= 4 else 2,
            "playerStartGold": start_gold,
            "playerStartMana": start_mana,
            "enemyStartGold": ENEMY_GOLD_BY_MISSION[mission_idx - 1],
            "tutorialMode": tut_mode,
            "nodes": nodes,
            "edges": edges,
        })
        print(f"Level {lv_id:2d} [{campaign}] M{mission_idx} ({title}): {len(nodes)} nodes, {len(edges)} edges, enemies={sorted(enemies_set)}")

    OUT_ALL_TS.parent.mkdir(parents=True, exist_ok=True)
    all_ts = (
        "// Auto-generated from flash/3986.swf by scripts/extract-all-levels.py\n"
        "import { LevelDef, PlayableCampaignId } from './Types';\n\n"
        f"export const ALL_LEVELS: LevelDef[] = {json.dumps(levels, indent=2)};\n\n"
        "export const ALL_LEVELS_BY_ID: Record<number, LevelDef> = Object.fromEntries(\n"
        "  ALL_LEVELS.map((lvl) => [lvl.id, lvl]),\n"
        ");\n\n"
        "export const CAMPAIGN_LEVELS: Record<PlayableCampaignId, LevelDef[]> = {\n"
        "  Westaria: ALL_LEVELS.filter((l) => l.campaign === 'Westaria'),\n"
        "  TheKhaganate: ALL_LEVELS.filter((l) => l.campaign === 'TheKhaganate'),\n"
        "  TheCult: ALL_LEVELS.filter((l) => l.campaign === 'TheCult'),\n"
        "};\n\n"
        "export function getCampaignLevels(campaign: PlayableCampaignId): LevelDef[] {\n"
        "  return CAMPAIGN_LEVELS[campaign];\n"
        "}\n\n"
        "export function getLevelById(id: number): LevelDef {\n"
        "  return ALL_LEVELS_BY_ID[id] ?? ALL_LEVELS[0];\n"
        "}\n"
    )
    OUT_ALL_TS.write_text(all_ts, encoding="utf-8")

    west_compat = (
        "// Re-exported from AllLevelsData for backward compatibility\n"
        "import { ALL_LEVELS_BY_ID, CAMPAIGN_LEVELS, getLevelById } from './AllLevelsData';\n"
        "import { LevelDef } from './Types';\n\n"
        "export const WESTARIA_LEVELS: LevelDef[] = CAMPAIGN_LEVELS.Westaria;\n"
        "export const WESTARIA_LEVELS_BY_ID: Record<number, LevelDef> = ALL_LEVELS_BY_ID;\n\n"
        "export function getWestariaLevel(id: number): LevelDef {\n"
        "  return getLevelById(id);\n"
        "}\n"
    )
    OUT_WEST_TS.write_text(west_compat, encoding="utf-8")
    print(f"Wrote {OUT_ALL_TS} and {OUT_WEST_TS}")


if __name__ == "__main__":
    main()
