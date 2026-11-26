# Takeover (Cocos 4 + TypeScript Remake)

A 16:9 (`1280x720`) multi-platform remake of the classic RTS game *Takeover* built with **Cocos 4** and **TypeScript**, featuring all **3 campaigns (24 playable levels)**, **27 Royal Edicts**, **16 Spells/Banners/Ultimates**, **22 Badges**, live **EN / 中文** localization, checksummed **`TKV3:`** cross-device save transfer codes, and a 6-bundle CDN architecture.

## Key Features

- **Full 3-Campaign Content**: Westaria (Lv 1–8), The Khaganate (Lv 11–18), and The Cult (Lv 21–28) with per-level JSON loading, interactive Rivadis conquest map (base + 26 lossless diff overlays), Throne Room upgrades, and Trophy Room badges.
- **Modular Simulation & UI**:
  - `game/assets/scripts/core/` — Coordinate transform, `EventBus`, exponential-backoff `AsyncRetry`.
  - `game/assets/scripts/data/` — Units, Spells, Buildings, Edicts, Badges, LevelCatalog, `AssetManifest`, `I18n` (`en` / `zh`), `UserSettingsStore`, and `CampaignProgressStore` (injectable `IStorageAdapter` + `TKV3:` codec).
  - `game/assets/scripts/sim/` — Zero-`cc` decoupled simulation (`BattleSim`, `SimContext`, `SpellResolver`, `SquadSystem`, `CombatMath`, `EconomySim`, `GraphNav`, `AiController`).
  - `game/assets/scripts/view/` — Scene views and controllers (`BattleView`, `BattleInputController`, `BattleVfxController`, `HudView`, `HudSpellDock`, `HudSelectionPanels`, `PauseModalView`, `SaveDataModal`, `AssetBundleManager`, `SpriteLoader`, `AudioManager`, `SafeAreaHelper`).
- **Multi-Platform & Performance Ready**:
  - Auto-Atlas `.pac` packing for icons & buildings while keeping sprite-strip animations unpacked.
  - `cc.NodePool` recycling and dirty-checked/10 Hz-throttled HUD rendering.
  - `Game.EVENT_HIDE/SHOW` lifecycle auto-pause, Android/Escape back navigation, safe-area HUD insets, and custom `web-desktop` / `web-mobile` templates.

## Verification & CI Gates

```powershell
# 1. UTF-8 / BOM / forbidden-SDK / cc-decoupling / <4MB resources budget check
node scripts\check-hygiene.mjs

# 2. Pure TypeScript strict check (CI-compatible without Cocos declarations)
npx -p typescript@5.8 tsc -p game\tsconfig.sim.json --noEmit

# 3. Full Cocos TypeScript check (when tools/cocos-cli is present locally)
node tools\cocos-cli\node_modules\typescript\bin\tsc -p game\tsconfig.json --noEmit

# 4. Headless simulation & data integrity test suite (16 suites)
node tools\cocos-cli\node_modules\tsx\dist\cli.mjs scripts\test-sim.ts
```

GitHub Actions runs hygiene, pure-TS typecheck, all 16 headless simulation tests, and a release dry-run automatically via [.github/workflows/ci.yml](.github/workflows/ci.yml).

## Automated Release Packaging

Use [`scripts/build-release.mjs`](scripts/build-release.mjs) to run pre-flight checks, compile targets with the Cocos 4 CLI, enforce the `< 4 MB` `resources` budget & bundle manifest integrity, and split frontend site files from remote CDN bundles:

```powershell
# Dry-run release plan validation
node scripts\build-release.mjs --dry-run --target all --cdn-url https://cdn.example.com/takeover

# Split-CDN production build (outputs dist-release/web-desktop-site & dist-release/web-desktop-cdn/remote)
node scripts\build-release.mjs --target web-desktop --cdn-url https://cdn.example.com/takeover

# Single-origin mobile H5 build (outputs dist-release/web-mobile-site with bundled remote/)
node scripts\build-release.mjs --target web-mobile
```

See [docs/multi-platform-cdn-guide.md](docs/multi-platform-cdn-guide.md) for bundle layouts, CDN CORS/caching headers, and native Android SDK setup notes.
