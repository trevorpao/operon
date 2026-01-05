# Modulize 計畫（plugin + hook 拆分）

## 目標對齊
- app.js 提供 plugin registry（use/get/destroy）與 lifecycle（init/destroy），保持 gee.hook 行為。
- modules 拆為兩層：`app/plugins/`（純邏輯/資料層）與 `app/hooks/`（DOM + gene 行為）。
- 先處理邏輯較純或輕 DOM 模組，再拆 DOM-heavy 模組，過程中保留 gee 標記與既有行為。
- 保留 `app/scripts/lib/` 作為共用函式庫目錄，集中低階 utilities。
- 在 `app/scripts/lib/defaultPlugin.js` 建立 plugin 基底物件，新 plugin 以此延展實作。

## 里程碑
Stage 1) 基礎支架：App registry、目錄與約定落地，可載入單一 plugin/hook 並運作。
Stage 2) lib utilities 整理：保留 `app/scripts/lib/`，調整共用函式分層，建立 base plugin。
Stage 3) 輕量模組拆分：`track`、`format/helper` 類工具轉為 plugins + hooks。
Stage 4) 資料型模組拆分：`resource`、`menu` 等資料取得與渲染路徑拆開，模板改走 Handlebars 預編譯。
Stage 5) DOM-heavy 拆分：`arena`、`contact`、`slider` 等提供 teardown、避免重複綁定，替換舊插件依賴。
Stage 6) 收斂與清理：移除舊 modules 入口、補測與文件，確保 gee.init 流程穩定。

## 工作分解
### Stage 1 基礎支架
- app.js
  - 新增 `use(plugin)` / `get(name)` / `destroy(name)`；避免重複註冊，允許 async install。
  - `app.plugins` 採 Map，key 命名 `namespace.name`，暴露唯讀 getter 或經 get() 取得。
  - 在 gee.ready 後載入 hooks；保留 gee.init 呼叫順序。
- 共用基底
  - 建立 `app/scripts/lib/defaultPlugin.js`：輸出可被延展的 base plugin（含標準欄位：`name`、`install(ctx)`；可選 `init/destroy`），提供錯誤防呆與 namespace 建議。
  - 保留 `app/scripts/lib/` 目錄收斂共用函式，避免散落 plugins。
- 目錄
  - 建立 `app/plugins/` 與 `app/hooks/`；新增 index 以列出已提供的 plugins/hooks（純導出清單即可）。
- 檢查點：可安裝並使用一個示範 plugin/hook（例如 greet 範例），不破壞現行 app.js 初始化。

### Stage 2 lib utilities 整理
- 保留並沿用現有 `app/scripts/lib/detect.js`、`app/scripts/lib/event.js`、`app/scripts/lib/head.js` 寫法（本階段不改動行為，後續由其他 spec 處理）。
- 將其他共用 utilities 收斂於 `app/scripts/lib/`，必要時僅調整 export/匯入路徑與索引，不變更函式行為。
- 確認 `defaultPlugin` 與後續 plugins 的引用路徑固定，作為新 plugin 的延展基礎。
- 檢查點：lib 目錄結構與既有功能保持可用，無回歸；detect/event/head 待後續 spec 另行優化。

### Stage 3 輕量模組拆分
- track
  - plugin：封裝 GA/FB 追蹤 API，處理 data-cate/act/label fallback，不觸發例外。
  - hook：為 `.track` 綁定 click 事件，讀 dataset 調用 plugin，提供 teardown。
- helpers
  - plugin：整理 `formatHelper.js`、`extend.js` 等純函式為 `util.format`/`util.extend` plugins（保持純函式）。
  - hook：若有對 DOM 的初始化（如自動字級、基礎事件），分拆成 hooks 並提供 teardown。
- 檢查點：舊 `modules/track.js`、`modules/formatHelper.js` 不再被入口引用；新 hooks 維持原行為。

### Stage 4 資料型模組拆分
- resource
  - plugin：包裝資料 fetch（gee.yell），輸出 `load`, `loadTop10` 等 API；處理 cache/錯誤。
  - hook：負責列表/排行榜渲染；用 Handlebars 預編譯模板，綁定 pagination 控件（原生）。
- menu
  - plugin：取得菜單資料（prod/stage 路徑邏輯），輸出菜單樹。
  - hook：渲染 header/footer 菜單，手機下拉切換，保留 hover-active 行為。
- 檢查點：模板從 JsRender 移除；pagination/carousel 不引入第三方；對照舊行為無回歸。

### Stage 5 DOM-heavy 拆分
- arena
  - plugin：字級設定持久化、裝置判斷、滾動狀態（goTop 顯示）等純狀態邏輯。
  - hook：掛載 goTop、字級調整、iOS 滑動偵測、modal/overlay 切換，提供 teardown 防重綁。
- contact
  - plugin：封裝 `contact/add_new` 請求，回傳標準 success/error 結構。
  - hook：表單驗證走 `reportValidity`，送出時 disable + spinner，成功後導向/提示。
- slider / gallery / overlay
  - plugin：若需共享狀態（例如當前索引），集中管理。
  - hook：用 CSS scroll-snap 或原生 overlay 實作；禁止 reintroduce Bootstrap/owl/simpleLightbox。
- 檢查點：每個 hook 有 teardown；重複 init 不殘留事件；依據 `docs/spec/rule.md` 的純 JS 原則。

### Stage 6 收斂
- 移除舊 `app/modules/*.js` 入口與 dead code，保留向後相容的 shim（若有）。
- 更新 `app/init.js` 或入口載入順序，確保 plugins 先於 hooks。
- 補文件：
  - `docs/spec/Modulize/history.md`（若需要）記錄遷移結果與差異。
  - `docs/spec/rule.md`/`docs/glossary.md` 若有新規則或術語。
- 驗收：
  - 跑 smoke（導航、分頁、追蹤、表單送出、字級調整、模態/slider）皆正常。
  - 確認 bundle 無舊依賴（jQuery/JsRender/Bootstrap modal/owl/simpleLightbox）。

## 風險與防呆
- hooks 重複綁定：每個 hook 必須回傳 teardown 並於重渲染時呼叫。
- async 競態：install/use 支援 async；對模板/資料載入需加序列化或 AbortController。
- 命名衝突：統一 namespace（如 `util.*`, `data.*`, `ui.*`, `track.*`），在 index 列出保留字。

## 驗收清單（每模組）
- plugin 無 DOM 副作用，API 有錯誤處理；hook 僅處理 DOM/事件。
- hook 有 teardown；重覆 init 不殘留 listener/class。
- 模板改用 Handlebars 預編譯；無 JsRender/舊插件呼叫。
- 追蹤/表單/分頁符合 `docs/spec/rule.md`（reportValidity、原生 pagination、data-* tracking）。
