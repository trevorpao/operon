# Head Plugin & Analytics

> GA v4 及 modern-only policy 都透過 `head.js` 控制；若仍有 inline UA 判斷或舊 GA snippet，請切換成 `requireModernBrowser` + `injectAnalytics`。

## Export Surface
| Export | Signature | 說明 |
| --- | --- | --- |
| `requireModernBrowser` | `(options?) => boolean` | 偵測瀏覽器是否符合條件，不符時觸發 `onIncompatible` UI。|
| `injectAnalytics` | `(measurementId, options?) => boolean` | 動態載入 `gtag.js` 並可選擇是否自動初始化 GA。|
| `configureAnalytics` | `(measurementId) => boolean` | 設定 `window.gtag` 與 `dataLayer`，避免重複初始。|
| `loadAnalyticsScript` | `(measurementId, parentPreference?) => HTMLScriptElement|null` | 實際創建 `<script>` 節點並設定 `data-gtag-id`。|
| `bootstrap` | `() => void` | 讀取全域/`data-*` 設定後，依序執行 modern 檢查與 GA 初始化。|
| `isLegacyIE` | `(window?) => boolean` | 提供測試或自訂 predicate 使用。|
| `resetState` | `() => void` | 清空內部 `loadedScripts` / `configuredIds`，供測試與熱載。|

## `requireModernBrowser(options)`
- 預設透過 `isLegacyIE` 判斷，若輸入 `predicate(win) => boolean` 可以自訂更嚴格條件（例如封鎖舊版 Safari）。
- `onIncompatible(context)` 會收到 `{ window, document }`，可在此渲染客製 UI；預設行為是插入 `.browser-upgrade-notice` banner 或使用 `alert`。
- 範例：

```javascript
import { requireModernBrowser } from '../lib/head';

requireModernBrowser({
	predicate: (win) => !/MSIE|Trident/.test(win.navigator.userAgent) && !win.CSS?.supports?.('display', 'grid'),
	onIncompatible: ({ document }) => {
		const panel = document.createElement('section');
		panel.className = 'compat-blocker';
		panel.innerHTML = '<h1>請更新瀏覽器</h1><p>此頁需要 CSS Grid。</p>';
		document.body.prepend(panel);
	},
});
```

## Analytics Injection
- `injectAnalytics(measurementId, { autoInitGa = true, scriptParent })`：
  - 若 `autoInitGa` 為 `true`，會呼叫 `configureAnalytics` 並預設 `send_page_view: false`，讓 SPA 控制 pageview。
  - `scriptParent` 可指定 `'body'` 以避開某些瀏覽器阻擋 `<head>` 動態 script 的問題。
- 只想載入腳本、不初始化 GA 時，可傳 `{ autoInitGa: false }` 再自行呼叫 `configureAnalytics`。

```javascript
import { injectAnalytics } from '../lib/head';

injectAnalytics('G-ABCD1234', { autoInitGa: false, scriptParent: 'body' });
window.gtag('config', 'G-ABCD1234', { send_page_view: true });
```

## `bootstrap()` lifecycle
1. 讀取 `window.headOptions` ➜ 讀取 `<script data-head-config>` 的 `data-*` ➜ fallback 至 `window.gaMeasurementID`。
2. 若 `requireModern` 不為 `false`，先執行 `requireModernBrowser`。
3. 具備 `measurementId` 時自動 `injectAnalytics`。

支援的 `data-head-config` 屬性：
- `data-measurement-id`
- `data-require-modern="false"`
- `data-auto-init-ga="false"`
- `data-script-parent="body"`

將下列 snippet 放在 `<head>` 中即可啟用：

```html
<script src="/scripts/lib/head.js"
		data-head-config
		data-measurement-id="G-ABCD1234"
		data-require-modern="true"
		data-auto-init-ga="true">
</script>
```

## 自訂 `onIncompatible` UI
- `defaultOnIncompatible` 會插入 `div.browser-upgrade-notice`，你可以覆寫以符合品牌：

```javascript
window.headOptions = {
	onIncompatible: ({ document }) => {
		const toast = document.createElement('div');
		toast.className = 'toast toast-danger';
		toast.innerHTML = '<strong>瀏覽器過舊</strong><p>請改用 Edge / Chrome。</p>';
		document.body.appendChild(toast);
		return toast;
	},
};
```

- 若需要整合 consent 模組，可在 `onIncompatible` 中觸發 `emit('consent.blocked')`，或在 `bootstrap` 之後再初始化 CMP。

## Reset 與測試
- `resetState()`：清空已載入腳本與 `configuredIds`，適合在 Vitest `afterEach` 使用。
- `isLegacyIE(win)` 可在 unit test 中覆寫 `navigator.userAgent` 來驗證。
- 為確保最終 bundle 不再引用舊 GA snippet，請以 `npm run lint` + `rg ga.js` 確認只有本模組負責載入腳本。
