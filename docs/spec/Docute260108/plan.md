## Stage 0 – Scaffolding & Inventory
- 建立 `docs/lib/` 目錄結構：`README.md` 作為索引並先產生空檔 `shared.md`, `detect.md`, `event.md`, `postmessage.md`, `dom.md`, `forms.md`, `number.md`, `format.md`, `head.md`，確保後續 PR 可逐份補內容。
- 以 `tree app/scripts/lib`/`grep '^export'` 盤點所有匯出函式與預設 export，寫入 `plan` 附錄供作者核對，避免遺漏（必要時用簡表列出 `module -> exports`）。
- PR 切分：
	- PR1：空白 docs scaffolding + sidebar 導覽骨架。
	- PR2+：依 stage 補內文，確保每次 PR 僅修改 2~3 個模組文檔以利審核。

## Stage 1 – Core Runtime Docs（shared/event/detect）
- `docs/lib/shared.md`：記錄 `withBrowser`/`withDocument`/`ensureBrowser`/`toElements` 等函式，包含簽名、用途、SSR 注意事項與 teardown 需求。
- `docs/lib/event.md`：說明 emitter API、`createEmitter` 選項與使用範例（hook、`registerBack`），加上 wildcard/teardown 注意事項。
- `docs/lib/detect.md`：描述 capability 結構、`getCapabilities`/`refreshCapabilities`/`isMobileDevice`，並標註不可復刻 UA sniff。
- Smoke：跑 `npm run test:run` 確保示例未破壞既有測試；Markdown 以 VS Code preview 自查連結。
- Fallback：若示例需要瀏覽器物件，用 `withBrowser` 包裝並在文本註明 fallback 方案。

## Stage 2 – Messaging & Headline Utilities
- `docs/lib/postmessage.md`：覆蓋 `postMessage`, `receiveMessage`, `createMessageValidator`, `requestResponse`；提供 iframe 跨來源案例與 timeout/fallback 說明。
- `docs/lib/head.md`：描述 `requireModernBrowser`, `injectAnalytics`, `bootstrap`，包含 `onIncompatible` UI 示範。
- `docs/lib/format.md`：整理 `createFormat`, `registerTemplateHelpers`, `formatNum` 等，強調 DI 設計與 Handlebars 使用界線。
- Smoke：新增 docs 後以 `npm run lint`（確保無 import path 變動）+ Markdown lint/preview；抽查一篇由第二位成員 review。
- Fallback：若仍需 legacy adapter，於每篇醒目註記「若專案殘存 jQuery 依賴，請先移除後再照本文件使用」。

## Stage 3 – DOM/Form/Number Helpers
- `docs/lib/dom.md`：涵蓋 `dom/placeholder`, `dom/classList` 等，提供 teardown 範例與 SSR 限制。
- `docs/lib/forms.md`：記錄 `forms/serialize`, validation utilities；加入表單 submit 範本。
- `docs/lib/number.md`：說明 `number/format` 等純函式，包含 locale/rounding 注意事項。
- Smoke：針對示例跑 `npm run test:run --filter=dom`（或直接全測）確保未引入新依賴；每篇 docs 至少一段程式碼由 ESLint `--stdin` 驗證（或在 VS Code 中啟動 JS 語法檢查）。
- Fallback：DOM 相關章節需提供 SSR fallback 寫法，例如 `withDocument` 包裹。

## Stage 4 – Index, Navigation & Final QA
- `docs/lib/README.md`：整理索引表、對應模組與匯出函式列表，以及「使用方式模板」。
- 更新 `_sidebar.md`（在 Spec 區塊新增 `Lib Guide`）並於 `docs/spec/guide.md` 加上「Lib 參考」段落指向新 docs。
- 完成後於 `check.md` 勾選所有條目，紀錄 smoke 結果與 reviewer 名稱；若後續需要存檔，依 `flow.md` SOP 進行 Optimization。
- Fallback：若部分模組尚未撰寫（例如沒有實際使用），`README` 中需標示「TODO」並列入 backlog，避免讀者以為缺頁是 bug。
