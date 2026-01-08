## Stage 0 – Scaffolding & Inventory
- [x] `docs/lib/README.md` 及各子檔（shared/detect/event/postmessage/dom/forms/number/format/head）建立完成，並加入 sidebar 連結（2026-01-08）。
- [x] 盤點表列出 `module -> exports` 映射且對照 PR，確認無遺漏函式（見 plan.md 附錄 A）。
- [x] PR1 僅含 scaffolding 與導覽骨架，diff 維持純文檔（本階段僅新增 docs/ 導覽/附錄）。

## Stage 1 – Shared / Event / Detect Docs
- [x] `docs/lib/shared.md` 記錄所有 shared helpers（含簽名、用途、SSR 注意、範例與 teardown 指引）。
- [x] `docs/lib/event.md` 詳述 emitter API（`createEmitter`, `on/off/once/emit/clear`）與 wildcard/teardown 使用案例。
- [x] `docs/lib/detect.md` 說明 capability 結構、`getCapabilities` 與 refresh 流程，並標示禁止 UA sniff。
- [x] `npm run test:run` 執行並通過；2026-01-08 – VS Code Markdown preview/links 自查完成。

## Stage 2 – Messaging / Head / Format Docs
- [x] `docs/lib/postmessage.md` 涵蓋 listener 建立、`createMessageValidator`、`requestResponse` timeout/fallback 實例。
- [x] `docs/lib/head.md` 說明 `requireModernBrowser`, `injectAnalytics`, `bootstrap`, `onIncompatible` UI 範例。
- [x] `docs/lib/format.md` 展示純函式、依賴注入、`registerTemplateHelpers` 使用情境。
- [ ] `npm run lint` 或等效檢查通過；`npm run lint` 於 2026-01-08 因缺少 `eslint.config.js` 中止（ESLint v9 需求），Markdown 預覽已完成但仍需人工作為 Reviewer。

## Stage 3 – DOM / Forms / Number Helpers
- [x] `docs/lib/dom.md` 描述 placeholder/classList 等 API，並教學如何保存/釋放 teardown。
- [x] `docs/lib/forms.md` 提供 serialize、validation 工具示例與 submit 範本。
- [x] `docs/lib/number.md` 敘述 `formatNum` 等純函式的輸入/輸出與 locale 注意事項。
- [x] `npm run test:run` 成功（2026-01-08）；`npm run test:run -- --filter=dom` 不被 Vitest CLI 支援已記錄。示例程式碼於 VS Code JS/TS server 中檢查無語法錯誤。

## Stage 4 – Index & Final QA
- [x] `docs/lib/README.md` 收錄索引表、函式對照與撰寫模板，並標註未完成章節的 TODO / lint 待辦。
- [x] `_sidebar.md` 與 `docs/spec/guide.md` 皆更新為「Lib Guide」導覽與引用段落，確保新文檔可被查閱。
- [x] `docs/spec/Docute260108/check.md` 更新並記錄 smoke tester：Copilot（`npm run test:run`, 2026-01-08）；lint 仍因缺少 `eslint.config.js` 待建置、Reviewer 待指派。
- [x] 最終校對完成，已確認所有章節均導向 RefactorLib 實作且醒目註記 legacy adapter 移除需求。
