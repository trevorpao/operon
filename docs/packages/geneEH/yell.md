# yell（Ajax/Fetch 包裝器）

`gene.yell` 是專案內建的非同步請求助手，會自動處理 JSON 序列化、表單資料、錯誤正規化與選擇性載入動畫。回傳一個含結構化結果的 Promise，並保留成功/失敗回呼相容性。

## 匯入與前置
若已透過 `bootstrap.js` 設定，`gene`/`validatr` 會掛在全域：
```javascript
import gene from '../src/gene.js';
```

## 基本用法
```javascript
const res = await gene.yell('/api/login', { account, password });
if (!res.ok) {
  console.error(res.error);
  return;
}
console.log(res.data);
```

## 傳送 FormData
```javascript
const fd = new FormData(formElement);
const res = await gene.yell('/api/upload', fd, null, null, { method: 'POST' });
if (!res.ok) alert(res.error);
```
> 傳入 FormData 時不會自動加上 `Content-Type`，讓瀏覽器處理邊界。`

## 參數與回傳
`gene.yell(uri, postData, successCB, errorCB, type = 'POST', hideLoadAnim = false, opts = {})`
- `uri`: 字串，若非絕對網址會以 `gene.apiUri` 為前綴。
- `postData`: 物件（自動 JSON 化）或 `FormData`/`Blob`（原樣傳遞）。
- `successCB(normalized)` / `errorCB(normalized)`: 可選回呼，與 Promise 結果一致。
- `type`: 仍接受舊版傳入字串 HTTP 方法；若傳入物件則視為 `opts`。
- `hideLoadAnim`: 舊版旗標；若不想顯示載入動畫設為 `true`。
- `opts`: 進階設定 `{ method, headers, credentials, mode, signal, hideLoadAnim }`。

### 回傳格式
`{ ok: boolean, code: number, data: any, error: string|null, status: number }`
- `ok`: HTTP 成功且無 `errorCode`。
- `code`: 來自伺服器 `payload.code`，否則用 `status`，成功預設為 `1`。
- `data`: 伺服器回傳的 `data` 欄位，或完整 payload。
- `error`: 失敗時的錯誤訊息。
- `status`: HTTP 狀態碼。

## 進階選項示例
```javascript
const controller = new AbortController();
const res = await gene.yell(
  '/api/items',
  { page: 1 },
  null,
  null,
  { method: 'POST', headers: { 'X-CSRF': token }, signal: controller.signal }
);
```

## 回呼相容範例（同 stdSubmit 的 dAction）
```javascript
const onDone = function () {
  // callbacks are invoked with `this` = normalized result
  const ctx = this;
  // 常見成功處理
  if (ctx.code === 1) {
    if (ctx.data && ctx.data.msg) {
      gene.alert({ title: 'Alert!', txt: ctx.data.msg });
    }
    if (ctx.data && ctx.data.uri) {
      location.href = ctx.data.uri === '' ? gene.apiUri : ctx.data.uri;
    }
    if (ctx.data && ctx.data.goback) {
      history.go(-1);
    }
    if (ctx.data && ctx.data.reset) {
      form.reset();
    }
  } else {
    const msg = (ctx.data && ctx.data.msg) || ctx.error || 'Server Error';
    gene.alert({ title: 'Error!', txt: msg + '(' + ctx.code + ')' });
  }
};

// 呼叫 yell 並沿用回呼模式（也可同時 await res）
const res = await gene.yell('/api/login', new FormData(form), onDone, onDone);
```

## 注意
- 預設 `credentials: 'same-origin'`、`mode: 'cors'`，可在 `opts` 覆寫。
- 非 JSON 回應會被視為 `null`，並以 HTTP 狀態與 `statusText` 正規化錯誤。
- 若仍需舊版回呼模式，可同時傳入回呼與 `await`，兩者取得同一份正規化結果。
