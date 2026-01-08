# SPEC 開發 Flow（IPC）

串連 `idea -> (discuss) -> plan -> (done) -> check -> (Optimization)`，並標註與 AI 協作時的重點（含三個括號步驟）。

## SOP

未來新增功能時，應按下方流程實作，落實 Spec-Driven Development(SDD) 

1) 建立新資料夾：於 `docs/spec/<feature>/` 下新增四個空白檔案 `idea.md`、`plan.md`、`check.md`、`optimization.md`（對應「想法/計畫/驗收/優化」）。
2) idea（需求 / 風險）：提供 feature 目標、範圍、風險、依賴；討論重點; 規格; 視需求提供範例程式。
3) (discuss)：
   1) 若需求複雜，先用 AI 摘要現況與風險，請求小步快跑的拆分方案；
   2) 驗證依賴/風險清單並標出高風險區塊需暫行 adapter。
4) plan（規劃）：
   1) 在 `plan.md` 列出分階段(stage)/子任務、PR 切分與預期 smoke 測試；
   2) 標明高風險區塊的 fallback/adapters。
5) (done)：
   1) 依 plan 執行；
   2) 每步完成後記錄關鍵變更與 smoke 結果。
6) check（驗收）：在 `check.md` 以核對清單列出完成條目與驗證結果；PR 時附上勾選情況;重構時比較新寫法是否有遺漏功能。
7) (Optimization)：
   1) 將 feature 開發過程中建立的商業邏輯整理進 `docs/spec/rule.md`。
   2) 將 feature 的特殊詞彙整理進 `docs/glossary.md`。
   4) 在 `optimization.md` 中，說明可能的改進思路。
   5) `docs/spec/<feature>/` 移動到 `docs/spec/Archived/<feature>/`
   6) 將 feature 中需要遵偱的規格寫入 `docs/spec/history.md` 中，讀者為初階工程師。
   7) 更新 `docs/_sidebar.md`
8) AI 協作要點：
  - 要求 AI 產出綱要、里程碑、風險與 fallback；
  - 請 AI 生成或比對 checklist，避免遺漏；
  - 在 PR 說明中附上 AI 提供的重點與驗收結果摘要。

## 專用指令

根據情境，選擇指令

### Done 情境

落實 docs/spec/`<feature>` 之 stage `<step-number>`

1) 載入 `docs/spec/<feature>` 內之 plan 及 check 文檔
2) 根據 plan 文件，執行優化
3) 根據 check 文件，檢查優化
4) 根據檢查結果，進一步優化
5) 根據 check 文件，檢查優化
6) 產生 git commit 時所需的說明

### Optimization 情境

執行 `docs/spec/<feature>` 之文件化及優化

1) 將 feature 開發過程中建立的商業邏輯整理進 `docs/spec/rule.md`
2) 將 feature 的特殊詞彙整理進 `docs/glossary.md`。
3) 在 `docs/spec/<feature>/optimization.md` 中，說明未來可能的改進思路。
4) `docs/spec/<feature>/` 移動到 `docs/spec/Archived/<feature>/`
5) 將 feature 中需要遵偱的規格寫入 `docs/spec/history.md` 中，讀者為初階工程師，以利團隊協作。寫入順序由新到舊。
6) 更新 `docs/_sidebar.md` 
7) 產生 git commit 時所需的說明
