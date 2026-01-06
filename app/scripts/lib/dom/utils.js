const toElement = (target) => {
    if (!target) return null;
    if (target instanceof Element) return target;
    if (typeof target === 'string') {
        return document.getElementById(target) || document.querySelector(target);
    }
    if (target[0] instanceof Element) return target[0];
    return null;
};

const getTemplateFn = (tmplName, source) => {
    if (window.templates && typeof window.templates[tmplName] === 'function') {
        return window.templates[tmplName];
    }
    if (window.Handlebars && typeof window.Handlebars.compile === 'function' && source) {
        return window.Handlebars.compile(source);
    }
    return null;
};

const createDomUtils = ({ app, gee }) => {
    const resetCurrent = (box) => {
        const boxEl = toElement(box);
        if (!boxEl) return;

        const tmpl = boxEl.dataset.tmpl;
        app.pageBox = boxEl;

        if (!app.tmplStores[tmpl]) {
            const source = boxEl.innerHTML || '';
            app.tmplStores[tmpl] = getTemplateFn(tmpl, source) || (() => '');
        }

        app.pageCounter = 1;
        boxEl.innerHTML = '';
        app.destroyPaginate();
    };

    const setPaginate = (total, callback) => {
        const pager = document.getElementById('paginate');
        if (!pager) return;

        const totalPages = Math.max(1, Math.ceil(total / app.pageLimit));
        pager.innerHTML = '';

        const renderBtn = (page) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = page;
            btn.className = (page === app.pageCounter) ? 'active' : '';
            btn.addEventListener('click', function () {
                if (app.pageCounter === page) return;
                app.pageCounter = page;
                Array.from(pager.children).forEach((child) => child.classList.remove('active'));
                btn.classList.add('active');
                if (callback) callback.call(this);
            });
            return btn;
        };

        for (let i = 1; i <= totalPages; i++) {
            pager.appendChild(renderBtn(i));
        }
    };

    const destroyPaginate = () => {
        const pager = document.getElementById('paginate');
        if (pager) pager.innerHTML = '';
    };

    const loadHtml = async function loadHtml(src, ta, redirect) {
        const target = toElement(ta || src);
        const newPath = '/' + src;
        const cacheKey = 'file-' + src;
        const redirectFlag = redirect ? redirect : '';

        const applyHtml = (html) => {
            if (target) target.innerHTML = html;
            if (redirectFlag === 1) {
                app.redirect({ path: newPath, ta: target });
            }
            gee.init();
        };

        if (app.htmlStores[cacheKey]) {
            applyHtml(app.htmlStores[cacheKey]);
            return;
        }

        const url = `${gee.mainUri}${app.tmplPath}${newPath}.html?var=${app.cuVersion}`;
        gee.clog('load: ' + url);

        try {
            const res = await fetch(url, { credentials: 'include' });
            if (!res.ok) {
                gee.alert({ title: 'Alert!', txt: 'Sorry but there was an error: ' + res.status + ' ' + res.statusText });
                return;
            }
            const html = await res.text();
            app.htmlStores[cacheKey] = html;
            applyHtml(html);
        } catch (err) {
            gee.alert({ title: 'Alert!', txt: 'Sorry but there was an error: ' + err.message });
        }
    };

    const loadTmpl = (tmplName, box) => {
        const boxEl = toElement(box);
        if (!boxEl) return;

        if (!app.tmplStores[tmplName]) {
            if (boxEl.tagName === 'FORM' && app.backend && typeof app.backend.initForm === 'function') {
                app.backend.initForm(box);
            }

            const htmlCode = (boxEl.innerHTML || '')
                .replace(/pre-gee/g, 'gee')
                .replace(/pre-src/g, 'src');

            const tmplFn = getTemplateFn(tmplName, htmlCode);
            app.tmplStores[tmplName] = tmplFn || (() => '');
        }

        boxEl.innerHTML = '';
    };

    const setForm = (ta, row) => {
        const formEl = toElement(ta);
        if (!formEl) return;

        formEl.querySelectorAll('input:not([type="button"]), select, textarea').forEach(function (el) {
            const idx = el.getAttribute('name');
            if (!idx || !Object.prototype.hasOwnProperty.call(row, idx)) return;
            const val = row[idx];
            if (el.type === 'checkbox') {
                el.checked = (el.value === String(val));
            } else if (el.type === 'radio') {
                el.checked = (el.value === String(val));
            } else {
                el.value = val;
            }
        });
    };

    const renderBox = (box, dataList, clearBox, orientation) => {
        const boxEl = toElement(box);
        if (!boxEl || !dataList) return;

        const tmpl = boxEl.dataset.tmpl;
        const tmplFn = app.tmplStores[tmpl];
        if (typeof tmplFn !== 'function') return;

        const html = tmplFn(dataList);
        const direction = orientation || 'down';

        if (clearBox) boxEl.innerHTML = '';

        if (direction === 'down') {
            boxEl.insertAdjacentHTML('beforeend', html);
            if (app.pageCounter === 1) {
                app.toTop();
            }
        } else {
            app.toTop();
            boxEl.insertAdjacentHTML('afterbegin', html);
        }
    };

    const toTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return {
        toElement,
        resetCurrent,
        setPaginate,
        destroyPaginate,
        loadHtml,
        loadTmpl,
        setForm,
        renderBox,
        toTop,
    };
};

export { createDomUtils, toElement };
