#!/usr/bin/env python3
"""
Reproducible Phase 1 Asset Exporter for Takeover (flash/3986.swf) -> COCOS 4 (game/assets/resources).
Uses JPEXS FFDec CLI for lossless vector->PNG rasterization and Node/sharp for horizontal spritesheet packing.
Zero third-party portal branding (ArmorGames/Newgrounds/Playtomic/MochiBot) is exported.
"""
import json
import os
import shutil
import struct
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SWF_PATH = ROOT / "flash" / "3986.swf"
FFDEC_JAR = ROOT / "tools" / "ffdec" / "ffdec.jar"
JAVA_EXE = Path(r"E:\Tool\graalvm\bin\java.exe")
SYMBOLS_JSON = ROOT / "decompiled" / "symbols.json"
SOUNDS_DIR = ROOT / "decompiled" / "sounds"
RAW_DIR = ROOT / "decompiled" / "raw_export"
OUT_RES = ROOT / "game" / "assets" / "resources"
OUT_TEX = OUT_RES / "textures"
OUT_AUDIO = OUT_RES / "audio"
MANIFEST_TS = ROOT / "game" / "assets" / "scripts" / "data" / "AssetManifest.ts"

# Static shapes (defined by characterId directly because not top-level SymbolClass)
SHAPE_EXPORTS = {
    "ui/title_bg": {"cid": 2664, "zoom": 1.5, "xmin": 0.0, "xmax": 800.0, "ymin": 0.0, "ymax": 600.55},
}

# Static sprites (frame 1 only) mapped by SymbolClass name or direct cid
STATIC_SPRITES = {
    "ui/title_logo": {"cid": 26, "zoom": 1.5},
    "ui/iriysoft_logo": {"cid": 2671, "zoom": 1.5},
    "ui/btn_pill": {"cid": 60, "zoom": 1.5},
    "ui/hud_panel_back": {"cid": 6459, "zoom": 1.25},
    "ui/win_castle_panel": {"cid": 3966, "zoom": 1.25},
    "ui/win_town_panel": {"cid": 1751, "zoom": 1.25},
    "ui/star_gold": {"symbol": "GoldStarIconClass", "zoom": 1.5},
    "ui/star_silver": {"symbol": "SilverStarIconClass", "zoom": 1.5},
    "ui/icon_go_in": {"symbol": "IconGoInClass", "zoom": 1.5},
    "ui/icon_go_path": {"symbol": "IconGoPathClass", "zoom": 1.5},
    "ui/icon_attack": {"symbol": "IconAttackClass", "zoom": 1.5, "frame": 1},
    # Map & Strongholds
    "map/level1_bg": {"symbol": "Level1Class", "zoom": 1.5},
    "map/build_site": {"symbol": "BuildHereTopClass", "zoom": 1.5},
    "buildings/castle_green": {"symbol": "CastleGreenClass", "zoom": 1.5},
    "buildings/castle_green_raze": {"symbol": "CastleGreenRazeClass", "zoom": 1.5},
    "buildings/castle_purple": {"symbol": "CastlePurpleClass", "zoom": 1.5},
    "buildings/castle_purple_raze": {"symbol": "CastlePurpleRazeClass", "zoom": 1.5},
    "buildings/town_green": {"symbol": "TownGreenClass", "zoom": 1.5},
    "buildings/town_green_raze": {"symbol": "TownGreenRazeClass", "zoom": 1.5},
    "buildings/town_purple": {"symbol": "TownPurpleClass", "zoom": 1.5},
    "buildings/town_purple_raze": {"symbol": "TownPurpleRazeClass", "zoom": 1.5},
    "buildings/village_green": {"symbol": "VillageGreenClass", "zoom": 1.5, "frame": 1},
    "buildings/village_purple": {"symbol": "VillagePurpleClass", "zoom": 1.5, "frame": 1},
    "buildings/mine_green": {"symbol": "MineGreenClass", "zoom": 1.5, "frame": 1},
    "buildings/mine_purple": {"symbol": "MinePurpleClass", "zoom": 1.5, "frame": 1},
    "buildings/obelisk_green": {"symbol": "ObeliskGreenClass", "zoom": 1.5, "frame": 1},
    "buildings/obelisk_purple": {"symbol": "ObeliskPurpleClass", "zoom": 1.5, "frame": 1},
    # Recruitment / Unit Portrait Icons (Westaria + Empire)
    "icons/unit_w_infantry": {"symbol": "IconT1_W_InfantryClass", "zoom": 1.5},
    "icons/unit_w_archers": {"symbol": "IconT1_W_ArchersClass", "zoom": 1.5},
    "icons/unit_w_cavalry": {"symbol": "IconT1_W_CavalryClass", "zoom": 1.5},
    "icons/unit_w_magic": {"symbol": "IconT1_W_MagicClass", "zoom": 1.5},
    "icons/unit_w_siege": {"symbol": "IconT1_W_SiegeClass", "zoom": 1.5},
    "icons/unit_e_infantry": {"symbol": "IconT1_E_InfantryClass", "zoom": 1.5},
    "icons/unit_e_archers": {"symbol": "IconT1_E_ArchersClass", "zoom": 1.5},
}

