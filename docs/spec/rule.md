# 商業邏輯規則

## UpdateApp

- 內容載入
  - 模板載入後必須呼叫 `gee.init()` 讓 gene 標記生效。
  - 分頁切換僅更新當前列表資料與 `pageCounter`，不可重新載入整頁。
- 表單流程
  - 表單送出前必須通過原生驗證（`reportValidity`），不允許略過必填。
  - 送出時按鈕需進入不可點狀態並顯示 spinner；完成或失敗後恢復。
  - 會員登入/註冊：成功後依後端回傳 `uri/goback` 進行導向，錯誤訊息必須透過 `stdErr/stdSuccess` 呈現。
- 追蹤事件
  - 所有 `.track` 元件需帶 `data-cate`/`data-act`，缺省時使用 `normal/jump`；`data-label` 不可為空時使用 `title` 或 `document.title`。
- 資源/多媒體
  - Slider/Carousel 使用原生 overlay 或 scroll-snap；不得重新引入第三方 carousel/modal 套件。
- 配置一致性
  - API/主站路徑僅於啟動時設定；模組不得覆寫 `gee.apiUri/mainUri/picUri`。
- 錯誤與通知
  - 統一使用 `gee.alert` 或後續決議的 notifier；禁止在模組內直接 `alert()`。
- 前後端相容
  - 後端回傳的模板/HTML 需兼容 Handlebars 預編譯輸出；不得再使用 JsRender 標記。
- 偵測與事件
  - 不再提供 `jQuery.browser.mobile`，需要判斷裝置時請從 `app/scripts/lib/detect` 取得 `getCapabilities/isMobileDevice`。
  - 跨模組事件全部改用 `app/scripts/lib/event` 暴露的 `on/emit/clear`；禁止 mutating `gee.event.*`。

## Modulize（plugin + hook）

- Registry 與命名
  - plugin 以 `app.use(plugin)` 註冊，key 採 `namespace.name`（如 `data.resource`、`ui.slider`），防重複安裝。
  - hooks 透過 `app.get(name)` 取得 plugin API，缺席時須安全 return/no-op teardown。
- 職責分離
  - plugin：純資料/邏輯層，不操作 DOM，可有 `init/destroy` 但不得反向依賴 hooks。
  - hook：只負責 DOM/事件與 `gee.hook` 綁定，提供 teardown，避免重複綁定與殘留 listener/class。
- 綁定與生命周期
  - 必須在 `gee.ready`/`gee.init` 之後註冊 hooks；每個 hook 回傳 teardown 以支援重渲染。
  - 重複 init 時不得堆疊綁定；需要旗標或 teardown 清理。
- 模板與 UI
  - 渲染使用 Handlebars 預編譯模板或原生 DOM 操作；不可重新引入 JsRender、Bootstrap modal/owl/simpleLightbox/twbsPagination。
  - slider/gallery 使用 CSS scroll-snap 或原生 overlay；modal 使用原生 class 切換/overlay。
- 表單與資料流
  - 表單先跑 `reportValidity`，payload 以 `FormData`/`Object.fromEntries` 建構；送出按鈕需 disable + spinner，成功/失敗都恢復。
  - 追蹤元件以 `data-cate/data-act/data-label` 提供 GA/FB 參數，缺省 fallback `normal/jump/title`。
- 錯誤與通知
  - 成功/錯誤統一透過 `app.stdSuccess/stdErr` 或 plugin 自訂 notifier；禁止 `alert()`。
  - 事件匯流排請 import `on/emit/clear` 自 `../lib/event`；不再允許透過 `gee.event.subscribe/fire` 溝通。

## ReusableHelpers（Menu Lite/Debug）

- 模式判定
  - 以 `app.debug` 決定 lite/Debug；若未設定改回 lite 並於 console.warn 提示。允許元素透過 `data-menu-mode` 覆寫，用於測試或單頁強制 debug。
  - hook 渲染後必須寫入 `el.dataset.menuModeActive`，供 QA/追蹤與 docs 取用。
- Plugin 規則
  - `app/scripts/plugins/menu.js` 僅能呼叫 `ui.menuData`/`ui.menuTemplates`，不得再維護 fallback helper。DOM partial 掃描、`tmplStores` 寫入僅允許在 debug 模式執行。
  - `menuData.loadMenuWithCache()` 仍強制驗證 schema；cache 命中時需檢查 `fetchedAt` 以利後續優化（見 optimization backlog）。
