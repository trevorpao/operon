import app from '../app';
import { toElement, ensureBrowser } from '../lib/shared';

const wrapImages = (container) => {
    if (!container) return;
    container.querySelectorAll('img.size-large, img.img-responsive, img.size-medium, img.fr-fin, img.fr-dib').forEach((img) => {
        const wrapper = document.createElement('a');
        wrapper.className = 'slbox';
        wrapper.href = img.getAttribute('src') || img.src;
        wrapper.innerHTML = img.outerHTML;
        img.replaceWith(wrapper);
    });
};

export default function installSliderHook() {
    if (!ensureBrowser()) return () => {};

    let api;
    try {
        api = app.get('ui.slider');
    } catch (err) {
        return () => {};
    }

    const unbind = [];

    const initSlider = (me) => {
        const el = toElement(me);
        if (!el) return false;
        const target = el.dataset && el.dataset.ta ? document.querySelector(el.dataset.ta) : el;
        if (!target) return false;
        wrapImages(target);
        target.querySelectorAll('a.slbox').forEach((lnk) => {
            const handler = (evt) => {
                evt.preventDefault();
                api.show(lnk.getAttribute('href'));
            };
            lnk.addEventListener('click', handler);
            unbind.push(() => lnk.removeEventListener('click', handler));
        });
    };

    if (typeof gee !== 'undefined' && typeof gee.hook === 'function') {
        gee.hook('slider.init', initSlider, 'init');
    }

    const teardownClose = api.bindClose();
    if (teardownClose) {
        unbind.push(teardownClose);
    }

    return function teardownFn() {
        unbind.forEach((fn) => fn());
    };
}
