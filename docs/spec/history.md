# 開發歷程記錄

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
