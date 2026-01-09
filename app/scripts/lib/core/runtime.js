const createRuntime = ({ app, gee, config }) => {
    const announce = () => {
        setTimeout(console.log.bind(console, '%c%s', 'color: blue; font-size: 10px;', '   ###                                                    ###\n  #   #                                                     #\n #     #  ######    #####    # ###    #####   # ####        #    #####\n #     #  #     #  #     #   ##      #     #  ##    #       #   #\n #     #  #     #  #######   #       #     #  #     #  #    #    ####\n  #   #   #     #  #         #       #     #  #     #  #    #        #\n   ###    ######    #####    #        #####   #     #   ####    #####\n          #\n          #\n'));
        setTimeout(console.log.bind(console, '%c%s', 'color: red; background: yellow; font-size: 24px;', '\u8b66\u544a\uff01'));
        setTimeout(console.log.bind(console, '%c%s', 'font-size: 18px;', '\u4f7f\u7528\u9019\u500b\u4e3b\u63a7\u53f0\u53ef\u80fd\u6703\u8b93\u653b\u64ca\u8005\u6709\u6a5f\u6703\u5229\u7528\u540d\u70ba Self-XSS \u7684\u653b\u64ca\u65b9\u5f0f\u5192\u7528\u4f60\u7684\u8eab\u5206\uff0c\u7136\u5f8c\u7aca\u53d6\u4f60\u7684\u8cc7\u8a0a\u3002\n\u8acb\u52ff\u8f38\u5165\u6216\u8cbc\u4e0a\u4f86\u8def\u4e0d\u660e\u7684\u7a0b\u5f0f\u78bc\u3002'));
    };

    const isProd = () => {
        var host = window.location.hostname;
        return (host !== 'localhost' && host.indexOf('fake.') === -1 && host.indexOf('loc.') === -1);
    };

    const isDev = () => {
        var port = window.location.port;
        return port === '9001';
    };

    const ifWebView = () => {
        var userAgent = (navigator.userAgent || navigator.vendor || window.opera).toLowerCase();
        var rtn = '';
        var isiPhone = /iphone/i.test(userAgent);

        if (isiPhone) {
            if (/line/i.test(userAgent)) {
                rtn = 'line';
            } else if (/fbios/i.test(userAgent)) {
                rtn = 'facebook';
            }
        } else {
            if (/line/i.test(userAgent)) {
                rtn = 'line';
            } else if (/fbiab/i.test(userAgent)) {
                rtn = 'facebook';
            } else if (/iab/i.test(userAgent)) {
                rtn = 'unknow';
            }
        }

        return rtn;
    };

    const init = function (modules) {
        announce();

        app.cuVersion = document.cuVersion;
        app.win = window;
        app.docu = document;
        app.body = document.body;
        app.bodyEl = document.body;

        app.screen = (app.bodyEl.clientWidth < config.detectWidth) ? 'mobile' : 'tablet';
        app.bodyEl.classList.add(app.screen);

        window.app = app;

        gee.apiUri = window.apiUrl + '';
        gee.mainUri = window.mainUrl;
        gee.picUri = '';

        if (!isProd()) {
            gee.mainUri = 'https://f3cms.lo:4433/';
            gee.apiUri = 'https://f3cms.lo:4433/api/';
            gee.picUri = gee.mainUri.slice(0, -1);
        }

        gee.init();

        const initList = Array.isArray(modules) && modules.length > 0 ? modules : app.initModules;
        if (initList && initList.length > 0) {
            initList.map(function (module) {
                if (gee.isset(app[module]) && gee.isset(app[module].init)) {
                    app[module].init();
                }
            });
        }
    };

    const use = async function (plugin) {
        if (!plugin || typeof plugin.install !== 'function') {
            throw new Error('Plugin must provide install(ctx)');
        }
        var name = (plugin.name || '').trim();
        if (!name) {
            throw new Error('Plugin must provide name');
        }
        if (app.plugins.has(name)) {
            return app.plugins.get(name).api;
        }

        var ctx = { app: app, gee: gee, config: config };
        var installed = await Promise.resolve(plugin.install(ctx));
        var api = (installed && installed.api) ? installed.api : {};
        var initFn = (installed && typeof installed.init === 'function') ? installed.init : null;
        var destroyFn = (installed && typeof installed.destroy === 'function') ? installed.destroy : null;

        app.plugins.set(name, { api: api, init: initFn, destroy: destroyFn });
        if (initFn) {
            await initFn();
        }

        return api;
    };

    const get = function (name) {
        var entry = app.plugins.get(name);
        if (!entry) {
            throw new Error('Plugin "' + name + '" not found');
        }
        return entry.api;
    };

    const destroy = async function (name) {
        var entry = app.plugins.get(name);
        if (!entry) return;
        if (typeof entry.destroy === 'function') {
            await entry.destroy();
        }
        app.plugins.delete(name);
    };

    return {
        init,
        announce,
        isProd,
        isDev,
        ifWebView,
        use,
        get,
        destroy,
    };
};

export { createRuntime };
