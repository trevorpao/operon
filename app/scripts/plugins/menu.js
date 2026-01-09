import { createPlugin } from '../lib/defaultPlugin';
import menuHelpers from '../lib/helpers/menu';

const MENU_ENDPOINT = 'menu_lotsMenu';
const DEFAULT_TIMEOUT = 3000;
const DEFAULT_TEMPLATE = 'navbar';

const hasWindow = typeof window !== 'undefined';
const hasDocument = typeof document !== 'undefined';

const toArray = (value) => (Array.isArray(value) ? value : []);

const normalizeNode = (node) => {
    if (!node || typeof node !== 'object') return null;
    const rows = toArray(node.rows || node.children);
    const normalizedRows = rows
        .map((child) => normalizeNode(child))
        .filter(Boolean);

    return {
        ...node,
        rows: normalizedRows,
    };
};

const normalizeMenuData = (payload) => {
    if (!payload) return [];
    if (Array.isArray(payload)) {
        return payload.map((item) => normalizeNode(item)).filter(Boolean);
    }
    if (Array.isArray(payload.data)) {
        return payload.data.map((item) => normalizeNode(item)).filter(Boolean);
    }
    if (payload.data && Array.isArray(payload.data.data)) {
        return payload.data.data.map((item) => normalizeNode(item)).filter(Boolean);
    }
    return [];
};

const withTimeout = (promise, timeout = DEFAULT_TIMEOUT, message = 'menu request timed out') => {
    if (!timeout || Number(timeout) <= 0) {
        return promise;
    }

    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(message));
        }, timeout);

        promise
            .then((value) => {
                clearTimeout(timer);
                resolve(value);
            })
            .catch((error) => {
                clearTimeout(timer);
                reject(error);
            });
    });
};

const menuPlugin = createPlugin({
    name: 'data.menu',
    install({ app: ctxApp, gee: ctxGee }) {
        const yellFn = (ctxApp && typeof ctxApp.yell === 'function')
            ? ctxApp.yell
            : (ctxGee && typeof ctxGee.yell === 'function' ? ctxGee.yell.bind(ctxGee) : null);

        if (!yellFn) {
            throw new Error('menu plugin requires app.yell or gee.yell');
        }

        const menuCache = new Map();
        const templateCache = new Map();
        const domPartialRegistry = new Set();

        const cacheTemplate = (name, fn) => {
            if (!name || typeof fn !== 'function') return fn;
            templateCache.set(name, fn);
            if (ctxApp && ctxApp.tmplStores) {
                ctxApp.tmplStores[name] = fn;
            }
            return fn;
        };

        const registerDomPartials = () => {
            if (!hasDocument || !hasWindow) {
                return;
            }
            const handlebars = window.Handlebars;
            if (!handlebars || typeof handlebars.compile !== 'function' || typeof handlebars.registerPartial !== 'function') {
                return;
            }

            const nodes = document.querySelectorAll('script[type="text/x-handlebars-template"][data-partial]');
            nodes.forEach((node) => {
                const partialName = node.getAttribute('data-partial') || node.getAttribute('id');
                if (!partialName || domPartialRegistry.has(partialName)) {
                    return;
                }
                const compiled = handlebars.compile(node.innerHTML || '');
                cacheTemplate(partialName, compiled);
                handlebars.registerPartial(partialName, compiled);
                domPartialRegistry.add(partialName);
            });
        };

        const resolveTemplate = (template) => {
            if (typeof template === 'function') {
                return template;
            }

            const name = (template || DEFAULT_TEMPLATE).trim();
            if (!name) return null;

            if (templateCache.has(name)) {
                return templateCache.get(name);
            }

            if (ctxApp && ctxApp.tmplStores && typeof ctxApp.tmplStores[name] === 'function') {
                return cacheTemplate(name, ctxApp.tmplStores[name]);
            }

            if (hasWindow && window.templates && typeof window.templates[name] === 'function') {
                return cacheTemplate(name, window.templates[name]);
            }

            if (hasDocument) {
                const node = document.getElementById(name) || document.querySelector(`[data-template="${name}"]`);
                if (node && hasWindow && window.Handlebars && typeof window.Handlebars.compile === 'function') {
                    const compiled = window.Handlebars.compile(node.innerHTML || '');
                    return cacheTemplate(name, compiled);
                }
            }

            return null;
        };

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

            return withTimeout(request, options.timeout ?? DEFAULT_TIMEOUT);
        };

        const loadMenu = async (menuId, options = {}) => {
            const cacheKey = String(menuId || 'default');
            const useCache = options.cache !== false;

            if (useCache && menuCache.has(cacheKey)) {
                return menuCache.get(cacheKey).data;
            }

            const response = await callApi(menuId, options);
            const menu = normalizeMenuData(response);

            if (useCache) {
                menuCache.set(cacheKey, { data: menu, fetchedAt: Date.now() });
            }

            return menu;
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

            const menuData = Array.isArray(menu)
                ? menu
                : await loadMenu(menuId, { timeout, signal, cache });

            const templateContext = {
                menu: menuData,
                ...context,
            };

            if (typeof templateContext.items === 'undefined') {
                // Keep legacy templates that expect `items` instead of `menu` working.
                templateContext.items = menuData;
            }

            const helperBag = (ctxApp && ctxApp.menuHelpers) || menuHelpers;
            const html = templateFn(templateContext, { helpers: helperBag });

            return { html, menu: menuData };
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
