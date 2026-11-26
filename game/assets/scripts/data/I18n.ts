import { BadgeId, EdictId, MedalRank, PlayableCampaignId, SpellId } from './Types';
import { LanguageCode } from './UserSettings';

let activeLanguage: LanguageCode = 'en';

export function getLanguage(): LanguageCode {
  return activeLanguage;
}

export function setLanguage(lang: LanguageCode): void {
  activeLanguage = lang === 'zh' ? 'zh' : 'en';
}

const EN_UI = {
  // Title
  title_subtitle: '3 CAMPAIGNS · 24 MISSIONS · 27 ROYAL EDICTS · 22 BADGES',
  title_btn_campaign: 'CAMPAIGN',
  title_btn_quick: 'QUICK BATTLE',
  title_sound_on: 'SOUND: ON',
  title_sound_off: 'SOUND: OFF',
  title_btn_save: 'SAVE DATA',
  title_attr: 'COCOS 4 + TypeScript Remake · 16:9',
  lang_toggle_btn: 'EN / 中文',

  // Campaign Select
  select_title: 'SELECT CAMPAIGN — RIVADIS',
  select_badges_btn: 'BADGES ({unlocked}/{total})',
  select_back_menu: 'MAIN MENU',
  select_play_btn: 'PLAY CAMPAIGN',
  select_card_stats: 'Missions: {done} / 8  (Gold: {golds})\nCommander Rank: {rank} · Free Pts: {pts}',

  // Campaign Map
  map_rank_xp: 'RANK {rank} · XP {xp} / {next}',
  map_rank_max: 'RANK {rank} (MAX)',
  map_edict_pts: 'EDICT PTS: {pts}',
  map_btn_throne: 'THRONE ROOM',
  map_btn_badges: 'BADGES',
  map_btn_campaigns: 'CAMPAIGNS',
  map_mission_title: 'MISSION {num}: {name}',
  map_mission_meta: 'Reward: +{xp} XP  |  Tech Tier: T{tier}\nEnemies:\n  {enemies}',
  map_record_conquered: 'Status: CONQUERED ({medal} Medal)\nBest Time: {time}',
  map_record_ready: 'Status: READY FOR ASSAULT\nGold < 05:30 · Silver <= 09:30',
  map_btn_start: 'START MISSION',
  map_freeplay_on: 'FREE PLAY: ALL OPEN (ON)',
  map_freeplay_off: 'FREE PLAY: UNLOCK ALL',

  // Throne Room
  throne_title_westaria: 'THRONE ROOM — ROYAL EDICTS',
  throne_title_khaganate: 'WAR TENT — KHAGANATE DECREES',
  throne_title_cult: 'ARCANE CITADEL — CULT EDICTS',
  throne_available_pts: 'AVAILABLE POINTS: {pts}',
  throne_btn_reset: 'RESET EDICTS',
  throne_btn_back: 'BACK TO CAMPAIGN MAP',
  throne_maxed: 'MAXED',
  throne_upgrade: 'UPGRADE TO LV.{lv} (1 PT)',
  throne_need_pt: 'NEED SKILL POINT',
  throne_sum_khaganate:
    'Horde Army: Inf T{inf} · Arc T{arc} · Cav T{cav} · Siege T{siege}   |   Spells: {spells}/4   |   Speed ×{spd} · Capture +{cap}g · Poison +{poi}',
  throne_sum_cult:
    'Cult Army: Inf T{inf} · Arc T{arc} · Cav T{cav} · Mag T{mag}   |   Spells: {spells}/4   |   Supply Cost ×{sup} · Spell Cost ×{spc} · Tower +{twr}',
  throne_sum_westaria:
    'Westaria Army: Inf T{inf} · Arc T{arc} · Cav T{cav} · Mag T{mag}   |   Spells: {spells}/4   |   Start +{gold}g · Stronghold HP ×{shp} · Charge ×{chg}',

  // Badges Room
  badges_title: 'HALL OF BADGES — ACHIEVEMENTS',
  badges_unlocked_count: 'UNLOCKED: {unlocked} / {total}',
  badges_page_1: 'PAGE 1 (1-12)',
  badges_page_2: 'PAGE 2 (13-22)',
  badges_back: 'BACK',
  badges_footer:
    'Showing Badges {range} of {total}  ·  Complete campaigns, medals, edicts & combat feats to unlock',
  badges_status_unlocked: '★ UNLOCKED',
  badges_status_locked: 'LOCKED',

  // Loading Overlay
  load_mission_header: 'MISSION {num}: {name}',
  load_connecting: 'CONNECTING TO ASSET BUNDLE... 0%',
  load_gameplay_bundle: 'LOADING GAMEPLAY BUNDLE...',
  load_mission_data: 'LOADING MISSION DATA...',
  load_battlefield_map: 'LOADING BATTLEFIELD MAP...',
  load_retrying_bundle: 'GAMEPLAY BUNDLE RETRYING ({next}/{max})...',
  load_retrying_mission: 'MISSION DATA RETRYING ({next}/{max})...',
  load_retrying_map: 'BATTLEFIELD MAP RETRYING ({next}/{max})...',
  load_ready: 'READY!',
  load_failed_title: 'MISSION ASSET LOAD FAILED',
  load_failed_detail: 'Network/CDN error: {detail}',
  load_btn_retry: 'RETRY',
  load_btn_back: 'BACK',

  // Battle HUD
  hud_gold: 'GOLD: {gold} (+{rate}/s)',
  hud_supply: 'SUPPLY: {used}/{total}',
  hud_mana: 'MANA: {mana}/500',
  hud_time: 'TIME: {time}  (GOLD <05:30)',
  hud_speed_1x: '1X [F]',
  hud_speed_2x: '2X [F]',
  hud_pause_btn: 'PAUSE [SPC]',
  hud_mute_off: 'SFX ON [M]',
  hud_mute_on: 'MUTED [M]',
  hud_map_btn: 'MAP',
  hud_cancel_spell: 'CANCEL [ESC]',
  hud_targeting: 'TARGETING: {spell} — Tap/Click map to cast',
  hud_mission_obj: 'Mission {num}: {name} — Capture all hostile strongholds!',
  hud_spell_locked: 'LOCKED',
  hud_spell_ready: 'READY!',
  hud_spell_mana: '{cost}m',
  hud_fort_header: '{name} (Lv.{lv}) · HP {hp}/{maxHp}',
  hud_unit_cost: '{cost}g · {upkeep}sup',
  hud_no_supply: 'NO SUPPLY',
  hud_upgrade_max: 'MAX\nLEVEL',
  hud_upgrade_cost: 'UPGRADE\n{cost} Gold\n(+50% HP)',
  hud_build_title: 'CONSTRUCT SUPPLY BUILDING ({cost} Gold)',
  hud_build_farm: 'Farm\n+1 Supply',
  hud_build_mine: 'Mine\n+2 Gold/s',
  hud_build_obelisk: 'Obelisk\n+1 Mana/s',
  hud_march_btn: 'MARCH TO ENEMY',
  hud_squad_info: '{name}{tags} ({alive}/{total}, HP {hp}/{maxHp})\nClick map or enemy stronghold to march & attack',
  hud_tag_heroic: 'HEROIC',
  hud_tag_bloodlust: 'BLOODLUST',
  hud_tag_frost: 'FROST ARMOR',
  hud_tag_liberation: 'LIBERATED',
  hud_tag_frozen: 'FROZEN',
  hud_tag_poisoned: 'POISONED',
  hud_tag_feared: 'FEARED',

  // Pause Modal
  pause_title: 'GAME PAUSED',
  pause_bgm: 'BGM: {pct}%',
  pause_sfx: 'SFX: {pct}%',
  pause_lang_row: 'LANGUAGE: ENGLISH',
  pause_lang_btn: '中文',
  pause_resume: 'RESUME',
  pause_restart: 'RESTART MISSION',
  pause_map: 'CAMPAIGN MAP',
  pause_menu: 'MAIN MENU',

  // Result Overlay
  result_victory: 'VICTORY! ({medal} MEDAL)',
  result_defeat: 'DEFEAT',
  result_btn_next: 'NEXT MISSION',
  result_btn_throne: 'THRONE ROOM',
  result_btn_map: 'CAMPAIGN MAP',
  result_btn_replay: 'REPLAY',
  result_reward_xp: '\nEarned XP: +{xp}  |  Rank: {rank}{pts}',
  result_reward_pts: ' (+{pts} Edict Points!)',
  result_badges_unlocked: '\nBadges Unlocked: {list}',
  result_details:
    'Mission {num}: {name}\nTime: {time}   (Gold < 05:30, Silver <= 09:30)\nEnemy Squads Destroyed: {kills}   |   Squads Lost: {lost}',

  // Battle Floating Text
  vfx_veteran_up: 'VETERAN UP!',
  vfx_lords_judgement: "LORD'S JUDGEMENT!",
  vfx_stoneworms: 'STONEWORMS!',
  vfx_immortals_risen: 'IMMORTALS RISEN!',
  vfx_undead_raised: 'UNDEAD RAISED!',
  vfx_frozen: 'FROZEN!',
  vfx_frost_enchant: 'FROST ENCHANT!',
  vfx_cataclysm: 'CATACLYSM!',
  vfx_transformation: 'TRANSFORMATION +{gold}G/M!',
  vfx_lords_avatar: "LORD'S AVATAR!",
  vfx_gold_gain: '+{gold} GOLD!',

  // Save Data Modal
  save_modal_title: 'SAVE DATA BACKUP & TRANSFER',
  save_summary: 'Progress: {done}/24 Missions · {golds} Gold Medals · {badges}/22 Badges',
  save_code_hint: 'Current Transfer Code (Base64 + Checksum):',
  save_btn_copy: 'COPY CODE',
  save_btn_download: 'EXPORT .TXT',
  save_btn_import: 'IMPORT CODE',
  save_btn_reset: 'RESET ALL',
  save_btn_reset_confirm: 'CONFIRM RESET?',
  save_btn_close: 'CLOSE',
  save_status_ready: 'Copy or export your save code to transfer progress across devices.',
  save_status_copied: 'Save code copied to clipboard!',
  save_status_copy_fallback: 'Clipboard blocked — use EXPORT .TXT or copy from import box.',
  save_status_downloaded: 'Downloaded takeover-save.txt!',
  save_status_download_unavail: 'File download is unavailable in this runtime.',
  save_status_imported: 'Imported! {done}/24 missions, {badges}/22 badges restored.',
  save_status_reset_warn: 'Warning: Click CONFIRM RESET? again to wipe all progress!',
  save_status_reset_done: 'All campaign saves have been reset.',
  save_err_empty: 'Import canceled or empty code.',
  save_err_format: 'Invalid save code format (must start with TKV3:).',
  save_err_checksum: 'Save code checksum mismatch (corrupted or incomplete).',
  save_err_version: 'Unsupported save format version.',
  save_import_prompt_title: 'PASTE SAVE TRANSFER CODE (TKV3:...)',
  save_import_prompt_placeholder: 'Paste your TKV3:... save code here',
  save_import_prompt_ok: 'RESTORE SAVE',
  save_import_prompt_cancel: 'CANCEL',
} as const;

