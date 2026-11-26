# Multi-Platform & CDN Deployment Guide

This project separates a lightweight local startup package (`resources`, **3.24 MB**) from five CDN-hosted Asset Bundles (`bundle_gameplay`, `bundle_westaria`, `bundle_khaganate`, `bundle_cult`, `bundle_shared_maps`), while keeping **100% lossless PNG masters** in the repository.

## 1. Asset Bundle Architecture & Sizes

| Bundle | Delivery (`web` / `miniGame`) | Delivery (`native`) | Contents |
| :--- | :--- | :--- | :--- |
| `resources` | Local main package (`~3.24 MB`) | Local | UI (`textures/ui`), Icons (`textures/icons`), Audio (`audio`), `build_site`, `chest` |
| `bundle_gameplay` | Remote (`remote/`) | Local | Units (`textures/units`), VFX (`textures/vfx`), Buildings (`textures/buildings`), `campaign_map_base.png` |
| `bundle_westaria` | Remote (`remote/`) | Local | `levels/level_1..8.json`, unique maps `1,2,3,5,6,8`, `campaign_map_diff_2..9.png` |
| `bundle_khaganate` | Remote (`remote/`) | Local | `levels/level_11..18.json`, unique maps `11,12,13,17`, `campaign_map_diff_10..18.png` |
| `bundle_cult` | Remote (`remote/`) | Local | `levels/level_21..28.json`, unique maps `21,22`, `campaign_map_diff_19..27.png` |
| `bundle_shared_maps` | Remote (`remote/`) | Local | 6 deduplicated cross-campaign maps (`level4_bg`, `level7_bg`, `level14_bg`, `level15_bg`, `level16_bg`, `level18_bg`) |

- Preset config: [`cdn_remote`](../game/settings/cocos.config.json) (mirrored in [builder.json](../game/settings/v2/packages/builder.json)).
- Only 2D engine modules (`base`, `gfx-webgl`, `2d`, `mask`, `graphics`, `affine-transform`, `ui`, `audio`, `tween`, `profiler`) are enabled.

## 2. Build Commands (Cocos 4 CLI `0.2.0-beta.3`)

Before running any Cocos CLI build, remove any stale backend lock folder `game\temp\.cocos-cli-backend`.

```powershell
# 1. Single-origin Web Desktop (includes bundles locally under remote/ or assets/)
node tools\cocos-cli\dist\cli.js build --project game --platform web-desktop --build-config game\build-web-desktop.json

# 2. Split-origin CDN Web Desktop (edit "server" in build-web-desktop-cdn.json to your CDN origin)
node tools\cocos-cli\dist\cli.js build --project game --platform web-desktop --build-config game\build-web-desktop-cdn.json

# 3. Web Mobile (landscape H5)
node tools\cocos-cli\dist\cli.js build --project game --platform web-mobile --build-config game\build-web-mobile.json

# 4. Android APK (requires Android SDK/NDK/JDK 17/CMake)
node tools\cocos-cli\dist\cli.js build --project game --platform android --build-config game\build-android.json
```

## 3. Deploying `remote/` to a CDN / Object Storage (OSS / COS / S3 / R2)

1. Set `"server": "https://cdn.example.com/takeover"` and `"md5Cache": true` in [build-web-desktop-cdn.json](../game/build-web-desktop-cdn.json) (or your target platform build JSON).
2. Build the project, then upload the generated `game/build/<outputName>/remote/` directory to `https://cdn.example.com/takeover/remote/` and deploy the remaining files (`index.html`, `main.js`, `src/`, `assets/resources/`, `assets/main/`, `cocos-js/`, `style.css`) to your web host.
3. Configure HTTP response headers on the CDN bucket:
   - `Access-Control-Allow-Origin: *` (required for cross-origin WebGL textures and JSON fetches)
   - `Access-Control-Allow-Methods: GET, HEAD, OPTIONS`
   - `Cache-Control: public, max-age=31536000, immutable` for hashed assets (`md5Cache: true`) and `Cache-Control: no-cache` on `index.html` / top-level `settings.json`.

