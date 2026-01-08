# OperonJS Boilerplate — Spec

本規劃說明以 geneEH 行為驅動的 boilerplate 為核心，落地於 Vite + Bulma + Handlebars (預編譯、CSP-safe) 架構，並以純瀏覽器原生 API 取代 jQuery/JsRender。

## 目標
- 提供可即刻啟動的前端骨架，使用 data-gene 標記驅動行為 (gee hooks)。
- 採用 Handlebars/JsRender 模板預編譯，模板位置 `app/tmpls`，避免瀏覽器 `eval`。
- 保持舊版功能模組 (arena/menu/resource/contact/track/site) 可用，並可逐步遷移到 geneEH runtime。
- 支援本機 mock 資料 (`mock/index.json`, `mock/about.json`) 以便快速開發。

## 技術棧
- geneEH：行為驅動，`gee.hook` 綁定 DOM 行為；`gee.yell` 做 API 呼叫。
- Vite：開發/打包；Bulma + Sass 綠色主題；Handlebars 預編譯模板。
- Pure JS：使用原生 DOM API / fetch / classList / dataset 取代 jQuery/JsRender。
- localforage：儲存使用者字級設定。

## 全域應用行為 (app.js)
- `app.init(modules)`：設定環境、螢幕尺寸 class、gee 端點 (prod vs dev fallback)、啟動 gee 並依序載入模組。
- 模板與 HTML 載入：`tmplPath='tmpls'`，以 Handlebars 預編譯為主；逐步移除 JsRender 相依。
- 分頁：`setPaginate/destroyPaginate` 須改為原生事件與輕量分頁元件（移除 twbsPagination 相依）。
- UI：`announce` 安全警示；`resetCurrent`、`renderBox` 等輔助；`redirect` 用 hash/pushState。

## 模組需求
- arena (`modules/arena.js`)
	- 行為：滾動顯示 `.goTop`、字級調整 (localforage 記錄)、iOS 滑動偵測；改用 `addEventListener`、`classList` 實作。
	- Modal：`showModal/hideModal` 需換成原生 `<dialog>` 或輕量 JS 模組，移除 Bootstrap 依賴。
	- Hooks：`loadMain`/`loadBox`/`loadModal`/`replaceMe` 以 fetch + `innerHTML` 取代 jQuery；`largerFont`/`smallerFont`、`initAutolink`、`initPagination` 改為原生實作。
- contact (`modules/contact.js`)
	- API：`gee.yell('contact/add_new', data)`；表單驗證改為原生 Constraint Validation 或輕量驗證器，移除 Validatr/jQuery。
- menu (`modules/menu.js`)
	- API：`/api/menu/lotsMenu` (prod: `https://stage.how-living.com/api/menu`)，渲染 `#menuTmpl`、`#footerMenuTmpl`；模板渲染改為 Handlebars runtime。
	- 手機版下拉：以原生事件委派切換 `hover-active`。
- resource (`modules/resource.js`)
	- API：`gee.yell('load', {pid, limit, meta})`；`loadTop10` 供排行榜。
	- 模板渲染：改以 Handlebars 預編譯結果取代 JsRender；Carousel 改為原生/輕量庫。
	- 追蹤：prod 模式呼叫 `app.track.bind`。
- track (`modules/track.js`)
	- 元素 `.track` 改用原生事件監聽，發送 GA / FB Pixel (`data-cate/act/label/which`)。
- site (`theme/default.js`)
	- 文章圖片 caption 與影片 16:9 調整改為原生 DOM 操作。
	- Hooks：`site/toggleNav`, `site/closeNav`, `site/masonryInit` 改用原生事件/版型插件。

## 模板與資料
- 模板目錄：`app/tmpls` (由 Vite/Handlebars 預編譯)；移除 JsRender。
- 靜態片段：舊版 HTML 仍可由 `app.loadHtml` 載入；新模板需改為 Handlebars partials。
- Mock：`mock/` 下 JSON 供開發期 fetch/serve。

## API 端點與環境
- `app.isProd()` 決定 API URL：prod 使用 `window.apiUrl/mainUrl`，非 prod fallback `https://f3cms.lo:4433/`。
- menu 模組在 prod 轉向 stage API；其他 `gee.yell` 路徑預設相對於 `gee.apiUri`。

## UI/UX 要求
- 行為以 `data-gene` 宣告；gee.init 後執行對應 hook。
- 支援手機偵測：`detectWidth=600`，自動添加 `mobile/tablet` class。
- 字級調整持久化；scroll 顯示返回頂部；Modal/Carousel/Pagination 等需正常運作。
- 安全：避免在 console 輸入外部程式碼 (Self-XSS 警示)；模板預編譯避免 `unsafe-eval`。

## 待辦/遷移建議
- 移除 jQuery/JsRender：所有 DOM 操作改用原生 API；模板全面改 Handlebars 預編譯。
- UI 元件替換：Modal/Carousel/Pagination 等替換為無 jQuery 相依的輕量方案。
- 驗證/事件：改用原生 Constraint Validation、`addEventListener`、`classList`；以 `gee.hook` 串接。
- 將 API 路徑集中於設定，便於環境切換與 mock。

