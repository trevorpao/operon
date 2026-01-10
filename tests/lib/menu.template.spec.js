import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Handlebars from 'handlebars';
import menuHelpers from '../../app/scripts/lib/helpers/menu.js';
import menuPlugin from '../../app/scripts/plugins/menu.js';

const rootDir = resolve(__dirname, '../../');

const loadFile = (relativePath) => readFileSync(resolve(rootDir, relativePath), 'utf8');

const registerMenuPartials = () => {
    const partials = ['menuItem', 'menuList', 'navbar'];
    partials.forEach((partial) => {
        const source = loadFile(`app/themes/default/partials/${partial}.hbs`);
        Handlebars.registerPartial(partial, source);
    });
};

beforeAll(() => {
    Object.entries(menuHelpers).forEach(([name, fn]) => {
        Handlebars.registerHelper(name, fn);
    });
    registerMenuPartials();
});

describe('mvJsRender Handlebars templates', () => {
    it('renders navbar snapshot with mock menu data', () => {
        const tmpl = Handlebars.compile(loadFile('app/themes/default/partials/navbar.hbs'));
        const payload = JSON.parse(loadFile('app/mock/api/menu_lotsMenu.json'));
        const menu = Array.isArray(payload.data) ? payload.data : [];
        const html = tmpl({
            menu,
            ariaLabel: '主導航',
            brandLabel: 'Menu',
            brandHref: '/',
            burgerTarget: 'navbar-menu-1',
        });
        expect(html).toMatchSnapshot();
    });
});

const installMenuPlugin = async (debug) => {
    const ctxApp = {
        debug,
        yell: vi.fn(),
    };
    const ctxGee = {
        yell: vi.fn(),
    };
    const { api } = await menuPlugin.install({ app: ctxApp, gee: ctxGee });
    return { ctxApp, pluginApi: api };
};

describe('menu plugin mode gating', () => {
    let querySpy;
    let originalHandlebars;

    beforeEach(() => {
        const partialNode = {
            getAttribute: vi.fn((name) => (name === 'data-partial' ? 'navbarPartial' : null)),
            innerHTML: '<div>partial</div>',
        };
        querySpy = vi.spyOn(document, 'querySelectorAll').mockReturnValue([partialNode]);
        originalHandlebars = window.Handlebars;
        window.Handlebars = {
            compile: vi.fn(() => vi.fn()),
            registerPartial: vi.fn(),
        };
        window.templates = {
            navbar: vi.fn(() => '<nav></nav>'),
        };
    });

    afterEach(() => {
        querySpy.mockRestore();
        if (originalHandlebars) {
            window.Handlebars = originalHandlebars;
        } else {
            delete window.Handlebars;
        }
        delete window.templates;
        vi.restoreAllMocks();
    });

    it('registers DOM partials only when debug mode is enabled', async () => {
        const { pluginApi: debugApi } = await installMenuPlugin(true);
        await debugApi.render({ template: 'navbar', menu: [] });
        expect(window.Handlebars.compile).toHaveBeenCalledTimes(1);
        expect(window.Handlebars.registerPartial).toHaveBeenCalledTimes(1);
        expect(querySpy).toHaveBeenCalledTimes(1);

        window.Handlebars.compile.mockClear();
        window.Handlebars.registerPartial.mockClear();
        querySpy.mockClear();

        const { pluginApi: liteApi } = await installMenuPlugin(false);
        await liteApi.render({ template: 'navbar', menu: [] });
        expect(window.Handlebars.compile).not.toHaveBeenCalled();
        expect(window.Handlebars.registerPartial).not.toHaveBeenCalled();
        expect(querySpy).not.toHaveBeenCalled();
    });

    it('stores SSR template context only in debug mode', async () => {
        const { pluginApi: debugApi, ctxApp: debugApp } = await installMenuPlugin(true);
        await debugApi.render({ template: 'navbar', menu: [] });
        expect(debugApp.tmplStores && typeof debugApp.tmplStores.navbar).toBe('function');

        const { pluginApi: liteApi, ctxApp: liteApp } = await installMenuPlugin(false);
        await liteApi.render({ template: 'navbar', menu: [] });
        expect(liteApp.tmplStores).toBeUndefined();
    });
});
