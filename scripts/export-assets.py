#!/usr/bin/env python3
"""
Reproducible Phase 1+2 Asset Exporter for Takeover (flash/3986.swf) -> COCOS 4 (game/assets/resources).
Uses JPEXS FFDec CLI for vector->PNG rasterization and Node/sharp for horizontal spritesheet packing.
Zero third-party portal branding (ArmorGames/Newgrounds/Playtomic/MochiBot) is exported.
"""
import json
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
RAW_DIR = ROOT / "decompiled" / "raw_export_p3"
OUT_RES = ROOT / "game" / "assets" / "resources"
OUT_TEX = OUT_RES / "textures"
OUT_AUDIO = OUT_RES / "audio"
MANIFEST_TS = ROOT / "game" / "assets" / "scripts" / "data" / "AssetManifest.ts"

SHAPE_EXPORTS = {
    "ui/title_bg": {"cid": 2664, "zoom": 1.5},
}

STATIC_SPRITES = {
    # UI
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
    # Map Helpers
    "map/build_site": {"symbol": "BuildHereTopClass", "zoom": 1.5},
    "map/chest": {"symbol": "ChestClass", "zoom": 1.5, "frame": 1},
    # Avatar light overlays
    "vfx/avatar_front": {"symbol": "AvatarFrontLightEffectClass", "zoom": 1.5, "frame": 1},
    "vfx/avatar_back": {"symbol": "AvatarBackLightEffectClass", "zoom": 1.5, "frame": 1},
    # Westaria Unit Portrait Icons (T1-T3 + Avatar)
    "icons/unit_w_infantry": {"symbol": "IconT1_W_InfantryClass", "zoom": 1.5},
    "icons/unit_w_infantry2": {"symbol": "IconT2_W_InfantryClass", "zoom": 1.5},
    "icons/unit_w_infantry3": {"symbol": "IconT3_W_InfantryClass", "zoom": 1.5},
    "icons/unit_w_archers": {"symbol": "IconT1_W_ArchersClass", "zoom": 1.5},
    "icons/unit_w_archers2": {"symbol": "IconT2_W_ArchersClass", "zoom": 1.5},
    "icons/unit_w_cavalry": {"symbol": "IconT1_W_CavalryClass", "zoom": 1.5},
    "icons/unit_w_cavalry2": {"symbol": "IconT2_W_CavalryClass", "zoom": 1.5},
    "icons/unit_w_magic": {"symbol": "IconT1_W_MagicClass", "zoom": 1.5},
    "icons/unit_w_magic2": {"symbol": "IconT2_W_MagicClass", "zoom": 1.5},
    "icons/unit_w_magic3": {"symbol": "IconT3_W_MagicClass", "zoom": 1.5},
    "icons/unit_w_siege": {"symbol": "IconT1_W_SiegeClass", "zoom": 1.5},
    # Khaganate Unit Portrait Icons
    "icons/unit_k_infantry": {"symbol": "IconT1_K_InfantryClass", "zoom": 1.5},
    "icons/unit_k_infantry2": {"symbol": "IconT2_K_InfantryClass", "zoom": 1.5},
    "icons/unit_k_archers": {"symbol": "IconT1_K_ArchersClass", "zoom": 1.5},
    "icons/unit_k_archers2": {"symbol": "IconT2_K_ArchersClass", "zoom": 1.5},
    "icons/unit_k_cavalry": {"symbol": "IconT1_K_CavalryClass", "zoom": 1.5},
    "icons/unit_k_cavalry2": {"symbol": "IconT2_K_CavalryClass", "zoom": 1.5},
    "icons/unit_k_cavalry3": {"symbol": "IconT3_K_CavalryClass", "zoom": 1.5},
    "icons/unit_k_magic": {"symbol": "IconT1_K_MagicClass", "zoom": 1.5},
    "icons/unit_k_siege": {"symbol": "IconT1_K_SiegeClass", "zoom": 1.5},
    "icons/unit_k_siege2": {"symbol": "IconT2_K_SiegeClass", "zoom": 1.5},
    # Cult Unit Portrait Icons
    "icons/unit_b_infantry": {"symbol": "IconT1_B_InfantryClass", "zoom": 1.5},
    "icons/unit_b_infantry2": {"symbol": "IconT2_B_InfantryClass", "zoom": 1.5},
    "icons/unit_b_archers": {"symbol": "IconT1_B_ArchersClass", "zoom": 1.5},
    "icons/unit_b_archers2": {"symbol": "IconT2_B_ArchersClass", "zoom": 1.5},
    "icons/unit_b_archers3": {"symbol": "IconT3_B_ArchersClass", "zoom": 1.5},
    "icons/unit_b_cavalry": {"symbol": "IconT1_B_CavalryClass", "zoom": 1.5},
    "icons/unit_b_cavalry2": {"symbol": "IconT2_B_CavalryClass", "zoom": 1.5},
    "icons/unit_b_magic": {"symbol": "IconT1_B_MagicClass", "zoom": 1.5},
    "icons/unit_b_magic2": {"symbol": "IconT2_B_MagicClass", "zoom": 1.5},
    "icons/unit_b_siege": {"symbol": "IconT1_B_SiegeClass", "zoom": 1.5},
    # Enemy Icons (reference)
    "icons/unit_e_infantry": {"symbol": "IconT1_E_InfantryClass", "zoom": 1.5},
    "icons/unit_e_archers": {"symbol": "IconT1_E_ArchersClass", "zoom": 1.5},
}

