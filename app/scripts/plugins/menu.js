import { createPlugin } from '../lib/defaultPlugin';
import menuHelpers from '../lib/helpers/menu';
import { menuData, menuTemplates } from '../lib/ui';

const MENU_ENDPOINT = 'menu_lotsMenu';
const DEFAULT_TIMEOUT = 3000;
const DEFAULT_TEMPLATE = 'navbar';

const hasWindow = typeof window !== 'undefined';
const hasDocument = typeof document !== 'undefined';

let warnedMissingDebug = false;

const resolveMode = (appContext) => {
    if (appContext && typeof appContext.debug === 'boolean') {
        return appContext.debug ? 'debug' : 'lite';
    }
    if (!warnedMissingDebug && typeof console !== 'undefined' && typeof console.warn === 'function') {
        console.warn('[menu] app.debug missing, defaulting to lite mode');
        warnedMissingDebug = true;
    }
    return 'lite';
};

const menuPlugin = createPlugin({
    name: 'data.menu',
    install({ app: ctxApp = {}, gee: ctxGee } = {}) {
        const yellFn = typeof ctxApp.yell === 'function'
            ? ctxApp.yell
            : (ctxGee && typeof ctxGee.yell === 'function' ? ctxGee.yell.bind(ctxGee) : null);

        if (!yellFn) {
            throw new Error('menu plugin requires app.yell or gee.yell');
        }

        const menuCache = new Map();
        const templateCache = new Map();
        const domPartialRegistry = new Set();

        const getRuntimeMode = () => resolveMode(ctxApp);

        const cacheTemplate = (name, fn) => {
            const mode = getRuntimeMode();
            if (mode === 'debug') {
                ctxApp.tmplStores = ctxApp.tmplStores || {};
            }
            return menuTemplates.cacheTemplate({
                name,
                fn,
                templateCache,
                appContext: mode === 'debug' ? ctxApp : null,
            });
        };

        const registerDomPartials = () => {
            if (getRuntimeMode() !== 'debug') {
                return;
            }
            menuTemplates.registerDomPartials({
                documentRef: hasDocument ? document : null,
                selector: 'script[type="text/x-handlebars-template"][data-partial]',
                handlebars: hasWindow ? window.Handlebars : null,
                cacheTemplateFn: cacheTemplate,
                domPartialRegistry,
            });
        };

        const resolveTemplate = (template) => menuTemplates.resolveTemplate({
            templateName: template,
            defaultName: DEFAULT_TEMPLATE,
            templateCache,
            appContext: getRuntimeMode() === 'debug' ? ctxApp : null,
            windowRef: hasWindow ? window : null,
            documentRef: hasDocument ? document : null,
            handlebars: hasWindow ? window.Handlebars : null,
            cacheTemplateFn: cacheTemplate,
        });

        const makePayload = (menuId, params = {}) => {
            const payload = {
                menuID: params.menuID || params.menuId || menuId || 1,
            };

            if (params.params && typeof params.params === 'object') {
                Object.assign(payload, params.params);
            }

            return payload;
        };

        const callApi = (menuId, options = {}) => {
            const payload = makePayload(menuId, options);

            const request = new Promise((resolve, reject) => {
                let settled = false;
                const resolveOnce = (value) => {
                    if (settled) return;
                    settled = true;
                    resolve(value);
                };
                const rejectOnce = (error) => {
                    if (settled) return;
                    settled = true;
                    reject(error);
                };

                const handler = function handler() {
                    if (!this || this.code !== 1) {
                        rejectOnce(new Error('menu request failed'));
                        return;
                    }
                    resolveOnce(this);
                };

                try {
                    yellFn(MENU_ENDPOINT, payload, handler);
                } catch (err) {
                    rejectOnce(err);
                }

                const { signal } = options;
                if (signal) {
                    if (signal.aborted) {
                        rejectOnce(new Error('menu request aborted'));
                    } else {
                        signal.addEventListener('abort', () => rejectOnce(new Error('menu request aborted')), { once: true });
                    }
                }
            });

            return menuData.withTimeout(request, options.timeout ?? DEFAULT_TIMEOUT);
        };

        const loadMenu = async (menuId, options = {}) => {
            const cacheKey = String(menuId || 'default');
            const useCache = options.cache !== false;
            return menuData.loadMenuWithCache({
                cacheKey,
                cacheMap: menuCache,
                useCache,
                loader: () => callApi(menuId, options),
                normalizer: menuData.normalizeMenuData,
            });
        };

        const render = async ({
            template = DEFAULT_TEMPLATE,
            menuId,
            menu,
            context = {},
            timeout = DEFAULT_TIMEOUT,
            signal,
            cache,
        } = {}) => {
            registerDomPartials();

            const templateFn = resolveTemplate(template);
            if (typeof templateFn !== 'function') {
                throw new Error(`menu template "${template}" not found`);
            }

            const menuPayload = Array.isArray(menu)
                ? menu
                : await loadMenu(menuId, { timeout, signal, cache });

            const templateContext = menuTemplates.buildTemplateContext({
                menu: menuPayload,
                context,
            });

            const helperBag = menuTemplates.mergeHelperBag({
                appHelpers: ctxApp && ctxApp.menuHelpers,
                fallbackHelpers: menuHelpers,
            });
            const html = templateFn(templateContext, { helpers: helperBag });

            return { html, menu: menuPayload };
        };

        const destroy = (target) => {
            if (!target) {
                menuCache.clear();
                templateCache.clear();
                return true;
            }

            const cacheKey = String(target);
            const removed = menuCache.delete(cacheKey);
            templateCache.delete(cacheKey);
            return removed;
        };

        return {
            api: {
                loadMenu,
                render,
                destroy,
            },
        };
    },
});

export default menuPlugin;
