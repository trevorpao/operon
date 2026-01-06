import gee from 'trevorpao/geneEH';
import app from '../app';
import installTrackHook from './track';
import { toNumberSafe, toElement } from '../lib/shared';

const compileTemplate = (tmplName, boxEl) => {
    if (app.tmplStores[tmplName]) {
        return app.tmplStores[tmplName];
    }

    const html = boxEl ? boxEl.innerHTML : '';
    const fallback = (window.templates && typeof window.templates[tmplName] === 'function') ? window.templates[tmplName] : null;
    const fn = fallback || (window.Handlebars && typeof window.Handlebars.compile === 'function' && html ? window.Handlebars.compile(html) : null);

    if (fn) {
        app.tmplStores[tmplName] = fn;
        if (boxEl) {
            boxEl.innerHTML = '';
        }
    }

    return fn;
};

const renderWithTemplate = (tmplName, boxEl, context) => {
    const tmplFn = compileTemplate(tmplName, boxEl);
    if (!tmplFn) return '';
    return typeof tmplFn.render === 'function' ? tmplFn.render(context) : tmplFn(context);
};

const applyCarousel = (root) => {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll('.carousel').forEach((elem) => {
        elem.classList.add('carousel-loaded');
        const margin = elem.getAttribute('data-margin') || 0;
        elem.style.display = 'flex';
        elem.style.gap = `${margin}px`;
        elem.style.overflowX = 'auto';
        elem.style.scrollSnapType = 'x mandatory';
        Array.from(elem.children).forEach((child) => {
            child.style.scrollSnapAlign = 'start';
        });
    });
};

export default function installResourceHook() {
    let api;
    try {
        api = app.get('data.resource');
    } catch (err) {
        return () => {};
    }

    const renderAndEnhance = (boxEl, html) => {
        if (!boxEl || typeof html !== 'string') return;
        boxEl.innerHTML = html;
        applyCarousel(boxEl);
        installTrackHook(boxEl);
        gee.init();
    };

    const handleLoad = (me) => {
        const el = toElement(me);
        if (!el) return false;
        const tmpl = el.dataset.tmpl;
        if (!tmpl) return false;
        const pid = el.dataset.pid;
        const limit = el.dataset.limit ? toNumberSafe(el.dataset.limit) : undefined;
        const meta = toNumberSafe(el.dataset.meta, 0);

        api.load({ pid, limit, meta })
            .then(({ data, cu }) => {
                const html = renderWithTemplate(tmpl, el, { data, cu });
                renderAndEnhance(el, html);
            })
            .catch((err) => {
                if (typeof app.stdErr === 'function') {
                    app.stdErr(err);
                }
            });
    };

    const handleTop10 = (me) => {
        const el = toElement(me);
        if (!el) return false;
        const tmpl = el.dataset.tmpl;
        if (!tmpl) return false;
        const limit = toNumberSafe(el.dataset.limit, 5);

        api.loadTop10({ limit })
            .then(({ data }) => {
                const html = renderWithTemplate(tmpl, el, { data });
                renderAndEnhance(el, html);
            })
            .catch((err) => {
                if (typeof app.stdErr === 'function') {
                    app.stdErr(err);
                }
            });
    };

    if (typeof gee !== 'undefined' && typeof gee.hook === 'function') {
        gee.hook('resource.load', handleLoad);
        gee.hook('loadTop10', handleTop10);
    }

    return function teardown() {};
}
