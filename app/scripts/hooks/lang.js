import app from '../app';
import { toElement, ensureBrowser } from '../lib/shared';
import registerHooks from '../lib/hooks/register';

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

    registerHooks('lang', {
        next: { handler: handleNextLang },
        redirect: handleLangRedirect,
        switch: handleLangSwitch,
    }, {
        legacy: { next: 'nextLang' },
    });

    return function teardownLangHook() {
        // no-op; gee.hook has no unregister
    };
}