export type UiTextKey = keyof typeof EN_UI;

const ZH_UI: Record<UiTextKey, string> = {
  // Title
  title_subtitle: '3 大战役 · 24 个关卡 · 27 项王国法令 · 22 枚荣誉徽章',
  title_btn_campaign: '开始战役',
  title_btn_quick: '快速遭遇战',
  title_sound_on: '声音: 开',
  title_sound_off: '声音: 关',
  title_btn_save: '存档管理',
  title_attr: 'COCOS 4 + TypeScript 重制版 · 16:9',
  lang_toggle_btn: '中文 / EN',

  // Campaign Select
  select_title: '选择战役 — 里瓦迪斯大陆',
  select_badges_btn: '徽章 ({unlocked}/{total})',
  select_back_menu: '返回主菜单',
  select_play_btn: '进入战役',
  select_card_stats: '关卡进度: {done} / 8  (金牌: {golds})\n统帅等级: {rank} · 可用点数: {pts}',

  // Campaign Map
  map_rank_xp: '等级 {rank} · 经验 {xp} / {next}',
  map_rank_max: '等级 {rank} (满级)',
  map_edict_pts: '法令点: {pts}',
  map_btn_throne: '王座厅',
  map_btn_badges: '徽章殿堂',
  map_btn_campaigns: '切换战役',
  map_mission_title: '第 {num} 关: {name}',
  map_mission_meta: '胜利奖励: +{xp} XP  |  敌军科技: T{tier}\n敌对势力:\n  {enemies}',
  map_record_conquered: '战况: 已攻克 ({medal}勋章)\n最佳用时: {time}',
  map_record_ready: '战况: 整装待发\n金牌 < 05:30 · 银牌 <= 09:30',
  map_btn_start: '出征关卡',
  map_freeplay_on: '自由模式: 全关卡已解锁 (开)',
  map_freeplay_off: '自由模式: 解锁全部关卡',

  // Throne Room
  throne_title_westaria: '王座大厅 — 王国法令',
  throne_title_khaganate: '战帐议事 — 汗国法令',
  throne_title_cult: '奥术圣殿 — 教团密令',
  throne_available_pts: '可用法令点: {pts}',
  throne_btn_reset: '重置法令',
  throne_btn_back: '返回战役地图',
  throne_maxed: '已满级',
  throne_upgrade: '升级至 Lv.{lv} (1 点)',
  throne_need_pt: '需要法令点',
  throne_sum_khaganate:
    '汗国军备: 步T{inf} · 弓T{arc} · 骑T{cav} · 攻城T{siege}   |   法术: {spells}/4   |   移速×{spd} · 占城+{cap}金 · 剧毒+{poi}',
  throne_sum_cult:
    '教团军备: 步T{inf} · 弓T{arc} · 骑T{cav} · 法T{mag}   |   法术: {spells}/4   |   补给花费×{sup} · 法术耗魔×{spc} · 法师塔+{twr}',
  throne_sum_westaria:
    '维斯塔利亚: 步T{inf} · 弓T{arc} · 骑T{cav} · 法T{mag}   |   法术: {spells}/4   |   初始+{gold}金 · 据点血量×{shp} · 冲锋×{chg}',

  // Badges Room
  badges_title: '荣誉殿堂 — 成就徽章',
  badges_unlocked_count: '已解锁: {unlocked} / {total}',
  badges_page_1: '第 1 页 (1-12)',
  badges_page_2: '第 2 页 (13-22)',
  badges_back: '返回',
  badges_footer: '当前显示第 {range} 枚徽章（共 {total} 枚） · 完成战役、金牌、法令与战斗壮举即可解锁',
  badges_status_unlocked: '★ 已解锁',
  badges_status_locked: '未解锁',

  // Loading Overlay
  load_mission_header: '第 {num} 关: {name}',
  load_connecting: '正在连接资源分包... 0%',
  load_gameplay_bundle: '正在加载核心战斗资源...',
  load_mission_data: '正在加载关卡数据...',
  load_battlefield_map: '正在加载战场地图...',
  load_retrying_bundle: '核心资源重试中 ({next}/{max})...',
  load_retrying_mission: '关卡数据重试中 ({next}/{max})...',
  load_retrying_map: '战场地图重试中 ({next}/{max})...',
  load_ready: '准备就绪!',
  load_failed_title: '关卡资源加载失败',
  load_failed_detail: '网络/CDN 错误: {detail}',
  load_btn_retry: '重试',
  load_btn_back: '返回',

  // Battle HUD
  hud_gold: '金币: {gold} (+{rate}/秒)',
  hud_supply: '补给: {used}/{total}',
  hud_mana: '法力: {mana}/500',
  hud_time: '计时: {time}  (金牌<05:30)',
  hud_speed_1x: '1倍 [F]',
  hud_speed_2x: '2倍 [F]',
  hud_pause_btn: '暂停 [SPC]',
  hud_mute_off: '音效开 [M]',
  hud_mute_on: '静音 [M]',
  hud_map_btn: '地图',
  hud_cancel_spell: '取消 [ESC]',
  hud_targeting: '瞄准法术: {spell} — 点击地图施放',
  hud_mission_obj: '第 {num} 关: {name} — 攻占所有敌方据点!',
  hud_spell_locked: '未解锁',
  hud_spell_ready: '已就绪!',
  hud_spell_mana: '{cost}法力',
  hud_fort_header: '{name} (Lv.{lv}) · 耐久 {hp}/{maxHp}',
  hud_unit_cost: '{cost}金 · {upkeep}补给',
  hud_no_supply: '补给不足',
  hud_upgrade_max: '已达\n满级',
  hud_upgrade_cost: '升级据点\n{cost} 金币\n(+50% 耐久)',
  hud_build_title: '建造补给设施 ({cost} 金币)',
  hud_build_farm: '农场\n+1 补给',
  hud_build_mine: '金矿\n+2 金币/秒',
  hud_build_obelisk: '方尖碑\n+1 法力/秒',
  hud_march_btn: '进攻敌军',
  hud_squad_info: '{name}{tags} ({alive}/{total}, 生命 {hp}/{maxHp})\n点击地图行军或点击敌方据点发起进攻',
  hud_tag_heroic: '英勇',
  hud_tag_bloodlust: '嗜血',
  hud_tag_frost: '霜甲',
  hud_tag_liberation: '解放',
  hud_tag_frozen: '冰冻',
  hud_tag_poisoned: '中毒',
  hud_tag_feared: '恐惧',

  // Pause Modal
  pause_title: '游戏已暂停',
  pause_bgm: '音乐音量: {pct}%',
  pause_sfx: '音效音量: {pct}%',
  pause_lang_row: '当前语言: 简体中文',
  pause_lang_btn: 'English',
  pause_resume: '继续游戏',
  pause_restart: '重开本关',
  pause_map: '返回战役地图',
  pause_menu: '返回主菜单',

  // Result Overlay
  result_victory: '战役胜利! ({medal}勋章)',
  result_defeat: '战败',
  result_btn_next: '下一关',
  result_btn_throne: '王座厅',
  result_btn_map: '战役地图',
  result_btn_replay: '重玩本关',
  result_reward_xp: '\n获得经验: +{xp}  |  统帅等级: {rank}{pts}',
  result_reward_pts: ' (+{pts} 法令点!)',
  result_badges_unlocked: '\n解锁徽章: {list}',
  result_details:
    '第 {num} 关: {name}\n耗时: {time}   (金牌 < 05:30, 银牌 <= 09:30)\n歼灭敌军小队: {kills}   |   我方战损小队: {lost}',

  // Battle Floating Text
  vfx_veteran_up: '老兵晋升!',
  vfx_lords_judgement: '圣主裁决!',
  vfx_stoneworms: '沙虫破土!',
  vfx_immortals_risen: '不朽者复苏!',
  vfx_undead_raised: '亡灵复生!',
  vfx_frozen: '极寒冰封!',
  vfx_frost_enchant: '寒冰附魔!',
  vfx_cataclysm: '天降灾厄!',
  vfx_transformation: '大转化 +{gold} 金/魔!',
  vfx_lords_avatar: '圣主降临!',
  vfx_gold_gain: '+{gold} 金币!',

  // Save Data Modal
  save_modal_title: '存档备份与跨端转移',
  save_summary: '当前进度: 已通关 {done}/24 关 · 金牌 {golds} 枚 · 徽章 {badges}/22 枚',
  save_code_hint: '当前存档转移码 (Base64 + 校验和):',
  save_btn_copy: '复制存档码',
  save_btn_download: '导出 .TXT',
  save_btn_import: '导入存档码',
  save_btn_reset: '重置存档',
  save_btn_reset_confirm: '确认清空?',
  save_btn_close: '关闭',
  save_status_ready: '复制或导出存档码，即可在其他设备/浏览器恢复全部战役进度。',
  save_status_copied: '存档码已复制到剪贴板!',
  save_status_copy_fallback: '剪贴板权限受限 — 请使用“导出 .TXT”保存文件。',
  save_status_downloaded: '已下载 takeover-save.txt 存档文件!',
  save_status_download_unavail: '当前运行环境不支持文件下载。',
  save_status_imported: '导入成功! 已恢复 {done}/24 关进度与 {badges}/22 枚徽章。',
  save_status_reset_warn: '警告: 再次点击“确认清空?”将永久抹除全部本地存档!',
  save_status_reset_done: '所有战役存档已重置为初始状态。',
  save_err_empty: '已取消导入或存档码为空。',
  save_err_format: '存档码格式无效（必须以 TKV3: 开头）。',
  save_err_checksum: '存档码校验失败（数据已损坏或不完整）。',
  save_err_version: '不支持的存档版本。',
  save_import_prompt_title: '粘贴存档转移码 (TKV3:...)',
  save_import_prompt_placeholder: '在此粘贴以 TKV3: 开头的完整存档码',
  save_import_prompt_ok: '确认恢复存档',
  save_import_prompt_cancel: '取消',
};

