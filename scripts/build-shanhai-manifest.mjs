#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const GAME_ASSETS = path.join(ROOT, 'game', 'assets');
const OUT_DIR = path.join(ROOT, 'docs', 'shanhai');
const AUDIO_REPORT_PATH = path.join(OUT_DIR, '.audio-synth-report.json');
const CREATED_AT = '2026-11-27';

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function walkAssetFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkAssetFiles(full, out);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (ext === '.png' || ext === '.mp3') {
        out.push(full);
      }
    }
  }
  return out;
}

const FACTION_MAP = {
  Westaria: {
    legacy_id: 'Westaria',
    legacy_color: 'green',
    new_id: 'human',
    new_name_zh: '九州人皇',
    primary_color_zh: '朱红',
    secondary_colors_zh: ['暗金', '玄铁'],
    materials_zh: ['铁甲', '皮革', '青铜', '漆木', '织物'],
    design_keywords_zh: ['秩序', '军纪', '工艺', '守城', '军阵'],
    playable: true,
    campaign_bundle: 'bundle_westaria',
    target_campaign_bundle_role: 'campaign_human',
  },
  TheCult: {
    legacy_id: 'TheCult',
    legacy_color: 'blue',
    new_id: 'celestial',
    new_name_zh: '昆仑神庭',
    primary_color_zh: '玉白',
    secondary_colors_zh: ['霜蓝', '天金'],
    materials_zh: ['白玉', '青铜', '丝绸', '半透明晶体'],
    design_keywords_zh: ['秩序', '神性', '雷霆', '寒霜', '符文'],
    playable: true,
    campaign_bundle: 'bundle_cult',
    target_campaign_bundle_role: 'campaign_celestial',
  },
  TheKhaganate: {
    legacy_id: 'TheKhaganate',
    legacy_color: 'red',
    new_id: 'beast',
    new_name_zh: '九黎妖盟',
    primary_color_zh: '苍绿',
    secondary_colors_zh: ['赤褐', '古铜'],
    materials_zh: ['木材', '兽骨', '皮革', '石材', '青铜'],
    design_keywords_zh: ['野性', '部族', '异兽', '图腾', '山林'],
    playable: true,
    campaign_bundle: 'bundle_khaganate',
    target_campaign_bundle_role: 'campaign_beast',
  },
  TheEmpire: {
    legacy_id: 'TheEmpire',
    legacy_color: 'purple',
    new_id: 'chaos',
    new_name_zh: '混沌',
    primary_color_zh: '幽黑',
    secondary_colors_zh: ['暗紫', '血红'],
    materials_zh: ['黑曜石', '腐化石材', '裂纹骨甲', '异化组织'],
    design_keywords_zh: ['扭曲', '裂隙', '侵蚀', '不稳定'],
    playable: false,
    campaign_bundle: null,
    target_campaign_bundle_role: 'hostile_ai_and_boss',
  },
};

const COLOR_TO_FACTION = {
  green: 'human',
  blue: 'celestial',
  red: 'beast',
  purple: 'chaos',
};

const BUILDING_TYPE_MAP = {
  castle: {
    new_kind: 'castle',
    names_zh: { human: '镇国城', celestial: '昆仑神宫', beast: '万妖寨', chaos: '裂隙魔殿' },
  },
  town: {
    new_kind: 'town',
    names_zh: { human: '郡城', celestial: '灵台', beast: '妖族聚落', chaos: '蚀魂聚落' },
  },
  camp: {
    new_kind: 'barracks',
    names_zh: { human: '军营', celestial: '天兵殿', beast: '兽穴', chaos: '裂隙兵巢' },
  },
  magictower: {
    new_kind: 'sanctum',
    names_zh: { human: '镇灵台', celestial: '聚灵塔', beast: '血灵祭坛', chaos: '混沌巫坛' },
  },
  village: {
    new_kind: 'granary',
    names_zh: { human: '粮仓', celestial: '仙苑灵圃', beast: '猎场', chaos: '枯骨荒冢' },
  },
  mine: {
    new_kind: 'mine',
    names_zh: { human: '金铢矿场', celestial: '玉矿秘窟', beast: '赤铜矿洞', chaos: '黑曜矿坑' },
  },
  obelisk: {
    new_kind: 'obelisk',
    names_zh: { human: '玄息碑', celestial: '镇界碑', beast: '图腾柱', chaos: '裂隙方尖碑' },
  },
};

