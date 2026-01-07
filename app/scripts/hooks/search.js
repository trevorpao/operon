import gee from 'trevorpao/geneEH';
import app from '../app';
import { toElement, toNumberSafe, ensureBrowser } from '../lib/shared';

const DEFAULT_LIMIT = 24;

const compileTemplate = (tmplName, boxEl) => {
    if (!tmplName) return null;
    if (app.tmplStores[tmplName]) return app.tmplStores[tmplName];

    const html = boxEl ? boxEl.innerHTML : '';
    const hasWindow = typeof window !== 'undefined';
    const precompiled = (hasWindow && window.templates && typeof window.templates[tmplName] === 'function') ? window.templates[tmplName] : null;
    const fn = precompiled || (hasWindow && window.Handlebars && typeof window.Handlebars.compile === 'function' && html ? window.Handlebars.compile(html) : null);

    if (fn) {
        app.tmplStores[tmplName] = fn;
        if (boxEl) {
            boxEl.innerHTML = '';
        }
    }

    return fn;
};

const renderTemplate = (tmplName, boxEl, context) => {
    const tmplFn = compileTemplate(tmplName, boxEl);
    if (!tmplFn) return '';
    return typeof tmplFn.render === 'function' ? tmplFn.render(context) : tmplFn(context);
};

const serializeForm = (form) => {
    if (!form) return {};
    const formData = new FormData(form);
    const entries = Array.from(formData.entries());
    return entries.reduce((acc, [key, value]) => {
        if (Object.prototype.hasOwnProperty.call(acc, key)) {
            const existing = acc[key];
            acc[key] = Array.isArray(existing) ? existing.concat(value) : [existing, value];
        } else {
            acc[key] = value;
        }
        return acc;
    }, {});
};

const detectFormAndButton = (el) => {
    if (typeof app.detectForm === 'function') {
        return app.detectForm(el);
    }
    const target = toElement(el);
    const form = target ? target.closest('form') : null;
    const btn = form ? form.querySelector('.btn-submit') : target;
    return [form, btn];
};

