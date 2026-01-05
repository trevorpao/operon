/**
 * app init
 */

import app from './app';
import gee from 'trevorpao/geneEH';
import { trackPlugin, formatPlugin, extendPlugin } from './plugins';
import { installTrackHook } from './hooks';

$(async function() {
    'use strict';

    var modules = ['arena']; // , 'menu', 'resource', 'menu'

    // Helpers/plugins
    await app.use(formatPlugin);
    await app.use(extendPlugin);

    if (app.isProd()) {
        await app.use(trackPlugin);
        installTrackHook();
    } else {
        gee.debug = 1;
    }

    modules.push('site'); // the final one

    app.init(modules);
});