// All 42 sprite prefixes in game/assets/bundles/bundle_gameplay/textures/units
const UNIT_DIR_MAP = {
  // Human (w_*)
  w_infantry: { new_slug: 'human_infantry_iron_guard', faction: 'human', cls: 'infantry', name_zh: '铁甲卫', phase: 'B' },
  w_infantry2: { new_slug: 'human_infantry_xuanjia_guard', faction: 'human', cls: 'infantry', name_zh: '玄甲卫', phase: 'C' },
  w_infantry3: { new_slug: 'human_infantry_imperial_halberdier', faction: 'human', cls: 'infantry', name_zh: '禁军玄甲将', phase: 'C' },
  w_archers: { new_slug: 'human_ranged_crossbowman', faction: 'human', cls: 'ranged', name_zh: '弩兵', phase: 'B' },
  w_archers2: { new_slug: 'human_ranged_divine_crossbow', faction: 'human', cls: 'ranged', name_zh: '神机弩手', phase: 'C' },
  w_cavalry: { new_slug: 'human_cavalry_yulin_rider', faction: 'human', cls: 'cavalry', name_zh: '羽林骑', phase: 'C' },
  w_cavalry2: { new_slug: 'human_cavalry_huben_cataphract', faction: 'human', cls: 'cavalry', name_zh: '虎贲铁骑', phase: 'C' },
  w_magic: { new_slug: 'human_support_strategist', faction: 'human', cls: 'support', name_zh: '军阵师', phase: 'C' },
  w_magic2: { new_slug: 'human_support_tiance_advisor', faction: 'human', cls: 'support', name_zh: '天策军师', phase: 'C' },
  w_avatar: { new_slug: 'human_ultimate_sovereign_avatar', faction: 'human', cls: 'support', name_zh: '人皇法相', phase: 'C' },
  w_siege: { new_slug: 'human_siege_trebuchet', faction: 'human', cls: 'siege', name_zh: '投石车', phase: 'C' },

  // Celestial (b_*)
  b_infantry: { new_slug: 'celestial_infantry_heavenly_soldier', faction: 'celestial', cls: 'infantry', name_zh: '天兵', phase: 'B' },
  b_infantry2: { new_slug: 'celestial_infantry_jade_warden', faction: 'celestial', cls: 'infantry', name_zh: '玉甲天卫', phase: 'C' },
  b_archers: { new_slug: 'celestial_ranged_spirit_archer', faction: 'celestial', cls: 'ranged', name_zh: '灵弓使', phase: 'C' },
  b_archers2: { new_slug: 'celestial_ranged_star_marksman', faction: 'celestial', cls: 'ranged', name_zh: '星辰射手', phase: 'C' },
  b_archers3: { new_slug: 'celestial_ranged_celestial_sentinel', faction: 'celestial', cls: 'ranged', name_zh: '司辰神机偶', phase: 'C' },
  b_cavalry: { new_slug: 'celestial_cavalry_cloud_rider', faction: 'celestial', cls: 'cavalry', name_zh: '云骑', phase: 'C' },
  b_cavalry2: { new_slug: 'celestial_cavalry_tianma_knight', faction: 'celestial', cls: 'cavalry', name_zh: '天马神骑', phase: 'C' },
  b_magic: { new_slug: 'celestial_support_spirit_tamer', faction: 'celestial', cls: 'support', name_zh: '御灵师', phase: 'C' },
  b_magic2: { new_slug: 'celestial_support_thunder_master', faction: 'celestial', cls: 'support', name_zh: '雷法天师', phase: 'C' },
  b_siege: { new_slug: 'celestial_siege_rune_golem', faction: 'celestial', cls: 'siege', name_zh: '符文傀儡', phase: 'C' },

  // Beast (k_*)
  k_infantry: { new_slug: 'beast_infantry_mandrill_warrior', faction: 'beast', cls: 'infantry', name_zh: '山魈战士', phase: 'B' },
  k_infantry2: { new_slug: 'beast_infantry_tiger_soul_champion', faction: 'beast', cls: 'infantry', name_zh: '虎魄战将', phase: 'C' },
  k_archers: { new_slug: 'beast_ranged_venom_feather', faction: 'beast', cls: 'ranged', name_zh: '毒羽妖', phase: 'C' },
  k_archers2: { new_slug: 'beast_ranged_wind_plume_guard', faction: 'beast', cls: 'ranged', name_zh: '风翎妖卫', phase: 'C' },
  k_cavalry: { new_slug: 'beast_cavalry_wolf_rider', faction: 'beast', cls: 'cavalry', name_zh: '狼骑兵', phase: 'C' },
  k_cavalry2: { new_slug: 'beast_cavalry_crimson_flame_beast', faction: 'beast', cls: 'cavalry', name_zh: '赤焰兽骑', phase: 'C' },
  k_cavalry3: { new_slug: 'beast_cavalry_ancient_totem_rider', faction: 'beast', cls: 'cavalry', name_zh: '太古战兽骑', phase: 'C' },
  k_magic: { new_slug: 'beast_support_fox_shaman', faction: 'beast', cls: 'support', name_zh: '狐灵祭司', phase: 'C' },
  k_siege: { new_slug: 'beast_siege_great_horn_behemoth', faction: 'beast', cls: 'siege', name_zh: '巨角兽', phase: 'C' },
  k_siege2: { new_slug: 'beast_siege_mountain_colossus', faction: 'beast', cls: 'siege', name_zh: '山岳巨兽', phase: 'C' },

  // Chaos (e_*)
  e_infantry: { new_slug: 'chaos_infantry_soul_corroder', faction: 'chaos', cls: 'infantry', name_zh: '蚀魂兵', phase: 'B' },
  e_infantry2: { new_slug: 'chaos_infantry_abyss_thrall', faction: 'chaos', cls: 'infantry', name_zh: '深渊腐卒', phase: 'C' },
  e_archers: { new_slug: 'chaos_ranged_nether_marksman', faction: 'chaos', cls: 'ranged', name_zh: '幽冥射手', phase: 'B' },
  e_archers2: { new_slug: 'chaos_ranged_rift_bone_archer', faction: 'chaos', cls: 'ranged', name_zh: '裂隙骨弓手', phase: 'C' },
  e_cavalry: { new_slug: 'chaos_cavalry_bone_beast_rider', faction: 'chaos', cls: 'cavalry', name_zh: '冥骨兽骑', phase: 'C' },
  e_cavalry2: { new_slug: 'chaos_cavalry_abyss_dread_rider', faction: 'chaos', cls: 'cavalry', name_zh: '冥渊魔骑', phase: 'C' },
  e_magic: { new_slug: 'chaos_support_chaos_warlock', faction: 'chaos', cls: 'support', name_zh: '混沌巫使', phase: 'C' },
  e_magic2: { new_slug: 'chaos_support_rift_wraith', faction: 'chaos', cls: 'support', name_zh: '天裂鬼魅', phase: 'C' },
  e_siege: { new_slug: 'chaos_siege_abyss_catapult', faction: 'chaos', cls: 'siege', name_zh: '深渊巨兽', phase: 'C' },
  e_siege2: { new_slug: 'chaos_siege_corrupted_juggernaut', faction: 'chaos', cls: 'siege', name_zh: '混沌灭城兽', phase: 'C' },

  // Neutral / Boss
  n_ogre: { new_slug: 'neutral_boss_taotie_brute', faction: 'chaos', cls: 'boss', name_zh: '饕餮凶兽', phase: 'C' },
};

