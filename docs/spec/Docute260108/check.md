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
- [ ] `docs/lib/postmessage.md` 涵蓋 listener 建立、`createMessageValidator`、`requestResponse` timeout/fallback 實例。
- [ ] `docs/lib/head.md` 說明 `requireModernBrowser`, `injectAnalytics`, `bootstrap`, `onIncompatible` UI 範例。
- [ ] `docs/lib/format.md` 展示純函式、依賴注入、`registerTemplateHelpers` 使用情境。
- [ ] `npm run lint` 或等效檢查通過；至少一篇由其他成員審閱並註記 Reviewer。

## Stage 3 – DOM / Forms / Number Helpers
- [ ] `docs/lib/dom.md` 描述 placeholder/classList 等 API，並教學如何保存/釋放 teardown。
- [ ] `docs/lib/forms.md` 提供 serialize、validation 工具示例與 submit 範本。
- [ ] `docs/lib/number.md` 敘述 `formatNum` 等純函式的輸入/輸出與 locale 注意事項。
- [ ] 示例程式碼經 ESLint/VS Code 檢查且 `npm run test:run` 再次成功。

## Stage 4 – Index & Final QA
- [ ] `docs/lib/README.md` 收錄索引表、函式對照與撰寫模板，並標註未完成章節的 TODO。
- [ ] `_sidebar.md` 與 `docs/spec/guide.md` 皆新增至「Lib Guide」連結。
- [ ] `docs/spec/Docute260108/check.md` 勾選最新狀態並紀錄 smoke tester 名稱/日期。
- [ ] 所有 docs PR 合併後進行最終校對，確認沒有遺留的 legacy adapter 建議。
