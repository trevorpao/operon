

# mvJsRender 需求 / 風險（idea）

## 目標

- 以 Handlebars 預編譯模板結合 geneEH 行為層，透過 `gee.init → menu.load hook → app.yell` 流程在 CSR 階段渲染無 jQuery 依賴的多層 menu 元件。
- 讓同一份模板覆蓋 navbar、sidebar 與 footer，支援 badge、空節點 placeholder、CTA 連結等客製。
- 將模板與資料流程納入 build/test（vite + vitest）管線，確保在 CI 階段即可驗證 `app.yell + template` 的輸出與互動。

## 範圍

- 解析 `/app/mock/api/menu_lotsMenu.json` 的階層資料並建立遞迴 partial。
- 實作 geneEH hook/plugin（`init:menu.load`）以 `gee.init` 時機呼叫 `app.yell`，負責資料注入、模板渲染與行為註冊/teardown。
- 補齊 aria、keyboard、focus 與 target 行為，提供行銷/追蹤可用的 data-* 標示。
- 透過預編譯 Handlebars 模板與 helpers，讓 runtime 與測試共用同一份輸出定義。
- 針對 menu 模組補齊單元測試（資料解析）、行為測試（hooks）、模板 snapshot。

### 不含

- 後端 API 實作或動態 CRUD。
- 舊版 gene 模組或 jQuery menu 維護。
- 其他模板引擎（僅支援 Handlebars 預編譯結果）。

## 核心需求

- **資料契約**：欄位 `id`, `title`, `url`, `target`, `children`, `badge`, `blank`, `color`, `attrs`，缺值需有預設（如 `blank = false`）。
- **資料載入**：`menu.load` hook 只能透過 `app.yell('menu_lotsMenu', ...)` 取得資料，測試階段改以 mock `app.yell` 回傳 `/app/mock/api/menu_lotsMenu.json`，禁止直接 import 常數。
- **模板結構**：遞迴 partial `menuList`/`menuItem`，為層級注入 `depth-x` class、`aria-labelledby` 等屬性；渲染結果由 `app.yell` callback 內插入 DOM。
- **行為規則**：hover/click 開合、鍵盤 `Arrow/Enter/Space`、focus trap；使用 `data-menu-id` 與 `data-menu-path` 標示路徑。
- **追蹤欄位**：輸出 `data-analytics-id` 與 `data-menu-path` 供 track plugin 使用；外部連結加 `rel="noopener"`。
- **無障礙**：ARIA role/state（`role="menuitem"`, `aria-expanded`, `aria-current"`）需與狀態同步，支援螢幕閱讀註解。
- **安全**：禁 inline script/eval，模板於 build time 預編譯，並由 `app.yell` 的結果帶入 context。

## 依賴

- `menu_lotsMenu.json`：mock 資料需鎖定 schema，並在 README 記錄版本與維護人。
- Handlebars runtime + `vite-plugin-handlebars`：提供 partial/loop helpers，供建置與 `app.yell` callback 共用。
- geneEH（gee）hook/plugin 系統：`app/scripts/plugins/menu.js`、`app/scripts/hooks/menu.js` 新元件，於 `gee.init` 註冊 `menu.load`。
- `app/scripts/init.js`：需正確呼叫 `gee.init()` 以觸發 menu hook，並提供測試時可替換的 `app.yell` 實作。
- `app/scripts/app.js`：`app.yell` 需支援 mock/真實呼叫並回傳 Promise，供 hook 等待渲染。
- CSP 設定（`vite.config.js` + `docs/spec/rule.md`）；客製 helper 需預登記以避免 runtime eval。
- 測試框架：vitest + jsdom，涵蓋模板、hook 行為與 schema 驗證。

## 風險與對策

