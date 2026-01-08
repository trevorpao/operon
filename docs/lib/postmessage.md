# PostMessage Helpers

> RefactorLib 統一改用這組 helper 實作跨視窗/iframe 溝通；若專案仍殘留 jQuery `postMessage` 外掛或 `$.receiveMessage`，請先移除後再套用本文件。

## Export Surface
| Export | Signature | 說明 |
| --- | --- | --- |
| `postMessage` | `(message, targetUrl, targetWindow?) => void` | 將 payload 送往指定 `target`，自動推算 `origin` 並 fallback 成 hash 改寫。|
| `receiveMessage` | `(handler, sourceOrigin?, pollInterval?) => () => void` | 訂閱跨視窗訊息，並在 legacy 環境透過輪詢 `location.hash`。|
| `createMessageValidator` | `(schema|fn) => (payload) => boolean` | 將型別規則或自訂函式包裝成校驗器。|
| `createMessageListener` | `({ handler, sourceOrigin, schema, delay }) => () => void` | 一次建立 `receiveMessage` + parser + schema 驗證。|
| `requestResponse` | `({ message, targetUrl, target, schema, timeout }) => Promise` | 送出 request 並等待含 `requestId` 的 reply，內建 timeout。|
| `parseMessageData` | `(payload) => any` | 嘗試以 JSON 或 form encoded 解析 `event.data`。|

## Message Flow
1. 呼叫 `postMessage(payload, targetUrl, targetWindow)`。
2. 對端使用 `createMessageListener` 或 `receiveMessage` 監聽 `message` 事件。
3. listener 將 `event.data` 丟給 `parseMessageData`，並透過 schema 驗證。
4. 若為 request/response 模式，回傳 payload 需帶回 `requestId`。

```javascript
// iframe 內部
import { createMessageListener } from '../lib/postmessage';

const stop = createMessageListener({
	sourceOrigin: 'https://app.example.com',
	schema: { action: 'string', requestId: 'string' },
	handler: ({ data, origin }) => {
		if (data.action === 'ping') {
			parent.postMessage({ requestId: data.requestId, action: 'pong' }, origin);
		}
	},
});
```

## Validating Payloads
- `createMessageValidator` 接受 object schema 或自訂函式；object 版本支援 `string | number | boolean | object | array` 型別字串。
- 在 `requestResponse` 中指定 `schema` 可同步驗證回傳資料，失敗時 promise 會 `reject(new Error('Response schema mismatch'))`。

```javascript
const validator = createMessageValidator({
	action: (value) => value === 'open-modal',
	payload: 'object',
});

if (!validator(data)) {
	console.warn('unexpected message payload', data);
}
```

## Listening for Messages
- `sourceOrigin` 可以是字串（精準比對）或函式（回傳 `false` 即拒絕）。
- 傳入 `delay` 可自訂 legacy hash 模式的輪詢頻率（預設 `100ms`）。
- 返回值為 teardown 函式，記得在模組卸載時呼叫以移除 listener。

```javascript
const teardown = receiveMessage((event) => {
	const data = parseMessageData(event.data);
	if (data?.action === 'resize') {
		resizeIframe(data.height);
	}
}, (origin) => origin.endsWith('.example.com'));

registerHooks('widget', () => () => teardown());
```

## `requestResponse` Promise 模式
- 自動附加 `requestId`，回傳 payload 也必須帶同樣的 `requestId` 才會解析。
- `timeout` 預設 $5000\text{ms}$，逾時會 reject；可視需求調整。
- 若 `target` 不存在或 `targetUrl` 無法推算 origin，會立即拒絕 promise。

```javascript
import { requestResponse } from '../lib/postmessage';

const openModal = () => requestResponse({
	message: { action: 'openModal', payload: { id: 42 } },
	targetUrl: 'https://editor.example.com/embed.html',
	schema: { requestId: 'string', status: 'string' },
	timeout: 8000,
}).then(({ data }) => {
	if (data.status !== 'ok') throw new Error('modal rejected');
}).catch((err) => {
	notifyUser(`無法與編輯器同步: ${err.message}`);
});
```

## Legacy Hash Fallback
- 若 `window.postMessage` 不存在，library 會將 payload encode 到 `location.hash` 並輪詢識別；此模式僅適用同網域 iframe。
- 建議盡早淘汰依賴該 fallback 的功能，並更新至支援 `postMessage` 的瀏覽器矩陣。

## Testing & SSR Notes
- `withBrowser` 會在 SSR 時回傳 `null`，因此 helper 不會觸發；測試中可 stub `getGlobalWindow()` 或直接傳入 `target`。
- 單元測試建議使用 `jsdom` 提供雙視窗並手動觸發 `message` 事件。
- 跨專案若仍有 legacy adapter（例如 `gee.postMessage`），請以本模組取代，並在文件中保留這段警語避免同事再引入舊實作。