const SPELL_MAP = {
  lords_judgement: { new_id: 'skill_human_rain_of_arrows', faction: 'human', name_zh: '万弩齐发', phase: 'B' },
  banner_consecration: { new_id: 'skill_human_iron_wall', faction: 'human', name_zh: '铁壁军阵', phase: 'B' },
  banner_heroism: { new_id: 'skill_human_war_drums', faction: 'human', name_zh: '战鼓振军', phase: 'B' },
  sign_of_advent: { new_id: 'skill_human_sovereign_decree', faction: 'human', name_zh: '人皇御令', phase: 'B' },

  ice_blast: { new_id: 'skill_celestial_frost_seal', faction: 'celestial', name_zh: '寒天封灵', phase: 'C' },
  frost_enchantment: { new_id: 'skill_celestial_aegis', faction: 'celestial', name_zh: '天罡庇护', phase: 'C' },
  banner_liberation: { new_id: 'skill_celestial_nine_heavens_thunder', faction: 'celestial', name_zh: '九霄落雷', phase: 'C' },
  grand_transformation: { new_id: 'skill_celestial_heavenly_punishment', faction: 'celestial', name_zh: '天罚降世', phase: 'C' },

  summon_stoneworms: { new_slug: 'skill_beast_bone_venom_mist', new_id: 'skill_beast_bone_venom_mist', faction: 'beast', name_zh: '蚀骨毒雾', phase: 'C' },
  disentomb: { new_id: 'skill_beast_spirit_summon', faction: 'beast', name_zh: '妖魂召唤', phase: 'C' },
  banner_bloodlust: { new_id: 'skill_beast_feral_frenzy', faction: 'beast', name_zh: '万兽狂怒', phase: 'C' },
  cataclysm: { new_id: 'skill_beast_wilderness_stampede', faction: 'beast', name_zh: '大荒兽潮', phase: 'C' },

  terror: { new_id: 'skill_chaos_rift_dread', faction: 'chaos', name_zh: '裂隙惊惧', phase: 'C' },
  raise_the_dead: { new_id: 'skill_chaos_soul_corrosion', faction: 'chaos', name_zh: '蚀魂招降', phase: 'C' },
  banner_desecration: { new_id: 'skill_chaos_miasma_altar', faction: 'chaos', name_zh: '混沌污浊阵', phase: 'C' },
  call_of_the_grave: { new_id: 'skill_chaos_abyss_tide', faction: 'chaos', name_zh: '深渊侵蚀', phase: 'C' },
};

const ICON_TO_UNIT_DIR = {
  unit_w_infantry: 'w_infantry',
  unit_w_infantry2: 'w_infantry2',
  unit_w_infantry3: 'w_infantry3',
  unit_w_archers: 'w_archers',
  unit_w_archers2: 'w_archers2',
  unit_w_cavalry: 'w_cavalry',
  unit_w_cavalry2: 'w_cavalry2',
  unit_w_magic: 'w_magic',
  unit_w_magic2: 'w_magic2',
  unit_w_magic3: 'w_avatar',
  unit_w_siege: 'w_siege',
  unit_b_infantry: 'b_infantry',
  unit_b_infantry2: 'b_infantry2',
  unit_b_archers: 'b_archers',
  unit_b_archers2: 'b_archers2',
  unit_b_archers3: 'b_archers3',
  unit_b_cavalry: 'b_cavalry',
  b_cavalry2: 'b_cavalry2',
  unit_b_cavalry2: 'b_cavalry2',
  unit_b_magic: 'b_magic',
  unit_b_magic2: 'b_magic2',
  unit_b_siege: 'b_siege',
  unit_k_infantry: 'k_infantry',
  unit_k_infantry2: 'k_infantry2',
  unit_k_archers: 'k_archers',
  unit_k_archers2: 'k_archers2',
  unit_k_cavalry: 'k_cavalry',
  unit_k_cavalry2: 'k_cavalry2',
  unit_k_cavalry3: 'k_cavalry3',
  unit_k_magic: 'k_magic',
  unit_k_siege: 'k_siege',
  unit_k_siege2: 'k_siege2',
  unit_e_infantry: 'e_infantry',
  unit_e_archers: 'e_archers',
};

