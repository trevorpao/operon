import { ensureBrowser } from '../lib/shared';

const selectBanner = () => {
    if (!ensureBrowser()) return null;
    return document.getElementById('privacy-banner');
};

const getCookie = (app, key) => {
    if (app && typeof app.getCookie === 'function') {
        return app.getCookie(key);
    }
    return null;
};

const setCookie = (app, key, value, days) => {
    if (app && typeof app.setCookie === 'function') {
        app.setCookie(key, value, days);
        return true;
    }
    return false;
};

const privacyPlugin = {
    name: 'ui.privacy',
    install({ app }) {
        const cookieKey = 'cookie_privacy';
        const defaultDays = 400;

        const needsBanner = () => !getCookie(app, cookieKey);

        const showBanner = () => {
            const banner = selectBanner();
            if (banner) {
                banner.classList.remove('hide');
                banner.removeAttribute('hidden');
            }
        };

        const hideBanner = () => {
            const banner = selectBanner();
            if (banner) {
                banner.classList.add('hide');
                banner.setAttribute('hidden', 'hidden');
            }
        };

        const accept = (days = defaultDays) => {
            setCookie(app, cookieKey, 1, days);
            hideBanner();
        };

        return {
            api: {
                needsBanner,
                showBanner,
                hideBanner,
                accept,
            },
        };
    },
};

export default privacyPlugin;
