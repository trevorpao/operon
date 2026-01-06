import app from '../app';
import { toElement, ensureBrowser } from '../lib/shared';

export default function installLightboxHook() {
    if (!ensureBrowser()) return () => {};
    let api;
    try {
        api = app.get('ui.lightbox');
    } catch (err) {
        return () => {};
    }
    if (!api) return () => {};

    const handleInit = (me) => {
        const el = toElement(me);
        const opts = {
            rootSelector: el && el.dataset && el.dataset.root ? el.dataset.root : undefined,
            lightboxId: el && el.dataset && el.dataset.lightbox ? el.dataset.lightbox : undefined,
            imageId: el && el.dataset && el.dataset.image ? el.dataset.image : undefined,
            figcaptionId: el && el.dataset && el.dataset.figcaption ? el.dataset.figcaption : undefined,
            illustrateId: el && el.dataset && el.dataset.illustrate ? el.dataset.illustrate : undefined,
            minItems: el && el.dataset && el.dataset.minItems ? Number(el.dataset.minItems) : undefined,
            allowMobile: el && el.dataset && typeof el.dataset.allowMobile !== 'undefined' ? el.dataset.allowMobile === 'true' : undefined,
        };
        Object.keys(opts).forEach((k) => {
            if (typeof opts[k] === 'undefined' || Number.isNaN(opts[k])) delete opts[k];
        });
        api.init(opts);
    };

    const handleOpen = (me) => {
        const el = toElement(me);
        const idx = el && el.dataset && el.dataset.index ? Number(el.dataset.index) : 0;
        api.open(Number.isNaN(idx) ? 0 : idx);
    };

    const handleClose = () => api.close();
    const handleNext = () => api.next();
    const handlePrev = () => api.prev();

    if (typeof gee !== 'undefined' && typeof gee.hook === 'function') {
        gee.hook('lightbox.init', handleInit, 'init');
        gee.hook('lightbox.open', handleOpen);
        gee.hook('lightbox.close', handleClose);
        gee.hook('lightbox.next', handleNext);
        gee.hook('lightbox.prev', handlePrev);
    }

    return function teardownLightboxHook() {
        // gee.hook has no unregister; plugin teardown handled via api if needed
    };
}
