# Validatr（純 JS 表單驗證）

本專案自帶的輕量驗證器，無需 jQuery。提供 `validateField`、`validateForm`、`attach` 三個主要 API，並保留簡易的全域相容層。

## 匯入與初始化
```html
<script type="module">
  import validatr from '../src/validatr.js';
  
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    // 即時驗證（失焦/變更/輸入）
    const detach = validatr.attach(form, {
      preventInvalid: true,
      onFieldValidate: ({ valid, errors, field }) => {
        // 可在此更新 UI，例如加上錯誤訊息或 class
        console.log(valid, errors, field.name);
      }
    });
    // 如不再需要可呼叫 detach()
  });
</script>
```

### 直接呼叫驗證
```javascript
import validatr from '../src/validatr.js';

const form = document.querySelector('form');
const ok = validatr.validateForm(form, {
  onValidate: ({ valid, errors }) => {
    if (!valid) console.warn(errors);
  }
});

const fieldResult = validatr.validateField(form.elements.email, {
  messages: { email: '請輸入有效的 Email' }
});
```

### 使用 data-error 覆蓋錯誤訊息
```html
<form>
  <input type="email" name="email" required data-error="請輸入有效的電子郵件" />
  <input type="number" name="age" min="18" data-error="年齡需滿 18" />
  <button type="submit">送出</button>
</form>

<script type="module">
  import validatr from '../src/validatr.js';
  const form = document.querySelector('form');
  form.addEventListener('submit', e => {
    if (!validatr.validateForm(form)) {
      e.preventDefault();
    }
  });
</script>
```

## 支援的 HTML 屬性
- `required`（含 checkbox / radio 群組、select）
- `type`: `email`, `url`, `number`
- `min` / `max`（適用 number）
- `pattern`
- `minlength` / `maxlength`

## 選項（Options）
- `messages`: 覆寫內建訊息，可為字串或函式（函式接受對應值並回傳字串）。
- `onFieldValidate(result)`: 單欄位驗證回呼，`result` 為 `{ valid, errors, field }`。
- `onValidate(result)`: 表單驗證回呼，`result` 為 `{ valid, errors }`。
- `preventInvalid`（預設 `true`）：在 `attach` 模式下，阻止無效輸入事件。
- `showFieldErrors`（預設 `true`）：自動在欄位下方插入 `.validatr-err`，使用 `errorTemplate` 呈現。
- `errorTemplate` / `errorClass`：自訂錯誤節點的 HTML 與 class，預設 `<div class="validatr-err">{{message}}</div>`。

## 回傳格式
- `validateField`：`{ valid: boolean, errors: Array<{ field, rule, message }>, field }`
- `validateForm`：`boolean`（同時可由 `onValidate` 取得詳細錯誤陣列）

## 新增自訂條件（SOP）
1. 匯入 `addRule` 並於初始化時註冊（跑一次即可）。
2. 在輸入欄位加上 `data-{規則名稱}` 以啟用該條件。
3. 覆蓋錯誤訊息可用 `data-error`（優先於內建/自訂訊息）。
4. 自訂規則簽章：`(field, options) => ({ valid: boolean, message: string })`。

### 範例：兩欄位一致（same）
```javascript
import validatr, { addRule } from '../src/validatr.js';

addRule('same', field => {
  const targetId = field.getAttribute('data-target');
  const target = targetId && document.querySelector(`#${targetId}`);
  const ok = target && field.value === target.value;
  return { valid: !!ok, message: '兩次輸入內容不一致' };
});

const form = document.querySelector('form');
form.addEventListener('submit', e => {
  if (!validatr.validateForm(form)) e.preventDefault();
});
```

```html
<input type="password" id="pwd" required />
<input type="password" id="pwd2" required data-same data-target="pwd" data-error="密碼與確認不一致" />
```

### 範例：密碼強度（允許非必填時留空）
```javascript
addRule('password', field => {
  const required = field.hasAttribute('required');
  const val = field.value.trim();
  if (!required && val === '') return { valid: true };
  const strong = /^(?=.*\d)(?=.*[a-zA-Z]){2,}(?=.*[a-zA-Z])(?!.*\s).{8,32}$/;
  return { valid: strong.test(val), message: '密碼最少須為八位英文數字組合' };
});
```

## 相容層
- 瀏覽器環境會掛載 `window.validatr`。
- 若有 `$`（例如 cash-dom），會掛 `window.$.validatr = validatr`，但不再提供舊版 `$.fn.validatr` 插件介面。

## 注意
- 已不含舊版自訂測試（如 `chinese`、`password` 等）；可用 `addRule` 自行擴充。
- 自動插入錯誤訊息採用 `.validatr-err` inline 節點，若要改樣式或位置可覆寫 `errorTemplate`/`errorClass` 或關閉 `showFieldErrors` 改用自訂 UI。
- 若專案仍有舊程式碼呼叫 `$.validatr.validateForm(form)`，請改為 `validatr.validateForm(form)`（已在 `gene.js` / `base.js` 調整）。
