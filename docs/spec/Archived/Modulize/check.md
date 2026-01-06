# Modulize 驗收清單

## Stage 1 基礎支架
- [ ] app.js 提供 `use/get/destroy`，防重複註冊，允許 async install。
- [ ] `app/plugins` 改為 Map（或等效結構），key 使用 `namespace.name`，get 只暴露 API。
- [ ] gee.ready 之後載入 hooks，gee.init 流程未破壞。
- [ ] 示範 plugin/hook（如 greet）可正常安裝、卸載。

## Stage 2 lib utilities 整理
- [ ] 保留既有 `app/scripts/lib/detect.js`、`event.js`、`head.js` 行為，未改動邏輯。
- [ ] 其他 utilities 已收斂於 `app/scripts/lib/`，僅調整 export/import 路徑，無行為回歸。
- [ ] `defaultPlugin` 可被新 plugin 延展，引用路徑固定。

## Stage 3 輕量模組拆分
- [ ] track：plugin 封裝 GA/FB 追蹤 API；hook 綁 `.track` click，提供 teardown；無例外拋出。
- [ ] helpers：`formatHelper.js`、`extend.js` 等轉為 `util.*` plugins，DOM 初始化拆成 hooks；行為一致。
- [ ] 舊 `modules/track.js`、`modules/formatHelper.js` 不再被入口引用，行為對齊。

## Stage 4 資料型模組拆分
- [ ] resource：plugin 包裝 gee.yell/資料載入；hook 渲染列表/排行；模板改 Handlebars 預編譯；原生 pagination。
- [ ] menu：plugin 取得菜單資料（prod/stage）；hook 渲染 header/footer、手機下拉；行為對齊。
- [ ] 移除 JsRender 依賴，無第三方 pagination/carousel 重新引入。

## Stage 5 DOM-heavy 拆分
- [ ] arena：plugin 管理字級/裝置/滾動狀態；hook 掛 goTop、字級調整、iOS 滑動偵測、overlay；具 teardown。
- [ ] contact：plugin 封裝 `contact/add_new`；hook 用 `reportValidity`、送出時 disable+spinner、成功導向；具 teardown。
- [ ] slider/gallery/overlay：使用 CSS scroll-snap 或原生 overlay；未 reintroduce Bootstrap/owl/simpleLightbox。

## Stage 6 收斂
- [ ] 移除舊 `app/modules/*.js` 入口與 dead code，必要 shim 保持相容。
- [ ] `app/init.js` 或入口載入順序已更新：plugins 先於 hooks。
- [ ] 文檔更新（`docs/spec/Modulize/history.md` 若有、`docs/spec/rule.md`、`docs/glossary.md` 等）。
- [ ] Smoke：導航、分頁、追蹤、表單、字級調整、模態/slider 正常；bundle 無 jQuery/JsRender/Bootstrap modal/owl/simpleLightbox。

## 通用驗證
- [ ] 每個 hook 具 teardown，重複 init 不殘留 listener/class。
- [ ] plugin 無 DOM 副作用，API 有錯誤處理；hook 只處理 DOM/事件。
- [ ] 符合 `docs/spec/rule.md`：reportValidity、原生 pagination、data-* tracking；無 disallowed 套件。
