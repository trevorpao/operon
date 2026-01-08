
- **Global Themes** – lib:
  - Eliminate legacy globals (`window`, `gee`, `jQuery`) and wrap each utility in pure ES modules so plugins/hooks can tree-shake them.
  - Introduce a shared dependency resolver that injects optional peers (moment, Handlebars, gene) instead of touching globals on import—this keeps SSR safe and simplifies unit testing with dependency mocks.
  - Split side-effect code (DOM polyfills, GA bootstrapping) from pure helpers so headless builds never execute browser-only logic during require time; gate them behind `ensureBrowser()`.

- **defaultPlugin.js** – defaultPlugin.js:
  - Convert to a lightweight class or factory with runtime validation (unique name registry, optional teardown). Today it just shallow-spreads overrides, so lifecycle hooks like `destroy` are easy to accidentally drop.
  - Emit structured errors (with plugin name) when `install` throws; hook into app diagnostics so failing plugins don’t silently reject.

- **detect.js** – detect.js:
  - This entire file injects a 2007-era jQuery UA sniff. Replace it with a modern feature-based helper (e.g., `navigator.userAgentData` fallback) that simply exports booleans; ditch the global `jQuery.browser.mobile` mutation.
  - Provide TypeScript definitions and unit tests for supported devices, and make the API promise-based so async detection (e.g., importing `detect-it`) stays simple.

- **event.js** – event.js:
  - Rebuild the event bus with `Map<string, Set<fn>>` instead of the procedural jQuery iteration; add `once`, `offAll`, and wildcard namespaces.
  - Expose the emitter via the plugin container (so hooks can share a single bus) .

- **extend.js** – extend.js:
  - Break this monolith into focused helpers (`dom/placeholder`, `dom/classList`, `form/serialize`) for easier testing; each currently shares state through `extendHelper`.
  - Replace manual placeholder polyfill with a single IntersectionObserver-based util and ensure listeners are cleaned up via returned teardown functions.
  - Move numeric/text helpers into dedicated modules and expose pure functions for formatting (no app mutations during import).

- **format.js** – format.js:
  - Introduce a dependency injection layer for moment/Handlebars so downstream bundles can swap in lighter libs (Day.js, Luxon); currently `resolveDeps()` reads globals eagerly, which breaks SSR.
  - Split the helpers into domain-specific files (currency, thumbnails, string transforms); add exhaustive unit tests to guard against regressions in `thumbnail()` and `percent()` logic.
  - Replace `Handlbars.registerHelper` side effects with an explicit `registerTemplateHelpers(handlebarsInstance)` call to avoid polluting global Handlebars.

- **head.js** – head.js:
  - Remove `alert()`-based IE blocking and instead expose a `requireModernBrowser()` helper that hooks into UI warnings; let the consuming theme decide how to notify users.
  - Wrap GA bootstrap in a plugin that reads measurement ID from config instead of assuming `window.gaMeasurementID`.

- **index.js** – index.js:
  - Fix the broken export path (`formatHelper` points to a non-existent module) and ensure the barrel only re-exports side-effect-free modules; otherwise each import triggers the GA alert/head script.

- **postmessage.js** – postmessage.js:
  - Add schema validation/parsing helpers (e.g., JSON-safe decoding) and allow multiple listener teardown handles; consider returning a promise-based interface for request/response flows.

- **shared.js** – shared.js:
  - Extend this with additional guards (e.g., `isSSR`, `withDocument(cb)`) so other libs stop checking globals manually; expose typed aliases for `Node`/`Element` conversions to satisfy TS.