const PHASE_A_CONCEPTS = [
  {
    asset_id: 'concept_castle_human',
    name_zh: '九州人皇·镇国城概念图',
    category: 'concept_art',
    faction: 'human',
    status: 'generated',
    file: 'docs/shanhai/concepts/concept_castle_human.png',
    artifact_file: 'C:/Users/htsd/.gemini/antigravity/brain/0d910d08-4ce5-4569-b71d-e0bbc9d67471/concepts/concept_castle_human.png',
    tool: 'ChatGPT 图像生成',
    model: 'ChatGPT Image Generation (external)',
    prompt: 'Eastern Dark Realism isometric 45-degree 3/4 view RTS concept art of ZhenGuo Citadel (九州人皇·镇国城): massive stepped square stone fortress ramparts with grand central stone staircase, multi-tiered bronze-and-dark-timber palatial gatehouse keep with intricate dougong brackets, four corner watchtowers, glowing bronze braziers, matte black-iron parapet shields, weathered vermilion banners with dark-gold trim, isolated on #1c1d22, strictly no text/watermarks.',
    human_edits: ['人工设定构图与Art Bible约束', '外部工具生成并标准化命名', '生成后人工目视检查去字/视角/纯色底质检'],
  },
  {
    asset_id: 'concept_infantry_beast',
    name_zh: '九黎妖盟·山魈战士概念图',
    category: 'concept_art',
    faction: 'beast',
    status: 'generated',
    file: 'docs/shanhai/concepts/concept_infantry_beast.png',
    artifact_file: 'C:/Users/htsd/.gemini/antigravity/brain/0d910d08-4ce5-4569-b71d-e0bbc9d67471/concepts/concept_infantry_beast.png',
    tool: 'ChatGPT 图像生成',
    model: 'ChatGPT Image Generation (external)',
    prompt: 'Eastern Dark Realism 3/4 full-body character concept of Mandrill Mountain Warrior (九黎妖盟·山魈战士): hulking muscular semi-humanoid spirit with dark bristled fur, curved horns and tusks, giant beast-skull bone pauldron bound with hemp rope, weathered reddish-brown leather war skirt, faded moss-green tribal totem paint, dual notched verdigris bronze battle-axes, #26282e studio backdrop, strictly no text/watermarks.',
    human_edits: ['人工设定构图与Art Bible约束', '外部工具生成并标准化命名', '生成后人工目视检查去字/视角/纯色底质检'],
  },
  {
    asset_id: 'concept_castle_celestial',
    name_zh: '昆仑神庭·昆仑神宫概念图',
    category: 'concept_art',
    faction: 'celestial',
    status: 'generated',
    file: 'docs/shanhai/concepts/concept_castle_celestial.png',
    artifact_file: 'C:/Users/htsd/.gemini/antigravity/brain/0d910d08-4ce5-4569-b71d-e0bbc9d67471/concepts/concept_castle_celestial.png',
    tool: 'ChatGPT 图像生成',
    model: 'ChatGPT Image Generation (external)',
    prompt: 'Eastern Dark Realism isometric 45-degree 3/4 view RTS concept art of Kunlun Celestial Palace (昆仑神庭·昆仑神宫): jade-white stepped altar terraces, tall vertical sanctuary with pale frost-blue crystal spires, floating bronze-and-jade rune obelisks, celestial gold inlays, flowing frost-blue silk banners, isolated on #1c1d22, strictly no text/watermarks.',
    human_edits: ['人工设定构图与Art Bible约束', '外部工具生成并标准化命名', '生成后人工目视检查去字/视角/纯色底质检'],
  },
  {
    asset_id: 'concept_castle_beast',
    name_zh: '九黎妖盟·万妖寨概念图',
    category: 'concept_art',
    faction: 'beast',
    status: 'generated',
    file: 'docs/shanhai/concepts/concept_castle_beast.png',
    artifact_file: 'C:/Users/htsd/.gemini/antigravity/brain/0d910d08-4ce5-4569-b71d-e0bbc9d67471/concepts/concept_castle_beast.png',
    tool: 'ChatGPT 图像生成',
    model: 'ChatGPT Image Generation (external)',
    prompt: 'Eastern Dark Realism isometric 45-degree 3/4 view RTS concept art of WanYao Stronghold (九黎妖盟·万妖寨): asymmetric timber-and-megalithic stockade built around giant beast skulls and curved horns as main gate, moss-green vines, reddish-brown war hides, aged bronze cauldron brazier, carved mountain-spirit wooden totems, isolated on #1c1d22, strictly no text/watermarks.',
    human_edits: ['人工设定构图与Art Bible约束', '外部工具生成并标准化命名', '生成后人工目视检查去字/视角/纯色底质检'],
  },
  {
    asset_id: 'concept_castle_chaos',
    name_zh: '混沌·裂隙魔殿概念图',
    category: 'concept_art',
    faction: 'chaos',
    status: 'generated',
    file: 'docs/shanhai/concepts/concept_castle_chaos.png',
    artifact_file: 'C:/Users/htsd/.gemini/antigravity/brain/0d910d08-4ce5-4569-b71d-e0bbc9d67471/concepts/concept_castle_chaos.png',
    tool: 'ChatGPT 图像生成',
    model: 'ChatGPT Image Generation (external)',
    prompt: 'Eastern Dark Realism isometric 45-degree 3/4 view RTS concept art of Rift Sanctum of Chaos (混沌·裂隙魔殿): jagged obsidian spires cracked with blood-red veins, shattered bronze sacrificial tripod fused with bone-armor plates, swirling dark-violet dimensional rift core above altar, isolated on #1c1d22, strictly no text/watermarks.',
    human_edits: ['人工设定构图与Art Bible约束', '外部工具生成并标准化命名', '生成后人工目视检查去字/视角/纯色底质检'],
  },
  {
    asset_id: 'concept_infantry_human',
    name_zh: '九州人皇·铁甲卫概念图',
    category: 'concept_art',
    faction: 'human',
    status: 'generated',
    file: 'docs/shanhai/concepts/concept_infantry_human.png',
    artifact_file: 'C:/Users/htsd/.gemini/antigravity/brain/0d910d08-4ce5-4569-b71d-e0bbc9d67471/concepts/concept_infantry_human.png',
    tool: 'ChatGPT 图像生成',
    model: 'ChatGPT Image Generation (external)',
    prompt: 'Eastern Dark Realism 3/4 full-body character concept of Iron-Armored Guard (九州人皇·铁甲卫): black-iron lamellar scale armor over vermilion gambeson with dark-gold bronze trim, bronze-rimmed rectangular tower shield in left hand, short bronze-tipped halberd/ji spear in right hand, #26282e studio backdrop, strictly no text/watermarks.',
    human_edits: ['人工设定构图与Art Bible约束', '外部工具生成并标准化命名', '生成后人工目视检查去字/视角/纯色底质检'],
  },
  {
    asset_id: 'concept_infantry_celestial',
    name_zh: '昆仑神庭·天兵概念图',
    category: 'concept_art',
    faction: 'celestial',
    status: 'generated',
    file: 'docs/shanhai/concepts/concept_infantry_celestial.png',
    artifact_file: 'C:/Users/htsd/.gemini/antigravity/brain/0d910d08-4ce5-4569-b71d-e0bbc9d67471/concepts/concept_infantry_celestial.png',
    tool: 'ChatGPT 图像生成',
    model: 'ChatGPT Image Generation (external)',
    prompt: 'Eastern Dark Realism 3/4 full-body character concept of Heavenly Soldier (昆仑神庭·天兵): carved jade-white plate armor inlaid with celestial gold filigree, frost-blue translucent silk waist ribbons, tall plumed jade-and-bronze crest helm, glowing frost-blue rune glaive/ge halberd, #26282e studio backdrop, strictly no text/watermarks.',
    human_edits: ['人工设定构图与Art Bible约束', '外部工具生成并标准化命名', '生成后人工目视检查去字/视角/纯色底质检'],
  },
  {
    asset_id: 'concept_battlefield_zhongzhou',
    name_zh: '中州平原战场概念图',
    category: 'concept_art',
    faction: 'human',
    status: 'generated',
    file: 'docs/shanhai/concepts/concept_battlefield_zhongzhou.png',
    artifact_file: 'C:/Users/htsd/.gemini/antigravity/brain/0d910d08-4ce5-4569-b71d-e0bbc9d67471/concepts/concept_battlefield_zhongzhou.png',
    tool: 'ChatGPT 图像生成',
    model: 'ChatGPT Image Generation (external)',
    prompt: 'Eastern Dark Realism 16:9 widescreen 45-degree bird-eye top-down empty RTS terrain map of Zhongzhou Plains Battlefield (中州平原战场概念图): dusty yellow-loess military marching roads, winding jade-grey river with two stone arch bridges, ruined bronze beacon mounds, flat dirt circular stronghold pads, strictly no troops/buildings/UI/text/watermarks.',
    human_edits: ['人工设定构图与Art Bible约束', '外部工具生成并标准化命名', '生成后人工目视检查去字/视角/纯色底质检'],
  },
  {
    asset_id: 'concept_ui_hud_style',
    name_zh: '《山海烽火》UI 与战斗 HUD 风格板',
    category: 'concept_art',
    faction: 'shared',
    status: 'generated',
    file: 'docs/shanhai/concepts/concept_ui_hud_style.png',
    artifact_file: 'C:/Users/htsd/.gemini/antigravity/brain/0d910d08-4ce5-4569-b71d-e0bbc9d67471/concepts/concept_ui_hud_style.png',
    tool: 'ChatGPT 图像生成',
    model: 'ChatGPT Image Generation (external)',
    prompt: 'Eastern Dark Realism bronze, black-iron, and carved white jade blank game UI kit on #16181d dark charcoal board: wide top resource bar frame, three beveled resource icons (square-holed gold coin, glowing cyan-jade crystal, hemp grain sack), bottom-left 4-slot spell dock, two blank beveled buttons, strictly ZERO text/characters/digits.',
    human_edits: ['人工设定构图与Art Bible约束', '外部工具生成并标准化命名', '生成后人工目视检查去字/视角/纯色底质检'],
  },
];

