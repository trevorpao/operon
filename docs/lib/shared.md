# Shared Runtime Helpers

> 把所有依賴 `window`/`document` 的程式包在這裡，才能安全地在 SSR、測試與瀏覽器環境間切換。

## Export Surface
| Helper | Signature | 摘要 |
| --- | --- | --- |
| `isBrowser` / `isSSR` | `boolean` | 預先在載入時判斷是否有瀏覽器環境，避免重覆 I/O。|
| `ensureBrowser()` | `() => boolean` | 與舊版 API 相容；不會拋錯，單純回傳狀態。|
| `withBrowser()` | `(cb, fallback?) => any` | 在瀏覽器才執行 `cb({ window, document })`，否則走 fallback。|
| `withDocument()` | `(cb, fallback?) => any` | `withBrowser` 的快捷方式，只把 `document` 傳進 callback。|
| `toElements()` | `(input) => Element[]` | 字串（CSS selector）、NodeList、單一 Element 都會被轉成陣列。|
| `toNodes()` / `toElement()` | `(input) => Element[] | Element|null` | `toElements` 的別名／單一元素版本。|
| `toStringSafe()` | `(value?) => string` | `null`/`undefined` 會轉成空字串，避免 template 出現 `undefined`。|
| `toNumberSafe()` | `(value, fallback=0) => number` | 不是有限數字就回傳 fallback。|
| `WHITESPACE_RE` | `/\s+/` | 舊版模組通用的空白分割正則。|

## Browser Guards

### `ensureBrowser()`
- 與過去 `window.isBrowser` 相容，適合在條件式中快速檢查。
- 不保證 `document` 已經 ready，僅代表這段程式碼正在瀏覽器載入。

### `withBrowser(cb, fallback)`
- 只有在 SSR-safe 的時候才呼叫 `cb({ window, document })`。
- `fallback` 可以是值或函式（會收到錯誤物件），讓我們在沒有瀏覽器時決定回傳預設內容。
- 建議 `cb` 回傳 teardown 函式，方便外部統一回收。

```javascript
import { withBrowser } from '../lib/shared';

const attachResize = () => withBrowser(({ window }) => {
	const handler = () => console.info('viewport', window.innerWidth);
	window.addEventListener('resize', handler);
	return () => window.removeEventListener('resize', handler);
}, () => () => {});

const dispose = attachResize();
// call dispose() when your hook / module unmounts
```

### `withDocument(cb, fallback)`
- 省略 `window`；常用於 query DOM 或建立 fragment。
- 若 `fallback` 為陣列或物件，請在外部建立常數，避免每次 SSR 都分配新記憶體。

## DOM Collection Helpers

### `toElements(input)`
- 字串 → `document.querySelectorAll` 結果。
- NodeList / HTMLCollection / Array 會被複製成新陣列，確保後續 `map/filter` 不會動到來源。
- 非 Element 的值會自動被濾掉。

### `toNodes(input)` / `toElement(input)`
- `toNodes` 是 `toElements` 的別名，保留舊 API。
- `toElement` 只回傳第一個匹配，找不到時為 `null`。
- 建議搭配 `withDocument` 使用：

```javascript
import { toElement, withDocument } from '../lib/shared';

const getDraftPanel = () => withDocument(() => toElement('#draftPanel'), null);
```

## Primitive Safety

### `toStringSafe(value)`
- 任何 falsy（包含 `0`）都會被轉成字串，確保模板輸出文字而不是 `undefined`。
- 避免在 `JSON.stringify` 前手動補空字串。

### `toNumberSafe(value, fallback = 0)`
- 先用 `Number()` 轉型，再檢查 `Number.isFinite`；失敗時用 fallback。
- 適合處理 data-* 屬性或 querystring。

### `WHITESPACE_RE`
- 提供統一的空白切割規則，舊專案可直接沿用：

```javascript
const tokens = toStringSafe(input).trim().split(WHITESPACE_RE);
```

## SSR / Teardown Playbook
- 在 hook 或模組 `init()` 中，永遠使用 `withBrowser` 取得 `window`/`document`，並回傳清理函式給呼叫端。例如 `registerHooks('arena', () => withBrowser(...))`。
- 若需要暫存 DOM 參考，請儲存 selector 而不是元素，並在 `withDocument` 內重新查找，避免 SSR 期觸發。
- 如果 fallback 會建立空資料結構（例如 `[]`），請建立共享常數：

```javascript
const EMPTY_LIST = Object.freeze([]);
const nodes = toElements(maybeSelector) ?? EMPTY_LIST;
```

透過這些 helper，可以讓模組在 `$isSSR`、單元測試與瀏覽器之間維持同一份程式碼路徑，並且提供一致的 teardown 介面。
