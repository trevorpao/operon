# 開發歷程記錄

## reusableHelpers（Menu helper + mode refactor）

完成日期 2026/01/10

說明：將 `menu` plugin/hook 的資料、模板、無障礙互動抽離至 `app/scripts/lib/ui.js`，並建立 lite/debug 模式切換、單責任 helper 與測試矩陣，確保純靜態頁面不載入多餘行為，debug 模式則具備完整診斷。適合初階工程師依 stage 檢查表逐一完成。

開發細節入口：
- [`reusableHelpers plan`](spec/Archived/reusableHelpers/plan.md)
- [`reusableHelpers check`](spec/Archived/reusableHelpers/check.md)
- [`reusableHelpers optimization`](spec/Archived/reusableHelpers/optimization.md)

重點規格（新 → 舊順序）：
- Lite/Debug 模式：`app.debug`（或 `data-menu-mode`）決定模式；hook 必須寫入 `data-menu-mode-active`，並只在 debug 模式啟用 `menuAccessibility`、console 診斷與 DOM partial 掃描。
- Helper 架構：`ui.menuData/menuTemplates/menuAccessibility` 皆為 pure helper；plugin/hook 不得再維護 fallback 實作，所有資料/模板/互動流程均透過 helper 工廠 (`createMenuHelpers`) 統一管理。
- 單一註冊：互動須經 `menuAccessibility.ensureSingleRegistration()` 保證只綁一次；teardown 時務必呼叫 token.dispose 以支援 SPA/nested 渲染。
- Vitest 覆蓋：模板 spec 驗證 DOM partial 與 SSR context 僅在 debug 模式運作；hook spec 則同時在 lite/debug 模式跑鍵盤/ARIA 測試並截取 `console.info` 確保 lite 不輸出診斷。
- Checklist + Matrix：`docs/spec/Archived/reusableHelpers/check.md` 需維護 lite/debug 功能矩陣，並在 Stage 3 後附上 `pnpm vitest run tests/lib/menu.template.spec.js tests/lib/menu.hook.spec.js` 的結果。

## Docute260108（Lib Guide 文件化）

完成日期 2026/01/08

說明：把 RefactorLib 的 helper 全面文件化，建立 `docs/lib/*`、索引/匯出矩陣、sidebar 導覽，以及 Stage 0–4 的檢查流程，方便初階工程師查詢 SSR 守則、teardown 範例與跨模組規範。

開發細節入口：
- [`Docute260108 idea`](spec/Archived/Docute260108/idea.md)
- [`Docute260108 plan`](spec/Archived/Docute260108/plan.md)
- [`Docute260108 check`](spec/Archived/Docute260108/check.md)
- [`Docute260108 optimization`](spec/Archived/Docute260108/optimization.md)

重點規格（新 → 舊順序）：
- Lib Guide 架構：每個 `app/scripts/lib/*` 模組對應一份 Markdown，章節固定包含 `Export Surface`、`Usage`、`Testing/Fallback`，範例需展示 `withBrowser/withDocument` 或 teardown 寫法。
- 索引/導航：新增或修改 helper 時，必須同步更新 `docs/lib/README.md` 的快速索引與匯出矩陣、`docs/_sidebar.md` 的 Lib Guide 清單、以及 `docs/spec/guide.md` 的「Lib 參考」段落。
- Smoke 流程：Stage 1–3 以 `npm run test:run` 驗證（若需要可再跑 lint）；Stage 2 需留意 ESLint v9 要求 `eslint.config.js`，若尚未建置就要在 `check.md` 錄下阻擋原因與後續行動。
- Legacy 警語：postMessage、DOM helper、format plugin 等章節需醒目標記「legacy adapter 已拆除／請先移除 jQuery 依賴」，避免工程師再引用舊 shim。
- 檔案治理：專案完成後將整個 spec 目錄移入 `docs/spec/Archived/Docute260108/`，確保後續查詢仍有完整 idea/plan/check/optimization 紀錄。

## RefactorLib 規格（核心 lib 重構）

完成日期 2026/01/08

說明：重新梳理 `app/scripts/lib/*`，將偵測、事件、postmessage、head plugin 與通用 helpers 拆成純 ESM、SSR 安全且帶測試的模組，並在 Stage 5 拆除所有 legacy adapter，方便初階工程師按表操課。

開發細節入口：
- [`RefactorLib idea`](spec/Archived/RefactorLib/idea.md)
- [`RefactorLib plan`](spec/Archived/RefactorLib/plan.md)
- [`RefactorLib stage0`](spec/Archived/RefactorLib/stage0.md)
- [`RefactorLib check`](spec/Archived/RefactorLib/check.md)
- [`RefactorLib optimization`](spec/Archived/RefactorLib/optimization.md)

重點規格（新 → 舊順序）：
- Runtime/SSR：所有 lib 匯入時禁止直接接觸 `window`/`document`；必要時以 `withBrowser()`、`withDocument()` 包裝並透過 `lib/runtime/deps` 解析可選 peer（Handlebars、moment、gee）。
- detect/head：裝置判斷依 `getCapabilities()` 快取；`headPlugin` 只在配置 `measurementId` 時注入 GA，並以 `requireModernBrowser()`/`onIncompatible` 處理舊版瀏覽器提示。
- event bus：`lib/event` 改成 Map-based emitter，hooks 與 `app.site.registerBack` 都用 `on/off/emit/clear` + teardown，`gee.event` 相關寫法禁止再出現。
- 工具拆分：舊 `extend.js` 切成 `dom/placeholder`、`dom/classList`、`forms/serialize`、`number/format` 等純函式；每個 helper 回傳解除函式以防止多次 init。
- postmessage：新增 `createMessageValidator()` 及 `requestResponse()`，要求每個跨框訊息先驗證 schema 再送出，並提供 timeout/fallback 方案。
- Stage 5 收斂：去除 `jQuery.browser.mobile` shim 與 `legacyHead/legacyEventBus`，更新 `rule.md`、`guide.md`、`history.md`，並記錄 regression（`npm run test:run`、privacy banner、draft import、slider）。

