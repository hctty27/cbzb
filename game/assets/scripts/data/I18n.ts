import { BadgeId, EdictId, FactionId, MedalRank, PlayableCampaignId, SpellId, StrongholdKind } from './Types';
import { LanguageCode } from './UserSettings';

let activeLanguage: LanguageCode = 'zh';

export function getLanguage(): LanguageCode {
  return activeLanguage;
}

export function setLanguage(lang: LanguageCode): void {
  activeLanguage = lang === 'en' ? 'en' : 'zh';
}

const EN_UI = {
  // Title
  title_game_name: 'SHANHAI FENGHUO',
  title_tagline: 'THE SEAL SHATTERED · NINE PROVINCES AFLAME',
  title_subtitle: '3 FACTIONS · 24 CHAPTERS · 27 IMPERIAL DECREES · 22 MERITS',
  title_btn_campaign: 'CAMPAIGN',
  title_btn_quick: 'CH.1 QUICK PLAY',
  title_sound_on: 'SOUND: ON',
  title_sound_off: 'SOUND: OFF',
  title_btn_save: 'SAVE DATA',
  title_attr: 'Shanhai Fenghuo · Original Eastern Fantasy RTS · 16:9',
  lang_toggle_btn: 'EN / 中文',

  // Campaign Select
  select_title: 'SELECT FACTION — NINE PROVINCES',
  select_badges_btn: 'MERITS ({unlocked}/{total})',
  select_back_menu: 'MAIN MENU',
  select_play_btn: 'ENTER CAMPAIGN',
  select_card_stats: 'Chapters: {done} / 8  (Gold: {golds})\nCommander Rank: {rank} · Free Pts: {pts}',

  // Campaign Map
  map_rank_xp: 'RANK {rank} · XP {xp} / {next}',
  map_rank_max: 'RANK {rank} (MAX)',
  map_edict_pts: 'DECREE PTS: {pts}',
  map_btn_throne: 'DECREE HALL',
  map_btn_badges: 'MERITS',
  map_btn_campaigns: 'FACTIONS',
  map_mission_title: 'CHAPTER {num}: {name}',
  map_mission_meta: 'Reward: +{xp} XP  |  Enemy Tier: T{tier}\nHostiles:\n  {enemies}',
  map_record_conquered: 'Status: CONQUERED ({medal} Seal)\nBest Time: {time}',
  map_record_ready: 'Status: READY FOR BATTLE\nGold < 05:30 · Silver <= 09:30',
  map_btn_start: 'MARCH TO WAR',
  map_freeplay_on: 'FREE PLAY: ALL OPEN (ON)',
  map_freeplay_off: 'FREE PLAY: UNLOCK ALL',

  // Throne Room
  throne_title_westaria: 'JIUZHOU IMPERIAL HALL — HUMAN DECREES',
  throne_title_khaganate: 'WILDERNESS ALTAR — BEAST OATHS',
  throne_title_cult: 'KUNLUN SANCTUM — CELESTIAL MANDATES',
  throne_available_pts: 'AVAILABLE POINTS: {pts}',
  throne_btn_reset: 'RESET DECREES',
  throne_btn_back: 'BACK TO WORLD MAP',
  throne_maxed: 'MAXED',
  throne_upgrade: 'UPGRADE TO LV.{lv} (1 PT)',
  throne_need_pt: 'NEED DECREE PT',
  throne_sum_khaganate:
    'Beast Horde: Inf T{inf} · Rng T{arc} · Cav T{cav} · Siege T{siege}   |   Arts: {spells}/4   |   Speed ×{spd} · Loot +{cap} · Venom +{poi}',
  throne_sum_cult:
    'Celestial Army: Inf T{inf} · Rng T{arc} · Cav T{cav} · Sup T{mag}   |   Arts: {spells}/4   |   Build Cost ×{sup} · Art Cost ×{spc} · Sanctum +{twr}',
  throne_sum_westaria:
    'Human Army: Inf T{inf} · Rng T{arc} · Cav T{cav} · Sup T{mag}   |   Arts: {spells}/4   |   Start +{gold}g · Citadel HP ×{shp} · Charge ×{chg}',

  // Badges Room
  badges_title: 'HALL OF MERITS — ACHIEVEMENTS',
  badges_unlocked_count: 'UNLOCKED: {unlocked} / {total}',
  badges_page_1: 'PAGE 1 (1-12)',
  badges_page_2: 'PAGE 2 (13-22)',
  badges_back: 'BACK',
  badges_footer:
    'Showing Merits {range} of {total}  ·  Complete campaigns, Gold seals, decrees & combat feats to unlock',
  badges_status_unlocked: '★ UNLOCKED',
  badges_status_locked: 'LOCKED',

  // Loading Overlay
  load_mission_header: 'CHAPTER {num}: {name}',
  load_connecting: 'CONNECTING TO ASSET BUNDLE... 0%',
  load_gameplay_bundle: 'LOADING BATTLEFIELD ASSETS...',
  load_mission_data: 'LOADING CHAPTER DATA...',
  load_battlefield_map: 'LOADING PROVINCE TERRAIN...',
  load_retrying_bundle: 'BATTLEFIELD ASSETS RETRYING ({next}/{max})...',
  load_retrying_mission: 'CHAPTER DATA RETRYING ({next}/{max})...',
  load_retrying_map: 'PROVINCE TERRAIN RETRYING ({next}/{max})...',
  load_ready: 'READY!',
  load_failed_title: 'CHAPTER ASSET LOAD FAILED',
  load_failed_detail: 'Network/CDN error: {detail}',
  load_btn_retry: 'RETRY',
  load_btn_back: 'BACK',

  // Battle HUD
  hud_gold: 'GOLD: {gold} (+{rate}/s)',
  hud_supply: 'SUPPLY: {used}/{total}',
  hud_mana: 'ESSENCE: {mana}/500',
  hud_time: 'TIME: {time}  (GOLD <05:30)',
  hud_speed_1x: '1X [F]',
  hud_speed_2x: '2X [F]',
  hud_pause_btn: 'PAUSE [SPC]',
  hud_mute_off: 'SFX ON [M]',
  hud_mute_on: 'MUTED [M]',
  hud_map_btn: 'MAP',
  hud_cancel_spell: 'CANCEL [ESC]',
  hud_targeting: 'TARGETING: {spell} — Tap/Click battlefield to invoke',
  hud_mission_obj: 'Ch.{num}: {name} — Seize all hostile strongholds!',
  hud_spell_locked: 'LOCKED',
  hud_spell_ready: 'READY!',
  hud_spell_mana: '{cost}e',
  hud_fort_header: '{name} (Lv.{lv}) · HP {hp}/{maxHp}',
  hud_unit_cost: '{cost}g · {upkeep}sup',
  hud_no_supply: 'NO SUPPLY',
  hud_upgrade_max: 'MAX\nLEVEL',
  hud_upgrade_cost: 'FORTIFY\n{cost} Gold\n(+50% HP)',
  hud_build_title: 'CONSTRUCT RESOURCE SITE ({cost} Gold)',
  hud_build_farm: 'Granary\n+1 Supply',
  hud_build_mine: 'Mint Mine\n+2 Gold/s',
  hud_build_obelisk: 'Essence Stele\n+1 Essence/s',
  hud_march_btn: 'ATTACK ENEMY',
  hud_squad_info: '{name}{tags} ({alive}/{total}, HP {hp}/{maxHp})\nTap map or hostile stronghold to march & engage',
  hud_tag_heroic: 'INSPIRED',
  hud_tag_bloodlust: 'FRENZIED',
  hud_tag_frost: 'AEGIS',
  hud_tag_liberation: 'PURIFIED',
  hud_tag_frozen: 'SEALED',
  hud_tag_poisoned: 'VENOMED',
  hud_tag_feared: 'SHAKEN',

  // Pause Modal
  pause_title: 'BATTLE PAUSED',
  pause_bgm: 'BGM: {pct}%',
  pause_sfx: 'SFX: {pct}%',
  pause_lang_row: 'LANGUAGE: ENGLISH',
  pause_lang_btn: '中文',
  pause_resume: 'RESUME',
  pause_restart: 'RESTART CHAPTER',
  pause_map: 'WORLD MAP',
  pause_menu: 'MAIN MENU',

  // Result Overlay
  result_victory: 'VICTORY! ({medal} SEAL)',
  result_defeat: 'DEFEAT',
  result_btn_next: 'NEXT CHAPTER',
  result_btn_throne: 'DECREE HALL',
  result_btn_map: 'WORLD MAP',
  result_btn_replay: 'REPLAY',
  result_reward_xp: '\nEarned XP: +{xp}  |  Rank: {rank}{pts}',
  result_reward_pts: ' (+{pts} Decree Points!)',
  result_badges_unlocked: '\nMerits Unlocked: {list}',
  result_details:
    'Chapter {num}: {name}\nTime: {time}   (Gold < 05:30, Silver <= 09:30)\nHostile Squads Defeated: {kills}   |   Allied Squads Lost: {lost}',

  // Battle Floating Text
  vfx_veteran_up: 'VETERAN PROMOTED!',
  vfx_lords_judgement: 'RAIN OF ARROWS!',
  vfx_stoneworms: 'VENOM MIST!',
  vfx_immortals_risen: 'SPIRITS SUMMONED!',
  vfx_undead_raised: 'SOULS CORRODED!',
  vfx_frozen: 'FROST SEALED!',
  vfx_frost_enchant: 'HEAVENLY AEGIS!',
  vfx_cataclysm: 'WILDERNESS STAMPEDE!',
  vfx_transformation: 'HEAVENLY PUNISHMENT +{gold}G/E!',
  vfx_lords_avatar: 'SOVEREIGN DECREE!',
  vfx_gold_gain: '+{gold} GOLD!',

  // Save Data Modal
  save_modal_title: 'SAVE DATA BACKUP & TRANSFER',
  save_summary: 'Progress: {done}/24 Chapters · {golds} Gold Seals · {badges}/22 Merits',
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
  save_status_downloaded: 'Downloaded shanhai-fenghuo-save.txt!',
  save_status_download_unavail: 'File download is unavailable in this runtime.',
  save_status_imported: 'Imported! {done}/24 chapters, {badges}/22 merits restored.',
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
  title_game_name: '山海烽火',
  title_tagline: '山海封印已破，九州烽火再起',
  title_subtitle: '3 大阵营 · 24 关战役 · 27 项诏令 · 22 枚山海功勋',
  title_btn_campaign: '九州征战',
  title_btn_quick: '第1关 烽火初起',
  title_sound_on: '声音: 开',
  title_sound_off: '声音: 关',
  title_btn_save: '存档管理',
  title_attr: '山海烽火 · 东方神话原创即时战略 · 16:9',
  lang_toggle_btn: '中文 / EN',

  // Campaign Select
  select_title: '选择阵营 — 九州风云',
  select_badges_btn: '功勋 ({unlocked}/{total})',
  select_back_menu: '返回主菜单',
  select_play_btn: '统兵出征',
  select_card_stats: '章节进度: {done} / 8  (金印: {golds})\n统帅境界: {rank} · 可用诏令点: {pts}',

  // Campaign Map
  map_rank_xp: '境界 {rank} · 战功 {xp} / {next}',
  map_rank_max: '境界 {rank} (圆满)',
  map_edict_pts: '诏令点: {pts}',
  map_btn_throne: '议政大殿',
  map_btn_badges: '山海功勋',
  map_btn_campaigns: '切换阵营',
  map_mission_title: '第 {num} 章: {name}',
  map_mission_meta: '胜利奖励: +{xp} 战功  |  敌军阶位: T{tier}\n敌对势力:\n  {enemies}',
  map_record_conquered: '战况: 已平定 ({medal}印)\n最佳用时: {time}',
  map_record_ready: '战况: 整军待发\n金印 < 05:30 · 银印 <= 09:30',
  map_btn_start: '起兵出征',
  map_freeplay_on: '自由演武: 全章节已解锁 (开)',
  map_freeplay_off: '自由演武: 解锁全部章节',

  // Throne Room
  throne_title_westaria: '九州议政殿 — 人皇诏令',
  throne_title_khaganate: '大荒战坛 — 妖盟祖训',
  throne_title_cult: '昆仑玉虚殿 — 天道法旨',
  throne_available_pts: '可用诏令点: {pts}',
  throne_btn_reset: '重置诏令',
  throne_btn_back: '返回九州沙盘',
  throne_maxed: '已圆满',
  throne_upgrade: '研习至 Lv.{lv} (1 点)',
  throne_need_pt: '需要诏令点',
  throne_sum_khaganate:
    '妖盟军势: 步T{inf} · 射T{arc} · 骑T{cav} · 巨兽T{siege}   |   妖术: {spells}/4   |   移速×{spd} · 破城+{cap}金铢 · 蚀毒+{poi}',
  throne_sum_cult:
    '神庭天军: 步T{inf} · 射T{arc} · 骑T{cav} · 辅T{mag}   |   神术: {spells}/4   |   建造耗费×{sup} · 术耗×{spc} · 聚灵塔+{twr}',
  throne_sum_westaria:
    '人皇军阵: 步T{inf} · 弩T{arc} · 骑T{cav} · 辅T{mag}   |   军策: {spells}/4   |   初始+{gold}金铢 · 城防×{shp} · 冲锋×{chg}',

  // Badges Room
  badges_title: '山海功勋殿 — 征战铭录',
  badges_unlocked_count: '已铭刻: {unlocked} / {total}',
  badges_page_1: '第 1 卷 (1-12)',
  badges_page_2: '第 2 卷 (13-22)',
  badges_back: '返回',
  badges_footer: '当前显示第 {range} 枚功勋（共 {total} 枚） · 完成战役、金印、诏令与战场壮举即可解锁',
  badges_status_unlocked: '★ 已解锁',
  badges_status_locked: '未解锁',

  // Loading Overlay
  load_mission_header: '第 {num} 章: {name}',
  load_connecting: '正在接入山海资源分包... 0%',
  load_gameplay_bundle: '正在载入战场军阵资源...',
  load_mission_data: '正在载入章节推演数据...',
  load_battlefield_map: '正在铺展九州战场舆图...',
  load_retrying_bundle: '战场资源重试中 ({next}/{max})...',
  load_retrying_mission: '章节数据重试中 ({next}/{max})...',
  load_retrying_map: '战场舆图重试中 ({next}/{max})...',
  load_ready: '战阵就绪!',
  load_failed_title: '战场资源加载失败',
  load_failed_detail: '网络或资源异常: {detail}',
  load_btn_retry: '重试',
  load_btn_back: '返回',

  // Battle HUD
  hud_gold: '金铢: {gold} (+{rate}/秒)',
  hud_supply: '军粮: {used}/{total}',
  hud_mana: '玄息: {mana}/500',
  hud_time: '战时: {time}  (金印<05:30)',
  hud_speed_1x: '1倍 [F]',
  hud_speed_2x: '2倍 [F]',
  hud_pause_btn: '暂停 [SPC]',
  hud_mute_off: '音效开 [M]',
  hud_mute_on: '静音 [M]',
  hud_map_btn: '沙盘',
  hud_cancel_spell: '取消 [ESC]',
  hud_targeting: '施法瞄准: {spell} — 点击战场目标位置施放',
  hud_mission_obj: '第 {num} 章: {name} — 夺取全部敌方据点!',
  hud_spell_locked: '未解锁',
  hud_spell_ready: '已蓄满!',
  hud_spell_mana: '{cost}玄息',
  hud_fort_header: '{name} (Lv.{lv}) · 城防 {hp}/{maxHp}',
  hud_unit_cost: '{cost}金铢 · {upkeep}粮',
  hud_no_supply: '军粮不足',
  hud_upgrade_max: '已达\n满阶',
  hud_upgrade_cost: '加固城防\n{cost} 金铢\n(+50% 耐久)',
  hud_build_title: '营建补给建筑 ({cost} 金铢)',
  hud_build_farm: '粮仓\n+1 军粮',
  hud_build_mine: '金铢矿场\n+2 金铢/秒',
  hud_build_obelisk: '玄息碑\n+1 玄息/秒',
  hud_march_btn: '进击敌阵',
  hud_squad_info: '{name}{tags} ({alive}/{total}, 气血 {hp}/{maxHp})\n点击沙盘行军或点击敌方据点发起攻城',
  hud_tag_heroic: '振奋',
  hud_tag_bloodlust: '狂怒',
  hud_tag_frost: '天罡护',
  hud_tag_liberation: '清灵',
  hud_tag_frozen: '封灵',
  hud_tag_poisoned: '蚀毒',
  hud_tag_feared: '惊惧',

  // Pause Modal
  pause_title: '战局暂停',
  pause_bgm: '配乐音量: {pct}%',
  pause_sfx: '音效音量: {pct}%',
  pause_lang_row: '当前语言: 简体中文',
  pause_lang_btn: 'English',
  pause_resume: '重返战场',
  pause_restart: '重开本章',
  pause_map: '九州沙盘',
  pause_menu: '返回主菜单',

  // Result Overlay
  result_victory: '大获全胜! ({medal}印)',
  result_defeat: '兵败溃散',
  result_btn_next: '下一章',
  result_btn_throne: '议政大殿',
  result_btn_map: '九州沙盘',
  result_btn_replay: '再战本章',
  result_reward_xp: '\n获得战功: +{xp}  |  统帅境界: {rank}{pts}',
  result_reward_pts: ' (+{pts} 诏令点!)',
  result_badges_unlocked: '\n铭刻山海功勋: {list}',
  result_details:
    '第 {num} 章: {name}\n耗时: {time}   (金印 < 05:30, 银印 <= 09:30)\n击溃敌部: {kills} 队   |   我军折损: {lost} 队',

  // Battle Floating Text
  vfx_veteran_up: '百战精锐!',
  vfx_lords_judgement: '万弩齐发!',
  vfx_stoneworms: '蚀骨毒雾!',
  vfx_immortals_risen: '妖魂现世!',
  vfx_undead_raised: '蚀魂降临!',
  vfx_frozen: '寒天封灵!',
  vfx_frost_enchant: '天罡庇护!',
  vfx_cataclysm: '大荒兽潮!',
  vfx_transformation: '天罚降世 +{gold} 金/息!',
  vfx_lords_avatar: '人皇御令!',
  vfx_gold_gain: '+{gold} 金铢!',

  // Save Data Modal
  save_modal_title: '存档备份与跨端转移',
  save_summary: '征战进度: 已通关 {done}/24 章 · 金印 {golds} 枚 · 功勋 {badges}/22 枚',
  save_code_hint: '当前存档转移码 (Base64 + 校验和):',
  save_btn_copy: '复制存档码',
  save_btn_download: '导出 .TXT',
  save_btn_import: '导入存档码',
  save_btn_reset: '重置存档',
  save_btn_reset_confirm: '确认清空?',
  save_btn_close: '关闭',
  save_status_ready: '复制或导出存档码，即可在其他设备/浏览器恢复全部征战进度。',
  save_status_copied: '存档码已复制到剪贴板!',
  save_status_copy_fallback: '剪贴板权限受限 — 请使用“导出 .TXT”保存文件。',
  save_status_downloaded: '已下载 shanhai-fenghuo-save.txt 存档文件!',
  save_status_download_unavail: '当前运行环境不支持文件下载。',
  save_status_imported: '导入成功! 已恢复 {done}/24 章进度与 {badges}/22 枚功勋。',
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
  '军情指引 1/4: 点击下方“镇国城”，消耗 100 金铢招募【铁甲卫】！',
  '军情指引 2/4: 选中【铁甲卫】，点击来犯混沌【蚀魂兵】或上方蚀魂聚落迎敌！',
  '军情指引 3/4: 已解锁【弩兵】！在空地建造粮仓/矿场补给，稳步推进！',
  '军情指引 4/4: 攻克右上角混沌【裂隙魔殿】即可平定第一章！（金印 < 05:30）',
];