## 4. Native Android APK Toolchain Checklist

`game/build-android.json` is preconfigured for `arm64-v8a`, landscape orientation, GLES3/GLES2, and `com.cbzb.takeover`. To compile an APK locally, install and configure:
1. **JDK 17** (`JAVA_HOME` pointing to JDK 17 for Gradle / Android Gradle Plugin compatibility).
2. **Android SDK Platform 35** + Build-Tools + Platform-Tools (`ANDROID_HOME` / `ANDROID_SDK_ROOT`).
3. **Android NDK r25b+** and **CMake 3.22+** via Android Studio SDK Manager (`ANDROID_NDK_ROOT`).

## 5. WeChat / Douyin Mini-Game Porting Notes

- The open-source Cocos 4 CLI `0.2.0-beta.3` does not currently ship `wechatgame` / `bytedance-mini-game` builder plugins.
- All game simulation (`core/`, `data/`, `sim/`) has zero DOM/`cc` coupling, `CampaignProgressStore` uses an injected `sys.localStorage` adapter, and `resources/` is already under the **4 MB** main-package limit (`3.24 MB` source).
- When opening/migrating in **Cocos Creator 3.8 LTS** (or a future Cocos 4 release with mini-game builder plugins), upload `remote/` to the mini-game CDN domain and configure the request/download legal domains in the mini-game console.

## 6. Phase A Multi-Platform Hardening & UX Features

1. **Lifecycle & Background Protection ([GameApp.ts](../game/assets/scripts/GameApp.ts), [AudioManager.ts](../game/assets/scripts/view/AudioManager.ts))**:
   - Subscribes to `Game.EVENT_HIDE` / `Game.EVENT_SHOW` to automatically pause active battles and suspend/resume BGM audio.
   - Handles `KeyCode.ESCAPE` and Android `KeyCode.MOBILE_BACK` across every screen state, plus desktop shortcuts (`Space` pause, `F` speed, `M` mute, `1`–`4` spells).
2. **CDN Resilience & Staged Loading ([AsyncRetry.ts](../game/assets/scripts/core/AsyncRetry.ts), [AssetBundleManager.ts](../game/assets/scripts/view/AssetBundleManager.ts), [SpriteLoader.ts](../game/assets/scripts/view/SpriteLoader.ts))**:
   - Bundle, JSON, and texture requests use `retryAsync` (3 attempts, exponential backoff, per-attempt timeout) and report monotonic progress (`0–100%`) to the modal `LoadingOverlay`, surfacing `RETRY` and `BACK` actions on failure.
3. **Custom Web Templates ([game/build-templates/](../game/build-templates/))**:
   - `web-desktop`: frameless 16:9 responsive viewport, branded `#boot-splash`, and global `contextmenu` suppression so right-click orders/cancel work cleanly.
   - `web-mobile`: `viewport-fit=cover`, `touch-action: none`, `#boot-splash`, and a portrait-mode `#rotate-overlay` prompt.
4. **Safe Area, Touch Ergonomics & Persisted Settings ([SafeAreaHelper.ts](../game/assets/scripts/view/SafeAreaHelper.ts), [UserSettings.ts](../game/assets/scripts/data/UserSettings.ts), [HudView.ts](../game/assets/scripts/view/HudView.ts), [BattleView.ts](../game/assets/scripts/view/BattleView.ts))**:
   - Applies `sys.getSafeAreaRect()` insets to HUD edge panels, enlarges touch hitboxes on mobile, adds expanding tap/command feedback ripples, adds a touch-accessible `CANCEL [ESC]` button during spell targeting, and persists `muted`, `bgmVolume`, `sfxVolume`, and `preferredSpeed` under `takeover_settings_v1`.
