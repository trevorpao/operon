import app from '../app';
import { toElement, ensureBrowser } from '../lib/shared';
import registerHooks from '../lib/hooks/register';

const removeClassByPrefix = (el, prefix) => {
    if (!el || !el.classList) return;
    Array.from(el.classList)
        .filter((cls) => cls.startsWith(prefix))
        .forEach((cls) => el.classList.remove(cls));
};

export default function installUiHook() {
    if (!ensureBrowser()) return () => {};

    const handlePopupHide = () => {
        const body = app.body || document.body;
        if (!body || !body.classList) return false;
        removeClassByPrefix(body, 'popup-');
        body.classList.remove('popup-open');
        return true;
    };

    const handleTabSwitch = (me) => {
        const el = toElement(me);
        if (!el) return false;
        const prefix = (el.dataset && el.dataset.prefix) || 'j-on-';
        const state = el.dataset ? el.dataset.tab : null;
        const tab = el.closest ? el.closest('.tab') : null;
        const box = el.closest ? el.closest('.tab-box') : null;

        if (tab) {
            tab.querySelectorAll('.active').forEach((node) => {
                if (node !== el) node.classList.remove('active');
            });
            el.classList.add('active');
        }

        if (box && state) {
            removeClassByPrefix(box, prefix);
            box.classList.add(`${prefix}${state}`);
        }
        return true;
    };

    registerHooks('ui', {
        'popup.hide': handlePopupHide,
        'tabs.switch': handleTabSwitch,
    }, {
        legacy: {
            'popup.hide': 'site.hideAlert',
            'tabs.switch': 'site.switchTab',
        },
    });

    return function teardownUiHook() {};
}
