import app from '../app';
import { toElement, ensureBrowser } from '../lib/shared';

const defaultFontTargets = '#article-press .text p, #article-press .text li, #article-post .text p, #article-post .text li';

export default function installArenaHook(root) {
    if (!ensureBrowser()) return () => {};
    let api;
    try {
        api = app.get('ui.arena');
    } catch (err) {
        return () => {};
    }

    const scope = root && root.nodeType ? root : document;
    const teardown = [];

    const scrollHandler = () => {
        const pos = window.scrollY || document.documentElement.scrollTop || 0;
        api.setGoTopVisible(pos > 300);
    };

    window.addEventListener('scroll', scrollHandler);
    teardown.push(() => window.removeEventListener('scroll', scrollHandler));

    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        const touchHandler = () => api.setGoTopVisible((window.scrollY || 0) > 300);
        window.addEventListener('touchend', touchHandler);
        window.addEventListener('touchcancel', touchHandler);
        window.addEventListener('touchleave', touchHandler);
        teardown.push(() => {
            window.removeEventListener('touchend', touchHandler);
            window.removeEventListener('touchcancel', touchHandler);
            window.removeEventListener('touchleave', touchHandler);
        });
    }

    const bindFontButtons = (selector, delta) => {
        scope.querySelectorAll(selector).forEach((btn) => {
            const handler = () => {
                const targetSel = btn.dataset.ta || defaultFontTargets;
                api.changeFont(delta, targetSel);
            };
            btn.addEventListener('click', handler);
            teardown.push(() => btn.removeEventListener('click', handler));
        });
    };

    bindFontButtons('[data-hook="arena.font.increase"]', 0.1);
    bindFontButtons('[data-hook="arena.font.decrease"]', -0.1);

    const goTopNodes = scope.querySelectorAll('.goTop');
    goTopNodes.forEach((btn) => {
        const handler = () => window.scrollTo({ top: 0, behavior: 'smooth' });
        btn.addEventListener('click', handler);
        teardown.push(() => btn.removeEventListener('click', handler));
    });

    const modalTriggers = scope.querySelectorAll('[data-hook="arena.modal.show"]');
    modalTriggers.forEach((el) => {
        const handler = () => {
            const target = el.dataset.target || 'arena-modal';
            const src = el.dataset.src;
            if (src) {
                api.showModal(target, `<iframe src="${src}" frameborder="0"></iframe>`);
            } else {
                api.showModal(target);
            }
        };
        el.addEventListener('click', handler);
        teardown.push(() => el.removeEventListener('click', handler));
    });

    scope.querySelectorAll('[data-hook="arena.modal.hide"]').forEach((el) => {
        const handler = () => {
            const target = el.dataset.target || 'arena-modal';
            api.hideModal(target);
        };
        el.addEventListener('click', handler);
        teardown.push(() => el.removeEventListener('click', handler));
    });

    const paginationNodes = scope.querySelectorAll('[data-hook="arena.pagination"]');
    paginationNodes.forEach((el) => {
        const total = Number(el.dataset.total || 0);
        const length = Number(el.dataset.length || 1);
        const totalPages = Math.max(1, Math.ceil(total / length));
        const canonical = document.querySelector('link[rel="canonical"]');
        const baseHref = canonical ? canonical.getAttribute('href') : window.location.pathname;
        const html = Array.from({ length: totalPages }, (_, idx) => `<a class="page-link" href="${baseHref}?page=${idx + 1}">${idx + 1}</a>`).join('');
        el.innerHTML = html;
    });

    return function teardownFn() {
        teardown.forEach((fn) => fn());
    };
}