export function t(key: UiTextKey, params?: Record<string, string | number>): string {
  const table = activeLanguage === 'zh' ? ZH_UI : EN_UI;
  let str: string = table[key] ?? EN_UI[key];
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return str;
}

const ZH_TUTORIAL1_HINTS = [
  '引导 1/4: 点击下方绿色城堡，招募步兵“卫士”(100 金币)。',
  '引导 2/4: 选中我方“卫士”小队，点击来袭的亡灵或紫方城镇发起进攻！',
  '引导 3/4: 已解锁弓箭手！在空地(旗帜)建造农场/金矿，并夺取敌方城镇。',
  '引导 4/4: 攻占右上角紫色城堡即可赢取第 1 关！（金牌 < 05:30）',
];

const ZH_TUTORIAL2_HINTS = [
  '第 2 关: 从兵营招募部队，击败守卫宝箱 (+500 金币) 的食人魔！',
  '提示: 施放“奉献战旗”(50 法力) 可在战斗中治疗并复活我方阵亡士兵！',
  '目标: 夺取魔法塔为“降临之兆”充能，击溃红色汗国主力！',
  '胜利在望: 充能满后召唤“圣主化身”，或直接攻破红方主堡！',
];

export function getTutorialHint(mode: 'tutorial1' | 'tutorial2', step: number, enHints: string[]): string {
  if (activeLanguage === 'zh') {
    const arr = mode === 'tutorial1' ? ZH_TUTORIAL1_HINTS : ZH_TUTORIAL2_HINTS;
    return arr[Math.min(step, arr.length - 1)] ?? arr[0];
  }
  return enHints[Math.min(step, enHints.length - 1)] ?? enHints[0] ?? '';
}

