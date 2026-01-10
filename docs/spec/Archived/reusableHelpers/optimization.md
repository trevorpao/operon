# reusableHelpers — Optimization Backlog

## 1. Debug-only interaction chunks
- 目標：讓 `app.debug=false` 的 bundle 完全排除 `menuAccessibility` heavy 邏輯。
- 做法：將 `createMenuHelpers()` 的 debug path 抽成動態 import（`import('./menuAccessibility-debug.js')`），在 hook/plugin 進入 debug 模式時才載入，並以 `vite.config.js` 設定 `manualChunks`。完成後需重新量測 `pnpm build --mode analyze` 並在 check.md 補上 lite/Debug 尺寸差。

## 2. SSR partial hydration telemetry
- 目標：追蹤 DOM partial 掃描/註冊的耗時與命中率，找出可預載或裁減的模板。
- 做法：在 `menuTemplates.registerDomPartials()` 內加入可選 `telemetry` callback，hook/plugin 於 debug 模式將結果送往 `app.track.debug('menu.partial', payload)`。Lite 仍跳過掃描，但保留 `data-menu-partial` 統計以便後續清理。

## 3. Menu data hydration cache busting
- 目標：防止後台更新後，前端 `menuData.loadMenuWithCache()` 仍持續讀取舊快取。
- 做法：引入 `staleWhileRevalidate` 策略：cache 命中但 `fetchedAt` 超過設定（例如 10 分鐘）時，回傳舊資料並背景觸發 `gee.yell` 更新。需為 hook/plugin 加上 dataset 屬性（`data-menu-cache-ttl`），同時測試 ensures queue 不會淹沒 API。

## 4. Accessibility contract tests
- 目標：避免未來擴充 `menuAccessibility` 破壞既有 `ensureSingleRegistration`/鍵盤流程。
- 做法：新增 `tests/lib/ui.menuAccessibility.contract.test.js`，使用 `@testing-library/dom` 驗證：1) 重複 `attachMenuInteractions` 僅產生一次 listener；2) `focusParentItem`/`focusFirstChild` 在無 submenu 也會回傳布林，供 hook 決策；3) secure links 始終補上 `rel="noopener noreferrer"`。同時更新 `docs/spec/rule.md` 以要求 contract 測試。

## 5. Menu diagnostics surface
- 目標：給客服/營運人員一鍵檢查當前頁面是 lite 或 debug 模式以及最新載入時間。
- 做法：在 hook 渲染後於 `el.dataset` 新增 `menuLoadedAtReadable`（ISO 字串），並在 debug 模式下提供 `window.__menuDebug` API，輸出 `mode`, `menuId`, `lastLoadedAt`, `hasDomPartials`。需附上簡易 docs（glossary + rule）提醒僅 debug 可用，避免誤觸個資。 