function classifyAsset(relPath, audioLookup) {
  // relPath is relative to game/assets/
  const parts = relPath.split('/');

  // Audio
  if (relPath.startsWith('resources/audio/')) {
    const key = path.basename(relPath, '.mp3');
    const isBgm = key.startsWith('music_');
    const info = audioLookup.get(key);
    return {
      asset_type: 'audio',
      category: isBgm ? 'audio_bgm' : 'audio_sfx',
      legacy_key: key,
      legacy_path: `game/assets/${relPath}`,
      new_id: `audio_${isBgm ? 'bgm' : 'sfx'}_${key}`,
      new_target_path: `game/assets/audio/${isBgm ? 'bgm' : 'sfx'}/${key}.mp3`,
      phase: 'A',
      status: info ? 'synthesized' : 'pending',
    };
  }

  // UI & Map items in resources/textures/{ui,map}
  if (relPath.startsWith('resources/textures/ui/') || relPath.startsWith('resources/textures/map/')) {
    const folder = parts[2];
    const base = path.basename(relPath, '.png');
    const legacyKey = `${folder}/${base}`;
    if (base === 'iriysoft_logo') {
      return {
        asset_type: 'png',
        category: 'ui_legacy_brand',
        legacy_key: legacyKey,
        legacy_path: `game/assets/${relPath}`,
        new_id: null,
        new_target_path: null,
        phase: 'B',
        status: 'remove',
        note: '原版第三方开发商 Logo，原创化阶段彻底移除',
      };
    }
    const uiNameMap = {
      title_bg: 'ui_title_bg_shanhai',
      title_logo: 'ui_title_crest_shanhai',
      btn_pill: 'ui_btn_bronze_pill',
      hud_panel_back: 'ui_hud_bronze_panel',
      win_castle_panel: 'ui_panel_stronghold_castle',
      win_town_panel: 'ui_panel_stronghold_town',
      icon_attack: 'ui_cmd_attack',
      icon_go_in: 'ui_cmd_garrison',
      icon_go_path: 'ui_cmd_march',
      star_gold: 'ui_star_jade_gold',
      star_silver: 'ui_star_iron_silver',
      build_site: 'terrain_build_site_seal',
      chest: 'terrain_relic_cauldron_chest',
    };
    return {
      asset_type: 'png',
      category: folder === 'ui' ? 'ui_chrome' : 'map_prop',
      legacy_key: legacyKey,
      legacy_path: `game/assets/${relPath}`,
      new_id: uiNameMap[base] ?? `ui_${base}`,
      new_target_path: `game/assets/art/${folder === 'ui' ? 'ui' : 'terrain'}/${uiNameMap[base] ?? base}.png`,
      phase: 'B',
      status: 'pending',
    };
  }

  // Icons
  if (relPath.startsWith('resources/textures/icons/')) {
    const base = path.basename(relPath, '.png');
    if (base.startsWith('spell_')) {
      const spellId = base.replace(/^spell_/, '');
      const sp = SPELL_MAP[spellId];
      const newId = sp ? `icon_${sp.new_id}` : `icon_${base}`;
      return {
        asset_type: 'png',
        category: 'icon_skill',
        legacy_key: `icons/${base}`,
        legacy_path: `game/assets/${relPath}`,
        new_id: newId,
        new_target_path: `game/assets/art/ui/icons/${newId}.png`,
        phase: sp?.phase ?? 'C',
        status: 'pending',
      };
    }
    if (base.startsWith('unit_')) {
      const dirKey = ICON_TO_UNIT_DIR[base];
      const u = dirKey ? UNIT_DIR_MAP[dirKey] : null;
      const newId = u ? `icon_unit_${u.new_slug}` : `icon_${base}`;
      return {
        asset_type: 'png',
        category: 'icon_unit',
        legacy_key: `icons/${base}`,
        legacy_path: `game/assets/${relPath}`,
        new_id: newId,
        new_target_path: `game/assets/art/ui/icons/${newId}.png`,
        phase: u?.phase ?? 'C',
        status: 'pending',
      };
    }
  }

  // Buildings
  if (relPath.startsWith('bundles/bundle_gameplay/textures/buildings/')) {
    const base = path.basename(relPath, '.png');
    const isRaze = base.endsWith('_raze');
    const core = isRaze ? base.slice(0, -5) : base;
    const [bKind, bColor] = core.split('_');
    const faction = COLOR_TO_FACTION[bColor] ?? 'shared';
    const bDef = BUILDING_TYPE_MAP[bKind];
    const kindSlug = bDef ? bDef.new_kind : bKind;
    const newId = `building_${faction}_${kindSlug}${isRaze ? '_ruin' : '_lv1'}`;
    return {
      asset_type: 'png',
      category: 'building',
      legacy_key: `buildings/${base}`,
      legacy_path: `game/assets/${relPath}`,
      new_id: newId,
      new_target_path: `game/assets/art/buildings/${faction}/${newId}.png`,
      phase: bKind === 'castle' || bKind === 'town' || bKind === 'village' || bKind === 'mine' ? 'B' : 'C',
      status: 'pending',
    };
  }

  // VFX
  if (relPath.startsWith('bundles/bundle_gameplay/textures/vfx/')) {
    const base = path.basename(relPath, '.png');
    const newId = `vfx_${base}`;
    return {
      asset_type: 'png',
      category: 'vfx',
      legacy_key: `vfx/${base}`,
      legacy_path: `game/assets/${relPath}`,
      new_id: newId,
      new_target_path: `game/assets/art/effects/${newId}.png`,
      phase: base.startsWith('spell_thunder') || base.startsWith('banner_hero') || base.startsWith('banner_heal') ? 'B' : 'C',
      status: 'pending',
    };
  }

  // Units (378 sprite strips across 42 dirs)
  if (relPath.startsWith('bundles/bundle_gameplay/textures/units/')) {
    const dirName = parts[4];
    const actionFile = path.basename(relPath, '.png');
    const u = UNIT_DIR_MAP[dirName];
    const slug = u ? u.new_slug : dirName;
    const newId = `unit_${slug}_${actionFile}`;
    return {
      asset_type: 'png',
      category: 'unit_animation',
      legacy_key: `units/${dirName}/${actionFile}`,
      legacy_path: `game/assets/${relPath}`,
      new_id: newId,
      new_target_path: `game/assets/animation/units/${u ? u.faction : 'shared'}/${slug}/${actionFile}.png`,
      phase: u ? u.phase : 'C',
      status: 'pending',
    };
  }

  // Maps & campaign diffs
  if (relPath.includes('/maps/')) {
    const bundleName = parts[1];
    const base = path.basename(relPath, '.png');
    let region = 'shared';
    let phase = 'C';
    if (base === 'campaign_map_base') {
      region = 'jiuzhou_world';
      phase = 'B';
    } else if (base === 'level1_bg') {
      region = 'zhongzhou_l1';
      phase = 'B';
    } else if (bundleName === 'bundle_westaria') {
      region = 'human_campaign';
    } else if (bundleName === 'bundle_cult') {
      region = 'celestial_campaign';
    } else if (bundleName === 'bundle_khaganate') {
      region = 'beast_campaign';
    }
    const newId = base.startsWith('campaign_map_diff_')
      ? `map_jiuzhou_overlay_${base.replace('campaign_map_diff_', 'node_')}`
      : base === 'campaign_map_base'
        ? 'map_jiuzhou_world_base'
        : `terrain_battlefield_${base}`;
    return {
      asset_type: 'png',
      category: base.startsWith('campaign_map') ? 'world_map' : 'battlefield_map',
      legacy_key: `map/${base}`,
      legacy_path: `game/assets/${relPath}`,
      new_id: newId,
      new_target_path: `game/assets/art/terrain/${region}/${newId}.png`,
      phase,
      status: 'pending',
    };
  }

  return {
    asset_type: path.extname(relPath).slice(1),
    category: 'other',
    legacy_key: relPath,
    legacy_path: `game/assets/${relPath}`,
    new_id: path.basename(relPath, path.extname(relPath)),
    new_target_path: `game/assets/art/other/${path.basename(relPath)}`,
    phase: 'C',
    status: 'pending',
  };
}

