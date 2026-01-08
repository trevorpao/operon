import gee from 'trevorpao/geneEH';
import app from '../app';
import { toElement } from '../lib/dom/utils';
import registerHooks from '../lib/hooks/register';

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

const renderTemplate = (fn, context) => {
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

export default function installMenuHook() {
    let api;
    try {
        api = app.get('data.menu');
    } catch (err) {
        return () => {};
    }

    if (!api || typeof api.fetchMenu !== 'function') {
        return () => {};
    }

    const teardownFns = new Set();
    const runTeardowns = () => {
        teardownFns.forEach((fn) => fn());
        teardownFns.clear();
    };

    const renderMenu = async (target, tmplName) => {
        const el = toElement(target);
        if (!el) return false;

        const tmplFn = getTemplateFn(tmplName, '#' + tmplName, el);
        if (!tmplFn) return false;

        const menuID = el.dataset.menuId;

        try {
            const data = await api.fetchMenu(menuID);
            const html = renderTemplate(tmplFn, { data });
            if (!html) return false;

            runTeardowns();
            el.innerHTML = html;
            attachDropdownHandlers(el).forEach((fn) => teardownFns.add(fn));

            const waiter = (typeof app.waitFor === 'function') ? app.waitFor(0.1) : Promise.resolve();
            await waiter;
            if (typeof gee.init === 'function') gee.init();
            if (app.track && typeof app.track.bind === 'function') {
                app.track.bind(el);
            }
        } catch (err) {
            if (typeof app.stdErr === 'function') {
                app.stdErr(err);
            }
        }
        return true;
    };

    const makeHandler = (forcedTmpl) => (me) => {
        const el = toElement(me);
        if (!el) return false;
        const tmplName = forcedTmpl || el.dataset.tmpl || 'menuTmpl';
        return renderMenu(el, tmplName);
    };

    registerHooks('menu', {
        load: makeHandler(),
        getMainMenu: makeHandler('menuTmpl'),
        getFooterMenu: makeHandler('footerMenuTmpl'),
    }, {
        legacy: {
            getMainMenu: 'getMainMenu',
            getFooterMenu: 'getFooterMenu',
        },
    });

    return function teardown() {
        runTeardowns();
    };
}
