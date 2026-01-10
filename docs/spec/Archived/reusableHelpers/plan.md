# reusableHelpers 規劃（plan）

> 依 [flow.md](../../flow.md) 要求，列出階段拆解、PR 切分、預期 smoke 測試，以及高風險區塊的 fallback/adapters。

## Stage 0（基線盤點） — PR#1

- 建立 `app/scripts/lib/ui.js` scaffold，輸出 `ui.menuData/templates/accessibility` 空函式。
- 盤點 `app/scripts/hooks/menu.js`、`app/scripts/plugins/menu.js`、`app/scripts/lib/helpers/menu.js` 的共用邏輯並以 TODO 註解標示未搬遷區段。
- 新增 Vitest smoke（沿用 `tests/lib/*`）以鎖定現行 `menu` hook 渲染與 keyboard 行為（暫時標註為 legacy baseline）。
- Smoke：`pnpm test menu.hook.spec.js --runInBand`，確認現況綠燈作為後續 refactor 基準。

## Stage 1（資料/模板 helper） — PR#2

- 實作 `ui.menuData`（normalize/load/cache/timeout/schema）與 `ui.menuTemplates`（partial 登記、HB cache、helper bag）。
- 將 hook/plugin 中的資料讀取與模板解析呼叫替換為新的 helper；保留舊實作作為 fallback wrapper 以便 diff。
- 為兩個 namespace 補單元測試：
	- `tests/lib/ui.menuData.test.js`
	- `tests/lib/ui.menuTemplates.test.js`
- Smoke：跑 `pnpm test tests/lib/ui.menuData.test.js tests/lib/ui.menuTemplates.test.js`，確認 lite/debug 模式皆能載入模板但尚未啟用互動。

## Stage 2（互動/A11y helper + mode 切換） — PR#3

- 實作 `ui.menuAccessibility`（keyboard、ARIA、secure links、狀態機），並將 hook/plugin 原有事件綁定改為調用 helper。
- 在 `ui.js` 增加 `createMenuHelpers({ appDebug, flags })`，統一根據 `app.debug` 設定 lite 或 debug 流程，並允許 flags 覆寫（僅測試使用）。
- 更新 `menu` hook/plugin：
	- 初始化時讀取 `app.debug`，只在 debug 模式註冊額外互動。
	- 提供 `ensureSingleRegistration()` 以避免雙重註冊，同時記錄 telemetry。
- Smoke：
	- `pnpm test tests/lib/ui.menuAccessibility.test.js`
	- `pnpm vitest run tests/menu.hook.spec.js --grep "keyboard" --runInBand`（須在 `app.debug=true` 與 `false` 下各跑一次）。

## Stage 3（整合 + lite/debug 驗證） — PR#4

- 移除臨時 fallback wrapper，確保 hook/plugin 僅透過 `ui.js` helper 運作。
- 依 idea 規範補 `mode` 對照矩陣到 `check.md` 草稿。
- 針對 `menu.template.spec.js`/`menu.hook.spec.js` 擴增：
	- lite：確認只載入 yell/render/bind，不投放 A11y。
	- debug：確認 SSR context、DOM partial、log 皆運作。
- 執行 `pnpm test tests/menu.*.spec.js`，並以 `pnpm vitest run tests/menu.hook.spec.js --update` 更新 snapshot（若有）。

## Stage 4（文件 & bundle 驗證） — PR#5

- 依 idea/check 要求更新 `README`、`docs/spec/history.md`（僅描述使用方式）、`docs/spec/reusableHelpers/check.md` 验證清單。
- 使用 `pnpm build --mode analyze` 比較導入前後 bundle：
	- lite 頁面需顯著下降；若無法達標，回 Stage 3 調整 tree-shaking。
- 在 `optimization.md` 草稿記錄後續可優化項目（如 future codemod）。
- Smoke：執行 `pnpm build --mode analyze` 並附上報表截圖/摘要於 PR 說明。

## 高風險區塊與 Fallback/Adapter

| 區塊 | 風險 | 對策 / Fallback |
| --- | --- | --- |
| SSR partial（Twig + HBS） | helper 抽離後資料結構不吻合，造成 SSR/CSR 不一致 | Stage 2 開始即保留 `legacyRenderMenu()`，可用 `APP_SSR_SAFE=true` 時改回舊路徑；完成 Stage 3 後移除。 |
| Keyboard/ARIA | debug 模式需要完整交互，lite 應不載入；可能誤觸兩套邏輯 | 在 `createMenuHelpers` 中記錄註冊 token，若已安裝過互動則跳過；同時在 Vitest 中模擬 `app.debug` 兩種值。 |
| `app.debug` 來源 | runtime 若尚未附加 app.debug 會導致 mode 判斷失效 | Stage 0 PR 添加守護：若 `typeof app.debug !== 'boolean'` 則預設 lite 並在 console.warn 提示。 |
| Bundle 體積 | lite 仍被 tree-shake 失敗 | Stage 3 先改用動態 import 或條件匯出，必要時在 `vite.config.js` 加入 `treeshake.moduleSideEffects` 配置。 |

---

> 下一步：完成 Stage 0 後回填 smoke 結果，並依序推進各 PR。
