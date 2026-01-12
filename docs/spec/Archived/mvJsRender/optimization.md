# mvJsRender — Optimization Backlog

## 1. Streaming render + skeleton states
- 目標：縮短 `app.yell → DOM` 的首屏等待，在資料尚未回來時也能呈現層級骨架。
- 作法：在 hook 內切換為「skeleton partial」先渲染空節點與 loading indicator，待 `menu.load` resolve 後再 patch 成正式模板；需測試 `teardown()` 會確實移除 skeleton listener，避免與真正的 menu 互相干擾。

## 2. menu_lotsMenu schema diff check
- 目標：當後端調整欄位（例：新增 `cta` 或 `icon`）時，自動在 CI 上報，減少模板錯誤。
- 作法：在 `pnpm test:schema menu` 前增加 `git diff -- schemas/menu.json` 比對結果，若 schema 版本號未更新則失敗；同時在 README 記錄 schema owner，並要求 feature PR 連帶更新版本。

## 3. Partial hydration telemetry
- 目標：瞭解多層 menu 實際互動深度，回饋模板/資料裁剪。
- 作法：在 `hooks/menu.js` 監聽 `focusin/click`，於 debug 模式呼叫 `app.track.debug('menu.interaction', { depth, path, hasBadge })`；以 Flags 控制，並於 docs/spec/rule.md 限定僅 debug/QA 站啟用。

## 4. AbortController pooling
- 目標：減少 menu 反覆開關時建立多個 AbortController 的成本，並確保 teardown 後不殘留掛起請求。
- 作法：將 `loadMenu` 的 Controller 緩存在 WeakMap 內，當相同 `menuId` 再次發送請求時先 abort 舊實例；補上對應的單元測試與 teardown 規則。

## 5. Axe/keyboard shared harness
- 目標：讓其他 gee hook 可以沿用 menu 的 a11y 測試腳本，降低重複維護成本。
- 作法：把 `Testing Library + axe` setup 萃取到 `tests/lib/shared/a11yHarness.ts`，menu spec 僅注入特定 DOM，即可讓未來的 carousel/modal spec 共用相同檢查，並在 README 標註使用方式。

