# mvJsRender 驗收清單（check）

## 驗收條目

### Stage 1：資料契約與模板
- [x] `schemas/menu.json` 建立完成並於 README 標註版本、維護人（對應 plan 1.1）。
- [x] `pnpm test:schema menu`（AJV）通過，`/app/mock/api/menu_lotsMenu.json` 與 schema 一致（plan 1.2）。
- [x] `partials/menuList.hbs`/`menuItem.hbs` 與 helper 已覆蓋 depth class、badge、data-menu-path 等欄位（plan 1.3）。
- [x] Handlebars 預編譯流程完成，`menu.template.spec.js` 以 mock `app.yell` 產生 snapshot 並無 inline script/eval（plan 1.4）。

### Stage 2：plugin/hook 與資料載入
- [ ] `app/scripts/plugins/menu.js` 僅透過 `app.yell('menu_lotsMenu', opts)` 取得資料，導出 `loadMenu/render/destroy` 且通過單元測試（plan 2.1）。
- [ ] `app/scripts/hooks/menu.js` 在 `gee.init` 時對 `data-gene="init:menu.load"` 正確綁定並成功渲染 DOM（plan 2.2）。
- [ ] hook 具備 `app.yell` timeout/fallback（顯示錯誤提示、retry）並於 teardown 後無殘留 listener/class（plan 2.3）。
- [ ] menu DOM 具備 aria/focus trap、鍵盤 `Arrow/Enter/Space` 行為、`rel="noopener"` 與追蹤 data-* 欄位（plan 2.4）。

### Stage 3：測試、a11y、追蹤與文件
- [ ] `menu.hook.spec.js` 以 stub `app.yell` 驗證 `gee.init → menu.load → render → teardown`（plan 3.1）。
- [ ] Testing Library + axe 報告（含鍵盤行為錄影/截圖）已附於 PR/check.md，顯示無 critical issue（plan 3.2）。
- [ ] `pnpm vite build --report`、`esbuild --supported:unsafe-eval=false`、ESLint/vitest 全數通過且 bundle 無 jQuery/unsafe chunk（plan 3.3）。
- [ ] docs（guide/rule 規範、plan/check 勾選紀錄）皆更新完成，追蹤欄位/fallback 策略已有文件（plan 3.4）。

## 驗證方式
- Stage 1 以 AJV + Handlebars snapshot 驗證；Stage 2 以 demo smoke（`gee.init()`）與 hook teardown 日誌驗證；Stage 3 以 vitest/Testing Library/axe 與 build 報告交叉驗證。
- 完成每項後，在對應 PR 附上測試指令、log、截圖或報告連結並勾選本清單。

---
> 本清單依據 [plan.md](plan.md)、[flow.md](../flow.md) SOP 撰寫，請於每階段完成後逐條驗證與勾選。