- Hook 規則
  - `createMenuHelpers()` 返回的 `attachMenuInteractions` 只能在 debug 模式生效；lite 模式只渲染靜態 DOM 並維持 `tabindex` 初始值。
  - 互動綁定必須透過 `menuAccessibility.ensureSingleRegistration()` 取得 token，teardown 時記得呼叫 `token.dispose()`，防止 SPA 重複初始化。
  - Secure links (`target="_blank"`) 交由 `menuAccessibility.secureExternalLinks()` 管理，不得在 hook 內再手寫。
- 記錄與診斷
  - `logRenderResult()` 僅在 debug 模式下輸出 snapshot，避免 lite 模式污染 console。Lite/Debug 兩種模式都需在 tests（hook/template）覆蓋。
  - 任何接觸 `console.info/warn` 的邏輯都要被對應的 Vitest 覆蓋（`expect(infoSpy).not.toHaveBeenCalled()` 等）。

## RefactorLib（核心 Lib 模組）

- 依賴與 SSR
  - 匯入 `app/scripts/lib/*` 時不得觸發 DOM/`window` 副作用；若需要瀏覽器物件，務必以 `withBrowser()`、`withDocument()` 或 `ensureBrowser()` 包裹邏輯。
  - 可選 peers（Handlebars、moment、gee）一律透過 `lib/runtime/deps` 解析，禁止直接讀寫 `window.<dep>` 以維持 SSR 渲染安全並便於測試 mock。
- 偵測與 Head 流程
  - 裝置判斷統一使用 `detect.getCapabilities()` 取得快取結果；僅在需要強制刷新時呼叫 `refreshCapabilities(overrides)`，嚴禁自行實作 UA sniff 或復刻 `jQuery.browser.*`。
  - GA/瀏覽器門檻必須走 `headPlugin.requireModernBrowser()`，並僅在配置 `measurementId` 時呼叫 `injectAnalytics()`；UI 呈現改透過 `onIncompatible` callback 自行注入提示，不得直接 `alert()`。
- 事件與跨框通訊
  - 跨模組事件全部使用 `lib/event` emitter（`on/off/once/emit/clear`）與 `registerHooks` 產生的 teardown；`app.site.registerBack` 等 legacy API 亦須改用 emitter 以便回收。
  - iframe／postMessage 流程使用 `createMessageValidator()` 驗證 payload，再透過 `requestResponse()` 包成 promise；自行建立 listener 時務必回傳 teardown 以避免洩漏。
- 工具模組拆分
  - DOM helper 依職責從 `dom/placeholder`、`dom/classList`、`forms/serialize`、`number/format` 匯入；禁止再依賴舊 `extend.js` 整包函式。
  - Placeholder/事件類工具皆會回傳解除函式；hook/plugin 需保存並在 teardown 釋放以避免多次 init 堆疊。
  - `format` 僅暴露純函式與 `registerTemplateHelpers(handlebars)`；不允許在 import 期間即註冊 Handlebars helper 或寫入 `app.formatHelper`。

## Docute260108（Lib Guide 文件化）

- 文件結構與內容
  - `docs/lib/*` 需依 module 分檔，採固定段落：`Export Surface`、`Usage/teardown`、`Testing/Fallback`，範例必須示範 `withBrowser/withDocument` 守則或 teardown 流程。
  - 任一新 helper 被加入 `app/scripts/lib/*` 時，必須同步更新對應檔案、`docs/lib/README.md` 的索引與匯出矩陣，以及 `docs/_sidebar.md` 導覽。
  - 所有跨視窗、DOM 或格式化案例需明確標示「Legacy adapter 已拆除／需先移除 jQuery 依賴」字樣，避免後續開發者回帶舊寫法。
- 流程與驗證
  - 每個 Stage 的輸出都要回寫 `docs/spec/Docute260108/check.md`，記錄 smoke tester、測試命令與 reviewer；Markdown 需於 VS Code preview 自查連結。
  - 新增或更新 docs 時，除 `npm run test:run` 基準外，涉及 lint 的章節要確保 `npm run lint` 可執行（或在 check 中註記阻擋因子與後續行動，如建立 `eslint.config.js`）。
  - `_sidebar.md` 與 `docs/spec/guide.md` 必須持續連結到最新的 Lib Guide，並在交付完成後將整個 spec 歸檔至 `docs/spec/Archived/Docute260108/` 以保住追溯紀錄。
