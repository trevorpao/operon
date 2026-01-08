## RefactorLib – 後續優化方向

### 1. 型別與契約強化
- 以 TS 定義 `detect` capability 物件、`postmessage` schema、`createPlugin` context，減少重構後靠註解推測型別的成本。
- 搭配 ESLint 規則禁止在 lib 層引用 `window`/`document`，避免 Stage 2 之後又出現非預期副作用。

### 2. 套件拆分與 Tree-shaking
- 將 `dom/*`, `forms/*`, `number/*` 依 domain 發佈成獨立 entry（`exports` map），讓 bundler 可以按需載入並減少各 hook 引入整包工具。
- 把 `head`、`detect` 等仍是 IIFE 的模組改寫為純 ESM + factory，並提供 `package.exports` 中的 `browser`/`module` 入口確保 SSR 友善。

### 3. Observability / Telemetry
- 在 `lib/event`、`postmessage` 增加可選 `onError`/`onTrace` callback，集中記錄 listener 過載、timeout、schema 驗證失敗事件，方便 A/B 測試。
- GA/Privacy banner 相關 hook 可透過 `headPlugin` 提供的 `onIncompatible` 注入自訂 UI，並上報實際觸發次數供產品決策。

### 4. Migration Toolkit
- 產出 codemod（jscodeshift/ts-morph）自動把 `app.extendHelper.*` 對應到新的 `dom/`、`forms/` helper，降低剩餘模組進場成本。
- 在 `docs/spec/guide.md` 增加「RefactorLib 落地清單」，列出 import 檢查、teardown 保證、postmessage schema 撰寫流程，提供初階工程師自測模板。

### 5. Regression 自動化
- 完成 `npm run build` + `npm run test:run` 的 CI pipeline，並以 Playwright 覆蓋 privacy banner、draft import、slider 三個 Stage 5 smoke cases。
- 將現有 `theme.default` 手動腳本改成 Vitest component tests（jsdom + hooks mock），縮短每次 release 的人工點擊流程。
