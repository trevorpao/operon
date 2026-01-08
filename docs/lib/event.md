# Event Emitter

> 以 Map/Set 實作的 lightweight 匯流排，取代舊的 `gee.event` 與 `app.site.registerBack` 內部實作。

## API Surface
| Export | Signature | 說明 |
| --- | --- | --- |
| `createEmitter(options?)` | `({ onError? }) => Emitter` | 建立新的 emitter 實例。|
| `on(topic, handler)` | `(string, Function) => () => void` | 監聽特定 topic，回傳解除函式。|
| `off(topic, handler?)` | `(string, Function?) => void` | 移除特定 handler，或整個 topic。|
| `once(topic, handler)` | 註冊一次性 handler。|
| `emit(topic, ...args)` | `(string, ...any) => number` | 依序呼叫符合的 handler，回傳送達數。|
| `clear(topic?)` | `(string?) => void` | 清空所有 listeners 或單一 topic。|
| `listenerCount(topic?)` | `(string?) => number` | 取得目前註冊的 handler 數。|
| `default export` | `emitter` | 專案全域共用的 emitter 實例。|

## `createEmitter(options)`
- `options.onError`：自訂錯誤 logger。預設直接呼叫 `console.error('[emitter]', { topic, pattern }, error)`。
- 每個 emitter 內部維護 `Map<string, Set<Function>>`，`emit` 時會遍歷所有 topic（包含 wildcard），因此請將高頻事件命名為具體 topic 以避免不必要掃描。

## 訂閱與解除

```javascript
import emitter, { on, once } from '../lib/event';

const stop = on('arena.load', (payload) => {
	// ...
});

const oneShot = once('arena.ready', () => console.info('ready')); 

registerHooks('arena', () => () => {
	stop();
	oneShot();
});
```

- `on` 會回傳 teardown 函式，將它交給 hook/plugin 的 disposer（例如 `registerHooks` 回傳的 teardown）即可避免記憶體洩漏。
- `off(topic)` 沒有 handler 參數時會整批移除，適合在場景切換後 Reset。

## Wildcard Topics
- 支援 `*` 以及 `prefix.*`。Wildcard handler 會收到 `(topic, ...args)`，方便集中紀錄。

```javascript
const audit = on('arena.*', (topic, payload) => {
	analytics.record(topic, payload);
});
```

- `matchesTopic` 與 `isWildcardPattern` 也有匯出，可供自訂工具類判斷。

## `registerBack` / Hook Integration
- `app/scripts/theme/default.js` 將 `app.site.registerBack` 改寫成 emitter 訂閱：

```javascript
import { on } from '../lib/event';

state.registerBack = (handler) => on('arena.backPrevious', handler);
```

- 此後所有模組只要 `emit('arena.backPrevious')` 就能觸發返回行為。
- 若你的 hook 需要在離開畫面時自動解除 `registerBack`：

```javascript
import { emit, on } from '../lib/event';

export function useDrawerToggle(target) {
	const teardown = on('arena.backPrevious', () => closeDrawer(target));
	return () => teardown();
}

// somewhere else when closing programmatically
emit('arena.backPrevious');
```

## Emitting 與觀測
- `emit(topic, ...args)` 會同步呼叫所有匹配 handler，回傳送達 handler 的數量，方便測試或 fallback 判斷：

```javascript
if (emit('arena.backPrevious') === 0) {
	// 沒有人接收，提供預設行為
	goHome();
}
```

- `listenerCount(topic)` 可用於 diagnostics，例如顯示目前已註冊的 back handlers。
- `clear()` 可在測試 teardown 或整個 SPA reload 時呼叫。

## 錯誤處理
- handler 內丟出的錯誤會被 try/catch，並交給 `options.onError`。
- 不會阻止同批事件的其他 handler。
- 若需要在測試中驗證錯誤，可傳入 stub：

```javascript
const emitter = createEmitter({ onError: (ctx, err) => reporter.capture(ctx, err) });
```

## 常見守則
- Topic 命名以 `namespace.action` 為主（例如 `arena.loadMain`），Wildcard 以 `. *` 表示群組。
- 永遠回傳 teardown。對於需要多個 handler 的模組，可以把 teardown 存在陣列並在 `dispose()` 逐一呼叫。
- 測試時若直接匯入預設 emitter，請在 `afterEach` 呼叫 `clear()` 以免跨測案例互相污染。