const ZH_CAMPAIGN_TITLES: Record<PlayableCampaignId, string> = {
  Westaria: '维斯塔利亚战役',
  TheKhaganate: '赤红汗国战役',
  TheCult: '冰谷教团战役',
};

const EN_CAMPAIGN_TITLES: Record<PlayableCampaignId, string> = {
  Westaria: 'WESTARIA CAMPAIGN',
  TheKhaganate: 'CRIMSON HORDE CAMPAIGN',
  TheCult: 'ICEDALES CULT CAMPAIGN',
};

export function getCampaignTitle(campaign: PlayableCampaignId): string {
  return activeLanguage === 'zh' ? ZH_CAMPAIGN_TITLES[campaign] : EN_CAMPAIGN_TITLES[campaign];
}

const ZH_CAMPAIGN_CARDS: Record<PlayableCampaignId, { title: string; subtitle: string; lore: string }> = {
  Westaria: {
    title: '维斯塔利亚公国',
    subtitle: '神圣十字军与骑士团',
    lore: '守卫西部群岛并向东远征，清除盘踞在破碎帝国里瓦迪斯大陆上的亡灵瘟疫。',
  },
  TheKhaganate: {
    title: '赤红汗国',
    subtitle: '草原铁骑与黑暗萨满',
    lore: '在新任大汗的旗帜下统一东方部族，从古墓唤醒祖先战士，夺回属于汗国的疆土。',
  },
  TheCult: {
    title: '冰谷教团',
    subtitle: '北方秘法巫师与机械师',
    lore: '驾驭极北群山的奥术寒冰与发条巨像机甲，打破帝国与蛮族的压迫，赢得自由。',
  },
};

