# app.js 純 JS 重構 — 驗收清單
 
以分階段（Stage 0~6）驗收的簡潔清單，確保每個階段可獨立合併、快速回溯。

## Stage 0：基礎重構
- [ ] app 以 ES module 匯出，`const/let` 取代 `var`。 
- [ ] 不再引用 `$.fn.gene`，gee 由模組匯入；環境設定集中在一處。
- [ ] DOM 快取改為 `document.body/querySelector`；`mobile/tablet` class 以 `classList` 設定。

## Stage 1：模板與載入
- [ ] JsRender API 移除；`tmplStores` 只存 Handlebars 預編譯函式。
- [ ] `loadHtml/loadTmpl` 改為 `fetch + response.text()`，成功後呼叫 `gee.init()`。
- [ ] DOM 操作改用 `innerHTML/insertAdjacentHTML`，資料讀取用 `dataset`。

## Stage 2：互動與 UI 行為
- [ ] 分頁改為原生實作：渲染控制、`click` 更新 `pageCounter` 後呼叫 callback。
- [ ] `toTop` 使用 `window.scrollTo({ top: 0, behavior: 'smooth' })`；無 jQuery easing。
- [ ] Modal/Carousel 依賴替換為原生 `<dialog>` 或輕量庫；arena/resource 不再引用 Bootstrap/owl。

## Stage 3：表單與驗證
- [ ] 表單存取用原生 API（`querySelectorAll`, `value/checked`, `closest`）。
- [ ] 驗證改為 Constraint Validation 或輕量驗證器；移除 Validatr 依賴。
- [ ] `progressingBtn/doneBtn` 用原生屬性或 `classList` 控制。

## Stage 4：事件與工具
- [ ] 全域事件改為 `addEventListener`（含委派）；無 jQuery `.on/.off` 殘留。
- [ ] `waitFor` 以 Promise + `setTimeout/setInterval` 重寫，無 `$.Deferred`。
- [ ] 工具函式（`cleanArray`, `tmpl` 等）為純函式；若保留 `localforage`，已轉 async/await。

## Stage 5：錯誤/通知與追蹤
- [ ] `stdErr/stdSuccess/showErrMsg` 以原生 class/DOM 操作；通知走統一 notifier（或 gee.alert）。
- [ ] `.track` 綁定改為原生事件；GA/FB Pixel 呼叫驗證通過。

## Stage 6：驗收與清理
- [ ] 移除 twbsPagination、Switchery、JsRender、Bootstrap modal/owl 相關資產與引用。
- [ ] 走查 arena/menu/resource/contact/site/track，無 jQuery 語法殘留。
- [ ] `package.json`/文件已更新依賴；跑一次全站 smoke：模板載入、分頁、表單送出、追蹤事件、Modal/Carousel 基本行為。

> 建議：每完成一階段即提交獨立 PR，並以此清單打勾做記錄，便於回溯與驗證。
