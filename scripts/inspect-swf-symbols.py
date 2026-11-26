import json
import struct
import zlib
from pathlib import Path

SWF_PATH = Path("flash/3986.swf")
OUT_PATH = Path("decompiled/symbols.json")


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


def read_rect(data: bytes, offset: int):
    br = BitReader(data, offset)
    nbits = br.read_bits(5)
    xmin = br.read_sbits(nbits) / 20.0
    xmax = br.read_sbits(nbits) / 20.0
    ymin = br.read_sbits(nbits) / 20.0
    ymax = br.read_sbits(nbits) / 20.0
    br.align()
    return {"xmin": xmin, "xmax": xmax, "ymin": ymin, "ymax": ymax, "width": xmax - xmin, "height": ymax - ymin}, br.byte_pos


def read_matrix(data: bytes, offset: int):
    br = BitReader(data, offset)
    has_scale = br.read_bits(1)
    sx, sy = 1.0, 1.0
    if has_scale:
        nbits = br.read_bits(5)
        sx = br.read_sbits(nbits) / 65536.0
        sy = br.read_sbits(nbits) / 65536.0
    has_rotate = br.read_bits(1)
    r0, r1 = 0.0, 0.0
    if has_rotate:
        nbits = br.read_bits(5)
        r0 = br.read_sbits(nbits) / 65536.0
        r1 = br.read_sbits(nbits) / 65536.0
    nbits_t = br.read_bits(5)
    tx = br.read_sbits(nbits_t) / 20.0
    ty = br.read_sbits(nbits_t) / 20.0
    br.align()
    return {"tx": tx, "ty": ty, "sx": sx, "sy": sy, "r0": r0, "r1": r1}, br.byte_pos


def parse_place_object2_or_3(tag_id: int, body: bytes):
    pos = 0
    flags1 = body[pos]
    pos += 1
    flags2 = 0
    if tag_id == 70:  # PlaceObject3
        flags2 = body[pos]
        pos += 1
    depth = struct.unpack_from("<H", body, pos)[0]
    pos += 2
    if tag_id == 70 and (flags2 & 0x10 or flags2 & 0x08):  # HasClassName or HasImage
        end = body.index(b"\x00", pos)
        pos = end + 1
    char_id = None
    if flags1 & 0x02:  # HasCharacter
        char_id = struct.unpack_from("<H", body, pos)[0]
        pos += 2
    matrix = None
    if flags1 & 0x04:  # HasMatrix
        matrix, pos = read_matrix(body, pos)
    if flags1 & 0x08:  # HasColorTransform
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
    ratio = None
    if flags1 & 0x10:  # HasRatio
        ratio = struct.unpack_from("<H", body, pos)[0]
        pos += 2
    name = None
    if flags1 & 0x20:  # HasName
        end = body.index(b"\x00", pos)
        name = body[pos:end].decode("utf-8", "replace")
        pos = end + 1
    return {"depth": depth, "characterId": char_id, "matrix": matrix, "name": name}


TAG_NAMES = {
    0: "End", 1: "ShowFrame", 2: "DefineShape", 6: "DefineBits", 7: "DefineButton",
    14: "DefineSound", 20: "DefineBitsLossless", 21: "DefineBitsJPEG2",
    22: "DefineShape2", 26: "PlaceObject2", 28: "RemoveObject2",
    32: "DefineShape3", 34: "DefineButton2", 35: "DefineBitsJPEG3",
    36: "DefineBitsLossless2", 37: "DefineEditText", 39: "DefineSprite",
    43: "FrameLabel", 46: "DefineMorphShape", 70: "PlaceObject3",
    76: "SymbolClass", 83: "DefineShape4", 84: "DefineMorphShape2", 90: "DefineBitsJPEG4"
}


def parse_sprite(body: bytes):
    sprite_id, frame_count = struct.unpack_from("<HH", body, 0)
    p = 4
    frame_idx = 0
    labels = {}
    children = []
    active_by_depth = {}
    while p < len(body):
        h = struct.unpack_from("<H", body, p)[0]
        p += 2
        t = h >> 6
        l = h & 63
        if l == 63:
            l = struct.unpack_from("<I", body, p)[0]
            p += 4
        tbody = body[p:p + l]
        p += l
        if t == 1:
            frame_idx += 1
        elif t == 43:
            labels[frame_idx] = tbody.split(b"\x00", 1)[0].decode("utf-8", "replace")
        elif t in (26, 70):
            try:
                po = parse_place_object2_or_3(t, tbody)
                d = po["depth"]
                prev = active_by_depth.get(d, {})
                cid = po["characterId"] if po["characterId"] is not None else prev.get("characterId")
                nm = po["name"] if po["name"] is not None else prev.get("name")
                mat = po["matrix"] if po["matrix"] is not None else prev.get("matrix")
                active_by_depth[d] = {"characterId": cid, "name": nm, "matrix": mat}
                if po["name"] is not None or (po["characterId"] is not None and frame_idx == 0):
                    children.append({
                        "frame": frame_idx,
                        "depth": d,
                        "characterId": cid,
                        "name": nm,
                        "x": mat["tx"] if mat else 0.0,
                        "y": mat["ty"] if mat else 0.0,
                        "sx": mat["sx"] if mat else 1.0,
                        "sy": mat["sy"] if mat else 1.0,
                    })
            except Exception:
                pass
        elif t == 28:
            d = struct.unpack_from("<H", tbody, 0)[0]
            active_by_depth.pop(d, None)
        elif t == 0:
            break
    return {"frameCount": frame_count, "labels": labels, "children": children}


