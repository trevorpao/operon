# Lib Reference

RefactorLib 的目標是讓 `app/scripts/lib/*` 模組以純函式與 SSR 安全的方式提供共用工具。此目錄收錄各模組的使用方式、範例與注意事項。

> Stage 0 只建立骨架；詳細說明會在 Stage 1–3 依模組補齊。

## 模組索引
- [Shared Runtime Helpers](shared.md)
- [Detect Capabilities](detect.md)
- [Event Emitter](event.md)
- [PostMessage Helpers](postmessage.md)
- [DOM Helpers](dom.md)
- [Form Helpers](forms.md)
- [Number & Formatting](number.md)
- [Format Plugin](format.md)
- [Head Plugin / Analytics](head.md)

## 撰寫規範
- 每個檔案採固定結構：`Overview`、`Exports`、`Usage Examples`、`Notes & SSR Guardrails`、`Related Helpers`。
- 範例碼需使用現行 ESM 匯入語法並示範 teardown/SSR fallback。
- 若模組尚未完成，請在對應檔案加上 `TODO(Stage X)` 註記並於 README 索引標示。