const EN_CAMPAIGN_CARDS: Record<PlayableCampaignId, { title: string; subtitle: string; lore: string }> = {
  Westaria: {
    title: 'DUCHY OF WESTARIA',
    subtitle: 'Holy Crusaders & Chivalry',
    lore: 'Defend the western islands and march east to purge the undead plague from the shattered Empire of Rivadis.',
  },
  TheKhaganate: {
    title: 'THE CRIMSON HORDE',
    subtitle: 'Steppe Riders & Dark Shamans',
    lore: 'Unite the eastern clans under a new Great Khan, raise ancient warriors from the tombs, and claim Rivadis.',
  },
  TheCult: {
    title: 'THE ICEDALES CULT',
    subtitle: 'Northern Wizards & Mechanists',
    lore: 'Channel arcane frost and clockwork Giantbots from the northern peaks to break free from every tyrant.',
  },
};

export function getCampaignCardCopy(campaign: PlayableCampaignId): { title: string; subtitle: string; lore: string } {
  return activeLanguage === 'zh' ? ZH_CAMPAIGN_CARDS[campaign] : EN_CAMPAIGN_CARDS[campaign];
}

const ZH_FACTIONS: Record<string, string> = {
  Westaria: '维斯塔利亚十字军 (绿)',
  TheEmpire: '亡灵帝国 (紫)',
  TheKhaganate: '赤红汗国 (红)',
  TheCult: '冰谷教团 (蓝)',
  Bandits: '荒野匪徒 (棕)',
};

const EN_FACTIONS: Record<string, string> = {
  Westaria: 'Westaria Crusaders (Green)',
  TheEmpire: 'The Empire (Purple)',
  TheKhaganate: 'The Crimson Horde (Red)',
  TheCult: 'The Icedales Cult (Blue)',
  Bandits: 'Bandits',
};

export function getFactionLabel(factionId: string): string {
  const map = activeLanguage === 'zh' ? ZH_FACTIONS : EN_FACTIONS;
  return map[factionId] ?? factionId;
}

const ZH_MEDALS: Record<MedalRank, string> = {
  Gold: '金牌',
  Silver: '银牌',
  Bronze: '铜牌',
};

export function getMedalLabel(medal: MedalRank): string {
  return activeLanguage === 'zh' ? ZH_MEDALS[medal] : medal.toUpperCase();
}

const ZH_UNITS: Record<string, string> = {
  w_guards: '卫士',
  w_swordsmen: '剑士',
  w_legionaries: '圣殿军团',
  w_archers: '弓箭手',
  w_crossbowmen: '弩手',
  w_knights: '骑士',
  w_champions: '圣殿骑兵',
  w_monks: '苦修僧',
  w_zealots: '狂热信徒',
  w_avatar: '圣主化身',
  w_trebuchet: '投石车',

  e_undying_warriors: '不死战士',
  e_zombie_warriors: '行尸武士',
  e_undying_archers: '不死弓手',
  e_skeleton_archers: '骷髅射手',
  e_undying_horsemen: '死亡骑手',
  e_dark_knights: '黑暗骑士',
  e_undying_assassins: '幽魂刺客',
  e_shades: '暗影怨灵',
  e_trebuchet: '帝国投石车',
  e_poison_catapult: '剧毒投石车',

  k_warriors: '部落勇士',
  k_immortals: '古墓不朽者',
  k_hunters: '草原猎手',
  k_serpent_archers: '毒蛇射手',
  k_nomads: '游牧轻骑',
  k_raiders: '掠夺重骑',
  k_ancient_raiders: '先祖幽灵骑',
  k_assassins: '血刃刺客',
  k_trebuchet: '汗国投石车',
  k_poison_catapult: '剧毒投石车',

  b_rebels: '起义长矛手',
  b_myrmidons: '极地重甲兵',
  b_gunsmiths: '火枪手',
  b_gunbots: '发条火枪傀儡',
  b_giantbots: '巨像机甲',
  b_lancers: '长枪骑兵',
  b_dragon_lancers: '驯龙骑兵',
  b_acolytes: '寒冰学徒',
  b_wizards: '冰霜大法师',
  b_trebuchet: '教团投石车',

  n_ogre: '荒野食人魔',
};

