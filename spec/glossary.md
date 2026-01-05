# Glossary — UpdateApp

- geneEH / gee：專案內的行為引擎，負責 hook 綁定與請求助手 `gee.yell`。
- `tmplStores`：儲存 Handlebars 預編譯模板函式的物件，取代 JsRender 模板。
- `loadHtml` / `loadTmpl`：以 `fetch` 取得 HTML/模板並注入 DOM，隨後呼叫 `gee.init()`。
- `scroll-snap` slider：以 CSS `scroll-snap` + `overflow-x: auto` 取代第三方 carousel。
- native overlay modal：以原生 `div`/`dialog` + class 切換顯示的簡易彈窗，取代 Bootstrap modal/simpleLightbox。
- `pageCounter`：分頁當前頁數狀態，配合原生分頁按鈕更新。
- `reportValidity`：原生表單驗證 API；提交前必須通過。
- `track`：帶 `data-cate/data-act/data-label` 的追蹤標記，透過原生 click handler 呼叫 GA/FB。
