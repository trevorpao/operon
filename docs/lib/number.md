# Number & Formatting Helpers

> 數值格式化在多個模組共用；此檔案提供純函式 `formatNum` 的參數解說與最佳實務。

## Export Surface
| Export | Signature | 摘要 |
| --- | --- | --- |
| `formatNum` | `(value, decimals=2, decimal='.', thousands=',', signMode?) => string` | 以千分位、固定小數輸出數字；基於 `shared.toNumberSafe`。|

## 參數說明
- `value`：任何可轉為數字的輸入，會透過 `toNumberSafe` 處理，失敗時回傳 `0`。
- `decimals (c)`：欲保留的小數位數，預設 2。
- `decimal (d)`：小數點字元，預設 `.`。
- `thousands (t)`：千分位分隔符，預設 `,`。
- `signMode (s)`：若為 `1` 則移除負號，其餘值沿用原本正負號。

## 使用範例

```javascript
import { formatNum } from '../lib/number/format';

formatNum(12345.678);           // '12,345.68'
formatNum('987654', 0, '.', ' '); // '987 654'
formatNum(-50, 2, ',', '.', 1);   // '50,00'  (強制正號)
```

- 如需百分比，可搭配 `shared.toNumberSafe` 或 Format plugin 的 `percent` helper，以免重覆計算。

## Locale / i18n 提示
- `formatNum` 不會根據使用者語系自動調整；若需 locale-aware 格式請改用瀏覽器 `Intl.NumberFormat` 或在外層包裝。
- 千分位與小數字元可依語系覆寫，例如法文 `formatNum(value, 2, ',', ' ')`。

## 與 Format Plugin 的關係
- Format plugin 內部仍會呼叫 `formatNum` 來呈現金額；若想客製化格式，建議在 plugin 初始化時替換 `app.tmplHelpers.currency` 或注入新的 helper，而非修改這個底層函式。

## 測試與邊界
- `formatNum` 屬純函式，不依賴 DOM；單元測試可直接呼叫。
- 注意 `signMode=1` 僅去除負號，不會加上 `+`，若需要顯示正號可額外串接。
- 大數（> Number.MAX_SAFE_INTEGER）仍會因 `Number` 精度受限，若需要任意精度請改用 BigInt 或其他函式庫。
