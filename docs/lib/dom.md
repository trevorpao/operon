# DOM Helpers

> DOM 模組建立在 `shared` guard 之上；任何需要直接觸控 `document` 的功能都應透過這裡提供的 helper，才能兼顧 SSR 與 teardown。

## Export Surface
| Export | Signature | 摘要 |
| --- | --- | --- |
| `placeholder` | `(elements) => () => void` | 為不支援原生 placeholder 的瀏覽器套用 polyfill，並回傳 teardown。|
| `supportsNativePlaceholder` | `() => boolean` | 快速檢測現有瀏覽器是否已內建 placeholder。|
| `alterClass` | `(elements, removals?, additions?) => void` | 批次新增/移除 class，支援 `*` wildcard。|
| `hasMutilClass` | `(element, "a|b" / "a&b") => boolean` | 判斷元素是否包含任一/全部指定 class。|
| `visible` | `(element, partial?) => boolean` | 檢查元素在視窗內是否可視；`partial=true` 允許只露出部分。|

## Placeholder Polyfill
- 當 `supportsNativePlaceholder()` 為 `false` 時，`placeholder()` 會：
  1. 讀取 `placeholder` 屬性；若無則跳過。
  2. 將文字填入 `value`，並把原字色記錄在 `data-placeholder-color`。
  3. 綁定 `focus`/`blur`，確保使用者輸入時清空。
- 回傳的函式會移除事件監聽、恢復文字顏色並清空暫存值。

```javascript
import { placeholder } from '../lib/dom/placeholder';
import registerHooks from '../lib/hooks/register';

registerHooks('contact.form', () => {
	const teardown = placeholder('#contactForm input[placeholder]');
	return () => teardown();
});
```

- 在 SSR 或測試中 `ensureBrowser()` 會返回 `false`，`placeholder()` 直接回傳 noop，無須額外判斷。

## Class Utilities
### `alterClass(elements, removals, additions)`
- `removals` 帶有 `*` 時會以正則方式移除所有符合 pattern 的 class，例如 `theme-*`。
- 透過 `toElements` 解析 selector、NodeList 或陣列，所以可以直接傳 `'.drawer'`。
- 使用建議：

```javascript
import { alterClass } from '../lib/dom/classList';

alterClass('body', 'state-*', 'state-loaded');
```

### `hasMutilClass(element, expr)`
- `expr` 支援 `|` (OR) 與 `&` (AND)。例如 `hasMutilClass(el, 'is-open|is-active')`。
- 回傳布林值，常用於條件渲染或測試。

## Visibility Checks
- `visible(element, partial = false)` 會先透過 `ensureBrowser()` 防止 SSR crash，再利用 `getBoundingClientRect()` 計算是否落在 viewport。
- `partial=true` 表示只要部分進入畫面即可，例如 lazy-load 情境。
- 典型應用：

```javascript
import { visible } from '../lib/dom/classList';

const maybeReveal = (el) => {
	if (visible(el, true)) {
		el.classList.add('reveal');
	}
};

const dispose = registerHooks('hero.observe', () => {
	const handler = () => document.querySelectorAll('.hero').forEach(maybeReveal);
	window.addEventListener('scroll', handler);
	handler();
	return () => window.removeEventListener('scroll', handler);
});
```

## Teardown / SSR 指引
- 所有 helper 皆依賴 `shared.toElements`/`ensureBrowser`，因此在 SSR 中皆為 no-op 或安全回傳。
- 初始化時請把解除函式交回外層 hook，例如：

```javascript
const disposables = [];
disposables.push(placeholder(inputs));
return () => disposables.forEach((fn) => fn && fn());
```

- 若模組需要重複套用 placeholder（例如 Ajax 更新列表），請在 re-render 前先呼叫舊的 teardown，避免事件堆疊。
