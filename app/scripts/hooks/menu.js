import gee from 'trevorpao/geneEH';
import app from '../app';

const getTemplateFn = (name, selector, fallbackEl) => {
    if (app.tmplStores[name]) return app.tmplStores[name];

    const tplEl = document.querySelector(selector) || fallbackEl;
    const html = tplEl ? tplEl.innerHTML : '';

    const precompiled = (window.templates && typeof window.templates[name] === 'function') ? window.templates[name] : null;
    const fn = precompiled || (window.Handlebars && typeof window.Handlebars.compile === 'function' && html ? window.Handlebars.compile(html) : null);

    if (fn) {
        app.tmplStores[name] = fn;
    }

    return fn;
};

const renderTemplate = (name, selector, boxEl, context) => {
    const fn = getTemplateFn(name, selector, boxEl);
    if (!fn) return '';
    return typeof fn.render === 'function' ? fn.render(context) : fn(context);
};

const attachDropdownHandlers = (root) => {
    const links = root.querySelectorAll('#mainMenu nav > ul > li.dropdown > a, #mainMenu nav > ul .dropdown-submenu > a, #mainMenu nav > ul .dropdown-submenu > span');
    const unbinders = [];

    links.forEach((lnk) => {
        const handler = (e) => {
            e.preventDefault();
            const li = lnk.parentElement;
            if (!li) return;
            const siblings = li.parentElement ? Array.from(li.parentElement.children) : [];
            siblings.forEach((sib) => {
                if (sib !== li) sib.classList.remove('hover-active');
            });
            li.classList.toggle('hover-active');
        };

        lnk.addEventListener('click', handler);
        lnk.addEventListener('touchend', handler);
        unbinders.push(() => {
            lnk.removeEventListener('click', handler);
            lnk.removeEventListener('touchend', handler);
        });
    });

    return unbinders;
};

const selectors = {
    main: '[data-hook="getMainMenu"],[data-gee="getMainMenu"],[gee="getMainMenu"]',
    footer: '[data-hook="getFooterMenu"],[data-gee="getFooterMenu"],[gee="getFooterMenu"]',
};

export default function installMenuHook(root) {
    let api;
    try {
        api = app.get('data.menu');
    } catch (err) {
        return () => {};
    }

    const scope = root && root.nodeType ? root : document;
    const teardownFns = [];

    const renderMainMenu = (el) => {
        const menuID = el.dataset.menuId;
        api.fetchMenu(menuID)
            .then((data) => {
                const html = renderTemplate('menuTmpl', '#menuTmpl', el, { data });
                if (html) {
                    el.innerHTML = html;
                    teardownFns.push(...attachDropdownHandlers(el));
                    gee.init();
                }
            })
            .catch((err) => {
                if (typeof app.stdErr === 'function') {
                    app.stdErr(err);
                }
            });
    };

    const renderFooterMenu = (el) => {
        const menuID = el.dataset.menuId;
        api.fetchMenu(menuID)
            .then((data) => {
                const html = renderTemplate('footerMenuTmpl', '#footerMenuTmpl', el, { data });
                if (html && el.insertAdjacentHTML) {
                    el.insertAdjacentHTML('afterbegin', html);
                    gee.init();
                }
            })
            .catch((err) => {
                if (typeof app.stdErr === 'function') {
                    app.stdErr(err);
                }
            });
    };

    const mainNodes = scope.querySelectorAll ? scope.querySelectorAll(selectors.main) : [];
    const footerNodes = scope.querySelectorAll ? scope.querySelectorAll(selectors.footer) : [];

    mainNodes.forEach(renderMainMenu);
    footerNodes.forEach(renderFooterMenu);

    return function teardown() {
        teardownFns.forEach((fn) => fn());
    };
}