export function getUnitName(defId: string, fallback: string): string {
  if (activeLanguage === 'zh') {
    return ZH_UNITS[defId] ?? fallback;
  }
  return fallback;
}

const ZH_SPELLS: Record<SpellId, { name: string; shortName: string }> = {
  lords_judgement: { name: '圣主裁决', shortName: '裁决' },
  banner_consecration: { name: '奉献战旗', shortName: '奉献旗' },
  banner_heroism: { name: '英勇战旗', shortName: '英勇旗' },
  sign_of_advent: { name: '降临之兆', shortName: '化身' },

  summon_stoneworms: { name: '诱捕沙虫', shortName: '沙虫' },
  disentomb: { name: '掘墓招魂', shortName: '掘墓' },
  banner_bloodlust: { name: '嗜血战旗', shortName: '嗜血旗' },
  cataclysm: { name: '天降灾厄', shortName: '灾厄' },

  ice_blast: { name: '冰霜冲击', shortName: '冰爆' },
  frost_enchantment: { name: '寒冰附魔', shortName: '霜甲术' },
  banner_liberation: { name: '解放战旗', shortName: '解放旗' },
  grand_transformation: { name: '大转化术', shortName: '大转化' },

  terror: { name: '恐惧降临', shortName: '恐惧' },
  raise_the_dead: { name: '死者苏生', shortName: '招魂' },
  banner_desecration: { name: '亵渎战旗', shortName: '亵渎旗' },
  call_of_the_grave: { name: '坟墓呼唤', shortName: '墓呼' },
};

export function getSpellName(
  spellId: SpellId,
  short: boolean,
  fallbackName: string,
  fallbackShort: string,
): string {
  if (activeLanguage === 'zh') {
    const entry = ZH_SPELLS[spellId];
    if (entry) return short ? entry.shortName : entry.name;
  }
  return short ? fallbackShort : fallbackName;
}

const ZH_EDICTS: Record<EdictId, { name: string; ranks: [string, string, string] }> = {
  lords_church: {
    name: '圣主教廷',
    ranks: ['解锁法术“奉献战旗”', '所有战旗持续时间 +25%', '所有战旗持续时间 +50%'],
  },
  ducal_sovereignty: {
    name: '公爵主权',
    ranks: ['解锁基础兵种招募', '开局初始金币 +75', '开局初始金币 +150'],
  },
  call_crusade: {
    name: '十字军号召',
    ranks: ['解锁法术“圣主裁决”', '“圣主裁决”伤害 +15%', '“圣主裁决”伤害 +30%'],
  },
  town_guilds: {
    name: '城镇行会',
    ranks: ['卫士升级为“剑士”', '所有我方据点耐久 +15%', '所有我方据点耐久 +30%'],
  },
  zealots_order: {
    name: '狂热教团',
    ranks: ['苦修僧升级为“狂热信徒”', '终极技能充能消耗 -10%', '终极技能充能消耗 -20%'],
  },
  mechanics_research: {
    name: '机械研习',
    ranks: ['弓箭手升级为“弩手”', '远程与攻城单位伤害 +10%', '远程与攻城单位伤害 +20%'],
  },
  heroic_epos: {
    name: '英雄史诗',
    ranks: ['解锁法术“英勇战旗”', '部队基础士气 +7%', '部队基础士气 +15%'],
  },
  regular_tournaments: {
    name: '常态比武会',
    ranks: ['骑士升级为“圣殿骑兵”', '骑兵冲锋造成 2.5 倍伤害', '骑兵冲锋造成 3 倍伤害'],
  },
  legion: {
    name: '圣殿军团',
    ranks: ['步兵升级为“圣殿军团”', '所有步兵生命值 +15%', '所有步兵生命值 +30%'],
  },

  bloodlust: {
    name: '嗜血狂潮',
    ranks: ['解锁法术“嗜血战旗”', '对敌方据点伤害 +25%', '对敌方据点伤害 +50%'],
  },
  declaration_of_war: {
    name: '宣战布告',
    ranks: ['解锁基础兵种招募', '部队移动速度 +10%', '部队移动速度 +20%'],
  },
  speaking_to_animals: {
    name: '御兽秘语',
    ranks: ['解锁法术“诱捕沙虫”', '额外增加 1 波沙虫攻击', '额外增加 2 波沙虫攻击'],
  },
  three_days_plunder: {
    name: '三日掠夺',
    ranks: ['游牧轻骑升级为“掠夺重骑”', '每次攻占据点额外获 +75 金币', '每次攻占据点额外获 +150 金币'],
  },
  raid_the_tombs: {
    name: '古墓掘金',
    ranks: ['部落勇士升级为“古墓不朽者”', '不朽者小队人数 +1', '不朽者小队人数 +2'],
  },
  poisons_research: {
    name: '淬毒技艺',
    ranks: ['草原猎手升级为“毒蛇射手”', '剧毒持续伤害 +1', '剧毒持续伤害 +2'],
  },
  dark_teaching: {
    name: '黑暗教义',
    ranks: ['解锁法术“掘墓招魂”', '每有小队阵亡终极充能 +3%', '每有小队阵亡终极充能 +6%'],
  },
  dreadful_machinery: {
    name: '可怖器械',
    ranks: ['投石车升级为“剧毒投石车”', '攻城器械移动速度 +50%', '攻城器械移动速度 +100%'],
  },
  necropolis_excavations: {
    name: '死灵墓穴发掘',
    ranks: ['骑兵升级为“先祖幽灵骑”', '亡灵部队招募花费 -7%', '亡灵部队招募花费 -15%'],
  },

  arcane_frost: {
    name: '奥术极寒',
    ranks: ['解锁法术“冰霜冲击”', '冰冻持续时间 +1 秒', '冰冻持续时间 +2 秒'],
  },
  declaration_of_independence: {
    name: '独立宣言',
    ranks: ['解锁基础兵种招募', '农场/金矿/方尖碑建造成本 -15%', '农场/金矿/方尖碑建造成本 -30%'],
  },
  artisans_guild: {
    name: '工匠行会',
    ranks: ['火枪手升级为“发条火枪傀儡”', '机械单位暴击率 +5%', '机械单位暴击率 +10%'],
  },
  rebel_army: {
    name: '起义大军',
    ranks: ['起义长矛手升级为“极地重甲兵”', '步兵攻击附加 7% 冰冻概率', '步兵攻击附加 15% 冰冻概率'],
  },
  magic_library: {
    name: '奥术图书馆',
    ranks: ['解锁法术“寒冰附魔”', '所有法术法力消耗 -10%', '所有法术法力消耗 -20%'],
  },
  liberation_army: {
    name: '解放军团',
    ranks: ['解锁法术“解放战旗”', '部队获取老兵经验速度 +15%', '部队获取老兵经验速度 +30%'],
  },
  magic_academy: {
    name: '魔法学院',
    ranks: ['寒冰学徒升级为“冰霜大法师”', '魔法塔每秒额外产出 +1 金/补给/魔', '魔法塔每秒额外产出 +2 金/补给/魔'],
  },
  tame_the_reptiles: {
    name: '驯服冰龙',
    ranks: ['长枪骑兵升级为“驯龙骑兵”', '所有骑兵生命值 +10%', '所有骑兵生命值 +20%'],
  },
  giant_construction: {
    name: '巨像工程',
    ranks: ['远程单位升级为“巨像机甲”', '巨像机甲每秒恢复 2% 生命', '巨像机甲每秒恢复 4% 生命'],
  },
};

