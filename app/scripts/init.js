/**
 * app init
 */

$(function() {
    'use strict';

    var modules = ['arena']; // , 'menu', 'resource', 'menu'


    if (app.isProd()) {
        modules.push('track');
    }
    else {
        gee.debug = 1;
    }

    modules.push('site'); // the final one

    app.init();
});
