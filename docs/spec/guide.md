# 開發規則

## Plugin & Hook

SOP 重點：用 `gee.hook` 綁定 `data-gene`，驗證先行，事件與資料邏輯分層。

- 綁定方式：`gee.hook('xxx.action', handler)`，不要掃描 `data-hook`。`handler` 接收 `me`，用 `toElement` 取原生 DOM 後再操作。
- 目標定位：轉成 Element 後向上找容器或 form，找不到就 `return false` 避免例外。
- 驗證先行：優先 `form.reportValidity()`；缺少時再用 `app.validateForm` 或自訂檢查。驗證失敗立即 return，不要清空輸入。
- Payload：`const payload = Object.fromEntries(new FormData(form).entries());` 避免 jQuery serialize。
- 取得 plugin：安裝時 `app.get('namespace.plugin')`，取不到回傳 no-op teardown；資料/DOM 生成留在 plugin 內，hook 只管 DOM/事件與資料格式。
- 進度/恢復：送出前 disable + spinner；成功或失敗都恢復（封裝 restore）。
- 成功/失敗：成功可 reset 表單並呼叫 `app.stdSuccess`（或 plugin 自訂）；失敗呼叫 `app.stdErr`/自訂錯誤並確保 catch 也會恢復按鈕。
- Teardown：`gee.hook` 無 unregister；若要避免重複註冊，用旗標。自行加的 listener 要收集 unbind 並在 teardown 執行。
- 職責分離：Plugin 負責資料/邏輯與 DOM 生成；Hook 負責 DOM/事件與資料格式整理，不直接寫資料層邏輯。
- 驗收清單：`data-gene` 能觸發；驗證會阻擋非法輸入；成功/失敗皆恢復按鈕；Plugin 缺席時不爆錯；純 JS（無 jQuery 依賴）。

## Gene Event Handler

- 載入方式（IIFE）：引入 `gene.min.js` 後設定全域，再 `gee.init()`。
  ```html
  <script src="dist/gene.min.js"></script>
  <script>
    gee.debug = 1;
    gee.apiUri = 'https://api.example.com';
    gee.subFolder = 'scripts/plugins';
    document.addEventListener('DOMContentLoaded', () => gee.init());
  </script>
  ```
- data-gene 規則：`data-gene="<event>:<behavior>[,event2:behavior2...]"`；預設事件 `click`，`hover` 會展開為 `mouseenter`/`mouseleave`，`init` 立即執行。初始化後 `.gee` 會被移除，也支援舊寫法 `data-event`/`data-behavior`。
- 建議綁定：表單用 `submit:<behavior>` 綁在 `<form>`；純按鈕用 `click:<behavior>`。
- 內建 hooks：`react`, `notfound`, `alert`, `resetForm`, `stdSubmit`（含 `validatr.validateForm` + `gee.yell`，處理 msg/reset/redirect/goback/func）。
- validatr：API `validateField`/`validateForm`/`attach`/`addRule`；預設錯誤模板 `<div class="validatr-err">{{message}}</div>`，可關閉/覆寫；`data-error` 覆蓋訊息，自訂規則用 `data-{rule}`。
- yell：`gene.yell(uri, postData, success?, error?, typeOrOpts?, hideLoadAnim?)` 回傳 `{ ok, code, data, error, status }`；物件自動 JSON，FormData/Blob 原樣，預設 `credentials: same-origin`、`mode: cors`。
- 自訂元素：`customElem.register(tag, fn, { overwrite, mode })`（預設 replace），標記 `data-gee-tagged-{tag}` 防重複；`customElem.apply` 可重複套用。

