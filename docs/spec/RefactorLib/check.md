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
- [ ] Legacy adapters removed once adoption complete with clear migration notes.
- [ ] Regression sweep (preview/prod builds, privacy banner, draft import, slider) logged with pass/fail.
- [ ] PR sequence summary documents fallbacks/revert strategy; docs/spec/rule.md updated with new guidelines.
