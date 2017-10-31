/**
 * app init
 */

$(function() {
    'use strict';

    app.init(['arena', 'track']);

    $('.nav-tabs>li:eq(2) a').trigger('click');
});