- **高**：資料 schema 變動導致模板錯誤 → 建立 `schemas/menu.json`，CI 以 `ajv` 驗證並同步更新 spec。
- **高**：`app.yell` 呼叫失敗或回傳時間過長 → hook 需提供 timeout/fallback，並在測試中 mock resolve/reject 以覆蓋錯誤流程。
- **中**：geneEH hook 在 partial refresh 後重複綁定 → hook 回傳 teardown，進入頁面時先 `destroy` 既有 listeners。
- **中**：CSP/安全審查未通過 → 禁止 helper 內 `new Function`，build 階段跑 `vite build --ssr` + `esbuild --supported:unsafe-eval=false`。
- **中**：無障礙要求未達標 → 制定 keyboard 測試腳本（tab → arrow → enter），並將 WAI-ARIA 覆核列入 check 清單。
- **低**：bundle 體積增加 → 共用 Handlebars runtime、tree-shake helper，並檢查 `vite --mode analyze` 報告。

## 討論重點

- partial 命名與巢狀策略：`menuList`/`menuItem` 是否拆分 depth helper 以支援 lazy render。
- hook/plugin 職責：`menu.load` 內的 `app.yell` 由誰提供 options（語系/站台），以及失敗時如何提示使用者。
- `app.yell` 測試策略：在 vitest 中以 stub 方式注入 mock response 與錯誤情境。
- fallback/adapter：`menu_lotsMenu` 缺少 children 時是否自動插入 placeholder 卡片。
- 測試邊界：vitest 需模擬 gee 嗎？或提供 adapter stub。

## 主要規格

1. **資料來源**：僅可透過 `app.yell('menu_lotsMenu', { mock: true })` 或等價 API，測試時由 mock `app.yell` 返回 `/app/mock/api/menu_lotsMenu.json`，禁止直接 import JSON。
2. **Handlebars partial**：
	- `partials/menuList.hbs` 接收 `items`, `depth`, `parentId`。
	- `partials/menuItem.hbs` 輸出 `<li>` 與 `<a>`，支援 badge、blank、color class。
	- 提供 helper：`isExternal`, `listDepthClass`, `renderBadge`。
3. **geneEH 插件**：
	- `plugins/menu.js`：包裝 `app.yell`，提供 `loadMenu(id, opts)`、`render(el, data)`、`destroy(id)`。
	- `hooks/menu.js`：掃描 `data-gene="init:menu.load"`，在 `gee.init` 被呼叫時執行 `menu.load` hook，並於 hook 內呼叫 `app.yell` 後以 Handlebars 渲染 DOM，註冊鍵盤/滑鼠/分析事件。
4. **無障礙**：
	- `role="navigation"` 包覆；`ul` 使用 `role="menubar"`，`li > a` 使用 `role="menuitem"`。
	- 巢狀使用 `aria-haspopup`, `aria-expanded`，focus 循環以 `tabindex="-1"` 控制。
5. **安全與品質**：
	- 禁用 jQuery、`eval`、`Function`，全部以 ESM 撰寫。
	- 必須有 vitest：`menu.template.spec.js` 驗證 HTML snapshot、`menu.hook.spec.js` 驗證互動。
	- 產生 `plan.md` 時需引用本節編號作為驗收指標。

## 驗收 / 測試建議

- **Schema 驗證**：CI 執行 `pnpm test:schema menu` 確保 mock 與實際資料一致。
- **Snapshot**：`vitest --run menu.template.spec.js` 由 `app.yell` mock 提供資料，再套用 Handlebars 產出 HTML snapshot，異動需 reviewer 簽核。
- **行為測試**：使用 Testing Library 模擬鍵盤操作，確認 `aria-expanded` 與 focus 轉移正確。
- **hook 測試**：`menu.hook.spec.js` 以 stub `app.yell` 驗證 `menu.load` 在 `gee.init` 觸發時會渲染 DOM 並綁定事件。
- **無障礙掃描**：跑 `axe-core`（playwright 或 jsdom）對 menu root 做靜態掃描。
- **bundle 檢查**：`pnpm vite build --report` 確認未引入 jQuery / unsafe chunk。

## 範例

```html
<nav
  class="topbar-nav gee"
  role="navigation"
  aria-label="主導航"
  data-gene="init:menu.load"
	data-menu-id="topbar"
>
  {{> menuList items=rows depth=0 parentId=null }}
</nav>
```

---
> 本區塊依據 [flow.md](../../flow.md) SOP、[guide.md](../guide.md)、[rule.md](../rule.md) 撰寫，確保需求明確、可驗收、可追蹤。