## Modulize 規格（plugin + hook 拆分）

完成日期 2026/01/06

說明：將舊 modules 拆為 plugins（純邏輯）與 hooks（DOM/gene 綁定），降低耦合並符合 gee.hook SOP；提供 teardown、防重複綁定與純 JS 原則，適合初階工程師依序實作。

開發細節入口：
- [`Modulize idea`](spec/Archived/Modulize/idea.md)
- [`Modulize plan`](spec/Archived/Modulize/plan.md)
- [`Modulize check`](spec/Archived/Modulize/check.md)
- [`Modulize optimization`](spec/Archived/Modulize/optimization.md)

重點規格（新 → 舊順序）：
- Registry：`app.use(plugin)`/`app.get(name)`，key 採 `namespace.name`，禁止重複安裝。
- 職責分離：plugin 無 DOM；hook 只處理 DOM/事件與 `gee.hook` 綁定，必須回傳 teardown。
- 綁定時機：hooks 在 `gee.init` 之後註冊，重複 init 不得殘留 listener/class。
- UI/模板：使用 Handlebars 預編譯或原生 DOM；禁止回引 JsRender/Bootstrap modal/owl/simpleLightbox/twbsPagination。
- 表單/追蹤：`reportValidity` 驗證、按鈕 disable+spinner、GA/FB data-* fallback（`normal/jump/title`）。
- 風險與驗收：每模組需通過 `Modulize check` 勾選；async fetch 需序列化/可取消，命名空間避免衝突。

## UpdateApp 規格

完成日期 2025/01/05

本文件整理 `docs/spec/Archived/UpdateApp/idea.md` 的落地規範，提供日常開發對照表。

開發細節入口：
- [`UpdateApp idea`](spec/Archived/UpdateApp/idea.md)
- [`UpdateApp plan`](spec/Archived/UpdateApp/plan.md)
- [`UpdateApp check`](spec/Archived/UpdateApp/check.md)
- [`UpdateApp optimization`](spec/Archived/UpdateApp/optimization.md)

### 基本原則
- 全站純 JS：不再引入 jQuery/JsRender/Bootstrap modal/owl/simpleLightbox/Switchery/twbsPagination/Validatr。
- 模板：使用 Handlebars runtime（預編譯函式掛在 `window.templates`）；註冊 helpers 走 `Handlebars.registerHelper`。
- DOM：使用 `querySelector/querySelectorAll` + `classList` + `dataset` + `addEventListener`。
- 事件：統一使用 `addEventListener` 或 `gee.hook`；禁用 `.on/.off/.one`。
- 請求：沿用 `gee.yell`，API base 由 `app.config`/`gee` 啟動時設定。

### 模板與載入
- `loadHtml/loadTmpl`：`fetch + response.text()` → `innerHTML` → `gee.init()`。
- `tmplStores`：存放 Handlebars 函式，不存 JsRender 物件。
- 插入 DOM：`innerHTML/insertAdjacentHTML`，避免 `.html()/append()/prepend()`。

### 互動與 UI
- 分頁：原生按鈕/連結，更新 `pageCounter` 後呼 callback，無 twbsPagination。
- 滾動：`window.scrollTo({ top: 0, behavior: 'smooth' })`，無 jQuery easing。
- Modal/Slider/Carousel：使用原生 class 切換/overlay 或 CSS scroll-snap，禁止 Bootstrap modal/Owl/simpleLightbox。

### 表單與驗證
- 取值：`form.querySelectorAll('[name]')` + `value/checked`；`closest` 用原生。
- 驗證：使用 `form.reportValidity()`/`checkValidity()`；不載入 Validatr。
- 序列化：`new URLSearchParams(new FormData(form)).toString()`。
- 按鈕狀態：`disabled` 屬性 + DOM 節點新增/移除 spinner。

### 事件與工具
- 事件：禁止 jQuery 事件 API；必要時使用事件委派或 `gee.hook`。
- 工具：`waitFor` 為 Promise；`cleanArray` 為 `Array.filter(Boolean)`；其他工具保持純函式。

### 錯誤/通知與追蹤
- `stdErr/stdSuccess/showErrMsg` 使用原生 DOM/class 切換；通知可用 `gee.alert`。
- `.track` 綁定使用原生事件，GA/FB 呼叫保留。

### 資產/依賴清單（需保持移除狀態）
- 刪除：jQuery 版 JsRender、twbsPagination、Switchery、Bootstrap modal/owl、simpleLightbox、Validatr。
- 新增：確保 Handlebars runtime 可用；不需額外 CSS/JS 插件除非另行評估。

### 開發流程提示
1. 新功能先看 `docs/spec/Archived/UpdateApp/idea.md` 與本文件對應段落。
2. 實作後自檢：無 jQuery 插件呼叫，模板/事件/表單符合上述規範。
3. 若需新增第三方元件，先在 spec 提案並評估是否有原生替代。