const EN_TUTORIAL1_HINTS = [
  'Guide 1/4: Select your ZhenGuo Citadel (bottom) and recruit Iron Guards (100 Gold).',
  'Guide 2/4: Select your Iron Guard squad and click hostile Soul Corroders or the Rift Outpost!',
  'Guide 3/4: Crossbowmen unlocked! Build a Granary or Mint Mine on an empty Build Site.',
  'Guide 4/4: Seize the Chaos Rift Sanctum (top-right) to win Chapter 1! (Gold Seal < 05:30)',
];

const ZH_TUTORIAL2_HINTS = [
  '第二章: 从军营整编出征，击退盘踞金宝箱 (+500 金铢) 的大荒饕餮！',
  '军策提示: 施放【铁壁军阵】(50 玄息) 可在混战中护盾回血并重整溃兵！',
  '战略目标: 夺取【镇灵台】积蓄“人皇御令”气运，击破九黎妖盟防线！',
  '胜券在握: 气运蓄满可召“人皇法相”压阵，或直取敌方主城！',
];

const EN_TUTORIAL2_HINTS = [
  'Chapter 2: Recruit from your Barracks and defeat the Taotie Brute guarding the Relic Chest (+500g)!',
  'Tactic: Cast Iron Wall Formation (50 Essence) to heal & rally wounded allied guards!',
  'Objective: Seize the Spirit Sanctum to charge Sovereign Decree, then break the Beast Alliance!',
  'Victory Near: Summon Sovereign Avatar when ready or capture the enemy stronghold!',
];

