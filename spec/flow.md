# SPEC 開發 Flow（IPC）

串連 `idea -> (discuss) -> plan -> (done) -> check -> (Optimization)`，並標註與 AI 協作時的重點（含三個括號步驟）。

## SOP：未來新增 spec 文檔（idea → plan → check）
1) 建立新資料夾：於 `spec/<feature>/` 下新增 `idea.md`、`plan.md`、`check.md`（對應「想法/計畫/驗收」）。
2) idea（需求 / 風險）：提供 feature 目標、範圍、風險、依賴；討論重點; 規格; 視需求提供範例程式。
3) (discuss)：
   1) 若需求複雜，先用 AI 摘要現況與風險，請求小步快跑的拆分方案；
   2) 驗證依賴/風險清單並標出高風險區塊需暫行 adapter。
4) plan（行動）：
   1) 在 `plan.md` 列出分階段/子任務、PR 切分與預期 smoke 測試；
   2) 標明高風險區塊的 fallback/adapters。
5) (done)：
   1) 依 plan 執行；
   2) 每步完成後記錄關鍵變更與 smoke 結果。
6) check（驗收）：在 `check.md` 以核對清單列出完成條目與驗證結果；PR 時附上勾選情況;重構時比較新寫法是否有遺漏功能。
7) (Optimization)：
   1) 若驗收未過，回到 plan 拆更小步；
   2) 通過後更新文件/依賴，記錄「已移除/替換」資產。
   3) 將 feature 的規則整理進 `spec/rule.md`。
   4) 將 feature 的特殊詞彙整理進 `spec/glossary.md`。
8) AI 協作要點：
  - 要求 AI 產出綱要、里程碑、風險與 fallback；
  - 請 AI 生成或比對 checklist，避免遺漏；
  - 在 PR 說明中附上 AI 提供的重點與驗收結果摘要。
