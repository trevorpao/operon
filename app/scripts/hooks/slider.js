import app from '../app';
import { toElement } from '../lib/shared';

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

export default function installSliderHook(root) {
    let api;
    try {
        api = app.get('ui.slider');
    } catch (err) {
        return () => {};
    }

    const scope = root && root.nodeType ? root : document;
    const unbind = [];

    const containers = scope.querySelectorAll('[data-hook="slider.init"]');
    containers.forEach((el) => {
        const target = el.dataset.ta ? document.querySelector(el.dataset.ta) : (el.nodeType ? el : null);
        if (!target) return;
        wrapImages(target);
        target.querySelectorAll('a.slbox').forEach((lnk) => {
            const handler = (evt) => {
                evt.preventDefault();
                api.show(lnk.getAttribute('href'));
            };
            lnk.addEventListener('click', handler);
            unbind.push(() => lnk.removeEventListener('click', handler));
        });
    });

    const teardownClose = api.bindClose();
    if (teardownClose) {
        unbind.push(teardownClose);
    }

    return function teardownFn() {
        unbind.forEach((fn) => fn());
    };
}