export function getTutorialHint(mode: 'tutorial1' | 'tutorial2', step: number, _legacyHints?: string[]): string {
  const arr =
    activeLanguage === 'zh'
      ? mode === 'tutorial1'
        ? ZH_TUTORIAL1_HINTS
        : ZH_TUTORIAL2_HINTS
      : mode === 'tutorial1'
        ? EN_TUTORIAL1_HINTS
        : EN_TUTORIAL2_HINTS;
  return arr[Math.min(step, arr.length - 1)] ?? arr[0] ?? '';
}

const ZH_CAMPAIGN_TITLES: Record<PlayableCampaignId, string> = {
  Westaria: '九州人皇篇',
  TheKhaganate: '九黎妖盟篇',
  TheCult: '昆仑神庭篇',
};

const EN_CAMPAIGN_TITLES: Record<PlayableCampaignId, string> = {
  Westaria: 'NINE-PROVINCES DYNASTY',
  TheKhaganate: 'JIULI BEAST ALLIANCE',
  TheCult: 'KUNLUN CELESTIAL COURT',
};

export function getCampaignTitle(campaign: PlayableCampaignId): string {
  return activeLanguage === 'zh' ? ZH_CAMPAIGN_TITLES[campaign] : EN_CAMPAIGN_TITLES[campaign];
}