export default function installSearchHook() {
    if (!ensureBrowser()) return () => {};

    let api;
    try {
        api = app.get('data.search');
    } catch (err) {
        return () => {};
    }

    if (!api || typeof api.fetchList !== 'function') {
        return () => {};
    }

    const state = {
        limit: DEFAULT_LIMIT,
        page: 1,
        total: 0,
        query: '',
        sorter: '',
        tags: [],
        mode: 'normal',
        box: null,
        endpoint: '',
        pid: '',
        pagination: null,
        selector: null,
    };

    const listeners = [];
    const addListener = (target, event, handler) => {
        if (!target || typeof target.addEventListener !== 'function') return;
        target.addEventListener(event, handler);
        listeners.push(() => target.removeEventListener(event, handler));
    };

    const setLoading = (boxEl, flag) => {
        if (!boxEl) return;
        const table = boxEl.closest('.search-table');
        if (!table) return;
        table.classList.toggle('loading', !!flag);
        if (!flag) {
            table.classList.remove('empty');
        }
    };

    const setEmpty = (boxEl) => {
        if (!boxEl) return;
        const table = boxEl.closest('.search-table');
        if (table) {
            table.classList.add('empty');
        }
    };

    const toggleShowMore = (visible) => {
        const btn = document.getElementById('showMore');
        if (!btn) return;
        btn.classList.toggle('hide', !visible);
    };

    const updateTotals = (data) => {
        const total = Number(data && data.total ? data.total : 0);
        const limit = Number(data && data.limit ? data.limit : state.limit || DEFAULT_LIMIT);
        state.total = total;
        state.limit = limit;

        const totalEl = document.querySelector('.j-total');
        if (totalEl) {
            totalEl.textContent = String(total);
        }

        const headerTotal = document.getElementById('search-total');
        if (headerTotal) {
            headerTotal.textContent = String(total);
        }

        renderPagination(total, limit);
        toggleShowMore((state.page * limit) < total);
    };

    const renderPagination = (total, limit) => {
        const pagination = document.querySelector('.j-pagination');
        const selector = document.querySelector('.j-pagiselector');
        state.pagination = pagination;
        state.selector = selector;

        if (!pagination && !selector) return;

        const pages = Math.max(1, Math.ceil((total || 0) / (limit || DEFAULT_LIMIT)));

        if (pagination) {
            pagination.innerHTML = '';
        }
        if (selector) {
            selector.innerHTML = '';
        }

        for (let i = 1; i <= pages; i++) {
            const hash = `#p-${i}`;
            if (pagination) {
                const anchor = document.createElement('a');
                anchor.href = hash;
                anchor.textContent = String(i);
                anchor.className = 'blog-page transition';
                if (i === state.page) {
                    anchor.classList.add('current-page');
                }
                pagination.appendChild(anchor);
            }
            if (selector) {
                const option = document.createElement('option');
                option.value = hash;
                option.textContent = String(i);
                if (i === state.page) {
                    option.selected = true;
                }
                selector.appendChild(option);
            }
        }
    };

    const applyEnhancements = (boxEl) => {
        if (!boxEl) return;
        const hasSlider = boxEl.classList.contains('slider');
        const hasGallery = boxEl.classList.contains('gallery-items');
        const hasWindow = typeof window !== 'undefined';

        if (hasSlider && hasWindow && typeof window.tns === 'function') {
            window.tns({
                mode: 'gallery',
                container: boxEl,
                slideBy: 'page',
                mouseDrag: true,
                autoplay: true,
                controls: true,
                nav: true,
                speed: 500,
            });
            return;
        }

        if (hasGallery && hasWindow && window.jQuery && typeof window.jQuery.fn.isotope === 'function') {
            const $box = window.jQuery(boxEl);
            const instance = $box.isotope({
                singleMode: true,
                columnWidth: '.grid-sizer',
                itemSelector: '.item',
                transformsEnabled: true,
                transitionDuration: '700ms'
            });
            if (typeof $box.imagesLoaded === 'function') {
                $box.imagesLoaded(() => instance.isotope('layout'));
            }
            return;
        }

        const loader = document.querySelector('.loader');
        if (loader) {
            loader.classList.add('is-hidden');
        }
        const main = document.getElementById('main');
        if (main) {
            main.style.opacity = '1';
        }
        const sec1 = document.getElementById('sec1');
        if (sec1) {
            sec1.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }
    };

    const renderItems = (boxEl, data, append) => {
        if (!boxEl) return;
        const subset = Array.isArray(data && data.subset)
            ? data.subset
            : Array.isArray(data && data.data)
                ? data.data
                : (Array.isArray(data) ? data : []);

        if (!subset.length) {
            setEmpty(boxEl);
            toggleShowMore(false);
            return;
        }

        const tmplName = boxEl.dataset.tmpl;
        const html = renderTemplate(tmplName, boxEl, { data: subset });
        if (!html) return;

        if (!append) {
            boxEl.innerHTML = '';
        }
        boxEl.insertAdjacentHTML('beforeend', html);

        if (typeof app.replaceWebP === 'function') {
            app.replaceWebP(boxEl);
        }

        applyEnhancements(boxEl);
        if (typeof gee.init === 'function') {
            gee.init();
        }
    };

    const getActiveIds = (fallbackPid) => {
        if (state.mode === 'filter' && state.tags.length > 0) {
            return state.tags.join(',');
        }
        if (fallbackPid) return fallbackPid;
        return state.pid;
    };

    const fetchAndRender = async ({
        endpoint,
        pid,
        boxEl,
        append = false,
        btn,
        limit,
        standalone = false,
    }) => {
        const targetBox = boxEl || state.box;
        if (!targetBox) return false;
        const activeEndpoint = endpoint || state.endpoint;
        if (!activeEndpoint) return false;

        const activePid = getActiveIds(pid);
        const activeLimit = toNumberSafe(limit || targetBox.dataset.limit, state.limit || DEFAULT_LIMIT);
        if (!standalone) {
            state.limit = activeLimit;
        }

        setLoading(targetBox, true);
        if (btn && typeof app.progressingBtn === 'function') {
            app.progressingBtn(btn);
        }

        try {
            const payload = await api.fetchList({
                endpoint: activeEndpoint,
                pid: activePid,
                query: state.query,
                sorter: state.sorter,
                page: state.page,
                limit: activeLimit,
            });
            renderItems(targetBox, payload, append);
            if (!standalone) {
                updateTotals(payload || {});
            }
            return true;
        } catch (err) {
            if (typeof app.stdErr === 'function') {
                app.stdErr(err);
            }
            setEmpty(targetBox);
            if (!standalone) {
                toggleShowMore(false);
            }
            return false;
        } finally {
            if (btn && typeof app.doneBtn === 'function') {
                app.doneBtn(btn);
            }
            setLoading(targetBox, false);
        }
    };

    const parseHash = () => {
        const hash = window.location.hash.replace('#', '');
        if (!hash) return ['unknown', 1];
        const parts = hash.split('-');
        const area = parts[0] || 'unknown';
        const page = Math.max(1, parseInt(parts[1], 10) || 1);
        return [area, page];
    };

    const syncWithHash = (shouldFetch = true) => {
        const [area, page] = parseHash();
        if (area !== 'p' || page === state.page) return;
        state.page = page;
        if (state.total > 0) {
            renderPagination(state.total, state.limit);
        }
        if (shouldFetch) {
            fetchAndRender({ append: false });
        }
    };

    const updateHash = () => {
        const nextHash = `#p-${state.page}`;
        if (window.location.hash !== nextHash) {
            window.location.hash = nextHash;
        }
    };

    const handleLoad = (me) => {
        const el = toElement(me);
        if (!el) return false;
        state.box = el;
        state.endpoint = el.dataset.src || state.endpoint;
        state.pid = el.dataset.pid || state.pid;
        state.limit = toNumberSafe(el.dataset.limit, state.limit || DEFAULT_LIMIT);
        state.mode = 'normal';

        const params = new URLSearchParams(window.location.search || '');
        if (params && params.toString()) {
            const queryObj = {};
            params.forEach((value, key) => {
                queryObj[key] = value;
            });
            state.query = queryObj;
        }

        const hash = window.location.hash;
        if (hash) {
            const [, page] = parseHash();
            state.page = page;
        } else {
            state.page = 1;
        }

        if (listeners.length === 0) {
            addListener(window, 'hashchange', () => syncWithHash(true));
            addListener(window, 'popstate', () => syncWithHash(true));
        }

        el.innerHTML = '';
        setLoading(el, true);
        const pid = getActiveIds(el.dataset.pid);
        fetchAndRender({ endpoint: state.endpoint, pid, boxEl: el, append: false });
        return true;
    };

    const handleOnce = (me) => {
        const el = toElement(me);
        if (!el) return false;
        const endpoint = el.dataset.src;
        const pid = el.dataset.pid;
        const limit = toNumberSafe(el.dataset.limit, DEFAULT_LIMIT);
        return fetchAndRender({ endpoint, pid, boxEl: el, append: false, limit, standalone: true });
    };

    const handleNext = () => {
        if (!state.box) return false;
        state.page += 1;
        updateHash();
        return fetchAndRender({ append: true });
    };

    const handleMore = (me) => {
        const el = toElement(me);
        if (!el) return false;
        const targetId = el.dataset.ta;
        const targetBox = targetId ? document.getElementById(targetId) : state.box;
        if (!targetBox) return false;
        const [, btn] = detectFormAndButton(el);
        state.box = targetBox;
        state.endpoint = el.dataset.src || state.endpoint;
        state.page += 1;
        updateHash();
        const pid = getActiveIds(el.dataset.pid);
        return fetchAndRender({ endpoint: state.endpoint, pid, boxEl: targetBox, append: true, btn, limit: el.dataset.limit });
    };

    const handleFilter = (me) => {
        const el = toElement(me);
        if (!el) return false;
        const targetId = el.dataset.ta;
        const targetBox = targetId ? document.getElementById(targetId) : state.box;
        if (!targetBox) return false;

        const checked = Array.from(document.querySelectorAll('.filter-chk:checked')).map((input) => input.value);
        if (el.dataset.pid) {
            checked.push(el.dataset.pid);
        }
        const joined = checked.join(',');
        if (joined === state.tags.join(',')) {
            return false;
        }

        state.tags = checked;
        state.mode = 'filter';
        state.page = 1;
        state.box = targetBox;
        state.endpoint = el.dataset.src || state.endpoint;
        targetBox.innerHTML = '';
        toggleShowMore(true);
        return fetchAndRender({ endpoint: state.endpoint, pid: joined, boxEl: targetBox, append: false });
    };

    const handleJump = (me) => {
        const el = toElement(me);
        if (!el) return false;
        const value = el.value || (el.options && el.options[el.selectedIndex] && el.options[el.selectedIndex].value);
        if (!value) return false;
        window.location.hash = value;
        return true;
    };

    const handleQuery = (me) => {
        const el = toElement(me);
        const [form, btn] = detectFormAndButton(el);
        if (!form || !state.box) return false;

        if (typeof form.reportValidity === 'function' && !form.reportValidity()) {
            return false;
        }
        if (typeof form.reportValidity !== 'function' && typeof app.validateForm === 'function' && !app.validateForm(form)) {
            return false;
        }

        state.mode = 'normal';
        state.page = 1;
        state.query = serializeForm(form);
        state.box.innerHTML = '';
        return fetchAndRender({ endpoint: state.endpoint, pid: state.pid, boxEl: state.box, append: false, btn });
    };

    const handleResort = (me) => {
        const el = toElement(me);
        if (!el || !state.box) return false;
        state.sorter = el.dataset.sorter || '';
        state.page = 1;
        state.endpoint = el.dataset.src || state.endpoint;
        state.box.innerHTML = '';
        return fetchAndRender({ endpoint: state.endpoint, pid: getActiveIds(el.dataset.pid), boxEl: state.box, append: false });
    };

    if (typeof gee !== 'undefined' && typeof gee.hook === 'function') {
        gee.hook('search.load', handleLoad);
        gee.hook('search.once', handleOnce);
        gee.hook('search.next', handleNext);
        gee.hook('search.filter', handleFilter);
        gee.hook('search.more', handleMore);
        gee.hook('search/jumPage', handleJump);
        gee.hook('search/query', handleQuery);
        gee.hook('search/resort', handleResort);
    }

    return function teardown() {
        listeners.forEach((off) => off());
    };
}
