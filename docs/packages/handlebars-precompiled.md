
這是一個整合了 **Vite**、**Bulma (綠色系主題)**、**Handlebars.js (符合 CSP 安全規範)** 以及 **geneEH (行為驅動邏輯)** 的完整初始化開發範例。

此架構特別針對現代安全標準進行優化，透過預編譯模板解決 **Content Security Policy (CSP)** 的 `unsafe-eval` 問題。

### 1. 建立專案與安裝依賴
首先，初始化 Vite 的純 JavaScript 環境並安裝所有必要套件：

```bash
# 建立專案
npm create vite@latest sms-green-platform -- --template vanilla
cd sms-green-platform

# 安裝核心套件
npm install bulma jquery handlebars

# 安裝開發工具
# 使用 vite-plugin-handlebars 處理模板預編譯
npm install -D sass vite-plugin-handlebars
```

### 2. 配置 Vite (`vite.config.js`)
此配置能自動處理 Handlebars 模板的預編譯，使其在瀏覽器執行時無需呼叫 `eval()`，從而符合 CSP 安全規範。

```javascript
import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    handlebars({
      // 設定 partials 目錄，自動將 HTML 拆解為組件
      partialDirectory: resolve(__dirname, 'src/partials'),
      // 定義靜態編譯時的資料
      context: {
        title: '綠色系簡訊發送系統',
      }
    }),
  ],
});
```

### 3. 自定義綠色系主題 (`src/style.scss`)
利用 Bulma 的 Sass 變數覆寫機制，將主色調調整為綠色，並加入 geneEH 所需的防閃爍樣式。

```scss
// 1. 定義綠色系變數
$green-primary: #23d160; 
$green-dark: #1e8449;

// 2. 透過 @use 注入變數並引入 Bulma
@use "bulma/sass" with (
  $primary: $green-primary,
  $link: $green-dark,
  $family-primary: '"Noto Sans TC", sans-serif'
);

// 3. geneEH 必要設定：防止 JavaScript 載入前的元件閃爍
.gee { 
  display: none; 
}
```

### 4. 建立 Handlebars 組件 (`src/partials/sms-form.hbs`)
在模板中直接使用 `gee` 標記與 `data-gene` 屬性來宣告元素的「生物行為」。

```html
<div class="box has-background-light gee" data-gene="initForm">
  <h3 class="title is-4 has-text-primary">發送新簡訊</h3>
  <div class="field">
    <div class="control">
      <textarea id="sms-msg" class="textarea" placeholder="輸入訊息內容..."></textarea>
    </div>
  </div>
  
  <!-- 宣告此按鈕具備 sendAction 基因行為 -->
  <button class="button is-primary is-fullwidth gee" data-gene="sendAction">
    <strong>立即發送</strong>
  </button>
</div>
```

### 5. 整合主程式邏輯 (`main.js`)
此處採用 **Handlebars Runtime** 模式以符合 CSP 安全標準，並啟動 **geneEH** 生命引擎。

```javascript
import gee from 'gene-event-handler'; // ES module 版本
import './src/style.scss';
import Handlebars from 'handlebars/runtime'; // 僅引入 Runtime 以符合 CSP

// 1. 註冊行為基因 (Hooks)
gee.hook('sendAction', (el) => {
  const btn = el;
  const msg = document.getElementById('sms-msg').value;
  if (!msg) {
    alert('內容不可為空！');
    return;
  }
  btn.classList.add('is-loading');
  setTimeout(() => {
    btn.classList.remove('is-loading');
    alert('簡訊發送成功！內容：' + msg);
  }, 1000);
});

gee.hook('initForm', (el) => {
  console.log('簡訊發送元件初始化完畢');
});

// 2. 生命引擎初始化
document.addEventListener('DOMContentLoaded', () => {
  gee.init(); // 掃描 gee 元素並執行對應基因
});
```

### 為什麼這是一個理想的初始化範例？
1.  **安全性 (CSP Compliance)**：透過 Vite 插件進行預編譯並只使用 **Handlebars Runtime**，徹底避免了因 `unsafe-eval` 導致的安全錯誤。
2.  **效能領先**：**Bulma** 是純 CSS 框架，不含額外 JavaScript 負擔；**Vite** 提供極速的 HMR 更新。
3.  **邏輯解耦 (geneEH)**：您不再需要寫繁瑣的 `$('.btn').on('click', ...)`，只需在 HTML 標記行為基因，讓程式碼更像是一份功能清單而非雜亂的腳本。
4.  **品牌一致性**：透過 **Sass 變數注入**，整個平台從按鈕到載入條都會呈現統一的綠色系視覺。

---

**類比理解：**
這套配置就像是在**建造一間具備自動化本能的綠色實驗室**。**Vite** 是高效的自動化流水線；**Bulma** 是漆成綠色的標準化牆板（視覺）；**Handlebars (CSP 版)** 是預先印好的安全操作手冊（結構）；而 **geneEH** 則是注入牆板中的 **DNA**，讓每個開關（元素）在通電後（`gee.init()`）就自然知道自己的職責，無需工程師跑遍現場去一個個手動撥動。