export function getEdictName(id: EdictId, fallback: string): string {
  if (activeLanguage === 'zh') {
    return ZH_EDICTS[id]?.name ?? fallback;
  }
  return fallback;
}

export function getEdictRankDesc(id: EdictId, rank: number, fallback: string): string {
  if (activeLanguage === 'zh') {
    return ZH_EDICTS[id]?.ranks[rank - 1] ?? fallback;
  }
  return fallback;
}

const ZH_BADGES: Record<BadgeId, { name: string; desc: string }> = {
  BADGE_WESTARIA_CAMPAIGN_COMPLETE: { name: '西方荣耀', desc: '完成维斯塔利亚公国战役全部 8 关' },
  BADGE_HORDE_CAMPAIGN_COMPLETE: { name: '南方狂潮', desc: '完成赤红汗国战役全部 8 关' },
  BADGE_CULT_CAMPAIGN_COMPLETE: { name: '北境自由', desc: '完成冰谷教团战役全部 8 关' },
  BADGE_WESTARIA_ALL_PERFECT: { name: '圣洁之王', desc: '以金牌通关维斯塔利亚战役全部关卡' },
  BADGE_HORDE_ALL_PERFECT: { name: '无上大汗', desc: '以金牌通关赤红汗国战役全部关卡' },
  BADGE_CULT_ALL_PERFECT: { name: '先知降世', desc: '以金牌通关冰谷教团战役全部关卡' },
  BADGE_WESTARIA_ALL_BASE_EDICTS: { name: '圣主之义', desc: '颁布维斯塔利亚全部 9 项基础法令' },
  BADGE_HORDE_ALL_BASE_EDICTS: { name: '草原法则', desc: '颁布赤红汗国全部 9 项基础法令' },
  BADGE_CULT_ALL_BASE_EDICTS: { name: '教团庇佑', desc: '颁布冰谷教团全部 9 项基础密令' },
  BADGE_ANY_MISSION_PERFECT: { name: '我来我见我征服', desc: '以金牌（< 05:30）通关任意一关' },
  BADGE_VILLAGES_OWNED: { name: '安居乐业', desc: '单局内同时控制 7 座农场' },
  BADGE_MINES_OWNED: { name: '工匠之国', desc: '单局内同时控制 7 座金矿' },
  BADGE_OBELISKS_OWNED: { name: '附魔王国', desc: '单局内同时控制 7 座方尖碑' },
  BADGE_SQUADS_PURCHASED: { name: '全国总动员', desc: '单局内招募 10 支以上小队' },
  BADGE_BANNERS_SET: { name: '旗帜飘扬', desc: '单局内在战场上插下 5 面战旗' },
  BADGE_ULTIMATES_USED: { name: '信仰考验', desc: '单局内施放 5 次终极法术' },
  BADGE_CHESTS_OPENED: { name: '我的宝贝！', desc: '在战斗中开启野外宝箱' },
  BADGE_ENEMY_SQUADS_DESTROYED: { name: '铁血猛攻', desc: '单局内歼灭 30 支敌方小队' },
  BADGE_HEROIC_MODE_ENGAGED: { name: '史诗战役', desc: '单局内使部队进入“英勇”状态 20 次' },
  BADGE_GOLD_COLLECTED: { name: '充盈国库', desc: '单局内累计收集 3,000 金币' },
  BADGE_SQUADS_OWNED: { name: '雄师百万', desc: '同时在场上统领 20 支小队' },
  BADGE_STRONGHOLDS_SIEZED: { name: '易手之城', desc: '单局内攻占据点 10 次以上' },
};

export function getBadgeName(id: BadgeId, fallback: string): string {
  if (activeLanguage === 'zh') {
    return ZH_BADGES[id]?.name ?? fallback;
  }
  return fallback;
}

export function getBadgeDesc(id: BadgeId, fallback: string): string {
  if (activeLanguage === 'zh') {
    return ZH_BADGES[id]?.desc ?? fallback;
  }
  return fallback;
}

