;(function(app, gee, $){
    'use strict';

    // how to use
    // <a href="linkhere" class="track" data-cate="my_cate" data-act="my_act">link txt</a>

    app.track = {
        init: function () {
            app.track.bind(app.body);
        },

        bind: function (box) {
            box.find('.track').on('click', function () {
                var me = $(this);

                var cate = me.data('cate') || 'normal';
                var act = me.data('act') || 'jump';
                var label = me.data('label') || me.attr('title') || app.docu.find('title').text();
                var which = me.data('which') || 'ga';

                app.track.send(cate, act, label, which);
            }).removeClass('track').addClass('tracked');
        },

        send: function (cate, act, label, which) {
            which = (which) ? which : 'ga';

            gee.clog({
                cate: cate,
                act: act,
                label: label,
                which: which,
            });

            if ((which === 'ga' || which === 'all') && gee.isset(window.ga)) {
                // Google analytics
                if (label) {
                    window.ga('send', 'event', cate, act, label);
                } else {
                    window.ga('send', 'event', cate, act);
                }
            }

            if ((which === 'pixel' || which === 'all') && gee.isset(window.fbq)) {
                // Facebook Pixel
                window.fbq('track', cate, act, label);
            }
        }
    };

}(app, gee, jQuery));
