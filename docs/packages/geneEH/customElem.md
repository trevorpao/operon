# customElem（自訂元素掛鉤）

`customElem` 是用來註冊並套用自訂元素處理器的輕量機制。常見場景：自動將 `<gee-upload>` 等自訂標籤轉換成實際 UI、模板渲染或行為掛鉤。它會避免重複處理，並支援 async handler（可回傳 Promise）。處理器僅需回傳「新的 HTML/節點」，實際的 replace/插入由 `customElem` 代勞。

## 使用方式
- 透過 `gene.customElem` 或 `gene.hookTag` / `gene.unhookTag` 使用；若已跑過 `gene.init()`，內部會自動呼叫 `gene.customElem.apply(...)`。
```javascript
import gene from '../src/gene.js';

gene.customElem.register('gee-hello', el => '<span>Hello!</span>');
// 或 gene.hookTag('gee-hello', fn)
```

## API
- `customElem.register(name, fn, opts?)`
  - `name`: 目標標籤名稱（字串，如 `gee-upload`）。
  - `fn(node)`: 處理函式，可回傳 **HTML 字串**、`Node`、`DocumentFragment` 或 Promise。預設會以回傳內容 **replace** 該節點。
  - `opts.overwrite`: `true` 時覆蓋同名 handler，預設不覆蓋。
  - `opts.mode`: 預設 `replace`，可選 `append` / `prepend` / `before` / `after` / `none`。
- `customElem.unregister(name)`: 移除 handler。（`gene.unhookTag` 也會委派到此）
- `customElem.apply(root?, { logger, debug }?)`: 對指定範圍套用所有已註冊的 handler。`root` 預設 `document`；`logger` 用於錯誤輸出；`debug` 開啟時會在 console.warn 顯示錯誤。
- `customElem.list()`: 取得已註冊標籤名稱陣列。

## 避免重複處理
每個元素會被標記 `data-gee-tagged-{name}="1"`，因此重複呼叫 `apply` 時不會再次處理同一元素。

## 基本範例
```javascript
customElem.register('gee-hello', el => '<span>Hello!</span>'); // 會自動 replace 原節點

// 任意時機套用（gene.init 也會自動套用）
customElem.apply(document.body);
```

## 取代原本的 hookTag
`gene.hookTag` / `gene.unhookTag` 已委派到 `customElem`：
```javascript
gene.hookTag('gee-hello', el => { /* ... */ });
gene.unhookTag('gee-hello');
```

## gee-upload 範例（含參數、模板字串）
```javascript
import gene from '../src/gene.js';
import utils from '../src/utils.js';

gene.customElem.register('gee-upload', (node) => {
  const attr = utils.extractAttr(node);
  const defaults = [
    ['module-name', (window.app && app.module && app.module.name) || ''],
    ['data-param', 'pic'],
    ['data-mode', 'pic'],
    ['info-text', '1200*800'],
    ['data-accepted', 'image/png, image/jpeg, image/gif']
  ];

  const params = Object.fromEntries(defaults.map(([k, v]) => [k, attr[k] || v]));

  // 簡易模板字串（可替換成 jsrender/handlebars 等）
  const html = `
    <div class="fuu img-${params['data-param']} is-clearfix">
      <div class="is-pulled-left field has-addons">
        <p class="control">
          <input type="text" name="${params['data-param']}" class="input fuu-filename" readonly="readonly" placeholder="${params['info-text']}">
        </p>
        <p class="control">
          <a class="button is-warning fuu-clear pre-gee" data-gene="click:clearFile" style="display:none;">Clear</a>
        </p>
        <div class="button is-expanded fuu-input">
          <span class="glyphicon glyphicon-folder-open"></span>
          <span class="fuu-input-btn">Browse</span>
          <input type="file" accept="${params['data-accepted']}" class="pre-gee" data-gene="change:passFile" />
        </div>
        <p class="control">
          <a class="button is-success fuu-upload pre-gee" data-gene="click:upload" data-module="${params['module-name']}" data-mode="${params['data-mode']}" style="display:none;">Upload</a>
        </p>
      </div>
      ${params['data-mode'] === 'pic' ? `<a class="link" target="_blank"><figure class="image is-96x96 is-pulled-right" style="margin-top: -36px;"><img src=""></figure></a>` : ''}
    </div>
  `;

  return html; // customElem 預設 replace 原節點
});
```

## 提示
- 若 handler 可能丟出錯誤，建議自行 try/catch；內部也會捕捉並透過 `logger`/`console.warn`（debug 模式）輸出。
- 若需要 async 流程（例如載入模板），可回傳 Promise，customElem 會捕捉拒絕並透過 logger 報告。
- 若不想替換節點，可將 `opts.mode` 設為 `append`/`prepend`/`before`/`after`/`none`。