const ZH_CAMPAIGN_CARDS: Record<PlayableCampaignId, { title: string; subtitle: string; lore: string }> = {
  Westaria: {
    title: '九州人皇',
    subtitle: '以人之力，重定九州 · 军阵工程',
    lore: '天裂劫后王朝分崩，聚人族铁甲军阵与神机弩械，护佑中州城郭，涤荡混沌裂隙。',
  },
  TheKhaganate: {
    title: '九黎妖盟',
    subtitle: '山川归荒，万灵自由 · 奇袭狂潮',
    lore: '汇聚大荒异兽与山林古老祭司，凭高机动狼骑与兽潮召唤夺回祖灵山川。',
  },
  TheCult: {
    title: '昆仑神庭',
    subtitle: '天道不可违，万物归于序 · 雷霆寒霜',
    lore: '执掌昆仑白玉神宫与上古符文傀儡，以九霄雷霆与寒天封灵重整失序九州。',
  },
};

const EN_CAMPAIGN_CARDS: Record<PlayableCampaignId, { title: string; subtitle: string; lore: string }> = {
  Westaria: {
    title: 'NINE-PROVINCES DYNASTY',
    subtitle: 'Order, Shield Formations & Siegecraft',
    lore: 'Rally disciplined human iron guards, crossbows, and siege engines to defend Zhongzhou and seal the rifts.',
  },
  TheKhaganate: {
    title: 'JIULI BEAST ALLIANCE',
    subtitle: 'Wilderness Beasts, Raids & Totems',
    lore: 'Unite fierce mountain spirits, wolf riders, and shamanic summons to reclaim ancestral wildlands.',
  },
  TheCult: {
    title: 'KUNLUN CELESTIAL COURT',
    subtitle: 'Divine Thunder, Frost & Rune Golems',
    lore: 'Wield jade sanctum arts, arcane frost seals, and sacred rune constructs to restore cosmic order.',
  },
};

export function getCampaignCardCopy(campaign: PlayableCampaignId): { title: string; subtitle: string; lore: string } {
  return activeLanguage === 'zh' ? ZH_CAMPAIGN_CARDS[campaign] : EN_CAMPAIGN_CARDS[campaign];
}

const ZH_FACTIONS: Record<string, string> = {
  Westaria: '九州人皇 (朱金)',
  TheEmpire: '混沌势力 (幽紫)',
  TheKhaganate: '九黎妖盟 (苍绿)',
  TheCult: '昆仑神庭 (霜蓝)',
  Bandits: '大荒异兽 (中立)',
};

const EN_FACTIONS: Record<string, string> = {
  Westaria: 'Nine-Provinces Dynasty',
  TheEmpire: 'Chaos Rift',
  TheKhaganate: 'Jiuli Beast Alliance',
  TheCult: 'Kunlun Celestial Court',
  Bandits: 'Wilderness Beasts',
};

export function getFactionLabel(factionId: string): string {
  const map = activeLanguage === 'zh' ? ZH_FACTIONS : EN_FACTIONS;
  return map[factionId] ?? factionId;
}

const ZH_STRONGHOLDS: Record<FactionId, Record<StrongholdKind, string>> = {
  Westaria: { Castle: '镇国城', Town: '郡城', Camp: '军营', MagicTower: '镇灵台' },
  TheCult: { Castle: '昆仑神宫', Town: '灵台', Camp: '天兵殿', MagicTower: '聚灵塔' },
  TheKhaganate: { Castle: '万妖寨', Town: '妖族聚落', Camp: '兽穴', MagicTower: '血灵祭坛' },
  TheEmpire: { Castle: '裂隙魔殿', Town: '蚀魂聚落', Camp: '裂隙兵巢', MagicTower: '混沌巫坛' },
  Bandits: { Castle: '大荒巨巢', Town: '荒野山寨', Camp: '妖兽窟', MagicTower: '古祭坛' },
};

