/**
 * app init
 */

import app from './app';
import gee from 'trevorpao/geneEH';
import { trackPlugin, formatPlugin, extendPlugin, resourcePlugin, menuPlugin, arenaPlugin, contactPlugin, sliderPlugin, galleryPlugin } from './plugins';
import { installTrackHook, installResourceHook, installMenuHook, installArenaHook, installContactHook, installSliderHook, installGalleryHook } from './hooks';

$(async function() {
    'use strict';

    var modules = []; // migrated to hooks/plugins

    // Helpers/plugins
    await app.use(formatPlugin);
    await app.use(extendPlugin);
    await app.use(resourcePlugin);
    await app.use(menuPlugin);
    await app.use(arenaPlugin);
    await app.use(contactPlugin);
    await app.use(sliderPlugin);
    await app.use(galleryPlugin);

    if (app.isProd()) {
        await app.use(trackPlugin);
        installTrackHook();
    } else {
        gee.debug = 1;
    }

    installResourceHook();
    installMenuHook();
    installArenaHook();
    installContactHook();
    installSliderHook();
    installGalleryHook();

    modules.push('site'); // the final one

    app.init(modules);
});
