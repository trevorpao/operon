分階段的 app.js 純 JS 優化計畫（可逐步實作，避免一次性大改）：

## Stage 0：基礎重構
1) 模組化骨架：改用 ES module 匯出 `app`，以 `const/let` 取代 `var`/function constructor。
2) 依賴顯式化：移除 `$.fn.gene`，改為直接匯入 `gee`；集中設定 `apiUri/mainUri/picUri`。
3) DOM 快取：以 `document.querySelector`/`document.body` 取代 `$(...)`；保留 `detectWidth` 判斷並用 `classList` 設定 `mobile/tablet`。

## Stage 1：模板與載入管線
4) 移除 JsRender：`tmplStores` 存放 Handlebars 預編譯函式；刪除 `$.templates`、`$.views.helpers` 依賴。
5) `loadHtml`/`loadTmpl`：改用 `fetch` + `response.text()`，填入 `innerHTML`，之後呼叫 `gee.init()`。
6) DOM 操作：用 `innerHTML`/`insertAdjacentHTML` 取代 `html/append/prepend`，`dataset` 取代 `.data()`。

## Stage 2：互動與 UI 行為
7) 分頁：移除 `twbsPagination`，改為原生渲染按鈕/連結，`click` 設定 `pageCounter` 後呼叫 callback。
8) 滾動與動畫：`toTop` 改為 `window.scrollTo({ top: 0, behavior: 'smooth' })`，移除 jQuery easing。
9) Modal/Carousel 依賴：針對使用處改用 `<dialog>` 或輕量庫；確認 arena/resource 對 Bootstrap/owl 的依賴逐步替換。

## Stage 3：表單與驗證
10) 表單取值：改用 `form.querySelectorAll('[name]')`、`element.value/checked`；`closest` 用原生。
11) 驗證：移除 Validatr，改用原生 Constraint Validation（`reportValidity`/`checkValidity`）或輕量驗證器。
12) 按鈕狀態：`progressingBtn/doneBtn` 改為原生屬性與 `classList` 操作。

## Stage 4：事件與工具
13) 事件：全部改 `addEventListener`；需動態內容時用事件委派或 `gee.hook`。
14) `waitFor`：改寫為 Promise + `setTimeout`/`setInterval`；移除 `$.Deferred`。
15) 常用工具：`cleanArray`、`tmpl` 改為純函式；保留 `localforage` 或視需求換成 `localStorage`。

## Stage 5：錯誤/通知與追蹤
16) `stdErr/stdSuccess/showErrMsg`：改用原生 class 切換；如需通知，統一走一個輕量 notifier（或維持 `gee.alert` 若內建）。
17) `track` 整合：確保 `.track` 綁定改為原生事件，GA/FB Pixel 呼叫保留。

## Stage 6：驗收與清理
18) 移除不再使用的插件與資產：twbsPagination、Switchery、Bootstrap modal 相關引用、JsRender。
19) 走查 `app.*` 模組（arena/menu/resource/contact/site/track）確定無 jQuery 語法；逐一替換並簡測。
20) 在 `package.json` 移除對應依賴（若仍存在），更新文件與 README。

建議實作順序：Stage 0 → 1 → 2 → 3 → 4 → 5 → 6，每完成一階段就跑最小化手動驗證（模板渲染、分頁、表單送出、追蹤事件、modal/carousel 基本行為）。
