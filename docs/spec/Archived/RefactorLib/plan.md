# plan

## Stage 0 – Alignment & Guardrails
- Audit references: inventory every consumer of `app/scripts/lib/*.js`, flag jQuery/global touchpoints, and confirm required backwards compatibility windows.
- Testing harness: set up unit test scaffolding (Vitest) plus lint rule to forbid new global `window` mutations.
- Legacy adapter plan: document which modules need temporary adapters (e.g., `legacyDetect`, `legacyHead`).

## Stage 1 – Core Infrastructure
- Introduce `lib/runtime/deps.ts` that resolves optional peers (moment, Handlebars, gee) and expose `withBrowser(cb)` helpers in `shared.ts`.
- Refactor `defaultPlugin.js` into `createPlugin(options)` with name registry, lifecycle hooks, structured error logging, and TypeScript typings.
- Build new event emitter (`lib/event/emitter.ts`) backed by `Map<string, Set<fn>>`, shipping `on`, `off`, `once`, wildcard topics, and adapters for existing `gee.event` consumers.
- Deliver smoke tests: register/unregister hooks, plugin failure handling, emitter once/wildcard cases.

## Stage 2 – High-Risk Modules
- `detect.js`: replace UA sniff with feature-capability API plus legacy shim exporting `window.jQuery.browser.mobile` for transitional period.
- `head.js`: move GA + IE logic into plugin gated by config; provide `requireModernBrowser()` helper and default UI callback injection.
- Smoke tests focus on SSR safety (no `window` access) and verifying head plugin toggles GA only when measurement ID exists.

## Stage 3 – Utility Module Decomposition
- `extend.js`: split into `dom/placeholder`, `dom/classList`, `form/serialize`, `number/format`; expose pure functions and return teardown handles for listeners. Update consumers incrementally.
- `format.js`: isolate currency/thumbnail/string helpers, move Handlebars registration behind optional `registerTemplateHelpers(handlebars)` export, allow dependency injection (moment alternatives).
- Add Jest/Vitest suites covering thumbnail pathing, percent math, placeholder lifecycle.

## Stage 4 – Remaining Libs & Barrel Cleanup
- `postmessage.js`: add schema validation helpers, promise-based request/response wrapper, and typed teardown handles.
- `shared.js`: extend with `isSSR`, `withDocument`, `toElements<T>()` utilities; ensure other modules consume them rather than custom guards.
- `index.js`: ensure the barrel re-exports only pure modules, update importers, and deprecate GA/IE side effects.
- Run full smoke: SSR render without DOM, plugin boot sequence, and integration with existing hooks.

## Stage 5 – Rollout & Cleanup
- Remove legacy adapters once adoption complete; update docs/spec/rule.md and migration guides.
- Final regression sweep: verify preview/production builds, run e2e smoke for privacy banner, draft import, and slider flows.
- Prepare PR sequence summary plus fallback plan (revert adapters) in case regressions occur in production.
