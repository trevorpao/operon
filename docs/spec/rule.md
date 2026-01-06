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
