import { describe, expect, it, vi } from 'vitest';
import { menuTemplates } from '../../app/scripts/lib/ui';

describe('ui.menuTemplates', () => {
    it('caches templates and syncs app stores', () => {
        const templateCache = new Map();
        const appContext = { tmplStores: {} };
        const fn = () => 'tmpl';
        const cached = menuTemplates.cacheTemplate({
            templateCache,
            name: 'nav',
            fn,
            appContext,
        });
        expect(cached).toBe(fn);
        expect(templateCache.get('nav')).toBe(fn);
        expect(appContext.tmplStores.nav).toBe(fn);
    });

    it('registers DOM partials once per name', () => {
        const domPartialRegistry = new Set();
        const compiledFn = () => 'compiled';
        const handlebars = {
            compile: vi.fn(() => compiledFn),
            registerPartial: vi.fn(),
        };
        const nodes = [
            {
                getAttribute: (key) => (key === 'data-partial' ? 'partial-card' : ''),
                innerHTML: '<div>{{title}}</div>',
            },
        ];
        const documentRef = {
            querySelectorAll: vi.fn(() => nodes),
        };

        menuTemplates.registerDomPartials({
            documentRef,
            selector: 'script[type="text/x-handlebars-template"][data-partial]',
            handlebars,
            cacheTemplateFn: vi.fn(),
            domPartialRegistry,
        });

        expect(handlebars.compile).toHaveBeenCalledTimes(1);
        expect(handlebars.registerPartial).toHaveBeenCalledWith('partial-card', compiledFn);
        expect(domPartialRegistry.has('partial-card')).toBe(true);
    });

    it('resolves template from cache / app / window / DOM fallback', () => {
        const templateCache = new Map();
        const cachedFn = () => 'cached';
        templateCache.set('navbar', cachedFn);
        const fromCache = menuTemplates.resolveTemplate({
            templateName: 'navbar',
            templateCache,
            defaultName: 'navbar',
        });
        expect(fromCache).toBe(cachedFn);

        const appFn = () => 'app';
        const appContext = { tmplStores: { hero: appFn } };
        const fromApp = menuTemplates.resolveTemplate({
            templateName: 'hero',
            templateCache,
            defaultName: 'navbar',
            appContext,
            cacheTemplateFn: (name, fn) => {
                templateCache.set(name, fn);
                return fn;
            },
        });
        expect(fromApp).toBe(appFn);
        expect(templateCache.get('hero')).toBe(appFn);

        const handlebars = { compile: vi.fn(() => () => 'dom compiled') };
        const node = { innerHTML: '<section></section>' };
        const documentRef = {
            getElementById: vi.fn(() => node),
            querySelector: vi.fn(),
        };
        const domFn = menuTemplates.resolveTemplate({
            templateName: 'dom-nav',
            templateCache,
            defaultName: 'navbar',
            documentRef,
            handlebars,
            cacheTemplateFn: (name, fn) => {
                templateCache.set(name, fn);
                return fn;
            },
        });
        expect(typeof domFn).toBe('function');
        expect(handlebars.compile).toHaveBeenCalledWith('<section></section>');
    });

    it('merges helper bag preferring app helpers when provided', () => {
        const fallbackHelpers = { foo: () => 'fallback' };
        const appHelpers = { foo: () => 'app' };
        const selected = menuTemplates.mergeHelperBag({ appHelpers, fallbackHelpers });
        expect(selected).toBe(appHelpers);
        const fallbackSelected = menuTemplates.mergeHelperBag({ appHelpers: undefined, fallbackHelpers });
        expect(fallbackSelected).toBe(fallbackHelpers);
    });

    it('builds template context and preserves legacy items alias', () => {
        const context = menuTemplates.buildTemplateContext({
            menu: [{ title: 'foo' }],
            context: { extra: true },
        });
        expect(context.menu).toHaveLength(1);
        expect(context.items).toHaveLength(1);
        expect(context.extra).toBe(true);
    });
});
