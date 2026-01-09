import 'gene-event-handler';
import { createRuntime } from './lib/core/runtime';
import { createDomUtils } from './lib/dom/utils';
import { createValidation } from './lib/forms/validation';
import { createNet } from './lib/net/yell';
import { createMedia } from './lib/media/assets';
import { createFormat } from './lib/helpers/format';
import menuHelpers from './lib/helpers/menu';

const createApp = () => {
    const config = {
        baseUrl: window.apiUrl,
        detectWidth: 600,
    };

    const app = {
        pageCounter: 1,
        pageLimit: 8,
        fontSize: 1.25,
        redo: null,
        initModules: ['arena'],
        ifWebP: 1,
        thumbnail: {
            all_thn: [128, 128],
            default_thn: [300, 300],
            press_thn: [400, 225],
            product_thn: [400, 225]
        },
        plugins: new Map(),
        tmplStores: {},
        htmlStores: {},
        tmplPath: 'tmpls',
        cuVersion: '',
        onPreview: 0,
        errMsg: {
            'e9100': '資料庫發生錯誤',
            'e9101': '資料庫發生錯誤',
            'e9102': '資料庫發生錯誤',
            'e9103': '資料庫發生錯誤',
            'e8100': '請輸入必填欄位'
        },
    };

    const deps = { app, gee, config };

    Object.assign(app, createFormat(deps));
    Object.assign(app, createMedia(deps));
    Object.assign(app, createNet(deps));
    Object.assign(app, createValidation(deps));
    Object.assign(app, createDomUtils(deps));
    Object.assign(app, createRuntime(deps));

    return app;
};

const app = createApp();

if (typeof Handlebars !== 'undefined' && typeof Handlebars.registerHelper === 'function') {
    const helpersToRegister = { ...app.formatHelper, ...menuHelpers };
    Object.entries(helpersToRegister).forEach(function ([name, fn]) {
        Handlebars.registerHelper(name, fn);
    });
}

app.menuHelpers = menuHelpers;

export default app;
