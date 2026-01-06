import app from '../app';
import { toElement, ensureBrowser } from '../lib/shared';

export default function installLangHook() {
    if (!ensureBrowser()) return () => {};
    let api;
    try {
        api = app.get('ui.lang');
    } catch (err) {
        return () => {};
    }
    if (!api) return () => {};

    const handleNextLang = async () => {
        if (api.nextLang) {
            await api.nextLang();
        }
    };

    const handleLangRedirect = (me) => {
        const el = toElement(me);
        if (!el || !api.redirect) return;
        const targetLang = el.dataset ? (el.dataset.ta || el.dataset.lang) : null;
        if (targetLang) api.redirect(targetLang);
    };

    const handleLangSwitch = (me) => {
        const el = toElement(me);
        if (!el || !api.setEncoding) return;
        const langCode = el.dataset && el.dataset.lang ? Number(el.dataset.lang) : null;
        if (!langCode) return;
        api.setEncoding(langCode);
    };

    if (typeof gee !== 'undefined' && typeof gee.hook === 'function') {
        gee.hook('nextLang', handleNextLang);
        gee.hook('lang.redirect', handleLangRedirect);
        gee.hook('lang.switch', handleLangSwitch);
    }

    return function teardownLangHook() {
        // no-op; gee.hook has no unregister
    };
}