# Add all 24 Level Backgrounds (Westaria 1..8, Khaganate 11..18, Cult 21..28)
for lv in list(range(1, 9)) + list(range(11, 19)) + list(range(21, 29)):
    STATIC_SPRITES[f"map/level{lv}_bg"] = {"symbol": f"Level{lv}Class", "zoom": 1.5}

# Add Buildings for all 4 faction colors
FACTION_COLORS = [
    ("green", "Green"),
    ("purple", "Purple"),
    ("red", "Red"),
    ("blue", "Blue"),
]
for col_low, col_cap in FACTION_COLORS:
    STATIC_SPRITES[f"buildings/castle_{col_low}"] = {"symbol": f"Castle{col_cap}Class", "zoom": 1.5}
    STATIC_SPRITES[f"buildings/castle_{col_low}_raze"] = {"symbol": f"Castle{col_cap}RazeClass", "zoom": 1.5}
    STATIC_SPRITES[f"buildings/town_{col_low}"] = {"symbol": f"Town{col_cap}Class", "zoom": 1.5}
    STATIC_SPRITES[f"buildings/town_{col_low}_raze"] = {"symbol": f"Town{col_cap}RazeClass", "zoom": 1.5}
    STATIC_SPRITES[f"buildings/camp_{col_low}"] = {"symbol": f"Warcamp{col_cap}Class", "zoom": 1.5}
    STATIC_SPRITES[f"buildings/camp_{col_low}_raze"] = {"symbol": f"Warcamp{col_cap}RazeClass", "zoom": 1.5, "frame": 1}
    STATIC_SPRITES[f"buildings/magictower_{col_low}"] = {"symbol": f"MageTower{col_cap}Class", "zoom": 1.5}
    STATIC_SPRITES[f"buildings/magictower_{col_low}_raze"] = {"symbol": f"MageTower{col_cap}RazedClass", "zoom": 1.5, "frame": 1}
    STATIC_SPRITES[f"buildings/village_{col_low}"] = {"symbol": f"Village{col_cap}Class", "zoom": 1.5, "frame": 1}
    STATIC_SPRITES[f"buildings/mine_{col_low}"] = {"symbol": f"Mine{col_cap}Class", "zoom": 1.5, "frame": 1}
    STATIC_SPRITES[f"buildings/obelisk_{col_low}"] = {"symbol": f"Obelisk{col_cap}Class", "zoom": 1.5, "frame": 1}

