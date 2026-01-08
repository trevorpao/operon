# Detect Capabilities

> Feature-first 的偵測層，所有裝置差異都透過 capability 物件描述，禁止復刻 UA sniff。

## Capability 模型
`detect.js` 每次 `refreshCapabilities()` 會重新產生下列欄位，預設值來自 `DEFAULT_CAPABILITIES`：

| 欄位 | 型別 | 說明 |
| --- | --- | --- |
| `touch` | `boolean` | 是否支援觸控（優先看 `maxTouchPoints` / `ontouchstart`）。|
| `pointer` | `boolean` | 是否支援 PointerEvent。|
| `coarsePointer` | `boolean` | `matchMedia('(pointer: coarse)')` 結果，用於判斷遙控器/觸控筆。|
| `hover` | `boolean` | 是否可以穩定 hover。若 `matchMedia` 不可用且 `coarsePointer` 為真則預設為 false。|
| `prefersReducedMotion` | `boolean` | 使用者是否偏好降低動畫。|
| `prefersDarkMode` | `boolean` | 使用者是否偏好深色模式。|
| `viewportWidth` / `viewportHeight` | `number|null` | 視窗大小（SSR 時為 `null`）。|
| `userAgent` | `string` | 原始 UA 字串，僅供除錯，不可再做條件判斷。|
| `isMobile` | `boolean` | 綜合 touch、coarse pointer、寬度與 UA pattern (`UA_MOBILE`) 的結果。|

## 取得能力值

### `getCapabilities(overrides?)`
- 無參數時會回傳快取；第一次呼叫會自動觸發 `refreshCapabilities()`。
- 傳入 `overrides` 可於測試中注入假資料，不會汙染快取：

```javascript
import { getCapabilities } from '../lib/detect';

const caps = getCapabilities({ window, navigator, matchMedia });
```

### `refreshCapabilities(overrides?)`
- 沒有參數時會透過 `withBrowser` 讀取 `window` 並更新快取；SSR 時會回傳純預設值（所有布林為 false）。
- 若提供 `overrides`（例如 `refreshCapabilities({ window: fakeWindow })`）會直接取代快取，適合在測試 `beforeEach` 中設定。

### Derived Helpers
- `isMobileDevice(caps?)`、`hasTouchSupport(caps?)`、`getViewport()` 都是 `getCapabilities` 的語法糖，避免在模組裡自己判斷欄位。

## SSR / 測試策略
- 偵測流程使用 `withBrowser`，因此在 Node/SSR 期間會安全地走 fallback：

```javascript
import { withBrowser } from '../lib/shared';
import { refreshCapabilities } from '../lib/detect';

export const startViewportWatcher = () => withBrowser(({ window }) => {
	const sync = () => refreshCapabilities({ window });
	window.addEventListener('resize', sync);
	return () => window.removeEventListener('resize', sync);
}, () => () => {});
```

- 單元測試請呼叫 `refreshCapabilities(fakeCaps)` 或 `refreshCapabilities({ window: buildFakeWindow() })`，結束時再重置：

```javascript
afterEach(() => refreshCapabilities());
```

## 禁忌：禁止 UA 分支
- 任何「如果 UA 包含 `Android` 就怎樣」的邏輯都應改寫成 capability 條件，例如 `if (caps.hover)` 或 `if (!caps.prefersReducedMotion)`。
- `detect.js` 只有一處 UA pattern（`UA_MOBILE`）作為最後 fallback，用途是支援極舊裝置。不要複製這段正則到其他模組。

## 常見使用範例

```javascript
import { getCapabilities, isMobileDevice } from '../lib/detect';

const caps = getCapabilities();

if (caps.prefersReducedMotion) {
	timeline.pause();
}

const view = isMobileDevice(caps) ? 'mobile' : 'desktop';
```

- 在 UI hook 中，建議先讀 capability 再訂閱 resize 事件，避免不必要的重新渲染。
- 若需要觀測 viewport 變化，請監聽 `resize` 並在 handler 內呼叫 `refreshCapabilities({ window })`，最後再 emit 自訂事件，例如 `emit('viewport.changed', getViewport())`，以利模組解耦。