const EN_STRONGHOLDS: Record<FactionId, Record<StrongholdKind, string>> = {
  Westaria: { Castle: 'ZhenGuo Citadel', Town: 'Commandery Town', Camp: 'Barracks', MagicTower: 'Spirit Terrace' },
  TheCult: { Castle: 'Kunlun Palace', Town: 'Jade Terrace', Camp: 'Celestial Hall', MagicTower: 'Spirit Pagoda' },
  TheKhaganate: { Castle: 'WanYao Stockade', Town: 'Tribal Settlement', Camp: 'Beast Den', MagicTower: 'Blood Altar' },
  TheEmpire: { Castle: 'Rift Sanctum', Town: 'Corrupted Hamlet', Camp: 'Rift Nest', MagicTower: 'Chaos Shrine' },
  Bandits: { Castle: 'Wild Lair', Town: 'Beast Camp', Camp: 'Feral Den', MagicTower: 'Ancient Altar' },
};

export function getStrongholdDisplayName(kind: StrongholdKind, owner: FactionId, fallback?: string): string {
  const table = activeLanguage === 'zh' ? ZH_STRONGHOLDS : EN_STRONGHOLDS;
  return table[owner]?.[kind] ?? fallback ?? kind;
}

const ZH_MEDALS: Record<MedalRank, string> = {
  Gold: '金',
  Silver: '银',
  Bronze: '铜',
};

export function getMedalLabel(medal: MedalRank): string {
  return activeLanguage === 'zh' ? ZH_MEDALS[medal] : medal.toUpperCase();
}

const ZH_UNITS: Record<string, string> = {
  w_guards: '铁甲卫',
  w_swordsmen: '玄甲卫',
  w_legionaries: '禁军玄甲将',
  w_archers: '弩兵',
  w_crossbowmen: '神机弩手',
  w_knights: '羽林骑',
  w_champions: '虎贲铁骑',
  w_monks: '军阵师',
  w_zealots: '天策军师',
  w_avatar: '人皇法相',
  w_trebuchet: '投石车',

  e_undying_warriors: '蚀魂兵',
  e_zombie_warriors: '深渊腐卒',
  e_undying_archers: '幽冥射手',
  e_skeleton_archers: '裂隙骨弓手',
  e_undying_horsemen: '冥骨兽骑',
  e_dark_knights: '冥渊魔骑',
  e_undying_assassins: '混沌巫使',
  e_shades: '天裂鬼魅',
  e_trebuchet: '深渊巨兽',
  e_poison_catapult: '混沌灭城兽',

  k_warriors: '山魈战士',
  k_immortals: '虎魄战将',
  k_hunters: '毒羽妖',
  k_serpent_archers: '风翎妖卫',
  k_nomads: '狼骑兵',
  k_raiders: '赤焰兽骑',
  k_ancient_raiders: '太古战兽骑',
  k_assassins: '狐灵祭司',
  k_trebuchet: '巨角兽',
  k_poison_catapult: '山岳巨兽',

  b_rebels: '天兵',
  b_myrmidons: '玉甲天卫',
  b_gunsmiths: '灵弓使',
  b_gunbots: '星辰射手',
  b_giantbots: '镇天神像',
  b_lancers: '云骑',
  b_dragon_lancers: '天马神骑',
  b_acolytes: '御灵师',
  b_wizards: '雷法天师',
  b_trebuchet: '符文傀儡',

  n_ogre: '饕餮凶兽',
};

const EN_UNITS: Record<string, string> = {
  w_guards: 'Iron Guard',
  w_swordsmen: 'Xuanjia Guard',
  w_legionaries: 'Imperial Halberdier',
  w_archers: 'Crossbowman',
  w_crossbowmen: 'Divine Crossbow',
  w_knights: 'Yulin Rider',
  w_champions: 'Huben Cataphract',
  w_monks: 'Strategist',
  w_zealots: 'Tiance Advisor',
  w_avatar: 'Sovereign Avatar',
  w_trebuchet: 'War Trebuchet',

  e_undying_warriors: 'Soul Corroder',
  e_zombie_warriors: 'Abyss Thrall',
  e_undying_archers: 'Nether Marksman',
  e_skeleton_archers: 'Rift Bone Archer',
  e_undying_horsemen: 'Bone Beast Rider',
  e_dark_knights: 'Abyss Dread Rider',
  e_undying_assassins: 'Chaos Warlock',
  e_shades: 'Rift Wraith',
  e_trebuchet: 'Abyss Behemoth',
  e_poison_catapult: 'Chaos Juggernaut',

  k_warriors: 'Mandrill Warrior',
  k_immortals: 'Tiger Champion',
  k_hunters: 'Venom Feather',
  k_serpent_archers: 'Wind Plume Guard',
  k_nomads: 'Wolf Rider',
  k_raiders: 'Crimson Beast Rider',
  k_ancient_raiders: 'Ancient Totem Rider',
  k_assassins: 'Fox Shaman',
  k_trebuchet: 'Great-Horn Beast',
  k_poison_catapult: 'Mountain Colossus',

  b_rebels: 'Heavenly Soldier',
  b_myrmidons: 'Jade Warden',
  b_gunsmiths: 'Spirit Archer',
  b_gunbots: 'Star Marksman',
  b_giantbots: 'Divine Statue',
  b_lancers: 'Cloud Rider',
  b_dragon_lancers: 'Tianma Knight',
  b_acolytes: 'Spirit Tamer',
  b_wizards: 'Thunder Master',
  b_trebuchet: 'Rune Golem',

  n_ogre: 'Taotie Brute',
};

export function getUnitName(defId: string, fallback: string): string {
  if (activeLanguage === 'zh') {
    return ZH_UNITS[defId] ?? fallback;
  }
  return EN_UNITS[defId] ?? fallback;
}

const ZH_SPELLS: Record<SpellId, { name: string; shortName: string }> = {
  lords_judgement: { name: '万弩齐发', shortName: '万弩' },
  banner_consecration: { name: '铁壁军阵', shortName: '铁壁' },
  banner_heroism: { name: '战鼓振军', shortName: '战鼓' },
  sign_of_advent: { name: '人皇御令', shortName: '御令' },

  summon_stoneworms: { name: '蚀骨毒雾', shortName: '毒雾' },
  disentomb: { name: '妖魂召唤', shortName: '妖魂' },
  banner_bloodlust: { name: '万兽狂怒', shortName: '狂怒' },
  cataclysm: { name: '大荒兽潮', shortName: '兽潮' },

  ice_blast: { name: '寒天封灵', shortName: '封灵' },
  frost_enchantment: { name: '天罡庇护', shortName: '天罡' },
  banner_liberation: { name: '九霄落雷', shortName: '清雷' },
  grand_transformation: { name: '天罚降世', shortName: '天罚' },

  terror: { name: '裂隙惊惧', shortName: '惊惧' },
  raise_the_dead: { name: '蚀魂招降', shortName: '蚀魂' },
  banner_desecration: { name: '混沌污浊阵', shortName: '污浊' },
  call_of_the_grave: { name: '深渊侵蚀', shortName: '侵蚀' },
};

