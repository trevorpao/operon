# mvJsRender 驗收清單（check）

## 驗收條目

### Stage 1：資料契約與模板
- [x] `schemas/menu.json` 建立完成並於 README 標註版本、維護人（對應 plan 1.1）。
- [x] `pnpm test:schema menu`（AJV）通過，`/app/mock/api/menu_lotsMenu.json` 與 schema 一致（plan 1.2）。
- [x] `partials/menuList.hbs`/`menuItem.hbs` 與 helper 已覆蓋 depth class、badge、data-menu-path 等欄位（plan 1.3）。
- [x] Handlebars 預編譯流程完成，`menu.template.spec.js` 以 mock `app.yell` 產生 snapshot 並無 inline script/eval（plan 1.4）。

### Stage 2：plugin/hook 與資料載入
- [x] `app/scripts/plugins/menu.js` 僅透過 `app.yell('menu_lotsMenu', opts)` 取得資料，導出 `loadMenu/render/destroy` 且通過單元測試（plan 2.1）。
- [x] `app/scripts/hooks/menu.js` 在 `gee.init` 時對 `data-gene="init:menu.load"` 正確綁定並成功渲染 DOM（plan 2.2）。
- [x] hook 具備 `app.yell` timeout/fallback（顯示錯誤提示、retry）並於 teardown 後無殘留 listener/class（plan 2.3）。
- [x] menu DOM 具備 aria/focus trap、鍵盤 `Arrow/Enter/Space` 行為、`rel="noopener"` 與追蹤 data-* 欄位（plan 2.4）。

### Stage 3：測試、a11y、追蹤與文件
- [x] `tests/lib/menu.hook.spec.js` 以 mocked plugin 驗證 `gee.init → menu.load → render → teardown`；`npx vitest run tests/lib/menu.hook.spec.js` 全數通過（plan 3.1）。
- [x] 同一 spec 內的 `handles keyboard interactions and passes axe audit` 以 Testing Library DOM + axe 核對鍵盤互動、ARIA 與 `rel="noopener"`，測試結果即為可引用報告（plan 3.2）。
- [x] `npx vite build docs` 確認 bundle 無 jQuery；`npx esbuild app/scripts/hooks/menu.js --bundle --platform=browser --format=esm --outfile=/tmp/menu.bundle.js` 後 `grep -n "eval" /tmp/menu.bundle.js` 未找到 unsafe eval。`--report` flag 在 Vite 7.3.0 已棄用、`--supported:unsafe-eval=false` 亦非 esbuild 合法參數，已於紀錄中註明（plan 3.3）。
- [x] 本檔與 [plan.md](plan.md) 已更新 Stage 3 勾選與指令紀錄，提供 PR 追蹤（plan 3.4）。

## 驗證方式
- Stage 1 以 AJV + Handlebars snapshot 驗證；Stage 2 以 demo smoke（`gee.init()`）與 hook teardown 日誌驗證；Stage 3 以 vitest/Testing Library/axe 與 build 報告交叉驗證。
- 完成每項後，在對應 PR 附上測試指令、log、截圖或報告連結並勾選本清單。

---
> 本清單依據 [plan.md](plan.md)、[flow.md](../flow.md) SOP 撰寫，請於每階段完成後逐條驗證與勾選。
