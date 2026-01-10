const toArray = (value) => {
    if (Array.isArray(value)) {
        return value;
    }
    if (typeof value === 'undefined' || value === null) {
        return [];
    }
    return [value];
};

const normalizeNode = (node) => {
    if (!node || typeof node !== 'object') {
        return null;
    }
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
    if (!payload) {
        return [];
    }
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

const withTimeout = (promise, timeout = 0, message = 'menu request timed out') => {
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

const validateSchema = (menu) => Array.isArray(menu);

const loadMenuWithCache = async ({
    cacheKey = 'default',
    cacheMap = new Map(),
    useCache = true,
    loader,
    normalizer = normalizeMenuData,
}) => {
    if (useCache && cacheMap.has(cacheKey)) {
        return cacheMap.get(cacheKey).data;
    }
    if (typeof loader !== 'function') {
        throw new Error('menuData.loadMenuWithCache requires loader');
    }

    const response = await loader();
    const menu = normalizer(response);

    if (useCache) {
        cacheMap.set(cacheKey, { data: menu, fetchedAt: Date.now() });
    }

    return menu;
};

const menuData = Object.freeze({
    toArray,
    normalizeNode,
    normalizeMenuData,
    withTimeout,
    loadMenuWithCache,
    validateSchema,
});

const cacheTemplate = ({ templateCache, name, fn, appContext }) => {
    if (!name || typeof fn !== 'function') {
        return fn;
    }
    if (templateCache) {
        templateCache.set(name, fn);
    }
    if (appContext && appContext.tmplStores) {
        appContext.tmplStores[name] = fn;
    }
    return fn;
};

const registerDomPartials = ({
    documentRef,
    selector = 'script[type="text/x-handlebars-template"][data-partial]',
    handlebars,
    cacheTemplateFn,
    domPartialRegistry,
}) => {
    if (!documentRef || !handlebars || typeof handlebars.compile !== 'function' || typeof handlebars.registerPartial !== 'function') {
        return;
    }

    const nodes = documentRef.querySelectorAll ? documentRef.querySelectorAll(selector) : [];
    nodes.forEach((node) => {
        const partialName = node.getAttribute?.('data-partial') || node.getAttribute?.('id');
        if (!partialName || (domPartialRegistry && domPartialRegistry.has(partialName))) {
            return;
        }
        const compiled = handlebars.compile(node.innerHTML || '');
        if (typeof cacheTemplateFn === 'function') {
            cacheTemplateFn(partialName, compiled);
        }
        handlebars.registerPartial(partialName, compiled);
        if (domPartialRegistry) {
            domPartialRegistry.add(partialName);
        }
    });
};

const resolveTemplate = ({
    templateName,
    defaultName = 'navbar',
    templateCache,
    appContext,
    windowRef,
    documentRef,
    handlebars,
    cacheTemplateFn,
}) => {
    if (typeof templateName === 'function') {
        return templateName;
    }
    const name = (templateName || defaultName || '').trim();
    if (!name) {
        return null;
    }

    if (templateCache && templateCache.has(name)) {
        return templateCache.get(name);
    }

    if (appContext && appContext.tmplStores && typeof appContext.tmplStores[name] === 'function') {
        const fn = appContext.tmplStores[name];
        return typeof cacheTemplateFn === 'function' ? cacheTemplateFn(name, fn) : fn;
    }

    if (windowRef && windowRef.templates && typeof windowRef.templates[name] === 'function') {
        const fn = windowRef.templates[name];
        return typeof cacheTemplateFn === 'function' ? cacheTemplateFn(name, fn) : fn;
    }

    if (documentRef) {
        const node = documentRef.getElementById?.(name)
            || documentRef.querySelector?.(`[data-template="${name}"]`);
        if (node && handlebars && typeof handlebars.compile === 'function') {
            const compiled = handlebars.compile(node.innerHTML || '');
            return typeof cacheTemplateFn === 'function'
                ? cacheTemplateFn(name, compiled)
                : compiled;
        }
    }

    return null;
};

const mergeHelperBag = ({ appHelpers, fallbackHelpers }) => appHelpers || fallbackHelpers || {};

const buildTemplateContext = ({ menu, context = {} }) => {
    const templateContext = {
        menu,
        ...context,
    };

    if (typeof templateContext.items === 'undefined') {
        templateContext.items = menu;
    }

    return templateContext;
};

const menuTemplates = Object.freeze({
    cacheTemplate,
    registerDomPartials,
    resolveTemplate,
    mergeHelperBag,
    buildTemplateContext,
});

const noop = () => {};

const secureExternalLinks = (root, selector = '[role="menuitem"][target="_blank"]') => {
    if (!root || !root.querySelectorAll) {
        return;
    }
    root.querySelectorAll(selector).forEach((link) => {
        const rel = link.getAttribute('rel') || '';
        if (!/\bnoopener\b/.test(rel)) {
            link.setAttribute('rel', `${rel} noopener`.trim());
        }
    });
};

const createMenuAccessibility = () => {
    const registrations = new Map();

    const ensureSingleRegistration = (root, attachFn) => {
        if (!root || typeof attachFn !== 'function') {
            return { dispose: noop };
        }
        if (registrations.has(root)) {
            return registrations.get(root);
        }

        const dispose = attachFn();
        const token = {
            dispose: () => {
                if (typeof dispose === 'function') {
                    dispose();
                }
                if (registrations.get(root) === token) {
                    registrations.delete(root);
                }
            },
        };
        registrations.set(root, token);
        return token;
    };

    const attachInteractions = ({
        root,
        selectors,
        callbacks,
    }) => {
        if (!root || !root.addEventListener) {
            return noop;
        }

        const {
            itemSelector: selectorItem,
            parentSelector = 'li.has-children',
        } = selectors;

        const {
            itemSelector,
            hasSubmenu,
            toggleSubmenu,
            moveFocus,
            focusParentItem,
            focusFirstChild,
            setActiveItem,
            allowedKeys,
            handleKey,
        } = callbacks;

        const collapseAll = () => {
            root.querySelectorAll(parentSelector).forEach((li) => {
                const link = li.querySelector(selectorItem);
                if (link) {
                    toggleSubmenu(link, false);
                }
            });
        };

        secureExternalLinks(root, `${itemSelector}[target="_blank"]`);
        collapseAll();

        const items = Array.from(root.querySelectorAll(itemSelector));
        if (items.length) {
            setActiveItem(items[0], items);
            items.slice(1).forEach((node) => node.setAttribute('tabindex', '-1'));
        }

        const onClick = (event) => {
            const target = event.target.closest(itemSelector);
            if (!target || !root.contains(target) || !hasSubmenu(target)) return;
            event.preventDefault();
            toggleSubmenu(target);
        };

        const onKeyDown = (event) => {
            const target = event.target.closest(itemSelector);
            if (!target || !root.contains(target) || !allowedKeys.has(event.key)) return;

            handleKey(event, target, {
                moveFocus,
                toggleSubmenu,
                hasSubmenu,
                focusParentItem,
                focusFirstChild,
            });
        };

        const onFocusIn = (event) => {
            const target = event.target.closest(itemSelector);
            if (!target || !root.contains(target)) return;
            const currentItems = Array.from(root.querySelectorAll(itemSelector));
            if (!currentItems.length) return;
            setActiveItem(target, currentItems);
        };

        root.addEventListener('click', onClick);
        root.addEventListener('keydown', onKeyDown);
        root.addEventListener('focusin', onFocusIn);

        return () => {
            root.removeEventListener('click', onClick);
            root.removeEventListener('keydown', onKeyDown);
            root.removeEventListener('focusin', onFocusIn);
        };
    };

    return {
        ensureSingleRegistration,
        secureExternalLinks,
        attachInteractions,
    };
};

const menuAccessibility = createMenuAccessibility();

const resolveMode = (appDebug, flags = {}) => {
    if (typeof flags.forceDebug === 'boolean') {
        return flags.forceDebug ? 'debug' : 'lite';
    }
    if (typeof flags.forceLite === 'boolean') {
        return flags.forceLite ? 'lite' : 'debug';
    }
    if (typeof flags.mode === 'string') {
        const token = flags.mode.toLowerCase();
        if (token === 'debug' || token === 'lite') {
            return token;
        }
    }
    return appDebug ? 'debug' : 'lite';
};

const createMenuHelpers = ({ appDebug = false, flags = {} } = {}) => {
    const mode = resolveMode(Boolean(appDebug), flags);
    const isDebug = mode === 'debug';

    const attachMenuInteractions = (options = {}) => {
        if (!isDebug) {
            return noop;
        }
        if (!options.root) {
            return noop;
        }
        const token = menuAccessibility.ensureSingleRegistration(
            options.root,
            () => menuAccessibility.attachInteractions(options),
        );
        return () => token.dispose();
    };

    return {
        mode,
        attachMenuInteractions,
        secureExternalLinks: (root, selector) => menuAccessibility.secureExternalLinks(root, selector),
    };
};

const ui = {
    menuData,
    menuTemplates,
    menuAccessibility,
    createMenuHelpers,
};

export { menuAccessibility, menuData, menuTemplates, createMenuHelpers };
export default ui;
