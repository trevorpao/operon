# Format Plugin

> 這支 plugin 封裝所有 template helper；若仍在模板中直接呼叫 jQuery `formatMoney` 或 legacy Gee API，請改由 `formatHelper`/Handlebars helper 暴露的函式取得結果。

## Export Surface
| Export | Signature | 說明 |
| --- | --- | --- |
| `createFormatHelper` | `(overrides?) => Helpers` | 依賴注入 `app`, `gee`, `jquery`, `moment`, `timeagoFn`，回傳 helper 物件。|
| `registerTemplateHelpers` | `(handlebars, helpers?) => void` | 將 helpers 註冊到 Handlebars 實例；預設會把 `api` 每個 key 註冊為 helper。|
| `THUMBNAIL_PRESETS` | `Record<string, [w, h]>` | 可復用於 CMS 或測試，與後端設定同步。|
| `default export (formatPlugin)` | `createPlugin(...)` | 在 `install()` 時把 helpers 綁到 `app.formatHelper`/`app.tmplHelpers`、註冊 Handlebars helper。|

## Dependency Injection
`createFormatHelper({ appRef, gee, jquery, momentLib, timeagoFn })` 允許在測試時傳入 stub：
- `appRef`: 預設為 `app`，提供 `tmplHelpers` 與 `MD5`。
- `gee`: 決定 `picUri`, `mainUri`, `clog`。
- `jquery`: 如需 `$.fn.formatMoney` 或 `$.timeago`。
- `momentLib`: 所有日期 helper 依賴它；若缺少會退回 raw string。
- `timeagoFn`: 可自行注入以避免耦合 jQuery。

```javascript
import { createFormatHelper } from '../lib/format';

const helpers = createFormatHelper({
	appRef: fakeApp,
	momentLib: (value) => dayjs(value),
	timeagoFn: (ts) => dayjs(ts).fromNow(),
});
```

## Helper 類別

### 數值 / 貨幣
- `currency(value)`：優先使用 `$.fn.formatMoney`，否則 fallback `Number.toLocaleString()`。
- `sum(price, qty)`：使用 `app.tmplHelpers.currency`（若存在）格式化總價。
- `percent(num, divide, decimals)` / `calPercent`：包裝 `calcPercent`，會自動處理除以 0。
- `average(sum, divide)`：回傳一位小數平均值。

### 日期 / 時間
- `formatISO`, `iso8601`, `getYear/GetMon/GetWeek/GetDay/GetTime`：都透過 `moment` 格式化，若無 moment 則回傳輸入字串。
- `formatDate(str, pattern)`：若未提供 `str` 則以現在時間為基準。
- `during(ts1, ts2)`：輸出日期區間並使用 `gee.clog` 記錄 diff。
- `beforeDate(ts, bucketKey)`：在 `app[bucketKey]` 追蹤 `min_ts/max_ts`，再回傳 `timeago` 字串。

### 文字處理
- `nl2br`, `indent`, `strong`：藉由 `applyTextTransforms` 連鎖處理字串。
- `genderedHonorific`：`f` ➜ `女士`，其他 ➜ `先生`。

### 媒體 / 路徑
- `loadPic(path)` / `repathImg`：會檢查字串是否以 `/upload` 開頭，若是則帶上 `gee.picUri` 前綴。
- `thumbnail(path, type)`：依 `THUMBNAIL_PRESETS` 轉換檔名，例如 `cover.jpg` ➜ `cover_300x300.jpg`。
- `getGravatar(email, size, type)`：若 `type === 'cat'` 則改用 `robohash`。
- `linkAPI(path)`：前綴 `gee.mainUri`。

### 其他工具
- `s2m(seconds)`：轉換為 `x 分 y 秒`。
- `loadPic` / `getPicPrefix`：配合 `app.loadHtml` 插入圖片。

## `registerTemplateHelpers`
- 呼叫時若未提供 `helpers`，預設使用 `createFormatHelper` 返回的 `api`。
- 每個 helper 會以其 key 名稱註冊在 Handlebars，例如 `{{currency price}}`。
- 若要傳入額外 helper，可這樣使用：

```javascript
import Handlebars from 'handlebars/runtime';
import { registerTemplateHelpers, createFormatHelper } from '../lib/format';

const helpers = createFormatHelper();
helpers.upper = (str) => String(str).toUpperCase();

registerTemplateHelpers(Handlebars, helpers);
```

## Plugin 啟動流程
`formatPlugin.install()`：
1. 將 `THUMBNAIL_PRESETS` 掛到 `app.thumbnail`。
2. 以 `app` 建立 helper 並存到 `app.formatHelper`。
3. 呼叫 `registerTemplateHelpers(resolveHandlebars(), api)`。
4. 回傳 `{ api, registerTemplateHelpers }` 供其他插件組合使用。

## 減少 legacy 依賴
- jQuery 僅作為可選依賴；若程式庫偵測不到 `jquery.timeago` 或 `formatMoney`，helper 會 fallback 到純 JS 實作。
- 若頁面仍引用 `window.gee.currency` 等舊 API，請改呼叫 `app.formatHelper.currency` 以保持一致。
- 在 SSR 或測試中，記得注入 `momentLib`/`timeagoFn`，或在文件中記錄 fallback 行為以免 snapshot 失敗。
