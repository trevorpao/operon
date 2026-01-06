import app from '../app';
import { toElement, ensureBrowser } from '../lib/shared';

const defaultFontTargets = '#article-press .text p, #article-press .text li, #article-post .text p, #article-post .text li';

export default function installArenaHook() {
    if (!ensureBrowser()) return () => {};
    let api;
    try {
        api = app.get('ui.arena');
    } catch (err) {
        return () => {};
    }

    const handleFont = (delta) => (me) => {
        const el = toElement(me);
        const targetSel = el && el.dataset && el.dataset.ta ? el.dataset.ta : defaultFontTargets;
        api.changeFont(delta, targetSel);
    };

    const handleModalShow = (me) => {
        const el = toElement(me);
        if (!el) return false;
        const target = el.dataset.target || 'arena-modal';
        const src = el.dataset.src;
        if (src) {
            api.showModal(target, `<iframe src="${src}" frameborder="0"></iframe>`);
        } else {
            api.showModal(target);
        }
    };

    const handleModalHide = (me) => {
        const el = toElement(me);
        const target = (el && el.dataset && el.dataset.target) ? el.dataset.target : 'arena-modal';
        api.hideModal(target);
    };

    const handlePagination = (me) => {
        const el = toElement(me);
        if (!el) return false;
        const total = Number(el.dataset.total || 0);
        const length = Number(el.dataset.length || 1);
        const totalPages = Math.max(1, Math.ceil(total / length));
        const canonical = document.querySelector('link[rel="canonical"]');
        const baseHref = canonical ? canonical.getAttribute('href') : window.location.pathname;
        const html = Array.from({ length: totalPages }, (_, idx) => `<a class="page-link" href="${baseHref}?page=${idx + 1}">${idx + 1}</a>`).join('');
        el.innerHTML = html;
    };

    const handleAutolink = (me) => {
        const el = toElement(me);
        if (!el || typeof Autolinker === 'undefined') return false;
        const html = Autolinker.link(el.innerHTML, { stripPrefix: false, truncate: { length: 32, location: 'middle' } });
        el.innerHTML = html;
    };

    const handleReXPos = (me) => {
        const el = toElement(me);
        if (!el) return false;
        const left = Number(el.dataset.left || 0);
        const x = Number(el.dataset.x || 0);
        const w = app.bodyEl ? app.bodyEl.clientWidth : window.innerWidth;
        const calcLeft = (w > 1000) ? 0 : (w * x + left);
        el.style.left = `${calcLeft}px`;
    };

    const handleLoadMain = (me) => {
        const el = toElement(me);
        if (!el || !el.dataset.src) return false;
        app.loadHtml(el.dataset.src, 'main-box', 1);
    };

    const handleLoadBox = (me) => {
        const el = toElement(me);
        if (!el || !el.dataset.src) return false;
        app.loadHtml(el.dataset.src, el);
    };

    const handleLoadModal = (me) => {
        const el = toElement(me);
        if (!el) return false;
        const type = el.dataset.type;
        const width = el.dataset.width || 'std';
        if (!type) return false;
        app.loadHtml(`modal/${type}`, `${width}-modal-box`);
        const label = document.getElementById(`${width}-modalLabel`);
        if (label) label.textContent = type;
        api.showModal(`${width}-modal`);
    };

    const handleReplaceMe = (me) => {
        const el = toElement(me);
        if (!el || !el.dataset.src) return false;
        const url = `${app.tmplPath}/${el.dataset.src}.html?var=${app.cuVersion}`;
        fetch(url, { credentials: 'include' })
            .then((res) => res.ok ? res.text() : '')
            .then((html) => {
                if (html && el.parentNode) {
                    el.insertAdjacentHTML('afterend', html);
                    el.remove();
                    if (typeof gee !== 'undefined' && typeof gee.init === 'function') {
                        gee.init();
                    }
                }
            })
            .catch(() => {});
    };

    const handleReExe = () => {
        if (app.redo) {
            const f = app.redo.split('.');
            if (app[f[0]] && typeof app[f[0]][f[1]] === 'function') {
                app[f[0]][f[1]]();
                app.redo = null;
            } else {
                location.reload();
            }
        }
    };

    const handleReact = (me) => {
        const eventObj = me && me.event;
        const target = eventObj ? eventObj.target : null;
        const ta = target ? (target.getAttribute && target.getAttribute('func') ? target : target.parentElement) : null;
        if (!ta || !ta.getAttribute) return;
        const func = ta.getAttribute('func');
        const type = ta.dataset && ta.dataset.event ? ta.dataset.event : 'click';
        if (type === (eventObj ? eventObj.type : 'click') && typeof gee.exe === 'function' && gee.check(func)) {
            ta.event = eventObj;
            gee.exe(func, ta);
        }
    };

    const handleReactSubmit = (me) => {
        const eventObj = me && me.event;
        const code = eventObj && (eventObj.keyCode || eventObj.which);
        const el = toElement(me && me.target ? me.target : me);
        const func = el ? (el.getAttribute('func') || (el.dataset ? el.dataset.func : null)) : null;
        if (!code || !func) return;
        if (code === 13 && !(eventObj && eventObj.shiftKey) && gee.check(func)) {
            const taId = el && el.dataset ? el.dataset.ta : null;
            const form = taId ? document.getElementById(taId) : (el && typeof el.closest === 'function' ? el.closest('form') : null);
            if (func === 'stdSubmit') {
                const ta = form ? form.querySelector('[data-gene="click:stdSubmit"]') : null;
                if (ta) gee.exe(func, ta);
            } else if (func === 'login') {
                const ta = form ? form.querySelector('[data-gene="click:login"]') : null;
                if (ta) gee.exe(func, ta);
            } else {
                gee.exe(func, el || me);
            }
        }
    };

    if (typeof gee !== 'undefined' && typeof gee.hook === 'function') {
        gee.hook('largerFont', handleFont(0.1));
        gee.hook('smallerFont', handleFont(-0.1));
        gee.hook('arena.modal.show', handleModalShow);
        gee.hook('arena.modal.iframe', handleModalShow);
        gee.hook('hideModal', handleModalHide);
        gee.hook('goTop', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        gee.hook('loadMain', handleLoadMain);
        gee.hook('loadBox', handleLoadBox);
        gee.hook('loadModal', handleLoadModal);
        gee.hook('replaceMe', handleReplaceMe);
        gee.hook('reExe', handleReExe);
        gee.hook('reXPos', handleReXPos, 'init');
        gee.hook('initAutolink', handleAutolink, 'init');
        gee.hook('initPagination', handlePagination, 'init');
        gee.hook('initTmpl', (me) => {
            const el = toElement(me);
            if (el && el.dataset && el.dataset.tmpl) {
                app.loadTmpl(el.dataset.tmpl, el);
            }
        }, 'init');
        gee.hook('react', handleReact);
        gee.hook('reactSubmit', handleReactSubmit);
    }

    // goTop visibility via scroll
    const scrollHandler = () => {
        const pos = window.scrollY || document.documentElement.scrollTop || 0;
        api.setGoTopVisible(pos > 300);
    };
    window.addEventListener('scroll', scrollHandler);

    const touchHandler = () => api.setGoTopVisible((window.scrollY || 0) > 300);
    const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isiOS) {
        window.addEventListener('touchend', touchHandler);
        window.addEventListener('touchcancel', touchHandler);
        window.addEventListener('touchleave', touchHandler);
    }

    return function teardownFn() {
        window.removeEventListener('scroll', scrollHandler);
        if (isiOS) {
            window.removeEventListener('touchend', touchHandler);
            window.removeEventListener('touchcancel', touchHandler);
            window.removeEventListener('touchleave', touchHandler);
        }
    };
}
