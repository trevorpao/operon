import app from '../app';
import { toElement, ensureBrowser } from '../lib/shared';

export default function installGalleryHook() {
    if (!ensureBrowser()) return () => {};

    let api;
    try {
        api = app.get('ui.gallery');
    } catch (err) {
        return () => {};
    }

    const renderGrid = (me) => {
        const el = toElement(me);
        if (!el) return false;
        const page = el.dataset ? el.dataset.page : undefined;
        const html = api.renderGrid({ page });
        const wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        const replacement = wrapper.firstElementChild;
        if (replacement && el.parentNode) {
            el.parentNode.replaceChild(replacement, el);
        }
    };

    if (typeof gee !== 'undefined' && typeof gee.hook === 'function') {
        gee.hook('gallery.grid', renderGrid, 'init');
    }

    return function teardownFn() {};
}
