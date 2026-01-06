# Glossary — UpdateApp

- geneEH / gee：專案內的行為引擎，負責 hook 綁定與請求助手 `gee.yell`。
- `tmplStores`：儲存 Handlebars 預編譯模板函式的物件，取代 JsRender 模板。
- `loadHtml` / `loadTmpl`：以 `fetch` 取得 HTML/模板並注入 DOM，隨後呼叫 `gee.init()`。
- `scroll-snap` slider：以 CSS `scroll-snap` + `overflow-x: auto` 取代第三方 carousel。
- native overlay modal：以原生 `div`/`dialog` + class 切換顯示的簡易彈窗，取代 Bootstrap modal/simpleLightbox。
- `pageCounter`：分頁當前頁數狀態，配合原生分頁按鈕更新。
- `reportValidity`：原生表單驗證 API；提交前必須通過。
- `track`：帶 `data-cate/data-act/data-label` 的追蹤標記，透過原生 click handler 呼叫 GA/FB。
- Modulize：將舊 modules 拆為 plugins（純邏輯）與 hooks（DOM/gene 綁定），降低全域耦合。
- plugin registry：`app.use(plugin)` 安裝後以 `app.get('namespace.name')` 取得 API；key 採 `namespace.name`（例：`data.resource`）。
- hook teardown：每個 hook 回傳的解除函式，避免重複 init 後殘留事件或 class。
- `defaultPlugin`：提供標準欄位（`name`、`install(ctx)`、可選 `init/destroy`）的基底，供新 plugin 延展。
- `gee.hook` SOP：用 `data-gene="event:behavior"` 綁定；handler 先驗證/取 dataset，再呼叫 plugin API；無需掃描 `data-hook`。
