import app from '../app';
import { toElement, ensureBrowser } from '../lib/shared';
import registerHooks from '../lib/hooks/register';

const WRAPPER_SELECTOR = '.slider-wrapper';

const isWrapper = (node) => !!(node && typeof node.matches === 'function' && node.matches(WRAPPER_SELECTOR));

export default function installSlideHook() {
    if (!ensureBrowser()) return () => {};

    let api;
    try {
        api = app.get('ui.slide');
    } catch (err) {
        return () => {};
    }

    if (!api || typeof api.create !== 'function') {
        return () => {};
    }

    const instances = new Map();

    const destroyWrapper = (wrapper) => {
        if (!wrapper) return;
        const instance = instances.get(wrapper);
        if (instance && typeof instance.destroy === 'function') {
            instance.destroy();
        }
        instances.delete(wrapper);
        if (wrapper.dataset) {
            delete wrapper.dataset.slideInitialized;
        }
    };

    const initWrapper = (wrapper) => {
        if (!wrapper || wrapper.dataset.slideInitialized === '1') return false;
        const options = {
            slideSelector: wrapper.dataset.slideSelector,
            prevSelector: wrapper.dataset.slidePrev || wrapper.dataset.prevSelector,
            nextSelector: wrapper.dataset.slideNext || wrapper.dataset.nextSelector,
            dotsSelector: wrapper.dataset.slideDots || wrapper.dataset.dotsSelector,
        };
        const instance = api.create(wrapper, options);
        if (instance) {
            instances.set(wrapper, instance);
            wrapper.dataset.slideInitialized = '1';
            return true;
        }
        return false;
    };

    const initCarousel = (me) => {
        const root = toElement(me) || document;
        if (!root) return false;
        const targets = isWrapper(root) ? [root] : Array.from(root.querySelectorAll(WRAPPER_SELECTOR));
        let initialized = false;
        targets.forEach((wrapper) => {
            if (initWrapper(wrapper)) {
                initialized = true;
            }
        });
        return initialized;
    };

    registerHooks('slider.carousel', {
        init: { handler: initCarousel, event: 'init' },
    }, {
        legacy: {
            init: ['slide.init', 'slideInit'],
        },
    });

    return function teardownSlideHook() {
        Array.from(instances.keys()).forEach((wrapper) => destroyWrapper(wrapper));
    };
}
