# reusableHelpers 驗收（check）

> 依 [flow.md](../../flow.md) 規範，使用下列核對清單驗證 `plan.md` 各 Stage 是否完成；PR 提交前需勾選並附上證據（測試截圖、bundle 報表）。

## Stage 0 — 基線

- [x] `app/scripts/lib/ui.js` scaffold 已建立並輸出 `ui.menuData/templates/accessibility` 空函式。
- [x] `app/scripts/hooks/menu.js`、`app/scripts/plugins/menu.js`、`app/scripts/lib/helpers/menu.js` 皆以 TODO 註記列出需搬遷段落。
- [x] `pnpm test tests/menu.hook.spec.js --runInBand` 完成，結果附於 PR，作為後續比較基準。

## Stage 1 — 資料 / 模板 helper

- [x] `ui.menuData` 完整涵蓋 normalize/load/cache/timeout/schema 流程；均為 pure function。
- [x] `ui.menuTemplates` 具備 DOM partial 登記、Handlebars cache、helper bag merge 與 lite/extended 切換。
- [x] Hook/plugin 內資料/模板邏輯均轉呼叫 helper，舊實作僅以 wrapper/fallback 保存。
- [x] `tests/lib/ui.menuData.test.js`、`tests/lib/ui.menuTemplates.test.js` 通過並覆蓋 lite + debug 路徑。

## Stage 2 — 互動 / A11y + Mode 切換

- [x] `ui.menuAccessibility` 實作完鍵盤、ARIA、secure links、狀態同步，並具備單測。
- [x] `createMenuHelpers({ appDebug, flags })` 可根據 `app.debug` 切換模式，並記錄註冊 token 避免雙重綁定。
- [x] Hook/plugin 於初始化時讀取 `app.debug`，僅在 debug 模式掛載互動行為且提供 `ensureSingleRegistration()`。
- [x] `pnpm test tests/lib/ui.menuAccessibility.test.js`、`pnpm vitest run tests/menu.hook.spec.js --grep "keyboard" --runInBand`（`app.debug=true/false` 各一次）皆通過並附執行紀錄。

## Stage 3 — 整合 + Mode 驗證

- [x] 臨時 wrapper / legacy fallback 已移除，`menu` hook/plugin 只透過 `ui.js` helper 執行。
- [x] `check.md` 內 Lite/Debug 功能矩陣（如下）已逐項標示；`menu.template.spec.js` 與 `menu.hook.spec.js` 皆覆蓋兩種模式。
- [x] `pnpm test tests/menu.*.spec.js` 全數通過，必要時更新快照並記錄 diff。

### Lite / Debug 功能矩陣

| 功能 | Lite（app.debug=false） | Debug（app.debug=true） | 驗證方式 |
| --- | --- | --- | --- |
| Data fetch/cache | ✅ | ✅ | `tests/lib/ui.menuData.test.js` coverage，並檢查 cache 事件 |
| DOM partial 掃描 | ❌ | ✅ | `tests/lib/ui.menuTemplates.test.js` + `menu.template.spec.js` |
| Handlebars helper bag | ✅ | ✅ | Template 單測輸出、Vitest snapshot |
| ARIA / keyboard / secure links | ❌ | ✅ | `ui.menuAccessibility` 單測 + `menu.hook.spec.js --grep keyboard` |
| SSR context 注入 | ❌ | ✅ | `menu.template.spec.js` + Twig smoke（apps/themes default） |
| Diagnostics log | ❌ | ✅ | Inspection `app.debug` 模式下 log 事件 |

> 完成驗收時需在 PR 說明附上表格截圖或逐列說明。

## Stage 4 — 文件 / Bundle

- [ ] `README`、`docs/spec/history.md` 已更新 helper 使用方式與 mode 切換說明。
- [ ] `docs/spec/reusableHelpers/check.md`（本檔）與 `optimization.md` 已同步更新；未來可優化項目列入 `optimization.md` 草稿。
- [ ] `pnpm build --mode analyze` 產出的 bundle 報表顯示：lite 頁面體積相較改造前明顯下降（PR 需附數字或圖）。
- [ ] 若 bundle 未達標，已根據 plan 中 fallback（tree-shake/dynamic import）採取修正並重新量測。

## 高風險覆核

- [ ] SSR partial path（`/app/themes/default/ssr/components/navbar.twig`） smoke 測試結果附證明，若失敗可切回 `legacyRenderMenu()`（Stage 2 fallback）。
- [ ] Keyboard/A11y 雙重註冊檢查：log 或測試證實單頁僅會載入一次互動。
- [ ] `app.debug` 預設值守護：若未定義時 console.warn 提示並自動進 lite，測試覆蓋此情境。
- [ ] Bundle tree-shaking：若需設定 `treeshake.moduleSideEffects` 或動態 import，需在 PR 內詳細記錄設定與影響。

---

> 驗收完成後，將勾選結果與證據附在對應 PR 的說明或 checklist 截圖中。