SPELL_ICON_FRAMES = {
    1: "icons/spell_lords_judgement",
    2: "icons/spell_banner_consecration",
    3: "icons/spell_banner_heroism",
    4: "icons/spell_sign_of_advent",
    5: "icons/spell_summon_stoneworms",
    6: "icons/spell_disentomb",
    7: "icons/spell_banner_bloodlust",
    8: "icons/spell_cataclysm",
    9: "icons/spell_ice_blast",
    10: "icons/spell_frost_enchantment",
    11: "icons/spell_banner_liberation",
    12: "icons/spell_grand_transformation",
}

UNIT_SETS = [
    # Westaria (Green)
    ("w_infantry", "GreenInfantry"),
    ("w_infantry2", "GreenInfantry2"),
    ("w_infantry3", "GreenInfantry3"),
    ("w_archers", "GreenArchers"),
    ("w_archers2", "GreenArchers2"),
    ("w_cavalry", "GreenCavalry"),
    ("w_cavalry2", "GreenCavalry2"),
    ("w_magic", "GreenMagic"),
    ("w_magic2", "GreenMagic2"),
    ("w_avatar", "GreenMagic3"),
    ("w_siege", "GreenSiege"),
    # TheEmpire (Purple)
    ("e_infantry", "PurpleInfantry"),
    ("e_infantry2", "PurpleInfantry2"),
    ("e_archers", "PurpleArchers"),
    ("e_archers2", "PurpleArchers2"),
    ("e_cavalry", "PurpleCavalry"),
    ("e_cavalry2", "PurpleCavalry2"),
    ("e_magic", "PurpleMagic"),
    ("e_magic2", "PurpleMagic2"),
    ("e_siege", "PurpleSiege"),
    ("e_siege2", "PurpleSiege2"),
    # TheKhaganate (Red)
    ("k_infantry", "RedInfantry"),
    ("k_infantry2", "RedInfantry2"),
    ("k_archers", "RedArchers"),
    ("k_archers2", "RedArchers2"),
    ("k_cavalry", "RedCavalry"),
    ("k_cavalry2", "RedCavalry2"),
    ("k_cavalry3", "RedCavalry3"),
    ("k_magic", "RedMagic"),
    ("k_siege", "RedSiege"),
    ("k_siege2", "RedSiege2"),
    # TheCult (Blue)
    ("b_infantry", "BlueInfantry"),
    ("b_infantry2", "BlueInfantry2"),
    ("b_archers", "BlueArchers"),
    ("b_archers2", "BlueArchers2"),
    ("b_archers3", "BlueArchers3"),
    ("b_cavalry", "BlueCavalry"),
    ("b_cavalry2", "BlueCavalry2"),
    ("b_magic", "BlueMagic"),
    ("b_magic2", "BlueMagic2"),
    ("b_siege", "BlueSiege"),
    # Bandits (Gray)
    ("n_ogre", "GrayMagic"),
]

DIRECTIONS = ["Down", "Left", "Right", "Up"]
PHASES = ["Go", "Attack"]

VFX_STRIPS = [
    ("vfx/explosion", "ExplosionClass", 9, 0.5, 0.35),
    ("vfx/spell_thunder", "SpellThunderClass", 8, 0.5, 0.15),
    ("vfx/sign_of_advent", "SignOfAdventEffectClass", 9, 0.5, 0.2),
    ("vfx/banner_heal", "BannerHealClass", 6, 0.5, 0.15),
    ("vfx/banner_aura_heal", "BannerAuraHealClass", 8, 0.5, 0.5),
    ("vfx/banner_heroism", "BannerHeroismClass", 6, 0.5, 0.15),
    ("vfx/banner_aura_heroism", "BannerAuraHeroismClass", 8, 0.5, 0.5),
    ("vfx/banner_bloodlust", "BannerBloodlustClass", 6, 0.5, 0.15),
    ("vfx/banner_aura_bloodlust", "BannerEffectBloodlustClass", 8, 0.5, 0.5),
    ("vfx/banner_liberation", "BannerLiberationClass", 6, 0.5, 0.15),
    ("vfx/banner_aura_liberation", "BannerLiberationEffectClass", 8, 0.5, 0.5),
    ("vfx/banner_desecration", "BannerDesecrationClass", 6, 0.5, 0.15),
    ("vfx/banner_aura_desecration", "BannerAuraDesecrationClass", 8, 0.5, 0.5),
    ("vfx/stoneworms", "StoneWormsEffectClass", 9, 0.5, 0.25),
    ("vfx/ice_blast", "IceBlastExplosionClass", 8, 0.5, 0.3),
    ("vfx/frost_enchant", "FrostEncahntmentEffectClass", 8, 0.5, 0.4),
    ("vfx/grand_transform", "GrandTransformationEffectClass", 9, 0.5, 0.35),
    ("vfx/raise_dead", "RaiseDeadSpellEffectClass", 8, 0.5, 0.25),
    ("vfx/terror_splash", "TerrorSplashEffectClass", 8, 0.5, 0.35),
]

