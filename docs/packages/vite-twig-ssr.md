<h1 align="center">vite-twig-ssr</h1>

<p align="center">
    Vite dev-server plugin that renders Twig templates with Twig.js, auto-maps JSON mock data, and keeps PHP-compatible views in sync with HMR.
</p>

## 功能總覽

- **PHP 後端相容**：開發用 Vite + Twig.js，佈署仍交給 PHP/Twig，模板不需分叉。
- **自動 Mock 綁定**：請求 `src/views/foo.twig` 時，會找 `mock/foo.json` 並注入為 context。
- **雙重 HMR**：改 `.twig` 或對應 `.json` 立即重新渲染並全頁更新，迴圈 < 50ms。
- **錯誤可視化**：Twig/JSON 失敗時推送 Vite Error Overlay，頁面同時輸出 500 示意。

## 安裝需求

- Node.js >= 20
- NPM/Yarn/Pnpm 皆可，本範例以 npm 為例。

## 安裝

```bash
npm install --save-dev vite-twig-ssr
```

## 最小設定示例

```js
// vite.config.js / .ts
import { defineConfig } from 'vite';
import viteTwig from 'vite-twig-ssr';

export default defineConfig({
    plugins: [
        viteTwig({
            viewsPath: './src/views',   // Twig 根目錄
            mockPath: './mock',         // JSON 假資料目錄
            globalData: {
                main_domain: 'f3cms.com',
                opts: {
                    default: {
                        contact_mail: 'design-system@example.com',
                    },
                },
            },
            filters: {
                headline: (value) => String(value || '').toUpperCase(),
            },
            functions: {
                asset: (value) => `/assets/${value}`,
            },
        }),
    ],
    server: {
        open: '/views/index.twig', // 直接開啟 Twig 入口頁
    },
});
```

啟動 `npm run dev` 後，造訪 `http://localhost:5173/views/index.twig`；plugin 會攔截 `.twig` 請求、套用 JSON 假資料並回傳 HTML，Vite 的 `<script type="module">` 正常運作。

## Mock 映射規則

| Twig 檔案 | Mock 檔案 | 行為 |
|-----------|-----------|------|
| `src/views/about.twig` | `mock/about.json` | 自動讀取 JSON 作為 context |
| `src/views/landings/home.twig` | `mock/landings/home.json` | 巢狀路徑同名映射 |

- `allowMissingMock: true`（預設）時，缺少對應 JSON 會注入空物件並合併 `globalData`。
- 設為 `false` 時，缺少 JSON 會直接拋錯，確保資料契約被滿足。

## 自訂 Filters / Functions

vite-twig-ssr 會將 `filters`、`functions` 註冊到 Twig.js，接受物件或陣列形式：

```js
filters: {
    currency: (value) => new Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'USD'
    }).format(value)
}
```

```js
functions: [
    {
        name: 'asset',
        func: (value) => `/static/${value}`,
    }
]
```

## 體驗細節

- **HMR for Twig + JSON**：監控 `viewsPath` 與 `mockPath`，任一檔案異動都觸發 full reload。
- **錯誤疊加層**：Twig 渲染或 JSON 解析失敗時推送 overlay，並在頁面輸出 500 頁示意。
- **`_file` / `_target` metadata**：自動注入檔案資訊，方便在 UI 中標示來源。
- **`feVersion` 注入**：預設為 `process.env.FE_VERSION || package.json version || 'dev'`。

## Options 一覽

| 名稱 | 型別 / 預設 | 說明 |
|------|-------------|------|
| `viewsPath` | `string` (`'src'`) | Twig 模板根目錄，支援絕對路徑 |
| `mockPath` | `string` (`'mock'`) | JSON 假資料根目錄 |
| `globalData` | `object` | 任何頁面都會被注入的共用資料 |
| `filters` | `object` \| `array` | Twig filters 定義 |
| `functions` | `object` \| `array` | Twig functions 定義 |
| `namespaces` | `Record<string,string>` | Twig namespace 對應根路徑 |
| `allowMissingMock` | `boolean` (`true`) | 缺少同名 JSON 時是否容忍 |
| `base` | `string` | Twig.js `base` 選項，用於覆寫 extends/include 搜尋路徑 |
| `debug` / `trace` | `boolean` | 透傳至 Twig.js |
| `extend` | `function (Twig)` | 直接擴充 Twig.js（自訂 tag 等） |

## 範例專案（example/）

- 展示 JSON Mock (`example/mock/index.json`)
- Twig extends/include + components（含 `components/navbar.twig`）
- `<script type="module" src="/src/main.js">` 可正常運作

啟動：

```bash
npm run example:dev
# 開啟 http://localhost:5173/views/index.twig
```

## 開發腳本

```bash
npm run lint   # ESLint (Node + browser overrides)
npm test       # Mocha 渲染器單元測試
```

測試重點：模板/JSON/global data 合併、自訂 filter/function 註冊、JSON 解析與缺漏錯誤訊息。

## 授權

[MIT](./LICENSE)

