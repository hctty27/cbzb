#!/usr/bin/env python3
"""
Parses flash/3986.swf directly for Westaria Levels 1..8 (Level{1..8}GraphMarkersClass)
and emits game/assets/scripts/data/WestariaLevelsData.ts with exact SWF node coordinates,
road waypoints (full 2D affine matrix transform), Chests, Ogre Defenders, BuildSites, and pins.
"""
import json
import math
import re
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SWF_PATH = ROOT / "flash" / "3986.swf"
OUT_TS = ROOT / "game" / "assets" / "scripts" / "data" / "WestariaLevelsData.ts"


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
    # SWF 2D affine matrix: x' = sx*x + r1*y + tx ; y' = r0*x + sy*y + ty
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
            # Frame 1 holds static graph layout
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


LEVEL_META = {
    1: {
        "name": "The World's Edge",
        "briefing": "The Duchy of Westaria is located on the western islands. It was always safe from the troubles of the continent. But here they come.",
        "xpReward": 1000,
        "mapPin": {"x": 139.0, "y": 262.2},
        "enemyTechTier": 1,
        "playerStartGold": 550,
        "playerStartMana": 100,
        "enemyStartGold": 200,
        "tutorialMode": "tutorial1",
    },
    2: {
        "name": "The Empire's End",
        "briefing": "The Crimson Horde was conquered by the Empire ages ago but they never were fully bent. Havoc reigns in Rivadis. And these barbarians are trying to seize our land.",
        "xpReward": 1500,
        "mapPin": {"x": 172.3, "y": 187.2},
        "enemyTechTier": 1,
        "playerStartGold": 250,
        "playerStartMana": 100,
        "enemyStartGold": 260,
        "tutorialMode": "tutorial2",
    },
    3: {
        "name": "Friend Or Foe?",
        "briefing": "We wage a crusade against the filth in the name of The Lord. City of Westport is well fortified against a direct attack. But we can use limited forces to create a springboard for our advancement on the continent.",
        "xpReward": 1750,
        "mapPin": {"x": 322.9, "y": 138.2},
        "enemyTechTier": 1,
        "playerStartGold": 250,
        "playerStartMana": 100,
        "enemyStartGold": 320,
        "tutorialMode": "none",
    },
    4: {
        "name": "New Plague",
        "briefing": "We must cut Westport off from the Capital. But the recons report that the rebels from the North were seen there and they are practicing forbidden magic. Our duty is to destroy them along with the necromancers!",
        "xpReward": 2000,
        "mapPin": {"x": 414.8, "y": 165.7},
        "enemyTechTier": 1,
        "playerStartGold": 250,
        "playerStartMana": 100,
        "enemyStartGold": 350,
        "tutorialMode": "none",
    },
    5: {
        "name": "Light And Magic",
        "briefing": "Our forces on the continent have to fight on two fronts these days. Moreover we have to deal with the Horde too! The only way out is to attack Westport and seize it to secure the transfer of the reinforcement.",
        "xpReward": 3000,
        "mapPin": {"x": 322.9, "y": 231.7},
        "enemyTechTier": 2,
        "playerStartGold": 250,
        "playerStartMana": 100,
        "enemyStartGold": 420,
        "tutorialMode": "none",
    },
    6: {
        "name": "Remedy",
        "briefing": "The Horde still threatens us from the west coast. Let's wipe them out from the lands granted to us by The Lord!",
        "xpReward": 4000,
        "mapPin": {"x": 290.9, "y": 338.6},
        "enemyTechTier": 2,
        "playerStartGold": 250,
        "playerStartMana": 100,
        "enemyStartGold": 460,
        "tutorialMode": "none",
    },
    7: {
        "name": "Close The Circle",
        "briefing": "Before we attack the Capital we have to complete the outflanking of the left wing. Necromancers are fighting against the northern Cult in these snowy lands. Let's annihilate both of them with one strike!",
        "xpReward": 5000,
        "mapPin": {"x": 527.8, "y": 172.7},
        "enemyTechTier": 2,
        "playerStartGold": 250,
        "playerStartMana": 100,
        "enemyStartGold": 520,
        "tutorialMode": "none",
    },
    8: {
        "name": "The Final Battle",
        "briefing": "The necromancers have summoned all their dark legions to defend their Capital. Break through their citadels and purge the undead plague from Rivadis once and for all!",
        "xpReward": 7500,
        "mapPin": {"x": 473.8, "y": 281.6},
        "enemyTechTier": 2,
        "playerStartGold": 250,
        "playerStartMana": 120,
        "enemyStartGold": 600,
        "tutorialMode": "none",
    },
}


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
    for lv in range(1, 9):
        gm_sym = f"Level{lv}GraphMarkersClass"
        gm_cid = sym_to_cid[gm_sym]
        children = parse_sprite_children(sprites, gm_cid)

        nodes = []
        non_build_ids = set()
        bs_counters: dict[int, int] = {}
        enemies_set = set()
        stronghold_owners: dict[int, str] = {}

        # First pass to know location owners from Strongholds
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
                if owner != "Westaria":
                    enemies_set.add(owner)
            parsed_nodes.append((loc_num, raw_id, kind, sh_kind, owner, fx, fy))

        for loc_num, raw_id, kind, sh_kind, owner, fx, fy in parsed_nodes:
            if kind == "BuildSite":
                idx = bs_counters.get(loc_num, 0)
                bs_counters[loc_num] = idx + 1
                nid = f"bs_{loc_num:02d}_{idx}"
                owner = stronghold_owners.get(loc_num, "Westaria")
                label = f"Site {loc_num}"
            else:
                nid = raw_id
                non_build_ids.add(nid)
                if kind == "Stronghold":
                    prefix = "Westaria" if owner == "Westaria" else (owner.replace("The", "") if owner else "Neutral")
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
                raise RuntimeError(f"Level {lv} edge {name} references missing node!")

            raw_pts = []
            edge_cid = c.get("charId")
            if edge_cid and edge_cid in sprites:
                sub_children = parse_sprite_children(sprites, edge_cid)
                for sc in sub_children:
                    gx, gy = transform_pt(c["matrix"], sc["matrix"]["tx"], sc["matrix"]["ty"])
                    raw_pts.append({"x": gx, "y": gy})

            # Order waypoints from `from_id` -> `to_id` based on endpoint distance
            ax, ay = node_pos_map[from_id]
            bx, by = node_pos_map[to_id]
            if len(raw_pts) >= 2:
                d_first_to_a = math.hypot(raw_pts[0]["x"] - ax, raw_pts[0]["y"] - ay)
                d_last_to_a = math.hypot(raw_pts[-1]["x"] - ax, raw_pts[-1]["y"] - ay)
                if d_last_to_a < d_first_to_a:
                    raw_pts.reverse()

            # Filter waypoints too close to endpoints or duplicates
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

        meta = LEVEL_META[lv]
        levels.append({
            "id": lv,
            "name": meta["name"],
            "briefing": meta["briefing"],
            "bgKey": f"map/level{lv}_bg",
            "xpReward": meta["xpReward"],
            "goldMedalSec": 330,
            "silverMedalSec": 570,
            "mapPin": meta["mapPin"],
            "enemies": sorted(enemies_set),
            "enemyTechTier": meta["enemyTechTier"],
            "playerStartGold": meta["playerStartGold"],
            "playerStartMana": meta["playerStartMana"],
            "enemyStartGold": meta["enemyStartGold"],
            "tutorialMode": meta["tutorialMode"],
            "nodes": nodes,
            "edges": edges,
        })
        print(f"Level {lv} ({meta['name']}): {len(nodes)} nodes, {len(edges)} edges, enemies={sorted(enemies_set)}")

    OUT_TS.parent.mkdir(parents=True, exist_ok=True)
    ts = (
        "// Auto-generated from flash/3986.swf by scripts/extract-westaria-levels.py\n"
        "import { LevelDef } from './Types';\n\n"
        f"export const WESTARIA_LEVELS: LevelDef[] = {json.dumps(levels, indent=2)};\n\n"
        "export const WESTARIA_LEVELS_BY_ID: Record<number, LevelDef> = Object.fromEntries(\n"
        "  WESTARIA_LEVELS.map((lvl) => [lvl.id, lvl]),\n"
        ");\n\n"
        "export function getWestariaLevel(id: number): LevelDef {\n"
        "  return WESTARIA_LEVELS_BY_ID[id] ?? WESTARIA_LEVELS[0];\n"
        "}\n"
    )
    OUT_TS.write_text(ts, encoding="utf-8")
    print(f"Wrote {OUT_TS}")


if __name__ == "__main__":
    main()