UNIT_SETS = [
    ("w_infantry", "GreenInfantry"),
    ("w_archers", "GreenArchers"),
    ("w_cavalry", "GreenCavalry"),
    ("w_magic", "GreenMagic"),
    ("w_siege", "GreenSiege"),
    ("e_infantry", "PurpleInfantry"),
    ("e_archers", "PurpleArchers"),
]

DIRECTIONS = ["Down", "Left", "Right", "Up"]
PHASES = ["Go", "Attack"]

AUDIO_MAP = {
    "8352_musicMenuClass_musicMenuClass.mp3": "music_menu.mp3",
    "2978_musicGameplayClass_musicGameplayClass.mp3": "music_battle.mp3",
    "7256_sndButtonClick_sndButtonClick.mp3": "ui_click.mp3",
    "8180_sndButtonOver_sndButtonOver.mp3": "ui_hover.mp3",
    "5368_sndSendSoldiers_sndSendSoldiers.mp3": "send_soldiers.mp3",
    "2495_sndSendHorses_sndSendHorses.mp3": "send_horses.mp3",
    "1722_sndSendSiege_sndSendSiege.mp3": "send_siege.mp3",
    "5638_sndAttackSword1_sndAttackSword1.mp3": "attack_sword.mp3",
    "6895_sndAttackBow1_sndAttackBow1.mp3": "attack_bow.mp3",
    "7616_sndHitArrow1_sndHitArrow1.mp3": "hit_arrow.mp3",
    "7442_sndAttackSiege_sndAttackSiege.mp3": "attack_siege.mp3",
    "3258_sndBuildFarm_sndBuildFarm.mp3": "build_farm.mp3",
    "5602_sndBuildMine_sndBuildMine.mp3": "build_mine.mp3",
    "5331_sndBuildObelisk_sndBuildObelisk.mp3": "build_obelisk.mp3",
    "6251_sndDestructionStronghold_sndDestructionStronghold.mp3": "capture_stronghold.mp3",
    "7373_sndDeadMan1_sndDeadMan1.mp3": "dead_man.mp3",
    "3271_sndDeadUndead1_sndDeadUndead1.mp3": "dead_undead.mp3",
}


def png_size(path: Path):
    data = path.read_bytes()
    return struct.unpack(">II", data[16:24])