def compute_bounds(char_id: int, defs: dict, visited=None):
    if visited is None:
        visited = set()
    if char_id in visited or char_id not in defs:
        return None
    visited.add(char_id)
    d = defs[char_id]
    if "bounds" in d and d["bounds"] is not None:
        return d["bounds"]
    if d["tag"] == "DefineSprite":
        xmin = ymin = float("inf")
        xmax = ymax = float("-inf")
        found = False
        for ch in d["sprite"]["children"]:
            if ch["characterId"] is None:
                continue
            cb = compute_bounds(ch["characterId"], defs, visited.copy())
            if cb is None:
                continue
            x0 = cb["xmin"] * ch["sx"] + ch["x"]
            x1 = cb["xmax"] * ch["sx"] + ch["x"]
            y0 = cb["ymin"] * ch["sy"] + ch["y"]
            y1 = cb["ymax"] * ch["sy"] + ch["y"]
            xmin = min(xmin, x0, x1)
            xmax = max(xmax, x0, x1)
            ymin = min(ymin, y0, y1)
            ymax = max(ymax, y0, y1)
            found = True
        if found:
            return {"xmin": round(xmin, 2), "xmax": round(xmax, 2), "ymin": round(ymin, 2), "ymax": round(ymax, 2),
                    "width": round(xmax - xmin, 2), "height": round(ymax - ymin, 2)}
    return None


def main():
    raw = SWF_PATH.read_bytes()
    data = raw[:8] + zlib.decompress(raw[8:])
    stage_rect, p = read_rect(data, 8)
    fps = data[p] / 256.0 + data[p + 1]
    frame_count = struct.unpack_from("<H", data, p + 2)[0]
    p += 4

    defs = {}
    symbols = {}

    while p < len(data):
        h = struct.unpack_from("<H", data, p)[0]
        p += 2
        t = h >> 6
        l = h & 63
        if l == 63:
            l = struct.unpack_from("<I", data, p)[0]
            p += 4
        body = data[p:p + l]
        p += l
        tname = TAG_NAMES.get(t, f"Tag{t}")

        if t in (2, 22, 32, 83):  # DefineShape*
            cid = struct.unpack_from("<H", body, 0)[0]
            rect, _ = read_rect(body, 2)
            defs[cid] = {"tag": tname, "bounds": rect}
        elif t in (46, 84):  # DefineMorphShape*
            cid = struct.unpack_from("<H", body, 0)[0]
            rect, _ = read_rect(body, 2)
            defs[cid] = {"tag": tname, "bounds": rect}
        elif t == 37:  # DefineEditText
            cid = struct.unpack_from("<H", body, 0)[0]
            rect, _ = read_rect(body, 2)
            defs[cid] = {"tag": tname, "bounds": rect}
        elif t in (6, 20, 21, 35, 36, 90):
            cid = struct.unpack_from("<H", body, 0)[0]
            defs[cid] = {"tag": tname, "bounds": None}
        elif t == 14:
            cid = struct.unpack_from("<H", body, 0)[0]
            defs[cid] = {"tag": tname, "bounds": None}
        elif t == 39:
            cid = struct.unpack_from("<H", body, 0)[0]
            sp = parse_sprite(body)
            defs[cid] = {"tag": tname, "sprite": sp}
        elif t == 76:
            c = struct.unpack_from("<H", body, 0)[0]
            q = 2
            for _ in range(c):
                cid = struct.unpack_from("<H", body, q)[0]
                q += 2
                e = body.index(b"\x00", q)
                sname = body[q:e].decode("utf-8", "replace")
                q = e + 1
                symbols[sname] = cid
        elif t == 0:
            break

    out_symbols = {}
    for sname, cid in sorted(symbols.items()):
        d = defs.get(cid, {})
        entry = {"characterId": cid, "tag": d.get("tag", "Unknown")}
        b = compute_bounds(cid, defs)
        if b:
            entry["bounds"] = b
        if "sprite" in d:
            entry["frameCount"] = d["sprite"]["frameCount"]
            if d["sprite"]["labels"]:
                entry["labels"] = d["sprite"]["labels"]
            if d["sprite"]["children"]:
                entry["children"] = d["sprite"]["children"]
        out_symbols[sname] = entry

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps({
        "stage": stage_rect,
        "fps": fps,
        "frameCount": frame_count,
        "symbolCount": len(out_symbols),
        "symbols": out_symbols
    }, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {OUT_PATH} with {len(out_symbols)} symbols")


if __name__ == "__main__":
    main()
