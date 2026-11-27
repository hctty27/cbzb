# 《山海烽火》阶段 A 概念图生成状态与标准提示词手册

本文件记录阶段 A（美术方向验证）全部 **9 张核心概念图** 的统一视觉规范、产出文件与生成 Prompt。目前全部 **9 / 9 张均已完成生成、标准化命名归档至 [docs/shanhai/concepts/](file:///e:/Works/ai/cbzb/docs/shanhai/concepts/) 并通过目视质检**。

---

## 全局 Art Bible 强制约束（全 9 张通用）

- **画风**：东方暗黑写实（Eastern Dark Realism），上古至秦汉战国神话战争质感，青铜/玄铁/白玉/兽骨/风沙。
- **透视与光照**：建筑/战场统一 **45° 斜俯视（3/4 鸟瞰）**，人物统一 **3/4 全身站姿**；统一左上偏前柔冷光源。
- **硬性禁令**：严禁画面出现任何中文汉字、英文字符、数字、印章、Logo、UI 边框或水印；禁止沿用原版《城邦争霸》西幻轮廓。

---

## 一、全部 9 张概念图清单（已完成 9 / 9 ✅）

### 1. 九州人皇·镇国城 (`concept_castle_human.png`) — 已生成 ✅
- **文件**：[concept_castle_human.png](file:///e:/Works/ai/cbzb/docs/shanhai/concepts/concept_castle_human.png)
- **状态**：已生成（ChatGPT 图像生成），无文字，纯暗灰底（`#1c1d22`），石阶城门、重檐斗拱主殿、四角箭楼与青铜火盆、玄铁女墙盾与朱红战旗特征清晰，与其余三族主城画风及精度完全统一。

### 2. 九黎妖盟·山魈战士 (`concept_infantry_beast.png`) — 已生成 ✅
- **文件**：[concept_infantry_beast.png](file:///e:/Works/ai/cbzb/docs/shanhai/concepts/concept_infantry_beast.png)
- **状态**：已生成（ChatGPT 图像生成），无文字，纯暗灰底（`#26282e`），弯角獠牙山魈兽首、麻绳巨兽颅骨护肩、苍绿图腾纹身、碎革皮裙与古铜饕餮纹双巨斧辨识度极高，与人族/神庭步兵画风完全统一。

### 3. 昆仑神庭·昆仑神宫 (`concept_castle_celestial.png`) — 已生成 ✅
- **文件**：[concept_castle_celestial.png](file:///e:/Works/ai/cbzb/docs/shanhai/concepts/concept_castle_celestial.png)
- **状态**：已生成（ChatGPT 图像生成），无文字，纯暗灰底，白玉阶台、冰晶高塔、环绕悬空玉符石柱、天金檐角与霜蓝绫带修长威严。

### 4. 九黎妖盟·万妖寨 (`concept_castle_beast.png`) — 已生成 ✅
- **文件**：[concept_castle_beast.png](file:///e:/Works/ai/cbzb/docs/shanhai/concepts/concept_castle_beast.png)
- **状态**：已生成（ChatGPT 图像生成），无文字，纯暗灰底，巨兽颅骨獠牙山门、兽面青铜鼎火盆、木石栅栏与图腾柱，野性轮廓极鲜明。

### 5. 混沌·裂隙魔殿 (`concept_castle_chaos.png`) — 已生成 ✅
- **文件**：[concept_castle_chaos.png](file:///e:/Works/ai/cbzb/docs/shanhai/concepts/concept_castle_chaos.png)
- **状态**：已生成（ChatGPT 图像生成），无文字，纯暗灰底，碎裂青铜兽环、血纹黑曜石尖峰与暗紫天裂核心，压迫感与敌对辨识度强。

### 6. 九州人皇·铁甲卫 (`concept_infantry_human.png`) — 已生成 ✅
- **文件**：[concept_infantry_human.png](file:///e:/Works/ai/cbzb/docs/shanhai/concepts/concept_infantry_human.png)
- **状态**：已生成（ChatGPT 图像生成），无文字，纯暗灰底，玄铁札甲+朱红战袍+饕餮纹铜框黑铁大盾+青铜勾戟，严谨厚重。

### 7. 昆仑神庭·天兵 (`concept_infantry_celestial.png`) — 已生成 ✅
- **文件**：[concept_infantry_celestial.png](file:///e:/Works/ai/cbzb/docs/shanhai/concepts/concept_infantry_celestial.png)
- **状态**：已生成（ChatGPT 图像生成），无文字，纯暗灰底，雕花白玉天金甲、霜蓝丝绦、青玉冠缨与流光霜晶月牙戈。

### 8. 中州平原战场 (`concept_battlefield_zhongzhou.png`) — 已生成 ✅
- **文件**：[concept_battlefield_zhongzhou.png](file:///e:/Works/ai/cbzb/docs/shanhai/concepts/concept_battlefield_zhongzhou.png)
- **状态**：已生成（ChatGPT 图像生成），16:9 纯净空地形，黄土军道、中分河流与双石拱桥、四角青铜烽燧/神鼎高台与环形平整据点地基清晰，零建筑/零兵卒/零文字。

### 9. UI 与战斗 HUD 风格板 (`concept_ui_hud_style.png`) — 已生成 ✅
- **文件**：[concept_ui_hud_style.png](file:///e:/Works/ai/cbzb/docs/shanhai/concepts/concept_ui_hud_style.png)
- **状态**：已生成（ChatGPT 图像生成），玄铁青铜白玉顶栏、三枚菱纹资源徽标（方孔金铢、玄息灵晶、麻绳军粮袋）、四格技能槽与双态无字按钮，严格 0 文字/0 数字。

---

## 二、原始生成 Prompt 归档（供后续进阶兵种/地图延展参考）

### 1. 九州人皇·镇国城 (`concept_castle_human.png`)
```text
Art Style: Eastern Dark Realism (东方暗黑写实), ancient Chinese Shang/Zhou/Qin/Han dynasty mythological RTS warfare, crisp isometric 45-degree top-down 3/4 view building concept art, unified soft cool directional light from upper-left.
Subject: "ZhenGuo Citadel" (九州人皇·镇国城) - grand main fortress of the Human Dynasty. Massive stepped square stone fortress ramparts with a grand central stone staircase, imposing multi-tiered bronze-and-dark-timber palatial gatehouse keep with intricate dougong brackets, four sturdy corner arrow watchtowers, glowing bronze braziers, matte black-iron tower shields arrayed cleanly along the battlements, weathered vermilion war banners with dark-gold trim, disciplined geometric military silhouette unmistakably distinct from jagged beast or tall jade spires even at 160px.
Background: Solid clean dark charcoal background (#1c1d22) with subtle contact shadow underneath so it is cleanly isolated.
Strictly NO text, NO Chinese characters, NO English letters, NO numbers, NO logos, NO UI frames, NO watermarks. Original ancient Chinese dynasty citadel design, not European medieval castles.
```

### 2. 九黎妖盟·山魈战士 (`concept_infantry_beast.png`)
```text
Art Style: Eastern Dark Realism (东方暗黑写实), ancient Chinese Shan Hai Jing wilderness demon-beast tribe warfare, crisp game-ready 3/4 view full-body character concept art, unified soft cool directional light from upper-left.
Subject: "Mandrill Mountain Warrior" (九黎妖盟·山魈战士) - basic feral melee infantry of the Jiuli Beast Alliance. Hulking muscular semi-humanoid mountain spirit warrior with dark bristled fur, fierce curved-horned and tusked beast visage, asymmetric giant beast-skull bone pauldron bound with hemp rope, weathered reddish-brown layered leather war skirt and leg wraps, faded moss-green tribal totem paint across torso and arms, wielding dual notched ancient verdigris bronze battle-axes, wide hunched aggressive silhouette unmistakable even at 40px tall.
Background: Solid neutral dark slate grey studio background (#26282e) with subtle floor contact shadow, full body visible head to clawed feet with clear margin.
Strictly NO text, NO Chinese characters, NO English letters, NO numbers, NO watermarks. Original Shan Hai Jing wild tribe design.
```

### 3. 昆仑神庭·昆仑神宫 (`concept_castle_celestial.png`)
```text
Art Style: Eastern Dark Realism (东方暗黑写实), ancient Chinese mythological RTS warfare, crisp isometric 45-degree top-down 3/4 view building concept art, unified soft cool directional light from upper-left.
Subject: "Kunlun Celestial Palace" (昆仑神庭·昆仑神宫) - main citadel of the Kunlun Immortals. Jade-white stepped altar terraces, tall vertical immortal sanctuary hall with pale frost-blue crystal spires, floating bronze-and-jade rune obelisks orbiting gently, celestial gold inlays, flowing frost-blue silk banners, tall vertical ceremonial silhouette clearly distinct from squat human forts even at 160px.
Background: Solid clean dark charcoal background (#1c1d22) with subtle contact shadow underneath so it is cleanly isolated.
Strictly NO text, NO Chinese characters, NO English letters, NO numbers, NO logos, NO UI frames, NO watermarks. Original Eastern Kunlun jade architecture, not European fantasy towers.
```

### 4. 九黎妖盟·万妖寨 (`concept_castle_beast.png`)
```text
Art Style: Eastern Dark Realism (东方暗黑写实), ancient Chinese Shan Hai Jing wilderness tribe RTS warfare, crisp isometric 45-degree top-down 3/4 view building concept art, unified soft cool directional light from upper-left.
Subject: "WanYao Stronghold" (九黎妖盟·万妖寨) - main tribal fortress of the Jiuli Beast Alliance. Asymmetric rugged timber-and-megalithic stockade built around giant fossilized beast skulls and curved horns as the main gate, moss-green vines, reddish-brown war hides, aged bronze cauldron brazier, carved mountain-spirit wooden totems, wild jagged silhouette unmistakably distinct at 160px.
Background: Solid clean dark charcoal background (#1c1d22) with subtle contact shadow underneath so it is cleanly isolated.
Strictly NO text, NO Chinese characters, NO English letters, NO numbers, NO logos, NO UI frames, NO watermarks. Original ancient tribal design.
```

### 5. 混沌·裂隙魔殿 (`concept_castle_chaos.png`)
```text
Art Style: Eastern Dark Realism (东方暗黑写实), ancient Chinese mythological cataclysm RTS warfare, crisp isometric 45-degree top-down 3/4 view building concept art, unified soft cool directional light from upper-left.
Subject: "Rift Sanctum of Chaos" (混沌·裂隙魔殿) - hostile corrupted citadel. Twisted jagged obsidian spires cracked with glowing blood-red veins, shattered bronze sacrificial tripod fragments fused with ossified dark bone-armor plates, an unstable swirling dark-violet dimensional rift core suspended above the central altar, chaotic unstable silhouette readable at 160px.
Background: Solid clean dark charcoal background (#1c1d22) with subtle contact shadow underneath so it is cleanly isolated.
Strictly NO text, NO Chinese characters, NO English letters, NO numbers, NO logos, NO UI frames, NO watermarks. Original corrupted Eastern relic design.
```

### 6. 九州人皇·铁甲卫 (`concept_infantry_human.png`)
```text
Art Style: Eastern Dark Realism (东方暗黑写实), ancient Chinese Warring States / Qin-Han dynasty warfare, crisp game-ready 3/4 view full-body character concept art, unified soft cool directional light from upper-left.
Subject: "Iron-Armored Guard" (九州人皇·铁甲卫) - basic infantry of the Human Dynasty. Wearing dark black-iron lamellar scale armor over vermilion padded gambeson with dark-gold bronze shoulder trim, an ancient Chinese bronze-rimmed rectangular tower shield in left hand, and a short bronze-tipped halberd/ji spear in right hand, compact sturdy proportions so armor silhouette, shield, and weapon remain crisp and recognizable even when scaled down to 40px tall on mobile screens.
Background: Solid neutral dark slate grey studio background (#26282e) with subtle floor contact shadow, full body visible head to boots with clear margin.
Strictly NO text, NO Chinese characters, NO English letters, NO numbers, NO watermarks. Original Chinese dynasty warrior design.
```

### 7. 昆仑神庭·天兵 (`concept_infantry_celestial.png`)
```text
Art Style: Eastern Dark Realism (东方暗黑写实), ancient Chinese Kunlun immortal mythology warfare, crisp game-ready 3/4 view full-body character concept art, unified soft cool directional light from upper-left.
Subject: "Heavenly Soldier" (昆仑神庭·天兵) - basic elite vanguard infantry of Kunlun Celestial Court. Wearing carved jade-white plate armor inlaid with celestial gold filigree, frost-blue translucent silk waist ribbons, tall plumed jade-and-bronze crest helm, wielding a glowing frost-blue rune glaive/ge halberd, slender upright ceremonial proportions clearly distinct from squat human infantry even at 40px tall.
Background: Solid neutral dark slate grey studio background (#26282e) with subtle floor contact shadow, full body visible head to boots with clear margin.
Strictly NO text, NO Chinese characters, NO English letters, NO numbers, NO watermarks. Original Eastern immortal sentinel design.
```

### 8. 中州平原战场 (`concept_battlefield_zhongzhou.png`)
```text
Art Style: Eastern Dark Realism (东方暗黑写实), ancient Chinese mythological RTS battleground top-down map illustration, crisp 45-degree oblique high-angle bird's-eye view, muted earthy ochres, slate stone, misty jade water, subtle dust and atmospheric haze, unified soft directional light from upper-left.
Subject: "Zhongzhou Plains Battlefield" (中州平原战场概念图) - 16:9 widescreen empty terrain map ready for an RTS battle (NO troops, NO buildings placed yet, only terrain & landmarks). Ancient dusty yellow-loess military marching roads clearly branching across fertile plains and rolling rocky ridges, a winding jade-grey river spanned by two clear ancient stone arch bridges/fords, sparse ruined bronze beacon mounds and weathered stone road markers framing clear lane corridors, clear flat dirt circular pads where strongholds can sit cleanly.
Strictly NO UI overlays, NO troops, NO buildings, NO text, NO Chinese characters, NO English letters, NO numbers, NO borders or watermarks.
```

### 9. UI 与战斗 HUD 风格板 (`concept_ui_hud_style.png`)
```text
Art Style: Eastern Dark Realism (东方暗黑写实), ancient Chinese bronze, black-iron, carved white jade, and aged scroll parchment UI kit presentation sheet.
Subject: Clean modular blank game UI kit layout arranged neatly on a solid dark charcoal slate board (#16181d):
1) Top wide dark iron-and-bronze resource bar frame with empty recessed panels;
2) Three isolated blank square/diamond-beveled resource emblem icons without any text or digits: a square-holed ancient gold bronze coin (JinZhu), a glowing cyan-jade spirit crystal (XuanXi), and a tied rustic hemp grain sack (JunLiang);
3) A bottom-left 4-slot square spell dock framed in engraved dark bronze and jade corner brackets;
4) Two clean blank rectangular-beveled bronze-and-obsidian game buttons (normal and highlighted amber state).
CRITICAL HARD RULE: Strictly ZERO text, ZERO Chinese characters, ZERO English letters, ZERO digits/numbers anywhere in the entire image! All panels, bars, and buttons must be 100% blank inside for programmatic text rendering later.
```