def run_ffdec(kind: str, cids: list[int], zoom: float, out_dir: Path, frames: str | None = None):
    out_dir.mkdir(parents=True, exist_ok=True)
    cmd = [
        str(JAVA_EXE), "-jar", str(FFDEC_JAR),
        "-selectid", ",".join(str(c) for c in sorted(set(cids))),
        "-zoom", str(zoom),
        "-format", f"{kind}:png",
    ]
    if frames:
        cmd.extend(["-select", frames])
    cmd.extend(["-export", kind, str(out_dir), str(SWF_PATH)])
    print("Running:", " ".join(cmd[:8]), f"... ({len(cids)} cids)")
    subprocess.run(cmd, check=True)


def find_exported_dir(base: Path, cid: int) -> Path | None:
    prefix = f"DefineSprite_{cid}_"
    exact = f"DefineSprite_{cid}"
    for p in base.iterdir():
        if p.is_dir() and (p.name == exact or p.name.startswith(prefix)):
            return p
    return None


def compute_anchor(bounds: dict | None) -> tuple[float, float]:
    if not bounds:
        return (0.5, 0.5)
    w = bounds["xmax"] - bounds["xmin"]
    h = bounds["ymax"] - bounds["ymin"]
    if w <= 0 or h <= 0:
        return (0.5, 0.5)
    ax = (0.0 - bounds["xmin"]) / w
    ay = (bounds["ymax"] - 0.0) / h
    return (round(ax, 4), round(ay, 4))


def pack_strips_with_sharp(jobs: list[dict]):
    """Calls Node + sharp from tools/cocos-cli to stitch evenly sampled frames into horizontal PNG strips."""
    if not jobs:
        return
    js = r"""
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
(async () => {
  const jobs = JSON.parse(fs.readFileSync(process.argv[1], 'utf8'));
  for (const job of jobs) {
    fs.mkdirSync(path.dirname(job.out), { recursive: true });
    const metas = await Promise.all(job.inputs.map(p => sharp(p).metadata()));
    const fw = Math.max(...metas.map(m => m.width));
    const fh = Math.max(...metas.map(m => m.height));
    const composites = await Promise.all(job.inputs.map(async (p, i) => ({
      input: await sharp(p).resize(fw, fh, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer(),
      left: i * fw,
      top: 0,
    })));
    await sharp({
      create: { width: fw * job.inputs.length, height: fh, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
    }).composite(composites).png().toFile(job.out);
    job.frameWidth = fw;
    job.frameHeight = fh;
  }
  fs.writeFileSync(process.argv[1], JSON.stringify(jobs, null, 2));
})().catch(err => { console.error(err); process.exit(1); });
"""
    job_file = RAW_DIR / "pack_jobs.json"
    job_file.write_text(json.dumps(jobs, indent=2), encoding="utf-8")
    subprocess.run(
        ["node", "-e", js, str(job_file)],
        cwd=str(ROOT / "tools" / "cocos-cli"),
        check=True,
    )
    return json.loads(job_file.read_text(encoding="utf-8"))


