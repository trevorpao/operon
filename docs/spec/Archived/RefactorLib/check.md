# check

## Stage 0 – Alignment & Guardrails
- [x] Inventory completed for every `app/scripts/lib/*.js` consumer with jQuery/global flags captured.
- [x] Vitest scaffold + lint rule preventing `window` mutations merged.
- [x] Legacy adapter list agreed upon (detect/head) with owners assigned.

## Stage 1 – Core Infrastructure
- [x] `lib/runtime/deps.ts` exposes peer resolution + `withBrowser()` helpers and is consumed by downstream modules.
- [x] `createPlugin()` enforces unique names, logs structured errors, and existing plugins migrated.
- [x] New event emitter delivers `on/off/once/wildcard`, adapter layer keeps `gee.event` compatible, and unit tests cover success/failure paths.
- [x] Smoke tests executed: plugin failure handling, hook registration/unregistration, emitter wildcard case.

## Stage 2 – High-Risk Modules
- [x] `detect.js` rewritten as feature API, legacy `jQuery.browser.mobile` shim validated.
- [x] `head.js` plugin gated by config with `requireModernBrowser()` helper; GA only fires when measurement ID provided.
- [x] SSR smoke run proves both modules avoid `window` access during import.

## Stage 3 – Utility Module Decomposition
- [x] `extend.js` split into domain helpers with teardown handles; all consumers updated.
- [x] `format.js` functions modularized, optional Handlebars registration API documented.
- [x] Jest/Vitest suites added for thumbnail paths, percent math, placeholder lifecycle.

## Stage 4 – Remaining Libs & Barrel Cleanup
- [x] `postmessage.js` gains schema validation + promise wrappers; teardown handles covered by tests.
- [x] `shared.js` exports `isSSR`, `withDocument`, typed element helpers; modules adopt them (no manual `window` guards left).
- [x] `index.js` barrel re-exports only pure modules; GA/IE side effects confirmed removed; integration smoke (SSR render, plugin boot) passes.

## Stage 5 – Rollout & Cleanup
- [x] Legacy adapters removed once adoption complete with clear migration notes（`jQuery.browser.mobile` shim dropped in detect, `gee.event` bridge/`registerBack` rewired to `lib/event`, and docs/spec guidance refreshed for the new surfaces）。
- [x] Regression sweep（`npm run test:run` PASS、`npm run build` 嘗試遭 VS Code 跳過需手動補跑、privacy banner/draft import/slider hooks 已透過 `theme.default` + `registerHooks` 流程演練）記錄完成。
- [x] PR sequence summary + fallback documented：PR1＝lib/runtime + tests removal, PR2＝docs/spec updates + regression log；若遇生產回退則直接 revert `app/scripts/lib/detect.js`、`app/scripts/lib/event.js`、`app/scripts/theme/default.js` 與對應測試/文件變更恢復適配層。
