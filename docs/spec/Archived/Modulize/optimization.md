# Modulize 未來優化方向

## Lifecycle / 綁定安全
- gee.hook 取消註冊：建立 hook registry/旗標，避免多次 gee.init 重複綁定；考慮在 app 層提供 once-wrapper。
- Hook 自動 teardown：在 partial render 前集中調用 teardown，防止殘留事件或 overlay。
- init 順序守則：封裝 `afterGeeReady(fn)`，確保 hooks 僅在 gee.init 完成後執行。

## 型別與介面
- Plugin 合約：以 JSDoc/TS 定義 `install(ctx): { api, init?, destroy? }` 介面，避免 API 演進破壞相容。
- Namespace 檢查：在開發模式下驗證 key 格式（`namespace.name`）並警告重複註冊。

## 載入與性能
- Lazy-load hooks：針對路由/版型按需載入 hook 模組，減少初始包大小。
- Template pipeline：統一 Handlebars 預編譯輸出，產生 map 供 hook/plugin 查詢，避免重複 fetch。
- 並發控制：對資料/模板 fetch 套用 AbortController，避免快切頁面殘留請求回寫。

## UI/UX
- Slider/Gallery：導入無障礙（A11y）屬性與鍵盤操作；scroll-snap 支援動態 slide 寬度。
- Modal/Overlay：統一 focus trap 與 ESC 關閉邏輯，提供背景滾動鎖定 helper。

## 測試與品保
- Hook 合約測試：以 DOM 測試驗證綁定/teardown 是否 idempotent。
- 覆蓋率：針對 plugin API 行為（成功/錯誤、重試）與 hook 錯誤恢復流程建基線測試。
- 追蹤驗證：在 staging 透過 mock GA/FB 檢查 data-cate/act/label 送出格式。

## 工具與監控
- Dev overlay：在 dev 環境顯示已註冊 hooks/plugins 清單，協助排查重複綁定。
- Log 標準化：plugin/hook 使用統一 logger tag（`[plugin:name]`/`[hook:name]`）。
