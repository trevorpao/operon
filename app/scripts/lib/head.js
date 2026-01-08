/* eslint-disable no-var, prefer-template */
(function (factory) {
    var globalScope = typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this);
    var api = factory(globalScope);
    if (typeof module === 'object' && module.exports) {
        module.exports = api;
        module.exports.default = api;
    } else if (typeof define === 'function' && define.amd) {
        define(function () { return api; });
    }
}(function (globalScope) {
    'use strict';

    var win = typeof window !== 'undefined' ? window : globalScope;
    var doc = win && win.document ? win.document : undefined;
    var GTAG_SRC = 'https://www.googletagmanager.com/gtag/js';
    var loadedScripts = {};
    var configuredIds = {};

    function isLegacyIE(winRef) {
        if (!winRef) return false;
        var docRef = winRef.document || {};
        if (docRef.documentMode) return true;
        var nav = winRef.navigator || {};
        var ua = nav.userAgent || '';
        return ua.indexOf('MSIE ') !== -1 || ua.indexOf('Trident/') !== -1;
    }

    function defaultOnIncompatible(context) {
        var ctx = context || {};
        var documentRef = ctx.document || doc;
        var windowRef = ctx.window || win;
        if (!documentRef) {
            if (windowRef && typeof windowRef.alert === 'function') {
                windowRef.alert('此網站已停止支援 Internet Explorer，請改用最新瀏覽器。');
            }
            return null;
        }

        if (documentRef.querySelector) {
            var existing = documentRef.querySelector('.browser-upgrade-notice');
            if (existing) return existing;
        }

        var banner = documentRef.createElement('div');
        banner.className = 'browser-upgrade-notice';
        banner.setAttribute('role', 'alert');
        banner.innerHTML = '<strong>需要更新瀏覽器</strong>'
            + '<p>此網站已停止支援 Internet Explorer，請使用最新版本的 Edge、Chrome 或 Firefox。</p>';

        var parent = (documentRef.body && documentRef.body.parentNode === documentRef.documentElement)
            ? documentRef.body
            : (documentRef.body || documentRef.documentElement);
        if (parent && typeof parent.prepend === 'function') {
            parent.prepend(banner);
        } else if (parent && parent.appendChild) {
            parent.appendChild(banner);
        }
        return banner;
    }

    function requireModernBrowser(options) {
        var opts = options || {};
        var predicate = typeof opts.predicate === 'function' ? opts.predicate : null;
        var onIncompatible = typeof opts.onIncompatible === 'function' ? opts.onIncompatible : defaultOnIncompatible;
        if (!win) return true;
        var isModern = predicate ? predicate(win) : !isLegacyIE(win);
        if (isModern) return true;
        onIncompatible({ window: win, document: doc });
        return false;
    }

    function loadAnalyticsScript(measurementId, parentPreference) {
        if (!measurementId || !doc) return null;
        if (loadedScripts[measurementId]) {
            return doc.querySelector ? doc.querySelector('script[data-gtag-id="' + measurementId + '"]') : null;
        }

        var script = doc.createElement('script');
        script.async = true;
        script.src = GTAG_SRC + '?id=' + encodeURIComponent(measurementId);
        script.setAttribute('data-gtag-id', measurementId);

        var parent = parentPreference === 'body' ? doc.body : (doc.head || doc.body);
        if (parent && parent.appendChild) {
            parent.appendChild(script);
            loadedScripts[measurementId] = true;
        }
        return script;
    }

    function configureAnalytics(measurementId) {
        if (!measurementId || !win) return false;
        if (configuredIds[measurementId]) return true;
        win.dataLayer = win.dataLayer || [];
        if (typeof win.gtag !== 'function') {
            win.gtag = function gtag() {
                win.dataLayer.push(arguments);
            };
        }
        win.gtag('js', new Date());
        win.gtag('config', measurementId, { send_page_view: false });
        configuredIds[measurementId] = true;
        return true;
    }

    function injectAnalytics(measurementId, options) {
        var opts = options || {};
        if (!measurementId) return false;
        loadAnalyticsScript(measurementId, opts.scriptParent);
        if (opts.autoInitGa === false) {
            return true;
        }
        return configureAnalytics(measurementId);
    }

    function readScriptDataset() {
        if (!doc) return {};
        var script = doc.currentScript || doc.querySelector && doc.querySelector('script[data-head-config]');
        if (!script) return {};
        var opts = {};
        var measurementId = script.getAttribute('data-measurement-id');
        if (measurementId) opts.measurementId = measurementId;
        if (script.hasAttribute && script.hasAttribute('data-require-modern')) {
            opts.requireModern = script.getAttribute('data-require-modern') !== 'false';
        }
        if (script.hasAttribute && script.hasAttribute('data-auto-init-ga')) {
            opts.autoInitGa = script.getAttribute('data-auto-init-ga') !== 'false';
        }
        if (script.hasAttribute && script.hasAttribute('data-script-parent')) {
            opts.scriptParent = script.getAttribute('data-script-parent');
        }
        return opts;
    }

    function resolveInitialOptions() {
        var globalOptions = win && win.headOptions ? win.headOptions : {};
        var scriptOptions = readScriptDataset();
        var measurementId = null;
        if (globalOptions && globalOptions.measurementId) {
            measurementId = globalOptions.measurementId;
        } else if (scriptOptions.measurementId) {
            measurementId = scriptOptions.measurementId;
        } else if (win && win.gaMeasurementID) {
            measurementId = win.gaMeasurementID;
        }

        return {
            measurementId: measurementId,
            requireModern: typeof globalOptions.requireModern === 'boolean'
                ? globalOptions.requireModern
                : (typeof scriptOptions.requireModern === 'boolean' ? scriptOptions.requireModern : true),
            autoInitGa: typeof globalOptions.autoInitGa === 'boolean'
                ? globalOptions.autoInitGa
                : (typeof scriptOptions.autoInitGa === 'boolean' ? scriptOptions.autoInitGa : true),
            scriptParent: globalOptions.scriptParent || scriptOptions.scriptParent || null,
            predicate: globalOptions.predicate || null,
            onIncompatible: globalOptions.onIncompatible || null
        };
    }

    function bootstrap() {
        var options = resolveInitialOptions();
        if (options.requireModern !== false) {
            var modern = requireModernBrowser({ predicate: options.predicate, onIncompatible: options.onIncompatible });
            if (!modern) {
                return;
            }
        }
        if (options.measurementId) {
            injectAnalytics(options.measurementId, {
                autoInitGa: options.autoInitGa,
                scriptParent: options.scriptParent
            });
        }
    }

    function resetState() {
        loadedScripts = {};
        configuredIds = {};
    }

    var api = {
        requireModernBrowser: requireModernBrowser,
        injectAnalytics: injectAnalytics,
        configureAnalytics: configureAnalytics,
        loadAnalyticsScript: loadAnalyticsScript,
        bootstrap: bootstrap,
        isLegacyIE: isLegacyIE,
        resetState: resetState
    };

    if (win) {
        win.headPlugin = api;
    }

    bootstrap();

    return api;
}));
