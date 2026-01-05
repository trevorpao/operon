Here’s a concrete plan to refactor app.js toward the pure-JS spec, with priorities and replacements:

- **Global setup**
  - Replace `var`/function constructor with ES modules + `const/let`; export a singleton or named functions.
  - Drop `$.fn.gene` coupling; import `gee` explicitly.
  - Swap `$(window)/(document)/$('body')` with `window/document.body` and cached queries via `document.querySelector`.

- **Environment & layout**
  - Replace `$('body').width()` with `window.innerWidth`; toggle `mobile/tablet` using `classList`.
  - Refactor `announce` to a simple console.warn/info utility; keep the Self-XSS warning.

- **Template handling**
  - Remove `$.templates` / JsRender: expect precompiled Handlebars runtime functions (e.g., `tmplStores[name] = templates[name]`).
  - Replace `box.html()/append/prepend` with `element.innerHTML` and `insertAdjacentHTML`.
  - For `loadHtml/loadTmpl`, switch `$.load` to `fetch` + `response.text()`, then set `innerHTML` and call `gee.init()`.

- **Pagination**
  - Remove `twbsPagination`; implement a lightweight paginator: compute `totalPages`, render buttons/links, attach `click` handlers that set `pageCounter` and invoke the callback.

- **Scrolling & animation**
  - Replace `app.body.animate({...})` with `window.scrollTo({ top: 0, behavior: 'smooth' })`.
  - Remove jQuery easing dependencies.

- **Forms & validation**
  - Swap `ta.find(':input')`, `col.val`, `prop`, etc., with `querySelectorAll` and direct property access.
  - Replace Validatr with native Constraint Validation or a small helper (e.g., `if (!form.reportValidity()) return`).

- **State & storage**
  - Keep `localforage` (or consider native `localStorage` if sufficient) for font size; adapt its callbacks to async/await.

- **Events & hooks**
  - Replace all `$(...).on(...)`/`one`/`off` with `addEventListener`; for dynamic content, rely on `gee.hook` or event delegation via `document`.
  - jQuery `.data()` becomes `element.dataset`; `.closest()` becomes `element.closest()`.

- **Utilities**
  - Rewrite `waitFor` using Promises + `setTimeout`/`setInterval` without `$.Deferred`.
  - Replace `cleanArray`, `tmpl`, etc., with small pure functions.
  - Remove `$.views.helpers`; instead, export helpers for Handlebars registration in one place.

- **Error/success UI**
  - Replace `gee.alert` calls with a unified notifier (or keep if provided by geneEH); update `showErrMsg` to toggle classes with `classList`.
  - Remove Bootstrap-specific class toggling, because Bootstrap is being removed.

- **Module loading**
  - `init(modules)`: keep the sequence, but make it async if modules become dynamic imports; avoid `modules.map` side-effects—use `for...of`.

- **API endpoints**
  - Centralize URL config; avoid mutating `gee.apiUri/mainUri` globally where possible—pass into modules or set once at startup.

- **Testing/compat**
  - After each swap, remove the corresponding jQuery plugin dependency (twbsPagination, Switchery bindings, etc.) and ensure equivalent native behavior is covered by small helpers.