const EN_SPELLS: Record<SpellId, { name: string; shortName: string }> = {
  lords_judgement: { name: 'Rain of Arrows', shortName: 'Volley' },
  banner_consecration: { name: 'Iron Wall Formation', shortName: 'Iron Wall' },
  banner_heroism: { name: 'War Drums', shortName: 'Drums' },
  sign_of_advent: { name: 'Sovereign Decree', shortName: 'Decree' },

  summon_stoneworms: { name: 'Bone Venom Mist', shortName: 'Venom' },
  disentomb: { name: 'Spirit Summon', shortName: 'Spirits' },
  banner_bloodlust: { name: 'Feral Frenzy', shortName: 'Frenzy' },
  cataclysm: { name: 'Wilderness Stampede', shortName: 'Stampede' },

  ice_blast: { name: 'Frost Seal', shortName: 'Frost Seal' },
  frost_enchantment: { name: 'Heavenly Aegis', shortName: 'Aegis' },
  banner_liberation: { name: 'Nine-Heavens Aura', shortName: 'Aura' },
  grand_transformation: { name: 'Heavenly Punishment', shortName: 'Judgment' },

  terror: { name: 'Rift Dread', shortName: 'Dread' },
  raise_the_dead: { name: 'Soul Corrosion', shortName: 'Corrode' },
  banner_desecration: { name: 'Miasma Altar', shortName: 'Miasma' },
  call_of_the_grave: { name: 'Abyssal Tide', shortName: 'Abyss' },
};

export function getSpellName(
  spellId: SpellId,
  short: boolean,
  fallbackName: string,
  fallbackShort: string,
): string {
  const entry = activeLanguage === 'zh' ? ZH_SPELLS[spellId] : EN_SPELLS[spellId];
  if (entry) return short ? entry.shortName : entry.name;
  return short ? fallbackShort : fallbackName;
}

