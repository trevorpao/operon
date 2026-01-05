
## 目標
- 將 app/modules 重構為「可安裝的 plugins + DOM hooks」模式，保留 gee.hook 行為並降低全域耦合。
- 提供可漸進採用的插件介面，讓純邏輯與 DOM 行為可拆測、易注入（追蹤、通知、驗證等）。

## 範圍
- app.js 提供 plugin registry 與基礎 lifecycle 呼叫（init/destroy），保留 ES module 單例輸出。
- modules 拆為兩層：`plugins/`（純邏輯或資料 API）與 `hooks/`（gee.hook 綁定與 DOM 事件）。
- 首波鎖定較純邏輯或輕 DOM 的模組（如 track、format/helper 類），再逐步處理 DOM-heavy（arena/resource/menu）。

## 風險
- lifecycle 漏控：若 hooks 未在 gee.init 後註冊或未提供 teardown，可能重複綁定、殘留事件。
- API 演進成本：plugin API 變更需同步 hooks；缺少 version/interface guard 時易破壞相容。
- async 併發：模板/資料 fetch 需序列化 install；若 use 不支援 async 會造成 race。
- 命名衝突：未命名空間化的 plugin key 可能撞名；$ 前綴與舊 jQuery 風格易混淆。
- 打包/路徑：Vite alias 或 geneEH 掃描若未更新，可能找不到 hooks 或導致 dead code。

## 依賴
- gee/geneEH lifecycle：需取得 gee.ready 後再註冊 hooks。
- app.js ESM 單例、config（環境、路徑、模板來源）。
- 未來模板載入（Handlebars/fetch）與資料存取（localforage/REST）。

## 討論重點
- install 簽名：`install({app, gee, config})` 是否允許 async，回傳結構 `{ api, init?, destroy? }`。
- 命名規則：`app.plugins['namespace.name']` vs 簡名；是否保留 getter 語法糖。
- hooks lifecycle：何時註冊/卸載，如何避免重複 init；多次導航或 partial render 時的策略。
- 依賴方向：plugins → hooks 單向；禁止 hooks 被 plugins 反向引用。
- 索引/映射：需要 plugin ↔ hook 對照表與 readme/索引文件。

## 規格草稿
- app
  - `use(plugin)` 接受具 `name` 與 `install(ctx)` 的物件，支援 Promise；防重複註冊。
  - `plugins` 為公開 registry：`app.plugins[key] = api`；建議 key 採 namespace（如 `data.resource`）。
- plugin（純邏輯層）
  - 無 DOM，僅處理資料/計算/狀態；可提供 `init`（可選 async）與 `destroy`，暴露 `api`。
  - 可依賴 config、fetch、storage，但不可引用 hooks。
- hook（行為掛鉤層）
  - 專責 DOM 綁定與 `gee.hook` 註冊；接收 plugin api；提供 `init`/`destroy` 以支援重掛。
- 檔案佈局
  - `app/plugins/<name>.js`：匯出 plugin 物件或 factory。
  - `app/hooks/<name>.js`：註冊對應 gene 行為，import 需要的 plugin api。
  - 保持索引文件列出可用 plugin/hook 與依賴。
- 遷移策略
  - Phase 1：抽離 track/format helper 為 plugins，提供最小 hooks；驗證 async use。
  - Phase 2：逐步拆 DOM-heavy modules，補上 teardown；更新 gene 標記與測試。

## 範例

```js
class App {
    constructor({ gee, config }) {
        this.gee = gee;
        this.config = config;
        this.plugins = new Map();
    }

    async use(plugin) {
        if (!plugin || typeof plugin.install !== 'function' || !plugin.name) {
            throw new Error('Plugin must have name and install(ctx)');
        }
        if (this.plugins.has(plugin.name)) {
            throw new Error(`Plugin "${plugin.name}" already installed`);
        }

        const ctx = { app: this, gee: this.gee, config: this.config };
        const { api, init, destroy } = await Promise.resolve(plugin.install(ctx));
        this.plugins.set(plugin.name, { api, init, destroy });
        if (typeof init === 'function') {
            await init();
        }
        return api;
    }

    get(name) {
        const entry = this.plugins.get(name);
        if (!entry) throw new Error(`Plugin "${name}" not found`);
        return entry.api;
    }

    async destroy(name) {
        const entry = this.plugins.get(name);
        if (!entry) return;
        if (typeof entry.destroy === 'function') {
            await entry.destroy();
        }
        this.plugins.delete(name);
    }
}

// plugin：無 DOM，提供 API，可選 init/destroy
const greetPlugin = {
    name: 'util.greet',
    async install() {
        const api = {
            hello(who = 'World') {
                console.log(`Hello, ${who}!`);
            },
            goodbye(who = 'World') {
                console.log(`Goodbye, ${who}!`);
            },
        };
        return { api };
    },
};

// hook：綁定 DOM/gene，使用 plugin API，提供 teardown
function greetHook({ gee, app }) {
    const api = app.get('util.greet');
    const unbind = gee.hook('greet-btn', (el) => {
        el.addEventListener('click', () => api.hello(el.dataset.name));
    });
    return () => {
        unbind();
    };
}

async function bootstrap({ gee, config }) {
    const app = new App({ gee, config });
    await app.use(greetPlugin);

    // 確保在 gee.ready 之後註冊 hooks，並保留 teardown
    const teardownGreet = greetHook({ gee, app });

    // ...其他 hooks
    return () => {
        teardownGreet();
    };
}
```