AUDIO_MAP = {
    "8352_musicMenuClass_musicMenuClass.mp3": "music_menu.mp3",
    "2978_musicGameplayClass_musicGameplayClass.mp3": "music_battle.mp3",
    "7256_sndButtonClick_sndButtonClick.mp3": "ui_click.mp3",
    "8180_sndButtonOver_sndButtonOver.mp3": "ui_hover.mp3",
    "5368_sndSendSoldiers_sndSendSoldiers.mp3": "send_soldiers.mp3",
    "2495_sndSendHorses_sndSendHorses.mp3": "send_horses.mp3",
    "1722_sndSendSiege_sndSendSiege.mp3": "send_siege.mp3",
    "6056_sndSendBots_sndSendBots.mp3": "send_bots.mp3",
    "7763_sndSendReptiles_sndSendReptiles.mp3": "send_reptiles.mp3",
    "5638_sndAttackSword1_sndAttackSword1.mp3": "attack_sword.mp3",
    "6895_sndAttackBow1_sndAttackBow1.mp3": "attack_bow.mp3",
    "7616_sndHitArrow1_sndHitArrow1.mp3": "hit_arrow.mp3",
    "7442_sndAttackSiege_sndAttackSiege.mp3": "attack_siege.mp3",
    "7667_sndAttackOgre_sndAttackOgre.mp3": "attack_ogre.mp3",
    "7019_sndAttackMagic1_sndAttackMagic1.mp3": "attack_magic.mp3",
    "6012_sndAttackGun1_sndAttackGun1.mp3": "attack_gun.mp3",
    "3258_sndBuildFarm_sndBuildFarm.mp3": "build_farm.mp3",
    "5602_sndBuildMine_sndBuildMine.mp3": "build_mine.mp3",
    "5331_sndBuildObelisk_sndBuildObelisk.mp3": "build_obelisk.mp3",
    "6055_sndBuildGraveyard_sndBuildGraveyard.mp3": "build_graveyard.mp3",
    "6251_sndDestructionStronghold_sndDestructionStronghold.mp3": "capture_stronghold.mp3",
    "7373_sndDeadMan1_sndDeadMan1.mp3": "dead_man.mp3",
    "3271_sndDeadUndead1_sndDeadUndead1.mp3": "dead_undead.mp3",
    "3041_sndDeadHorse1_sndDeadHorse1.mp3": "dead_horse.mp3",
    "6960_sndDeadSiege_sndDeadSiege.mp3": "dead_siege.mp3",
    "974_sndDeadOgre_sndDeadOgre.mp3": "dead_ogre.mp3",
    "7678_sndDeadBot_sndDeadBot.mp3": "dead_bot.mp3",
    "8336_sndDeadReptile_sndDeadReptile.mp3": "dead_reptile.mp3",
    "5772_sndSpellLordsJudgement_sndSpellLordsJudgement.mp3": "spell_lords_judgement.mp3",
    "7894_sndSpellSummonStoneworms_sndSpellSummonStoneworms.mp3": "spell_stoneworms.mp3",
    "4219_sndSpellDisentomb_sndSpellDisentomb.mp3": "spell_disentomb.mp3",
    "6252_sndUltimateDeclareCataclysm_sndUltimateDeclareCataclysm.mp3": "ultimate_cataclysm.mp3",
    "1431_sndSpellIceBlast_sndSpellIceBlast.mp3": "spell_ice_blast.mp3",
    "7555_sndSpellFrostEnchantment_sndSpellFrostEnchantment.mp3": "spell_frost_enchant.mp3",
    "3265_sndUltimateDeclareTransformation_sndUltimateDeclareTransformation.mp3": "ultimate_transformation.mp3",
    "5674_sndSpellTerror_sndSpellTerror.mp3": "spell_terror.mp3",
    "2962_sndUltimateDeclareUndead_sndUltimateDeclareUndead.mp3": "ultimate_undead.mp3",
    "1668_sndUnitFrozen_sndUnitFrozen.mp3": "unit_frozen.mp3",
    "4039_sndUnitFeared_sndUnitFeared.mp3": "unit_feared.mp3",
    "5386_sndSquadLevelUp_sndSquadLevelUp.mp3": "squad_level_up.mp3",
    "2942_sndBannerSet_sndBannerSet.mp3": "banner_set.mp3",
    "1947_sndBannerRemove_sndBannerRemove.mp3": "banner_remove.mp3",
    "3576_sndUnitHeroic_sndUnitHeroic.mp3": "unit_heroic.mp3",
    "3622_sndUltimateDeclareAvatar_sndUltimateDeclareAvatar.mp3": "ultimate_avatar.mp3",
    "4087_sndChestOpen_sndChestOpen.mp3": "chest_open.mp3",
    "4428_sndChestGold_sndChestGold.mp3": "chest_gold.mp3",
}


