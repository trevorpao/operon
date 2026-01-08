# Lib Reference

RefactorLib 重新整理 `app/scripts/lib/*`，確保所有共用工具：

- 以純函式或明確的 teardown 套件運作，可在 hooks/plugin 間重用。
- 具備 SSR/測試安全性，透過 `shared` guard 隔離 `window`/`document`。
- 有完整文件，方便依模組查找 API 與使用規範。

## 快速索引
| 模組 | 作用 | 代表 Exports |
| --- | --- | --- |
| [Shared Runtime Helpers](shared.md) | 取得 `window`/`document`、安全轉型 | `withBrowser`, `withDocument`, `toElements` |
| [Detect Capabilities](detect.md) | 裝置/偏好偵測與快取 | `getCapabilities`, `refreshCapabilities`, `isMobileDevice` |
| [Event Emitter](event.md) | Map-based 事件匯流排 | `createEmitter`, `on/off/once`, `emit`, `listenerCount` |
| [PostMessage Helpers](postmessage.md) | 跨視窗通訊與 schema 驗證 | `postMessage`, `receiveMessage`, `requestResponse` |
| [DOM Helpers](dom.md) | placeholder polyfill、class 操作、可視範圍 | `placeholder`, `alterClass`, `visible` |
| [Form Helpers](forms.md) | 表單序列化 | `serializeFormJSON` |
| [Number & Formatting](number.md) | 千分位/小數格式化 | `formatNum` |
| [Format Plugin](format.md) | Template helper DI 與 Handlebars 整合 | `createFormatHelper`, `registerTemplateHelpers`, `THUMBNAIL_PRESETS` |
| [Head Plugin / Analytics](head.md) | Modern/legacy 判斷與 GA 注入 | `requireModernBrowser`, `injectAnalytics`, `bootstrap` |

## 匯出矩陣
| 模組 | Default Export | Named Exports |
| --- | --- | --- |
| `shared.js` | — | `isBrowser`, `isSSR`, `toStringSafe`, `toNumberSafe`, `toNodes`, `toElements`, `toElement`, `ensureBrowser`, `withBrowser`, `withDocument`, `WHITESPACE_RE` |
| `detect.js` | `detect` | `getCapabilities`, `refreshCapabilities`, `isMobileDevice`, `hasTouchSupport`, `getViewport` |
| `event.js` | `emitter` | `createEmitter`, `on`, `off`, `once`, `emit`, `clear`, `listenerCount` |
| `event/emitter.js` | `createEmitter` | `createEmitter`, `isWildcardPattern`, `matchesTopic` |
| `postmessage.js` | `{ postMessage, receiveMessage, ... }` | `postMessage`, `receiveMessage`, `createMessageValidator`, `createMessageListener`, `requestResponse`, `parseMessageData` |
| `dom/placeholder.js` | — | `placeholder`, `supportsNativePlaceholder` |
| `dom/classList.js` | — | `alterClass`, `hasMutilClass`, `visible` |
| `forms/serialize.js` | — | `serializeFormJSON` |
| `number/format.js` | — | `formatNum` |
| `format.js` | `formatPlugin` | `createFormatHelper`, `registerTemplateHelpers`, `THUMBNAIL_PRESETS` |
| `head.js` | `headPlugin` | `requireModernBrowser`, `injectAnalytics`, `configureAnalytics`, `loadAnalyticsScript`, `bootstrap`, `isLegacyIE`, `resetState` |
| `runtime/deps.js` | `{ getGlobal, ... }` | `getGlobal`, `getWindow`, `getDocument`, `isBrowserEnv`, `resolveGee`, `resolveHandlebars`, `resolveMoment`, `resolveJQuery` |

> 若新增模組，請同步更新此表並於 docs/spec/Docute260108 的附錄記錄。

## 使用方式模板
建立新章節時請沿用下列骨架：

```markdown
# 模組名稱

> 1–2 句描述用途與注意事項。

## Export Surface
| Export | Signature | 說明 |
| --- | --- | --- |
| ... |

## Usage
- 說明場景與 teardown/SSR 流程。

```javascript
import { helper } from '../lib/module';

const dispose = helper();
return () => dispose();
```

## Testing / Fallback
- 紀錄 smoke 測試命令、`withBrowser` fallback、 legacy adapter 注意事項。
```

- 範例碼需使用 ESM import 並提供 teardown；若操作 DOM 請用 `withBrowser`/`withDocument` 包裹。
- 若模組尚在撰寫，請在標題下加上 `> TODO(Stage X)` 並於本 README 的「缺漏記錄」列出。

## 缺漏記錄 / 待辦
- 目前所有列出的模組皆已有文件；若新增模組請在此處列出 `- TODO: module (owner)` 並附上預定階段。
- Stage 2 的 `npm run lint` 仍受限於缺少 `eslint.config.js`；待工具鏈調整後需重新執行並更新 `docs/spec/Docute260108/check.md`。