const ZH_EDICTS: Record<EdictId, { name: string; ranks: [string, string, string] }> = {
  lords_church: {
    name: '玄甲营制',
    ranks: ['解锁军策【铁壁军阵】', '所有军阵持续时间 +25%', '所有军阵持续时间 +50%'],
  },
  ducal_sovereignty: {
    name: '九州诏命',
    ranks: ['解锁人族基础兵种征募', '开局初始金铢 +75', '开局初始金铢 +150'],
  },
  call_crusade: {
    name: '神机箭库',
    ranks: ['解锁军策【万弩齐发】', '【万弩齐发】伤害 +15%', '【万弩齐发】伤害 +30%'],
  },
  town_guilds: {
    name: '城防营建',
    ranks: ['铁甲卫进阶为【玄甲卫】', '我方全部据点耐久 +15%', '我方全部据点耐久 +30%'],
  },
  zealots_order: {
    name: '天策枢府',
    ranks: ['军阵师进阶为【天策军师】', '【人皇御令】充能需求 -10%', '【人皇御令】充能需求 -20%'],
  },
  mechanics_research: {
    name: '工部军械',
    ranks: ['弩兵进阶为【神机弩手】', '远程与攻城器械伤害 +10%', '远程与攻城器械伤害 +20%'],
  },
  heroic_epos: {
    name: '太庙战鼓',
    ranks: ['解锁军策【战鼓振军】', '全军基础士气 +7%', '全军基础士气 +15%'],
  },
  regular_tournaments: {
    name: '虎贲校场',
    ranks: ['羽林骑进阶为【虎贲铁骑】', '骑兵冲锋造成 2.5 倍伤害', '骑兵冲锋造成 3 倍伤害'],
  },
  legion: {
    name: '禁军玄甲营',
    ranks: ['步兵进阶为【禁军玄甲将】', '所有步兵气血上限 +15%', '所有步兵气血上限 +30%'],
  },

  bloodlust: {
    name: '万兽血契',
    ranks: ['解锁妖术【万兽狂怒】', '对敌方据点破坏力 +25%', '对敌方据点破坏力 +50%'],
  },
  declaration_of_war: {
    name: '山林征召',
    ranks: ['解锁妖盟基础部族参战', '部队行军速度 +10%', '部队行军速度 +20%'],
  },
  speaking_to_animals: {
    name: '巫蛊毒经',
    ranks: ['解锁妖术【蚀骨毒雾】', '毒雾持续侵蚀波次 +1', '毒雾持续侵蚀波次 +2'],
  },
  three_days_plunder: {
    name: '大荒掠阵',
    ranks: ['狼骑兵进阶为【赤焰兽骑】', '每次夺取据点额外获 +75 金铢', '每次夺取据点额外获 +150 金铢'],
  },
  raid_the_tombs: {
    name: '虎魄觉醒',
    ranks: ['山魈战士进阶为【虎魄战将】', '战将小队编成 +1 员', '战将小队编成 +2 员'],
  },
  poisons_research: {
    name: '百草淬毒',
    ranks: ['毒羽妖进阶为【风翎妖卫】', '剧毒持续伤害 +1', '剧毒持续伤害 +2'],
  },
  dark_teaching: {
    name: '祖灵密祭',
    ranks: ['解锁妖术【妖魂召唤】', '每有小队阵亡终极蓄能 +3%', '每有小队阵亡终极蓄能 +6%'],
  },
  dreadful_machinery: {
    name: '巨兽驭令',
    ranks: ['巨角兽进阶为【山岳巨兽】', '攻城巨兽移动速度 +50%', '攻城巨兽移动速度 +100%'],
  },
  necropolis_excavations: {
    name: '太古战魂',
    ranks: ['骑兵进阶为【太古战兽骑】', '太古妖魂系部队招募耗费 -7%', '太古妖魂系部队招募耗费 -15%'],
  },

  arcane_frost: {
    name: '寒天玄镜',
    ranks: ['解锁神术【寒天封灵】', '封灵控制持续时间 +1 秒', '封灵控制持续时间 +2 秒'],
  },
  declaration_of_independence: {
    name: '玉虚仙律',
    ranks: ['解锁神庭基础天军', '粮仓/矿场/玄息碑建造成本 -15%', '粮仓/矿场/玄息碑建造成本 -30%'],
  },
  artisans_guild: {
    name: '星辰司命',
    ranks: ['灵弓使进阶为【星辰射手】', '符文机关暴击率 +5%', '符文机关暴击率 +10%'],
  },
  rebel_army: {
    name: '玉甲天卫律',
    ranks: ['天兵进阶为【玉甲天卫】', '步兵攻击附加 7% 寒霜封灵概率', '步兵攻击附加 15% 寒霜封灵概率'],
  },
  magic_library: {
    name: '昆仑藏经阁',
    ranks: ['解锁神术【天罡庇护】', '所有神术玄息消耗 -10%', '所有神术玄息消耗 -20%'],
  },
  liberation_army: {
    name: '九霄清灵诀',
    ranks: ['解锁神术【九霄落雷】', '部队获取百战经验速度 +15%', '部队获取百战经验速度 +30%'],
  },
  magic_academy: {
    name: '聚灵仙塔',
    ranks: ['御灵师进阶为【雷法天师】', '聚灵塔每秒额外产出 +1 金/粮/息', '聚灵塔每秒额外产出 +2 金/粮/息'],
  },
  tame_the_reptiles: {
    name: '天马牧苑',
    ranks: ['云骑进阶为【天马神骑】', '所有骑兵气血 +10%', '所有骑兵气血 +20%'],
  },
  giant_construction: {
    name: '镇天神工',
    ranks: ['神像阵列进阶为【镇天神像】', '镇天神像每秒自愈 2% 气血', '镇天神像每秒自愈 4% 气血'],
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
  BADGE_WESTARIA_CAMPAIGN_COMPLETE: { name: '九州平定', desc: '完成《九州人皇篇》全部 8 章战役' },
  BADGE_HORDE_CAMPAIGN_COMPLETE: { name: '万灵归山', desc: '完成《九黎妖盟篇》全部 8 章战役' },
  BADGE_CULT_CAMPAIGN_COMPLETE: { name: '重定天纲', desc: '完成《昆仑神庭篇》全部 8 章战役' },
  BADGE_WESTARIA_ALL_PERFECT: { name: '人皇天命', desc: '以金印评价通关九州人皇篇全部 8 章' },
  BADGE_HORDE_ALL_PERFECT: { name: '大荒共主', desc: '以金印评价通关九黎妖盟篇全部 8 章' },
  BADGE_CULT_ALL_PERFECT: { name: '玉虚至尊', desc: '以金印评价通关昆仑神庭篇全部 8 章' },
  BADGE_WESTARIA_ALL_BASE_EDICTS: { name: '人道礼法', desc: '研习九州人皇全部 9 项诏令' },
  BADGE_HORDE_ALL_BASE_EDICTS: { name: '部族祖训', desc: '研习九黎妖盟全部 9 项祖训' },
  BADGE_CULT_ALL_BASE_EDICTS: { name: '昆仑天律', desc: '研习昆仑神庭全部 9 项法旨' },
  BADGE_ANY_MISSION_PERFECT: { name: '神兵天降', desc: '以金印（< 05:30）平定任意一章' },
  BADGE_VILLAGES_OWNED: { name: '五谷丰登', desc: '单局内同时拥有 7 座粮仓' },
  BADGE_MINES_OWNED: { name: '铸币兴邦', desc: '单局内同时拥有 7 座金铢矿场' },
  BADGE_OBELISKS_OWNED: { name: '灵脉贯通', desc: '单局内同时拥有 7 座玄息碑' },
  BADGE_SQUADS_PURCHASED: { name: '九州动员', desc: '单局内整编 10 支以上部队' },
  BADGE_BANNERS_SET: { name: '军阵森严', desc: '单局内施放 5 次阵法/战旗' },
  BADGE_ULTIMATES_USED: { name: '天威赫赫', desc: '单局内施放 5 次终极阵营绝技' },
  BADGE_CHESTS_OPENED: { name: '上古遗宝', desc: '在战场中开启大荒古鼎宝箱' },
  BADGE_ENEMY_SQUADS_DESTROYED: { name: '破阵斩将', desc: '单局内击溃 30 支敌方部队' },
  BADGE_HEROIC_MODE_ENGAGED: { name: '士气如虹', desc: '单局内使部队进入振奋状态 20 次' },
  BADGE_GOLD_COLLECTED: { name: '府库充盈', desc: '单局内累计聚敛 3,000 金铢' },
  BADGE_SQUADS_OWNED: { name: '旌旗蔽日', desc: '同时在战场上统领 20 支部队' },
  BADGE_STRONGHOLDS_SIEZED: { name: '连克名城', desc: '单局内攻占据点 10 次以上' },
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
    name: '烽火初起',
    briefing: '天裂劫降临，中州边陲镇国城外已有混沌蚀魂兵渗入。集结铁甲卫守住渡口，踏平来犯裂隙魔殿！',
  },
  2: {
    name: '收复边关',
    briefing: '混沌肆虐之际，九黎妖盟乘虚北进。我军需先击败盘踞古鼎财宝的大荒饕餮，夺取镇灵台并稳固边关防线！',
  },
  3: {
    name: '河谷争夺',
    briefing: '东进通道受阻于敌方郡城与河谷桥头。调遣精锐跨河抢占立足点，为主力铺平征途。',
  },
  4: {
    name: '赤岭攻坚',
    briefing: '斥候回报昆仑神庭遣军现身赤岭，与混沌势力两面压迫中州防线。破敌合围之势，在此一战！',
  },
  5: {
    name: '三族交锋',
    briefing: '九州主力陷入多线激战，妖盟袭扰粮道，必须火速夺回要塞打通后勤补给。',
  },
  6: {
    name: '幽都迷雾',
    briefing: '幽都外围仍有妖盟部族逡巡，肃清侧翼威胁，方能稳步推进至大裂隙核心。',
  },
  7: {
    name: '九州决战',
    briefing: '决战前夕，混沌军势正与昆仑神庭在雪原遗迹对峙。顺势逐个击破，清空九州外围障碍！',
  },
  8: {
    name: '人皇之路',
    briefing: '九座镇世神鼎重光在望。集结全军直捣混沌总坛，重定九州天地秩序！',
  },

  11: {
    name: '大荒苏醒',
    briefing: '天裂惊变震动大荒万灵，九黎妖盟再次立誓夺回祖先林泽与山川疆土！',
  },
  12: {
    name: '万兽集结',
    briefing: '大荒古巫卜出吉兆，挥师突袭人族沿海重镇与粮仓，号令万兽踏平防线！',
  },
  13: {
    name: '苍林复仇',
    briefing: '苍南故土岂容混沌染指。率领狼骑兵与山魈战阵收复祖先圣地！',
  },
  14: {
    name: '赤焰山脉',
    briefing: '混沌巫使在赤焰山巅修筑祭坛。必须在昆仑天兵赶到前将其尽数摧毁！',
  },
  15: {
    name: '狂野军团',
    briefing: '神庭天军与混沌残部扼守高山隘口，驱使巨角兽与狼骑狂潮一举碾碎！',
  },
  16: {
    name: '幽谷血战',
    briefing: '玄北矿脉蕴含丰厚金铢与玄息。奇袭神庭矿区，为妖盟大军提供源源不绝的补给！',
  },
  17: {
    name: '万妖归心',
    briefing: '大荒萨满唤醒沉睡太古战魂，山林万族齐聚图腾旗下，直指天裂深渊！',
  },
  18: {
    name: '山海归荒',
    briefing: '踏碎幽都核心魔殿，让上古山海与万灵重归大荒自由秩序！',
  },

  21: {
    name: '昆仑惊变',
    briefing: '凡间玄息紊乱引动天裂劫，昆仑神宫重整天兵与玉甲天卫，誓以神律靖平乱世！',
  },
  22: {
    name: '天门失守',
    briefing: '玄北外围遭妖盟与混沌侵扰，神庭必须先行肃清盘踞天门附近的裂隙残部。',
  },
  23: {
    name: '霜原之战',
    briefing: '人族边军怀疑神庭封锁九州玄息，双方在寒霜原野爆发正面冲突。突围破阵吧！',
  },
  24: {
    name: '神鼎遗迹',
    briefing: '大股混沌蚀魂军自地裂涌出，必须在神鼎遗迹前将其彻底封灵净化！',
  },
  25: {
    name: '九霄雷鸣',
    briefing: '乱世三方各自失序，以九霄落雷与寒天封灵洗净污染山河的浊气！',
  },
  26: {
    name: '天道之争',
    briefing: '神庭与人族暂息干戈，分兵两路驰援中州前线，共抗混沌大军！',
  },
  27: {
    name: '混沌降世',
    briefing: '幽都外围黑雾遮天，携盟军重兵合围混沌总坛，封锁所有裂隙出口！',
  },
  28: {
    name: '重定天命',
    briefing: '九霄神光与九州兵阵合流，降下最终天罚，彻底抚平天裂之劫！',
  },
};