def png_size(path: Path):
    data = path.read_bytes()
    return struct.unpack(">II", data[16:24])


def run_ffdec(kind: str, cids: list[int], zoom: float, out_dir: Path, frames: str | None = None):
    out_dir.mkdir(parents=True, exist_ok=True)
    # Chunk large cid lists just in case Windows command line gets long
    uniq = sorted(set(cids))
    chunk_size = 80
    for i in range(0, len(uniq), chunk_size):
        chunk = uniq[i : i + chunk_size]
        cmd = [
            str(JAVA_EXE), "-jar", str(FFDEC_JAR),
            "-selectid", ",".join(str(c) for c in chunk),
            "-zoom", str(zoom),
            "-format", f"{kind}:png",
        ]
        if frames:
            cmd.extend(["-select", frames])
        cmd.extend(["-export", kind, str(out_dir), str(SWF_PATH)])
        print("Running:", " ".join(cmd[:6]), f"... ({len(chunk)} cids)")
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
    if not jobs:
        return []
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
    if not reuse_raw and RAW_DIR.exists():
        shutil.rmtree(RAW_DIR)
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    OUT_TEX.mkdir(parents=True, exist_ok=True)
    OUT_AUDIO.mkdir(parents=True, exist_ok=True)

    # 1. Shapes
    shape_cids = [v["cid"] for v in SHAPE_EXPORTS.values()]
    if not (reuse_raw and (RAW_DIR / "shapes").exists()):
        run_ffdec("shape", shape_cids, 1.5, RAW_DIR / "shapes")

    # 2. Static Sprites (frame 1)
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

    # 2b. Spell Icons (frames 1..12 of SpellIconSetClass cid=6485)
    spell_icon_cid = symbols["SpellIconSetClass"]["characterId"]
    spell_icon_dir = RAW_DIR / "spell_icons"
    if not (reuse_raw and spell_icon_dir.exists()):
        run_ffdec("sprite", [spell_icon_cid], 1.5, spell_icon_dir, frames="1-12")

    # 2c. Rivadis Campaign World Map (frames 1..27 of cid=8465 at zoom 1.25 -> 1000x750)
    cmap_dir = RAW_DIR / "campaign_maps"
    if not (reuse_raw and cmap_dir.exists()):
        run_ffdec("sprite", [8465], 1.25, cmap_dir, frames="1-27")

    # 3. Units at zoom 1.75
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
        die_name = f"{sym_prefix}Down_Die"
        if die_name in symbols:
            sym = symbols[die_name]
            unit_cids.append(sym["characterId"])
            unit_jobs_meta.append((unit_key, "die", sym))

    unit_dir = RAW_DIR / "units"
    if not (reuse_raw and unit_dir.exists()):
        run_ffdec("sprite", unit_cids, 1.75, unit_dir)

    # 4. VFX Strips at zoom 1.5
    vfx_cids = [symbols[sym_name]["characterId"] for _, sym_name, _, _, _ in VFX_STRIPS]
    vfx_dir = RAW_DIR / "vfx"
    if not (reuse_raw and vfx_dir.exists()):
        run_ffdec("sprite", vfx_cids, 1.5, vfx_dir)

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
            if re_match_level := (key.startswith("map/level") and key.endswith("_bg")):
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
                preserve_anchor = key.startswith("buildings/") or key in ("map/build_site", "map/chest")
                manifest_entries[key] = {
                    "path": f"textures/{key}",
                    "width": w,
                    "height": h,
                    "frameWidth": w,
                    "frameHeight": h,
                    "frameCount": 1,
                    "anchorX": ax if preserve_anchor else 0.5,
                    "anchorY": ay if preserve_anchor else 0.5,
                }

    # Copy spell icons
    sicon_dir = find_exported_dir(spell_icon_dir, spell_icon_cid)
    if not sicon_dir:
        raise RuntimeError("Missing SpellIconSetClass export")
    for frame_num, key in SPELL_ICON_FRAMES.items():
        src = sicon_dir / f"{frame_num}.png"
        if not src.exists():
            raise RuntimeError(f"Missing frame {frame_num} in SpellIconSetClass")
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

    # Copy Rivadis Campaign Map progression frames 1..27 (plus map/campaign_map compat = frame 1)
    cm_sdir = find_exported_dir(cmap_dir, 8465)
    if not cm_sdir:
        raise RuntimeError("Missing campaign_maps cid=8465 export")
    for fnum in range(1, 28):
        src = cm_sdir / f"{fnum}.png"
        if not src.exists():
            raise RuntimeError(f"Missing frame {fnum} in campaign_map cid=8465")
        key = f"map/campaign_map_{fnum}"
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
        if fnum == 1:
            compat_dst = OUT_TEX / "map/campaign_map.png"
            shutil.copy2(src, compat_dst)
            manifest_entries["map/campaign_map"] = {
                "path": "textures/map/campaign_map",
                "width": w,
                "height": h,
                "frameWidth": w,
                "frameHeight": h,
                "frameCount": 1,
                "anchorX": 0.5,
                "anchorY": 0.5,
            }

    # Pack unit strips
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
        ax, ay = compute_anchor(sym.get("bounds"))
        pack_jobs.append({
            "key": key,
            "inputs": [str(p) for p in sampled],
            "out": str(OUT_TEX / f"{key}.png"),
            "frameCount": len(sampled),
            "anchorX": ax,
            "anchorY": ay,
        })

    # Pack VFX strips
    for key, sym_name, max_frames, ax, ay in VFX_STRIPS:
        sym = symbols[sym_name]
        vdir_one = find_exported_dir(vfx_dir, sym["characterId"])
        if not vdir_one:
            raise RuntimeError(f"Missing VFX export: {sym_name}")
        all_pngs = sorted(vdir_one.glob("*.png"), key=lambda p: int(p.stem))
        target_n = min(max_frames, len(all_pngs))
        if target_n <= 1:
            sampled = all_pngs
        else:
            idxs = [round(i * (len(all_pngs) - 1) / (target_n - 1)) for i in range(target_n)]
            sampled = [all_pngs[i] for i in idxs]
        pack_jobs.append({
            "key": key,
            "inputs": [str(p) for p in sampled],
            "out": str(OUT_TEX / f"{key}.png"),
            "frameCount": len(sampled),
            "anchorX": ax,
            "anchorY": ay,
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

    MANIFEST_TS.parent.mkdir(parents=True, exist_ok=True)
    ts_body = (
        "// Auto-generated by scripts/export-assets.py from flash/3986.swf\n"
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
