import 'gene-event-handler';
import app from '../app';
import { toElement } from '../lib/dom/utils';
import registerHooks from '../lib/hooks/register';

const MENU_ITEM_SELECTOR = '[role="menuitem"]';
const DEFAULT_TEMPLATE = 'navbar';
const DEFAULT_TIMEOUT = 3000;
const CLASS_LOADING = 'menu--loading';
const CLASS_READY = 'menu--ready';
const CLASS_ERROR = 'menu--error';
const KEYBOARD_KEYS = new Set(['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Enter', ' ', 'Spacebar', 'Escape', 'Esc']);
const DEFAULT_BRAND_LABEL = 'Menu';
const DEFAULT_BRAND_HREF = '/';

const hasDocument = typeof document !== 'undefined';

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
}[char] || char));

const createAbortController = () => {
    if (typeof AbortController === 'function') {
        return new AbortController();
    }
    const signal = { aborted: false, addEventListener: () => {} };
    return {
        signal,
        abort() {
            signal.aborted = true;
        },
    };
};

const setStatus = (el, status) => {
    el.classList.remove(CLASS_LOADING, CLASS_READY, CLASS_ERROR);
    if (status === 'loading') {
        el.classList.add(CLASS_LOADING);
    } else if (status === 'ready') {
        el.classList.add(CLASS_READY);
    } else if (status === 'error') {
        el.classList.add(CLASS_ERROR);
    }
};

const secureExternalLinks = (root) => {
    root.querySelectorAll(`${MENU_ITEM_SELECTOR}[target="_blank"]`).forEach((link) => {
        const rel = link.getAttribute('rel') || '';
        if (!/\bnoopener\b/.test(rel)) {
            link.setAttribute('rel', `${rel} noopener`.trim());
        }
    });
};

const getTriggerLink = (listItem) => listItem.querySelector(':scope > [role="menuitem"]');
const getSubmenu = (listItem) => listItem.querySelector(':scope > ul');
const hasSubmenu = (link) => {
    const parent = link.closest('li');
    if (!parent) return false;
    return Boolean(getSubmenu(parent));
};

const collapseSubmenu = (link) => {
    const parent = link.closest('li');
    if (!parent) return;
    const submenu = getSubmenu(parent);
    if (!submenu) return;
    submenu.setAttribute('hidden', '');
    parent.classList.remove('is-open');
    link.setAttribute('aria-expanded', 'false');
};

const expandSubmenu = (link) => {
    const parent = link.closest('li');
    if (!parent) return;
    const submenu = getSubmenu(parent);
    if (!submenu) return;
    submenu.removeAttribute('hidden');
    parent.classList.add('is-open');
    link.setAttribute('aria-expanded', 'true');
};

const toggleSubmenu = (link, expand) => {
    const shouldExpand = typeof expand === 'boolean' ? expand : link.getAttribute('aria-expanded') !== 'true';
    if (shouldExpand) {
        expandSubmenu(link);
    } else {
        collapseSubmenu(link);
    }
};

const setActiveItem = (item, items) => {
    items.forEach((node) => node.setAttribute('tabindex', '-1'));
    item.setAttribute('tabindex', '0');
    item.focus();
};

const moveFocus = (root, current, offset) => {
    const items = Array.from(root.querySelectorAll(MENU_ITEM_SELECTOR));
    const index = items.indexOf(current);
    if (index === -1 || !items.length) return;
    const total = items.length;
    const nextIndex = (index + offset + total) % total;
    setActiveItem(items[nextIndex], items);
};

const focusParentItem = (root, current) => {
    const parentLi = current.closest('ul')?.closest('li');
    if (!parentLi) return false;
    const parentLink = getTriggerLink(parentLi);
    if (!parentLink) return false;
    collapseSubmenu(parentLink);
    const items = Array.from(root.querySelectorAll(MENU_ITEM_SELECTOR));
    if (!items.length) {
        parentLink.focus();
        return true;
    }
    setActiveItem(parentLink, items);
    return true;
};

const focusFirstChild = (root, link) => {
    const parent = link.closest('li');
    if (!parent) return false;
    const submenu = getSubmenu(parent);
    if (!submenu) return false;
    const firstChild = submenu.querySelector(MENU_ITEM_SELECTOR);
    if (!firstChild) return false;
    const items = Array.from(root.querySelectorAll(MENU_ITEM_SELECTOR));
    if (!items.length) {
        firstChild.focus();
        return true;
    }
    setActiveItem(firstChild, items);
    return true;
};