const EN_LEVELS: Record<number, { name: string; briefing: string }> = {
  1: {
    name: 'Beacons Alight',
    briefing: 'With the Seal broken, Chaos Soul Corroders cross into Zhongzhou. Muster Iron Guards at ZhenGuo Citadel and purge the Rift Sanctum!',
  },
  2: {
    name: 'Reclaiming the Pass',
    briefing: 'Jiuli raiders push north amid the chaos. Defeat the Taotie Brute guarding the Relic Chest, seize the Spirit Terrace, and hold the border!',
  },
  3: {
    name: 'River Valley Clash',
    briefing: 'Establish a forward foothold across the fortified river crossings to open the eastern campaign road.',
  },
  4: {
    name: 'Crimson Ridge Assault',
    briefing: 'Kunlun Celestial patrols and Chaos forces converge on the ridge. Cut their supply lines before they link up!',
  },
  5: {
    name: 'Clash of Three',
    briefing: 'Allied armies fight on two fronts while Beast raiders threaten our granaries. Secure the fortress harbor!',
  },
  6: {
    name: 'Mists of Youdu',
    briefing: 'Clear remaining Jiuli warbands from the western flank before marching deep into the misted ruins.',
  },
  7: {
    name: 'Battle for Nine Provinces',
    briefing: 'Chaos and Kunlun forces clash across the frozen plateau. Strike cleanly and shatter both rivals!',
  },
  8: {
    name: 'Path of the Sovereign',
    briefing: 'The Nine Tripods await restoration. Lead the full host against the Chaos heartland and forge a new era!',
  },
  11: { name: 'Awakening of the Wilds', briefing: 'The Rift awakens the ancient clans. Unite the Jiuli tribes to reclaim ancestral mountains!' },
  12: { name: 'Gathering of Beasts', briefing: 'Raid coastal human granaries and seize fortified passes under the shaman totem banner!' },
  13: { name: 'Vengeance of Cangnan', briefing: 'Drive corrupted Chaos forces off ancestral woodland plateaus!' },
  14: { name: 'Crimson Flame Peaks', briefing: 'Seize the volcanic ritual sites before Kunlun Celestial legions arrive!' },
  15: { name: 'Fierce Horde', briefing: 'Crush both Celestial and Chaos defenders blocking the high mountain pass!' },
  16: { name: 'Bloody Valley', briefing: 'Storm rich jade mines in the northern valley to fuel the Beast Alliance war machine!' },
  17: { name: 'Heart of Ten Thousand Spirits', briefing: 'Ancient spirit beasts rally behind your shamans on the final road toward Youdu!' },
  18: { name: 'Wilds Reclaimed', briefing: 'Overthrow the Chaos Sanctum and return the Nine Provinces to untamed wilderness!' },
  21: { name: 'Shock at Kunlun', briefing: 'Disorder spreads across the Nine Provinces. Dispatch Heavenly Soldiers to restore divine order!' },
  22: { name: 'Fall of Heaven Gate', briefing: 'Purge entrenched Chaos remnants threatening the northern sanctum approaches.' },
  23: { name: 'Battle of Frost Plains', briefing: 'Human generals block our envoys at the frozen pass. Break through with Frost Seal and Rune Golems!' },
  24: { name: 'Tripod Ruins', briefing: 'Halt a massive Chaos surge erupting around the shattered ancient Tripod altar.' },
  25: { name: 'Nine-Heavens Thunder', briefing: 'Unleash divine lightning upon warring Chaos and Beast remnants from above.' },
  26: { name: 'Contest of Heaven', briefing: 'Join forces with human legions in a two-pronged relief assault across the plains!' },
  27: { name: 'Descent of Chaos', briefing: 'Tighten the siege ring around the outer Chaos citadels alongside allied armies.' },
  28: { name: 'Mandate Restored', briefing: 'Unite divine thunder and human iron to seal the Abyss forever!' },
};

export function getLevelName(levelId: number, fallback: string): string {
  const table = activeLanguage === 'zh' ? ZH_LEVELS : EN_LEVELS;
  return table[levelId]?.name ?? fallback;
}

export function getLevelBriefing(levelId: number, fallback: string): string {
  const table = activeLanguage === 'zh' ? ZH_LEVELS : EN_LEVELS;
  return table[levelId]?.briefing ?? fallback;
}
