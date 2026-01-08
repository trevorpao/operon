# Stage 0 – Alignment & Guardrails

## 1. Reference Inventory (`app/scripts/lib/*.js`)
- **defaultPlugin.js**
  - Consumers: [app/scripts/lib/index.js](app/scripts/lib/index.js).
  - Globals: none directly, but helpers expect `createPlugin` to mutate shared registry.
  - Back-compat: keep API stable for downstream plugin factories until every plugin migrates to the new typed helper.
- **detect.js**
  - Consumers: none via ESM imports (legacy script tag only).
  - Globals: writes to `jQuery.browser.mobile` and reads `navigator.userAgent`.
  - Back-compat window: retain shim until legacy modules removing jQuery dependencies (arena/menu/resource) complete.
- **event.js**
  - Consumers: none via ESM imports; `gee.event` attaches globally.
  - Globals: mutates `gee.event`, depends on jQuery iteration helpers.
  - Note: requires adapter while rebuilding event bus so hooks using `gee.event.subscribe` continue to work.
- **extend.js**
  - Consumers: [app/scripts/plugins/index.js](app/scripts/plugins/index.js) → [app/scripts/init.js](app/scripts/init.js#L15-L34).
  - Globals: mutates `app.extendHelper` and touches DOM APIs (`document`, `window`).
  - Back-compat: placeholder polyfill used by templates that still rely on legacy inputs; must keep until forms migrate.
- **format.js**
  - Consumers: [app/scripts/plugins/index.js](app/scripts/plugins/index.js) → [app/scripts/init.js](app/scripts/init.js#L15-L34).
  - Globals: reads `window`, attaches helpers to global `app.formatHelper`, registers Handlebars helpers via global `Handlebars`.
  - Back-compat: currency helpers used by templates in [app/tmpls](app/tmpls); need deprecation window aligned with template rebuild.
- **head.js**
  - Consumers: [app/scripts/hooks/press.js](app/scripts/hooks/press.js).
  - Globals: reads `window`, shows `alert`, expects `window.gaMeasurementID` & `gtag`.
  - Back-compat: press hook still depends on IE alert until UI handles unsupported browsers, so adapters required in early phases.
- **index.js**
  - Consumers: not imported elsewhere (acts as legacy barrel for third-party bundlers).
  - Action: once new module graph finalized, ensure this barrel mirrors new file layout or publish removal notice.
- **postmessage.js**
  - Consumers: none via ESM imports today.
  - Globals: relies on `window.postMessage` and falls back to hash-polling.
  - Back-compat: retain fallback until iframe integrations confirm they no longer require hash transport.
- **shared.js**
  - Consumers (plugins): [app/scripts/plugins/slide.js](app/scripts/plugins/slide.js#L1-L161), [app/scripts/plugins/privacy.js](app/scripts/plugins/privacy.js), [app/scripts/plugins/markdown.js](app/scripts/plugins/markdown.js).
  - Consumers (hooks/theme): [app/scripts/theme/default.js](app/scripts/theme/default.js), [app/scripts/hooks/track.js](app/scripts/hooks/track.js), [app/scripts/hooks/ui.js](app/scripts/hooks/ui.js), [app/scripts/hooks/resource.js](app/scripts/hooks/resource.js), [app/scripts/hooks/slide.js](app/scripts/hooks/slide.js), [app/scripts/hooks/lang.js](app/scripts/hooks/lang.js), [app/scripts/hooks/gallery.js](app/scripts/hooks/gallery.js), [app/scripts/hooks/greet.js](app/scripts/hooks/greet.js), [app/scripts/hooks/lightbox.js](app/scripts/hooks/lightbox.js), [app/scripts/hooks/arena.js](app/scripts/hooks/arena.js), [app/scripts/hooks/contact.js](app/scripts/hooks/contact.js), [app/scripts/hooks/slider.js](app/scripts/hooks/slider.js), [app/scripts/hooks/search.js](app/scripts/hooks/search.js), [app/scripts/hooks/modal.js](app/scripts/hooks/modal.js).
  - Notes: heavy DOM usage; every refactor must keep `ensureBrowser` semantics to avoid SSR regressions.
- **sprintf.js**
  - Consumers: none via ESM; referenced only through legacy bundler.
  - Action: treat as vendored dependency; plan replacement with native template helpers after format refactor.

## 2. Testing Harness & Lint Guardrails
- Added `vitest@^4.0.16` with scripts `npm run test` (watch) and `npm run test:run` (CI) plus [vitest.config.js](vitest.config.js) using `jsdom` and project-wide include patterns.
- Introduced lint guard in [.eslintrc.json](.eslintrc.json) via `no-restricted-syntax` to block `window.*` assignments, forcing developers to route mutations through runtime adapters or plugins.

## 3. Legacy Adapter Plan
- **detect.js** → `legacyDetect` adapter to keep `jQuery.browser.mobile` flag available until jQuery is fully removed from modules `arena`, `menu`, `resource` (target: Stage 3 completion).
- **head.js** → `legacyHead` adapter toggles GA + IE alert messaging; required until the theme-level privacy/consent UI replaces the blocking alert.
- **event.js** → `legacyEventBus` wrapper exposing the old `gee.event` shape while the Map-based emitter is rolled out; ensures hooks using `gee.event.subscribe` remain functional during migration.

## 4. Back-Compat Windows
- Shared helpers touching DOM must stay SSR-safe and continue exporting `ensureBrowser` until every hook adopts dependency injection.
- Legacy adapters above remain for at least one release after their consumer modules migrate, giving downstream templates time to update.
