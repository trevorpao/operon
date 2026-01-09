/**
 * app init
 */

import 'gene-event-handler';
import Handlebars from 'handlebars/dist/handlebars.js';

// 只在第一次掛載，避免覆寫其他測試注入
if (typeof window !== 'undefined' && !window.Handlebars) {
  window.Handlebars = Handlebars;
}

import app from './app';
import { trackPlugin, formatPlugin, extendPlugin, previewPlugin, resourcePlugin, menuPlugin, modalPlugin, privacyPlugin, markdownPlugin, draftPlugin, themeDefaultPlugin, arenaPlugin, contactPlugin, sliderPlugin, slidePlugin, galleryPlugin, searchPlugin } from './plugins';
import { installTrackHook, installResourceHook, installMenuHook, installModalHook, installUiHook, installArenaHook, installContactHook, installSliderHook, installSlideHook, installGalleryHook, installSearchHook, installDefaultTheme } from './hooks';

const onReady = (fn) => {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn, { once: true });
    }
};

onReady(async function() {
    'use strict';

    var modules = []; // migrated to hooks/plugins

    // Helpers/plugins
    await app.use(formatPlugin);
    await app.use(extendPlugin);
    await app.use(previewPlugin);
    await app.use(resourcePlugin);
    await app.use(menuPlugin);
    await app.use(modalPlugin);
    await app.use(privacyPlugin);
    await app.use(markdownPlugin);
    await app.use(draftPlugin);
    await app.use(themeDefaultPlugin);
    await app.use(arenaPlugin);
    await app.use(contactPlugin);
    await app.use(sliderPlugin);
    await app.use(slidePlugin);
    await app.use(galleryPlugin);
    await app.use(searchPlugin);

    if (app.isProd()) {
        await app.use(trackPlugin);
        installTrackHook();
    } else {
        gee.debug = 1;
    }

    installResourceHook();
    installMenuHook();
    installModalHook();
    installUiHook();
    installArenaHook();
    installContactHook();
    installSliderHook();
    installSlideHook();
    installGalleryHook();
    installSearchHook();
    installDefaultTheme();

    app.init(modules);
});
