# mvJsRender 實作計畫（plan）

## 分階段（Stage）/ 子任務

### Stage 1：資料契約與模板（idea §核心需求、§主要規格-1/2）
- [x] 1.1 依 `/app/mock/api/menu_lotsMenu.json` 制定 `schemas/menu.json`，並在 README 註記 schema 版本與維護人。
- [x] 1.2 撰寫 AJV 測試（`pnpm test:schema menu`）確保 mock 與 schema 對齊。
- [x] 1.3 設計 `partials/menuList.hbs`、`partials/menuItem.hbs` 與 helper（`isExternal`, `listDepthClass`, `renderBadge`）。
- [x] 1.4 將 Handlebars 納入 build pipeline 預編譯，並撰寫 `menu.template.spec.js` 透過 mock `app.yell` 資料產生 snapshot。

### Stage 2：menu plugin/hook 與資料載入（idea §範圍、§主要規格-3）
- [ ] 2.1 實作 `app/scripts/plugins/menu.js`，封裝 `app.yell('menu_lotsMenu', opts)`，並導出 `loadMenu`, `render`, `destroy`。
- [ ] 2.2 實作 `app/scripts/hooks/menu.js`，在 `gee.init` 註冊 `data-gene="init:menu.load"`，負責呼叫 plugin、渲染 DOM、註冊事件。
- [ ] 2.3 實作 `app.yell` timeout/fallback（顯示錯誤提示與 retry），hook teardown 要清理所有 listener/class。
- [ ] 2.4 補齊 aria、keyboard/focus trap、`rel="noopener"`、`data-analytics-id`、`data-menu-path` 等屬性並記錄在 check 清單。

### Stage 3：測試、a11y、追蹤與文件（idea §風險與對策、§驗收）
- [ ] 3.1 撰寫 `menu.hook.spec.js`，使用 stub `app.yell` 驗證 `gee.init → menu.load → render` 流程與 teardown。
- [ ] 3.2 以 Testing Library + axe 驗證 keyboard 互動與 ARIA，輸出報告連結至 check.md。
- [ ] 3.3 `pnpm vite build --report`、`esbuild --supported:unsafe-eval=false` 確認 bundle 無 jQuery/unsafe chunk。
- [ ] 3.4 更新 docs（guide/rule 若有新規）與 `plan.md`/`check.md` 勾選紀錄，確保追蹤欄位與 fallback 策略文件化。

## PR 切分建議
- PR1（Stage 1）：schema + Handlebars + template 測試。
- PR2（Stage 2）：plugin/hook + `app.yell` 流程 + ARIA/追蹤屬性。
- PR3（Stage 3）：hook 測試、axe/a11y、bundle/安全檢查、文檔更新。

## 預期 smoke 測試
- `pnpm test:schema menu` 與 `vitest menu.template.spec.js` 全數通過，模板輸出與 schema 一致。
- Demo 頁呼叫 `gee.init()` 後，`data-gene="init:menu.load"` 自動渲染 menu；巢狀/追蹤/ARIA 屬性與設計稿一致。
- 模擬 `app.yell` 失敗（stub reject）時，UI 顯示 fallback 並允許 retry，teardown 後沒有重複綁定。
- Testing Library/axe 報告無 critical a11y issue；鍵盤 `Arrow/Enter/Space` 能展開/收合。
- `pnpm vite build --report` 無 jQuery/unsafe-eval；ESLint/vitest 無未捕捉錯誤。

## 高風險區塊 fallback/adapters
- Schema 變動：AJV 驗證失敗時阻擋 build，必要時提供 `transformMenuData()` adapter 將新欄位轉為舊版結構。
- `app.yell` 超時/錯誤：hook 提供 3 秒 timeout，失敗時顯示提示並允許 retry；同時記錄在 console 方便 QA。
- geneEH 未觸發：提供 `initMenuStandalone()` 以 DOMContentLoaded fallback，方便 smoke 測試或舊頁面使用。
- Keyboard/a11y 尚未完成：在 check.md 註記例外並提供臨時 hover-only 模式，避免阻塞上線。

---
> 本計畫依據 [flow.md](../flow.md) SOP、[guide.md](guide.md)、[rule.md](rule.md) 撰寫，後續請依 stage/PR 執行與驗收。
