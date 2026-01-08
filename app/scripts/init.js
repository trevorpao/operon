/**
 * app init
 */

import app from './app';
import gee from 'trevorpao/geneEH';
import { trackPlugin, formatPlugin, extendPlugin, previewPlugin, resourcePlugin, menuPlugin, modalPlugin, arenaPlugin, contactPlugin, sliderPlugin, galleryPlugin, searchPlugin } from './plugins';
import { installTrackHook, installResourceHook, installMenuHook, installModalHook, installArenaHook, installContactHook, installSliderHook, installGalleryHook, installSearchHook } from './hooks';

$(async function() {
    'use strict';

    var modules = []; // migrated to hooks/plugins

    // Helpers/plugins
    await app.use(formatPlugin);
    await app.use(extendPlugin);
    await app.use(previewPlugin);
    await app.use(resourcePlugin);
    await app.use(menuPlugin);
    await app.use(modalPlugin);
    await app.use(arenaPlugin);
    await app.use(contactPlugin);
    await app.use(sliderPlugin);
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
    installArenaHook();
    installContactHook();
    installSliderHook();
    installGalleryHook();
    installSearchHook();

    modules.push('site'); // the final one

    app.init(modules);
});
