import app from '../app';
import { toElement, ensureBrowser } from '../lib/shared';
import registerHooks from '../lib/hooks/register';

const defaultFontTargets = '#article-press .text p, #article-press .text li, #article-post .text p, #article-post .text li';

const removeClassByPrefix = (el, prefix) => {
    if (!el || !el.classList) return;
    Array.from(el.classList)
        .filter((cls) => cls.startsWith(prefix))
        .forEach((cls) => el.classList.remove(cls));
};

export default function installArenaHook() {
    if (!ensureBrowser()) return () => {};
    let api;
    try {
        api = app.get('ui.arena');
    } catch (err) {
        return () => {};
    }

    let modalApi = null;
    try {
        modalApi = app.get('ui.modal');
    } catch (err) {
        modalApi = null;
    }

    const openModal = (id, options = {}) => {
        if (!id) return;
        if (modalApi && typeof modalApi.show === 'function') {
            modalApi.show(id, options);
            return;
        }
        const modalEl = document.getElementById(id);
        if (!modalEl) return;
        modalEl.classList.remove('hide');
        modalEl.classList.add('is-active');
        modalEl.removeAttribute('hidden');
        modalEl.setAttribute('aria-hidden', 'false');
    };

    const handleFont = (delta) => (me) => {
        const el = toElement(me);
        const targetSel = el && el.dataset && el.dataset.ta ? el.dataset.ta : defaultFontTargets;
        api.changeFont(delta, targetSel);
    };

    const handleGoTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

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

    const handleInitTmpl = (me) => {
        const el = toElement(me);
        if (el && el.dataset && el.dataset.tmpl) {
            app.loadTmpl(el.dataset.tmpl, el);
        }
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
        const target = el.dataset.ta || 'main-box';
        if (target !== 'main-box' && app.body) {
            if (app.body.classList) {
                removeClassByPrefix(app.body, 'open-');
                app.body.classList.add(`open-${target}`);
            }
            if (app.site && typeof app.site.registerBack === 'function') {
                app.site.registerBack(() => {
                    if (app.body && app.body.classList) {
                        app.body.classList.remove(`open-${target}`);
                    }
                });
            }
        }
        app.loadHtml(el.dataset.src, target, 1);
        window.scrollTo({ top: 0, behavior: 'auto' });
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
        const modalSize = width === 'std' ? 'md' : width;
        openModal(`${width}-modal`, { size: modalSize });
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

    const handleAdjustFontSize = (me) => {
        const el = toElement(me);
        const targetSel = el && el.dataset && el.dataset.ta ? el.dataset.ta : defaultFontTargets;
        if (api.cycleFont) {
            api.cycleFont(0.15, 1, 1.3, 1, targetSel);
        }
    };

    const handleHideMsg = () => {
        document.querySelectorAll('.modal').forEach((modal) => modal.classList.remove('block'));
        const mainBox = document.getElementById('main-box');
        if (mainBox) mainBox.classList.remove('no-scroll');
    };

    const handleLoadZip = (me) => {
        const el = toElement(me);
        if (!el) return;
        const targetId = el.dataset ? el.dataset.ta : null;
        const county = el.value || (el.dataset ? el.dataset.county : null);
        const placeholder = el.dataset && el.dataset.placeholder ? el.dataset.placeholder : '請選擇地區*';
        if (targetId && county && api.loadZipOptions) {
            api.loadZipOptions(targetId, county, placeholder);
        }
    };

    const handleSwitchTab = (me) => {
        const el = toElement(me);
        if (!el) return;
        const boxSelector = el.dataset ? el.dataset.ta : null;
        const box = boxSelector ? document.querySelector(boxSelector) : null;
        const state = el.dataset ? el.dataset.state : null;
        const back = el.dataset && el.dataset.back ? el.dataset.back : 'welcome';

        const tabs = el.closest ? el.closest('.j-tabs') : null;
        if (tabs) {
            tabs.querySelectorAll('.active').forEach((node) => {
                if (node !== el) node.classList.remove('active');
            });
            el.classList.add('active');
        }

        if (box && state) {
            removeClassByPrefix(box, 'js-state-');
            box.classList.add(`js-state-${state}`);
            if (app.site && typeof app.site.registerBack === 'function') {
                app.site.registerBack(() => {
                    removeClassByPrefix(box, 'js-state-');
                    box.classList.add(`js-state-${back}`);
                });
            }
        }
    };

    const handleReadySubmit = (me) => {
        const el = toElement(me);
        const target = (me && me.event && me.event.target) ? me.event.target : el;
        const form = el && el.dataset && el.dataset.ta ? document.getElementById(el.dataset.ta) : (target && target.closest ? target.closest('form') : null);

        if (target && window.validatr && typeof window.validatr.chkElement === 'function') {
            if (window.validatr.chkElement(target)) {
                const errGroup = target.closest('.input-group.has-error');
                if (errGroup) errGroup.classList.remove('has-error');
            }
        }

        if (api.updateSubmitState) {
            api.updateSubmitState(form);
        }
    };

    const handleSwitchPasswd = (me) => {
        const el = toElement(me);
        if (!el) return;
        const group = el.closest ? el.closest('.passwd-group') : null;
        const input = group ? group.querySelector('.field-passwd') : null;
        if (api.togglePasswordInput) {
            const visible = api.togglePasswordInput(input);
            if ('checked' in el) el.checked = visible;
        }
    };

    const handleNextStep = (me) => {
        const el = toElement(me);
        if (!el) return;
        const form = el.dataset && el.dataset.ta ? document.getElementById(el.dataset.ta) : (el.closest ? el.closest('form') : null);
        const step = el.getAttribute('step') || (el.dataset ? el.dataset.step : null);
        const box = el.closest ? el.closest('.step-box') : null;
        if (!step) return;
        const [mod, fn] = step.split('.');
        const stepFn = app && app[mod] ? app[mod][fn] : null;
        if (!stepFn) {
            if (typeof gee !== 'undefined' && typeof gee.alert === 'function') {
                gee.alert({ title: 'Alert!', txt: 'No such step!!' });
            }
            return;
        }

        const finalize = () => {
            if (typeof app.doneBtn === 'function') app.doneBtn(el);
            if (box && el.dataset && el.dataset.num) {
                removeClassByPrefix(box, 'on-step-');
                box.classList.add(`on-step-${el.dataset.num}`);
            }
        };

        if (typeof app.progressingBtn === 'function') app.progressingBtn(el);

        try {
            const result = stepFn(form, el, finalize);
            if (result && typeof result.then === 'function') {
                result.then(finalize).catch((err) => {
                    if (typeof app.stdErr === 'function') app.stdErr(err);
                    finalize();
                });
            } else if (stepFn.length < 3) {
                finalize();
            }
        } catch (err) {
            if (typeof app.stdErr === 'function') app.stdErr(err);
            finalize();
        }
    };

    const handleBackStep = (me) => {
        const el = toElement(me);
        const box = el && el.closest ? el.closest('.step-box') : null;
        if (box && el && el.dataset && el.dataset.num) {
            removeClassByPrefix(box, 'on-step-');
            box.classList.add(`on-step-${el.dataset.num}`);
        }
    };

    const handleNxtCol = (me) => {
        const el = toElement(me);
        const eventObj = me && me.event;
        const code = eventObj && (eventObj.keyCode || eventObj.which);
        if (!el) return;
        const maxLength = Number(el.getAttribute('maxlength') || 0);
        if (maxLength && String(el.value).length === maxLength) {
            const targetId = el.dataset ? el.dataset.ta : null;
            const ta = targetId ? document.getElementById(targetId) : null;
            const nextInput = ta || (el.nextElementSibling && el.nextElementSibling.tagName === 'INPUT' ? el.nextElementSibling : null);
            if (nextInput) {
                nextInput.focus();
                if (typeof nextInput.select === 'function') nextInput.select();
            } else {
                if (typeof gee.readySubmit === 'function') gee.readySubmit(me);
                if (code === 13 && !(eventObj && eventObj.shiftKey)) {
                    const form = el.closest ? el.closest('form') : null;
                    const btn = form ? form.querySelector('button.btn-submit') : null;
                    if (btn && typeof btn.click === 'function') btn.click();
                }
            }
        }
    };

    const handleArenaCopy = async (me) => {
        const el = toElement(me);
        if (!el || !api.copyText) return;
        const taId = el.dataset ? el.dataset.ta : null;
        const textEl = taId ? document.getElementById(taId) : null;
        const text = textEl ? (textEl.value || textEl.textContent || '') : '';
        const copied = await api.copyText(text);
        if (copied) {
            if (el.classList) el.classList.add('copied');
            if (el.dataset && el.dataset.txt) {
                // eslint-disable-next-line no-alert
                alert(`${el.dataset.txt}: ${text}`);
            }
        }
    };

    const handleArenaToggleCls = (me) => {
        const el = toElement(me);
        if (!el || !api.toggleClass) return;
        const targetId = el.dataset ? el.dataset.target : null;
        const cls = (el.dataset && el.dataset.cls) ? el.dataset.cls : 'active';
        const target = targetId ? document.getElementById(targetId) : null;
        const labelText = (el.dataset && el.dataset.label) ? el.dataset.label : '內容';
        const isOpen = api.toggleClass(target, cls);
        api.toggleClass(el, 'opened');
        el.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        el.setAttribute('aria-label', `${isOpen ? '關閉' : '展開'}${labelText}`);
    };

    const handleCalDateLimit = (me) => {
        const el = toElement(me);
        if (!el || !api.setDateLimit) return;
        const min = el.dataset && el.dataset.min ? Number(el.dataset.min) : undefined;
        const max = el.dataset && el.dataset.max ? Number(el.dataset.max) : undefined;
        api.setDateLimit(el, min, max);
    };

    const handleOpenNav = (me) => {
        const el = toElement(me);
        const targetId = el && el.dataset ? el.dataset.ta : null;
        const target = targetId ? document.getElementById(targetId) : null;
        api.openNav(target);
    };

    const handleCloseNav = (me) => {
        const el = toElement(me);
        const targetId = el && el.dataset ? el.dataset.ta : null;
        const target = targetId ? document.getElementById(targetId) : null;
        api.closeNav(target);
    };

    const handleSetCookiePrivacy = () => {
        if (api.setCookiePrivacy) api.setCookiePrivacy();
    };

    const legacyPlainHooks = [
        'largerFont', 'smallerFont', 'goTop', 'loadMain', 'loadBox', 'loadModal',
        'replaceMe', 'reExe', 'reXPos', 'initAutolink', 'initPagination', 'initTmpl', 'react',
        'reactSubmit', 'adjustFontSize', 'hideMsg', 'loadZip', 'switchTab', 'readySubmit',
        'switchPasswd', 'nextstep', 'backstep', 'nxtCol', 'calDateLimit',
    ];
    const legacyMap = legacyPlainHooks.reduce((acc, key) => {
        acc[key] = key;
        return acc;
    }, {});

    registerHooks('arena', {
        largerFont: handleFont(0.1),
        smallerFont: handleFont(-0.1),
        goTop: handleGoTop,
        loadMain: handleLoadMain,
        loadBox: handleLoadBox,
        loadModal: handleLoadModal,
        replaceMe: handleReplaceMe,
        reExe: handleReExe,
        reXPos: { handler: handleReXPos, event: 'init' },
        initAutolink: { handler: handleAutolink, event: 'init' },
        initPagination: { handler: handlePagination, event: 'init' },
        initTmpl: { handler: handleInitTmpl, event: 'init' },
        react: handleReact,
        reactSubmit: handleReactSubmit,
        adjustFontSize: handleAdjustFontSize,
        hideMsg: handleHideMsg,
        loadZip: handleLoadZip,
        switchTab: handleSwitchTab,
        readySubmit: handleReadySubmit,
        switchPasswd: handleSwitchPasswd,
        nextstep: handleNextStep,
        backstep: handleBackStep,
        nxtCol: { handler: handleNxtCol, event: 'keyup' },
        copy: handleArenaCopy,
        toggleCls: handleArenaToggleCls,
        calDateLimit: handleCalDateLimit,
        openNav: handleOpenNav,
        closeNav: handleCloseNav,
        setCookiePrivacy: handleSetCookiePrivacy,
    }, {
        legacy: legacyMap,
    });

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
