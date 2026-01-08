# Form Helpers

> 專案目前僅提供 `serializeFormJSON`，但它已涵蓋 90% 表單提交需求；若需要自訂驗證，請搭配瀏覽器原生 `reportValidity()` 或 hooks。

## Export Surface
| Export | Signature | 摘要 |
| --- | --- | --- |
| `serializeFormJSON` | `(HTMLFormElement) => Record<string, string|string[]>` | 使用 `FormData` 讀取欄位並輸出 JSON 物件，重複欄位會轉成陣列。|

## 輸入條件
- 僅接受 `HTMLFormElement`，建議傳入 `document.querySelector('form[name="contact"]')` 或事件目標 `event.currentTarget`。
- 會呼叫 `ensureBrowser()`，若在 SSR/測試環境中會回傳空物件。
- 對於 `disabled` 欄位及沒有 `name` 的元素會依 `FormData` 規則自動略過。

## 回傳結構
- 單一欄位：`{ email: 'foo@bar.com' }`
- 多選欄位（checkbox / multi-select）：`{ tags: ['foo', 'bar'] }`
- 空值會被轉成空字串，避免後端收到 `null`。

## Submit 範例

```javascript
import { serializeFormJSON } from '../lib/forms/serialize';

const handleSubmit = (event) => {
	event.preventDefault();
	const form = event.currentTarget;
	if (!form.reportValidity()) return;

	const payload = serializeFormJSON(form);
	api.post('/contact', payload)
		.then(() => toast.success('送出成功'))
		.catch((err) => toast.error(err.message));
};

document.querySelector('#contactForm').addEventListener('submit', handleSubmit);
```

- 透過 `reportValidity()` 可沿用瀏覽器內建驗證 UI；若需要自訂錯誤展示，可在 `catch` 內根據後端錯誤回填欄位。

## SSR / 測試策略
- 由於 `FormData` 需要 DOM，請在 SSR 路徑中提前短路，或將序列化延後到瀏覽器端。
- 單元測試可在 `jsdom` 中建立 form 元素：

```javascript
const form = document.createElement('form');
const input = document.createElement('input');
input.name = 'title';
input.value = 'Operon';
form.appendChild(input);

expect(serializeFormJSON(form)).toEqual({ title: 'Operon' });
```

## 常見問題
- **多語系輸入**：`FormData` 會保留原始字串，後端需以 UTF-8 解碼。
- **檔案欄位**：目前 helper 會回傳 `File` 物件，若需上傳請直接傳回 `FormData` 或新增額外 helper。
- **Legacy jQuery**：專案過去使用 `$(form).serializeArray()`，現在請改用 `serializeFormJSON` 以移除 jQuery 依賴。