function main() {
  const audioReport = fs.existsSync(AUDIO_REPORT_PATH)
    ? JSON.parse(fs.readFileSync(AUDIO_REPORT_PATH, 'utf8'))
    : [];
  const audioLookup = new Map(audioReport.map((item) => [item.key, item]));
  const existingProvenancePath = path.join(OUT_DIR, 'asset-provenance.json');
  const prevAudioPromptMap = new Map();
  if (fs.existsSync(existingProvenancePath)) {
    const prevProv = JSON.parse(fs.readFileSync(existingProvenancePath, 'utf8'));
    for (const a of prevProv.assets ?? []) {
      if (a.asset_id?.startsWith('audio_') && a.final_file) {
        prevAudioPromptMap.set(a.final_file, a.prompt);
      }
    }
  }

  // Fallback: detect procedurally synthesized MP3 directly on disk so script is idempotent
  const audioDir = path.join(GAME_ASSETS, 'resources', 'audio');
  if (fs.existsSync(audioDir)) {
    for (const fname of fs.readdirSync(audioDir)) {
      if (!fname.endsWith('.mp3')) continue;
      const key = fname.replace(/\.mp3$/, '');
      if (audioLookup.has(key)) continue;
      const abs = path.join(audioDir, fname);
      const buf = fs.readFileSync(abs);
      const sha = crypto.createHash('sha256').update(buf).digest('hex').slice(0, 12);
      const relFile = `game/assets/resources/audio/${fname}`;
      audioLookup.set(key, {
        key,
        file: relFile,
        bytes: buf.length,
        durationSec: null,
        sha256Prefix: sha,
        existingPrompt: prevAudioPromptMap.get(relFile),
      });
    }
  }

  const rawFiles = [
    ...walkAssetFiles(path.join(GAME_ASSETS, 'bundles')),
    ...walkAssetFiles(path.join(GAME_ASSETS, 'resources')),
  ]
    .map((abs) => toPosix(path.relative(GAME_ASSETS, abs)))
    .sort();

  const mappedAssets = rawFiles.map((rel) => classifyAsset(rel, audioLookup));
  const countsByCategory = {};
  const countsByStatus = {};
  let pngCount = 0;
  let audioCount = 0;
  for (const item of mappedAssets) {
    countsByCategory[item.category] = (countsByCategory[item.category] ?? 0) + 1;
    countsByStatus[item.status] = (countsByStatus[item.status] ?? 0) + 1;
    if (item.asset_type === 'png') pngCount++;
    else if (item.asset_type === 'audio') audioCount++;
  }

  const mappingDoc = {
    project: '山海烽火 (Shanhai Fenghuo)',
    version: '1.0',
    updated_at: CREATED_AT,
    summary: {
      total_legacy_runtime_assets: mappedAssets.length,
      png_count: pngCount,
      audio_count: audioCount,
      unit_directory_count: Object.keys(UNIT_DIR_MAP).length,
      counts_by_category: countsByCategory,
      counts_by_status: countsByStatus,
      phase_a_concepts_generated: PHASE_A_CONCEPTS.filter((c) => c.status === 'generated').length,
      phase_a_concepts_total: PHASE_A_CONCEPTS.length,
    },
    factions: FACTION_MAP,
    spells: SPELL_MAP,
    units_directory_map: UNIT_DIR_MAP,
    phase_a_concepts: PHASE_A_CONCEPTS,
    assets: mappedAssets,
  };

  // Build docs/shanhai/asset-provenance.json strictly matching Section 12 schema
  const provenanceAssets = [];
  for (const c of PHASE_A_CONCEPTS) {
    if (c.status !== 'generated') continue;
    provenanceAssets.push({
      asset_id: c.asset_id,
      category: c.category,
      faction: c.faction,
      tool: c.tool,
      model: c.model,
      prompt: c.prompt,
      references: [],
      license_checked: false,
      human_edits: c.human_edits ?? ['人工设定构图与Art Bible约束', '生成后人工目视检查去字/视角/纯色底质检'],
      final_file: c.file,
      created_at: CREATED_AT,
      review_status: 'pending',
    });
  }

  for (const item of mappedAssets) {
    if (item.asset_type !== 'audio' || item.status !== 'synthesized') continue;
    const rep = audioLookup.get(item.legacy_key);
    provenanceAssets.push({
      asset_id: item.new_id,
      category: item.category,
      faction: 'shared',
      tool: 'scripts/generate-original-audio.mjs (@breezystack/lamejs 1.2.7)',
      model: 'pure-dsp-procedural-v1',
      prompt:
        rep.existingPrompt ??
        `Deterministic procedural synthesis for Shanhai Fenghuo cue "${item.legacy_key}" (pentatonic guzheng/bianzhong/war-drum/FM-noise DSP, sha256=${rep.sha256Prefix}, duration=${rep.durationSec ?? 'unknown'}s, ${rep.bytes}B).`,
      references: [],
      license_checked: true,
      human_edits: ['脚本确定性DSP生成', '峰值归一化与防爆音包络裁剪', '替换旧MP3并保留原.meta UUID'],
      final_file: item.legacy_path,
      created_at: CREATED_AT,
      review_status: 'pending',
    });
  }

  const provenanceDoc = {
    project: '山海烽火 (Shanhai Fenghuo)',
    version: '1.0',
    schema_ref: 'docs/shanhai/worldview-and-factions.md#12',
    updated_at: CREATED_AT,
    assets: provenanceAssets,
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, 'asset-mapping.json'), JSON.stringify(mappingDoc, null, 2) + '\n', 'utf8');
  fs.writeFileSync(
    path.join(OUT_DIR, 'asset-provenance.json'),
    JSON.stringify(provenanceDoc, null, 2) + '\n',
    'utf8',
  );

  if (fs.existsSync(AUDIO_REPORT_PATH)) {
    fs.unlinkSync(AUDIO_REPORT_PATH);
  }

  console.log(
    `SHANHAI_MANIFEST_OK total=${mappedAssets.length} png=${pngCount} audio=${audioCount} provenance=${provenanceAssets.length}`,
  );
}

main();
