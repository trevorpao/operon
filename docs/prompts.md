## 各情境 prompts

## 跨 project 測試
npm install --save ./gene-event-handler-2.1.tgz
npm install --save-dev ./vite-twig-ssr-0.3.0.tgz

## 初始化

```bash
mkdir -p docs/spec/<feature> && cd $_ && touch {idea,plan,check,optimization}.md && cd -
```

## 規劃

請按 `docs/spec/flow.md` 之 `SOP > plan（規劃）` 的要求
建立 `docs/spec/<feature>/idea.md` 的實作計畫

## 驗証

請按 `docs/spec/flow.md` 之 `SOP > check（驗收）` 的要求
建立 `docs/spec/<feature>/plan.md` 的驗收清單

## 開發

落實 `docs/spec/<feature>` 之 stage 2

1) 載入 `docs/spec/<feature>` 內之 plan 及 check 文檔
2) 根據 plan.md，執行優化
3) 根據 check.md，檢查優化
4) 根據檢查結果，進一步優化
5) 根據 check.md，檢查優化
6) 產生 git commit 時所需的說明

## 收尾

執行 `docs/spec/<feature>` 之文件化及優化

1) 在 `docs/spec/<feature>/optimization.md` 中，說明未來可能的改進思路。
2) 將 feature 開發過程中建立的商業邏輯整理進 `docs/spec/rule.md`
3) 將 feature 的特殊詞彙整理進 `docs/glossary.md`。
4) `docs/spec/<feature>/` 移動到 `docs/spec/Archived/<feature>/`
5) 將 feature 中需要遵偱的規格寫入 `docs/spec/history.md` 中，讀者為初階工程師，以利團隊協作。寫入順序由新到舊。
6) 更新 `docs/_sidebar.md` 
7) 產生 git commit 時所需的說明

## 逐步更新 module

舊版寫法之 `app/scripts/modules/<module>.js` 還沒有完成改寫
請按 `docs/spec/guide.md` 之 `開發規則 > Plugin & Hook` 的要求
建立對應的 `app/scripts/hooks` 及 `app/scripts/plugins` 新版程式

## 異動更新

舊版寫法之 `app/scripts/modules/<module>.js` 有異動
請將異動的部份，按 `docs/spec/guide.md` 之 `開發規則 > Plugin & Hook` 的要求
更新至 `app/scripts/hooks/<module>.js` 及 `app/scripts/plugins/<module>.js`

## 拆分

目前的 Plugin & Hook 中有多個 `<module>` 的相關程式
請彙整這些程式，按 `docs/spec/guide.md` 之 `開發規則 > Plugin & Hook` 的要求
建立對應的 `app/scripts/hooks` 及 `app/scripts/plugins` 新版程式


