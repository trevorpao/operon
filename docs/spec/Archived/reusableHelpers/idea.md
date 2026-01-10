# reusableHelpers 需求 / 風險（idea）

## 目標

- 將 `app/scripts/hooks/menu.js`、`app/scripts/plugins/menu.js` 內的通用邏輯（資料抓取、模板解譯、ARIA/互動、fallback、logging）抽離為獨立 helper 模組，讓其他 gee hook/plugin 亦可共用。
- 提供「lite 模式」：在僅需 legacy `app.menu` 行為時（`app.yell + Handlebars render`）可跳過 DOM partial 掃描、無障礙互動、SSR context，藉由 helper 選項切換，縮減 bundle 與維運成本。
- 讓「除錯模式」仍保有現行強化功能（SSR 對齊、Keyboard/ARIA、mock schema、診斷 log），並以 reusable helper 裝載，避免未來 feature 追加時再膨脹主檔案。

## 範圍

- 規劃 helper 分層與預期模組，全部集中於即將建立的 `app/scripts/lib/ui.js` 中，並以命名空間區分職責：
	- `ui.menuData`：`normalizeNode`、`loadMenuWithCache`、`withTimeout`、schema 驗證等資料流程（全為 pure function）。
	- `ui.menuTemplates`：DOM partial 登記、Handlebars cache、helper bag 合併、lite/extended template 分歧。
	- `ui.menuAccessibility`：鍵盤/ARIA 綁定、狀態切換、secure links 與 A11y fallback。
- 重構 `menu` plugin/hook 以引用 `app/scripts/lib/ui.js` 的 helper，而非內嵌實作。
- helper 初始化需讀取 `app.debug` 以決定 `mode: 'lite' | 'debug'`，並允許個別 feature flag（例如 `enableA11y`, `enableSsrContext`, `enableDiagnostics`）覆寫細項。
- 補齊單元測試（以 helper 為單位）確認 lite/debug 行為一致；更新 docs 說明各模式差異。

### 不含

- 重新設計 app.menu 以外的 hook/plugin（本次僅提供 reusable helper，未強制導入到其他模組）。
- 大幅改寫 Handlebars 模板（僅可調整為可共用 helper，不進行視覺切版改動）。
- server-side API 變更或後端 caching 策略。

## 核心需求（Spec）

1. **Helper 模組化**：所有「可共用」邏輯需以 pure function 或 class 實作並集中於 `app/scripts/lib/ui.js`，hook/plugin 僅負責 wiring 與選項傳遞。
2. **Mode 切換**：
	- `lite`（預設 / `app.debug === false`）：只載入 `app.yell -> render -> bind gee`，無 keyboard/ARIA/fallback/SSR context；僅需 1 個 template。
	- `debug`（`app.debug === true`）：啟用現有完整功能；若某 flag 為 false，需安全跳過（例如 `options.enableDomPartials = false`）。
3. **回溯相容**：`menu.load` hook / `data.menu` plugin 的公開 API 不可 breaking；legacy 專案可設定 `mode: 'lite'` 取得原始體驗。
4. **抽象檢查**：helper 需暴露最小 API，例如 `createMenuRenderer(opts)` `createMenuInteractions(opts)`，並具備 TS/JS Doc 字段。
5. **測試**：
	- helper 單測覆蓋 load/cache、template resolve、keyboard flow。
	- hook/plugin 整合測試需同時跑 lite 與 debug。

## 依賴

- `app/scripts/legacy/menu.js`：提供 lite 模式對照與回歸測試案例。
- `app/scripts/lib/ui.js`：本次需新建，統整現有 UI helper 並輸出 `ui.menu*` 命名空間，盤點哪些邏輯從 `app/scripts/lib/helpers/menu.js` 或其他檔案搬遷。
- `app/themes/default/partials/*.hbs` 與 SSR Twig：確認 helper 抽離後仍能被 inline template 使用。
- `app.yell` / `gee` runtime：需支援同時載入 legacy 與新 hook（避免 race condition）。
- `docs/spec/mvJsRender`：沿用既有無障礙與資料契約規範。

## 風險與對策

| 風險 | 等級 | 對策 |
| --- | --- | --- |
| helper 抽離後造成循環依賴（hook/plugin 互相 import） | 高 | 設計單向依賴：helper 不得 import hook/plugin；必要時以事件/回呼傳遞。 |
| lite/debug 行為不一致導致 bug | 高 | 建立 regression 測試矩陣：lite 與 debug 均跑 `menu.hook.spec.js` 子集，並在 docs 記載差異。 |
| 打包體積未顯著下降（lite 模式仍載入全部 helper） | 中 | 使用 lazy import 或 tree-shaking-friendly export，確保 `mode: 'lite'` 不引用 A11y/helper code。 |
| SSR 依賴被不慎移除 | 中 | plan/check 中列出 SSR 對應檔案，抽離時補 fallback；同時對 `/app/themes/default/ssr/components/navbar.twig` 做 smoke 測試。 |
| 抽象過度，導致維修難 | 低 | 在 idea/plan 階段先畫 helper dependency diagram，規定每個 helper 的單一職責。 |

## 討論重點與結論

- Helper 分拆顆粒度：統一集中在 `app/scripts/lib/ui.js`，透過 `ui.menuData/templates/accessibility` 命名空間對應三大責任，避免在 lib 下建立 module 專屬資料夾。
- Mode/flag 的來源：頁面模式由全域 `app.debug` 決定；除測試外不再透過 hook options 切換。
- 舊頁面共存策略：不可同頁共存，由 `app.debug` 決定單一模式以避免雙重註冊。
- CLI/工具支援：暫不提供 codemod，改以文件教學協助手動導入。
- 版本發布：在 helper 穩定前不更新 `docs/spec/history`/`rule`，保留在未來 Optimization 階段處理。

## 驗收建議

- **功能對照表**：在 `check.md` 列出 lite/debug 功能矩陣，逐項打勾。
- **行為測試**：`vitest` 或 `testing-library` 跑 lite/debug 各一組 smoke，確保 menu render 與 keyboard 流程不同模式皆成立。
- **bundle diff**：`vite build --mode analyze` 比較現行 vs 抽離後的 bundle，lite 頁面需顯著下降。
- **docs**：更新 `README` 或 `docs/spec/history.md`，描述 helper 使用方式與模式切換。

---
> 本文件依 [flow.md](../../flow.md) SOP 撰寫，確保需求、風險與驗收基準皆可追蹤。