const renderFallback = (el, error, retry) => {
    const message = error && error.message ? error.message : 'Menu 無法載入，請稍後再試';
    setStatus(el, 'error');
    el.innerHTML = `<div class="menu-fallback" role="status" aria-live="assertive">
        <p class="menu-fallback__message">${escapeHtml(message)}</p>
        <button type="button" class="menu-fallback__retry">重新載入</button>
    </div>`;

    const button = el.querySelector('.menu-fallback__retry');
    if (!button) return () => {};
    const handler = (evt) => {
        evt.preventDefault();
        button.disabled = true;
        retry();
    };
    button.addEventListener('click', handler);
    return () => button.removeEventListener('click', handler);
};

const attachInteractions = (root) => {
    if (!hasDocument) return () => {};

    const collapseAll = () => {
        root.querySelectorAll('li.has-children').forEach((li) => {
            const link = getTriggerLink(li);
            if (link) {
                collapseSubmenu(link);
            }
        });
    };

    secureExternalLinks(root);
    collapseAll();

    const items = Array.from(root.querySelectorAll(MENU_ITEM_SELECTOR));
    if (items.length) {
        setActiveItem(items[0], items);
        items.slice(1).forEach((node) => node.setAttribute('tabindex', '-1'));
    }

    const onClick = (event) => {
        const target = event.target.closest(MENU_ITEM_SELECTOR);
        if (!target || !root.contains(target)) return;
        if (!hasSubmenu(target)) return;
        event.preventDefault();
        toggleSubmenu(target);
    };

    const onKeyDown = (event) => {
        const target = event.target.closest(MENU_ITEM_SELECTOR);
        if (!target || !root.contains(target) || !KEYBOARD_KEYS.has(event.key)) return;

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                moveFocus(root, target, 1);
                break;
            case 'ArrowUp':
                event.preventDefault();
                moveFocus(root, target, -1);
                break;
            case 'ArrowRight':
                if (hasSubmenu(target)) {
                    event.preventDefault();
                    toggleSubmenu(target, true);
                    if (!focusFirstChild(root, target)) {
                        moveFocus(root, target, 1);
                    }
                }
                break;
            case 'ArrowLeft':
                event.preventDefault();
                if (!focusParentItem(root, target)) {
                    moveFocus(root, target, -1);
                }
                break;
            case 'Enter':
            case ' ':
            case 'Spacebar':
                if (hasSubmenu(target)) {
                    event.preventDefault();
                    toggleSubmenu(target);
                }
                break;
            case 'Escape':
            case 'Esc':
                if (focusParentItem(root, target)) {
                    event.preventDefault();
                }
                break;
            default:
                break;
        }
    };

    const onFocusIn = (event) => {
        const target = event.target.closest(MENU_ITEM_SELECTOR);
        if (!target || !root.contains(target)) return;
        const items = Array.from(root.querySelectorAll(MENU_ITEM_SELECTOR));
        if (!items.length) return;
        setActiveItem(target, items);
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

const getMenuPlugin = () => {
    try {
        const api = app.get('data.menu');
        if (!api || typeof api.render !== 'function' || typeof api.loadMenu !== 'function') {
            console.warn('[menu] data.menu plugin missing required API');
            return null;
        }
        return api;
    } catch (error) {
        console.warn('[menu] plugin not available', error);
        return null;
    }
};

const createMenuController = (pluginApi) => {
    const state = new Map();

    const logRenderResult = (el, templateName, html) => {
        if (typeof console === 'undefined' || typeof console.info !== 'function') {
            return;
        }
        const isAttached = hasDocument ? document.body.contains(el) : false;
        console.info('[menu] render html snippet:', html);
        console.info('[menu] render target info:', {
            template: templateName,
            target: el,
            attachedToDom: isAttached,
            parent: el?.parentElement || null,
        });
    };

    const ensureState = (el) => {
        if (!state.has(el)) {
            state.set(el, { cleanup: new Set(), abortController: null });
        }
        return state.get(el);
    };

    const cleanupElement = (el) => {
        const entry = state.get(el);
        if (!entry) return;
        if (entry.abortController && typeof entry.abortController.abort === 'function') {
            entry.abortController.abort();
        }
        entry.cleanup.forEach((fn) => {
            try {
                fn();
            } catch (err) {
                if (typeof console !== 'undefined' && console.warn) {
                    console.warn('[menu] cleanup error', err);
                }
            }
        });
        entry.cleanup.clear();
        state.delete(el);
    };

    const getTemplateContext = (el, menuId) => {
        if (!el) return {};
        const dataset = el.dataset || {};
        const ariaLabel = el.getAttribute('aria-label') || '主導航';
        const brandLabel = dataset.menuBrandLabel || dataset.menuBrand || DEFAULT_BRAND_LABEL;
        const brandHref = dataset.menuBrandHref || dataset.menuBrandUrl || DEFAULT_BRAND_HREF;
        const burgerTarget = dataset.menuTarget || dataset.menuBurgerTarget || `navbar-menu-${menuId}`;
        return {
            ariaLabel,
            brandLabel,
            brandHref,
            burgerTarget,
            menuId,
        };
    };

    const mount = async (target, forcedTemplate) => {
        const el = toElement(target);
        if (!el) return false;

        cleanupElement(el);

        const templateName = forcedTemplate || el.dataset.menuTemplate || el.dataset.tmpl || DEFAULT_TEMPLATE;
        const menuId = el.dataset.menuId || el.getAttribute('data-menu-id') || 'default';
        const timeout = Number(el.dataset.menuTimeout || DEFAULT_TIMEOUT);
        const cache = el.dataset.menuCache !== 'false';

        setStatus(el, 'loading');
        el.setAttribute('aria-busy', 'true');

        const abortController = createAbortController();
        const entry = ensureState(el);
        entry.abortController = abortController;

        try {
            const templateContext = getTemplateContext(el, menuId);
            const { html } = await pluginApi.render({
                template: templateName,
                menuId,
                timeout,
                signal: abortController.signal,
                cache,
                context: templateContext,
            });

            if (abortController.signal && abortController.signal.aborted) {
                return false;
            }

            el.innerHTML = html;
            el.dataset.menuLoadedAt = String(Date.now());
            setStatus(el, 'ready');
            el.removeAttribute('aria-busy');

            logRenderResult(el, templateName, html);

            const teardownInteractions = attachInteractions(el);
            entry.cleanup.add(teardownInteractions);

            if (app.track && typeof app.track.bind === 'function') {
                app.track.bind(el);
            }

            if (typeof gee !== 'undefined' && typeof gee.init === 'function') {
                gee.init();
            }

            return true;
        } catch (error) {
            if (!(abortController.signal && abortController.signal.aborted)) {
                const cleanupFallback = renderFallback(el, error, () => mount(target, forcedTemplate));
                entry.cleanup.add(cleanupFallback);
                el.removeAttribute('aria-busy');
            }
            return false;
        }
    };

    const mountWithTemplate = (template) => (node) => mount(node, template);

    const teardownAll = () => {
        Array.from(state.keys()).forEach((element) => {
            cleanupElement(element);
            state.delete(element);
        });
        if (typeof pluginApi.destroy === 'function') {
            pluginApi.destroy();
        }
    };

    return { mount, mountWithTemplate, teardownAll };
};

let sharedController = null;

const ensureController = () => {
    if (sharedController) return sharedController;
    const pluginApi = getMenuPlugin();
    if (!pluginApi) return null;
    sharedController = createMenuController(pluginApi);
    return sharedController;
};

export default function installMenuHook() {
    const controller = ensureController();
    if (!controller) {
        return () => {};
    }

    registerHooks('menu', {
        load: controller.mount,
        getMainMenu: controller.mountWithTemplate(DEFAULT_TEMPLATE),
        getFooterMenu: controller.mountWithTemplate('footerMenuTmpl'),
    }, {
        legacy: {
            getMainMenu: 'getMainMenu',
            getFooterMenu: 'getFooterMenu',
        },
    });

    return function teardown() {
        if (sharedController) {
            sharedController.teardownAll();
            sharedController = null;
        }
    };
}

export const initMenuStandalone = (root = document) => {
    if (!root || !root.querySelectorAll) {
        return () => {};
    }
    const controller = ensureController();
    if (!controller) {
        return () => {};
    }
    const targets = root.querySelectorAll('[data-gene="init:menu.load"]');
    targets.forEach((el) => {
        controller.mount(el);
    });
    return () => {
        if (sharedController) {
            sharedController.teardownAll();
            sharedController = null;
        }
    };
};
