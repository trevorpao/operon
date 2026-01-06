/**
 * app init
 */

import app from './app';
import gee from 'trevorpao/geneEH';
import { trackPlugin, formatPlugin, extendPlugin, resourcePlugin, menuPlugin } from './plugins';
import { installTrackHook, installResourceHook, installMenuHook } from './hooks';

$(async function() {
    'use strict';

    var modules = ['arena']; // , 'menu', 'resource', 'menu'

    // Helpers/plugins
    await app.use(formatPlugin);
    await app.use(extendPlugin);
    await app.use(resourcePlugin);
    await app.use(menuPlugin);

    if (app.isProd()) {
        await app.use(trackPlugin);
        installTrackHook();
    } else {
        gee.debug = 1;
    }

    installResourceHook();
    installMenuHook();

    modules.push('site'); // the final one

    app.init(modules);
});
