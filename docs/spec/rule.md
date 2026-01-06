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
