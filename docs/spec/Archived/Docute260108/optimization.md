## Docute260108 – Optimization Backlog

1. **Lint pipeline unblocker**
	- 建立 `eslint.config.js`（或降回 ESLint v8）讓 `npm run lint` 恢復正常，並在 `check.md` 中補上實際執行結果與 Reviewer 名稱。
	- 目標：Stage 2 的 smoke checklist 不再卡在工具升級上，未來篇章只需重複命令即可驗證。

2. **Docs drift guard**
	- 寫一個簡單的 `node scripts/sync-lib-docs.mjs`，比對 `app/scripts/lib/**/*` 的 exports 與 `docs/lib/README.md` 匯出矩陣，若缺項就失敗。
	- 讓 PR 檢查更自動化，避免新增 helper 卻忘了補文件/導航。

3. **Reviewer checklist**
	- 在 `docs/spec/guide.md` 新增一份「Lib Guide Review SOP」，列出 reviewer 需確認的項目（SSR 範例、teardown、legacy 警語）。
	- 降低口頭傳達成本，初階工程師只要照 SOP 就能完成審查。

4. **Examples sandbox**
	- 長期可以建立一個 `/docs/examples/lib/` 的 mini playground（例如 StackBlitz link 或簡單 HTML），示範 postMessage/withBrowser 等常見片段。
	- 讓讀者不必只看 Markdown，也能直接試跑。