const ZH_LEVELS: Record<number, { name: string; briefing: string }> = {
  1: {
    name: '世界边缘',
    briefing: '维斯塔利亚公国坐落于西部群岛，向来远离大陆战火的侵扰。但如今，亡灵的阴霾终于波及至此。',
  },
  2: {
    name: '帝国终焉',
    briefing: '赤红汗国虽曾在多年前被帝国征服，却从未真正屈服。里瓦迪斯陷入混乱，蛮族正企图趁势夺取我们的领土。',
  },
  3: {
    name: '是友是敌？',
    briefing: '我们以圣主之名向污秽之物宣战。西港防备森严难以强攻，但我们可以先遣精锐夺取立足点，打开登陆通道。',
  },
  4: {
    name: '新瘟疫',
    briefing: '必须切断西港与帝都的联系。斥候回报称北方的叛乱教团也在当地活动并施展禁术，我们必须将他们与死灵法师一并铲除！',
  },
  5: {
    name: '光明与魔法',
    briefing: '大陆上的部队正面临两线作战，甚至还要应付汗国的袭击。唯一的出路就是攻克西港，打通后援补给线。',
  },
  6: {
    name: '救赎之药',
    briefing: '汗国军队仍在西海岸威胁着我们的侧翼。让我们彻底将这群蛮族驱逐出圣主恩赐的土地！',
  },
  7: {
    name: '合围之势',
    briefing: '在进攻帝都之前，必须彻底肃清左翼。死灵法师正与北方教团在雪原交战，正好将这两支异端一举歼灭！',
  },
  8: {
    name: '最终决战',
    briefing: '里瓦迪斯帝国必须彻底清除死灵法师并迎来新生。向新帝国欢呼，向新皇帝致敬！为了圣主的荣耀！',
  },

  11: {
    name: '大汗崛起',
    briefing: '汗国曾惨败而狼狈逃窜。但新任大汗将率领勇士走向新的胜利。我们必将雪耻，让敌人血债血偿——如果他们还有血的话……',
  },
  12: {
    name: '劫掠西方',
    briefing: '萨满预言了辉煌的胜利。维斯塔利亚的懦夫休想躲在高墙后苟安，我们要劫掠他们的城镇与神庙，夺取沿海要塞！',
  },
  13: {
    name: '先祖故土',
    briefing: '东方原野曾是我们先祖的故乡，绝不能再让腐朽帝国占据。我们更加强大了，夺回故土的时刻已到！',
  },
  14: {
    name: '东方海角',
    briefing: '死灵法师在东方海角建起了魔法实验室。我们必须在北方巫师赶到之前将它们全部收入囊中。',
  },
  15: {
    name: '高原交锋',
    briefing: '北方巫师与帝国死灵法师挡在通往山隘的要道上。让铁骑与攻城器械以雷霆之怒同时粉碎两支敌军！',
  },
  16: {
    name: '北境财富',
    briefing: '这片土地以地下矿藏闻名。我们要攻占冰谷教团的金矿，让高傲的巫师们沦为我们采掘黄金与宝石的苦力。',
  },
  17: {
    name: '坟墓之秘',
    briefing: '我们的萨满参透了死灵秘术，先祖之魂如今已站在我们身旁。帝国可以将秘密带进坟墓了——因为那些力量现在归我们所有！',
  },
  18: {
    name: '统御众生',
    briefing: '帝国首都就在眼前，正是这座城市世代屠戮我们的族人。今日大汗将君临天下，统御世间一切生者与亡灵。',
  },

  21: {
    name: '教团觉醒',
    briefing: '帝国奴役我们，教会迫害我们的巫师，草原蛮族洗劫我们的城镇。昔日我们因准备不足而起义失败，但如今教团已脱胎换骨。',
  },
  22: {
    name: '帝国余孽',
    briefing: '帝都密探传来骇人消息：大汗与萨满已被死灵术彻底腐蚀。在危机爆发前，必须先清剿滞留我方领地的帝国残部。',
  },
  23: {
    name: '狂热圣殿军',
    briefing: '维斯塔利亚本可成为盟友，但狂热的圣殿骑士团阻拦了使节。他们对我们的仇恨甚至超过了亡灵。那就为自由而战吧！',
  },
  24: {
    name: '亡灵边界',
    briefing: '帝都传来噩耗：大批亡灵从城中涌出，被复活的汗国战士反噬了他们的主人。我们必须在边境线上拦截这场亡灵狂潮。',
  },
  25: {
    name: '北境净化',
    briefing: '妄图操弄黑暗力量终究自食恶果。瘟疫正从内部吞噬汗国与亡灵残余，由我们亲手为他们降下净化与终结。',
  },
  26: {
    name: '强袭平原',
    briefing: '我们终于与维斯塔利亚达成同盟。我军从东路突进，盟军自南路夹击。必须抓紧时间——帝都外围的前锋部队已近力竭。',
  },
  27: {
    name: '围困帝都',
    briefing: '同盟掌控之外的土地仍遍布亡灵大军。与维斯塔利亚军团并肩作战，彻底完成对帝国首都的合围。',
  },
  28: {
    name: '光与霜之歌',
    briefing: '我们再次在战场上与维斯塔利亚并肩而立。让圣主之光与北方极寒魔法交融，将亡灵彻底从这个世界抹去！',
  },
};

export function getLevelName(levelId: number, fallback: string): string {
  if (activeLanguage === 'zh') {
    return ZH_LEVELS[levelId]?.name ?? fallback;
  }
  return fallback;
}

export function getLevelBriefing(levelId: number, fallback: string): string {
  if (activeLanguage === 'zh') {
    return ZH_LEVELS[levelId]?.briefing ?? fallback;
  }
  return fallback;
}