def main():
    reuse_raw = "--reuse-raw" in sys.argv
    symbols = json.loads(SYMBOLS_JSON.read_text(encoding="utf-8"))["symbols"]
    if not reuse_raw:
        if RAW_DIR.exists():
            shutil.rmtree(RAW_DIR)
        RAW_DIR.mkdir(parents=True, exist_ok=True)
    else:
        RAW_DIR.mkdir(parents=True, exist_ok=True)
    OUT_TEX.mkdir(parents=True, exist_ok=True)
    OUT_AUDIO.mkdir(parents=True, exist_ok=True)

    # 1. Export Shapes
    shape_cids = [v["cid"] for v in SHAPE_EXPORTS.values()]
    if not (reuse_raw and (RAW_DIR / "shapes").exists()):
        run_ffdec("shape", shape_cids, 1.5, RAW_DIR / "shapes")

    # 2. Export Static Sprites (frame 1 at matching zooms)
    zoom_groups: dict[float, list[tuple[str, dict, dict | None]]] = {}
    for key, spec in STATIC_SPRITES.items():
        if "symbol" in spec:
            sym = symbols[spec["symbol"]]
            cid = sym["characterId"]
            bounds = sym.get("bounds")
        else:
            cid = spec["cid"]
            bounds = None
        zoom_groups.setdefault(spec["zoom"], []).append((key, {"cid": cid, **spec}, bounds))

    for zoom, entries in zoom_groups.items():
        zdir = RAW_DIR / f"static_{str(zoom).replace('.', '_')}"
        if not (reuse_raw and zdir.exists()):
            run_ffdec("sprite", [e[1]["cid"] for e in entries], zoom, zdir, frames="1")

    # 3. Export Unit Animations + Explosion at zoom 2.0
    unit_jobs_meta = []
    unit_cids = []
    for unit_key, sym_prefix in UNIT_SETS:
        for d in DIRECTIONS:
            for phase in PHASES:
                sym_name = f"{sym_prefix}{d}_{phase}"
                if sym_name not in symbols:
                    continue
                sym = symbols[sym_name]
                unit_cids.append(sym["characterId"])
                unit_jobs_meta.append((unit_key, f"{d.lower()}_{phase.lower()}", sym))
        # Down_Die for death burst/anim
        die_name = f"{sym_prefix}Down_Die"
        if die_name in symbols:
            sym = symbols[die_name]
            unit_cids.append(sym["characterId"])
            unit_jobs_meta.append((unit_key, "die", sym))

    unit_dir = RAW_DIR / "units"
    if not (reuse_raw and unit_dir.exists()):
        run_ffdec("sprite", unit_cids, 2.0, unit_dir)

    exp_sym = symbols["ExplosionClass"]
    if not (reuse_raw and (RAW_DIR / "vfx").exists()):
        run_ffdec("sprite", [exp_sym["characterId"]], 1.5, RAW_DIR / "vfx")

    manifest_entries: dict[str, dict] = {}

    # Copy shapes
    for key, spec in SHAPE_EXPORTS.items():
        src = RAW_DIR / "shapes" / f"{spec['cid']}.png"
        dst = OUT_TEX / f"{key}.png"
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)
        w, h = png_size(dst)
        manifest_entries[key] = {
            "path": f"textures/{key}",
            "width": w,
            "height": h,
            "frameWidth": w,
            "frameHeight": h,
            "frameCount": 1,
            "anchorX": 0.5,
            "anchorY": 0.5,
        }

    # Copy static sprites
    for zoom, entries in zoom_groups.items():
        zdir = RAW_DIR / f"static_{str(zoom).replace('.', '_')}"
        for key, spec, bounds in entries:
            sdir = find_exported_dir(zdir, spec["cid"])
            if not sdir:
                raise RuntimeError(f"Missing FFDec export for {key} (cid={spec['cid']})")
            pngs = sorted(sdir.glob("*.png"), key=lambda p: int(p.stem) if p.stem.isdigit() else 0)
            src = pngs[0]
            dst = OUT_TEX / f"{key}.png"
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)
            w, h = png_size(dst)
            ax, ay = compute_anchor(bounds)
            # For full-screen backgrounds use centered or exact anchor
            if key == "map/level1_bg":
                # Keep Flash world bounds anchor so Level1Class maps directly onto world origin (0, 0)
                manifest_entries[key] = {
                    "path": f"textures/{key}",
                    "width": w,
                    "height": h,
                    "frameWidth": w,
                    "frameHeight": h,
                    "frameCount": 1,
                    "anchorX": ax,
                    "anchorY": ay,
                    "flashBounds": bounds,
                }
            else:
                manifest_entries[key] = {
                    "path": f"textures/{key}",
                    "width": w,
                    "height": h,
                    "frameWidth": w,
                    "frameHeight": h,
                    "frameCount": 1,
                    "anchorX": ax if key.startswith("buildings/") or key == "map/build_site" else 0.5,
                    "anchorY": ay if key.startswith("buildings/") or key == "map/build_site" else 0.5,
                }

    # Pack unit strips & explosion strip (sample up to 8 frames per anim cleanly)
    pack_jobs = []
    for unit_key, anim_key, sym in unit_jobs_meta:
        sdir = find_exported_dir(unit_dir, sym["characterId"])
        if not sdir:
            continue
        all_pngs = sorted(sdir.glob("*.png"), key=lambda p: int(p.stem))
        target_n = min(8, len(all_pngs))
        if target_n <= 1:
            sampled = all_pngs
        else:
            idxs = [round(i * (len(all_pngs) - 1) / (target_n - 1)) for i in range(target_n)]
            sampled = [all_pngs[i] for i in idxs]
        key = f"units/{unit_key}/{anim_key}"
        out_png = OUT_TEX / f"{key}.png"
        ax, ay = compute_anchor(sym.get("bounds"))
        pack_jobs.append({
            "key": key,
            "inputs": [str(p) for p in sampled],
            "out": str(out_png),
            "frameCount": len(sampled),
            "anchorX": ax,
            "anchorY": ay,
        })

    # Explosion VFX strip
    exp_dir = find_exported_dir(RAW_DIR / "vfx", exp_sym["characterId"])
    if exp_dir:
        all_pngs = sorted(exp_dir.glob("*.png"), key=lambda p: int(p.stem))
        target_n = min(9, len(all_pngs))
        idxs = [round(i * (len(all_pngs) - 1) / (target_n - 1)) for i in range(target_n)]
        sampled = [all_pngs[i] for i in idxs]
        key = "vfx/explosion"
        pack_jobs.append({
            "key": key,
            "inputs": [str(p) for p in sampled],
            "out": str(OUT_TEX / f"{key}.png"),
            "frameCount": len(sampled),
            "anchorX": 0.5,
            "anchorY": 0.35,
        })

    completed = pack_strips_with_sharp(pack_jobs)
    for job in completed:
        manifest_entries[job["key"]] = {
            "path": f"textures/{job['key']}",
            "width": job["frameWidth"] * job["frameCount"],
            "height": job["frameHeight"],
            "frameWidth": job["frameWidth"],
            "frameHeight": job["frameHeight"],
            "frameCount": job["frameCount"],
            "anchorX": job["anchorX"],
            "anchorY": job["anchorY"],
        }

    # Copy audio
    audio_manifest = {}
    for src_name, dst_name in AUDIO_MAP.items():
        src = SOUNDS_DIR / src_name
        if not src.exists():
            raise RuntimeError(f"Missing exported sound: {src}")
        shutil.copy2(src, OUT_AUDIO / dst_name)
        key = Path(dst_name).stem
        audio_manifest[key] = f"audio/{key}"

    # Write TypeScript AssetManifest
    MANIFEST_TS.parent.mkdir(parents=True, exist_ok=True)
    ts_body = (
        "// Auto-generated by scripts/export-phase1-assets.py from flash/3986.swf\n"
        "export interface SpriteAssetEntry {\n"
        "  path: string;\n"
        "  width: number;\n"
        "  height: number;\n"
        "  frameWidth: number;\n"
        "  frameHeight: number;\n"
        "  frameCount: number;\n"
        "  anchorX: number;\n"
        "  anchorY: number;\n"
        "  flashBounds?: { xmin: number; xmax: number; ymin: number; ymax: number; width: number; height: number };\n"
        "}\n\n"
        f"export const SPRITE_MANIFEST: Record<string, SpriteAssetEntry> = {json.dumps(manifest_entries, indent=2)};\n\n"
        f"export const AUDIO_MANIFEST: Record<string, string> = {json.dumps(audio_manifest, indent=2)};\n"
    )
    MANIFEST_TS.write_text(ts_body, encoding="utf-8")
    print(f"Exported {len(manifest_entries)} sprite/strip textures, {len(audio_manifest)} audio clips -> {MANIFEST_TS}")


if __name__ == "__main__":
    main()
